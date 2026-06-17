import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyDiagnoseResult } from "@/lib/mastery";
import { Difficulty } from "@/lib/prompts";

const VALID_LEVELS: Difficulty[] = ["beginner", "intermediate", "advanced", "olympiad"];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  const { subjectId, level } = await req.json();
  if (typeof subjectId !== "string" || !subjectId || !VALID_LEVELS.includes(level)) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const existing = await prisma.subjectMastery.findUnique({
    where: { userId_subjectId: { userId: session.user.id, subjectId } },
  });

  const mastery = applyDiagnoseResult(existing?.mastery ?? 0, !!existing, level as Difficulty);
  const updated = await prisma.subjectMastery.upsert({
    where: { userId_subjectId: { userId: session.user.id, subjectId } },
    create: {
      userId: session.user.id,
      subjectId,
      mastery,
      diagnosedLevel: level,
      lastDiagnosedAt: new Date(),
    },
    update: {
      mastery,
      diagnosedLevel: level,
      lastDiagnosedAt: new Date(),
    },
  });

  return Response.json({ mastery: updated });
}
