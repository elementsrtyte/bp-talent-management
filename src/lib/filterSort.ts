import {
  interviewStepRank,
  seniorityRank,
} from "@/lib/roster";
import type { SortKey, Talent } from "@/types/talent";

export type FilterState = {
  query: string;
  interviewSteps: Set<string>;
  architects: Set<string>;
  seniorities: Set<string>;
  countries: Set<string>;
  skills: Set<string>;
};

/** Facet-only filters; combine with a debounced search string for `FilterState`. */
export type FacetFilters = Omit<FilterState, "query">;

function searchHaystack(t: Talent): string {
  const parts = [
    t.name,
    t.email,
    t.skillsetRaw,
    ...t.skillTags,
    t.marqueeCompanies,
    t.currentEmployer,
    t.currentRole,
    t.city,
    t.country,
    t.comments,
    t.comments2,
    t.referredBy,
    t.whoInterviewed,
    t.interviewStep,
    t.blueprintArchitect,
    t.seniority,
  ];
  return parts.join(" ").toLowerCase();
}

export function filterTalents(
  talents: Talent[],
  filters: FilterState,
): Talent[] {
  const q = filters.query.trim().toLowerCase();

  return talents.filter((t) => {
    if (q && !searchHaystack(t).includes(q)) return false;

    if (filters.interviewSteps.size > 0) {
      const step = t.interviewStep.trim();
      if (!filters.interviewSteps.has(step)) return false;
    }

    if (filters.architects.size > 0) {
      const a = t.blueprintArchitect.trim();
      if (!filters.architects.has(a)) return false;
    } else if (t.blueprintArchitect.trim().toLowerCase() === "no") {
      return false;
    }

    if (filters.seniorities.size > 0) {
      const s = t.seniority.trim();
      if (!filters.seniorities.has(s)) return false;
    }

    if (filters.countries.size > 0) {
      const c = t.country.trim();
      if (!filters.countries.has(c)) return false;
    }

    if (filters.skills.size > 0) {
      const lowerTags = t.skillTags.map((x) => x.toLowerCase());
      const any = [...filters.skills].some((sk) =>
        lowerTags.includes(sk.toLowerCase()),
      );
      if (!any) return false;
    }

    return true;
  });
}

export function sortTalents(list: Talent[], sortKey: SortKey): Talent[] {
  const out = [...list];

  const cmpStr = (a: string, b: string) =>
    a.localeCompare(b, undefined, { sensitivity: "base" });

  out.sort((a, b) => {
    switch (sortKey) {
      case "name-asc":
        return cmpStr(a.name, b.name);
      case "city-asc":
        return cmpStr(a.city || a.country, b.city || b.country);
      case "salary-asc": {
        const na = a.salaryNumeric;
        const nb = b.salaryNumeric;
        if (na == null && nb == null) return cmpStr(a.name, b.name);
        if (na == null) return 1;
        if (nb == null) return -1;
        if (na !== nb) return na - nb;
        return cmpStr(a.name, b.name);
      }
      case "salary-desc": {
        const na = a.salaryNumeric;
        const nb = b.salaryNumeric;
        if (na == null && nb == null) return cmpStr(a.name, b.name);
        if (na == null) return 1;
        if (nb == null) return -1;
        if (na !== nb) return nb - na;
        return cmpStr(a.name, b.name);
      }
      case "seniority": {
        const ra = seniorityRank(a.seniority);
        const rb = seniorityRank(b.seniority);
        if (ra !== rb) return ra - rb;
        return cmpStr(a.name, b.name);
      }
      case "interview-step": {
        const ra = interviewStepRank(a.interviewStep);
        const rb = interviewStepRank(b.interviewStep);
        if (ra !== rb) return ra - rb;
        const cs = cmpStr(a.interviewStep, b.interviewStep);
        if (cs !== 0) return cs;
        return cmpStr(a.name, b.name);
      }
      default:
        return cmpStr(a.name, b.name);
    }
  });

  return out;
}

export function collectUniqueStrings(
  talents: Talent[],
  pick: (t: Talent) => string,
): string[] {
  const set = new Set<string>();
  for (const t of talents) {
    const v = pick(t).trim();
    set.add(v);
  }
  return [...set].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
}

/** Architect options: unique values in the same cohort as the table with the architect facet cleared, plus current selections. */
export function collectArchitectFilterOptions(
  talents: Talent[],
  filters: FilterState,
): string[] {
  const withoutArchitect: FilterState = {
    ...filters,
    architects: new Set(),
  };
  const pool = filterTalents(talents, withoutArchitect);
  const fromPool = collectUniqueStrings(pool, (t) => t.blueprintArchitect);
  const set = new Set(fromPool);
  for (const s of filters.architects) set.add(s);
  return [...set].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
}

export function collectAllSkillTags(talents: Talent[]): string[] {
  const set = new Set<string>();
  for (const t of talents) {
    for (const s of t.skillTags) {
      set.add(s);
    }
  }
  return [...set].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
}

export function isFilterActive(f: FilterState): boolean {
  return (
    f.query.trim().length > 0 ||
    f.interviewSteps.size > 0 ||
    f.architects.size > 0 ||
    f.seniorities.size > 0 ||
    f.countries.size > 0 ||
    f.skills.size > 0
  );
}

export function isFacetFilterActive(
  facets: FacetFilters,
  query: string,
): boolean {
  return isFilterActive({ ...facets, query });
}
