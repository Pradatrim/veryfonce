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
    <main className="mx-auto max-w-xl px-5 pb-24">
      <div className="flex flex-col items-center pt-12 text-center">
        <div className="h-24 w-24 overflow-hidden rounded-full bg-ink/10">
          {creator.profilePhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={creator.profilePhoto} alt={creator.name ?? ""} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl text-ink/30">
              {(creator.name || creator.username)[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <h1 className="mt-4 text-xl font-semibold">{creator.name || creator.username}</h1>
        <p className="text-sm text-ink/50">@{creator.username}</p>
        {creator.bio && <p className="mt-3 max-w-sm text-pretty text-sm text-ink/70">{creator.bio}</p>}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3">
        {creator.products.length === 0 ? (
          <p className="col-span-2 py-10 text-center text-sm text-ink/40">No products yet.</p>
        ) : (
          creator.products.map((p) => {
            const images = JSON.parse(p.images) as string[];
            return (
              <Link
                key={p.id}
                href={`/${creator.username}/p/${p.id}`}
                className="group overflow-hidden rounded-xl border border-ink/10 bg-white transition hover:border-ink/30"
              >
                <div className="aspect-square bg-ink/5">
                  {images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={images[0]} alt={p.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                  )}
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-sm font-medium">{p.title}</p>
                  <p className="mt-1 text-sm text-ink/60">${p.sellPrice.toFixed(2)}</p>
                </div>
              </Link>
            );
          })
        )}
      </div>

      <footer className="mt-16 text-center text-xs text-ink/30">
        Powered by <Link href="/" className="underline">FONCÉ</Link>
      </footer>
    </main>
  );
}
