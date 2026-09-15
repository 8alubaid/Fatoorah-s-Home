"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { BellRing, ChartPie, ChevronDown, FileText, Globe, Menu, PiggyBank, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { APP_URL } from "@/lib/config";

const FEATURE_ITEMS = [
  { key: "import", icon: FileText },
  { key: "insights", icon: ChartPie },
  { key: "subscriptions", icon: BellRing },
  { key: "budgets", icon: PiggyBank },
] as const;

const LINKS = [
  { key: "pricing", href: "/pricing" },
  { key: "security", href: "/security" },
  { key: "blog", href: "/blog" },
  { key: "contact", href: "/contact" },
] as const;

export default function Navbar() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus when the route changes. Adjusting state during render (rather
  // than in an effect) avoids an extra cascading render.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setFeaturesOpen(false);
    setMobileOpen(false);
  }

  // ...and on outside click / Escape.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setFeaturesOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFeaturesOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const otherLocale = locale === "ar" ? "en" : "ar";
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`relative px-3 py-2 text-[15px] font-medium transition-colors ${
        isActive(href) ? "text-brand" : "text-ink/80 hover:text-ink"
      }`}
    >
      {label}
      {isActive(href) ? (
        <motion.span layoutId="nav-underline" className="absolute inset-x-3 -bottom-[17px] h-[3px] rounded-full bg-brand" />
      ) : null}
    </Link>
  );

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-line bg-surface/80 backdrop-blur-xl" : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 lg:px-8">
        <Logo />

        <div className="hidden items-center gap-1 lg:flex">
          {navLink("/", locale === "ar" ? "الرئيسية" : "Home")}

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setFeaturesOpen((o) => !o)}
              aria-expanded={featuresOpen}
              aria-haspopup="true"
              className={`flex items-center gap-1 px-3 py-2 text-[15px] font-medium transition-colors ${
                isActive("/features") ? "text-brand" : "text-ink/80 hover:text-ink"
              }`}
            >
              {t("features")}
              <ChevronDown className={`size-4 transition-transform ${featuresOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {featuresOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute start-0 top-full mt-3 w-[420px] rounded-2xl border border-line bg-surface p-2 shadow-xl shadow-black/5"
                >
                  {FEATURE_ITEMS.map(({ key, icon: Icon }) => (
                    <Link
                      key={key}
                      href={`/features#${key}`}
                      className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-surface-alt"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                        <Icon className="size-5" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-ink">{t(`featureItems.${key}.title`)}</span>
                        <span className="mt-0.5 block text-[13px] leading-snug text-muted">
                          {t(`featureItems.${key}.desc`)}
                        </span>
                      </span>
                    </Link>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {LINKS.map(({ key, href }) => (
            <span key={key}>{navLink(href, t(key))}</span>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <Link
            href={pathname}
            locale={otherLocale}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-alt hover:text-ink"
          >
            <Globe className="size-4" />
            {t("language")}
          </Link>
          <a href={APP_URL} className="rounded-lg px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-alt">
            {t("signIn")}
          </a>
          <a
            href={APP_URL}
            className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-on-brand shadow-sm shadow-brand/30 transition-all hover:-translate-y-px hover:bg-brand-hover"
          >
            {t("getStarted")}
          </a>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="grid size-10 place-items-center rounded-lg text-ink hover:bg-surface-alt"
            aria-label={t("menu")}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-line bg-surface lg:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              <Link href="/features" className="rounded-lg px-3 py-3 font-medium text-ink hover:bg-surface-alt">
                {t("features")}
              </Link>
              {LINKS.map(({ key, href }) => (
                <Link key={key} href={href} className="rounded-lg px-3 py-3 font-medium text-ink hover:bg-surface-alt">
                  {t(key)}
                </Link>
              ))}
              <Link href={pathname} locale={otherLocale} className="flex items-center gap-2 rounded-lg px-3 py-3 font-medium text-muted hover:bg-surface-alt">
                <Globe className="size-4" />
                {t("language")}
              </Link>
              <a href={APP_URL} className="mt-2 rounded-xl bg-brand px-4 py-3 text-center font-semibold text-on-brand">
                {t("getStarted")}
              </a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
