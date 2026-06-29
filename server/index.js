// Fatoorah backend — the only place the Lean Client Secret ever lives.
// The mobile app calls THESE endpoints; this server calls Lean.
//
// Status: KSA v2 endpoints, base URLs, auth header (lean-app-token = App Id),
// and entity_id query param are confirmed from the dashboard quickstart.
// Remaining unknown: how to list a customer's entity_id without a webhook —
// see resolveEntity() (marked TODO: CONFIRM). Response field names are mapped
// defensively in normalizeAccount/normalizeTransaction.
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const {
  LEAN_ENV = "sandbox",
  LEAN_APP_ID,
  LEAN_CLIENT_SECRET,
  PORT = 4000,
} = process.env;

// Saudi (KSA) endpoints — note the ".sa." segment (confirmed from the dashboard).
const AUTH_BASE =
  LEAN_ENV === "production" ? "https://auth.sa.leantech.me" : "https://auth.sandbox.sa.leantech.me";
const API_BASE =
  LEAN_ENV === "production" ? "https://sa.leantech.me" : "https://sandbox.sa.leantech.me";

const app = express();
app.use(cors());
app.use(express.json());

// entity_id arrives via the "entity.created" webhook (the LinkSDK callback
// doesn't include it). We cache it per customer here. In-memory only — use a
// real store in production.
const entityByCustomer = new Map();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function ensureConfigured(res) {
  if (!LEAN_APP_ID || !LEAN_CLIENT_SECRET) {
    res.status(501).json({
      error:
        "Lean not configured. Copy server/.env.example to server/.env and add LEAN_APP_ID + LEAN_CLIENT_SECRET from your Lean dashboard.",
    });
    return false;
  }
  return true;
}

