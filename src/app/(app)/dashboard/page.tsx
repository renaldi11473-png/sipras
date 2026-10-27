import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Boxes,
  ClipboardCheck,
  ClipboardSignature,
  FileSpreadsheet,
  CalendarDays,
  FileBarChart2,
  Layers,
  PackagePlus,
  ShieldCheck,
  Sparkles,
  Store,
  Wallet,
} from "lucide-react";
import { KondisiBadge, PageHeading } from "@/components/ui";
import { requireSession } from "@/lib/auth";
import {
  getInventarisStats,
  getInventarisTerbaru,
  getLembaga,
} from "@/lib/data";
import { getSheetConfig } from "@/lib/sheets-config";
import { getModulStats } from "@/lib/persediaan";
import { formatAngka, formatRupiah, kondisiInfo } from "@/lib/constants";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [session, lembaga, stats, terbaru, sheet, modul] = await Promise.all([
    requireSession(),
    getLembaga(),
    getInventarisStats(),
    getInventarisTerbaru(5),
    getSheetConfig(),
    getModulStats(),
  ]);

  const baik = stats.perKondisi.find((item) => item.kode === "B")?.jumlah ?? 0;
  const persenBaik =
    stats.jumlahJenis > 0 ? Math.round((baik / stats.jumlahJenis) * 100) : 0;

  const kartu = [
    {
      label: "Jenis Barang",
      value: formatAngka(stats.jumlahJenis),
      detail: "item tercatat di register",
      icon: Boxes,
      accent: "from-brand-600 to-brand-800",
      chip: "text-brand-700 bg-brand-50 ring-brand-100",
    },
    {
      label: "Total Unit",
      value: formatAngka(stats.totalUnit),
      detail: "unit sarana & prasarana",
      icon: Layers,
      accent: "from-gold-500 to-gold-600",
      chip: "text-gold-600 bg-amber-50 ring-amber-100",
    },
    {
      label: "Nilai Aset",
      value: formatRupiah(stats.totalNilai),
      detail: `rata-rata ${formatRupiah(stats.nilaiRataRata)}/item`,
      icon: Wallet,
      accent: "from-brand-500 to-brand-700",
      chip: "text-brand-700 bg-brand-50 ring-brand-100",
    },
    {
      label: "Kondisi Baik",
      value: `${persenBaik}%`,
      detail: `${baik} dari ${stats.jumlahJenis} jenis barang`,
      icon: ShieldCheck,
      accent: "from-emerald-500 to-brand-700",
      chip: "text-emerald-700 bg-emerald-50 ring-emerald-100",
    },
  ];

  const tahunTerbesar = Math.max(
    1,
    ...stats.perTahun.map((item) => item.nilai),
  );

  return (
    <div>
      <PageHeading
        eyebrow="Ringkasan"
        title={`Halo, ${session.nama.split(" ")[0]} 👋`}
        description={`Berikut ringkasan sarana & prasarana ${lembaga.nama}. Data tersaji otomatis dari input inventaris terbaru.`}
        actions={
          <>
            <Link href="/inventaris/baru" className="btn-primary">
              <PackagePlus className="h-4 w-4" />
              Input Barang
            </Link>
            <Link href="/laporan" className="btn-ghost">
              <FileBarChart2 className="h-4 w-4" />
              Lihat Laporan
            </Link>
          </>
        }
      />

      <section className="mb-5 flex flex-col gap-3 rounded-2xl border border-brand-900/10 bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(18,48,42,0.04)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            <FileSpreadsheet className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700/70">
              Database Google Sheets
            </p>
            <p className="mt-0.5 text-[12.5px] text-brand-900/65">
              {sheet.lastSyncAt
                ? `Tersinkron ${new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(sheet.lastSyncAt)} · ${sheet.lastSyncCount} baris dari sheet`
                : "Belum disinkronkan — hubungkan spreadsheet untuk menarik data inventaris."}
            </p>
          </div>
        </div>
        <Link href="/integrasi" className="btn-ghost !py-2 text-xs">
          Kelola sinkronisasi
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kartu.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="panel group relative overflow-hidden p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700/60">
                    {item.label}
                  </p>
                  <p className="mt-2 font-display text-[26px] font-semibold leading-none tracking-tight text-brand-950">
                    {item.value}
                  </p>
                </div>
                <span
                  className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm ${item.accent}`}
                >
                  <Icon className="h-4.5 w-4.5" strokeWidth={2.1} />
                </span>
              </div>
              <p className={`mt-4 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${item.chip}`}>
                {item.detail}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-brand-900/8 px-5 py-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-brand-950">
                Rekap per Tahun Anggaran
              </h2>
              <p className="text-xs text-brand-900/50">
                Perbandingan jumlah unit dan nilai aset
              </p>
            </div>
            <Link
              href="/inventaris"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-900"
            >
              Semua data <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2">
            {stats.perTahun.length === 0 && (
              <p className="text-sm text-brand-900/50">Belum ada data inventaris.</p>
            )}
            {stats.perTahun.map((item) => (
              <Link
                key={item.tahun}
                href={`/laporan?tahun=${item.tahun}`}
                className="group rounded-2xl border border-brand-900/10 bg-gradient-to-br from-cream-50 to-white p-4 transition hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-900 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white">
                    <CalendarDays className="h-3 w-3" />
                    {item.tahun}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-brand-900/30 transition group-hover:text-brand-700" />
                </div>
                <p className="mt-3 font-display text-2xl font-semibold text-brand-950">
                  {formatAngka(item.unit)}
                  <span className="ml-1 text-xs font-medium text-brand-900/45">
                    unit / {item.jenis} jenis
                  </span>
                </p>
                <p className="mt-0.5 text-sm font-semibold text-brand-700">
                  {formatRupiah(item.nilai)}
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-brand-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-gold-500"
                    style={{
                      width: `${Math.max(8, Math.round((item.nilai / tahunTerbesar) * 100))}%`,
                    }}
                  />
                </div>
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-brand-900/8 bg-cream-50/60 px-5 py-3.5">
            <Sparkles className="h-4 w-4 text-gold-600" />
            <p className="text-xs text-brand-900/60">
              Kategori buku mendominasi koleksi lembaga — {formatAngka(stats.buku)}{" "}
              jenis buku &amp; literasi tercatat.
            </p>
          </div>
        </section>

        <section className="panel p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-brand-950">
                Kondisi Barang
              </h2>
              <p className="text-xs text-brand-900/50">Status seluruh inventaris</p>
            </div>
            <Link
              href="/inventaris"
              className="rounded-lg p-1.5 text-brand-700 transition hover:bg-brand-50"
              aria-label="Kelola data"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {["B", "RR", "RB", "TA"].map((kode) => {
              const info = kondisiInfo(kode);
              const jumlah =
                stats.perKondisi.find((item) => item.kode === kode)?.jumlah ?? 0;
              const persen =
                stats.jumlahJenis > 0
                  ? Math.round((jumlah / stats.jumlahJenis) * 100)
                  : 0;
              return (
                <div key={kode}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-medium text-brand-900/75">
                      <span className={`h-2 w-2 rounded-full ${info.titik}`} />
                      {info.label}
                    </span>
                    <span className="font-semibold text-brand-900/60">
                      {jumlah} · {persen}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-brand-50">
                    <div
                      className={`h-full rounded-full ${info.titik}`}
                      style={{ width: `${Math.max(jumlah > 0 ? 4 : 0, persen)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-xl bg-brand-900 p-4 text-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold-400">
              Pengingat
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-brand-100/85">
              Perbarui kondisi barang rusak sebelum laporan akhir tahun dicetak.
            </p>
            <Link
              href="/inventaris?kondisi=RB"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-gold-400 hover:text-gold-300"
            >
              Tinjau barang rusak <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </div>

      <section className="mt-6">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-brand-950">
              Buku &amp; Sirkulasi
            </h2>
            <p className="text-xs text-brand-900/50">
              Empat buku wajib pengelolaan sarana &amp; prasarana
            </p>
          </div>
          <Link
            href="/panduan"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-900"
          >
            Panduan <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              href: "/buku-inventaris",
              label: "Buku Inventaris",
              value: `${formatAngka(stats.jumlahJenis)} jenis`,
              note: `${formatRupiah(stats.totalNilai)} nilai aset`,
              icon: BookOpen,
            },
            {
              href: "/persediaan",
              label: "Buku Persediaan",
              value: `${formatAngka(modul.persediaan.totalUnit)} unit`,
              note: `${modul.persediaan.jenis} jenis · ${modul.persediaan.menipis} perlu restock`,
              icon: Store,
            },
            {
              href: "/stok-opname",
              label: "Stok Opname",
              value: `${formatAngka(modul.opname.jumlah)} sesi`,
              note: modul.opname.terakhir
                ? `terakhir ${modul.opname.terakhir.tanggal}`
                : "belum ada pemeriksaan",
              icon: ClipboardCheck,
            },
            {
              href: "/peminjaman",
              label: "Peminjaman Barang",
              value: `${formatAngka(modul.peminjaman.aktif)} aktif`,
              note: `${formatAngka(modul.peminjaman.jumlah)} berita acara`,
              icon: ClipboardSignature,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group panel flex items-start gap-3 p-4 transition hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-md"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-900 text-gold-400">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-700/60">
                    {item.label}
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold leading-none text-brand-950">
                    {item.value}
                  </p>
                  <p className="mt-1 truncate text-[11px] text-brand-900/45">{item.note}</p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-brand-900/25 transition group-hover:translate-x-0.5 group-hover:text-brand-700" />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="panel mt-5 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-900/8 px-5 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-brand-950">
              Barang Terbaru
            </h2>
            <p className="text-xs text-brand-900/50">
              5 data inventaris yang terakhir diinput
            </p>
          </div>
          <Link href="/inventaris" className="btn-ghost !py-2 text-xs">
            Lihat semua data
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-brand-900/8 bg-cream-50/70 text-[11px] uppercase tracking-[0.1em] text-brand-900/50">
                <th className="px-5 py-3 font-semibold">Nama Barang</th>
                <th className="px-4 py-3 font-semibold">Tahun</th>
                <th className="px-4 py-3 text-right font-semibold">Jumlah</th>
                <th className="px-4 py-3 text-right font-semibold">Nilai</th>
                <th className="px-4 py-3 font-semibold">Kondisi</th>
                <th className="px-5 py-3 font-semibold">Lokasi</th>
              </tr>
            </thead>
            <tbody>
              {terbaru.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-brand-900/6 last:border-0 hover:bg-brand-50/40"
                >
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/inventaris/${item.id}`}
                      className="font-semibold text-brand-950 hover:text-brand-700"
                    >
                      {item.namaBarang}
                    </Link>
                    <p className="mt-0.5 font-mono text-[10.5px] text-brand-900/40">
                      {item.kodeBarang}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 text-brand-900/70">{item.tahunAnggaran}</td>
                  <td className="px-4 py-3.5 text-right font-medium text-brand-900/80">
                    {formatAngka(item.jumlah)} {item.satuan}
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold text-brand-800">
                    {formatRupiah(item.nilai)}
                  </td>
                  <td className="px-4 py-3.5">
                    <KondisiBadge kode={item.kondisi} />
                  </td>
                  <td className="px-5 py-3.5 text-brand-900/65">{item.lokasi}</td>
                </tr>
              ))}
              {terbaru.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-brand-900/50">
                    Belum ada data. Mulai dengan menambahkan barang inventaris.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
