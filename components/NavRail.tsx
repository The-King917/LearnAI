"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import AuthModal from "./AuthModal";

type Mode = "coach" | "practice" | "diagnose";

interface NavRailProps {
  mode: Mode;
  onModeChange: (m: Mode) => void;
}

const MODES: Array<{ id: Mode; label: string; icon: React.ReactNode }> = [
  {
    id: "coach",
    label: "Coach",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 10.667A1.333 1.333 0 0 1 12.667 12H4.667L2 14.667V3.333A1.333 1.333 0 0 1 3.333 2h9.334A1.333 1.333 0 0 1 14 3.333v7.334Z" />
      </svg>
    ),
  },
  {
    id: "practice",
    label: "Practice",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.667 2a1.886 1.886 0 0 1 2.666 2.667L4.667 13.333l-3.334.667.667-3.334L10.667 2Z" />
      </svg>
    ),
  },
  {
    id: "diagnose",
    label: "Diagnose",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 11 4.5 6.5 7.5 9 11 4.5 15 9" />
      </svg>
    ),
  },
];

export default function NavRail({ mode, onModeChange }: NavRailProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [authOpen, setAuthOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const onCoach = pathname === "/coach";

  return (
    <>
      <nav className="w-[72px] shrink-0 h-full flex flex-col border-r border-border bg-surface">
        {/* Logo */}
        <div className="h-11 shrink-0 border-b border-border flex items-center justify-center">
          <Link
            href="/"
            className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-background hover:bg-accent-hover transition-colors"
            title="PolyTeach"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <line x1="4" y1="14" x2="4" y2="2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              <line x1="4" y1="2" x2="11" y2="2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              <line x1="11" y1="2" x2="14" y2="5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              <line x1="14" y1="5.5" x2="11" y2="9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              <line x1="11" y1="9" x2="4" y2="9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              <circle cx="4" cy="2" r="1.3" fill="currentColor"/>
              <circle cx="4" cy="9" r="1.3" fill="currentColor"/>
              <circle cx="4" cy="14" r="1.3" fill="currentColor"/>
              <circle cx="11" cy="2" r="1.3" fill="currentColor"/>
              <circle cx="14" cy="5.5" r="1.3" fill="currentColor"/>
              <circle cx="11" cy="9" r="1.3" fill="currentColor"/>
            </svg>
          </Link>
        </div>

        {/* Main nav */}
        <div className="flex-1 flex flex-col py-2 overflow-hidden">
          {MODES.map((item) => {
            const active = onCoach && mode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onModeChange(item.id)}
                title={item.label}
                className={`relative w-full flex flex-col items-center justify-center gap-1.5 py-3 transition-colors duration-100 ${
                  active ? "text-accent" : "text-text-2 hover:text-text"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-7 bg-accent rounded-r" />
                )}
                <span
                  className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                    active ? "bg-accent-muted" : "hover:bg-white/5"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="text-[10px] font-medium leading-none tracking-wide">{item.label}</span>
              </button>
            );
          })}

          <div className="h-px bg-border mx-4 my-2 shrink-0" />

          {/* Mock Test link */}
          {((): React.ReactNode => {
            const active = pathname === "/mock-test";
            return (
              <Link
                href="/mock-test"
                title="Mock Test"
                className={`relative w-full flex flex-col items-center justify-center gap-1.5 py-3 transition-colors duration-100 ${
                  active ? "text-accent" : "text-text-2 hover:text-text"
                }`}
              >
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-7 bg-accent rounded-r" />}
                <span className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${active ? "bg-accent-muted" : ""}`}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="12" height="12" rx="2" />
                    <path d="M5 8h6M8 5v6" />
                  </svg>
                </span>
                <span className="text-[10px] font-medium leading-none tracking-wide">Test</span>
              </Link>
            );
          })()}

          <div className="h-px bg-border mx-4 my-2 shrink-0" />

          {/* Progress link */}
          {((): React.ReactNode => {
            const active = pathname === "/progress";
            return (
              <Link
                href="/progress"
                title="Progress"
                className={`relative w-full flex flex-col items-center justify-center gap-1.5 py-3 transition-colors duration-100 ${
                  active ? "text-accent" : "text-text-2 hover:text-text"
                }`}
              >
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-7 bg-accent rounded-r" />}
                <span className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${active ? "bg-accent-muted" : ""}`}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 11 4.5 6.5 7.5 9 11 4.5 15 9" />
                  </svg>
                </span>
                <span className="text-[10px] font-medium leading-none tracking-wide">Progress</span>
              </Link>
            );
          })()}
        </div>

        {/* Account */}
        <div className="shrink-0 border-t border-border h-14 flex items-center justify-center">
          {status === "authenticated" && session?.user ? (
            <div className="relative">
              <button
                onClick={() => setPopoverOpen((v) => !v)}
                title={session.user.name ?? session.user.email ?? "Account"}
                className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-background hover:bg-accent-hover transition-colors"
              >
                {(session.user.name ?? session.user.email ?? "?").charAt(0).toUpperCase()}
              </button>
              {popoverOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setPopoverOpen(false)} />
                  <div className="absolute bottom-full left-2 mb-3 z-40 w-52 bg-surface border border-border rounded-xl shadow-panel p-3">
                    <p className="text-xs text-text font-medium truncate">{session.user.name ?? session.user.email}</p>
                    <p className="text-2xs text-muted truncate mt-0.5 mb-3">{session.user.email}</p>
                    <div className="border-t border-border pt-2 space-y-0.5">
                      <Link
                        href="/account"
                        onClick={() => setPopoverOpen(false)}
                        className="block text-xs text-muted hover:text-text-2 py-1.5 transition-colors"
                      >
                        Account settings
                      </Link>
                      <button
                        onClick={() => { signOut(); setPopoverOpen(false); }}
                        className="block w-full text-left text-xs text-muted hover:text-text-2 py-1.5 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              title="Sign in"
              className="w-8 h-8 rounded-full border border-border-2 flex items-center justify-center text-text-2 hover:border-[#484848] hover:text-text transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                <path d="M2 14c.5-2.5 2.5-4 4-4s3.5 1.5 4 4" />
                <path d="M11 5.5h3M12.5 4v3" />
              </svg>
            </button>
          )}
        </div>
      </nav>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}
