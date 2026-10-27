import type { Metadata } from "next";
import {
  Code2,
  Database,
  Download,
  Link2,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { LembagaForm, PasswordForm } from "@/components/settings-forms";
import { PageHeading } from "@/components/ui";
import { getAdminUser, getLembaga, getInventarisStats } from "@/lib/data";
import { formatAngka } from "@/lib/constants";

export const metadata: Metadata = { title: "Pengaturan" };
export const dynamic = "force-dynamic";

export default async function PengaturanPage() {
  const [lembaga, admin, stats] = await Promise.all([
    getLembaga(),
    getAdminUser(),
    getInventarisStats(),
  ]);

  return (
    <div>
      <PageHeading
        eyebrow="Pengaturan"
        title="Profil Lembaga & Akun"
        description="Atur identitas lembaga untuk kop laporan, penanda tangan, serta keamanan akun pengelola inventaris."
      />

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <LembagaForm
          initial={{
            nama: lembaga.nama,
            kodeLembaga: lembaga.kodeLembaga,
            alamat: lembaga.alamat,
            kota: lembaga.kota,
            kepalaSekolah: lembaga.kepalaSekolah,
            nipKepala: lembaga.nipKepala,
            penyusun: lembaga.penyusun,
            nipPenyusun: lembaga.nipPenyusun,
            tahunAnggaran: lembaga.tahunAnggaran,
            keadaanPer: lembaga.keadaanPer,
          }}
        />

        <div className="space-y-5">
          <section className="panel overflow-hidden">
            <div className="flex items-center gap-3 border-b border-brand-900/8 bg-brand-900 px-5 py-4 text-white">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-gold-400 ring-1 ring-white/15">
                <UserRound className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {admin?.nama ?? "Administrator"}
                </p>
                <p className="truncate text-[11px] text-brand-100/65">
                  @{admin?.username ?? "admin"} · {admin?.peran ?? "Administrator"}
                </p>
              </div>
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-300/30">
                <ShieldCheck className="h-3 w-3" /> Aktif
              </span>
            </div>

            <div className="space-y-3 p-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-brand-900/10 bg-cream-50/60 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-700/60">
                    Jenis aset
                  </p>
                  <p className="mt-1 font-display text-xl font-semibold text-brand-950">
                    {formatAngka(stats.jumlahJenis)}
                  </p>
                </div>
                <div className="rounded-xl border border-brand-900/10 bg-cream-50/60 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-700/60">
                    Total unit
                  </p>
                  <p className="mt-1 font-display text-xl font-semibold text-brand-950">
                    {formatAngka(stats.totalUnit)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-700">
                  <ShieldCheck className="h-3.5 w-3.5" /> Ubah password
                </h3>
                <PasswordForm />
              </div>
            </div>
          </section>

          <section className="panel p-5">
            <div className="flex items-start gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-50 text-gold-600 ring-1 ring-amber-100">
                <Code2 className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-display text-base font-semibold text-brand-950">
                  Ekspor Google Apps Script
                </h3>
                <p className="mt-1 text-[12px] leading-relaxed text-brand-900/55">
                  Unduh berkas <code>Code.gs</code> untuk dipasang di Google Apps
                  Script. Versi terbaru sekaligus menjadi <strong>bridge JSON</strong>{" "}
                  agar spreadsheet privat tetap bisa ditarik/dikirim dari menu
                  Sinkronisasi Sheet.
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              <a href="/api/apps-script" className="btn-ghost w-full !py-2 text-xs">
                <Download className="h-3.5 w-3.5" />
                Unduh Code.gs
              </a>
              <a href="/integrasi" className="btn-primary w-full !py-2 text-xs">
                <Link2 className="h-3.5 w-3.5" />
                Hubungkan spreadsheets
              </a>
            </div>
          </section>

          <section className="rounded-2xl border border-brand-900/10 bg-brand-50/60 p-4">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-700">
              <Database className="h-3.5 w-3.5" /> Penyimpanan data
            </p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-brand-900/60">
              Data inventaris tersimpan di PostgreSQL dan dapat disinkronkan dua
              arah dengan Google Sheets melalui menu Sinkronisasi Sheet. Lakukan
              pencadangan berkala lewat unduh CSV di halaman data inventaris.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
