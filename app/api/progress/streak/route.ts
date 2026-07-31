import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeStreak, deriveMilestones } from "@/lib/streak";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const [attempts, chatSessions, tests, masteries] = await Promise.all([
    prisma.problemAttempt.findMany({ where: { userId }, select: { createdAt: true } }),
    prisma.chatSession.findMany({ where: { userId }, select: { createdAt: true } }),
    prisma.mockTest.findMany({ where: { userId, status: "completed" }, select: { completedAt: true } }),
    prisma.subjectMastery.findMany({ where: { userId }, select: { subjectId: true, mastery: true } }),
  ]);

  const activityDates = [
    ...attempts.map((a) => a.createdAt),
    ...chatSessions.map((s) => s.createdAt),
    ...tests.map((t) => t.completedAt).filter((d): d is Date => d !== null),
  ];

  const streak = computeStreak(activityDates);
  const bestMastery = masteries.length ? masteries.reduce((best, m) => (m.mastery > best.mastery ? m : best)) : null;

  const milestones = deriveMilestones({
    problemAttempts: attempts.length,
    chatSessions: chatSessions.length,
    mockTestsCompleted: tests.length,
    bestMastery: bestMastery ? { subjectId: bestMastery.subjectId, mastery: bestMastery.mastery } : null,
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
  });

  return Response.json({ ...streak, milestones });
}
