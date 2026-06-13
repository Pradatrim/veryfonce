import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { buildThemeConfig, themeToCss } from "@/lib/themes";
import ShowcaseTheme from "@/components/ShowcaseTheme";
import CartButton from "@/components/CartButton";
import OwnerBar from "@/components/OwnerBar";

export const dynamic = "force-dynamic";

// Ported from viewShowcase(): applies the creator's theme, then renders products
// in their chosen template (grid / editorial / minimal) with their price-display
// preference (price / shop now / cart icon).
export default async function StorefrontPage({ params }: { params: { username: string } }) {
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
      <OwnerBar username={creator.username} />
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
