import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarClock,
  ClipboardSignature,
  FileBarChart2,
  HandHelping,
  Printer,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";
import { PeminjamanForm } from "@/components/peminjaman-forms";
import { PageHeading } from "@/components/ui";
import {
  getInventarisPilihan,
  getNomorBuktiPeminjaman,
  getPeminjamanList,
} from "@/lib/persediaan";
import { getLembaga } from "@/lib/data";
import { formatAngka } from "@/lib/constants";

export const metadata: Metadata = { title: "Peminjaman Barang" };
export const dynamic = "force-dynamic";

function formatTanggal(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(
    new Date(`${value}T00:00:00`),
  );
}

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  dipinjam: { label: "Dipinjam", className: "bg-amber-100 text-amber-800 ring-amber-200" },
  kembali: { label: "Dikembalikan", className: "bg-emerald-100 text-emerald-800 ring-emerald-200" },
};

export default async function PeminjamanPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; filter?: string }>;
}) {
  const params = await searchParams;
  const filter = params.filter === "dipinjam" || params.filter === "kembali" ? params.filter : undefined;
  const hariIni = new Date().toISOString().slice(0, 10);

  const [lembaga, rows, barang] = await Promise.all([
    getLembaga(),
    getPeminjamanList(filter ? { status: filter } : {}),
    getInventarisPilihan(),
  ]);
  const nomorBukti = await getNomorBuktiPeminjaman(hariIni);

  const aktif = rows.filter((row) => row.status !== "kembali");
  const terlambat = aktif.filter((row) => row.rencanaKembali < hariIni);
  const totalUnit = rows.reduce((acc, row) => acc + row.totalUnit, 0);

  return (
    <div>
      <PageHeading
        eyebrow="Berita Acara"
        title="Peminjaman Barang"
        description={`Pencatatan peminjaman sarana ${lembaga.nama} beserta berita acara serah terima dan pengembalian.`}
        actions={
          <>
            <Link href="/inventaris" className="btn-ghost">
              <FileBarChart2 className="h-4 w-4" />
              Data inventaris
            </Link>
            <Link href="/peminjaman?filter=dipinjam" className="btn-primary">
              <ClipboardSignature className="h-4 w-4" />
              Peminjaman aktif
            </Link>
          </>
        }
      />

      {params.status === "dihapus" && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Berita acara peminjaman berhasil dihapus.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total berita acara", value: formatAngka(rows.length), icon: ClipboardSignature, note: filter ? `filter: ${filter}` : "semua status" },
          { label: "Sedang dipinjam", value: formatAngka(aktif.length), icon: HandHelping, note: "belum dikembalikan" },
          { label: "Terlambat", value: formatAngka(terlambat.length), icon: TriangleAlert, note: "melewati rencana kembali" },
          { label: "Unit barang", value: formatAngka(totalUnit), icon: CalendarClock, note: "total unit dipinjam" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="panel p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700/60">
                    {card.label}
                  </p>
                  <p className="mt-2 font-display text-[23px] font-semibold leading-none tracking-tight text-brand-950">
                    {card.value}
                  </p>
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white">
                  <Icon className="h-4.5 w-4.5" />
                </span>
              </div>
              <p className="mt-3 text-[11px] text-brand-900/45">{card.note}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <section className="panel overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-900/8 px-5 py-3.5">
            <div>
              <h2 className="font-display text-base font-semibold text-brand-950">
                Daftar Berita Acara
              </h2>
              <p className="text-[11.5px] text-brand-900/50">
                Klik nomor bukti untuk melihat & mencetak BA.
              </p>
            </div>
            <div className="flex gap-1 rounded-xl bg-brand-50/80 p-1">
              {[
                { value: "", label: "Semua" },
                { value: "dipinjam", label: "Dipinjam" },
                { value: "kembali", label: "Kembali" },
              ].map((tab) => (
                <Link
                  key={tab.value || "all"}
                  href={`/peminjaman${tab.value ? `?filter=${tab.value}` : ""}`}
                  className={`rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold transition ${
                    (filter ?? "") === tab.value
                      ? "bg-white text-brand-900 shadow-sm"
                      : "text-brand-800/60 hover:text-brand-900"
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-brand-900/8 bg-cream-50/70 text-[11px] uppercase tracking-[0.1em] text-brand-900/50">
                  <th className="px-4 py-3 font-semibold">Nomor bukti</th>
                  <th className="px-4 py-3 font-semibold">Peminjam</th>
                  <th className="px-4 py-3 text-center font-semibold">Pinjam</th>
                  <th className="px-4 py-3 text-center font-semibold">Kembali</th>
                  <th className="px-4 py-3 text-right font-semibold">Item</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-center font-semibold">BA</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const badge = STATUS_STYLE[row.status] ?? STATUS_STYLE.dipinjam;
                  const late = row.status !== "kembali" && row.rencanaKembali < hariIni;
                  return (
                    <tr key={row.id} className="border-b border-brand-900/6 last:border-0 hover:bg-brand-50/40">
                      <td className="px-4 py-3">
                        <Link
                          href={`/peminjaman/${row.id}`}
                          className="font-mono text-[11px] font-semibold text-brand-800 hover:text-brand-600"
                        >
                          {row.nomorBukti}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-brand-950">{row.peminjam}</p>
                        <p className="text-[11px] text-brand-900/45">{row.unit || "—"}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-[12px] text-brand-900/65">
                        {formatTanggal(row.tanggalPinjam)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-[12px]">
                        <span className={late ? "font-semibold text-rose-600" : "text-brand-900/65"}>
                          {row.tanggalKembali
                            ? formatTanggal(row.tanggalKembali)
                            : formatTanggal(row.rencanaKembali)}
                        </span>
                        {!row.tanggalKembali && (
                          <span className="block text-[10px] text-brand-900/40">rencana</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-brand-900/70">
                        {formatAngka(row.totalUnit)}
                        <span className="block text-[10.5px] text-brand-900/40">{row.jumlahItem} jenis</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ring-1 ${badge.className}`}>{badge.label}</span>
                        {late && (
                          <span className="mt-1 block text-[10.5px] font-semibold text-rose-600">
                            Terlambat
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <Link
                            href={`/peminjaman/${row.id}`}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-brand-900/10 bg-white text-brand-900/60 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
                            title="Lihat & cetak BA"
                            aria-label={`Lihat BA ${row.nomorBukti}`}
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-brand-900/50">
                      Belum ada peminjaman tercatat. Buat berita acara lewat formulir.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {terlambat.length > 0 && (
            <div className="flex items-start gap-2.5 border-t border-amber-200 bg-amber-50/70 px-5 py-3 text-[12px] text-amber-900">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                {terlambat.length} peminjaman melewati rencana kembali. Segera hubungi
                peminjam agar barang dapat digunakan unit lain.
              </p>
            </div>
          )}
        </section>

        <section className="panel p-5">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold-500/15 text-gold-600 ring-1 ring-amber-100">
              <ClipboardSignature className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-base font-semibold text-brand-950">
                Buat BA Peminjaman
              </h2>
              <p className="text-[11.5px] text-brand-900/50">
                Pilih barang inventaris yang dipinjam
              </p>
            </div>
          </div>
          <PeminjamanForm
            barang={barang}
            nomorBukti={nomorBukti}
            defaultPetugas={lembaga.penyusun}
          />
        </section>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-900/10 bg-white px-4 py-3 text-xs text-brand-900/55">
        <span className="inline-flex items-center gap-1.5">
          <ArrowUpRight className="h-3.5 w-3.5" /> Berita acara dapat dicetak A4 dan
          ditandatangani peminjam, petugas, serta kepala sekolah.
        </span>
        <Link href="/persediaan" className="inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:text-brand-900">
          <RotateCcw className="h-3.5 w-3.5" /> Buku persediaan
        </Link>
      </div>
    </div>
  );
}
