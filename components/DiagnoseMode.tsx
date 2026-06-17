"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Subject } from "@/lib/subjects";
import { Difficulty, buildSystemPrompt } from "@/lib/prompts";
import Markdown from "./Markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface DiagnoseModeProps {
  subject: Subject | null;
  onLevelFound: (level: Difficulty) => void;
}

export default function DiagnoseMode({ subject, onLevelFound }: DiagnoseModeProps) {
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [complete, setComplete] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const systemPrompt = buildSystemPrompt(subject ?? undefined, "diagnose", "intermediate");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamText]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    setStreamText("");

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({ systemPrompt, messages: newMsgs }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setStreamText(full);
      }

      const aiMsg: Message = { role: "assistant", content: full };
      setMessages((prev) => [...prev, aiMsg]);
      setStreamText("");

      const lower = full.toLowerCase();
      if (lower.includes("estimated level") || lower.includes("assessment:") || lower.includes("diagnostic complete")) {
        setComplete(true);
        if (lower.includes("olympiad")) onLevelFound("olympiad");
        else if (lower.includes("advanced")) onLevelFound("advanced");
        else if (lower.includes("intermediate")) onLevelFound("intermediate");
        else onLevelFound("beginner");
      }
    } catch (err: unknown) {
      if ((err as Error).name === "AbortError") return;
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
      setStreamText("");
    } finally {
      setLoading(false);
    }
  }, [loading, messages, systemPrompt, onLevelFound]);

  const startDiagnostic = useCallback(async () => {
    setStarted(true);
    const seed: Message = { role: "user", content: "Start my diagnostic." };
    setMessages([seed]);
    setLoading(true);
    setStreamText("");

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({ systemPrompt, messages: [seed] }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setStreamText(full);
      }
      setMessages([seed, { role: "assistant", content: full }]);
      setStreamText("");
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [systemPrompt]);

  if (!subject) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted">Select a subject to run a diagnostic.</p>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-6 max-w-sm mx-auto">
        <div>
          <p className="text-lg font-semibold tracking-[-0.02em] text-text">{subject.name}</p>
          <p className="text-sm text-muted mt-2 leading-relaxed">
            An adaptive 8–10 question diagnostic that adjusts difficulty in real time.
            You&apos;ll get a detailed level assessment and a personalized study plan at the end.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted w-full">
          {["Adaptive difficulty", "5–7 topic areas", "Honest assessment", "Study roadmap"].map((f) => (
            <div key={f} className="flex items-center gap-2 bg-surface border border-border rounded-md px-3 py-2">
              <svg className="w-3 h-3 text-text-2 shrink-0" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 6.5l3 3 6-6"/>
              </svg>
              {f}
            </div>
          ))}
        </div>
        <button
          onClick={startDiagnostic}
          className="px-4 py-2 rounded-md text-sm text-background font-semibold bg-white hover:bg-white/85 transition-all shadow-glow"
        >
          Begin diagnostic
        </button>
      </div>
    );
  }

  const visible = messages.filter((m) => !(m.role === "user" && m.content === "Start my diagnostic."));

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {visible.map((msg, i) => (
          msg.role === "user" ? (
            <div key={i} className="flex justify-end animate-in">
              <div className="max-w-[72%] px-3.5 py-2.5 rounded-2xl rounded-br-sm bg-surface-2 border border-border-2 text-sm text-text leading-relaxed">
                {msg.content}
              </div>
            </div>
          ) : (
            <div key={i} className="flex gap-3 animate-in">
              <div className="w-5 h-5 rounded-md bg-white shadow-glow flex items-center justify-center shrink-0 mt-0.5">
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 5.5L3.5 8 9 2"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <Markdown>{msg.content}</Markdown>
              </div>
            </div>
          )
        ))}

        {loading && streamText && (
          <div className="flex gap-3 animate-in">
            <div className="w-5 h-5 rounded-md bg-white shadow-glow flex items-center justify-center shrink-0 mt-0.5">
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 5.5L3.5 8 9 2"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <Markdown streaming>{streamText}</Markdown>
            </div>
          </div>
        )}

        {loading && !streamText && (
          <div className="flex gap-3 animate-in">
            <div className="w-5 h-5 rounded-md bg-white shadow-glow flex items-center justify-center shrink-0 mt-0.5">
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 5.5L3.5 8 9 2"/>
              </svg>
            </div>
            <div className="flex items-center gap-1 pt-1.5">
              <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
            </div>
          </div>
        )}

        {complete && (
          <div className="bg-surface border border-white/20 rounded-lg p-4 animate-in shadow-glow">
            <p className="text-sm font-medium text-text flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-text" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2 7.5L5 10.5 12 3.5"/>
              </svg>
              Diagnostic complete
            </p>
            <p className="text-xs text-muted mt-1">Your level has been updated. Switch to Coach or Practice to continue.</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {!complete && (
        <div className="shrink-0 border-t border-border px-6 py-4">
          <div className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`; }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
              placeholder="Type your answer…"
              disabled={loading}
              rows={1}
              className="flex-1 resize-none bg-surface border border-border rounded-lg px-3.5 py-2.5 text-sm text-text placeholder-muted outline-none focus:border-white/25 focus:shadow-glow transition-all disabled:opacity-40"
              style={{ minHeight: "40px", maxHeight: "120px" }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="shrink-0 w-8 h-8 rounded-md bg-white hover:bg-white/85 disabled:opacity-30 transition-all flex items-center justify-center"
            >
              <svg className="w-3.5 h-3.5 text-background" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 2l5 5-5 5M2 7h10" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
