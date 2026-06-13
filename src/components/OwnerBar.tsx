"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Shown only when the logged-in creator views their OWN live showcase, so they
// can always get back to the dashboard. Button is on the LEFT so it never
// overlaps the floating cart (top-right). Uses /api/me for consistent auth.
export default function OwnerBar({ username }: { username: string }) {
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setIsOwner(d.user?.username === username))
      .catch(() => setIsOwner(false));
  }, [username]);

  if (!isOwner) return null;

  return (
    <div
      style={{
        position: "sticky", top: 0, zIndex: 40, display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: "0.75rem",
        padding: "0.55rem 1rem", paddingRight: "4rem",
        background: "#0a0a0a", color: "#f5efe4",
        borderBottom: "1px solid rgba(212,175,55,0.3)", fontSize: "0.82rem",
      }}
    >
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <radialGradient id="ownerStarGrad" cx="35%" cy="28%" r="78%">
              <stop offset="0%" stopColor="#fce99a" />
              <stop offset="35%" stopColor="#ecc960" />
              <stop offset="70%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#7e6520" />
            </radialGradient>
          </defs>
          <path d="M 12 2.5 L 14.4 8.8 L 21 9.1 L 15.8 13.2 L 17.6 19.7 L 12 16 L 6.4 19.7 L 8.2 13.2 L 3 9.1 L 9.6 8.8 Z"
            fill="#6b5318" stroke="url(#ownerStarGrad)" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
        <span className="brand-text" style={{ fontFamily: "var(--font-display, 'Fraunces', serif)", color: "#d4af37", fontSize: "1.15rem", letterSpacing: "-0.02em" }}>
          FONCÉ
        </span>
      </Link>
      <Link href="/dashboard" className="btn btn-sm" style={{ whiteSpace: "nowrap" }}>
        Back to dashboard
      </Link>
    </div>
  );
}
