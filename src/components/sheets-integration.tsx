"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  Cloud,
  CloudOff,
  Database,
  ExternalLink,
  FileSpreadsheet,
  Info,
  Link2,
  Loader2,
  PlugZap,
  Save,
  Settings2,
  ShieldAlert,
  Table2,
  Terminal,
} from "lucide-react";
import {
  importPasteAction,
  pullSheetAction,
  pushSheetAction,
  saveSheetConfigAction,
  testSheetAction,
  type SyncState,
} from "@/actions/sheets";
import { KONEKSI_METODE } from "@/lib/constants";

const initial: SyncState = {};
const ID = "sheet-connect";

function ActionButton({
  label,
  pendingLabel,
  icon,
  variant = "primary",
}: {
  label: string;
  pendingLabel: string;
  icon: React.ReactNode;
  variant?: "primary" | "ghost" | "gold";
}) {
  const { pending } = useFormStatus();
  const className =
    variant === "primary"
      ? "btn-primary w-full"
      : variant === "gold"
        ? "btn-gold w-full"
        : "btn-ghost w-full";
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {pending ? pendingLabel : label}
    </button>
  );
}

function Result({ state }: { state: SyncState }) {
  if (!state.message) return null;
  const isError = state.status === "error";
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm ${
        isError
          ? "border-rose-200 bg-rose-50 text-rose-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      <div className="flex items-start gap-2.5">
        {isError ? (
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        ) : (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        )}
        <div className="min-w-0 space-y-1">
          <p className="font-medium">{state.message}</p>
          {state.hint && (
            <p className="text-[12px] leading-relaxed opacity-90">{state.hint}</p>
          )}
          {state.preview && state.preview.length > 0 && (
            <ul className="mt-1.5 space-y-1 text-[11.5px] opacity-90">
              {state.preview.map((item, index) => (
                <li key={`${item.nama}-${index}`}>
                  • {item.nama} — {item.jumlah} unit · {item.tahun}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  belum: { label: "Belum terhubung", className: "bg-slate-100 text-slate-700 ring-slate-200" },
  siap: { label: "Koneksi siap", className: "bg-sky-100 text-sky-800 ring-sky-200" },
  sukses: { label: "Tersinkron", className: "bg-emerald-100 text-emerald-800 ring-emerald-200" },
  gagal: { label: "Perlu perhatian", className: "bg-rose-100 text-rose-800 ring-rose-200" },
};

export function SheetsIntegration({
  config,
  status,
  capabilities,
  jumlahBarang,
}: {
  config: {
    spreadsheetUrl: string;
    spreadsheetId: string;
    gid: string;
    sheetName: string;
    method: string;
    bridgeUrl: string;
    targetSheetName: string;
  };
  status: {
    state: string;
    message: string;
    count: number;
    lastSyncAt: string | null;
  };
  capabilities: { serviceAccount: boolean; apiKey: boolean };
  jumlahBarang: number;
}) {
  const [saveState, saveAction] = useActionState(saveSheetConfigAction, initial);
  const [testState, testAction] = useActionState(testSheetAction, initial);
  const [pullState, pullAction] = useActionState(pullSheetAction, initial);
  const [pushState, pushAction] = useActionState(pushSheetAction, initial);
  const [importState, importAction] = useActionState(importPasteAction, initial);

  const badge = STATUS_STYLE[status.state] ?? STATUS_STYLE.belum;
  const openUrl = config.spreadsheetId
    ? `https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/edit${config.gid ? `#gid=${config.gid}` : ""}`
    : config.spreadsheetUrl;

  return (
    <div className="space-y-5">
      {/* Status ringkas */}
      <section className="panel overflow-hidden">
        <div className="flex flex-col gap-4 bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 px-5 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 text-emerald-300 ring-1 ring-white/15">
              <FileSpreadsheet className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-gold-400">
                Database Google Sheets
              </p>
              <p className="mt-1 truncate font-display text-lg font-semibold">
                {config.spreadsheetId || "Belum dikonfigurasi"}
              </p>
              <p className="mt-0.5 truncate text-[11.5px] text-brand-100/60">
                {config.gid ? `gid ${config.gid} · ` : ""}
                metode {config.method} · {jumlahBarang} baris lokal
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className={`badge ring-1 ${badge.className}`}>
              {badge.label}
            </span>
            {config.spreadsheetId && (
              <a
                href={openUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Buka Spreadsheet
              </a>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3 text-[11.5px] text-brand-900/55">
          <span className="inline-flex items-center gap-1.5">
            <Cloud className="h-3.5 w-3.5" />
            {status.lastSyncAt
              ? `Sinkron terakhir ${status.lastSyncAt}`
              : "Belum pernah sinkron"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Table2 className="h-3.5 w-3.5" />
            {status.count} baris dari sheet
          </span>
          <span className="inline-flex items-center gap-1.5">
            {capabilities.serviceAccount ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
            )}
            Service account {capabilities.serviceAccount ? "tersedia" : "belum ada"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            {capabilities.apiKey ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <CloudOff className="h-3.5 w-3.5 text-brand-900/35" />
            )}
            API key {capabilities.apiKey ? "tersedia" : "belum ada"}
          </span>
        </div>
        {status.message && (
          <p className="border-t border-brand-900/8 bg-cream-50/70 px-5 py-2.5 text-[11.5px] leading-relaxed text-brand-900/60">
            {status.message}
          </p>
        )}
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_1fr]">
        {/* Form koneksi */}
        <section className="panel p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100">
              <Link2 className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-base font-semibold text-brand-950">
                Alamat Spreadsheet
              </h2>
              <p className="text-[11.5px] text-brand-900/50">
                Tempel tautan Google Sheets yang dipakai sebagai database.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Result state={saveState} />

            <form action={saveAction} className="space-y-4">
              <div>
                <label htmlFor={`${ID}-url`} className="label">
                  URL Spreadsheet <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id={`${ID}-url`}
                  name="spreadsheetUrl"
                  defaultValue={config.spreadsheetUrl}
                  rows={2}
                  className="input resize-y font-mono text-[11.5px]"
                  placeholder="https://docs.google.com/spreadsheets/d/…/edit#gid=0"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor={`${ID}-method`} className="label">
                    Metode Koneksi
                  </label>
                  <select
                    id={`${ID}-method`}
                    name="method"
                    defaultValue={config.method}
                    className="input"
                  >
                    {KONEKSI_METODE.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor={`${ID}-sheet`} className="label">
                    Nama Sheet (opsional)
                  </label>
                  <input
                    id={`${ID}-sheet`}
                    name="sheetName"
                    defaultValue={config.sheetName}
                    className="input"
                    placeholder="Data Inventaris"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={`${ID}-bridge`} className="label">
                  URL Apps Script Web App (untuk metode bridge)
                </label>
                <input
                  id={`${ID}-bridge`}
                  name="bridgeUrl"
                  defaultValue={config.bridgeUrl}
                  className="input font-mono text-[11.5px]"
                  placeholder="https://script.google.com/macros/s/AKfycb…/exec"
                />
                <p className="mt-1 text-[11px] text-brand-900/45">
                  Wajib untuk spreadsheet privat. Unduh <code>Code.gs</code> di
                  halaman Pengaturan, deploy sebagai Web App (akses: Anyone).
                </p>
              </div>

              <div>
                <label htmlFor={`${ID}-target`} className="label">
                  Nama Sheet Target saat kirim data
                </label>
                <input
                  id={`${ID}-target`}
                  name="targetSheetName"
                  defaultValue={config.targetSheetName}
                  className="input"
                  placeholder="Inventaris"
                />
              </div>

              <div className="flex flex-col gap-2.5 sm:flex-row">
                <ActionButton
                  label="Simpan konfigurasi"
                  pendingLabel="Menyimpan…"
                  icon={<Save className="h-4 w-4" />}
                />
              </div>
            </form>

            <form action={testAction}>
              <ActionButton
                label="Uji koneksi sekarang"
                pendingLabel="Menguji koneksi…"
                icon={<PlugZap className="h-4 w-4" />}
                variant="ghost"
              />
            </form>
            <Result state={testState} />
          </div>
        </section>

        {/* Aksi sinkronisasi */}
        <div className="space-y-5">
          <section className="panel p-5">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <ArrowDownToLine className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-display text-base font-semibold text-brand-950">
                  Tarik Data dari Spreadsheet
                </h2>
                <p className="text-[11.5px] text-brand-900/50">
                  Spreadsheet → aplikasi (jadikan sheet sebagai sumber data)
                </p>
              </div>
            </div>
            <form action={pullAction} className="space-y-3">
              <div>
                <label htmlFor={`${ID}-mode`} className="label">
                  Mode
                </label>
                <select id={`${ID}-mode`} name="mode" className="input" defaultValue="replace">
                  <option value="replace">Ganti semua data lokal dengan isi sheet</option>
                  <option value="merge">Gabungkan / perbarui berdasarkan kode barang</option>
                </select>
              </div>
              <ActionButton
                label="Tarik data sekarang"
                pendingLabel="Menarik data…"
                icon={<ArrowDownToLine className="h-4 w-4" />}
              />
            </form>
            <div className="mt-3">
              <Result state={pullState} />
            </div>
          </section>

          <section className="panel p-5">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                <ArrowUpFromLine className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-display text-base font-semibold text-brand-950">
                  Kirim Data ke Spreadsheet
                </h2>
                <p className="text-[11.5px] text-brand-900/50">
                  Aplikasi → sheet target (butuh bridge atau service account)
                </p>
              </div>
            </div>
            <form action={pushAction}>
              <ActionButton
                label="Kirim semua data"
                pendingLabel="Mengirim data…"
                icon={<ArrowUpFromLine className="h-4 w-4" />}
                variant="ghost"
              />
            </form>
            <div className="mt-3">
              <Result state={pushState} />
            </div>
          </section>
        </div>
      </div>

      {/* Panduan + impor manual */}
      <div className="grid gap-5 xl:grid-cols-[1.15fr_1fr]">
        <section className="panel p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-gold-600 ring-1 ring-amber-100">
              <Settings2 className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-base font-semibold text-brand-950">
                Cara Menghubungkan (3 pilihan)
              </h2>
              <p className="text-[11.5px] text-brand-900/50">
                Spreadsheet Anda saat ini privat — pilih salah satu langkah berikut.
              </p>
            </div>
          </div>

          <ol className="space-y-4">
            {[
              {
                icon: Cloud,
                title: "1. Bagikan tautan (paling cepat, baca saja)",
                body: "Buka spreadsheet → tombol Bagikan → General access → 'Anyone with the link' → Viewer. Setelah itu metode 'Tautan publik (CSV)' langsung bisa menarik data.",
              },
              {
                icon: Terminal,
                title: "2. Apps Script Web App (privat + bisa kirim data)",
                body: "Extensions → Apps Script → tempel Code.gs (unduh di Pengaturan) → Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone → salin URL /exec ke kolom bridge di atas.",
              },
              {
                icon: Database,
                title: "3. Service Account (otomatis, read & write)",
                body: "Tambahkan GOOGLE_SERVICE_ACCOUNT_EMAIL & GOOGLE_PRIVATE_KEY ke environment, lalu bagikan spreadsheet ke email service account tersebut sebagai Editor.",
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="flex gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-brand-950">{step.title}</p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-brand-900/60">
                      {step.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-brand-900/8 pt-4">
            <Link href="/pengaturan" className="btn-ghost !py-2 text-xs">
              <Terminal className="h-3.5 w-3.5" />
              Unduh Code.gs
            </Link>
            <a
              href="https://developers.google.com/apps-script/guides/web"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900"
            >
              Panduan deploy Web App
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </section>

        <section className="panel p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100">
              <Table2 className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-base font-semibold text-brand-950">
                Impor Tempel (tanpa akses API)
              </h2>
              <p className="text-[11.5px] text-brand-900/50">
                Salin sel dari spreadsheet lalu tempel di sini.
              </p>
            </div>
          </div>

          <div className="mb-3 flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50/70 px-3.5 py-2.5 text-[11.5px] leading-relaxed text-brand-800">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Di Google Sheets tekan <strong>Ctrl/Cmd + A</strong> lalu{" "}
              <strong>Ctrl/Cmd + C</strong>, tempel pada kolom di bawah. Kolom yang
              dikenali: Nama Barang, Jumlah, Satuan, Tahun, Sumber Dana, Nilai,
              Lokasi, Kondisi.
            </span>
          </div>

          <form action={importAction} className="space-y-3">
            <textarea
              name="paste"
              rows={7}
              className="input resize-y font-mono text-[11.5px]"
              placeholder={"No\tNama Barang\tJumlah\tSumber Dana\n1\tBuku Bahasa Indonesia kelas 9\t35 bh\tBOS"}
            />
            <div>
              <label htmlFor={`${ID}-paste-mode`} className="label">
                Mode impor
              </label>
              <select
                id={`${ID}-paste-mode`}
                name="pasteMode"
                defaultValue="merge"
                className="input"
              >
                <option value="merge">Gabungkan / perbarui</option>
                <option value="replace">Ganti seluruh data lokal</option>
              </select>
            </div>
            <ActionButton
              label="Impor data tempelan"
              pendingLabel="Mengimpor…"
              icon={<FileSpreadsheet className="h-4 w-4" />}
              variant="gold"
            />
          </form>
          <div className="mt-3">
            <Result state={importState} />
          </div>
        </section>
      </div>
    </div>
  );
}
