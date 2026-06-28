import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(user: { isFounder: boolean; email: string }): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  return user.isFounder || adminEmails.includes(user.email);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !isAdmin(user)) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { action, notes } = await req.json() as { action: "approve" | "reject" | "flag"; notes?: string };
  if (!["approve", "reject", "flag"].includes(action)) {
    return Response.json({ error: "Invalid action" }, { status: 400 });
  }

  const statusMap = { approve: "approved", reject: "rejected", flag: "flagged" } as const;

  const updated = await prisma.problem.update({
    where: { id: params.id },
    data: {
      status: statusMap[action],
      reviewedAt: new Date(),
      reviewedBy: user.email,
      ...(notes && { validationNotes: notes }),
    },
  });

  return Response.json({ problem: updated });
}
