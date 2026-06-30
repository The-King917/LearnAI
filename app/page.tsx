"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Syne } from "next/font/google";

const syne = Syne({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], display: "swap" });
import LandingDemo from "@/components/LandingDemo";
import Reveal from "@/components/Reveal";
import Faq from "@/components/Faq";
import FloatingSymbols from "@/components/FloatingSymbols";
import { TEAM_MIN_SEATS, TEAM_SEAT_PRICE, PRO_PRICE } from "@/lib/billing";

// ── Data ────────────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote: "I qualified for AIME this year after two years of trying. The difference was having to derive every answer myself instead of watching solutions.",
    name: "Marcus T.",
    role: "AMC 12 → AIME qualifier",
    initials: "MT",
  },
  {
    quote: "I went from barely knowing what USACO was to a Silver finish in one prep season. The Socratic sessions on graph algorithms were brutal — but they stuck.",
    name: "Priya K.",
    role: "USACO Silver",
    initials: "PK",
  },
  {
    quote: "My F=ma score jumped 18 points. Having an AI that refuses to give you the answer is annoying at first, then it becomes the only thing that works.",
    name: "Daniel R.",
    role: "USAPhO semifinalist",
    initials: "DR",
  },
];

const STATS = [
  { stat: "50%", desc: "more material retained when you actively recall vs. re-reading.", source: "Karpicke & Roediger, Science (2006)" },
  { stat: "98th pct", desc: "where the average tutored student lands relative to lecture-taught peers.", source: "Bloom, Educational Researcher (1984)" },
  { stat: "55%", desc: "fewer STEM failures when taught with question-driven active methods.", source: "Freeman et al., PNAS (2014)" },
];

const OLYMPIAD_MARQUEE = [
  "AMC 8", "AMC 10", "AMC 12", "AIME", "USAMO", "MATHCOUNTS",
  "USACO", "ACSL", "F=ma", "USNCO", "USABO", "Science Olympiad", "Science Bowl",
];

const EASE = [0.16, 1, 0.3, 1] as const;

// ── Sub-components ───────────────────────────────────────────────────────────

function AppWindow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 40px 100px rgba(0,0,0,0.85), 0 0 100px rgba(232,168,32,0.07)",
      }}
    >
      <div className="flex items-center gap-2 px-4 py-3 bg-[#111] border-b border-white/[0.06]">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
          <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-6 py-1 rounded-[5px] bg-white/[0.04] border border-white/[0.07] text-[11px] text-white/30 font-mono">
            polyteach.app
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

function ChatPreview() {
  return (
    <div className="space-y-3 p-4 pt-2">
      <div className="flex justify-end">
        <div className="px-3 py-2 rounded-xl rounded-br-sm bg-surface-2 border border-border-2 text-xs text-text max-w-[85%] leading-relaxed">
          How do I count arrangements of AABBCC?
        </div>
      </div>
      <div className="flex gap-2">
        <div className="w-4 h-4 rounded-md bg-accent flex items-center justify-center shrink-0 mt-0.5">
          <svg width="7" height="7" viewBox="0 0 10 10" fill="none" stroke="black" strokeWidth="2.2"><path d="M1 5.5L3.5 8 9 2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div className="text-xs text-text-2 leading-relaxed">If all 6 letters were distinct, how many arrangements would there be?</div>
      </div>
      <div className="flex justify-end">
        <div className="px-3 py-2 rounded-xl rounded-br-sm bg-surface-2 border border-border-2 text-xs text-text max-w-[85%]">6! = 720</div>
      </div>
      <div className="flex gap-2">
        <div className="w-4 h-4 rounded-md bg-accent flex items-center justify-center shrink-0 mt-0.5">
          <svg width="7" height="7" viewBox="0 0 10 10" fill="none" stroke="black" strokeWidth="2.2"><path d="M1 5.5L3.5 8 9 2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div className="text-xs text-text-2 leading-relaxed">Good. Now the two A's are identical — how does that affect the count?</div>
      </div>
    </div>
  );
}

