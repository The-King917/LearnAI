export interface Subject {
  id: string;
  name: string;
  group: string;
  shortName?: string;
  /** Requires a Pro (or Team) plan — Free users are gated off this subject. */
  restricted?: boolean;
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

  // Academic Competitions
  { id: "quiz-bowl", name: "Quiz Bowl", group: "Academic Competitions" },
  { id: "model-un", name: "Model UN", group: "Academic Competitions" },
  { id: "robotics", name: "Robotics", group: "Academic Competitions" },

  // Business & CTSO
  { id: "deca", name: "DECA", group: "Business & CTSO" },
  { id: "fbla", name: "FBLA", group: "Business & CTSO" },
  { id: "hosa", name: "HOSA", group: "Business & CTSO" },

  // Speech & Debate
  { id: "policy-debate", name: "Policy Debate", group: "Speech & Debate" },
  { id: "ld-debate", name: "LD Debate", group: "Speech & Debate" },
  { id: "pf-debate", name: "PF Debate", group: "Speech & Debate" },
  { id: "speech", name: "Speech", group: "Speech & Debate" },

  // Coding Interviews
  { id: "leetcode", name: "LeetCode / DSA", group: "Coding Interviews", restricted: true },
  { id: "system-design", name: "System Design", group: "Coding Interviews", restricted: true },

  // Quant Interviews
  { id: "quant-probability", name: "Probability & Mental Math", group: "Quant Interviews", restricted: true },
  { id: "quant-market-making", name: "Market Making", group: "Quant Interviews", restricted: true },
  { id: "quant-brainteasers", name: "Brain Teasers", group: "Quant Interviews", restricted: true },

  // Test Prep — LSAT
  { id: "lsat-lr", name: "LSAT — Logical Reasoning", group: "Test Prep", shortName: "LSAT LR" },
  { id: "lsat-lg", name: "LSAT — Logic Games", group: "Test Prep", shortName: "LSAT Logic Games" },
  { id: "lsat-rc", name: "LSAT — Reading Comprehension", group: "Test Prep", shortName: "LSAT RC" },

  // Test Prep — MCAT
  { id: "mcat-bio", name: "MCAT — Bio/Biochem", group: "Test Prep", shortName: "MCAT Bio" },
  { id: "mcat-chem", name: "MCAT — Chem/Physics", group: "Test Prep", shortName: "MCAT Chem" },
  { id: "mcat-psych", name: "MCAT — Psych/Soc", group: "Test Prep", shortName: "MCAT Psych" },
  { id: "mcat-cars", name: "MCAT — CARS", group: "Test Prep", shortName: "MCAT CARS" },

  // AP Courses — English
  { id: "ap-english-lang", name: "AP English Language & Composition", group: "AP — English", shortName: "AP Eng Lang" },
  { id: "ap-english-lit", name: "AP English Literature & Composition", group: "AP — English", shortName: "AP Eng Lit" },

  // AP Courses — History & Social Sciences
  { id: "ap-us-history", name: "AP US History", group: "AP — History & Social Science", shortName: "APUSH" },
  { id: "ap-world-history", name: "AP World History: Modern", group: "AP — History & Social Science", shortName: "AP World" },
  { id: "ap-european-history", name: "AP European History", group: "AP — History & Social Science", shortName: "AP Euro" },
  { id: "ap-us-gov", name: "AP US Government & Politics", group: "AP — History & Social Science", shortName: "AP Gov" },
  { id: "ap-comp-gov", name: "AP Comparative Government & Politics", group: "AP — History & Social Science", shortName: "AP Comp Gov" },
  { id: "ap-human-geo", name: "AP Human Geography", group: "AP — History & Social Science", shortName: "AP HuGeo" },
  { id: "ap-psychology", name: "AP Psychology", group: "AP — History & Social Science", shortName: "AP Psych" },
  { id: "ap-macroeconomics", name: "AP Macroeconomics", group: "AP — History & Social Science", shortName: "AP Macro" },
  { id: "ap-microeconomics", name: "AP Microeconomics", group: "AP — History & Social Science", shortName: "AP Micro" },

  // AP Courses — Math
  { id: "ap-calc-ab", name: "AP Calculus AB", group: "AP — Math", shortName: "AP Calc AB" },
  { id: "ap-calc-bc", name: "AP Calculus BC", group: "AP — Math", shortName: "AP Calc BC" },
  { id: "ap-statistics", name: "AP Statistics", group: "AP — Math", shortName: "AP Stats" },
  { id: "ap-precalculus", name: "AP Precalculus", group: "AP — Math", shortName: "AP Precalc" },

  // AP Courses — Science
  { id: "ap-biology", name: "AP Biology", group: "AP — Science", shortName: "AP Bio" },
  { id: "ap-chemistry", name: "AP Chemistry", group: "AP — Science", shortName: "AP Chem" },
  { id: "ap-physics-1", name: "AP Physics 1: Algebra-Based", group: "AP — Science", shortName: "AP Physics 1" },
  { id: "ap-physics-2", name: "AP Physics 2: Algebra-Based", group: "AP — Science", shortName: "AP Physics 2" },
  { id: "ap-physics-c-mech", name: "AP Physics C: Mechanics", group: "AP — Science", shortName: "AP Phys C Mech" },
  { id: "ap-physics-c-em", name: "AP Physics C: E&M", group: "AP — Science", shortName: "AP Phys C E&M" },
  { id: "ap-environmental", name: "AP Environmental Science", group: "AP — Science", shortName: "AP Environ" },
  { id: "ap-csa", name: "AP Computer Science A", group: "AP — Science", shortName: "AP CSA" },
  { id: "ap-csp", name: "AP Computer Science Principles", group: "AP — Science", shortName: "AP CSP" },

  // AP Courses — World Languages
  { id: "ap-spanish-lang", name: "AP Spanish Language & Culture", group: "AP — World Languages", shortName: "AP Spanish" },
  { id: "ap-spanish-lit", name: "AP Spanish Literature & Culture", group: "AP — World Languages", shortName: "AP Spanish Lit" },
  { id: "ap-french", name: "AP French Language & Culture", group: "AP — World Languages", shortName: "AP French" },
  { id: "ap-german", name: "AP German Language & Culture", group: "AP — World Languages", shortName: "AP German" },
  { id: "ap-chinese", name: "AP Chinese Language & Culture", group: "AP — World Languages", shortName: "AP Chinese" },
  { id: "ap-japanese", name: "AP Japanese Language & Culture", group: "AP — World Languages", shortName: "AP Japanese" },
  { id: "ap-italian", name: "AP Italian Language & Culture", group: "AP — World Languages", shortName: "AP Italian" },
  { id: "ap-latin", name: "AP Latin", group: "AP — World Languages", shortName: "AP Latin" },

  // AP Courses — Arts
  { id: "ap-art-history", name: "AP Art History", group: "AP — Arts", shortName: "AP Art Hist" },
  { id: "ap-music-theory", name: "AP Music Theory", group: "AP — Arts", shortName: "AP Music" },
  { id: "ap-studio-2d", name: "AP Studio Art: 2-D Design", group: "AP — Arts", shortName: "AP Studio 2D" },
  { id: "ap-studio-3d", name: "AP Studio Art: 3-D Design", group: "AP — Arts", shortName: "AP Studio 3D" },
  { id: "ap-studio-drawing", name: "AP Studio Art: Drawing", group: "AP — Arts", shortName: "AP Drawing" },

  // AP Courses — Seminar
  { id: "ap-seminar", name: "AP Seminar", group: "AP — Capstone", shortName: "AP Seminar" },
  { id: "ap-research", name: "AP Research", group: "AP — Capstone", shortName: "AP Research" },
];

export const SUBJECT_GROUPS = Array.from(new Set(SUBJECTS.map((s) => s.group)));

export function getSubjectById(id: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id);
}

export function isRestrictedSubject(id: string | null | undefined): boolean {
  if (!id) return false;
  return getSubjectById(id)?.restricted === true;
}
