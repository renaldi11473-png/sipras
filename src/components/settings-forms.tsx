"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, KeyRound, Save } from "lucide-react";
import { saveLembagaAction, type LembagaState } from "@/actions/lembaga";
import { changePasswordAction, type AuthState } from "@/actions/auth";

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          Menyimpan…
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          {label}
        </>
      )}
    </button>
  );
}

function Alert({ error, success }: { error?: string; success?: string }) {
  if (error) {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }
  if (success) {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{success}</span>
      </div>
    );
  }
  return null;
}

export function LembagaForm({
  initial,
}: {
  initial: {
    nama: string;
    kodeLembaga: string;
    alamat: string;
    kota: string;
    kepalaSekolah: string;
    nipKepala: string;
    penyusun: string;
    nipPenyusun: string;
    tahunAnggaran: number;
    keadaanPer: string;
  };
}) {
  const [state, formAction] = useActionState<LembagaState, FormData>(
    saveLembagaAction,
    {},
  );

  return (
    <form action={formAction} className="panel p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="font-display text-lg font-semibold text-brand-950">
          Profil Lembaga
        </h2>
        <p className="text-xs text-brand-900/50">
          Identitas ini otomatis muncul di kop laporan dan blok tanda tangan.
        </p>
      </div>

      <div className="space-y-4">
        <Alert error={state.error} success={state.success} />

        <div className="grid gap-4 sm:grid-cols-[1.6fr_1fr]">
          <div>
            <label htmlFor="nama" className="label">
              Nama Lembaga
            </label>
            <input
              id="nama"
              name="nama"
              defaultValue={initial.nama}
              className="input"
              required
            />
          </div>
          <div>
            <label htmlFor="kodeLembaga" className="label">
              Kode Lembaga
            </label>
            <input
              id="kodeLembaga"
              name="kodeLembaga"
              defaultValue={initial.kodeLembaga}
              className="input font-mono uppercase"
              placeholder="SMPSIT"
              required
            />
            <p className="mt-1 text-[11px] text-brand-900/45">
              Dipakai sebagai awalan kode barang.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1.6fr_1fr]">
          <div>
            <label htmlFor="alamat" className="label">
              Alamat
            </label>
            <input
              id="alamat"
              name="alamat"
              defaultValue={initial.alamat}
              className="input"
            />
          </div>
          <div>
            <label htmlFor="kota" className="label">
              Kota / Kabupaten
            </label>
            <input
              id="kota"
              name="kota"
              defaultValue={initial.kota}
              className="input"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="tahunAnggaran" className="label">
              Tahun Anggaran Aktif
            </label>
            <input
              id="tahunAnggaran"
              name="tahunAnggaran"
              type="number"
              min={2000}
              max={2100}
              defaultValue={initial.tahunAnggaran}
              className="input"
              required
            />
          </div>
          <div>
            <label htmlFor="keadaanPer" className="label">
              Keadaan per Tanggal
            </label>
            <input
              id="keadaanPer"
              name="keadaanPer"
              defaultValue={initial.keadaanPer}
              className="input"
              placeholder="31 Desember 2026"
            />
          </div>
        </div>

        <div className="rounded-xl border border-brand-900/10 bg-cream-50/60 p-4">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-700">
            Penanda Tangan Laporan
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="kepalaSekolah" className="label">
                Kepala Lembaga
              </label>
              <input
                id="kepalaSekolah"
                name="kepalaSekolah"
                defaultValue={initial.kepalaSekolah}
                className="input"
                placeholder="Nama lengkap & gelar"
              />
              <input
                name="nipKepala"
                defaultValue={initial.nipKepala}
                className="input mt-2"
                placeholder="NIP (opsional)"
                aria-label="NIP kepala lembaga"
              />
            </div>
            <div>
              <label htmlFor="penyusun" className="label">
                Pengurus Barang / Penyusun
              </label>
              <input
                id="penyusun"
                name="penyusun"
                defaultValue={initial.penyusun}
                className="input"
                placeholder="Nama lengkap"
              />
              <input
                name="nipPenyusun"
                defaultValue={initial.nipPenyusun}
                className="input mt-2"
                placeholder="NIP (opsional)"
                aria-label="NIP penyusun"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <SaveButton label="Simpan profil lembaga" />
        </div>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction] = useActionState<AuthState, FormData>(
    changePasswordAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-3.5">
      <Alert error={state.error} success={state.success} />
      <div>
        <label htmlFor="current" className="label">
          Password saat ini
        </label>
        <input
          id="current"
          name="current"
          type="password"
          className="input"
          autoComplete="current-password"
          required
        />
      </div>
      <div>
        <label htmlFor="next" className="label">
          Password baru
        </label>
        <input
          id="next"
          name="next"
          type="password"
          className="input"
          autoComplete="new-password"
          minLength={4}
          required
        />
      </div>
      <div>
        <label htmlFor="confirm" className="label">
          Konfirmasi password baru
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          className="input"
          autoComplete="new-password"
          minLength={4}
          required
        />
      </div>
      <button type="submit" className="btn-ghost w-full">
        <KeyRound className="h-4 w-4" />
        Perbarui password
      </button>
    </form>
  );
}
