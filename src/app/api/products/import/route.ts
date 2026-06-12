import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { importAliExpressProduct } from "@/lib/import/aliexpress";

const schema = z.object({ url: z.string().url() });

// Default markup applied at import so a sell price exists immediately.
// The creator can adjust the sell price afterward (but never the source price).
const DEFAULT_MARKUP = 2.0; // 2x the supplier cost

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CREATOR") {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid product URL" }, { status: 400 });
  }

  let imported;
  try {
    imported = await importAliExpressProduct(parsed.data.url);
  } catch {
    return NextResponse.json({ error: "Could not import that product" }, { status: 502 });
  }

  const round2 = (n: number) => Math.round(n * 100) / 100;

  // Persist the product. When a real price was detected it's locked into
  // sourcePrice immediately. When not, priceDetected=false signals the dashboard
  // to ask the creator for the source price once.
  const product = await db.product.create({
    data: {
      creatorId: user.id,
      supplier: imported.supplier,
      sourceUrl: imported.sourceUrl,
      sourceItemId: imported.sourceItemId,
      title: imported.title,
      description: imported.description,
      images: JSON.stringify(imported.images),
      currency: imported.currency,
      sourcePrice: imported.sourcePrice, // LOCKED when priceDetected
      sellPrice: imported.priceDetected ? round2(imported.sourcePrice * DEFAULT_MARKUP) : 0,
      priceDetected: imported.priceDetected,
      // A product still needing a price starts hidden until the creator finishes.
      active: imported.priceDetected,
      variants: {
        create: imported.variants.map((v) => ({
          sourceVariantId: v.sourceVariantId,
          name: v.name,
          options: JSON.stringify(v.options),
          image: v.image,
          sku: v.sku,
          sourcePrice: v.sourcePrice, // LOCKED
          sellPrice: round2(v.sourcePrice * DEFAULT_MARKUP),
          stock: v.stock,
        })),
      },
    },
    include: { variants: true },
  });

  return NextResponse.json({
    ok: true,
    productId: product.id,
    mode: imported.mode,
    priceDetected: imported.priceDetected,
  });
}
