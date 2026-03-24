import { Moon, Sun } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { BlueprintLogo } from "@/components/BlueprintLogo";
import { FilterBar } from "@/components/FilterBar";
import { GridBackground } from "@/components/GridBackground";
import { TalentDetailSheet } from "@/components/TalentDetailSheet";
import { TalentTable } from "@/components/TalentTable";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  filterTalents,
  sortTalents,
  type FacetFilters,
  type FilterState,
} from "@/lib/filterSort";
import { loadRosterFromUrl } from "@/lib/roster";
import type { SortKey, Talent } from "@/types/talent";

function createEmptyFacets(): FacetFilters {
  return {
    interviewSteps: new Set(),
    architects: new Set(),
    seniorities: new Set(),
    countries: new Set(),
    skills: new Set(),
  };
}

function applyThemeClass(isDark: boolean) {
  const root = document.documentElement;
  if (isDark) root.classList.add("dark");
  else root.classList.remove("dark");
}

export default function App() {
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 200);
  const [facetFilters, setFacetFilters] = useState<FacetFilters>(() =>
    createEmptyFacets(),
  );
  const [sortKey, setSortKey] = useState<SortKey>("name-asc");

  const [selected, setSelected] = useState<Talent | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [isDark, setIsDark] = useState(() => {
    if (typeof localStorage === "undefined") return true;
    const saved = localStorage.getItem("theme");
    if (saved === "light") return false;
    if (saved === "dark") return true;
    return true;
  });

  useEffect(() => {
    applyThemeClass(isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    let cancelled = false;
    loadRosterFromUrl("/roster.csv")
      .then((rows) => {
        if (!cancelled) {
          setLoadError(null);
          setTalents(rows);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Failed to load roster");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filterState: FilterState = useMemo(
    () => ({
      ...facetFilters,
      query: debouncedSearch,
    }),
    [facetFilters, debouncedSearch],
  );

  const visible = useMemo(() => {
    const filtered = filterTalents(talents, filterState);
    return sortTalents(filtered, sortKey);
  }, [talents, filterState, sortKey]);

  function handleClearFilters() {
    setSearch("");
    setFacetFilters(createEmptyFacets());
  }

  function handleSelect(t: Talent) {
    setSelected(t);
    setSheetOpen(true);
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <GridBackground />

      <header
        className="border-b border-border relative z-10"
        style={{ position: "relative", zIndex: 1 }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <BlueprintLogo className="shrink-0 text-foreground" />
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-foreground">
                Talent roster
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {loading
                  ? "Loading…"
                  : `${visible.length} of ${talents.length} shown`}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIsDark((d) => !d)}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="shrink-0 border-border"
          >
            {isDark ? (
              <Sun className="size-5" strokeWidth={1.25} />
            ) : (
              <Moon className="size-5" strokeWidth={1.25} />
            )}
          </Button>
        </div>
      </header>

      {loadError ? (
        <div
          className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 py-6"
          role="alert"
        >
          <div className="rounded-md border border-destructive/50 bg-destructive/10 text-destructive-foreground px-4 py-3 text-sm">
            <strong className="font-medium">Could not load roster.</strong>{" "}
            {loadError} Place{" "}
            <code className="text-xs bg-background/50 px-1 rounded">roster.csv</code>{" "}
            in{" "}
            <code className="text-xs bg-background/50 px-1 rounded">public/</code>{" "}
            and refresh.
          </div>
        </div>
      ) : null}

      {!loadError && !loading ? (
        <div className="relative z-10">
          <FilterBar
            allTalents={talents}
            search={search}
            onSearchChange={setSearch}
            debouncedQuery={debouncedSearch}
            filters={facetFilters}
            onFiltersChange={setFacetFilters}
            sortKey={sortKey}
            onSortKeyChange={setSortKey}
            onClear={handleClearFilters}
          />

          <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
            {visible.length === 0 ? (
              <div className="rounded-md border border-border bg-card p-8 text-center space-y-3 max-w-lg mx-auto">
                <p className="text-foreground font-medium">
                  No one matches these filters.
                </p>
                <p className="text-sm text-muted-foreground">
                  Try clearing search or filter chips to see the full roster.
                </p>
                <Button type="button" onClick={handleClearFilters}>
                  Reset filters
                </Button>
              </div>
            ) : (
              <TalentTable rows={visible} onSelect={handleSelect} />
            )}
          </main>
        </div>
      ) : null}

      <TalentDetailSheet
        talent={selected}
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
}
