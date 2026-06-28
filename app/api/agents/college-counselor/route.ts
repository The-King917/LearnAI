import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { runAgent, guardAgentRequest, streamResponse, jsonError } from "@/lib/agent-runner";
import { buildCollegeCounselorSystem, buildCollegeCounselorTools } from "@/lib/agents/college-counselor";
import { prisma } from "@/lib/prisma";
import { isProfileEmpty } from "@/lib/admissions";
import type Anthropic from "@anthropic-ai/sdk";

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const MAX_HISTORY = 30;
const MAX_MSG_CHARS = 12000; // essays can be long
const MAX_TOTAL_CHARS = 80000;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return jsonError("Sign in required", 401);

  const userId = session.user.id;

  if (!rateLimit(`agent-counselor:${userId}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return jsonError("Too many requests.", 429);
  }

  const guard = await guardAgentRequest(userId, "counselor");
  if (guard) return guard;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const { messages: rawMessages } = body as { messages?: unknown[] };

  const messages = validateMessages(rawMessages);
  if (!messages) return jsonError("Invalid messages array", 400);

  // Load the student's application profile for context
  const profile = await prisma.applicationProfile.findUnique({ where: { userId } });
  const profileSummary = profile
    ? buildProfileSummary(profile)
    : "No application profile on file yet.";

  const ctx = { userId };
  const tools = buildCollegeCounselorTools();
  const system = buildCollegeCounselorSystem(profileSummary);

  void isProfileEmpty; // available for additional gating

  return streamResponse(runAgent(system, messages, tools, ctx, 16));
}

function buildProfileSummary(profile: {
  gpa?: number | null;
  gpaScale?: string | null;
  satScore?: number | null;
  actScore?: number | null;
  intendedMajor?: string | null;
  courseRigor?: string | null;
  extracurriculars?: string | null;
  awards?: string | null;
  demographics?: string | null;
}): string {
  const lines: string[] = [];
  if (profile.gpa) lines.push(`GPA: ${profile.gpa}${profile.gpaScale ? ` (${profile.gpaScale})` : ""}`);
  if (profile.satScore) lines.push(`SAT: ${profile.satScore}`);
  if (profile.actScore) lines.push(`ACT: ${profile.actScore}`);
  if (profile.intendedMajor) lines.push(`Major: ${profile.intendedMajor}`);
  if (profile.courseRigor) lines.push(`Course rigor: ${profile.courseRigor}`);
  if (profile.extracurriculars) lines.push(`Activities: ${profile.extracurriculars}`);
  if (profile.awards) lines.push(`Awards: ${profile.awards}`);
  if (profile.demographics) lines.push(`Context: ${profile.demographics}`);
  return lines.length > 0 ? lines.join("\n") : "Profile not yet filled out.";
}

function validateMessages(raw: unknown): Anthropic.MessageParam[] | null {
  if (!Array.isArray(raw)) return raw === undefined ? [] : null;
  if (raw.length > MAX_HISTORY) return null;
  let totalChars = 0;
  const result: Anthropic.MessageParam[] = [];
  for (const m of raw) {
    const role = (m as Record<string, unknown>)?.role;
    const content = (m as Record<string, unknown>)?.content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    if (content.length > MAX_MSG_CHARS) return null;
    totalChars += content.length;
    if (totalChars > MAX_TOTAL_CHARS) return null;
    result.push({ role, content });
  }
  return result;
}
