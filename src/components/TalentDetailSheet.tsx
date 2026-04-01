import { ExternalLink, Mail } from "lucide-react";
import type { ReactNode } from "react";

import { PrivacyName } from "@/components/PrivacyName";
import { TalentCommentsSection } from "@/components/TalentCommentsSection";
import { TalentResumesSection } from "@/components/TalentResumesSection";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Talent } from "@/types/talent";

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p
        className="text-xs text-muted-foreground uppercase tracking-wide"
        style={{ fontFamily: "var(--font-saans-semimono)" }}
      >
        {label}
      </p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

export function TalentDetailSheet({
  talent,
  open,
  onOpenChange,
}: {
  talent: Talent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = talent;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="p-0 gap-0 flex flex-col max-h-[100dvh]"
      >
        {t ? (
          <>
            <SheetHeader className="p-6 pb-4 border-b border-border shrink-0 text-left space-y-2">
              <SheetTitle className="text-xl pr-10" asChild>
                <span>
                  <PrivacyName name={t.name} />
                </span>
              </SheetTitle>
              <SheetDescription asChild>
                <div className="flex flex-wrap gap-2">
                  {t.interviewStep ? (
                    <Badge variant="secondary">{t.interviewStep}</Badge>
                  ) : null}
                  {t.blueprintArchitect ? (
                    <Badge variant="outline">Architect: {t.blueprintArchitect}</Badge>
                  ) : null}
                </div>
              </SheetDescription>
            </SheetHeader>

            <ScrollArea className="flex-1 min-h-0">
              <div className="p-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Email">
                    {t.email ? (
                      <a
                        className="text-primary inline-flex items-center gap-1.5 hover:underline"
                        href={`mailto:${t.email}`}
                      >
                        <Mail className="size-4 shrink-0" />
                        {t.email}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </Field>
                  <Field label="LinkedIn">
                    {t.linkedInHref ? (
                      <a
                        className="text-primary inline-flex items-center gap-1.5 hover:underline break-all"
                        href={t.linkedInHref}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        Profile
                        <ExternalLink className="size-4 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </Field>
                  <Field label="Desired salary">
                    {t.desiredSalaryRaw || (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </Field>
                  <Field label="Seniority">
                    {t.seniority || (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </Field>
                  <Field label="City">{t.city || "—"}</Field>
                  <Field label="Country">{t.country || "—"}</Field>
                  <Field label="Current role">{t.currentRole || "—"}</Field>
                  <Field label="Current employer">
                    {t.currentEmployer || "—"}
                  </Field>
                  <Field label="Referred by">{t.referredBy || "—"}</Field>
                  <Field label="Who interviewed">
                    {t.whoInterviewed || "—"}
                  </Field>
                </div>

                <Separator />

                <Field label="Augmented skillsets">
                  <div className="flex flex-wrap gap-1.5">
                    {t.skillTags.length ? (
                      t.skillTags.map((s) => (
                        <Badge key={s} variant="outline">
                          {s}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </Field>

                <Field label="Marquee companies">
                  {t.marqueeCompanies.trim() ? (
                    <div className="flex flex-wrap gap-1.5">
                      {t.marqueeCompanies
                        .split(/[,;/]/)
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((c, i) => (
                          <Badge key={`${c}-${i}`} variant="secondary">
                            {c}
                          </Badge>
                        ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </Field>

                {(t.comments || t.comments2) && (
                  <>
                    <Separator />
                    {t.comments ? (
                      <Field label="Comments">{t.comments}</Field>
                    ) : null}
                    {t.comments2 ? (
                      <Field label="Comments 2">{t.comments2}</Field>
                    ) : null}
                  </>
                )}

                <Separator />

                <TalentCommentsSection talent={t} />

                <Separator />

                <TalentResumesSection talent={t} />

                <Separator />

                <div>
                  <p
                    className="text-xs text-muted-foreground uppercase tracking-wide mb-3"
                    style={{ fontFamily: "var(--font-saans-semimono)" }}
                  >
                    Job history
                  </p>
                  {t.jobHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No entries.</p>
                  ) : (
                    <ol className="space-y-4 border-l border-border pl-4 ml-1">
                      {t.jobHistory.map((j, i) => (
                        <li key={`job-${i}-${j.companyName ?? ""}-${j.title ?? ""}`} className="relative">
                          <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-primary" />
                          <p className="font-medium text-foreground">
                            {j.title || "Role"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {j.companyName || "Company"}
                          </p>
                          {j.duration ? (
                            <p
                              className="text-xs text-muted-foreground mt-0.5"
                              style={{
                                fontFamily: "var(--font-saans-semimono)",
                              }}
                            >
                              {j.duration}
                            </p>
                          ) : null}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            </ScrollArea>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
