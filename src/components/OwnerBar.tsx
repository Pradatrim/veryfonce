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
        gap: "0.75rem", padding: "0.55rem 1rem", paddingRight: "4rem",
        background: "#0a0a0a", color: "#f5efe4",
        borderBottom: "1px solid rgba(212,175,55,0.3)", fontSize: "0.82rem",
      }}
    >
      <Link href="/dashboard" className="btn btn-sm" style={{ whiteSpace: "nowrap" }}>
        ← Back to dashboard
      </Link>
      <span style={{ opacity: 0.7 }}>You&apos;re viewing your live showcase</span>
    </div>
  );
}
