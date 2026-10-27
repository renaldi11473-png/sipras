import { db, hasDatabaseUrl } from "@/db";
import { sql } from "drizzle-orm";
import { ensureSeed } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasDatabaseUrl()) {
    return Response.json(
      {
        ok: false,
        database: "missing",
        message:
          "DATABASE_URL belum diatur. Tambahkan connection string PostgreSQL pada environment variable.",
      },
      { status: 500 },
    );
  }

  try {
    await db.execute(sql`select 1`);
    await ensureSeed();
    return Response.json({ ok: true, database: "connected" });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        database: "error",
        message: error instanceof Error ? error.message : "Gagal terhubung ke database.",
      },
      { status: 500 },
    );
  }
}
