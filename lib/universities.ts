export interface University {
  id: string;
  name: string;
  group: string;
  acceptanceRate: string;
  tier: "ultra-selective" | "highly-selective" | "selective";
  isCustom?: boolean;
}

export const UNIVERSITIES: University[] = [
  // Ivy League
  { id: "harvard", name: "Harvard University", group: "Ivy League", acceptanceRate: "~3%", tier: "ultra-selective" },
  { id: "yale", name: "Yale University", group: "Ivy League", acceptanceRate: "~4%", tier: "ultra-selective" },
  { id: "princeton", name: "Princeton University", group: "Ivy League", acceptanceRate: "~4%", tier: "ultra-selective" },
  { id: "columbia", name: "Columbia University", group: "Ivy League", acceptanceRate: "~4%", tier: "ultra-selective" },
  { id: "penn", name: "University of Pennsylvania", group: "Ivy League", acceptanceRate: "~5%", tier: "ultra-selective" },
  { id: "brown", name: "Brown University", group: "Ivy League", acceptanceRate: "~5%", tier: "ultra-selective" },
  { id: "dartmouth", name: "Dartmouth College", group: "Ivy League", acceptanceRate: "~6%", tier: "ultra-selective" },
  { id: "cornell", name: "Cornell University", group: "Ivy League", acceptanceRate: "~8%", tier: "highly-selective" },

  // Elite Tech / Science
  { id: "mit", name: "Massachusetts Institute of Technology", group: "Elite Tech", acceptanceRate: "~4%", tier: "ultra-selective" },
  { id: "caltech", name: "California Institute of Technology", group: "Elite Tech", acceptanceRate: "~3%", tier: "ultra-selective" },
  { id: "cmu", name: "Carnegie Mellon University", group: "Elite Tech", acceptanceRate: "~11%", tier: "highly-selective" },
  { id: "georgia-tech", name: "Georgia Institute of Technology", group: "Elite Tech", acceptanceRate: "~16%", tier: "highly-selective" },

  // Other Top Private
  { id: "stanford", name: "Stanford University", group: "Top Private", acceptanceRate: "~4%", tier: "ultra-selective" },
  { id: "uchicago", name: "University of Chicago", group: "Top Private", acceptanceRate: "~5%", tier: "ultra-selective" },
  { id: "duke", name: "Duke University", group: "Top Private", acceptanceRate: "~6%", tier: "ultra-selective" },
  { id: "northwestern", name: "Northwestern University", group: "Top Private", acceptanceRate: "~7%", tier: "highly-selective" },
  { id: "jhu", name: "Johns Hopkins University", group: "Top Private", acceptanceRate: "~7%", tier: "highly-selective" },
  { id: "vanderbilt", name: "Vanderbilt University", group: "Top Private", acceptanceRate: "~7%", tier: "highly-selective" },
  { id: "rice", name: "Rice University", group: "Top Private", acceptanceRate: "~9%", tier: "highly-selective" },
  { id: "notre-dame", name: "University of Notre Dame", group: "Top Private", acceptanceRate: "~13%", tier: "highly-selective" },
  { id: "usc", name: "University of Southern California", group: "Top Private", acceptanceRate: "~10%", tier: "highly-selective" },
  { id: "nyu", name: "New York University", group: "Top Private", acceptanceRate: "~8%", tier: "highly-selective" },
  { id: "wustl", name: "Washington University in St. Louis", group: "Top Private", acceptanceRate: "~12%", tier: "highly-selective" },
  { id: "emory", name: "Emory University", group: "Top Private", acceptanceRate: "~11%", tier: "highly-selective" },
  { id: "tufts", name: "Tufts University", group: "Top Private", acceptanceRate: "~9%", tier: "highly-selective" },

  // Top Public Flagships
  { id: "uc-berkeley", name: "UC Berkeley", group: "Top Public", acceptanceRate: "~11%", tier: "highly-selective" },
  { id: "ucla", name: "UCLA", group: "Top Public", acceptanceRate: "~9%", tier: "highly-selective" },
  { id: "umich", name: "University of Michigan", group: "Top Public", acceptanceRate: "~18%", tier: "highly-selective" },
  { id: "uva", name: "University of Virginia", group: "Top Public", acceptanceRate: "~16%", tier: "highly-selective" },
  { id: "unc", name: "UNC Chapel Hill", group: "Top Public", acceptanceRate: "~17%", tier: "highly-selective" },
  { id: "uiuc", name: "University of Illinois Urbana-Champaign", group: "Top Public", acceptanceRate: "~44%", tier: "selective" },
  { id: "ut-austin", name: "University of Texas at Austin", group: "Top Public", acceptanceRate: "~29%", tier: "selective" },
  { id: "uw", name: "University of Washington", group: "Top Public", acceptanceRate: "~45%", tier: "selective" },
  { id: "ucsd", name: "UC San Diego", group: "Top Public", acceptanceRate: "~24%", tier: "selective" },
  { id: "uw-madison", name: "University of Wisconsin–Madison", group: "Top Public", acceptanceRate: "~43%", tier: "selective" },
  { id: "gatech-public", name: "Georgia Tech (In-State)", group: "Top Public", acceptanceRate: "~32%", tier: "selective" },

  // Liberal Arts Colleges
  { id: "williams", name: "Williams College", group: "Liberal Arts", acceptanceRate: "~8%", tier: "ultra-selective" },
  { id: "amherst", name: "Amherst College", group: "Liberal Arts", acceptanceRate: "~7%", tier: "ultra-selective" },
  { id: "swarthmore", name: "Swarthmore College", group: "Liberal Arts", acceptanceRate: "~7%", tier: "ultra-selective" },
  { id: "pomona", name: "Pomona College", group: "Liberal Arts", acceptanceRate: "~6%", tier: "ultra-selective" },
  { id: "wellesley", name: "Wellesley College", group: "Liberal Arts", acceptanceRate: "~13%", tier: "highly-selective" },
  { id: "claremont-mckenna", name: "Claremont McKenna College", group: "Liberal Arts", acceptanceRate: "~9%", tier: "highly-selective" },
];

export const UNIVERSITY_GROUPS = Array.from(new Set(UNIVERSITIES.map((u) => u.group)));

export function getUniversityById(id: string): University | undefined {
  return UNIVERSITIES.find((u) => u.id === id);
}

export function createCustomUniversity(name: string, acceptanceRate?: string): University {
  const trimmedName = name.trim();
  const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return {
    id: `custom-${slug || Date.now()}`,
    name: trimmedName,
    group: "My Schools",
    acceptanceRate: acceptanceRate?.trim() || "Not listed",
    tier: "selective",
    isCustom: true,
  };
}
