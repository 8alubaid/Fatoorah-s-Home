// Spending selectors take a `txns` array so they work on whatever the active
// source provides (imported statements today, bank sync later). Reminders are
// DERIVED from those transactions — see detectRecurring below.

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

// ---- Recurring payment / subscription detection ----
//
// Reminders are derived from real spending: we look for the same merchant
// charging a similar amount on a regular cadence, and project the next charge.
// A one-month statement only shows a monthly subscription ONCE, so well-known
// subscription/bill merchants are also recognized from a single charge (at
// lower confidence) — otherwise a first import would find nothing.

// Utilities & telecom read as "bills"; everything else recurring is a subscription.
const BILL_PATTERNS =
  /(stc|mobily|zain|salam|saudi electricity|electricity|kahraba|water|gas|internet|telecom|فاتورة|كهرباء|ماء|اتصالات|موبايلي|زين)/i;
const SUBSCRIPTION_PATTERNS =
  /(netflix|spotify|icloud|apple\.com|apple services|itunes|youtube|google|microsoft|adobe|shahid|osn|starzplay|amazon prime|prime video|anghami|deezer|canva|chatgpt|openai|claude|anthropic|notion|dropbox|linkedin|xbox|playstation|nintendo|disney|tod tv|careem plus|jahez|gym|fitness|شاهد|اشتراك)/i;

const DAY_MS = 86400000;
const dayGap = (a, b) => Math.round((b - a) / DAY_MS);
const toIso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Merchant key for grouping: case/punctuation-insensitive, trailing ref codes removed.
const merchantKey = (m) =>
  (m || "")
    .toLowerCase()
    .replace(/[^a-z0-9؀-ۿ ]+/g, " ")
    .replace(/\d{4,}/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const median = (nums) => {
  const a = [...nums].sort((x, y) => x - y);
  return a[Math.floor(a.length / 2)];
};

// Map an observed gap in days to a known cadence, or null.
function cadenceForGap(g) {
  if (g >= 26 && g <= 35) return { days: 30, label: "Monthly" };
  if (g >= 6 && g <= 8) return { days: 7, label: "Weekly" };
  if (g >= 13 && g <= 16) return { days: 14, label: "Every 2 weeks" };
  if (g >= 85 && g <= 100) return { days: 91, label: "Quarterly" };
  if (g >= 350 && g <= 380) return { days: 365, label: "Yearly" };
  return null;
}

export function detectRecurring(txns) {
  const groups = new Map();
  (txns || []).forEach((t) => {
    if (!t || !t.date || !t.merchant) return;
    const key = merchantKey(t.merchant);
    if (!key) return;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(t);
  });

  const out = [];
  groups.forEach((list, key) => {
    list.sort((a, b) => parseDate(a.date) - parseDate(b.date));
    const amounts = list.map((t) => t.amount);
    const typical = median(amounts);
    const last = list[list.length - 1];
    const name = last.merchant;
    const isBill = BILL_PATTERNS.test(name);
    const known = isBill || SUBSCRIPTION_PATTERNS.test(name);

    let cadence = null;
    let confidence = null;

    if (list.length >= 2) {
      const gaps = [];
      for (let i = 1; i < list.length; i++) {
        gaps.push(dayGap(parseDate(list[i - 1].date), parseDate(list[i].date)));
      }
      const usable = gaps.filter((g) => g >= 5); // ignore same-day/split charges
      if (usable.length) {
        // Subscriptions bill a stable amount; allow a little drift (FX, VAT).
        const stable = amounts.every((a) => Math.abs(a - typical) <= Math.max(2, typical * 0.25));
        if (stable) {
          cadence = cadenceForGap(median(usable));
          // Two similar charges a month apart is weak evidence for an unknown
          // merchant (two Uber rides, two similar grocery runs). Require a third
          // charge — i.e. two consistent gaps — unless it's a known brand.
          const enoughEvidence = known || usable.length >= 2;
          if (cadence && enoughEvidence) confidence = usable.length >= 2 ? "high" : "medium";
          else cadence = null;
        }
      }
    }

    // Fall back to name recognition so a single month of data still surfaces
    // the obvious ones.
    if (!cadence && known) {
      cadence = { days: 30, label: "Monthly" };
      confidence = "low";
    }
    if (!cadence) return;

    const next = parseDate(last.date);
    next.setDate(next.getDate() + cadence.days);

    out.push({
      id: `rec-${key.replace(/ /g, "-")}`,
      type: isBill ? "bill" : "subscription",
      title: isBill ? `${name} bill due` : `${name} renews`,
      merchant: name,
      amount: Math.round(typical),
      date: toIso(next),
      cadence: cadence.label,
      confidence,
      seen: list.length,
      lastCharged: last.date,
    });
  });

  return out.sort((a, b) => parseDate(a.date) - parseDate(b.date));
}

// Total per period implied by the detected subscriptions (monthly-equivalent).
export const monthlyRecurringTotal = (items) =>
  (items || []).reduce((sum, r) => {
    const perMonth =
      r.cadence === "Weekly" ? r.amount * 4.33
      : r.cadence === "Every 2 weeks" ? r.amount * 2.17
      : r.cadence === "Quarterly" ? r.amount / 3
      : r.cadence === "Yearly" ? r.amount / 12
      : r.amount;
    return sum + perMonth;
  }, 0);

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

// The most recent transaction's date — used as the dashboard/insights "anchor"
// so real (often historical sandbox) data still populates the monthly views.
export const latestTxDate = (txns) =>
  txns.length ? txns.map((t) => parseDate(t.date)).reduce((a, b) => (a > b ? a : b)) : null;
