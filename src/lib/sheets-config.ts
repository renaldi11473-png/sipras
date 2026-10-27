import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { inventaris, sheetConnection, type SheetConnection } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import {
  DEFAULT_SPREADSHEET_GID,
  DEFAULT_SPREADSHEET_ID,
  DEFAULT_SPREADSHEET_URL,
  SCHOOL_CODE,
  kodeKategori,
  kodeRuang,
} from "@/lib/constants";
import { getLembaga } from "@/lib/data";
import {
  itemsToMatrix,
  matrixToItems,
  readSheet,
  writeSheet,
  type MappedItem,
  type SheetConnectionConfig,
} from "@/lib/sheets";

export async function getSheetConfig(): Promise<SheetConnection> {
  await ensureSeed();
  const rows = await db.select().from(sheetConnection).orderBy(sheetConnection.id).limit(1);
  if (rows[0]) return rows[0];

  const inserted = await db
    .insert(sheetConnection)
    .values({
      spreadsheetUrl: DEFAULT_SPREADSHEET_URL,
      spreadsheetId: DEFAULT_SPREADSHEET_ID,
      gid: DEFAULT_SPREADSHEET_GID,
      method: "auto",
      targetSheetName: "Inventaris",
      lastSyncStatus: "belum",
      lastSyncMessage: "Belum pernah disinkronkan.",
    })
    .returning();
  return inserted[0];
}

export function toSheetConfig(row: SheetConnection): SheetConnectionConfig {
  return {
    spreadsheetUrl: row.spreadsheetUrl,
    spreadsheetId: row.spreadsheetId,
    gid: row.gid,
    sheetName: row.sheetName,
    method: row.method,
    bridgeUrl: row.bridgeUrl,
    targetSheetName: row.targetSheetName,
  };
}

export async function saveSheetStatus(input: {
  status: string;
  message: string;
  count?: number;
  touchSync?: boolean;
}) {
  const config = await getSheetConfig();
  await db
    .update(sheetConnection)
    .set({
      lastSyncStatus: input.status,
      lastSyncMessage: input.message.slice(0, 900),
      lastSyncCount: input.count ?? config.lastSyncCount,
      lastSyncAt: input.touchSync ? new Date() : config.lastSyncAt,
      updatedAt: new Date(),
    })
    .where(eq(sheetConnection.id, config.id));
}

export type SyncOutcome = {
  ok: boolean;
  message: string;
  hint?: string;
  method?: string;
  total?: number;
  inserted?: number;
  updated?: number;
  preview?: { nama: string; tahun: number; jumlah: number }[];
};

async function applyItems(
  items: MappedItem[],
  mode: "replace" | "merge",
  fallbackTahun: number,
): Promise<{ inserted: number; updated: number }> {
  if (mode === "replace") {
    await db.delete(inventaris);
    if (items.length > 0) {
      await db.insert(inventaris).values(
        items.map((item) => ({ ...item, updatedAt: new Date() })),
      );
    }
    return { inserted: items.length, updated: 0 };
  }

  const existing = await db.select().from(inventaris);
  const byKode = new Map(existing.map((row) => [row.kodeBarang, row]));
  let inserted = 0;
  let updated = 0;

  for (const item of items) {
    const found = byKode.get(item.kodeBarang);
    if (found) {
      await db
        .update(inventaris)
        .set({ ...item, updatedAt: new Date() })
        .where(eq(inventaris.id, found.id));
      updated += 1;
    } else {
      await db.insert(inventaris).values({ ...item, updatedAt: new Date() });
      inserted += 1;
    }
  }
  return { inserted, updated };
}

export async function importMatrix(
  matrix: string[][],
  mode: "replace" | "merge",
  fallbackTahun: number,
): Promise<SyncOutcome & { previewItems: MappedItem[] }> {
  const lembaga = await getLembaga();
  const mapped = matrixToItems(matrix, {
    kodeLembaga: lembaga.kodeLembaga || SCHOOL_CODE,
    fallbackTahun,
    kodeKategori,
    kodeRuang,
  });

  if (mapped.items.length === 0) {
    return {
      ok: false,
      message: "Tidak ada baris inventaris yang dikenali dari data yang ditempel.",
      hint: "Tempel data dengan baris judul kolom 'Nama Barang', misalnya: No | Nama Barang | Jumlah | Sumber Dana.",
      previewItems: [],
    };
  }

  const applied = await applyItems(mapped.items, mode, fallbackTahun);
  const message = `Impor manual berhasil: ${applied.inserted} data baru, ${applied.updated} diperbarui.`;

  await saveSheetStatus({
    status: "sukses",
    message,
    count: mapped.items.length,
    touchSync: true,
  });

  return {
    ok: true,
    message,
    hint:
      mapped.skipped > 0
        ? `${mapped.skipped} baris dilewati (bukan data barang).`
        : undefined,
    total: mapped.items.length,
    inserted: applied.inserted,
    updated: applied.updated,
    preview: mapped.items.slice(0, 3).map((item) => ({
      nama: item.namaBarang,
      tahun: item.tahunAnggaran,
      jumlah: item.jumlah,
    })),
    previewItems: mapped.items,
  };
}

