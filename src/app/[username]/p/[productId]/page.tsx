import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import ProductBuy from "./ProductBuy";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: { username: string; productId: string };
}) {
  const product = await db.product.findUnique({
    where: { id: params.productId },
    include: { variants: { where: { active: true }, orderBy: { createdAt: "asc" } }, creator: true },
  });

  if (
    !product ||
    !product.active ||
    product.creator.username !== params.username.toLowerCase()
  ) {
    notFound();
  }

  const images = JSON.parse(product.images) as string[];

  return (
    <main className="mx-auto max-w-5xl px-5 pb-24">
      <header className="py-6">
        <Link
          href={`/${product.creator.username}`}
          className="inline-flex items-center gap-2 text-sm text-ink/55 transition hover:text-ink"
        >
          <span aria-hidden>←</span>
          {product.creator.name || `@${product.creator.username}`}
        </Link>
      </header>

      <div className="grid gap-10 md:grid-cols-2 md:gap-14">
        {/* Gallery */}
        <div className="space-y-3 animate-rise">
          <div className="aspect-square overflow-hidden rounded-3xl border border-ink/8 bg-ink/5 shadow-sm">
            {images[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={images[0]} alt={product.title} className="h-full w-full object-cover" />
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.slice(1, 5).map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="aspect-square rounded-xl border border-ink/8 object-cover"
                />
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="md:pt-2">
          <p className="text-xs uppercase tracking-wider text-ink/40">
            {product.creator.name || `@${product.creator.username}`}
          </p>
          <h1 className="mt-2 font-display text-4xl leading-tight tracking-tight">
            {product.title}
          </h1>
          {product.description && (
            <p className="mt-4 text-[15px] leading-relaxed text-ink/65">{product.description}</p>
          )}
          <ProductBuy
            product={{
              id: product.id,
              sellPrice: product.sellPrice,
              currency: product.currency,
              variants: product.variants.map((v) => ({
                id: v.id,
                name: v.name,
                sellPrice: v.sellPrice,
                stock: v.stock,
                image: v.image,
              })),
            }}
          />
        </div>
      </div>
    </main>
  );
}
