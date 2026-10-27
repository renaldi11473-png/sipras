import "server-only";

import { createSign } from "node:crypto";

export type Matrix = string[][];

export type SheetConnectionConfig = {
  spreadsheetUrl: string;
  spreadsheetId: string;
  gid: string;
  sheetName: string;
  method: string;
  bridgeUrl: string;
  targetSheetName: string;
};

export type FetchAttempt = { method: string; message: string };

export type SheetFetchResult =
  | {
      ok: true;
      method: string;
      matrix: Matrix;
      note?: string;
      sheetTitle?: string;
    }
  | { ok: false; error: string; hint: string; tried: FetchAttempt[] };

export type MappedItem = {
  kodeBarang: string;
  namaBarang: string;
  kategori: string;
  jumlah: number;
  satuan: string;
  tahunAnggaran: number;
  sumberPerolehan: string;
  nilai: number;
  lokasi: string;
  kondisi: string;
  keterangan: string;
};

export type MapResult = {
  items: MappedItem[];
  skipped: number;
  columns: string[];
  sections: string[];
};

const SERVICE_ACCOUNT_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

/* ------------------------------------------------------------------ */
/* URL parsing                                                         */
/* ------------------------------------------------------------------ */

export function parseSpreadsheetUrl(input: string): {
  spreadsheetId: string;
  gid: string;
} {
  const url = input.trim();
  const idMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]{20,})/);
  const gidMatch =
    url.match(/[?&#]gid=([0-9]+)/) ?? url.match(/\/d\/[^/]+\/[^/]*gid=([0-9]+)/);
  return {
    spreadsheetId: idMatch?.[1] ?? (/^[a-zA-Z0-9-_]{20,}$/.test(url) ? url : ""),
    gid: gidMatch?.[1] ?? "",
  };
}

/* ------------------------------------------------------------------ */
/* CSV helpers                                                         */
/* ------------------------------------------------------------------ */

export function parseCsv(text: string): Matrix {
  const clean = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const firstLine = clean.split("\n").find((line) => line.trim().length > 0) ?? "";
  const counts: Record<string, number> = {
    ",": (firstLine.match(/,/g) ?? []).length,
    ";": (firstLine.match(/;/g) ?? []).length,
    "\t": (firstLine.match(/\t/g) ?? []).length,
  };
  const delimiter = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] || ",";

  const rows: Matrix = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < clean.length; i += 1) {
    const char = clean[i];
    if (inQuotes) {
      if (char === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === delimiter) {
      row.push(field.trim());
      field = "";
      continue;
    }
    if (char === "\n") {
      row.push(field.trim());
      rows.push(row);
      row = [];
      field = "";
      continue;
    }
    field += char;
  }
  row.push(field.trim());
  rows.push(row);

  return rows.filter((cells) => cells.some((cell) => cell.length > 0));
}

/* ------------------------------------------------------------------ */
/* Google auth                                                         */
/* ------------------------------------------------------------------ */

function base64url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

async function getServiceAccountToken(): Promise<string | null> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY ?? process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!email || !rawKey) return null;
  const key = rawKey.replace(/\\n/g, "\n");

  try {
    const now = Math.floor(Date.now() / 1000);
    const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const claim = base64url(
      JSON.stringify({
        iss: email,
        scope: SERVICE_ACCOUNT_SCOPE,
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600,
      }),
    );
    const signingInput = `${header}.${claim}`;
    const signer = createSign("RSA-SHA256");
    signer.update(signingInput);
    const signature = signer.sign(key).toString("base64url");

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: `${signingInput}.${signature}`,
      }),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const json = (await response.json()) as { access_token?: string };
    return json.access_token ?? null;
  } catch {
    return null;
  }
}

export function hasServiceAccount() {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      (process.env.GOOGLE_PRIVATE_KEY || process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  );
}

export function hasApiKey() {
  return Boolean(process.env.GOOGLE_SHEETS_API_KEY ?? process.env.GOOGLE_API_KEY);
}

function apiKeyValue() {
  return process.env.GOOGLE_SHEETS_API_KEY ?? process.env.GOOGLE_API_KEY ?? "";
}

/* ------------------------------------------------------------------ */
/* Sheet readers                                                       */
/* ------------------------------------------------------------------ */

