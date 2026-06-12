"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { getCart, setQty, removeFromCart, clearCart, CART_EVENT, type CartItem } from "@/lib/cart";

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", line1: "", line2: "", city: "", state: "", postal: "", country: "US" });

  useEffect(() => {
    const update = () => setItems(getCart());
    update();
    window.addEventListener(CART_EVENT, update);
    return () => window.removeEventListener(CART_EVENT, update);
  }, []);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setCheckingOut(true);
    setError("");
    // Place each cart item as an order against its creator's storefront.
    let lastRedirect: string | null = null;
    for (const it of items) {
      const res = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: it.productId, variantId: it.variantId, quantity: it.qty,
          email: form.email, name: form.name,
          address: { line1: form.line1, line2: form.line2, city: form.city, state: form.state, postal: form.postal, country: form.country },
        }),
      });
      const data = await res.json();
      if (!res.ok) { setCheckingOut(false); setError(data.error ?? "Checkout failed"); return; }
      // Live Stripe returns a hosted URL — redirect immediately (single-item case).
      if (data.redirect?.startsWith("http")) { window.location.href = data.redirect; return; }
      lastRedirect = data.redirect;
    }
    clearCart();
    setCheckingOut(false);
    router.push(lastRedirect ?? "/");
  }

  return (
    <>
      <SiteHeader />
      <div className="wrap">
        <div className="form-page">
          <Link href="/" className="back-link">← Continue shopping</Link>
          <h1>Your bag</h1>

          {items.length === 0 ? (
            <div className="empty-state"><h3>Your bag is empty.</h3><p>Add products from any creator&apos;s showcase.</p></div>
          ) : (
            <>
              <div className="cart-items" style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
                {items.map((it) => (
                  <div key={`${it.productId}-${it.variantId ?? ""}`} className="card" style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div style={{ width: 64, height: 64, borderRadius: 10, backgroundImage: `url('${it.image}')`, backgroundSize: "cover", backgroundPosition: "center", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{it.title}</div>
                      <div style={{ color: "var(--fg-muted)", fontSize: ".85rem" }}>@{it.username} · ${it.price.toFixed(2)}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                      <button className="btn btn-sm" onClick={() => setQty(it.productId, it.variantId, it.qty - 1)}>−</button>
                      <span>{it.qty}</span>
                      <button className="btn btn-sm" onClick={() => setQty(it.productId, it.variantId, it.qty + 1)}>+</button>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(it.productId, it.variantId)}>Remove</button>
                  </div>
                ))}
              </div>

              <div className="price-preview" style={{ marginTop: "1.5rem" }}>
                <div className="item"><div className="label">Subtotal</div><div className="val">${subtotal.toFixed(2)}</div></div>
              </div>
              <p className="fee-note">Shipping calculated by each supplier. Orders ship directly to you.</p>

              {!open ? (
                <button className="btn btn-primary btn-block" onClick={() => setOpen(true)}>Checkout</button>
              ) : (
                <form onSubmit={placeOrder} style={{ marginTop: "1rem", display: "grid", gap: ".75rem" }}>
                  <p style={{ fontWeight: 600 }}>Shipping details</p>
                  <input className="input" placeholder="Email" type="email" value={form.email} onChange={set("email")} required />
                  <input className="input" placeholder="Full name" value={form.name} onChange={set("name")} required />
                  <input className="input" placeholder="Address" value={form.line1} onChange={set("line1")} required />
                  <input className="input" placeholder="Apt, suite (optional)" value={form.line2} onChange={set("line2")} />
                  <div className="field-row">
                    <input className="input" placeholder="City" value={form.city} onChange={set("city")} required />
                    <input className="input" placeholder="State/Region" value={form.state} onChange={set("state")} />
                  </div>
                  <div className="field-row">
                    <input className="input" placeholder="Postal code" value={form.postal} onChange={set("postal")} required />
                    <input className="input" placeholder="Country (e.g. US)" value={form.country} onChange={set("country")} required />
                  </div>
                  {error && <div className="error">{error}</div>}
                  <button className="btn btn-primary btn-block" disabled={checkingOut}>
                    {checkingOut ? "Placing order…" : `Pay $${subtotal.toFixed(2)}`}
                  </button>
                  <p style={{ textAlign: "center", fontSize: ".75rem", color: "var(--fg-dim)" }}>
                    Secure checkout. Each order ships directly from its supplier.
                  </p>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