function DiagnosticPreview() {
  const bars = [
    { topic: "Algebra", pct: 82, color: "bg-green-500/60" },
    { topic: "Combinatorics", pct: 64, color: "bg-accent/60" },
    { topic: "Number Theory", pct: 41, color: "bg-yellow-500/60" },
    { topic: "Geometry", pct: 28, color: "bg-red-500/60" },
  ];
  return (
    <div className="p-4 pt-2 space-y-2.5">
      <p className="text-2xs text-accent font-medium uppercase tracking-wider mb-3">Level assessment</p>
      {bars.map(({ topic, pct, color }) => (
        <div key={topic} className="flex items-center gap-2.5">
          <span className="text-2xs text-text-2 w-[88px] shrink-0">{topic}</span>
          <div className="flex-1 h-1.5 bg-surface-2 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-2xs text-text-2 w-6 text-right">{pct}%</span>
        </div>
      ))}
    </div>
  );
}

function ProblemPreview() {
  return (
    <div className="p-4 pt-2">
      <p className="text-2xs text-accent font-medium uppercase tracking-wider mb-3">AMC 12 · Problem 14</p>
      <p className="text-xs text-text leading-relaxed mb-4">
        How many positive integers n ≤ 100 satisfy n² − n + 1 ≡ 0 (mod 7)?
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {["A) 13", "B) 14", "C) 15", "D) 16"].map((c) => (
          <div key={c} className="px-2 py-1.5 rounded-lg border border-border-2 text-2xs text-text-2 text-center">{c}</div>
        ))}
      </div>
    </div>
  );
}

