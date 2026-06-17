import { Difficulty } from "./prompts";

export type ResultTag = "correct" | "partial" | "incorrect";

const LEVEL_BASELINE: Record<Difficulty, number> = {
  beginner: 15,
  intermediate: 40,
  advanced: 65,
  olympiad: 85,
};

const RESULT_TARGET: Record<ResultTag, number> = {
  correct: 100,
  partial: 50,
  incorrect: 0,
};

const PRACTICE_SMOOTHING = 0.2;

export function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, n));
}

export function applyPracticeResult(currentMastery: number, result: ResultTag): number {
  const target = RESULT_TARGET[result];
  return clamp(currentMastery + PRACTICE_SMOOTHING * (target - currentMastery));
}

export function applyDiagnoseResult(currentMastery: number, hasPriorData: boolean, level: Difficulty): number {
  const baseline = LEVEL_BASELINE[level];
  if (!hasPriorData) return baseline;
  return clamp((currentMastery + baseline) / 2);
}

const RESULT_TAG_RE = /^RESULT:\s*(CORRECT|PARTIAL|INCORRECT)\s*\n+/i;

export function parseResultTag(text: string): { result: ResultTag | null; clean: string } {
  const match = text.match(RESULT_TAG_RE);
  if (!match) return { result: null, clean: text };
  return { result: match[1].toLowerCase() as ResultTag, clean: text.slice(match[0].length) };
}
