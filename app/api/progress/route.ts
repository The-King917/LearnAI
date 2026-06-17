import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ masteries: [] });
  }

  const masteries = await prisma.subjectMastery.findMany({
    where: { userId: session.user.id },
  });

  return Response.json({ masteries });
}
