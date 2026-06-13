"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";

// Wired to /api/auth/signup.
export default function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function submit() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <>
      <SiteHeader />
      <div className="wrap">
        <div className="auth-wrap">
          <div className="auth-card">
            <h2>Create your showcase</h2>
            <p className="sub">Free to start. No credit card.</p>
            {error && <div id="err"><div className="error">{error}</div></div>}
            <div className="field">
              <label>Username</label>
              <input
                placeholder="yourname"
                autoComplete="username"
                value={form.username}
                onChange={set("username")}
              />
              <div className="hint">
                This is your link: …/{form.username || "username"}
              </div>
            </div>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={form.email}
                onChange={set("email")}
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={set("password")}
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
            </div>
            <button className="btn btn-primary btn-block" onClick={submit} disabled={loading}>
              {loading ? "Creating…" : "Create account"}
            </button>
            <div className="alt">
              Already have one? <Link href="/login">Log in</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
