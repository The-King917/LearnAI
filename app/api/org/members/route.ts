import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Sign in first" }, { status: 401 });
  }

  const org = await prisma.organization.findFirst({
    where: { ownerId: session.user.id },
    include: { members: { select: { id: true, email: true, name: true } } },
  });
  if (!org) {
    return Response.json({ error: "Not an organization owner" }, { status: 403 });
  }

  return Response.json({ organization: { id: org.id, name: org.name, seatLimit: org.seatLimit, inviteCode: org.inviteCode, members: org.members } });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Sign in first" }, { status: 401 });
  }

  const { userId } = await req.json();
  if (typeof userId !== "string" || !userId) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const org = await prisma.organization.findFirst({ where: { ownerId: session.user.id } });
  if (!org) {
    return Response.json({ error: "Not an organization owner" }, { status: 403 });
  }

  await prisma.user.updateMany({
    where: { id: userId, organizationId: org.id },
    data: { organizationId: null },
  });

  return Response.json({ ok: true });
}
