import { getTranslations, setRequestLocale } from "next-intl/server";
import PageHeader from "@/components/PageHeader";
import Pricing from "@/components/sections/Pricing";
import Faq from "@/components/sections/Faq";

export async function generateMetadata({ params }: PageProps<"/[locale]/pricing">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pricing" });
  return { title: `${t("eyebrow")} · Fatoorah` };
}

export default async function PricingPage({ params }: PageProps<"/[locale]/pricing">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pricing");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <Pricing showHeading={false} />
      <Faq />
    </>
  );
}
