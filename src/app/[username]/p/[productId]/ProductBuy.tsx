"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Variant = { id: string; name: string; sellPrice: number; stock: number; image: string | null };
type Product = { id: string; sellPrice: number; currency: string; variants: Variant[] };

export default function ProductBuy({ product }: { product: Product }) {
  const router = useRouter();
  const [variantId, setVariantId] = useState<string | null>(
    product.variants.length > 0 ? product.variants[0].id : null,
  );
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    email: "", name: "", line1: "", line2: "", city: "", state: "", postal: "", country: "US",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selected = product.variants.find((v) => v.id === variantId) ?? null;
  const price = selected ? selected.sellPrice : product.sellPrice;

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function buy(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        variantId: variantId ?? undefined,
        quantity: qty,
        email: form.email,
        name: form.name,
        address: {
          line1: form.line1, line2: form.line2, city: form.city,
          state: form.state, postal: form.postal, country: form.country,
        },
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error ?? "Checkout failed");
    // Demo mode returns an internal path; live mode returns a Stripe URL.
    if (data.redirect?.startsWith("http")) window.location.href = data.redirect;
    else router.push(data.redirect);
  }

  return (
    <div className="mt-6">
      <p className="text-2xl font-semibold">${price.toFixed(2)}</p>

      {product.variants.length > 0 && (
        <div className="mt-4">
          <p className="label">Options</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariantId(v.id)}
                disabled={v.stock <= 0}
                className={`rounded-full border px-3 py-1.5 text-sm transition disabled:opacity-30 ${
                  variantId === v.id ? "border-ink bg-ink text-white" : "border-ink/20 hover:border-ink/50"
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <label className="label mb-0">Qty</label>
        <input
          type="number" min={1} max={99} value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
          className="input w-20"
        />
      </div>

      {!open ? (
        <button className="btn mt-6 w-full" onClick={() => setOpen(true)}>
          Buy now
        </button>
      ) : (
        <form onSubmit={buy} className="mt-6 space-y-3">
          <p className="font-medium">Shipping details</p>
          <input className="input" placeholder="Email" type="email" value={form.email} onChange={set("email")} required />
          <input className="input" placeholder="Full name" value={form.name} onChange={set("name")} required />
          <input className="input" placeholder="Address" value={form.line1} onChange={set("line1")} required />
          <input className="input" placeholder="Apt, suite (optional)" value={form.line2} onChange={set("line2")} />
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="City" value={form.city} onChange={set("city")} required />
            <input className="input" placeholder="State/Region" value={form.state} onChange={set("state")} />
            <input className="input" placeholder="Postal code" value={form.postal} onChange={set("postal")} required />
            <input className="input" placeholder="Country (e.g. US)" value={form.country} onChange={set("country")} required />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn w-full" disabled={loading}>
            {loading ? "Processing…" : `Pay $${(price * qty).toFixed(2)}`}
          </button>
          <p className="text-center text-xs text-ink/40">
            Secure checkout. Your order ships directly from the supplier.
          </p>
        </form>
      )}
    </div>
  );
}
