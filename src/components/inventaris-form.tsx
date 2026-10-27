"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import {
  AlertCircle,
  BadgeCheck,
  CalendarRange,
  Coins,
  Hash,
  MapPin,
  Save,
  Tag,
  Wand2,
  X,
} from "lucide-react";
import {
  createInventarisAction,
  updateInventarisAction,
  type InventarisFormState,
} from "@/actions/inventaris";
import {
  KATEGORI,
  KONDISI,
  RUANGAN,
  SATUAN,
  SUMBER_PEROLEHAN,
  buatKodeBarang,
  formatRupiah,
} from "@/lib/constants";

export type InventarisFormValues = {
  id?: number;
  kodeBarang: string;
  namaBarang: string;
  kategori: string;
  jumlah: number;
  satuan: string;
  tahunAnggaran: number;
  sumberPerolehan: string;
  nilai: number;
  lokasi: string;
  kondisi: string;
  keterangan: string;
};

const initialState: InventarisFormState = {};

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary flex-1 py-3" disabled={pending}>
      {pending ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          Menyimpan…
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          {mode === "create" ? "Simpan Inventaris" : "Simpan Perubahan"}
        </>
      )}
    </button>
  );
}

export function InventarisForm({
  mode,
  initial,
  kodeLembaga,
  nomorMap,
  defaultTahun,
}: {
  mode: "create" | "edit";
  initial: InventarisFormValues;
  kodeLembaga: string;
  nomorMap: Record<string, number>;
  defaultTahun: number;
}) {
  const action = mode === "create" ? createInventarisAction : updateInventarisAction;
  const [state, formAction] = useActionState(action, initialState);

  const [namaBarang, setNamaBarang] = useState(initial.namaBarang);
  const [kategori, setKategori] = useState(initial.kategori);
  const [jumlah, setJumlah] = useState(String(initial.jumlah));
  const [satuan, setSatuan] = useState(initial.satuan);
  const [tahunAnggaran, setTahunAnggaran] = useState(String(initial.tahunAnggaran));
  const [sumberPerolehan, setSumberPerolehan] = useState(initial.sumberPerolehan);
  const [nilai, setNilai] = useState(String(initial.nilai));
  const [lokasi, setLokasi] = useState(initial.lokasi);
  const [kondisi, setKondisi] = useState(initial.kondisi);
  const [keterangan, setKeterangan] = useState(initial.keterangan);
  const [manualKode, setManualKode] = useState(mode === "edit");
  const [kodeManual, setKodeManual] = useState(initial.kodeBarang);

  const tahunNumber = Number(tahunAnggaran) || defaultTahun;
  const nomorBerikutnya = nomorMap[String(tahunNumber)] ?? 1;

  const kodeOtomatis = useMemo(
    () =>
      buatKodeBarang({
        kodeLembaga,
        kategori,
        lokasi,
        nomor: nomorBerikutnya,
        tahun: tahunNumber,
      }),
    [kodeLembaga, kategori, lokasi, nomorBerikutnya, tahunNumber],
  );

  const kodeTerpakai = manualKode ? kodeManual : kodeOtomatis;
  const nilaiAngka = Number(nilai.replace(/\./g, "")) || 0;
  const jumlahAngka = Number(jumlah) || 0;
  const fieldError = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <input type="hidden" name="kodeBarang" value={kodeTerpakai} />

      <div className="space-y-5">
        {state.error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <section className="panel p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100">
              <Tag className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-base font-semibold text-brand-950">
                Identitas Barang
              </h2>
              <p className="text-[11.5px] text-brand-900/50">
                Nama, kategori, dan jumlah unit aset
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="namaBarang" className="label">
                Nama Barang <span className="text-rose-500">*</span>
              </label>
              <input
                id="namaBarang"
                name="namaBarang"
                value={namaBarang}
                onChange={(event) => setNamaBarang(event.target.value)}
                placeholder="Contoh: Buku Bahasa Indonesia kelas 9"
                className="input"
                required
              />
              {fieldError.namaBarang && (
                <p className="mt-1 text-[11.5px] font-medium text-rose-600">
                  {fieldError.namaBarang}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="kategori" className="label">
                  Kategori <span className="text-rose-500">*</span>
                </label>
                <select
                  id="kategori"
                  name="kategori"
                  value={kategori}
                  onChange={(event) => setKategori(event.target.value)}
                  className="input"
                >
                  {KATEGORI.map((item) => (
                    <option key={item.kode} value={item.label}>
                      {item.label}
                    </option>
                  ))}
                </select>
                {fieldError.kategori && (
                  <p className="mt-1 text-[11.5px] font-medium text-rose-600">
                    {fieldError.kategori}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="lokasi" className="label">
                  Lokasi / Ruang <span className="text-rose-500">*</span>
                </label>
                <select
                  id="lokasi"
                  name="lokasi"
                  value={lokasi}
                  onChange={(event) => setLokasi(event.target.value)}
                  className="input"
                >
                  {RUANGAN.map((item) => (
                    <option key={item.kode} value={item.label}>
                      {item.label}
                    </option>
                  ))}
                </select>
                {fieldError.lokasi && (
                  <p className="mt-1 text-[11.5px] font-medium text-rose-600">
                    {fieldError.lokasi}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_1.1fr]">
              <div>
                <label htmlFor="jumlah" className="label">
                  Jumlah <span className="text-rose-500">*</span>
                </label>
                <input
                  id="jumlah"
                  name="jumlah"
                  type="number"
                  min={1}
                  value={jumlah}
                  onChange={(event) => setJumlah(event.target.value)}
                  className="input"
                  required
                />
                {fieldError.jumlah && (
                  <p className="mt-1 text-[11.5px] font-medium text-rose-600">
                    {fieldError.jumlah}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="satuan" className="label">
                  Satuan
                </label>
                <select
                  id="satuan"
                  name="satuan"
                  value={satuan}
                  onChange={(event) => setSatuan(event.target.value)}
                  className="input"
                >
                  {SATUAN.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="kondisi" className="label">
                  Kondisi <span className="text-rose-500">*</span>
                </label>
                <select
                  id="kondisi"
                  name="kondisi"
                  value={kondisi}
                  onChange={(event) => setKondisi(event.target.value)}
                  className="input"
                >
                  {KONDISI.map((item) => (
                    <option key={item.kode} value={item.kode}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="keterangan" className="label">
                Keterangan
              </label>
              <textarea
                id="keterangan"
                name="keterangan"
                value={keterangan}
                onChange={(event) => setKeterangan(event.target.value)}
                rows={2}
                placeholder="Catatan tambahan, misalnya inventaris kantor atau bantuan orang tua"
                className="input resize-y"
              />
            </div>
          </div>
        </section>

        <section className="panel p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-gold-600 ring-1 ring-amber-100">
              <Coins className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-base font-semibold text-brand-950">
                Pencatatan Aset
              </h2>
              <p className="text-[11.5px] text-brand-900/50">
                Tahun anggaran, sumber dana, dan nilai perolehan
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="tahunAnggaran" className="label">
                Tahun Anggaran <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <CalendarRange className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-700/40" />
                <input
                  id="tahunAnggaran"
                  name="tahunAnggaran"
                  type="number"
                  min={2000}
                  max={2100}
                  value={tahunAnggaran}
                  onChange={(event) => setTahunAnggaran(event.target.value)}
                  className="input pl-10"
                  required
                />
              </div>
              {fieldError.tahunAnggaran && (
                <p className="mt-1 text-[11.5px] font-medium text-rose-600">
                  {fieldError.tahunAnggaran}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="sumberPerolehan" className="label">
                Sumber Perolehan <span className="text-rose-500">*</span>
              </label>
              <select
                id="sumberPerolehan"
                name="sumberPerolehan"
                value={sumberPerolehan}
                onChange={(event) => setSumberPerolehan(event.target.value)}
                className="input"
              >
                {SUMBER_PEROLEHAN.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="nilai" className="label">
                Nilai Total (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                id="nilai"
                name="nilai"
                inputMode="numeric"
                value={nilai}
                onChange={(event) => setNilai(event.target.value.replace(/[^\d.]/g, ""))}
                placeholder="2250000"
                className="input"
              />
              <p className="mt-1.5 text-[11.5px] text-brand-900/50">
                Nilai keseluruhan unit, bukan harga satuan.{" "}
                <span className="font-semibold text-brand-800">
                  {formatRupiah(nilaiAngka)}
                </span>
              </p>
              {fieldError.nilai && (
                <p className="mt-1 text-[11.5px] font-medium text-rose-600">
                  {fieldError.nilai}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="panel p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                <Hash className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-display text-base font-semibold text-brand-950">
                  Kode Barang
                </h2>
                <p className="text-[11.5px] text-brand-900/50">
                  Pola: lembaga / kategori / ruang / nomor / tahun
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setManualKode((value) => !value);
                setKodeManual(kodeOtomatis);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-900/15 px-2.5 py-1.5 text-[11px] font-semibold text-brand-800 transition hover:bg-brand-50"
            >
              {manualKode ? (
                <>
                  <Wand2 className="h-3.5 w-3.5" /> Pakai otomatis
                </>
              ) : (
                <>
                  <Hash className="h-3.5 w-3.5" /> Atur manual
                </>
              )}
            </button>
          </div>

          {manualKode ? (
            <input
              value={kodeManual}
              onChange={(event) => setKodeManual(event.target.value)}
              className="input font-mono text-[12.5px]"
              aria-label="Kode barang"
            />
          ) : (
            <p className="rounded-xl border border-dashed border-brand-900/20 bg-cream-50 px-3.5 py-3 font-mono text-[12.5px] font-medium text-brand-800">
              {kodeOtomatis}
            </p>
          )}
          <p className="mt-2 text-[11.5px] text-brand-900/50">
            Nomor urut berikutnya untuk tahun {tahunNumber} adalah{" "}
            <span className="font-semibold">{nomorBerikutnya}</span>.
          </p>
          {fieldError.kodeBarang && (
            <p className="mt-1 text-[11.5px] font-medium text-rose-600">
              {fieldError.kodeBarang}
            </p>
          )}
        </section>

        <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
          <Link
            href="/inventaris"
            className="btn-ghost justify-center py-3 sm:w-auto sm:px-6"
          >
            <X className="h-4 w-4" />
            Batal
          </Link>
          <SubmitButton mode={mode} />
        </div>
      </div>

      <aside className="space-y-4">
        <div className="panel sticky top-6 overflow-hidden">
          <div className="bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 px-5 py-4 text-white">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-gold-400">
              Pratinjau Register
            </p>
            <p className="mt-1 font-display text-lg font-semibold leading-snug">
              {namaBarang || "Nama barang baru"}
            </p>
            <p className="mt-1 break-all font-mono text-[10.5px] text-brand-100/70">
              {kodeTerpakai}
            </p>
          </div>
          <dl className="divide-y divide-brand-900/8 text-sm">
            {[
              ["Kategori", kategori],
              ["Jumlah", `${jumlahAngka || 0} ${satuan}`],
              ["Tahun anggaran", tahunAnggaran || "-"],
              ["Sumber perolehan", sumberPerolehan],
              ["Lokasi / ruang", lokasi],
              [
                "Kondisi",
                KONDISI.find((item) => item.kode === kondisi)?.label ?? "-",
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-3 px-5 py-2.5">
                <dt className="text-[12px] text-brand-900/50">{label}</dt>
                <dd className="max-w-[58%] text-right text-[12.5px] font-semibold text-brand-900">
                  {value}
                </dd>
              </div>
            ))}
            <div className="flex items-start justify-between gap-3 bg-cream-50 px-5 py-3.5">
              <dt className="text-[12px] font-semibold text-brand-900/60">Nilai aset</dt>
              <dd className="text-right font-display text-lg font-semibold text-brand-800">
                {formatRupiah(nilaiAngka)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-brand-900/10 bg-brand-50/60 p-4">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-700">
            <BadgeCheck className="h-4 w-4 text-brand-600" />
            Tips pengisian
          </p>
          <ul className="mt-2 space-y-1.5 text-[12px] leading-relaxed text-brand-900/65">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />
              Pilih lokasi sesuai ruang penyimpanan agar kode barang tepat.
            </li>
            <li className="flex gap-2">
              <Coins className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />
              Isi nilai total sesuai nota/buku kas lembaga.
            </li>
            <li className="flex gap-2">
              <Wand2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />
              Kode barang dibuat otomatis dan tetap bisa disesuaikan.
            </li>
          </ul>
        </div>
      </aside>
    </form>
  );
}
