import Link from "next/link";
import { Syne } from "next/font/google";
import type { Metadata } from "next";

const syne = Syne({ subsets: ["latin"], weight: ["400", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  title: "Privacy Policy — PolyTeach",
  description: "How PolyTeach collects, uses, and protects your personal information.",
};

const EFFECTIVE_DATE = "June 30, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-base font-semibold text-text mb-4">{title}</h2>
      <div className="space-y-3 text-sm text-text-2 leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className={`${syne.className} min-h-screen bg-background text-text`}>
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center text-sm font-bold tracking-tight">
          <span className="text-text">Poly</span><span className="text-accent">Teach</span>
        </Link>
        <Link href="/" className="text-xs text-text-2 hover:text-text transition-colors">← Back to home</Link>
      </nav>

      <main className="max-w-2xl mx-auto px-8 py-20">
        <p className="text-xs font-medium text-accent uppercase tracking-[0.12em] mb-4">Legal</p>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] mb-3">Privacy Policy</h1>
        <p className="text-sm text-[#555] mb-14">Effective date: {EFFECTIVE_DATE}</p>

        <Section title="Who we are">
          <p>PolyTeach ("we", "us", "our") operates the website and application at polyteach.app. We build AI-powered Socratic coaching tools for students preparing for academic olympiads.</p>
          <p>Questions about this policy? Email us at <a href="mailto:asubramanian2000@gmail.com" className="text-accent hover:underline">asubramanian2000@gmail.com</a>.</p>
        </Section>

        <Section title="Information we collect">
          <p><strong className="text-text">Account information.</strong> When you sign up, we collect your name, email address, and (if applicable) your school or organization.</p>
          <p><strong className="text-text">Usage data.</strong> We log which subjects and competition modes you use, session lengths, and diagnostic results so we can adapt coaching to your level.</p>
          <p><strong className="text-text">Payment information.</strong> Stripe processes all payments. We never see or store your full card number — only a Stripe customer ID and subscription status.</p>
          <p><strong className="text-text">Conversation content.</strong> Messages you send to the AI coach are processed by Anthropic's API to generate responses. We retain these to provide and improve the service.</p>
          <p><strong className="text-text">Device and log data.</strong> We collect standard web logs including IP address, browser type, and pages visited for security and analytics.</p>
        </Section>

        <Section title="How we use your information">
          <p>We use your data to: provide and personalize the coaching experience; track your progress and generate study plans; process payments and manage your subscription; send transactional emails (receipts, password resets); and improve the quality of our AI models and content.</p>
          <p>We do not sell your personal data to third parties. We do not use your data to train third-party AI models without your explicit consent.</p>
        </Section>

        <Section title="Third-party services">
          <p>We share data with a small number of trusted services necessary to operate:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-text">Anthropic</strong> — AI model inference. Conversation messages are sent to Anthropic's API and subject to their data handling practices.</li>
            <li><strong className="text-text">Stripe</strong> — Payment processing and subscription management.</li>
            <li><strong className="text-text">Vercel</strong> — Hosting and edge infrastructure.</li>
            <li><strong className="text-text">Neon / PostgreSQL</strong> — Encrypted database storage for your account and session data.</li>
          </ul>
        </Section>

        <Section title="Data retention">
          <p>We retain your account data for as long as your account is active. If you delete your account, we remove your personal information within 30 days, except where we are required to retain it for legal or financial compliance.</p>
          <p>Conversation logs may be retained in anonymized or aggregated form for product improvement purposes.</p>
        </Section>

        <Section title="Your rights">
          <p>Depending on your location, you may have the right to access, correct, export, or delete your personal data. To exercise any of these rights, email <a href="mailto:asubramanian2000@gmail.com" className="text-accent hover:underline">asubramanian2000@gmail.com</a> and we will respond within 30 days.</p>
          <p>If you are located in the EU/EEA or UK, you also have the right to lodge a complaint with your local data protection authority.</p>
        </Section>

        <Section title="Cookies">
          <p>We use cookies and similar technologies to keep you signed in, remember your preferences, and analyze site usage. We do not use advertising or cross-site tracking cookies. You can disable cookies in your browser settings, though some features (like staying logged in) will not work without them.</p>
        </Section>

        <Section title="Children's privacy">
          <p>PolyTeach is intended for users aged 13 and older. If you are under 13, please do not create an account. If we learn that we have collected personal data from a child under 13 without parental consent, we will delete that information promptly. Parents or guardians who believe their child has provided us with personal data should contact us at <a href="mailto:asubramanian2000@gmail.com" className="text-accent hover:underline">asubramanian2000@gmail.com</a>.</p>
        </Section>

        <Section title="Changes to this policy">
          <p>We may update this Privacy Policy from time to time. If we make material changes, we will notify you by email or by displaying a notice in the app before the change takes effect. Your continued use of PolyTeach after any changes constitutes acceptance of the updated policy.</p>
        </Section>
      </main>

      <footer className="border-t border-white/[0.06] px-8 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center text-sm font-bold tracking-tight">
          <span className="text-text">Poly</span><span className="text-accent">Teach</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/terms" className="text-xs text-[#555] hover:text-text transition-colors">Terms</Link>
          <Link href="/contact" className="text-xs text-[#555] hover:text-text transition-colors">Contact</Link>
          <span className="text-xs text-[#3a3a3a]">© 2026 PolyTeach</span>
        </div>
      </footer>
    </div>
  );
}
