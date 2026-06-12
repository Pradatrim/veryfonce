"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cartCount, CART_EVENT } from "@/lib/cart";

// Cart icon + live count. "floating" pins it top-right on storefront pages;
// "inline" sits inside the nav.
export default function CartButton({ variant = "floating" }: { variant?: "floating" | "inline" }) {
  const [count, setCount] = useState(0);
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

  const floatStyle: React.CSSProperties =
    variant === "floating"
      ? {
          position: "fixed", top: "1rem", right: "1rem", zIndex: 60,
          background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.4)",
          color: "#d4af37",
        }
      : {};

  return (
    <Link href="/cart" className={`cart-btn ${count > 0 ? "has-items" : ""}`} aria-label="Cart" style={floatStyle}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3 H5 L7 16 H19 L21 8 H6" />
        <circle cx="9" cy="20" r="1.4" /><circle cx="17" cy="20" r="1.4" />
      </svg>
      {count > 0 && <span className="cart-badge">{count}</span>}
    </Link>
  );
}