// OAuth 2.0 client_credentials → short-lived JWT (~1h). Confirmed from docs.
async function getAppToken(scope = "api") {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: LEAN_APP_ID,
    client_secret: LEAN_CLIENT_SECRET,
    scope,
  });
  const r = await fetch(`${AUTH_BASE}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!r.ok) throw new Error(`Lean auth failed (${r.status}): ${await r.text()}`);
  return r.json(); // { access_token, expires_in, ... }
}

// Map a raw Lean transaction into Fatoorah's normalized shape.
function categorize(description = "") {
  const d = description.toLowerCase();
  if (/(starbucks|mcdonald|restaurant|cafe|coffee|food)/.test(d)) return "Food";
  if (/(uber|careem|fuel|petrol|transport)/.test(d)) return "Transport";
  if (/(panda|tamimi|danube|grocery|market)/.test(d)) return "Groceries";
  if (/(stc|mobily|electricity|water|bill|internet)/.test(d)) return "Bills";
  if (/(netflix|spotify|cinema|vox|game)/.test(d)) return "Entertainment";
  if (/(pharmacy|nahdi|hospital|clinic|health)/.test(d)) return "Health";
  if (/(amazon|jarir|ikea|noon|store|shop)/.test(d)) return "Shopping";
  return "Other";
}

// Lean Data API v2 transaction shape:
//   { transaction_id, transaction_information, credit_debit_indicator,
//     amount: { currency, amount }, booking_date_time, value_date_time }
function normalizeTransaction(t, accountId) {
  const info = t.transaction_information || t.description || "Transaction";
  const amount = Math.abs(Number(t.amount?.amount ?? t.amount ?? 0));
  const date = String(t.booking_date_time || t.value_date_time || "").slice(0, 10);
  return {
    id: String(t.transaction_id || t.id || `${accountId}-${date}-${amount}`),
    merchant: info.length > 42 ? info.slice(0, 42).trim() + "…" : info,
    category: categorize(info),
    amount,
    date,
    note: info,
    accountId,
  };
}

// Lean Data API v2 account shape: { account_id, description, nickname,
//   account_sub_type, currency, account: [{ scheme_name:'IBAN', identification }] }
function normalizeAccount(a) {
  const accs = a.account || [];
  const iban = accs.find((x) => x.scheme_name === "IBAN");
  const ident = iban?.identification || accs[0]?.identification || "";
  return {
    id: String(a.account_id || a.id),
    bankId: "snb",
    bankName: "SNB · Sandbox",
    name: a.description || a.nickname || a.account_sub_type || "Account",
    mask: ident ? "••••" + String(ident).slice(-4) : "••••",
    type: a.account_sub_type || a.account_type || "Current",
    currency: a.currency || "SAR",
    balance: 0, // filled from the balances endpoint
  };
}

// Data API v2 auth = the OAuth app access token as a Bearer token (confirmed
// empirically; the dashboard's lean-app-token header returns 401). entity_id is
// always a query param.
function dataHeaders(oauth) {
  return { Authorization: `Bearer ${oauth}`, "Content-Type": "application/json" };
}

// Resolve a customer's entity_id. Order: webhook cache → customer API →
// brief wait for a racing webhook. (The app also passes entityId directly when
// the LinkSDK callback exposes it, in which case this isn't called.)
async function resolveEntity(oauth, customerId) {
  const key = String(customerId);

  // GET /customers/v1/{id}/entities returns a BARE JSON array (confirmed via the
  // debug endpoint), e.g. [] or [{ id, ... }].
  const fromApi = async () => {
    try {
      const r = await fetch(`${API_BASE}/customers/v1/${customerId}/entities`, {
        headers: { Authorization: `Bearer ${oauth}` },
      });
      if (!r.ok) return null;
      const data = await r.json();
      const list = Array.isArray(data) ? data : data.entities || data.data || [];
      if (list.length) {
        const last = list[list.length - 1];
        return String(last.id || last.entity_id);
      }
    } catch {}
    return null;
  };

  // Poll the entities API + the webhook cache (~15s). After the LinkSDK SUCCESS
  // callback the new entity may take a moment to appear. This means the webhook
  // is OPTIONAL for the sandbox flow — polling the API is enough.
  for (let i = 0; i < 20; i++) {
    if (entityByCustomer.has(key)) return entityByCustomer.get(key);
    const e = await fromApi();
    if (e) return e;
    await sleep(750);
  }
  throw new Error("No entity found for this customer yet — the bank consent may not have completed.");
}

// List the entity's accounts, then enrich each with its balance.
// Balances/transactions are per-account in v2:
//   GET /data/v2/accounts/{account_id}/balances
//   GET /data/v2/accounts/{account_id}/transactions
async function fetchAccounts(oauth, entityId) {
  const eq = `entity_id=${encodeURIComponent(entityId)}`;
  const r = await fetch(`${API_BASE}/data/v2/accounts?${eq}`, { headers: dataHeaders(oauth) });
  if (!r.ok) throw new Error(`Lean accounts failed (${r.status}): ${await r.text()}`);
  const data = await r.json();
  const raw = data.data?.accounts || data.accounts || [];

  const accounts = [];
  for (const a of raw) {
    const acct = normalizeAccount(a);
    try {
      // Per-account balance also needs ?entity_id=.
      const b = await fetch(`${API_BASE}/data/v2/accounts/${acct.id}/balances?${eq}`, {
        headers: dataHeaders(oauth),
      });
      const bd = await b.json();
      const balances = bd.data?.balances || bd.balances || [];
      const pick = balances.find((x) => x.type === "CLOSING_AVAILABLE") || balances[0];
      const amt = pick?.amount?.amount;
      if (amt != null) acct.balance = Number(amt);
    } catch {
      /* balance is best-effort */
    }
    accounts.push(acct);
  }
  return accounts;
}

app.get("/health", (_req, res) => res.json({ ok: true, env: LEAN_ENV }));

// Quick check that your App Id + Client Secret are valid — mints an API token
// and reports success WITHOUT exposing the token. Visit http://localhost:4000/api/lean/verify
app.get("/api/lean/verify", async (_req, res) => {
  if (!ensureConfigured(res)) return;
  try {
    const tok = await getAppToken("api");
    res.json({ ok: true, env: LEAN_ENV, expiresInSeconds: tok.expires_in });
  } catch (e) {
    // Non-sensitive diagnostics to spot a truncated/mistyped credential.
    res.status(502).json({
      ok: false,
      error: e.message,
      diagnostics: {
        authBase: AUTH_BASE,
        appIdLength: (LEAN_APP_ID || "").length, // a GUID should be 36
        appIdLast4: (LEAN_APP_ID || "").slice(-4),
        secretLength: (LEAN_CLIENT_SECRET || "").length, // if this looks short, it was cut off
        hint: "invalid_client = wrong client_id/secret. Re-copy BOTH from the Lean dashboard using the copy buttons (not a screenshot). Ensure no surrounding quotes, spaces, or line breaks in .env.",
      },
    });
  }
});

// Lean calls this when an entity is created/updated. Set this public URL as your
// webhook in the Lean dashboard (use an ngrok/cloudflared tunnel for local dev).
// TODO: verify the webhook signature header before trusting events in production.
app.post("/api/lean/webhook", (req, res) => {
  const ev = req.body || {};
  const payload = ev.payload || ev.data || ev;
  const entityId = payload.entity_id || payload.id;
  const customerId = payload.customer_id || payload.customer;
  if (entityId && customerId) entityByCustomer.set(String(customerId), String(entityId));
  console.log(`[webhook] ${ev.type || "event"} customer=${customerId} entity=${entityId}`);
  res.json({ received: true });
});

// Lets the app check whether the entity_id has arrived (via webhook) yet.
app.get("/api/lean/entity", (req, res) => {
  const id = entityByCustomer.get(String(req.query.customerId));
  res.json({ entityId: id || null });
});

// Debug helper: shows the raw response of the candidate entity-listing paths for
// a customer, so we can confirm the exact path + field names resolveEntity uses.
// Visit: http://localhost:4000/api/lean/debug/entities?customerId=<id>
app.get("/api/lean/debug/entities", async (req, res) => {
  if (!ensureConfigured(res)) return;
  try {
    const oauth = (await getAppToken("api")).access_token;
    const cid = req.query.customerId;
    const out = {};
    for (const url of [`${API_BASE}/customers/v1/${cid}/entities`, `${API_BASE}/customers/v1/${cid}`]) {
      try {
        const r = await fetch(url, { headers: { Authorization: `Bearer ${oauth}` } });
        out[url] = { status: r.status, body: await r.json().catch(() => null) };
      } catch (e) {
        out[url] = { error: e.message };
      }
    }
    res.json(out);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// 1) Create/lookup a customer and return a customer-scoped token for the LinkSDK.
app.post("/api/lean/customer-token", async (req, res) => {
  if (!ensureConfigured(res)) return;
  try {
    const oauth = (await getAppToken("api")).access_token;
    // Unique app_user_id per connection so Lean never returns
    // CUSTOMER_ALREADY_EXISTS. (Production: store a stable id per real user.)
    const appUserId = req.body.appUserId || `fatoorah-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    // Create the customer object: POST /customers/v1 with the API token.
    const r = await fetch(`${API_BASE}/customers/v1`, {
      method: "POST",
      headers: { Authorization: `Bearer ${oauth}`, "Content-Type": "application/json" },
      body: JSON.stringify({ app_user_id: appUserId }),
    });
    const customer = await r.json();
    const customerId = customer.customer_id || customer.id;
    if (!customerId) throw new Error(`No customer_id returned: ${JSON.stringify(customer)}`);
    const customerToken = (await getAppToken(`customer.${customerId}`)).access_token;
    // The LinkSDK's app_token is the Application Id (a public identifier),
    // confirmed from the KSA quickstart — NOT an OAuth token.
    res.json({ customerId, customerToken, appToken: LEAN_APP_ID });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// 2) After LinkSDK consent, fetch the connected accounts (+ balances).
app.post("/api/lean/accounts", async (req, res) => {
  if (!ensureConfigured(res)) return;
  try {
    const { customerId, entityId: provided } = req.body;
    const oauth = (await getAppToken("api")).access_token;
    const entityId = provided || (await resolveEntity(oauth, customerId));
    const accounts = await fetchAccounts(oauth, entityId);
    res.json({ accounts, entityId });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// 3) Fetch transactions per account for the connected entity (v2 is per-account).
app.post("/api/lean/transactions", async (req, res) => {
  if (!ensureConfigured(res)) return;
  try {
    const { customerId, entityId: provided } = req.body;
    const oauth = (await getAppToken("api")).access_token;
    const entityId = provided || (await resolveEntity(oauth, customerId));
    const accounts = await fetchAccounts(oauth, entityId);
    const eq = `entity_id=${encodeURIComponent(entityId)}`;

    let transactions = [];
    for (const a of accounts) {
      const r = await fetch(`${API_BASE}/data/v2/accounts/${a.id}/transactions?${eq}`, {
        headers: dataHeaders(oauth),
      });
      if (!r.ok) continue;
      const data = await r.json();
      const raw = data.data?.transactions || data.transactions || [];
      // Spending app → keep money-out (DEBIT) transactions.
      const debits = raw.filter((t) => t.credit_debit_indicator === "DEBIT");
      transactions = transactions.concat(debits.map((t) => normalizeTransaction(t, a.id)));
    }
    res.json({ transactions });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Fatoorah server on http://localhost:${PORT}  (Lean env: ${LEAN_ENV})`);
  if (!LEAN_APP_ID || !LEAN_CLIENT_SECRET) {
    console.log("⚠️  No Lean credentials yet — copy .env.example to .env and fill them in.");
  }
});
