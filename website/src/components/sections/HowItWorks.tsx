import { useTranslations } from "next-intl";
import { CalendarClock, Sparkles, Upload } from "lucide-react";
import Reveal, { SectionHeading } from "../Reveal";

const STEPS = [
  { key: "one", icon: Upload },
  { key: "two", icon: Sparkles },
  { key: "three", icon: CalendarClock },
] as const;

export default function HowItWorks() {
  const t = useTranslations("How");

  return (
    <section id="how" className="scroll-mt-20 border-y border-line bg-white">
      <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />

        <ol className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-6">
          {/* Connector line behind the step badges on wide screens */}
          <div aria-hidden className="absolute inset-x-[16%] top-7 hidden h-px bg-gradient-to-r from-transparent via-line to-transparent md:block" />
          {STEPS.map(({ key, icon: Icon }, i) => (
            <Reveal key={key} delay={i * 0.12}>
              <li className="relative text-center">
                <span className="relative mx-auto grid size-14 place-items-center rounded-2xl border border-line bg-white text-brand shadow-sm">
                  <Icon className="size-6" />
                  <span className="absolute -end-2 -top-2 grid size-6 place-items-center rounded-full bg-brand text-xs font-bold text-white">
                    {i + 1}
                  </span>
                </span>
                <h3 className="mt-6 text-lg font-semibold text-ink">{t(`steps.${key}.title`)}</h3>
                <p className="mx-auto mt-2 max-w-xs leading-relaxed text-muted">{t(`steps.${key}.desc`)}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
