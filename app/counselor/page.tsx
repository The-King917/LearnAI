"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import CounselorSidebar, { CounselorView } from "@/components/CounselorSidebar";
import ChatInterface from "@/components/ChatInterface";
import ProfileEditor from "@/components/ProfileEditor";
import { University } from "@/lib/universities";
import { ApplicationProfile, buildAdmissionsPrompt, buildMatchPrompt, isProfileEmpty } from "@/lib/admissions";

const EMPTY_PROFILE: ApplicationProfile = {};

export default function CounselorPage() {
  const { data: session, status } = useSession();
  const [view, setView] = useState<CounselorView>("review");
  const [university, setUniversity] = useState<University | null>(null);
  const [recentUniversities, setRecentUniversities] = useState<University[]>([]);
  const [customUniversities, setCustomUniversities] = useState<University[]>([]);
  const [profile, setProfile] = useState<ApplicationProfile>(EMPTY_PROFILE);
  const [profileOpen, setProfileOpen] = useState(false);
  const [key, setKey] = useState(0);

  const signedIn = status === "authenticated" && !!session;

  useEffect(() => {
    if (!signedIn) { setProfile(EMPTY_PROFILE); return; }
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => { if (data.profile) setProfile(data.profile); })
      .catch(() => {});
  }, [signedIn]);

  const handleViewChange = useCallback((v: CounselorView) => {
    setView(v);
    setKey((k) => k + 1);
  }, []);

  const handleUniversityChange = useCallback((u: University) => {
    setUniversity(u);
    setKey((k) => k + 1);
    setRecentUniversities((prev) => [u, ...prev.filter((r) => r.id !== u.id)].slice(0, 8));
    if (u.isCustom) {
      setCustomUniversities((prev) => [u, ...prev.filter((r) => r.id !== u.id)].slice(0, 20));
    }
  }, []);

  const handleProfileSave = useCallback((p: ApplicationProfile) => {
    setProfile(p);
    setKey((k) => k + 1);
  }, []);

  const profileFilled = !isProfileEmpty(profile);
  const systemPrompt = view === "match"
    ? buildMatchPrompt(profile, customUniversities)
    : university ? buildAdmissionsPrompt(university, profile) : undefined;

  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(255,255,255,0.05) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 h-full shrink-0">
        <CounselorSidebar
          view={view}
          onViewChange={handleViewChange}
          university={university}
          onUniversityChange={handleUniversityChange}
          onEditProfile={() => setProfileOpen(true)}
          profileFilled={profileFilled}
          recentUniversities={recentUniversities}
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-11 shrink-0 border-b border-border flex items-center px-5 gap-2 bg-gradient-to-b from-surface/40 to-transparent backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
          <span className="text-sm font-medium text-text">College Counselor</span>
          {view === "review" && university && (
            <>
              <span className="text-subtle">/</span>
              <span className="text-sm text-muted">{university.name}</span>
              <span className="text-subtle">·</span>
              <span className="text-2xs text-muted px-1.5 py-0.5 rounded-full border border-border">{university.acceptanceRate} accepted</span>
            </>
          )}
          {view === "match" && (
            <>
              <span className="text-subtle">/</span>
              <span className="text-sm text-muted">Find my matches</span>
            </>
          )}
          {!profileFilled && (view === "match" || university) && (
            <span className="text-2xs text-subtle ml-auto hidden sm:inline">Fill out your profile for a real evaluation</span>
          )}
        </header>

        <div className="flex-1 overflow-hidden">
          {view === "match" ? (
            <ChatInterface
              key={key}
              subject={null}
              systemPrompt={systemPrompt}
              emptyTitle="Find schools that match your profile"
              emptySubtitle={
                customUniversities.length > 0
                  ? "I'll sort our 40+ schools plus the ones you've added into Far Reach, Reach, Target, and Likely based on your stats — then point out your best genuine matches."
                  : "I'll sort all 40+ schools on our list into Far Reach, Reach, Target, and Likely based on your stats — then point out your best genuine matches. Add your own schools (like a safety school) from the University picker in Review mode."
              }
              quickPrompts={[
                "Show me my matches",
                "Which schools am I a likely admit at?",
                "Which schools are my best genuine fits?",
              ]}
              placeholder="Ask about your school list…"
            />
          ) : (
            <ChatInterface
              key={key}
              subject={null}
              systemPrompt={systemPrompt}
              emptyTitle={university ? `${university.name} admissions review` : "Select a university to begin"}
              emptySubtitle={
                university
                  ? "I'll evaluate your application as if I were on the committee — be honest with me about what you've got."
                  : "Choose a school from the sidebar, then ask for your chances."
              }
              quickPrompts={[
                "Evaluate my full application",
                "What are my chances?",
                "How can I improve my essay?",
                "What's missing from my application?",
              ]}
              placeholder={university ? `Ask the ${university.name} admissions officer…` : "Select a university first…"}
            />
          )}
        </div>
      </div>

      {profileOpen && (
        <ProfileEditor
          profile={profile}
          signedIn={signedIn}
          onClose={() => setProfileOpen(false)}
          onSave={handleProfileSave}
        />
      )}
    </div>
  );
}
