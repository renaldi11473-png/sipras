import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Info, Printer } from "lucide-react";
import { PrintButton } from "@/components/print-button";
import { PengembalianForm } from "@/components/peminjaman-forms";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { KondisiBadge } from "@/components/ui";
import { getPeminjamanDetail } from "@/lib/persediaan";
import { getLembaga } from "@/lib/data";
import { deletePeminjamanAction } from "@/actions/persediaan";

export const metadata: Metadata = { title: "Berita Acara Peminjaman" };
export const dynamic = "force-dynamic";

function tanggalPanjang(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(
    new Date(`${value}T00:00:00`),
  );
}

export default async function DetailPeminjamanPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  const [detail, lembaga] = await Promise.all([
    getPeminjamanDetail(numericId),
    getLembaga(),
  ]);
  if (!detail) notFound();

  const { header, items } = detail;
  const sudahKembali = header.status === "kembali";

  return (
    <div className="print-shell">
      <div className="no-print mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
            Berita Acara
          </p>
          <h1 className="font-display text-[clamp(1.5rem,2.3vw,2rem)] font-semibold text-brand-950">
            {header.nomorBukti}
          </h1>
          <p className="mt-1 text-sm text-brand-900/60">
            {header.peminjam}
            {header.unit ? ` · ${header.unit}` : ""} ·{" "}
            {sudahKembali ? "Sudah dikembalikan" : "Sedang dipinjam"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/peminjaman" className="btn-ghost">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
          <PrintButton label="Cetak berita acara" />
        </div>
      </div>

      {query.status === "dibuat" && (
        <div className="no-print mb-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          Berita acara berhasil dibuat. Cetak lalu minta tanda tangan peminjam.
        </div>
      )}
      {query.status === "dikembalikan" && (
        <div className="no-print mb-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          Pengembalian barang tercatat. Status berita acara diperbarui.
        </div>
      )}

      <div className="no-print mb-4 flex items-start gap-2.5 rounded-xl border border-brand-200 bg-brand-50/70 px-4 py-3 text-xs leading-relaxed text-brand-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>Cetak pada kertas A4 portrait. Bagian formulir pengembalian tidak ikut tercetak.</p>
      </div>

      <article className="report-card panel p-5 sm:p-10 print:p-0">
        <div className="report-sheet mx-auto w-full max-w-[820px] text-[12px] leading-relaxed">
          <header className="border-b-2 border-[#3b2f63] pb-3 text-center">
            <h1 className="font-serif text-[18px] font-bold uppercase tracking-wide text-[#1a1a1a]">
              Berita Acara Peminjaman Barang
            </h1>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#444]">{lembaga.nama}</p>
            <p className="mt-0.5 text-[10.5px] text-[#555]">Nomor: {header.nomorBukti}</p>
          </header>

          <p className="mt-5">
            Pada hari ini, <strong>{tanggalPanjang(header.tanggalPinjam)}</strong>, telah
            dilakukan serah terima peminjaman sarana dan prasarana milik{" "}
            <strong>{lembaga.nama}</strong> kepada:
          </p>

          <table className="mt-3 w-full border-collapse text-[11.5px]">
            <tbody>
              <tr>
                <th className="w-[26%] border border-[#6b6b6b] bg-[#f1eef8] px-2.5 py-1.5 text-left font-semibold">
                  Nama peminjam
                </th>
                <td className="border border-[#6b6b6b] px-2.5 py-1.5">{header.peminjam}</td>
              </tr>
              <tr>
                <th className="border border-[#6b6b6b] bg-[#f1eef8] px-2.5 py-1.5 text-left font-semibold">
                  Unit / kelas
                </th>
                <td className="border border-[#6b6b6b] px-2.5 py-1.5">{header.unit || "-"}</td>
              </tr>
              <tr>
                <th className="border border-[#6b6b6b] bg-[#f1eef8] px-2.5 py-1.5 text-left font-semibold">
                  Keperluan
                </th>
                <td className="border border-[#6b6b6b] px-2.5 py-1.5">{header.keperluan || "-"}</td>
              </tr>
              <tr>
                <th className="border border-[#6b6b6b] bg-[#f1eef8] px-2.5 py-1.5 text-left font-semibold">
                  Tanggal pinjam / rencana kembali
                </th>
                <td className="border border-[#6b6b6b] px-2.5 py-1.5">
                  {tanggalPanjang(header.tanggalPinjam)} s.d.{" "}
                  {tanggalPanjang(header.rencanaKembali)}
                </td>
              </tr>
            </tbody>
          </table>

          <p className="mt-4">Dengan rincian barang sebagai berikut:</p>

          <div className="mt-2 overflow-x-auto">
            <table className="report-table min-w-[520px]">
              <thead>
                <tr>
                  <th className="w-[6%]">No</th>
                  <th className="w-[46%]">Nama Barang</th>
                  <th className="w-[12%]">Jumlah</th>
                  <th className="w-[12%]">Satuan</th>
                  <th className="w-[24%]">Kondisi saat kembali</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 1 ? "bg-[#faf9fc]" : ""}>
                    <td className="text-center">{index + 1}</td>
                    <td className="font-semibold">{item.namaBarang}</td>
                    <td className="text-center">{item.jumlah}</td>
                    <td className="text-center">{item.satuan}</td>
                    <td className="text-center">
                      {item.kondisiKembali ? <KondisiBadge kode={item.kondisiKembali} /> : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4">
            Barang tersebut dipinjam untuk keperluan sebagaimana disebutkan di atas dan
            wajib dikembalikan paling lambat{" "}
            <strong>{tanggalPanjang(header.rencanaKembali)}</strong> dalam keadaan lengkap
            dan baik. Apabila terjadi kerusakan atau kehilangan, peminjam bersedia
            menggantinya sesuai ketentuan yang berlaku.
          </p>
          {sudahKembali && header.tanggalKembali && (
            <p className="mt-2 rounded-sm border border-[#6b6b6b] bg-[#f4f7f2] px-3 py-2">
              Barang telah dikembalikan pada{" "}
              <strong>{tanggalPanjang(header.tanggalKembali)}</strong> dan telah diperiksa
              oleh petugas sarana &amp; prasarana.
            </p>
          )}

          <div className="page-break-avoid mt-7 grid grid-cols-3 gap-4 text-center text-[11px]">
            <div>
              <p>Peminjam,</p>
              <div className="h-16" />
              <p className="font-semibold">{header.peminjam}</p>
              <p className="text-[10px] text-[#555]">NIP/NIS. ………………</p>
            </div>
            <div>
              <p>Petugas Sarana,</p>
              <div className="h-16" />
              <p className="font-semibold">{header.petugas || "……………………"}</p>
              <p className="text-[10px] text-[#555]">NIP. {lembaga.nipPenyusun || "-"}</p>
            </div>
            <div>
              <p>Mengetahui, Kepala</p>
              <div className="h-16" />
              <p className="font-semibold">{lembaga.kepalaSekolah || "……………………"}</p>
              <p className="text-[10px] text-[#555]">NIP. {lembaga.nipKepala || "-"}</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-[#c9c4d6] pt-2 text-[9.5px] text-[#555]">
            <span>SIPRAS · {lembaga.nama}</span>
            <span>BA Peminjaman · {header.nomorBukti}</span>
          </div>
        </div>
      </article>

      {!sudahKembali && (
        <section className="no-print panel mt-5 p-5">
          <h2 className="mb-3 font-display text-base font-semibold text-brand-950">
            Pengembalian Barang
          </h2>
          <PengembalianForm
            id={header.id}
            items={items.map((item) => ({
              id: item.id,
              namaBarang: item.namaBarang,
              jumlah: item.jumlah,
              satuan: item.satuan,
              kondisiKembali: item.kondisiKembali,
            }))}
          />
        </section>
      )}

      <div className="no-print mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-900/10 bg-white px-4 py-3">
        <p className="text-xs text-brand-900/55">
          Catatan: {header.catatan || "tidak ada catatan tambahan."}
        </p>
        <form action={deletePeminjamanAction}>
          <input type="hidden" name="id" value={header.id} />
          <ConfirmSubmit
            nama={header.nomorBukti}
            label="Hapus berita acara"
            confirmText={`Hapus berita acara ${header.nomorBukti} beserta rincian barangnya?`}
          />
        </form>
      </div>
    </div>
  );
}
