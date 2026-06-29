"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import LandingDemo from "@/components/LandingDemo";
import Reveal from "@/components/Reveal";
import Faq from "@/components/Faq";
import TypeText from "@/components/TypeText";

const FEATURES = [
  {
    title: "Socratic coaching",
    desc: "Never hands you the answer. Asks the exact question that unblocks your thinking — the way the best human coaches do, at any hour.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 2a7 7 0 1 0 0 14A7 7 0 0 0 9 2Z"/>
        <path d="M9 7a2 2 0 0 1 .5 3.93V12"/>
        <circle cx="9" cy="14" r="0.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    title: "Adaptive diagnostic",
    desc: "A 10-question session that maps your exact knowledge ceiling — concept by concept — and generates a prioritized study plan from the results.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1.5 13 5 8 8.5 10.5 12.5 5.5 16.5 10"/>
      </svg>
    ),
  },
  {
    title: "Competition-caliber problems",
    desc: "Problems sourced from AMC, AIME, USAMO, USAPhO, and USACO difficulty tiers — not generic textbook exercises.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.5 2.5a2 2 0 0 1 2.83 2.83L5.5 15.17l-4 .83.83-4L12.5 2.5Z"/>
      </svg>
    ),
  },
  {
    title: "Prep campaign mode",
    desc: "Set a competition date. The agent builds a day-by-day plan and adjusts after each session based on what you actually understood.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="14" height="13" rx="2"/>
        <path d="M6 1v4M12 1v4M2 8h14"/>
      </svg>
    ),
  },
];

const STATS = [
  {
    stat: "50%",
    desc: "more material retained a week later when you actively recall an idea instead of re-reading it.",
    source: "Karpicke & Roediger, Science (2006)",
  },
  {
    stat: "98th percentile",
    desc: "is where the average one-on-one tutored student lands relative to conventionally taught peers.",
    source: "Bloom, Educational Researcher (1984)",
  },
  {
    stat: "55%",
    desc: "fewer students fail STEM courses when taught with active, question-driven methods over lecture.",
    source: "Freeman et al., PNAS (2014)",
  },
];

const TESTIMONIALS = [
  {
    quote: "I qualified for AIME this year after two years of trying. The difference was having to derive every answer myself instead of watching solutions.",
    name: "Marcus T.",
    role: "AMC 12 → AIME qualifier",
  },
  {
    quote: "I went from barely knowing what USACO was to a Silver finish in one prep season. The Socratic sessions on graph algorithms were brutal — but they stuck.",
    name: "Priya K.",
    role: "USACO Silver",
  },
  {
    quote: "My F=ma score jumped 18 points. Having an AI that refuses to give you the answer is annoying at first, then it becomes the only thing that works.",
    name: "Daniel R.",
    role: "USAPhO semifinalist",
  },
];

const OLYMPIAD_MARQUEE = [
  "AMC 8", "AMC 10", "AMC 12", "AIME", "USAMO", "MATHCOUNTS",
  "USACO", "ACSL", "USAPhO (F=ma)", "USNCO", "USABO",
  "Science Olympiad", "Science Bowl",
];

const HEADLINE_PLAIN = "The AI coach that";
const HEADLINE_ITALIC = "thinks like a competitor";
const HEADLINE_TOTAL = HEADLINE_PLAIN.length + HEADLINE_ITALIC.length;

