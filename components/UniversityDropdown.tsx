"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { UNIVERSITIES, UNIVERSITY_GROUPS, University, createCustomUniversity } from "@/lib/universities";

interface UniversityDropdownProps {
  value: University | null;
  onChange: (university: University) => void;
}

export default function UniversityDropdown({ value, onChange }: UniversityDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [addingCustom, setAddingCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customRate, setCustomRate] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const customNameRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? UNIVERSITIES.filter(
        (u) =>
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.group.toLowerCase().includes(query.toLowerCase())
      )
    : UNIVERSITIES;

  const filteredGroups = UNIVERSITY_GROUPS.filter((g) => filtered.some((u) => u.group === g));

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setAddingCustom(false);
    setCustomName("");
    setCustomRate("");
  }, []);

  const handleSelect = useCallback((university: University) => {
    onChange(university);
    close();
  }, [onChange, close]);

  const startAddCustom = useCallback(() => {
    setCustomName(query.trim());
    setAddingCustom(true);
  }, [query]);

  const submitCustom = useCallback(() => {
    if (!customName.trim()) return;
    handleSelect(createCustomUniversity(customName, customRate));
  }, [customName, customRate, handleSelect]);

  useEffect(() => { if (open && !addingCustom) inputRef.current?.focus(); }, [open, addingCustom]);
  useEffect(() => { if (addingCustom) customNameRef.current?.focus(); }, [addingCustom]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [close]);

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
          {addingCustom ? (
            <div className="p-3 space-y-2">
              <p className="text-2xs font-medium text-muted uppercase tracking-[0.07em] px-1">Add your own school</p>
              <input
                ref={customNameRef}
                type="text"
                placeholder="School name, e.g. Ohio State University"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submitCustom(); if (e.key === "Escape") setAddingCustom(false); }}
                className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-sm text-text placeholder-muted outline-none focus:border-accent"
              />
              <input
                type="text"
                placeholder="Acceptance rate, e.g. ~50% (optional)"
                value={customRate}
                onChange={(e) => setCustomRate(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submitCustom(); if (e.key === "Escape") setAddingCustom(false); }}
                className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-sm text-text placeholder-muted outline-none focus:border-accent"
              />
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={submitCustom}
                  disabled={!customName.trim()}
                  className="flex-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-accent text-background hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Add school
                </button>
                <button
                  onClick={() => setAddingCustom(false)}
                  className="px-3 py-1.5 rounded-lg text-sm text-muted hover:text-text-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
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
                  <div className="py-4 text-center">
                    <p className="text-muted text-sm">No results</p>
                  </div>
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
              <button
                onClick={startAddCustom}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-text-2 hover:bg-surface-3 border-t border-border transition-colors duration-75"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M6 1.5v9M1.5 6h9" />
                </svg>
                {query.trim() ? `Add "${query.trim()}" as your own school` : "Add a school not on this list"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
