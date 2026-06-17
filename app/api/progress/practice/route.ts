import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyPracticeResult, ResultTag } from "@/lib/mastery";

const VALID_RESULTS: ResultTag[] = ["correct", "partial", "incorrect"];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  const { subjectId, result } = await req.json();
  if (typeof subjectId !== "string" || !subjectId || !VALID_RESULTS.includes(result)) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const existing = await prisma.subjectMastery.findUnique({
    where: { userId_subjectId: { userId: session.user.id, subjectId } },
  });

  const mastery = applyPracticeResult(existing?.mastery ?? 0, result as ResultTag);
  const updated = await prisma.subjectMastery.upsert({
    where: { userId_subjectId: { userId: session.user.id, subjectId } },
    create: {
      userId: session.user.id,
      subjectId,
      mastery,
      attempts: 1,
      correct: result === "correct" ? 1 : 0,
      lastPracticedAt: new Date(),
    },
    update: {
      mastery,
      attempts: { increment: 1 },
      correct: result === "correct" ? { increment: 1 } : undefined,
      lastPracticedAt: new Date(),
    },
  });

  return Response.json({ mastery: updated });
}