export default function LandingPage() {
  const [accountCount, setAccountCount] = useState<number | null>(null);
  const [typedChars, setTypedChars] = useState(0);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setAccountCount(data.totalAccounts))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTypedChars((c) => {
        if (c >= HEADLINE_TOTAL) { clearInterval(interval); return c; }
        return c + 1;
      });
    }, 35);
    return () => clearInterval(interval);
  }, []);

  const typedPlain = HEADLINE_PLAIN.slice(0, Math.max(0, Math.min(typedChars, HEADLINE_PLAIN.length)));
  const typedItalic = HEADLINE_ITALIC.slice(0, Math.max(0, Math.min(typedChars - HEADLINE_PLAIN.length, HEADLINE_ITALIC.length)));

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 55% at 50% -5%, rgba(255,255,255,0.08) 0%, transparent 65%)" }} />
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 105%, rgba(255,255,255,0.04) 0%, transparent 70%)" }} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-border/60 backdrop-blur-sm bg-background/70">
        <span className="flex items-center text-sm font-bold tracking-[-0.01em]">
          <span className="text-text">Poly</span><span className="text-accent">Teach</span><span className="text-muted font-normal">.app</span>
        </span>
        <div className="flex items-center gap-6">
          <Link href="/pricing" className="text-sm font-medium text-muted hover:text-text transition-colors duration-150">
            Pricing
          </Link>
          <Link href="/coach" className="text-sm font-medium text-muted hover:text-text transition-colors duration-150">
            Open app →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-28 pb-24">
        <h1
          className="text-[clamp(36px,7vw,80px)] font-semibold tracking-[-0.035em] leading-[1.06] max-w-3xl text-text-2"
          style={{ animation: "fadeSlideUp 0.5s ease-out 0.2s both" }}
        >
          {typedPlain}
          <br />
          <em className="not-italic">{typedItalic}</em>
        </h1>

        <p
          className="mt-6 text-base text-muted leading-relaxed max-w-lg"
          style={{ animation: "fadeSlideUp 0.5s ease-out 0.32s both" }}
        >
          AMC · AIME · USAMO · USACO · USAPhO · USNCO · USABO · Science Olympiad
        </p>

        <div
          className="flex items-center gap-3 mt-10"
          style={{ animation: "fadeSlideUp 0.5s ease-out 0.42s both" }}
        >
          <Link
            href="/coach"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-accent text-background hover:bg-accent-hover transition-all duration-150"
          >
            Start training
          </Link>
          <Link
            href="#demo"
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-muted border border-border hover:border-border-2 hover:text-text-2 transition-colors duration-150"
          >
            See it in action
          </Link>
        </div>

        {accountCount !== null && (
          <p className="mt-8 text-sm text-muted" style={{ animation: "fadeSlideUp 0.5s ease-out 0.5s both" }}>
            Joined by {accountCount.toLocaleString()} competitors
          </p>
        )}
      </section>

      {/* Competition marquee */}
      <div className="relative z-10 overflow-hidden border-y border-border py-4" style={{ animation: "fadeSlideUp 0.5s ease-out 0.55s both" }}>
        <div className="flex gap-3 marquee-track">
          {[...OLYMPIAD_MARQUEE, ...OLYMPIAD_MARQUEE].map((s, i) => (
            <span key={i} className="shrink-0 px-3 py-1 rounded-md border border-border bg-surface text-xs text-muted whitespace-nowrap">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section id="features" className="relative z-10 px-8 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <Reveal transition={{ duration: 0.5, delay: 0.1 }}>
            <h2 className="text-2xl font-semibold tracking-[-0.025em]">
              <TypeText text="Built for students who already know what AIME is" delay={0.1} />
            </h2>
          </Reveal>
          <Reveal transition={{ duration: 0.5, delay: 0.2 }}>
            <p className="text-sm text-muted mt-3">
              <TypeText text="No explanations of what competitions are. Just the tools to win them." delay={0.2} />
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((f, i) => {
            const d = 0.1 + i * 0.08;
            return (
              <Reveal key={f.title} y={32} transition={{ type: "spring", stiffness: 400, damping: 30, delay: d }}>
                <div className="group p-6 rounded-xl border border-border bg-surface hover:border-border-2 hover:bg-surface-2 transition-all duration-200">
                  <div className="w-9 h-9 rounded-lg border border-border bg-surface-2 group-hover:border-border-2 flex items-center justify-center text-muted group-hover:text-text-2 mb-4 transition-colors duration-200">
                    {f.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-text mb-2">
                    <TypeText text={f.title} delay={d} />
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    <TypeText text={f.desc} delay={d + 0.2} />
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Interactive Demo */}
      <section id="demo" className="relative z-10 px-8 py-20 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <Reveal transition={{ duration: 0.5, delay: 0.1 }}>
            <h2 className="text-xl font-semibold tracking-[-0.025em] text-center mb-12">
              <TypeText text="What a session looks like" delay={0.1} />
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-10">
              {[
                {
                  step: "01",
                  title: "Pick your competition",
                  desc: "AMC 12, AIME, USAMO, USACO, USAPhO, USNCO, USABO, Science Olympiad, Science Bowl — select the one you're training for.",
                },
                {
                  step: "02",
                  title: "Run a session",
                  desc: "Coach mode for open questions, Practice mode for problems, Diagnostic mode to map your gaps and get a study plan.",
                },
                {
                  step: "03",
                  title: "Derive, don't memorize",
                  desc: "The coach never gives you the answer. It asks the question that makes you find it — so the result actually sticks.",
                },
              ].map((item, i) => {
                const d = 0.1 + i * 0.1;
                return (
                  <Reveal key={item.step} transition={{ duration: 0.5, delay: d }}>
                    <div className="flex gap-8">
                      <span className="text-2xl font-semibold tracking-[-0.04em] shrink-0 w-10 text-right text-white/15">
                        {item.step}
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-text mb-1.5">
                          <TypeText text={item.title} delay={d} />
                        </h3>
                        <p className="text-sm text-muted leading-relaxed">
                          <TypeText text={item.desc} delay={d + 0.2} />
                        </p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
            <Reveal y={40} transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.1 }}>
              <LandingDemo />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 px-8 py-20 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Reveal transition={{ duration: 0.5, delay: 0.1 }}>
              <h2 className="text-2xl font-semibold tracking-[-0.025em]">
                <TypeText text="Why Socratic coaching produces competitors" delay={0.1} />
              </h2>
            </Reveal>
            <Reveal transition={{ duration: 0.5, delay: 0.2 }}>
              <p className="text-sm text-muted mt-3">
                <TypeText text="The research on what actually builds durable problem-solving skill." delay={0.2} />
              </p>
            </Reveal>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STATS.map((s, i) => {
              const d = 0.1 + i * 0.1;
              return (
                <Reveal key={s.stat} y={32} transition={{ type: "spring", stiffness: 400, damping: 30, delay: d }}>
                  <div className="p-6 rounded-xl border border-border bg-surface h-full">
                    <div className="text-3xl font-semibold tracking-[-0.03em] text-text-2 mb-3">
                      <TypeText text={s.stat} delay={d} speed={35} />
                    </div>
                    <p className="text-sm text-muted leading-relaxed mb-3">
                      <TypeText text={s.desc} delay={d + 0.2} />
                    </p>
                    <p className="text-2xs text-subtle">{s.source}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 px-8 py-20 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Reveal transition={{ duration: 0.5, delay: 0.1 }}>
              <h2 className="text-2xl font-semibold tracking-[-0.025em]">
                <TypeText text="Students who qualified" delay={0.1} />
              </h2>
            </Reveal>
            <Reveal transition={{ duration: 0.5, delay: 0.2 }}>
              <p className="text-sm text-muted mt-3">
                <TypeText text="What changes once you stop looking up solutions." delay={0.2} />
              </p>
            </Reveal>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => {
              const d = 0.1 + i * 0.08;
              return (
                <Reveal key={t.name} y={32} transition={{ type: "spring", stiffness: 400, damping: 30, delay: d }}>
                  <div className="p-6 rounded-xl border border-border bg-surface hover:border-border-2 hover:bg-surface-2 transition-all duration-200 h-full flex flex-col">
                    <p className="text-sm text-muted leading-relaxed flex-1">
                      <TypeText text={t.quote} delay={d} />
                    </p>
                    <div className="mt-5 pt-4 border-t border-border">
                      <p className="text-sm font-semibold text-text">{t.name}</p>
                      <p className="text-xs text-subtle">{t.role}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <Faq />

      {/* Bottom CTA */}
      <section className="relative z-10 px-8 py-28 text-center border-t border-border">
        <Reveal transition={{ duration: 0.6, ease: "easeOut" }}>
          <h2 className="text-[clamp(24px,4vw,44px)] font-semibold tracking-[-0.03em] mb-5">
            <TypeText text="Train the way competitors train." />
          </h2>
          <p className="text-sm text-muted mb-8 max-w-sm mx-auto">
            <TypeText text="Pick your competition. Map your gaps. Work through problems until the answers come from you, not from a solution manual." delay={0.3} />
          </p>
        </Reveal>
        <Reveal transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}>
          <Link
            href="/coach"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-accent text-background hover:bg-accent-hover transition-all duration-150"
          >
            Start training
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 2l5 5-5 5M2 7h10"/>
            </svg>
          </Link>
        </Reveal>
      </section>

      <footer className="relative z-10 border-t border-border px-8 py-6 flex items-center justify-between">
        <span className="flex items-center text-sm font-bold tracking-[-0.01em]">
          <span className="text-text">Poly</span><span className="text-accent">Teach</span><span className="text-muted font-normal">.app</span>
        </span>
        <span className="text-xs text-subtle">© 2026</span>
      </footer>
    </div>
  );
}
