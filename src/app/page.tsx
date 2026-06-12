import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="mx-auto max-w-5xl px-6">
      <header className="flex items-center justify-between py-6">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          FONCÉ
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link href={user.role === "ADMIN" ? "/admin" : "/dashboard"} className="btn-outline">
                {user.role === "ADMIN" ? "Admin" : "Dashboard"}
              </Link>
              <Link href="/api/auth/logout" className="text-ink/60 hover:text-ink">
                Log out
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-ink/70 hover:text-ink">
                Log in
              </Link>
              <Link href="/signup" className="btn">
                Start selling
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="py-20 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-ink/50">
          Link-in-bio storefronts
        </p>
        <h1 className="mx-auto max-w-3xl text-balance text-5xl font-semibold leading-tight tracking-tight">
          Showcase what you sell.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-ink/60">
          Paste any product link, set your price, and FONCÉ builds your storefront.
          Customers buy from your bio — orders are placed with the supplier
          automatically.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/signup" className="btn">
            Create your storefront
          </Link>
          <Link href="/demo" className="btn-outline">
            See a live example
          </Link>
        </div>
      </section>

      <section className="grid gap-4 pb-24 sm:grid-cols-3">
        {[
          {
            t: "Import in one paste",
            d: "Drop an AliExpress link. Title, images, price, and every variant fill in automatically.",
          },
          {
            t: "Your markup, locked costs",
            d: "Set your selling price. The original supplier cost is locked — your margin is yours.",
          },
          {
            t: "Hands-off fulfillment",
            d: "When a customer buys, the order is placed with the supplier automatically. No manual steps.",
          },
        ].map((f) => (
          <div key={f.t} className="card">
            <h3 className="font-medium">{f.t}</h3>
            <p className="mt-2 text-sm text-ink/60">{f.d}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-ink/10 py-8 text-center text-sm text-ink/40">
        FONCÉ — dropshipping storefronts for creators.
      </footer>
    </main>
  );
}
