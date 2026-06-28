import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string; problemId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const test = await prisma.mockTest.findUnique({ where: { id: params.id } });

  if (!test || test.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  if (test.status !== "completed") {
    return Response.json({ error: "Test not completed yet" }, { status: 403 });
  }

  const [testProblem, attempt] = await Promise.all([
    prisma.mockTestProblem.findFirst({
      where: { testId: params.id, problemId: params.problemId },
      include: {
        problem: {
          select: {
            id: true,
            statement: true,
            answer: true,
            solution: true,
            format: true,
            choices: true,
            topics: true,
            difficulty: true,
          },
        },
      },
    }),
    prisma.problemAttempt.findUnique({
      where: { userId_problemId: { userId: session.user.id, problemId: params.problemId } },
    }),
  ]);

  if (!testProblem) return Response.json({ error: "Problem not in test" }, { status: 404 });

  return Response.json({
    problem: testProblem.problem,
    studentAnswer: attempt?.answer ?? "",
    correct: attempt?.correct ?? false,
    competition: test.competition,
  });
}
