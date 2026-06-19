"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export type EffectivePlan = "FREE" | "PRO" | "TEAM";

/** Client-side read of the signed-in user's effective plan, via /api/account. */
export function usePlan(): { plan: EffectivePlan | null; loading: boolean } {
  const { status } = useSession();
  const [plan, setPlan] = useState<EffectivePlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") { setLoading(true); return; }
    if (status !== "authenticated") { setPlan(null); setLoading(false); return; }

    setLoading(true);
    fetch("/api/account")
      .then((r) => r.json())
      .then((data) => setPlan(data.plan ?? "FREE"))
      .catch(() => setPlan("FREE"))
      .finally(() => setLoading(false));
  }, [status]);

  return { plan, loading };
}
