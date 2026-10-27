import type { ReactNode } from "react";
import { kondisiInfo } from "@/lib/constants";

export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-[clamp(1.7rem,2.6vw,2.3rem)] font-semibold leading-tight tracking-tight text-brand-950">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-brand-900/60">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}

export function KondisiBadge({ kode }: { kode: string }) {
  const info = kondisiInfo(kode);
  return (
    <span className={`badge ${info.warna}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${info.titik}`} />
      {info.label}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-500 ring-1 ring-brand-100">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-brand-950">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-brand-900/55">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
