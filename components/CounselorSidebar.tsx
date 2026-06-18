"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { University } from "@/lib/universities";
import UniversityDropdown from "./UniversityDropdown";
import AuthModal from "./AuthModal";

export type CounselorView = "review" | "match";

interface CounselorSidebarProps {
  view: CounselorView;
  onViewChange: (v: CounselorView) => void;
  university: University | null;
  onUniversityChange: (u: University) => void;
  onEditProfile: () => void;
  profileFilled: boolean;
  recentUniversities: University[];
}

const VIEWS: { id: CounselorView; label: string }[] = [
  { id: "review", label: "Review one school" },
  { id: "match", label: "Find my matches" },
];

export default function CounselorSidebar({
  view, onViewChange, university, onUniversityChange, onEditProfile, profileFilled, recentUniversities,
}: CounselorSidebarProps) {
  const { data: session, status } = useSession();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <aside className="w-[216px] shrink-0 h-full flex flex-col border-r border-border bg-surface">
      <Link
        href="/"
        className="h-11 flex items-center px-4 border-b border-border shrink-0 hover:bg-surface-2 transition-colors"
      >
        <span className="flex items-center text-sm font-semibold tracking-[-0.01em] text-text">
          Poly
          <span className="ml-1 px-1.5 py-0.5 rounded-md bg-white text-background text-2xs font-bold tracking-[0.02em]">Teach</span>
        </span>
      </Link>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2">
        <div className="px-3 py-2">
          <Link
            href="/coach"
            className="flex items-center gap-1.5 text-xs text-muted hover:text-text-2 transition-colors mb-3 px-1"
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7.5 2L3 6l4.5 4" />
            </svg>
            Back to Coach
          </Link>

          <p className="text-2xs font-medium text-muted uppercase tracking-[0.07em] mb-1 px-1">Mode</p>
          <nav className="space-y-0.5 mb-3">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                onClick={() => onViewChange(v.id)}
                className={`w-full flex items-center px-2.5 py-1.5 rounded-lg text-sm text-left transition-all duration-150 ${
                  view === v.id
                    ? "bg-white/80 backdrop-blur-sm text-background shadow-glow font-medium"
                    : "text-muted hover:text-text-2 hover:bg-surface-2 border border-transparent"
                }`}
              >
                {v.label}
              </button>
            ))}
          </nav>

          {view === "review" && (
            <>
              <p className="text-2xs font-medium text-muted uppercase tracking-[0.07em] mb-2 px-1">University</p>
              <UniversityDropdown value={university} onChange={onUniversityChange} />
            </>
          )}
        </div>

        <div className="h-px bg-border mx-3 my-1" />

        <div className="px-3 py-2">
          <p className="text-2xs font-medium text-muted uppercase tracking-[0.07em] mb-1 px-1">Your application</p>
          <button
            onClick={onEditProfile}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm text-muted hover:text-text-2 hover:bg-surface-2 transition-all duration-150 border border-transparent"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11.333 2a1.886 1.886 0 0 1 2.667 2.667L5.333 13.333l-3.333.667.667-3.333L11.333 2Z"/>
            </svg>
            <span>{profileFilled ? "Edit profile" : "Fill out profile"}</span>
          </button>
          {!profileFilled && (
            <p className="text-2xs text-subtle mt-1.5 px-1 leading-relaxed">
              Add your GPA, scores, activities, and essay for a real evaluation.
            </p>
          )}
        </div>

        {view === "review" && recentUniversities.length > 0 && (
          <>
            <div className="h-px bg-border mx-3 my-1" />
            <div className="px-3 py-2">
              <p className="text-2xs font-medium text-muted uppercase tracking-[0.07em] mb-1 px-1">Recent</p>
              <div className="space-y-0.5">
                {recentUniversities.slice(0, 8).map((u) => (
                  <button
                    key={u.id}
                    onClick={() => onUniversityChange(u)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-surface-2 transition-colors duration-100 group"
                  >
                    <span className="text-sm text-muted group-hover:text-text-2 truncate transition-colors">{u.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

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
