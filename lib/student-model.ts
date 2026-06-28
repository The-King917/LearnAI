import { prisma } from "@/lib/prisma";

export interface ConceptRecord {
  level: number;       // 0–1 mastery
  attempts: number;
  correct: number;
  lastSeen: string;    // ISO date
}

export interface SessionSummaryRecord {
  date: string;
  summary: string;
  performance: "excellent" | "good" | "struggling" | "needs_review";
  conceptsCovered: string[];
}

export interface StudentModelData {
  id: string;
  userId: string;
  subjectId: string;
  concepts: Record<string, ConceptRecord>;
  summaries: SessionSummaryRecord[];
  overallLevel: string | null;
  confidence: number;
  updatedAt: Date;
}

/** Load (or create) a student model for the given user + subject. */
export async function getOrCreateStudentModel(
  userId: string,
  subjectId: string
): Promise<StudentModelData> {
  const raw = await prisma.studentModel.upsert({
    where: { userId_subjectId: { userId, subjectId } },
    create: { userId, subjectId },
    update: {},
  });
  return deserialize(raw);
}

/** Update concept-level data for one concept. */
export async function updateConcept(
  userId: string,
  subjectId: string,
  concept: string,
  performance: "correct" | "partial" | "incorrect"
): Promise<StudentModelData> {
  const model = await getOrCreateStudentModel(userId, subjectId);
  const prev = model.concepts[concept] ?? { level: 0.3, attempts: 0, correct: 0, lastSeen: "" };

  const delta = performance === "correct" ? 0.12 : performance === "partial" ? 0 : -0.08;
  const newLevel = Math.min(1, Math.max(0, prev.level + delta));

  model.concepts[concept] = {
    level: newLevel,
    attempts: prev.attempts + 1,
    correct: prev.correct + (performance === "correct" ? 1 : 0),
    lastSeen: new Date().toISOString(),
  };

  const confidence = computeConfidence(model.concepts);
  const overallLevel = computeOverallLevel(model.concepts);

  const updated = await prisma.studentModel.update({
    where: { userId_subjectId: { userId, subjectId } },
    data: { concepts: model.concepts as object, confidence, overallLevel },
  });
  return deserialize(updated);
}

/** Append a session summary (called by write_session_summary tool). */
export async function appendSessionSummary(
  userId: string,
  subjectId: string,
  summary: SessionSummaryRecord
): Promise<void> {
  const model = await getOrCreateStudentModel(userId, subjectId);
  const summaries = [...model.summaries.slice(-19), summary]; // keep last 20
  await prisma.studentModel.update({
    where: { userId_subjectId: { userId, subjectId } },
    data: { summaries: summaries as object },
  });
}

/** Render the student model as a compact string for injection into prompts. */
export function formatStudentModel(model: StudentModelData): string {
  const concepts = Object.entries(model.concepts);
  if (concepts.length === 0) return "No prior data. Treat as a new student.";

  const lines = concepts.map(([name, c]) => {
    const pct = Math.round(c.level * 100);
    return `  - ${name}: ${pct}% (${c.attempts} attempts)`;
  });

  const recent = model.summaries.slice(-3).map((s) =>
    `  [${s.date.slice(0, 10)}] ${s.performance}: ${s.summary}`
  );

  return [
    `Overall level: ${model.overallLevel ?? "unknown"} (confidence: ${Math.round(model.confidence * 100)}%)`,
    "Concept mastery:",
    ...lines,
    ...(recent.length ? ["Recent sessions:", ...recent] : []),
  ].join("\n");
}

// ── helpers ──────────────────────────────────────────────────────────────────

function computeConfidence(concepts: Record<string, ConceptRecord>): number {
  const vals = Object.values(concepts);
  if (vals.length === 0) return 0;
  const totalAttempts = vals.reduce((s, c) => s + c.attempts, 0);
  return Math.min(1, totalAttempts / 30);
}

function computeOverallLevel(concepts: Record<string, ConceptRecord>): string {
  const vals = Object.values(concepts);
  if (vals.length === 0) return "unknown";
  const avg = vals.reduce((s, c) => s + c.level, 0) / vals.length;
  if (avg < 0.25) return "beginner";
  if (avg < 0.5) return "intermediate";
  if (avg < 0.75) return "advanced";
  return "olympiad";
}

function deserialize(raw: {
  id: string;
  userId: string;
  subjectId: string;
  concepts: unknown;
  summaries: unknown;
  overallLevel: string | null;
  confidence: number;
  updatedAt: Date;
}): StudentModelData {
  return {
    ...raw,
    concepts: (raw.concepts as Record<string, ConceptRecord>) ?? {},
    summaries: (raw.summaries as SessionSummaryRecord[]) ?? [],
  };
}
