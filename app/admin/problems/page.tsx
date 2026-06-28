"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Problem {
  id: string;
  competition: string;
  difficulty: string;
  topics: string[];
  statement: string;
  answer: string;
  solution: string;
  format: string;
  choices: Record<string, string> | null;
  status: string;
  validationScore: number | null;
  validationNotes: string | null;
  generatedAt: string;
}

interface BufferStatus {
  competition: string;
  approved: number;
  pending: number;
  flagged: number;
  target: number;
  deficit: number;
}

export default function AdminProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [competitionFilter, setCompetitionFilter] = useState("");
  const [bufferStatuses, setBufferStatuses] = useState<BufferStatus[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genCompetition, setGenCompetition] = useState("amc10");
  const [genCount, setGenCount] = useState(5);
  const [genResult, setGenResult] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const params = new URLSearchParams({ status: statusFilter, page: String(page) });
    if (competitionFilter) params.set("competition", competitionFilter);
    const res = await fetch(`/api/admin/problems?${params}`);
    if (res.status === 403) { setError("Admin access required"); return; }
    const data = await res.json() as { problems: Problem[]; total: number; bufferStatuses: BufferStatus[] };
    setProblems(data.problems ?? []);
    setTotal(data.total ?? 0);
    setBufferStatuses(data.bufferStatuses ?? []);
  }, [statusFilter, page, competitionFilter]);

  useEffect(() => { load(); }, [load]);

  const review = async (id: string, action: "approve" | "reject" | "flag", notes?: string) => {
    await fetch(`/api/admin/problems/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, notes }),
    });
    load();
  };

  const generate = async () => {
    setGenerating(true);
    setGenResult("");
    const res = await fetch("/api/admin/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ competition: genCompetition, count: genCount }),
    });
    const data = await res.json() as { generated: number; total: number };
    setGenResult(`Generated ${data.generated} / ${data.total} problems`);
    setGenerating(false);
    load();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background text-text flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/" className="text-sm text-muted underline">← Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-border">
        <Link href="/" className="text-sm font-semibold">PolyTeach Admin</Link>
        <span className="text-xs text-muted">Problem Review Queue</span>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Buffer status */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold mb-3">Problem Buffer</h2>
          <div className="grid grid-cols-4 lg:grid-cols-6 gap-2">
            {bufferStatuses.map((b) => (
              <div key={b.competition} className={`p-3 rounded-lg border text-center ${b.deficit > 0 ? "border-red-500/30 bg-red-500/5" : "border-border bg-surface"}`}>
                <p className="text-xs font-semibold uppercase">{b.competition}</p>
                <p className="text-lg font-semibold mt-1">{b.approved}</p>
                <p className="text-2xs text-muted">{b.pending} pending</p>
                {b.deficit > 0 && <p className="text-2xs text-red-400 mt-0.5">-{b.deficit} needed</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Generate panel */}
        <div className="mb-8 p-5 rounded-xl border border-border bg-surface">
          <h2 className="text-sm font-semibold mb-4">Generate problems</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={genCompetition}
              onChange={(e) => setGenCompetition(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-text outline-none"
            >
              {["amc8","amc10","amc12","aime","usamo","mathcounts","usaco","acsl","usapho","usnco","usabo","science-olympiad","science-bowl"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              max={20}
              value={genCount}
              onChange={(e) => setGenCount(Math.max(1, Math.min(20, Number(e.target.value))))}
              className="w-20 bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-text outline-none"
            />
            <button
              onClick={generate}
              disabled={generating}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-accent text-background hover:bg-accent-hover disabled:opacity-50 transition-all"
            >
              {generating ? "Generating…" : "Generate"}
            </button>
            {genResult && <span className="text-sm text-muted">{genResult}</span>}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          {["pending", "approved", "rejected", "flagged"].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(0); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === s ? "bg-accent text-background" : "text-muted hover:text-text-2 border border-border"
              }`}
            >
              {s}
            </button>
          ))}
          <input
            type="text"
            placeholder="competition filter…"
            value={competitionFilter}
            onChange={(e) => setCompetitionFilter(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-text outline-none ml-4 w-36"
          />
          <span className="text-xs text-subtle ml-auto">{total} total</span>
        </div>

        {/* Problems list */}
        <div className="space-y-3">
          {problems.map((p) => (
            <div key={p.id} className="p-4 rounded-xl border border-border bg-surface">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-semibold uppercase text-muted">{p.competition}</span>
                    <span className="text-2xs px-1.5 py-0.5 rounded border border-border text-subtle">{p.difficulty}</span>
                    <span className="text-2xs px-1.5 py-0.5 rounded border border-border text-subtle">{p.format}</span>
                    {p.validationScore !== null && (
                      <span className={`text-2xs px-1.5 py-0.5 rounded border ${p.validationScore >= 0.7 ? "border-green-500/30 text-green-400" : "border-red-500/30 text-red-400"}`}>
                        score: {p.validationScore.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-2 line-clamp-2">{p.statement.slice(0, 200)}</p>
                  {p.validationNotes && (
                    <p className="text-xs text-subtle mt-1 line-clamp-1">Notes: {p.validationNotes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                    className="text-xs text-muted hover:text-text-2 px-2 py-1 rounded border border-border"
                  >
                    {expanded === p.id ? "collapse" : "expand"}
                  </button>
                  {p.status === "pending" || p.status === "flagged" ? (
                    <>
                      <button
                        onClick={() => review(p.id, "approve")}
                        className="text-xs text-green-400 hover:text-green-300 px-2 py-1 rounded border border-green-500/30"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => review(p.id, "reject")}
                        className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded border border-red-500/30"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => review(p.id, "flag")}
                        className="text-xs text-yellow-400 hover:text-yellow-300 px-2 py-1 rounded border border-yellow-500/30"
                      >
                        Flag
                      </button>
                    </>
                  ) : null}
                </div>
              </div>

              {expanded === p.id && (
                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  <div>
                    <p className="text-2xs font-medium text-muted uppercase mb-1">Full Statement</p>
                    <pre className="text-sm text-text-2 whitespace-pre-wrap bg-background p-3 rounded-lg border border-border text-xs">{p.statement}</pre>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <p className="text-2xs font-medium text-muted uppercase mb-1">Answer</p>
                      <code className="text-sm text-text bg-background px-2 py-1 rounded border border-border">{p.answer}</code>
                    </div>
                    {p.choices && (
                      <div className="flex-1">
                        <p className="text-2xs font-medium text-muted uppercase mb-1">Choices</p>
                        {Object.entries(p.choices).map(([k, v]) => (
                          <p key={k} className="text-xs text-muted"><span className="font-semibold">{k}:</span> {v}</p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-2xs font-medium text-muted uppercase mb-1">Solution</p>
                    <pre className="text-xs text-subtle whitespace-pre-wrap bg-background p-3 rounded-lg border border-border">{p.solution}</pre>
                  </div>
                </div>
              )}
            </div>
          ))}

          {problems.length === 0 && (
            <p className="text-center text-sm text-muted py-12">No {statusFilter} problems.</p>
          )}
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="text-sm text-muted disabled:opacity-30"
            >
              ← Previous
            </button>
            <span className="text-sm text-muted">Page {page + 1} of {Math.ceil(total / 20)}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={(page + 1) * 20 >= total}
              className="text-sm text-muted disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
