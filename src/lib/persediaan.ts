import "server-only";

import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  inventaris,
  peminjaman,
  peminjamanItem,
  persediaan,
  persediaanMutasi,
  stokOpname,
  type Peminjaman,
  type PeminjamanItem,
} from "@/db/schema";
import { ensureSeed } from "@/db/seed";

/* ------------------------- Persediaan ------------------------- */

export type PersediaanStok = {
  id: number;
  kode: string;
  nama: string;
  kategori: string;
  satuan: string;
  stokAwal: number;
  hargaSatuan: number;
  lokasi: string;
  stokMinimum: number;
  catatan: string;
  masuk: number;
  keluar: number;
  koreksi: number;
  stok: number;
  nilaiStok: number;
  status: "aman" | "menipis" | "habis";
};

export async function getPersediaanStok(): Promise<PersediaanStok[]> {
  await ensureSeed();
  const [items, mutasi] = await Promise.all([
    db.select().from(persediaan).orderBy(asc(persediaan.nama)),
    db.select().from(persediaanMutasi),
  ]);

  const aggregate = new Map<number, { masuk: number; keluar: number; koreksi: number }>();
  for (const row of mutasi) {
    const current = aggregate.get(row.persediaanId) ?? {
      masuk: 0,
      keluar: 0,
      koreksi: 0,
    };
    if (row.jenis === "masuk") current.masuk += row.jumlah;
    else if (row.jenis === "keluar") current.keluar += row.jumlah;
    else current.koreksi += row.jumlah;
    aggregate.set(row.persediaanId, current);
  }

  return items.map((item) => {
    const agg = aggregate.get(item.id) ?? { masuk: 0, keluar: 0, koreksi: 0 };
    const stok = item.stokAwal + agg.masuk - agg.keluar + agg.koreksi;
    return {
      id: item.id,
      kode: item.kode,
      nama: item.nama,
      kategori: item.kategori,
      satuan: item.satuan,
      stokAwal: item.stokAwal,
      hargaSatuan: item.hargaSatuan,
      lokasi: item.lokasi,
      stokMinimum: item.stokMinimum,
      catatan: item.catatan,
      ...agg,
      stok,
      nilaiStok: stok * item.hargaSatuan,
      status: stok <= 0 ? "habis" : stok <= item.stokMinimum ? "menipis" : "aman",
    };
  });
}

export type MutasiRow = {
  id: number;
  tanggal: string;
  jenis: string;
  jumlah: number;
  hargaSatuan: number;
  noBukti: string;
  pihak: string;
  keterangan: string;
  persediaanId: number;
  nama: string;
  satuan: string;
};

export async function getMutasiList(filter: {
  from?: string;
  to?: string;
  jenis?: string;
  persediaanId?: number;
  limit?: number;
} = {}): Promise<MutasiRow[]> {
  await ensureSeed();
  const conditions = [];
  if (filter.from) conditions.push(gte(persediaanMutasi.tanggal, filter.from));
  if (filter.to) conditions.push(lte(persediaanMutasi.tanggal, filter.to));
  if (filter.jenis) conditions.push(eq(persediaanMutasi.jenis, filter.jenis));
  if (filter.persediaanId) {
    conditions.push(eq(persediaanMutasi.persediaanId, filter.persediaanId));
  }

  const base = db
    .select({
      id: persediaanMutasi.id,
      tanggal: persediaanMutasi.tanggal,
      jenis: persediaanMutasi.jenis,
      jumlah: persediaanMutasi.jumlah,
      hargaSatuan: persediaanMutasi.hargaSatuan,
      noBukti: persediaanMutasi.noBukti,
      pihak: persediaanMutasi.pihak,
      keterangan: persediaanMutasi.keterangan,
      persediaanId: persediaanMutasi.persediaanId,
      nama: persediaan.nama,
      satuan: persediaan.satuan,
    })
    .from(persediaanMutasi)
    .innerJoin(persediaan, eq(persediaan.id, persediaanMutasi.persediaanId));

  return (conditions.length > 0 ? base.where(and(...conditions)) : base)
    .orderBy(desc(persediaanMutasi.tanggal), desc(persediaanMutasi.id))
    .limit(filter.limit ?? 300);
}

export async function getPersediaanRingkas() {
  const rows = await getPersediaanStok();
  return {
    jenis: rows.length,
    totalUnit: rows.reduce((acc, row) => acc + row.stok, 0),
    nilaiStok: rows.reduce((acc, row) => acc + row.nilaiStok, 0),
    menipis: rows.filter((row) => row.status !== "aman").length,
    items: rows,
  };
}

/* ------------------------- Stok Opname ------------------------- */

export type OpnameRow = {
  id: number;
  tanggal: string;
  persediaanId: number;
  nama: string;
  satuan: string;
  stokSistem: number;
  stokFisik: number;
  selisih: number;
  keterangan: string;
  petugas: string;
  createdAt: Date;
};

export async function getOpnameList(limit = 60): Promise<OpnameRow[]> {
  await ensureSeed();
  return db
    .select({
      id: stokOpname.id,
      tanggal: stokOpname.tanggal,
      persediaanId: stokOpname.persediaanId,
      nama: persediaan.nama,
      satuan: persediaan.satuan,
      stokSistem: stokOpname.stokSistem,
      stokFisik: stokOpname.stokFisik,
      selisih: stokOpname.selisih,
      keterangan: stokOpname.keterangan,
      petugas: stokOpname.petugas,
      createdAt: stokOpname.createdAt,
    })
    .from(stokOpname)
    .innerJoin(persediaan, eq(persediaan.id, stokOpname.persediaanId))
    .orderBy(desc(stokOpname.tanggal), desc(stokOpname.id))
    .limit(limit);
}

