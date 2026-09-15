"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { SectionHeading } from "../Reveal";

const KEYS = ["bank", "banks", "safe", "cancel"] as const;

export default function Faq() {
  const t = useTranslations("Faq");
  const [open, setOpen] = useState<string | null>(KEYS[0]);

  return (
    <section className="mx-auto max-w-3xl px-5 py-24 lg:px-8">
      <SectionHeading title={t("title")} />
      <div className="mt-12 divide-y divide-line rounded-2xl border border-line bg-surface">
        {KEYS.map((key) => {
          const isOpen = open === key;
          return (
            <div key={key}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : key)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-6 px-6 py-5 text-start"
              >
                <span className="font-semibold text-ink">{t(`items.${key}.q`)}</span>
                <Plus className={`size-5 shrink-0 text-brand transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 leading-relaxed text-muted">{t(`items.${key}.a`)}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
