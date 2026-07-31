export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export const DURATION = {
  fast: 0.3,
  base: 0.4,
  slow: 0.6,
  slower: 0.7,
  hero: 0.9,
} as const;

export function transition(duration: number = DURATION.slower, delay = 0) {
  return { duration, ease: EASE_OUT, ...(delay ? { delay } : {}) };
}
