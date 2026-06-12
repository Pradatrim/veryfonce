"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  THEME_PRESETS, FONT_SETS, applyTheme, buildThemeConfig,
  isPresetVip, isFontVip, type ThemeConfig,
} from "@/lib/themes";
import VipPaywall from "@/components/VipPaywall";

type Product = {
  id: string; title: string; image: string; sourcePrice: number; sellPrice: number;
  priceDetected: boolean; active: boolean; paused: boolean; archived: boolean;
  detectedNewPrice: number | null; views: number; sourceUrl: string;
  tier: { key: string; label: string; shortBadge: string; description: string };
};
type User = {
  username: string; profilePhoto: string | null; tagline: string; template: string;
  priceDisplay: string; themePreset: string; themeFont: string; themeCustom: string | null;
  isVip: boolean; showcaseVisits: number; buyClicks: number;
};
type Stats = {
  totalSales: number; totalEarnings: number; totalProductViews: number;
  rewardsBalance: number; nextReward: { amount: number; expiresAt: string } | null;
};

const FonceStar = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M 12 2.5 L 14.4 8.8 L 21 9.1 L 15.8 13.2 L 17.6 19.7 L 12 16 L 6.4 19.7 L 8.2 13.2 L 3 9.1 L 9.6 8.8 Z"
      fill="#6b5318" stroke="url(#fonceStarGrad)" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
  </svg>
);

