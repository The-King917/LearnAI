"use client";
import Link from "next/link";

const FEATURES = [
  {
    title: "Socratic coaching",
    desc: "Never hands you the answer. Asks the exact question that unblocks your thinking — every time.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 2a7 7 0 1 0 0 14A7 7 0 0 0 9 2Z"/>
        <path d="M9 7a2 2 0 0 1 .5 3.93V12"/>
        <circle cx="9" cy="14" r="0.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    title: "Practice problems",
    desc: "Generates competition-caliber problems with three progressively revealing hints, then a full solution.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.5 2.5a2 2 0 0 1 2.83 2.83L5.5 15.17l-4 .83.83-4L12.5 2.5Z"/>
      </svg>
    ),
  },
  {
    title: "Level diagnostic",
    desc: "An adaptive 8–10 question quiz that maps your strengths and gaps, then hands you a study plan.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1.5 13 5 8 8.5 10.5 12.5 5.5 16.5 10"/>
      </svg>
    ),
  },
  {
    title: "60+ subjects",
    desc: "AMC, AIME, USAMO, USACO, all 38 AP courses, DECA, Science Olympiad, Policy Debate, and more.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4h14M2 9h14M2 14h8"/>
      </svg>
    ),
  },
];

const SUBJECTS_MARQUEE = [
  "AMC 8", "AMC 10", "AMC 12", "AIME", "USAMO", "MATHCOUNTS",
  "USACO", "ACSL", "F=ma", "USNCO", "USABO", "Science Olympiad",
  "AP Calculus BC", "AP Physics C", "AP Chemistry", "AP Biology",
  "AP US History", "AP Computer Science A", "DECA", "FBLA", "HOSA",
  "Policy Debate", "LD Debate", "Science Bowl", "Quiz Bowl", "Model UN",
  "AP Statistics", "AP Economics", "AP Psychology", "AP English Lit",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-text">
      {/* Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 55% at 50% -5%, rgba(255,255,255,0.08) 0%, transparent 65%)",
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 105%, rgba(255,255,255,0.04) 0%, transparent 70%)",
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-border/60 backdrop-blur-sm bg-background/70">
        <span className="flex items-center text-sm font-semibold tracking-[-0.01em]">
          Learn
          <span className="ml-1 px-1.5 py-0.5 rounded-[3px] bg-white text-background text-2xs font-bold tracking-[0.02em]">AI</span>
        </span>
        <Link
          href="/coach"
          className="text-sm font-medium text-muted hover:text-text transition-colors duration-150"
        >
          Open app →
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-28 pb-24">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-2xs font-medium text-muted uppercase tracking-[0.08em] mb-10"
          style={{ animation: "fadeSlideUp 0.5s ease-out 0.1s both" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
          AI study companion
        </div>

        <h1
          className="text-[clamp(36px,7vw,80px)] font-semibold tracking-[-0.035em] leading-[1.06] max-w-3xl"
          style={{ animation: "fadeSlideUp 0.5s ease-out 0.2s both" }}
        >
          The AI coach that
          <br />
          <span
            className="italic"
            style={{ textShadow: "0 0 30px rgba(255,255,255,0.35)" }}
          >
            teaches
          </span>
          <span className="text-muted">, not tells.</span>
        </h1>

        <p
          className="mt-6 text-base text-muted leading-relaxed max-w-lg"
          style={{ animation: "fadeSlideUp 0.5s ease-out 0.32s both" }}
        >
          Every expert you need, in one conversation.
        </p>

        <div
          className="flex items-center gap-3 mt-10"
          style={{ animation: "fadeSlideUp 0.5s ease-out 0.42s both" }}
        >
          <Link
            href="/coach"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-white text-background hover:bg-white/85 transition-all duration-150"
          >
            Start learning
          </Link>
          <Link
            href="#features"
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-muted border border-border hover:border-border-2 hover:text-text-2 transition-colors duration-150"
          >
            See how it works
          </Link>
        </div>
      </section>

      {/* Subjects marquee */}
      <div
        className="relative z-10 overflow-hidden border-y border-border py-4"
        style={{ animation: "fadeSlideUp 0.5s ease-out 0.55s both" }}
      >
        <div className="flex gap-3 marquee-track">
          {[...SUBJECTS_MARQUEE, ...SUBJECTS_MARQUEE].map((s, i) => (
            <span
              key={i}
              className="shrink-0 px-3 py-1 rounded-md border border-border bg-surface text-xs text-muted whitespace-nowrap"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section
        id="features"
        className="relative z-10 px-8 py-24 max-w-5xl mx-auto"
        style={{ animation: "fadeSlideUp 0.5s ease-out 0.6s both" }}
      >
        <div className="text-center mb-16">
          <h2 className="text-2xl font-semibold tracking-[-0.025em]">Everything you need to level up</h2>
          <p className="text-sm text-muted mt-3">Built around one principle: understanding beats memorization.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group p-6 rounded-xl border border-border bg-surface hover:border-border-2 hover:bg-surface-2 transition-all duration-200"
            >
              <div className="w-9 h-9 rounded-lg border border-border bg-surface-2 group-hover:border-border-2 flex items-center justify-center text-muted group-hover:text-text-2 mb-4 transition-colors duration-200">
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold text-text mb-2">{f.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-8 py-20 border-t border-border">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold tracking-[-0.025em] text-center mb-12">How it works</h2>
          <div className="space-y-10">
            {[
              {
                step: "01",
                title: "Pick your subject",
                desc: "Choose from 60+ subjects — math competitions, science olympiads, AP courses, debate, business, and more.",
              },
              {
                step: "02",
                title: "Choose a mode",
                desc: "Open-ended Socratic coaching, practice problem generation, or a full adaptive diagnostic.",
              },
              {
                step: "03",
                title: "Work through problems together",
                desc: "LearnAI never gives direct answers. It asks the question that moves you forward — building genuine mastery.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-8">
                <span
                  className="text-2xl font-semibold tracking-[-0.04em] shrink-0 w-10 text-right text-white/15"
                >
                  {item.step}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-text mb-1.5">{item.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 px-8 py-28 text-center border-t border-border">
        <h2 className="text-[clamp(24px,4vw,44px)] font-semibold tracking-[-0.03em] mb-5">
          Ready to actually understand?
        </h2>
        <p className="text-sm text-muted mb-8 max-w-sm mx-auto">
          Stop looking up answers. Start building the intuition that wins competitions.
        </p>
        <Link
          href="/coach"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-white text-background hover:bg-white/85 transition-all duration-150"
        >
          Start learning
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 2l5 5-5 5M2 7h10"/>
          </svg>
        </Link>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border px-8 py-6 flex items-center justify-between">
        <span className="flex items-center text-sm font-semibold tracking-[-0.01em]">
          Learn
          <span className="ml-1 px-1.5 py-0.5 rounded-[3px] bg-white text-background text-2xs font-bold tracking-[0.02em]">AI</span>
        </span>
        <span className="text-xs text-subtle">© 2026</span>
      </footer>

    </div>
  );
}
