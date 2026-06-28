import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const [mockTests, studentModels, studyPlans] = await Promise.all([
    prisma.mockTest.findMany({
      where: { userId, status: "completed" },
      orderBy: { completedAt: "desc" },
      take: 30,
      select: {
        id: true,
        competition: true,
        score: true,
        percentile: true,
        completedAt: true,
        topicBreakdown: true,
        _count: { select: { problems: true } },
      },
    }),
    prisma.studentModel.findMany({
      where: { userId },
      select: {
        subjectId: true,
        concepts: true,
        overallLevel: true,
        confidence: true,
        updatedAt: true,
      },
    }),
    prisma.studyPlan.findMany({
      where: { userId },
      select: {
        subjectId: true,
        currentDay: true,
        status: true,
        competitionDate: true,
        days: true,
        weeklyReports: true,
      },
    }),
  ]);

  // Compute per-competition stats from mock tests
  const byCompetition: Record<string, {
    competition: string;
    testCount: number;
    latestScore: number | null;
    latestPercentile: number | null;
    scoreTrend: number[];
    percentileTrend: number[];
    weakTopics: string[];
  }> = {};

  for (const t of mockTests) {
    if (!byCompetition[t.competition]) {
      byCompetition[t.competition] = {
        competition: t.competition,
        testCount: 0,
        latestScore: null,
        latestPercentile: null,
        scoreTrend: [],
        percentileTrend: [],
        weakTopics: [],
      };
    }
    const c = byCompetition[t.competition];
    c.testCount++;
    if (c.latestScore === null) {
      c.latestScore = t.score;
      c.latestPercentile = t.percentile;
    }
    if (t.score !== null) c.scoreTrend.push(t.score);
    if (t.percentile !== null) c.percentileTrend.push(t.percentile);

    // Aggregate weak topics
    if (t.topicBreakdown) {
      const breakdown = t.topicBreakdown as Record<string, { correct: number; total: number }>;
      for (const [topic, stats] of Object.entries(breakdown)) {
        if (stats.correct / stats.total < 0.5 && !c.weakTopics.includes(topic)) {
          c.weakTopics.push(topic);
        }
      }
    }
  }

  // Reverse trend arrays so oldest is first (for chart)
  for (const c of Object.values(byCompetition)) {
    c.scoreTrend.reverse();
    c.percentileTrend.reverse();
    c.weakTopics = c.weakTopics.slice(0, 5);
  }

  return Response.json({
    mockTests: mockTests.map((t) => ({
      id: t.id,
      competition: t.competition,
      score: t.score,
      percentile: t.percentile,
      completedAt: t.completedAt,
      problemCount: t._count.problems,
    })),
    competitionStats: Object.values(byCompetition),
    studentModels: studentModels.map((m) => ({
      subjectId: m.subjectId,
      overallLevel: m.overallLevel,
      confidence: m.confidence,
      conceptCount: Object.keys((m.concepts as object) ?? {}).length,
      concepts: m.concepts,
      updatedAt: m.updatedAt,
    })),
    studyPlans: studyPlans.map((p) => ({
      subjectId: p.subjectId,
      currentDay: p.currentDay,
      status: p.status,
      competitionDate: p.competitionDate,
      totalDays: Array.isArray(p.days) ? (p.days as unknown[]).length : 0,
      weeklyReports: p.weeklyReports,
    })),
  });
}
