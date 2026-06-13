import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, COOKIE_NAME, signSession, sessionCookieOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).max(80).optional(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_-]+$/i, "Letters, numbers, dashes and underscores only"),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const { email, password, name } = parsed.data;
  const username = parsed.data.username.toLowerCase();

  const reserved = ["admin", "api", "dashboard", "login", "signup", "demo", "fonce-admin"];
  const existing = await db.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing || reserved.includes(username)) {
    return NextResponse.json(
      { error: "That email or username is already taken" },
      { status: 409 },
    );
  }

  const user = await db.user.create({
    data: {
      email,
      name: name ?? username,
      username,
      passwordHash: await hashPassword(password),
      role: "CREATOR",
    },
  });

  const res = NextResponse.json({ ok: true, username: user.username });
  res.cookies.set(COOKIE_NAME, signSession(user), sessionCookieOptions());
  return res;
}
