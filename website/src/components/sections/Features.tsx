import { useTranslations } from "next-intl";
import { BellRing, ChartPie, FileText, Languages, PiggyBank, ShieldCheck } from "lucide-react";
import Reveal, { SectionHeading } from "../Reveal";

const ITEMS = [
  { key: "import", icon: FileText },
  { key: "insights", icon: ChartPie },
  { key: "subscriptions", icon: BellRing },
  { key: "budgets", icon: PiggyBank },
  { key: "bilingual", icon: Languages },
  { key: "privacy", icon: ShieldCheck },
] as const;

export default function Features({ showHeading = true }: { showHeading?: boolean }) {
  const t = useTranslations("Features");

  return (
    <section id="features" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
      {showHeading ? <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} /> : null}

      <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${showHeading ? "mt-16" : ""}`}>
        {ITEMS.map(({ key, icon: Icon }, i) => (
          <Reveal key={key} delay={i * 0.06}>
            <article
              id={key}
              className="group h-full scroll-mt-24 rounded-2xl border border-line bg-surface p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-xl hover:shadow-brand/5"
            >
              <span className="grid size-12 place-items-center rounded-xl bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-on-brand">
                <Icon className="size-6" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-ink">{t(`items.${key}.title`)}</h3>
              <p className="mt-2 leading-relaxed text-muted">{t(`items.${key}.desc`)}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