async function fetchPublicCsv(config: SheetConnectionConfig): Promise<Matrix> {
  if (!config.spreadsheetId) throw new Error("ID spreadsheet belum diisi.");
  const params = new URLSearchParams({ format: "csv" });
  if (config.gid) params.set("gid", config.gid);
  const url = `https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/export?${params.toString()}`;

  const response = await fetch(url, { redirect: "follow", cache: "no-store" });
  const contentType = response.headers.get("content-type") ?? "";
  if (!response.ok || contentType.includes("text/html")) {
    throw new Error(
      `Spreadsheet belum bisa diakses publik (HTTP ${response.status}).`,
    );
  }
  const matrix = parseCsv(await response.text());
  if (matrix.length === 0) throw new Error("Spreadsheet kosong / tanpa data.");
  return matrix;
}

async function resolveSheetTitle(
  spreadsheetId: string,
  token: string | null,
  gid: string,
  fallback: string,
) {
  const query = token ? "" : `?key=${apiKeyValue()}`;
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties(sheetId,title)&${query}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: "no-store",
    },
  );
  if (!response.ok) return fallback;
  const json = (await response.json()) as {
    sheets?: { properties?: { sheetId?: number; title?: string } }[];
  };
  const sheets = json.sheets ?? [];
  const byGid = gid
    ? sheets.find((sheet) => String(sheet.properties?.sheetId) === String(gid))
    : undefined;
  return byGid?.properties?.title ?? sheets[0]?.properties?.title ?? fallback;
}

async function fetchSheetsApi(
  config: SheetConnectionConfig,
  token: string | null,
): Promise<{ matrix: Matrix; title: string }> {
  const title =
    config.sheetName ||
    (await resolveSheetTitle(
      config.spreadsheetId,
      token,
      config.gid,
      "Sheet1",
    ));
  const query = token ? "" : `?key=${apiKeyValue()}&majorDimension=ROWS`;
  const params = token ? "?majorDimension=ROWS" : query;
  const range = encodeURIComponent(`${title}!A1:Z5000`);
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${range}${params}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: "no-store",
    },
  );
  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Google Sheets API menolak permintaan (HTTP ${response.status}): ${body.slice(0, 160)}`,
    );
  }
  const json = (await response.json()) as { values?: (string | number)[][] };
  const matrix = (json.values ?? []).map((row) =>
    row.map((cell) => String(cell ?? "").trim()),
  );
  if (matrix.length === 0) throw new Error("Sheet tidak berisi data.");
  return { matrix, title };
}

function coerceMatrix(payload: unknown): Matrix {
  const data = payload as {
    rows?: unknown;
    values?: unknown;
    data?: unknown;
  };
  const candidate = data?.rows ?? data?.values ?? data?.data;
  if (!Array.isArray(candidate)) throw new Error("Respons bridge tanpa array data.");

  if (candidate.length > 0 && !Array.isArray(candidate[0])) {
    const objects = candidate as Record<string, unknown>[];
    const keys = Object.keys(objects[0] ?? {});
    return [
      keys,
      ...objects.map((item) => keys.map((key) => String(item[key] ?? ""))),
    ];
  }
  return (candidate as unknown[][]).map((row) =>
    row.map((cell) => String(cell ?? "").trim()),
  );
}

async function fetchBridge(config: SheetConnectionConfig): Promise<Matrix> {
  if (!config.bridgeUrl) throw new Error("URL Apps Script bridge belum diisi.");
  const url = new URL(config.bridgeUrl);
  url.searchParams.set("action", "list");
  if (config.sheetName) url.searchParams.set("sheet", config.sheetName);

  const response = await fetch(url.toString(), {
    redirect: "follow",
    cache: "no-store",
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Bridge merespons HTTP ${response.status}.`);
  }
  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error(
      "Bridge tidak mengembalikan JSON. Pastikan deploy Apps Script sebagai Web App.",
    );
  }
  const matrix = coerceMatrix(payload);
  if (matrix.length === 0) throw new Error("Bridge tidak mengembalikan baris data.");
  return matrix;
}

