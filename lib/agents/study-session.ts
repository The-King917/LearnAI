import Anthropic from "@anthropic-ai/sdk";
import { callClaude } from "@/lib/agent-runner";
import { formatStudentModel, updateConcept, appendSessionSummary } from "@/lib/student-model";
import type { AgentContext, AgentTool } from "@/lib/agent-runner";
import type { StudentModelData } from "@/lib/student-model";

export function buildStudySessionSystem(subjectId: string, studentModel: StudentModelData): string {
  return `You are PolyTeach's Study Session Agent — an autonomous Socratic coach for "${subjectId}".

Your job is to run a complete coaching session arc:
1. Call get_problem to fetch a problem appropriate to the student's level.
2. Present the problem to the student and wait for their response.
3. After each student response, call evaluate_answer.
4. If the student is stuck, call generate_hint (increasing hint_number each time).
5. After each exchange, call decide_next_action to determine whether to go deeper, move on to a new problem, or end the session.
6. When the session ends (decide_next_action returns "end_session" or after 3 problems), call write_session_summary.

CORE RULES:
- NEVER give the answer directly. Every response must be a Socratic question or targeted hint.
- If the student asks a question or goes off-topic, answer it briefly and gracefully resume the session without restarting.
- Acknowledge correct reasoning before pushing further.
- Format math with LaTeX ($...$ inline, $$...$$ display).
- Keep individual responses concise — one key question or nudge per turn.

STUDENT MODEL:
${formatStudentModel(studentModel)}

Begin by calling get_problem immediately. Do not wait for the student to ask for one.`;
}

