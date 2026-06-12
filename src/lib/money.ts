// Money helpers. All internal money math is done in integer CENTS to avoid
// floating-point rounding errors. Prices on Product/Variant are stored as
// decimal dollars (for human-friendly editing) and converted to cents here.

export function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function toDollars(cents: number): number {
  return cents / 100;
}

export function formatMoney(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function platformFeePercent(): number {
  const raw = Number(process.env.PLATFORM_FEE_PERCENT ?? "10");
  return Number.isFinite(raw) ? raw : 10;
}

export interface MoneySplit {
  amountTotal: number; // customer pays
  supplierCost: number; // owed to supplier (locked original price)
  markup: number; // sellPrice - sourcePrice
  platformFee: number; // FONCÉ owner's cut of the markup
  creatorPayout: number; // creator's earnings
}

/**
 * The core marketplace economics, in cents.
 *
 *   customer pays  = sellPrice * qty
 *   supplier cost  = sourcePrice * qty   (locked, goes to AliExpress)
 *   markup         = customer pays - supplier cost
 *   platform fee   = markup * feePercent (FONCÉ owner / VIP)
 *   creator payout = markup - platform fee
 *
 * The owner therefore collects the platform fee on every sale. The supplier
 * cost is reserved to pay AliExpress when the order is auto-placed.
 */
export function computeSplit(opts: {
  sellPriceDollars: number;
  sourcePriceDollars: number;
  quantity: number;
  feePercent?: number;
}): MoneySplit {
  const qty = Math.max(1, Math.floor(opts.quantity));
  const fee = opts.feePercent ?? platformFeePercent();

  const amountTotal = toCents(opts.sellPriceDollars) * qty;
  const supplierCost = toCents(opts.sourcePriceDollars) * qty;
  const markup = Math.max(0, amountTotal - supplierCost);
  const platformFee = Math.round(markup * (fee / 100));
  const creatorPayout = markup - platformFee;

  return { amountTotal, supplierCost, markup, platformFee, creatorPayout };
}
