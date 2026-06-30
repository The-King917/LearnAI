import Link from "next/link";
import { Syne } from "next/font/google";
import type { Metadata } from "next";

const syne = Syne({ subsets: ["latin"], weight: ["400", "600", "700", "800"], display: "swap" });

export const metadata: Metadata = {
  title: "Download — PolyTeach",
  description: "Desktop apps for Mac and Windows — coming soon.",
};

const PLATFORMS = [
  {
    name: "Mac",
    subtitle: "macOS 13 Ventura or later",
    icon: (
      <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor">
        <path d="M11.182 3C9.91 3 9.09 3.674 8 3.674c-1.044 0-2.04-.674-3.182-.674C3.07 3 1 4.948 1 7.98c0 2.01.77 4.133 1.818 5.5.876 1.168 1.636 2.02 2.727 2.02.99 0 1.416-.643 2.455-.643 1.055 0 1.447.643 2.455.643 1.09 0 1.9-.906 2.727-2.02C14.23 12.113 15 9.99 15 7.98 15 4.948 12.93 3 11.182 3ZM8 3.266c.664-.768 1.636-1.266 2.182-1.266.072.874-.19 1.752-.736 2.42C8.937 5.07 7.98 5.62 7.273 5.58 7.18 4.72 7.49 3.862 8 3.266Z"/>
      </svg>
    ),
  },
  {
    name: "Windows",
    subtitle: "Windows 10 or later",
    icon: (
      <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor">
        <path d="M6.555 1.375 0 2.237v5.45h6.555V1.375ZM0 13.795l6.555.933V8.313H0v5.482ZM7.278 1.268v6.42H16V.125L7.278 1.268ZM16 8.313H7.278V14.9L16 16V8.313Z"/>
      </svg>
    ),
  },
];

export default function DownloadPage() {
  return (
    <div className={`${syne.className} min-h-screen bg-background text-text`}>
      {/* Static dot grid */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />

      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center text-sm font-bold tracking-tight">
          <span className="text-text">Poly</span><span className="text-accent">Teach</span>
        </Link>
        <Link href="/" className="text-xs text-text-2 hover:text-text transition-colors">← Back to home</Link>
      </nav>

      <main className="relative z-10 max-w-2xl mx-auto px-8 py-28 text-center">
        {/* Badge */}
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-xs font-medium text-accent mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          In development
        </span>

        <h1 className="text-[clamp(28px,4vw,48px)] font-semibold tracking-[-0.03em] leading-[1.1] mb-5">
          Desktop apps<br />
          <span className="text-accent">coming soon.</span>
        </h1>

        <p className="text-sm text-text-2 leading-relaxed max-w-sm mx-auto mb-16">
          Native Mac and Windows apps are in the works. In the meantime, PolyTeach runs fully in your browser — no install needed.
        </p>

        {/* Platform cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
          {PLATFORMS.map(({ name, subtitle, icon }) => (
            <div
              key={name}
              className="relative flex flex-col items-center gap-4 p-8 rounded-2xl border border-white/[0.08] bg-surface"
              style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.4)" }}
            >
              <div className="w-14 h-14 rounded-2xl border border-white/[0.08] bg-surface-2 flex items-center justify-center text-text-2">
                {icon}
              </div>
              <div>
                <p className="text-base font-semibold text-text mb-1">{name}</p>
                <p className="text-xs text-[#555]">{subtitle}</p>
              </div>
              <div className="w-full mt-2 px-5 py-2.5 rounded-xl border border-white/[0.08] text-xs text-[#555] text-center select-none">
                Notify me when available
              </div>
              <span className="absolute top-4 right-4 text-2xs text-[#444] border border-white/[0.06] rounded-full px-2 py-0.5">
                Soon
              </span>
            </div>
          ))}
        </div>

        {/* Web CTA */}
        <div className="p-7 rounded-2xl border border-white/[0.06] bg-surface mb-8">
          <p className="text-sm font-semibold text-text mb-2">Start training now in your browser</p>
          <p className="text-xs text-text-2 leading-relaxed mb-5">
            The full coaching experience — Socratic sessions, mock tests, diagnostics, and study plans — is available right now at polyteach.app.
          </p>
          <Link
            href="/coach"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-background text-sm font-semibold hover:bg-accent-hover transition-all duration-150"
            style={{ boxShadow: "0 0 20px rgba(232,168,32,0.2)" }}
          >
            Open the app
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 2l5 5-5 5M2 7h10" />
            </svg>
          </Link>
        </div>

        <p className="text-xs text-[#444]">
          Want to be notified when the desktop apps launch?{" "}
          <a href="mailto:hello@polyteach.app?subject=Notify me about the desktop app" className="text-accent hover:underline">
            Email us
          </a>
          .
        </p>
      </main>

      <footer className="relative z-10 border-t border-white/[0.06] px-8 py-6 flex items-center justify-between">
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
