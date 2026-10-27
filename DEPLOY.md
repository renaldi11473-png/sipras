# Deploy SIPRAS ke Vercel

Panduan ini menjelaskan cara men-deploy aplikasi **SIPRAS · SMPS IT Mutiara** ke
Vercel, termasuk menyiapkan database PostgreSQL dan variabel environment.

> Singkatnya: (1) push repo ke GitHub, (2) import di Vercel, (3) tambahkan
> `DATABASE_URL` + `AUTH_SECRET`, (4) jalankan `drizzle-kit push` ke database
> produksi, (5) redeploy. Data contoh terisi otomatis saat request pertama.

---

## 1. Siapkan database PostgreSQL

Vercel tidak menyediakan PostgreSQL lokal, jadi gunakan database terkelola:

| Penyedia | Cara cepat |
| --- | --- |
| **Neon** (rekomendasi) | Buat project → copy **connection string** (Pooled) |
| **Vercel Postgres** | Dashboard Vercel → Storage → Create → Postgres |
| **Supabase** | Project → Settings → Database → Connection string (URI) |

Pastikan connection string memiliki `sslmode=require`, contoh:

```
postgresql://user:password@ep-xxx.aws.neon.tech/neondb?sslmode=require
```

## 2. Push kode ke GitHub

```bash
git init
git add .
git commit -m "SIPRAS SMPS IT Mutiara"
git branch -M main
git remote add origin https://github.com/USERNAME/sipras-smpsit.git
git push -u origin main
```

## 3. Import proyek di Vercel

1. Buka **https://vercel.com/new** (pilih team `rey-8956`).
2. Pilih **Import Git Repository** → repo `sipras-smpsit`.
3. Framework terdeteksi otomatis: **Next.js**.
   - Build Command: `npm run build`
   - Output Directory: (biarkan kosong / `.next`)
   - Install Command: `npm install`
4. Buka **Environment Variables**, tambahkan:

| Key | Contoh nilai | Wajib |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://…?sslmode=require` | ✅ |
| `AUTH_SECRET` | hasil `openssl rand -hex 32` | disarankan |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `sipras@project.iam.gserviceaccount.com` | opsional |
| `GOOGLE_PRIVATE_KEY` | isi `private_key` (pakai `\n` literal) | opsional |
| `GOOGLE_SHEETS_API_KEY` | API key Google Cloud | opsional |

5. Klik **Deploy**.

## 4. Buat tabel di database produksi

Jalankan sekali dari komputer lokal, dengan `DATABASE_URL` produksi:

```bash
export DATABASE_URL="postgresql://…?sslmode=require"
npx drizzle-kit push
```

Seeder berjalan otomatis pada request pertama (membuat akun `admin/admin`,
profil lembaga SMPS IT Mutiara, 23 data inventaris contoh, persediaan, opname,
dan berita acara peminjaman).

## 5. Verifikasi

- `https://<domain>/api/health` → `{ "ok": true, "database": "connected" }`
- `https://<domain>/login` → masuk dengan **admin / admin**
- Segera ubah password di menu **Pengaturan** setelah login pertama.

---

## Deploy lewat CLI (alternatif)

```bash
npm i -g vercel
vercel login            # login akun/team rey-8956
vercel link
vercel env add DATABASE_URL production
vercel env add AUTH_SECRET production
vercel --prod
```

## Catatan penting

- **Jangan** commit `.env` ke Git. File contoh tersedia di `.env.example`.
- Setelah mengubah environment variable, lakukan **Redeploy** agar berlaku.
- Build tidak memerlukan database; koneksi dibuat saat request pertama.
  Jika `DATABASE_URL` belum diisi, `/api/health` melaporkan `database: missing`.
- Semua halaman bersifat dinamis (`force-dynamic`), jadi data selalu segar.
- Cetak laporan memakai `window.print()` browser — tidak perlu server PDF.
- Untuk Google Sheets privat, deploy `Code.gs` sebagai Apps Script Web App lalu
  tempel URL `/exec` pada menu **Sinkronisasi Sheet**.
