const DAY_MS = 86400000;

export function utcDayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  last7Days: boolean[];
}

export function computeStreak(activityDates: Date[]): StreakResult {
  const days = new Set(activityDates.map(utcDayKey));
  const todayMs = Date.parse(utcDayKey(new Date()));

  let cursor = todayMs;
  if (!days.has(utcDayKey(new Date(cursor)))) cursor -= DAY_MS;
  let currentStreak = 0;
  while (days.has(utcDayKey(new Date(cursor)))) {
    currentStreak++;
    cursor -= DAY_MS;
  }

  const sorted = Array.from(days).sort();
  let longestStreak = 0;
  let run = 0;
  let prevMs: number | null = null;
  for (const key of sorted) {
    const ms = Date.parse(key);
    run = prevMs !== null && ms - prevMs === DAY_MS ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
    prevMs = ms;
  }

  const last7Days = Array.from({ length: 7 }, (_, i) =>
    days.has(utcDayKey(new Date(todayMs - (6 - i) * DAY_MS)))
  );

  return { currentStreak, longestStreak, totalActiveDays: days.size, last7Days };
}

export interface Milestone {
  id: string;
  label: string;
  detail: string;
}

function highestTier(n: number, tiers: number[]): number | null {
  let best: number | null = null;
  for (const t of tiers) if (n >= t) best = t;
  return best;
}

export function deriveMilestones(input: {
  problemAttempts: number;
  chatSessions: number;
  mockTestsCompleted: number;
  bestMastery: { subjectId: string; mastery: number } | null;
  currentStreak: number;
  longestStreak: number;
}): Milestone[] {
  const milestones: Milestone[] = [];

  const problemTier = highestTier(input.problemAttempts, [10, 50, 100, 250, 500]);
  if (problemTier) {
    milestones.push({ id: "problems", label: `${problemTier}+ problems solved`, detail: `${input.problemAttempts} total` });
  }

  const sessionTier = highestTier(input.chatSessions, [10, 25, 50, 100]);
  if (sessionTier) {
    milestones.push({ id: "sessions", label: `${sessionTier}+ coaching sessions`, detail: `${input.chatSessions} total` });
  }

  const testTier = highestTier(input.mockTestsCompleted, [1, 5, 10, 25]);
  if (testTier) {
    milestones.push({
      id: "tests",
      label: testTier === 1 ? "First mock test completed" : `${testTier}+ mock tests completed`,
      detail: `${input.mockTestsCompleted} total`,
    });
  }

  if (input.bestMastery && input.bestMastery.mastery >= 0.5) {
    const label =
      input.bestMastery.mastery >= 0.9 ? "Olympiad-level mastery" : input.bestMastery.mastery >= 0.75 ? "Advanced level reached" : "Solid grasp reached";
    milestones.push({
      id: "mastery",
      label: `${label} in ${input.bestMastery.subjectId}`,
      detail: `${Math.round(input.bestMastery.mastery * 100)}% mastery`,
    });
  }

  const streakTier = highestTier(Math.max(input.currentStreak, input.longestStreak), [3, 7, 14, 30, 60]);
  if (streakTier) {
    milestones.push({
      id: "streak",
      label: `${streakTier}-day streak reached`,
      detail: input.currentStreak >= streakTier ? "current streak" : "personal best",
    });
  }

  return milestones;
}
