"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Subject } from "@/lib/subjects";
import { Difficulty, DIFFICULTY_LABELS } from "@/lib/prompts";
import SubjectDropdown from "./SubjectDropdown";
import AuthModal from "./AuthModal";

type Mode = "chat" | "practice" | "diagnose";

interface Session {
  id: string;
  subject: string;
  mode: Mode;
  preview: string;
  time: string;
}

interface SidebarProps {
  subject: Subject | null;
  onSubjectChange: (s: Subject) => void;
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
  mode: Mode;
  onModeChange: (m: Mode) => void;
  recentSessions: Session[];
  onSessionClick: (s: Session) => void;
}

const MODES: { id: Mode; label: string; icon: React.ReactNode }[] = [
  {
    id: "chat",
    label: "Coach",
    icon: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 10.667A1.333 1.333 0 0 1 12.667 12H4.667L2 14.667V3.333A1.333 1.333 0 0 1 3.333 2h9.334A1.333 1.333 0 0 1 14 3.333v7.334Z"/>
      </svg>
    ),
  },
  {
    id: "practice",
    label: "Practice",
    icon: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.667 2a1.886 1.886 0 0 1 2.666 2.667L4.667 13.333l-3.334.667.667-3.334L10.667 2Z"/>
      </svg>
    ),
  },
  {
    id: "diagnose",
    label: "Diagnose",
    icon: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 11 4.5 6.5 7.5 9 11 4.5 15 9"/>
      </svg>
    ),
  },
];

const DIFFICULTIES: Difficulty[] = ["beginner", "intermediate", "advanced", "olympiad"];

export default function Sidebar({
  subject, onSubjectChange, difficulty, onDifficultyChange,
  mode, onModeChange, recentSessions, onSessionClick,
}: SidebarProps) {
  const { data: session, status } = useSession();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <aside className="w-[216px] shrink-0 h-full flex flex-col border-r border-border bg-surface">
      {/* Wordmark */}
      <Link
        href="/"
        className="h-11 flex items-center px-4 border-b border-border shrink-0 hover:bg-surface-2 transition-colors"
      >
        <span className="flex items-center text-sm font-semibold tracking-[-0.01em] text-text">
          Learn
          <span className="ml-1 px-1.5 py-0.5 rounded-md bg-white text-background text-2xs font-bold tracking-[0.02em]">AI</span>
        </span>
      </Link>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2">
        {/* Subject */}
        <div className="px-3 py-2">
          <p className="text-2xs font-medium text-muted uppercase tracking-[0.07em] mb-2 px-1">Subject</p>
          <SubjectDropdown value={subject} onChange={onSubjectChange} />
        </div>

        <div className="h-px bg-border mx-3 my-1" />

        {/* Mode */}
        <div className="px-3 py-2">
          <p className="text-2xs font-medium text-muted uppercase tracking-[0.07em] mb-1 px-1">Mode</p>
          <nav className="space-y-0.5">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => onModeChange(m.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm transition-all duration-150 ${
                  mode === m.id
                    ? "bg-white text-background shadow-glow"
                    : "text-muted hover:text-text-2 hover:bg-surface-2 border border-transparent"
                }`}
              >
                {m.icon}
                <span className={mode === m.id ? "font-medium" : ""}>{m.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="h-px bg-border mx-3 my-1" />

        {/* Difficulty */}
        <div className="px-3 py-2">
          <p className="text-2xs font-medium text-muted uppercase tracking-[0.07em] mb-1 px-1">Difficulty</p>
          <div className="space-y-0.5">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => onDifficultyChange(d)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors duration-100 ${
                  difficulty === d
                    ? "text-text"
                    : "text-muted hover:text-text-2 hover:bg-surface-2"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                  difficulty === d ? "bg-white" : "bg-subtle"
                }`} />
                <span className={difficulty === d ? "font-medium" : ""}>{DIFFICULTY_LABELS[d]}</span>
              </button>
            ))}
          </div>
        </div>

        {recentSessions.length > 0 && (
          <>
            <div className="h-px bg-border mx-3 my-1" />
            <div className="px-3 py-2">
              <p className="text-2xs font-medium text-muted uppercase tracking-[0.07em] mb-1 px-1">Recent</p>
              <div className="space-y-0.5">
                {recentSessions.slice(0, 8).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onSessionClick(s)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-surface-2 transition-colors duration-100 group"
                  >
                    <span className="text-sm text-muted group-hover:text-text-2 truncate transition-colors">{s.subject}</span>
                    <span className="text-2xs text-subtle shrink-0 ml-2">{s.time}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Account */}
      <div className="shrink-0 border-t border-border p-3">
        {status === "authenticated" && session?.user ? (
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-7 h-7 rounded-full bg-surface-2 border border-border-2 flex items-center justify-center text-2xs font-semibold text-text-2 shrink-0">
              {(session.user.name ?? session.user.email ?? "?").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text truncate">{session.user.name ?? session.user.email}</p>
              <button onClick={() => signOut()} className="text-2xs text-muted hover:text-text-2 transition-colors">
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAuthOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-2.5 py-2 rounded-lg text-sm font-medium text-text-2 border border-border hover:border-border-2 hover:bg-surface-2 transition-all duration-150"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
              <path d="M2 14c.5-2.5 2.5-4 4-4s3.5 1.5 4 4" />
              <path d="M11 5.5h3M12.5 4v3" />
            </svg>
            Sign in
          </button>
        )}
      </div>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </aside>
  );
}
