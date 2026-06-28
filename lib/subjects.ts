export interface Subject {
  id: string;
  name: string;
  group: string;
  shortName?: string;
  /** Requires a Pro (or Team) plan — Free users are gated off this subject. */
  restricted?: boolean;
  /** Not surfaced in the UI — preserved in DB for existing sessions. */
  hidden?: boolean;
}

export const SUBJECTS: Subject[] = [
  // Math Competitions
  { id: "amc8", name: "AMC 8", group: "Math Competitions" },
  { id: "amc10", name: "AMC 10", group: "Math Competitions" },
  { id: "amc12", name: "AMC 12", group: "Math Competitions" },
  { id: "aime", name: "AIME", group: "Math Competitions" },
  { id: "usamo", name: "USAMO", group: "Math Competitions" },
  { id: "mathcounts", name: "MATHCOUNTS", group: "Math Competitions" },

  // Science Competitions
  { id: "usaco", name: "USACO", group: "Science Competitions" },
  { id: "acsl", name: "ACSL", group: "Science Competitions" },
  { id: "fma", name: "F=ma (Physics)", group: "Science Competitions" },
  { id: "usnco", name: "USNCO (Chemistry)", group: "Science Competitions" },
  { id: "usabo", name: "USABO (Biology)", group: "Science Competitions" },
  { id: "science-olympiad", name: "Science Olympiad", group: "Science Competitions" },
  { id: "science-bowl", name: "Science Bowl", group: "Science Competitions" },

  // Hidden from UI — preserved in DB for existing sessions
  { id: "quiz-bowl", name: "Quiz Bowl", group: "Academic Competitions", hidden: true },
  { id: "model-un", name: "Model UN", group: "Academic Competitions", hidden: true },
  { id: "robotics", name: "Robotics", group: "Academic Competitions", hidden: true },
  { id: "deca", name: "DECA", group: "Business & CTSO", hidden: true },
  { id: "fbla", name: "FBLA", group: "Business & CTSO", hidden: true },
  { id: "hosa", name: "HOSA", group: "Business & CTSO", hidden: true },
  { id: "policy-debate", name: "Policy Debate", group: "Speech & Debate", hidden: true },
  { id: "ld-debate", name: "LD Debate", group: "Speech & Debate", hidden: true },
  { id: "pf-debate", name: "PF Debate", group: "Speech & Debate", hidden: true },
  { id: "speech", name: "Speech", group: "Speech & Debate", hidden: true },
  { id: "leetcode", name: "LeetCode / DSA", group: "Coding Interviews", restricted: true, hidden: true },
  { id: "system-design", name: "System Design", group: "Coding Interviews", restricted: true, hidden: true },
  { id: "quant-probability", name: "Probability & Mental Math", group: "Quant Interviews", restricted: true, hidden: true },
  { id: "quant-market-making", name: "Market Making", group: "Quant Interviews", restricted: true, hidden: true },
  { id: "quant-brainteasers", name: "Brain Teasers", group: "Quant Interviews", restricted: true, hidden: true },
  { id: "lsat-lr", name: "LSAT — Logical Reasoning", group: "Test Prep", shortName: "LSAT LR", hidden: true },
  { id: "lsat-lg", name: "LSAT — Logic Games", group: "Test Prep", shortName: "LSAT Logic Games", hidden: true },
  { id: "lsat-rc", name: "LSAT — Reading Comprehension", group: "Test Prep", shortName: "LSAT RC", hidden: true },
  { id: "mcat-bio", name: "MCAT — Bio/Biochem", group: "Test Prep", shortName: "MCAT Bio", hidden: true },
  { id: "mcat-chem", name: "MCAT — Chem/Physics", group: "Test Prep", shortName: "MCAT Chem", hidden: true },
  { id: "mcat-psych", name: "MCAT — Psych/Soc", group: "Test Prep", shortName: "MCAT Psych", hidden: true },
  { id: "mcat-cars", name: "MCAT — CARS", group: "Test Prep", shortName: "MCAT CARS", hidden: true },
  { id: "ap-english-lang", name: "AP English Language & Composition", group: "AP — English", shortName: "AP Eng Lang", hidden: true },
  { id: "ap-english-lit", name: "AP English Literature & Composition", group: "AP — English", shortName: "AP Eng Lit", hidden: true },
  { id: "ap-us-history", name: "AP US History", group: "AP — History & Social Science", shortName: "APUSH", hidden: true },
  { id: "ap-world-history", name: "AP World History: Modern", group: "AP — History & Social Science", shortName: "AP World", hidden: true },
  { id: "ap-european-history", name: "AP European History", group: "AP — History & Social Science", shortName: "AP Euro", hidden: true },
  { id: "ap-us-gov", name: "AP US Government & Politics", group: "AP — History & Social Science", shortName: "AP Gov", hidden: true },
  { id: "ap-comp-gov", name: "AP Comparative Government & Politics", group: "AP — History & Social Science", shortName: "AP Comp Gov", hidden: true },
  { id: "ap-human-geo", name: "AP Human Geography", group: "AP — History & Social Science", shortName: "AP HuGeo", hidden: true },
  { id: "ap-psychology", name: "AP Psychology", group: "AP — History & Social Science", shortName: "AP Psych", hidden: true },
  { id: "ap-macroeconomics", name: "AP Macroeconomics", group: "AP — History & Social Science", shortName: "AP Macro", hidden: true },
  { id: "ap-microeconomics", name: "AP Microeconomics", group: "AP — History & Social Science", shortName: "AP Micro", hidden: true },
  { id: "ap-calc-ab", name: "AP Calculus AB", group: "AP — Math", shortName: "AP Calc AB", hidden: true },
  { id: "ap-calc-bc", name: "AP Calculus BC", group: "AP — Math", shortName: "AP Calc BC", hidden: true },
  { id: "ap-statistics", name: "AP Statistics", group: "AP — Math", shortName: "AP Stats", hidden: true },
  { id: "ap-precalculus", name: "AP Precalculus", group: "AP — Math", shortName: "AP Precalc", hidden: true },
  { id: "ap-biology", name: "AP Biology", group: "AP — Science", shortName: "AP Bio", hidden: true },
  { id: "ap-chemistry", name: "AP Chemistry", group: "AP — Science", shortName: "AP Chem", hidden: true },
  { id: "ap-physics-1", name: "AP Physics 1: Algebra-Based", group: "AP — Science", shortName: "AP Physics 1", hidden: true },
  { id: "ap-physics-2", name: "AP Physics 2: Algebra-Based", group: "AP — Science", shortName: "AP Physics 2", hidden: true },
  { id: "ap-physics-c-mech", name: "AP Physics C: Mechanics", group: "AP — Science", shortName: "AP Phys C Mech", hidden: true },
  { id: "ap-physics-c-em", name: "AP Physics C: E&M", group: "AP — Science", shortName: "AP Phys C E&M", hidden: true },
  { id: "ap-environmental", name: "AP Environmental Science", group: "AP — Science", shortName: "AP Environ", hidden: true },
  { id: "ap-csa", name: "AP Computer Science A", group: "AP — Science", shortName: "AP CSA", hidden: true },
  { id: "ap-csp", name: "AP Computer Science Principles", group: "AP — Science", shortName: "AP CSP", hidden: true },
  { id: "ap-spanish-lang", name: "AP Spanish Language & Culture", group: "AP — World Languages", shortName: "AP Spanish", hidden: true },
  { id: "ap-spanish-lit", name: "AP Spanish Literature & Culture", group: "AP — World Languages", shortName: "AP Spanish Lit", hidden: true },
  { id: "ap-french", name: "AP French Language & Culture", group: "AP — World Languages", shortName: "AP French", hidden: true },
  { id: "ap-german", name: "AP German Language & Culture", group: "AP — World Languages", shortName: "AP German", hidden: true },
  { id: "ap-chinese", name: "AP Chinese Language & Culture", group: "AP — World Languages", shortName: "AP Chinese", hidden: true },
  { id: "ap-japanese", name: "AP Japanese Language & Culture", group: "AP — World Languages", shortName: "AP Japanese", hidden: true },
  { id: "ap-italian", name: "AP Italian Language & Culture", group: "AP — World Languages", shortName: "AP Italian", hidden: true },
  { id: "ap-latin", name: "AP Latin", group: "AP — World Languages", shortName: "AP Latin", hidden: true },
  { id: "ap-art-history", name: "AP Art History", group: "AP — Arts", shortName: "AP Art Hist", hidden: true },
  { id: "ap-music-theory", name: "AP Music Theory", group: "AP — Arts", shortName: "AP Music", hidden: true },
  { id: "ap-studio-2d", name: "AP Studio Art: 2-D Design", group: "AP — Arts", shortName: "AP Studio 2D", hidden: true },
  { id: "ap-studio-3d", name: "AP Studio Art: 3-D Design", group: "AP — Arts", shortName: "AP Studio 3D", hidden: true },
  { id: "ap-studio-drawing", name: "AP Studio Art: Drawing", group: "AP — Arts", shortName: "AP Drawing", hidden: true },
  { id: "ap-seminar", name: "AP Seminar", group: "AP — Capstone", shortName: "AP Seminar", hidden: true },
  { id: "ap-research", name: "AP Research", group: "AP — Capstone", shortName: "AP Research", hidden: true },
];

export const VISIBLE_SUBJECTS = SUBJECTS.filter((s) => !s.hidden);

export const SUBJECT_GROUPS = Array.from(new Set(VISIBLE_SUBJECTS.map((s) => s.group)));

export function getSubjectById(id: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id);
}

export function isRestrictedSubject(id: string | null | undefined): boolean {
  if (!id) return false;
  return getSubjectById(id)?.restricted === true;
}
