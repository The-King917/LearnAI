import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scoreTest } from "@/lib/problem-pool";
import { updateConcept } from "@/lib/student-model";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const test = await prisma.mockTest.findUnique({
    where: { id: params.id },
    include: {
      problems: {
        include: {
          problem: {
            select: {
              id: true,
              statement: true,
              format: true,
              choices: true,
              topics: true,
              difficulty: true,
              // answer and solution only exposed after test is completed
            },
          },
        },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!test || test.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  // If completed, also expose answers + solutions
  if (test.status === "completed") {
    const fullProblems = await prisma.mockTestProblem.findMany({
      where: { testId: test.id },
      include: {
        problem: {
          select: {
            id: true,
            statement: true,
            format: true,
            choices: true,
            topics: true,
            difficulty: true,
            answer: true,
            solution: true,
          },
        },
      },
      orderBy: { position: "asc" },
    });

    // Get student's attempts for this test
    const attempts = await prisma.problemAttempt.findMany({
      where: { testId: test.id, userId: session.user.id },
    });
    const attemptMap: Record<string, typeof attempts[number]> = {};
    for (const a of attempts) attemptMap[a.problemId] = a;

    return Response.json({ test: { ...test, problems: fullProblems, attempts: attemptMap } });
  }

  return Response.json({ test });
}

/** Submit answers for the full test and score it. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const test = await prisma.mockTest.findUnique({
    where: { id: params.id },
    include: {
      problems: {
        include: { problem: true },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!test || test.userId !== userId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  if (test.status === "completed") {
    return Response.json({ error: "Test already submitted" }, { status: 400 });
  }

  const { answers, timeSecs } = await req.json() as {
    answers: Record<string, string>; // problemId → student answer
    timeSecs?: Record<string, number>; // problemId → seconds spent
  };

  // Grade each problem
  const scoringData: Array<{ correct: boolean; timeSecs: number; topics: string[] }> = [];
  const attemptUpdates: Array<{
    problemId: string;
    answer: string;
    correct: boolean;
    timeSecs: number;
    topics: string[];
  }> = [];

  for (const { problem } of test.problems) {
    const studentAnswer = (answers[problem.id] ?? "").trim().toUpperCase();
    const correctAnswer = problem.answer.trim().toUpperCase();

    // For AIME: pad to 3 digits
    const correct = problem.format === "integer"
      ? studentAnswer.padStart(3, "0") === correctAnswer.padStart(3, "0")
      : studentAnswer === correctAnswer;

    const time = timeSecs?.[problem.id] ?? 0;
    const topics = (problem.topics as string[]) ?? [];

    scoringData.push({ correct, timeSecs: time, topics });
    attemptUpdates.push({ problemId: problem.id, answer: answers[problem.id] ?? "", correct, timeSecs: time, topics });
  }

  const { rawScore, maxScore, percentile, topicBreakdown, timeBreakdown } = scoreTest(test.competition, scoringData);

  // Update ProblemAttempt records
  await Promise.all(
    attemptUpdates.map((a) =>
      prisma.problemAttempt.updateMany({
        where: { userId, problemId: a.problemId, testId: params.id },
        data: { answer: a.answer, correct: a.correct, timeSecs: a.timeSecs },
      })
    )
  );

  // Update problem usage counts
  await prisma.problem.updateMany({
    where: { id: { in: test.problems.map((p) => p.problemId) } },
    data: { usedCount: { increment: 1 } },
  });

  // Mark test complete
  const updatedTest = await prisma.mockTest.update({
    where: { id: params.id },
    data: {
      status: "completed",
      completedAt: new Date(),
      score: rawScore,
      percentile,
      topicBreakdown: topicBreakdown as object,
    },
  });

  // Write weak topics to student model
  for (const [topic, stats] of Object.entries(topicBreakdown)) {
    const performance: "correct" | "partial" | "incorrect" =
      stats.correct / stats.total >= 0.7 ? "correct"
      : stats.correct / stats.total >= 0.4 ? "partial"
      : "incorrect";
    await updateConcept(userId, test.competition, topic, performance).catch(() => {});
  }

  return Response.json({
    test: updatedTest,
    score: rawScore,
    maxScore,
    percentile,
    topicBreakdown,
    timeBreakdown,
    wrongProblems: attemptUpdates.filter((a) => !a.correct).map((a) => a.problemId),
  });
}
