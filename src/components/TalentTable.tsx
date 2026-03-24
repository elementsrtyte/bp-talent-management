import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Talent } from "@/types/talent";

function truncate(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

const th =
  "text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-3 py-2 border-b border-border whitespace-nowrap";
const td = "px-3 py-2 align-top text-sm border-b border-border";

export function TalentTable({
  rows,
  onSelect,
}: {
  rows: Talent[];
  onSelect: (t: Talent) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-border bg-card">
      <table className="w-full min-w-[920px] border-collapse text-left">
        <thead>
          <tr>
            <th className={th}>Name</th>
            <th className={th}>Skills</th>
            <th className={th}>Step</th>
            <th className={th}>Architect</th>
            <th className={th}>Seniority</th>
            <th className={th}>Salary</th>
            <th className={th}>Location</th>
            <th className={th}>Role</th>
            <th className={th}>Employer</th>
            <th className={cn(th, "w-[1%]")} />
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr
              key={t.id}
              className="hover:bg-muted/40 cursor-pointer transition-colors"
              onClick={() => onSelect(t)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(t);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`View ${t.name}`}
            >
              <td className={cn(td, "font-medium text-foreground")}>
                {t.name}
              </td>
              <td className={td}>
                <span
                  className="text-muted-foreground line-clamp-2 max-w-[220px]"
                  title={t.skillsetRaw}
                >
                  {truncate(t.skillsetRaw, 80) || "—"}
                </span>
              </td>
              <td className={td}>
                {t.interviewStep ? (
                  <Badge variant="outline" className="font-normal">
                    {t.interviewStep}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className={td}>
                {t.blueprintArchitect ? (
                  <span className="text-muted-foreground">
                    {t.blueprintArchitect}
                  </span>
                ) : (
                  "—"
                )}
              </td>
              <td className={td}>
                {t.seniority || (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className={td}>
                {t.desiredSalaryRaw || (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className={td}>
                <div className="text-muted-foreground max-w-[160px]">
                  {[t.city, t.country].filter(Boolean).join(", ") || "—"}
                </div>
              </td>
              <td className={td}>
                <span className="line-clamp-2 max-w-[200px]">
                  {t.currentRole || (
                    <span className="text-muted-foreground">—</span>
                  )}
                </span>
              </td>
              <td className={td}>
                <span className="line-clamp-2 max-w-[180px] text-muted-foreground">
                  {t.currentEmployer || "—"}
                </span>
              </td>
              <td className={cn(td, "whitespace-nowrap")}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(t);
                  }}
                >
                  View
                  <ExternalLink className="size-3.5 opacity-60" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
