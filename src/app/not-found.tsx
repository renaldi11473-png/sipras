import Link from "next/link";
import { Compass } from "lucide-react";
import { LogoMark } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-cream-50 px-6 py-16">
      <div className="panel w-full max-w-md p-8 text-center">
        <div className="flex justify-center">
          <LogoMark className="h-12 w-12" />
        </div>
        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
          Halaman tidak ditemukan
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-brand-950">
          404
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-brand-900/60">
          Data atau halaman yang Anda cari mungkin sudah dihapus atau tautannya
          keliru.
        </p>
        <Link href="/dashboard" className="btn-primary mt-6 w-full">
          <Compass className="h-4 w-4" />
          Kembali ke dashboard
        </Link>
      </div>
    </main>
  );
}
