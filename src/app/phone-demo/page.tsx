"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

// Ported from viewPhoneDemo() + runPhoneAnimation(). Demo products use simple
// image URLs in place of the prototype's inline base64 photos.
const DEMO_PRODUCTS = [
  { id: "d1", title: "Linen Oversized Shirt", price: 72.0, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80" },
  { id: "d2", title: "Minimalist Sunglasses", price: 48.0, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80" },
  { id: "d3", title: "Ceramic Pour-Over Set", price: 64.0, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80" },
  { id: "d4", title: "Woven Tote Bag", price: 58.0, image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400&q=80" },
];

const CartSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 3 H5 L7 16 H19 L21 8 H6" />
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="17" cy="20" r="1.4" />
    <g className="ps-cart-btn-star">
      <path d="M 13 7.1 L 14.1 10 L 17 10.1 L 14.7 12 L 15.5 14.9 L 13 13.2 L 10.5 14.9 L 11.3 12 L 9 10.1 L 11.9 10 Z" fill="#d4af37" stroke="none" />
    </g>
  </svg>
);

const DefaultAvatar = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="100" height="100" fill="#dadada" />
    <circle cx="50" cy="36" r="15" fill="#8a8a8a" />
    <path d="M 50 56 C 32 56, 18 72, 18 100 L 82 100 C 82 72, 68 56, 50 56 Z" fill="#8a8a8a" />
  </svg>
);

export default function PhoneDemoPage() {
  const router = useRouter();
  const stageRef = useRef<HTMLDivElement>(null);

  function runAnimation(): number[] {
    const el = stageRef.current;
    if (!el) return [];
    const ig = el.querySelector<HTMLElement>("#ig-screen");
    const ps = el.querySelector<HTMLElement>("#ps-screen");
    const pointer = el.querySelector<HTMLElement>("#tap-pointer");
    const link = el.querySelector<HTMLElement>("#ig-link-target");
    const screen = el.querySelector<HTMLElement>(".phone-screen");
    if (!ig || !ps || !pointer || !link || !screen) return [];

    ig.classList.remove("hide");
    ps.classList.remove("show");
    pointer.classList.remove("show", "tapping");
    pointer.style.transform = "translate(-50%, -50%) translate(-200px, 200px)";
    link.classList.remove("highlighted", "tapped");

    const timers: number[] = [];
    timers.push(window.setTimeout(() => {
      const screenRect = screen.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      const x = linkRect.left + linkRect.width / 2 - screenRect.left;
      const y = linkRect.top + linkRect.height / 2 - screenRect.top;
      pointer.classList.add("show");
      pointer.style.transform = `translate(${x}px, ${y}px)`;
      timers.push(window.setTimeout(() => link.classList.add("highlighted"), 850));
      timers.push(window.setTimeout(() => {
        pointer.classList.add("tapping");
        link.classList.add("tapped");
      }, 1300));
      timers.push(window.setTimeout(() => {
        ig.classList.add("hide");
        ps.classList.add("show");
        pointer.classList.remove("show", "tapping");
      }, 1700));
    }, 1100));
    return timers;
  }

  useEffect(() => {
    const timers = runAnimation();
    return () => timers.forEach((t) => clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleCart(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    e.currentTarget.classList.toggle("added");
  }

  return (
    <>
      <SiteHeader />
      <div className="wrap">
        <div className="phone-demo-page" ref={stageRef}>
          <div className="container">
            <a className="back-link" onClick={() => router.push("/")} style={{ cursor: "pointer" }}>
              ← Back
            </a>

            <div className="phone-demo-intro">
              <div className="eyebrow">From their feed · To your shop</div>
              <h1>This is what your audience sees.</h1>
              <p className="lede">
                When someone taps your link in bio, this is the experience. Watch it play out.
              </p>
            </div>

            <div className="phone-stage">
              <div className="phone-frame">
                <div className="phone-notch"></div>
                <div className="phone-screen">
                  {/* Instagram mockup */}
                  <div className="ig-screen" id="ig-screen">
                    <div className="ig-statusbar">
                      <span className="ig-time">9:41</span>
                      <div className="ig-statusbar-right">
                        <span className="ig-signal">••••</span>
                        <span className="ig-wifi">▲</span>
                        <span className="ig-battery"></span>
                      </div>
                    </div>
                    <div className="ig-topbar">
                      <span className="ig-back">&lt;</span>
                      <div className="ig-username">
                        <span>template</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#3897f0" aria-hidden="true">
                          <path d="M12 2L9.3 4.4 6 4l-.9 3.2L2 9l1.8 2.9L2 14.8l3.1 1.8L6 20l3.3-.4L12 22l2.7-2.4 3.3.4.9-3.2L22 14.8l-1.8-2.9L22 9l-3.1-1.8L18 4l-3.3.4zM10.5 15.5L7 12l1.4-1.4L10.5 12.7l5.1-5.1L17 9l-6.5 6.5z" />
                        </svg>
                      </div>
                      <span className="ig-menu">⋮</span>
                    </div>
                    <div className="ig-profile-section">
                      <div className="ig-avatar-ring">
                        <div className="ig-avatar ig-avatar-default"><DefaultAvatar /></div>
                      </div>
                      <div className="ig-stats">
                        <div className="ig-stat"><div className="num">142</div><div className="label">posts</div></div>
                        <div className="ig-stat"><div className="num">45.2K</div><div className="label">followers</div></div>
                        <div className="ig-stat"><div className="num">312</div><div className="label">following</div></div>
                      </div>
                    </div>
                    <div className="ig-bio">
                      <div className="ig-name">Template</div>
                      <div className="ig-bio-text">shop my products</div>
                      <a className="ig-link" id="ig-link-target">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" /></svg>
                        fonce.com/@template
                      </a>
                    </div>
                    <div className="ig-actions">
                      <button className="ig-btn ig-btn-primary">Follow</button>
                      <button className="ig-btn">Message</button>
                      <button className="ig-btn">▾</button>
                    </div>
                    <div className="ig-tabs">
                      <div className="ig-tab active">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h7v7H3zm0 11h7v7H3zM14 3h7v7h-7zm0 11h7v7h-7z" /></svg>
                      </div>
                      <div className="ig-tab">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 6l-9 6-9-6V18h18z" /></svg>
                      </div>
                      <div className="ig-tab">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></svg>
                      </div>
                    </div>
                    <div className="ig-grid">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="ig-post"></div>
                      ))}
                    </div>
                  </div>

                  {/* Showcase mockup */}
                  <div className="ps-screen" id="ps-screen">
                    <div className="ps-statusbar">
                      <span className="ps-time">9:41</span>
                      <div className="ps-statusbar-right"><span>••••</span><span>▲</span></div>
                    </div>
                    <div className="ps-urlbar">
                      <span className="ps-padlock">🔒</span>
                      <span className="ps-url">fonce.com/@template</span>
                    </div>
                    <div className="ps-content">
                      <div className="ps-header">
                        <div className="ps-avatar ps-avatar-default"><DefaultAvatar /></div>
                        <div className="ps-username">@template</div>
                        <div className="ps-tagline">shop my products</div>
                      </div>
                      <div className="ps-products">
                        {DEMO_PRODUCTS.map((p) => (
                          <div key={p.id} className="ps-product">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <div className="ps-product-img"><img src={p.image} alt={p.title} loading="lazy" /></div>
                            <div className="ps-product-info">
                              <div className="ps-product-title">{p.title}</div>
                              <div className="ps-product-bottom">
                                <div className="ps-product-price">${p.price.toFixed(2)}</div>
                                <button className="ps-cart-btn" onClick={toggleCart} aria-label={`Add ${p.title} to bag`} title="Add to bag">
                                  <CartSvg />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tap pointer overlay */}
                  <div className="tap-pointer" id="tap-pointer">
                    <div className="tap-ring"></div>
                  </div>
                </div>
                <div className="phone-home-indicator"></div>
              </div>
            </div>

            <div className="phone-demo-cta">
              <button className="btn btn-sm" onClick={runAnimation}>Replay</button>
              <Link href="/signup" className="btn btn-primary btn-shimmer">Create your showcase</Link>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
