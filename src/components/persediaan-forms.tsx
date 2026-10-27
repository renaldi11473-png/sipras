"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
  PackagePlus,
  Save,
} from "lucide-react";
import {
  createPersediaanAction,
  tambahMutasiAction,
  type PersediaanState,
} from "@/actions/persediaan";
import {
  KATEGORI,
  RUANGAN,
  SATUAN,
  formatAngka,
  formatRupiah,
} from "@/lib/constants";
import type { PersediaanStok } from "@/lib/persediaan";

const initial: PersediaanState = {};

function Submit({ label, pendingLabel, icon }: { label: string; pendingLabel: string; icon: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          {pendingLabel}
        </>
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </button>
  );
}

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

export function PersediaanForm() {
  const [state, action] = useActionState(createPersediaanAction, initial);
  return (
    <form action={action} className="space-y-3.5">
      <Feedback state={state} />
      <div>
        <label htmlFor="psd-nama" className="label">
          Nama persediaan <span className="text-rose-500">*</span>
        </label>
        <input
          id="psd-nama"
          name="nama"
          className="input"
          placeholder="Kertas HVS A4 70gr"
          required
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="psd-kategori" className="label">
            Kategori
          </label>
          <select id="psd-kategori" name="kategori" className="input" defaultValue="Perlengkapan">
            {KATEGORI.map((item) => (
              <option key={item.kode} value={item.label}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="psd-lokasi" className="label">
            Lokasi simpan
          </label>
          <select id="psd-lokasi" name="lokasi" className="input" defaultValue="Gudang">
            {RUANGAN.map((item) => (
              <option key={item.kode} value={item.label}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="psd-satuan" className="label">
            Satuan
          </label>
          <select id="psd-satuan" name="satuan" className="input" defaultValue="Rim">
            {["Rim", ...SATUAN].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="psd-stok" className="label">
            Stok awal
          </label>
          <input id="psd-stok" name="stokAwal" type="number" min={0} defaultValue={0} className="input" />
        </div>
        <div>
          <label htmlFor="psd-harga" className="label">
            Harga satuan (Rp)
          </label>
          <input id="psd-harga" name="hargaSatuan" type="number" min={0} defaultValue={0} className="input" />
        </div>
        <div>
          <label htmlFor="psd-min" className="label">
            Stok minimum
          </label>
          <input id="psd-min" name="stokMinimum" type="number" min={0} defaultValue={0} className="input" />
        </div>
      </div>
      <div>
        <label htmlFor="psd-catatan" className="label">
          Catatan
        </label>
        <input id="psd-catatan" name="catatan" className="input" placeholder="Opsional" />
      </div>
      <Submit
        label="Simpan persediaan"
        pendingLabel="Menyimpan…"
        icon={<PackagePlus className="h-4 w-4" />}
      />
    </form>
  );
}

export function MutasiForm({ items }: { items: PersediaanStok[] }) {
  const [state, action] = useActionState(tambahMutasiAction, initial);
  const [jenis, setJenis] = useState<"masuk" | "keluar">("masuk");
  const [persediaanId, setPersediaanId] = useState(String(items[0]?.id ?? ""));
  const [jumlah, setJumlah] = useState("1");

  const dipilih = items.find((item) => String(item.id) === persediaanId);
  const jumlahAngka = Number(jumlah) || 0;
  const stokBaru = dipilih
    ? jenis === "masuk"
      ? dipilih.stok + jumlahAngka
      : dipilih.stok - jumlahAngka
    : 0;

  return (
    <form action={action} className="space-y-3.5">
      <Feedback state={state} />

      <input type="hidden" name="jenis" value={jenis} />
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-brand-50/70 p-1.5">
        {(
          [
            { value: "masuk", label: "Penerimaan", icon: ArrowDownCircle },
            { value: "keluar", label: "Pengeluaran", icon: ArrowUpCircle },
          ] as const
        ).map((option) => {
          const Icon = option.icon;
          const active = jenis === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setJenis(option.value)}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] font-semibold transition ${
                active
                  ? option.value === "masuk"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-rose-600 text-white shadow-sm"
                  : "text-brand-800 hover:bg-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {option.label}
            </button>
          );
        })}
      </div>

      <div>
        <label htmlFor="mut-item" className="label">
          Barang persediaan <span className="text-rose-500">*</span>
        </label>
        <select
          id="mut-item"
          name="persediaanId"
          className="input"
          value={persediaanId}
          onChange={(event) => setPersediaanId(event.target.value)}
          required
        >
          {items.length === 0 && <option value="">Belum ada persediaan</option>}
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nama} — stok {formatAngka(item.stok)} {item.satuan}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="mut-jumlah" className="label">
            Jumlah <span className="text-rose-500">*</span>
          </label>
          <input
            id="mut-jumlah"
            name="jumlah"
            type="number"
            min={1}
            value={jumlah}
            onChange={(event) => setJumlah(event.target.value)}
            className="input"
            required
          />
        </div>
        <div>
          <label htmlFor="mut-tanggal" className="label">
            Tanggal
          </label>
          <input
            id="mut-tanggal"
            name="tanggal"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="mut-bukti" className="label">
            No. bukti
          </label>
          <input id="mut-bukti" name="noBukti" className="input" placeholder="Otomatis jika kosong" />
        </div>
        <div>
          <label htmlFor="mut-pihak" className="label">
            {jenis === "masuk" ? "Pemasok / asal" : "Unit pemakai / tujuan"}
          </label>
          <input
            id="mut-pihak"
            name="pihak"
            className="input"
            placeholder={jenis === "masuk" ? "Toko / rekanan" : "Ruang Guru, Kelas 7A…"}
          />
        </div>
      </div>

      <div>
        <label htmlFor="mut-ket" className="label">
          Keterangan
        </label>
        <input id="mut-ket" name="keterangan" className="input" placeholder="Opsional" />
      </div>

      {dipilih && (
        <div className="rounded-xl border border-brand-900/10 bg-cream-50/70 px-3.5 py-2.5 text-[12px] text-brand-900/70">
          Stok saat ini <strong>{formatAngka(dipilih.stok)} {dipilih.satuan}</strong> → setelah transaksi{" "}
          <strong className={stokBaru < 0 ? "text-rose-600" : "text-brand-800"}>
            {formatAngka(stokBaru)} {dipilih.satuan}
          </strong>
          {dipilih.hargaSatuan > 0 && (
            <span className="block text-[11px] text-brand-900/45">
              Nilai transaksi ± {formatRupiah(jumlahAngka * dipilih.hargaSatuan)}
            </span>
          )}
        </div>
      )}

      <Submit
        label={jenis === "masuk" ? "Catat penerimaan" : "Catat pengeluaran"}
        pendingLabel="Menyimpan…"
        icon={<Save className="h-4 w-4" />}
      />
    </form>
  );
}
