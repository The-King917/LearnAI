"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface MockTestEntry {
  id: string;
  competition: string;
  score: number | null;
  percentile: number | null;
  completedAt: string | null;
  problemCount: number;
}

interface CompetitionStat {
  competition: string;
  testCount: number;
  latestScore: number | null;
  latestPercentile: number | null;
  scoreTrend: number[];
  percentileTrend: number[];
  weakTopics: string[];
}

interface StudentModel {
  subjectId: string;
  overallLevel: string;
  confidence: number;
  conceptCount: number;
  concepts: Record<string, { level: number; attempts: number }>;
  updatedAt: string;
}

interface StudyPlan {
  subjectId: string;
  currentDay: number;
  status: string;
  competitionDate: string | null;
  totalDays: number;
  weeklyReports: Array<{ week: number; summary: string; atRisk: string[] }>;
}

interface DashboardData {
  mockTests: MockTestEntry[];
  competitionStats: CompetitionStat[];
  studentModels: StudentModel[];
  studyPlans: StudyPlan[];
}

function MiniSparkline({ values, color = "white" }: { values: number[]; color?: string }) {
  if (values.length < 2) return <span className="text-2xs text-subtle">—</span>;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 60;
  const h = 20;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 2) - 1;
    return `${x},${y}`;
  });
  const trend = values[values.length - 1] > values[0];
  const lineColor = trend ? "#4ade80" : "#f87171";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="inline-block">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color === "trend" ? lineColor : "rgba(255,255,255,0.5)"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={pts[pts.length - 1].split(",")[0]} cy={pts[pts.length - 1].split(",")[1]} r="2" fill={color === "trend" ? lineColor : "white"} />
    </svg>
  );
}

function levelColor(level: string) {
  if (level === "olympiad") return "text-white";
  if (level === "advanced") return "text-blue-400";
  if (level === "intermediate") return "text-yellow-400";
  return "text-muted";
}

