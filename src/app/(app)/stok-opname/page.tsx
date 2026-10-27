import type { Metadata } from "next";
import Link from "next/link";
import {
  ClipboardCheck,
  ClipboardList,
  FileSpreadsheet,
  Package,
  Printer,
  Scale,
  TriangleAlert,
} from "lucide-react";
import { OpnameForm } from "@/components/opname-form";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { PageHeading } from "@/components/ui";
import { deleteOpnameAction } from "@/actions/persediaan";
import { getOpnameList, getPersediaanStok } from "@/lib/persediaan";
import { getLembaga } from "@/lib/data";
import { formatAngka, formatRupiah } from "@/lib/constants";

export const metadata: Metadata = { title: "Stok Opname" };
export const dynamic = "force-dynamic";

function formatTanggal(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(
    new Date(`${value}T00:00:00`),
  );
}

export default async function StokOpnamePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const [items, opnames, lembaga] = await Promise.all([
    getPersediaanStok(),
    getOpnameList(),
    getLembaga(),
  ]);

  const selisihTotal = opnames.reduce((acc, row) => acc + row.selisih, 0);
  const sesuai = opnames.filter((row) => row.selisih === 0).length;
  const perluTindak = opnames.filter((row) => row.selisih !== 0).length;
  const stokMenipis = items.filter((item) => item.status !== "aman");

  return (
    <div>
      <PageHeading
        eyebrow="Pemeriksaan Fisik"
        title="Stok Opname Persediaan"
        description={`Hitung fisik barang gudang ${lembaga.nama}, bandingkan dengan catatan sistem, dan cetak berita acara opname.`}
        actions={
          <>
            <Link href="/persediaan" className="btn-ghost">
              <Package className="h-4 w-4" />
              Buku persediaan
            </Link>
            <Link href="/persediaan/cetak" className="btn-primary">
              <FileSpreadsheet className="h-4 w-4" />
              Cetak buku
            </Link>
          </>
        }
      />

      {params.status === "dihapus" && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Catatan opname berhasil dihapus.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Sesi opname", value: formatAngka(opnames.length), icon: ClipboardCheck, note: "catatan pemeriksaan" },
          { label: "Sesuai catatan", value: formatAngka(sesuai), icon: Scale, note: "selisih nol" },
          { label: "Perlu tindak lanjut", value: formatAngka(perluTindak), icon: TriangleAlert, note: `akumulasi selisih ${formatAngka(selisihTotal)}` },
          { label: "Nilai persediaan", value: formatRupiah(items.reduce((acc, item) => acc + item.nilaiStok, 0)), icon: BoxesIcon, note: `${stokMenipis.length} item menipis` },
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

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-brand-900/8 px-5 py-3.5">
            <div>
              <h2 className="font-display text-base font-semibold text-brand-950">
                Riwayat Opname
              </h2>
              <p className="text-[11.5px] text-brand-900/50">
                Setiap baris dapat dicetak sebagai berita acara.
              </p>
            </div>
            <ClipboardList className="h-4 w-4 text-brand-900/30" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-brand-900/8 bg-cream-50/70 text-[11px] uppercase tracking-[0.1em] text-brand-900/50">
                  <th className="px-4 py-3 font-semibold">Tanggal</th>
                  <th className="px-4 py-3 font-semibold">Barang</th>
                  <th className="px-4 py-3 text-right font-semibold">Sistem</th>
                  <th className="px-4 py-3 text-right font-semibold">Fisik</th>
                  <th className="px-4 py-3 text-right font-semibold">Selisih</th>
                  <th className="px-4 py-3 font-semibold">Petugas</th>
                  <th className="px-4 py-3 font-semibold">Keterangan</th>
                  <th className="px-4 py-3 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {opnames.map((row) => (
                  <tr key={row.id} className="border-b border-brand-900/6 last:border-0 hover:bg-brand-50/40">
                    <td className="whitespace-nowrap px-4 py-3 text-brand-900/70">
                      {formatTanggal(row.tanggal)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-brand-950">{row.nama}</p>
                      <p className="text-[11px] text-brand-900/45">{row.satuan}</p>
                    </td>
                    <td className="px-4 py-3 text-right text-brand-900/65">{formatAngka(row.stokSistem)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-brand-900">
                      {formatAngka(row.stokFisik)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`badge ring-1 ${
                          row.selisih === 0
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                            : "bg-amber-50 text-amber-800 ring-amber-200"
                        }`}
                      >
                        {row.selisih > 0 ? "+" : ""}
                        {formatAngka(row.selisih)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-brand-900/65">{row.petugas || "—"}</td>
                    <td className="max-w-[240px] px-4 py-3 text-[12px] text-brand-900/55">{row.keterangan}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/stok-opname/${row.id}`}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-brand-900/10 bg-white text-brand-900/60 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
                          title="Cetak berita acara"
                          aria-label={`Cetak berita acara ${row.nama}`}
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </Link>
                        <form action={deleteOpnameAction}>
                          <input type="hidden" name="id" value={row.id} />
                          <ConfirmSubmit
                            nama={`opname ${row.nama}`}
                            label="Hapus"
                            confirmText={`Hapus catatan opname "${row.nama}" tanggal ${row.tanggal}?`}
                          />
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
                {opnames.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-brand-900/50">
                      Belum ada pemeriksaan fisik. Mulai dari formulir di samping.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="space-y-5">
          <section className="panel p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                <ClipboardCheck className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-display text-base font-semibold text-brand-950">
                  Formulir Opname
                </h2>
                <p className="text-[11.5px] text-brand-900/50">
                  Masukkan hasil hitung fisik
                </p>
              </div>
            </div>
            <OpnameForm items={items} defaultPetugas={lembaga.penyusun} />
          </section>

          {stokMenipis.length > 0 && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-gold-600">
                <TriangleAlert className="h-3.5 w-3.5" /> Stok di bawah minimum
              </p>
              <ul className="mt-2 space-y-1 text-[12px] text-brand-900/70">
                {stokMenipis.slice(0, 6).map((item) => (
                  <li key={item.id} className="flex justify-between gap-2">
                    <span className="truncate">{item.nama}</span>
                    <span className="shrink-0 font-semibold">
                      {formatAngka(item.stok)} {item.satuan}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function BoxesIcon({ className }: { className?: string }) {
  return <Package className={className} />;
}
