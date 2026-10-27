"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sheetConnection } from "@/db/schema";
import { getLembaga } from "@/lib/data";
import { parseSpreadsheetUrl, parseCsv } from "@/lib/sheets";
import {
  getSheetConfig,
  importMatrix,
  pullFromSheet,
  pushToSheet,
  saveSheetStatus,
  testSheetConnection,
} from "@/lib/sheets-config";
import { KONEKSI_METODE } from "@/lib/constants";

export type SyncState = {
  status?: "idle" | "success" | "error";
  message?: string;
  hint?: string;
  saved?: boolean;
  preview?: { nama: string; tahun: number; jumlah: number }[];
};

function revalidateAll() {
  revalidatePath("/integrasi");
  revalidatePath("/dashboard");
  revalidatePath("/inventaris");
  revalidatePath("/laporan");
}

export async function saveSheetConfigAction(
  _prev: SyncState,
  formData: FormData,
): Promise<SyncState> {
  const rawUrl = String(formData.get("spreadsheetUrl") ?? "").trim();
  const method = String(formData.get("method") ?? "auto").trim();
  const bridgeUrl = String(formData.get("bridgeUrl") ?? "").trim();
  const targetSheetName = String(formData.get("targetSheetName") ?? "").trim();
  const sheetNameInput = String(formData.get("sheetName") ?? "").trim();

  if (!rawUrl) return { status: "error", message: "URL spreadsheet wajib diisi." };
  if (!KONEKSI_METODE.some((item) => item.value === method)) {
    return { status: "error", message: "Metode koneksi tidak dikenal." };
  }

  const parsed = parseSpreadsheetUrl(rawUrl);
  if (!parsed.spreadsheetId) {
    return {
      status: "error",
      message:
        "URL spreadsheet tidak valid. Gunakan tautan seperti https://docs.google.com/spreadsheets/d/ID_SPREADSHEET/edit#gid=0",
    };
  }
  if (method === "bridge" && !bridgeUrl) {
    return {
      status: "error",
      message: "Metode bridge membutuhkan URL Web App Apps Script.",
    };
  }

  const config = await getSheetConfig();
  await db
    .update(sheetConnection)
    .set({
      spreadsheetUrl: rawUrl,
      spreadsheetId: parsed.spreadsheetId,
      gid: parsed.gid,
      method,
      bridgeUrl,
      sheetName: sheetNameInput,
      targetSheetName: targetSheetName || "Inventaris",
      updatedAt: new Date(),
    })
    .where(eq(sheetConnection.id, config.id));

  await saveSheetStatus({
    status: "belum",
    message: "Konfigurasi disimpan. Jalankan uji koneksi untuk memverifikasi akses.",
  });

  revalidateAll();
  return {
    status: "success",
    saved: true,
    message: `Konfigurasi tersimpan. ID spreadsheet: ${parsed.spreadsheetId}${parsed.gid ? ` · gid ${parsed.gid}` : ""}.`,
  };
}

export async function testSheetAction(
  _prev: SyncState,
  _formData: FormData,
): Promise<SyncState> {
  const lembaga = await getLembaga();
  const result = await testSheetConnection(lembaga.tahunAnggaran);
  revalidateAll();
  return {
    status: result.ok ? "success" : "error",
    message: result.message,
    hint: result.hint,
    preview: result.preview,
  };
}

export async function pullSheetAction(
  _prev: SyncState,
  formData: FormData,
): Promise<SyncState> {
  const mode = String(formData.get("mode") ?? "replace") === "merge" ? "merge" : "replace";
  const lembaga = await getLembaga();
  const result = await pullFromSheet({
    mode,
    fallbackTahun: lembaga.tahunAnggaran,
  });
  revalidateAll();
  return {
    status: result.ok ? "success" : "error",
    message: result.message,
    hint: result.hint,
    preview: result.preview,
  };
}

export async function pushSheetAction(
  _prev: SyncState,
  _formData: FormData,
): Promise<SyncState> {
  const result = await pushToSheet();
  revalidateAll();
  return {
    status: result.ok ? "success" : "error",
    message: result.message,
  };
}

export async function importPasteAction(
  _prev: SyncState,
  formData: FormData,
): Promise<SyncState> {
  const text = String(formData.get("paste") ?? "").trim();
  const mode = String(formData.get("pasteMode") ?? "merge") === "replace" ? "replace" : "merge";
  if (!text) {
    return { status: "error", message: "Tempel data spreadsheet terlebih dahulu." };
  }

  const matrix = parseCsv(text);
  const lembaga = await getLembaga();
  const result = await importMatrix(matrix, mode, lembaga.tahunAnggaran);
  revalidateAll();
  return {
    status: result.ok ? "success" : "error",
    message: result.message,
    hint: result.hint,
    preview: result.preview,
  };
}