function CalendarPreview() {
  return (
    <div className="p-4 pt-2">
      <p className="text-2xs text-accent font-medium uppercase tracking-wider mb-3">AMC 12 prep · 44 days left</p>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["M","T","W","T","F","S","S"].map((d, i) => (
          <div key={i} className="text-center text-2xs text-[#555]">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 28 }).map((_, i) => (
          <div
            key={i}
            className={`h-5 rounded-sm ${
              i < 16 ? "bg-accent/30" :
              i === 16 ? "bg-accent ring-1 ring-accent/60" :
              "bg-surface-2"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ── Horizontal sticky-scroll feature section ─────────────────────────────────

const FEATURE_PANELS = [
  {
    index: "01",
    tag: "Coach mode",
    title: "Socratic coaching",
    desc: "Never hands you the answer. Asks the exact question that unblocks your thinking — at any hour.",
    preview: <ChatPreview />,
    label: "AMC 12 · Counting & Probability",
  },
  {
    index: "02",
    tag: "Practice mode",
    title: "Competition-caliber problems",
    desc: "Problems matched to real contest difficulty — not generic textbook exercises.",
    preview: <ProblemPreview />,
    label: "AMC 12 · Problem set",
  },
  {
    index: "03",
    tag: "Diagnose mode",
    title: "Adaptive diagnostic",
    desc: "10 questions that map your knowledge ceiling concept-by-concept and generate a study plan.",
    preview: <DiagnosticPreview />,
    label: "AIME · Level assessment",
  },
  {
    index: "04",
    tag: "Prep campaign",
    title: "Day-by-day study plan",
    desc: "Set a competition date. The agent builds a daily plan and adjusts after each session based on what you actually understood.",
    preview: <CalendarPreview />,
    label: "AMC 12 prep · 44 days",
  },
];

function FeatureScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["0vw", `${-(FEATURE_PANELS.length - 1) * 100}vw`]);
  const panelIndex = useTransform(scrollYProgress, [0, 1], [0, FEATURE_PANELS.length - 1]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    return panelIndex.on("change", (v) => setActiveIndex(Math.round(v)));
  }, [panelIndex]);

  return (
    <section ref={ref} style={{ height: `${FEATURE_PANELS.length * 100}vh` }} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        {/* Section header */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none">
          <p className="text-xs font-medium text-accent uppercase tracking-[0.12em] mb-2">What you get</p>
        </div>

        {/* Progress dots */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {FEATURE_PANELS.map((_, i) => (
            <div
              key={i}
              className="h-[3px] rounded-full transition-all duration-500"
              style={{
                width: i === activeIndex ? "24px" : "8px",
                backgroundColor: i === activeIndex ? "rgba(232,168,32,1)" : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>

        {/* Sliding track */}
        <motion.div style={{ x }} className="flex will-change-transform">
          {FEATURE_PANELS.map((panel) => (
            <div
              key={panel.index}
              className="w-screen shrink-0 flex items-center justify-center px-8 md:px-16"
            >
              <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
                {/* Text side */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-4xl font-semibold tabular-nums" style={{ color: "rgba(255,255,255,0.07)" }}>{panel.index}</span>
                    <span className="text-xs font-medium text-accent uppercase tracking-[0.1em]">{panel.tag}</span>
                  </div>
                  <h3 className="text-[clamp(28px,3.5vw,48px)] font-semibold tracking-[-0.03em] leading-[1.1] mb-4">
                    {panel.title}
                  </h3>
                  <p className="text-base text-text-2 leading-relaxed max-w-sm">
                    {panel.desc}
                  </p>
                </div>

                {/* Preview side */}
                <AppWindow>
                  <div className="bg-[#0d0d0d]">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-surface-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <span className="text-2xs text-text-2">{panel.label}</span>
                    </div>
                    {panel.preview}
                  </div>
                </AppWindow>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [accountCount, setAccountCount] = useState<number | null>(null);
  const [seats, setSeats] = useState(TEAM_MIN_SEATS);
  const [checkoutLoading, setCheckoutLoading] = useState<"pro" | "team" | null>(null);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setAccountCount(d.totalAccounts))
      .catch(() => {});
  }, []);

  const subscribe = async (kind: "pro" | "team") => {
    setCheckoutError("");
    setCheckoutLoading(kind);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(kind === "team" ? { kind, seats } : { kind }),
      });
      const data: { error?: string; url?: string } = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Server returned ${res.status}`);
      if (!data.url) throw new Error("No checkout URL returned");
      window.location.href = data.url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Something went wrong");
      setCheckoutLoading(null);
    }
  };

  return (
    <div className={`${syne.className} min-h-screen bg-background text-text overflow-x-hidden`}>
      {/* Static dot grid */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <FloatingSymbols />

      {/* ── Nav ── */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-5 border-b border-white/[0.06] backdrop-blur-md bg-background/80">
        <span className="flex items-center text-sm font-bold tracking-tight">
          <span className="text-text">Poly</span><span className="text-accent">Teach</span>
        </span>
        <div className="flex items-center gap-6">
          <Link href="#pricing" className="text-sm text-text-2 hover:text-text transition-colors duration-150">Pricing</Link>
          <Link href="/coach" className="text-sm font-semibold px-4 py-2 rounded-lg bg-accent text-background hover:bg-accent-hover transition-all duration-150">
            Open app →
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-28 pb-0">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div style={{ position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)", width: "900px", height: "500px", background: "radial-gradient(ellipse, rgba(232,168,32,0.10) 0%, transparent 65%)", filter: "blur(40px)" }} />
        </div>

        {/* Social proof */}
        {accountCount !== null && (
          <motion.p
            className="mb-7 text-xs text-text-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            Joined by {accountCount.toLocaleString()}+ competitors
          </motion.p>
        )}

        {/* Headline — deliberately tighter */}
        <motion.h1
          className="text-[clamp(28px,3.8vw,52px)] font-semibold tracking-[-0.03em] leading-[1.08] max-w-2xl text-white"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
        >
          YOUR COACH THAT
          <br />
          <span className="text-accent">THINKS LIKE YOUR COMPETITOR</span>
        </motion.h1>

        <motion.p
          className="mt-5 text-base text-text-2 leading-relaxed max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.18 }}
        >
          Socratic AI coaching for AMC · AIME · USAMO · USACO · USAPhO · USNCO · USABO · Science Olympiad
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3 mt-9"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.28 }}
        >
          <Link
            href="/coach"
            className="px-6 py-3 rounded-xl text-sm font-semibold bg-accent text-background hover:bg-accent-hover transition-all duration-150 shadow-[0_0_24px_rgba(232,168,32,0.25)]"
          >
            Start training free
          </Link>
          <Link
            href="#demo"
            className="px-6 py-3 rounded-xl text-sm font-medium border border-white/10 text-text-2 hover:border-white/20 hover:text-text transition-all duration-150"
          >
            See it in action ↓
          </Link>
        </motion.div>

        {/* Hero app screenshot */}
        <motion.div
          className="relative mt-16 w-full max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 48, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.42 }}
        >
          <AppWindow>
            <div className="p-6 bg-[#0d0d0d]">
              <LandingDemo />
            </div>
          </AppWindow>
          <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, #0A0A0A)" }} />
        </motion.div>
      </section>

      {/* ── Competition marquee ── */}
      <div className="relative z-10 overflow-hidden border-y border-white/[0.06] py-4 mt-4">
        <div className="flex gap-3 marquee-track">
          {[...OLYMPIAD_MARQUEE, ...OLYMPIAD_MARQUEE].map((s, i) => (
            <span key={i} className="shrink-0 px-3 py-1 rounded-md border border-border-2 bg-surface text-xs text-text-2 whitespace-nowrap">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* ── Horizontal sticky feature scroll ── */}
      <div className="relative z-10">
        <FeatureScroll />
      </div>

      {/* ── Live Demo ── */}
      <section id="demo" className="relative z-10 px-8 py-32">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-20">
              <p className="text-xs font-medium text-accent uppercase tracking-[0.12em] mb-4">Live demo</p>
              <h2 className="text-[clamp(24px,3.5vw,42px)] font-semibold tracking-[-0.03em]">What a session looks like</h2>
              <p className="text-sm text-text-2 mt-4 max-w-md mx-auto leading-relaxed">The coach never gives you the answer. It asks the question that makes you find it.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-12 order-2 lg:order-1">
              {[
                { step: "01", title: "Pick your competition", desc: "AMC 12, AIME, USAMO, USACO, USAPhO, USNCO, USABO — select the one you're training for." },
                { step: "02", title: "Run a session", desc: "Coach mode for open questions, Practice for problems, Diagnose to map your gaps and get a study plan." },
                { step: "03", title: "Derive, don't memorize", desc: "The coach never gives you the answer. It asks the question that makes you find it — so it actually sticks." },
              ].map((item, i) => (
                <Reveal key={item.step} delay={i * 0.1}>
                  <div className="flex gap-6">
                    <span className="text-3xl font-semibold tracking-[-0.04em] shrink-0 w-10 text-white/10 tabular-nums">{item.step}</span>
                    <div>
                      <h3 className="text-base font-semibold text-text mb-1.5">{item.title}</h3>
                      <p className="text-sm text-text-2 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal y={40} delay={0.1} className="order-1 lg:order-2">
              <AppWindow>
                <div className="p-6 bg-[#0d0d0d]">
                  <LandingDemo />
                </div>
              </AppWindow>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="relative z-10 px-8 py-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: "700px", height: "400px", background: "radial-gradient(ellipse, rgba(232,168,32,0.05) 0%, transparent 65%)", filter: "blur(60px)" }} />
        </div>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-20">
              <p className="text-xs font-medium text-accent uppercase tracking-[0.12em] mb-4">Student results</p>
              <h2 className="text-[clamp(24px,3.5vw,42px)] font-semibold tracking-[-0.03em]">Students who qualified</h2>
              <p className="text-sm text-text-2 mt-4">What changes once you stop looking up solutions.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} y={40} delay={i * 0.12}>
                <div
                  className="relative flex flex-col h-full p-8 rounded-2xl border border-white/[0.08] bg-surface hover:border-white/[0.14] transition-all duration-300 overflow-hidden"
                  style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.4)" }}
                >
                  <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full" style={{ background: "radial-gradient(circle, rgba(232,168,32,0.06) 0%, transparent 70%)" }} />
                  <div className="text-6xl text-accent/40 font-serif leading-none mb-5 select-none">&ldquo;</div>
                  <p className="text-base text-text leading-relaxed flex-1 mb-8">{t.quote}</p>
                  <div className="flex items-center gap-3 pt-5 border-t border-white/[0.07]">
                    <div className="w-9 h-9 rounded-full border border-accent/25 flex items-center justify-center text-xs font-bold text-accent shrink-0" style={{ backgroundColor: "rgba(232,168,32,0.12)" }}>
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text">{t.name}</p>
                      <p className="text-xs text-text-2">{t.role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="relative z-10 px-8 py-32">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-20">
              <p className="text-xs font-medium text-accent uppercase tracking-[0.12em] mb-4">The research</p>
              <h2 className="text-[clamp(24px,3.5vw,42px)] font-semibold tracking-[-0.03em]">Why Socratic coaching produces competitors</h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {STATS.map((s, i) => (
              <Reveal key={s.stat} y={32} delay={i * 0.12}>
                <div
                  className="p-8 rounded-2xl border border-white/[0.08] bg-surface h-full"
                  style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.4)" }}
                >
                  <div className="text-4xl font-semibold tracking-[-0.04em] mb-4 text-accent">{s.stat}</div>
                  <p className="text-sm text-text-2 leading-relaxed mb-4">{s.desc}</p>
                  <p className="text-2xs text-[#555]">{s.source}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="relative z-10 px-8 py-32">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <p className="text-xs font-medium text-accent uppercase tracking-[0.12em] mb-4">Pricing</p>
              <h2 className="text-[clamp(24px,3.5vw,42px)] font-semibold tracking-[-0.03em]">Simple pricing for serious competitors</h2>
              <p className="text-sm text-text-2 mt-4 max-w-sm mx-auto leading-relaxed">
                AIME qualification is worth $0 to a college if you can&apos;t explain how you solved the problem.
              </p>
            </div>
          </Reveal>

          {checkoutError && (
            <p className="text-center text-sm text-red-400 mb-6">{checkoutError}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Free */}
            <Reveal y={32} delay={0.05}>
              <div className="h-full p-7 rounded-2xl border border-white/[0.08] bg-surface flex flex-col" style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.4)" }}>
                <p className="text-xs font-medium text-text-2 uppercase tracking-wider">Free</p>
                <div className="mt-4 mb-1">
                  <span className="text-4xl font-semibold tracking-[-0.03em]">$0</span>
                </div>
                <p className="text-xs text-text-2 mb-7">30 sessions / month</p>
                <ul className="space-y-3 flex-1 mb-8">
                  {["Socratic coaching on all subjects", "Practice problem generation", "One diagnostic per subject"].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-text-2">
                      <span className="mt-[5px] w-1 h-1 rounded-full bg-border-3 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/coach" className="px-4 py-2.5 rounded-xl text-sm font-medium text-center border border-white/[0.1] text-text-2 hover:border-white/[0.2] hover:text-text transition-all duration-150">
                  Start training
                </Link>
              </div>
            </Reveal>

            {/* Pro */}
            <Reveal y={32} delay={0.12}>
              <div className="relative h-full p-7 rounded-2xl border border-accent bg-surface-2 flex flex-col" style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.5), 0 0 40px rgba(232,168,32,0.08)" }}>
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs font-medium text-accent uppercase tracking-wider">Pro</p>
                  <span className="text-2xs text-text-2 px-2 py-0.5 rounded-full border border-white/[0.1]">Most popular</span>
                </div>
                <div className="mt-4 mb-1">
                  <span className="text-4xl font-semibold tracking-[-0.03em]">${PRO_PRICE}</span>
                  <span className="text-sm text-text-2 font-normal ml-1">/mo</span>
                </div>
                <p className="text-xs text-text-2 mb-7">Cancel anytime</p>
                <ul className="space-y-3 flex-1 mb-8">
                  {["Unlimited sessions", "Full adaptive study plan from diagnostic", "Competition prep campaign mode", "Week-by-week progress reports", "Concept-level mastery tracking"].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-text-2">
                      <span className="mt-[5px] w-1 h-1 rounded-full bg-accent shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => subscribe("pro")} disabled={checkoutLoading !== null} className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-accent text-background hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150">
                  {checkoutLoading === "pro" ? "Redirecting…" : "Subscribe"}
                </button>
              </div>
            </Reveal>

            {/* Team */}
            <Reveal y={32} delay={0.18}>
              <div className="h-full p-7 rounded-2xl border border-white/[0.08] bg-surface flex flex-col" style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.4)" }}>
                <p className="text-xs font-medium text-text-2 uppercase tracking-wider">Team / School</p>
                <div className="mt-4 mb-1">
                  <span className="text-4xl font-semibold tracking-[-0.03em]">${TEAM_SEAT_PRICE}</span>
                  <span className="text-sm text-text-2 font-normal ml-1">/seat/mo</span>
                </div>
                <p className="text-xs text-text-2 mb-7">{TEAM_MIN_SEATS}-seat minimum</p>
                <ul className="space-y-3 flex-1 mb-6">
                  {["Everything in Pro", "Seat-based billing for clubs and schools", "Invite-code team management"].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-text-2">
                      <span className="mt-[5px] w-1 h-1 rounded-full bg-border-3 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 mb-4">
                  <label htmlFor="lp-seats" className="text-xs text-text-2 shrink-0">Seats</label>
                  <input
                    id="lp-seats"
                    type="number"
                    min={TEAM_MIN_SEATS}
                    value={seats}
                    onChange={(e) => setSeats(Math.max(TEAM_MIN_SEATS, Number(e.target.value) || TEAM_MIN_SEATS))}
                    className="w-16 bg-background border border-white/[0.1] rounded-lg px-2 py-1.5 text-sm text-text outline-none focus:border-accent transition-colors"
                  />
                  <span className="text-xs text-text-2">= ${seats * TEAM_SEAT_PRICE}/mo</span>
                </div>
                <button onClick={() => subscribe("team")} disabled={checkoutLoading !== null} className="px-4 py-2.5 rounded-xl text-sm font-medium border border-white/[0.1] text-text-2 hover:border-white/[0.2] hover:text-text disabled:opacity-50 transition-all duration-150">
                  {checkoutLoading === "team" ? "Redirecting…" : "Subscribe"}
                </button>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2}>
            <div className="mt-8 p-6 rounded-2xl border border-white/[0.06] bg-surface text-center">
              <p className="text-sm text-text-2 leading-relaxed max-w-2xl mx-auto">
                At ${PRO_PRICE}/month during a 4-month prep window, the cost is less than a single hour with a private math tutor — and you get unlimited sessions.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <Faq />

      {/* ── Bottom CTA ── */}
      <section className="relative z-10 px-8 py-36 text-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "900px", height: "400px", background: "radial-gradient(ellipse, rgba(232,168,32,0.12) 0%, transparent 65%)", filter: "blur(40px)" }} />
        </div>
        <Reveal>
          <h2 className="text-[clamp(28px,4vw,54px)] font-semibold tracking-[-0.03em] mb-5">
            Train the way competitors train.
          </h2>
          <p className="text-base text-text-2 mb-10 max-w-sm mx-auto leading-relaxed">
            Pick your competition. Map your gaps. Work through problems until the answers come from you.
          </p>
          <Link
            href="/coach"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold bg-accent text-background hover:bg-accent-hover transition-all duration-150"
            style={{ boxShadow: "0 0 32px rgba(232,168,32,0.3)" }}
          >
            Start training free
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 2l5 5-5 5M2 7h10" />
            </svg>
          </Link>
        </Reveal>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.06] px-8 py-6 flex items-center justify-between">
        <span className="flex items-center text-sm font-bold tracking-tight">
          <span className="text-text">Poly</span><span className="text-accent">Teach</span>
        </span>
        <span className="text-xs text-[#444]">© 2026 PolyTeach</span>
      </footer>
    </div>
  );
}
