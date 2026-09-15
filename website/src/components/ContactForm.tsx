"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Mail, Send } from "lucide-react";
import { CONTACT_EMAIL } from "@/lib/config";

// No backend yet: submitting opens the visitor's email app with the message
// pre-filled, so nothing is silently lost. Swap for a real endpoint later
// (e.g. a Route Handler that sends via Resend).
export default function ContactForm() {
  const t = useTranslations("ContactPage");
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const subject = encodeURIComponent(`Fatoorah — ${data.get("name")}`);
    const body = encodeURIComponent(`${data.get("message")}\n\n${data.get("name")} <${data.get("email")}>`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  const field =
    "mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10";

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-line bg-white p-8 shadow-sm">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-ink">
          {t("name")}
          <input name="name" required autoComplete="name" className={field} />
        </label>
        <label className="block text-sm font-medium text-ink">
          {t("email")}
          <input name="email" type="email" required autoComplete="email" className={field} dir="ltr" />
        </label>
      </div>
      <label className="mt-5 block text-sm font-medium text-ink">
        {t("message")}
        <textarea name="message" required rows={5} className={`${field} resize-y`} />
      </label>
      <button
        type="submit"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-hover"
      >
        <Send className="size-4 rtl:-scale-x-100" />
        {t("send")}
      </button>
      {sent ? <p className="mt-4 text-sm font-medium text-brand">{t("sent")}</p> : null}
      <p className="mt-8 flex items-center gap-2 border-t border-line pt-6 text-sm text-muted">
        <Mail className="size-4" />
        {t("direct")}:
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-brand hover:underline" dir="ltr">
          {CONTACT_EMAIL}
        </a>
      </p>
    </form>
  );
}
