// AliExpress product import.
// ----------------------------------------------------------------------------
// Given a product URL the creator pastes, this returns a normalized product
// with its ORIGINAL price and all variants. The original prices returned here
// become the LOCKED sourcePrice on Product/Variant — the creator can never
// edit them.
//
// Two modes:
//   1. LIVE (when ALIEXPRESS_APP_KEY is set): call AliExpress's API. The exact
//      call is stubbed where the official Dropship API would go — that program
//      requires business approval, so the hook is here and ready.
//   2. DEMO (default): we try a best-effort fetch+parse of the public product
//      page, and if that is blocked (AliExpress often blocks bots) we fall back
//      to a deterministic generated product so the whole flow is testable.
// ----------------------------------------------------------------------------

export interface ImportedVariant {
  sourceVariantId: string;
  name: string;
  options: Record<string, string>;
  image?: string;
  sku?: string;
  sourcePrice: number; // ORIGINAL cost, will be locked
  stock: number;
}

export interface ImportedProduct {
  supplier: "aliexpress";
  sourceUrl: string;
  sourceItemId: string | null;
  title: string;
  description: string;
  images: string[];
  currency: string;
  sourcePrice: number; // lowest variant price, will be locked
  variants: ImportedVariant[];
  mode: "live" | "parsed" | "demo";
}

/** Pull the AliExpress numeric item id out of a variety of URL shapes. */
export function extractItemId(url: string): string | null {
  const patterns = [
    /\/item\/(?:[^/]*?_)?(\d{6,})\.html/i,
    /\/i\/(\d{6,})\.html/i,
    /item\/(\d{6,})/i,
    /(\d{10,})/, // last resort: a long number anywhere
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

function isAliExpressUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return /(^|\.)aliexpress\.(com|us|ru)$/i.test(u.hostname);
  } catch {
    return false;
  }
}

// Deterministic pseudo-random from a string so a given URL always generates
// the same demo product (stable across imports).
function seeded(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Build a believable demo product (used when live parse is unavailable). */
function buildDemoProduct(url: string): ImportedProduct {
  const id = extractItemId(url) ?? String(Math.abs(hashString(url)) % 9_000_000_000 + 1_000_000_000);
  const rand = seeded(id);

  const titles = [
    "Wireless Bluetooth Earbuds Pro",
    "Minimalist Leather Crossbody Bag",
    "LED Sunset Projection Lamp",
    "Stainless Steel Insulated Bottle",
    "Adjustable Phone Tripod Stand",
    "Oversized Cotton Hoodie",
  ];
  const title = titles[Math.floor(rand() * titles.length)];

  const colors = ["Black", "White", "Beige", "Navy"];
  const sizes = ["S", "M", "L", "XL"];
  const useSizes = rand() > 0.4;
  const colorCount = 2 + Math.floor(rand() * (colors.length - 1));
  const baseCost = round2(4 + rand() * 22); // original supplier cost

  const variants: ImportedVariant[] = [];
  const chosenColors = colors.slice(0, colorCount);
  const chosenSizes = useSizes ? sizes.slice(0, 2 + Math.floor(rand() * 2)) : [null];

  for (const color of chosenColors) {
    for (const size of chosenSizes) {
      const bump = (useSizes && size === "XL" ? 1.5 : 0) + rand() * 2;
      const options: Record<string, string> = { Color: color };
      if (size) options.Size = size;
      const name = size ? `${color} / ${size}` : color;
      variants.push({
        sourceVariantId: `${id}-${name.replace(/\s+/g, "")}`,
        name,
        options,
        sourcePrice: round2(baseCost + bump),
        stock: 20 + Math.floor(rand() * 480),
        image: `https://picsum.photos/seed/${encodeURIComponent(id + color)}/600/600`,
      });
    }
  }

  const sourcePrice = Math.min(...variants.map((v) => v.sourcePrice));
  const images = chosenColors.map(
    (c) => `https://picsum.photos/seed/${encodeURIComponent(id + c)}/600/600`,
  );

  return {
    supplier: "aliexpress",
    sourceUrl: url,
    sourceItemId: id,
    title,
    description:
      "Imported from AliExpress. Edit this description and your selling price in your dashboard. The original supplier cost is locked and cannot be changed.",
    images,
    currency: "USD",
    sourcePrice,
    variants,
    mode: "demo",
  };
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

/**
 * Best-effort parse of the public AliExpress product page. AliExpress embeds a
 * `window.runParams` JSON blob with the full product + SKU data. When reachable
 * we extract the real title, images, and per-SKU original prices.
 */
async function tryParseLivePage(url: string): Promise<ImportedProduct | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      // Don't hang the import request forever.
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    const m = html.match(/window\.runParams\s*=\s*({[\s\S]*?});/);
    if (!m) return null;
    const data = JSON.parse(m[1]);
    const d = data?.data ?? data;

    const title: string | undefined =
      d?.titleModule?.subject ?? d?.productInfoComponent?.subject;
    const priceComp = d?.priceModule ?? d?.priceComponent;
    const skuComp = d?.skuModule ?? d?.skuComponent;
    if (!title || !skuComp) return null;

    const id = extractItemId(url);
    const images: string[] =
      d?.imageModule?.imagePathList ?? d?.productImage?.imagePathList ?? [];

    const variants: ImportedVariant[] = [];
    const priceList = skuComp?.skuPriceList ?? [];
    for (const sku of priceList) {
      const cost =
        sku?.skuVal?.skuAmount?.value ??
        sku?.skuVal?.actSkuCalPrice ??
        sku?.skuVal?.skuCalPrice;
      if (cost == null) continue;
      variants.push({
        sourceVariantId: String(sku?.skuId ?? sku?.skuIdStr ?? ""),
        name: sku?.skuAttr ?? sku?.skuPropIds ?? "Default",
        options: {},
        sourcePrice: round2(Number(cost)),
        stock: Number(sku?.skuVal?.availQuantity ?? 0),
      });
    }
    if (variants.length === 0) return null;

    return {
      supplier: "aliexpress",
      sourceUrl: url,
      sourceItemId: id,
      title,
      description: "Imported from AliExpress.",
      images: images.map((p) => (p.startsWith("http") ? p : `https:${p}`)),
      currency: priceComp?.currencyCode ?? "USD",
      sourcePrice: Math.min(...variants.map((v) => v.sourcePrice)),
      variants,
      mode: "parsed",
    };
  } catch {
    return null;
  }
}

/** Main entry point: import a product from a pasted AliExpress link. */
export async function importAliExpressProduct(url: string): Promise<ImportedProduct> {
  if (!isAliExpressUrl(url)) {
    // We still let it through for demo purposes, but flag the supplier.
    // In production you'd reject non-AliExpress links here.
  }

  // 1. Live API path (when credentials exist) would go here.
  //    AliExpress Dropship API requires approval; wire it in when granted.

  // 2. Best-effort live page parse.
  const parsed = await tryParseLivePage(url);
  if (parsed) return parsed;

  // 3. Deterministic demo fallback so the flow always works end-to-end.
  return buildDemoProduct(url);
}
