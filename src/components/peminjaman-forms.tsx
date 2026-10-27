"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Plus, RotateCcw, Send, Trash2 } from "lucide-react";
import {
  createPeminjamanAction,
  kembalikanPeminjamanAction,
  type PersediaanState,
} from "@/actions/persediaan";
import { KONDISI } from "@/lib/constants";

type PilihanBarang = {
  id: number;
  kodeBarang: string;
  namaBarang: string;
  satuan: string;
  jumlah: number;
  lokasi: string;
};

type Baris = {
  key: number;
  inventarisId: number;
  nama: string;
  jumlah: string;
  satuan: string;
  keterangan: string;
};

const initial: PersediaanState = {};

function Feedback({ state }: { state: PersediaanState }) {
  if (!state.message) return null;
  const error = state.status === "error";
  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[12.5px] leading-relaxed ${
        error
          ? "border-rose-200 bg-rose-50 text-rose-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      {error ? (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <span>{state.message}</span>
    </div>
  );
}

function SubmitCreate() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          Menyimpan…
        </>
      ) : (
        <>
          <Send className="h-4 w-4" />
          Simpan & buat berita acara
        </>
      )}
    </button>
  );
}

function SubmitReturn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          Memproses…
        </>
      ) : (
        <>
          <RotateCcw className="h-4 w-4" />
          Tandai sudah dikembalikan
        </>
      )}
    </button>
  );
}

