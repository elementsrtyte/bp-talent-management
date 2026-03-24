import { ChevronDown, Filter } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  collectAllSkillTags,
  collectArchitectFilterOptions,
  collectUniqueStrings,
  type FacetFilters,
  isFacetFilterActive,
  type FilterState,
} from "@/lib/filterSort";
import type { SortKey, Talent } from "@/types/talent";

const monoLabel = "text-xs text-muted-foreground uppercase tracking-wide";

function formatFacetValue(v: string): string {
  return v.trim() === "" ? "(blank)" : v;
}

function toggleInSet(prev: Set<string>, key: string): Set<string> {
  const next = new Set(prev);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
}

function MultiFilterPopover({
  label,
  options,
  selected,
  onChange,
  wide,
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  wide?: boolean;
}) {
  const count = selected.size;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 border-border"
        >
          <Filter className="size-3.5 opacity-70" aria-hidden />
          {label}
          {count > 0 ? (
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
              {count}
            </Badge>
          ) : null}
          <ChevronDown className="size-3.5 opacity-50" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn("p-3", wide ? "w-[min(100vw-2rem,28rem)]" : "w-72")}
      >
        <p
          className={cn(monoLabel, "mb-2")}
          style={{ fontFamily: "var(--font-saans-semimono)" }}
        >
          {label}
        </p>
        <div
          className={cn(
            "flex flex-col gap-1 max-h-64 overflow-y-auto pr-1",
            wide && "max-h-72",
          )}
        >
          {options.map((opt) => {
            const on = selected.has(opt);
            return (
              <Button
                key={`${label}-${opt || "__empty__"}`}
                type="button"
                variant={on ? "default" : "outline"}
                size="sm"
                className="justify-start text-left h-auto min-h-8 py-1.5 px-2 whitespace-normal"
                onClick={() => onChange(toggleInSet(selected, opt))}
              >
                {formatFacetValue(opt)}
              </Button>
            );
          })}
        </div>
        <p className="text-muted-foreground text-xs mt-3 leading-snug">
          {label === "Skills"
            ? "Matches anyone who has any selected skill (OR)."
            : "Multiple selections match any of the chosen values (OR)."}
        </p>
      </PopoverContent>
    </Popover>
  );
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "city-asc", label: "City / location" },
  { value: "salary-asc", label: "Salary (low → high)" },
  { value: "salary-desc", label: "Salary (high → low)" },
  { value: "seniority", label: "Seniority" },
  { value: "interview-step", label: "Interview step (pipeline)" },
];

const selectLike =
  "border-input bg-input-background text-foreground h-9 w-full min-w-[11rem] rounded-md border px-3 text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none";

export function FilterBar({
  allTalents,
  search,
  onSearchChange,
  debouncedQuery,
  filters,
  onFiltersChange,
  sortKey,
  onSortKeyChange,
  onClear,
}: {
  allTalents: Talent[];
  search: string;
  onSearchChange: (v: string) => void;
  debouncedQuery: string;
  filters: FacetFilters;
  onFiltersChange: (f: FacetFilters) => void;
  sortKey: SortKey;
  onSortKeyChange: (k: SortKey) => void;
  onClear: () => void;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const interviewSteps = useMemo(
    () => collectUniqueStrings(allTalents, (t) => t.interviewStep),
    [allTalents],
  );
  const architectOptions = useMemo(() => {
    const state: FilterState = { ...filters, query: debouncedQuery };
    return collectArchitectFilterOptions(allTalents, state);
  }, [allTalents, debouncedQuery, filters]);
  const seniorities = useMemo(
    () => collectUniqueStrings(allTalents, (t) => t.seniority),
    [allTalents],
  );
  const countries = useMemo(
    () => collectUniqueStrings(allTalents, (t) => t.country),
    [allTalents],
  );
  const skills = useMemo(() => collectAllSkillTags(allTalents), [allTalents]);

  const active = isFacetFilterActive(filters, debouncedQuery);

  const filterButtons = (
    <>
      <MultiFilterPopover
        label="Interview step"
        options={interviewSteps}
        selected={filters.interviewSteps}
        onChange={(next) =>
          onFiltersChange({ ...filters, interviewSteps: next })
        }
      />
      <MultiFilterPopover
        label="Architect"
        options={architectOptions}
        selected={filters.architects}
        onChange={(next) => onFiltersChange({ ...filters, architects: next })}
      />
      <MultiFilterPopover
        label="Seniority"
        options={seniorities}
        selected={filters.seniorities}
        onChange={(next) => onFiltersChange({ ...filters, seniorities: next })}
      />
      <MultiFilterPopover
        label="Country"
        options={countries}
        selected={filters.countries}
        onChange={(next) => onFiltersChange({ ...filters, countries: next })}
      />
      <MultiFilterPopover
        label="Skills"
        options={skills}
        selected={filters.skills}
        onChange={(next) => onFiltersChange({ ...filters, skills: next })}
        wide
      />
      {active ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={onClear}
        >
          Clear all
        </Button>
      ) : null}
    </>
  );

  return (
    <div className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1 min-w-0 space-y-1.5">
            <label
              htmlFor="roster-search"
              className={cn(monoLabel, "block")}
              style={{ fontFamily: "var(--font-saans-semimono)" }}
            >
              Search
            </label>
            <Input
              id="roster-search"
              placeholder="Name, skills, employer, city, comments…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-1.5 min-w-0 lg:w-56">
            <span
              className={cn(monoLabel, "block")}
              style={{ fontFamily: "var(--font-saans-semimono)" }}
            >
              Sort by
            </span>
            <select
              className={selectLike}
              value={sortKey}
              onChange={(e) => onSortKeyChange(e.target.value as SortKey)}
              aria-label="Sort roster"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="md:hidden">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
          >
            <span>Filters</span>
            <ChevronDown
              className={cn(
                "size-4 opacity-60 transition-transform",
                filtersOpen && "rotate-180",
              )}
            />
          </button>
          {filtersOpen ? (
            <div className="flex flex-wrap gap-2 pt-3">{filterButtons}</div>
          ) : null}
        </div>

        <div className="hidden md:flex flex-wrap gap-2 items-center">
          {filterButtons}
        </div>
      </div>
    </div>
  );
}
