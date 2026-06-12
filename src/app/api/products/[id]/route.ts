import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// What a creator IS allowed to change. Note: sourcePrice is intentionally
// absent — the original supplier cost is locked and can never be edited.
const variantSchema = z.object({
  id: z.string(),
  sellPrice: z.number().positive().optional(),
  active: z.boolean().optional(),
  name: z.string().min(1).max(120).optional(),
  stock: z.number().int().min(0).optional(),
});

const schema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  sellPrice: z.number().positive().optional(),
  active: z.boolean().optional(),
  // Only honored once, when the product's price was never auto-detected.
  sourcePrice: z.number().positive().optional(),
  variants: z.array(variantSchema).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

  const product = await db.product.findUnique({
    where: { id: params.id },
    include: { variants: true },
  });
  if (!product || product.creatorId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  const body = parsed.data;

  // ── ONE-TIME SOURCE PRICE ENTRY ──
  // If auto-detection failed (priceDetected=false), the creator may set the
  // source cost exactly once. Once set it is permanently locked. If a price was
  // already detected/entered, any sourcePrice in the body is ignored.
  let newSourcePrice: number | undefined;
  let lockNow = false;
  if (body.sourcePrice != null) {
    if (product.priceDetected) {
      return NextResponse.json(
        { error: "The supplier cost is locked and can't be changed." },
        { status: 400 },
      );
    }
    newSourcePrice = Math.round(body.sourcePrice * 100) / 100;
    lockNow = true;
  }

  // The effective source cost we validate the sell price against.
  const effectiveSource = newSourcePrice ?? product.sourcePrice;

  // ── PRICE-LOCK ENFORCEMENT ──
  // Reject any sell price below the (locked) source cost — no selling at a loss.
  if (body.sellPrice != null && effectiveSource > 0 && body.sellPrice < effectiveSource) {
    return NextResponse.json(
      { error: `Price can't be below the supplier cost ($${effectiveSource.toFixed(2)})` },
      { status: 400 },
    );
  }
  if (body.variants) {
    for (const v of body.variants) {
      const existing = product.variants.find((pv) => pv.id === v.id);
      if (!existing) {
        return NextResponse.json({ error: "Unknown variant" }, { status: 400 });
      }
      if (v.sellPrice != null && v.sellPrice < existing.sourcePrice) {
        return NextResponse.json(
          {
            error: `"${existing.name}" can't be priced below its locked supplier cost ($${existing.sourcePrice.toFixed(2)})`,
          },
          { status: 400 },
        );
      }
    }
  }

  await db.product.update({
    where: { id: product.id },
    data: {
      title: body.title,
      description: body.description,
      sellPrice: body.sellPrice,
      active: body.active,
      ...(lockNow ? { sourcePrice: newSourcePrice, priceDetected: true } : {}),
    },
  });

  if (body.variants) {
    await Promise.all(
      body.variants.map((v) =>
        db.variant.update({
          where: { id: v.id },
          // Only editable fields are written — sourcePrice is never in here.
          data: {
            sellPrice: v.sellPrice,
            active: v.active,
            name: v.name,
            stock: v.stock,
          },
        }),
      ),
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

  const product = await db.product.findUnique({ where: { id: params.id } });
  if (!product || product.creatorId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await db.product.delete({ where: { id: product.id } });
  return NextResponse.json({ ok: true });
}
