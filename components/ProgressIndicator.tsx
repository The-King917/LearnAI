"use client";

interface ProgressIndicatorProps {
  mastery: number | null;
  signedIn: boolean;
}

export default function ProgressIndicator({ mastery, signedIn }: ProgressIndicatorProps) {
  if (!signedIn) {
    return <span className="text-2xs text-subtle ml-auto hidden sm:inline">Sign in to track mastery</span>;
  }

  const pct = Math.round(mastery ?? 0);

  return (
    <div className="flex items-center gap-2 ml-auto">
      <span className="text-2xs text-muted uppercase tracking-[0.07em] hidden sm:inline">Mastery</span>
      <div className="w-24 h-1.5 rounded-full bg-surface-2 border border-border overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-2xs font-mono text-text-2 w-8 text-right tabular-nums">{pct}%</span>
    </div>
  );
}
