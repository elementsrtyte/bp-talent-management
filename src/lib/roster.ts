import { formatSkillTag } from "@/lib/skillFormatting";
import { ROSTER_COLUMNS as C } from "@/lib/rosterColumns";
import type { JobEntry, Talent } from "@/types/talent";

/** Read a cell from a roster row (JSON may use numbers, booleans, or strings). */
export function cell(row: Record<string, unknown>, key: string): string {
  const v = row[key];
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "";
}

export function parseSkillTags(raw: string): string[] {
  if (!raw) return [];
  const parts = raw.split(/[,;/]/).map((s) => s.trim()).filter(Boolean);
  const byLower = new Map<string, string>();
  for (const p of parts) {
    const formatted = formatSkillTag(p);
    if (!formatted) continue;
    const key = formatted.toLowerCase();
    if (!byLower.has(key)) byLower.set(key, formatted);
  }
  return [...byLower.values()];
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

function mapJobHistoryArray(data: unknown[]): JobEntry[] {
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
}

/** Accepts a JSON string, a pre-parsed array, or empty values. */
export function parseJobHistoryJson(raw: unknown): JobEntry[] {
  if (raw == null || raw === "") return [];
  if (Array.isArray(raw)) {
    return mapJobHistoryArray(raw);
  }
  if (typeof raw !== "string") return [];
  const s = raw.trim();
  if (!s || s === "[]") return [];
  try {
    const data = JSON.parse(s) as unknown;
    if (!Array.isArray(data)) return [];
    return mapJobHistoryArray(data);
  } catch {
    return [];
  }
}

function talentId(name: string, email: string, index: number): string {
  const base = `${name}|${email}`.toLowerCase();
  return `${index}-${base.slice(0, 80)}`;
}

/**
 * Normalize webhook / file JSON into row objects (array, wrapped array, or single row).
 * n8n may return one object or an array; some APIs use `{ data: [...] }`.
 */
export function normalizeRosterPayload(data: unknown): Record<string, unknown>[] {
  if (data == null) return [];
  if (Array.isArray(data)) {
    return data.filter(
      (item): item is Record<string, unknown> =>
        item != null && typeof item === "object" && !Array.isArray(item),
    );
  }
  if (typeof data === "object") {
    const o = data as Record<string, unknown>;
    for (const key of [
      "data",
      "rows",
      "roster",
      "talent",
      "items",
      "results",
    ]) {
      const inner = o[key];
      if (Array.isArray(inner)) {
        return normalizeRosterPayload(inner);
      }
    }
    if (cell(o, C.name).length > 0) {
      return [o];
    }
  }
  return [];
}

export function talentsFromPayload(data: unknown): Talent[] {
  const rows = normalizeRosterPayload(data);
  const withNames = rows.filter((r) => cell(r, C.name).length > 0);
  return withNames.map((r, i) => rowToTalent(r, i));
}

export function rowToTalent(
  row: Record<string, unknown>,
  index: number,
): Talent {
  const name = cell(row, C.name);
  const email = cell(row, C.email);
  const linkedInRaw = cell(row, C.linkedIn);
  const augmentedRaw = cell(row, C.augmentedSkillsets);
  const skillTags = parseSkillTags(augmentedRaw);
  const skillsetRaw = skillTags.join(", ");
  const marqueeCompanies = cell(row, C.marqueeCompanies);
  const desiredSalaryRaw = cell(row, C.desiredSalary);

  return {
    id: talentId(name, email, index),
    name,
    email,
    linkedInRaw,
    linkedInHref: normalizeLinkedInHref(linkedInRaw),
    skillsetRaw,
    skillTags,
    marqueeCompanies,
    blueprintArchitect: cell(row, C.blueprintArchitect),
    desiredSalaryRaw,
    salaryNumeric: parseSalaryNumeric(desiredSalaryRaw),
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
    jobHistory: parseJobHistoryJson(row[C.jobHistoryJson]),
  };
}

export async function loadRosterFromUrl(url: string): Promise<Talent[]> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load roster (${res.status})`);
  }
  const data: unknown = await res.json();
  return talentsFromPayload(data);
}

/** GET webhook; returns parsed JSON (array, single row, or wrapper). Use cache: no-store. */
export async function fetchRosterPayloadFromWebhook(url: string): Promise<unknown> {
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Webhook returned ${res.status}`);
  }
  return res.json() as Promise<unknown>;
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
