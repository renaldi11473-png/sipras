import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Boxes,
  ClipboardCheck,
  Package,
  PackagePlus,
  Printer,
  RotateCcw,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { MutasiForm, PersediaanForm } from "@/components/persediaan-forms";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { PageHeading } from "@/components/ui";
import { deleteMutasiAction, deletePersediaanAction } from "@/actions/persediaan";
import { getMutasiList, getPersediaanStok } from "@/lib/persediaan";
import { getLembaga } from "@/lib/data";
import { formatAngka, formatRupiah } from "@/lib/constants";

export const metadata: Metadata = { title: "Buku Persediaan" };
export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  aman: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  menipis: "bg-amber-100 text-amber-800 ring-amber-200",
  habis: "bg-rose-100 text-rose-800 ring-rose-200",
};

const JENIS_BADGE: Record<string, { label: string; className: string }> = {
  masuk: { label: "Penerimaan", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  keluar: { label: "Pengeluaran", className: "bg-rose-50 text-rose-700 ring-rose-200" },
  koreksi: { label: "Koreksi", className: "bg-sky-50 text-sky-700 ring-sky-200" },
};

function formatTanggal(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(
    new Date(`${value}T00:00:00`),
  );
}

export default async function PersediaanPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; status?: string; bulan?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab === "mutasi" ? "mutasi" : "stok";
  const bulan = params.bulan && /^\d{4}-\d{2}$/.test(params.bulan) ? params.bulan : "";
  const from = bulan ? `${bulan}-01` : undefined;
  const to = bulan
    ? `${bulan}-${new Date(Number(bulan.slice(0, 4)), Number(bulan.slice(5, 7)), 0).getDate()}`
    : undefined;

  const [items, mutasi, lembaga] = await Promise.all([
    getPersediaanStok(),
    getMutasiList({ from, to }),
    getLembaga(),
  ]);

  const totalUnit = items.reduce((acc, item) => acc + item.stok, 0);
  const totalNilai = items.reduce((acc, item) => acc + item.nilaiStok, 0);
  const menipis = items.filter((item) => item.status !== "aman");
  const totalMasuk = mutasi.filter((row) => row.jenis === "masuk").reduce((acc, row) => acc + row.jumlah, 0);
  const totalKeluar = mutasi.filter((row) => row.jenis === "keluar").reduce((acc, row) => acc + row.jumlah, 0);

  return (
    <div>
      <PageHeading
        eyebrow="Buku Persediaan"
        title="Penerimaan & Pengeluaran Persediaan"
        description={`Catatan keluar-masuk barang habis pakai ${lembaga.nama}, lengkap dengan stok berjalan dan peringatan stok minimum.`}
        actions={
          <>
            <Link
              href={`/persediaan/cetak${bulan ? `?bulan=${bulan}` : ""}`}
              className="btn-ghost"
            >
              <Printer className="h-4 w-4" />
              Cetak buku
            </Link>
            <Link href="/stok-opname" className="btn-primary">
              <ClipboardCheck className="h-4 w-4" />
              Stok opname
            </Link>
          </>
        }
      />

      {params.status === "dihapus" && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Data berhasil dihapus dari buku persediaan.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Jenis persediaan", value: formatAngka(items.length), icon: Package, chip: "barang tercatat" },
          { label: "Total stok", value: formatAngka(totalUnit), icon: Boxes, chip: "unit tersedia" },
          { label: "Nilai persediaan", value: formatRupiah(totalNilai), icon: Wallet, chip: "stok × harga satuan" },
          { label: "Perlu restock", value: formatAngka(menipis.length), icon: TriangleAlert, chip: "di bawah stok minimum" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="panel p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700/60">
                    {card.label}
                  </p>
                  <p className="mt-2 font-display text-[24px] font-semibold leading-none tracking-tight text-brand-950">
                    {card.value}
                  </p>
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white">
                  <Icon className="h-4.5 w-4.5" />
                </span>
              </div>
              <p className="mt-3 text-[11px] text-brand-900/45">{card.chip}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <section className="panel overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-900/8 px-5 py-3.5">
            <div className="flex gap-1 rounded-xl bg-brand-50/80 p-1">
              {[
                { value: "stok", label: "Stok & barang" },
                { value: "mutasi", label: "Buku mutasi" },
              ].map((item) => (
                <Link
                  key={item.value}
                  href={`/persediaan?tab=${item.value}${bulan ? `&bulan=${bulan}` : ""}`}
                  className={`rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition ${
                    tab === item.value
                      ? "bg-white text-brand-900 shadow-sm"
                      : "text-brand-800/60 hover:text-brand-900"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <form className="flex items-end gap-2">
              <input type="hidden" name="tab" value={tab} />
              <div>
                <label htmlFor="bulan" className="label !mb-1">
                  Periode
                </label>
                <input
                  id="bulan"
                  name="bulan"
                  type="month"
                  defaultValue={bulan}
                  className="input !py-1.5 text-xs"
                />
              </div>
              <button type="submit" className="btn-ghost !py-1.5 text-xs">
                Filter
              </button>
              {bulan && (
                <Link
                  href={`/persediaan?tab=${tab}`}
                  className="grid h-[34px] w-[34px] place-items-center rounded-xl border border-brand-900/15 bg-white text-brand-800"
                  aria-label="Reset periode"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Link>
              )}
            </form>
          </div>

          {tab === "stok" ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className="border-b border-brand-900/8 bg-cream-50/70 text-[11px] uppercase tracking-[0.1em] text-brand-900/50">
                    <th className="px-4 py-3 font-semibold">Kode</th>
                    <th className="px-4 py-3 font-semibold">Nama persediaan</th>
                    <th className="px-4 py-3 text-right font-semibold">Awal</th>
                    <th className="px-4 py-3 text-right font-semibold">Masuk</th>
                    <th className="px-4 py-3 text-right font-semibold">Keluar</th>
                    <th className="px-4 py-3 text-right font-semibold">Stok</th>
                    <th className="px-4 py-3 text-right font-semibold">Nilai</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 text-center font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-brand-900/6 last:border-0 hover:bg-brand-50/40">
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-brand-50 px-2 py-1 font-mono text-[10.5px] text-brand-800 ring-1 ring-brand-100">
                          {item.kode}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-brand-950">{item.nama}</p>
                        <p className="text-[11px] text-brand-900/45">
                          {item.kategori} · {item.lokasi}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right text-brand-900/60">{formatAngka(item.stokAwal)}</td>
                      <td className="px-4 py-3 text-right font-medium text-emerald-700">
                        {item.masuk > 0 ? `+${formatAngka(item.masuk)}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-rose-600">
                        {item.keluar > 0 ? `−${formatAngka(item.keluar)}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-display text-base font-semibold text-brand-900">
                          {formatAngka(item.stok)}
                        </span>{" "}
                        <span className="text-[11px] text-brand-900/45">{item.satuan}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-brand-800">
                        {formatRupiah(item.nilaiStok)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ring-1 ${STATUS_BADGE[item.status]}`}>
                          {item.status === "aman" ? "Aman" : item.status === "menipis" ? "Menipis" : "Habis"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <form action={deletePersediaanAction}>
                            <input type="hidden" name="id" value={item.id} />
                            <ConfirmSubmit nama={item.nama} label="Hapus" confirmText={`Hapus persediaan "${item.nama}" beserta seluruh mutasinya?`} />
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-sm text-brand-900/50">
                        Belum ada persediaan. Tambahkan lewat formulir di samping.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap gap-2 border-b border-brand-900/8 bg-cream-50/40 px-5 py-2.5 text-[11px] text-brand-900/60">
                <span className="badge bg-emerald-50 text-emerald-700 ring-emerald-200">
                  <ArrowDownCircle className="h-3 w-3" /> Masuk {formatAngka(totalMasuk)}
                </span>
                <span className="badge bg-rose-50 text-rose-700 ring-rose-200">
                  <ArrowUpCircle className="h-3 w-3" /> Keluar {formatAngka(totalKeluar)}
                </span>
                <span className="badge bg-brand-50 text-brand-800 ring-brand-100">
                  {mutasi.length} transaksi{bulan ? ` · ${bulan}` : ""}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-brand-900/8 bg-cream-50/70 text-[11px] uppercase tracking-[0.1em] text-brand-900/50">
                      <th className="px-4 py-3 font-semibold">Tanggal</th>
                      <th className="px-4 py-3 font-semibold">No. bukti</th>
                      <th className="px-4 py-3 font-semibold">Barang</th>
                      <th className="px-4 py-3 font-semibold">Jenis</th>
                      <th className="px-4 py-3 text-right font-semibold">Jumlah</th>
                      <th className="px-4 py-3 font-semibold">Pihak</th>
                      <th className="px-4 py-3 font-semibold">Keterangan</th>
                      <th className="px-4 py-3 text-center font-semibold">Hapus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mutasi.map((row) => {
                      const badge = JENIS_BADGE[row.jenis] ?? JENIS_BADGE.masuk;
                      return (
                        <tr key={row.id} className="border-b border-brand-900/6 last:border-0 hover:bg-brand-50/40">
                          <td className="whitespace-nowrap px-4 py-3 text-brand-900/70">{formatTanggal(row.tanggal)}</td>
                          <td className="px-4 py-3 font-mono text-[11px] text-brand-900/60">{row.noBukti || "—"}</td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-brand-950">{row.nama}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`badge ring-1 ${badge.className}`}>{badge.label}</span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-brand-900">
                            {row.jenis === "keluar" ? "−" : row.jenis === "koreksi" && row.jumlah < 0 ? "−" : row.jenis === "masuk" ? "+" : ""}
                            {formatAngka(Math.abs(row.jumlah))} {row.satuan}
                          </td>
                          <td className="px-4 py-3 text-[12px] text-brand-900/65">{row.pihak || "—"}</td>
                          <td className="px-4 py-3 text-[12px] text-brand-900/55">{row.keterangan || "—"}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center">
                              <form action={deleteMutasiAction}>
                                <input type="hidden" name="id" value={row.id} />
                                <ConfirmSubmit
                                  nama={`${badge.label} ${row.nama}`}
                                  label="Hapus"
                                  confirmText={`Hapus transaksi ${badge.label.toLowerCase()} "${row.nama}" tanggal ${row.tanggal}? Stok akan dihitung ulang.`}
                                />
                              </form>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {mutasi.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-sm text-brand-900/50">
                          Belum ada transaksi pada periode ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        <div className="space-y-5">
          <section className="panel p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <PackagePlus className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-display text-base font-semibold text-brand-950">
                  Catat Mutasi
                </h2>
                <p className="text-[11.5px] text-brand-900/50">
                  Penerimaan atau pengeluaran barang persediaan
                </p>
              </div>
            </div>
            <MutasiForm items={items} />
          </section>

          <section className="panel p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                <Boxes className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-display text-base font-semibold text-brand-950">
                  Tambah Jenis Persediaan
                </h2>
                <p className="text-[11.5px] text-brand-900/50">
                  Barang habis pakai (ATK, tinta, kebersihan)
                </p>
              </div>
            </div>
            <PersediaanForm />
          </section>

          {menipis.length > 0 && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-gold-600">
                <TriangleAlert className="h-3.5 w-3.5" /> Perlu pengadaan
              </p>
              <ul className="mt-2 space-y-1 text-[12px] text-brand-900/70">
                {menipis.slice(0, 5).map((item) => (
                  <li key={item.id} className="flex justify-between gap-2">
                    <span className="truncate">{item.nama}</span>
                    <span className="shrink-0 font-semibold">
                      {formatAngka(item.stok)} / min {formatAngka(item.stokMinimum)} {item.satuan}
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
