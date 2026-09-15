import Reveal from "./Reveal";

export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-surface">
      <div aria-hidden className="pointer-events-none absolute -top-32 start-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(67,181,129,0.18),transparent)] rtl:translate-x-1/2" />
      <Reveal className="relative mx-auto max-w-3xl px-5 py-20 text-center lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">{title}</h1>
        {subtitle ? <p className="mt-5 text-lg leading-relaxed text-muted">{subtitle}</p> : null}
      </Reveal>
    </section>
  );
}
