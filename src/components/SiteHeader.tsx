"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CartButton from "@/components/CartButton";

type Me = { role: string; username: string } | null;

// Auth-aware nav (client). Logged-in creators always see Dashboard + Log out so
// they can never get "stuck" on a public page.
export default function SiteHeader() {
  const [me, setMe] = useState<Me>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setMe(d.user))
      .catch(() => setMe(null))
      .finally(() => setLoaded(true));
  }, []);

  return (
    <header>
      <div className="container">
        <nav>
          <div className="nav-left" id="nav-left">
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
            <CartButton variant="inline" />
            {!loaded ? null : me && me.role === "CREATOR" ? (
              <>
                <Link href="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
                <Link href="/api/auth/logout" className="btn btn-sm">Log out</Link>
              </>
            ) : me && me.role === "ADMIN" ? (
              <>
                <Link href="/admin" className="btn btn-ghost btn-sm">Admin</Link>
                <Link href="/api/auth/logout" className="btn btn-sm">Log out</Link>
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
  );
}
