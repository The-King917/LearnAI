import { callClaude } from "@/lib/agent-runner";
import { updateConcept, getOrCreateStudentModel, formatStudentModel } from "@/lib/student-model";
import { prisma } from "@/lib/prisma";
import type { AgentContext, AgentTool } from "@/lib/agent-runner";
import type { StudentModelData } from "@/lib/student-model";

export function buildDiagnosticSystem(subjectId: string, studentModel: StudentModelData, weeksUntilCompetition?: number): string {
  return `You are PolyTeach's Diagnostic Agent for "${subjectId}".

Your goal is to build a precise knowledge ceiling model for this student, then output a structured study plan.

SESSION PROTOCOL:
1. Call generate_question to get the first question (start at intermediate difficulty).
2. Present the question and wait for the student's answer.
3. Call evaluate_response with the question and answer.
4. Call update_student_model to record the result on the tested concept.
5. Call decide_next_question to determine the next concept and difficulty.
6. Repeat until you have high confidence (at least 8–10 questions covering 5+ distinct concepts).
7. Call generate_study_plan to produce the final output.

RULES:
- Do NOT use a fixed question bank — every question must be generated dynamically based on what you've learned so far.
- Never give direct answers. If the student says "I don't know," acknowledge it, record it, and move on.
- Do not repeat a concept that already has high confidence.
- Adapt aggressively: if the student crushes intermediate questions, jump to advanced immediately.
- When you call generate_study_plan, present its output to the student clearly as the final deliverable.

CURRENT STUDENT MODEL:
${formatStudentModel(studentModel)}
${weeksUntilCompetition ? `\nWeeks until competition: ${weeksUntilCompetition}` : ""}

Begin immediately with the first question — no preamble.`;
}

