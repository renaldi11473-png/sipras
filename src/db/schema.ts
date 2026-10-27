import {
  date,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 128 }).notNull(),
  nama: varchar("nama", { length: 120 }).notNull(),
  peran: varchar("peran", { length: 40 }).notNull().default("Administrator"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const lembaga = pgTable("lembaga", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 160 }).notNull(),
  kodeLembaga: varchar("kode_lembaga", { length: 24 }).notNull(),
  alamat: varchar("alamat", { length: 240 }).notNull().default(""),
  kota: varchar("kota", { length: 80 }).notNull().default("Semarang"),
  kepalaSekolah: varchar("kepala_sekolah", { length: 120 })
    .notNull()
    .default(""),
  nipKepala: varchar("nip_kepala", { length: 60 }).notNull().default(""),
  penyusun: varchar("penyusun", { length: 120 }).notNull().default(""),
  nipPenyusun: varchar("nip_penyusun", { length: 60 }).notNull().default(""),
  tahunAnggaran: integer("tahun_anggaran").notNull().default(2026),
  keadaanPer: varchar("keadaan_per", { length: 80 })
    .notNull()
    .default("31 Desember 2026"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sheetConnection = pgTable("sheet_connection", {
  id: serial("id").primaryKey(),
  spreadsheetUrl: text("spreadsheet_url").notNull().default(""),
  spreadsheetId: varchar("spreadsheet_id", { length: 160 }).notNull().default(""),
  gid: varchar("gid", { length: 40 }).notNull().default(""),
  sheetName: varchar("sheet_name", { length: 120 }).notNull().default(""),
  method: varchar("method", { length: 24 }).notNull().default("auto"),
  bridgeUrl: text("bridge_url").notNull().default(""),
  targetSheetName: varchar("target_sheet_name", { length: 120 })
    .notNull()
    .default("Inventaris"),
  lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
  lastSyncStatus: varchar("last_sync_status", { length: 24 })
    .notNull()
    .default("belum"),
  lastSyncMessage: text("last_sync_message").notNull().default(""),
  lastSyncCount: integer("last_sync_count").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type SheetConnection = typeof sheetConnection.$inferSelect;

export const inventaris = pgTable("inventaris", {
  id: serial("id").primaryKey(),
  kodeBarang: varchar("kode_barang", { length: 90 }).notNull().unique(),
  namaBarang: varchar("nama_barang", { length: 200 }).notNull(),
  kategori: varchar("kategori", { length: 60 }).notNull().default("Lainnya"),
  jumlah: integer("jumlah").notNull().default(1),
  satuan: varchar("satuan", { length: 24 }).notNull().default("bh"),
  tahunAnggaran: integer("tahun_anggaran").notNull(),
  sumberPerolehan: varchar("sumber_perolehan", { length: 60 })
    .notNull()
    .default("BOS"),
  nilai: integer("nilai").notNull().default(0),
  lokasi: varchar("lokasi", { length: 80 }).notNull().default("Ruang Kelas"),
  kondisi: varchar("kondisi", { length: 20 }).notNull().default("B"),
  keterangan: text("keterangan").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Inventaris = typeof inventaris.$inferSelect;
export type NewInventaris = typeof inventaris.$inferInsert;
export type Lembaga = typeof lembaga.$inferSelect;
export type User = typeof users.$inferSelect;

/* ------------------------------------------------------------------ */
/* Buku Penerimaan / Pengeluaran Persediaan                            */
/* ------------------------------------------------------------------ */

export const persediaan = pgTable("persediaan", {
  id: serial("id").primaryKey(),
  kode: varchar("kode", { length: 60 }).notNull().unique(),
  nama: varchar("nama", { length: 200 }).notNull(),
  kategori: varchar("kategori", { length: 60 }).notNull().default("Lainnya"),
  satuan: varchar("satuan", { length: 24 }).notNull().default("bh"),
  stokAwal: integer("stok_awal").notNull().default(0),
  hargaSatuan: integer("harga_satuan").notNull().default(0),
  lokasi: varchar("lokasi", { length: 80 }).notNull().default("Gudang"),
  stokMinimum: integer("stok_minimum").notNull().default(0),
  catatan: text("catatan").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const persediaanMutasi = pgTable("persediaan_mutasi", {
  id: serial("id").primaryKey(),
  persediaanId: integer("persediaan_id")
    .notNull()
    .references(() => persediaan.id, { onDelete: "cascade" }),
  tanggal: date("tanggal").notNull(),
  jenis: varchar("jenis", { length: 12 }).notNull().default("masuk"),
  jumlah: integer("jumlah").notNull().default(0),
  hargaSatuan: integer("harga_satuan").notNull().default(0),
  noBukti: varchar("no_bukti", { length: 80 }).notNull().default(""),
  pihak: varchar("pihak", { length: 140 }).notNull().default(""),
  keterangan: text("keterangan").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Stok Opname                                                         */
/* ------------------------------------------------------------------ */

export const stokOpname = pgTable("stok_opname", {
  id: serial("id").primaryKey(),
  persediaanId: integer("persediaan_id")
    .notNull()
    .references(() => persediaan.id, { onDelete: "cascade" }),
  tanggal: date("tanggal").notNull(),
  stokSistem: integer("stok_sistem").notNull().default(0),
  stokFisik: integer("stok_fisik").notNull().default(0),
  selisih: integer("selisih").notNull().default(0),
  keterangan: text("keterangan").notNull().default(""),
  petugas: varchar("petugas", { length: 140 }).notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Berita Acara Peminjaman Barang                                      */
/* ------------------------------------------------------------------ */

export const peminjaman = pgTable("peminjaman", {
  id: serial("id").primaryKey(),
  nomorBukti: varchar("nomor_bukti", { length: 80 }).notNull().unique(),
  peminjam: varchar("peminjam", { length: 140 }).notNull(),
  unit: varchar("unit", { length: 140 }).notNull().default(""),
  keperluan: text("keperluan").notNull().default(""),
  tanggalPinjam: date("tanggal_pinjam").notNull(),
  rencanaKembali: date("rencana_kembali").notNull(),
  tanggalKembali: date("tanggal_kembali"),
  status: varchar("status", { length: 20 }).notNull().default("dipinjam"),
  petugas: varchar("petugas", { length: 140 }).notNull().default(""),
  catatan: text("catatan").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const peminjamanItem = pgTable("peminjaman_item", {
  id: serial("id").primaryKey(),
  peminjamanId: integer("peminjaman_id")
    .notNull()
    .references(() => peminjaman.id, { onDelete: "cascade" }),
  inventarisId: integer("inventaris_id"),
  namaBarang: varchar("nama_barang", { length: 200 }).notNull(),
  jumlah: integer("jumlah").notNull().default(1),
  satuan: varchar("satuan", { length: 24 }).notNull().default("bh"),
  kondisiKembali: varchar("kondisi_kembali", { length: 24 })
    .notNull()
    .default(""),
  keterangan: text("keterangan").notNull().default(""),
});

export type Persediaan = typeof persediaan.$inferSelect;
export type PersediaanMutasi = typeof persediaanMutasi.$inferSelect;
export type StokOpname = typeof stokOpname.$inferSelect;
export type Peminjaman = typeof peminjaman.$inferSelect;
export type PeminjamanItem = typeof peminjamanItem.$inferSelect;
