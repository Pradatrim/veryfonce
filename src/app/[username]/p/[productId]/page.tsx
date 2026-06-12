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
    <main className="mx-auto max-w-3xl px-5 pb-24">
      <header className="py-5">
        <Link href={`/${product.creator.username}`} className="text-sm text-ink/60 hover:text-ink">
          ← {product.creator.name || `@${product.creator.username}`}
        </Link>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-2">
          <div className="aspect-square overflow-hidden rounded-2xl bg-ink/5">
            {images[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={images[0]} alt={product.title} className="h-full w-full object-cover" />
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(1, 5).map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt="" className="aspect-square rounded-lg object-cover" />
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-semibold">{product.title}</h1>
          {product.description && (
            <p className="mt-3 text-sm leading-relaxed text-ink/70">{product.description}</p>
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