export async function readSheet(
  config: SheetConnectionConfig,
): Promise<SheetFetchResult> {
  const methods =
    config.method === "auto"
      ? ["service", "csv", "bridge", "api-key"]
      : [config.method];

  const tried: FetchAttempt[] = [];
  let note: string | undefined;
  let sheetTitle: string | undefined;

  for (const method of methods) {
    try {
      if (method === "service") {
        const token = await getServiceAccountToken();
        if (!token) {
          tried.push({
            method,
            message:
              "Service account belum dikonfigurasi (GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY).",
          });
          continue;
        }
        const result = await fetchSheetsApi(config, token);
        return {
          ok: true,
          method: "service",
          matrix: result.matrix,
          sheetTitle: result.title,
        };
      }

      if (method === "api-key") {
        if (!hasApiKey()) {
          tried.push({ method, message: "GOOGLE_SHEETS_API_KEY belum tersedia." });
          continue;
        }
        const result = await fetchSheetsApi(config, null);
        return {
          ok: true,
          method: "api-key",
          matrix: result.matrix,
          sheetTitle: result.title,
        };
      }

      if (method === "bridge") {
        const matrix = await fetchBridge(config);
        return { ok: true, method: "bridge", matrix };
      }

      const matrix = await fetchPublicCsv(config);
      note =
        "Terbaca sebagai tautan publik (CSV). Untuk spreadsheet privat gunakan Apps Script bridge atau service account.";
      return { ok: true, method: "csv", matrix, note };
    } catch (error) {
      tried.push({
        method,
        message: error instanceof Error ? error.message : "Gagal membaca sheet.",
      });
    }
  }

  const hint = hasServiceAccount()
    ? "Kredensial service account terdeteksi, tetapi akses ke spreadsheet ini belum diberikan. Bagikan spreadsheet ke email service account (Viewer/Editor)."
    : "Spreadsheet masih privat (HTTP 401). Pilih salah satu: (1) Bagikan spreadsheet → Anyone with the link → Viewer, (2) deploy Code.gs sebagai Apps Script Web App lalu tempel URL-nya, atau (3) tambahkan GOOGLE_SERVICE_ACCOUNT_EMAIL & GOOGLE_PRIVATE_KEY di environment secrets lalu bagikan sheet ke email tersebut.";

  const meaningful = tried.filter(
    (attempt) =>
      !/belum dikonfigurasi|belum tersedia|GOOGLE_SHEETS_API_KEY belum|GOOGLE_SERVICE_ACCOUNT|URL Apps Script bridge belum/i.test(
        attempt.message,
      ),
  );
  const error =
    meaningful.find((attempt) => attempt.method === "csv")?.message ??
    meaningful.at(-1)?.message ??
    "Gagal membaca spreadsheet. Periksa konfigurasi koneksi.";

  return {
    ok: false,
    error,
    hint,
    tried,
  };
}

/* ------------------------------------------------------------------ */
/* Sheet writer                                                        */
/* ------------------------------------------------------------------ */

export async function writeSheet(
  config: SheetConnectionConfig,
  matrix: Matrix,
): Promise<{ ok: boolean; method?: string; message: string }> {
  if (config.method === "bridge" || config.bridgeUrl) {
    try {
      const response = await fetch(config.bridgeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "replace",
          sheetName: config.targetSheetName || config.sheetName || "Inventaris",
          values: matrix,
        }),
        redirect: "follow",
        cache: "no-store",
      });
      const text = await response.text();
      let payload: { ok?: boolean; message?: string } = {};
      try {
        payload = JSON.parse(text) as { ok?: boolean; message?: string };
      } catch {
        return {
          ok: false,
          message: `Bridge merespons non-JSON (HTTP ${response.status}).`,
        };
      }
      if (!response.ok || payload.ok === false) {
        return {
          ok: false,
          message: payload.message ?? `Bridge menolak penulisan (HTTP ${response.status}).`,
        };
      }
      return { ok: true, method: "bridge", message: payload.message ?? "Data terkirim." };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Gagal mengirim ke bridge.",
      };
    }
  }

  const token = await getServiceAccountToken();
  if (!token) {
    return {
      ok: false,
      message:
        "Penulisan ke Google Sheets membutuhkan Apps Script bridge atau service account dengan hak Editor.",
    };
  }

  const title =
    config.targetSheetName ||
    config.sheetName ||
    (await resolveSheetTitle(config.spreadsheetId, token, config.gid, "Inventaris"));
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}`;
  const auth = { Authorization: `Bearer ${token}` };

  const clearResponse = await fetch(
    `${base}/values/${encodeURIComponent(`${title}!A1:Z10000`)}:clear`,
    { method: "POST", headers: auth, cache: "no-store" },
  );
  if (!clearResponse.ok) {
    return {
      ok: false,
      message: `Gagal mengosongkan sheet "${title}" (HTTP ${clearResponse.status}). Pastikan sheet ada & service account punya akses Editor.`,
    };
  }

  const updateResponse = await fetch(
    `${base}/values/${encodeURIComponent(`${title}!A1`)}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ majorDimension: "ROWS", values: matrix }),
      cache: "no-store",
    },
  );

  if (!updateResponse.ok) {
    return {
      ok: false,
      message: `Gagal menulis ke sheet (HTTP ${updateResponse.status}).`,
    };
  }
  return {
    ok: true,
    method: "service",
    message: `Berhasil menulis ${matrix.length - 1} baris ke sheet "${title}".`,
  };
}

