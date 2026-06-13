import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { db } from "./db";

export const COOKIE_NAME = "fonce_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// Cookie options used everywhere a session cookie is written. secure:true only
// in production (HTTPS). sameSite lax so it's sent on same-site requests.
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE,
  };
}

// The signed cookie value for a user id. Exported so route handlers can set it
// directly on their NextResponse (the most reliable way to set cookies).
export function signSession(userId: string): string {
  return sign(userId);
}

function secret(): string {
  return process.env.AUTH_SECRET || "dev-insecure-secret-change-me";
}

// A session token is "<userId>.<hmac>". The HMAC binds the id to our secret so
// the cookie cannot be forged client-side.
function sign(userId: string): string {
  const sig = createHmac("sha256", secret()).update(userId).digest("hex");
  return `${userId}.${sig}`;
}

function verify(token: string | undefined): string | null {
  if (!token) return null;
  const idx = token.lastIndexOf(".");
  if (idx < 0) return null;
  const userId = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = createHmac("sha256", secret()).update(userId).digest("hex");
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return userId;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function checkPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function setSession(userId: string) {
  cookies().set(COOKIE_NAME, sign(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function clearSession() {
  cookies().delete(COOKIE_NAME);
}

/** Returns the logged-in user (or null). Safe to call in server components. */
export async function getCurrentUser() {
  const token = cookies().get(COOKIE_NAME)?.value;
  const userId = verify(token);
  if (!userId) return null;
  return db.user.findUnique({ where: { id: userId } });
}

/** Throws-style guard for API routes; returns the user or null. */
export async function requireUser() {
  return getCurrentUser();
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}
