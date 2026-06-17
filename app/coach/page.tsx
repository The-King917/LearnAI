"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import ChatInterface from "@/components/ChatInterface";
import PracticeMode from "@/components/PracticeMode";
import DiagnoseMode from "@/components/DiagnoseMode";
import ProgressIndicator from "@/components/ProgressIndicator";
import { Subject } from "@/lib/subjects";
import { Difficulty } from "@/lib/prompts";
import { ResultTag, applyPracticeResult, applyDiagnoseResult } from "@/lib/mastery";

interface MasteryRecord {
  mastery: number;
  attempts: number;
  correct: number;
  diagnosedLevel?: string | null;
}

type Mode = "chat" | "practice" | "diagnose";

interface Session {
  id: string;
  subject: string;
  mode: Mode;
  preview: string;
  time: string;
}

const MODE_LABELS: Record<Mode, string> = {
  chat: "Coach",
  practice: "Practice",
  diagnose: "Diagnose",
};

export default function CoachPage() {
  const { data: session, status } = useSession();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [mode, setMode] = useState<Mode>("chat");
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [key, setKey] = useState(0);
  const [mastery, setMastery] = useState<Record<string, MasteryRecord>>({});

  const signedIn = status === "authenticated" && !!session;

  useEffect(() => {
    if (!signedIn) { setMastery({}); return; }
    fetch("/api/progress")
      .then((r) => r.json())
      .then((data) => {
        const next: Record<string, MasteryRecord> = {};
        for (const m of data.masteries ?? []) {
          next[m.subjectId] = { mastery: m.mastery, attempts: m.attempts, correct: m.correct, diagnosedLevel: m.diagnosedLevel };
        }
        setMastery(next);
      })
      .catch(() => {});
  }, [signedIn]);

  const reset = useCallback(() => setKey((k) => k + 1), []);

  const recordPracticeResult = useCallback((result: ResultTag) => {
    if (!signedIn || !subject) return;
    const subjectId = subject.id;
    setMastery((prev) => {
      const current = prev[subjectId]?.mastery ?? 0;
      return { ...prev, [subjectId]: { ...prev[subjectId], mastery: applyPracticeResult(current, result), attempts: (prev[subjectId]?.attempts ?? 0) + 1, correct: (prev[subjectId]?.correct ?? 0) + (result === "correct" ? 1 : 0) } };
    });
    fetch("/api/progress/practice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectId, result }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.mastery) {
          setMastery((prev) => ({ ...prev, [subjectId]: { mastery: data.mastery.mastery, attempts: data.mastery.attempts, correct: data.mastery.correct, diagnosedLevel: data.mastery.diagnosedLevel } }));
        }
      })
      .catch(() => {});
  }, [signedIn, subject]);

  const recordDiagnoseResult = useCallback((subjectId: string, level: Difficulty) => {
    if (!signedIn) return;
    setMastery((prev) => {
      const current = prev[subjectId];
      return { ...prev, [subjectId]: { ...current, mastery: applyDiagnoseResult(current?.mastery ?? 0, !!current, level), diagnosedLevel: level, attempts: current?.attempts ?? 0, correct: current?.correct ?? 0 } };
    });
    fetch("/api/progress/diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectId, level }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.mastery) {
          setMastery((prev) => ({ ...prev, [subjectId]: { mastery: data.mastery.mastery, attempts: data.mastery.attempts, correct: data.mastery.correct, diagnosedLevel: data.mastery.diagnosedLevel } }));
        }
      })
      .catch(() => {});
  }, [signedIn]);

  const handleSubjectChange = useCallback((s: Subject) => {
    setSubject(s);
    reset();
    const now = new Date();
    const time = `${now.getHours() % 12 || 12}:${now.getMinutes().toString().padStart(2, "0")}${now.getHours() >= 12 ? "pm" : "am"}`;
    setRecentSessions((prev) => [
      { id: `${Date.now()}`, subject: s.name, mode, preview: `${MODE_LABELS[mode]} session`, time },
      ...prev.slice(0, 9),
    ]);
  }, [mode, reset]);

  const handleModeChange = useCallback((m: Mode) => {
    setMode(m);
    reset();
  }, [reset]);

  const handleDiagnoseComplete = useCallback((level: Difficulty) => {
    setDifficulty(level);
    if (subject) recordDiagnoseResult(subject.id, level);
    setTimeout(() => { setMode("chat"); reset(); }, 1800);
  }, [reset, subject, recordDiagnoseResult]);

  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(255,255,255,0.05) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 h-full shrink-0">
        <Sidebar
          subject={subject}
          onSubjectChange={handleSubjectChange}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          mode={mode}
          onModeChange={handleModeChange}
          recentSessions={recentSessions}
          onSessionClick={(s) => { handleModeChange(s.mode); }}
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-11 shrink-0 border-b border-border flex items-center px-5 gap-2 bg-gradient-to-b from-surface/40 to-transparent backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
          <span className="text-sm font-medium text-text">{MODE_LABELS[mode]}</span>
          {subject && (
            <>
              <span className="text-subtle">/</span>
              <span className="text-sm text-muted">{subject.name}</span>
              <span className="text-subtle">·</span>
              <span className="text-2xs text-muted capitalize px-1.5 py-0.5 rounded-full border border-border">{difficulty}</span>
            </>
          )}
          <ProgressIndicator mastery={subject ? mastery[subject.id]?.mastery ?? null : null} signedIn={signedIn} />
        </header>

        <div className="flex-1 overflow-hidden">
          {mode === "chat" && (
            <ChatInterface key={key} subject={subject} difficulty={difficulty} mode="chat" />
          )}
          {mode === "practice" && (
            <PracticeMode key={key} subject={subject} difficulty={difficulty} onResult={recordPracticeResult} />
          )}
          {mode === "diagnose" && (
            <DiagnoseMode key={key} subject={subject} onLevelFound={handleDiagnoseComplete} />
          )}
        </div>
      </div>
    </div>
  );
}
