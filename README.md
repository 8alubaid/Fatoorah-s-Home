# Fatoorah 🧾

A RocketMoney-style receipts & spending app built with **Expo + Expo Router**.
Runs in the browser (localhost) and on your phone via **Expo Go**.

## Tabs

| Tab | What it shows |
|-----|---------------|
| 🏠 **Dashboard** | Month & week spending, AI summary, budget progress, recent receipts |
| 🧾 **Receipts** | All receipts with search + category + date filters |
| 📊 **Insights** | Weekly bar chart, month-over-month trend, category breakdown |
| ⏰ **Reminders** | Calendar of warranties, return deadlines, subscription renewals & bills |

## Run it

```bash
npm install        # first time only
npm run web        # open in browser at http://localhost:8081
```

Or run on your phone:

```bash
npm start          # scan the QR code with the Expo Go app
```

## Where things live

- `app/(tabs)/` — the four screens (one file per tab) + tab bar in `_layout.js`
- `app/connect.js` — the **Connect Bank** flow (bank picker → consent → import).
- `src/bank/` — the **swappable bank provider layer** (see below).
- `src/data.js` — reminders + spending selectors (selectors take a `txns` array).
- `src/theme.js` — **light + dark palettes** (`lightColors`/`darkColors`), category styling, spacing.
- `src/ThemeContext.js` — `useTheme()` + `useThemedStyles(makeStyles)`. Follows the system
  light/dark setting; the header sun/moon button toggles a manual override.
- `src/utils.js` — money/date formatting. `TODAY` is pinned to 2026-06-06 for the demo.
- `src/components/ui.js` — shared Card / Chip / ProgressBar / Avatar / Button / EmptyState.
- `server/` — backend that holds the Lean secret (only needed for real bank linking).

## Bank linking (mock today, real Lean tomorrow)

The app reads all spending data from a **provider interface**, so the data source
is swappable from one flag. Screens never know if data is mock or real.

- `src/bank/config.js` — **`BANK_PROVIDER`**: `"mock"` (default, demo SNB data, works
  in Expo Go) or `"lean"` (real Saudi Open Banking via Lean Technologies).
- `src/bank/mockProvider.js` — fake SNB connect + data with realistic delays.
- `src/bank/leanProvider.js` — real provider; calls the backend in `server/`.
- `src/bank/LeanLinkSDK.native.js` / `.web.js` — the `lean-react-native` LinkSDK
  host, platform-split so it's only bundled on a real device (web/mock ignore it).
- `src/bank/BankContext.js` — app-wide `useBank()` state (accounts, transactions).

## Going live with Lean (real SNB) — a custom dev build

The real consent step uses `lean-react-native`'s `<LinkSDK>`, which needs
`react-native-webview` (a native module). So real linking runs in a **custom dev
build**, not Expo Go. The mock path still works in Expo Go / web.

1. **Backend:** fill `server/.env` with your Lean keys and run it
   (see `server/README.md`). Sanity-check at `http://localhost:4000/api/lean/verify`.
2. **Point the app at it:** in `src/bank/config.js` set `BANK_PROVIDER = "lean"`,
   `LEAN_ENV = "sandbox"`, and `LEAN_BACKEND_URL` to your PC's LAN IP (e.g.
   `http://192.168.0.192:4000`).
3. **Build a dev client** (cloud build — no Android Studio needed on Windows):
   ```bash
   npm i -g eas-cli
   eas login                     # free Expo account
   eas build --profile development --platform android
   ```
   Install the resulting APK on your phone.
4. **Run:** `npx expo start --dev-client`, open the dev build, scan the QR.
5. **Connect:** tap Connect bank → SNB → in Lean's sandbox screen log in with the
   test credentials from your Lean dashboard (e.g. `emmiecruickshank4516`).

> Remaining `TODO: CONFIRM` items in `server/index.js` (entities path, balance/
> field names) should be verified against your live sandbox responses — they vary
> slightly per account. The OAuth + v2 transaction/balance paths are already set.

## Next steps (when you go beyond the demo)

1. Verify the sandbox connection on the dev build, confirming the `TODO: CONFIRM` paths.
2. Set up the Lean **webhook** (`entity.created`) for production entity_id delivery.
3. Persist connection state (e.g. `expo-secure-store` / `AsyncStorage`).
4. Add receipt capture (camera + OCR) — `expo-camera` + an OCR service.
5. Wire the AI summary to a real model call.
6. Schedule local notifications for reminders with `expo-notifications`.
