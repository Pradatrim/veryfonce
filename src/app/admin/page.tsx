import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // Only the owner/VIP can see income + analytics.
  if (user.role !== "ADMIN") redirect("/dashboard");

  const paidOrders = await db.order.findMany({
    where: { paymentStatus: "paid" },
    include: { creator: true, product: true },
    orderBy: { createdAt: "desc" },
  });

  // ── Aggregate the money the owner tracks ──
  const grossRevenue = paidOrders.reduce((s, o) => s + o.amountTotal, 0);
  const platformIncome = paidOrders.reduce((s, o) => s + o.platformFee, 0); // owner's cut
  const supplierCosts = paidOrders.reduce((s, o) => s + o.supplierCost, 0);
  const creatorPayouts = paidOrders.reduce((s, o) => s + o.creatorPayout, 0);

  const totalCreators = await db.user.count({ where: { role: "CREATOR" } });
  const totalProducts = await db.product.count();
  const ordersFulfilled = paidOrders.filter(
    (o) => o.fulfillmentStatus === "ordered" || o.fulfillmentStatus === "shipped",
  ).length;
  const fulfillmentFailures = paidOrders.filter((o) => o.fulfillmentStatus === "failed").length;

  // Per-creator leaderboard.
  const byCreator = new Map<string, { name: string; revenue: number; ownerCut: number; orders: number }>();
  for (const o of paidOrders) {
    const key = o.creatorId;
    const entry = byCreator.get(key) ?? {
      name: o.creator.name || o.creator.username,
      revenue: 0,
      ownerCut: 0,
      orders: 0,
    };
    entry.revenue += o.amountTotal;
    entry.ownerCut += o.platformFee;
    entry.orders += 1;
    byCreator.set(key, entry);
  }
  const leaderboard = [...byCreator.values()].sort((a, b) => b.revenue - a.revenue);

  return (
    <main className="mx-auto max-w-5xl px-6 pb-24">
      <header className="flex items-center justify-between py-6">
        <div>
          <Link href="/" className="font-display text-2xl tracking-tightest">FONCÉ</Link>
          <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-[#1a1410]">OWNER</span>
        </div>
        <Link href="/api/auth/logout" className="text-sm text-ink/60 hover:text-ink">Log out</Link>
      </header>

      <h1 className="font-display text-4xl tracking-tight">Income &amp; analytics</h1>
      <p className="mt-1 text-sm text-ink/60">Everything the platform earns, across all creators.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Your income (fees)" value={formatMoney(platformIncome)} highlight />
        <Stat label="Gross revenue" value={formatMoney(grossRevenue)} />
        <Stat label="Reserved for suppliers" value={formatMoney(supplierCosts)} />
        <Stat label="Creator payouts" value={formatMoney(creatorPayouts)} />
        <Stat label="Creators" value={String(totalCreators)} />
        <Stat label="Products listed" value={String(totalProducts)} />
        <Stat label="Auto-fulfilled" value={String(ordersFulfilled)} />
        <Stat label="Fulfillment failures" value={String(fulfillmentFailures)} alert={fulfillmentFailures > 0} />
      </div>

      <section className="mt-10">
        <h2 className="mb-3 font-medium">Top creators</h2>
        <div className="card overflow-x-auto">
          {leaderboard.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink/40">No sales yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-ink/50">
                <tr>
                  <th className="pb-2">Creator</th>
                  <th className="pb-2">Orders</th>
                  <th className="pb-2">Revenue</th>
                  <th className="pb-2">Your cut</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((c, i) => (
                  <tr key={i} className="border-t border-ink/10">
                    <td className="py-2 font-medium">{c.name}</td>
                    <td className="py-2">{c.orders}</td>
                    <td className="py-2">{formatMoney(c.revenue)}</td>
                    <td className="py-2 font-medium text-emerald-400">{formatMoney(c.ownerCut)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 font-medium">All orders</h2>
        <div className="card overflow-x-auto">
          {paidOrders.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink/40">No orders yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-ink/50">
                <tr>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Creator</th>
                  <th className="pb-2">Product</th>
                  <th className="pb-2">Total</th>
                  <th className="pb-2">Your fee</th>
                  <th className="pb-2">Supplier</th>
                  <th className="pb-2">Fulfillment</th>
                </tr>
              </thead>
              <tbody>
                {paidOrders.slice(0, 100).map((o) => (
                  <tr key={o.id} className="border-t border-ink/10">
                    <td className="py-2 text-ink/50">{o.createdAt.toLocaleDateString()}</td>
                    <td className="py-2">{o.creator.name || o.creator.username}</td>
                    <td className="py-2">{o.product.title}</td>
                    <td className="py-2">{formatMoney(o.amountTotal)}</td>
                    <td className="py-2 font-medium text-emerald-400">{formatMoney(o.platformFee)}</td>
                    <td className="py-2 text-ink/50">{formatMoney(o.supplierCost)}</td>
                    <td className="py-2 capitalize">{o.fulfillmentStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}

function Stat({
  label, value, highlight, alert,
}: { label: string; value: string; highlight?: boolean; alert?: boolean }) {
  return (
    <div className={`card ${highlight ? "!border-accent/40 bg-accent/10" : ""} ${alert ? "!border-red-500/40" : ""}`}>
      <p className={`text-xs uppercase tracking-wide ${highlight ? "text-accent/80" : "text-ink/50"}`}>{label}</p>
      <p className={`mt-1 font-display text-3xl tracking-tight ${highlight ? "text-gradient-gold" : alert ? "text-red-400" : ""}`}>{value}</p>
    </div>
  );
}
