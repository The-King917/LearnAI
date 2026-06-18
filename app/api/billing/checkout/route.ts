import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { TEAM_MIN_SEATS } from "@/lib/billing";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Sign in first" }, { status: 401 });
  }

  const { kind, seats } = await req.json();
  if (kind !== "pro" && kind !== "team") {
    return Response.json({ error: "Invalid plan" }, { status: 400 });
  }

  const seatCount = kind === "team" ? Math.max(TEAM_MIN_SEATS, Number(seats) || TEAM_MIN_SEATS) : 1;

  const priceId = kind === "pro" ? process.env.STRIPE_PRO_PRICE_ID : process.env.STRIPE_TEAM_PRICE_ID;
  if (!priceId) {
    return Response.json({ error: "Billing is not configured: missing STRIPE_PRO_PRICE_ID/STRIPE_TEAM_PRICE_ID env var" }, { status: 500 });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return Response.json({ error: "Billing is not configured: missing STRIPE_SECRET_KEY env var" }, { status: 500 });
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin).replace(/\/$/, "");

  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email });
      customerId = customer.id;
      await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: seatCount }],
      metadata: { kind, userId: user.id, seats: String(seatCount) },
      success_url: `${appUrl}/account?checkout=success`,
      cancel_url: `${appUrl}/pricing`,
    });

    return Response.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("[api/billing/checkout]", err);
    return Response.json({ error: "Checkout failed. Please try again or contact support." }, { status: 500 });
  }
}
