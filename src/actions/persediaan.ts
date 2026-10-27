"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  peminjaman,
  peminjamanItem,
  persediaan,
  persediaanMutasi,
  stokOpname,
} from "@/db/schema";
import {
  getNomorBuktiPeminjaman,
  getPersediaanStok,
  getPeminjamanDetail,
} from "@/lib/persediaan";
import { KATEGORI, RUANGAN } from "@/lib/constants";

export type PersediaanState = {
  status?: "success" | "error";
  message?: string;
};

function today(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function toInt(value: FormDataEntryValue | null, fallback = 0) {
  const raw = String(value ?? "").replace(/[^\d-]/g, "");
  if (!raw) return fallback;
  const num = Number(raw);
  return Number.isFinite(num) ? num : fallback;
}

function refreshAll() {
  revalidatePath("/persediaan");
  revalidatePath("/stok-opname");
  revalidatePath("/peminjaman");
  revalidatePath("/buku-inventaris");
  revalidatePath("/dashboard");
}

/* ------------------------- Persediaan ------------------------- */

export async function createPersediaanAction(
  _prev: PersediaanState,
  formData: FormData,
): Promise<PersediaanState> {
  const nama = String(formData.get("nama") ?? "").trim();
  const kategori = String(formData.get("kategori") ?? "Lainnya").trim();
  const satuan = String(formData.get("satuan") ?? "bh").trim() || "bh";
  const lokasi = String(formData.get("lokasi") ?? "Gudang").trim() || "Gudang";
  const stokAwal = Math.max(0, toInt(formData.get("stokAwal")));
  const hargaSatuan = Math.max(0, toInt(formData.get("hargaSatuan")));
  const stokMinimum = Math.max(0, toInt(formData.get("stokMinimum")));
  const catatan = String(formData.get("catatan") ?? "").trim();
  const kodeInput = String(formData.get("kode") ?? "").trim();

  if (!nama) return { status: "error", message: "Nama persediaan wajib diisi." };
  if (!KATEGORI.some((item) => item.label === kategori)) {
    return { status: "error", message: "Pilih kategori yang tersedia." };
  }
  if (!RUANGAN.some((item) => item.label === lokasi)) {
    return { status: "error", message: "Pilih lokasi penyimpanan." };
  }

  const existing = await db.select({ id: persediaan.id }).from(persediaan);
  const kode =
    kodeInput ||
    `PSD-${String(existing.length + 1).padStart(3, "0")}-${new Date().getFullYear()}`;

  const duplicate = await db
    .select({ id: persediaan.id })
    .from(persediaan)
    .where(eq(persediaan.kode, kode))
    .limit(1);
  if (duplicate.length > 0) {
    return { status: "error", message: "Kode persediaan sudah dipakai." };
  }

  await db.insert(persediaan).values({
    kode,
    nama,
    kategori,
    satuan,
    lokasi,
    stokAwal,
    hargaSatuan,
    stokMinimum,
    catatan,
    updatedAt: new Date(),
  });

  refreshAll();
  return {
    status: "success",
    message: `Persediaan "${nama}" berhasil ditambahkan dengan kode ${kode}.`,
  };
}

export async function deletePersediaanAction(formData: FormData) {
  const id = toInt(formData.get("id"));
  if (id > 0) await db.delete(persediaan).where(eq(persediaan.id, id));
  refreshAll();
  redirect("/persediaan?status=dihapus");
}

export async function updatePersediaanAction(
  _prev: PersediaanState,
  formData: FormData,
): Promise<PersediaanState> {
  const id = toInt(formData.get("id"));
  const nama = String(formData.get("nama") ?? "").trim();
  const satuan = String(formData.get("satuan") ?? "bh").trim() || "bh";
  const lokasi = String(formData.get("lokasi") ?? "Gudang").trim();
  const hargaSatuan = Math.max(0, toInt(formData.get("hargaSatuan")));
  const stokMinimum = Math.max(0, toInt(formData.get("stokMinimum")));
  const catatan = String(formData.get("catatan") ?? "").trim();

  if (id <= 0) return { status: "error", message: "Data tidak ditemukan." };
  if (!nama) return { status: "error", message: "Nama persediaan wajib diisi." };

  await db
    .update(persediaan)
    .set({
      nama,
      satuan,
      lokasi: lokasi || "Gudang",
      hargaSatuan,
      stokMinimum,
      catatan,
      updatedAt: new Date(),
    })
    .where(eq(persediaan.id, id));

  refreshAll();
  return { status: "success", message: "Data persediaan berhasil diperbarui." };
}

/* ------------------- Penerimaan / pengeluaran ------------------- */

export async function tambahMutasiAction(
  _prev: PersediaanState,
  formData: FormData,
): Promise<PersediaanState> {
  const persediaanId = toInt(formData.get("persediaanId"));
  const jenis = String(formData.get("jenis") ?? "masuk").trim();
  const jumlah = toInt(formData.get("jumlah"));
  const tanggal = String(formData.get("tanggal") ?? today()).slice(0, 10);
  const noBukti = String(formData.get("noBukti") ?? "").trim();
  const pihak = String(formData.get("pihak") ?? "").trim();
  const keterangan = String(formData.get("keterangan") ?? "").trim();
  const hargaDefault = toInt(formData.get("hargaSatuan"));

  if (!["masuk", "keluar"].includes(jenis)) {
    return { status: "error", message: "Jenis transaksi tidak dikenal." };
  }
  if (persediaanId <= 0) {
    return { status: "error", message: "Pilih barang persediaan." };
  }
  if (jumlah <= 0) {
    return { status: "error", message: "Jumlah harus lebih dari 0." };
  }

  const stokList = await getPersediaanStok();
  const item = stokList.find((row) => row.id === persediaanId);
  if (!item) return { status: "error", message: "Barang persediaan tidak ditemukan." };

  if (jenis === "keluar" && jumlah > item.stok) {
    return {
      status: "error",
      message: `Stok tidak cukup. Stok tersedia ${item.stok} ${item.satuan}.`,
    };
  }

  await db.insert(persediaanMutasi).values({
    persediaanId,
    jenis,
    jumlah,
    tanggal,
    noBukti: noBukti || `${jenis === "masuk" ? "BM" : "BK"}-${Date.now().toString().slice(-6)}`,
    pihak,
    keterangan,
    hargaSatuan: hargaDefault || item.hargaSatuan,
  });

  refreshAll();
  return {
    status: "success",
    message: `${jenis === "masuk" ? "Penerimaan" : "Pengeluaran"} ${jumlah} ${item.satuan} "${item.nama}" tercatat. Stok baru: ${
      jenis === "masuk" ? item.stok + jumlah : item.stok - jumlah
    } ${item.satuan}.`,
  };
}

export async function deleteMutasiAction(formData: FormData) {
  const id = toInt(formData.get("id"));
  if (id > 0) await db.delete(persediaanMutasi).where(eq(persediaanMutasi.id, id));
  refreshAll();
  redirect("/persediaan?tab=mutasi&status=dihapus");
}

/* ------------------------- Stok opname ------------------------- */

export async function simpanOpnameAction(
  _prev: PersediaanState,
  formData: FormData,
): Promise<PersediaanState> {
  const persediaanId = toInt(formData.get("persediaanId"));
  const stokFisik = toInt(formData.get("stokFisik"), -1);
  const tanggal = String(formData.get("tanggal") ?? today()).slice(0, 10);
  const petugas = String(formData.get("petugas") ?? "").trim();
  const keterangan = String(formData.get("keterangan") ?? "").trim();
  const sesuaikan = String(formData.get("sesuaikan") ?? "ya") === "ya";

  if (persediaanId <= 0) {
    return { status: "error", message: "Pilih barang yang akan diopname." };
  }
  if (stokFisik < 0) {
    return { status: "error", message: "Stok fisik tidak boleh negatif." };
  }

  const stokList = await getPersediaanStok();
  const item = stokList.find((row) => row.id === persediaanId);
  if (!item) return { status: "error", message: "Barang tidak ditemukan." };

  const selisih = stokFisik - item.stok;

  await db.insert(stokOpname).values({
    persediaanId,
    tanggal,
    stokSistem: item.stok,
    stokFisik,
    selisih,
    keterangan:
      keterangan ||
      (selisih === 0
        ? "Stok sesuai antara catatan dan fisik."
        : selisih > 0
          ? "Selisih lebih, perlu penelusuran."
          : "Selisih kurang, perlu penelusuran."),
    petugas,
  });

  if (sesuaikan && selisih !== 0) {
    await db.insert(persediaanMutasi).values({
      persediaanId,
      jenis: "koreksi",
      jumlah: selisih,
      tanggal,
      hargaSatuan: item.hargaSatuan,
      noBukti: `OPN-${tanggal.replace(/-/g, "")}`,
      pihak: petugas || "Petugas opname",
      keterangan: "Penyesuaian stok hasil opname",
    });
  }

  refreshAll();
  return {
    status: "success",
    message: `Opname "${item.nama}" tersimpan. Stok sistem ${item.stok}, fisik ${stokFisik} (selisih ${selisih > 0 ? "+" : ""}${selisih}).${
      sesuaikan && selisih !== 0 ? " Stok sistem telah disesuaikan." : ""
    }`,
  };
}

export async function deleteOpnameAction(formData: FormData) {
  const id = toInt(formData.get("id"));
  if (id > 0) await db.delete(stokOpname).where(eq(stokOpname.id, id));
  refreshAll();
  redirect("/stok-opname?status=dihapus");
}

/* ------------------------- Peminjaman ------------------------- */

export async function createPeminjamanAction(
  _prev: PersediaanState,
  formData: FormData,
): Promise<PersediaanState> {
  const peminjam = String(formData.get("peminjam") ?? "").trim();
  const unit = String(formData.get("unit") ?? "").trim();
  const keperluan = String(formData.get("keperluan") ?? "").trim();
  const tanggalPinjam = String(formData.get("tanggalPinjam") ?? today()).slice(0, 10);
  const rencanaKembali = String(
    formData.get("rencanaKembali") ?? today(3),
  ).slice(0, 10);
  const petugas = String(formData.get("petugas") ?? "").trim();
  const catatan = String(formData.get("catatan") ?? "").trim();

  if (!peminjam) return { status: "error", message: "Nama peminjam wajib diisi." };
  if (rencanaKembali < tanggalPinjam) {
    return {
      status: "error",
      message: "Rencana kembali tidak boleh sebelum tanggal pinjam.",
    };
  }

  const names = formData.getAll("itemNama").map((value) => String(value).trim());
  const jumlahs = formData.getAll("itemJumlah").map((value) => toInt(value, 0));
  const satuans = formData.getAll("itemSatuan").map((value) => String(value).trim() || "bh");
  const ids = formData.getAll("itemInventarisId").map((value) => toInt(value, 0));
  const catatans = formData.getAll("itemKeterangan").map((value) => String(value).trim());

  const items = names
    .map((nama, index) => ({
      namaBarang: nama,
      jumlah: jumlahs[index] ?? 0,
      satuan: satuans[index] ?? "bh",
      inventarisId: ids[index] > 0 ? ids[index] : null,
      keterangan: catatans[index] ?? "",
    }))
    .filter((item) => item.namaBarang.length > 0 && item.jumlah > 0);

  if (items.length === 0) {
    return {
      status: "error",
      message: "Tambahkan minimal satu barang yang dipinjam beserta jumlahnya.",
    };
  }

  const nomorBukti = await getNomorBuktiPeminjaman(tanggalPinjam);
  const inserted = await db
    .insert(peminjaman)
    .values({
      nomorBukti,
      peminjam,
      unit,
      keperluan,
      tanggalPinjam,
      rencanaKembali,
      petugas,
      catatan,
      status: "dipinjam",
    })
    .returning({ id: peminjaman.id });

  await db.insert(peminjamanItem).values(
    items.map((item) => ({ ...item, peminjamanId: inserted[0].id })),
  );

  refreshAll();
  revalidatePath(`/peminjaman/${inserted[0].id}`);
  redirect(`/peminjaman/${inserted[0].id}?status=dibuat`);
}

export async function kembalikanPeminjamanAction(formData: FormData) {
  const id = toInt(formData.get("id"));
  const tanggalKembali = String(formData.get("tanggalKembali") ?? today()).slice(0, 10);
  if (id > 0) {
    const kondisi = formData.getAll("kondisiKembali").map((value) => String(value));
    const detail = await getPeminjamanDetail(id);
    if (detail) {
      for (let index = 0; index < detail.items.length; index += 1) {
        const item = detail.items[index];
        const value = kondisi[index] ?? "B";
        await db
          .update(peminjamanItem)
          .set({ kondisiKembali: value })
          .where(eq(peminjamanItem.id, item.id));
      }
    }
    await db
      .update(peminjaman)
      .set({ status: "kembali", tanggalKembali })
      .where(eq(peminjaman.id, id));
  }
  refreshAll();
  revalidatePath(`/peminjaman/${id}`);
  redirect(`/peminjaman/${id}?status=dikembalikan`);
}

export async function deletePeminjamanAction(formData: FormData) {
  const id = toInt(formData.get("id"));
  if (id > 0) {
    await db.delete(peminjamanItem).where(eq(peminjamanItem.peminjamanId, id));
    await db.delete(peminjaman).where(eq(peminjaman.id, id));
  }
  refreshAll();
  redirect("/peminjaman?status=dihapus");
}

export async function cariItemPeminjamanAction(id: number) {
  const detail = await getPeminjamanDetail(id);
  if (!detail) return null;
  return detail.items.map((item) => ({
    id: item.id,
    namaBarang: item.namaBarang,
    jumlah: item.jumlah,
    satuan: item.satuan,
    kondisiKembali: item.kondisiKembali,
  }));
}

export async function hitungStokPersediaanAction(persediaanId: number) {
  const list = await getPersediaanStok();
  const found = list.find((row) => row.id === persediaanId);
  if (!found) return null;
  const existing = await db
    .select({ id: stokOpname.id })
    .from(stokOpname)
    .where(and(eq(stokOpname.persediaanId, persediaanId)));
  return { stok: found.stok, satuan: found.satuan, jumlahOpname: existing.length };
}
