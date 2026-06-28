import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import {
  runAgent,
  guardAgentRequest,
  streamResponse,
  jsonError,
} from "@/lib/agent-runner";
import { getOrCreateStudentModel } from "@/lib/student-model";
import { buildStudySessionSystem, buildStudySessionTools } from "@/lib/agents/study-session";
import type { Anthropic } from "@anthropic-ai/sdk";

const RATE_LIMIT = 15;
const RATE_WINDOW_MS = 60_000;
const MAX_HISTORY_MESSAGES = 40;
const MAX_MSG_CHARS = 8000;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return jsonError("Sign in required", 401);

  const userId = session.user.id;

  if (!rateLimit(`agent-study:${userId}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return jsonError("Too many requests — slow down.", 429);
  }

  const guard = await guardAgentRequest(userId);
  if (guard) return guard;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const { subjectId, messages: rawMessages } = body as {
    subjectId?: string;
    messages?: unknown[];
  };

  if (typeof subjectId !== "string" || !subjectId) {
    return jsonError("subjectId is required", 400);
  }

  // Validate and sanitize message history
  const messages = validateMessages(rawMessages);
  if (!messages) return jsonError("Invalid messages array", 400);

  const ctx = { userId, subjectId };

  const studentModel = await getOrCreateStudentModel(userId, subjectId);
  const tools = buildStudySessionTools(studentModel);
  const system = buildStudySessionSystem(subjectId, studentModel);

  const initialMessages: Anthropic.MessageParam[] = messages.length > 0
    ? messages
    : []; // Empty = fresh session; agent will call get_problem on its own

  return streamResponse(runAgent(system, initialMessages, tools, ctx));
}

function validateMessages(raw: unknown): Anthropic.MessageParam[] | null {
  if (!Array.isArray(raw)) return raw === undefined ? [] : null;
  if (raw.length > MAX_HISTORY_MESSAGES) return null;

  const result: Anthropic.MessageParam[] = [];
  for (const m of raw) {
    const role = (m as Record<string, unknown>)?.role;
    const content = (m as Record<string, unknown>)?.content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    if (content.length > MAX_MSG_CHARS) return null;
    result.push({ role, content });
  }
  return result;
}
