import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { InventarisForm } from "@/components/inventaris-form";
import { KondisiBadge, PageHeading } from "@/components/ui";
import { getInventarisById, getLembaga, getNomorUrutMap } from "@/lib/data";
import { formatRupiah } from "@/lib/constants";

export const metadata: Metadata = { title: "Ubah Data Inventaris" };
export const dynamic = "force-dynamic";

export default async function EditInventarisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  const item = await getInventarisById(numericId);
  if (!item) notFound();

  const [lembaga, nomorMap] = await Promise.all([getLembaga(), getNomorUrutMap()]);

  return (
    <div>
      <PageHeading
        eyebrow="Ubah Data"
        title={item.namaBarang}
        description={`Kode barang ${item.kodeBarang} · nilai tercatat ${formatRupiah(item.nilai)}`}
        actions={
          <>
            <Link href="/inventaris" className="btn-ghost">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>
            <Link
              href={`/laporan?tahun=${item.tahunAnggaran}`}
              className="btn-ghost"
            >
              <ExternalLink className="h-4 w-4" />
              Lihat di laporan
            </Link>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-brand-900/10 bg-white px-4 py-3 text-xs text-brand-900/60">
        <span className="inline-flex items-center gap-1.5">
          Kondisi saat ini <KondisiBadge kode={item.kondisi} />
        </span>
        <span className="hidden h-3 w-px bg-brand-900/15 sm:block" />
        <span>
          Terakhir diperbarui{" "}
          {new Intl.DateTimeFormat("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(item.updatedAt)}
        </span>
      </div>

      <InventarisForm
        mode="edit"
        kodeLembaga={lembaga.kodeLembaga}
        nomorMap={nomorMap}
        defaultTahun={lembaga.tahunAnggaran}
        initial={{
          id: item.id,
          kodeBarang: item.kodeBarang,
          namaBarang: item.namaBarang,
          kategori: item.kategori,
          jumlah: item.jumlah,
          satuan: item.satuan,
          tahunAnggaran: item.tahunAnggaran,
          sumberPerolehan: item.sumberPerolehan,
          nilai: item.nilai,
          lokasi: item.lokasi,
          kondisi: item.kondisi,
          keterangan: item.keterangan,
        }}
      />
    </div>
  );
}
