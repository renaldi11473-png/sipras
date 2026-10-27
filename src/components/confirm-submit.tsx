"use client";

import { useFormStatus } from "react-dom";
import { Loader2, Trash2 } from "lucide-react";

export function ConfirmSubmit({
  nama,
  label = "Hapus",
  confirmText,
}: {
  nama: string;
  label?: string;
  confirmText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      title={`${label} ${nama}`}
      aria-label={`${label} ${nama}`}
      onClick={(event) => {
        if (!window.confirm(confirmText ?? `Hapus "${nama}"? Tindakan ini tidak bisa dibatalkan.`)) {
          event.preventDefault();
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-brand-900/10 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-brand-900/60 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}
