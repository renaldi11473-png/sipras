"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import {
  clearSessionCookie,
  createSessionToken,
  getSession,
  hashPassword,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";

export type AuthState = { error?: string; success?: string };

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  await ensureSeed();

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Username dan password wajib diisi." };
  }

  const found = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  const user = found[0];
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "Username atau password salah. Coba kembali." };
  }

  const token = createSessionToken({
    id: user.id,
    username: user.username,
    nama: user.nama,
    peran: user.peran,
  });

  await setSessionCookie(token);
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

export async function changePasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const session = await getSession();
  if (!session) return { error: "Sesi berakhir, silakan login kembali." };

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (next.length < 4) {
    return { error: "Password baru minimal 4 karakter." };
  }
  if (next !== confirm) {
    return { error: "Konfirmasi password tidak sama." };
  }

  const rows = await db
    .select()
    .from(users)
    .where(eq(users.id, session.id))
    .limit(1);
  const user = rows[0];
  if (!user || !verifyPassword(current, user.passwordHash)) {
    return { error: "Password saat ini tidak sesuai." };
  }

  await db
    .update(users)
    .set({ passwordHash: hashPassword(next) })
    .where(eq(users.id, user.id));

  return { success: "Password berhasil diperbarui." };
}
