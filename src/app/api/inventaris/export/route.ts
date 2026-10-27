import { getSession } from "@/lib/auth";
import { getInventarisList, getLembaga } from "@/lib/data";
import { kondisiInfo } from "@/lib/constants";

export const dynamic = "force-dynamic";

function csvCell(value: string | number) {
  const text = String(value ?? "");
  if (/[";\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tahun = Number(searchParams.get("tahun"));

  const [lembaga, data] = await Promise.all([
    getLembaga(),
    getInventarisList({
      q: searchParams.get("q")?.trim() || undefined,
      tahun: Number.isFinite(tahun) && tahun > 0 ? tahun : undefined,
      kondisi: searchParams.get("kondisi") || undefined,
      kategori: searchParams.get("kategori") || undefined,
    }),
  ]);

  const rows: (string | number)[][] = [
    ["DAFTAR INVENTARIS BARANG (REGISTER ASET TINGKAT LEMBAGA)"],
    ["Nama Lembaga", lembaga.nama],
    ["Kode Lembaga", lembaga.kodeLembaga],
    [],
    [
      "No",
      "Kode Barang",
      "Nama Barang",
      "Jumlah",
      "Satuan",
      "Tahun Anggaran",
      "Sumber Perolehan",
      "Nilai (Rp)",
      "Lokasi / Ruang",
      "Kondisi",
      "Keterangan",
    ],
  ];

  data.forEach((item, index) => {
    rows.push([
      index + 1,
      item.kodeBarang,
      item.namaBarang,
      item.jumlah,
      item.satuan,
      item.tahunAnggaran,
      item.sumberPerolehan,
      item.nilai,
      item.lokasi,
      kondisiInfo(item.kondisi).label,
      item.keterangan,
    ]);
  });

  const totalUnit = data.reduce((acc, item) => acc + item.jumlah, 0);
  const totalNilai = data.reduce((acc, item) => acc + item.nilai, 0);
  rows.push(["", "JUMLAH", "", totalUnit, "", "", "", totalNilai, "", "", ""]);

  const csv = rows.map((row) => row.map(csvCell).join(";")).join("\r\n");
  const filename = `inventaris-${lembaga.kodeLembaga.toLowerCase()}-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