export function buildDiagnosticTools(subjectId: string): AgentTool[] {
  const generateQuestion: AgentTool = {
    definition: {
      name: "generate_question",
      description: "Generate the next diagnostic question targeting a specific concept and difficulty.",
      input_schema: {
        type: "object" as const,
        properties: {
          subject: { type: "string" },
          difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced", "olympiad"] },
          concept: { type: "string", description: "The specific concept to probe" },
          avoid_concepts: {
            type: "array",
            items: { type: "string" },
            description: "Concepts already tested — do not overlap",
          },
        },
        required: ["subject", "difficulty", "concept"],
      },
    },
    handler: async (input) => {
      const { subject, difficulty, concept, avoid_concepts } = input as {
        subject: string;
        difficulty: string;
        concept: string;
        avoid_concepts?: string[];
      };
      const avoidNote = avoid_concepts?.length
        ? ` Do NOT test: ${avoid_concepts.join(", ")}.`
        : "";
      const question = await callClaude(
        `You are a diagnostic question generator for ${subject}. Output ONLY the question — no answer, no hint. Be precise.${avoidNote}`,
        `Generate one ${difficulty}-level diagnostic question specifically targeting the concept: "${concept}" in ${subject}.`,
        384
      );
      return { question, concept, difficulty };
    },
  };

  const evaluateResponse: AgentTool = {
    definition: {
      name: "evaluate_response",
      description: "Evaluate the student's answer to the diagnostic question.",
      input_schema: {
        type: "object" as const,
        properties: {
          question: { type: "string" },
          answer: { type: "string" },
          concept: { type: "string" },
          difficulty: { type: "string" },
        },
        required: ["question", "answer", "concept", "difficulty"],
      },
    },
    handler: async (input) => {
      const { question, answer, concept, difficulty } = input as {
        question: string;
        answer: string;
        concept: string;
        difficulty: string;
      };
      const result = await callClaude(
        `You are a strict diagnostic evaluator. Output ONLY valid JSON: { "verdict": "correct"|"partial"|"incorrect", "confidence_signal": "high"|"medium"|"low", "misconception": "one-sentence description or null" }`,
        `Concept: ${concept} (${difficulty})\nQuestion: ${question}\nStudent answer: ${answer}`,
        192
      );
      try {
        return { ...JSON.parse(result), concept };
      } catch {
        return { verdict: "partial", confidence_signal: "low", misconception: null, concept };
      }
    },
  };

  const updateStudentModelTool: AgentTool = {
    definition: {
      name: "update_student_model",
      description: "Record the diagnostic result for a concept in the student model.",
      input_schema: {
        type: "object" as const,
        properties: {
          concept: { type: "string" },
          performance: { type: "string", enum: ["correct", "partial", "incorrect"] },
        },
        required: ["concept", "performance"],
      },
    },
    handler: async (input, ctx) => {
      const { concept, performance } = input as {
        concept: string;
        performance: "correct" | "partial" | "incorrect";
      };
      await updateConcept(ctx.userId, subjectId, concept, performance);
      return { updated: true, concept, performance };
    },
  };

  const decideNextQuestion: AgentTool = {
    definition: {
      name: "decide_next_question",
      description: "Based on the current student model, decide the next concept and difficulty to probe.",
      input_schema: {
        type: "object" as const,
        properties: {
          tested_concepts: {
            type: "array",
            items: { type: "string" },
            description: "Concepts already covered this session",
          },
          questions_asked: { type: "number" },
        },
        required: ["tested_concepts", "questions_asked"],
      },
    },
    handler: async (input, ctx) => {
      const { tested_concepts, questions_asked } = input as {
        tested_concepts: string[];
        questions_asked: number;
      };

      const model = await getOrCreateStudentModel(ctx.userId, subjectId);

      // Find weak concepts not yet tested
      const untested = Object.entries(model.concepts)
        .filter(([name]) => !tested_concepts.includes(name))
        .sort(([, a], [, b]) => a.level - b.level);

      const weakest = untested[0];
      const avgLevel = Object.values(model.concepts).length > 0
        ? Object.values(model.concepts).reduce((s, c) => s + c.level, 0) / Object.values(model.concepts).length
        : 0.4;

      const difficulty = avgLevel < 0.25 ? "beginner"
        : avgLevel < 0.5 ? "intermediate"
        : avgLevel < 0.75 ? "advanced"
        : "olympiad";

      const shouldEnd = questions_asked >= 10 || (questions_asked >= 8 && model.confidence > 0.7);

      return {
        should_end_diagnostic: shouldEnd,
        next_concept: weakest ? weakest[0] : `advanced_${subjectId}_topic_${questions_asked}`,
        next_difficulty: difficulty,
        confidence: model.confidence,
        reasoning: weakest
          ? `Targeting "${weakest[0]}" — lowest mastery at ${Math.round(weakest[1].level * 100)}%`
          : "Exploring new concepts",
      };
    },
  };

  const generateStudyPlan: AgentTool = {
    definition: {
      name: "generate_study_plan",
      description: "Generate a structured study plan based on the completed diagnostic.",
      input_schema: {
        type: "object" as const,
        properties: {
          subject: { type: "string" },
          weeks_until_competition: { type: "number" },
          priority_gaps: {
            type: "array",
            items: { type: "string" },
            description: "Ordered list of concepts to address, weakest first",
          },
          strengths: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["subject", "weeks_until_competition", "priority_gaps"],
      },
    },
    handler: async (input, ctx) => {
      const { subject, weeks_until_competition, priority_gaps, strengths } = input as {
        subject: string;
        weeks_until_competition: number;
        priority_gaps: string[];
        strengths?: string[];
      };

      const model = await getOrCreateStudentModel(ctx.userId, subjectId);
      const modelSummary = formatStudentModel(model);

      const plan = await callClaude(
        `You are a competition prep strategist. Generate a detailed, week-by-week study plan. Be specific — name exact topics, problem types, and resources for each week. Format with markdown headers.`,
        `Subject: ${subject}\nWeeks available: ${weeks_until_competition}\nPriority gaps (weakest first): ${priority_gaps.join(", ")}\nStrengths to maintain: ${(strengths ?? []).join(", ") || "none identified"}\n\nStudent model:\n${modelSummary}`,
        1024
      );

      // Persist the plan structure
      const days = buildDayPlan(priority_gaps, weeks_until_competition);
      try {
        await prisma.studyPlan.upsert({
          where: { userId_subjectId: { userId: ctx.userId, subjectId } },
          create: { userId: ctx.userId, subjectId, days: days as object },
          update: { days: days as object, adjustments: [] as object[], status: "active" },
        });
      } catch {
        // Non-fatal — plan text still returned to student
      }

      return { plan, priority_gaps, strengths: strengths ?? [], weeks: weeks_until_competition };
    },
  };

  return [generateQuestion, evaluateResponse, updateStudentModelTool, decideNextQuestion, generateStudyPlan];
}

function buildDayPlan(
  gaps: string[],
  weeks: number
): Array<{ day: number; date: string; topics: string[]; completed: boolean }> {
  const days: Array<{ day: number; date: string; topics: string[]; completed: boolean }> = [];
  const totalDays = weeks * 7;
  const topicsPerBlock = Math.max(1, Math.ceil(totalDays / Math.max(gaps.length, 1)));

  for (let d = 0; d < totalDays; d++) {
    const gapIndex = Math.floor(d / topicsPerBlock);
    const topic = gaps[Math.min(gapIndex, gaps.length - 1)] ?? "review";
    const date = new Date(Date.now() + d * 86400000).toISOString().slice(0, 10);
    days.push({ day: d + 1, date, topics: [topic], completed: false });
  }
  return days;
}
