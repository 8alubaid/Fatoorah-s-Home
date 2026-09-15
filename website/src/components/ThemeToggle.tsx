"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Moon, Sun } from "lucide-react";

// Head script that applies the saved/OS theme before paint lives in @/lib/theme.

function apply(dark: boolean) {
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
}

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const locale = useLocale();
  // null until mounted: the server can't know the theme, so render a neutral
  // placeholder rather than guess and mismatch on hydration.
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setDark(root.classList.contains("dark"));
    sync();

    // The <html> class is the single source of truth, so the desktop and
    // mobile toggles (and any future ones) always agree.
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    // Keep following the OS until the visitor makes an explicit choice.
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      try {
        if (localStorage.getItem("theme")) return;
      } catch {
        /* storage blocked: just follow the OS */
      }
      apply(e.matches);
    };
    media.addEventListener("change", onChange);

    return () => {
      observer.disconnect();
      media.removeEventListener("change", onChange);
    };
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    apply(next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* private mode: the choice just won't persist */
    }
  };

  const label =
    locale === "ar"
      ? dark
        ? "التبديل إلى الوضع الفاتح"
        : "التبديل إلى الوضع الداكن"
      : dark
        ? "Switch to light mode"
        : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-alt hover:text-ink ${className}`}
    >
      {dark === null ? (
        <span className="size-[18px]" />
      ) : dark ? (
        <Sun className="size-[18px]" />
      ) : (
        <Moon className="size-[18px]" />
      )}
    </button>
  );
}
