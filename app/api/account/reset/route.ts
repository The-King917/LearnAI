import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Scope = "sessions" | "mastery" | "tests" | "plan" | "all";

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  let { scope } = (await req.json()) as { scope: Scope };

  if (!["sessions", "mastery", "tests", "plan", "all"].includes(scope)) {
    return Response.json({ error: "Invalid scope" }, { status: 400 });
  }

  if (scope === "all") {
    await Promise.all([
      prisma.chatSession.deleteMany({ where: { userId } }),
      prisma.subjectMastery.deleteMany({ where: { userId } }),
      prisma.studentModel.deleteMany({ where: { userId } }),
      prisma.mockTest.deleteMany({ where: { userId } }),
      prisma.problemAttempt.deleteMany({ where: { userId } }),
      prisma.studyPlan.deleteMany({ where: { userId } }),
      prisma.essayVersion.deleteMany({ where: { userId } }),
    ]);
  } else if (scope === "sessions") {
    await prisma.chatSession.deleteMany({ where: { userId } });
  } else if (scope === "mastery") {
    await Promise.all([
      prisma.subjectMastery.deleteMany({ where: { userId } }),
      prisma.studentModel.deleteMany({ where: { userId } }),
    ]);
  } else if (scope === "tests") {
    // Delete MockTests first — ProblemAttempts have no FK to MockTest so delete independently
    await Promise.all([
      prisma.mockTest.deleteMany({ where: { userId } }),
      prisma.problemAttempt.deleteMany({ where: { userId } }),
    ]);
  } else if (scope === "plan") {
    await prisma.studyPlan.deleteMany({ where: { userId } });
  }

  return Response.json({ ok: true, scope });
}
