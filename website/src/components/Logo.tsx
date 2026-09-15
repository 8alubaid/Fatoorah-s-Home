import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Logo({ className = "" }: { className?: string }) {
  const t = useTranslations("Meta");
  const name = t("title").split("—")[0].trim();
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`} aria-label={name}>
      <span className="relative block size-9 overflow-hidden rounded-[10px] border border-line bg-white shadow-sm">
        <Image src="/brand/logo-light.png" alt="" fill sizes="36px" className="object-cover" priority />
      </span>
      <span className="text-lg font-bold tracking-tight text-ink">{name}</span>
    </Link>
  );
}
