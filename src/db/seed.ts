import "server-only";

import { db } from "@/db";
import {
  inventaris,
  lembaga,
  peminjaman,
  peminjamanItem,
  persediaan,
  persediaanMutasi,
  sheetConnection,
  stokOpname,
  users,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import {
  buatKodeBarang,
  DEFAULT_SPREADSHEET_GID,
  DEFAULT_SPREADSHEET_ID,
  DEFAULT_SPREADSHEET_URL,
} from "@/lib/constants";

type SeedItem = {
  nama: string;
  kategori: string;
  lokasi: string;
  jumlah: number;
  satuan: string;
  nilai: number;
  kondisi?: string;
  keterangan?: string;
};

const data2025: SeedItem[] = [
  { nama: "Alat Beladah", kategori: "Perlengkapan", lokasi: "Ruang Bermain", jumlah: 1, satuan: "Paket", nilai: 500_000 },
  { nama: "Buku Bahasa Indonesia kelas 9", kategori: "Buku & Literasi", lokasi: "Ruang Perpustakaan", jumlah: 35, satuan: "bh", nilai: 2_275_000 },
  { nama: "Buku PAI kelas 8", kategori: "Buku & Literasi", lokasi: "Ruang Perpustakaan", jumlah: 110, satuan: "bh", nilai: 6_050_000 },
  { nama: "Buku Perpustakaan", kategori: "Buku & Literasi", lokasi: "Ruang Perpustakaan", jumlah: 40, satuan: "bh", nilai: 1_800_000 },
  { nama: "Dispenser", kategori: "Elektronik", lokasi: "Ruang Guru", jumlah: 1, satuan: "bh", nilai: 800_000, keterangan: "Air minum guru & tamu" },
  { nama: "Gerobak", kategori: "Perlengkapan", lokasi: "Gudang", jumlah: 1, satuan: "bh", nilai: 1_500_000, kondisi: "RR", keterangan: "Roda perlu perbaikan" },
  { nama: "Meja Rapat", kategori: "Meja", lokasi: "Ruang Guru", jumlah: 1, satuan: "bh", nilai: 2_250_000 },
  { nama: "PC UV Gel (komputer labor)", kategori: "Elektronik", lokasi: "Ruang Komputer", jumlah: 1, satuan: "bh", nilai: 8_500_000, keterangan: "Inventaris laboratorium komputer" },
  { nama: "Papan Publikasi", kategori: "Perlengkapan", lokasi: "Halaman", jumlah: 1, satuan: "bh", nilai: 750_000 },
  { nama: "Proyektor", kategori: "Elektronik", lokasi: "Ruang Kelas 1", jumlah: 3, satuan: "bh", nilai: 13_500_000 },
  { nama: "TV", kategori: "Elektronik", lokasi: "Ruang Guru", jumlah: 1, satuan: "bh", nilai: 4_200_000 },
  { nama: "Alat Musik (Drumband)", kategori: "Alat Musik", lokasi: "Gudang", jumlah: 1, satuan: "Paket", nilai: 12_500_000 },
  { nama: "Buku Siaga TKA", kategori: "Buku & Literasi", lokasi: "Ruang Kelas 3", jumlah: 228, satuan: "bh", nilai: 10_260_000 },
  { nama: "Kit Listrik", kategori: "Alat Peraga", lokasi: "Ruang Kelas 2", jumlah: 2, satuan: "bh", nilai: 700_000 },
  { nama: "Meja Rapat", kategori: "Meja", lokasi: "Ruang Guru", jumlah: 2, satuan: "bh", nilai: 4_500_000, keterangan: "Meja rapat tambahan" },
  { nama: "Meja Anak", kategori: "Meja", lokasi: "Ruang Kelas 1", jumlah: 36, satuan: "bh", nilai: 16_200_000 },
  { nama: "Kursi Anak", kategori: "Kursi", lokasi: "Ruang Kelas 2", jumlah: 36, satuan: "bh", nilai: 9_000_000 },
];

const data2026: SeedItem[] = [
  { nama: "Buku Pengenalan Robotika dengan Arduino", kategori: "Buku & Literasi", lokasi: "Ruang Komputer", jumlah: 10, satuan: "bh", nilai: 1_250_000 },
  { nama: "Dasar Dasar Pembuatan Robot untuk Pemula", kategori: "Buku & Literasi", lokasi: "Ruang Komputer", jumlah: 10, satuan: "bh", nilai: 1_100_000 },
  { nama: "Smart Book Pendidikan Pancasila kelas 7 SMP", kategori: "Buku & Literasi", lokasi: "Ruang Perpustakaan", jumlah: 220, satuan: "bh", nilai: 13_200_000 },
  { nama: "Buku Teks Pendamping Koding SMP", kategori: "Buku & Literasi", lokasi: "Ruang Perpustakaan", jumlah: 225, satuan: "bh", nilai: 16_875_000 },
  { nama: "Explore Koding dan Kecerdasan Artifisial", kategori: "Buku & Literasi", lokasi: "Ruang Perpustakaan", jumlah: 225, satuan: "bh", nilai: 19_125_000 },
  { nama: "Paket Literasi SMP Masmedia", kategori: "Buku & Literasi", lokasi: "Ruang Perpustakaan", jumlah: 1, satuan: "Paket", nilai: 7_500_000 },
];

async function runSeed() {
  const existingUsers = await db.select({ id: users.id }).from(users).limit(1);
  if (existingUsers.length === 0) {
    await db
      .insert(users)
      .values({
        username: "admin",
        passwordHash: hashPassword("admin"),
        nama: "Administrator SIPRAS",
        peran: "Administrator",
      })
      .onConflictDoNothing();
  }

  const existingLembaga = await db
    .select({ id: lembaga.id })
    .from(lembaga)
    .limit(1);
  if (existingLembaga.length === 0) {
    await db.insert(lembaga).values({
      nama: "SMPS IT Mutiara",
      kodeLembaga: "SMPSIT",
      alamat: "Jl. Pandanaran No. 12",
      kota: "Semarang",
      kepalaSekolah: "",
      nipKepala: "-",
      penyusun: "",
      nipPenyusun: "-",
      tahunAnggaran: 2026,
      keadaanPer: "31 Desember 2026",
    });
  }

  const existingConnection = await db
    .select({ id: sheetConnection.id })
    .from(sheetConnection)
    .limit(1);
  if (existingConnection.length === 0) {
    await db.insert(sheetConnection).values({
      spreadsheetUrl: DEFAULT_SPREADSHEET_URL,
      spreadsheetId: DEFAULT_SPREADSHEET_ID,
      gid: DEFAULT_SPREADSHEET_GID,
      method: "auto",
      targetSheetName: "Inventaris",
      lastSyncStatus: "belum",
      lastSyncMessage: "Belum pernah disinkronkan.",
    });
  }

  const existingItems = await db
    .select({ id: inventaris.id })
    .from(inventaris)
    .limit(1);
  if (existingItems.length === 0) {
    const rows = [
      ...data2025.map((item, index) => ({ ...item, tahunAnggaran: 2025, nomor: index + 1, sumberPerolehan: "BOS" })),
      ...data2026.map((item, index) => ({ ...item, tahunAnggaran: 2026, nomor: index + 1, sumberPerolehan: "BOS" })),
    ].map((item) => ({
      kodeBarang: buatKodeBarang({
        kodeLembaga: "SMPSIT",
        kategori: item.kategori,
        lokasi: item.lokasi,
        nomor: item.nomor,
        tahun: item.tahunAnggaran,
      }),
      namaBarang: item.nama,
      kategori: item.kategori,
      jumlah: item.jumlah,
      satuan: item.satuan,
      tahunAnggaran: item.tahunAnggaran,
      sumberPerolehan: item.sumberPerolehan,
      nilai: item.nilai,
      lokasi: item.lokasi,
      kondisi: item.kondisi ?? "B",
      keterangan: item.keterangan ?? "",
    }));

    await db.insert(inventaris).values(rows).onConflictDoNothing();
  }

  await seedModul();
}


async function seedModul() {
  const existing = await db.select({ id: persediaan.id }).from(persediaan).limit(1);
  if (existing.length > 0) return;

  const items = await db
    .insert(persediaan)
    .values([
      { kode: "PSD-001", nama: "Kertas HVS A4 70gr", kategori: "Perlengkapan", satuan: "Rim", stokAwal: 20, hargaSatuan: 55_000, lokasi: "Gudang", stokMinimum: 10, catatan: "Stok ATK tata usaha" },
      { kode: "PSD-002", nama: "Tinta Printer Hitam", kategori: "Perlengkapan", satuan: "bh", stokAwal: 6, hargaSatuan: 95_000, lokasi: "Ruang Guru", stokMinimum: 3, catatan: "" },
      { kode: "PSD-003", nama: "Spidol Whiteboard", kategori: "Perlengkapan", satuan: "bh", stokAwal: 24, hargaSatuan: 12_500, lokasi: "Gudang", stokMinimum: 12, catatan: "" },
      { kode: "PSD-004", nama: "Map Plastik F4", kategori: "Perlengkapan", satuan: "Paket", stokAwal: 10, hargaSatuan: 25_000, lokasi: "Gudang", stokMinimum: 5, catatan: "" },
      { kode: "PSD-005", nama: "Sabun Pembersih Lantai", kategori: "Perlengkapan", satuan: "bh", stokAwal: 8, hargaSatuan: 22_000, lokasi: "Ruang UKS", stokMinimum: 4, catatan: "Kebutuhan kebersihan" },
    ])
    .returning({ id: persediaan.id, kode: persediaan.kode });

  const byKode = new Map(items.map((item) => [item.kode, item.id]));
  const now = new Date();
  const bulan = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  await db.insert(persediaanMutasi).values([
    { persediaanId: byKode.get("PSD-001")!, tanggal: `${bulan}-03`, jenis: "masuk", jumlah: 15, hargaSatuan: 55_000, noBukti: "BM-0001", pihak: "Toko Sinar Jaya", keterangan: "Pengadaan ATK bulan ini" },
    { persediaanId: byKode.get("PSD-001")!, tanggal: `${bulan}-08`, jenis: "keluar", jumlah: 6, hargaSatuan: 55_000, noBukti: "BK-0001", pihak: "Tata Usaha", keterangan: "Cetak administrasi" },
    { persediaanId: byKode.get("PSD-002")!, tanggal: `${bulan}-05`, jenis: "keluar", jumlah: 2, hargaSatuan: 95_000, noBukti: "BK-0002", pihak: "Ruang Guru", keterangan: "Cetak soal ulangan" },
    { persediaanId: byKode.get("PSD-003")!, tanggal: `${bulan}-06`, jenis: "keluar", jumlah: 8, hargaSatuan: 12_500, noBukti: "BK-0003", pihak: "Kelas 7A", keterangan: "Kebutuhan belajar" },
    { persediaanId: byKode.get("PSD-004")!, tanggal: `${bulan}-09`, jenis: "masuk", jumlah: 5, hargaSatuan: 25_000, noBukti: "BM-0002", pihak: "Yayasan", keterangan: "Bantuan yayasan" },
    { persediaanId: byKode.get("PSD-005")!, tanggal: `${bulan}-10`, jenis: "keluar", jumlah: 5, hargaSatuan: 22_000, noBukti: "BK-0004", pihak: "Petugas Kebersihan", keterangan: "Kebutuhan harian" },
  ]);

  await db.insert(stokOpname).values([
    { persediaanId: byKode.get("PSD-001")!, tanggal: `${bulan}-15`, stokSistem: 29, stokFisik: 28, selisih: -1, keterangan: "Satu rim rusak terkena air.", petugas: "Nur Aini" },
    { persediaanId: byKode.get("PSD-003")!, tanggal: `${bulan}-15`, stokSistem: 16, stokFisik: 16, selisih: 0, keterangan: "Sesuai catatan.", petugas: "Nur Aini" },
  ]);

  const peminjamanRows = await db
    .insert(peminjaman)
    .values([
      { nomorBukti: "BA-PMJ/2026/001", peminjam: "Ibu Rahmawati", unit: "Kelas 7A", keperluan: "Praktik IPA mikroskop", tanggalPinjam: `${bulan}-12`, rencanaKembali: `${bulan}-15`, status: "dipinjam", petugas: "Nur Aini", catatan: "Dikembalikan sebelum jam pelajaran terakhir." },
      { nomorBukti: "BA-PMJ/2026/002", peminjam: "Pak Hendra", unit: "Ruang Guru", keperluan: "Rapat wali murid", tanggalPinjam: `${bulan}-02`, rencanaKembali: `${bulan}-03`, tanggalKembali: `${bulan}-03`, status: "kembali", petugas: "Nur Aini", catatan: "" },
    ])
    .returning({ id: peminjaman.id, nomorBukti: peminjaman.nomorBukti });

  const itemsPertama = await db
    .select({ id: inventaris.id, nama: inventaris.namaBarang, satuan: inventaris.satuan })
    .from(inventaris)
    .limit(3);

  const peminjamanId = new Map(peminjamanRows.map((row) => [row.nomorBukti, row.id]));
  if (itemsPertama.length >= 2) {
    await db.insert(peminjamanItem).values([
      { peminjamanId: peminjamanId.get("BA-PMJ/2026/001")!, inventarisId: itemsPertama[0].id, namaBarang: "Proyektor", jumlah: 1, satuan: "bh", keterangan: "" },
      { peminjamanId: peminjamanId.get("BA-PMJ/2026/001")!, inventarisId: itemsPertama[1].id, namaBarang: "Meja Rapat", jumlah: 2, satuan: "bh", keterangan: "" },
      { peminjamanId: peminjamanId.get("BA-PMJ/2026/002")!, inventarisId: itemsPertama[2].id, namaBarang: "Kursi Anak", jumlah: 4, satuan: "bh", kondisiKembali: "B", keterangan: "" },
    ]);
  }
}

let seedPromise: Promise<void> | null = null;

export async function ensureSeed() {
  if (!seedPromise) {
    seedPromise = runSeed().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
}
