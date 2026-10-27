export const KATEGORI = [
  { label: "Buku & Literasi", kode: "BKU" },
  { label: "Meja", kode: "MJA" },
  { label: "Kursi", kode: "KRS" },
  { label: "Lemari & Rak", kode: "LMR" },
  { label: "Elektronik", kode: "ELK" },
  { label: "Alat Peraga", kode: "APR" },
  { label: "Alat Musik", kode: "AMS" },
  { label: "Perlengkapan", kode: "PLK" },
  { label: "Lainnya", kode: "LLN" },
] as const;

export const RUANGAN = [
  { label: "Ruang Kelas 1", kode: "RK1" },
  { label: "Ruang Kelas 2", kode: "RK2" },
  { label: "Ruang Kelas 3", kode: "RK3" },
  { label: "Ruang Guru", kode: "RG" },
  { label: "Ruang Perpustakaan", kode: "RP" },
  { label: "Ruang Komputer", kode: "RKM" },
  { label: "Ruang UKS", kode: "RUK" },
  { label: "Ruang Bermain", kode: "RB" },
  { label: "Gudang", kode: "GD" },
  { label: "Halaman", kode: "HLM" },
  { label: "Semua Ruang", kode: "ALL" },
] as const;

export const SUMBER_PEROLEHAN = [
  "BOS",
  "BOP",
  "Bantuan operasional",
  "Yayasan",
  "Hibah",
  "Kantor",
  "Bantuan orang tua",
] as const;

export const SUMBER_PEROLEHAN_DEFAULT = "BOS";

export const KONDISI = [
  {
    kode: "B",
    label: "Baik",
    warna: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    titik: "bg-emerald-500",
  },
  {
    kode: "RR",
    label: "Rusak Ringan",
    warna: "bg-amber-100 text-amber-800 ring-amber-200",
    titik: "bg-amber-500",
  },
  {
    kode: "RB",
    label: "Rusak Berat",
    warna: "bg-rose-100 text-rose-800 ring-rose-200",
    titik: "bg-rose-500",
  },
  {
    kode: "TA",
    label: "Tidak Ada",
    warna: "bg-slate-100 text-slate-700 ring-slate-200",
    titik: "bg-slate-400",
  },
] as const;

export const SATUAN = ["bh", "Buah", "Unit", "Set", "Paket", "Rim", "Lusin"];

export function kodeKategori(kategori: string) {
  return KATEGORI.find((k) => k.label === kategori)?.kode ?? "LLN";
}

export function kodeRuang(lokasi: string) {
  return RUANGAN.find((r) => r.label === lokasi)?.kode ?? "ALL";
}

export function kondisiInfo(kode: string) {
  return KONDISI.find((k) => k.kode === kode) ?? KONDISI[3];
}

export function formatRupiah(nilai: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(nilai || 0);
}

export function formatAngka(nilai: number) {
  return new Intl.NumberFormat("id-ID").format(nilai || 0);
}

export function buatKodeBarang(input: {
  kodeLembaga: string;
  kategori: string;
  lokasi: string;
  nomor: number;
  tahun: number;
}) {
  const kat = kodeKategori(input.kategori);
  const ruang = kodeRuang(input.lokasi);
  const urut = String(Math.max(1, input.nomor)).padStart(4, "0");
  return `${input.kodeLembaga}/${kat}/${ruang}/${urut}/${input.tahun}`;
}

export const APP_NAME = "SIPRAS SMPS IT Mutiara";
export const APP_LONG_NAME = "Sistem Informasi Sarana & Prasarana";
export const SCHOOL_NAME = "SMPS IT Mutiara";
export const SCHOOL_CODE = "SMPSIT";

export const DEFAULT_SPREADSHEET_URL =
  "https://docs.google.com/spreadsheets/d/1fV8vu9cu0RVTcCXEZ0VN9q0_EKjVZjlRr9aziaOCdYk/edit?gid=347423001#gid=347423001";
export const DEFAULT_SPREADSHEET_ID =
  "1fV8vu9cu0RVTcCXEZ0VN9q0_EKjVZjlRr9aziaOCdYk";
export const DEFAULT_SPREADSHEET_GID = "347423001";

export const KONEKSI_METODE = [
  {
    value: "auto",
    label: "Otomatis (rekomendasi)",
    desc: "Mencoba tautan publik, service account, lalu Apps Script bridge.",
  },
  {
    value: "csv",
    label: "Tautan publik (CSV)",
    desc: "Spreadsheet dibagikan 'Anyone with the link · Viewer'.",
  },
  {
    value: "service",
    label: "Service Account (Google Sheets API)",
    desc: "Butuh GOOGLE_SERVICE_ACCOUNT_EMAIL & GOOGLE_PRIVATE_KEY di server.",
  },
  {
    value: "bridge",
    label: "Apps Script Web App",
    desc: "Cocok untuk spreadsheet privat; deploy Code.gs sebagai Web App.",
  },
  {
    value: "api-key",
    label: "API Key Google",
    desc: "Butuh GOOGLE_SHEETS_API_KEY dan sheet dibagikan publik.",
  },
] as const;
