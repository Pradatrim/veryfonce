import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { importAliExpressProduct } from "@/lib/import/aliexpress";
import { detectSourceTier } from "@/lib/sourceTier";

// Fetch product data from a pasted URL WITHOUT saving it — used to auto-fill the
// Add Product form. Uses the same ScrapingBee/AliExpress import pipeline.
// AI extraction renders the page through premium proxies — allow up to 60s.
export const maxDuration = 60;

const schema = z.object({ url: z.string().url() });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid product URL" }, { status: 400 });

  let data;
  try {
    data = await importAliExpressProduct(parsed.data.url);
  } catch {
    return NextResponse.json({ error: "Could not fetch that product" }, { status: 502 });
  }

  const tier = detectSourceTier(parsed.data.url);
  return NextResponse.json({
    ok: true,
    mode: data.mode,
    priceDetected: data.priceDetected,
    title: data.title,
    description: data.description,
    image: data.images[0] ?? "",
    images: data.images,
    sourcePrice: data.sourcePrice,
    currency: data.currency,
    variants: data.variants.map((v) => ({ label: v.name, price: v.sourcePrice, sku: v.sourceVariantId })),
    tier: { key: tier.key, label: tier.label, badge: tier.badge, shortBadge: tier.shortBadge, description: tier.description },
  });
}
