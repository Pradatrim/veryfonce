"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Variant = {
  id: string;
  name: string;
  sourcePrice: number;
  sellPrice: number;
  stock: number;
  active: boolean;
  image: string | null;
};
type Product = {
  id: string;
  title: string;
  description: string;
  images: string[];
  currency: string;
  sourcePrice: number;
  sellPrice: number;
  active: boolean;
  sourceUrl: string;
  variants: Variant[];
};
type Order = {
  id: string;
  title: string;
  amountTotal: number;
  creatorPayout: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  createdAt: string;
};
type Props = {
  user: { name: string; username: string; bio: string; profilePhoto: string | null; stripeConnected: boolean };
  products: Product[];
  orders: Order[];
  stripeLive: boolean;
};

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export default function DashboardClient({ user, products, orders, stripeLive }: Props) {
  const [tab, setTab] = useState<"products" | "profile" | "payouts" | "orders">("products");

  return (
    <div>
      <div className="mb-6 flex gap-1 rounded-full border border-ink/10 bg-white p-1 text-sm">
        {(["products", "profile", "payouts", "orders"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-full px-4 py-2 capitalize transition ${
              tab === t ? "bg-ink text-white" : "text-ink/60 hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "products" && <ProductsTab products={products} />}
      {tab === "profile" && <ProfileTab user={user} />}
      {tab === "payouts" && <PayoutsTab connected={user.stripeConnected} stripeLive={stripeLive} />}
      {tab === "orders" && <OrdersTab orders={orders} />}
    </div>
  );
}

/* ───────────────────────── Products ───────────────────────── */
function ProductsTab({ products }: { products: Product[] }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [msg, setMsg] = useState("");

  async function importProduct(e: React.FormEvent) {
    e.preventDefault();
    setImporting(true);
    setMsg("");
    const res = await fetch("/api/products/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    setImporting(false);
    if (!res.ok) return setMsg(data.error ?? "Import failed");
    setUrl("");
    setMsg(data.mode === "demo" ? "Imported (demo data — live parsing was blocked)" : "Imported!");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="font-medium">Import a product</h2>
        <p className="mt-1 text-sm text-ink/60">
          Paste an AliExpress product link. Price and variants fill in automatically.
          The original supplier cost is locked.
        </p>
        <form onSubmit={importProduct} className="mt-4 flex gap-2">
          <input
            className="input"
            placeholder="https://www.aliexpress.com/item/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <button className="btn whitespace-nowrap" disabled={importing}>
            {importing ? "Importing…" : "Import"}
          </button>
        </form>
        {msg && <p className="mt-2 text-sm text-ink/60">{msg}</p>}
      </div>

      {products.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink/50">
          No products yet. Import your first one above.
        </p>
      ) : (
        products.map((p) => <ProductCard key={p.id} product={p} />)
      )}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const [title, setTitle] = useState(product.title);
  const [sellPrice, setSellPrice] = useState(product.sellPrice);
  const [active, setActive] = useState(product.active);
  const [variants, setVariants] = useState(product.variants);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  function setVariant(id: string, patch: Partial<Variant>) {
    setVariants((vs) => vs.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }

  async function save() {
    setSaving(true);
    setMsg("");
    const res = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        sellPrice,
        active,
        variants: variants.map((v) => ({
          id: v.id,
          name: v.name,
          sellPrice: v.sellPrice,
          stock: v.stock,
          active: v.active,
        })),
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return setMsg(data.error ?? "Save failed");
    setMsg("Saved");
    router.refresh();
  }

  async function remove() {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    router.refresh();
  }

  const margin = (sell: number, source: number) =>
    `${sell > 0 ? Math.round(((sell - source) / sell) * 100) : 0}% margin`;

  return (
    <div className="card">
      <div className="flex gap-4">
        {product.images[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.images[0]} alt="" className="h-20 w-20 rounded-lg object-cover" />
        )}
        <div className="flex-1">
          <input className="input font-medium" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="mt-2 flex flex-wrap items-end gap-4">
            <div>
              <label className="label">Supplier cost (locked)</label>
              <div className="rounded-lg bg-ink/5 px-3 py-2 text-sm text-ink/60">
                ${product.sourcePrice.toFixed(2)} 🔒
              </div>
            </div>
            <div>
              <label className="label">Your price</label>
              <input
                className="input w-28"
                type="number"
                step="0.01"
                min={product.sourcePrice}
                value={sellPrice}
                onChange={(e) => setSellPrice(Number(e.target.value))}
              />
            </div>
            <div className="pb-2 text-xs text-ink/50">{margin(sellPrice, product.sourcePrice)}</div>
            <label className="flex items-center gap-2 pb-2 text-sm">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              Live
            </label>
          </div>
        </div>
      </div>

      {variants.length > 0 && (
        <div className="mt-4 border-t border-ink/10 pt-4">
          <p className="label">Variants ({variants.length})</p>
          <div className="space-y-2">
            {variants.map((v) => (
              <div key={v.id} className="flex flex-wrap items-center gap-3 rounded-lg bg-ink/[0.03] px-3 py-2">
                <input
                  className="input flex-1 min-w-[140px]"
                  value={v.name}
                  onChange={(e) => setVariant(v.id, { name: e.target.value })}
                />
                <span className="text-xs text-ink/50">cost ${v.sourcePrice.toFixed(2)} 🔒</span>
                <div>
                  <span className="mr-1 text-xs text-ink/50">price</span>
                  <input
                    className="input inline w-24"
                    type="number"
                    step="0.01"
                    min={v.sourcePrice}
                    value={v.sellPrice}
                    onChange={(e) => setVariant(v.id, { sellPrice: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <span className="mr-1 text-xs text-ink/50">stock</span>
                  <input
                    className="input inline w-20"
                    type="number"
                    value={v.stock}
                    onChange={(e) => setVariant(v.id, { stock: Number(e.target.value) })}
                  />
                </div>
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={v.active}
                    onChange={(e) => setVariant(v.id, { active: e.target.checked })}
                  />
                  on
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button className="btn" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button className="text-sm text-red-600 hover:underline" onClick={remove}>
          Delete
        </button>
        {msg && <span className="text-sm text-ink/60">{msg}</span>}
      </div>
    </div>
  );
}

/* ───────────────────────── Profile ───────────────────────── */
function ProfileTab({ user }: { user: Props["user"] }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [preview, setPreview] = useState<string | null>(user.profilePhoto);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const fd = new FormData();
    fd.set("name", name);
    fd.set("bio", bio);
    if (file) fd.set("photo", file);
    const res = await fetch("/api/profile", { method: "POST", body: fd });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return setMsg(data.error ?? "Save failed");
    setMsg("Saved");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="card max-w-lg space-y-4">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full bg-ink/10">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl text-ink/30">
              {(name || "?")[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <label className="btn-outline cursor-pointer">
          Upload photo
          <input type="file" accept="image/*" className="hidden" onChange={onFile} />
        </label>
      </div>
      <div>
        <label className="label">Display name</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="label">Bio</label>
        <textarea className="input min-h-[80px]" value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>
      <p className="text-xs text-ink/50">Your storefront: fonce.app/{user.username}</p>
      <div className="flex items-center gap-3">
        <button className="btn" disabled={saving}>{saving ? "Saving…" : "Save profile"}</button>
        {msg && <span className="text-sm text-ink/60">{msg}</span>}
      </div>
    </form>
  );
}

/* ───────────────────────── Payouts ───────────────────────── */
function PayoutsTab({ connected, stripeLive }: { connected: boolean; stripeLive: boolean }) {
  return (
    <div className="card max-w-lg space-y-3">
      <h2 className="font-medium">Get paid</h2>
      {!stripeLive ? (
        <p className="text-sm text-ink/60">
          Payments are in <strong>demo mode</strong>. Once the owner adds Stripe keys,
          you&apos;ll connect your bank here to receive your earnings automatically on every sale.
        </p>
      ) : connected ? (
        <p className="text-sm text-green-700">✓ Your payout account is connected.</p>
      ) : (
        <>
          <p className="text-sm text-ink/60">
            Connect your account to receive your share of each sale automatically.
          </p>
          <a className="btn" href="/api/connect/onboard">Connect payouts</a>
        </>
      )}
    </div>
  );
}

/* ───────────────────────── Orders ───────────────────────── */
function OrdersTab({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return <p className="py-10 text-center text-sm text-ink/50">No orders yet.</p>;
  }
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase text-ink/50">
          <tr>
            <th className="pb-2">Product</th>
            <th className="pb-2">Total</th>
            <th className="pb-2">Your earnings</th>
            <th className="pb-2">Payment</th>
            <th className="pb-2">Fulfillment</th>
            <th className="pb-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t border-ink/10">
              <td className="py-2">{o.title}</td>
              <td className="py-2">{money(o.amountTotal)}</td>
              <td className="py-2 font-medium">{money(o.creatorPayout)}</td>
              <td className="py-2"><Badge status={o.paymentStatus} /></td>
              <td className="py-2"><Badge status={o.fulfillmentStatus} /></td>
              <td className="py-2 text-ink/50">{new Date(o.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const tone =
    status === "paid" || status === "ordered" || status === "shipped"
      ? "bg-green-100 text-green-700"
      : status === "failed"
      ? "bg-red-100 text-red-700"
      : "bg-ink/10 text-ink/60";
  return <span className={`rounded-full px-2 py-0.5 text-xs ${tone}`}>{status}</span>;
}
