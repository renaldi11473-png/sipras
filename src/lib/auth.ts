import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "sipras_session";
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 jam
const PASSWORD_SALT = "sipras-smpsit-mutiara";

function secret() {
  return process.env.AUTH_SECRET ?? "sipras-smpsit-mutiara-dev-secret";
}

export function hashPassword(password: string) {
  return createHash("sha256")
    .update(`${PASSWORD_SALT}:${password}`)
    .digest("hex");
}

export function verifyPassword(password: string, hash: string) {
  const candidate = Buffer.from(hashPassword(password));
  const stored = Buffer.from(hash);
  if (candidate.length !== stored.length) return false;
  return timingSafeEqual(candidate, stored);
}

export type SessionUser = {
  id: number;
  username: string;
  nama: string;
  peran: string;
  exp: number;
};

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(
  user: Pick<SessionUser, "id" | "username" | "nama" | "peran">,
) {
  const payload = Buffer.from(
    JSON.stringify({
      ...user,
      exp: Date.now() + SESSION_MAX_AGE * 1000,
    }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string | undefined): SessionUser | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as SessionUser;
    if (!data.exp || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  return readSessionToken(store.get(SESSION_COOKIE)?.value);
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function setSessionCookie(token: string) {
  const [store, headerList] = await Promise.all([cookies(), headers()]);
  const forwardedProto = headerList.get("x-forwarded-proto");
  const isHttps = forwardedProto
    ? forwardedProto.split(",")[0].trim() === "https"
    : process.env.NODE_ENV === "production";

  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
    secure: isHttps,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
