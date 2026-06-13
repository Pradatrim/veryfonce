"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";

// Wired to /api/auth/login (accepts username or email).
export default function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.push(data.role === "ADMIN" ? "/admin" : "/dashboard");
    router.refresh();
  }

  return (
    <>
      <SiteHeader />
      <div className="wrap">
        <div className="auth-wrap">
          <div className="auth-card">
            <h2>Welcome back</h2>
            <p className="sub">Sign in to your showcase.</p>
            {error && <div id="err"><div className="error">{error}</div></div>}
            <div className="field">
              <label>Username</label>
              <input
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
            </div>
            <button className="btn btn-primary btn-block" onClick={submit} disabled={loading}>
              {loading ? "Logging in…" : "Log in"}
            </button>
            <div className="alt">
              No account? <Link href="/signup">Create one</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
