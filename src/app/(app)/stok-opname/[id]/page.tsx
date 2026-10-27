import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { PrintButton } from "@/components/print-button";
import { getOpnameById } from "@/lib/persediaan";
import { getLembaga } from "@/lib/data";
import { formatAngka } from "@/lib/constants";

export const metadata: Metadata = { title: "Berita Acara Stok Opname" };
export const dynamic = "force-dynamic";

function tanggalPanjang(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(
    new Date(`${value}T00:00:00`),
  );
}

export default async function BeritaAcaraOpnamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  const [data, lembaga] = await Promise.all([getOpnameById(numericId), getLembaga()]);
  if (!data) notFound();

  const nomor = `BA-OPN/${data.tanggal.slice(0, 4)}/${String(data.id).padStart(3, "0")}`;
  const kondisi =
    data.selisih === 0
      ? "sesuai antara catatan buku persediaan dengan hasil perhitungan fisik"
      : data.selisih > 0
        ? `terdapat selisih lebih sebanyak ${formatAngka(data.selisih)} ${data.satuan}`
        : `terdapat selisih kurang sebanyak ${formatAngka(Math.abs(data.selisih))} ${data.satuan}`;

  return (
    <div className="print-shell">
      <div className="no-print mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
            Berita Acara
          </p>
          <h1 className="font-display text-[clamp(1.5rem,2.3vw,2rem)] font-semibold text-brand-950">
            BA Stok Opname — {data.nama}
          </h1>
          <p className="mt-1 text-sm text-brand-900/60">
            Tanggal {tanggalPanjang(data.tanggal)} · {nomor}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/stok-opname" className="btn-ghost">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
          <PrintButton label="Cetak berita acara" />
        </div>
      </div>

      <div className="no-print mb-4 flex items-start gap-2.5 rounded-xl border border-brand-200 bg-brand-50/70 px-4 py-3 text-xs leading-relaxed text-brand-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Cetak pada A4 portrait. Berita acara ini menjadi lampiran wajib pada laporan
          persediaan akhir periode.
        </p>
      </div>

      <article className="report-card panel p-5 sm:p-10 print:p-0">
        <div className="report-sheet mx-auto w-full max-w-[820px] text-[12px] leading-relaxed">
          <header className="border-b-2 border-[#3b2f63] pb-3 text-center">
            <h1 className="font-serif text-[18px] font-bold uppercase tracking-wide text-[#1a1a1a]">
              Berita Acara Stok Opname
            </h1>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#444]">
              {lembaga.nama}
            </p>
            <p className="mt-0.5 text-[10.5px] text-[#555]">Nomor: {nomor}</p>
          </header>

          <p className="mt-5">
            Pada hari ini, <strong>{tanggalPanjang(data.tanggal)}</strong>, telah
            dilaksanakan pemeriksaan fisik (stok opname) persediaan barang habis pakai
            pada <strong>{lembaga.nama}</strong> dengan hasil sebagai berikut:
          </p>

          <table className="report-table mt-4">
            <thead>
              <tr>
                <th className="w-[6%]">No</th>
                <th className="w-[16%]">Kode</th>
                <th className="w-[30%]">Nama Barang</th>
                <th className="w-[10%]">Kategori</th>
                <th className="w-[10%]">Stok Sistem</th>
                <th className="w-[10%]">Stok Fisik</th>
                <th className="w-[8%]">Selisih</th>
                <th className="w-[10%]">Satuan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-center">1</td>
                <td className="break-all font-mono text-[9.5px]">{data.kode}</td>
                <td className="font-semibold">{data.nama}</td>
                <td>{data.kategori}</td>
                <td className="text-right tabular-nums">{formatAngka(data.stokSistem)}</td>
                <td className="text-right tabular-nums">{formatAngka(data.stokFisik)}</td>
                <td className="text-right tabular-nums">
                  {data.selisih > 0 ? "+" : ""}
                  {formatAngka(data.selisih)}
                </td>
                <td className="text-center">{data.satuan}</td>
              </tr>
            </tbody>
          </table>

          <table className="mt-4 w-full border-collapse text-[11.5px]">
            <tbody>
              <tr>
                <th className="w-[28%] border border-[#6b6b6b] bg-[#f1eef8] px-2.5 py-1.5 text-left font-semibold">
                  Lokasi penyimpanan
                </th>
                <td className="border border-[#6b6b6b] px-2.5 py-1.5">{data.lokasi}</td>
              </tr>
              <tr>
                <th className="border border-[#6b6b6b] bg-[#f1eef8] px-2.5 py-1.5 text-left font-semibold">
                  Petugas pemeriksa
                </th>
                <td className="border border-[#6b6b6b] px-2.5 py-1.5">
                  {data.petugas || "………………………………"}
                </td>
              </tr>
              <tr>
                <th className="border border-[#6b6b6b] bg-[#f1eef8] px-2.5 py-1.5 text-left font-semibold">
                  Keterangan
                </th>
                <td className="border border-[#6b6b6b] px-2.5 py-1.5">{data.keterangan}</td>
              </tr>
            </tbody>
          </table>

          <p className="mt-5">
            Berdasarkan hasil pemeriksaan tersebut, keadaan persediaan{" "}
            <strong>{kondisi}</strong>. Selisih yang terjadi telah dicatat pada buku
            mutasi persediaan sebagai koreksi hasil opname dan menjadi dasar penyesuaian
            stok sistem.
          </p>
          <p className="mt-3">
            Demikian berita acara ini dibuat dengan sebenarnya untuk dipergunakan
            sebagaimana mestinya.
          </p>

          <div className="page-break-avoid mt-8 grid grid-cols-2 gap-6 text-center text-[11.5px]">
            <div>
              <p>{lembaga.kota}, {tanggalPanjang(data.tanggal)}</p>
              <p>Petugas Pemeriksa,</p>
              <div className="h-16" />
              <p className="font-semibold">{data.petugas || "………………………………"}</p>
              <p className="text-[10.5px] text-[#555]">NIP. -</p>
            </div>
            <div>
              <p>Mengetahui,</p>
              <p>Kepala {lembaga.nama}</p>
              <div className="h-16" />
              <p className="font-semibold">{lembaga.kepalaSekolah || "………………………………"}</p>
              <p className="text-[10.5px] text-[#555]">NIP. {lembaga.nipKepala || "-"}</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-[#c9c4d6] pt-2 text-[9.5px] text-[#555]">
            <span>SIPRAS · {lembaga.nama}</span>
            <span>BA Stok Opname · {nomor}</span>
          </div>
        </div>
      </article>
    </div>
  );
}
