import { useTranslations } from "next-intl";
import { Bell, Tv, Zap } from "lucide-react";
import { Amount } from "../Riyal";

// Stacked bars: [essentials, discretionary] per month — mirrors the app's
// weekly chart, drawn with plain divs so it renders crisply at any size.
const BARS = [
  [38, 22],
  [30, 14],
  [46, 30],
  [52, 26],
  [24, 10],
  [58, 36],
];

export default function PhoneMockup() {
  const t = useTranslations("Mockup");

  return (
    <div className="relative mx-auto w-[292px] rounded-[48px] border border-black/10 bg-[#0b1110] p-[10px] shadow-[0_40px_80px_-24px_rgba(11,33,25,0.45)]">
      <div className="absolute start-1/2 top-[18px] z-20 h-[26px] w-[94px] -translate-x-1/2 rounded-full bg-black rtl:translate-x-1/2" />
      <div className="relative overflow-hidden rounded-[38px] bg-[#f5f7f6]">
        {/* Status + greeting */}
        <div className="bg-gradient-to-br from-[#147a52] to-[#0c5a3b] px-5 pb-16 pt-12 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="grid size-9 place-items-center rounded-full bg-white/20 text-sm font-bold">F</div>
              <div>
                <p className="text-[11px] text-white/70">{t("welcome")} 👋</p>
                <p className="text-sm font-semibold">{t("name")}</p>
              </div>
            </div>
            <span className="grid size-8 place-items-center rounded-full bg-white/15">
              <Bell className="size-4" />
            </span>
          </div>
        </div>

        {/* Floating balance card */}
        <div className="-mt-12 px-4">
          <div className="rounded-2xl bg-[#0b1110] p-4 text-white shadow-lg">
            <p className="text-[11px] text-white/60">{t("spent")}</p>
            <Amount value={3470} className="mt-1 text-[26px] font-bold" />
            <div className="mt-3 flex items-center justify-between text-[11px]">
              <span className="text-white/60">
                {t("budget")} <Amount value={5000} className="text-white/80" />
              </span>
              <span className="font-semibold text-[#43b581]">69%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[69%] rounded-full bg-[#43b581]" />
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="mx-4 mt-3 rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-[13px] font-semibold text-[#17211e]">{t("spending")}</p>
          <div className="mt-3 flex h-24 items-end justify-between gap-2">
            {BARS.map(([a, b], i) => (
              <div key={i} className="flex w-full flex-col-reverse overflow-hidden rounded-md">
                <div className="bg-[#147a52]" style={{ height: `${a}px` }} />
                <div className="bg-[#43b581]/60" style={{ height: `${b}px` }} />
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming renewals */}
        <div className="mx-4 mb-5 mt-3 rounded-2xl bg-white p-3 shadow-sm">
          <p className="px-1 text-[13px] font-semibold text-[#17211e]">{t("upcoming")}</p>
          {[
            { icon: Tv, name: t("netflix"), amount: 56, days: 3, tint: "bg-violet-50 text-violet-600" },
            { icon: Zap, name: t("electricity"), amount: 280, days: 9, tint: "bg-rose-50 text-rose-600" },
          ].map(({ icon: Icon, name, amount, days, tint }) => (
            <div key={name} className="mt-2 flex items-center gap-2.5 rounded-xl p-1.5">
              <span className={`grid size-8 place-items-center rounded-lg ${tint}`}>
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-[#17211e]">{name}</p>
                <p className="text-[10px] text-[#899691]">{t("inDays", { days })}</p>
              </div>
              <Amount value={amount} className="text-xs font-bold text-[#17211e]" />
            </div>
          ))}
        </div>

        <div className="flex justify-center pb-2">
          <span className="h-1 w-24 rounded-full bg-black/80" />
        </div>
      </div>
    </div>
  );
}
