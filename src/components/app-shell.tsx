"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  BookOpenCheck,
  Boxes,
  ClipboardCheck,
  ClipboardList,
  ClipboardSignature,
  FileBarChart2,
  LayoutDashboard,
  LogOut,
  Menu,
  PackagePlus,
  Settings,
  ShieldCheck,
  RefreshCw,
  Store,
  X,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { logoutAction } from "@/actions/auth";

const NAV_SECTIONS = [
  {
    label: "Menu Utama",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/inventaris", label: "Data Inventaris", icon: Boxes },
      { href: "/inventaris/baru", label: "Input Barang", icon: PackagePlus },
    ],
  },
  {
    label: "Buku & Sirkulasi",
    items: [
      { href: "/buku-inventaris", label: "Buku Inventaris", icon: BookOpen },
      { href: "/persediaan", label: "Buku Persediaan", icon: Store },
      { href: "/stok-opname", label: "Stok Opname", icon: ClipboardCheck },
      { href: "/peminjaman", label: "Peminjaman Barang", icon: ClipboardSignature },
    ],
  },
  {
    label: "Laporan & Data",
    items: [
      { href: "/laporan", label: "Laporan", icon: FileBarChart2 },
      { href: "/integrasi", label: "Sinkronisasi Sheet", icon: RefreshCw },
      { href: "/panduan", label: "Panduan", icon: BookOpenCheck },
      { href: "/pengaturan", label: "Pengaturan", icon: Settings },
    ],
  },
];

type AppShellProps = {
  children: ReactNode;
  user: { nama: string; username: string; peran: string };
  lembaga: { nama: string; tahunAnggaran: number };
};

export function AppShell({ children, user, lembaga }: AppShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/inventaris") {
      return pathname === "/inventaris" || /^\/inventaris\/\d+/.test(pathname);
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label} className="pb-1.5">
          <p className="px-3 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-200/45">
            {section.label}
          </p>
          <div className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] font-medium transition ${
                    active
                      ? "bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                      : "text-brand-100/70 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                      active
                        ? "bg-gold-400 text-brand-950"
                        : "bg-white/8 text-brand-200 group-hover:bg-white/15 group-hover:text-white"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      <div className="mt-auto space-y-3 pt-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-400">
            <ClipboardList className="h-3.5 w-3.5" />
            Tahun Anggaran
          </div>
          <p className="mt-1.5 font-display text-2xl font-semibold text-white">
            {lembaga.tahunAnggaran}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-brand-100/60">
            {lembaga.nama}
          </p>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-brand-950/40 p-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gold-400/15 text-gold-400 ring-1 ring-gold-400/30">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user.nama}</p>
            <p className="truncate text-[11px] text-brand-100/60">
              @{user.username} · {user.peran}
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              title="Keluar"
              aria-label="Keluar"
              className="grid h-8 w-8 place-items-center rounded-lg text-brand-100/70 transition hover:bg-rose-500/20 hover:text-rose-200"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="no-print fixed inset-y-0 left-0 z-40 hidden w-72 flex-col bg-gradient-to-b from-brand-900 via-brand-900 to-brand-950 px-4 py-6 lg:flex">
        <div className="mb-8 px-2">
          <Logo dark />
        </div>
        {nav}
        <p className="mt-4 px-3 text-[10px] leading-relaxed text-brand-200/35">
          © {new Date().getFullYear()} SIPRAS SMPS IT Mutiara
          <br />
          Sistem informasi sarana & prasarana
        </p>
      </aside>

      {/* Mobile header */}
      <header className="no-print sticky top-0 z-30 flex items-center justify-between border-b border-brand-900/10 bg-cream-50/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo href="/dashboard" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buka menu"
          className="grid h-10 w-10 place-items-center rounded-xl border border-brand-900/15 bg-white text-brand-800"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="no-print fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-brand-950/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[85%] max-w-xs flex-col bg-gradient-to-b from-brand-900 to-brand-950 px-4 py-5">
            <div className="mb-7 flex items-center justify-between">
              <Logo dark />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup menu"
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <div className="lg:pl-72">
        <main className="mx-auto w-full max-w-[1360px] px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pt-9">
          {children}
        </main>
      </div>
    </div>
  );
}
