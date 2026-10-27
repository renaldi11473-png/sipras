import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  Download,
  FileBarChart2,
  Filter,
  PackagePlus,
  Pencil,
  Search,
  Boxes,
  RotateCcw,
} from "lucide-react";
import { DeleteItemButton } from "@/components/delete-item-button";
import { EmptyState, KondisiBadge, PageHeading } from "@/components/ui";
import { getInventarisList, getLembaga, getTahunAnggaranList } from "@/lib/data";
import {
  KATEGORI,
  KONDISI,
  formatAngka,
  formatRupiah,
} from "@/lib/constants";

export const metadata: Metadata = { title: "Data Inventaris" };
export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  tahun?: string;
  kondisi?: string;
  kategori?: string;
  status?: string;
};

const STATUS_TEXT: Record<string, string> = {
  ditambahkan: "Barang baru berhasil ditambahkan ke register inventaris.",
  diperbarui: "Perubahan data barang berhasil disimpan.",
  dihapus: "Data barang telah dihapus dari register inventaris.",
};

export default async function InventarisListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const tahun = Number(params.tahun) || undefined;
  const filter = {
    q: params.q?.trim() || undefined,
    tahun: Number.isFinite(tahun) ? tahun : undefined,
    kondisi: params.kondisi || undefined,
    kategori: params.kategori || undefined,
  };

  const [lembaga, tahunList, data] = await Promise.all([
    getLembaga(),
    getTahunAnggaranList(),
    getInventarisList(filter),
  ]);

  const totalUnit = data.reduce((acc, item) => acc + item.jumlah, 0);
  const totalNilai = data.reduce((acc, item) => acc + item.nilai, 0);

  const exportParams = new URLSearchParams();
  if (filter.q) exportParams.set("q", filter.q);
  if (filter.tahun) exportParams.set("tahun", String(filter.tahun));
  if (filter.kondisi) exportParams.set("kondisi", filter.kondisi);
  if (filter.kategori) exportParams.set("kategori", filter.kategori);

  return (
    <div>
      <PageHeading
        eyebrow="Register Aset"
        title="Data Inventaris"
        description={`Seluruh sarana & prasarana ${lembaga.nama} yang tercatat pada register aset tingkat lembaga.`}
        actions={
          <>
            <Link href="/inventaris/baru" className="btn-primary">
              <PackagePlus className="h-4 w-4" />
              Input Barang
            </Link>
            <Link href="/laporan" className="btn-ghost">
              <FileBarChart2 className="h-4 w-4" />
              Laporan
            </Link>
          </>
        }
      />

      {params.status && STATUS_TEXT[params.status] && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{STATUS_TEXT[params.status]}</span>
        </div>
      )}

      <section className="panel mb-5 p-4 sm:p-5">
        <form className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto] md:items-end">
          <div>
            <label htmlFor="q" className="label">
              Cari barang
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-700/40" />
              <input
                id="q"
                name="q"
                defaultValue={filter.q ?? ""}
                placeholder="Nama, kode, atau ruang…"
                className="input pl-10"
              />
            </div>
          </div>
          <div>
            <label htmlFor="tahun" className="label">
              Tahun
            </label>
            <select id="tahun" name="tahun" defaultValue={filter.tahun ?? ""} className="input">
              <option value="">Semua tahun</option>
              {tahunList.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="kondisi" className="label">
              Kondisi
            </label>
            <select
              id="kondisi"
              name="kondisi"
              defaultValue={filter.kondisi ?? ""}
              className="input"
            >
              <option value="">Semua kondisi</option>
              {KONDISI.map((item) => (
                <option key={item.kode} value={item.kode}>
                  {item.label}
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
              defaultValue={filter.kategori ?? ""}
              className="input"
            >
              <option value="">Semua kategori</option>
              {KATEGORI.map((item) => (
                <option key={item.kode} value={item.label}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button type="submit" className="btn-primary h-[42px] flex-1 md:flex-none">
              <Filter className="h-4 w-4" />
              Terapkan
            </button>
            <Link
              href="/inventaris"
              className="grid h-[42px] w-[42px] place-items-center rounded-xl border border-brand-900/15 bg-white text-brand-800 transition hover:bg-brand-50"
              aria-label="Reset filter"
              title="Reset filter"
            >
              <RotateCcw className="h-4 w-4" />
            </Link>
          </div>
        </form>
      </section>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="badge bg-brand-50 text-brand-800 ring-brand-100">
            {formatAngka(data.length)} jenis
          </span>
          <span className="badge bg-brand-50 text-brand-800 ring-brand-100">
            {formatAngka(totalUnit)} unit
          </span>
          <span className="badge bg-amber-50 text-gold-600 ring-amber-100">
            {formatRupiah(totalNilai)}
          </span>
          {(filter.q || filter.tahun || filter.kondisi || filter.kategori) && (
            <span className="text-brand-900/45">· hasil filter aktif</span>
          )}
        </div>
        <a
          href={`/api/inventaris/export?${exportParams.toString()}`}
          className="btn-ghost !py-2 text-xs"
        >
          <Download className="h-3.5 w-3.5" />
          Unduh CSV
        </a>
      </div>

      <section className="panel overflow-hidden">
        {data.length === 0 ? (
          <EmptyState
            icon={<Boxes className="h-6 w-6" />}
            title="Tidak ada data ditemukan"
            description="Ubah kata kunci atau filter, maupun tambahkan barang baru ke register inventaris."
            action={
              <Link href="/inventaris/baru" className="btn-primary">
                <PackagePlus className="h-4 w-4" />
                Input Barang
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left text-sm">
              <thead>
                <tr className="border-b border-brand-900/8 bg-cream-50/70 text-[11px] uppercase tracking-[0.1em] text-brand-900/50">
                  <th className="px-4 py-3 text-center font-semibold">No</th>
                  <th className="px-4 py-3 font-semibold">Kode Barang</th>
                  <th className="px-4 py-3 font-semibold">Nama Barang</th>
                  <th className="px-4 py-3 text-right font-semibold">Jumlah</th>
                  <th className="px-4 py-3 text-center font-semibold">Tahun</th>
                  <th className="px-4 py-3 font-semibold">Sumber</th>
                  <th className="px-4 py-3 text-right font-semibold">Nilai (Rp)</th>
                  <th className="px-4 py-3 font-semibold">Lokasi</th>
                  <th className="px-4 py-3 font-semibold">Kondisi</th>
                  <th className="px-4 py-3 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-brand-900/6 align-top last:border-0 hover:bg-brand-50/40"
                  >
                    <td className="px-4 py-3.5 text-center text-brand-900/40">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-md bg-brand-50 px-2 py-1 font-mono text-[10.5px] font-medium text-brand-800 ring-1 ring-brand-100">
                        {item.kodeBarang}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/inventaris/${item.id}`}
                        className="font-semibold text-brand-950 hover:text-brand-700"
                      >
                        {item.namaBarang}
                      </Link>
                      <p className="mt-0.5 text-[11px] text-brand-900/45">
                        {item.kategori}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right text-brand-900/80">
                      {formatAngka(item.jumlah)} {item.satuan}
                    </td>
                    <td className="px-4 py-3.5 text-center text-brand-900/70">
                      {item.tahunAnggaran}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[12px] text-brand-900/70">
                        {item.sumberPerolehan}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right font-semibold text-brand-800">
                      {formatRupiah(item.nilai)}
                    </td>
                    <td className="px-4 py-3.5 text-brand-900/65">{item.lokasi}</td>
                    <td className="px-4 py-3.5">
                      <KondisiBadge kode={item.kondisi} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/inventaris/${item.id}`}
                          title={`Ubah ${item.namaBarang}`}
                          aria-label={`Ubah ${item.namaBarang}`}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-brand-900/10 bg-white text-brand-900/60 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        <DeleteItemButton id={item.id} nama={item.namaBarang} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-brand-900 text-white">
                  <td colSpan={3} className="px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.1em]">
                    Jumlah halaman ini
                  </td>
                  <td className="px-4 py-3 text-right text-[12px] font-semibold">
                    {formatAngka(totalUnit)} unit
                  </td>
                  <td colSpan={2} />
                  <td className="px-4 py-3 text-right text-[12px] font-semibold text-gold-400">
                    {formatRupiah(totalNilai)}
                  </td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
