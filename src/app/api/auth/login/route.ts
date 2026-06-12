import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkPassword, hashPassword, setSession } from "@/lib/auth";

const schema = z.object({
  // Accept a username OR an email (the ported login form uses username).
  identifier: z.string().min(1).optional(),
  email: z.string().optional(),
  password: z.string().min(1),
});

// On a fresh deploy there is no owner account yet. The first time someone logs
// in with the ADMIN_EMAIL/ADMIN_PASSWORD from the environment, we create the
// owner account automatically — no command-line seeding needed in production.
async function ensureAdmin(email: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) return;
  if (email.toLowerCase() !== adminEmail.toLowerCase()) return;

  const exists = await db.user.findUnique({ where: { email: adminEmail } });
  if (exists) return;
  await db.user.create({
    data: {
      email: adminEmail,
      passwordHash: await hashPassword(adminPassword),
      role: "ADMIN",
      name: "FONCÉ Owner",
      username: "fonce-admin",
    },
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { password } = parsed.data;
  const id = (parsed.data.identifier ?? parsed.data.email ?? "").trim();
  if (!id) {
    return NextResponse.json({ error: "Enter your username or email" }, { status: 400 });
  }

  // Admin auto-create works by email.
  if (id.includes("@")) await ensureAdmin(id);

  const isEmail = id.includes("@");
  const user = await db.user.findFirst({
    where: isEmail ? { email: id } : { username: id.toLowerCase() },
  });
  if (!user || !(await checkPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Incorrect username or password" }, { status: 401 });
  }

  setSession(user.id);
  return NextResponse.json({ ok: true, role: user.role });
}
