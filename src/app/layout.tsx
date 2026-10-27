import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SIPRAS SMPS IT Mutiara — Sarana & Prasarana",
    template: "%s · SIPRAS SMPS IT Mutiara",
  },
  description:
    "Aplikasi pencatatan sarana dan prasarana sekolah: input inventaris, kelola aset, dan cetak laporan Daftar Inventaris Barang (Register Aset Tingkat Lembaga).",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
