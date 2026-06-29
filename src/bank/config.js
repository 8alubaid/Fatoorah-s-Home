// ───────────────────────────────────────────────────────────────────────────
// Bank data source — flip this ONE flag to switch the whole app over.
//
//   'mock' → built-in demo data (no signup, works in Expo Go). Default.
//   'lean' → real Saudi Open Banking via Lean Technologies. Requires:
//              1. A Lean sandbox/production account (book a demo at leantech.me).
//              2. The backend in /server running with your Lean keys.
//                 The app NEVER holds the Lean Client Secret — the backend does.
// ───────────────────────────────────────────────────────────────────────────
export const BANK_PROVIDER = "lean"; // 'mock' | 'lean'  (set back to "mock" for the offline demo)

// Only used when BANK_PROVIDER === 'lean'. Points at YOUR backend (see /server),
// which talks to Lean's API and holds the secret.
// Now the Render cloud backend — reachable from any network (no more same-Wi-Fi
// or laptop server needed). For purely local dev you could use your PC's LAN IP
// (e.g. "http://192.168.0.192:4000") with the server running locally.
export const LEAN_BACKEND_URL = "https://fatoorah-server.onrender.com";

// Environment Lean should connect to. The backend reads this too.
export const LEAN_ENV = "sandbox"; // 'sandbox' | 'production'
