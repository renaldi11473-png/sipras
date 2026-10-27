import type { Metadata } from "next";
import Link from "next/link";
import { CalendarRange, Download, FileBarChart2, Info } from "lucide-react";
import { PrintButton } from "@/components/print-button";
import { PageHeading } from "@/components/ui";
import {
  getInventarisList,
  getLembaga,
  getTahunAnggaranList,
} from "@/lib/data";
import { formatAngka, formatRupiah, kondisiInfo } from "@/lib/constants";

export const metadata: Metadata = { title: "Laporan Inventaris" };
export const dynamic = "force-dynamic";

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ tahun?: string }>;
}) {
  const params = await searchParams;
  const tahunParam = Number(params.tahun);
  const tahunFilter = Number.isInteger(tahunParam) && tahunParam > 0 ? tahunParam : undefined;

  const [lembaga, tahunList, data] = await Promise.all([
    getLembaga(),
    getTahunAnggaranList(),
    getInventarisList(tahunFilter ? { tahun: tahunFilter } : {}),
  ]);

  const totalUnit = data.reduce((acc, item) => acc + item.jumlah, 0);
  const totalNilai = data.reduce((acc, item) => acc + item.nilai, 0);

  const labelTahun = tahunFilter
    ? String(tahunFilter)
    : tahunList.length > 1
      ? `${tahunList[tahunList.length - 1]} – ${tahunList[0]}`
      : String(tahunList[0] ?? lembaga.tahunAnggaran);

  const labelKeadaan = tahunFilter
    ? `31 Desember ${tahunFilter}`
    : lembaga.keadaanPer;

  const tanggalTandaTangan = `${lembaga.kota}, ${labelKeadaan}`;

  return (
    <div className="print-shell">
      <div className="no-print">
        <PageHeading
          eyebrow="Pelaporan"
          title="Daftar Inventaris Barang"
          description="Register aset tingkat lembaga — pratinjau di bawah sudah siap dicetak pada kertas A4 landscape atau disimpan sebagai PDF."
          actions={
            <>
              <a
                href={`/api/inventaris/export?${new URLSearchParams(
                  tahunFilter ? { tahun: String(tahunFilter) } : {},
                ).toString()}`}
                className="btn-ghost"
              >
                <Download className="h-4 w-4" />
                Unduh CSV
              </a>
              <PrintButton />
            </>
          }
        />

        <section className="panel mb-5 flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
          <form className="flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="tahun" className="label">
                Tahun anggaran laporan
              </label>
              <select
                id="tahun"
                name="tahun"
                defaultValue={tahunFilter ? String(tahunFilter) : ""}
                className="input min-w-[190px]"
              >
                <option value="">Semua tahun ({tahunList.join(", ") || "-"})</option>
                {tahunList.map((tahun) => (
                  <option key={tahun} value={tahun}>
                    Tahun {tahun}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary h-[42px]">
              <CalendarRange className="h-4 w-4" />
              Tampilkan
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="badge bg-brand-50 text-brand-800 ring-brand-100">
              <FileBarChart2 className="h-3 w-3" />
              {formatAngka(data.length)} jenis barang
            </span>
            <span className="badge bg-brand-50 text-brand-800 ring-brand-100">
              {formatAngka(totalUnit)} unit
            </span>
            <span className="badge bg-amber-50 text-gold-600 ring-amber-100">
              {formatRupiah(totalNilai)}
            </span>
          </div>
        </section>

        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-brand-200 bg-brand-50/70 px-4 py-3 text-xs leading-relaxed text-brand-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Gunakan <strong>Cetak / Simpan PDF</strong> lalu pilih ukuran{" "}
            <strong>A4 Landscape</strong> dan aktifkan <em>Background graphics</em>{" "}
            agar warna header tabel tercetak. Menu, filter, dan tombol tidak akan
            ikut tercetak.
          </p>
        </div>
      </div>

      <article className="report-card panel p-4 sm:p-8 print:p-0">
        <div className="report-sheet mx-auto w-full max-w-[1180px]">
          <header className="text-center">
            <h1 className="font-serif text-[19px] font-bold uppercase leading-tight tracking-wide text-[#1a1a1a] sm:text-[21px]">
              Daftar Inventaris Barang
            </h1>
            <p className="mt-0.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#333]">
              (Register Aset Tingkat Lembaga)
            </p>
          </header>

          <table className="mt-4 w-full border-collapse text-[11.5px]">
            <tbody>
              <tr>
                <th className="w-[15%] border border-[#6b6b6b] bg-[#f1eef8] px-2.5 py-1.5 text-left font-semibold">
                  Nama Lembaga
                </th>
                <td className="w-[35%] border border-[#6b6b6b] px-2.5 py-1.5">
                  {lembaga.nama}
                </td>
                <th className="w-[15%] border border-[#6b6b6b] bg-[#f1eef8] px-2.5 py-1.5 text-left font-semibold">
                  Tahun Anggaran
                </th>
                <td className="w-[35%] border border-[#6b6b6b] px-2.5 py-1.5">
                  {labelTahun}
                </td>
              </tr>
              <tr>
                <th className="border border-[#6b6b6b] bg-[#f1eef8] px-2.5 py-1.5 text-left font-semibold">
                  Pola Kode
                </th>
                <td className="border border-[#6b6b6b] px-2.5 py-1.5">
                  {lembaga.kodeLembaga} / Kategori / Ruang / Nomor / Tahun
                </td>
                <th className="border border-[#6b6b6b] bg-[#f1eef8] px-2.5 py-1.5 text-left font-semibold">
                  Keadaan per Tanggal
                </th>
                <td className="border border-[#6b6b6b] px-2.5 py-1.5">
                  {labelKeadaan}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-4 overflow-x-auto">
            <table className="report-table min-w-[900px]">
              <thead>
                <tr>
                  <th className="w-[3%]">No</th>
                  <th className="w-[17%]">Kode Barang</th>
                  <th className="w-[20%]">Nama Barang</th>
                  <th className="w-[4.5%]">Jml</th>
                  <th className="w-[5.5%]">Satuan</th>
                  <th className="w-[6.5%]">Tahun Anggaran</th>
                  <th className="w-[10%]">Sumber Perolehan</th>
                  <th className="w-[10%]">Nilai (Rp)</th>
                  <th className="w-[10%]">Lokasi / Ruang</th>
                  <th className="w-[5.5%]">Kondisi</th>
                  <th className="w-[8%]">Ket.</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 1 ? "bg-[#faf9fc]" : ""}>
                    <td className="text-center">{index + 1}</td>
                    <td className="break-all font-mono text-[9.5px] leading-tight">
                      {item.kodeBarang}
                    </td>
                    <td className="font-semibold">{item.namaBarang}</td>
                    <td className="text-center">{formatAngka(item.jumlah)}</td>
                    <td className="text-center">{item.satuan}</td>
                    <td className="text-center">{item.tahunAnggaran}</td>
                    <td>{item.sumberPerolehan}</td>
                    <td className="text-right tabular-nums">{formatAngka(item.nilai)}</td>
                    <td>{item.lokasi}</td>
                    <td className="text-center font-semibold">
                      {kondisiInfo(item.kondisi).kode}
                    </td>
                    <td>{item.keterangan || "-"}</td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={11} className="py-6 text-center italic">
                      Belum ada data inventaris pada tahun anggaran ini.
                    </td>
                  </tr>
                )}
              </tbody>
              {data.length > 0 && (
                <tfoot>
                  <tr className="bg-[#f1eef8] font-bold">
                    <td colSpan={3} className="text-right uppercase tracking-wide">
                      Jumlah
                    </td>
                    <td className="text-center">{formatAngka(totalUnit)}</td>
                    <td colSpan={3} />
                    <td className="text-right tabular-nums">{formatAngka(totalNilai)}</td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          <div className="mt-4 grid gap-3 text-[10.5px] leading-relaxed text-[#222] sm:grid-cols-2">
            <div className="rounded-sm border border-[#6b6b6b] bg-[#faf9fc] px-3 py-2">
              <p className="font-semibold">Sumber Perolehan:</p>
              <p>
                BOS = dana bantuan operasional sekolah; BOP = dana bantuan
                operasional pendidikan; Bantuan operasional = dana bantuan
                pemerintah/yayasan; Yayasan = pendapatan yayasan; Hibah =
                sumbangan/hibah dari pihak lain; Kantor = pengadaan kantor;
                Bantuan orang tua = iuran/sumbangan wali murid.
              </p>
            </div>
            <div className="rounded-sm border border-[#6b6b6b] bg-[#faf9fc] px-3 py-2">
              <p className="font-semibold">Kondisi:</p>
              <p>
                B = Baik; RR = Rusak Ringan; RB = Rusak Berat; TA = Tidak Ada.
                Kode pada kolom Kode Barang juga dicetak pada kartu/label yang
                ditempel di tiap barang.
              </p>
            </div>
          </div>

          <div className="page-break-avoid mt-6 grid grid-cols-2 gap-6 text-[11.5px] text-[#111]">
            <div className="text-center">
              <p>Mengetahui,</p>
              <p>Kepala {lembaga.nama}</p>
              <div className="h-16" />
              <p className="font-semibold underline decoration-white decoration-1 underline-offset-4">
                {lembaga.kepalaSekolah || "………………………………"}
              </p>
              <p>NIP. {lembaga.nipKepala || "-"}</p>
            </div>
            <div className="text-center">
              <p>{tanggalTandaTangan}</p>
              <p>Pengurus Barang / Penyusun,</p>
              <div className="h-16" />
              <p className="font-semibold underline decoration-white decoration-1 underline-offset-4">
                {lembaga.penyusun || "………………………………"}
              </p>
              <p>NIP. {lembaga.nipPenyusun || "-"}</p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-[#c9c4d6] pt-2 text-[9.5px] text-[#555]">
            <span>
              {lembaga.nama} · {lembaga.alamat || lembaga.kota}
            </span>
            <span>SIPRAS · SMPS IT Mutiara · Halaman 1 dari 1</span>
          </div>
        </div>
      </article>

      <div className="no-print mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-900/10 bg-white px-4 py-3">
        <p className="text-xs text-brand-900/55">
          Ingin mengubah isi laporan? Perbarui data inventaris terlebih dahulu.
        </p>
        <div className="flex gap-2">
          <Link href="/inventaris" className="btn-ghost !py-2 text-xs">
            Kelola data inventaris
          </Link>
          <PrintButton label="Cetak laporan" />
        </div>
      </div>
    </div>
  );
}
