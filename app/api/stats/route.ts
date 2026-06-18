import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const totalAccounts = await prisma.user.count();
  return Response.json({ totalAccounts });
}
