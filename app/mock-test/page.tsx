"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { COMPETITION_CONFIGS } from "@/lib/problem-gen-prompts";
import type { CompetitionId } from "@/lib/problem-gen-prompts";
import Markdown from "@/components/Markdown";

type TestStatus = "setup" | "active" | "submitting" | "results";

interface TestProblem {
  position: number;
  problem: {
    id: string;
    statement: string;
    format: string;
    choices: Record<string, string> | null;
    topics: string[];
    difficulty: string;
    answer?: string;
    solution?: string;
  };
}

interface TestResults {
  score: number;
  maxScore: number;
  percentile: number;
  topicBreakdown: Record<string, { correct: number; total: number }>;
  timeBreakdown: { avg: number; slowest: number; fastest: number };
  wrongProblems: string[];
}

const OLYMPIAD_COMPETITIONS: Array<{ id: CompetitionId; label: string; desc: string }> = [
  { id: "amc8",   label: "AMC 8",   desc: "25 problems · 40 min" },
  { id: "amc10",  label: "AMC 10",  desc: "30 problems · 75 min" },
  { id: "amc12",  label: "AMC 12",  desc: "30 problems · 75 min" },
  { id: "aime",   label: "AIME",    desc: "15 problems · 3 hr" },
  { id: "usamo",  label: "USAMO",   desc: "6 problems · 2 days" },
  { id: "mathcounts", label: "MATHCOUNTS", desc: "30 problems · 40 min" },
  { id: "usaco",  label: "USACO",   desc: "3 problems · 4 hr" },
  { id: "usapho", label: "USAPhO",  desc: "25 problems · 75 min" },
  { id: "usnco",  label: "USNCO",   desc: "60 problems · 110 min" },
  { id: "usabo",  label: "USABO",   desc: "60 problems · 80 min" },
];

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MockTestPage() {
  const { data: session, status } = useSession();
  const [testStatus, setTestStatus] = useState<TestStatus>("setup");
  const [competition, setCompetition] = useState<CompetitionId>("amc10");
  const [timed, setTimed] = useState(true);
  const [testId, setTestId] = useState<string | null>(null);
  const [problems, setProblems] = useState<TestProblem[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeSecs, setTimeSecs] = useState<Record<string, number>>({});
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [problemStart, setProblemStart] = useState(Date.now());
  const [timerHidden, setTimerHidden] = useState(false);
  const [results, setResults] = useState<TestResults | null>(null);
  const [wrongProblemsData, setWrongProblemsData] = useState<TestProblem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const config = COMPETITION_CONFIGS[competition];

  // Timer
  useEffect(() => {
    if (testStatus !== "active") {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTotalElapsed((e) => e + 1);
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [testStatus]);

  // Time limit enforcement
  useEffect(() => {
    if (testStatus !== "active" || !timed || !config) return;
    if (totalElapsed >= config.timeLimitMins * 60) {
      handleSubmit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalElapsed, testStatus, timed]);

  const startTest = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/mock-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competition, timed }),
      });
      const data = await res.json() as { test?: { id: string; problems: TestProblem[] }; error?: string };
      if (!res.ok || !data.test) throw new Error(data.error ?? "Failed to start test");
      setTestId(data.test.id);
      setProblems(data.test.problems);
      setCurrent(0);
      setAnswers({});
      setTimeSecs({});
      setTotalElapsed(0);
      setProblemStart(Date.now());
      setTestStatus("active");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const goToQuestion = useCallback((idx: number) => {
    const elapsed = Math.round((Date.now() - problemStart) / 1000);
    const currentProblem = problems[current];
    if (currentProblem) {
      setTimeSecs((prev) => ({
        ...prev,
        [currentProblem.problem.id]: (prev[currentProblem.problem.id] ?? 0) + elapsed,
      }));
    }
    setCurrent(idx);
    setProblemStart(Date.now());
  }, [current, problems, problemStart]);

  const handleSubmit = useCallback(async () => {
    if (!testId) return;
    // Record time on current problem
    const elapsed = Math.round((Date.now() - problemStart) / 1000);
    const currentProblem = problems[current];
    const finalTimeSecs = currentProblem
      ? { ...timeSecs, [currentProblem.problem.id]: (timeSecs[currentProblem.problem.id] ?? 0) + elapsed }
      : timeSecs;

    setTestStatus("submitting");
    try {
      const res = await fetch(`/api/mock-tests/${testId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, timeSecs: finalTimeSecs }),
      });
      const data = await res.json() as { score?: number; maxScore?: number; percentile?: number; topicBreakdown?: Record<string, { correct: number; total: number }>; timeBreakdown?: { avg: number; slowest: number; fastest: number }; wrongProblems?: string[] };
      if (!res.ok) throw new Error("Failed to submit");

      setResults({
        score: data.score ?? 0,
        maxScore: data.maxScore ?? 0,
        percentile: data.percentile ?? 0,
        topicBreakdown: data.topicBreakdown ?? {},
        timeBreakdown: data.timeBreakdown ?? { avg: 0, slowest: 0, fastest: 0 },
        wrongProblems: data.wrongProblems ?? [],
      });

      // Load wrong problem data for debrief
      if (data.wrongProblems?.length) {
        const wrong = problems.filter((p) => data.wrongProblems!.includes(p.problem.id));
        setWrongProblemsData(wrong);
      }

      setTestStatus("results");
    } catch {
      setError("Failed to submit. Please try again.");
      setTestStatus("active");
    }
  }, [testId, answers, timeSecs, problems, current, problemStart]);

  if (status === "loading") return null;

  if (!session) {
    return (
      <div className="min-h-screen bg-background text-text flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold mb-4">Sign in to take mock tests</p>
          <Link href="/coach" className="text-sm text-muted hover:text-text underline">← Back to coach</Link>
        </div>
      </div>
    );
  }

  // Setup screen
  if (testStatus === "setup") {
    return (
      <div className="min-h-screen bg-background text-text">
        <nav className="flex items-center justify-between px-8 py-5 border-b border-border/60">
          <Link href="/coach" className="flex items-center text-sm font-semibold tracking-[-0.01em]">
            Poly<span className="ml-1 px-1.5 py-0.5 rounded-[3px] bg-accent text-background text-2xs font-bold">Teach</span>
          </Link>
          <span className="text-sm text-text-2">Mock Test</span>
        </nav>

        <div className="max-w-2xl mx-auto px-6 py-16">
          <h1 className="text-2xl font-semibold tracking-[-0.025em] mb-2">Start a mock test</h1>
          <p className="text-sm text-text-2 mb-10">Original problems matched to real competition style. No past papers — fresh every time.</p>

          {error && <p className="text-sm text-red-400 mb-6">{error}</p>}

          <div className="mb-8">
            <p className="text-xs font-medium text-accent uppercase tracking-wider mb-3">Competition</p>
            <div className="grid grid-cols-2 gap-2">
              {OLYMPIAD_COMPETITIONS.map((c) => {
                const selected = competition === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCompetition(c.id)}
                    className={`p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                      selected
                        ? "border-accent bg-accent/10 text-accent shadow-[0_0_0_1px_rgba(232,168,32,0.25)]"
                        : "border-border-2 bg-surface text-text-2 hover:border-[#484848] hover:text-text hover:bg-surface-2"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-sm font-medium">{c.label}</p>
                      {selected && <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-[3px]" />}
                    </div>
                    <p className={`text-xs mt-0.5 ${selected ? "text-accent/70" : "text-[#666]"}`}>{c.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-10">
            <p className="text-xs font-medium text-accent uppercase tracking-wider mb-3">Timer</p>
            <div className="flex gap-2">
              {[true, false].map((t) => (
                <button
                  key={String(t)}
                  onClick={() => setTimed(t)}
                  className={`px-4 py-2 rounded-lg border text-sm transition-all duration-150 cursor-pointer ${
                    timed === t
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border-2 text-text-2 hover:border-[#484848] hover:text-text hover:bg-surface-2"
                  }`}
                >
                  {t ? `Timed (${config?.timeLimitMins} min)` : "Untimed"}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startTest}
            disabled={loading}
            className="px-6 py-3 rounded-lg text-sm font-semibold bg-accent text-background hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150"
          >
            {loading ? "Selecting problems…" : "Start test"}
          </button>
        </div>
      </div>
    );
  }

  // Results screen
  if (testStatus === "results" && results) {
    const sortedTopics = Object.entries(results.topicBreakdown).sort(
      ([, a], [, b]) => a.correct / a.total - b.correct / b.total
    );

    return (
      <div className="min-h-screen bg-background text-text">
        <nav className="flex items-center justify-between px-8 py-5 border-b border-border/60">
          <Link href="/coach" className="flex items-center text-sm font-semibold tracking-[-0.01em]">
            Poly<span className="ml-1 px-1.5 py-0.5 rounded-[3px] bg-accent text-background text-2xs font-bold">Teach</span>
          </Link>
          <span className="text-sm text-text-2">{competition.toUpperCase()} Results</span>
        </nav>

        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="p-6 rounded-xl border border-border bg-surface text-center">
              <p className="text-3xl font-semibold tracking-[-0.03em]">{results.score}</p>
              <p className="text-xs text-text-2 mt-1">of {results.maxScore} pts</p>
            </div>
            <div className="p-6 rounded-xl border border-border bg-surface text-center">
              <p className="text-3xl font-semibold tracking-[-0.03em]">~{results.percentile}th</p>
              <p className="text-xs text-text-2 mt-1">percentile estimate</p>
            </div>
            <div className="p-6 rounded-xl border border-border bg-surface text-center">
              <p className="text-3xl font-semibold tracking-[-0.03em]">{formatTime(totalElapsed)}</p>
              <p className="text-xs text-text-2 mt-1">total time</p>
            </div>
          </div>

          {sortedTopics.length > 0 && (
            <div className="mb-10">
              <h2 className="text-sm font-semibold mb-4">Topic breakdown</h2>
              <div className="space-y-2">
                {sortedTopics.map(([topic, stats]) => {
                  const pct = Math.round((stats.correct / stats.total) * 100);
                  return (
                    <div key={topic} className="flex items-center gap-3">
                      <span className="text-sm text-text-2 w-40 truncate capitalize">{topic.replace(/_/g, " ")}</span>
                      <div className="flex-1 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent/60"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-text-2 w-16 text-right">{stats.correct}/{stats.total}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {wrongProblemsData.length > 0 && (
            <div className="mb-10">
              <h2 className="text-sm font-semibold mb-2">Problems to debrief</h2>
              <p className="text-sm text-text-2 mb-4">Start a Socratic session on any problem you got wrong.</p>
              <div className="space-y-2">
                {wrongProblemsData.map((p, i) => (
                  <div key={p.problem.id} className="p-4 rounded-xl border border-border bg-surface">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm text-text-2 line-clamp-2 flex-1">
                        <span className="text-[#666] mr-2">#{i + 1}</span>
                        {p.problem.statement.slice(0, 120)}…
                      </p>
                      <Link
                        href={`/coach?debrief=${testId}&problem=${p.problem.id}&subject=${competition}`}
                        className="shrink-0 px-3 py-1.5 rounded-lg border border-border-2 text-xs text-text-2 hover:border-[#484848] hover:text-text transition-colors"
                      >
                        Debrief →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => { setTestStatus("setup"); setResults(null); }}
              className="px-5 py-2.5 rounded-lg text-sm font-medium border border-border-2 text-text-2 hover:border-[#484848] hover:text-text transition-colors"
            >
              Take another test
            </button>
            <Link
              href="/coach"
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-text-2 hover:text-text transition-colors"
            >
              Back to coach
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active test screen
  const currentProblem = problems[current];
  const remainingSecs = timed && config ? config.timeLimitMins * 60 - totalElapsed : null;

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      {/* Header */}
      <div className="h-11 shrink-0 border-b border-border flex items-center justify-between px-5">
        <span className="text-sm font-medium">{competition.toUpperCase()} Mock Test</span>
        <div className="flex items-center gap-4">
          {timed && remainingSecs !== null && (
            <div className="flex items-center gap-2">
              {!timerHidden && (
                <span className={`text-sm font-mono ${remainingSecs < 300 ? "text-red-400" : "text-muted"}`}>
                  {formatTime(Math.max(0, remainingSecs))}
                </span>
              )}
              <button
                onClick={() => setTimerHidden((h) => !h)}
                className="text-xs text-text-2 hover:text-text transition-colors"
              >
                {timerHidden ? "show" : "hide"}
              </button>
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={testStatus === "submitting"}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent text-background hover:bg-accent-hover disabled:bg-disabled disabled:text-disabled-text transition-all"
          >
            {testStatus === "submitting" ? "Submitting…" : "Submit test"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Problem list sidebar */}
        <aside className="w-14 shrink-0 border-r border-border overflow-y-auto py-2 flex flex-col items-center gap-1">
          {problems.map((p, i) => {
            const answered = !!answers[p.problem.id];
            return (
              <button
                key={p.problem.id}
                onClick={() => goToQuestion(i)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-all duration-100 ${
                  i === current
                    ? "bg-accent text-background"
                    : answered
                    ? "bg-surface-2 border border-border-2 text-text-2"
                    : "text-muted hover:text-text-2 hover:bg-surface-2"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </aside>

        {/* Problem content */}
        {currentProblem && (
          <main className="flex-1 overflow-y-auto px-8 py-8 max-w-3xl">
            <div className="mb-6 flex items-center gap-2">
              <span className="text-xs text-text-2">Problem {current + 1} of {problems.length}</span>
              <span className="text-border-3">·</span>
              <span className="text-xs text-text-2 capitalize">{currentProblem.problem.difficulty}</span>
              {currentProblem.problem.topics.slice(0, 2).map((t) => (
                <span key={t} className="text-xs text-text-2 px-1.5 py-0.5 rounded border border-border-2 capitalize">
                  {t.replace(/_/g, " ")}
                </span>
              ))}
            </div>

            <div className="prose prose-invert max-w-none mb-8">
              <Markdown>{currentProblem.problem.statement}</Markdown>
            </div>

            {/* Answer input */}
            {currentProblem.problem.format === "mcq" && currentProblem.problem.choices && (
              <div className="space-y-2">
                {Object.entries(currentProblem.problem.choices).map(([letter, text]) => (
                  <button
                    key={letter}
                    onClick={() => setAnswers((a) => ({ ...a, [currentProblem.problem.id]: letter }))}
                    className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                      answers[currentProblem.problem.id] === letter
                        ? "border-accent bg-accent/10 text-accent shadow-[0_0_0_1px_rgba(232,168,32,0.25)]"
                        : "border-border-2 bg-surface text-text-2 hover:border-[#484848] hover:text-text hover:bg-surface-2"
                    }`}
                  >
                    <span className="text-sm font-semibold shrink-0 w-5">{letter}</span>
                    <span className="text-sm leading-relaxed">{text}</span>
                  </button>
                ))}
              </div>
            )}

            {(currentProblem.problem.format === "integer" || currentProblem.problem.format === "short_answer") && (
              <div>
                <label className="text-xs text-text-2 mb-2 block">
                  {currentProblem.problem.format === "integer" ? "Enter your answer (000–999):" : "Your answer:"}
                </label>
                <input
                  type={currentProblem.problem.format === "integer" ? "number" : "text"}
                  value={answers[currentProblem.problem.id] ?? ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [currentProblem.problem.id]: e.target.value }))}
                  placeholder={currentProblem.problem.format === "integer" ? "000" : "Answer…"}
                  className="w-40 bg-surface border border-border-2 rounded-lg px-4 py-2.5 text-sm text-text outline-none focus:border-accent transition-colors"
                />
              </div>
            )}

            {currentProblem.problem.format === "proof" && (
              <div>
                <label className="text-xs text-text-2 mb-2 block">Your proof / solution:</label>
                <textarea
                  value={answers[currentProblem.problem.id] ?? ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [currentProblem.problem.id]: e.target.value }))}
                  placeholder="Write your proof here…"
                  rows={10}
                  className="w-full bg-surface border border-border-2 rounded-lg px-4 py-3 text-sm text-text outline-none focus:border-accent transition-colors resize-y font-mono"
                />
              </div>
            )}

            {currentProblem.problem.format === "code" && (
              <div>
                <label className="text-xs text-text-2 mb-2 block">Your solution (Python or C++):</label>
                <textarea
                  value={answers[currentProblem.problem.id] ?? ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [currentProblem.problem.id]: e.target.value }))}
                  placeholder="# Write your solution here…"
                  rows={14}
                  className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-xs text-text outline-none focus:border-accent transition-colors resize-y font-mono"
                />
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <button
                onClick={() => current > 0 && goToQuestion(current - 1)}
                disabled={current === 0}
                className="text-sm text-text-2 hover:text-text disabled:opacity-30 transition-colors"
              >
                ← Previous
              </button>
              <button
                onClick={() => current < problems.length - 1 && goToQuestion(current + 1)}
                disabled={current === problems.length - 1}
                className="text-sm text-text-2 hover:text-text disabled:opacity-30 transition-colors"
              >
                Next →
              </button>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
