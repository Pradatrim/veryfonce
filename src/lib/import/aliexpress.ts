// AliExpress product import.
// ----------------------------------------------------------------------------
// Given a product URL the creator pastes, return a normalized product with its
// ORIGINAL price and all variants. Those original prices become the LOCKED
// sourcePrice on Product/Variant — the creator can never edit them.
//
// Fetch strategy (in order):
//   1. ScrapingBee (when SCRAPINGBEE_API_KEY is set) — premium proxies + JS
//      render, the reliable way to read AliExpress server-side.
//   2. Direct fetch of the public page — free but often blocked by anti-bot.
//   3. Deterministic demo product — so the flow always works end-to-end while
//      developing / before the key is configured.
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
  mode: "scrapingbee" | "parsed" | "demo" | "manual";
  // True when a real source price was extracted (and is now locked). False when
  // auto-detection failed and the creator must enter the price once by hand.
  priceDetected: boolean;
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

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ── Deterministic demo fallback ─────────────────────────────────────────────
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

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

function buildDemoProduct(url: string): ImportedProduct {
  const id = extractItemId(url) ?? String((Math.abs(hashString(url)) % 9_000_000_000) + 1_000_000_000);
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
  const baseCost = round2(4 + rand() * 22);

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
    priceDetected: true,
  };
}

// ── Parsing AliExpress' embedded product JSON ───────────────────────────────
// AliExpress pages embed a `window.runParams` blob with the full product + SKU
// data. We extract the real title, images, and per-SKU ORIGINAL prices.
function parseRunParams(
  html: string,
  url: string,
  mode: "scrapingbee" | "parsed",
): ImportedProduct | null {
  try {
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
    const rawImages: string[] =
      d?.imageModule?.imagePathList ?? d?.productImage?.imagePathList ?? [];

    // Map skuId -> attribute label (e.g. "Color: Red, Size: M") for nice names.
    const propLabels = new Map<string, string>();
    const props = skuComp?.productSKUPropertyList ?? [];
    for (const p of props) {
      for (const v of p?.skuPropertyValues ?? []) {
        propLabels.set(
          `${p.skuPropertyId}:${v.propertyValueId}`,
          v.propertyValueDisplayName ?? v.propertyValueName ?? "",
        );
      }
    }
    const labelFor = (skuPropIds: string | undefined, attr: string | undefined): string => {
      if (skuPropIds) {
        const parts = String(skuPropIds)
          .split(",")
          .map((pair) => {
            const [pid] = pair.split(":");
            return propLabels.get(pair) ?? null;
          })
          .filter(Boolean);
        if (parts.length) return parts.join(" / ");
      }
      return attr || "Default";
    };

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
        name: labelFor(sku?.skuPropIds, sku?.skuAttr),
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
      images: rawImages.map((p) => (p.startsWith("http") ? p : `https:${p}`)),
      currency: priceComp?.currencyCode ?? "USD",
      sourcePrice: Math.min(...variants.map((v) => v.sourcePrice)),
      variants,
      mode,
      priceDetected: true,
    };
  } catch {
    return null;
  }
}

// When auto-detection fails, return an empty shell the creator completes by
// hand: they enter the source price (once) and edit the title in the dashboard.
function manualShell(url: string): ImportedProduct {
  return {
    supplier: "aliexpress",
    sourceUrl: url,
    sourceItemId: extractItemId(url),
    title: "Imported product — add a title",
    description: "We couldn't auto-detect this product's details. Add the title, image, and the price shown on the source page. The price locks once you save it.",
    images: [],
    currency: "USD",
    sourcePrice: 0,
    variants: [],
    mode: "manual",
    priceDetected: false,
  };
}

