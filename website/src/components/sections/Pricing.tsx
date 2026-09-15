"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import Reveal, { SectionHeading } from "../Reveal";
import { Amount } from "../Riyal";
import { APP_URL } from "@/lib/config";

// Starting price hypotheses (SAR, VAT inclusive). Yearly = 10x monthly, i.e.
// two months free. Change here once pricing is validated with real users.
const PLANS = [
  { key: "free", monthly: 0, yearly: 0 },
  { key: "plus", monthly: 19, yearly: 190, popular: true },
  { key: "family", monthly: 39, yearly: 390 },
] as const;

export default function Pricing({ showHeading = true }: { showHeading?: boolean }) {
  const t = useTranslations("Pricing");
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-24 lg:px-8">
      {showHeading ? <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} /> : null}

      {/* Billing toggle */}
      <div className="mt-10 flex justify-center">
        <div className="relative inline-flex rounded-full border border-line bg-surface p-1" role="tablist">
          {[false, true].map((isYearly) => {
            const active = yearly === isYearly;
            return (
              <button
                key={String(isYearly)}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setYearly(isYearly)}
                className={`relative z-10 flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                  active ? "text-on-brand" : "text-muted hover:text-ink"
                }`}
              >
                {active ? (
                  <motion.span
                    layoutId="billing-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-brand"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                ) : null}
                {isYearly ? t("yearly") : t("monthly")}
                {isYearly ? (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      active ? "bg-on-brand/15 text-on-brand" : "bg-brand-soft text-brand"
                    }`}
                  >
                    {t("save")}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
        {PLANS.map((plan, i) => {
          const popular = "popular" in plan && plan.popular;
          const price = yearly ? plan.yearly : plan.monthly;
          const features = t.raw(`plans.${plan.key}.features`) as string[];
          return (
            <Reveal key={plan.key} delay={i * 0.08}>
              <div
                className={`relative flex h-full flex-col rounded-3xl border p-8 transition-shadow ${
                  popular
                    ? "border-brand bg-[#0b1110] text-white dark:bg-surface-alt shadow-2xl shadow-brand/20 lg:-my-4 lg:py-12"
                    : "border-line bg-surface hover:shadow-lg"
                }`}
              >
                {popular ? (
                  <span className="absolute -top-3.5 start-1/2 -translate-x-1/2 rounded-full bg-brand px-4 py-1 text-xs font-semibold text-on-brand rtl:translate-x-1/2">
                    {t("popular")}
                  </span>
                ) : null}

                <h3 className="text-lg font-semibold">{t(`plans.${plan.key}.name`)}</h3>
                <p className={`mt-1 text-sm ${popular ? "text-white/60" : "text-muted"}`}>{t(`plans.${plan.key}.desc`)}</p>

                <div className="mt-6 flex items-end gap-1.5">
                  <motion.span
                    key={`${plan.key}-${yearly}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Amount value={price} className="text-5xl font-bold tracking-tight" />
                  </motion.span>
                  {price > 0 ? (
                    <span className={`mb-1.5 text-sm ${popular ? "text-white/60" : "text-muted"}`}>
                      {yearly ? t("perYear") : t("perMonth")}
                    </span>
                  ) : null}
                </div>

                <ul className="mt-8 flex-1 space-y-3.5">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <span
                        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${
                          popular ? "bg-brand text-on-brand" : "bg-brand-soft text-brand"
                        }`}
                      >
                        <Check className="size-3.5" strokeWidth={3} />
                      </span>
                      <span className={popular ? "text-white/85" : "text-ink/85"}>{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={APP_URL}
                  className={`mt-10 block rounded-xl px-5 py-3.5 text-center font-semibold transition-all hover:-translate-y-0.5 ${
                    popular ? "bg-brand text-on-brand hover:bg-brand-hover" : "border border-line bg-surface text-ink hover:bg-surface-alt"
                  }`}
                >
                  {t(`plans.${plan.key}.cta`)}
                </a>
              </div>
            </Reveal>
          );
        })}
      </div>

      <p className="mt-10 text-center text-sm text-faint">{t("footnote")}</p>
    </section>
  );
}
