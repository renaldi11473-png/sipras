import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BookOpenCheck, FileCheck2, ShieldCheck, Sparkles } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { Logo, LogoMark } from "@/components/logo";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Masuk" };
export const dynamic = "force-dynamic";

const FITUR = [
  {
    icon: BookOpenCheck,
    title: "Input inventaris terstruktur",
    desc: "Kode barang terbentuk otomatis mengikuti pola lembaga/ruang/kategori.",
  },
  {
    icon: FileCheck2,
    title: "Laporan siap cetak",
    desc: "Format Daftar Inventaris Barang sesuai register aset tingkat lembaga.",
  },
  {
    icon: ShieldCheck,
    title: "Data aman & rapi",
    desc: "Setiap perubahan tercatat, hanya pengelola yang bisa mengakses.",
  },
];

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden bg-brand-900 lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.pexels.com/photos/9250705/pexels-photo-9250705.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1400&w=1000"
          alt="Ruang kelas dengan rak buku dan kursi warna-warni"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950/95 via-brand-900/85 to-brand-800/70" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)",
            backgroundSize: "26px 26px",
          }}
        />

        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <Logo dark href="/login" />

          <div className="max-w-xl animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-400 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Sarana & Prasarana
            </span>
            <h1 className="mt-6 font-display text-[clamp(2.3rem,3.6vw,3.4rem)] font-semibold leading-[1.06] text-white">
              Inventaris rapi,
              <br />
              laporan <span className="text-gold-400">siap</span> diprint.
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-brand-100/80">
              Satu tempat untuk mencatat buku, meja, kursi, elektronik, hingga
              alat peraga SMPS IT Mutiara — lengkap dengan kode barang, nilai aset, dan kondisi.
            </p>

            <div className="mt-9 space-y-4">
              {FITUR.map((fitur) => {
                const Icon = fitur.icon;
                return (
                  <div key={fitur.title} className="flex items-start gap-3.5">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 text-gold-400 backdrop-blur">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{fitur.title}</p>
                      <p className="mt-0.5 text-[12.5px] leading-relaxed text-brand-100/65">
                        {fitur.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-brand-100/50">
            <span>© {new Date().getFullYear()} SIPRAS SMPS IT Mutiara</span>
            <span className="hidden xl:block">Register Aset Tingkat Lembaga</span>
          </div>
        </div>
      </section>

      <section className="relative flex items-center justify-center bg-cream-50 px-5 py-12 sm:px-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-brand-100/70 to-transparent" />
        <div className="relative w-full max-w-[420px] animate-fade-up-delay">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <LogoMark className="h-11 w-11" />
            <div>
              <p className="font-display text-lg font-semibold text-brand-950">
                SIPRAS
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-600">
                SMPS IT Mutiara · Register Aset
              </p>
            </div>
          </div>

          <div className="mb-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
              Halaman Login
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-brand-950">
              Selamat datang kembali
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-900/60">
              Masuk untuk mengelola data sarana &amp; prasarana serta mencetak
              laporan inventaris lembaga.
            </p>
          </div>

          <div className="panel p-6 sm:p-7">
            <LoginForm />
          </div>

          <p className="mt-6 text-center text-[11px] leading-relaxed text-brand-900/45">
            Dengan masuk, Anda bertanggung jawab menjaga kerahasiaan data aset
            lembaga.
          </p>
        </div>
      </section>
    </main>
  );
}
