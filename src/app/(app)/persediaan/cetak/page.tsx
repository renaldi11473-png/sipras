import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarRange, Info } from "lucide-react";
import { PrintButton } from "@/components/print-button";
import { getBukuMutasi, getPersediaanStok } from "@/lib/persediaan";
import { getLembaga } from "@/lib/data";
import { formatAngka, formatRupiah } from "@/lib/constants";

export const metadata: Metadata = { title: "Cetak Buku Persediaan" };
export const dynamic = "force-dynamic";

const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function formatTanggal(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "short" }).format(
    new Date(`${value}T00:00:00`),
  );
}

export default async function CetakBukuPersediaanPage({
  searchParams,
}: {
  searchParams: Promise<{ bulan?: string }>;
}) {
  const params = await searchParams;
  const bulan = params.bulan && /^\d{4}-\d{2}$/.test(params.bulan) ? params.bulan : "";
  const now = new Date();
  const tahun = bulan ? Number(bulan.slice(0, 4)) : now.getFullYear();
  const nomorBulan = bulan ? Number(bulan.slice(5, 7)) : now.getMonth() + 1;
  const from = bulan
    ? `${bulan}-01`
    : `${tahun}-${String(nomorBulan).padStart(2, "0")}-01`;
  const to = bulan
    ? `${bulan}-${new Date(tahun, nomorBulan, 0).getDate()}`
    : `${tahun}-${String(nomorBulan).padStart(2, "0")}-${new Date(tahun, nomorBulan, 0).getDate()}`;

  const [lembaga, rows, stok] = await Promise.all([
    getLembaga(),
    getBukuMutasi(from, to),
    getPersediaanStok(),
  ]);

  const totalMasuk = rows.filter((r) => r.jenis === "masuk").reduce((acc, r) => acc + r.jumlah, 0);
  const totalKeluar = rows.filter((r) => r.jenis === "keluar").reduce((acc, r) => acc + r.jumlah, 0);
  const totalKoreksi = rows.filter((r) => r.jenis === "koreksi").reduce((acc, r) => acc + r.jumlah, 0);
  const periodeLabel = `${NAMA_BULAN[nomorBulan - 1]} ${tahun}`;
  const kotaTanggal = `${lembaga.kota}, ${new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;

  return (
    <div className="print-shell">
      <div className="no-print">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
              Cetak Buku
            </p>
            <h1 className="font-display text-[clamp(1.6rem,2.4vw,2.1rem)] font-semibold text-brand-950">
              Buku Penerimaan &amp; Pengeluaran Persediaan
            </h1>
            <p className="mt-1 text-sm text-brand-900/60">
              Periode {periodeLabel}. Kolom saldo dihitung berurutan dari stok awal.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/persediaan" className="btn-ghost">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>
            <PrintButton label="Cetak buku" />
          </div>
        </div>

        <section className="panel mb-5 flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between">
          <form className="flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="bulan" className="label">
                Periode bulan
              </label>
              <input
                id="bulan"
                name="bulan"
                type="month"
                defaultValue={bulan}
                className="input min-w-[180px]"
              />
            </div>
            <button type="submit" className="btn-primary h-[42px]">
              <CalendarRange className="h-4 w-4" />
              Tampilkan
            </button>
          </form>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="badge bg-emerald-50 text-emerald-700 ring-emerald-200">
              Masuk {formatAngka(totalMasuk)}
            </span>
            <span className="badge bg-rose-50 text-rose-700 ring-rose-200">
              Keluar {formatAngka(totalKeluar)}
            </span>
            <span className="badge bg-brand-50 text-brand-800 ring-brand-100">
              Saldo akhir {formatAngka(stok.reduce((acc, item) => acc + item.stok, 0))} unit
            </span>
          </div>
        </section>

        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-brand-200 bg-brand-50/70 px-4 py-3 text-xs leading-relaxed text-brand-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Cetak pada kertas <strong>A4 landscape</strong> dengan opsi{" "}
            <em>background graphics</em> aktif. Menu dan filter tidak ikut tercetak.
          </p>
        </div>
      </div>

      <article className="report-card panel p-4 sm:p-8 print:p-0">
        <div className="report-sheet mx-auto w-full max-w-[1180px]">
          <header className="text-center">
            <h1 className="font-serif text-[19px] font-bold uppercase leading-tight tracking-wide text-[#1a1a1a] sm:text-[21px]">
              Buku Penerimaan dan Pengeluaran Persediaan
            </h1>
            <p className="mt-0.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#333]">
              (Buku Persediaan Barang Habis Pakai)
            </p>
          </header>

          <table className="mt-4 w-full border-collapse text-[11.5px]">
            <tbody>
              <tr>
                <th className="w-[15%] border border-[#6b6b6b] bg-[#f1eef8] px-2.5 py-1.5 text-left font-semibold">
                  Nama Lembaga
                </th>
                <td className="w-[35%] border border-[#6b6b6b] px-2.5 py-1.5">{lembaga.nama}</td>
                <th className="w-[15%] border border-[#6b6b6b] bg-[#f1eef8] px-2.5 py-1.5 text-left font-semibold">
                  Periode
                </th>
                <td className="w-[35%] border border-[#6b6b6b] px-2.5 py-1.5">{periodeLabel}</td>
              </tr>
              <tr>
                <th className="border border-[#6b6b6b] bg-[#f1eef8] px-2.5 py-1.5 text-left font-semibold">
                  Kode Lembaga
                </th>
                <td className="border border-[#6b6b6b] px-2.5 py-1.5">{lembaga.kodeLembaga}</td>
                <th className="border border-[#6b6b6b] bg-[#f1eef8] px-2.5 py-1.5 text-left font-semibold">
                  Jumlah Transaksi
                </th>
                <td className="border border-[#6b6b6b] px-2.5 py-1.5">{rows.length} transaksi</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-4 overflow-x-auto">
            <table className="report-table min-w-[880px]">
              <thead>
                <tr>
                  <th className="w-[3%]">No</th>
                  <th className="w-[8%]">Tanggal</th>
                  <th className="w-[11%]">No. Bukti</th>
                  <th className="w-[21%]">Nama Barang</th>
                  <th className="w-[5%]">Satuan</th>
                  <th className="w-[7%]">Masuk</th>
                  <th className="w-[7%]">Keluar</th>
                  <th className="w-[7%]">Saldo</th>
                  <th className="w-[12%]">Pemasok / Unit</th>
                  <th className="w-[19%]">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id} className={index % 2 === 1 ? "bg-[#faf9fc]" : ""}>
                    <td className="text-center">{index + 1}</td>
                    <td className="text-center">{formatTanggal(row.tanggal)}</td>
                    <td className="break-all font-mono text-[9.5px]">{row.noBukti || "-"}</td>
                    <td className="font-semibold">{row.nama}</td>
                    <td className="text-center">{row.satuan}</td>
                    <td className="text-right tabular-nums">
                      {row.jenis === "masuk" || (row.jenis === "koreksi" && row.jumlah > 0)
                        ? formatAngka(Math.abs(row.jumlah))
                        : "-"}
                    </td>
                    <td className="text-right tabular-nums">
                      {row.jenis === "keluar" || (row.jenis === "koreksi" && row.jumlah < 0)
                        ? formatAngka(Math.abs(row.jumlah))
                        : "-"}
                    </td>
                    <td className="text-right font-semibold tabular-nums">{formatAngka(row.saldo)}</td>
                    <td>{row.pihak || "-"}</td>
                    <td>{row.keterangan || "-"}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-6 text-center italic">
                      Belum ada mutasi persediaan pada periode ini.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-[#f1eef8] font-bold">
                  <td colSpan={5} className="text-right uppercase tracking-wide">
                    Jumlah
                  </td>
                  <td className="text-right tabular-nums">{formatAngka(totalMasuk)}</td>
                  <td className="text-right tabular-nums">{formatAngka(totalKeluar)}</td>
                  <td className="text-right tabular-nums">
                    {totalKoreksi !== 0 ? `${totalKoreksi > 0 ? "+" : ""}${formatAngka(totalKoreksi)}` : "-"}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-4 grid gap-3 text-[10.5px] leading-relaxed text-[#222] sm:grid-cols-2">
            <div className="rounded-sm border border-[#6b6b6b] bg-[#faf9fc] px-3 py-2">
              <p className="font-semibold">Kolom Masuk:</p>
              <p>
                Diisi dari bukti penerimaan barang (faktur/nota dinas) termasuk koreksi
                positif hasil opname. Kolom Keluar diisi dari bukti pengeluaran/permintaan
                unit pemakai.
              </p>
            </div>
            <div className="rounded-sm border border-[#6b6b6b] bg-[#faf9fc] px-3 py-2">
              <p className="font-semibold">Saldo:</p>
              <p>
                Saldo = stok awal + penerimaan − pengeluaran ± koreksi opname. Nilai
                persediaan saat ini{" "}
                <strong>{formatRupiah(stok.reduce((acc, item) => acc + item.nilaiStok, 0))}</strong>.
              </p>
            </div>
          </div>

          <div className="page-break-avoid mt-6 grid grid-cols-2 gap-6 text-[11.5px] text-[#111]">
            <div className="text-center">
              <p>Mengetahui,</p>
              <p>Kepala {lembaga.nama}</p>
              <div className="h-16" />
              <p className="font-semibold">{lembaga.kepalaSekolah || "………………………………"}</p>
              <p>NIP. {lembaga.nipKepala || "-"}</p>
            </div>
            <div className="text-center">
              <p>{kotaTanggal}</p>
              <p>Petugas Persediaan,</p>
              <div className="h-16" />
              <p className="font-semibold">{lembaga.penyusun || "………………………………"}</p>
              <p>NIP. {lembaga.nipPenyusun || "-"}</p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-[#c9c4d6] pt-2 text-[9.5px] text-[#555]">
            <span>
              {lembaga.nama} · Buku Persediaan {periodeLabel}
            </span>
            <span>SIPRAS · SMPS IT Mutiara · Halaman 1 dari 1</span>
          </div>
        </div>
      </article>
    </div>
  );
}
