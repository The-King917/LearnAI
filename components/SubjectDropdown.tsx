"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { VISIBLE_SUBJECTS, SUBJECT_GROUPS, Subject } from "@/lib/subjects";
import { usePlan } from "@/lib/use-plan";

interface SubjectDropdownProps {
  value: Subject | null;
  onChange: (subject: Subject) => void;
}

export default function SubjectDropdown({ value, onChange }: SubjectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { plan } = usePlan();
  const isFree = plan === "FREE";

  const filtered = query.trim()
    ? VISIBLE_SUBJECTS.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.group.toLowerCase().includes(query.toLowerCase()) ||
          (s.shortName?.toLowerCase().includes(query.toLowerCase()) ?? false)
      )
    : VISIBLE_SUBJECTS;

  const filteredGroups = SUBJECT_GROUPS.filter((g) => filtered.some((s) => s.group === g));

  const handleSelect = useCallback((subject: Subject) => {
    onChange(subject);
    setOpen(false);
    setQuery("");
  }, [onChange]);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-sm text-left transition-all duration-100 border ${
          open
            ? "bg-surface-2 border-accent text-text"
            : "bg-surface-2 border-border text-muted hover:border-border-2 hover:text-text-2"
        }`}
      >
        <span className="truncate">{value ? value.name : "Select subject…"}</span>
        <svg
          className={`w-3 h-3 shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 4l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-surface-2 border border-border-2 rounded-xl shadow-panel overflow-hidden animate-in">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <svg className="w-3 h-3 text-muted shrink-0" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6" cy="6" r="4.5"/>
              <path strokeLinecap="round" d="M11 11l-1.5-1.5"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-text placeholder-muted outline-none"
            />
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {filteredGroups.length === 0 && (
              <p className="text-muted text-sm text-center py-6">No results</p>
            )}
            {filteredGroups.map((group) => (
              <div key={group}>
                <div className="px-3 py-1.5 text-2xs font-medium text-muted uppercase tracking-[0.07em] sticky top-0 bg-surface-2">
                  {group}
                </div>
                {filtered.filter((s) => s.group === group).map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => handleSelect(subject)}
                    className={`w-full flex items-center justify-between gap-2 text-left px-3 py-1.5 text-sm transition-colors duration-75 ${
                      value?.id === subject.id
                        ? "text-text bg-surface-3"
                        : "text-text-2 hover:bg-surface-3 hover:text-text"
                    }`}
                  >
                    <span className="truncate">{subject.name}</span>
                    {subject.restricted && isFree && (
                      <span className="text-2xs font-semibold text-muted px-1.5 py-0.5 rounded-full border border-border-2 shrink-0">PRO</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
