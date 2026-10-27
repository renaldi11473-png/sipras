import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { requireSession } from "@/lib/auth";
import { getLembaga } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireSession();
  const lembaga = await getLembaga();

  return (
    <AppShell
      user={{
        nama: session.nama,
        username: session.username,
        peran: session.peran,
      }}
      lembaga={{ nama: lembaga.nama, tahunAnggaran: lembaga.tahunAnggaran }}
    >
      {children}
    </AppShell>
  );
}
