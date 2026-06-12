import Link from "next/link";

// Ported from the prototype <footer>.
export default function SiteFooter() {
  return (
    <footer>
      <div className="container">
        <div>FONCÉ · Showcase what you sell.</div>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <Link href="/partnerships">Partnerships</Link>
          <span>© 2026</span>
        </div>
      </div>
    </footer>
  );
}
