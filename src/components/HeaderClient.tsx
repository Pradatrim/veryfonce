"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cartCount, CART_EVENT } from "@/lib/cart";

// Presentational nav. Auth state is passed in from the SERVER (AppHeader) so it's
// always correct and instant — no flaky client /api/me fetch. Only the drawer
// open/close and the cart count are client state.
export default function HeaderClient({
  loggedIn: initialLoggedIn,
  role: initialRole,
}: {
  loggedIn: boolean;
  role?: string;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [count, setCount] = useState(0);
  // Start from the server-rendered auth state (instant, correct on fresh loads),
  // then re-verify on the client so a STALE cached page can't show the wrong
  // (logged-out) nav. Whichever is current wins — no false logouts.
  const [loggedIn, setLoggedIn] = useState(initialLoggedIn);
  const [role, setRole] = useState(initialRole);

  useEffect(() => {
    let alive = true;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setLoggedIn(Boolean(d.user));
        setRole(d.user?.role);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const update = () => setCount(cartCount());
    update();
    window.addEventListener(CART_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(CART_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const isCreator = loggedIn && role === "CREATOR";
  const isAdmin = loggedIn && role === "ADMIN";

  return (
    <>
      <header>
        <div className="container">
          <nav>
            <div className="nav-left" id="nav-left">
              {loggedIn && (
                <button className="menu-toggle" aria-label="Open menu" onClick={() => setDrawerOpen(true)}>
                  <span></span><span></span><span></span>
                </button>
              )}
              <Link href="/" className="brand">
                <svg className="brand-star" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <defs>
                    <radialGradient id="fonceStarGrad" cx="35%" cy="28%" r="78%">
                      <stop offset="0%" stopColor="#fce99a" />
                      <stop offset="35%" stopColor="#ecc960" />
                      <stop offset="70%" stopColor="#d4af37" />
                      <stop offset="100%" stopColor="#7e6520" />
                    </radialGradient>
                  </defs>
                  <path
                    d="M 12 2.5 L 14.4 8.8 L 21 9.1 L 15.8 13.2 L 17.6 19.7 L 12 16 L 6.4 19.7 L 8.2 13.2 L 3 9.1 L 9.6 8.8 Z"
                    fill="#6b5318" stroke="url(#fonceStarGrad)" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round"
                  />
                </svg>
                <span className="brand-text">FONCÉ</span>
              </Link>
            </div>
            <div className="nav-actions" id="nav-actions">
              {isCreator ? (
                <>
                  <Link href="/cart" className={`cart-btn ${count > 0 ? "has-items" : ""}`} aria-label="Cart">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3 H5 L7 16 H19 L21 8 H6" /><circle cx="9" cy="20" r="1.4" /><circle cx="17" cy="20" r="1.4" />
                    </svg>
                    {count > 0 && <span className="cart-badge">{count}</span>}
                  </Link>
                  <Link href="/dashboard" className="btn btn-ghost btn-sm nav-link">Dashboard</Link>
                  <Link href="/api/auth/logout" className="btn btn-ghost btn-sm nav-link">Log out</Link>
                </>
              ) : isAdmin ? (
                <>
                  <Link href="/admin" className="btn btn-ghost btn-sm nav-link">Admin</Link>
                  <Link href="/api/auth/logout" className="btn btn-ghost btn-sm nav-link">Log out</Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn btn-ghost btn-sm">Login</Link>
                  <Link href="/signup" className="btn btn-primary btn-sm">Get started</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Supplier drawer (Where to shop) */}
      <div className={`drawer-overlay ${drawerOpen ? "open" : ""}`} onClick={() => setDrawerOpen(false)} />
      <aside className={`drawer ${drawerOpen ? "open" : ""}`} aria-label="Source websites">
        <button className="drawer-close" aria-label="Close menu" onClick={() => setDrawerOpen(false)}>×</button>
        <div className="drawer-eyebrow">Sources</div>
        <h2>Where to shop</h2>
        <p className="drawer-sub">
          Curated platforms that work seamlessly with Fonce. These auto-fill product details and have
          proper APIs for order fulfillment. Paste any product link to add it to your showcase.
        </p>
        <div className="source-group">
          <h3>Built for dropshipping</h3>
          <a className="source-link" href="https://www.cjdropshipping.com" target="_blank" rel="noopener noreferrer"><span className="name">CJdropshipping</span><span className="desc">Western-friendly fulfillment · 5–12 day shipping</span></a>
          <a className="source-link" href="https://www.spocket.co" target="_blank" rel="noopener noreferrer"><span className="name">Spocket</span><span className="desc">US/EU boutique suppliers · 2–7 day shipping</span></a>
          <a className="source-link" href="https://www.zendrop.com" target="_blank" rel="noopener noreferrer"><span className="name">Zendrop</span><span className="desc">Premium platform · managed AliExpress fulfillment</span></a>
          <a className="source-link" href="https://www.modalyst.co" target="_blank" rel="noopener noreferrer"><span className="name">Modalyst</span><span className="desc">Indie &amp; boutique brand network</span></a>
          <a className="source-link" href="https://trendsi.com" target="_blank" rel="noopener noreferrer"><span className="name">Trendsi</span><span className="desc">Fashion-forward · curated for style brands</span></a>
        </div>
        <div className="source-group">
          <h3>Print on Demand</h3>
          <a className="source-link" href="https://www.printful.com" target="_blank" rel="noopener noreferrer"><span className="name">Printful</span><span className="desc">Custom apparel &amp; accessories · US/EU warehouses</span></a>
          <a className="source-link" href="https://printify.com" target="_blank" rel="noopener noreferrer"><span className="name">Printify</span><span className="desc">POD network · multiple supplier choice</span></a>
        </div>
        <div className="source-group">
          <h3>For Business</h3>
          <Link className="source-link" href="/partnerships" onClick={() => setDrawerOpen(false)}><span className="name">Partnership inquiries</span><span className="desc">Brands &amp; retailers — partner with Fonce</span></Link>
        </div>
        <p className="drawer-foot">Sources outside this list aren&apos;t supported — they may block auto-fill or lack proper fulfillment APIs.</p>
      </aside>
    </>
  );
}
