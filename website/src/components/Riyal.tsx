// Saudi Riyal symbol from the official SVG (public/brand/riyal.svg), inlined so
// it inherits `currentColor` and scales with the surrounding font size. The
// U+20C0 codepoint isn't safe to type yet: many fonts still lack the glyph.
export default function Riyal({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1124.14 1256.39"
      aria-label="SAR"
      role="img"
      className={`inline-block h-[0.82em] w-auto shrink-0 fill-current align-[-0.06em] ${className}`}
    >
      <path d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z" />
      <path d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z" />
    </svg>
  );
}

export function Amount({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-[0.25em] tabular-nums ${className}`} dir="ltr">
      <Riyal />
      {value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
    </span>
  );
}
