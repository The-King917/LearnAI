"use client";

import { useState, useCallback } from "react";
import DiagnoseMode from "./DiagnoseMode";
import { Subject, VISIBLE_SUBJECTS } from "@/lib/subjects";
import { Difficulty } from "@/lib/prompts";

interface DiagnoseCanvasProps {
  signedIn: boolean;
  onComplete: (subjectId: string) => void;
}

const FEATURES = ["Adaptive difficulty", "8–10 questions", "Concept breakdown", "Study roadmap"];

export default function DiagnoseCanvas({ signedIn, onComplete }: DiagnoseCanvasProps) {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [active, setActive] = useState(false);
  const [complete, setComplete] = useState(false);

  const handleLevelFound = useCallback(
    (level: Difficulty) => {
      if (!subject) return;
      fetch("/api/progress/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId: subject.id, level }),
      }).catch(() => {});

      setComplete(true);
      setTimeout(() => {
        onComplete(subject.id);
      }, 1800);
    },
    [subject, onComplete]
  );

  const reset = () => {
    setSubject(null);
    setActive(false);
    setComplete(false);
  };

  if (!signedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
        <p className="text-base font-semibold text-text">Sign in to run a diagnostic</p>
        <p className="text-sm text-muted max-w-xs">Create a free account to get an adaptive skill assessment and personalized study plan.</p>
      </div>
    );
  }

  if (active && subject) {
    return (
      <div className="flex flex-col h-full">
        <div className="h-10 shrink-0 border-b border-border flex items-center px-5 gap-2">
          <span className="text-sm text-muted">{subject.name} diagnostic</span>
          {complete && (
            <span className="text-2xs text-muted px-2 py-0.5 rounded-full border border-white/15 text-text ml-1">Complete</span>
          )}
          {!complete && (
            <button onClick={reset} className="ml-auto text-2xs text-muted hover:text-text-2 transition-colors">
              ← Change
            </button>
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          <DiagnoseMode subject={subject} onLevelFound={handleLevelFound} />
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
        <h1 className="text-xl font-semibold tracking-[-0.02em] text-text mb-1">Diagnostic</h1>
        <p className="text-sm text-muted mb-8">
          An adaptive skill assessment that adjusts in real time. Takes about 5 minutes and produces a precise level estimate plus a study roadmap.
        </p>

        {/* Feature grid */}
        <div className="grid grid-cols-2 gap-2 mb-8">
          {FEATURES.map((f) => (
            <div key={f} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-surface">
              <svg className="w-3 h-3 text-text-2 shrink-0" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 6.5l3 3 6-6" />
              </svg>
              <span className="text-xs text-muted">{f}</span>
            </div>
          ))}
        </div>

        {/* Subject grid */}
        <div className="mb-8">
          <p className="text-2xs font-medium text-muted uppercase tracking-[0.07em] mb-3">Competition to diagnose</p>

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

        {/* CTA */}
        <button
          onClick={() => subject && setActive(true)}
          disabled={!subject}
          className="w-full py-3 rounded-xl text-sm font-semibold bg-white text-background hover:bg-white/85 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 shadow-glow"
        >
          {subject ? `Begin ${subject.name} diagnostic` : "Select a competition to begin"}
        </button>
      </div>
    </div>
  );
}