export function buildStudySessionTools(studentModel: StudentModelData): AgentTool[] {
  const getProblem: AgentTool = {
    definition: {
      name: "get_problem",
      description: "Generate a practice problem appropriate for the student's current level.",
      input_schema: {
        type: "object" as const,
        properties: {
          subject: { type: "string", description: "Subject / competition name" },
          difficulty: {
            type: "string",
            enum: ["beginner", "intermediate", "advanced", "olympiad"],
            description: "Target difficulty",
          },
          concept: {
            type: "string",
            description: "Specific concept to target (optional). Choose a weak concept from the student model.",
          },
        },
        required: ["subject", "difficulty"],
      },
    },
    handler: async (input) => {
      const { subject, difficulty, concept } = input as {
        subject: string;
        difficulty: string;
        concept?: string;
      };
      const conceptHint = concept ? ` Focus specifically on the concept: ${concept}.` : "";
      const problem = await callClaude(
        `You are a problem generator for ${subject} at ${difficulty} level. Output ONLY the problem statement — no answer, no hints, no solution. For math, use LaTeX. Be precise and unambiguous.${conceptHint}`,
        `Generate one well-crafted ${difficulty}-level problem for ${subject}.${conceptHint}`,
        512
      );
      return { problem, subject, difficulty, concept: concept ?? null };
    },
  };

  const evaluateAnswer: AgentTool = {
    definition: {
      name: "evaluate_answer",
      description: "Evaluate a student's response to a problem. Returns correctness and key insight.",
      input_schema: {
        type: "object" as const,
        properties: {
          problem: { type: "string", description: "The problem statement" },
          student_response: { type: "string", description: "What the student said or wrote" },
          concept: { type: "string", description: "The concept being tested" },
        },
        required: ["problem", "student_response"],
      },
    },
    handler: async (input) => {
      const { problem, student_response, concept } = input as {
        problem: string;
        student_response: string;
        concept?: string;
      };
      const eval_ = await callClaude(
        "You are a strict but fair grader. Evaluate the student's response. Output valid JSON only: { \"verdict\": \"correct\"|\"partial\"|\"incorrect\", \"key_gap\": \"one-sentence description of the gap or null if correct\", \"next_socratic_question\": \"the single question that will move them forward\" }",
        `Problem: ${problem}\n\nStudent response: ${student_response}`,
        256
      );
      try {
        const parsed = JSON.parse(eval_);
        if (concept) {
          void concept; // concept is used by the calling agent to pick which concept to update
        }
        return { ...parsed, concept: concept ?? null };
      } catch {
        return { verdict: "partial", key_gap: "Could not parse evaluation", next_socratic_question: "Can you walk me through your reasoning step by step?", concept: concept ?? null };
      }
    },
  };

  const generateHint: AgentTool = {
    definition: {
      name: "generate_hint",
      description: "Generate the next hint for a student who is stuck.",
      input_schema: {
        type: "object" as const,
        properties: {
          problem: { type: "string", description: "The problem statement" },
          hint_number: { type: "number", description: "1 = lightest hint, 3 = near-complete outline" },
          student_attempts: { type: "string", description: "Summary of what the student has tried so far" },
        },
        required: ["problem", "hint_number"],
      },
    },
    handler: async (input) => {
      const { problem, hint_number, student_attempts } = input as {
        problem: string;
        hint_number: number;
        student_attempts?: string;
      };
      const hintStyle = hint_number === 1
        ? "Hint 1: name only the key concept or technique needed. Nothing more."
        : hint_number === 2
        ? "Hint 2: describe the first concrete step toward a solution. Do NOT give the full approach."
        : "Hint 3: give a near-complete outline of the approach, stopping just before the final computation or conclusion.";

      const hint = await callClaude(
        `You are a Socratic coach. ${hintStyle}`,
        `Problem: ${problem}\n${student_attempts ? `What the student has tried: ${student_attempts}` : ""}`,
        256
      );
      return { hint, hint_number };
    },
  };

  const decideNextAction: AgentTool = {
    definition: {
      name: "decide_next_action",
      description: "Decide whether to go deeper on the current problem, move on, or end the session.",
      input_schema: {
        type: "object" as const,
        properties: {
          turns_on_problem: { type: "number", description: "How many back-and-forth turns on the current problem" },
          problems_completed: { type: "number", description: "How many problems have been completed this session" },
          last_verdict: { type: "string", enum: ["correct", "partial", "incorrect"], description: "Verdict on the last answer" },
          session_turns_total: { type: "number", description: "Total turns in this session so far" },
        },
        required: ["turns_on_problem", "problems_completed", "last_verdict", "session_turns_total"],
      },
    },
    handler: async (input) => {
      const { turns_on_problem, problems_completed, last_verdict, session_turns_total } = input as {
        turns_on_problem: number;
        problems_completed: number;
        last_verdict: string;
        session_turns_total: number;
      };

      // Rule-based decision logic
      if (session_turns_total >= 20 || problems_completed >= 3) {
        return { action: "end_session", reason: "Session length limit reached" };
      }
      if (last_verdict === "correct" && turns_on_problem >= 1) {
        return { action: "move_on", reason: "Student solved it correctly — move to a new problem" };
      }
      if (turns_on_problem >= 6) {
        return { action: "move_on", reason: "Sufficient exploration on this problem — time to move on" };
      }
      if (last_verdict === "incorrect" && turns_on_problem < 3) {
        return { action: "deeper", reason: "Student is still working through it — go deeper with a hint" };
      }
      if (last_verdict === "partial" && turns_on_problem < 4) {
        return { action: "deeper", reason: "Partial understanding — probe further" };
      }
      return { action: "deeper", reason: "Continue Socratic questioning" };
    },
  };

  const writeSessionSummary: AgentTool = {
    definition: {
      name: "write_session_summary",
      description: "Write a summary of the session, update the student model, and close the session.",
      input_schema: {
        type: "object" as const,
        properties: {
          problems_attempted: { type: "number" },
          concepts_covered: {
            type: "array",
            items: { type: "string" },
            description: "List of concept names covered in this session",
          },
          overall_performance: {
            type: "string",
            enum: ["excellent", "good", "struggling", "needs_review"],
          },
          narrative: { type: "string", description: "1–3 sentence summary of what happened" },
        },
        required: ["problems_attempted", "concepts_covered", "overall_performance", "narrative"],
      },
    },
    handler: async (input, ctx) => {
      const { concepts_covered, overall_performance, narrative } = input as {
        problems_attempted: number;
        concepts_covered: string[];
        overall_performance: "excellent" | "good" | "struggling" | "needs_review";
        narrative: string;
      };

      if (ctx.subjectId) {
        // Update concept records for each concept touched
        const perfMap: Record<string, "correct" | "partial" | "incorrect"> = {
          excellent: "correct",
          good: "correct",
          struggling: "incorrect",
          needs_review: "partial",
        };
        for (const concept of concepts_covered) {
          await updateConcept(ctx.userId, ctx.subjectId, concept, perfMap[overall_performance] ?? "partial");
        }
        await appendSessionSummary(ctx.userId, ctx.subjectId, {
          date: new Date().toISOString(),
          summary: narrative,
          performance: overall_performance,
          conceptsCovered: concepts_covered,
        });
      }

      return {
        saved: true,
        message: "Session summary saved. The student model has been updated.",
      };
    },
  };

  void studentModel; // available for future use in tool handlers
  return [getProblem, evaluateAnswer, generateHint, decideNextAction, writeSessionSummary];
}
