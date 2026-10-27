import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Cloud,
  Database,
  ExternalLink,
  FileBarChart2,
  FileSpreadsheet,
  KeyRound,
  Laptop,
  LogIn,
  PackagePlus,
  PlugZap,
  Printer,
  RefreshCw,
  Terminal,
} from "lucide-react";
import { DeployGuide } from "@/components/deploy-guide";
import { PageHeading } from "@/components/ui";
import { SCHOOL_NAME } from "@/lib/constants";

export const metadata: Metadata = { title: "Panduan Menjalankan" };
export const dynamic = "force-dynamic";

const LANGKAH_PAKAI = [
  {
    icon: LogIn,
    title: "1. Masuk ke aplikasi",
    body: "Buka halaman login lalu gunakan username admin dan password admin. Sesi berlaku 8 jam; tombol keluar ada di bawah sidebar.",
    href: "/login",
    cta: "Halaman login",
  },
  {
    icon: PackagePlus,
    title: "2. Input atau impor data barang",
    body: "Gunakan menu Input Barang untuk menambah satu per satu, atau menu Sinkronisasi Sheet / Impor Tempel untuk memasukkan data dari Google Sheets sekaligus.",
    href: "/inventaris/baru",
    cta: "Input barang",
  },
  {
    icon: RefreshCw,
    title: "3. Hubungkan spreadsheet",
    body: "Tempel URL spreadsheet, uji koneksi, lalu tarik datanya. Bisa juga mengirim balik data aplikasi ke Google Sheets.",
    href: "/integrasi",
    cta: "Sinkronisasi Sheet",
  },
  {
    icon: Printer,
    title: "4. Cetak laporan",
    body: "Buka menu Laporan, pilih tahun anggaran, lalu klik Cetak / Simpan PDF. Pilih ukuran A4 landscape dan aktifkan background graphics.",
    href: "/laporan",
    cta: "Buka laporan",
  },
];

const OPSI_JALAN = [
  {
    icon: Cloud,
    title: "A. Lewat tautan preview (paling cepat)",
    badge: "Tanpa instalasi",
    steps: [
      "Buka URL preview aplikasi yang diberikan platform (contoh: https://3000-….e2b.app).",
      "Klik Masuk, lalu isi username admin dan password admin.",
      "Database PostgreSQL dan data contoh sudah aktif otomatis di server preview.",
    ],
  },
  {
    icon: Laptop,
    title: "B. Jalankan di komputer sendiri",
    badge: "Untuk pengembangan",
    steps: [
      "Pastikan Node.js 20+ dan PostgreSQL sudah terpasang.",
      "Jalankan npm install pada folder proyek.",
      "Buat file .env berisi DATABASE_URL=postgresql://user:pass@127.0.0.1:5432/app_db.",
      "Jalankan npx drizzle-kit push untuk membuat tabel, lalu npm run dev.",
      "Buka http://localhost:3000 — login admin / admin.",
    ],
  },
  {
    icon: FileSpreadsheet,
    title: "C. Versi Google Apps Script murni",
    badge: "100% di Google",
    steps: [
      "Unduh berkas Code.gs dari menu Pengaturan.",
      "Buat Google Spreadsheet baru → Extensions → Apps Script.",
      "Ganti seluruh isi Code.gs dengan berkas tadi, simpan.",
      "Jalankan fungsi setup() sekali dan izinkan akses.",
      "Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone.",
      "Buka URL /exec, login admin / admin. Input data dan cetak laporan lewat Google Docs.",
    ],
  },
];

