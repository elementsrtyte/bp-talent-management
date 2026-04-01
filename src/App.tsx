import { LogOut, Moon, RefreshCw, Sun } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AuthLoginPage } from "@/components/AuthLoginPage";
import { AuthUpdatePasswordPage } from "@/components/AuthUpdatePasswordPage";
import { BlueprintLogo } from "@/components/BlueprintLogo";
import { FilterBar } from "@/components/FilterBar";
import { GridBackground } from "@/components/GridBackground";
import { TalentDetailSheet } from "@/components/TalentDetailSheet";
import { TalentTable } from "@/components/TalentTable";
import { Button } from "@/components/ui/button";
import { N8N_ROSTER_WEBHOOK } from "@/config/rosterWebhook";
import { authBypassEnabled } from "@/lib/authBypass";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  filterTalents,
  sortTalents,
  type FacetFilters,
  type FilterState,
} from "@/lib/filterSort";
import { formatRosterUpdatedAt } from "@/lib/formatRosterTime";
import {
  fetchRosterPayloadFromWebhook,
  loadRosterFromUrl,
  talentsFromPayload,
} from "@/lib/roster";
import { readRosterCache, writeRosterCache } from "@/lib/rosterCache";
import { cn } from "@/lib/utils";
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

function TalentRosterApp({
  onSignOut,
  authBypassActive,
}: {
  onSignOut?: () => void;
  authBypassActive?: boolean;
}) {
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  /** ISO time from last successful webhook refresh (or when that payload was cached). */
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

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

    const cached = readRosterCache();
    if (cached) {
      const rows = talentsFromPayload(cached.payload);
      if (rows.length > 0) {
        if (!cancelled) {
          setLoadError(null);
          setTalents(rows);
          setLastUpdated(cached.updatedAt);
          setLoading(false);
        }
        return () => {
          cancelled = true;
        };
      }
    }

    loadRosterFromUrl("/roster.json")
      .then((rows) => {
        if (!cancelled) {
          setLoadError(null);
          setTalents(rows);
          setLastUpdated(null);
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

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshError(null);
    try {
      const payload = await fetchRosterPayloadFromWebhook(N8N_ROSTER_WEBHOOK);
      const rows = talentsFromPayload(payload);
      if (rows.length === 0) {
        throw new Error(
          "Webhook returned no roster rows with a Name. Return a JSON array of rows (or a single row object).",
        );
      }
      const updatedAt = new Date().toISOString();
      writeRosterCache({ updatedAt, payload });
      setTalents(rows);
      setLastUpdated(updatedAt);
      setLoadError(null);
    } catch (e: unknown) {
      setRefreshError(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setRefreshing(false);
    }
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
              {!loading && talents.length > 0 ? (
                <p
                  className="text-xs text-muted-foreground mt-1 max-w-xl"
                  style={{ fontFamily: "var(--font-saans-semimono)" }}
                >
                  {lastUpdated ? (
                    <>
                      Last updated{" "}
                      <time dateTime={lastUpdated}>
                        {formatRosterUpdatedAt(lastUpdated)}
                      </time>
                    </>
                  ) : (
                    <>
                      Using bundled{" "}
                      <code className="text-[11px] px-1 rounded bg-muted">
                        roster.json
                      </code>
                      . Use Refresh to pull the latest sheet via n8n.
                    </>
                  )}
                </p>
              ) : null}
              {refreshError ? (
                <p className="text-xs text-destructive mt-1 max-w-xl" role="alert">
                  {refreshError}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onSignOut ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-border gap-2"
                onClick={() => void onSignOut()}
              >
                <LogOut className="size-4" aria-hidden />
                Sign out
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-border gap-2"
              onClick={() => void handleRefresh()}
              disabled={loading || refreshing}
              aria-busy={refreshing}
            >
              <RefreshCw
                className={cn("size-4", refreshing && "animate-spin")}
                aria-hidden
              />
              Refresh
            </Button>
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
        </div>
      </header>

      {authBypassActive ? (
        <div
          className="relative z-10 border-b border-secondary/40 bg-secondary/15 px-4 py-2.5 text-center text-sm text-foreground"
          role="status"
        >
          <strong className="font-medium">Login bypassed</strong> (
          <code className="text-xs px-1 rounded bg-muted">VITE_BYPASS_AUTH</code>
          ). Internal notes and resumes in the detail sheet need a real Supabase
          session. Remove this from{" "}
          <code className="text-xs px-1 rounded bg-muted">.env.local</code> when
          you can sign in again.
        </div>
      ) : null}

      {loadError ? (
        <div
          className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 py-6"
          role="alert"
        >
          <div className="rounded-md border border-destructive/50 bg-destructive/10 text-destructive-foreground px-4 py-3 text-sm">
            <strong className="font-medium">Could not load roster.</strong>{" "}
            {loadError} Place{" "}
            <code className="text-xs bg-background/50 px-1 rounded">roster.json</code>{" "}
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


export default function App() {
  const {
    configured,
    initializing,
    session,
    signOut,
    isPasswordRecovery,
  } = useSupabaseAuth();

  const bypass = authBypassEnabled;

  if (configured && !bypass && initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        <RefreshCw className="size-8 animate-spin" aria-hidden />
        <span className="sr-only">Loading session</span>
      </div>
    );
  }

  if (configured && !bypass && !session) {
    return <AuthLoginPage />;
  }

  if (configured && !bypass && session && isPasswordRecovery) {
    return <AuthUpdatePasswordPage />;
  }

  return (
    <TalentRosterApp
      authBypassActive={Boolean(configured && bypass)}
      onSignOut={
        configured && !bypass && session
          ? () => void signOut()
          : undefined
      }
    />
  );
}
