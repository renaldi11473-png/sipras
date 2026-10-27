"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { inventaris } from "@/db/schema";
import { getLembaga, getNomorUrutBerikutnya } from "@/lib/data";
import {
  KATEGORI,
  KONDISI,
  RUANGAN,
  SUMBER_PEROLEHAN,
  buatKodeBarang,
} from "@/lib/constants";

export type InventarisFormState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};

function parseNumber(value: FormDataEntryValue | null, fallback = 0) {
  const raw = String(value ?? "").replace(/\./g, "").replace(/,/g, "").trim();
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

async function buildValues(formData: FormData) {
  const fieldErrors: Record<string, string> = {};

  const namaBarang = String(formData.get("namaBarang") ?? "").trim();
  const kategori = String(formData.get("kategori") ?? "").trim();
  const lokasi = String(formData.get("lokasi") ?? "").trim();
  const satuan = String(formData.get("satuan") ?? "bh").trim() || "bh";
  const tahunAnggaran = parseNumber(formData.get("tahunAnggaran"));
  const jumlah = parseNumber(formData.get("jumlah"), 1);
  const nilai = parseNumber(formData.get("nilai"), 0);
  const sumberPerolehan = String(formData.get("sumberPerolehan") ?? "BOS").trim();
  const kondisi = String(formData.get("kondisi") ?? "B").trim();
  const keterangan = String(formData.get("keterangan") ?? "").trim();
  const kodeInput = String(formData.get("kodeBarang") ?? "").trim();

  if (!namaBarang) fieldErrors.namaBarang = "Nama barang wajib diisi.";
  if (!KATEGORI.some((item) => item.label === kategori)) {
    fieldErrors.kategori = "Pilih kategori barang.";
  }
  if (!RUANGAN.some((item) => item.label === lokasi)) {
    fieldErrors.lokasi = "Pilih lokasi / ruang penyimpanan.";
  }
  if (!Number.isFinite(tahunAnggaran) || tahunAnggaran < 2000 || tahunAnggaran > 2100) {
    fieldErrors.tahunAnggaran = "Tahun anggaran tidak valid.";
  }
  if (!Number.isFinite(jumlah) || jumlah < 1) {
    fieldErrors.jumlah = "Jumlah minimal 1.";
  }
  if (!Number.isFinite(nilai) || nilai < 0) {
    fieldErrors.nilai = "Nilai tidak boleh negatif.";
  }
  if (!SUMBER_PEROLEHAN.includes(sumberPerolehan as (typeof SUMBER_PEROLEHAN)[number])) {
    fieldErrors.sumberPerolehan = "Pilih sumber perolehan.";
  }
  if (!KONDISI.some((item) => item.kode === kondisi)) {
    fieldErrors.kondisi = "Pilih kondisi barang.";
  }

  const lembaga = await getLembaga();
  const nomor = await getNomorUrutBerikutnya(
    Number.isFinite(tahunAnggaran) ? tahunAnggaran : lembaga.tahunAnggaran,
  );

  const kodeBarang =
    kodeInput ||
    buatKodeBarang({
      kodeLembaga: lembaga.kodeLembaga,
      kategori,
      lokasi,
      nomor,
      tahun: Number.isFinite(tahunAnggaran) ? tahunAnggaran : lembaga.tahunAnggaran,
    });

  return {
    fieldErrors,
    values: {
      kodeBarang,
      namaBarang,
      kategori,
      jumlah: Number.isFinite(jumlah) ? Math.round(jumlah) : 1,
      satuan,
      tahunAnggaran: Number.isFinite(tahunAnggaran)
        ? Math.round(tahunAnggaran)
        : lembaga.tahunAnggaran,
      sumberPerolehan,
      nilai: Number.isFinite(nilai) ? Math.round(nilai) : 0,
      lokasi,
      kondisi,
      keterangan,
    },
  };
}

export async function createInventarisAction(
  _prev: InventarisFormState,
  formData: FormData,
): Promise<InventarisFormState> {
  const { fieldErrors, values } = await buildValues(formData);
  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Periksa kembali data yang ditandai.", fieldErrors };
  }

  const duplicate = await db
    .select({ id: inventaris.id })
    .from(inventaris)
    .where(eq(inventaris.kodeBarang, values.kodeBarang))
    .limit(1);

  if (duplicate.length > 0) {
    return {
      error: "Kode barang sudah dipakai.",
      fieldErrors: { kodeBarang: "Kode barang sudah dipakai, gunakan kode lain." },
    };
  }

  await db.insert(inventaris).values({ ...values, updatedAt: new Date() });
  revalidatePath("/inventaris");
  revalidatePath("/dashboard");
  revalidatePath("/laporan");
  redirect("/inventaris?status=ditambahkan");
}

export async function updateInventarisAction(
  _prev: InventarisFormState,
  formData: FormData,
): Promise<InventarisFormState> {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return { error: "Data barang tidak ditemukan." };
  }

  const { fieldErrors, values } = await buildValues(formData);
  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Periksa kembali data yang ditandai.", fieldErrors };
  }

  const duplicate = await db
    .select({ id: inventaris.id })
    .from(inventaris)
    .where(and(eq(inventaris.kodeBarang, values.kodeBarang), ne(inventaris.id, id)))
    .limit(1);

  if (duplicate.length > 0) {
    return {
      error: "Kode barang sudah dipakai.",
      fieldErrors: { kodeBarang: "Kode barang sudah dipakai, gunakan kode lain." },
    };
  }

  await db
    .update(inventaris)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(inventaris.id, id));

  revalidatePath("/inventaris");
  revalidatePath("/dashboard");
  revalidatePath("/laporan");
  redirect("/inventaris?status=diperbarui");
}

export async function deleteInventarisAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (Number.isInteger(id) && id > 0) {
    await db.delete(inventaris).where(eq(inventaris.id, id));
    revalidatePath("/inventaris");
    revalidatePath("/dashboard");
    revalidatePath("/laporan");
  }
  redirect("/inventaris?status=dihapus");
}
