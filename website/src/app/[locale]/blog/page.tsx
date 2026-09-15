import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";

const POSTS = [
  { key: "subs", hue: "from-violet-100 to-violet-50" },
  { key: "budget", hue: "from-emerald-100 to-emerald-50" },
  { key: "statement", hue: "from-amber-100 to-amber-50" },
] as const;

export async function generateMetadata({ params }: PageProps<"/[locale]/blog">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BlogPage" });
  return { title: `${t("title")} · Fatoorah` };
}

export default async function BlogPage({ params }: PageProps<"/[locale]/blog">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("BlogPage");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-20 md:grid-cols-3 lg:px-8">
        {POSTS.map(({ key, hue }, i) => (
          <Reveal key={key} delay={i * 0.08}>
            <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white">
              <div className={`aspect-[16/10] bg-gradient-to-br ${hue}`} />
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded-full bg-brand-soft px-2.5 py-1 font-semibold text-brand">
                    {t(`posts.${key}.tag`)}
                  </span>
                  <span className="text-faint">{t("soon")}</span>
                </div>
                <h2 className="mt-4 flex-1 text-lg font-semibold leading-snug text-ink">{t(`posts.${key}.title`)}</h2>
                <ArrowUpRight className="mt-4 size-5 text-faint transition-colors group-hover:text-brand rtl:-scale-x-100" />
              </div>
            </article>
          </Reveal>
        ))}
      </section>
    </>
  );
}
