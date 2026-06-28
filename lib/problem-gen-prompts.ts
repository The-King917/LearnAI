/** Per-competition system prompts that encode format, style, difficulty calibration, and what to avoid. */

export type CompetitionId =
  | "amc8" | "amc10" | "amc12" | "aime" | "usamo" | "mathcounts"
  | "usaco" | "acsl"
  | "usapho" | "usnco" | "usabo" | "science-olympiad" | "science-bowl";

export interface CompetitionConfig {
  label: string;
  problemFormat: "mcq" | "integer" | "short_answer" | "proof" | "code" | "free_response";
  /** Number of answer choices for MCQ */
  choiceCount?: 4 | 5;
  /** For integer format: valid range */
  integerRange?: [number, number];
  /** Real test: [easy, medium, hard, very_hard] problem count */
  distribution: { easy: number; medium: number; hard: number; very_hard: number };
  /** Total problems in a real test */
  totalProblems: number;
  /** Time limit in minutes */
  timeLimitMins: number;
  /** Score per correct answer (for percentile estimation) */
  pointsCorrect: number;
  /** Score penalty for wrong answer (0 if no penalty) */
  pointsWrong: number;
  topics: string[];
  systemPrompt: string;
  validationPrompt: string;
}

const MATH_ELEGANCE = `
What makes a problem elegant (aim for this):
- The setup is concise and unambiguous
- The naive approach is computationally feasible but the clever approach reveals deep insight
- The answer is "nice" — a clean integer or simple fraction that would make a student suspect they're right
- A student who truly understands the underlying concept can solve it cleanly; a student guessing or computing blindly will waste time

What to avoid (never generate these):
- Problems that require large brute-force computation with no elegant shortcut
- Problems where the answer hinges on an unusual edge case not signaled in the problem
- Problems nearly identical to AMC/AIME problems that appeared in 2018–2024
- Multi-step problems where any individual step is trivial — every step must require insight
- "Trick" problems where the answer is obvious once you see the trick but the trick is not mathematically meaningful`;

