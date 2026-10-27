import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { InventarisForm } from "@/components/inventaris-form";
import { PageHeading } from "@/components/ui";
import { getLembaga, getNomorUrutMap } from "@/lib/data";
import { KATEGORI, RUANGAN } from "@/lib/constants";

export const metadata: Metadata = { title: "Input Barang" };
export const dynamic = "force-dynamic";

export default async function InventarisBaruPage() {
  const [lembaga, nomorMap] = await Promise.all([getLembaga(), getNomorUrutMap()]);

  return (
    <div>
      <PageHeading
        eyebrow="Input Data"
        title="Tambah Inventaris Baru"
        description="Lengkapi identitas barang dan pencatatan aset. Kode barang akan dibentuk otomatis mengikuti pola register aset lembaga."
        actions={
          <Link href="/inventaris" className="btn-ghost">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke daftar
          </Link>
        }
      />

      <InventarisForm
        mode="create"
        kodeLembaga={lembaga.kodeLembaga}
        nomorMap={nomorMap}
        defaultTahun={lembaga.tahunAnggaran}
        initial={{
          kodeBarang: "",
          namaBarang: "",
          kategori: KATEGORI[0].label,
          jumlah: 1,
          satuan: "bh",
          tahunAnggaran: lembaga.tahunAnggaran,
          sumberPerolehan: "BOS",
          nilai: 0,
          lokasi: RUANGAN[0].label,
          kondisi: "B",
          keterangan: "",
        }}
      />
    </div>
  );
}
