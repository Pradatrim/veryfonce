import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { luhnCheck } from "@/lib/luhn";

// VIP upgrade. The same real validation the prototype enforced — no bypass.
// Card data is validated and DISCARDED (never stored). In production this is
// where a Stripe Payment Intent / Subscription would be created instead.
const schema = z.object({
  period: z.enum(["monthly", "annual"]).default("monthly"),
  name: z.string(),
  card: z.string(),
  exp: z.string(),
  cvc: z.string(),
  zip: z.string(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payment details" }, { status: 400 });
  const { period, name } = parsed.data;
  const cardDigits = parsed.data.card.replace(/\D/g, "");
  const expRaw = parsed.data.exp.replace(/\D/g, "");
  const cvc = parsed.data.cvc.trim();
  const zip = parsed.data.zip.trim();

  // ── Real checks (server-side), not free passes ──
  if (!name || name.trim().length < 2 || !/\s/.test(name.trim())) {
    return NextResponse.json({ error: "Enter the full name on your card." }, { status: 400 });
  }
  if (cardDigits.length < 13 || cardDigits.length > 19) {
    return NextResponse.json({ error: "Card number looks incomplete." }, { status: 400 });
  }
  if (!luhnCheck(cardDigits)) {
    return NextResponse.json({ error: "Card number is invalid. Check the digits." }, { status: 400 });
  }
  if (expRaw.length !== 4) {
    return NextResponse.json({ error: "Enter expiry as MM / YY." }, { status: 400 });
  }
  const expMonth = parseInt(expRaw.slice(0, 2), 10);
  const expYear = 2000 + parseInt(expRaw.slice(2, 4), 10);
  if (expMonth < 1 || expMonth > 12) {
    return NextResponse.json({ error: "Expiry month is invalid." }, { status: 400 });
  }
  const expDate = new Date(expYear, expMonth, 0);
  if (expDate < new Date()) {
    return NextResponse.json({ error: "Card is expired." }, { status: 400 });
  }
  if (cvc.length < 3 || cvc.length > 4) {
    return NextResponse.json({ error: "CVC must be 3 or 4 digits." }, { status: 400 });
  }
  if (zip.length < 3) {
    return NextResponse.json({ error: "ZIP / postal code required." }, { status: 400 });
  }

  // Only NOW grant VIP.
  await db.user.update({
    where: { id: user.id },
    data: { isVip: true, vipSince: new Date(), vipPeriod: period },
  });

  return NextResponse.json({ ok: true });
}