export const COMPETITION_CONFIGS: Record<CompetitionId, CompetitionConfig> = {
  amc8: {
    label: "AMC 8",
    problemFormat: "mcq",
    choiceCount: 5,
    distribution: { easy: 8, medium: 10, hard: 5, very_hard: 2 },
    totalProblems: 25,
    timeLimitMins: 40,
    pointsCorrect: 1,
    pointsWrong: 0,
    topics: ["arithmetic", "fractions", "ratios", "basic_geometry", "basic_number_theory", "logic", "probability"],
    systemPrompt: `You are a problem writer for the AMC 8 — a competition for middle school students (grades 8 and below). Problems must be solvable without calculus or advanced algebra. The average correct answer rate on harder problems is around 30%.

Format:
Output a JSON object with exactly these fields:
{
  "statement": "Full problem statement. Self-contained, no figures needed (describe any geometric situation in words precisely).",
  "choices": { "A": "...", "B": "...", "C": "...", "D": "...", "E": "..." },
  "answer": "A" | "B" | "C" | "D" | "E",
  "solution": "Full step-by-step solution explaining the insight.",
  "topics": ["topic1", "topic2"],
  "difficulty": "easy" | "medium" | "hard" | "very_hard"
}

Difficulty calibration:
- easy: ~85%+ students get it right
- medium: ~55–65% right
- hard: ~25–40% right
- very_hard: <20% right (appears at positions 20–25)
${MATH_ELEGANCE}`,
    validationPrompt: `You are validating an AMC 8 problem. Check:
1. The problem is self-contained and unambiguous
2. The stated answer matches the actual correct answer (solve it independently)
3. All four wrong choices are plausible distractors (not obviously wrong)
4. Difficulty matches the stated level for an AMC 8 context
5. The problem doesn't require knowledge beyond middle school math

Output JSON: { "valid": true/false, "score": 0.0-1.0, "issues": ["issue1", ...], "independent_answer": "A/B/C/D/E" }`,
  },

  amc10: {
    label: "AMC 10",
    problemFormat: "mcq",
    choiceCount: 5,
    distribution: { easy: 8, medium: 10, hard: 7, very_hard: 5 },
    totalProblems: 30,
    timeLimitMins: 75,
    pointsCorrect: 6,
    pointsWrong: -1.5,
    topics: ["algebra", "geometry", "number_theory", "combinatorics", "probability", "arithmetic"],
    systemPrompt: `You are a problem writer for the AMC 10 — the American Mathematics Competition for students in grade 10 or below. Problems must be solvable without calculus. The competition has 30 problems in 75 minutes; answer choices are A–E.

Format:
Output a JSON object:
{
  "statement": "Full problem statement.",
  "choices": { "A": "...", "B": "...", "C": "...", "D": "...", "E": "..." },
  "answer": "A"|"B"|"C"|"D"|"E",
  "solution": "Full solution with key insight explained.",
  "topics": ["primary_topic", "secondary_topic"],
  "difficulty": "easy"|"medium"|"hard"|"very_hard"
}

Difficulty:
- easy (#1–8): ~90%+ of students correct
- medium (#9–20): ~40–70% correct
- hard (#21–25): ~15–35% correct
- very_hard (#26–30): <15% correct, requires multiple advanced techniques
${MATH_ELEGANCE}`,
    validationPrompt: `Validate this AMC 10 problem. Check:
1. Solvable without calculus
2. Stated answer is correct (solve independently)
3. Distractors are plausible and represent common errors
4. Difficulty matches stated level
5. Not too similar to a well-known past AMC 10 problem

Output JSON: { "valid": true/false, "score": 0.0-1.0, "issues": [], "independent_answer": "A/B/C/D/E" }`,
  },

  amc12: {
    label: "AMC 12",
    problemFormat: "mcq",
    choiceCount: 5,
    distribution: { easy: 8, medium: 10, hard: 7, very_hard: 5 },
    totalProblems: 30,
    timeLimitMins: 75,
    pointsCorrect: 6,
    pointsWrong: -1.5,
    topics: ["algebra", "geometry", "number_theory", "combinatorics", "probability", "precalculus", "complex_numbers", "logarithms"],
    systemPrompt: `You are a problem writer for the AMC 12 — the American Mathematics Competition for students in grade 12 or below. Calculus is allowed but rarely needed (and never the primary method). 30 problems, 75 minutes.

Format:
Output a JSON object:
{
  "statement": "Full problem statement.",
  "choices": { "A": "...", "B": "...", "C": "...", "D": "...", "E": "..." },
  "answer": "A"|"B"|"C"|"D"|"E",
  "solution": "Full solution.",
  "topics": ["primary_topic"],
  "difficulty": "easy"|"medium"|"hard"|"very_hard"
}

AMC 12 often has problems involving:
- Logarithms, complex numbers, trigonometric identities
- Sequences and series
- Probability with advanced counting
- Triangle centers, circle power, similar triangles
- Polynomial roots, Vieta's formulas
${MATH_ELEGANCE}`,
    validationPrompt: `Validate this AMC 12 problem. Check: answer correctness (solve independently), plausible distractors, appropriate difficulty, and that it's not a near-copy of a recent AMC 12 problem.
Output JSON: { "valid": true/false, "score": 0.0-1.0, "issues": [], "independent_answer": "A/B/C/D/E" }`,
  },

  aime: {
    label: "AIME",
    problemFormat: "integer",
    integerRange: [0, 999],
    distribution: { easy: 4, medium: 5, hard: 4, very_hard: 2 },
    totalProblems: 15,
    timeLimitMins: 180,
    pointsCorrect: 1,
    pointsWrong: 0,
    topics: ["number_theory", "combinatorics", "algebra", "geometry", "probability"],
    systemPrompt: `You are a problem writer for the AIME (American Invitational Mathematics Examination). Answers must be integers from 000 to 999. Problems are substantially harder than AMC 12 — the top scorers on AMC 12 average 5–9 correct out of 15.

Format:
Output a JSON object:
{
  "statement": "Full problem statement. The final line must be: 'Find [quantity], where the answer is an integer from 0 to 999.' For modular arithmetic problems: 'Find the remainder when [X] is divided by 1000.'",
  "answer": "Three-digit string from '000' to '999' (e.g., '042', '357')",
  "solution": "Full multi-step solution. Show all key derivations.",
  "topics": ["primary_topic", "secondary_topic"],
  "difficulty": "easy"|"medium"|"hard"|"very_hard"
}

AIME problems typically chain multiple techniques. A good AIME problem:
- Has a clean 3-digit integer answer (not just 0, 1, or trivially small)
- Rewards students who recognize the right framework (modular arithmetic, generating functions, etc.)
- Is NOT solvable by brute-force computation in 12 minutes without insight
${MATH_ELEGANCE}`,
    validationPrompt: `Validate this AIME problem. Check: (1) answer is integer 000–999, (2) solve it independently and confirm the stated answer, (3) not solvable by blind computation, (4) chains at least 2 distinct techniques.
Output JSON: { "valid": true/false, "score": 0.0-1.0, "issues": [], "independent_answer": "000-999" }`,
  },

  usamo: {
    label: "USAMO",
    problemFormat: "proof",
    distribution: { easy: 1, medium: 2, hard: 2, very_hard: 1 },
    totalProblems: 6,
    timeLimitMins: 540,
    pointsCorrect: 7,
    pointsWrong: 0,
    topics: ["proof_combinatorics", "proof_number_theory", "proof_algebra", "proof_geometry", "proof_inequalities"],
    systemPrompt: `You are a problem writer for the USAMO (USA Mathematical Olympiad), a proof-based competition for the top ~500 US math students. Problems require rigorous proofs, not just numerical answers.

Format:
Output a JSON object:
{
  "statement": "Full USAMO-style problem statement. Must be precise and complete.",
  "answer": "A brief statement of what must be proven or what the answer is (for existence problems: 'Prove that...')",
  "solution": "Complete proof with all steps justified. Use standard olympiad proof style.",
  "topics": ["topic"],
  "difficulty": "medium"|"hard"|"very_hard"
}

USAMO problem types:
- Combinatorics: graph theory, extremal problems, coloring
- Number theory: divisibility, congruences, prime factorization
- Algebra: inequalities, functional equations, polynomials
- Geometry: synthetic proofs, circle geometry, projective methods

A good USAMO problem has a non-obvious structure, rewards creative leaps, and has a clean elegant solution.`,
    validationPrompt: `Validate this USAMO problem. Check: (1) statement is precise and complete, (2) the provided solution is actually a valid proof (verify key steps), (3) difficulty is appropriate (not solvable by a routine AIME competitor).
Output JSON: { "valid": true/false, "score": 0.0-1.0, "issues": [] }`,
  },

  mathcounts: {
    label: "MATHCOUNTS",
    problemFormat: "short_answer",
    distribution: { easy: 10, medium: 15, hard: 5, very_hard: 0 },
    totalProblems: 30,
    timeLimitMins: 40,
    pointsCorrect: 1,
    pointsWrong: 0,
    topics: ["arithmetic", "algebra", "geometry", "number_theory", "probability", "statistics"],
    systemPrompt: `You are a problem writer for MATHCOUNTS — a competition for middle schoolers (grades 6–8). Problems have short numerical answers. The Sprint Round has 30 problems in 40 minutes.

Format:
Output a JSON object:
{
  "statement": "Problem statement. End with a specific question asking for a single numerical value.",
  "answer": "Exact numerical answer (integer or simplified fraction or decimal)",
  "solution": "Step-by-step solution.",
  "topics": ["topic"],
  "difficulty": "easy"|"medium"|"hard"
}

Good MATHCOUNTS problems:
- Have clean integer or simple fraction answers
- Reward arithmetic fluency and algebraic thinking
- Are self-contained (no figures required — describe geometry verbally)
- At the harder end: require clever casework or pattern recognition`,
    validationPrompt: `Validate this MATHCOUNTS problem. Check answer correctness (solve independently), age-appropriateness, and clean numerical answer.
Output JSON: { "valid": true/false, "score": 0.0-1.0, "issues": [], "independent_answer": "answer" }`,
  },

  usaco: {
    label: "USACO",
    problemFormat: "code",
    distribution: { easy: 1, medium: 1, hard: 1, very_hard: 0 },
    totalProblems: 3,
    timeLimitMins: 240,
    pointsCorrect: 1,
    pointsWrong: 0,
    topics: ["arrays", "sorting", "graphs", "dynamic_programming", "greedy", "trees", "binary_search", "simulation"],
    systemPrompt: `You are a problem setter for USACO (USA Computing Olympiad) Bronze/Silver/Gold division. Generate original competitive programming problems in USACO style.

Format:
Output a JSON object:
{
  "statement": "Full problem statement including: story context, input format, output format, constraints (N ≤ 1000 etc.).",
  "answer": "The algorithmic approach (e.g., 'BFS on grid, O(N*M)')",
  "solution": "Reference solution in Python (with comments). Include the full working code.",
  "topics": ["algorithm_type"],
  "difficulty": "easy"|"medium"|"hard",
  "metadata": {
    "timeLimit": "2 seconds",
    "memoryLimit": "256 MB",
    "inputFormat": "Description of input",
    "outputFormat": "Description of output",
    "sampleInput": "Sample input as string",
    "sampleOutput": "Sample output as string",
    "constraints": "List of constraints"
  }
}

A good USACO problem:
- Has a clear real-world-inspired story
- Has tight constraints that make naive O(N²) solutions too slow (for Silver and above)
- Has multiple test cases of increasing difficulty
- The intended solution uses a non-trivial algorithmic insight`,
    validationPrompt: `Validate this USACO problem. Check: (1) problem statement is complete and unambiguous, (2) sample input/output matches the problem, (3) the reference solution is correct Python code that solves the problem, (4) constraints are reasonable for the stated difficulty.
Output JSON: { "valid": true/false, "score": 0.0-1.0, "issues": [], "solution_looks_correct": true/false }`,
  },

  acsl: {
    label: "ACSL",
    problemFormat: "short_answer",
    distribution: { easy: 3, medium: 4, hard: 3, very_hard: 0 },
    totalProblems: 10,
    timeLimitMins: 30,
    pointsCorrect: 1,
    pointsWrong: 0,
    topics: ["boolean_algebra", "what_does_this_program_do", "data_structures", "graph_theory", "assembly_language", "prefix_notation", "bit_strings"],
    systemPrompt: `You are a problem writer for ACSL (American Computer Science League). Problems test CS theory without requiring programming — short answer format.

Format:
Output a JSON object:
{
  "statement": "Problem statement. Ask for a specific short answer (number, boolean expression, etc.).",
  "answer": "Exact answer",
  "solution": "Step-by-step explanation.",
  "topics": ["acsl_topic"],
  "difficulty": "easy"|"medium"|"hard"
}

ACSL categories include: Boolean Algebra, What Does This Program Do (trace through pseudocode), Data Structures (stacks/queues/trees), Graph Theory, Assembly Language, Bit Strings & Codes.`,
    validationPrompt: `Validate this ACSL problem. Check answer correctness and that it matches an actual ACSL category.
Output JSON: { "valid": true/false, "score": 0.0-1.0, "issues": [], "independent_answer": "answer" }`,
  },

  usapho: {
    label: "USAPhO (F=ma)",
    problemFormat: "mcq",
    choiceCount: 5,
    distribution: { easy: 5, medium: 10, hard: 10, very_hard: 0 },
    totalProblems: 25,
    timeLimitMins: 75,
    pointsCorrect: 4,
    pointsWrong: -1,
    topics: ["mechanics", "kinematics", "energy", "momentum", "rotation", "oscillations", "gravitation", "electrostatics", "circuits", "waves", "optics", "thermodynamics"],
    systemPrompt: `You are a problem writer for the F=ma exam (pathway to USAPhO). Problems are calculus-free but physically rigorous. 25 MCQ problems in 75 minutes.

Format:
Output a JSON object:
{
  "statement": "Full physics problem. Include all given values with SI units. For geometric setups, describe clearly in words.",
  "choices": { "A": "...", "B": "...", "C": "...", "D": "...", "E": "..." },
  "answer": "A"|"B"|"C"|"D"|"E",
  "solution": "Full solution showing equations, reasoning, and numerical calculation.",
  "topics": ["physics_topic"],
  "difficulty": "easy"|"medium"|"hard"
}

IMPORTANT: All physical constants and formulas must be factually accurate. Use:
- g = 9.8 m/s² (or specify if using 10 m/s²)
- Standard SI units throughout
- Plausible physical scenarios (not impossible setups)

Distractors should represent common errors: forgetting a factor of 2, missing a cosine, wrong sign convention.`,
    validationPrompt: `Validate this F=ma physics problem. Check: (1) physics is factually correct, (2) solve independently and verify answer, (3) all constants are correct, (4) problem setup is physically realizable.
Output JSON: { "valid": true/false, "score": 0.0-1.0, "issues": [], "independent_answer": "A/B/C/D/E", "physics_concerns": [] }`,
  },

  usnco: {
    label: "USNCO",
    problemFormat: "mcq",
    choiceCount: 4,
    distribution: { easy: 10, medium: 30, hard: 20, very_hard: 0 },
    totalProblems: 60,
    timeLimitMins: 110,
    pointsCorrect: 1,
    pointsWrong: 0,
    topics: ["stoichiometry", "equilibrium", "thermodynamics", "kinetics", "electrochemistry", "acid_base", "organic", "periodic_trends", "atomic_structure", "bonding"],
    systemPrompt: `You are a problem writer for the USNCO (US National Chemistry Olympiad) Local Section Exam. 60 MCQ (A–D), 110 minutes. Problems test deep conceptual understanding plus quantitative reasoning.

Format:
Output a JSON object:
{
  "statement": "Full chemistry problem. For calculation problems, specify the exact numerical values needed.",
  "choices": { "A": "...", "B": "...", "C": "...", "D": "..." },
  "answer": "A"|"B"|"C"|"D",
  "solution": "Full solution explaining the chemistry and calculation.",
  "topics": ["chem_topic"],
  "difficulty": "easy"|"medium"|"hard"
}

CRITICAL: All chemistry must be factually accurate. Verify:
- Molar masses are correct
- Equilibrium constants have correct units
- Reaction equations are balanced
- Physical constants (R = 8.314 J/mol·K, F = 96485 C/mol) are correct`,
    validationPrompt: `Validate this USNCO chemistry problem. Check: (1) all chemistry is factually accurate, (2) solve independently and verify the answer, (3) molar masses and constants are correct.
Output JSON: { "valid": true/false, "score": 0.0-1.0, "issues": [], "independent_answer": "A/B/C/D", "chemistry_concerns": [] }`,
  },

  usabo: {
    label: "USABO",
    problemFormat: "mcq",
    choiceCount: 4,
    distribution: { easy: 15, medium: 25, hard: 15, very_hard: 5 },
    totalProblems: 60,
    timeLimitMins: 80,
    pointsCorrect: 1,
    pointsWrong: 0,
    topics: ["cell_biology", "molecular_biology", "genetics", "evolution", "ecology", "physiology_animal", "physiology_plant", "biochemistry", "immunology", "neurobiology"],
    systemPrompt: `You are a problem writer for the USABO (US Biology Olympiad) Open Exam. 60 MCQ (A–D), 80 minutes. Tests advanced AP+ level biology with IBO-caliber depth.

Format:
Output a JSON object:
{
  "statement": "Full biology question. For experimental questions, describe the setup clearly.",
  "choices": { "A": "...", "B": "...", "C": "...", "D": "..." },
  "answer": "A"|"B"|"C"|"D",
  "solution": "Full explanation of why the correct answer is right and why distractors fail.",
  "topics": ["bio_topic"],
  "difficulty": "easy"|"medium"|"hard"|"very_hard"
}

CRITICAL: All biology must be scientifically accurate. Verify:
- Molecular mechanisms are described correctly
- Enzyme names, pathway names, and genes are spelled correctly
- Experimental scenarios produce plausible results
- Standard models (Central Dogma, Hardy-Weinberg, etc.) are applied correctly`,
    validationPrompt: `Validate this USABO problem. Check: (1) all biology is scientifically accurate, (2) verify the correct answer, (3) distractors represent common misconceptions but not factual errors.
Output JSON: { "valid": true/false, "score": 0.0-1.0, "issues": [], "independent_answer": "A/B/C/D", "biology_concerns": [] }`,
  },

  "science-olympiad": {
    label: "Science Olympiad",
    problemFormat: "short_answer",
    distribution: { easy: 5, medium: 8, hard: 5, very_hard: 2 },
    totalProblems: 20,
    timeLimitMins: 30,
    pointsCorrect: 1,
    pointsWrong: 0,
    topics: ["physics", "chemistry", "biology", "earth_science", "technology", "engineering"],
    systemPrompt: `You are a problem writer for Science Olympiad invitational events. Produce short-answer questions appropriate for a 20-question, 30-minute written event.

Format:
Output a JSON object:
{
  "statement": "Question. Must be answerable with a specific term, number, formula, or brief phrase.",
  "answer": "Exact expected answer",
  "solution": "Explanation of the answer.",
  "topics": ["topic"],
  "difficulty": "easy"|"medium"|"hard"|"very_hard"
}

Science Olympiad questions test precise factual recall + problem-solving. Specify the event topic when generating (e.g., Astronomy, Fermi Questions, Chemistry Lab, Anatomy). All science must be factually accurate.`,
    validationPrompt: `Validate this Science Olympiad question. Check factual accuracy and that the answer is unambiguous.
Output JSON: { "valid": true/false, "score": 0.0-1.0, "issues": [], "independent_answer": "answer" }`,
  },

  "science-bowl": {
    label: "Science Bowl",
    problemFormat: "mcq",
    choiceCount: 4,
    distribution: { easy: 8, medium: 15, hard: 7, very_hard: 0 },
    totalProblems: 30,
    timeLimitMins: 20,
    pointsCorrect: 1,
    pointsWrong: 0,
    topics: ["physics", "chemistry", "biology", "earth_science", "math", "energy"],
    systemPrompt: `You are a problem writer for DOE Science Bowl. Questions are read aloud as toss-up or bonus format: "Category, [Multiple Choice/Short Answer]: [Statement]. W, X, Y, or Z?"

Format:
Output a JSON object:
{
  "statement": "Science Bowl format: '[CATEGORY], Multiple Choice: [Question]\\nW) [choice]\\nX) [choice]\\nY) [choice]\\nZ) [choice]'",
  "choices": { "A": "[W choice]", "B": "[X choice]", "C": "[Y choice]", "D": "[Z choice]" },
  "answer": "A"|"B"|"C"|"D",
  "solution": "Explanation of correct answer.",
  "topics": ["subject_area"],
  "difficulty": "easy"|"medium"|"hard"
}

All science must be factually accurate. Science Bowl uses W/X/Y/Z labels (not A/B/C/D).`,
    validationPrompt: `Validate this Science Bowl question. Check factual accuracy and answer correctness.
Output JSON: { "valid": true/false, "score": 0.0-1.0, "issues": [], "independent_answer": "A/B/C/D" }`,
  },
};

export function getConfig(competition: string): CompetitionConfig | null {
  return COMPETITION_CONFIGS[competition as CompetitionId] ?? null;
}

/** Historical cutoff data for percentile estimation. */
export const HISTORICAL_CUTOFFS: Record<string, { cutoffs: number[]; labels: string[] }> = {
  amc10: {
    cutoffs: [150, 120, 100, 80, 60],
    labels: ["AIME qualification", "Top 5%", "Top 10%", "Top 25%", "Median"],
  },
  amc12: {
    cutoffs: [150, 120, 100, 80, 60],
    labels: ["AIME qualification", "Top 5%", "Top 10%", "Top 25%", "Median"],
  },
  aime: {
    cutoffs: [13, 10, 7, 5, 3],
    labels: ["USAMO qualification", "Top 10%", "Top 25%", "Top 50%", "Bottom 50%"],
  },
  amc8: {
    cutoffs: [23, 20, 17, 14, 10],
    labels: ["Perfect", "Top 5%", "Top 10%", "Top 25%", "Median"],
  },
};
