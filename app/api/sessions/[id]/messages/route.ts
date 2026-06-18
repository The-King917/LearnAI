import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_ROLES = ["user", "assistant"];

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  const chatSession = await prisma.chatSession.findUnique({ where: { id: params.id } });
  if (!chatSession || chatSession.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const { role, content } = await req.json();
  if (!VALID_ROLES.includes(role) || typeof content !== "string" || !content) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const [message] = await prisma.$transaction([
    prisma.message.create({ data: { sessionId: params.id, role, content } }),
    prisma.chatSession.update({ where: { id: params.id }, data: { updatedAt: new Date() } }),
  ]);

  return Response.json({ message });
}
