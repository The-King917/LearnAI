import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkAndConsumeFreeMessage, getEffectivePlan } from "@/lib/billing";
import { rateLimit } from "@/lib/rate-limit";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CHAT_RATE_LIMIT = 20;
const CHAT_RATE_WINDOW_MS = 60 * 1000;
const MAX_MESSAGES = 60;
const MAX_MESSAGE_CHARS = 8000;
const MAX_TOTAL_CHARS = 40000;
const MAX_SYSTEM_PROMPT_CHARS = 20000;

function validateMessages(messages: unknown): { role: "user" | "assistant"; content: string }[] | null {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) return null;

  const validated: { role: "user" | "assistant"; content: string }[] = [];
  let totalChars = 0;

  for (const m of messages) {
    const role = (m as Record<string, unknown> | null)?.role;
    const content = (m as Record<string, unknown> | null)?.content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string" || content.length > MAX_MESSAGE_CHARS) {
      return null;
    }
    totalChars += content.length;
    validated.push({ role, content });
  }
  if (totalChars > MAX_TOTAL_CHARS) return null;

  return validated;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Sign in to use the coach." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });
    if (!user) {
      return new Response(JSON.stringify({ error: "Sign in to use the coach." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!rateLimit(`chat:${user.id}`, CHAT_RATE_LIMIT, CHAT_RATE_WINDOW_MS)) {
      return new Response(JSON.stringify({ error: "Too many requests — slow down a bit." }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (getEffectivePlan(user) === "FREE") {
      const allowed = await checkAndConsumeFreeMessage(user.id);
      if (!allowed) {
        return new Response(
          JSON.stringify({
            error: "You've used your 30 free messages this month. Upgrade to Pro for unlimited coaching.",
            code: "LIMIT_REACHED",
          }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const body = await req.json();
    const messages = validateMessages(body.messages);
    if (!messages) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (typeof body.systemPrompt === "string" && body.systemPrompt.length > MAX_SYSTEM_PROMPT_CHARS) {
      return new Response(JSON.stringify({ error: "System prompt too long" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const systemPrompt = body.systemPrompt;

    // Do NOT await — MessageStream is thenable, so awaiting it resolves the
    // full final Message instead of returning the streaming iterator.
    const stream = client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt ?? "You are a helpful assistant.",
      messages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch (e) {
          controller.error(e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err: unknown) {
    console.error("[api/chat]", err);
    return new Response(JSON.stringify({ error: "Something went wrong. Please try again." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
