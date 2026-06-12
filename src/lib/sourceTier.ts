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
