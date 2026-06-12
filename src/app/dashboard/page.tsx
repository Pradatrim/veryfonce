import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { isStripeLive, getAccountStatus } from "@/lib/payments/stripe";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "ADMIN") redirect("/admin");

  const products = await db.product.findMany({
    where: { creatorId: user.id },
    include: { variants: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  const orders = await db.order.findMany({
    where: { creatorId: user.id },
    include: { product: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Serialize for the client component.
  const productData = products.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description ?? "",
    images: JSON.parse(p.images) as string[],
    currency: p.currency,
    sourcePrice: p.sourcePrice,
    sellPrice: p.sellPrice,
    active: p.active,
    sourceUrl: p.sourceUrl,
    variants: p.variants.map((v) => ({
      id: v.id,
      name: v.name,
      sourcePrice: v.sourcePrice,
      sellPrice: v.sellPrice,
      stock: v.stock,
      active: v.active,
      image: v.image,
    })),
  }));

  const orderData = orders.map((o) => ({
    id: o.id,
    title: o.product.title,
    amountTotal: o.amountTotal,
    creatorPayout: o.creatorPayout,
    paymentStatus: o.paymentStatus,
    fulfillmentStatus: o.fulfillmentStatus,
    createdAt: o.createdAt.toISOString(),
  }));

  // Real payout readiness (only meaningful when Stripe is live).
  let payoutsReady = false;
  if (isStripeLive() && user.stripeAccountId) {
    const status = await getAccountStatus(user.stripeAccountId);
    payoutsReady = Boolean(status?.chargesEnabled && status?.payoutsEnabled);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 pb-24">
      <header className="flex items-center justify-between py-6">
        <Link href="/" className="text-xl font-semibold">FONCÉ</Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href={`/${user.username}`} className="btn-outline" target="_blank">
            View my storefront
          </Link>
          <Link href="/api/auth/logout" className="text-ink/60 hover:text-ink">Log out</Link>
        </nav>
      </header>

      <DashboardClient
        user={{
          name: user.name ?? "",
          username: user.username,
          bio: user.bio ?? "",
          profilePhoto: user.profilePhoto,
          stripeConnected: Boolean(user.stripeAccountId),
          payoutsReady,
        }}
        products={productData}
        orders={orderData}
        stripeLive={isStripeLive()}
      />
    </main>
  );
}
