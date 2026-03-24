/** Parsed job history entry from the sheet JSON column. */
export type JobEntry = {
  companyName?: string;
  duration?: string;
  title?: string;
};

/**
 * Normalized contractor row for the roster UI.
 * Optional fields reserved for a future resume upload + skill extraction pipeline.
 */
export type Talent = {
  id: string;
  name: string;
  email: string;
  linkedInRaw: string;
  linkedInHref: string;
  skillsetRaw: string;
  skillTags: string[];
  blueprintArchitect: string;
  desiredSalaryRaw: string;
  salaryNumeric: number | null;
  seniority: string;
  currentEmployer: string;
  city: string;
  country: string;
  currentRole: string;
  referredBy: string;
  whoInterviewed: string;
  interviewStep: string;
  comments: string;
  comments2: string;
  jobHistory: JobEntry[];
  /** Future: object storage key after upload. */
  resumeFileId?: string;
  /** Future: skills inferred from resume text / LLM. */
  parsedSkills?: string[];
  /** Future: ISO timestamp of last parse. */
  lastParsedAt?: string;
};

export type SortKey =
  | "name-asc"
  | "salary-asc"
  | "salary-desc"
  | "seniority"
  | "interview-step"
  | "city-asc";
