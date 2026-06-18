import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Sign in first" }, { status: 401 });
  }

  const { code } = await req.json();
  if (typeof code !== "string" || !code) {
    return Response.json({ error: "Invalid invite code" }, { status: 400 });
  }

  const org = await prisma.organization.findUnique({
    where: { inviteCode: code },
    include: { _count: { select: { members: true } } },
  });
  if (!org || org.subscriptionStatus !== "active") {
    return Response.json({ error: "Invite code not found" }, { status: 404 });
  }
  if (org._count.members >= org.seatLimit) {
    return Response.json({ error: "This organization has no seats left" }, { status: 400 });
  }

  await prisma.user.update({ where: { id: session.user.id }, data: { organizationId: org.id } });
  return Response.json({ organization: { id: org.id, name: org.name } });
}