// ── ScrapingBee AI extraction (primary) ─────────────────────────────────────
// Renders the page (premium proxy + JS) and asks ScrapingBee's AI to pull the
// title, price, images, and variants from the painted DOM. This works where
// parsing embedded JSON fails (modern AliExpress loads product data via XHR).
async function fetchViaScrapingBeeAI(url: string): Promise<ImportedProduct | null> {
  const key = process.env.SCRAPINGBEE_API_KEY;
  if (!key) return null;
  const rules = {
    title: "the product title",
    price: "the current selling price in USD as a number only, no currency symbol; if a range, the lowest",
    main_image: "the main product image URL",
    images: "array of all product image URLs",
    variants:
      "array of the product's variant/sku options; each item an object with a 'name' (e.g. color/size) and a numeric 'price' in USD",
  };
  const endpoint =
    `https://app.scrapingbee.com/api/v1/?api_key=${key}` +
    `&url=${encodeURIComponent(url)}` +
    `&render_js=true&premium_proxy=true&country_code=us&wait=5000` +
    `&ai_extract_rules=${encodeURIComponent(JSON.stringify(rules))}`;
  try {
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(58000) });
    if (!res.ok) return null;
    const data = await res.json();

    const num = (v: unknown): number | null => {
      if (typeof v === "number" && isFinite(v)) return v;
      if (typeof v === "string") {
        const m = v.replace(/[^0-9.]/g, "");
        const n = parseFloat(m);
        return isFinite(n) ? n : null;
      }
      return null;
    };

    const title: string | null = typeof data.title === "string" ? data.title.trim() : null;
    const basePrice = num(data.price);
    let images: string[] = Array.isArray(data.images)
      ? data.images.filter((s: unknown): s is string => typeof s === "string" && s.startsWith("http"))
      : [];
    if (images.length === 0 && typeof data.main_image === "string" && data.main_image.startsWith("http")) {
      images = [data.main_image];
    }

    const variants: ImportedVariant[] = [];
    if (Array.isArray(data.variants)) {
      for (const v of data.variants) {
        const name = typeof v?.name === "string" ? v.name : typeof v === "string" ? v : null;
        if (!name) continue;
        const vp = num(v?.price) ?? basePrice;
        if (vp == null) continue;
        variants.push({
          sourceVariantId: `${extractItemId(url) ?? ""}-${name.replace(/\s+/g, "")}`,
          name,
          options: {},
          sourcePrice: round2(vp),
          stock: 50,
          image: images[0],
        });
      }
    }

    // Need at least a title and a price (base or via variants) to count as a hit.
    const variantMin = variants.length ? Math.min(...variants.map((v) => v.sourcePrice)) : null;
    const sourcePrice = basePrice ?? variantMin;
    if (!title || sourcePrice == null) return null;

    return {
      supplier: "aliexpress",
      sourceUrl: url,
      sourceItemId: extractItemId(url),
      title,
      description: "Imported via FONCÉ.",
      images,
      currency: "USD",
      sourcePrice: round2(sourcePrice),
      variants,
      mode: "scrapingbee",
      priceDetected: true,
    };
  } catch {
    return null;
  }
}

// ── Fetch strategies ────────────────────────────────────────────────────────
async function fetchViaScrapingBee(url: string): Promise<string | null> {
  const key = process.env.SCRAPINGBEE_API_KEY;
  if (!key) return null;
  try {
    const endpoint =
      `https://app.scrapingbee.com/api/v1/?api_key=${key}` +
      `&url=${encodeURIComponent(url)}&render_js=true&premium_proxy=true&country_code=us&wait=8000`;
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(55000) });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function fetchDirect(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** Main entry point: import a product from a pasted AliExpress link. */
export async function importAliExpressProduct(url: string): Promise<ImportedProduct> {
  void isAliExpressUrl; // (kept for future strict validation)

  // 1. ScrapingBee AI extraction (primary) — reads the rendered page.
  const ai = await fetchViaScrapingBeeAI(url);
  if (ai) return ai;

  // 2. ScrapingBee + embedded-JSON parse (legacy AliExpress runParams).
  const beeHtml = await fetchViaScrapingBee(url);
  if (beeHtml) {
    const parsed = parseRunParams(beeHtml, url, "scrapingbee");
    if (parsed) return parsed;
  }

  // 3. Direct fetch (free, often blocked).
  const directHtml = await fetchDirect(url);
  if (directHtml) {
    const parsed = parseRunParams(directHtml, url, "parsed");
    if (parsed) return parsed;
  }

  // 3a. Local/dev convenience: rich generated demo data so the UI is testable
  //     without live scraping. Enabled only when IMPORT_DEMO=1.
  if (process.env.IMPORT_DEMO === "1") {
    return buildDemoProduct(url);
  }

  // 3b. Production: auto-detection failed — hand off to manual entry.
  return manualShell(url);
}