const KONEKSI = [
  {
    title: "1. Tautan publik (paling mudah)",
    body: "Di Google Sheets: Bagikan → General access → Anyone with the link → Viewer. Lalu di aplikasi pilih metode Tautan publik (CSV) dan klik Uji koneksi.",
  },
  {
    title: "2. Apps Script bridge (privat, dua arah)",
    body: "Deploy Code.gs sebagai Web App, salin URL yang berakhiran /exec, tempel di kolom URL bridge pada halaman Sinkronisasi, simpan lalu uji koneksi. Cara ini mendukung tarik sekaligus kirim data.",
  },
  {
    title: "3. Service account (otomatis)",
    body: "Tambahkan GOOGLE_SERVICE_ACCOUNT_EMAIL dan GOOGLE_PRIVATE_KEY pada environment, lalu bagikan spreadsheet ke email service account sebagai Editor. Cocok untuk operasional tanpa langkah manual.",
  },
  {
    title: "4. Impor tempel (tanpa izin apa pun)",
    body: "Blok semua sel spreadsheet, tekan Ctrl/Cmd + C, lalu tempel pada kotak Impor Tempel di halaman Sinkronisasi dan klik Impor. Paling praktis saat sheet tidak bisa dibagikan.",
  },
];

export default function PanduanPage() {
  return (
    <div>
      <PageHeading
        eyebrow="Panduan"
        title="Cara Menjalankan Aplikasi"
        description={`Tiga cara menjalankan SIPRAS ${SCHOOL_NAME}, langkah pemakaian harian, dan cara menyambungkan spreadsheet sebagai database.`}
        actions={
          <>
            <Link href="/integrasi" className="btn-primary">
              <RefreshCw className="h-4 w-4" />
              Hubungkan spreadsheet
            </Link>
            <Link href="/laporan" className="btn-ghost">
              <FileBarChart2 className="h-4 w-4" />
              Lihat laporan
            </Link>
          </>
        }
      />

      <section className="mb-5 flex flex-col gap-3 rounded-2xl border border-brand-900/10 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-900 text-gold-400 ring-1 ring-brand-900/10">
            <KeyRound className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700/70">
              Akun bawaan
            </p>
            <p className="mt-0.5 text-sm text-brand-900/70">
              Username{" "}
              <code className="rounded bg-brand-50 px-1.5 py-0.5 font-mono text-[12px] ring-1 ring-brand-100">
                admin
              </code>{" "}
              · Password{" "}
              <code className="rounded bg-brand-50 px-1.5 py-0.5 font-mono text-[12px] ring-1 ring-brand-100">
                admin
              </code>{" "}
              · dapat diubah di menu Pengaturan.
            </p>
          </div>
        </div>
        <Link href="/login" className="btn-ghost !py-2 text-xs">
          <LogIn className="h-3.5 w-3.5" />
          Buka halaman login
        </Link>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {OPSI_JALAN.map((opsi) => {
          const Icon = opsi.icon;
          return (
            <section key={opsi.title} className="panel flex flex-col p-5">
              <div className="mb-3 flex items-start justify-between gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="badge bg-gold-500/15 text-gold-600 ring-gold-500/20">
                  {opsi.badge}
                </span>
              </div>
              <h2 className="font-display text-base font-semibold leading-snug text-brand-950">
                {opsi.title}
              </h2>
              <ol className="mt-3 space-y-2 text-[12.5px] leading-relaxed text-brand-900/65">
                {opsi.steps.map((step, index) => (
                  <li key={step} className="flex gap-2">
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-brand-100 text-[9px] font-bold text-brand-800">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              {opsi.title.startsWith("C.") && (
                <a
                  href="/api/apps-script"
                  className="btn-ghost mt-4 w-full !py-2 text-xs"
                >
                  <Terminal className="h-3.5 w-3.5" />
                  Unduh Code.gs
                </a>
              )}
              {opsi.title.startsWith("B.") && (
                <div className="mt-4 rounded-xl bg-brand-950 p-3 font-mono text-[10.5px] leading-relaxed text-brand-100/80">
                  npm install
                  <br />
                  npx drizzle-kit push
                  <br />
                  npm run dev
                </div>
              )}
            </section>
          );
        })}
      </div>

      <section className="panel mt-5 p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            <PlugZap className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-brand-950">
              Menyambungkan Spreadsheet sebagai Database
            </h2>
            <p className="text-[11.5px] text-brand-900/50">
              Pilih satu metode sesuai tingkat akses spreadsheet Anda.
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {KONEKSI.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-brand-900/10 bg-cream-50/60 p-4"
            >
              <p className="text-[13px] font-semibold text-brand-950">{item.title}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-brand-900/60">
                {item.body}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-brand-900/8 pt-4">
          <Link href="/integrasi" className="btn-primary !py-2 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            Buka Sinkronisasi Sheet
          </Link>
          <Link href="/pengaturan" className="btn-ghost !py-2 text-xs">
            <Database className="h-3.5 w-3.5" />
            Pengaturan profil & akun
          </Link>
          <a
            href="https://developers.google.com/apps-script/guides/web"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900"
          >
            Dokumentasi Web App Apps Script
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </section>


      <section className="panel mt-5 p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            <CheckCircle2 className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-brand-950">
              Empat Buku Wajib Sarana &amp; Prasarana
            </h2>
            <p className="text-[11.5px] text-brand-900/50">
              Fitur baru yang tersedia pada menu Buku &amp; Sirkulasi.
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              href: "/buku-inventaris",
              title: "Buku Inventaris",
              body: "Daftar seluruh aset per kategori dengan subtotal unit/nilai, rekapitulasi, dan blok pengesahan siap cetak A4 landscape.",
            },
            {
              href: "/persediaan",
              title: "Buku Penerimaan / Pengeluaran Persediaan",
              body: "Catat barang habis pakai, penerimaan dan pengeluaran beserta nomor bukti, lalu cetak buku mutasi per bulan dengan kolom saldo berjalan.",
            },
            {
              href: "/stok-opname",
              title: "Stok Opname",
              body: "Masukkan hasil hitung fisik, sistem menghitung selisih dan otomatis membuat koreksi stok, serta menyediakan berita acara opname.",
            },
            {
              href: "/peminjaman",
              title: "BA Peminjaman Barang",
              body: "Buat berita acara serah terima peminjaman, pantau keterlambatan, catat kondisi saat kembali, dan cetak BA bertanda tangan.",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-xl border border-brand-900/10 bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-md"
            >
              <p className="flex items-center justify-between gap-2 text-[13px] font-semibold text-brand-950">
                {item.title}
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-brand-900/25 transition group-hover:translate-x-0.5 group-hover:text-brand-700" />
              </p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-brand-900/60">{item.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-5">
        <DeployGuide vercelUrl="https://vercel.com/new?teamSlug=rey-8956" />
      </div>

      <section className="panel mt-5 p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100">
            <BookOpenCheck className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-brand-950">
              Alur Pemakaian Harian
            </h2>
            <p className="text-[11.5px] text-brand-900/50">
              Empat langkah dari login sampai laporan siap cetak.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {LANGKAH_PAKAI.map((langkah) => {
            const Icon = langkah.icon;
            return (
              <Link
                key={langkah.title}
                href={langkah.href}
                className="group flex flex-col rounded-xl border border-brand-900/10 bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-md"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-900 text-gold-400">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="mt-3 text-[13px] font-semibold text-brand-950">
                  {langkah.title}
                </p>
                <p className="mt-1 flex-1 text-[11.5px] leading-relaxed text-brand-900/60">
                  {langkah.body}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700">
                  {langkah.cta}
                  <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-brand-900/10 bg-cream-50/60 p-4">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Checklist sebelum cetak
            </p>
            <ul className="mt-2 space-y-1.5 text-[12px] leading-relaxed text-brand-900/65">
              <li>• Profil lembaga, kepala sekolah, dan penyusun sudah diisi.</li>
              <li>• Nilai aset tiap barang sudah sesuai buku kas.</li>
              <li>• Kondisi barang sudah diperbarui (B / RR / RB / TA).</li>
              <li>• Tahun anggaran laporan sudah dipilih dengan benar.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-gold-600">
              <FileSpreadsheet className="h-3.5 w-3.5" /> Jika spreadsheet masih 401
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-brand-900/70">
              Pesan <strong>HTTP 401</strong> berarti spreadsheet masih privat.
              Bagikan sebagai Viewer, gunakan bridge Apps Script, tambahkan service
              account, atau tempel datanya lewat Impor Tempel — data tetap bisa masuk
              tanpa mengubah izin spreadsheet.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
