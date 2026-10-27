"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Eye, EyeOff, KeyRound, LogIn, UserRound } from "lucide-react";
import { loginAction, type AuthState } from "@/actions/auth";

const initialState: AuthState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full py-3" disabled={pending}>
      {pending ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          Memeriksa akun…
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4" />
          Masuk ke dashboard
        </>
      )}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div>
        <label htmlFor="username" className="label">
          Username
        </label>
        <div className="relative">
          <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-700/50" />
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            autoFocus
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="admin"
            className="input pl-10"
          />
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="password" className="label">
            Password
          </label>
          <span className="text-[11px] font-medium text-brand-700/60">
            Akses terbatas
          </span>
        </div>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-700/50" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••"
            className="input pl-10 pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            className="absolute right-2.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-brand-700/60 transition hover:bg-brand-50 hover:text-brand-800"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <SubmitButton />

      <div className="rounded-xl border border-dashed border-brand-900/20 bg-brand-50/60 px-4 py-3 text-xs text-brand-800">
        <span className="font-semibold">Akun demo:</span> username{" "}
        <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] ring-1 ring-brand-900/10">
          admin
        </code>{" "}
        · password{" "}
        <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] ring-1 ring-brand-900/10">
          admin
        </code>
      </div>
    </form>
  );
}
