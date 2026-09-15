import { useTranslations } from "next-intl";
import { BellRing, ChartPie, FileText, LayoutGrid, Receipt, Search, Settings } from "lucide-react";
import { Amount } from "../Riyal";

const MONTHS = [42, 64, 50, 78, 58, 88, 70, 96, 60, 82, 74, 100];

export default function DashboardMockup() {
  const t = useTranslations("Mockup");

  const categories = [
    { label: t("shopping"), pct: 34, color: "#7a6db0" },
    { label: t("groceries"), pct: 24, color: "#a85e7f" },
    { label: t("bills"), pct: 20, color: "#b57a21" },
    { label: t("food"), pct: 14, color: "#2e8b65" },
    { label: t("transport"), pct: 8, color: "#3979a8" },
  ];
  // conic-gradient donut: each slice starts where the previous one ended.
  let acc = 0;
  const donut = categories
    .map((c) => {
      const from = acc;
      acc += c.pct;
      return `${c.color} ${from}% ${acc}%`;
    })
    .join(", ");

  return (
    <div className="w-[640px] overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_30px_70px_-30px_rgba(11,33,25,0.35)]">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 border-b border-line bg-surface-alt/60 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ms-4 flex h-6 flex-1 items-center gap-1.5 rounded-md bg-surface px-2 text-[10px] text-faint">
          <Search className="size-3" /> app.fatoorah.com
        </span>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-[132px] shrink-0 border-e border-line p-3">
          <div className="mb-4 flex items-center gap-1.5 px-1.5">
            <span className="size-5 rounded-md bg-brand" />
            <span className="text-[11px] font-bold text-ink">Fatoorah</span>
          </div>
          {[
            { icon: LayoutGrid, label: t("dashboard"), active: true },
            { icon: Receipt, label: t("transactions") },
            { icon: ChartPie, label: t("categories").split(" ")[0] },
            { icon: BellRing, label: t("subscriptions") },
            { icon: FileText, label: "PDF" },
            { icon: Settings, label: "···" },
          ].map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              className={`mb-1 flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] font-medium ${
                active ? "bg-brand-soft text-brand" : "text-muted"
              }`}
            >
              <Icon className="size-3.5" />
              <span className="truncate">{label}</span>
            </div>
          ))}
        </aside>

        {/* Main */}
        <div className="flex-1 bg-bg p-4">
          <p className="text-sm font-bold text-ink">{t("dashboard")}</p>

          <div className="mt-3 grid grid-cols-3 gap-2.5">
            {[
              { label: t("totalSpent"), node: <Amount value={3470} /> },
              { label: t("transactions"), node: "128" },
              { label: t("subscriptions"), node: "6" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-line bg-surface p-2.5">
                <p className="text-[9px] text-faint">{s.label}</p>
                <p className="mt-1 text-[15px] font-bold text-ink">{s.node}</p>
              </div>
            ))}
          </div>

          <div className="mt-2.5 grid grid-cols-[1.55fr_1fr] gap-2.5">
            <div className="rounded-xl border border-line bg-surface p-3">
              <p className="text-[10px] font-semibold text-ink">{t("spending")}</p>
              <div className="mt-3 flex h-24 items-end gap-1.5">
                {MONTHS.map((h, i) => (
                  <div
                    key={i}
                    className={`w-full rounded-t-[3px] ${i === MONTHS.length - 1 ? "bg-brand" : "bg-brand/25"}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-line bg-surface p-3">
              <p className="text-[10px] font-semibold text-ink">{t("categories")}</p>
              <div className="mt-2 flex items-center gap-2.5">
                <div className="relative size-16 shrink-0 rounded-full" style={{ background: `conic-gradient(${donut})` }}>
                  <div className="absolute inset-[9px] rounded-full bg-surface" />
                </div>
                <ul className="space-y-1">
                  {categories.slice(0, 4).map((c) => (
                    <li key={c.label} className="flex items-center gap-1 text-[8.5px] text-muted">
                      <span className="size-1.5 rounded-full" style={{ background: c.color }} />
                      {c.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Trend line */}
          <div className="mt-2.5 rounded-xl border border-line bg-surface p-3">
            <svg viewBox="0 0 400 60" className="h-12 w-full text-brand" preserveAspectRatio="none">
              <defs>
                <linearGradient id="dm-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,42 C40,38 60,20 100,26 C140,32 160,48 200,40 C240,32 260,12 300,18 C340,24 360,34 400,22 L400,60 L0,60 Z"
                fill="url(#dm-fill)"
              />
              <path
                d="M0,42 C40,38 60,20 100,26 C140,32 160,48 200,40 C240,32 260,12 300,18 C340,24 360,34 400,22"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
