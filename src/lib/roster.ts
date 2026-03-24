import Papa from "papaparse";

import { ROSTER_COLUMNS as C } from "@/lib/rosterColumns";
import type { JobEntry, Talent } from "@/types/talent";

function cell(row: Record<string, string>, key: string): string {
  const v = row[key];
  return v == null ? "" : String(v).trim();
}

export function parseSkillTags(raw: string): string[] {
  if (!raw) return [];
  const parts = raw.split(/[,;/]/).map((s) => s.trim()).filter(Boolean);
  return [...new Set(parts)];
}

export function parseSalaryNumeric(raw: string): number | null {
  const t = raw.replace(/[$,\s]/g, "");
  if (!t) return null;
  const n = Number.parseFloat(t);
  return Number.isFinite(n) ? n : null;
}

export function normalizeLinkedInHref(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

export function parseJobHistoryJson(raw: string): JobEntry[] {
  const s = raw.trim();
  if (!s || s === "[]") return [];
  try {
    const data = JSON.parse(s) as unknown;
    if (!Array.isArray(data)) return [];
    return data.map((item) => {
      if (!item || typeof item !== "object") return {};
      const o = item as Record<string, unknown>;
      return {
        companyName:
          typeof o.companyName === "string" ? o.companyName : undefined,
        duration: typeof o.duration === "string" ? o.duration : undefined,
        title: typeof o.title === "string" ? o.title : undefined,
      };
    });
  } catch {
    return [];
  }
}

function talentId(name: string, email: string, index: number): string {
  const base = `${name}|${email}`.toLowerCase();
  return `${index}-${base.slice(0, 80)}`;
}

export function rowToTalent(
  row: Record<string, string>,
  index: number,
): Talent {
  const name = cell(row, C.name);
  const email = cell(row, C.email);
  const linkedInRaw = cell(row, C.linkedIn);
  const skillsetRaw = cell(row, C.skillsets);

  return {
    id: talentId(name, email, index),
    name,
    email,
    linkedInRaw,
    linkedInHref: normalizeLinkedInHref(linkedInRaw),
    skillsetRaw,
    skillTags: parseSkillTags(skillsetRaw),
    blueprintArchitect: cell(row, C.blueprintArchitect),
    desiredSalaryRaw: cell(row, C.desiredSalary),
    salaryNumeric: parseSalaryNumeric(cell(row, C.desiredSalary)),
    seniority: cell(row, C.seniority),
    currentEmployer: cell(row, C.currentEmployer),
    city: cell(row, C.city),
    country: cell(row, C.location),
    currentRole: cell(row, C.currentRole),
    referredBy: cell(row, C.referredBy),
    whoInterviewed: cell(row, C.whoInterviewed),
    interviewStep: cell(row, C.interviewStep),
    comments: cell(row, C.comments),
    comments2: cell(row, C.comments2),
    jobHistory: parseJobHistoryJson(cell(row, C.jobHistoryJson)),
  };
}

export async function loadRosterFromUrl(url: string): Promise<Talent[]> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load roster (${res.status})`);
  }
  const text = await res.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (parsed.errors.length) {
    const fatal = parsed.errors.find((e) => e.type === "Quotes");
    if (fatal) {
      throw new Error(fatal.message);
    }
  }

  const rows = parsed.data.filter((r) => {
    const n = cell(r, C.name);
    return n.length > 0;
  });

  return rows.map((r, i) => rowToTalent(r, i));
}

export const INTERVIEW_STEP_ORDER: string[] = [
  "Client Ready",
  "Awaiting ICA Signature",
  "Backlog",
  "TBD",
  "Reject",
  "Unavailable",
  "Nothing",
];

export function interviewStepRank(step: string): number {
  const s = step.trim();
  const i = INTERVIEW_STEP_ORDER.indexOf(s);
  if (i !== -1) return i;
  return 100;
}

const SENIORITY_ORDER = ["High", "Mid", "Low"];

export function seniorityRank(s: string): number {
  const t = s.trim();
  if (!t) return 999;
  const i = SENIORITY_ORDER.indexOf(t);
  if (i !== -1) return i;
  const n = Number.parseFloat(t.replace(/\+/g, ""));
  if (Number.isFinite(n)) return 50 + n;
  return 400;
}
