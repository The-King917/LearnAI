"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { ApplicationProfile } from "@/lib/admissions";

interface ProfileEditorProps {
  profile: ApplicationProfile;
  signedIn: boolean;
  onClose: () => void;
  onSave: (profile: ApplicationProfile) => void;
}

const FIELD_CLASS = "w-full bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-text placeholder-muted outline-none focus:border-white/25 focus:shadow-glow transition-all";

export default function ProfileEditor({ profile, signedIn, onClose, onSave }: ProfileEditorProps) {
  const [form, setForm] = useState<ApplicationProfile>(profile);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const set = <K extends keyof ApplicationProfile>(key: K, value: ApplicationProfile[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    setUploadError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/school-profile/parse", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't read that file");
      set("schoolProfile", data.text);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Couldn't read that file");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (signedIn) {
        const res = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const body = await res.json();
        if (res.ok && body.profile) {
          onSave(body.profile);
          onClose();
          return;
        }
      }
      onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto bg-surface border border-border-2 rounded-2xl shadow-panel p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold tracking-[-0.02em] text-text">Application profile</h2>
          <button onClick={onClose} className="text-muted hover:text-text-2 transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M2 2l10 10M12 2L2 12" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-muted mb-5">
          {signedIn
            ? "Saved to your account — fill this out once and reuse it for every school."
            : "Sign in to save this across sessions. For now it's only used in this browser tab."}
        </p>

        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number" step="0.01" min={0} max={5}
              placeholder="GPA (e.g. 3.85)"
              value={form.gpa ?? ""}
              onChange={(e) => set("gpa", e.target.value ? parseFloat(e.target.value) : null)}
              className={FIELD_CLASS}
            />
            <input
              type="text"
              placeholder="GPA scale (e.g. 4.0 unweighted)"
              value={form.gpaScale ?? ""}
              onChange={(e) => set("gpaScale", e.target.value)}
              className={FIELD_CLASS}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number" min={400} max={1600}
              placeholder="SAT score"
              value={form.satScore ?? ""}
              onChange={(e) => set("satScore", e.target.value ? parseInt(e.target.value, 10) : null)}
              className={FIELD_CLASS}
            />
            <input
              type="number" min={1} max={36}
              placeholder="ACT score"
              value={form.actScore ?? ""}
              onChange={(e) => set("actScore", e.target.value ? parseInt(e.target.value, 10) : null)}
              className={FIELD_CLASS}
            />
          </div>
          <input
            type="text"
            placeholder="Intended major"
            value={form.intendedMajor ?? ""}
            onChange={(e) => set("intendedMajor", e.target.value)}
            className={FIELD_CLASS}
          />
          <textarea
            placeholder="Course rigor — APs, IBs, honors, dual enrollment…"
            value={form.courseRigor ?? ""}
            onChange={(e) => set("courseRigor", e.target.value)}
            rows={2}
            className={`${FIELD_CLASS} resize-none`}
          />
          <textarea
            placeholder="Extracurriculars & leadership"
            value={form.extracurriculars ?? ""}
            onChange={(e) => set("extracurriculars", e.target.value)}
            rows={3}
            className={`${FIELD_CLASS} resize-none`}
          />
          <textarea
            placeholder="Awards & honors"
            value={form.awards ?? ""}
            onChange={(e) => set("awards", e.target.value)}
            rows={2}
            className={`${FIELD_CLASS} resize-none`}
          />
          <textarea
            placeholder="Personal statement / essay draft (optional, but the single most useful thing you can paste in)"
            value={form.essay ?? ""}
            onChange={(e) => set("essay", e.target.value)}
            rows={5}
            className={`${FIELD_CLASS} resize-none`}
          />
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label className="text-xs text-muted">
                High school profile — upload your school's report card / profile sheet (GPA distribution, weighting, AP offerings, class size)
              </label>
              <label className={`shrink-0 text-2xs font-medium px-2.5 py-1 rounded-md border border-border cursor-pointer transition-colors ${uploading ? "text-subtle" : "text-text-2 hover:border-border-2 hover:bg-surface-2"}`}>
                {uploading ? "Reading…" : "Upload PDF/image"}
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
            {uploadError && <p className="text-xs text-red-400 mb-1.5">{uploadError}</p>}
            <textarea
              placeholder="Extracted text appears here — edit freely, or paste it in yourself"
              value={form.schoolProfile ?? ""}
              onChange={(e) => set("schoolProfile", e.target.value)}
              rows={4}
              className={`${FIELD_CLASS} resize-none`}
            />
          </div>
          <textarea
            placeholder="Additional context (first-gen, legacy, state/country, special circumstances)…"
            value={form.demographics ?? ""}
            onChange={(e) => set("demographics", e.target.value)}
            rows={2}
            className={`${FIELD_CLASS} resize-none`}
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold bg-white text-background hover:bg-white/85 disabled:opacity-50 transition-all shadow-glow"
          >
            {saving ? "Saving…" : "Save profile"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
