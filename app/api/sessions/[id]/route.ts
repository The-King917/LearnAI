import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  const chatSession = await prisma.chatSession.findUnique({
    where: { id: params.id },
    include: { messages: { orderBy: { createdAt: "asc" }, select: { role: true, content: true } } },
  });

  if (!chatSession || chatSession.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ session: chatSession });
}
