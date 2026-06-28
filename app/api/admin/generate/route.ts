import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAndStore, getBufferStatus } from "@/lib/problem-generator";
import type { CompetitionId } from "@/lib/problem-gen-prompts";

function isAdmin(user: { isFounder: boolean; email: string }): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  return user.isFounder || adminEmails.includes(user.email);
}

const VALID_COMPETITIONS: CompetitionId[] = [
  "amc8", "amc10", "amc12", "aime", "usamo", "mathcounts",
  "usaco", "acsl", "usapho", "usnco", "usabo", "science-olympiad", "science-bowl",
];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !isAdmin(user)) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { competition, count = 5, difficulty } = await req.json() as {
    competition: string;
    count?: number;
    difficulty?: string;
  };

  if (!VALID_COMPETITIONS.includes(competition as CompetitionId)) {
    return Response.json({ error: "Invalid competition" }, { status: 400 });
  }
  if (count < 1 || count > 20) {
    return Response.json({ error: "count must be 1–20" }, { status: 400 });
  }

  const results: Array<{ id: string | null; attempt: number }> = [];

  for (let i = 0; i < count; i++) {
    const id = await generateAndStore(competition as CompetitionId, difficulty).catch((e) => {
      console.error(`[admin/generate] Error on problem ${i + 1}:`, e);
      return null;
    });
    results.push({ id, attempt: i + 1 });
  }

  const bufferStatus = await getBufferStatus(competition);

  return Response.json({
    generated: results.filter((r) => r.id !== null).length,
    total: count,
    results,
    bufferStatus,
  });
}