/* ------------------------------------------------------------------ */
/* Row mapping                                                         */
/* ------------------------------------------------------------------ */

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const HEADER_ALIASES: Record<string, string[]> = {
  kode: ["kodebarang", "kode", "kodet", "kodeaset", "nomorkode"],
  nama: ["namabarang", "nama", "namat", "uraian", "jenisbarang", "barang"],
  jumlah: ["jumlah", "jml", "qty", "banyak", "volume", "kuantitas"],
  satuan: ["satuan", "unit", "uom"],
  tahun: ["tahunanggaran", "tahun", "thn", "periode"],
  sumber: ["sumberperolehan", "sumberdana", "sumber", "dana", "perolehan", "asal"],
  nilai: ["nilai", "nilairep", "nilarp", "harga", "hargasatuan", "jumlahharga", "total", "nilairupiah"],
  lokasi: ["lokasi", "ruang", "tempat", "lokasiruang", "ruangan"],
  kondisi: ["kondisi", "keadaan", "status"],
  keterangan: ["keterangan", "ket", "catatan", "keterangant"],
};

function detectColumns(row: string[]) {
  const map: Record<string, number> = {};
  row.forEach((cell, index) => {
    const normalized = normalizeHeader(cell);
    if (!normalized) return;
    for (const [key, aliases] of Object.entries(HEADER_ALIASES)) {
      if (map[key] !== undefined) continue;
      if (aliases.includes(normalized)) map[key] = index;
    }
  });
  return map;
}

