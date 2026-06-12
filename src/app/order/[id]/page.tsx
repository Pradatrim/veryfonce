import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: { id: string } }) {
  const order = await db.order.findUnique({
    where: { id: params.id },
    include: { product: true, variant: true, creator: true },
  });
  if (!order) notFound();

  const paid = order.paymentStatus === "paid";

  return (
    <main className="mx-auto max-w-md px-5 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-2xl text-accent">
        {paid ? "✓" : "…"}
      </div>
      <h1 className="mt-4 font-display text-3xl tracking-tight">
        {paid ? "Order confirmed" : "Order received"}
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        {paid
          ? "Your payment went through and the order was placed with the supplier automatically."
          : "We're finalizing your payment."}
      </p>

      <div className="card mt-8 text-left">
        <div className="flex justify-between text-sm">
          <span className="text-ink/60">Product</span>
          <span className="font-medium">{order.product.title}</span>
        </div>
        {order.variant && (
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-ink/60">Option</span>
            <span>{order.variant.name}</span>
          </div>
        )}
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-ink/60">Quantity</span>
          <span>{order.quantity}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-ink/60">Total paid</span>
          <span className="font-medium">{formatMoney(order.amountTotal, order.currency)}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-ink/60">Fulfillment</span>
          <span className="capitalize">{order.fulfillmentStatus}</span>
        </div>
        {order.supplierOrderId && (
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-ink/60">Supplier order</span>
            <span className="font-mono text-xs">{order.supplierOrderId}</span>
          </div>
        )}
      </div>

      <p className="mt-6 text-sm text-ink/50">
        A confirmation was sent to {order.customerEmail}.
      </p>
      <Link href={`/${order.creator.username}`} className="btn-outline mt-6">
        Back to {order.creator.name || `@${order.creator.username}`}
      </Link>
    </main>
  );
}
