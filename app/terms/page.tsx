import Link from "next/link";
import { Syne } from "next/font/google";
import type { Metadata } from "next";

const syne = Syne({ subsets: ["latin"], weight: ["400", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  title: "Terms of Service — PolyTeach",
  description: "Terms governing your use of PolyTeach.",
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

export default function TermsPage() {
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
        <h1 className="text-3xl font-semibold tracking-[-0.03em] mb-3">Terms of Service</h1>
        <p className="text-sm text-[#555] mb-14">Effective date: {EFFECTIVE_DATE}</p>

        <Section title="Agreement to these terms">
          <p>By creating an account or using PolyTeach (the "Service"), you agree to these Terms of Service ("Terms"). If you do not agree, do not use the Service. We may update these Terms from time to time; continued use of the Service after changes means you accept the updated Terms.</p>
        </Section>

        <Section title="Eligibility">
          <p>You must be at least 13 years old to use PolyTeach. If you are under 18, you represent that your parent or legal guardian has reviewed and agreed to these Terms on your behalf. By using the Service, you represent that all information you provide is accurate and that you have the right to enter into these Terms.</p>
        </Section>

        <Section title="Your account">
          <p>You are responsible for keeping your account credentials secure. Notify us immediately at <a href="mailto:asubramanian2000@gmail.com" className="text-accent hover:underline">asubramanian2000@gmail.com</a> if you suspect unauthorized access. You may not share, sell, or transfer your account to another person.</p>
          <p>We reserve the right to suspend or terminate accounts that violate these Terms, abuse the Service, or engage in fraudulent activity.</p>
        </Section>

        <Section title="Acceptable use">
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Use the Service to cheat in official competitions or academic work.</li>
            <li>Attempt to extract, reverse-engineer, or reproduce our AI models, system prompts, or proprietary content.</li>
            <li>Use automated scripts, bots, or crawlers to access the Service.</li>
            <li>Upload or transmit malware, spam, or any content that is unlawful, harmful, or violates others' rights.</li>
            <li>Attempt to gain unauthorized access to any part of the Service or its infrastructure.</li>
          </ul>
          <p>PolyTeach is a coaching and practice tool. You are solely responsible for how you apply what you learn. We do not guarantee specific competition results.</p>
        </Section>

        <Section title="Subscriptions and billing">
          <p>Paid plans (Pro and Team) are billed on a recurring monthly basis via Stripe. By subscribing, you authorize us to charge your payment method on the billing cycle date. You may cancel at any time from your account settings; cancellation takes effect at the end of the current billing period and you will not be charged again.</p>
          <p>We do not offer refunds for partial billing periods unless required by applicable law. If a payment fails, we will attempt to retry and may suspend access to paid features until payment is resolved.</p>
          <p>We reserve the right to change pricing with at least 30 days' notice. Price changes will not affect your current billing period.</p>
        </Section>

        <Section title="Intellectual property">
          <p>All content, software, and AI-generated coaching material on PolyTeach is owned by or licensed to us. You may use the Service for your personal, non-commercial educational purposes only. You may not reproduce, distribute, or create derivative works from our content without written permission.</p>
          <p>Content you submit (e.g., messages to the coach) remains yours. You grant us a limited license to use it to provide and improve the Service.</p>
        </Section>

        <Section title="AI-generated content disclaimer">
          <p>PolyTeach uses large language models to generate coaching responses. While we strive for accuracy, AI-generated content may contain errors. Do not rely solely on PolyTeach output for official competition submissions or high-stakes decisions. Always verify important answers independently.</p>
          <p>PolyTeach is not affiliated with or endorsed by AMC, USACO, ACS, AAPT, USABO, or any other competition organization.</p>
        </Section>

        <Section title="Limitation of liability">
          <p>To the maximum extent permitted by law, PolyTeach and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Service, including lost profits, data loss, or missed competition outcomes.</p>
          <p>Our total liability for any claim arising out of or relating to these Terms or the Service shall not exceed the amount you paid us in the 12 months preceding the claim.</p>
        </Section>

        <Section title="Warranty disclaimer">
          <p>The Service is provided "as is" and "as available" without warranties of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that the Service will be uninterrupted, error-free, or free of harmful components.</p>
        </Section>

        <Section title="Governing law">
          <p>These Terms are governed by the laws of the State of Illinois, USA, without regard to conflict-of-law principles. Any disputes shall be resolved in the state or federal courts located in Cook County, Illinois, and you consent to personal jurisdiction there.</p>
        </Section>

        <Section title="Contact">
          <p>Questions about these Terms? Email us at <a href="mailto:asubramanian2000@gmail.com" className="text-accent hover:underline">asubramanian2000@gmail.com</a>.</p>
        </Section>
      </main>

      <footer className="border-t border-white/[0.06] px-8 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center text-sm font-bold tracking-tight">
          <span className="text-text">Poly</span><span className="text-accent">Teach</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="text-xs text-[#555] hover:text-text transition-colors">Privacy</Link>
          <Link href="/contact" className="text-xs text-[#555] hover:text-text transition-colors">Contact</Link>
          <span className="text-xs text-[#3a3a3a]">© 2026 PolyTeach</span>
        </div>
      </footer>
    </div>
  );
}
