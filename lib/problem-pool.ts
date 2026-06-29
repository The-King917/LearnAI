import { prisma } from "@/lib/prisma";
import { getConfig } from "@/lib/problem-gen-prompts";
import { HISTORICAL_CUTOFFS } from "@/lib/problem-gen-prompts";

export interface ProblemForTest {
  id: string;
  statement: string;
  answer: string;
  format: string;
  choices: Record<string, string> | null;
  topics: string[];
  difficulty: string;
  metadata: Record<string, unknown> | null;
}

/**
 * Select N problems for a mock test. Never serves a problem the student has seen.
 * Matches the competition's real difficulty distribution as closely as possible.
 */
export async function selectProblemsForTest(
  userId: string,
  competition: string,
  count?: number,
  topicFocus?: string
): Promise<ProblemForTest[]> {
  const config = getConfig(competition);
  if (!config) return [];

  const targetCount = count ?? config.totalProblems;

  // Get problems this student has already seen
  const seenIds = await prisma.problemAttempt.findMany({
    where: { userId },
    select: { problemId: true },
  });
  const seenSet = new Set(seenIds.map((a) => a.problemId));

  // Pull available problems (approved, not seen by this student)
  let available = await prisma.problem.findMany({
    where: {
      competition,
      status: "approved",
      ...(seenSet.size > 0 ? { id: { notIn: Array.from(seenSet) } } : {}),
      ...(topicFocus ? { topics: { array_contains: topicFocus } } : {}),
    },
    select: {
      id: true,
      statement: true,
      answer: true,
      format: true,
      choices: true,
      topics: true,
      difficulty: true,
      metadata: true,
    },
    orderBy: { usedCount: "asc" }, // prefer less-used problems
  });

  // Pool exhausted for this user — fall back to all approved problems so they
  // can still practice (prefer least-used to avoid exact repetition).
  if (available.length === 0 && seenSet.size > 0) {
    available = await prisma.problem.findMany({
      where: {
        competition,
        status: "approved",
        ...(topicFocus ? { topics: { array_contains: topicFocus } } : {}),
      },
      select: {
        id: true,
        statement: true,
        answer: true,
        format: true,
        choices: true,
        topics: true,
        difficulty: true,
        metadata: true,
      },
      orderBy: { usedCount: "asc" },
    });
  }

  if (available.length === 0) return [];

  // Build distribution-weighted selection
  const dist = config.distribution;
  const total = dist.easy + dist.medium + dist.hard + dist.very_hard;
  const targetDist = {
    easy: Math.round((dist.easy / total) * targetCount),
    medium: Math.round((dist.medium / total) * targetCount),
    hard: Math.round((dist.hard / total) * targetCount),
    very_hard: targetCount - Math.round((dist.easy / total) * targetCount) - Math.round((dist.medium / total) * targetCount) - Math.round((dist.hard / total) * targetCount),
  };

  const byDifficulty: Record<string, typeof available> = {
    easy: [], medium: [], hard: [], very_hard: [],
  };
  for (const p of available) {
    const d = p.difficulty in byDifficulty ? p.difficulty : "medium";
    byDifficulty[d].push(p);
  }

  const selected: typeof available = [];
  for (const [diff, target] of Object.entries(targetDist)) {
    const pool = byDifficulty[diff] ?? [];
    const shuffled = pool.sort(() => Math.random() - 0.5);
    selected.push(...shuffled.slice(0, Math.max(0, target)));
  }

  // Fill remaining slots with whatever's available
  if (selected.length < targetCount) {
    const selectedIds = new Set(selected.map((p) => p.id));
    const remaining = available
      .filter((p) => !selectedIds.has(p.id))
      .sort(() => Math.random() - 0.5);
    selected.push(...remaining.slice(0, targetCount - selected.length));
  }

  // Shuffle final selection to mix difficulties
  selected.sort(() => Math.random() - 0.5);
  const result = selected.slice(0, targetCount);

  return result.map((p) => ({
    id: p.id,
    statement: p.statement,
    answer: p.answer,
    format: p.format,
    choices: p.choices ? (p.choices as Record<string, string>) : null,
    topics: (p.topics as string[]) ?? [],
    difficulty: p.difficulty,
    metadata: p.metadata ? (p.metadata as Record<string, unknown>) : null,
  }));
}

/** Score a completed test. Returns raw score and estimated percentile. */
export function scoreTest(
  competition: string,
  answers: Array<{ correct: boolean; timeSecs: number; topics: string[] }>
): {
  rawScore: number;
  maxScore: number;
  percentile: number;
  topicBreakdown: Record<string, { correct: number; total: number }>;
  timeBreakdown: { avg: number; slowest: number; fastest: number };
} {
  const config = getConfig(competition);
  const pointsCorrect = config?.pointsCorrect ?? 1;
  const pointsWrong = config?.pointsWrong ?? 0;

  let rawScore = 0;
  const topicBreakdown: Record<string, { correct: number; total: number }> = {};

  for (const a of answers) {
    if (a.correct) rawScore += pointsCorrect;
    else rawScore += pointsWrong;

    for (const topic of a.topics) {
      if (!topicBreakdown[topic]) topicBreakdown[topic] = { correct: 0, total: 0 };
      topicBreakdown[topic].total++;
      if (a.correct) topicBreakdown[topic].correct++;
    }
  }

  rawScore = Math.max(0, rawScore);
  const maxScore = answers.length * pointsCorrect;

  const historicalData = HISTORICAL_CUTOFFS[competition];
  let percentile = 50;
  if (historicalData) {
    const { cutoffs, labels: _labels } = historicalData;
    const percentiles = [99, 95, 85, 70, 50];
    for (let i = 0; i < cutoffs.length; i++) {
      if (rawScore >= cutoffs[i]) {
        percentile = percentiles[i];
        break;
      }
    }
  } else {
    percentile = Math.round((rawScore / maxScore) * 100);
  }

  const times = answers.map((a) => a.timeSecs).filter((t) => t > 0);
  const timeBreakdown = {
    avg: times.length > 0 ? Math.round(times.reduce((s, t) => s + t, 0) / times.length) : 0,
    slowest: times.length > 0 ? Math.max(...times) : 0,
    fastest: times.length > 0 ? Math.min(...times) : 0,
  };

  return { rawScore, maxScore, percentile, topicBreakdown, timeBreakdown };
}
