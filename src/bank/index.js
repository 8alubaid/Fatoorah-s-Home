// Single place the app imports the active provider from. Screens depend on
// this interface only — never on mock vs Lean specifics.
import { BANK_PROVIDER } from "./config";
import { mockProvider } from "./mockProvider";
import { leanProvider } from "./leanProvider";

export const bankProvider = BANK_PROVIDER === "lean" ? leanProvider : mockProvider;

export { SAUDI_BANKS } from "./snbMockData";
