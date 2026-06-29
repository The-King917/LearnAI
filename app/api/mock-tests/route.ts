import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { selectProblemsForTest } from "@/lib/problem-pool";
import { getConfig } from "@/lib/problem-gen-prompts";
import { checkAndConsumeFreeMessage, getEffectivePlan } from "@/lib/billing";
import { generateAndStore, getBufferStatus } from "@/lib/problem-generator";
import type { CompetitionId } from "@/lib/problem-gen-prompts";

const RATE_LIMIT_REQ = 5;
const RATE_WINDOW_MS = 60_000;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ tests: [] });

  const tests = await prisma.mockTest.findMany({
    where: { userId: session.user.id },
    orderBy: { startedAt: "desc" },
    take: 20,
    select: {
      id: true,
      competition: true,
      status: true,
      startedAt: true,
      completedAt: true,
      score: true,
      percentile: true,
      timed: true,
      _count: { select: { problems: true } },
    },
  });

  return Response.json({ tests });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "Sign in required" }, { status: 401 });

  const userId = session.user.id;

  if (!rateLimit(`mock-test:${userId}`, RATE_LIMIT_REQ, RATE_WINDOW_MS)) {
    return Response.json({ error: "Too many requests." }, { status: 429 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { organization: true } });
  if (!user) return Response.json({ error: "User not found" }, { status: 401 });

  // Free plan: consume a message slot for starting a test
  if (getEffectivePlan(user) === "FREE") {
    const allowed = await checkAndConsumeFreeMessage(userId);
    if (!allowed) {
      return Response.json({
        error: "You've used your 30 free sessions this month. Upgrade to Pro for unlimited mock tests.",
        code: "LIMIT_REACHED",
      }, { status: 403 });
    }
  }

  const { competition, timed = true, count, topicFocus } = await req.json() as {
    competition: string;
    timed?: boolean;
    count?: number;
    topicFocus?: string;
  };

  const config = getConfig(competition);
  if (!config) return Response.json({ error: "Unknown competition" }, { status: 400 });

  try {
    // Select problems from pool
    const problems = await selectProblemsForTest(userId, competition, count, topicFocus);

    if (problems.length === 0) {
      // Kick off background generation so the bank grows even when pool is empty
      for (let i = 0; i < 5; i++) {
        generateAndStore(competition as CompetitionId).catch(() => {});
      }
      return Response.json({
        error: "No problems available for this competition yet. Check back soon — we're building the problem bank.",
        code: "NO_PROBLEMS",
      }, { status: 503 });
    }

    // Create the mock test
    const test = await prisma.mockTest.create({
      data: {
        userId,
        competition,
        timed,
        timeLimitSecs: timed ? config.timeLimitMins * 60 : null,
        problems: {
          create: problems.map((p, i) => ({
            problemId: p.id,
            position: i,
          })),
        },
      },
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
                // Never expose answer or solution during the test
              },
            },
          },
          orderBy: { position: "asc" },
        },
      },
    });

    // Record that these problems have been served to this student
    await prisma.problemAttempt.createMany({
      data: problems.map((p) => ({
        userId,
        problemId: p.id,
        testId: test.id,
      })),
      skipDuplicates: true,
    });

    // Fire-and-forget: refill the pool to replace the problems just served.
    // Each test consumes N problems from the bank; we regenerate the same
    // number in the background so the next student isn't left with nothing.
    getBufferStatus(competition).then(({ deficit }) => {
      const toGenerate = Math.min(Math.max(deficit, problems.length), 10);
      for (let i = 0; i < toGenerate; i++) {
        generateAndStore(competition as CompetitionId).catch(() => {});
      }
    }).catch(() => {});

    return Response.json({ test });
  } catch (err) {
    console.error("[api/mock-tests POST]", err);
    return Response.json({ error: "Failed to start test. Please try again." }, { status: 500 });
  }
}
