"use client";

import { useState, useCallback } from "react";
import PracticeMode from "./PracticeMode";
import { Subject, VISIBLE_SUBJECTS } from "@/lib/subjects";
import { Difficulty } from "@/lib/prompts";
import { ResultTag } from "@/lib/mastery";

interface PracticeCanvasProps {
  signedIn: boolean;
}

const DIFFICULTY_OPTIONS: Array<{ value: Difficulty; label: string; desc: string }> = [
  { value: "beginner",     label: "Intro",    desc: "Learn concepts from scratch" },
  { value: "intermediate", label: "Standard", desc: "Typical contest-level practice" },
  { value: "advanced",     label: "Hard",     desc: "Challenging multi-step problems" },
  { value: "olympiad",     label: "Expert",   desc: "Olympiad-style reasoning" },
];

const TOPIC_PILLS = [
  "Algebra", "Number Theory", "Geometry", "Combinatorics",
  "Probability", "Sequences", "Inequalities", "Trigonometry",
];

export default function PracticeCanvas({ signedIn }: PracticeCanvasProps) {
  const [active, setActive] = useState(false);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [topics, setTopics] = useState<string[]>([]);
  const [practiceKey, setPracticeKey] = useState(0);

  const toggleTopic = (t: string) => {
    setTopics((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  };

  const handleResult = useCallback((result: ResultTag) => {
    if (!subject) return;
    fetch("/api/progress/practice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectId: subject.id, result }),
    }).catch(() => {});
  }, [subject]);

  const start = () => {
    if (!subject) return;
    setActive(true);
    setPracticeKey((k) => k + 1);
  };

  const reset = () => {
    setActive(false);
    setSubject(null);
  };

  if (!signedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
        <p className="text-base font-semibold text-text">Sign in to practice</p>
        <p className="text-sm text-text-2 max-w-xs">Create a free account to generate practice problems with hints and feedback.</p>
      </div>
    );
  }

  if (active && subject) {
    return (
      <div className="flex flex-col h-full">
        <div className="h-10 shrink-0 border-b border-border flex items-center px-5 gap-2">
          <span className="text-sm text-text-2">{subject.name}</span>
          <span className="text-border-3">·</span>
          <span className="text-2xs text-text-2 px-2 py-0.5 rounded-full border border-border-2">
            {DIFFICULTY_OPTIONS.find((d) => d.value === difficulty)?.label ?? difficulty}
          </span>
          <button
            onClick={reset}
            className="ml-auto text-2xs text-text-2 hover:text-text transition-colors cursor-pointer"
          >
            ← Change
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <PracticeMode key={practiceKey} subject={subject} difficulty={difficulty} onResult={handleResult} />
        </div>
      </div>
    );
  }

  // ── Setup screen ────────────────────────────────────────────────────────────
  const mathSubjects = VISIBLE_SUBJECTS.filter((s) => s.group === "Math Competitions");
  const scienceSubjects = VISIBLE_SUBJECTS.filter((s) => s.group === "Science Competitions");
  const currentDiff = DIFFICULTY_OPTIONS.find((o) => o.value === difficulty)!;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-8 py-10">
        <h1 className="text-xl font-semibold tracking-[-0.02em] text-text mb-1">Practice</h1>
        <p className="text-sm text-text-2 mb-8">Generate problems with progressive hints. No timer, no pressure.</p>

        {/* Subject grid */}
        <div className="mb-8">
          <p className="text-2xs font-medium text-accent uppercase tracking-[0.07em] mb-4">Competition</p>

          <p className="text-xs font-medium text-text-2 mb-2">Math</p>
          <div className="grid grid-cols-3 gap-2 mb-5">
            {mathSubjects.map((s) => {
              const selected = subject?.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSubject(s)}
                  className={`px-3 py-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                    selected
                      ? "border-accent bg-accent/10 text-accent shadow-[0_0_0_1px_rgba(232,168,32,0.25)]"
                      : "border-border-2 bg-surface text-text-2 hover:border-[#484848] hover:text-text hover:bg-surface-2"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-sm font-medium leading-tight">{s.name}</p>
                    {selected && <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-[3px]" />}
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-xs font-medium text-text-2 mb-2">Science &amp; CS</p>
          <div className="grid grid-cols-3 gap-2">
            {scienceSubjects.map((s) => {
              const selected = subject?.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSubject(s)}
                  className={`px-3 py-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                    selected
                      ? "border-accent bg-accent/10 text-accent shadow-[0_0_0_1px_rgba(232,168,32,0.25)]"
                      : "border-border-2 bg-surface text-text-2 hover:border-[#484848] hover:text-text hover:bg-surface-2"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-sm font-medium leading-tight">{s.name}</p>
                    {selected && <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-[3px]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty segmented control */}
        <div className="mb-8">
          <p className="text-2xs font-medium text-accent uppercase tracking-[0.07em] mb-3">Level</p>
          <div className="flex bg-surface-2 border border-border-2 rounded-xl p-1 gap-1">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDifficulty(opt.value)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-100 cursor-pointer ${
                  difficulty === opt.value
                    ? "bg-accent text-background shadow-sm"
                    : "text-text-2 hover:text-text hover:bg-white/5"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-2xs text-text-2 mt-2 pl-1">{currentDiff.desc}</p>
        </div>

        {/* Topic filter */}
        <div className="mb-8">
          <p className="text-2xs font-medium text-accent uppercase tracking-[0.07em] mb-3">
            Topic focus <span className="normal-case font-normal text-text-2 ml-1">optional</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {TOPIC_PILLS.map((t) => (
              <button
                key={t}
                onClick={() => toggleTopic(t)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150 cursor-pointer ${
                  topics.includes(t)
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border-2 text-text-2 hover:border-[#484848] hover:text-text hover:bg-surface-2"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={start}
          disabled={!subject}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
            subject
              ? "bg-accent text-background hover:bg-accent-hover cursor-pointer"
              : "border border-border-2 text-text-2 cursor-not-allowed"
          }`}
        >
          {subject ? `Practice ${subject.name}` : "Choose a competition above"}
        </button>
      </div>
    </div>
  );
}
