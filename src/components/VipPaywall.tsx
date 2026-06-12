"use client";

import { useState } from "react";
import { luhnCheck } from "@/lib/luhn";

// Ported from showUpgradeModal() + showVipPayment(). Two steps: feature/billing
// modal, then a card form with REAL validation (Luhn + expiry) — no bypass.
// On success it POSTs to /api/vip, which re-validates server-side and grants VIP.
const MONTHLY = 5.99;
const ANNUAL = 59;

const FEATURES = [
  ["Earn 5% back as Fonce Rewards", "On every purchase. Apply at checkout or save up. Expires after 90 days.", true],
  ["Custom color schemes", "Any background, text, and accent colors.", false],
  ["Ombre gradient backgrounds", "Two-color sunset, ocean, or whatever fits your brand.", false],
  ["Custom image backgrounds", "Upload your own photo or use a hosted URL.", false],
  ["Premium typography", "11 additional curated font pairings.", false],
  ["Detailed analytics", "See views, clicks, and per-product performance.", false],
  ["Priority Fonce discovery", "Featured placement in browse and explore.", false],
  ["Early access", "New features and tools before everyone else.", false],
] as const;

export default function VipPaywall({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState<"upgrade" | "pay">("upgrade");
  const [period, setPeriod] = useState<"monthly" | "annual">("monthly");

  const [name, setName] = useState("");
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [zip, setZip] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const amount = period === "annual" ? ANNUAL : MONTHLY;
  const monthlyEquivAnnual = (ANNUAL / 12).toFixed(2);
  const monthlySavings = (MONTHLY * 12 - ANNUAL).toFixed(2);

  function fmtCard(v: string) { return v.replace(/\D/g, "").slice(0, 19).replace(/(\d{4})/g, "$1 ").trim(); }
  function fmtExp(v: string) { const d = v.replace(/\D/g, "").slice(0, 4); return d.length >= 3 ? d.slice(0, 2) + " / " + d.slice(2) : d; }

  function validate(): string | null {
    const digits = card.replace(/\D/g, "");
    const expRaw = exp.replace(/\D/g, "");
    if (!name || name.trim().length < 2 || !/\s/.test(name.trim())) return "Enter the full name on your card.";
    if (digits.length < 13 || digits.length > 19) return "Card number looks incomplete.";
    if (!luhnCheck(digits)) return "Card number is invalid. Check the digits.";
    if (expRaw.length !== 4) return "Enter expiry as MM / YY.";
    const m = parseInt(expRaw.slice(0, 2), 10);
    const y = 2000 + parseInt(expRaw.slice(2, 4), 10);
    if (m < 1 || m > 12) return "Expiry month is invalid.";
    if (new Date(y, m, 0) < new Date()) return "Card is expired.";
    if (cvc.trim().length < 3 || cvc.trim().length > 4) return "CVC must be 3 or 4 digits.";
    if (zip.trim().length < 3) return "ZIP / postal code required.";
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setProcessing(true);
    const res = await fetch("/api/vip", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ period, name, card, exp, cvc, zip }),
    });
    const data = await res.json();
    setProcessing(false);
    if (!res.ok) { setError(data.error ?? "Payment failed"); return; }
    onSuccess();
  }

  return (
    <div className="upgrade-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {step === "upgrade" ? (
        <div className="upgrade-modal">
          <button className="upgrade-close" aria-label="Close" onClick={onClose}>×</button>
          <div className="upgrade-crown"><Star /></div>
          <div className="upgrade-eyebrow">Fonce VIP</div>
          <h2>Make your showcase yours.</h2>
          <p className="upgrade-sub">Unlock the full customization suite and stand out from the algorithm.</p>

          <div className="upgrade-features">
            {FEATURES.map(([title, sub, hl], i) => (
              <div key={i} className={`upgrade-feature ${hl ? "highlight" : ""}`}>
                <div className="check">✓</div>
                <div><strong>{title}</strong><span>{sub}</span></div>
              </div>
            ))}
          </div>

          <div className="billing-toggle">
            <button className={`billing-option ${period === "monthly" ? "active" : ""}`} onClick={() => setPeriod("monthly")}>Monthly</button>
            <button className={`billing-option ${period === "annual" ? "active" : ""}`} onClick={() => setPeriod("annual")}>
              Annual <span className="save-badge">Save ${monthlySavings}</span>
            </button>
          </div>

          <div className="upgrade-price">
            <div className="price-line">
              <span className="price-amount">${period === "annual" ? ANNUAL : MONTHLY}</span>
              <span className="price-period">{period === "annual" ? "/year" : "/month"}</span>
            </div>
            <span className="price-note">
              {period === "annual" ? `$${monthlyEquivAnnual}/month effective · charged $${ANNUAL} today` : `Charged $${MONTHLY} today · cancel anytime`}
            </span>
          </div>

          <button className="btn btn-primary btn-block upgrade-btn" onClick={() => setStep("pay")}>Continue to payment</button>
          <button className="upgrade-later" onClick={onClose}>Maybe later</button>
        </div>
      ) : (
        <div className="upgrade-modal vip-payment-modal">
          <button className="upgrade-close" aria-label="Close" onClick={onClose}>×</button>
          <div className="pay-eyebrow">Payment</div>
          <h2 className="pay-title">Fonce VIP — ${amount.toFixed(2)}/{period === "annual" ? "year" : "month"}</h2>
          <div className="pay-sub">Charged today. Billed every {period === "annual" ? "year" : "month"}. Cancel anytime from your dashboard.</div>

          <form className="pay-form" onSubmit={submit} autoComplete="on">
            <div className="pay-field">
              <label>Cardholder name</label>
              <input type="text" placeholder="Full name on card" autoComplete="cc-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="pay-field">
              <label>Card number</label>
              <input type="text" placeholder="1234 1234 1234 1234" inputMode="numeric" autoComplete="cc-number" maxLength={23} value={card} onChange={(e) => setCard(fmtCard(e.target.value))} required />
            </div>
            <div className="pay-field-row">
              <div className="pay-field"><label>Expiry</label>
                <input type="text" placeholder="MM / YY" inputMode="numeric" autoComplete="cc-exp" maxLength={7} value={exp} onChange={(e) => setExp(fmtExp(e.target.value))} required /></div>
              <div className="pay-field"><label>CVC</label>
                <input type="text" placeholder="123" inputMode="numeric" autoComplete="cc-csc" maxLength={4} value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} required /></div>
              <div className="pay-field"><label>ZIP</label>
                <input type="text" placeholder="33139" inputMode="numeric" autoComplete="postal-code" maxLength={10} value={zip} onChange={(e) => setZip(e.target.value.replace(/[^A-Za-z0-9\s-]/g, "").slice(0, 10))} required /></div>
            </div>
            {error && <div className="pay-error">{error}</div>}
            <button type="submit" className="btn btn-primary btn-block pay-submit" disabled={processing}>
              {processing ? "Processing…" : `Pay $${amount.toFixed(2)}`}
            </button>
          </form>

          <div className="pay-legal">
            By completing this purchase you authorize Fonce to charge your card ${amount.toFixed(2)} {period === "annual" ? "annually" : "monthly"} until you cancel.
          </div>
        </div>
      )}
    </div>
  );
}

function Star() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="modalStarGrad" cx="35%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#fce99a" /><stop offset="35%" stopColor="#ecc960" />
          <stop offset="70%" stopColor="#d4af37" /><stop offset="100%" stopColor="#7e6520" />
        </radialGradient>
      </defs>
      <path d="M 12 2.5 L 14.4 8.8 L 21 9.1 L 15.8 13.2 L 17.6 19.7 L 12 16 L 6.4 19.7 L 8.2 13.2 L 3 9.1 L 9.6 8.8 Z"
        fill="#6b5318" stroke="url(#modalStarGrad)" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
