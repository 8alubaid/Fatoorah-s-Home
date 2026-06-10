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

async function api(path, body) {
  let res;
  try {
    res = await fetch(`${LEAN_BACKEND_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ env: LEAN_ENV, ...(body || {}) }),
    });
  } catch (e) {
    throw new Error(
      `Can't reach the Lean backend at ${LEAN_BACKEND_URL}. Start /server and set LEAN_BACKEND_URL in src/bank/config.js (use your PC's LAN IP on a phone).`
    );
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

    onProgress?.("Creating secure session…");
    const { customerId, customerToken, appToken } = await api("/api/lean/customer-token", { bankId });

    onProgress?.("Waiting for bank consent…");
    // Resolves on SUCCESS; throws on CANCELLED/ERROR. If the SDK callback exposes
    // the entity we use it directly; otherwise the backend resolves it via the
    // entity.created webhook.
    const link = await openLinkSDK({ customerId, customerToken, appToken, bankId });
    const entityId = link?.entity_id || link?.entity?.id || link?.payload?.entity_id || undefined;

    onProgress?.("Fetching your accounts…");
    const { accounts } = await api("/api/lean/accounts", { customerId, entityId });

    onProgress?.("Importing transactions…");
    const { transactions } = await api("/api/lean/transactions", { customerId, entityId });

    return { accounts, transactions };
  },
};
