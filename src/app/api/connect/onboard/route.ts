import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createConnectOnboarding } from "@/lib/payments/stripe";

// Redirects a creator into Stripe Connect onboarding so they can receive
// payouts. In demo mode (no Stripe keys) it just returns to the dashboard.
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
  const result = await createConnectOnboarding({
    existingAccountId: user.stripeAccountId,
    email: user.email,
    refreshUrl: `${appUrl}/api/connect/onboard`,
    returnUrl: `${appUrl}/dashboard`,
  });

  if (!result) {
    // Demo mode — nothing to connect yet.
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (result.accountId !== user.stripeAccountId) {
    await db.user.update({
      where: { id: user.id },
      data: { stripeAccountId: result.accountId },
    });
  }

  return NextResponse.redirect(result.url);
}
