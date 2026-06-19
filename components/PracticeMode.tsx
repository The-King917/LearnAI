"use client";

import { useState, useCallback } from "react";
import { Subject } from "@/lib/subjects";
import { Difficulty, APQuestionType, buildSystemPrompt, isAPSubject } from "@/lib/prompts";
import { parseResultTag, ResultTag } from "@/lib/mastery";
import Markdown from "./Markdown";

interface PracticeModeProps {
  subject: Subject | null;
  difficulty: Difficulty;
  onResult?: (result: ResultTag) => void;
}

const display = (text: string) => parseResultTag(text).clean;

type Stage = "idle" | "problem" | "hint1" | "hint2" | "hint3" | "solution";

interface PracticeState {
  problem: string;
  hint1: string; hint2: string; hint3: string;
  solution: string;
  userAnswer: string;
  feedback: string;
}

// MCQ state
interface MCQState {
  problem: string;
  selected: string | null;
  feedback: string;
  loadingFeedback: boolean;
  feedbackStream: string;
  revealed: boolean;
}

// FRQ state
interface FRQState {
  problem: string;
  answers: Record<string, string>;
  feedback: Record<string, string>;
  feedbackStream: Record<string, string>;
  loading: Record<string, boolean>;
}

async function streamToString(body: object, onChunk?: (s: string) => void): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Request failed");
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    full += decoder.decode(value, { stream: true });
    onChunk?.(full);
  }
  return full;
}

const MCQ_OPTIONS = ["A", "B", "C", "D", "E"];
const HINT_META = [
  { label: "Key concept", sub: "Name the theorem or idea needed" },
  { label: "Approach", sub: "Describe the method and first step" },
  { label: "Outline", sub: "Near-complete structure, no final answer" },
];

