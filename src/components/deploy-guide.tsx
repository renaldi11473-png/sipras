"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  GitBranch,
  Rocket,
  Server,
  KeyRound,
  Terminal,
} from "lucide-react";

const ENV_ROWS = [
  { key: "DATABASE_URL", value: "postgresql://user:pass@host/db?sslmode=require", wajib: true },
  { key: "AUTH_SECRET", value: "openssl rand -hex 32", wajib: false },
  { key: "GOOGLE_SERVICE_ACCOUNT_EMAIL", value: "sipras@project.iam.gserviceaccount.com", wajib: false },
  { key: "GOOGLE_PRIVATE_KEY", value: "-----BEGIN PRIVATE KEY-----\\n…", wajib: false },
  { key: "GOOGLE_SHEETS_API_KEY", value: "AIza…", wajib: false },
];

const LANGKAH = [
  {
    icon: GitBranch,
    title: "1. Push ke GitHub",
    body: "Commit seluruh proyek ke repository GitHub (jangan sertakan .env).",
    code: "git init && git add . && git commit -m \"SIPRAS\"\ngit remote add origin https://github.com/USER/sipras.git\ngit push -u origin main",
  },
  {
    icon: Server,
    title: "2. Siapkan PostgreSQL cloud",
    body: "Vercel tidak menyediakan Postgres lokal. Buat database di Neon / Vercel Postgres / Supabase, lalu salin connection string yang memuat sslmode=require.",
    code: "postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require",
  },
  {
    icon: Rocket,
    title: "3. Import di vercel.com/new",
    body: "Pilih team rey-8956 → Import Git Repository → framework terdeteksi Next.js → tambahkan environment variables → Deploy.",
    code: "vercel login\nvercel link\nvercel --prod",
  },
  {
    icon: KeyRound,
    title: "4. Buat tabel di database produksi",
    body: "Jalankan sekali dari laptop dengan DATABASE_URL produksi. Seeder (akun admin, profil lembaga, data contoh) berjalan otomatis saat request pertama.",
    code: "export DATABASE_URL=\"postgresql://…?sslmode=require\"\nnpx drizzle-kit push",
  },
];

export function DeployGuide({ vercelUrl }: { vercelUrl: string }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      setCopied(null);
    }
  };

  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-col gap-3 bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 px-5 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-gold-400 ring-1 ring-white/15">
            <Rocket className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-gold-400">
              Deploy
            </p>
            <h2 className="mt-0.5 font-display text-lg font-semibold">
              Publikasikan ke Vercel
            </h2>
            <p className="mt-0.5 text-[11.5px] text-brand-100/65">
              Butuh akun & izin deploy pada team rey-8956.
            </p>
          </div>
        </div>
        <a
          href={vercelUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-brand-900 transition hover:bg-cream-100"
        >
          Buka Vercel New Project
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2">
        {LANGKAH.map((langkah, index) => {
          const Icon = langkah.icon;
          return (
            <div key={langkah.title} className="rounded-xl border border-brand-900/10 bg-white p-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="text-[13px] font-semibold text-brand-950">{langkah.title}</p>
              </div>
              <p className="mt-2 text-[11.5px] leading-relaxed text-brand-900/60">{langkah.body}</p>
              <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-brand-950 p-2.5">
                <pre className="flex-1 overflow-x-auto whitespace-pre-wrap break-all font-mono text-[10.5px] leading-relaxed text-brand-100/85">
                  {langkah.code}
                </pre>
                <button
                  type="button"
                  onClick={() => copy(langkah.code, `step-${index}`)}
                  aria-label={`Salin perintah ${langkah.title}`}
                  className="grid h-6 w-6 shrink-0 place-items-center rounded text-brand-100/60 transition hover:bg-white/10 hover:text-white"
                >
                  {copied === `step-${index}` ? (
                    <Check className="h-3 w-3 text-emerald-300" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-brand-900/8 px-5 py-4">
        <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-700">
          <Terminal className="h-3.5 w-3.5" /> Environment variables di Vercel
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[11.5px]">
            <thead>
              <tr className="border-b border-brand-900/8 text-[10px] uppercase tracking-[0.1em] text-brand-900/45">
                <th className="py-2 pr-3 font-semibold">Key</th>
                <th className="py-2 pr-3 font-semibold">Contoh</th>
                <th className="py-2 font-semibold">Wajib</th>
              </tr>
            </thead>
            <tbody>
              {ENV_ROWS.map((row) => (
                <tr key={row.key} className="border-b border-brand-900/6 last:border-0">
                  <td className="py-2 pr-3 align-top">
                    <code className="rounded bg-brand-50 px-1.5 py-0.5 font-mono text-[10.5px] text-brand-800 ring-1 ring-brand-100">
                      {row.key}
                    </code>
                  </td>
                  <td className="py-2 pr-3 align-top font-mono text-[10.5px] text-brand-900/55">
                    {row.value}
                  </td>
                  <td className="py-2 align-top">
                    {row.wajib ? (
                      <span className="badge bg-rose-50 text-rose-700 ring-rose-200">wajib</span>
                    ) : (
                      <span className="badge bg-brand-50 text-brand-700 ring-brand-100">opsional</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-brand-900/50">
          Setelah menambah variabel lakukan <strong>Redeploy</strong>. Cek kesehatan
          aplikasi di <code className="font-mono">/api/health</code> — nilai{" "}
          <code className="font-mono">database: connected</code> berarti siap dipakai.
          Panduan lengkap juga tersedia pada berkas <code className="font-mono">DEPLOY.md</code>.
        </p>
      </div>
    </section>
  );
}
