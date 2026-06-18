import { NextRequest } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

async function syncSubscription(subscription: Stripe.Subscription) {
  const status = subscription.status;
  const seatCount = subscription.items.data[0]?.quantity ?? undefined;

  const user = await prisma.user.findUnique({ where: { stripeSubscriptionId: subscription.id } });
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionStatus: status },
    });
    return;
  }

  const org = await prisma.organization.findUnique({ where: { stripeSubscriptionId: subscription.id } });
  if (org) {
    await prisma.organization.update({
      where: { id: org.id },
      data: { subscriptionStatus: status, ...(seatCount ? { seatLimit: seatCount } : {}) },
    });
  }
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !webhookSecret) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("[webhooks/stripe] signature verification failed", err);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const { kind, userId, seats } = checkoutSession.metadata ?? {};
      const subscriptionId = typeof checkoutSession.subscription === "string" ? checkoutSession.subscription : checkoutSession.subscription?.id;
      const customerId = typeof checkoutSession.customer === "string" ? checkoutSession.customer : checkoutSession.customer?.id;

      if (!userId || !subscriptionId || !customerId) break;

      if (kind === "pro") {
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: "PRO",
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: "active",
          },
        });
      } else if (kind === "team") {
        const owner = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
        const org = await prisma.organization.create({
          data: {
            name: `${owner.name ?? owner.email}'s organization`,
            ownerId: owner.id,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: "active",
            seatLimit: Number(seats) || 10,
          },
        });
        await prisma.user.update({ where: { id: owner.id }, data: { organizationId: org.id } });
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await syncSubscription(event.data.object as Stripe.Subscription);
      break;
    }
    default:
      break;
  }

  return Response.json({ received: true });
}
