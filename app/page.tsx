"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Syne } from "next/font/google";

const syne = Syne({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], display: "swap" });
import LandingDemo from "@/components/LandingDemo";
import Reveal from "@/components/Reveal";
import Faq from "@/components/Faq";
import FloatingSymbols from "@/components/FloatingSymbols";
import { TEAM_MIN_SEATS, TEAM_SEAT_PRICE, PRO_PRICE } from "@/lib/billing";

// ── Data ────────────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote: "I qualified for AIME this year after two years of trying. The difference was having to derive every answer myself instead of watching solutions.",
    name: "Marcus T.",
    role: "AMC 12 → AIME qualifier",
    initials: "MT",
  },
  {
    quote: "I went from barely knowing what USACO was to a Silver finish in one prep season. The Socratic sessions on graph algorithms were brutal — but they stuck.",
    name: "Priya K.",
    role: "USACO Silver",
    initials: "PK",
  },
  {
    quote: "My F=ma score jumped 18 points. Having an AI that refuses to give you the answer is annoying at first, then it becomes the only thing that works.",
    name: "Daniel R.",
    role: "USAPhO semifinalist",
    initials: "DR",
  },
];

const STATS = [
  { stat: "50%", desc: "more material retained when you actively recall vs. re-reading.", source: "Karpicke & Roediger, Science (2006)" },
  { stat: "98th pct", desc: "where the average tutored student lands relative to lecture-taught peers.", source: "Bloom, Educational Researcher (1984)" },
  { stat: "55%", desc: "fewer STEM failures when taught with question-driven active methods.", source: "Freeman et al., PNAS (2014)" },
];

const OLYMPIAD_MARQUEE = [
  "AMC 8", "AMC 10", "AMC 12", "AIME", "USAMO", "MATHCOUNTS",
  "USACO", "ACSL", "F=ma", "USNCO", "USABO", "Science Olympiad", "Science Bowl",
];

const EASE = [0.16, 1, 0.3, 1] as const;

// ── Sub-components ───────────────────────────────────────────────────────────

function AppWindow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 40px 100px rgba(0,0,0,0.85), 0 0 100px rgba(232,168,32,0.07)",
      }}
    >
      <div className="flex items-center gap-2 px-4 py-3 bg-[#111] border-b border-white/[0.06]">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
          <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-6 py-1 rounded-[5px] bg-white/[0.04] border border-white/[0.07] text-[11px] text-white/30 font-mono">
            polyteach.app
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

function ChatPreview() {
  return (
    <div className="space-y-3 p-4 pt-2">
      <div className="flex justify-end">
        <div className="px-3 py-2 rounded-xl rounded-br-sm bg-surface-2 border border-border-2 text-xs text-text max-w-[85%] leading-relaxed">
          How do I count arrangements of AABBCC?
        </div>
      </div>
      <div className="flex gap-2">
        <div className="w-4 h-4 rounded-md bg-accent flex items-center justify-center shrink-0 mt-0.5">
          <svg width="7" height="7" viewBox="0 0 10 10" fill="none" stroke="black" strokeWidth="2.2"><path d="M1 5.5L3.5 8 9 2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div className="text-xs text-text-2 leading-relaxed">If all 6 letters were distinct, how many arrangements would there be?</div>
      </div>
      <div className="flex justify-end">
        <div className="px-3 py-2 rounded-xl rounded-br-sm bg-surface-2 border border-border-2 text-xs text-text max-w-[85%]">6! = 720</div>
      </div>
      <div className="flex gap-2">
        <div className="w-4 h-4 rounded-md bg-accent flex items-center justify-center shrink-0 mt-0.5">
          <svg width="7" height="7" viewBox="0 0 10 10" fill="none" stroke="black" strokeWidth="2.2"><path d="M1 5.5L3.5 8 9 2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div className="text-xs text-text-2 leading-relaxed">Good. Now the two A's are identical — how does that affect the count?</div>
      </div>
    </div>
  );
}

function DiagnosticPreview() {
  const bars = [
    { topic: "Algebra", pct: 82, color: "bg-green-500/60" },
    { topic: "Combinatorics", pct: 64, color: "bg-accent/60" },
    { topic: "Number Theory", pct: 41, color: "bg-yellow-500/60" },
    { topic: "Geometry", pct: 28, color: "bg-red-500/60" },
  ];
  return (
    <div className="p-4 pt-2 space-y-2.5">
      <p className="text-2xs text-accent font-medium uppercase tracking-wider mb-3">Level assessment</p>
      {bars.map(({ topic, pct, color }) => (
        <div key={topic} className="flex items-center gap-2.5">
          <span className="text-2xs text-text-2 w-[88px] shrink-0">{topic}</span>
          <div className="flex-1 h-1.5 bg-surface-2 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-2xs text-text-2 w-6 text-right">{pct}%</span>
        </div>
      ))}
    </div>
  );
}

