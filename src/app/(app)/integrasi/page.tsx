import type { Metadata } from "next";
import Link from "next/link";
import { Boxes, FileBarChart2 } from "lucide-react";
import { SheetsIntegration } from "@/components/sheets-integration";
import { PageHeading } from "@/components/ui";
import { getInventarisStats, getLembaga } from "@/lib/data";
import { getSheetConfig } from "@/lib/sheets-config";
import { hasApiKey, hasServiceAccount } from "@/lib/sheets";
import { SCHOOL_NAME } from "@/lib/constants";

export const metadata: Metadata = { title: "Sinkronisasi Spreadsheet" };
export const dynamic = "force-dynamic";

export default async function IntegrasiPage() {
  const [config, stats, lembaga] = await Promise.all([
    getSheetConfig(),
    getInventarisStats(),
    getLembaga(),
  ]);

  const lastSync = config.lastSyncAt
    ? new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(config.lastSyncAt)
    : null;

  return (
    <div>
      <PageHeading
        eyebrow="Integrasi"
        title="Google Sheets sebagai Database"
        description={`Hubungkan spreadsheet ${SCHOOL_NAME} sehingga data inventaris bisa ditarik dan dikirim otomatis, tanpa input ulang.`}
        actions={
          <>
            <Link href="/inventaris" className="btn-ghost">
              <Boxes className="h-4 w-4" />
              Data inventaris
            </Link>
            <Link href={`/laporan?tahun=${lembaga.tahunAnggaran}`} className="btn-primary">
              <FileBarChart2 className="h-4 w-4" />
              Laporan {lembaga.tahunAnggaran}
            </Link>
          </>
        }
      />

      <SheetsIntegration
        config={{
          spreadsheetUrl: config.spreadsheetUrl,
          spreadsheetId: config.spreadsheetId,
          gid: config.gid,
          sheetName: config.sheetName,
          method: config.method,
          bridgeUrl: config.bridgeUrl,
          targetSheetName: config.targetSheetName,
        }}
        status={{
          state: config.lastSyncStatus,
          message: config.lastSyncMessage,
          count: config.lastSyncCount,
          lastSyncAt: lastSync,
        }}
        capabilities={{
          serviceAccount: hasServiceAccount(),
          apiKey: hasApiKey(),
        }}
        jumlahBarang={stats.jumlahJenis}
      />
    </div>
  );
}
