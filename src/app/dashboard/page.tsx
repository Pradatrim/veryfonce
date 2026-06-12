import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { detectSourceTier } from "@/lib/sourceTier";
import SiteHeader from "@/components/SiteHeader";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "ADMIN") redirect("/admin");

  const [products, orders, rewards] = await Promise.all([
    db.product.findMany({
      where: { creatorId: user.id },
      include: { variants: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" },
    }),
    db.order.findMany({
      where: { creatorId: user.id, paymentStatus: "paid" },
      select: { creatorPayout: true },
    }),
    db.reward.findMany({
      where: { userId: user.id, used: false, expiresAt: { gt: new Date() } },
      orderBy: { expiresAt: "asc" },
    }),
  ]);

  const totalSales = orders.length;
  const totalEarnings = orders.reduce((s, o) => s + o.creatorPayout, 0) / 100;
  const totalProductViews = products.reduce((s, p) => s + p.views, 0);
  const rewardsBalance = rewards.reduce((s, r) => s + r.amount, 0);
  const nextReward = rewards[0]
    ? { amount: rewards[0].amount, expiresAt: rewards[0].expiresAt.toISOString() }
    : null;

  const productData = products.map((p) => {
    const tier = detectSourceTier(p.sourceUrl);
    return {
      id: p.id,
      title: p.title,
      image: (JSON.parse(p.images) as string[])[0] ?? "",
      sourcePrice: p.sourcePrice,
      sellPrice: p.sellPrice,
      priceDetected: p.priceDetected,
      active: p.active,
      paused: p.paused,
      archived: p.archived,
      detectedNewPrice: p.detectedNewPrice,
      views: p.views,
      sourceUrl: p.sourceUrl,
      tier: { key: tier.key, label: tier.label, shortBadge: tier.shortBadge, description: tier.description },
    };
  });

  return (
    <>
    <SiteHeader />
    <DashboardClient
      user={{
        username: user.username,
        profilePhoto: user.profilePhoto,
        tagline: user.tagline ?? "",
        template: user.template,
        priceDisplay: user.priceDisplay,
        themePreset: user.themePreset,
        themeFont: user.themeFont,
        themeCustom: user.themeCustom,
        isVip: user.isVip,
        showcaseVisits: user.showcaseVisits,
        buyClicks: user.buyClicks,
      }}
      products={productData}
      stats={{ totalSales, totalEarnings, totalProductViews, rewardsBalance, nextReward }}
    />
    </>
  );
}
