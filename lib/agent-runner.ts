import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const AGENT_MODEL = "claude-sonnet-4-6";
export const AGENT_MAX_TOKENS = 2048;
export const AGENT_MAX_ITERATIONS = 12;
const TOOL_MAX_RETRIES = 2;

export interface AgentContext {
  userId: string;
  subjectId?: string;
  sessionId?: string;
}

export interface ToolHandler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (input: Record<string, unknown>, ctx: AgentContext): Promise<unknown>;
}

export interface AgentTool {
  definition: Anthropic.Tool;
  handler: ToolHandler;
}

interface ToolUseAccumulator {
  id: string;
  name: string;
  input: string;
}

/**
 * Core agentic loop. Streams text to the caller via AsyncGenerator, executes
 * tool calls internally, and loops until stop_reason === "end_turn" or max
 * iterations are exhausted. On tool failure it retries up to TOOL_MAX_RETRIES
 * times with the error returned as a tool_result so the model can adjust.
 */
export async function* runAgent(
  system: string,
  initialMessages: Anthropic.MessageParam[],
  tools: AgentTool[],
  ctx: AgentContext,
  maxIterations = AGENT_MAX_ITERATIONS
): AsyncGenerator<string> {
  const toolDefs = tools.map((t) => t.definition);
  const handlers: Record<string, ToolHandler> = {};
  for (const t of tools) handlers[t.definition.name] = t.handler;

  let messages: Anthropic.MessageParam[] = [...initialMessages];

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const accumulating: ToolUseAccumulator[] = [];
    let currentTool: ToolUseAccumulator | null = null;
    const contentForHistory: Anthropic.ContentBlock[] = [];

    const stream = anthropic.messages.stream({
      model: AGENT_MODEL,
      max_tokens: AGENT_MAX_TOKENS,
      system,
      tools: toolDefs,
      messages,
    });

    for await (const event of stream) {
      switch (event.type) {
        case "content_block_start":
          if (event.content_block.type === "text") {
            contentForHistory.push({ type: "text", text: "" });
          } else if (event.content_block.type === "tool_use") {
            currentTool = { id: event.content_block.id, name: event.content_block.name, input: "" };
          }
          break;

        case "content_block_delta":
          if (event.delta.type === "text_delta") {
            yield event.delta.text;
            const last = contentForHistory[contentForHistory.length - 1];
            if (last?.type === "text") last.text += event.delta.text;
          } else if (event.delta.type === "input_json_delta" && currentTool) {
            currentTool.input += event.delta.partial_json;
          }
          break;

        case "content_block_stop":
          if (currentTool) {
            accumulating.push(currentTool);
            contentForHistory.push({
              type: "tool_use",
              id: currentTool.id,
              name: currentTool.name,
              input: safeParseJSON(currentTool.input),
            });
            currentTool = null;
          }
          break;
      }
    }

    const final = await stream.finalMessage();

    if (final.stop_reason !== "tool_use" || accumulating.length === 0) break;

    // Execute tool calls with retry
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const tu of accumulating) {
      const handler = handlers[tu.name];
      let result: unknown;
      let isError = false;

      if (!handler) {
        result = { error: `Unknown tool: ${tu.name}` };
        isError = true;
      } else {
        const parsedInput = safeParseJSON(tu.input) as Record<string, unknown>;
        let lastError: string | null = null;

        for (let attempt = 0; attempt <= TOOL_MAX_RETRIES; attempt++) {
          try {
            result = await handler(parsedInput, ctx);
            lastError = null;
            break;
          } catch (e) {
            lastError = String(e);
            if (attempt < TOOL_MAX_RETRIES) {
              await delay(300 * (attempt + 1));
            }
          }
        }

        if (lastError !== null) {
          result = { error: lastError, hint: "Retry with adjusted parameters." };
          isError = true;
        }
      }

      toolResults.push({
        type: "tool_result",
        tool_use_id: tu.id,
        content: JSON.stringify(result),
        ...(isError && { is_error: true }),
      });
    }

    messages = [
      ...messages,
      { role: "assistant", content: contentForHistory },
      { role: "user", content: toolResults },
    ];
  }
}

/**
 * Quick non-streaming Claude call for tool sub-calls (e.g. generating a
 * problem, evaluating an answer). Returns the text content.
 */
export async function callClaude(
  system: string,
  userPrompt: string,
  maxTokens = 1024
): Promise<string> {
  const response = await anthropic.messages.create({
    model: AGENT_MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: userPrompt }],
  });
  return response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}

/** Auth + billing guard, returns null on success or an error Response. */
export async function guardAgentRequest(userId: string, subjectId?: string): Promise<Response | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { organization: true } });
  if (!user) return jsonError("User not found", 401);

  // Pro gate for agents (they're premium features)
  const plan = user.organization?.subscriptionStatus === "active" ? "PRO"
    : user.isFounder ? "PRO"
    : user.plan === "PRO" && user.subscriptionStatus === "active" ? "PRO"
    : user.plan === "PRO" ? "PRO"
    : "FREE";

  if (plan === "FREE") {
    return jsonError("Agentic coaching requires a Pro plan.", 403, "PRO_REQUIRED");
  }

  void subjectId; // available for future per-subject gating
  return null;
}

export function jsonError(message: string, status: number, code?: string): Response {
  return new Response(JSON.stringify({ error: message, ...(code && { code }) }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function streamResponse(generator: AsyncGenerator<string>): Response {
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of generator) {
          controller.enqueue(encoder.encode(chunk));
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
}

function safeParseJSON(str: string): unknown {
  if (!str.trim()) return {};
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
