"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import ChatInterface from "@/components/ChatInterface";
import PracticeMode from "@/components/PracticeMode";
import DiagnoseMode from "@/components/DiagnoseMode";
import ProgressIndicator from "@/components/ProgressIndicator";
import { Subject, getSubjectById } from "@/lib/subjects";
import { Difficulty } from "@/lib/prompts";
import { ResultTag, applyPracticeResult, applyDiagnoseResult } from "@/lib/mastery";

interface MasteryRecord {
  mastery: number;
  attempts: number;
  correct: number;
  diagnosedLevel?: string | null;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

type Mode = "chat" | "practice" | "diagnose";

interface Session {
  id: string;
  subjectId: string;
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

function formatTime(d: Date): string {
  return `${d.getHours() % 12 || 12}:${d.getMinutes().toString().padStart(2, "0")}${d.getHours() >= 12 ? "pm" : "am"}`;
}

export default function CoachPage() {
  const { data: session, status } = useSession();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [mode, setMode] = useState<Mode>("chat");
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [key, setKey] = useState(0);
  const [mastery, setMastery] = useState<Record<string, MasteryRecord>>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chatInitialMessages, setChatInitialMessages] = useState<ChatMessage[] | undefined>(undefined);

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

  useEffect(() => {
    if (!signedIn) { setRecentSessions([]); return; }
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => {
        const sessions: Session[] = (data.sessions ?? []).map((s: { id: string; subjectId: string; mode: Mode; updatedAt: string }) => ({
          id: s.id,
          subjectId: s.subjectId,
          subject: getSubjectById(s.subjectId)?.name ?? s.subjectId,
          mode: s.mode,
          preview: `${MODE_LABELS[s.mode]} session`,
          time: formatTime(new Date(s.updatedAt)),
        }));
        setRecentSessions(sessions);
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

  const startSession = useCallback((subjectId: string, subjectName: string, m: Mode) => {
    setChatInitialMessages(undefined);
    if (signedIn) {
      setSessionId(null);
      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId, mode: m }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (!data.session) return;
          setSessionId(data.session.id);
          setRecentSessions((prev) => [
            { id: data.session.id, subjectId, subject: subjectName, mode: m, preview: `${MODE_LABELS[m]} session`, time: formatTime(new Date(data.session.updatedAt)) },
            ...prev.filter((p) => p.id !== data.session.id).slice(0, 9),
          ]);
        })
        .catch(() => {});
    } else {
      setSessionId(null);
      setRecentSessions((prev) => [
        { id: `${Date.now()}`, subjectId, subject: subjectName, mode: m, preview: `${MODE_LABELS[m]} session`, time: formatTime(new Date()) },
        ...prev.slice(0, 9),
      ]);
    }
  }, [signedIn]);

  const handleSubjectChange = useCallback((s: Subject) => {
    setSubject(s);
    reset();
    startSession(s.id, s.name, mode);
  }, [mode, reset, startSession]);

  const handleModeChange = useCallback((m: Mode) => {
    setMode(m);
    reset();
    if (subject) startSession(subject.id, subject.name, m);
  }, [reset, subject, startSession]);

  const handleSessionClick = useCallback((s: Session) => {
    const subj = getSubjectById(s.subjectId);
    if (subj) setSubject(subj);
    setMode(s.mode);
    setSessionId(s.id);
    if (s.mode === "chat" && signedIn) {
      fetch(`/api/sessions/${s.id}`)
        .then((r) => r.json())
        .then((data) => { setChatInitialMessages(data.session?.messages ?? []); reset(); })
        .catch(() => { setChatInitialMessages(undefined); reset(); });
    } else {
      setChatInitialMessages(undefined);
      reset();
    }
  }, [signedIn, reset]);

  const persistMessage = useCallback((message: ChatMessage) => {
    if (!signedIn || !sessionId) return;
    fetch(`/api/sessions/${sessionId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    }).catch(() => {});
  }, [signedIn, sessionId]);

  const handleDiagnoseComplete = useCallback((level: Difficulty) => {
    setDifficulty(level);
    if (subject) recordDiagnoseResult(subject.id, level);
    setTimeout(() => {
      setMode("chat");
      reset();
      if (subject) startSession(subject.id, subject.name, "chat");
    }, 1800);
  }, [reset, subject, recordDiagnoseResult, startSession]);

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
          onSessionClick={handleSessionClick}
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
            <ChatInterface
              key={key}
              subject={subject}
              difficulty={difficulty}
              mode="chat"
              initialMessages={chatInitialMessages}
              onNewMessage={persistMessage}
            />
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
