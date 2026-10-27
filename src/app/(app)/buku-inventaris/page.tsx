import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Filter, Info, PackageCheck, RotateCcw } from "lucide-react";
import { PrintButton } from "@/components/print-button";
import { PageHeading } from "@/components/ui";
import { getInventarisList, getLembaga, getTahunAnggaranList } from "@/lib/data";
import { KATEGORI, formatAngka, formatRupiah, kondisiInfo } from "@/lib/constants";

export const metadata: Metadata = { title: "Buku Inventaris" };
export const dynamic = "force-dynamic";

export default async function BukuInventarisPage({
  searchParams,
}: {
  searchParams: Promise<{ tahun?: string; kategori?: string }>;
}) {
  const params = await searchParams;
  const tahun = Number(params.tahun) || undefined;
  const kategori = KATEGORI.some((item) => item.label === params.kategori)
    ? params.kategori
    : undefined;

  const [lembaga, tahunList, data] = await Promise.all([
    getLembaga(),
    getTahunAnggaranList(),
    getInventarisList({ tahun, kategori }),
  ]);

  const grup = new Map<string, typeof data>();
  for (const item of data) {
    const list = grup.get(item.kategori) ?? [];
    list.push(item);
    grup.set(item.kategori, list);
  }
  const grupUrut = [...grup.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  const totalUnit = data.reduce((acc, item) => acc + item.jumlah, 0);
  const totalNilai = data.reduce((acc, item) => acc + item.nilai, 0);
  const labelTahun = tahun ? String(tahun) : "Semua tahun";
  const kotaTanggal = `${lembaga.kota}, ${
    tahun ? `31 Desember ${tahun}` : lembaga.keadaanPer
  }`;

  return (
    <div className="print-shell">
      <div className="no-print">
        <PageHeading
          eyebrow="Buku Wajib"
          title="Buku Inventaris"
          description={`Buku inventaris sarana & prasarana ${lembaga.nama}, dikelompokkan per kategori dengan subtotal unit dan nilai aset.`}
          actions={
            <>
              <Link href="/inventaris" className="btn-ghost">
                <PackageCheck className="h-4 w-4" />
                Data inventaris
              </Link>
              <PrintButton label="Cetak buku inventaris" />
            </>
          }
        />

        <section className="panel mb-5 flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between">
          <form className="flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="tahun" className="label">
                Tahun anggaran
              </label>
              <select id="tahun" name="tahun" defaultValue={tahun ?? ""} className="input min-w-[160px]">
                <option value="">Semua tahun</option>
                {tahunList.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="kategori" className="label">
                Kategori
              </label>
              <select
                id="kategori"
                name="kategori"
                defaultValue={kategori ?? ""}
                className="input min-w-[180px]"
              >
                <option value="">Semua kategori</option>
                {KATEGORI.map((item) => (
                  <option key={item.kode} value={item.label}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary h-[42px]">
              <Filter className="h-4 w-4" />
              Terapkan
            </button>
            {(tahun || kategori) && (
              <Link
                href="/buku-inventaris"
                className="grid h-[42px] w-[42px] place-items-center rounded-xl border border-brand-900/15 bg-white text-brand-800"
                aria-label="Reset filter"
              >
                <RotateCcw className="h-4 w-4" />
              </Link>
            )}
          </form>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="badge bg-brand-50 text-brand-800 ring-brand-100">
              {formatAngka(data.length)} jenis
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
            Buku inventaris dicetak A4 landscape. Setiap kategori memperoleh subtotal dan
            blok pengesahan pada akhir halaman.
          </p>
        </div>
      </div>

      <article className="report-card panel p-4 sm:p-8 print:p-0">
        <div className="report-sheet mx-auto w-full max-w-[1180px]">
          <header className="text-center">
            <h1 className="font-serif text-[19px] font-bold uppercase leading-tight tracking-wide text-[#1a1a1a] sm:text-[21px]">
              Buku Inventaris
            </h1>
            <p className="mt-0.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#333]">
              Sarana dan Prasarana {lembaga.nama}
            </p>
          </header>

          <table className="mt-4 w-full border-collapse text-[11.5px]">
            <tbody>
              <tr>
                <th className="w-[16%] border border-[#6b6b6b] bg-[#f1eef8] px-2.5 py-1.5 text-left font-semibold">
                  Nama Lembaga
                </th>
                <td className="w-[34%] border border-[#6b6b6b] px-2.5 py-1.5">{lembaga.nama}</td>
                <th className="w-[16%] border border-[#6b6b6b] bg-[#f1eef8] px-2.5 py-1.5 text-left font-semibold">
                  Tahun Anggaran
                </th>
                <td className="w-[34%] border border-[#6b6b6b] px-2.5 py-1.5">{labelTahun}</td>
              </tr>
              <tr>
                <th className="border border-[#6b6b6b] bg-[#f1eef8] px-2.5 py-1.5 text-left font-semibold">
                  Kode Lembaga
                </th>
                <td className="border border-[#6b6b6b] px-2.5 py-1.5">{lembaga.kodeLembaga}</td>
                <th className="border border-[#6b6b6b] bg-[#f1eef8] px-2.5 py-1.5 text-left font-semibold">
                  Keadaan per Tanggal
                </th>
                <td className="border border-[#6b6b6b] px-2.5 py-1.5">
                  {tahun ? `31 Desember ${tahun}` : lembaga.keadaanPer}
                </td>
              </tr>
            </tbody>
          </table>

          {grupUrut.length === 0 && (
            <p className="mt-6 rounded-sm border border-[#6b6b6b] px-3 py-6 text-center text-[12px] italic">
              Belum ada data inventaris untuk filter ini.
            </p>
          )}

          {grupUrut.map(([namaKategori, items], groupIndex) => {
            const subtotalUnit = items.reduce((acc, item) => acc + item.jumlah, 0);
            const subtotalNilai = items.reduce((acc, item) => acc + item.nilai, 0);
            return (
              <div key={namaKategori} className="page-break-avoid mt-5">
                <p className="mb-1.5 inline-flex items-center gap-1.5 rounded-sm bg-[#3b2f63] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-white">
                  <BookOpen className="h-3 w-3" />
                  {String.fromCharCode(65 + groupIndex)}. {namaKategori}
                </p>
                <div className="overflow-x-auto">
                  <table className="report-table min-w-[860px]">
                    <thead>
                      <tr>
                        <th className="w-[3%]">No</th>
                        <th className="w-[17%]">Kode Barang</th>
                        <th className="w-[24%]">Nama Barang</th>
                        <th className="w-[5%]">Jml</th>
                        <th className="w-[6%]">Satuan</th>
                        <th className="w-[7%]">Tahun</th>
                        <th className="w-[10%]">Sumber</th>
                        <th className="w-[10%]">Nilai (Rp)</th>
                        <th className="w-[10%]">Lokasi</th>
                        <th className="w-[4%]">Kon</th>
                        <th className="w-[9%]">Ket.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
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
                          <td className="text-center">{kondisiInfo(item.kondisi).kode}</td>
                          <td>{item.keterangan || "-"}</td>
                        </tr>
                      ))}
                      <tr className="bg-[#f1eef8] font-bold">
                        <td colSpan={3} className="text-right uppercase">
                          Subtotal {namaKategori}
                        </td>
                        <td className="text-center">{formatAngka(subtotalUnit)}</td>
                        <td colSpan={3} />
                        <td className="text-right tabular-nums">{formatAngka(subtotalNilai)}</td>
                        <td colSpan={3} />
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          <div className="page-break-avoid mt-5">
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[#3b2f63]">
              Rekapitulasi
            </p>
            <table className="report-table min-w-[420px]">
              <thead>
                <tr>
                  <th className="w-[6%]">No</th>
                  <th>Kategori</th>
                  <th className="w-[14%]">Jenis</th>
                  <th className="w-[16%]">Unit</th>
                  <th className="w-[22%]">Nilai (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {grupUrut.map(([namaKategori, items], index) => (
                  <tr key={`rekap-${namaKategori}`}>
                    <td className="text-center">{index + 1}</td>
                    <td>{namaKategori}</td>
                    <td className="text-center">{items.length}</td>
                    <td className="text-center">{formatAngka(items.reduce((acc, item) => acc + item.jumlah, 0))}</td>
                    <td className="text-right tabular-nums">
                      {formatAngka(items.reduce((acc, item) => acc + item.nilai, 0))}
                    </td>
                  </tr>
                ))}
                <tr className="bg-[#f1eef8] font-bold">
                  <td colSpan={2} className="text-right uppercase">
                    Jumlah
                  </td>
                  <td className="text-center">{data.length}</td>
                  <td className="text-center">{formatAngka(totalUnit)}</td>
                  <td className="text-right tabular-nums">{formatAngka(totalNilai)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-3 rounded-sm border border-[#6b6b6b] bg-[#faf9fc] px-3 py-2 text-[10.5px] leading-relaxed text-[#222]">
            <p className="font-semibold">Keterangan kondisi:</p>
            <p>
              B = Baik; RR = Rusak Ringan; RB = Rusak Berat; TA = Tidak Ada. Nilai aset
              dicatat dalam rupiah sesuai bukti perolehan dan menjadi dasar penyusutan
              pada laporan keuangan lembaga.
            </p>
          </div>

          <div className="page-break-avoid mt-6 grid grid-cols-2 gap-6 text-center text-[11.5px] text-[#111]">
            <div>
              <p>Mengetahui,</p>
              <p>Kepala {lembaga.nama}</p>
              <div className="h-16" />
              <p className="font-semibold">{lembaga.kepalaSekolah || "………………………………"}</p>
              <p>NIP. {lembaga.nipKepala || "-"}</p>
            </div>
            <div>
              <p>{kotaTanggal}</p>
              <p>Petugas Inventaris,</p>
              <div className="h-16" />
              <p className="font-semibold">{lembaga.penyusun || "………………………………"}</p>
              <p>NIP. {lembaga.nipPenyusun || "-"}</p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-[#c9c4d6] pt-2 text-[9.5px] text-[#555]">
            <span>Buku Inventaris · {lembaga.nama}</span>
            <span>SIPRAS · SMPS IT Mutiara</span>
          </div>
        </div>
      </article>
    </div>
  );
}