export function toNumber(value: string | undefined): number {
  if (!value) return 0;
  const cleaned = value
    .replace(/rp/gi, "")
    .replace(/[^\d.,-]/g, "")
    .trim();
  if (!cleaned) return 0;
  let normalized = cleaned;
  if (cleaned.includes(",")) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    normalized = cleaned.replace(/\./g, "");
  } else {
    normalized = cleaned.replace(/\./g, "");
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

const TAHUN_RE = /\b(20\d{2})\b/;

function inferKategori(nama: string) {
  const text = nama.toLowerCase();
  if (/buku|literasi|modul|teks|smart book|kamus|ensiklopedia|komik|lks|worksheet|koding/.test(text))
    return "Buku & Literasi";
  if (/meja/.test(text)) return "Meja";
  if (/kursi|bangku/.test(text)) return "Kursi";
  if (/lemari|rak|kabinet/.test(text)) return "Lemari & Rak";
  if (/komputer|laptop|pc|proyektor|projector|tv|monitor|printer|dispenser|elektronik|kamera|speaker|sound|router|arduino|robot|kit listrik/.test(text))
    return "Elektronik";
  if (/musik|drum|gitar|angklung|keyboard|piano/.test(text)) return "Alat Musik";
  if (/papan|gerobak|tempat sampah|keset|gordyn|ayunan|perosotan|bendera|perlengkapan/.test(text))
    return "Perlengkapan";
  if (/alat peraga|puzzle|permainan|ape|media/.test(text)) return "Alat Peraga";
  return "Lainnya";
}

function inferLokasi(kategori: string, nama: string) {
  const text = nama.toLowerCase();
  if (kategori === "Buku & Literasi") return "Ruang Perpustakaan";
  if (/komputer|laptop|pc|robot|arduino|koding/.test(text)) return "Ruang Komputer";
  if (kategori === "Alat Musik") return "Gudang";
  if (kategori === "Elektronik") return "Ruang Guru";
  if (/papan|gerobak|bendera/.test(text)) return "Halaman";
  return "Ruang Kelas 1";
}

function normalizeSatuan(value: string) {
  const text = value.trim().toLowerCase();
  if (!text) return "bh";
  if (["bh", "buah", "biji", "pcs", "pc", "unit"].includes(text)) {
    return text === "biji" || text === "pcs" || text === "pc" ? "bh" : text === "unit" ? "Unit" : "bh";
  }
  if (text.startsWith("pak")) return "Paket";
  if (text.startsWith("set")) return "Set";
  if (text.startsWith("rim")) return "Rim";
  if (text.startsWith("lusin") || text === "ds") return "Lusin";
  return value.trim();
}

function normalizeSumber(value: string) {
  const text = value.trim();
  const lower = text.toLowerCase();
  if (!text) return "BOS";
  if (lower.includes("bos")) return "BOS";
  if (lower === "bop" || lower.includes("bop")) return "BOP";
  if (lower.includes("yayasan")) return "Yayasan";
  if (lower.includes("hibah") || lower.includes("sumbangan")) return "Hibah";
  if (lower.includes("kantor")) return "Kantor";
  if (lower.includes("bantuan") && lower.includes("orang tua")) return "Bantuan orang tua";
  if (lower.includes("bantuan")) return "Bantuan operasional";
  return text.slice(0, 60);
}

function normalizeKondisi(value: string) {
  const text = value.trim().toLowerCase();
  if (!text) return "B";
  if (text === "b" || text.includes("baik") || text.includes("bagus")) return "B";
  if (text.includes("ringan") || text === "rr") return "RR";
  if (text.includes("berat") || text === "rb") return "RB";
  if (text.includes("tidak") || text === "ta" || text.includes("hilang")) return "TA";
  return "B";
}

function looksLikeHeaderRow(row: string[]) {
  return row.some((cell) => normalizeHeader(cell).includes("namabarang"));
}

function isTitleRow(cells: string[]) {
  const filled = cells.filter((cell) => cell.trim().length > 0);
  if (filled.length !== 1) return false;
  return /inventaris|register|daftar|data\s+aset|rekap/i.test(filled[0]);
}

export function matrixToItems(
  matrix: Matrix,
  options: {
    kodeLembaga: string;
    fallbackTahun: number;
    kodeKategori: (kategori: string) => string;
    kodeRuang: (lokasi: string) => string;
  },
): MapResult {
  const headerIndex = matrix
    .slice(0, 25)
    .findIndex(
      (row) => Object.keys(detectColumns(row)).length >= 2 && looksLikeHeaderRow(row),
    );

  let columns = headerIndex >= 0 ? detectColumns(matrix[headerIndex]) : {};
  // Iterasi dari baris pertama agar judul seksi ("DATA INVENTARIS 2025")
  // sebelum baris header tetap terbaca sebagai penanda tahun.
  const startIndex = 0;

  const sections: string[] = [];
  const items: MappedItem[] = [];
  let skipped = 0;
  let currentYear = 0;
  const counters = new Map<number, number>();
  const usedKode = new Set<string>();

  for (let index = startIndex; index < matrix.length; index += 1) {
    const raw = matrix[index];
    const cells = raw.map((cell) => (cell ?? "").toString().trim());
    if (cells.every((cell) => cell.length === 0)) continue;

    const joined = cells.filter(Boolean).join(" ");
    const yearInRow = joined.match(TAHUN_RE)?.[1];

    if (isTitleRow(cells)) {
      const title = cells.find((cell) => cell.length > 0) ?? "";
      if (yearInRow) currentYear = Number(yearInRow);
      sections.push(title);
      continue;
    }

    if (looksLikeHeaderRow(cells)) {
      columns = detectColumns(cells);
      if (yearInRow) currentYear = Number(yearInRow);
      continue;
    }

    let nama = columns.nama !== undefined ? cells[columns.nama] ?? "" : "";
    if (!nama) {
      // Fallback: assume layout No | Nama | Jumlah | Sumber
      const candidate = cells.find(
        (cell, cellIndex) =>
          cellIndex > 0 &&
          cell.length > 2 &&
          Number.isNaN(Number(cell)) &&
          !/^(bos|bop|hibah|yayasan|kantor)$/i.test(cell) &&
          !TAHUN_RE.test(cell),
      );
      nama = candidate ?? "";
    }
    nama = nama.replace(/^\d+\s*[.)]?\s*/, "").trim();
    if (!nama || /^no\.?$/i.test(nama) || /jumlah|sumber|total/i.test(nama)) {
      skipped += 1;
      continue;
    }

    const jumlahCell = columns.jumlah !== undefined ? cells[columns.jumlah] ?? "" : "";
    const jumlahMatch = jumlahCell.match(/[\d.,]+/);
    const jumlah = Math.max(1, Math.round(toNumber(jumlahMatch?.[0] ?? "1")));

    const satuanCell = columns.satuan !== undefined ? cells[columns.satuan] ?? "" : "";
    const satuanText =
      satuanCell || (/[\d.,]+\s*([a-zA-Z]+)/.exec(jumlahCell)?.[1] ?? "bh");

    const tahun = columns.tahun !== undefined && cells[columns.tahun]
      ? Number((cells[columns.tahun] ?? "").match(TAHUN_RE)?.[1] ?? 0) || currentYear || options.fallbackTahun
      : currentYear || options.fallbackTahun;

    const kategoriRaw = columns.kategori !== undefined ? cells[columns.kategori] ?? "" : "";
    const kategori = inferKategori(`${kategoriRaw} ${nama}`);
    const lokasiRaw = columns.lokasi !== undefined ? cells[columns.lokasi] ?? "" : "";
    const lokasi = lokasiRaw || inferLokasi(kategori, nama);

    const nilaiCell = columns.nilai !== undefined ? cells[columns.nilai] ?? "" : "";
    const nilai = Math.round(toNumber(nilaiCell));

    const sumberCell = columns.sumber !== undefined ? cells[columns.sumber] ?? "" : "";
    const kondisiCell = columns.kondisi !== undefined ? cells[columns.kondisi] ?? "" : "";
    const keteranganCell = columns.keterangan !== undefined ? cells[columns.keterangan] ?? "" : "";

    let kode = columns.kode !== undefined ? cells[columns.kode] ?? "" : "";
    if (!kode) {
      const next = (counters.get(tahun) ?? 0) + 1;
      counters.set(tahun, next);
      kode = `${options.kodeLembaga}/${options.kodeKategori(kategori)}/${options.kodeRuang(lokasi)}/${String(next).padStart(4, "0")}/${tahun}`;
    }
    let unique = kode;
    let suffix = 2;
    while (usedKode.has(unique)) {
      unique = `${kode}-${suffix}`;
      suffix += 1;
    }
    usedKode.add(unique);

    items.push({
      kodeBarang: unique.slice(0, 90),
      namaBarang: nama.slice(0, 200),
      kategori,
      jumlah,
      satuan: normalizeSatuan(satuanText),
      tahunAnggaran: Number.isFinite(tahun) && tahun > 2000 ? tahun : options.fallbackTahun,
      sumberPerolehan: normalizeSumber(sumberCell),
      nilai,
      lokasi,
      kondisi: normalizeKondisi(kondisiCell),
      keterangan: keteranganCell.slice(0, 400),
    });
  }

  return {
    items,
    skipped,
    columns: Object.keys(columns),
    sections: [...new Set(sections)].slice(0, 8),
  };
}

export function itemsToMatrix(items: MappedItem[]): Matrix {
  const header = [
    "No",
    "Kode Barang",
    "Nama Barang",
    "Jumlah",
    "Satuan",
    "Tahun Anggaran",
    "Sumber Perolehan",
    "Nilai (Rp)",
    "Lokasi / Ruang",
    "Kondisi",
    "Keterangan",
  ];
  const rows = items.map((item, index) => [
    String(index + 1),
    item.kodeBarang,
    item.namaBarang,
    String(item.jumlah),
    item.satuan,
    String(item.tahunAnggaran),
    item.sumberPerolehan,
    String(item.nilai),
    item.lokasi,
    item.kondisi,
    item.keterangan,
  ]);
  return [
    ["DAFTAR INVENTARIS BARANG", "SMPS IT Mutiara"],
    [],
    header,
    ...rows,
  ];
}
