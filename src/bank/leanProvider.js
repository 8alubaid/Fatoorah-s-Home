// Real Saudi Open Banking via Lean Technologies.
//
// IMPORTANT: this provider talks to YOUR backend (/server), never to Lean
// directly. The Lean Client Secret must live on the server, not in the app —
// anyone can extract strings from a mobile bundle.
//
// The real end-to-end flow (see docs.leantech.me):
//   1. App asks backend for a short-lived customer token (scope=customer.<id>).
//   2. App opens Lean's LinkSDK with that token. The user logs into SNB on
//      Lean's secure screen and grants read-only consent. LinkSDK returns an
//      entity/connection id. (Web SDK works in a WebView for Expo Go; the
//      React Native SDK needs a custom dev build.)
//   3. App tells the backend the entity id; backend calls Lean's Data API to
//      fetch accounts + transactions and returns them normalized.
//
// Until your backend + sandbox keys are ready, connect() throws a clear error.
import { LEAN_BACKEND_URL, LEAN_ENV } from "./config";
import { SAUDI_BANKS } from "./snbMockData";
import { getAccessToken } from "../lib/supabase";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Free-tier cloud hosts (e.g. Render) sleep after inactivity and can take
// ~30-50s to cold-start — longer than one request's timeout. Poll /health with
// short, abortable requests until it responds, so the real calls hit a warm
// server instead of failing on the very first tap.
async function wakeUp(onProgress) {
  for (let i = 0; i < 20; i++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const r = await fetch(`${LEAN_BACKEND_URL}/health`, { signal: ctrl.signal });
      if (r.ok) return true;
    } catch {
      /* not up yet */
    } finally {
      clearTimeout(timer);
    }
    if (i === 0) onProgress?.("Waking up the server…");
    await sleep(2500);
  }
  return false;
}

async function api(path, body) {
  const token = await getAccessToken(); // Supabase JWT → backend knows the user
  let res;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      res = await fetch(`${LEAN_BACKEND_URL}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ env: LEAN_ENV, ...(body || {}) }),
      });
      break;
    } catch (e) {
      if (attempt === 2) {
        throw new Error(
          `Couldn't reach the backend at ${LEAN_BACKEND_URL}. It may still be waking up — tap Try again in a few seconds.`
        );
      }
      await sleep(2500); // transient/cold-start — retry
    }
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Lean backend error ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

export const leanProvider = {
  id: "lean",
  label: "Lean (SNB live)",
  isMock: false,

  async listBanks() {
    // Optional: fetch the live, supported-bank list from your backend.
    try {
      const { banks } = await api("/api/lean/banks");
      return banks?.length ? banks : SAUDI_BANKS;
    } catch {
      return SAUDI_BANKS; // fall back to the static list if backend is down
    }
  },

  // `openLinkSDK` is injected by the Connect screen (it owns the <LinkSDK>
  // component). It opens Lean's consent flow and resolves on SUCCESS. The
  // LinkSDK callback does NOT return an entity_id — the backend resolves the
  // entity from the customer afterward (or via webhook in production).
  async connect({ bankId, onProgress, openLinkSDK } = {}) {
    if (typeof openLinkSDK !== "function") {
      throw new Error(
        "Lean LinkSDK isn't available. Run a custom dev build (not Expo Go) so " +
          "lean-react-native + react-native-webview are included. See server/README.md."
      );
    }

    onProgress?.("Connecting…");
    await wakeUp(onProgress); // spin up the cloud backend if it's asleep

    onProgress?.("Creating secure session…");
    const { customerId, customerToken, appToken } = await api("/api/lean/customer-token", { bankId });

    onProgress?.("Waiting for bank consent…");
    // Resolves on SUCCESS; throws on CANCELLED/ERROR. If the SDK callback exposes
    // the entity we use it directly; otherwise the backend resolves it via the
    // entity.created webhook.
    const link = await openLinkSDK({ customerId, customerToken, appToken, bankId });
    const entityId = link?.entity_id || link?.entity?.id || link?.payload?.entity_id || undefined;

    onProgress?.("Fetching your accounts…");
    // The backend ties the customer/entity to the signed-in user (from the JWT),
    // so we no longer pass ids from the app.
    const accRes = await api("/api/lean/accounts", {});

    onProgress?.("Importing transactions…");
    const { transactions } = accRes.connected
      ? await api("/api/lean/transactions", {})
      : { transactions: [] };

    return { accounts: accRes.accounts || [], transactions: transactions || [] };
  },

  // Re-fetch the signed-in user's data (restore-on-launch / re-sync). No consent.
  async fetchData({ onProgress } = {}) {
    onProgress?.("Syncing…");
    await wakeUp(onProgress);
    const accRes = await api("/api/lean/accounts", {});
    if (!accRes.connected) return { accounts: [], transactions: [] };
    const { transactions } = await api("/api/lean/transactions", {});
    return { accounts: accRes.accounts || [], transactions: transactions || [] };
  },

  // Forget the signed-in user's bank connection (server-side).
  async disconnect() {
    try {
      await api("/api/lean/disconnect", {});
    } catch {
      /* best-effort */
    }
  },
};