// ── MCQ Mode ────────────────────────────────────────────────────────────────
function MCQPractice({ subject, difficulty, onResult }: { subject: Subject; difficulty: Difficulty; onResult?: (result: ResultTag) => void }) {
  const [state, setState] = useState<MCQState>({
    problem: "", selected: null, feedback: "", loadingFeedback: false, feedbackStream: "", revealed: false,
  });
  const [generating, setGenerating] = useState(false);
  const [genStream, setGenStream] = useState("");

  const systemPrompt = buildSystemPrompt(subject, "practice", difficulty, "mcq");

  const generate = useCallback(async () => {
    setGenerating(true);
    setGenStream("");
    setState({ problem: "", selected: null, feedback: "", loadingFeedback: false, feedbackStream: "", revealed: false });
    try {
      const problem = await streamToString({
        systemPrompt,
        subjectId: subject.id,
        messages: [{ role: "user", content: "Generate one AP MCQ now." }],
      }, setGenStream);
      setState((s) => ({ ...s, problem }));
    } finally { setGenerating(false); setGenStream(""); }
  }, [systemPrompt]);

  const selectOption = useCallback(async (letter: string) => {
    if (state.selected || state.loadingFeedback) return;
    setState((s) => ({ ...s, selected: letter, loadingFeedback: true, feedbackStream: "" }));
    try {
      const feedback = await streamToString({
        systemPrompt,
        subjectId: subject.id,
        messages: [
          { role: "user", content: `Here is the question:\n\n${state.problem}` },
          { role: "assistant", content: "Here is your MCQ. Choose your answer." },
          { role: "user", content: `I choose (${letter}).` },
        ],
      }, (s) => setState((prev) => ({ ...prev, feedbackStream: s })));
      const { result, clean } = parseResultTag(feedback);
      setState((s) => ({ ...s, feedback: clean, loadingFeedback: false, feedbackStream: "" }));
      if (result) onResult?.(result);
    } catch { setState((s) => ({ ...s, loadingFeedback: false })); }
  }, [state, systemPrompt, onResult]);

  const reset = () => setState({ problem: "", selected: null, feedback: "", loadingFeedback: false, feedbackStream: "", revealed: false });

  if (!state.problem && !generating) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
        <div>
          <p className="text-lg font-semibold tracking-[-0.02em] text-text">{subject.name} — MCQ</p>
          <p className="text-sm text-text-2 mt-1">AP-style multiple choice · {difficulty}</p>
        </div>
        <button onClick={generate} className="px-4 py-2 rounded-lg text-background font-semibold text-sm bg-white hover:bg-white/85 shadow-glow transition-all">
          Generate question
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-6 max-w-2xl mx-auto w-full space-y-4">
      {/* Question */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xs font-medium text-muted uppercase tracking-[0.07em]">MCQ</span>
          <span className="text-subtle">·</span>
          <span className="text-2xs text-muted">{subject.name}</span>
          <span className="text-subtle">·</span>
          <span className="text-2xs text-muted capitalize">{difficulty}</span>
        </div>
        {generating ? (
          <Markdown streaming>{genStream || " "}</Markdown>
        ) : (
          <Markdown>{state.problem}</Markdown>
        )}
      </div>

      {/* Options */}
      {!generating && state.problem && (
        <div className="space-y-2">
          {MCQ_OPTIONS.map((letter) => {
            const isSelected = state.selected === letter;
            return (
              <button
                key={letter}
                onClick={() => selectOption(letter)}
                disabled={!!state.selected || state.loadingFeedback}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all duration-100 ${
                  isSelected
                    ? "border-white/25 bg-white/10 text-text shadow-glow"
                    : !state.selected
                    ? "border-border bg-surface hover:border-border-2 hover:bg-surface-2 text-text-2 hover:text-text"
                    : "border-border bg-surface text-muted opacity-50"
                }`}
              >
                <span className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-mono shrink-0 transition-colors ${
                  isSelected ? "border-white/25 bg-white/15 text-text" : "border-border text-muted"
                }`}>
                  {letter}
                </span>
                <span>Option {letter}</span>
              </button>
            );
          })}
          <p className="text-2xs text-muted text-center pt-1">Options are labeled in the question above — click the letter that matches your answer</p>
        </div>
      )}

      {/* Feedback */}
      {(state.feedback || state.feedbackStream || state.loadingFeedback) && (
        <div className="bg-surface border border-border rounded-xl p-4 animate-in">
          <p className="text-2xs font-medium text-muted uppercase tracking-[0.07em] mb-3">Feedback</p>
          {state.loadingFeedback && !state.feedbackStream ? (
            <div className="flex gap-1"><div className="typing-dot"/><div className="typing-dot"/><div className="typing-dot"/></div>
          ) : (
            <Markdown streaming={state.loadingFeedback}>{display(state.feedback || state.feedbackStream)}</Markdown>
          )}
        </div>
      )}

      <div className="flex justify-center pb-2">
        <button onClick={reset} className="text-xs text-muted hover:text-text-2 transition-colors">New question</button>
      </div>
    </div>
  );
}

// ── FRQ Mode ────────────────────────────────────────────────────────────────
const FRQ_PARTS_RE = /\*\*\(([a-z])\)\*\*/gi;

