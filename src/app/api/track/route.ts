import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

// Lightweight insights tracking. Fire-and-forget from the showcase/product pages.
//   visit -> creator.showcaseVisits++   (by username)
//   view  -> product.views++            (by productId)
//   click -> creator.buyClicks++        (by username)
const schema = z.object({
  type: z.enum(["visit", "view", "click"]),
  username: z.string().optional(),
  productId: z.string().optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const { type, username, productId } = parsed.data;

  try {
    if (type === "view" && productId) {
      await db.product.update({ where: { id: productId }, data: { views: { increment: 1 } } });
    } else if (username) {
      const field = type === "click" ? "buyClicks" : "showcaseVisits";
      await db.user.updateMany({ where: { username: username.toLowerCase() }, data: { [field]: { increment: 1 } } });
    }
  } catch {
    // Non-critical — never block the page on a tracking failure.
  }
  return NextResponse.json({ ok: true });
}
