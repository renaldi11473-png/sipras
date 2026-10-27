import Link from "next/link";

export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-500 via-brand-700 to-brand-900 text-white shadow-[0_10px_24px_-12px_rgba(18,48,42,0.9)] ring-1 ring-white/20 ${className}`}
    >
      <span className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-gold-400/40 blur-[1px]" />
      <svg
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        className="relative h-[62%] w-[62%]"
      >
        <path
          d="M6 8.5h7.2c1.2 0 2.3.5 2.8 1.5.5-1 1.6-1.5 2.8-1.5H26v15h-7.2c-1.2 0-2.3.5-2.8 1.5-.5-1-1.6-1.5-2.8-1.5H6v-15Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M16 10v13.5" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M9.5 13h3.5M9.5 16.5h3.5M19 13h3.5M19 16.5h3.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function Logo({
  href = "/dashboard",
  compact = false,
  dark = false,
}: {
  href?: string;
  compact?: boolean;
  dark?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400"
    >
      <LogoMark className="h-10 w-10" />
      {!compact && (
        <span className="leading-tight">
          <span
            className={`block font-display text-[17px] font-semibold tracking-tight ${dark ? "text-white" : "text-brand-950"}`}
          >
            SIPRAS
          </span>
          <span
            className={`block text-[10px] font-semibold uppercase tracking-[0.18em] ${dark ? "text-brand-200/80" : "text-brand-600/80"}`}
          >
            SMPS IT Mutiara · Register Aset
          </span>
        </span>
      )}
    </Link>
  );
}
