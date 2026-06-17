"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { signIn } from "next-auth/react";

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Sign up failed");
      }

      const result = await signIn("credentials", { redirect: false, email, password });
      if (result?.error) throw new Error("Invalid email or password");
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in" onClick={onClose}>
      <div
        className="w-full max-w-sm mx-4 bg-surface border border-border-2 rounded-2xl shadow-panel p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold tracking-[-0.02em] text-text">
            {mode === "signin" ? "Sign in" : "Create account"}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-text-2 transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M2 2l10 10M12 2L2 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-text placeholder-muted outline-none focus:border-white/25 focus:shadow-glow transition-all"
            />
          )}
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-text placeholder-muted outline-none focus:border-white/25 focus:shadow-glow transition-all"
          />
          <input
            type="password"
            required
            minLength={8}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-text placeholder-muted outline-none focus:border-white/25 focus:shadow-glow transition-all"
          />

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold bg-white text-background hover:bg-white/85 disabled:opacity-50 transition-all shadow-glow"
          >
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="text-xs text-muted text-center mt-4">
          {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
            className="text-text-2 hover:text-text font-medium transition-colors"
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>,
    document.body
  );
}