export async function getOpnameById(id: number) {
  await ensureSeed();
  const rows = await db
    .select({
      id: stokOpname.id,
      tanggal: stokOpname.tanggal,
      stokSistem: stokOpname.stokSistem,
      stokFisik: stokOpname.stokFisik,
      selisih: stokOpname.selisih,
      keterangan: stokOpname.keterangan,
      petugas: stokOpname.petugas,
      nama: persediaan.nama,
      kode: persediaan.kode,
      satuan: persediaan.satuan,
      lokasi: persediaan.lokasi,
      kategori: persediaan.kategori,
    })
    .from(stokOpname)
    .innerJoin(persediaan, eq(persediaan.id, stokOpname.persediaanId))
    .where(eq(stokOpname.id, id))
    .limit(1);
  return rows[0] ?? null;
}

/* ------------------------- Peminjaman ------------------------- */

export type PeminjamanListRow = Peminjaman & {
  jumlahItem: number;
  totalUnit: number;
};

export async function getPeminjamanList(filter: { status?: string } = {}) {
  await ensureSeed();
  const base = db
    .select({
      id: peminjaman.id,
      nomorBukti: peminjaman.nomorBukti,
      peminjam: peminjaman.peminjam,
      unit: peminjaman.unit,
      keperluan: peminjaman.keperluan,
      tanggalPinjam: peminjaman.tanggalPinjam,
      rencanaKembali: peminjaman.rencanaKembali,
      tanggalKembali: peminjaman.tanggalKembali,
      status: peminjaman.status,
      petugas: peminjaman.petugas,
      catatan: peminjaman.catatan,
      createdAt: peminjaman.createdAt,
      jumlahItem: sql<number>`count(${peminjamanItem.id})::int`,
      totalUnit: sql<number>`coalesce(sum(${peminjamanItem.jumlah}), 0)::int`,
    })
    .from(peminjaman)
    .leftJoin(peminjamanItem, eq(peminjamanItem.peminjamanId, peminjaman.id))
    .groupBy(peminjaman.id);

  const rows = await (filter.status
    ? base.where(eq(peminjaman.status, filter.status))
    : base
  ).orderBy(desc(peminjaman.tanggalPinjam), desc(peminjaman.id));

  return rows as PeminjamanListRow[];
}

export async function getPeminjamanDetail(id: number): Promise<{
  header: Peminjaman;
  items: PeminjamanItem[];
} | null> {
  await ensureSeed();
  const headerRows = await db
    .select()
    .from(peminjaman)
    .where(eq(peminjaman.id, id))
    .limit(1);
  if (!headerRows[0]) return null;
  const items = await db
    .select()
    .from(peminjamanItem)
    .where(eq(peminjamanItem.peminjamanId, id))
    .orderBy(asc(peminjamanItem.id));
  return { header: headerRows[0], items };
}

export async function getNomorBuktiPeminjaman(tanggal: string) {
  await ensureSeed();
  const rows = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(peminjaman);
  const tahun = tanggal.slice(0, 4) || String(new Date().getFullYear());
  return `BA-PMJ/${tahun}/${String((rows[0]?.total ?? 0) + 1).padStart(3, "0")}`;
}

export async function getInventarisPilihan() {
  await ensureSeed();
  return db
    .select({
      id: inventaris.id,
      kodeBarang: inventaris.kodeBarang,
      namaBarang: inventaris.namaBarang,
      satuan: inventaris.satuan,
      jumlah: inventaris.jumlah,
      lokasi: inventaris.lokasi,
    })
    .from(inventaris)
    .orderBy(asc(inventaris.namaBarang));
}

/* ------------------------- Ringkasan modul ------------------------- */

export async function getModulStats() {
  await ensureSeed();
  const [persediaanRingkas, opnameRows, peminjamanRows] = await Promise.all([
    getPersediaanRingkas(),
    getOpnameList(500),
    getPeminjamanList(),
  ]);

  const aktif = peminjamanRows.filter((row) => row.status !== "kembali").length;
  return {
    persediaan: persediaanRingkas,
    opname: {
      jumlah: opnameRows.length,
      terakhir: opnameRows[0] ?? null,
      selisih: opnameRows.reduce((acc, row) => acc + Math.abs(row.selisih), 0),
    },
    peminjaman: {
      jumlah: peminjamanRows.length,
      aktif,
      totalUnit: peminjamanRows.reduce((acc, row) => acc + row.totalUnit, 0),
    },
  };
}

export type BukuMutasiRow = MutasiRow & { saldo: number };

export async function getBukuMutasi(
  from: string,
  to: string,
): Promise<BukuMutasiRow[]> {
  const [items, rows] = await Promise.all([
    getPersediaanStok(),
    getMutasiList({ to, limit: 2000 }),
  ]);

  const saldoMap = new Map<number, number>(
    items.map((item) => [item.id, item.stokAwal]),
  );

  const ascending = [...rows].sort((a, b) =>
    a.tanggal === b.tanggal ? a.id - b.id : a.tanggal.localeCompare(b.tanggal),
  );

  const result: BukuMutasiRow[] = [];
  for (const row of ascending) {
    const current = saldoMap.get(row.persediaanId) ?? 0;
    const next =
      row.jenis === "masuk"
        ? current + row.jumlah
        : row.jenis === "keluar"
          ? current - row.jumlah
          : current + row.jumlah;
    saldoMap.set(row.persediaanId, next);
    if (row.tanggal >= from) result.push({ ...row, saldo: next });
  }
  return result;
}
