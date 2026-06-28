"use client";

import { useState, useCallback } from "react";
import PracticeMode from "./PracticeMode";
import { Subject, VISIBLE_SUBJECTS } from "@/lib/subjects";
import { Difficulty } from "@/lib/prompts";
import { ResultTag } from "@/lib/mastery";

interface PracticeCanvasProps {
  signedIn: boolean;
}

const DIFFICULTY_OPTIONS: Array<{ value: Difficulty; label: string }> = [
  { value: "beginner",     label: "Intro" },
  { value: "intermediate", label: "Standard" },
  { value: "advanced",     label: "Hard" },
  { value: "olympiad",     label: "Expert" },
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
        <p className="text-sm text-muted max-w-xs">Create a free account to generate practice problems with hints and feedback.</p>
      </div>
    );
  }

  if (active && subject) {
    return (
      <div className="flex flex-col h-full">
        {/* Thin context bar */}
        <div className="h-10 shrink-0 border-b border-border flex items-center px-5 gap-2">
          <span className="text-sm text-muted">{subject.name}</span>
          <span className="text-subtle">·</span>
          <span className="text-2xs text-muted px-2 py-0.5 rounded-full border border-border">
            {DIFFICULTY_OPTIONS.find((d) => d.value === difficulty)?.label ?? difficulty}
          </span>
          <button
            onClick={reset}
            className="ml-auto text-2xs text-muted hover:text-text-2 transition-colors"
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

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-8 py-10">
        <h1 className="text-xl font-semibold tracking-[-0.02em] text-text mb-1">Practice</h1>
        <p className="text-sm text-muted mb-8">Generate problems with progressive hints. No timer, no pressure.</p>

        {/* Subject grid */}
        <div className="mb-8">
          <p className="text-2xs font-medium text-muted uppercase tracking-[0.07em] mb-3">Competition</p>

          <p className="text-2xs text-subtle mb-2 tracking-wide">Math</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {mathSubjects.map((s) => (
              <button
                key={s.id}
                onClick={() => setSubject(s)}
                className={`px-3 py-3 rounded-xl border text-left transition-all duration-100 ${
                  subject?.id === s.id
                    ? "border-white/30 bg-white/6 text-text shadow-glow"
                    : "border-border bg-surface text-muted hover:border-border-2 hover:text-text-2"
                }`}
              >
                <p className="text-sm font-medium leading-tight">{s.name}</p>
              </button>
            ))}
          </div>

          <p className="text-2xs text-subtle mb-2 tracking-wide">Science &amp; CS</p>
          <div className="grid grid-cols-3 gap-2">
            {scienceSubjects.map((s) => (
              <button
                key={s.id}
                onClick={() => setSubject(s)}
                className={`px-3 py-3 rounded-xl border text-left transition-all duration-100 ${
                  subject?.id === s.id
                    ? "border-white/30 bg-white/6 text-text shadow-glow"
                    : "border-border bg-surface text-muted hover:border-border-2 hover:text-text-2"
                }`}
              >
                <p className="text-sm font-medium leading-tight">{s.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty segmented control */}
        <div className="mb-8">
          <p className="text-2xs font-medium text-muted uppercase tracking-[0.07em] mb-3">Level</p>
          <div className="flex bg-surface-2 border border-border rounded-xl p-1 gap-1">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDifficulty(opt.value)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-100 ${
                  difficulty === opt.value
                    ? "bg-white text-background shadow-sm"
                    : "text-muted hover:text-text-2"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Topic filter */}
        <div className="mb-8">
          <p className="text-2xs font-medium text-muted uppercase tracking-[0.07em] mb-3">
            Topic focus <span className="normal-case font-normal text-subtle ml-1">optional</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {TOPIC_PILLS.map((t) => (
              <button
                key={t}
                onClick={() => toggleTopic(t)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-100 ${
                  topics.includes(t)
                    ? "border-white/25 bg-white/8 text-text"
                    : "border-border text-muted hover:border-border-2 hover:text-text-2"
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
          className="w-full py-3 rounded-xl text-sm font-semibold bg-white text-background hover:bg-white/85 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 shadow-glow"
        >
          {subject ? `Practice ${subject.name}` : "Select a competition to begin"}
        </button>
      </div>
    </div>
  );
}
