"use client";
import Link from "next/link";
import { useState } from "react";
import { TEAM_MIN_SEATS, TEAM_SEAT_PRICE, PRO_PRICE } from "@/lib/billing";

export default function PricingPage() {
  const [seats, setSeats] = useState(TEAM_MIN_SEATS);
  const [loading, setLoading] = useState<"pro" | "team" | null>(null);
  const [error, setError] = useState("");

  const subscribe = async (kind: "pro" | "team") => {
    setError("");
    setLoading(kind);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(kind === "team" ? { kind, seats } : { kind }),
      });
      const raw = await res.text();
      let data: { error?: string; url?: string };
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(`Server returned ${res.status}: ${raw.slice(0, 200)}`);
      }
      if (!res.ok) throw new Error(data.error ?? `Server returned ${res.status}`);
      if (!data.url) throw new Error("Server did not return a checkout URL");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-border/60">
        <Link href="/" className="flex items-center text-sm font-semibold tracking-[-0.01em]">
          Poly
          <span className="ml-1 px-1.5 py-0.5 rounded-[3px] bg-accent text-background text-2xs font-bold tracking-[0.02em]">Teach</span>
        </Link>
        <Link href="/coach" className="text-sm font-medium text-muted hover:text-text transition-colors duration-150">
          Open app →
        </Link>
      </nav>

      <section className="px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h1 className="text-[clamp(28px,5vw,48px)] font-semibold tracking-[-0.03em]">Simple pricing for serious competitors</h1>
          <p className="text-sm text-muted mt-3 max-w-sm mx-auto">
            AIME qualification is worth $0 to a college if you can&apos;t explain how you solved the problem. Train until you can.
          </p>
        </div>

        {error && (
          <p className="text-center text-sm text-red-400 mb-6">{error}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Free */}
          <div className="p-6 rounded-xl border border-border bg-surface flex flex-col">
            <h2 className="text-sm font-semibold text-text">Free</h2>
            <p className="text-3xl font-semibold tracking-[-0.03em] mt-3">$0</p>
            <p className="text-xs text-muted mt-1">30 sessions / month</p>
            <ul className="text-sm text-muted mt-6 space-y-2.5 flex-1">
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1 h-1 rounded-full bg-muted shrink-0" />
                Socratic coaching on all olympiad subjects
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1 h-1 rounded-full bg-muted shrink-0" />
                Practice problem generation
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1 h-1 rounded-full bg-muted shrink-0" />
                One diagnostic per subject
              </li>
            </ul>
            <Link
              href="/coach"
              className="mt-6 px-4 py-2.5 rounded-lg text-sm font-medium text-center border border-border hover:border-border-2 hover:text-text-2 transition-colors duration-150"
            >
              Start training
            </Link>
          </div>

          {/* Pro */}
          <div className="p-6 rounded-xl border border-accent bg-surface-2 flex flex-col">
            <div className="flex items-center justify-between mb-0.5">
              <h2 className="text-sm font-semibold text-text">Pro</h2>
              <span className="text-2xs text-muted px-2 py-0.5 rounded-full border border-border-2">Competition season</span>
            </div>
            <p className="text-3xl font-semibold tracking-[-0.03em] mt-3">${PRO_PRICE}<span className="text-sm text-muted font-normal">/mo</span></p>
            <p className="text-xs text-muted mt-1">Cancel anytime</p>
            <ul className="text-sm text-muted mt-6 space-y-2.5 flex-1">
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1 h-1 rounded-full bg-accent shrink-0" />
                Unlimited sessions
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1 h-1 rounded-full bg-accent shrink-0" />
                Full adaptive study plan from diagnostic
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1 h-1 rounded-full bg-accent shrink-0" />
                Competition prep campaign mode
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1 h-1 rounded-full bg-accent shrink-0" />
                Week-by-week progress reports
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1 h-1 rounded-full bg-accent shrink-0" />
                Concept-level mastery tracking
              </li>
            </ul>
            <button
              onClick={() => subscribe("pro")}
              disabled={loading !== null}
              className="mt-6 px-4 py-2.5 rounded-lg text-sm font-semibold bg-accent text-background hover:bg-accent-hover disabled:bg-disabled disabled:text-disabled-text transition-all duration-150"
            >
              {loading === "pro" ? "Redirecting…" : "Subscribe"}
            </button>
          </div>

          {/* Team / School */}
          <div className="p-6 rounded-xl border border-border bg-surface flex flex-col">
            <h2 className="text-sm font-semibold text-text">Team / School</h2>
            <p className="text-3xl font-semibold tracking-[-0.03em] mt-3">${TEAM_SEAT_PRICE}<span className="text-sm text-muted font-normal">/seat/mo</span></p>
            <p className="text-xs text-muted mt-1">{TEAM_MIN_SEATS}-seat minimum (${TEAM_MIN_SEATS * TEAM_SEAT_PRICE}/mo floor)</p>
            <ul className="text-sm text-muted mt-6 space-y-2.5 flex-1">
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1 h-1 rounded-full bg-muted shrink-0" />
                Everything in Pro
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1 h-1 rounded-full bg-muted shrink-0" />
                Seat-based billing for clubs and schools
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1 h-1 rounded-full bg-muted shrink-0" />
                Invite-code team management
              </li>
            </ul>
            <div className="mt-4 flex items-center gap-2">
              <label htmlFor="seats" className="text-xs text-muted">Seats</label>
              <input
                id="seats"
                type="number"
                min={TEAM_MIN_SEATS}
                value={seats}
                onChange={(e) => setSeats(Math.max(TEAM_MIN_SEATS, Number(e.target.value) || TEAM_MIN_SEATS))}
                className="w-20 bg-background border border-border rounded-md px-2 py-1 text-sm text-text outline-none focus:border-accent"
              />
              <span className="text-xs text-muted">= ${seats * TEAM_SEAT_PRICE}/mo</span>
            </div>
            <button
              onClick={() => subscribe("team")}
              disabled={loading !== null}
              className="mt-4 px-4 py-2.5 rounded-lg text-sm font-medium text-center border border-border hover:border-border-2 hover:text-text-2 disabled:opacity-50 transition-colors duration-150"
            >
              {loading === "team" ? "Redirecting…" : "Subscribe"}
            </button>
          </div>
        </div>

        {/* ROI callout */}
        <div className="mt-12 p-6 rounded-xl border border-border bg-surface text-center max-w-2xl mx-auto">
          <p className="text-sm text-muted leading-relaxed">
            AIME qualification adds a distinct signal to a college application that no test score or GPA can replicate. At ${PRO_PRICE}/month during a 4-month prep window, the cost is less than a single hour with a private math tutor.
          </p>
        </div>
      </section>
    </div>
  );
}
