"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { UNIVERSITIES, UNIVERSITY_GROUPS, University } from "@/lib/universities";

interface UniversityDropdownProps {
  value: University | null;
  onChange: (university: University) => void;
}

export default function UniversityDropdown({ value, onChange }: UniversityDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? UNIVERSITIES.filter(
        (u) =>
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.group.toLowerCase().includes(query.toLowerCase())
      )
    : UNIVERSITIES;

  const filteredGroups = UNIVERSITY_GROUPS.filter((g) => filtered.some((u) => u.group === g));

  const handleSelect = useCallback((university: University) => {
    onChange(university);
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
            ? "bg-surface-2 border-white/25 text-text shadow-glow"
            : "bg-surface-2 border-border text-muted hover:border-border-2 hover:text-text-2"
        }`}
      >
        <span className="truncate">{value ? value.name : "Select university…"}</span>
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
                {filtered.filter((u) => u.group === group).map((university) => (
                  <button
                    key={university.id}
                    onClick={() => handleSelect(university)}
                    className={`w-full text-left px-3 py-1.5 text-sm transition-colors duration-75 flex items-center justify-between gap-2 ${
                      value?.id === university.id
                        ? "text-text bg-surface-3"
                        : "text-text-2 hover:bg-surface-3 hover:text-text"
                    }`}
                  >
                    <span className="truncate">{university.name}</span>
                    <span className="text-2xs text-subtle shrink-0">{university.acceptanceRate}</span>
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
