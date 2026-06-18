import { NextRequest } from "next/server";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Best-effort, single-instance in-memory rate limiter. Resets on cold start and isn't
 * shared across serverless instances/regions — fine as a first line of defense, but
 * swap for Upstash/Redis if this needs to hold under multi-instance traffic.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  if (Math.random() < 0.01) {
    buckets.forEach((b, k) => {
      if (b.resetAt <= now) buckets.delete(k);
    });
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;

  bucket.count += 1;
  return true;
}

export function getClientIp(req: NextRequest | { headers: Headers | Record<string, string | string[] | undefined> }): string {
  const headers = req.headers;
  const forwarded = headers instanceof Headers ? headers.get("x-forwarded-for") : headers["x-forwarded-for"];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return value?.split(",")[0]?.trim() || "unknown";
}
