"use client";

import { useState, useCallback, useEffect } from "react";
import ChatInterface from "./ChatInterface";
import { Subject, VISIBLE_SUBJECTS, getSubjectById } from "@/lib/subjects";
import SciOlyDropdown from "./SciOlyDropdown";
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
  debriefSubjectId?: string;
  debriefMessage?: string;
  sessionId: string | null;
  onSessionStart: (subjectId: string, subjectName: string) => void;
  onPersistMessage: (msg: { role: "user" | "assistant"; content: string }) => void;
  initialSubjectId?: string | null;
}

const DIFFICULTY_OPTIONS: Array<{ value: Difficulty; label: string; desc: string }> = [
  { value: "beginner",     label: "Intro",    desc: "Learn concepts from scratch" },
  { value: "intermediate", label: "Standard", desc: "Typical contest-level practice" },
  { value: "advanced",     label: "Hard",     desc: "Challenging multi-step problems" },
  { value: "olympiad",     label: "Expert",   desc: "Olympiad-style reasoning" },
];

const BENEFITS = [
  "Socratic hints — never just answers",
  "Step-by-step guided reasoning",
  "Mistake diagnosis and follow-up",
  "Personalized to your weak areas",
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
  const [sciOlyEvent, setSciOlyEvent] = useState<Subject | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [chatKey, setChatKey] = useState(0);
  const [chatInitialMessages, setChatInitialMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }> | undefined
  >(undefined);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);

  useEffect(() => {
    if (!signedIn) return;
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => {
        const sessions: RecentSession[] = (data.sessions ?? [])
          .filter((s: { mode: string }) => s.mode === "chat")
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

  useEffect(() => {
    if (initialSubjectId && canvasState === "setup") {
      const subj = getSubjectById(initialSubjectId);
      if (subj) setSubject(subj);
    }
  }, [initialSubjectId, canvasState]);

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

  const effectiveSubject = subject?.id === "science-olympiad" ? sciOlyEvent : subject;

  const startSession = useCallback(() => {
    if (!effectiveSubject) return;
    setChatInitialMessages(undefined);
    setCanvasState("active");
    setChatKey((k) => k + 1);
    onSessionStart(effectiveSubject.id, effectiveSubject.name);
  }, [effectiveSubject, onSessionStart]);

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
        <p className="text-sm text-text-2 max-w-xs">Create a free account to chat with the coach, save sessions, and track mastery.</p>
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
  const currentDiff = DIFFICULTY_OPTIONS.find((o) => o.value === difficulty)!;

  const CompetitionCard = ({ s }: { s: Subject }) => {
    const selected = subject?.id === s.id;
    return (
      <button
        key={s.id}
        onClick={() => { setSubject(s); if (s.id !== "science-olympiad") setSciOlyEvent(null); }}
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
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="grid grid-cols-[1fr_260px] gap-10 items-start">

          {/* ── Left column ── */}
          <div>
            <h1 className="text-xl font-semibold tracking-[-0.02em] text-text mb-1">AI Competition Coach</h1>
            <p className="text-sm text-text-2 mb-8">Pick your exam and difficulty. We'll guide you through problems step by step.</p>

            {/* Competition grid */}
            <div className="mb-8">
              <p className="text-2xs font-medium text-accent uppercase tracking-[0.07em] mb-4">Competition</p>

              <p className="text-xs font-medium text-text-2 mb-2">Math</p>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {mathSubjects.map((s) => <CompetitionCard key={s.id} s={s} />)}
              </div>

              <p className="text-xs font-medium text-text-2 mb-2">Science &amp; CS</p>
              <div className="grid grid-cols-3 gap-2">
                {scienceSubjects.map((s) => <CompetitionCard key={s.id} s={s} />)}
              </div>

              {subject?.id === "science-olympiad" && (
                <div className="mt-3">
                  <p className="text-2xs text-text-2 mb-1.5 pl-0.5">Which event?</p>
                  <SciOlyDropdown value={sciOlyEvent} onChange={setSciOlyEvent} />
                </div>
              )}
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

            {/* Recent sessions */}
            {recentSessions.length > 0 && (
              <div className="mb-8">
                <p className="text-2xs font-medium text-accent uppercase tracking-[0.07em] mb-3">Resume</p>
                <div className="space-y-2">
                  {recentSessions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => resumeSession(s)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border-2 bg-surface hover:border-[#484848] hover:bg-surface-2 transition-all duration-100 group cursor-pointer"
                    >
                      <div className="text-left">
                        <p className="text-sm text-text-2 group-hover:text-text transition-colors">{s.subjectName}</p>
                        <p className="text-2xs text-[#666] mt-0.5">{timeAgo(s.updatedAt)}</p>
                      </div>
                      <span className="text-2xs text-[#777] group-hover:text-text-2 transition-colors">Resume →</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={startSession}
              disabled={!effectiveSubject}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                effectiveSubject
                  ? "bg-accent text-background hover:bg-accent-hover cursor-pointer"
                  : "border border-border-2 text-text-2 cursor-not-allowed"
              }`}
            >
              {effectiveSubject
                ? `Start ${effectiveSubject.name} · ${currentDiff.label} Coach`
                : subject?.id === "science-olympiad"
                ? "Choose a Science Olympiad event above"
                : "Choose a competition above"}
            </button>
          </div>

          {/* ── Right column ── */}
          <div className="sticky top-10">
            {effectiveSubject ? (
              <div className="rounded-2xl border border-accent/30 bg-accent/5 p-5">
                <p className="text-2xs font-medium text-accent uppercase tracking-[0.07em] mb-3">Ready to start</p>
                <p className="text-base font-semibold text-text leading-tight">{effectiveSubject.name}</p>
                {effectiveSubject.group === "Science Olympiad" && (
                  <p className="text-2xs text-accent/70 mt-0.5">Science Olympiad</p>
                )}
                <p className="text-sm text-text-2 mt-0.5 mb-5">{currentDiff.label} — {currentDiff.desc}</p>
                <div className="border-t border-accent/15 pt-4 space-y-2.5">
                  {BENEFITS.map((b) => (
                    <div key={b} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-[5px]" />
                      <span className="text-xs text-text-2">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-border-2 bg-surface p-5">
                <p className="text-2xs font-medium text-text-2 uppercase tracking-[0.07em] mb-4">What you&apos;ll get</p>
                <div className="space-y-3">
                  {BENEFITS.map((b) => (
                    <div key={b} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-[5px]" />
                      <span className="text-sm text-text-2">{b}</span>
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
