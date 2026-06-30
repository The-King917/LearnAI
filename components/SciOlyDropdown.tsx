"use client";

import { useState, useRef, useEffect } from "react";
import { SCIOLY_EVENTS, Subject } from "@/lib/subjects";

interface SciOlyDropdownProps {
  value: Subject | null;
  onChange: (event: Subject) => void;
}

export default function SciOlyDropdown({ value, onChange }: SciOlyDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative mt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all duration-150 cursor-pointer ${
          value
            ? "border-accent bg-accent/10 text-accent"
            : "border-border-2 bg-surface-2 text-text-2 hover:border-[#484848] hover:text-text"
        }`}
      >
        <span>{value ? value.name : "Pick an event…"}</span>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round"
          className={`shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        >
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1.5 rounded-xl border border-border-2 bg-[#111] shadow-panel overflow-hidden">
          <div className="max-h-56 overflow-y-auto py-1">
            {SCIOLY_EVENTS.map((event) => (
              <button
                key={event.id}
                onClick={() => { onChange(event); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors duration-100 cursor-pointer ${
                  value?.id === event.id
                    ? "text-accent bg-accent/10"
                    : "text-text-2 hover:text-text hover:bg-white/5"
                }`}
              >
                {event.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
