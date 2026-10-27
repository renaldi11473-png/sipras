"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { lembaga } from "@/db/schema";
import { getLembaga } from "@/lib/data";

export type LembagaState = { error?: string; success?: string };

export async function saveLembagaAction(
  _prev: LembagaState,
  formData: FormData,
): Promise<LembagaState> {
  const current = await getLembaga();

  const nama = String(formData.get("nama") ?? "").trim();
  const kodeLembaga = String(formData.get("kodeLembaga") ?? "").trim();
  const tahun = Number(formData.get("tahunAnggaran"));
  const keadaanPer = String(formData.get("keadaanPer") ?? "").trim();

  if (!nama) return { error: "Nama lembaga wajib diisi." };
  if (!kodeLembaga) return { error: "Kode lembaga wajib diisi." };
  if (!Number.isFinite(tahun) || tahun < 2000 || tahun > 2100) {
    return { error: "Tahun anggaran tidak valid." };
  }

  await db
    .update(lembaga)
    .set({
      nama,
      kodeLembaga: kodeLembaga.toUpperCase().replace(/\s+/g, ""),
      alamat: String(formData.get("alamat") ?? "").trim(),
      kota: String(formData.get("kota") ?? "").trim() || "Semarang",
      kepalaSekolah: String(formData.get("kepalaSekolah") ?? "").trim(),
      nipKepala: String(formData.get("nipKepala") ?? "").trim(),
      penyusun: String(formData.get("penyusun") ?? "").trim(),
      nipPenyusun: String(formData.get("nipPenyusun") ?? "").trim(),
      tahunAnggaran: tahun,
      keadaanPer: keadaanPer || `31 Desember ${tahun}`,
      updatedAt: new Date(),
    })
    .where(eq(lembaga.id, current.id));

  revalidatePath("/pengaturan");
  revalidatePath("/laporan");
  revalidatePath("/dashboard");

  return { success: "Profil lembaga berhasil disimpan." };
}