function ProblemPreview() {
  return (
    <div className="p-4 pt-2">
      <p className="text-2xs text-accent font-medium uppercase tracking-wider mb-3">AMC 12 · Problem 14</p>
      <p className="text-xs text-text leading-relaxed mb-4">
        How many positive integers n ≤ 100 satisfy n² − n + 1 ≡ 0 (mod 7)?
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {["A) 13", "B) 14", "C) 15", "D) 16"].map((c) => (
          <div key={c} className="px-2 py-1.5 rounded-lg border border-border-2 text-2xs text-text-2 text-center">{c}</div>
        ))}
      </div>
    </div>
  );
}

function CalendarPreview() {
  return (
    <div className="p-4 pt-2">
      <p className="text-2xs text-accent font-medium uppercase tracking-wider mb-3">AMC 12 prep · 44 days left</p>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["M","T","W","T","F","S","S"].map((d, i) => (
          <div key={i} className="text-center text-2xs text-[#555]">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 28 }).map((_, i) => (
          <div
            key={i}
            className={`h-5 rounded-sm ${
              i < 16 ? "bg-accent/30" :
              i === 16 ? "bg-accent ring-1 ring-accent/60" :
              "bg-surface-2"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ── Interactive Mock Test demo ───────────────────────────────────────────────

const MOCK_QUESTIONS = [
  {
    q: "How many positive integers n ≤ 100 satisfy n² − n + 1 ≡ 0 (mod 7)?",
    choices: ["A) 10", "B) 14", "C) 15", "D) 28", "E) 29"],
    correct: "B",
    explanation: "n² − n + 1 ≡ 0 (mod 7) means n² ≡ n − 1 (mod 7). Testing residues 0–6 shows n ≡ 3 or 5 (mod 7) work. In 1–100 there are 14 such values each, giving 14.",
  },
  {
    q: "What is the area of the region in the coordinate plane defined by |x| + |y| + |x + y| ≤ 2?",
    choices: ["A) 2", "B) 2√2", "C) 4", "D) 3√2", "E) 6"],
    correct: "C",
    explanation: "Breaking into cases by sign gives a hexagon. Its area works out to 4.",
  },
  {
    q: "If log₂(x) + log₄(x) = 6, what is x?",
    choices: ["A) 8", "B) 12", "C) 16", "D) 24", "E) 32"],
    correct: "C",
    explanation: "Convert: log₂x + log₂x/2 = 6 → (3/2)log₂x = 6 → log₂x = 4 → x = 16.",
  },
  {
    q: "How many ordered pairs (a, b) of positive integers satisfy a² + b² = 2024?",
    choices: ["A) 0", "B) 2", "C) 4", "D) 6", "E) 8"],
    correct: "A",
    explanation: "2024 ≡ 0 (mod 4). For a² + b² ≡ 0 (mod 4), both a and b must be even. But then a = 2a′, b = 2b′ → a′² + b′² = 506 = 2 × 11 × 23. 506 ≡ 2 (mod 4), which is impossible since squares are 0 or 1 mod 4. So 0 solutions.",
  },
];

const TIMER_START = 75 * 60;

function InteractiveMockTest() {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [time, setTime] = useState(TIMER_START - 7 * 60 - 14); // simulate mid-test
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTime((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const mins = Math.floor(time / 60).toString().padStart(2, "0");
  const secs = (time % 60).toString().padStart(2, "0");
  const q = MOCK_QUESTIONS[qIdx];
  const isCorrect = selected === q.correct;

  const handleSelect = (choice: string) => {
    if (selected) return;
    setSelected(choice);
    setRevealed(true);
    setScore((s) => ({
      correct: s.correct + (choice === q.correct ? 1 : 0),
      total: s.total + 1,
    }));
  };

  const next = () => {
    setQIdx((i) => (i + 1) % MOCK_QUESTIONS.length);
    setSelected(null);
    setRevealed(false);
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0d0d0d] overflow-hidden" style={{ boxShadow: "0 8px 60px rgba(0,0,0,0.6)" }}>
      {/* Test header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] bg-surface">
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">AMC 10</span>
          <span className="text-xs text-[#555]">·</span>
          <span className="text-xs text-text-2">Question {qIdx + 8} of 30</span>
          <div className="flex gap-1 ml-2">
            {MOCK_QUESTIONS.map((_, i) => (
              <div key={i} className={`w-4 h-1 rounded-full transition-colors ${i < score.total ? (score.correct > i ? "bg-accent/60" : "bg-red-500/40") : "bg-white/[0.08]"}`} />
            ))}
          </div>
        </div>
        <div className={`flex items-center gap-2 text-sm font-mono font-semibold tabular-nums ${time < 300 ? "text-red-400" : "text-text"}`}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="6"/><path d="M7 4v3.5l2 1.5" strokeLinecap="round"/></svg>
          {mins}:{secs}
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* Question + choices */}
        <div>
          <p className="text-sm text-text leading-relaxed mb-8 text-base">{q.q}</p>
          <div className="space-y-2.5">
            {q.choices.map((c) => {
              const letter = c[0];
              const isSelected = selected === letter;
              const isRight = letter === q.correct;
              let style = "border-border-2 bg-surface text-text-2 hover:border-[#484848] hover:text-text";
              if (selected) {
                if (isSelected && isRight) style = "border-green-500/60 bg-green-500/10 text-green-400";
                else if (isSelected && !isRight) style = "border-red-500/50 bg-red-500/10 text-red-400";
                else if (!isSelected && isRight) style = "border-green-500/40 bg-green-500/[0.06] text-green-500/70";
                else style = "border-border bg-surface text-[#444] opacity-50";
              }
              return (
                <button
                  key={c}
                  onClick={() => handleSelect(letter)}
                  disabled={!!selected}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all duration-150 ${style}`}
                >
                  <span className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-mono shrink-0 ${isSelected ? "border-current" : "border-border-2"}`}>{letter}</span>
                  <span>{c.slice(3)}</span>
                  {selected && isRight && <svg className="ml-auto shrink-0 text-green-400" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 7l3.5 3.5L12 3" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </button>
              );
            })}
          </div>

          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={`mt-5 p-4 rounded-xl border text-sm leading-relaxed ${isCorrect ? "border-green-500/30 bg-green-500/[0.07] text-green-300/80" : "border-red-500/30 bg-red-500/[0.07] text-red-300/80"}`}
            >
              <p className={`text-xs font-semibold uppercase tracking-wider mb-1.5 ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                {isCorrect ? "Correct" : `Incorrect — Answer is ${q.correct}`}
              </p>
              {q.explanation}
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="p-5 rounded-xl border border-white/[0.07] bg-surface">
            <p className="text-2xs text-text-2 uppercase tracking-wider mb-4">Score</p>
            <div className="text-4xl font-semibold tracking-[-0.04em] mb-1">
              {score.correct}<span className="text-xl text-text-2 font-normal">/{score.total || "–"}</span>
            </div>
            <p className="text-2xs text-text-2">questions correct</p>
            {score.total > 0 && (
              <div className="mt-4 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${(score.correct / score.total) * 100}%` }} />
              </div>
            )}
          </div>

          <div className="p-5 rounded-xl border border-white/[0.07] bg-surface">
            <p className="text-2xs text-text-2 uppercase tracking-wider mb-3">Instructions</p>
            <p className="text-xs text-text-2 leading-relaxed">Select the best answer. No penalty for guessing. Each correct answer is worth 6 points.</p>
          </div>

          {revealed && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              onClick={next}
              className="w-full py-3 rounded-xl bg-accent text-background text-sm font-semibold hover:bg-accent-hover transition-colors"
            >
              Next question →
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Interactive Diagnostic demo ───────────────────────────────────────────────

const DIAG_SEQUENCE = [
  { difficulty: "Intermediate", topic: "Algebra", q: "If 3x + 7 = 22, what is 2x?", choices: ["A) 5", "B) 8", "C) 10", "D) 14"], correct: "C", level: 45 },
  { difficulty: "Advanced", topic: "Number Theory", q: "What is the remainder when 7¹⁰⁰ is divided by 8?", choices: ["A) 1", "B) 3", "C) 5", "D) 7"], correct: "A", level: 62 },
  { difficulty: "Olympiad", topic: "Combinatorics", q: "In how many ways can 5 people be seated at a round table if two specific people must not be adjacent?", choices: ["A) 12", "B) 18", "C) 24", "D) 36"], correct: "A", level: 78 },
  { difficulty: "Olympiad", topic: "Geometry", q: "A circle of radius 2 is tangent to both axes and to a line y = x + k. What is k?", choices: ["A) 2√2 − 2", "B) 2 − 2√2", "C) 2√2", "D) 2 + 2√2"], correct: "D", level: 85 },
];

const SKILL_INITIAL = { Algebra: 0, "Number Theory": 0, Geometry: 0, Combinatorics: 0 };

function InteractiveDiagnostic() {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [adapting, setAdapting] = useState(false);
  const [done, setDone] = useState(false);
  const [skills, setSkills] = useState<Record<string, number>>(SKILL_INITIAL);

  const dq = DIAG_SEQUENCE[qIdx];

  const handleSelect = (letter: string) => {
    if (selected || adapting) return;
    const correct = letter === dq.correct;
    setSelected(letter);

    setTimeout(() => {
      setSkills((s) => ({ ...s, [dq.topic]: Math.min(100, s[dq.topic] + (correct ? dq.level : Math.floor(dq.level * 0.4))) }));
      setAdapting(true);
    }, 700);

    setTimeout(() => {
      setAdapting(false);
      if (qIdx + 1 >= DIAG_SEQUENCE.length) {
        setDone(true);
      } else {
        setQIdx((i) => i + 1);
        setSelected(null);
      }
    }, 2200);
  };

  const reset = () => {
    setQIdx(0);
    setSelected(null);
    setAdapting(false);
    setDone(false);
    setSkills(SKILL_INITIAL);
  };

  const DIFF_COLOR: Record<string, string> = {
    Intermediate: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
    Advanced: "text-orange-400 border-orange-400/30 bg-orange-400/10",
    Olympiad: "text-accent border-accent/30 bg-accent/10",
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0d0d0d] overflow-hidden" style={{ boxShadow: "0 8px 60px rgba(0,0,0,0.6)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] bg-surface">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">AMC 10 Diagnostic</span>
          <span className="text-xs text-[#555]">·</span>
          {!done && <span className="text-xs text-text-2">Question {qIdx + 1} of {DIAG_SEQUENCE.length}</span>}
          {done && <span className="text-xs text-green-400">Assessment complete</span>}
        </div>
        {!done && (
          <span className={`text-2xs font-medium px-2.5 py-1 rounded-full border ${DIFF_COLOR[dq.difficulty] ?? ""}`}>
            {dq.difficulty}
          </span>
        )}
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
        {/* Left: question */}
        <div>
          {!done ? (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={qIdx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center gap-2 mb-5">
                    <span className="text-2xs font-medium text-text-2 px-2 py-0.5 rounded-md border border-border-2 bg-surface">{dq.topic}</span>
                    <span className="text-2xs text-[#555]">↑ Difficulty adjusting based on your answers</span>
                  </div>
                  <p className="text-base text-text leading-relaxed mb-7">{dq.q}</p>
                  <div className="space-y-2.5">
                    {dq.choices.map((c) => {
                      const letter = c[0];
                      const isSelected = selected === letter;
                      const isRight = letter === dq.correct;
                      let style = "border-border-2 bg-surface text-text-2 hover:border-[#484848] hover:text-text cursor-pointer";
                      if (selected) {
                        if (isSelected && isRight) style = "border-green-500/60 bg-green-500/10 text-green-400";
                        else if (isSelected && !isRight) style = "border-red-500/50 bg-red-500/10 text-red-400";
                        else if (isRight) style = "border-green-500/40 text-green-500/60";
                        else style = "border-border bg-surface text-[#444] opacity-40";
                      }
                      return (
                        <button key={c} onClick={() => handleSelect(letter)} disabled={!!selected}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all duration-150 ${style}`}>
                          <span className="w-6 h-6 rounded-lg border border-current/30 flex items-center justify-center text-xs font-mono shrink-0">{letter}</span>
                          <span>{c.slice(3)}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Adapting indicator */}
              <AnimatePresence>
                {adapting && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-5 flex items-center gap-3 px-4 py-3 rounded-xl border border-accent/30 bg-accent/[0.07]"
                  >
                    <div className="w-3 h-3 border border-accent border-t-transparent rounded-full animate-spin shrink-0" />
                    <span className="text-xs text-accent">Adapting difficulty — loading next question…</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
              <p className="text-xs font-medium text-accent uppercase tracking-wider mb-4">Assessment complete</p>
              <h3 className="text-2xl font-semibold tracking-tight mb-3">Your level: <span className="text-accent">Advanced</span></h3>
              <p className="text-sm text-text-2 leading-relaxed mb-6 max-w-sm">Strong in Algebra and Number Theory. Focus on Geometry proofs and advanced Combinatorics to reach Olympiad level.</p>
              <button onClick={reset} className="px-4 py-2.5 rounded-xl border border-white/[0.1] text-sm text-text-2 hover:text-text hover:border-white/20 transition-colors">
                Restart diagnostic
              </button>
            </motion.div>
          )}
        </div>

        {/* Right: live skill bars */}
        <div className="p-5 rounded-xl border border-white/[0.07] bg-surface self-start">
          <p className="text-2xs text-text-2 uppercase tracking-wider mb-5">Live assessment</p>
          <div className="space-y-5">
            {Object.entries(skills).map(([topic, pct]) => (
              <div key={topic}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-text-2">{topic}</span>
                  <span className="text-xs font-medium text-text tabular-nums">{pct > 0 ? `${pct}%` : "—"}</span>
                </div>
                <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            ))}
          </div>

          {!done && qIdx > 0 && (
            <div className="mt-6 pt-5 border-t border-border">
              <p className="text-2xs text-text-2 mb-2 uppercase tracking-wider">Estimated level</p>
              <p className="text-sm font-semibold text-text">{DIAG_SEQUENCE[qIdx - 1]?.difficulty ?? "—"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Horizontal sticky-scroll feature section ─────────────────────────────────


// ── Main page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [accountCount, setAccountCount] = useState<number | null>(null);
  const [seats, setSeats] = useState(TEAM_MIN_SEATS);
  const [checkoutLoading, setCheckoutLoading] = useState<"pro" | "team" | null>(null);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setAccountCount(d.totalAccounts))
      .catch(() => {});
  }, []);

  const subscribe = async (kind: "pro" | "team") => {
    setCheckoutError("");
    setCheckoutLoading(kind);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(kind === "team" ? { kind, seats } : { kind }),
      });
      const data: { error?: string; url?: string } = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Server returned ${res.status}`);
      if (!data.url) throw new Error("No checkout URL returned");
      window.location.href = data.url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Something went wrong");
      setCheckoutLoading(null);
    }
  };

  return (
    <div className={`${syne.className} min-h-screen bg-background text-text overflow-x-hidden`}>
      {/* Static dot grid */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <FloatingSymbols />

      {/* ── Nav ── */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-5 border-b border-white/[0.06] backdrop-blur-md bg-background/80">
        <span className="flex items-center text-sm font-bold tracking-tight">
          <span className="text-text">Poly</span><span className="text-accent">Teach</span>
        </span>
        <div className="flex items-center gap-6">
          <Link href="#pricing" className="text-sm text-text-2 hover:text-text transition-colors duration-150">Pricing</Link>
          <Link href="/coach" className="text-sm font-semibold px-4 py-2 rounded-lg bg-accent text-background hover:bg-accent-hover transition-all duration-150">
            Open app →
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-28 pb-0">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
        </div>

        {/* Social proof */}
        {accountCount !== null && (
          <motion.p
            className="mb-7 text-xs text-text-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            Joined by {accountCount.toLocaleString()}+ competitors
          </motion.p>
        )}

        {/* Headline — deliberately tighter */}
        <motion.h1
          className="text-[clamp(28px,3.8vw,52px)] font-semibold tracking-[-0.03em] leading-[1.08] max-w-2xl text-white"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
        >
          YOUR COACH THAT
          <br />
          <span className="text-accent">THINKS LIKE YOUR COMPETITOR</span>
        </motion.h1>

        <motion.p
          className="mt-5 text-base text-text-2 leading-relaxed max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.18 }}
        >
          Socratic AI coaching for AMC · AIME · USAMO · USACO · USAPhO · USNCO · USABO · Science Olympiad
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3 mt-9"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.28 }}
        >
          <Link
            href="/coach"
            className="px-6 py-3 rounded-xl text-sm font-semibold bg-accent text-background hover:bg-accent-hover transition-all duration-150 shadow-[0_0_24px_rgba(232,168,32,0.25)]"
          >
            Start training free
          </Link>
          <Link
            href="#demo"
            className="px-6 py-3 rounded-xl text-sm font-medium border border-white/10 text-text-2 hover:border-white/20 hover:text-text transition-all duration-150"
          >
            See it in action ↓
          </Link>
        </motion.div>

        {/* Hero app screenshot */}
        <motion.div
          className="relative mt-16 w-full max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 48, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.42 }}
        >
          <AppWindow>
            <div className="p-6 bg-[#0d0d0d]">
              <LandingDemo />
            </div>
          </AppWindow>
        </motion.div>
      </section>

      {/* ── Competition marquee ── */}
      <div className="relative z-10 overflow-hidden border-y border-white/[0.06] py-4 mt-4">
        <div className="flex gap-3 marquee-track">
          {[...OLYMPIAD_MARQUEE, ...OLYMPIAD_MARQUEE].map((s, i) => (
            <span key={i} className="shrink-0 px-3 py-1 rounded-md border border-border-2 bg-surface text-xs text-text-2 whitespace-nowrap">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* ── Feature bento grid ── */}
      <section className="relative z-10 px-8 pb-32">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <p className="text-xs font-medium text-accent uppercase tracking-[0.12em] mb-4">What you get</p>
              <h2 className="text-[clamp(22px,3vw,38px)] font-semibold tracking-[-0.03em]">Built for students serious<br/>about competitive academics</h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-12 gap-4">
            {/* Coaching — large */}
            <Reveal className="col-span-12 md:col-span-7" y={32} delay={0.05}>
              <div className="h-full rounded-2xl border border-white/[0.08] bg-surface overflow-hidden hover:border-white/[0.14] transition-colors duration-300" style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.4)" }}>
                <div className="p-6 pb-2">
                  <span className="text-2xs font-medium text-accent uppercase tracking-wider">Coach mode</span>
                  <h3 className="text-lg font-semibold tracking-tight mt-2 mb-1">Socratic coaching</h3>
                  <p className="text-sm text-text-2 leading-relaxed max-w-xs">Never hands you the answer. Asks the exact question that unblocks your thinking — at any hour.</p>
                </div>
                <div className="mx-4 mb-4 mt-4 rounded-xl border border-border-2 bg-[#0d0d0d] overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-surface-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span className="text-2xs text-text-2">AMC 12 · Counting &amp; Probability</span>
                  </div>
                  <ChatPreview />
                </div>
              </div>
            </Reveal>

            {/* Problems — small */}
            <Reveal className="col-span-12 md:col-span-5" y={32} delay={0.12}>
              <div className="h-full rounded-2xl border border-white/[0.08] bg-surface overflow-hidden hover:border-white/[0.14] transition-colors duration-300" style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.4)" }}>
                <div className="p-6 pb-2">
                  <span className="text-2xs font-medium text-accent uppercase tracking-wider">Practice mode</span>
                  <h3 className="text-lg font-semibold tracking-tight mt-2 mb-1">Competition-caliber problems</h3>
                  <p className="text-sm text-text-2 leading-relaxed">Problems matched to real contest difficulty — not generic textbook exercises.</p>
                </div>
                <div className="mx-4 mb-4 mt-4 rounded-xl border border-border-2 bg-[#0d0d0d]">
                  <ProblemPreview />
                </div>
              </div>
            </Reveal>

            {/* Interactive Mock Test — full width */}
            <Reveal className="col-span-12" y={32} delay={0.16}>
              <div className="rounded-2xl border border-white/[0.08] bg-surface overflow-hidden" style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.4)" }}>
                <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
                  <span className="text-2xs font-medium text-accent uppercase tracking-wider">Mock test</span>
                  <h3 className="text-lg font-semibold tracking-tight mt-2 mb-1">Full AMC practice, built in.</h3>
                  <p className="text-sm text-text-2 leading-relaxed max-w-xl">Timed, scored, and instantly debriefed — just like the real exam. Try a live question below.</p>
                </div>
                <div className="p-6">
                  <InteractiveMockTest />
                </div>
              </div>
            </Reveal>

            {/* Interactive Diagnostic — full width */}
            <Reveal className="col-span-12" y={32} delay={0.2}>
              <div className="rounded-2xl border border-white/[0.08] bg-surface overflow-hidden" style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.4)" }}>
                <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
                  <span className="text-2xs font-medium text-accent uppercase tracking-wider">Diagnostic assessment</span>
                  <h3 className="text-lg font-semibold tracking-tight mt-2 mb-1">Knows exactly where you stand.</h3>
                  <p className="text-sm text-text-2 leading-relaxed max-w-xl">Answer a few questions and watch the system pinpoint your strengths and gaps in real time.</p>
                </div>
                <div className="p-6">
                  <InteractiveDiagnostic />
                </div>
              </div>
            </Reveal>

            {/* Diagnostic — small */}
            <Reveal className="col-span-12 md:col-span-5" y={32} delay={0.24}>
              <div className="h-full rounded-2xl border border-white/[0.08] bg-surface overflow-hidden hover:border-white/[0.14] transition-colors duration-300" style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.4)" }}>
                <div className="p-6 pb-2">
                  <span className="text-2xs font-medium text-accent uppercase tracking-wider">Diagnose mode</span>
                  <h3 className="text-lg font-semibold tracking-tight mt-2 mb-1">Adaptive diagnostic</h3>
                  <p className="text-sm text-text-2 leading-relaxed">10 questions that map your knowledge ceiling concept-by-concept and generate a study plan.</p>
                </div>
                <div className="mx-4 mb-4 mt-4 rounded-xl border border-border-2 bg-[#0d0d0d]">
                  <DiagnosticPreview />
                </div>
              </div>
            </Reveal>

            {/* Prep campaign — large */}
            <Reveal className="col-span-12 md:col-span-7" y={32} delay={0.3}>
              <div className="h-full rounded-2xl border border-white/[0.08] bg-surface overflow-hidden hover:border-white/[0.14] transition-colors duration-300" style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.4)" }}>
                <div className="p-6 pb-2">
                  <span className="text-2xs font-medium text-accent uppercase tracking-wider">Prep campaign</span>
                  <h3 className="text-lg font-semibold tracking-tight mt-2 mb-1">Day-by-day study plan</h3>
                  <p className="text-sm text-text-2 leading-relaxed max-w-xs">Set a competition date. The agent builds a day-by-day plan and adjusts after each session based on what you actually understood.</p>
                </div>
                <div className="mx-4 mb-4 mt-4 rounded-xl border border-border-2 bg-[#0d0d0d]">
                  <CalendarPreview />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Live Demo ── */}
      <section id="demo" className="relative z-10 px-8 py-32">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-20">
              <p className="text-xs font-medium text-accent uppercase tracking-[0.12em] mb-4">Live demo</p>
              <h2 className="text-[clamp(24px,3.5vw,42px)] font-semibold tracking-[-0.03em]">What a session looks like</h2>
              <p className="text-sm text-text-2 mt-4 max-w-md mx-auto leading-relaxed">The coach never gives you the answer. It asks the question that makes you find it.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-12 order-2 lg:order-1">
              {[
                { step: "01", title: "Pick your competition", desc: "AMC 12, AIME, USAMO, USACO, USAPhO, USNCO, USABO — select the one you're training for." },
                { step: "02", title: "Run a session", desc: "Coach mode for open questions, Practice for problems, Diagnose to map your gaps and get a study plan." },
                { step: "03", title: "Derive, don't memorize", desc: "The coach never gives you the answer. It asks the question that makes you find it — so it actually sticks." },
              ].map((item, i) => (
                <Reveal key={item.step} delay={i * 0.1}>
                  <div className="flex gap-6">
                    <span className="text-3xl font-semibold tracking-[-0.04em] shrink-0 w-10 text-white/10 tabular-nums">{item.step}</span>
                    <div>
                      <h3 className="text-base font-semibold text-text mb-1.5">{item.title}</h3>
                      <p className="text-sm text-text-2 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal y={40} delay={0.1} className="order-1 lg:order-2">
              <AppWindow>
                <div className="p-6 bg-[#0d0d0d]">
                  <LandingDemo />
                </div>
              </AppWindow>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="relative z-10 px-8 py-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
        </div>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-20">
              <p className="text-xs font-medium text-accent uppercase tracking-[0.12em] mb-4">Student results</p>
              <h2 className="text-[clamp(24px,3.5vw,42px)] font-semibold tracking-[-0.03em]">Students who qualified</h2>
              <p className="text-sm text-text-2 mt-4">What changes once you stop looking up solutions.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} y={40} delay={i * 0.12}>
                <div
                  className="relative flex flex-col h-full p-8 rounded-2xl border border-white/[0.08] bg-surface hover:border-white/[0.14] transition-all duration-300 overflow-hidden"
                  style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.4)" }}
                >
                  <div className="text-6xl text-accent/40 font-serif leading-none mb-5 select-none">&ldquo;</div>
                  <p className="text-base text-text leading-relaxed flex-1 mb-8">{t.quote}</p>
                  <div className="flex items-center gap-3 pt-5 border-t border-white/[0.07]">
                    <div className="w-9 h-9 rounded-full border border-accent/25 flex items-center justify-center text-xs font-bold text-accent shrink-0" style={{ backgroundColor: "rgba(232,168,32,0.12)" }}>
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text">{t.name}</p>
                      <p className="text-xs text-text-2">{t.role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="relative z-10 px-8 py-32">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-20">
              <p className="text-xs font-medium text-accent uppercase tracking-[0.12em] mb-4">The research</p>
              <h2 className="text-[clamp(24px,3.5vw,42px)] font-semibold tracking-[-0.03em]">Why Socratic coaching produces competitors</h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {STATS.map((s, i) => (
              <Reveal key={s.stat} y={32} delay={i * 0.12}>
                <div
                  className="p-8 rounded-2xl border border-white/[0.08] bg-surface h-full"
                  style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.4)" }}
                >
                  <div className="text-4xl font-semibold tracking-[-0.04em] mb-4 text-accent">{s.stat}</div>
                  <p className="text-sm text-text-2 leading-relaxed mb-4">{s.desc}</p>
                  <p className="text-2xs text-[#555]">{s.source}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="relative z-10 px-8 py-32">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <p className="text-xs font-medium text-accent uppercase tracking-[0.12em] mb-4">Pricing</p>
              <h2 className="text-[clamp(24px,3.5vw,42px)] font-semibold tracking-[-0.03em]">Simple pricing for serious competitors</h2>
              <p className="text-sm text-text-2 mt-4 max-w-sm mx-auto leading-relaxed">
                AIME qualification is worth $0 to a college if you can&apos;t explain how you solved the problem.
              </p>
            </div>
          </Reveal>

          {checkoutError && (
            <p className="text-center text-sm text-red-400 mb-6">{checkoutError}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Free */}
            <Reveal y={32} delay={0.05}>
              <div className="h-full p-7 rounded-2xl border border-white/[0.08] bg-surface flex flex-col" style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.4)" }}>
                <p className="text-xs font-medium text-text-2 uppercase tracking-wider">Free</p>
                <div className="mt-4 mb-1">
                  <span className="text-4xl font-semibold tracking-[-0.03em]">$0</span>
                </div>
                <p className="text-xs text-text-2 mb-7">30 sessions / month</p>
                <ul className="space-y-3 flex-1 mb-8">
                  {["Socratic coaching on all subjects", "Practice problem generation", "One diagnostic per subject"].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-text-2">
                      <span className="mt-[5px] w-1 h-1 rounded-full bg-border-3 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/coach" className="px-4 py-2.5 rounded-xl text-sm font-medium text-center border border-white/[0.1] text-text-2 hover:border-white/[0.2] hover:text-text transition-all duration-150">
                  Start training
                </Link>
              </div>
            </Reveal>

            {/* Pro */}
            <Reveal y={32} delay={0.12}>
              <div className="relative h-full p-7 rounded-2xl border border-accent bg-surface-2 flex flex-col" style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.5), 0 0 40px rgba(232,168,32,0.08)" }}>
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs font-medium text-accent uppercase tracking-wider">Pro</p>
                  <span className="text-2xs text-text-2 px-2 py-0.5 rounded-full border border-white/[0.1]">Most popular</span>
                </div>
                <div className="mt-4 mb-1">
                  <span className="text-4xl font-semibold tracking-[-0.03em]">${PRO_PRICE}</span>
                  <span className="text-sm text-text-2 font-normal ml-1">/mo</span>
                </div>
                <p className="text-xs text-text-2 mb-7">Cancel anytime</p>
                <ul className="space-y-3 flex-1 mb-8">
                  {["Unlimited sessions", "Full adaptive study plan from diagnostic", "Competition prep campaign mode", "Week-by-week progress reports", "Concept-level mastery tracking"].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-text-2">
                      <span className="mt-[5px] w-1 h-1 rounded-full bg-accent shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => subscribe("pro")} disabled={checkoutLoading !== null} className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-accent text-background hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150">
                  {checkoutLoading === "pro" ? "Redirecting…" : "Subscribe"}
                </button>
              </div>
            </Reveal>

            {/* Team */}
            <Reveal y={32} delay={0.18}>
              <div className="h-full p-7 rounded-2xl border border-white/[0.08] bg-surface flex flex-col" style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.4)" }}>
                <p className="text-xs font-medium text-text-2 uppercase tracking-wider">Team / School</p>
                <div className="mt-4 mb-1">
                  <span className="text-4xl font-semibold tracking-[-0.03em]">${TEAM_SEAT_PRICE}</span>
                  <span className="text-sm text-text-2 font-normal ml-1">/seat/mo</span>
                </div>
                <p className="text-xs text-text-2 mb-7">{TEAM_MIN_SEATS}-seat minimum</p>
                <ul className="space-y-3 flex-1 mb-6">
                  {["Everything in Pro", "Seat-based billing for clubs and schools", "Invite-code team management"].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-text-2">
                      <span className="mt-[5px] w-1 h-1 rounded-full bg-border-3 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 mb-4">
                  <label htmlFor="lp-seats" className="text-xs text-text-2 shrink-0">Seats</label>
                  <input
                    id="lp-seats"
                    type="number"
                    min={TEAM_MIN_SEATS}
                    value={seats}
                    onChange={(e) => setSeats(Math.max(TEAM_MIN_SEATS, Number(e.target.value) || TEAM_MIN_SEATS))}
                    className="w-16 bg-background border border-white/[0.1] rounded-lg px-2 py-1.5 text-sm text-text outline-none focus:border-accent transition-colors"
                  />
                  <span className="text-xs text-text-2">= ${seats * TEAM_SEAT_PRICE}/mo</span>
                </div>
                <button onClick={() => subscribe("team")} disabled={checkoutLoading !== null} className="px-4 py-2.5 rounded-xl text-sm font-medium border border-white/[0.1] text-text-2 hover:border-white/[0.2] hover:text-text disabled:opacity-50 transition-all duration-150">
                  {checkoutLoading === "team" ? "Redirecting…" : "Subscribe"}
                </button>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2}>
            <div className="mt-8 p-6 rounded-2xl border border-white/[0.06] bg-surface text-center">
              <p className="text-sm text-text-2 leading-relaxed max-w-2xl mx-auto">
                At ${PRO_PRICE}/month during a 4-month prep window, the cost is less than a single hour with a private math tutor — and you get unlimited sessions.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <Faq />

      {/* ── Bottom CTA ── */}
      <section className="relative z-10 px-8 py-36 text-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
        </div>
        <Reveal>
          <h2 className="text-[clamp(28px,4vw,54px)] font-semibold tracking-[-0.03em] mb-5">
            Train the way competitors train.
          </h2>
          <p className="text-base text-text-2 mb-10 max-w-sm mx-auto leading-relaxed">
            Pick your competition. Map your gaps. Work through problems until the answers come from you.
          </p>
          <Link
            href="/coach"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold bg-accent text-background hover:bg-accent-hover transition-all duration-150"
            style={{ boxShadow: "0 0 32px rgba(232,168,32,0.3)" }}
          >
            Start training free
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 2l5 5-5 5M2 7h10" />
            </svg>
          </Link>
        </Reveal>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.06] px-8 py-6 flex items-center justify-between">
        <span className="flex items-center text-sm font-bold tracking-tight">
          <span className="text-text">Poly</span><span className="text-accent">Teach</span>
        </span>
        <span className="text-xs text-[#444]">© 2026 PolyTeach</span>
      </footer>
    </div>
  );
}
