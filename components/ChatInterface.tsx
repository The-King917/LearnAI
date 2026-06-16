"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Subject } from "@/lib/subjects";
import { Difficulty, buildSystemPrompt } from "@/lib/prompts";
import Markdown from "./Markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  subject: Subject | null;
  difficulty: Difficulty;
  mode: "chat" | "practice" | "diagnose";
  initialMessage?: string;
}

const QUICK_PROMPTS = [
  "Give me a practice problem",
  "What are the key concepts?",
  "What mistakes do students make?",
  "How should I approach this?",
];

function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end animate-in">
      <div className="max-w-[72%] px-3.5 py-2.5 rounded-xl rounded-br-sm bg-surface-2 border border-border-2 text-sm text-text leading-relaxed">
        <span style={{ whiteSpace: "pre-wrap" }}>{content}</span>
      </div>
    </div>
  );
}

function AssistantMessage({ content, streaming }: { content: string; streaming?: boolean }) {
  return (
    <div className="flex gap-3 animate-in">
      <div className="w-5 h-5 rounded-md bg-surface-3 border border-border-2 flex items-center justify-center shrink-0 mt-0.5">
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-text-2">
          <path d="M1 5.5L3.5 8 9 2"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <Markdown streaming={streaming}>{content}</Markdown>
      </div>
    </div>
  );
}

export default function ChatInterface({ subject, difficulty, mode, initialMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const systemPrompt = buildSystemPrompt(subject ?? undefined, mode, difficulty);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMsg: Message = { role: "user", content: text.trim() };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
      setLoading(true);
      setStreamingText("");

      if (textareaRef.current) textareaRef.current.style.height = "auto";

      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abortRef.current.signal,
          body: JSON.stringify({
            systemPrompt,
            messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Request failed" }));
          throw new Error(err.error ?? "Request failed");
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let full = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          setStreamingText(full);
        }

        setMessages((prev) => [...prev, { role: "assistant", content: full }]);
        setStreamingText("");
      } catch (err: unknown) {
        if ((err as Error).name === "AbortError") return;
        const msg = err instanceof Error ? err.message : "Something went wrong";
        setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${msg}` }]);
        setStreamingText("");
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, systemPrompt]
  );

  useEffect(() => {
    if (initialMessage && messages.length === 0) sendMessage(initialMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const isEmpty = messages.length === 0 && !loading;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
            <div>
              <p className="text-base font-medium text-text">
                {subject ? `${subject.name} coach` : "Select a subject to begin"}
              </p>
              <p className="text-sm text-muted mt-1">
                {subject
                  ? "Ask anything. I'll guide you through it — never just give you the answer."
                  : "Choose from the sidebar to get started."}
              </p>
            </div>
            {subject && (
              <div className="flex flex-wrap gap-2 justify-center">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="text-xs px-3 py-1.5 rounded-md border border-border text-muted hover:border-border-2 hover:text-text-2 transition-colors duration-100 bg-surface"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((msg, i) =>
          msg.role === "user" ? (
            <UserMessage key={i} content={msg.content} />
          ) : (
            <AssistantMessage key={i} content={msg.content} />
          )
        )}

        {loading && streamingText && (
          <AssistantMessage content={streamingText} streaming />
        )}

        {loading && !streamingText && (
          <div className="flex gap-3 animate-in">
            <div className="w-5 h-5 rounded-full bg-accent-muted border border-accent-border flex items-center justify-center shrink-0 mt-0.5">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#5E6AD2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 5.5L3.5 8 9 2"/>
              </svg>
            </div>
            <div className="flex items-center gap-1 pt-1.5">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border px-6 py-4">
        <div className="relative flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={subject ? `Ask about ${subject.name}…` : "Select a subject first…"}
            disabled={!subject || loading}
            rows={1}
            className="flex-1 resize-none bg-surface border border-border rounded-lg px-3.5 py-2.5 text-sm text-text placeholder-muted outline-none focus:border-border-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ minHeight: "40px", maxHeight: "160px" }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading || !subject}
            className="shrink-0 w-8 h-8 rounded-md bg-text hover:bg-text-2 disabled:opacity-20 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <svg className="w-3.5 h-3.5 text-background" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 2l5 5-5 5M2 7h10" />
            </svg>
          </button>
        </div>
        {loading && (
          <button
            onClick={() => { abortRef.current?.abort(); setLoading(false); setStreamingText(""); }}
            className="mt-2 text-xs text-muted hover:text-text-2 transition-colors"
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );
}
