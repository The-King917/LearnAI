"use client";

import { useEffect, useState } from "react";

interface DemoMessage {
  role: "user" | "assistant";
  text: string;
}

const SCRIPT: DemoMessage[] = [
  { role: "user", text: "How do I find the number of divisors of 360?" },
  { role: "assistant", text: "Let's start with prime factorization — can you break 360 into its prime factors first?" },
  { role: "user", text: "2³ × 3² × 5" },
  { role: "assistant", text: "Exactly. Now if a number's prime factorization is p^a × q^b × r^c, what formula counts how many divisors it has?" },
  { role: "user", text: "(a+1)(b+1)(c+1)?" },
  { role: "assistant", text: "Right — so what do you get when you plug in 3, 2, and 1?" },
  { role: "user", text: "4 × 3 × 2 = 24" },
  { role: "assistant", text: "24 divisors. You just derived the rule instead of memorizing it — that's the whole idea." },
];

const TYPE_MS = 22;
const PAUSE_AFTER_MS = 900;
const RESTART_PAUSE_MS = 2400;

export default function LandingDemo() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [typedLen, setTypedLen] = useState(0);
  const [thinking, setThinking] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (visibleCount >= SCRIPT.length) {
      timer = setTimeout(() => {
        setVisibleCount(0);
        setTypedLen(0);
        setThinking(false);
      }, RESTART_PAUSE_MS);
      return () => clearTimeout(timer);
    }

    const current = SCRIPT[visibleCount];

    if (thinking) {
      timer = setTimeout(() => setThinking(false), 700);
      return () => clearTimeout(timer);
    }

    if (typedLen < current.text.length) {
      timer = setTimeout(() => setTypedLen((n) => n + 1), TYPE_MS);
      return () => clearTimeout(timer);
    }

    timer = setTimeout(() => {
      setVisibleCount((n) => n + 1);
      setTypedLen(0);
      const next = SCRIPT[visibleCount + 1];
      if (next?.role === "assistant") setThinking(true);
    }, PAUSE_AFTER_MS);
    return () => clearTimeout(timer);
  }, [visibleCount, typedLen, thinking]);

  const current = SCRIPT[visibleCount];

  return (
    <div className="rounded-xl border border-border bg-surface shadow-panel overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface-2">
        <span className="w-2 h-2 rounded-full bg-white/20" />
        <span className="w-2 h-2 rounded-full bg-white/20" />
        <span className="w-2 h-2 rounded-full bg-white/20" />
        <span className="ml-2 text-xs text-muted">Coach — AMC/AIME Number Theory</span>
      </div>

      <div className="px-5 py-6 space-y-4 min-h-[340px]">
        {SCRIPT.slice(0, visibleCount).map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[80%] px-3.5 py-2.5 rounded-2xl rounded-br-sm bg-surface-2 border border-border-2 text-sm text-text leading-relaxed">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={i} className="flex gap-3">
              <div className="w-5 h-5 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-0.5">
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 5.5L3.5 8 9 2" />
                </svg>
              </div>
              <div className="flex-1 min-w-0 pt-0.5 text-sm text-text leading-relaxed">{m.text}</div>
            </div>
          )
        )}

        {current && !thinking && (
          current.role === "user" ? (
            <div className="flex justify-end">
              <div className="max-w-[80%] px-3.5 py-2.5 rounded-2xl rounded-br-sm bg-surface-2 border border-border-2 text-sm text-text leading-relaxed">
                {current.text.slice(0, typedLen)}
                <span className="inline-block w-[2px] h-3.5 bg-text/60 ml-0.5 align-middle animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-0.5">
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 5.5L3.5 8 9 2" />
                </svg>
              </div>
              <div className="flex-1 min-w-0 pt-0.5 text-sm text-text leading-relaxed">
                {current.text.slice(0, typedLen)}
                <span className="inline-block w-[2px] h-3.5 bg-text/60 ml-0.5 align-middle animate-pulse" />
              </div>
            </div>
          )
        )}

        {thinking && (
          <div className="flex gap-3">
            <div className="w-5 h-5 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-0.5">
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 5.5L3.5 8 9 2" />
              </svg>
            </div>
            <div className="flex items-center gap-1 pt-1.5">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
