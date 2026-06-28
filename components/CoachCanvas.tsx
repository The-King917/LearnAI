"use client";

import { useState, useCallback, useEffect } from "react";
import ChatInterface from "./ChatInterface";
import { Subject, VISIBLE_SUBJECTS, getSubjectById } from "@/lib/subjects";
import { Difficulty } from "@/lib/prompts";

type CanvasState = "setup" | "active";

interface RecentSession {
  id: string;
  subjectId: string;
  subjectName: string;
  updatedAt: string;
}

interface CoachCanvasProps {
  signedIn: boolean;
  // Debrief params — both must be set to activate debrief mode
  debriefSubjectId?: string;
  debriefMessage?: string;
  // Session wiring (managed by parent)
  sessionId: string | null;
  onSessionStart: (subjectId: string, subjectName: string) => void;
  onPersistMessage: (msg: { role: "user" | "assistant"; content: string }) => void;
  // After diagnose: pre-select a subject
  initialSubjectId?: string | null;
}

const DIFFICULTY_OPTIONS: Array<{ value: Difficulty; label: string; sub: string }> = [
  { value: "beginner",     label: "Intro",    sub: "Foundational" },
  { value: "intermediate", label: "Standard", sub: "Competition" },
  { value: "advanced",     label: "Hard",     sub: "Qualifying" },
  { value: "olympiad",     label: "Expert",   sub: "National" },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function CoachCanvas({
  signedIn,
  debriefSubjectId,
  debriefMessage,
  sessionId,
  onSessionStart,
  onPersistMessage,
  initialSubjectId,
}: CoachCanvasProps) {
  const [canvasState, setCanvasState] = useState<CanvasState>("setup");
  const [subject, setSubject] = useState<Subject | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [chatKey, setChatKey] = useState(0);
  const [chatInitialMessages, setChatInitialMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }> | undefined
  >(undefined);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);

  // Load recent coach sessions
  useEffect(() => {
    if (!signedIn) return;
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => {
        const sessions: RecentSession[] = (data.sessions ?? [])
          .filter((s: { mode: string }) => s.mode === "chat")
          .slice(0, 3)
          .map((s: { id: string; subjectId: string; updatedAt: string }) => ({
            id: s.id,
            subjectId: s.subjectId,
            subjectName: getSubjectById(s.subjectId)?.name ?? s.subjectId,
            updatedAt: s.updatedAt,
          }));
        setRecentSessions(sessions);
      })
      .catch(() => {});
  }, [signedIn]);

  // Pre-select subject if coming from diagnostic
  useEffect(() => {
    if (initialSubjectId && canvasState === "setup") {
      const subj = getSubjectById(initialSubjectId);
      if (subj) setSubject(subj);
    }
  }, [initialSubjectId, canvasState]);

  // Debrief: auto-start session when message is ready
  useEffect(() => {
    if (!debriefSubjectId || !debriefMessage || !signedIn) return;
    const subj = getSubjectById(debriefSubjectId);
    if (!subj) return;
    setSubject(subj);
    setChatInitialMessages(undefined);
    setCanvasState("active");
    setChatKey((k) => k + 1);
    onSessionStart(subj.id, subj.name);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debriefMessage]);

  const startSession = useCallback(() => {
    if (!subject) return;
    setChatInitialMessages(undefined);
    setCanvasState("active");
    setChatKey((k) => k + 1);
    onSessionStart(subject.id, subject.name);
  }, [subject, onSessionStart]);

  const resumeSession = useCallback(
    (s: RecentSession) => {
      const subj = getSubjectById(s.subjectId);
      if (!subj) return;
      setSubject(subj);
      setChatInitialMessages(undefined);
      fetch(`/api/sessions/${s.id}`)
        .then((r) => r.json())
        .then((data) => {
          setChatInitialMessages(data.session?.messages ?? []);
          setCanvasState("active");
          setChatKey((k) => k + 1);
        })
        .catch(() => {
          setCanvasState("active");
          setChatKey((k) => k + 1);
        });
      onSessionStart(subj.id, subj.name);
    },
    [onSessionStart]
  );

  if (!signedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
        <p className="text-base font-semibold text-text">Sign in to start coaching</p>
        <p className="text-sm text-muted max-w-xs">Create a free account to chat with the coach, save sessions, and track mastery.</p>
      </div>
    );
  }

  if (canvasState === "active" && subject) {
    const isDebrief = !!debriefMessage;
    return (
      <ChatInterface
        key={chatKey}
        subject={subject}
        difficulty={difficulty}
        mode="chat"
        initialMessages={chatInitialMessages}
        initialMessage={isDebrief ? debriefMessage : undefined}
        systemPrompt={
          isDebrief
            ? "You are a Socratic competition coach running a post-test debrief. The student got this problem wrong. Ask targeted questions to discover where their reasoning broke down — never give the answer directly. Start by asking what approach they tried. Keep responses to 1-2 sentences."
            : undefined
        }
        onNewMessage={onPersistMessage}
        quickPrompts={[
          "Give me a harder problem",
          "What's the key insight here?",
          "Show me a similar example",
          "Explain this concept",
        ]}
      />
    );
  }

  // ── Setup screen ────────────────────────────────────────────────────────────
  const mathSubjects = VISIBLE_SUBJECTS.filter((s) => s.group === "Math Competitions");
  const scienceSubjects = VISIBLE_SUBJECTS.filter((s) => s.group === "Science Competitions");

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-8 py-10">
        <h1 className="text-xl font-semibold tracking-[-0.02em] text-text mb-1">Coach</h1>
        <p className="text-sm text-muted mb-8">Select a competition and level, then start a Socratic session.</p>

        {/* Subject grid */}
        <div className="mb-8">
          <p className="text-2xs font-medium text-muted uppercase tracking-[0.07em] mb-3">Competition</p>

          {/* Math row */}
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

          {/* Science row */}
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

        {/* Recent sessions */}
        {recentSessions.length > 0 && (
          <div className="mb-8">
            <p className="text-2xs font-medium text-muted uppercase tracking-[0.07em] mb-3">Resume</p>
            <div className="space-y-2">
              {recentSessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => resumeSession(s)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-surface hover:border-border-2 hover:bg-surface-2 transition-all duration-100 group"
                >
                  <div className="text-left">
                    <p className="text-sm text-text-2 group-hover:text-text transition-colors">{s.subjectName}</p>
                    <p className="text-2xs text-muted mt-0.5">{timeAgo(s.updatedAt)}</p>
                  </div>
                  <span className="text-2xs text-muted group-hover:text-text-2 transition-colors">Resume →</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={startSession}
          disabled={!subject}
          className="w-full py-3 rounded-xl text-sm font-semibold bg-white text-background hover:bg-white/85 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 shadow-glow"
        >
          {subject ? `Start ${subject.name} session` : "Select a competition to begin"}
        </button>
      </div>
    </div>
  );
}
