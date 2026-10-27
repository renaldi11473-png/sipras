"use client";

import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";
import { deleteInventarisAction } from "@/actions/inventaris";

function SubmitIcon({ nama }: { nama: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      title={`Hapus ${nama}`}
      aria-label={`Hapus ${nama}`}
      onClick={(event) => {
        if (!window.confirm(`Hapus "${nama}" dari daftar inventaris?`)) {
          event.preventDefault();
        }
      }}
      className="grid h-8 w-8 place-items-center rounded-lg border border-brand-900/10 bg-white text-brand-900/50 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}

export function DeleteItemButton({ id, nama }: { id: number; nama: string }) {
  return (
    <form action={deleteInventarisAction}>
      <input type="hidden" name="id" value={id} />
      <SubmitIcon nama={nama} />
    </form>
  );
}