export async function pullFromSheet(options: {
  mode: "replace" | "merge";
  fallbackTahun: number;
}): Promise<SyncOutcome> {
  const config = await getSheetConfig();
  const result = await readSheet(toSheetConfig(config));

  if (!result.ok) {
    await saveSheetStatus({
      status: "gagal",
      message: `${result.error} ${result.hint}`,
    });
    return {
      ok: false,
      message: result.error,
      hint: result.hint,
    };
  }

  const lembaga = await getLembaga();
  const mapped = matrixToItems(result.matrix, {
    kodeLembaga: lembaga.kodeLembaga || SCHOOL_CODE,
    fallbackTahun: options.fallbackTahun,
    kodeKategori,
    kodeRuang,
  });

  if (mapped.items.length === 0) {
    await saveSheetStatus({
      status: "gagal",
      message: "Sheet terbaca, tetapi tidak ada baris barang yang dikenali.",
    });
    return {
      ok: false,
      message: "Tidak ada baris inventaris yang dikenali pada spreadsheet.",
      hint: "Pastikan sheet memiliki kolom 'Nama Barang' (dan opsional Jumlah/Satuan/Tahun/Sumber Dana). Baris judul seperti 'DATA INVENTARIS 2025' akan dibaca sebagai tahun otomatis.",
    };
  }

  const applied = await applyItems(mapped.items, options.mode, options.fallbackTahun);
  const message = `Sinkronisasi ${result.method.toUpperCase()} berhasil: ${applied.inserted} data baru, ${applied.updated} diperbarui.`;

  await saveSheetStatus({
    status: "sukses",
    message,
    count: mapped.items.length,
    touchSync: true,
  });

  return {
    ok: true,
    message,
    hint: mapped.skipped > 0 ? `${mapped.skipped} baris dilewati (bukan data barang).` : undefined,
    method: result.method,
    total: mapped.items.length,
    inserted: applied.inserted,
    updated: applied.updated,
    preview: mapped.items.slice(0, 3).map((item) => ({
      nama: item.namaBarang,
      tahun: item.tahunAnggaran,
      jumlah: item.jumlah,
    })),
  };
}

export async function pushToSheet(): Promise<SyncOutcome> {
  const config = await getSheetConfig();
  const rows = await db.select().from(inventaris);
  if (rows.length === 0) {
    return { ok: false, message: "Belum ada data inventaris untuk dikirim." };
  }

  const items: MappedItem[] = rows.map((row) => ({
    kodeBarang: row.kodeBarang,
    namaBarang: row.namaBarang,
    kategori: row.kategori,
    jumlah: row.jumlah,
    satuan: row.satuan,
    tahunAnggaran: row.tahunAnggaran,
    sumberPerolehan: row.sumberPerolehan,
    nilai: row.nilai,
    lokasi: row.lokasi,
    kondisi: row.kondisi,
    keterangan: row.keterangan,
  }));

  const result = await writeSheet(toSheetConfig(config), itemsToMatrix(items));
  await saveSheetStatus({
    status: result.ok ? "sukses" : "gagal",
    message: result.message,
    count: items.length,
    touchSync: result.ok,
  });

  return {
    ok: result.ok,
    message: result.message,
    method: result.method,
    total: items.length,
  };
}

export async function testSheetConnection(fallbackTahun: number): Promise<SyncOutcome> {
  const config = await getSheetConfig();
  const result = await readSheet(toSheetConfig(config));

  if (!result.ok) {
    await saveSheetStatus({
      status: "gagal",
      message: `${result.error} ${result.hint}`,
    });
    return { ok: false, message: result.error, hint: result.hint };
  }

  const lembaga = await getLembaga();
  const mapped = matrixToItems(result.matrix, {
    kodeLembaga: lembaga.kodeLembaga || SCHOOL_CODE,
    fallbackTahun,
    kodeKategori,
    kodeRuang,
  });

  const message = `Koneksi ${result.method.toUpperCase()} OK — ${mapped.items.length} baris inventaris terdeteksi dari ${result.matrix.length} baris sheet.`;
  await saveSheetStatus({
    status: "siap",
    message,
  });

  return {
    ok: true,
    message,
    method: result.method,
    total: mapped.items.length,
    preview: mapped.items.slice(0, 3).map((item) => ({
      nama: item.namaBarang,
      tahun: item.tahunAnggaran,
      jumlah: item.jumlah,
    })),
  };
}
