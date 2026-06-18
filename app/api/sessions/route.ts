import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ sessions: [] });
  }

  const sessions = await prisma.chatSession.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 20,
    select: { id: true, subjectId: true, mode: true, updatedAt: true },
  });

  return Response.json({ sessions });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  const { subjectId, mode } = await req.json();
  if (typeof subjectId !== "string" || !subjectId || typeof mode !== "string" || !mode) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const created = await prisma.chatSession.create({
    data: { userId: session.user.id, subjectId, mode },
    select: { id: true, subjectId: true, mode: true, updatedAt: true },
  });

  return Response.json({ session: created });
}
