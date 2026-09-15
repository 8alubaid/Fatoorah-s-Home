import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import Reveal from "../Reveal";
import { APP_URL } from "@/lib/config";

export default function Cta() {
  const t = useTranslations("Cta");
  return (
    <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#147a52] to-[#0b3d29] px-8 py-16 text-center text-white sm:px-16">
          <div aria-hidden className="absolute -end-24 -top-24 size-72 rounded-full bg-white/10 blur-3xl" />
          <div aria-hidden className="absolute -bottom-32 -start-16 size-80 rounded-full bg-[#43b581]/25 blur-3xl" />
          <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-white/75">{t("subtitle")}</p>
          <a
            href={APP_URL}
            className="group relative mt-9 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-brand shadow-xl transition-all hover:-translate-y-0.5"
          >
            {t("button")}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
          </a>
        </div>
      </Reveal>
    </section>
  );
}
