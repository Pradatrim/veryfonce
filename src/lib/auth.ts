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

export interface SessionUser {
  id: string;
  role: string;
  username: string;
}

function secret(): string {
  return process.env.AUTH_SECRET || "dev-insecure-secret-change-me";
}

// A session token is "<base64url(JSON{id,role,username})>.<hmac>". Carrying the
// role + username in the (signed) cookie means "are you logged in?" can be
// answered from the cookie alone — no database call — so a DB hiccup on Vercel
// can never falsely log you out.
function b64url(s: string): string {
  return Buffer.from(s, "utf8").toString("base64url");
}
function sign(payload: string): string {
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

// The signed cookie value for a user. Exported so route handlers can set it
// directly on their NextResponse (the most reliable way to set cookies).
export function signSession(user: SessionUser): string {
  return sign(b64url(JSON.stringify({ id: user.id, role: user.role, username: user.username })));
}

function verify(token: string | undefined): SessionUser | null {
  if (!token) return null;
  const idx = token.lastIndexOf(".");
  if (idx < 0) return null;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = createHmac("sha256", secret()).update(payload).digest("hex");
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const obj = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (obj && typeof obj.id === "string" && typeof obj.role === "string") {
      return { id: obj.id, role: obj.role, username: obj.username ?? "" };
    }
    // Back-compat: an old "<userId>.<hmac>" cookie verified above — treat the
    // payload as the raw id (role/username unknown; resolved via DB by callers).
    return { id: payload, role: "CREATOR", username: "" };
  } catch {
    return { id: payload, role: "CREATOR", username: "" };
  }
}

/** Logged-in user FROM THE COOKIE ONLY (no DB). Use for nav / auth display. */
export function getSessionUser(): SessionUser | null {
  return verify(cookies().get(COOKIE_NAME)?.value);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function checkPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function clearSession() {
  cookies().delete(COOKIE_NAME);
}

/** Full user record from the DB (needs the database). Use for page data. */
export async function getCurrentUser() {
  const session = getSessionUser();
  if (!session) return null;
  return db.user.findUnique({ where: { id: session.id } });
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
