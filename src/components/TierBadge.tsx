import { tierFor } from "@/lib/sourceTier";

/** Customer-facing source-quality badge. */
export function TierBadge({
  sourceUrl,
  supplier,
  showShipping = false,
  className = "",
}: {
  sourceUrl?: string | null;
  supplier?: string | null;
  showShipping?: boolean;
  className?: string;
}) {
  const tier = tierFor({ sourceUrl, supplier });
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${tier.badgeClass} ${className}`}
      title={tier.shipping}
    >
      <span aria-hidden>✓</span>
      {tier.label}
      {showShipping && <span className="opacity-70">· {tier.shipping}</span>}
    </span>
  );
}