export default function DashboardClient({ user, products, stats }: { user: User; products: Product[]; stats: Stats }) {
  const router = useRouter();
  const photoInput = useRef<HTMLInputElement>(null);

  const [tagline, setTagline] = useState(user.tagline);
  const [template, setTemplate] = useState(user.template);
  const [priceDisplay, setPriceDisplay] = useState(user.priceDisplay);
  const [preset, setPreset] = useState(user.themePreset);
  const [font, setFont] = useState(user.themeFont);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const [copied, setCopied] = useState(false);

  // Apply the saved theme to the page on mount (and when changed).
  useEffect(() => {
    applyTheme(buildThemeConfig({ themePreset: preset, themeFont: font, themeCustom: user.themeCustom }));
  }, [preset, font, user.themeCustom]);

  const link = `fonce.com/@${user.username}`;

  async function patch(body: Record<string, unknown>) {
    const res = await fetch("/api/profile", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    if (res.ok) router.refresh();
    return res.ok;
  }

  function pickTheme(key: string) {
    if (isPresetVip(key) && !user.isVip) { setPaywall(true); return; }
    setPreset(key);
    applyTheme({ preset: key, font } as ThemeConfig);
    patch({ themePreset: key });
  }
  function pickFont(key: string) {
    if (isFontVip(key) && !user.isVip) { setPaywall(true); return; }
    setFont(key);
    applyTheme({ preset, font: key } as ThemeConfig);
    patch({ themeFont: key });
  }
  function pickTemplate(t: string) { setTemplate(t); patch({ template: t }); }
  function pickPrice(p: string) { setPriceDisplay(p); patch({ priceDisplay: p }); }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.set("photo", f);
    const res = await fetch("/api/profile", { method: "POST", body: fd });
    if (res.ok) router.refresh();
  }
  async function removePhoto() { await patch({ removePhoto: true }); }

  function copyLink() {
    navigator.clipboard?.writeText(`https://${link}`).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1500);
    });
  }

  async function productAction(id: string, body: Record<string, unknown> | "delete") {
    if (body === "delete") {
      if (!confirm("Remove this product?")) return;
      await fetch(`/api/products/${id}`, { method: "DELETE" });
    } else {
      await fetch(`/api/products/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
    }
    router.refresh();
  }

  const pausedCount = products.filter((p) => p.paused && !p.archived).length;

  return (
    <>
      {/* shared gradient def for the gold stars */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <radialGradient id="fonceStarGrad" cx="35%" cy="28%" r="78%">
            <stop offset="0%" stopColor="#fce99a" /><stop offset="35%" stopColor="#ecc960" />
            <stop offset="70%" stopColor="#d4af37" /><stop offset="100%" stopColor="#7e6520" />
          </radialGradient>
        </defs>
      </svg>

      <div className="dash">
        <div className="container">
          {/* Header */}
          <div className="dash-header">
            <div className="dash-identity">
              <div className="dash-avatar-wrap" onClick={() => photoInput.current?.click()} title="Click to change profile photo">
                {user.profilePhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.profilePhoto} alt="" className="avatar dash-avatar" />
                ) : (
                  <div className="avatar dash-avatar" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600 }}>
                    {user.username[0]?.toUpperCase()}
                  </div>
                )}
                <div className="dash-avatar-overlay">Change</div>
                {user.profilePhoto && (
                  <button className="dash-avatar-remove" title="Remove photo" onClick={(e) => { e.stopPropagation(); removePhoto(); }}>×</button>
                )}
                <input type="file" ref={photoInput} accept="image/*" style={{ display: "none" }} onChange={onPhoto} />
              </div>
              <div>
                <h1>@{user.username}</h1>
                <p style={{ color: "var(--fg-muted)" }}>
                  Your showcase · <a href={`/${user.username}`} target="_blank" rel="noreferrer">view live</a>
                </p>
              </div>
            </div>
            <div className="share-link" onClick={copyLink} title="Click to copy">
              <span style={{ color: "var(--fg-muted)" }}>Your link:</span>
              <span className="share-link-url">{link}</span>
              <button className="share-link-copy" title="Copy link" aria-label="Copy link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="8" y="8" width="11" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* VIP banner */}
          <div className={`vip-banner ${user.isVip ? "is-vip" : ""}`}>
            <div className="vip-banner-left">
              {user.isVip ? (
                <>
                  <FonceStar />
                  <div><strong>Fonce VIP</strong><small>All customization unlocked.</small></div>
                </>
              ) : (
                <div><strong>Free plan</strong><small>Upgrade to unlock custom colors, ombre, image backgrounds, and premium fonts.</small></div>
              )}
            </div>
            {!user.isVip && (
              <button className="btn btn-primary btn-sm btn-vip-upgrade" onClick={() => setPaywall(true)}>Upgrade to VIP</button>
            )}
          </div>

          {/* Rewards */}
          {(stats.rewardsBalance > 0 || user.isVip) && (
            <div className="rewards-card">
              <div className="rewards-card-left">
                <div className="rewards-card-label">Fonce Rewards</div>
                <div className="rewards-card-balance">${stats.rewardsBalance.toFixed(2)}</div>
                <div className="rewards-card-meta">Earn 5% back on every order. Use rewards at checkout.</div>
              </div>
              {stats.rewardsBalance > 0 && <FonceStar size={36} />}
            </div>
          )}

          {/* Stats */}
          <div className="stats">
            <div className="stat"><div className="label">Products</div><div className="val">{products.length}</div></div>
            <div className="stat"><div className="label">Sales</div><div className="val">{stats.totalSales}</div></div>
            <div className="stat"><div className="label">Earnings</div><div className="val">${stats.totalEarnings.toFixed(2)}</div></div>
          </div>

          {/* Insights */}
          <div className="insights-wrap">
            <button className="btn btn-insights" onClick={() => setInsightsOpen((v) => !v)}>
              <span>Insights</span><span className="chev">▾</span>
            </button>
            {insightsOpen && (
              <div className="insights-panel" style={{ display: "grid" }}>
                <div className="insight">
                  <div className="label">Visits</div>
                  <div className="val">{user.showcaseVisits}</div>
                  <div className="desc">People who opened your showcase link.</div>
                </div>
                <div className={`insight ${!user.isVip ? "locked" : ""}`}>
                  <div className="label">Views {!user.isVip && <span className="vip-badge sm">VIP</span>}</div>
                  <div className={`val ${!user.isVip ? "blurred" : ""}`}>{user.isVip ? stats.totalProductViews : "•••"}</div>
                  <div className="desc">Visitors who clicked into a product.</div>
                </div>
                <div className={`insight ${!user.isVip ? "locked" : ""}`}>
                  <div className="label">Clicks {!user.isVip && <span className="vip-badge sm">VIP</span>}</div>
                  <div className={`val ${!user.isVip ? "blurred" : ""}`}>{user.isVip ? user.buyClicks : "•••"}</div>
                  <div className="desc">Visitors who tapped &quot;Buy now&quot;.</div>
                </div>
              </div>
            )}
          </div>

          {pausedCount > 0 && (
            <div className="alert-banner">
              <h4>{pausedCount} product{pausedCount > 1 ? "s" : ""} need{pausedCount > 1 ? "" : "s"} attention</h4>
              <p>Source data has changed. Hidden from your showcase until you review and republish.</p>
            </div>
          )}

          {/* Tagline */}
          <div className="section-head"><h2>Tagline</h2><span className="meta">a short line under your @username</span></div>
          <div className="tagline-editor">
            <input type="text" maxLength={60} placeholder="e.g. the brands I actually wear" value={tagline} onChange={(e) => setTagline(e.target.value)} />
            <div className="tagline-controls">
              <span className="tagline-count">{tagline.length} / 60</span>
              <button className="btn btn-sm" onClick={() => patch({ tagline })}>Save</button>
            </div>
          </div>

          {/* Price display */}
          <div className="section-head"><h2>Price display</h2><span className="meta">how prices appear on your showcase</span></div>
          <div className="pd-segments">
            {[
              { k: "price", label: "Show price" },
              { k: "shop", label: "Shop now" },
              { k: "cart", label: "Cart icon" },
            ].map((s) => (
              <button key={s.k} type="button" className={`pd-segment ${priceDisplay === s.k ? "active" : ""}`} onClick={() => pickPrice(s.k)}>
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Layout */}
          <div className="section-head"><h2>Layout</h2><span className="meta">how your products are presented</span></div>
          <div className="templates">
            {[
              { k: "grid", title: "Grid", desc: "Clean, image-forward. The default.", cells: 6, cls: "tpl-grid" },
              { k: "editorial", title: "Editorial", desc: "Magazine-style. Storytelling layout.", cells: 2, cls: "tpl-edit" },
              { k: "minimal", title: "Minimal", desc: "Vertical list. Quiet luxury.", cells: 4, cls: "tpl-min" },
            ].map((t) => (
              <div key={t.k} className={`template-option ${template === t.k ? "active" : ""}`} onClick={() => pickTemplate(t.k)}>
                <div className={`template-preview ${t.cls}`}>{Array.from({ length: t.cells }).map((_, i) => <div key={i} />)}</div>
                <h4>{t.title}</h4><p>{t.desc}</p>
              </div>
            ))}
          </div>

          {/* Theme */}
          <div className="section-head"><h2>Theme</h2><span className="meta">color palette for your public showcase</span></div>
          <div className="theme-grid">
            {Object.entries(THEME_PRESETS).map(([key, t]) => {
              const locked = Boolean(t.vip && !user.isVip);
              const swatchStyle: React.CSSProperties = t.texture
                ? { background: t.bg, backgroundImage: `url('${t.texture}'),linear-gradient(${t.bg},${t.bg})` }
                : { background: t.bg };
              return (
                <div key={key} className={`theme-option ${preset === key ? "active" : ""} ${locked ? "locked" : ""} ${t.texture ? "textured" : ""}`} onClick={() => pickTheme(key)}>
                  <div className="theme-swatch" style={swatchStyle} />
                  <div className="label">
                    {t.name}{t.live && <span className="live-tag" title="supports live mode"> ●</span>}{locked && <span className="vip-badge">VIP</span>}
                  </div>
                </div>
              );
            })}
            <div className={`theme-option custom ${preset === "custom" ? "active" : ""} ${!user.isVip ? "locked" : ""}`} onClick={() => pickTheme("custom")}>
              <div className="theme-swatch" style={{ background: "linear-gradient(135deg,#0a0806,#c9a961)" }} />
              <div className="label">Custom{!user.isVip && <span className="vip-badge">VIP</span>}</div>
            </div>
            <div className={`theme-option ombre-tile ${preset === "ombre" ? "active" : ""} ${!user.isVip ? "locked" : ""}`} onClick={() => pickTheme("ombre")}>
              <div className="theme-swatch" style={{ background: "linear-gradient(180deg,#3d1f47,#e8a04a)" }} />
              <div className="label">Ombre{!user.isVip && <span className="vip-badge">VIP</span>}</div>
            </div>
            <div className={`theme-option image-tile ${preset === "image" ? "active" : ""} ${!user.isVip ? "locked" : ""}`} onClick={() => pickTheme("image")}>
              <div className="theme-swatch" />
              <div className="label">Image{!user.isVip && <span className="vip-badge">VIP</span>}</div>
            </div>
          </div>

          {/* Fonts */}
          <div className="section-head"><h2>Font</h2><span className="meta">typography for your showcase</span></div>
          <div className="theme-grid">
            {Object.entries(FONT_SETS).map(([key, f]) => {
              const locked = isFontVip(key) && !user.isVip;
              return (
                <div key={key} className={`theme-option ${font === key ? "active" : ""} ${locked ? "locked" : ""}`} onClick={() => pickFont(key)}>
                  <div className="theme-swatch" style={{ background: "var(--bg-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: `'${f.serif}', serif`, fontSize: 22, color: "var(--fg)" }}>Aa</div>
                  <div className="label">{f.name}{locked && <span className="vip-badge">VIP</span>}</div>
                </div>
              );
            })}
          </div>

          {/* Products */}
          <div className="section-head"><h2>Products</h2><span className="meta">{products.length} total</span></div>
          {products.length === 0 ? (
            <div className="empty-state"><h3>No products yet</h3><p>Add your first product to start showcasing.</p></div>
          ) : (
            <div className="product-list">
              {products.map((p) => (
                <div key={p.id} className={`product-card-mini ${p.paused ? "paused" : ""} ${p.archived ? "archived" : ""}`}>
                  <div className="img" style={{ backgroundImage: `url('${p.image}')` }} />
                  <div className="info">
                    {p.archived ? <span className="paused-badge archived-badge">Archived</span> : p.paused ? <span className="paused-badge">Needs refresh</span> : null}
                    <h4>{p.title}</h4>
                    <span className={`source-tier-chip tier-${p.tier.key}`} title={p.tier.description}>
                      {p.tier.key === "premium" ? "★" : p.tier.key === "verified" ? "✓" : "·"} {p.tier.label} · {p.tier.shortBadge}
                    </span>
                    <div className="pricing">
                      <span>cost ${p.sourcePrice.toFixed(2)}</span>
                      <span className="listed">listed ${p.sellPrice.toFixed(2)}</span>
                    </div>
                    {user.isVip && <div className="product-meta-row"><span className="product-views">{p.views} {p.views === 1 ? "view" : "views"}</span></div>}
                    {p.paused && p.detectedNewPrice != null && (
                      <div className="price-change-note">Source price changed:<br />was ${p.sourcePrice.toFixed(2)} → <strong>${p.detectedNewPrice.toFixed(2)}</strong></div>
                    )}
                    <div className="actions">
                      {p.paused && !p.archived && <button className="btn refresh-btn" onClick={() => productAction(p.id, { paused: false })}>Refresh &amp; republish</button>}
                      {p.archived
                        ? <button className="btn archive-btn" onClick={() => productAction(p.id, { archived: false })}>Unarchive</button>
                        : <button className="btn archive-btn" onClick={() => productAction(p.id, { archived: true })}>Archive</button>}
                      <button className="btn btn-danger remove-btn" onClick={() => productAction(p.id, "delete")}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {paywall && <VipPaywall onClose={() => setPaywall(false)} onSuccess={() => { setPaywall(false); router.refresh(); }} />}
    </>
  );
}