export function PeminjamanForm({
  barang,
  nomorBukti,
  defaultPetugas,
}: {
  barang: PilihanBarang[];
  nomorBukti: string;
  defaultPetugas: string;
}) {
  const [state, action] = useActionState(createPeminjamanAction, initial);
  const [rows, setRows] = useState<Baris[]>([
    { key: 1, inventarisId: barang[0]?.id ?? 0, nama: barang[0]?.namaBarang ?? "", jumlah: "1", satuan: barang[0]?.satuan ?? "bh", keterangan: "" },
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const plusDays = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);

  const update = (key: number, patch: Partial<Baris>) => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const pilihBarang = (key: number, id: number) => {
    const found = barang.find((item) => item.id === id);
    update(key, {
      inventarisId: id,
      nama: found?.namaBarang ?? "",
      satuan: found?.satuan ?? "bh",
    });
  };

  return (
    <form action={action} className="space-y-4">
      <Feedback state={state} />

      <div className="rounded-xl border border-brand-900/10 bg-cream-50/70 px-3.5 py-2.5">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-brand-700/60">
          Nomor bukti otomatis
        </p>
        <p className="mt-0.5 font-mono text-[12.5px] font-semibold text-brand-800">{nomorBukti}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="pmj-peminjam" className="label">
            Nama peminjam <span className="text-rose-500">*</span>
          </label>
          <input id="pmj-peminjam" name="peminjam" className="input" placeholder="Nama guru / siswa" required />
        </div>
        <div>
          <label htmlFor="pmj-unit" className="label">
            Unit / kelas
          </label>
          <input id="pmj-unit" name="unit" className="input" placeholder="Kelas 7A / Ruang Guru" />
        </div>
        <div>
          <label htmlFor="pmj-pinjam" className="label">
            Tanggal pinjam
          </label>
          <input id="pmj-pinjam" name="tanggalPinjam" type="date" defaultValue={today} className="input" />
        </div>
        <div>
          <label htmlFor="pmj-kembali" className="label">
            Rencana kembali
          </label>
          <input id="pmj-kembali" name="rencanaKembali" type="date" defaultValue={plusDays} className="input" />
        </div>
      </div>

      <div>
        <label htmlFor="pmj-keperluan" className="label">
          Keperluan
        </label>
        <input id="pmj-keperluan" name="keperluan" className="input" placeholder="Praktik IPA, rapat, lomba…" />
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="label !mb-0">Barang yang dipinjam</p>
          <button
            type="button"
            onClick={() =>
              setRows((current) => [
                ...current,
                { key: Date.now(), inventarisId: 0, nama: "", jumlah: "1", satuan: "bh", keterangan: "" },
              ])
            }
            className="inline-flex items-center gap-1 rounded-lg border border-brand-900/15 bg-white px-2 py-1 text-[11px] font-semibold text-brand-800 transition hover:bg-brand-50"
          >
            <Plus className="h-3 w-3" /> Tambah baris
          </button>
        </div>

        {rows.map((row, index) => (
          <div key={row.key} className="rounded-xl border border-brand-900/10 bg-white p-3">
            <div className="grid gap-2.5 sm:grid-cols-[1.6fr_0.65fr_0.65fr_auto]">
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-900/45">
                  Barang #{index + 1}
                </label>
                <select
                  name="itemInventarisId"
                  value={row.inventarisId}
                  onChange={(event) => pilihBarang(row.key, Number(event.target.value))}
                  className="input !py-2 text-[12.5px]"
                >
                  <option value={0}>— Barang lain (isi manual) —</option>
                  {barang.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.namaBarang} ({item.satuan})
                    </option>
                  ))}
                </select>
                {row.inventarisId === 0 ? (
                  <input
                    name="itemNama"
                    value={row.nama}
                    onChange={(event) => update(row.key, { nama: event.target.value })}
                    placeholder="Nama barang"
                    className="input mt-1.5 !py-2 text-[12.5px]"
                  />
                ) : (
                  <input type="hidden" name="itemNama" value={row.nama} />
                )}
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-900/45">
                  Jumlah
                </label>
                <input
                  name="itemJumlah"
                  type="number"
                  min={1}
                  value={row.jumlah}
                  onChange={(event) => update(row.key, { jumlah: event.target.value })}
                  className="input !py-2 text-[12.5px]"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-900/45">
                  Satuan
                </label>
                <input
                  name="itemSatuan"
                  value={row.satuan}
                  onChange={(event) => update(row.key, { satuan: event.target.value })}
                  className="input !py-2 text-[12.5px]"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() =>
                    setRows((current) =>
                      current.length > 1 ? current.filter((item) => item.key !== row.key) : current,
                    )
                  }
                  aria-label="Hapus baris"
                  className="grid h-[38px] w-[38px] place-items-center rounded-lg border border-brand-900/10 text-brand-900/50 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <input type="hidden" name="itemKeterangan" value={row.keterangan} />
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="pmj-petugas" className="label">
            Petugas / penanggung jawab
          </label>
          <input
            id="pmj-petugas"
            name="petugas"
            defaultValue={defaultPetugas}
            className="input"
            placeholder="Nama petugas sarana"
          />
        </div>
        <div>
          <label htmlFor="pmj-catatan" className="label">
            Catatan
          </label>
          <input id="pmj-catatan" name="catatan" className="input" placeholder="Opsional" />
        </div>
      </div>

      <SubmitCreate />
    </form>
  );
}

export function PengembalianForm({
  id,
  items,
}: {
  id: number;
  items: { id: number; namaBarang: string; jumlah: number; satuan: string; kondisiKembali: string }[];
}) {
  return (
    <form action={kembalikanPeminjamanAction} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <p className="text-[12px] leading-relaxed text-brand-900/60">
        Catat kondisi barang saat dikembalikan. Status peminjaman akan berubah menjadi
        <strong> dikembalikan</strong>.
      </p>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-900/10 bg-white px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-semibold text-brand-950">{item.namaBarang}</p>
              <p className="text-[11px] text-brand-900/45">
                {item.jumlah} {item.satuan}
              </p>
            </div>
            <select
              name="kondisiKembali"
              defaultValue={item.kondisiKembali || "B"}
              className="input !w-auto !py-1.5 text-[12px]"
              aria-label={`Kondisi kembali ${item.namaBarang}`}
            >
              {KONDISI.map((kondisi) => (
                <option key={kondisi.kode} value={kondisi.kode}>
                  {kondisi.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <div>
        <label htmlFor="pmj-tgl-kembali" className="label">
          Tanggal dikembalikan
        </label>
        <input
          id="pmj-tgl-kembali"
          name="tanggalKembali"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
          className="input"
        />
      </div>
      <SubmitReturn />
    </form>
  );
}
