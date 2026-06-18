import { prisma } from "@/lib/prisma";

export async function GET() {
  const totalAccounts = await prisma.user.count();
  return Response.json({ totalAccounts });
}
