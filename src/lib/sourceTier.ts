// Source-quality tiers.
// ----------------------------------------------------------------------------
// Every product is auto-tagged by where it's sourced from. This is FONCÉ's
// trust signal: it nudges creators toward fast-shipping US/EU suppliers and
// tells customers what to expect. Tier is derived from the source URL's domain
// (falling back to the stored supplier name).
// ----------------------------------------------------------------------------

export type TierId = "premium" | "verified" | "generic";

export interface SourceTier {
  id: TierId;
  label: string; // short badge label
  shipping: string; // customer-facing expectation
  // Tailwind classes for the badge (dark-theme friendly).
  badgeClass: string;
}

const TIERS: Record<TierId, SourceTier> = {
  premium: {
    id: "premium",
    label: "Verified Brand",
    shipping: "Ships from US/EU · 2–5 days",
    badgeClass: "border-purple-400/40 bg-purple-400/10 text-purple-200",
  },
  verified: {
    id: "verified",
    label: "Verified Supplier",
    shipping: "Ships in 7–14 days",
    badgeClass: "border-accent/40 bg-accent/10 text-accent",
  },
  generic: {
    id: "generic",
    label: "Standard Supplier",
    shipping: "Ships in 15–30 days",
    badgeClass: "border-ink/20 bg-ink/5 text-ink/55",
  },
};

// Domain → tier. Premium = curated US/EU; Verified = reliable-API dropshippers;
// Generic = cheap/slow marketplaces.
const DOMAIN_TIER: { match: RegExp; tier: TierId }[] = [
  { match: /spocket|printful|printify|modalyst|trendsi|faire|syncee/i, tier: "premium" },
  { match: /cjdropshipping|cj\.|zendrop|dsers/i, tier: "verified" },
  { match: /aliexpress|alibaba|dhgate|shein|temu/i, tier: "generic" },
];

export function tierFor(opts: { sourceUrl?: string | null; supplier?: string | null }): SourceTier {
  const hay = `${opts.sourceUrl ?? ""} ${opts.supplier ?? ""}`.toLowerCase();
  for (const { match, tier } of DOMAIN_TIER) {
    if (match.test(hay)) return TIERS[tier];
  }
  return TIERS.generic;
}

export function getTier(id: TierId): SourceTier {
  return TIERS[id];
}

// ── Prototype-exact tier data (for ported dashboard/showcase chips) ──
export interface PrototypeTier {
  key: TierId;
  label: string;
  badge: string;
  shortBadge: string;
  description: string;
  color: string;
  domains: string[];
}

export const SOURCE_TIERS: Record<TierId, PrototypeTier> = {
  premium: {
    key: "premium", label: "Verified Brand",
    badge: "Ships from US/EU · 2–5 days", shortBadge: "🇺🇸 2–5 day shipping",
    description: "US/EU warehouse. Real brand names. Fast shipping, vetted quality.",
    color: "#a78bfa",
    domains: ["spocket.co", "spocket.com", "printful.com", "printify.com", "modalyst.co", "modalyst.com", "syncee.com", "syncee.co", "faire.com", "trendsi.com"],
  },
  verified: {
    key: "verified", label: "Verified Supplier",
    badge: "Ships in 7–14 days", shortBadge: "7–14 day shipping",
    description: "Vetted dropship supplier. Decent quality, mid shipping times.",
    color: "#d4af37",
    domains: ["cjdropshipping.com", "cjdropshipping.cn", "zendrop.com", "dsers.com"],
  },
  generic: {
    key: "generic", label: "Generic Source",
    badge: "Ships in 15–30 days", shortBadge: "15–30 day shipping",
    description: "Generic supplier. Lowest cost, slower shipping. Customers may notice the source.",
    color: "#8a8170",
    domains: ["aliexpress.com", "aliexpress.us", "alibaba.com", "1688.com", "dhgate.com", "banggood.com", "shein.com", "temu.com"],
  },
};

export function detectSourceTier(url?: string | null): PrototypeTier {
  if (!url) return SOURCE_TIERS.generic;
  let host = "";
  try { host = new URL(url).hostname.toLowerCase().replace(/^www\./, ""); }
  catch { return SOURCE_TIERS.generic; }
  for (const tier of [SOURCE_TIERS.premium, SOURCE_TIERS.verified, SOURCE_TIERS.generic]) {
    if (tier.domains.some((d) => host.endsWith(d))) return tier;
  }
  return { ...SOURCE_TIERS.generic, label: "Unknown Source", shortBadge: "Shipping varies" };
}
