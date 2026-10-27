"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, ClipboardCheck, Equal, Minus, Plus } from "lucide-react";
import { simpanOpnameAction, type PersediaanState } from "@/actions/persediaan";
import { formatAngka } from "@/lib/constants";
import type { PersediaanStok } from "@/lib/persediaan";

const initial: PersediaanState = {};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          Menyimpan opname…
        </>
      ) : (
        <>
          <ClipboardCheck className="h-4 w-4" />
          Simpan hasil opname
        </>
      )}
    </button>
  );
}

export function OpnameForm({
  items,
  defaultPetugas,
}: {
  items: PersediaanStok[];
  defaultPetugas: string;
}) {
  const [state, action] = useActionState(simpanOpnameAction, initial);
  const [persediaanId, setPersediaanId] = useState(String(items[0]?.id ?? ""));
  const [fisik, setFisik] = useState("");

  const dipilih = items.find((item) => String(item.id) === persediaanId);
  const fisikAngka = fisik === "" ? null : Number(fisik);
  const selisih = dipilih && fisikAngka !== null ? fisikAngka - dipilih.stok : null;
  const error = state.status === "error";

  return (
    <form action={action} className="space-y-3.5">
      {state.message && (
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
      )}

      <div>
        <label htmlFor="opn-item" className="label">
          Barang persediaan <span className="text-rose-500">*</span>
        </label>
        <select
          id="opn-item"
          name="persediaanId"
          className="input"
          value={persediaanId}
          onChange={(event) => setPersediaanId(event.target.value)}
          required
        >
          {items.length === 0 && <option value="">Belum ada persediaan</option>}
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nama} — {formatAngka(item.stok)} {item.satuan}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-brand-900/10 bg-cream-50/70 px-3 py-2.5">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-brand-700/60">
            Stok sistem
          </p>
          <p className="mt-1 font-display text-xl font-semibold text-brand-900">
            {formatAngka(dipilih?.stok ?? 0)}{" "}
            <span className="text-[11px] font-medium text-brand-900/45">{dipilih?.satuan}</span>
          </p>
          <p className="text-[10.5px] text-brand-900/45">{dipilih?.lokasi}</p>
        </div>
        <div>
          <label htmlFor="opn-fisik" className="label">
            Stok fisik <span className="text-rose-500">*</span>
          </label>
          <input
            id="opn-fisik"
            name="stokFisik"
            type="number"
            min={0}
            value={fisik}
            onChange={(event) => setFisik(event.target.value)}
            className="input"
            placeholder="0"
            required
          />
        </div>
      </div>

      {selisih !== null && (
        <div
          className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-[12.5px] ${
            selisih === 0
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : selisih > 0
                ? "border-sky-200 bg-sky-50 text-sky-800"
                : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          <span className="inline-flex items-center gap-1.5 font-medium">
            {selisih === 0 ? (
              <Equal className="h-3.5 w-3.5" />
            ) : selisih > 0 ? (
              <Plus className="h-3.5 w-3.5" />
            ) : (
              <Minus className="h-3.5 w-3.5" />
            )}
            Selisih stok
          </span>
          <span className="font-display text-base font-semibold">
            {selisih > 0 ? "+" : ""}
            {formatAngka(selisih)} {dipilih?.satuan}
          </span>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="opn-tanggal" className="label">
            Tanggal opname
          </label>
          <input
            id="opn-tanggal"
            name="tanggal"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="opn-petugas" className="label">
            Petugas
          </label>
          <input
            id="opn-petugas"
            name="petugas"
            className="input"
            defaultValue={defaultPetugas}
            placeholder="Nama pemeriksa"
          />
        </div>
      </div>

      <div>
        <label htmlFor="opn-ket" className="label">
          Keterangan / penyebab selisih
        </label>
        <input
          id="opn-ket"
          name="keterangan"
          className="input"
          placeholder="Contoh: rusak saat pemakaian, salah catat"
        />
      </div>

      <label className="flex items-start gap-2.5 rounded-xl border border-brand-900/10 bg-brand-50/50 px-3.5 py-2.5 text-[12px] text-brand-900/70">
        <input
          type="checkbox"
          name="sesuaikan"
          value="ya"
          defaultChecked
          className="mt-0.5 h-4 w-4 rounded border-brand-900/20 text-brand-700"
        />
        <span>
          Sesuaikan stok sistem dengan hasil hitung fisik (membuat catatan koreksi pada
          buku mutasi).
        </span>
      </label>

      <Submit />
    </form>
  );
}
