"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";

// Ported from viewAddProduct(). Fetch auto-fills via /api/products/fetch
// (ScrapingBee/AliExpress backend); "Add to showcase" posts /api/products/create.
type Variant = { label: string; price: number; sku: string };
type Tier = { key: string; label: string; badge: string; shortBadge: string; description: string };

export default function AddProductPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [sourceUrl, setSourceUrl] = useState("");
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [cost, setCost] = useState<number | "">("");
  const [costLocked, setCostLocked] = useState(false); // true once a real price is detected
  const [markup, setMarkup] = useState<number | "">("");
  const [description, setDescription] = useState("");

  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [tier, setTier] = useState<Tier | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);

  // If the session isn't recognized, send them to log in rather than letting
  // Fetch fail with "Not authorized".
  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => { if (!d.user) router.replace("/login"); })
      .catch(() => {});
  }, [router]);

  const listed = (Number(cost) || 0) + (Number(markup) || 0);
  const fee = Math.round(listed * 0.1 * 100) / 100;
  const profit = Math.round(((Number(markup) || 0) - fee) * 100) / 100;
  const tierClass = useMemo(() => (tier ? `tier-${tier.key}` : ""), [tier]);

  async function doFetch() {
    if (!sourceUrl.trim()) { setError("Paste a product URL first."); return; }
    setFetching(true);
    setError("");
    setStatus("Fetching…");
    const res = await fetch("/api/products/fetch", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: sourceUrl }),
    });
    if (res.status === 401) { router.replace("/login"); return; }
    const data = await res.json();
    setFetching(false);
    if (!res.ok) { setStatus(""); setError(data.error ?? "Fetch failed"); return; }

    setTier(data.tier);
    if (data.title) setTitle(String(data.title).slice(0, 140));
    if (data.description) setDescription(String(data.description).slice(0, 240));
    if (data.image) setImage(data.image);
    setVariants(data.variants ?? []);
    setSelectedSku(null);

    if (data.priceDetected && data.sourcePrice > 0) {
      setCost(Number(data.sourcePrice.toFixed(2)));
      setCostLocked(true);
      setStatus(data.mode === "scrapingbee" || data.mode === "parsed"
        ? "✓ Auto-filled from the source page. Price is locked."
        : "✓ Imported. Price is locked.");
    } else {
      // Auto-detect failed — let them enter the price they see (once).
      setCost("");
      setCostLocked(false);
      setStatus("⚠ Price not detected — type the price you see on the source page.");
    }
  }

  function pickVariant(v: Variant) {
    setSelectedSku(v.sku);
    const base = title.split(" — ")[0];
    setTitle(`${base} — ${v.label}`);
    if (v.price > 0) { setCost(Number(v.price.toFixed(2))); setCostLocked(true); }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { setError("Image too large. Use a file under 2 MB."); return; }
    if (!f.type.startsWith("image/")) { setError("Please choose an image file."); return; }
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(f);
  }

  async function save() {
    setError("");
    if (!sourceUrl.trim()) { setError("A source URL is required."); return; }
    if (!title.trim()) { setError("Add a product title."); return; }
    if (!cost || Number(cost) <= 0) { setError("Enter the source price."); return; }
    const selected = variants.find((v) => v.sku === selectedSku);
    setSaving(true);
    const res = await fetch("/api/products/create", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, image, sourceUrl, sourcePrice: Number(cost), markup: Number(markup) || 0,
        description, priceDetected: costLocked,
        variantSku: selected?.sku, variantLabel: selected?.label,
      }),
    });
    if (res.status === 401) { router.replace("/login"); return; }
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Could not add product"); return; }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <>
      <SiteHeader />
      <div className="wrap">
        <div className="form-page">
          <a className="back-link" onClick={() => router.push("/dashboard")} style={{ cursor: "pointer" }}>← Back to dashboard</a>
          <h1>Add a product</h1>
          <p className="sub">Drop in a product from anywhere. Set your markup.</p>

          {error && <div id="err"><div className="error">{error}</div></div>}

          <div className="field">
            <label>Source product URL</label>
            <div className="url-row">
              <input placeholder="https://example.com/..." value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
              <button className="btn" type="button" onClick={doFetch} disabled={fetching}>{fetching ? "Fetching…" : "Fetch"}</button>
            </div>
            <div className="hint">We&apos;ll try to auto-fill the title, image, and price from the link.</div>
            {tier && (
              <div className={`source-tier-preview ${tierClass}`} style={{ display: "block" }}>
                {tier.key === "premium" ? "★" : tier.key === "verified" ? "✓" : "·"} <strong>{tier.label}</strong> · {tier.badge}
              </div>
            )}
            {status && <div className="fetch-status">{status}</div>}
            {variants.length > 0 && (
              <div className="variant-picker" style={{ display: "block" }}>
                <div className="variant-picker-header">
                  <span className="variant-picker-title">Choose the variant you&apos;re selling</span>
                  <span className="variant-picker-sub">{variants.length} variant{variants.length === 1 ? "" : "s"}</span>
                </div>
                <div className="variant-picker-list">
                  {variants.map((v, i) => (
                    <button key={i} type="button" className={`variant-chip ${selectedSku === v.sku ? "active" : ""}`} onClick={() => pickVariant(v)}>
                      <span className="variant-chip-label">{v.label}</span>
                      {v.price > 0 && <span className="variant-chip-price">${v.price.toFixed(2)}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="field">
            <label>Product title</label>
            <input placeholder="e.g. Linen Oversized Shirt" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="field">
            <label>Product image</label>
            <div className="image-input-row">
              <input placeholder="https://..." value={image.startsWith("data:") ? "" : image} onChange={(e) => setImage(e.target.value)} />
              <input type="file" ref={fileRef} accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: "none" }} onChange={onFile} />
              <button type="button" className="upload-btn-inline" onClick={() => fileRef.current?.click()} title="Upload from device">
                <span>Upload</span>
              </button>
            </div>
            <div className="hint">Auto-filled from your source link. Paste a different URL or upload your own. <span style={{ color: "var(--fg-dim)" }}>Max 2 MB.</span></div>
            {image && <div className="img-preview has-image" style={{ backgroundImage: `url('${image.replace(/'/g, "\\'")}')` }} />}
          </div>

          <div className="field-row">
            <div className="field">
              <label>Source price (USD)</label>
              <input type="number" step="0.01" placeholder="Auto-fills when you fetch" value={cost}
                readOnly={costLocked} onChange={(e) => setCost(e.target.value === "" ? "" : Number(e.target.value))} />
              {costLocked && <div id="ap-cost-badge"><span className="imported-badge">✓ Locked · Source price from link</span></div>}
            </div>
            <div className="field">
              <label>Your markup (USD)</label>
              <input type="number" step="0.01" placeholder="0.00" value={markup} onChange={(e) => setMarkup(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
          </div>

          <div className="price-preview">
            <div className="item"><div className="label">Listed price</div><div className="val">${listed.toFixed(2)}</div></div>
            <div className="item profit"><div className="label">Your profit</div><div className="val">${profit.toFixed(2)}</div></div>
          </div>
          <p className="fee-note">A small processing fee applies to every product sold.</p>

          <div className="field">
            <label>Description (optional)</label>
            <textarea rows={3} placeholder="Why you love it..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <button className="btn btn-primary btn-block" onClick={save} disabled={saving}>
            {saving ? "Adding…" : "Add to showcase"}
          </button>
        </div>
      </div>
    </>
  );
}
