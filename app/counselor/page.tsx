"use client";

import Link from "next/link";
import { useState } from "react";

export default function CounselorWaitlistPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 55% at 50% -5%, rgba(255,255,255,0.08) 0%, transparent 65%)" }} />

      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-border/60 backdrop-blur-sm bg-background/70">
        <Link href="/" className="flex items-center text-sm font-semibold tracking-[-0.01em]">
          Poly
          <span className="ml-1 px-1.5 py-0.5 rounded-[3px] bg-white text-background text-2xs font-bold tracking-[0.02em]">Teach</span>
        </Link>
        <Link href="/coach" className="text-sm font-medium text-muted hover:text-text transition-colors duration-150">
          Open app →
        </Link>
      </nav>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="max-w-md w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-xs text-muted mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            Coming soon
          </div>

          <h1 className="text-[clamp(28px,5vw,44px)] font-semibold tracking-[-0.03em] leading-[1.1] mb-4">
            College Counselor
          </h1>

          <p className="text-sm text-muted leading-relaxed mb-10">
            An agentic AI counselor that reads your essays and activities, researches each target school, tracks revisions across sessions, and gives you a calibrated, school-specific admission estimate — not generic feedback.
          </p>

          <div className="space-y-3 text-left mb-12">
            {[
              "Upload essays → agent reads all materials and researches each school",
              "Per-school feedback that quotes your specific lines",
              "Revision tracking — knows what it told you last time",
              "Calibrated admission estimate with explicit uncertainty",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="w-4 h-4 rounded border border-border bg-surface-2 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="7" height="7" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 4.5L3 6.5 7 2" />
                  </svg>
                </div>
                <span className="text-sm text-muted">{item}</span>
              </div>
            ))}
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text placeholder-muted outline-none focus:border-white/25 transition-colors"
              />
              <button
                type="submit"
                className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold bg-white text-background hover:bg-white/85 transition-all duration-150"
              >
                Join the waitlist
              </button>
            </form>
          ) : (
            <div className="px-6 py-4 rounded-xl border border-border bg-surface text-sm text-muted">
              You&apos;re on the list. We&apos;ll reach out when it&apos;s ready.
            </div>
          )}

          <p className="mt-8 text-xs text-subtle">
            In the meantime →{" "}
            <Link href="/coach" className="text-muted hover:text-text-2 underline underline-offset-2 transition-colors">
              train for your competition
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
