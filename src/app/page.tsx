import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Logo, Star } from "@/components/Logo";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="flex items-center gap-2 text-sm sm:gap-4">
          {user ? (
            <>
              <Link
                href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
                className="btn-outline btn-sm"
              >
                {user.role === "ADMIN" ? "Admin" : "Dashboard"}
              </Link>
              <Link href="/api/auth/logout" className="text-ink/55 hover:text-ink">
                Log out
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-ink/70 hover:text-ink">
                Log in
              </Link>
              <Link href="/signup" className="btn btn-sm">
                Start selling
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-16 sm:pt-24">
        <div className="animate-rise">
          <span className="chip">Link-in-bio storefronts</span>
          <h1 className="mt-6 max-w-4xl font-display text-6xl leading-[0.95] tracking-tightest sm:text-7xl md:text-8xl">
            Showcase
            <br />
            <span className="italic text-accent">what you sell.</span>
          </h1>
          <p className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-ink/65">
            Paste any product link, set your price, and FONCÉ builds your
            storefront. Customers buy from your bio — orders ship from the
            supplier automatically.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/signup" className="btn">
              Create your storefront
            </Link>
            <Link href="/demo" className="btn-outline">
              See a live example →
            </Link>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto mt-16 max-w-6xl px-6">
        <div className="grid gap-px overflow-hidden rounded-3xl border border-accent/15 bg-accent/10 sm:grid-cols-3">
          {[
            {
              n: "01",
              t: "Import in one paste",
              d: "Drop a product link. Title, images, price and every variant fill in automatically.",
            },
            {
              n: "02",
              t: "Your markup, locked costs",
              d: "Set your selling price. The original supplier cost is locked — your margin is yours.",
            },
            {
              n: "03",
              t: "Hands-off fulfillment",
              d: "A customer buys, the order is placed with the supplier automatically. No manual steps.",
            },
          ].map((f) => (
            <div key={f.n} className="bg-elevated/70 p-8 backdrop-blur-sm">
              <span className="font-display text-sm text-accent">{f.n}</span>
              <h3 className="mt-3 font-display text-xl tracking-tight">{f.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quote / brand line */}
      <section className="mx-auto max-w-4xl px-6 py-28 text-center">
        <p className="font-display text-3xl italic leading-snug tracking-tight text-ink/80 sm:text-4xl">
          “Every creator deserves a storefront as considered as their feed.”
        </p>
      </section>

      <footer className="border-t border-accent/15">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-10 text-sm text-ink/45 sm:flex-row">
          <div className="flex items-center gap-2 text-ink/70">
            <Star className="h-4 w-4" />
            <span className="font-display text-lg tracking-tight">FONCÉ</span>
          </div>
          <span>Storefronts for creators.</span>
        </div>
      </footer>
    </main>
  );
}
