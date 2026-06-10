# Fatoorah backend (Lean Open Banking)

This tiny server holds your **Lean Client Secret** and proxies Open Banking
calls. The mobile app never holds the secret — it only talks to this server.

## When you have Lean sandbox credentials

```bash
cd server
npm install
cp .env.example .env        # then fill in LEAN_APP_ID + LEAN_CLIENT_SECRET
npm start                   # http://localhost:4000
```

Then in the app, edit [`src/bank/config.js`](../src/bank/config.js):

```js
export const BANK_PROVIDER = "lean";          // was "mock"
export const LEAN_BACKEND_URL = "http://192.168.0.192:4000"; // your PC's LAN IP for a phone
```

## Endpoints (called by the app's leanProvider)

| Endpoint | Purpose |
|---|---|
| `GET  /api/lean/verify` | Check your App Id + Secret are valid (no token exposed) |
| `POST /api/lean/customer-token` | Create a Lean customer; return customer token + App Id |
| `POST /api/lean/webhook` | Receives Lean's `entity.created` event → caches `entity_id` |
| `GET  /api/lean/entity?customerId=` | Has the entity_id arrived (via webhook) yet? |
| `POST /api/lean/accounts` | Fetch connected accounts (+ balances) after consent |
| `POST /api/lean/transactions` | Fetch transactions for the connected entity |
| `GET  /health` | Sanity check |

## Webhooks (how we get `entity_id`)

The LinkSDK consent callback returns success but **not** the `entity_id` — and
`/data/v2/accounts?entity_id=…` needs it. Lean delivers it via the
**`entity.created` webhook**. For local dev, expose this server with a tunnel and
register that URL in the Lean dashboard:

```bash
npx ngrok http 4000           # or: cloudflared tunnel --url http://localhost:4000
# then set the dashboard webhook URL to:  https://<tunnel>/api/lean/webhook
```

The server caches `entity_id` per customer; `resolveEntity()` reads it (with a
short wait for a racing webhook) and also falls back to the customer entities API.

## Confirmed KSA details (from the dashboard quickstart)
- Base URLs use `.sa.` — `auth.sandbox.sa.leantech.me`, `sandbox.sa.leantech.me`.
- Data API auth header: `lean-app-token: <Application Id>` (not a Bearer token).
- `GET /data/v2/accounts?entity_id=…`, then `/data/v2/accounts/{id}/balances|transactions`.

## Before production
- Verify the webhook **signature** before trusting events (currently skipped).
- Confirm `normalizeAccount`/`normalizeTransaction` field names against live
  sandbox responses (mapped defensively for now).
- Production access to real accounts requires Lean onboarding + SAMA compliance.
