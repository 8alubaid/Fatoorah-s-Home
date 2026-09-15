import { getTranslations, setRequestLocale } from "next-intl/server";
import { KeyRound, Lock, ShieldCheck, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";

const ITEMS = [
  { key: "noCredentials", icon: KeyRound },
  { key: "encryption", icon: Lock },
  { key: "isolation", icon: ShieldCheck },
  { key: "delete", icon: Trash2 },
] as const;

export async function generateMetadata({ params }: PageProps<"/[locale]/security">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SecurityPage" });
  return { title: `${t("title")} · Fatoorah` };
}

export default async function SecurityPage({ params }: PageProps<"/[locale]/security">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("SecurityPage");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <section className="mx-auto grid max-w-5xl gap-5 px-5 py-20 sm:grid-cols-2 lg:px-8">
        {ITEMS.map(({ key, icon: Icon }, i) => (
          <Reveal key={key} delay={i * 0.06}>
            <div className="h-full rounded-2xl border border-line bg-white p-7">
              <span className="grid size-12 place-items-center rounded-xl bg-brand-soft text-brand">
                <Icon className="size-6" />
              </span>
              <h2 className="mt-5 text-lg font-semibold text-ink">{t(`items.${key}.title`)}</h2>
              <p className="mt-2 leading-relaxed text-muted">{t(`items.${key}.desc`)}</p>
            </div>
          </Reveal>
        ))}
      </section>
    </>
  );
}
