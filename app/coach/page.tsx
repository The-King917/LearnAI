"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import NavRail from "@/components/NavRail";
import CoachCanvas from "@/components/CoachCanvas";
import PracticeCanvas from "@/components/PracticeCanvas";
import DiagnoseCanvas from "@/components/DiagnoseCanvas";
import AuthModal from "@/components/AuthModal";

type Mode = "coach" | "practice" | "diagnose";

const MODE_LABELS: Record<Mode, string> = {
  coach: "Coach",
  practice: "Practice",
  diagnose: "Diagnose",
};

function CoachPageInner() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<Mode>("coach");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [postDiagnoseSubjectId, setPostDiagnoseSubjectId] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  // Debrief: read URL params and fetch problem content
  const debriefTestId = searchParams.get("debrief");
  const debriefProblemId = searchParams.get("problem");
  const debriefSubjectId = searchParams.get("subject") ?? undefined;
  const [debriefMessage, setDebriefMessage] = useState<string | undefined>(undefined);

  const signedIn = status === "authenticated" && !!session;

  useEffect(() => {
    if (!debriefTestId || !debriefProblemId || !signedIn) return;
    setMode("coach");

    fetch(`/api/mock-tests/${debriefTestId}/problem/${debriefProblemId}`)
      .then((r) => r.json())
      .then((data: {
        problem?: { statement: string; answer: string; format: string; choices?: Record<string, string> | null };
        studentAnswer?: string;
      }) => {
        if (!data.problem) return;
        const { statement, answer, choices, format } = data.problem;
        const studentAnswer = data.studentAnswer ?? "(no answer given)";
        let choicesText = "";
        if (choices && format === "mcq") {
          choicesText = "\nChoices: " + Object.entries(choices).map(([k, v]) => `(${k}) ${v}`).join("  ");
        }
        setDebriefMessage(
          `I got this problem wrong and want to understand it.\n\nProblem:\n${statement}${choicesText}\n\nMy answer: ${studentAnswer}\nCorrect answer: ${answer}\n\nWalk me through this Socratically — ask me questions to find where my reasoning broke down, but don't just give me the solution.`
        );
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn]);

  const handleModeChange = useCallback((m: Mode) => {
    setMode(m);
    setSessionId(null);
    setActiveSubject(null);
  }, []);

  const handleSessionStart = useCallback(
    (subjectId: string, subjectName: string) => {
      setActiveSubject(subjectName);
      if (!signedIn) return;
      setSessionId(null);
      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId, mode: "chat" }),
      })
        .then((r) => r.json())
        .then((data) => { if (data.session) setSessionId(data.session.id); })
        .catch(() => {});
    },
    [signedIn]
  );

  const persistMessage = useCallback(
    (message: { role: "user" | "assistant"; content: string }) => {
      if (!signedIn || !sessionId) return;
      fetch(`/api/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      }).catch(() => {});
    },
    [signedIn, sessionId]
  );

  const handleDiagnoseComplete = useCallback((subjectId: string) => {
    setPostDiagnoseSubjectId(subjectId);
    setMode("coach");
  }, []);

  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      {/* Subtle dot grid */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 shrink-0 h-full">
        <NavRail mode={mode} onModeChange={handleModeChange} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="h-11 shrink-0 border-b border-border flex items-center px-5 gap-2 bg-gradient-to-b from-surface/40 to-transparent backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
          <span className="text-sm font-medium text-text">{MODE_LABELS[mode]}</span>
          {activeSubject && mode === "coach" && (
            <>
              <span className="text-subtle">/</span>
              <span className="text-sm text-muted">{activeSubject}</span>
            </>
          )}
        </header>

        <div className="flex-1 overflow-hidden">
          {mode === "coach" && (
            <CoachCanvas
              key={`coach-${postDiagnoseSubjectId ?? "fresh"}`}
              signedIn={signedIn}
              debriefSubjectId={debriefSubjectId}
              debriefMessage={debriefMessage}
              sessionId={sessionId}
              onSessionStart={handleSessionStart}
              onPersistMessage={persistMessage}
              initialSubjectId={postDiagnoseSubjectId}
            />
          )}
          {mode === "practice" && (
            <PracticeCanvas key="practice" signedIn={signedIn} />
          )}
          {mode === "diagnose" && (
            <DiagnoseCanvas key="diagnose" signedIn={signedIn} onComplete={handleDiagnoseComplete} />
          )}
        </div>
      </div>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  );
}

export default function CoachPage() {
  return (
    <Suspense>
      <CoachPageInner />
    </Suspense>
  );
}
