import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.06] px-8 py-6 flex items-center justify-between">
      <Link href="/" className="flex items-center text-sm font-semibold tracking-tight">
        <span className="text-text">Poly</span><span className="text-accent">Teach</span>
      </Link>
      <div className="flex items-center gap-6">
        <Link href="/privacy" className="text-xs text-[#555] hover:text-text transition-colors">Privacy</Link>
        <Link href="/terms" className="text-xs text-[#555] hover:text-text transition-colors">Terms</Link>
        <Link href="/contact" className="text-xs text-[#555] hover:text-text transition-colors">Contact</Link>
        <span className="text-xs text-[#3a3a3a]">© 2026 PolyTeach</span>
      </div>
    </footer>
  );
}
