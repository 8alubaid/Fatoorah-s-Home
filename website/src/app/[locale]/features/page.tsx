import { getTranslations, setRequestLocale } from "next-intl/server";
import PageHeader from "@/components/PageHeader";
import Features from "@/components/sections/Features";
import HowItWorks from "@/components/sections/HowItWorks";
import Cta from "@/components/sections/Cta";

export async function generateMetadata({ params }: PageProps<"/[locale]/features">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "FeaturesPage" });
  return { title: `${t("title")} · Fatoorah` };
}

export default async function FeaturesPage({ params }: PageProps<"/[locale]/features">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("FeaturesPage");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <Features showHeading={false} />
      <HowItWorks />
      <div className="pt-24">
        <Cta />
      </div>
    </>
  );
}
