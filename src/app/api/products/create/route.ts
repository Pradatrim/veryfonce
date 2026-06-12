import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { detectSourceTier } from "@/lib/sourceTier";

// Create a product from the Add Product form. listedPrice = sourcePrice + markup.
// The source price is stored as the locked supplier cost.
const schema = z.object({
  title: z.string().min(1).max(200),
  image: z.string().max(2_000_000).optional(), // URL or base64 data URL
  sourceUrl: z.string().url(),
  sourcePrice: z.number().min(0),
  markup: z.number().min(0),
  description: z.string().max(5000).optional(),
  priceDetected: z.boolean().default(true),
  variantSku: z.string().optional(),
  variantLabel: z.string().optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CREATOR") {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const b = parsed.data;
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const sourcePrice = round2(b.sourcePrice);
  const sellPrice = round2(b.sourcePrice + b.markup);
  const tier = detectSourceTier(b.sourceUrl);

  let title = b.title.trim();
  if (b.variantLabel && !title.includes(" — ")) title = `${title} — ${b.variantLabel}`;

  const product = await db.product.create({
    data: {
      creatorId: user.id,
      supplier: "aliexpress",
      sourceUrl: b.sourceUrl,
      sourceItemId: null,
      title,
      description: b.description ?? "",
      images: JSON.stringify(b.image ? [b.image] : []),
      currency: "USD",
      sourcePrice,
      sellPrice,
      priceDetected: b.priceDetected,
      sourceTier: tier.key,
      active: b.priceDetected && sourcePrice > 0,
      variants: b.variantLabel
        ? {
            create: [{
              sourceVariantId: b.variantSku ?? null,
              name: b.variantLabel,
              options: "{}",
              sourcePrice,
              sellPrice,
              stock: 0,
            }],
          }
        : undefined,
    },
  });

  return NextResponse.json({ ok: true, productId: product.id });
}
