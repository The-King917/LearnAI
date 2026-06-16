"use client";

import { useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import ChatInterface from "@/components/ChatInterface";
import PracticeMode from "@/components/PracticeMode";
import DiagnoseMode from "@/components/DiagnoseMode";
import { Subject } from "@/lib/subjects";
import { Difficulty } from "@/lib/prompts";

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
  const [subject, setSubject] = useState<Subject | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [mode, setMode] = useState<Mode>("chat");
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [key, setKey] = useState(0);

  const reset = useCallback(() => setKey((k) => k + 1), []);

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
    setTimeout(() => { setMode("chat"); reset(); }, 1800);
  }, [reset]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
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

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-11 shrink-0 border-b border-border flex items-center px-5 gap-2">
          <span className="text-sm font-medium text-text">{MODE_LABELS[mode]}</span>
          {subject && (
            <>
              <span className="text-subtle">/</span>
              <span className="text-sm text-muted">{subject.name}</span>
            </>
          )}
        </header>

        <div className="flex-1 overflow-hidden">
          {mode === "chat" && (
            <ChatInterface key={key} subject={subject} difficulty={difficulty} mode="chat" />
          )}
          {mode === "practice" && (
            <PracticeMode key={key} subject={subject} difficulty={difficulty} />
          )}
          {mode === "diagnose" && (
            <DiagnoseMode key={key} subject={subject} onLevelFound={handleDiagnoseComplete} />
          )}
        </div>
      </div>
    </div>
  );
}
