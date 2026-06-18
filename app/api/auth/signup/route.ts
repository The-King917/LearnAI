import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (typeof email !== "string" || !EMAIL_RE.test(email)) {
      return Response.json({ error: "Enter a valid email address" }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8) {
      return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return Response.json({ error: "An account with that email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: typeof name === "string" && name.trim() ? name.trim() : null,
        passwordHash,
      },
      select: { id: true, email: true, name: true },
    });

    const totalAccounts = await prisma.user.count();
    console.log(`[api/auth/signup] new account created (${normalizedEmail}) — total accounts: ${totalAccounts}`);

    return Response.json({ user });
  } catch (err: unknown) {
    console.error("[api/auth/signup]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
