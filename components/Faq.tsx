"use client";

import { useState } from "react";
import Reveal from "./Reveal";
import TypeText from "./TypeText";
import Card from "./ui/Card";
import { transition, DURATION } from "@/lib/motion";

const FAQ_ITEMS = [
  {
    q: "What is PolyTeach?",
    a: "PolyTeach is an AI coach for competition math, science olympiads, AP courses, debate, and more. Instead of handing you answers, it asks the questions that get you there yourself — the same way a great human tutor would.",
  },
  {
    q: "How is this different from just asking ChatGPT?",
    a: "General chatbots are built to be maximally helpful, which usually means giving you the answer outright. PolyTeach is built around one rule: never tell, always ask. Coaching, practice problems with progressive hints, and adaptive diagnostics are all tuned for that — not generic Q&A.",
  },
  {
    q: "What subjects are covered?",
    a: "60+ subjects: AMC/AIME/USAMO, MATHCOUNTS, USACO, Science Olympiad, all 38 AP courses, DECA, FBLA, Policy and LD debate, Model UN, and more.",
  },
  {
    q: "How does it know what difficulty to give me?",
    a: "The diagnostic maps your knowledge concept-by-concept, not just subject-by-subject — so hints and practice problems are calibrated to exactly where you're stuck, not a generic grade level.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. The Free plan includes Socratic coaching, practice problems, and the level diagnostic with 30 messages a month. Pro adds unlimited messages and progress tracking.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes — Pro and Team are billed monthly through Stripe and can be canceled anytime from the billing portal on your account page. No long-term contracts.",
  },
  {
    q: "Is my data private?",
    a: "Your conversations and progress are tied to your account and never sold. You can review your billing and account details anytime from the Account page.",
  },
];

function FaqRow({ q, a, delay, index }: { q: string; a: string; delay: number; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <Reveal y={16} transition={transition(DURATION.base, delay)}>
      <Card radius="xl">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
        >
          <span className="flex items-baseline gap-3">
            <span className="text-xs font-semibold text-white/[0.15] tabular-nums shrink-0">{String(index).padStart(2, "0")}</span>
            <span className="text-sm font-medium text-text">
              <TypeText text={q} delay={delay} />
            </span>
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-text-2 transition-transform duration-300"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            <path d="M2.5 5l4.5 4.5L11.5 5" />
          </svg>
        </button>
        <div
          className="grid transition-[grid-template-rows] duration-300 ease-out"
          style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <p className="px-5 pb-4 text-sm text-text-2 leading-relaxed">{a}</p>
          </div>
        </div>
      </Card>
    </Reveal>
  );
}

export default function Faq() {
  return (
    <section className="relative z-10 px-8 py-20 border-t border-border">
      <div className="max-w-2xl mx-auto">
        <Reveal transition={transition(DURATION.slow, 0.1)}>
          <div className="text-center mb-12">
            <h2 className="text-xl font-semibold tracking-[-0.025em]">
              <TypeText text="Frequently asked questions" delay={0.1} />
            </h2>
          </div>
        </Reveal>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <FaqRow key={item.q} q={item.q} a={item.a} delay={i * 0.04} index={i + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
