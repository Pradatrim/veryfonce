"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cartCount, CART_EVENT } from "@/lib/cart";

// Floating cart button shown on storefront pages. Updates live as items change.
export default function CartButton() {
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

  return (
    <Link href="/cart" className={`cart-btn ${count > 0 ? "has-items" : ""}`} aria-label="Cart"
      style={{ position: "fixed", top: "1.1rem", right: "1.1rem", zIndex: 50 }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3 H5 L7 16 H19 L21 8 H6" />
        <circle cx="9" cy="20" r="1.4" /><circle cx="17" cy="20" r="1.4" />
      </svg>
      {count > 0 && <span className="cart-badge">{count}</span>}
    </Link>
  );
}