export default function ProgressPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "tests" | "concepts">("overview");

  useEffect(() => {
    if (status === "unauthenticated") { setLoading(false); return; }
    if (status !== "authenticated") return;
    fetch("/api/progress/dashboard")
      .then((r) => r.json())
      .then((d: DashboardData) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background text-text flex items-center justify-center">
        <div className="flex gap-1">
          <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background text-text flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold mb-3">Sign in to see your progress</p>
          <Link href="/coach" className="text-sm text-muted underline">← Back to coach</Link>
        </div>
      </div>
    );
  }

  const { mockTests = [], competitionStats = [], studentModels = [], studyPlans = [] } = data ?? {};
  const totalTests = mockTests.length;
  const avgPercentile = mockTests.filter((t) => t.percentile !== null).length > 0
    ? Math.round(mockTests.filter((t) => t.percentile !== null).reduce((s, t) => s + (t.percentile ?? 0), 0) / mockTests.filter((t) => t.percentile !== null).length)
    : null;

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-border/60">
        <Link href="/coach" className="flex items-center text-sm font-semibold tracking-[-0.01em]">
          Poly<span className="ml-1 px-1.5 py-0.5 rounded-[3px] bg-white text-background text-2xs font-bold">Teach</span>
        </Link>
        <div className="flex items-center gap-1">
          {(["overview", "tests", "concepts"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                tab === t ? "bg-white/10 text-text" : "text-muted hover:text-text-2"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <Link href="/mock-test" className="text-xs text-muted hover:text-text-2 transition-colors">
          Take a mock test →
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Summary strip */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="p-5 rounded-xl border border-border bg-surface text-center">
            <p className="text-3xl font-semibold tracking-[-0.03em]">{totalTests}</p>
            <p className="text-xs text-muted mt-1">mock tests completed</p>
          </div>
          <div className="p-5 rounded-xl border border-border bg-surface text-center">
            <p className="text-3xl font-semibold tracking-[-0.03em]">{avgPercentile !== null ? `~${avgPercentile}th` : "—"}</p>
            <p className="text-xs text-muted mt-1">avg percentile estimate</p>
          </div>
          <div className="p-5 rounded-xl border border-border bg-surface text-center">
            <p className="text-3xl font-semibold tracking-[-0.03em]">{studentModels.length}</p>
            <p className="text-xs text-muted mt-1">competitions tracked</p>
          </div>
        </div>

        {/* Overview tab */}
        {tab === "overview" && (
          <div className="space-y-8">
            {/* Competition stats */}
            {competitionStats.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold mb-4">By competition</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {competitionStats.map((c) => (
                    <div key={c.competition} className="p-5 rounded-xl border border-border bg-surface">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-wide">{c.competition}</p>
                          <p className="text-2xs text-muted mt-0.5">{c.testCount} test{c.testCount !== 1 ? "s" : ""} taken</p>
                        </div>
                        <div className="text-right">
                          {c.latestPercentile !== null && (
                            <p className="text-lg font-semibold">~{c.latestPercentile}th</p>
                          )}
                          <p className="text-2xs text-muted">latest percentile</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          {c.weakTopics.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {c.weakTopics.slice(0, 3).map((t) => (
                                <span key={t} className="text-2xs px-1.5 py-0.5 rounded border border-red-500/20 text-red-400 bg-red-500/5">
                                  {t.replace(/_/g, " ")}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <MiniSparkline values={c.percentileTrend} color="trend" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Study plans */}
            {studyPlans.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold mb-4">Active prep campaigns</h2>
                <div className="space-y-3">
                  {studyPlans.map((p) => {
                    const pct = p.totalDays > 0 ? Math.round((p.currentDay / p.totalDays) * 100) : 0;
                    const daysLeft = p.competitionDate
                      ? Math.ceil((new Date(p.competitionDate).getTime() - Date.now()) / 86400000)
                      : null;
                    return (
                      <div key={p.subjectId} className="p-4 rounded-xl border border-border bg-surface">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold uppercase">{p.subjectId}</p>
                          <div className="flex items-center gap-3 text-xs text-muted">
                            {daysLeft !== null && daysLeft > 0 && (
                              <span>{daysLeft} days until competition</span>
                            )}
                            <span>{p.currentDay}/{p.totalDays} days complete</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                          <div className="h-full bg-white/50 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        {p.weeklyReports && Array.isArray(p.weeklyReports) && p.weeklyReports.length > 0 && (
                          <p className="text-xs text-muted mt-2 line-clamp-2">
                            {(p.weeklyReports as Array<{ week: number; summary: string }>).at(-1)?.summary}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {competitionStats.length === 0 && studyPlans.length === 0 && (
              <div className="text-center py-16">
                <p className="text-sm text-muted mb-4">No activity yet.</p>
                <Link href="/mock-test" className="px-4 py-2 rounded-lg text-sm font-semibold bg-white text-background hover:bg-white/85 transition-all">
                  Take your first mock test
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tests tab */}
        {tab === "tests" && (
          <div>
            <h2 className="text-sm font-semibold mb-4">All mock tests</h2>
            {mockTests.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-sm text-muted mb-4">No tests completed yet.</p>
                <Link href="/mock-test" className="px-4 py-2 rounded-lg text-sm font-semibold bg-white text-background hover:bg-white/85 transition-all">
                  Take a mock test
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {mockTests.map((t) => (
                  <div key={t.id} className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border bg-surface">
                    <span className="text-xs font-semibold uppercase text-muted w-20 shrink-0">{t.competition}</span>
                    <span className="text-sm font-semibold w-16 shrink-0">
                      {t.score !== null ? t.score : "—"} pts
                    </span>
                    <span className="text-sm text-muted w-20 shrink-0">
                      {t.percentile !== null ? `~${t.percentile}th` : "—"}
                    </span>
                    <span className="text-xs text-subtle flex-1">
                      {t.problemCount} problems
                    </span>
                    <span className="text-xs text-subtle shrink-0">
                      {t.completedAt ? new Date(t.completedAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Concepts tab */}
        {tab === "concepts" && (
          <div>
            <h2 className="text-sm font-semibold mb-4">Concept mastery by competition</h2>
            {studentModels.length === 0 ? (
              <p className="text-sm text-muted text-center py-16">No concept data yet. Complete a diagnostic or mock test to build your model.</p>
            ) : (
              <div className="space-y-6">
                {studentModels.map((m) => {
                  const concepts = Object.entries(m.concepts ?? {}) as Array<[string, { level: number; attempts: number }]>;
                  const sorted = concepts.sort(([, a], [, b]) => a.level - b.level);
                  return (
                    <div key={m.subjectId} className="p-5 rounded-xl border border-border bg-surface">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm font-semibold uppercase">{m.subjectId}</p>
                          <p className={`text-xs mt-0.5 capitalize ${levelColor(m.overallLevel)}`}>{m.overallLevel} level</p>
                        </div>
                        <p className="text-xs text-muted">{concepts.length} concepts tracked</p>
                      </div>
                      {sorted.length > 0 && (
                        <div className="space-y-2">
                          {sorted.slice(0, 10).map(([name, data]) => (
                            <div key={name} className="flex items-center gap-3">
                              <span className="text-xs text-muted w-40 truncate capitalize">{name.replace(/_/g, " ")}</span>
                              <div className="flex-1 h-1 bg-surface-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${data.level >= 0.7 ? "bg-green-500/60" : data.level >= 0.4 ? "bg-yellow-500/60" : "bg-red-500/60"}`}
                                  style={{ width: `${Math.round(data.level * 100)}%` }}
                                />
                              </div>
                              <span className="text-xs text-subtle w-8 text-right">{Math.round(data.level * 100)}%</span>
                              <span className="text-2xs text-subtle w-16 text-right">{data.attempts} attempts</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
