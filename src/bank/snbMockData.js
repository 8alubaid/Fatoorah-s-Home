// Demo data returned by the mock provider, shaped EXACTLY like the normalized
// objects the real Lean provider will return — so screens never care which
// source they came from.

// The Saudi banks shown in the "Connect" picker. ids match Lean's bank ids
// loosely; the real list comes from the provider's listBanks() at runtime.
export const SAUDI_BANKS = [
  { id: "snb", name: "Saudi National Bank", short: "SNB (AlAhli)", color: "#00723F", emoji: "🟢" },
  { id: "alrajhi", name: "Al Rajhi Bank", short: "Al Rajhi", color: "#1E3A8A", emoji: "🔷" },
  { id: "riyad", name: "Riyad Bank", short: "Riyad", color: "#0E7490", emoji: "🔵" },
  { id: "alinma", name: "Alinma Bank", short: "Alinma", color: "#7C3AED", emoji: "🟣" },
  { id: "sab", name: "Saudi Awwal Bank", short: "SAB", color: "#B91C1C", emoji: "🔴" },
  { id: "anb", name: "Arab National Bank", short: "ANB", color: "#C2410C", emoji: "🟠" },
  { id: "bsf", name: "Banque Saudi Fransi", short: "BSF", color: "#0F766E", emoji: "🟢" },
];

// Account shape: { id, bankId, bankName, name, mask, type, currency, balance }
export const SNB_ACCOUNTS = [
  {
    id: "snb-current",
    bankId: "snb",
    bankName: "Saudi National Bank",
    name: "Current Account",
    mask: "••••4321",
    type: "Current",
    currency: "SAR",
    balance: 18420,
  },
  {
    id: "snb-card",
    bankId: "snb",
    bankName: "Saudi National Bank",
    name: "AlAhli Credit Card",
    mask: "••••9087",
    type: "Credit Card",
    currency: "SAR",
    balance: -1240,
  },
];

// Transaction shape matches the rest of the app's "receipt":
// { id, merchant, category, amount, date: 'YYYY-MM-DD', note, accountId }
export const SNB_TRANSACTIONS = [
  { id: "t1", merchant: "Starbucks", category: "Food", amount: 24, date: "2026-06-10", note: "Latte + croissant", accountId: "snb-card" },
  { id: "t2", merchant: "Jarir Bookstore", category: "Shopping", amount: 250, date: "2026-06-08", note: "Notebook + pens", accountId: "snb-card" },
  { id: "t3", merchant: "Panda", category: "Groceries", amount: 180, date: "2026-06-05", note: "Weekly groceries", accountId: "snb-current" },
  { id: "t4", merchant: "Uber", category: "Transport", amount: 38, date: "2026-06-05", note: "Ride to office", accountId: "snb-card" },
  { id: "t5", merchant: "STC", category: "Bills", amount: 199, date: "2026-06-03", note: "Mobile plan", accountId: "snb-current" },
  { id: "t6", merchant: "Half Million", category: "Food", amount: 56, date: "2026-06-02", note: "Coffee with friend", accountId: "snb-card" },
  { id: "t7", merchant: "Amazon.sa", category: "Shopping", amount: 420, date: "2026-06-01", note: "Headphones", accountId: "snb-card" },
  { id: "t8", merchant: "Careem", category: "Transport", amount: 27, date: "2026-06-04", note: "Airport ride", accountId: "snb-card" },
  { id: "t9", merchant: "Danube", category: "Groceries", amount: 145, date: "2026-06-06", note: "Snacks + fruit", accountId: "snb-current" },
  { id: "t10", merchant: "McDonald's", category: "Food", amount: 41, date: "2026-06-06", note: "Lunch", accountId: "snb-card" },
  { id: "t11", merchant: "VOX Cinemas", category: "Entertainment", amount: 90, date: "2026-06-01", note: "2 tickets", accountId: "snb-card" },
  { id: "t12", merchant: "Nahdi Pharmacy", category: "Health", amount: 64, date: "2026-05-30", note: "Vitamins", accountId: "snb-card" },
  { id: "t13", merchant: "IKEA", category: "Shopping", amount: 310, date: "2026-05-28", note: "Desk lamp", accountId: "snb-current" },
  { id: "t14", merchant: "Saudi Electricity", category: "Bills", amount: 280, date: "2026-05-27", note: "May electricity", accountId: "snb-current" },
  { id: "t15", merchant: "Tamimi Markets", category: "Groceries", amount: 205, date: "2026-05-25", note: "Groceries", accountId: "snb-current" },
  { id: "t16", merchant: "Starbucks", category: "Food", amount: 19, date: "2026-05-24", note: "Cappuccino", accountId: "snb-card" },
  { id: "t17", merchant: "Netflix", category: "Entertainment", amount: 56, date: "2026-05-22", note: "Subscription", accountId: "snb-current" },
  { id: "t18", merchant: "Uber", category: "Transport", amount: 33, date: "2026-05-20", note: "Mall trip", accountId: "snb-card" },
];
