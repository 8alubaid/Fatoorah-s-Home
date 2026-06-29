import { CURRENCY } from "./theme";
import { parseDate } from "./data";

// Fixed "today" so the demo data always looks current and reproducible.
export const TODAY = new Date(2026, 5, 6); // 2026-06-06

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const money = (n) =>
  `${CURRENCY} ${Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export const shortDate = (iso) => {
  const d = parseDate(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
};

export const monthLabel = (ref) => `${MONTHS_LONG[ref.getMonth()]} ${ref.getFullYear()}`;

// "just now", "2m ago", "1h ago", "3d ago" — for the last-synced label.
export const timeAgo = (ts) => {
  if (!ts) return "";
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
};

// "in 5 days", "tomorrow", "today", "3 days ago" — relative to TODAY.
export const relativeDays = (iso) => {
  const d = parseDate(iso);
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const b = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
  const diff = Math.round((a - b) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 0) return `in ${diff} days`;
  return `${Math.abs(diff)} days ago`;
};
