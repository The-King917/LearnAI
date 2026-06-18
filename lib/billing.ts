import { prisma } from "./prisma";
import type { Organization, User } from "@prisma/client";

export const FREE_MESSAGE_LIMIT = 30;
export const TEAM_MIN_SEATS = 10;
export const TEAM_SEAT_PRICE = 50;
export const PRO_PRICE = 20;

export type EffectivePlan = "FREE" | "PRO" | "TEAM";

export function getEffectivePlan(user: User & { organization: Organization | null }): EffectivePlan {
  if (user.organization?.subscriptionStatus === "active") return "TEAM";
  if (user.plan === "PRO" && user.subscriptionStatus === "active") return "PRO";
  return "FREE";
}

function isSameMonth(a: Date, b: Date) {
  return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth();
}

/** Returns false if the user has hit their free-tier monthly cap; otherwise increments usage and returns true. */
export async function checkAndConsumeFreeMessage(userId: string): Promise<boolean> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { monthlyMessageCount: true, usagePeriodStart: true },
  });

  const now = new Date();
  let count = user.monthlyMessageCount;

  if (!isSameMonth(user.usagePeriodStart, now)) {
    count = 0;
    await prisma.user.update({
      where: { id: userId },
      data: { monthlyMessageCount: 0, usagePeriodStart: now },
    });
  }

  if (count >= FREE_MESSAGE_LIMIT) return false;

  await prisma.user.update({
    where: { id: userId },
    data: { monthlyMessageCount: { increment: 1 } },
  });
  return true;
}
