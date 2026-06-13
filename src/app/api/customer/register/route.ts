import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import {
  hashPassword, checkPassword, COOKIE_NAME, signSession, sessionCookieOptions,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

// Customer account at checkout. Creates a CUSTOMER account (or logs into an
// existing one) and sets the session, so a follower must register to buy.
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1).max(120),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { email, password, name } = parsed.data;

  let user = await db.user.findUnique({ where: { email } });
  if (user) {
    // Email already registered — verify the password to sign them in.
    if (!(await checkPassword(password, user.passwordHash))) {
      return NextResponse.json(
        { error: "An account with this email already exists — enter its password to continue." },
        { status: 401 },
      );
    }
  } else {
    // Brand-new customer account (random internal username; not a storefront).
    const username = "cust" + randomBytes(7).toString("hex");
    user = await db.user.create({
      data: { email, passwordHash: await hashPassword(password), role: "CUSTOMER", name, username },
    });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, signSession(user), sessionCookieOptions());
  return res;
}
