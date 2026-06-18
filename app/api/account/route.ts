import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectivePlan, FREE_MESSAGE_LIMIT } from "@/lib/billing";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    include: { organization: { include: { _count: { select: { members: true } } } } },
  });

  const ownedOrg = await prisma.organization.findFirst({
    where: { ownerId: user.id },
    include: { _count: { select: { members: true } } },
  });

  return Response.json({
    plan: getEffectivePlan(user),
    isFounder: user.isFounder,
    monthlyMessageCount: user.monthlyMessageCount,
    freeMessageLimit: FREE_MESSAGE_LIMIT,
    organization: user.organization
      ? {
          name: user.organization.name,
          seatLimit: user.organization.seatLimit,
          memberCount: user.organization._count.members,
          isOwner: user.organization.ownerId === user.id,
        }
      : null,
    ownedOrganization: ownedOrg
      ? { inviteCode: ownedOrg.inviteCode, seatLimit: ownedOrg.seatLimit, memberCount: ownedOrg._count.members }
      : null,
  });
}
