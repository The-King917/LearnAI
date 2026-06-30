"use client";

import { useState, useCallback } from "react";
import DiagnoseMode from "./DiagnoseMode";
import { Subject, VISIBLE_SUBJECTS } from "@/lib/subjects";
import { Difficulty } from "@/lib/prompts";

interface DiagnoseCanvasProps {
  signedIn: boolean;
  onComplete: (subjectId: string) => void;
}

const FEATURES = [
  { label: "Adaptive difficulty", desc: "Gets harder or easier as you go" },
  { label: "8–10 questions", desc: "Quick but precise" },
  { label: "Concept breakdown", desc: "Shows exactly where gaps are" },
  { label: "Study roadmap", desc: "Custom plan after the test" },
];

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
        <p className="text-sm text-text-2 max-w-xs">Create a free account to get an adaptive skill assessment and personalized study plan.</p>
      </div>
    );
  }

  if (active && subject) {
    return (
      <div className="flex flex-col h-full">
        <div className="h-10 shrink-0 border-b border-border flex items-center px-5 gap-2">
          <span className="text-sm text-text-2">{subject.name} diagnostic</span>
          {complete && (
            <span className="text-2xs text-accent px-2 py-0.5 rounded-full border border-accent/30 ml-1">Complete</span>
          )}
          {!complete && (
            <button onClick={reset} className="ml-auto text-2xs text-text-2 hover:text-text transition-colors cursor-pointer">
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
      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="grid grid-cols-[1fr_260px] gap-10 items-start">

          {/* ── Left column ── */}
          <div>
            <h1 className="text-xl font-semibold tracking-[-0.02em] text-text mb-1">Diagnostic</h1>
            <p className="text-sm text-text-2 mb-8">
              An adaptive skill assessment that adjusts in real time. Takes about 5 minutes and produces a precise level estimate plus a study roadmap.
            </p>

            {/* Subject grid */}
            <div className="mb-8">
              <p className="text-2xs font-medium text-accent uppercase tracking-[0.07em] mb-4">Competition to diagnose</p>

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

            {/* CTA */}
            <button
              onClick={() => subject && setActive(true)}
              disabled={!subject}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                subject
                  ? "bg-accent text-background hover:bg-accent-hover cursor-pointer"
                  : "border border-border-2 text-text-2 cursor-not-allowed"
              }`}
            >
              {subject ? `Begin ${subject.name} diagnostic` : "Choose a competition above"}
            </button>
          </div>

          {/* ── Right column ── */}
          <div className="sticky top-10">
            {subject ? (
              <div className="rounded-2xl border border-accent/30 bg-accent/5 p-5">
                <p className="text-2xs font-medium text-accent uppercase tracking-[0.07em] mb-3">Ready</p>
                <p className="text-base font-semibold text-text leading-tight mb-5">{subject.name} Diagnostic</p>
                <div className="space-y-3">
                  {FEATURES.map((f) => (
                    <div key={f.label} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-[5px]" />
                      <div>
                        <p className="text-xs font-medium text-text-2">{f.label}</p>
                        <p className="text-2xs text-[#777] mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-border-2 bg-surface p-5">
                <p className="text-2xs font-medium text-text-2 uppercase tracking-[0.07em] mb-4">How it works</p>
                <div className="space-y-3">
                  {FEATURES.map((f) => (
                    <div key={f.label} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-[5px]" />
                      <div>
                        <p className="text-sm text-text-2">{f.label}</p>
                        <p className="text-2xs text-[#666] mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
