import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBufferStatus } from "@/lib/problem-generator";

function isAdmin(user: { isFounder: boolean; email: string }): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  return user.isFounder || adminEmails.includes(user.email);
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !isAdmin(user)) return Response.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? "pending";
  const competition = url.searchParams.get("competition") ?? undefined;
  const page = Math.max(0, parseInt(url.searchParams.get("page") ?? "0", 10));
  const limit = 20;

  const [problems, total] = await Promise.all([
    prisma.problem.findMany({
      where: { status, ...(competition && { competition }) },
      orderBy: { generatedAt: "desc" },
      skip: page * limit,
      take: limit,
    }),
    prisma.problem.count({ where: { status, ...(competition && { competition }) } }),
  ]);

  // Buffer status for all competitions
  const competitions = ["amc8", "amc10", "amc12", "aime", "usamo", "mathcounts", "usaco", "acsl", "usapho", "usnco", "usabo"];
  const bufferStatuses = await Promise.all(
    competitions.map(async (c) => ({ competition: c, ...(await getBufferStatus(c)) }))
  );

  return Response.json({ problems, total, page, bufferStatuses });
}
