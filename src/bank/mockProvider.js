// Mock implementation of the BankProvider interface. Simulates the Lean
// consent + fetch flow with realistic delays so the UX matches the real thing.
import { SAUDI_BANKS, SNB_ACCOUNTS, SNB_TRANSACTIONS } from "./snbMockData";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export const mockProvider = {
  id: "mock",
  label: "Demo data",
  isMock: true,

  async listBanks() {
    return SAUDI_BANKS;
  },

  // Mirrors the real flow: consent → bank auth → fetch accounts → fetch txns.
  // `onProgress` lets the UI show the same step labels for mock and Lean.
  async connect({ bankId, onProgress } = {}) {
    onProgress?.("Opening secure consent…");
    await wait(700);
    onProgress?.("Authenticating with your bank…");
    await wait(900);
    onProgress?.("Fetching your accounts…");
    await wait(700);
    onProgress?.("Importing transactions…");
    await wait(800);

    // The mock only knows SNB; a real provider would return data for `bankId`.
    return { accounts: SNB_ACCOUNTS, transactions: SNB_TRANSACTIONS };
  },
};
