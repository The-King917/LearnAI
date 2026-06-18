"use client";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

interface AccountData {
  plan: "FREE" | "PRO" | "TEAM";
  monthlyMessageCount: number;
  freeMessageLimit: number;
  organization: { name: string; seatLimit: number; memberCount: number; isOwner: boolean } | null;
  ownedOrganization: { inviteCode: string; seatLimit: number; memberCount: number } | null;
}

interface OrgMember {
  id: string;
  email: string;
  name: string | null;
}

export default function AccountPage() {
  const { status } = useSession();
  const [data, setData] = useState<AccountData | null>(null);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [portalLoading, setPortalLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joining, setJoining] = useState(false);

  const refresh = useCallback(() => {
    fetch("/api/account").then((r) => r.json()).then((d) => { if (!d.error) setData(d); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    refresh();
  }, [status, refresh]);

  useEffect(() => {
    if (!data?.ownedOrganization) return;
    fetch("/api/org/members")
      .then((r) => r.json())
      .then((d) => setMembers(d.organization?.members ?? []))
      .catch(() => {});
  }, [data?.ownedOrganization]);

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const body = await res.json();
      if (res.ok) window.location.href = body.url;
    } finally {
      setPortalLoading(false);
    }
  };

  const removeMember = async (userId: string) => {
    await fetch("/api/org/members", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    setMembers((prev) => prev.filter((m) => m.id !== userId));
  };

  const joinOrg = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    setJoinError("");
    try {
      const res = await fetch("/api/org/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode.trim() }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Couldn't join");
      setJoinCode("");
      refresh();
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : "Couldn't join");
    } finally {
      setJoining(false);
    }
  };

  const copyInvite = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  if (status === "loading") return null;

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-text">
        <p className="text-sm text-muted">Sign in from the coach page to view your account.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-border/60">
        <Link href="/" className="flex items-center text-sm font-semibold tracking-[-0.01em]">
          Poly
          <span className="ml-1 px-1.5 py-0.5 rounded-[3px] bg-white text-background text-2xs font-bold tracking-[0.02em]">Teach</span>
        </Link>
        <Link href="/coach" className="text-sm font-medium text-muted hover:text-text transition-colors duration-150">
          Open app →
        </Link>
      </nav>

      <section className="px-6 py-16 max-w-lg mx-auto">
        <h1 className="text-xl font-semibold tracking-[-0.025em] mb-8">Account</h1>

        {!data ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : (
          <div className="space-y-6">
            <div className="p-5 rounded-xl border border-border bg-surface">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-text">{data.plan} plan</span>
                {data.plan === "FREE" && (
                  <Link href="/pricing" className="text-xs text-muted hover:text-text-2 underline">Upgrade</Link>
                )}
              </div>

              {data.plan === "FREE" && (
                <div className="mt-4">
                  <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                    <div
                      className="h-full bg-white"
                      style={{ width: `${Math.min(100, (data.monthlyMessageCount / data.freeMessageLimit) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted mt-2">{data.monthlyMessageCount} / {data.freeMessageLimit} messages this month</p>
                </div>
              )}

              {(data.plan === "PRO" || data.organization?.isOwner) && (
                <button
                  onClick={openPortal}
                  disabled={portalLoading}
                  className="mt-4 text-xs px-3 py-1.5 rounded-lg border border-border text-muted hover:border-border-2 hover:text-text-2 transition-all duration-100 bg-surface disabled:opacity-50"
                >
                  {portalLoading ? "Opening…" : "Manage billing"}
                </button>
              )}
            </div>

            {data.organization ? (
              <div className="p-5 rounded-xl border border-border bg-surface">
                <p className="text-sm font-semibold text-text">{data.organization.name}</p>
                <p className="text-xs text-muted mt-1">{data.organization.memberCount} / {data.organization.seatLimit} seats used</p>
              </div>
            ) : (
              <div className="p-5 rounded-xl border border-border bg-surface">
                <p className="text-sm font-semibold text-text mb-3">Join a Team/School organization</p>
                <div className="flex items-center gap-2">
                  <input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Invite code"
                    className="flex-1 bg-background border border-border rounded-md px-2.5 py-1.5 text-sm text-text placeholder-muted outline-none focus:border-white/25"
                  />
                  <button
                    onClick={joinOrg}
                    disabled={joining || !joinCode.trim()}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted hover:border-border-2 hover:text-text-2 transition-all duration-100 disabled:opacity-50"
                  >
                    {joining ? "Joining…" : "Join"}
                  </button>
                </div>
                {joinError && <p className="text-xs text-red-400 mt-2">{joinError}</p>}
              </div>
            )}

            {data.ownedOrganization && (
              <div className="p-5 rounded-xl border border-border bg-surface">
                <p className="text-sm font-semibold text-text mb-3">Invite members</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs px-2 py-1 rounded-md bg-surface-2 border border-border text-muted flex-1 truncate">{data.ownedOrganization.inviteCode}</code>
                  <button
                    onClick={() => copyInvite(data.ownedOrganization!.inviteCode)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted hover:border-border-2 hover:text-text-2 transition-all duration-100"
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                <p className="text-xs text-muted mt-5 mb-2">Members ({members.length}/{data.ownedOrganization.seatLimit})</p>
                <div className="space-y-1.5">
                  {members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-sm">
                      <span className="text-text-2">{m.name ?? m.email}</span>
                      <button onClick={() => removeMember(m.id)} className="text-xs text-muted hover:text-red-400 transition-colors">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
