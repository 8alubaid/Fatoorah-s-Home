// Reminders stay as curated demo data (warranties/returns aren't bank-derived).
// Spending selectors now take a `txns` array so they work on whatever the
// active bank provider returns (mock SNB today, real Lean later).

export const reminders = [
  { id: "m1", type: "warranty", title: "Headphones warranty ends", merchant: "Amazon.sa", date: "2027-06-01", amount: 420 },
  { id: "m2", type: "return", title: "Return window for Desk lamp", merchant: "IKEA", date: "2026-06-11", amount: 310 },
  { id: "m3", type: "subscription", title: "Netflix renews", merchant: "Netflix", date: "2026-06-22", amount: 56 },
  { id: "m4", type: "bill", title: "Electricity bill due", merchant: "Saudi Electricity", date: "2026-06-27", amount: 280 },
  { id: "m5", type: "subscription", title: "STC plan renews", merchant: "STC", date: "2026-06-03", amount: 199 },
  { id: "m6", type: "bill", title: "Internet bill due", merchant: "Mobily", date: "2026-06-15", amount: 249 },
  { id: "m7", type: "warranty", title: "Desk lamp warranty ends", merchant: "IKEA", date: "2027-05-28", amount: 310 },
  { id: "m8", type: "subscription", title: "iCloud+ renews", merchant: "Apple", date: "2026-06-09", amount: 11 },
];

export const reminderMeta = {
  warranty: { label: "Warranty", emoji: "🛡️", color: "#60A5FA" },
  return: { label: "Return", emoji: "↩️", color: "#FBBF24" },
  subscription: { label: "Subscription", emoji: "🔁", color: "#A78BFA" },
  bill: { label: "Bill", emoji: "💡", color: "#F87171" },
};

// ---- Helpers ----

export const parseDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const sameMonth = (iso, ref) => {
  const d = parseDate(iso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
};

// ---- Spending selectors (all take the transaction list) ----

export const totalForMonth = (txns, ref) =>
  txns.filter((t) => sameMonth(t.date, ref)).reduce((s, t) => s + t.amount, 0);

export const totalForWeek = (txns, ref) => {
  const start = new Date(ref);
  start.setDate(ref.getDate() - ref.getDay()); // week starts Sunday
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return txns
    .filter((t) => {
      const d = parseDate(t.date);
      return d >= start && d < end;
    })
    .reduce((s, t) => s + t.amount, 0);
};

export const categoryTotals = (txns, ref) => {
  const map = {};
  txns
    .filter((t) => sameMonth(t.date, ref))
    .forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
  return Object.entries(map)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
};

export const recentTransactions = (txns, n = 4) =>
  [...txns].sort((a, b) => parseDate(b.date) - parseDate(a.date)).slice(0, n);

export const sortedTransactions = (txns) =>
  [...txns].sort((a, b) => parseDate(b.date) - parseDate(a.date));

export const allCategories = (txns) =>
  Array.from(new Set(txns.map((t) => t.category)));

// Daily totals for the current month, used by the bar chart on Insights.
export const dailyTotals = (txns, ref) => {
  const map = {};
  txns
    .filter((t) => sameMonth(t.date, ref))
    .forEach((t) => {
      const day = parseDate(t.date).getDate();
      map[day] = (map[day] || 0) + t.amount;
    });
  return map;
};
