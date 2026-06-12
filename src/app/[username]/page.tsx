import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function StorefrontPage({ params }: { params: { username: string } }) {
  const creator = await db.user.findUnique({
    where: { username: params.username.toLowerCase() },
    include: {
      products: {
        where: { active: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!creator || creator.role === "ADMIN") notFound();

  return (
    <main className="mx-auto max-w-2xl px-5 pb-24">
      {/* Profile header */}
      <div className="flex flex-col items-center pt-16 text-center animate-rise">
        <div className="h-28 w-28 overflow-hidden rounded-full ring-2 ring-accent/30 ring-offset-4 ring-offset-transparent">
          {creator.profilePhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={creator.profilePhoto}
              alt={creator.name ?? ""}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-elevated font-display text-4xl text-accent/50">
              {(creator.name || creator.username)[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <h1 className="mt-5 font-display text-3xl tracking-tight">
          {creator.name || creator.username}
        </h1>
        <p className="mt-1 text-sm text-ink/45">@{creator.username}</p>
        {creator.bio && (
          <p className="mt-4 max-w-sm text-pretty text-[15px] leading-relaxed text-ink/70">
            {creator.bio}
          </p>
        )}
      </div>

      {/* Product grid */}
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-2">
        {creator.products.length === 0 ? (
          <p className="col-span-2 py-16 text-center text-sm text-ink/40">
            No products yet.
          </p>
        ) : (
          creator.products.map((p) => {
            const images = JSON.parse(p.images) as string[];
            return (
              <Link
                key={p.id}
                href={`/${creator.username}/p/${p.id}`}
                className="group overflow-hidden rounded-2xl border border-accent/15 bg-elevated/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl hover:shadow-black/40"
              >
                <div className="aspect-square overflow-hidden bg-soft">
                  {images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={images[0]}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-4">
                  <p className="line-clamp-2 text-sm font-medium leading-snug">{p.title}</p>
                  <p className="mt-1.5 font-display text-base text-ink/80">
                    ${p.sellPrice.toFixed(2)}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>

      <footer className="mt-20 text-center text-xs text-ink/30">
        Powered by{" "}
        <Link href="/" className="font-display tracking-tight underline-offset-2 hover:underline">
          FONCÉ
        </Link>
      </footer>
    </main>
  );
}
