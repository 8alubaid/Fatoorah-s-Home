"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import PhoneMockup from "../mockups/PhoneMockup";
import DashboardMockup from "../mockups/DashboardMockup";
import { APP_URL } from "@/lib/config";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  const t = useTranslations("Hero");
  const reduce = useReducedMotion();
  const enter = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay, ease } };
  // The headline and subtitle are the page's main content (and its Largest
  // Contentful Paint), so they only slide — never start invisible. If
  // animation is throttled (background tab, slow device) they're still readable.
  const slide = (delay: number) =>
    reduce ? {} : { initial: { y: 16 }, animate: { y: 0 }, transition: { duration: 0.7, delay, ease } };

  return (
    <section className="relative overflow-hidden">
      {/* Backdrop: soft brand glow over a faint grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 start-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(67,181,129,0.22),transparent)] rtl:translate-x-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(23,33,30,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(23,33,30,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-14 lg:grid-cols-[1fr_1.1fr] lg:px-8 lg:pb-28 lg:pt-20">
        <div>
          <motion.span
            {...enter(0)}
            className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-soft px-3.5 py-1.5 text-sm font-medium text-brand"
          >
            <Sparkles className="size-4" />
            {t("badge")}
          </motion.span>

          <motion.h1
            {...slide(0.08)}
            className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl rtl:leading-[1.25]"
          >
            {t("title")}
          </motion.h1>

          <motion.p {...slide(0.16)} className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            {t("subtitle")}
          </motion.p>

          <motion.div {...enter(0.24)} className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href={APP_URL}
              className="group inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 font-semibold text-on-brand shadow-lg shadow-brand/25 transition-all hover:-translate-y-0.5 hover:bg-brand-hover"
            >
              {t("primary")}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </a>
            <a
              href="#how"
              className="inline-flex items-center rounded-xl border border-line bg-surface px-6 py-3.5 font-semibold text-ink transition-colors hover:bg-surface-alt"
            >
              {t("secondary")}
            </a>
          </motion.div>

          <motion.p {...enter(0.32)} className="mt-5 text-sm text-faint">
            {t("note")}
          </motion.p>
        </div>

        {/* Product visual: dashboard behind, phone in front */}
        <div className="relative h-[560px] sm:h-[600px]">
          <motion.div
            initial={reduce ? false : { opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease }}
            className="absolute end-0 top-10 hidden origin-top-right scale-[0.82] md:block xl:scale-95 rtl:origin-top-left"
          >
            <DashboardMockup />
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease }}
            className="absolute inset-x-0 top-0 md:inset-x-auto md:start-0 md:top-6"
          >
            <motion.div
              animate={reduce ? undefined : { y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <PhoneMockup />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
