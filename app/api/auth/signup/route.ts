import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { FOUNDER_SEAT_LIMIT } from "@/lib/billing";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SIGNUP_LIMIT = 8;
const SIGNUP_WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(`signup:${getClientIp(req)}`, SIGNUP_LIMIT, SIGNUP_WINDOW_MS)) {
      return Response.json({ error: "Too many signup attempts. Try again later." }, { status: 429 });
    }

    const { email, password, name } = await req.json();

    if (typeof email !== "string" || email.length > 254 || !EMAIL_RE.test(email)) {
      return Response.json({ error: "Enter a valid email address" }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8 || password.length > 200) {
      return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return Response.json({ error: "An account with that email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { user, totalAccounts } = await prisma.$transaction(async (tx) => {
      const existingCount = await tx.user.count();
      const isFounder = existingCount < FOUNDER_SEAT_LIMIT;

      const created = await tx.user.create({
        data: {
          email: normalizedEmail,
          name: typeof name === "string" && name.trim() ? name.trim().slice(0, 100) : null,
          passwordHash,
          ...(isFounder ? { isFounder: true, plan: "PRO" } : {}),
        },
        select: { id: true, email: true, name: true },
      });

      return { user: created, totalAccounts: existingCount + 1 };
    });

    console.log(`[api/auth/signup] new account created (${normalizedEmail}) — total accounts: ${totalAccounts}`);

    return Response.json({ user });
  } catch (err: unknown) {
    console.error("[api/auth/signup]", err);
    return Response.json({ error: "Something went wrong creating your account" }, { status: 500 });
  }
}
