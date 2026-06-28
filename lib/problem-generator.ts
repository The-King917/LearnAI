import { callClaude } from "@/lib/agent-runner";
import { getConfig, type CompetitionId } from "@/lib/problem-gen-prompts";
import { prisma } from "@/lib/prisma";

export interface GeneratedProblem {
  statement: string;
  answer: string;
  solution: string;
  topics: string[];
  difficulty: string;
  choices?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  score: number;
  issues: string[];
  independent_answer?: string;
  physics_concerns?: string[];
  biology_concerns?: string[];
  chemistry_concerns?: string[];
  solution_looks_correct?: boolean;
}

/** Generate one original problem for a competition + difficulty. */
export async function generateProblem(
  competition: CompetitionId,
  targetDifficulty?: string
): Promise<GeneratedProblem | null> {
  const config = getConfig(competition);
  if (!config) return null;

  const difficultyHint = targetDifficulty
    ? `\nGenerate a problem at "${targetDifficulty}" difficulty level.`
    : "";

  const raw = await callClaude(
    config.systemPrompt,
    `Generate one original ${config.label} problem.${difficultyHint}\n\nOutput ONLY valid JSON — no markdown, no code fences, just the raw JSON object.`,
    1600
  );

  return parseGeneratedProblem(raw);
}

/** Independently validate a generated problem. Returns validation result. */
export async function validateProblem(
  competition: CompetitionId,
  problem: GeneratedProblem
): Promise<ValidationResult> {
  const config = getConfig(competition);
  if (!config) return { valid: false, score: 0, issues: ["Unknown competition"] };

  const raw = await callClaude(
    config.validationPrompt,
    `Problem to validate:\n${JSON.stringify(problem, null, 2)}\n\nOutput ONLY valid JSON — no markdown, no code fences.`,
    512
  );

  try {
    const result = JSON.parse(raw.trim()) as ValidationResult;
    return result;
  } catch {
    return { valid: false, score: 0, issues: ["Validation response could not be parsed"] };
  }
}

/** Anti-repetition: check if problem statement is too similar to recent problems. */
async function isTooSimilar(
  competition: string,
  statement: string
): Promise<boolean> {
  // Grab last 20 approved problems for this competition
  const recent = await prisma.problem.findMany({
    where: { competition, status: "approved" },
    orderBy: { generatedAt: "desc" },
    take: 20,
    select: { statement: true },
  });

  if (recent.length === 0) return false;

  // Simple heuristic: check keyword overlap (top 10 meaningful words)
  const words = (s: string) =>
    new Set(
      s.toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 4 && !STOP_WORDS.has(w))
        .slice(0, 30)
    );

  const newWords = words(statement);
  for (const p of recent) {
    const existingWords = words(p.statement);
    const intersection = Array.from(newWords).filter((w) => existingWords.has(w));
    if (intersection.length > 8) return true; // too similar
  }
  return false;
}

/**
 * Full pipeline: generate → validate → store.
 * Returns the stored problem ID or null on failure.
 */
export async function generateAndStore(
  competition: CompetitionId,
  targetDifficulty?: string,
  maxAttempts = 3
): Promise<string | null> {
  const config = getConfig(competition);
  if (!config) return null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let problem: GeneratedProblem | null = null;

    try {
      problem = await generateProblem(competition, targetDifficulty);
    } catch (e) {
      console.error(`[problem-gen] Generation error attempt ${attempt + 1}:`, e);
      continue;
    }

    if (!problem) continue;

    // Anti-repetition check
    const similar = await isTooSimilar(competition, problem.statement).catch(() => false);
    if (similar) {
      console.warn(`[problem-gen] Problem too similar to existing — regenerating`);
      continue;
    }

    // Validate
    let validation: ValidationResult = { valid: false, score: 0, issues: ["Not validated"] };
    try {
      validation = await validateProblem(competition, problem);
    } catch (e) {
      console.error(`[problem-gen] Validation error:`, e);
    }

    // Answer consistency check for MCQ/integer formats
    if (validation.independent_answer && config.problemFormat === "mcq") {
      const statedAnswer = problem.answer.toUpperCase().trim();
      const independentAnswer = validation.independent_answer.toUpperCase().trim();
      if (statedAnswer !== independentAnswer) {
        console.warn(`[problem-gen] Answer mismatch: stated=${statedAnswer} independent=${independentAnswer}`);
        validation.valid = false;
        validation.issues = [...(validation.issues ?? []), `Answer mismatch: stated ${statedAnswer}, independent ${independentAnswer}`];
        validation.score = Math.min(validation.score, 0.4);
      }
    }

    const status = validation.valid && validation.score >= 0.7
      ? "approved"
      : validation.score >= 0.4
      ? "pending"
      : "flagged";

    // Store in DB
    try {
      const stored = await prisma.problem.create({
        data: {
          competition,
          difficulty: problem.difficulty || targetDifficulty || "medium",
          topics: (problem.topics ?? []) as object,
          statement: problem.statement,
          answer: problem.answer,
          solution: problem.solution,
          format: config.problemFormat,
          choices: problem.choices ? (problem.choices as object) : undefined,
          metadata: problem.metadata ? (problem.metadata as object) : undefined,
          status,
          validationScore: validation.score,
          validationNotes: validation.issues?.join("; ") ?? null,
        },
      });
      return stored.id;
    } catch (e) {
      console.error(`[problem-gen] DB store error:`, e);
      return null;
    }
  }

  return null;
}

/** Check buffer size for a competition and return how many more are needed. */
export async function getBufferStatus(competition: string): Promise<{
  approved: number;
  pending: number;
  flagged: number;
  target: number;
  deficit: number;
}> {
  const TARGET_BUFFER = 50; // per competition

  const [approved, pending, flagged] = await Promise.all([
    prisma.problem.count({ where: { competition, status: "approved" } }),
    prisma.problem.count({ where: { competition, status: "pending" } }),
    prisma.problem.count({ where: { competition, status: "flagged" } }),
  ]);

  return {
    approved,
    pending,
    flagged,
    target: TARGET_BUFFER,
    deficit: Math.max(0, TARGET_BUFFER - approved),
  };
}

function parseGeneratedProblem(raw: string): GeneratedProblem | null {
  // Strip markdown fences if present
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
  try {
    const parsed = JSON.parse(cleaned) as GeneratedProblem;
    if (!parsed.statement || !parsed.answer || !parsed.solution) return null;
    return parsed;
  } catch {
    // Try to extract JSON from within the string
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]) as GeneratedProblem;
        if (!parsed.statement || !parsed.answer || !parsed.solution) return null;
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  }
}

const STOP_WORDS = new Set([
  "which", "where", "there", "their", "about", "would", "could", "should",
  "given", "find", "what", "that", "this", "with", "from", "have", "will",
  "number", "value", "equal", "least", "greatest", "total", "compute",
]);
