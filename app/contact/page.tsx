import Link from "next/link";
import { Syne } from "next/font/google";
import type { Metadata } from "next";

const syne = Syne({ subsets: ["latin"], weight: ["400", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  title: "Contact — PolyTeach",
  description: "Get in touch with the PolyTeach team.",
};

const CONTACTS = [
  {
    category: "General questions",
    desc: "Not sure where to start, or have a question about how PolyTeach works?",
    email: "hello@polyteach.app",
  },
  {
    category: "Billing & subscriptions",
    desc: "Questions about your Pro or Team plan, invoices, or cancellations.",
    email: "billing@polyteach.app",
  },
  {
    category: "Schools & teams",
    desc: "Setting up a school math team, science olympiad squad, or USACO club?",
    email: "teams@polyteach.app",
  },
  {
    category: "Privacy & data",
    desc: "Requests to access, correct, or delete your personal data.",
    email: "privacy@polyteach.app",
  },
  {
    category: "Legal",
    desc: "Terms of service, takedown requests, or other legal matters.",
    email: "legal@polyteach.app",
  },
  {
    category: "Bug reports & feedback",
    desc: "Found something broken, or have a suggestion to make the coach better?",
    email: "feedback@polyteach.app",
  },
];

export default function ContactPage() {
  return (
    <div className={`${syne.className} min-h-screen bg-background text-text`}>
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center text-sm font-bold tracking-tight">
          <span className="text-text">Poly</span><span className="text-accent">Teach</span>
        </Link>
        <Link href="/" className="text-xs text-text-2 hover:text-text transition-colors">← Back to home</Link>
      </nav>

      <main className="max-w-2xl mx-auto px-8 py-20">
        <p className="text-xs font-medium text-accent uppercase tracking-[0.12em] mb-4">Get in touch</p>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] mb-4">Contact us</h1>
        <p className="text-sm text-text-2 leading-relaxed mb-16 max-w-md">
          We&apos;re a small team — email is the fastest way to reach us. We typically respond within one business day.
        </p>

        <div className="space-y-4">
          {CONTACTS.map(({ category, desc, email }) => (
            <a
              key={email}
              href={`mailto:${email}`}
              className="group flex items-start justify-between gap-6 p-6 rounded-2xl border border-white/[0.07] bg-surface hover:border-white/[0.14] hover:bg-surface-2 transition-all duration-200"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text mb-1.5 group-hover:text-white transition-colors">{category}</p>
                <p className="text-xs text-[#555] leading-relaxed">{desc}</p>
                <p className="text-xs text-accent mt-3">{email}</p>
              </div>
              <svg
                className="shrink-0 mt-0.5 text-[#444] group-hover:text-accent transition-colors duration-200"
                width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
              >
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          ))}
        </div>

        <div className="mt-16 p-7 rounded-2xl border border-white/[0.06] bg-surface">
          <h2 className="text-sm font-semibold text-text mb-3">Frequently asked questions</h2>
          <p className="text-xs text-text-2 leading-relaxed mb-4">
            Before reaching out, check our FAQ — most questions about how the AI coach works, what competitions we cover, and how billing works are answered there.
          </p>
          <Link
            href="/#faq"
            className="inline-flex items-center gap-2 text-xs font-medium text-accent hover:text-accent-hover transition-colors"
          >
            View FAQ
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7h8M7 3l4 4-4 4"/>
            </svg>
          </Link>
        </div>
      </main>

      <footer className="border-t border-white/[0.06] px-8 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center text-sm font-bold tracking-tight">
          <span className="text-text">Poly</span><span className="text-accent">Teach</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="text-xs text-[#555] hover:text-text transition-colors">Privacy</Link>
          <Link href="/terms" className="text-xs text-[#555] hover:text-text transition-colors">Terms</Link>
          <span className="text-xs text-[#3a3a3a]">© 2026 PolyTeach</span>
        </div>
      </footer>
    </div>
  );
}
