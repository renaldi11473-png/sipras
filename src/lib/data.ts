import "server-only";

import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { inventaris, lembaga, users, type Inventaris } from "@/db/schema";
import { ensureSeed } from "@/db/seed";

export type InventarisFilter = {
  q?: string;
  tahun?: number;
  kondisi?: string;
  kategori?: string;
};

export async function getLembaga() {
  await ensureSeed();
  const rows = await db.select().from(lembaga).orderBy(asc(lembaga.id)).limit(1);
  if (rows.length > 0) return rows[0];
  const inserted = await db
    .insert(lembaga)
    .values({ nama: "SMPS IT Mutiara", kodeLembaga: "SMPSIT" })
    .returning();
  return inserted[0];
}

export async function getAdminUser() {
  await ensureSeed();
  const rows = await db.select().from(users).orderBy(asc(users.id)).limit(1);
  return rows[0] ?? null;
}

export async function getInventarisList(filter: InventarisFilter = {}) {
  await ensureSeed();

  const conditions = [];
  if (filter.q) {
    const pattern = `%${filter.q}%`;
    conditions.push(
      or(
        ilike(inventaris.namaBarang, pattern),
        ilike(inventaris.kodeBarang, pattern),
        ilike(inventaris.lokasi, pattern),
      ),
    );
  }
  if (filter.tahun) conditions.push(eq(inventaris.tahunAnggaran, filter.tahun));
  if (filter.kondisi) conditions.push(eq(inventaris.kondisi, filter.kondisi));
  if (filter.kategori) conditions.push(eq(inventaris.kategori, filter.kategori));

  const query = db.select().from(inventaris);
  const rows =
    conditions.length > 0
      ? await query
          .where(and(...conditions))
          .orderBy(desc(inventaris.tahunAnggaran), asc(inventaris.kodeBarang))
      : await query
          .orderBy(desc(inventaris.tahunAnggaran), asc(inventaris.kodeBarang));

  return rows;
}

export async function getInventarisById(id: number) {
  await ensureSeed();
  const rows = await db
    .select()
    .from(inventaris)
    .where(eq(inventaris.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getTahunAnggaranList() {
  await ensureSeed();
  const rows = await db
    .selectDistinct({ tahun: inventaris.tahunAnggaran })
    .from(inventaris)
    .orderBy(desc(inventaris.tahunAnggaran));
  return rows.map((row) => row.tahun);
}

export async function getInventarisStats() {
  await ensureSeed();
  const rows = await db.select().from(inventaris);

  const ringkasan = {
    jumlahJenis: rows.length,
    totalUnit: rows.reduce((acc, row) => acc + row.jumlah, 0),
    totalNilai: rows.reduce((acc, row) => acc + row.nilai, 0),
    perTahun: [] as {
      tahun: number;
      jenis: number;
      unit: number;
      nilai: number;
    }[],
    perKondisi: [] as { kode: string; jumlah: number }[],
    perKategori: [] as { kategori: string; jumlah: number; nilai: number }[],
    buku: 0,
    nilaiRataRata: 0,
  };

  const tahunMap = new Map<number, { jenis: number; unit: number; nilai: number }>();
  const kondisiMap = new Map<string, number>();
  const kategoriMap = new Map<string, { jumlah: number; nilai: number }>();

  for (const row of rows) {
    const tahun = tahunMap.get(row.tahunAnggaran) ?? {
      jenis: 0,
      unit: 0,
      nilai: 0,
    };
    tahun.jenis += 1;
    tahun.unit += row.jumlah;
    tahun.nilai += row.nilai;
    tahunMap.set(row.tahunAnggaran, tahun);

    kondisiMap.set(row.kondisi, (kondisiMap.get(row.kondisi) ?? 0) + 1);

    const kategori = kategoriMap.get(row.kategori) ?? { jumlah: 0, nilai: 0 };
    kategori.jumlah += row.jumlah;
    kategori.nilai += row.nilai;
    kategoriMap.set(row.kategori, kategori);
  }

  ringkasan.perTahun = [...tahunMap.entries()]
    .map(([tahun, value]) => ({ tahun, ...value }))
    .sort((a, b) => b.tahun - a.tahun);

  ringkasan.perKondisi = [...kondisiMap.entries()]
    .map(([kode, jumlah]) => ({ kode, jumlah }))
    .sort((a, b) => b.jumlah - a.jumlah);

  ringkasan.perKategori = [...kategoriMap.entries()]
    .map(([kategori, value]) => ({ kategori, ...value }))
    .sort((a, b) => b.nilai - a.nilai);

  ringkasan.buku = rows.filter((row) => row.kategori === "Buku & Literasi").length;
  ringkasan.nilaiRataRata =
    ringkasan.jumlahJenis > 0
      ? Math.round(ringkasan.totalNilai / ringkasan.jumlahJenis)
      : 0;

  return ringkasan;
}

export async function getInventarisTerbaru(limit = 5): Promise<Inventaris[]> {
  await ensureSeed();
  return db
    .select()
    .from(inventaris)
    .orderBy(desc(inventaris.createdAt), desc(inventaris.id))
    .limit(limit);
}

export async function getNomorUrutMap() {
  await ensureSeed();
  const rows = await db
    .select({
      tahun: inventaris.tahunAnggaran,
      total: sql<number>`count(*)::int`,
    })
    .from(inventaris)
    .groupBy(inventaris.tahunAnggaran);

  return Object.fromEntries(
    rows.map((row) => [String(row.tahun), Number(row.total) + 1]),
  ) as Record<string, number>;
}

export async function getNomorUrutBerikutnya(tahun: number) {
  await ensureSeed();
  const rows = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(inventaris)
    .where(eq(inventaris.tahunAnggaran, tahun));
  return (rows[0]?.total ?? 0) + 1;
}
