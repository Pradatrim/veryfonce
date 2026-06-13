import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { buildThemeConfig, themeToCss } from "@/lib/themes";
import ShowcaseTheme from "@/components/ShowcaseTheme";
import CartButton from "@/components/CartButton";

export const dynamic = "force-dynamic";

// Ported from viewShowcase(): applies the creator's theme, then renders products
// in their chosen template (grid / editorial / minimal) with their price-display
// preference (price / shop now / cart icon).
export default async function StorefrontPage({
  params,
  searchParams,
}: {
  params: { username: string };
  searchParams: { owner?: string };
}) {
  const creator = await db.user.findUnique({
    where: { username: params.username.toLowerCase() },
    include: {
      products: {
        where: { active: true, paused: false, archived: false },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!creator || creator.role === "ADMIN") notFound();

  // Show the Back-to-dashboard bar when the viewer is the owner (session check)
  // OR when they arrived via the dashboard's "view live" link (?owner=1) — the
  // latter is bulletproof even if the auth check is blocked on preview URLs.
  const me = await getCurrentUser();
  const showOwnerBar = me?.id === creator.id || searchParams.owner === "1";

  const products = creator.products.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description ?? "",
    listed: p.sellPrice,
    image: (JSON.parse(p.images) as string[])[0] ?? "",
  }));

  const href = (id: string) => `/${creator.username}/p/${id}`;
  const pd = creator.priceDisplay;

  // The whole product card is a Link, so the price slot is presentational only
  // (no nested anchors / client handlers).
  function PriceSlot({ listed }: { listed: number }) {
    if (pd === "shop") {
      return <span className="shop-now-btn">Shop now</span>;
    }
    if (pd === "cart") {
      return (
        <div className="showcase-price-cart-row">
          <div className="price">${listed.toFixed(2)}</div>
          <span className="showcase-cart-btn" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3 H5 L7 16 H19 L21 8 H6" /><circle cx="9" cy="20" r="1.4" /><circle cx="17" cy="20" r="1.4" />
            </svg>
          </span>
        </div>
      );
    }
    return <div className="price">${listed.toFixed(2)}</div>;
  }

  const initial = creator.username.charAt(0).toUpperCase();
  // Server-side theme: applies on first paint, no dependency on client JS.
  const themeCss = themeToCss(buildThemeConfig(creator));

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      <ShowcaseTheme
        username={creator.username}
        themePreset={creator.themePreset}
        themeFont={creator.themeFont}
        themeCustom={creator.themeCustom}
      />
      {showOwnerBar && (
        <div style={{
          position: "sticky", top: 0, zIndex: 40, display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: "0.75rem",
          padding: "0.55rem 1rem", paddingRight: "4rem",
          background: "#0a0a0a", color: "#f5efe4",
          borderBottom: "1px solid rgba(212,175,55,0.3)", fontSize: "0.82rem",
        }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <radialGradient id="ownerStarGrad" cx="35%" cy="28%" r="78%">
                  <stop offset="0%" stopColor="#fce99a" /><stop offset="35%" stopColor="#ecc960" />
                  <stop offset="70%" stopColor="#d4af37" /><stop offset="100%" stopColor="#7e6520" />
                </radialGradient>
              </defs>
              <path d="M 12 2.5 L 14.4 8.8 L 21 9.1 L 15.8 13.2 L 17.6 19.7 L 12 16 L 6.4 19.7 L 8.2 13.2 L 3 9.1 L 9.6 8.8 Z"
                fill="#6b5318" stroke="url(#ownerStarGrad)" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
            <span style={{ fontFamily: "var(--font-display, 'Fraunces', serif)", color: "#d4af37", fontSize: "1.15rem", letterSpacing: "-0.02em" }}>FONCÉ</span>
          </Link>
          <Link href="/dashboard" className="btn btn-sm" style={{ whiteSpace: "nowrap" }}>Back to dashboard</Link>
        </div>
      )}
      <CartButton />
      <div className="showcase-page">
        <div className="container">
          <div className="showcase-header">
            {creator.profilePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={creator.profilePhoto} alt="" className="avatar avatar-large" />
            ) : (
              <div className="avatar avatar-large" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600 }}>{initial}</div>
            )}
            <h1>@{creator.username}</h1>
            <p className="handle">{creator.tagline || "curated picks"}</p>
          </div>

          {products.length === 0 ? (
            <div className="empty-state"><h3>No products yet.</h3><p>This creator hasn&apos;t added anything to their showcase.</p></div>
          ) : creator.template === "grid" ? (
            <div className="grid-template">
              {products.map((p) => (
                <Link key={p.id} href={href(p.id)} className="product-card">
                  <div className="img" style={{ backgroundImage: `url('${p.image}')` }} />
                  <div className="title">{p.title}</div>
                  <PriceSlot listed={p.listed} />
                </Link>
              ))}
            </div>
          ) : creator.template === "editorial" ? (
            <div className="editorial-template">
              {products.map((p, i) => (
                <Link key={p.id} href={href(p.id)} className="ed-item">
                  <div className="img" style={{ backgroundImage: `url('${p.image}')` }} />
                  <div className="ed-content">
                    <div className="num">{String(i + 1).padStart(2, "0")}</div>
                    <h3>{p.title}</h3>
                    <PriceSlot listed={p.listed} />
                    <p style={{ color: "var(--fg-muted)", marginBottom: "1.5rem" }}>{p.description}</p>
                    <span className="btn">View →</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="minimal-template">
              {products.map((p) => (
                <Link key={p.id} href={href(p.id)} className="min-item">
                  <div className="img" style={{ backgroundImage: `url('${p.image}')` }} />
                  <div className="info">
                    <h4>{p.title}</h4>
                    <p>{p.description}</p>
                  </div>
                  <PriceSlot listed={p.listed} />
                </Link>
              ))}
            </div>
          )}

          <footer style={{ marginTop: "4rem", textAlign: "center", fontSize: "0.8rem", color: "var(--fg-dim)" }}>
            Powered by <Link href="/" style={{ textDecoration: "underline" }}>FONCÉ</Link>
          </footer>
        </div>
      </div>
    </>
  );
}