function FRQPractice({ subject, difficulty, onResult }: { subject: Subject; difficulty: Difficulty; onResult?: (result: ResultTag) => void }) {
  const [state, setState] = useState<FRQState>({
    problem: "", answers: {}, feedback: {}, feedbackStream: {}, loading: {},
  });
  const [generating, setGenerating] = useState(false);
  const [genStream, setGenStream] = useState("");

  const systemPrompt = buildSystemPrompt(subject, "practice", difficulty, "frq");

  const generate = useCallback(async () => {
    setGenerating(true);
    setGenStream("");
    setState({ problem: "", answers: {}, feedback: {}, feedbackStream: {}, loading: {} });
    try {
      const problem = await streamToString({
        systemPrompt,
        subjectId: subject.id,
        messages: [{ role: "user", content: "Generate one AP FRQ now." }],
      }, setGenStream);
      setState((s) => ({ ...s, problem }));
    } finally { setGenerating(false); setGenStream(""); }
  }, [systemPrompt]);

  const submitPart = useCallback(async (part: string) => {
    const answer = state.answers[part];
    if (!answer?.trim() || state.loading[part]) return;
    setState((s) => ({ ...s, loading: { ...s.loading, [part]: true }, feedbackStream: { ...s.feedbackStream, [part]: "" } }));
    try {
      const feedback = await streamToString({
        systemPrompt,
        subjectId: subject.id,
        messages: [
          { role: "user", content: `FRQ:\n\n${state.problem}` },
          { role: "assistant", content: "Here is your FRQ." },
          { role: "user", content: `My answer to part (${part}): ${answer}` },
        ],
      }, (s) => setState((prev) => ({ ...prev, feedbackStream: { ...prev.feedbackStream, [part]: s } })));
      const { result, clean } = parseResultTag(feedback);
      setState((s) => ({
        ...s,
        feedback: { ...s.feedback, [part]: clean },
        loading: { ...s.loading, [part]: false },
        feedbackStream: { ...s.feedbackStream, [part]: "" },
      }));
      if (result) onResult?.(result);
    } catch { setState((s) => ({ ...s, loading: { ...s.loading, [part]: false } })); }
  }, [state, systemPrompt, onResult]);

  // Extract part letters from problem text
  const parts = state.problem
    ? Array.from(state.problem.matchAll(FRQ_PARTS_RE), (m) => m[1]).filter(
        (v, i, a) => a.indexOf(v) === i
      )
    : [];

  if (!state.problem && !generating) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
        <div>
          <p className="text-lg font-semibold tracking-[-0.02em] text-text">{subject.name} — FRQ</p>
          <p className="text-sm text-text-2 mt-1">AP-style free response · {difficulty}</p>
        </div>
        <button onClick={generate} className="px-4 py-2 rounded-lg text-background font-semibold text-sm bg-white hover:bg-white/85 shadow-glow transition-all">
          Generate question
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-6 max-w-2xl mx-auto w-full space-y-4">
      {/* Question */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xs font-medium text-muted uppercase tracking-[0.07em]">FRQ</span>
          <span className="text-subtle">·</span>
          <span className="text-2xs text-muted">{subject.name}</span>
          <span className="text-subtle">·</span>
          <span className="text-2xs text-muted capitalize">{difficulty}</span>
        </div>
        <Markdown streaming={generating}>{state.problem || genStream || " "}</Markdown>
      </div>

      {/* Per-part response boxes */}
      {!generating && parts.length > 0 && parts.map((part) => (
        <div key={part} className="bg-surface border border-border rounded-xl p-4 space-y-3">
          <label className="text-2xs font-medium text-muted uppercase tracking-[0.07em]">Part ({part})</label>
          <textarea
            value={state.answers[part] ?? ""}
            onChange={(e) => setState((s) => ({ ...s, answers: { ...s.answers, [part]: e.target.value }, feedback: { ...s.feedback, [part]: "" } }))}
            placeholder={`Your response to part (${part})…`}
            rows={3}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text placeholder-muted outline-none focus:border-border-2 transition-colors resize-none"
          />
          <button
            onClick={() => submitPart(part)}
            disabled={!state.answers[part]?.trim() || state.loading[part]}
            className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted hover:border-white/25 hover:text-text-2 disabled:opacity-40 transition-colors"
          >
            {state.loading[part] ? "Checking…" : "Submit"}
          </button>
          {(state.feedback[part] || state.feedbackStream[part] || state.loading[part]) && (
            <div className="pt-3 border-t border-border animate-in">
              {state.loading[part] && !state.feedbackStream[part] ? (
                <div className="flex gap-1"><div className="typing-dot"/><div className="typing-dot"/><div className="typing-dot"/></div>
              ) : (
                <Markdown streaming={state.loading[part]}>{display(state.feedback[part] || state.feedbackStream[part])}</Markdown>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Fallback if no parts parsed but question is ready */}
      {!generating && parts.length === 0 && state.problem && (
        <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
          <label className="text-2xs font-medium text-muted uppercase tracking-[0.07em]">Your response</label>
          <textarea
            value={state.answers["a"] ?? ""}
            onChange={(e) => setState((s) => ({ ...s, answers: { a: e.target.value } }))}
            placeholder="Write your response here…"
            rows={5}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text placeholder-muted outline-none focus:border-border-2 transition-colors resize-none"
          />
          <button onClick={() => submitPart("a")} disabled={!state.answers["a"]?.trim() || state.loading["a"]}
            className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted hover:border-white/25 hover:text-text-2 disabled:opacity-40 transition-colors">
            {state.loading["a"] ? "Checking…" : "Submit"}
          </button>
          {(state.feedback["a"] || state.feedbackStream["a"]) && (
            <div className="pt-3 border-t border-border animate-in">
              <Markdown streaming={state.loading["a"]}>{display(state.feedback["a"] || state.feedbackStream["a"])}</Markdown>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-center pb-2">
        <button
          onClick={() => { setGenerating(false); setState({ problem: "", answers: {}, feedback: {}, feedbackStream: {}, loading: {} }); }}
          className="text-xs text-muted hover:text-text-2 transition-colors"
        >
          New question
        </button>
      </div>
    </div>
  );
}

// ── Open Practice ────────────────────────────────────────────────────────────
function OpenPractice({ subject, difficulty, onResult }: { subject: Subject; difficulty: Difficulty; onResult?: (result: ResultTag) => void }) {
  const [stage, setStage] = useState<Stage>("idle");
  const [loading, setLoading] = useState(false);
  const [loadingWhat, setLoadingWhat] = useState("");
  const [stream, setStream] = useState("");
  const [state, setState] = useState<PracticeState>({
    problem: "", hint1: "", hint2: "", hint3: "", solution: "", userAnswer: "", feedback: "",
  });

  const systemPrompt = buildSystemPrompt(subject, "practice", difficulty, "open");

  const generateProblem = useCallback(async () => {
    setLoading(true); setLoadingWhat("problem"); setStream("");
    setState({ problem: "", hint1: "", hint2: "", hint3: "", solution: "", userAnswer: "", feedback: "" });
    try {
      const problem = await streamToString({
        systemPrompt,
        subjectId: subject.id,
        messages: [{ role: "user", content: `Generate one ${difficulty} ${subject.name} practice problem. Output only the problem statement.` }],
      }, setStream);
      setState((s) => ({ ...s, problem }));
      setStage("problem");
    } catch { setStage("idle"); }
    finally { setLoading(false); setStream(""); setLoadingWhat(""); }
  }, [subject, difficulty, systemPrompt]);

  const revealHint = useCallback(async (n: 1 | 2 | 3) => {
    const key = `hint${n}` as keyof PracticeState;
    if (state[key]) { setStage(`hint${n}` as Stage); return; }
    setLoading(true); setLoadingWhat(`hint${n}`); setStream("");
    const instructions = [
      "Hint 1: Name only the key concept or theorem needed.",
      "Hint 2: Describe the solution approach and first concrete step.",
      "Hint 3: Give a near-complete outline without the final answer.",
    ];
    try {
      const hint = await streamToString({
        systemPrompt,
        subjectId: subject.id,
        messages: [
          { role: "user", content: `Problem: ${state.problem}` },
          { role: "assistant", content: "Work through it and let me know if you need a hint." },
          { role: "user", content: instructions[n - 1] },
        ],
      }, setStream);
      setState((s) => ({ ...s, [key]: hint }));
      setStage(`hint${n}` as Stage);
    } finally { setLoading(false); setStream(""); setLoadingWhat(""); }
  }, [state, systemPrompt]);

  const revealSolution = useCallback(async () => {
    if (state.solution) { setStage("solution"); return; }
    setLoading(true); setLoadingWhat("solution"); setStream("");
    try {
      const solution = await streamToString({
        systemPrompt,
        subjectId: subject.id,
        messages: [
          { role: "user", content: `Problem: ${state.problem}` },
          { role: "assistant", content: "Here is the problem." },
          { role: "user", content: "Show the complete step-by-step solution." },
        ],
      }, setStream);
      setState((s) => ({ ...s, solution }));
      setStage("solution");
    } finally { setLoading(false); setStream(""); setLoadingWhat(""); }
  }, [state, systemPrompt]);

  const checkAnswer = useCallback(async () => {
    if (!state.userAnswer.trim()) return;
    setLoading(true); setLoadingWhat("feedback"); setStream("");
    try {
      const feedback = await streamToString({
        systemPrompt,
        subjectId: subject.id,
        messages: [
          { role: "user", content: `Problem: ${state.problem}` },
          { role: "assistant", content: "What is your answer?" },
          { role: "user", content: state.userAnswer },
        ],
      }, setStream);
      const { result, clean } = parseResultTag(feedback);
      setState((s) => ({ ...s, feedback: clean }));
      if (result) onResult?.(result);
    } finally { setLoading(false); setStream(""); setLoadingWhat(""); }
  }, [state, systemPrompt, onResult]);

  if (stage === "idle") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
        <div>
          <p className="text-lg font-semibold tracking-[-0.02em] text-text">{subject.name}</p>
          <p className="text-sm text-text-2 mt-1 capitalize">{difficulty} · 3 progressive hints</p>
        </div>
        <button onClick={generateProblem} disabled={loading}
          className="px-4 py-2 rounded-lg text-background font-semibold text-sm bg-white hover:bg-white/85 disabled:opacity-50 shadow-glow transition-all">
          {loading ? "Generating…" : "Generate problem"}
        </button>
      </div>
    );
  }

  const stageNum = stage === "solution" ? 4 : parseInt(stage.replace("hint", "") || "0");

  return (
    <div className="h-full overflow-y-auto px-6 py-6 max-w-2xl mx-auto w-full space-y-4">
      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xs font-medium text-muted uppercase tracking-[0.07em]">Problem</span>
          <span className="text-subtle">·</span>
          <span className="text-2xs text-muted">{subject.name}</span>
          <span className="text-subtle">·</span>
          <span className="text-2xs text-muted capitalize">{difficulty}</span>
        </div>
        <Markdown streaming={loading && loadingWhat === "problem"}>{state.problem || stream}</Markdown>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
        <label className="text-2xs font-medium text-muted uppercase tracking-[0.07em]">Your answer</label>
        <textarea
          value={state.userAnswer}
          onChange={(e) => setState((s) => ({ ...s, userAnswer: e.target.value, feedback: "" }))}
          placeholder="Write your working here…"
          rows={3}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text placeholder-muted outline-none focus:border-border-2 transition-colors resize-none"
        />
        <button onClick={checkAnswer} disabled={!state.userAnswer.trim() || loading}
          className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted hover:border-white/25 hover:text-text-2 disabled:opacity-40 transition-colors">
          {loadingWhat === "feedback" ? "Checking…" : "Submit"}
        </button>
        {(state.feedback || (loadingWhat === "feedback" && stream)) && (
          <div className="pt-3 border-t border-border animate-in">
            <Markdown streaming={loadingWhat === "feedback" && !state.feedback}>{display(state.feedback || stream)}</Markdown>
          </div>
        )}
      </div>

      <div>
        <p className="text-2xs font-medium text-muted uppercase tracking-[0.07em] mb-2">Hints</p>
        <div className="border border-border rounded-xl divide-y divide-border overflow-hidden">
          {HINT_META.map((meta, i) => {
            const n = (i + 1) as 1 | 2 | 3;
            const hintKey = `hint${n}` as keyof PracticeState;
            const revealed = stageNum >= n;
            const isLoading = loadingWhat === `hint${n}`;
            const locked = !revealed && n > 1 && stageNum < n - 1;
            return (
              <div key={n}>
                <button
                  onClick={() => !locked && revealHint(n)}
                  disabled={locked || (loading && !isLoading)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                    revealed ? "text-text" : locked ? "text-subtle cursor-not-allowed" : "text-muted hover:text-text hover:bg-surface-2"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-2xs font-mono w-4 text-center ${revealed ? "text-text-2" : "text-subtle"}`}>{n}</span>
                    <span className="font-medium">{meta.label}</span>
                    <span className="text-muted text-xs hidden sm:inline">{meta.sub}</span>
                  </div>
                  {isLoading && <div className="w-3 h-3 border border-text-2 border-t-transparent rounded-full animate-spin" />}
                </button>
                {revealed && (
                  <div className="px-4 pb-4 pt-0 border-t border-border/60 animate-in">
                    <Markdown streaming={isLoading && !(state[hintKey] as string)}>{(state[hintKey] as string) || (isLoading ? stream : "")}</Markdown>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <button onClick={revealSolution} disabled={loading && loadingWhat !== "solution"}
          className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${stage === "solution" ? "text-text" : "text-muted hover:text-text hover:bg-surface-2"}`}>
          <div className="flex items-center gap-3">
            <svg className={`w-3.5 h-3.5 ${stage === "solution" ? "text-text-2" : "text-subtle"}`} fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 7.5L5 10.5 12 3.5"/>
            </svg>
            <span className="font-medium">Full solution</span>
          </div>
          {loadingWhat === "solution" && <div className="w-3 h-3 border border-text-2 border-t-transparent rounded-full animate-spin" />}
          {stage !== "solution" && loadingWhat !== "solution" && <span className="text-2xs text-subtle">Reveal when ready</span>}
        </button>
        {stage === "solution" && (
          <div className="px-4 pb-4 pt-0 border-t border-border/60 animate-in">
            <Markdown streaming={loadingWhat === "solution" && !state.solution}>{state.solution || stream}</Markdown>
          </div>
        )}
      </div>

      <div className="flex justify-center pb-2">
        <button onClick={() => { setStage("idle"); setState({ problem: "", hint1: "", hint2: "", hint3: "", solution: "", userAnswer: "", feedback: "" }); }}
          className="text-xs text-muted hover:text-text-2 transition-colors">New problem</button>
      </div>
    </div>
  );
}

// ── Main PracticeMode ────────────────────────────────────────────────────────
export default function PracticeMode({ subject, difficulty, onResult }: PracticeModeProps) {
  const isAP = isAPSubject(subject);
  const [qType, setQType] = useState<APQuestionType>(isAP ? "mcq" : "open");
  const [modeKey, setModeKey] = useState(0);

  const handleTypeChange = (t: APQuestionType) => { setQType(t); setModeKey((k) => k + 1); };

  if (!subject) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted">Select a subject to generate practice problems.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* AP question type selector */}
      {isAP && (
        <div className="shrink-0 border-b border-border px-6 py-2.5 flex items-center gap-1">
          {(["mcq", "frq", "open"] as APQuestionType[]).map((t) => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-100 ${
                qType === t ? "bg-surface-3 text-text" : "text-muted hover:text-text-2 hover:bg-surface-2"
              }`}
            >
              {t === "mcq" ? "MCQ" : t === "frq" ? "FRQ" : "Open"}
            </button>
          ))}
          <span className="text-2xs text-muted ml-2">
            {qType === "mcq" ? "Multiple choice · 5 options" : qType === "frq" ? "Free response · multi-part" : "Open ended · 3 hints"}
          </span>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        {qType === "mcq" && isAP ? (
          <MCQPractice key={modeKey} subject={subject} difficulty={difficulty} onResult={onResult} />
        ) : qType === "frq" && isAP ? (
          <FRQPractice key={modeKey} subject={subject} difficulty={difficulty} onResult={onResult} />
        ) : (
          <OpenPractice key={modeKey} subject={subject} difficulty={difficulty} onResult={onResult} />
        )}
      </div>
    </div>
  );
}
