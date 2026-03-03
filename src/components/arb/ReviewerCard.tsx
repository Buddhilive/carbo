"use client";

import type { ReviewerOutput } from "@/lib/arb/types";
import { ALL_PERSONAS } from "@/lib/arb/personas";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VerdictBadge } from "./VerdictBadge";

type ReviewerStatus = "pending" | "running" | "complete" | "error";

interface ReviewerCardProps {
  personaId: string;
  status: ReviewerStatus;
  output?: ReviewerOutput;
}

function SeverityBadge({
  severity,
}: {
  severity: "critical" | "major" | "minor" | "informational";
}) {
  const variants: Record<string, string> = {
    critical: "bg-red-500/15 text-red-500 border-red-500/30",
    major: "bg-orange-500/15 text-orange-500 border-orange-500/30",
    minor: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
    informational: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border ${variants[severity]}`}
    >
      {severity.toUpperCase()}
    </span>
  );
}

export function ReviewerCard({ personaId, status, output }: ReviewerCardProps) {
  const persona = ALL_PERSONAS.find((p) => p.id === personaId);
  if (!persona) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span>
            {persona.icon} {persona.displayName}
          </span>
          {output && <VerdictBadge verdict={output.overallStance} />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {status === "pending" && (
          <p className="text-sm text-muted-foreground">Waiting to start...</p>
        )}

        {status === "running" && (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}

        {status === "error" && (
          <p className="text-sm text-destructive">
            This reviewer encountered an error.
          </p>
        )}

        {status === "complete" && output && (
          <div className="space-y-4">
            {/* Summary */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Summary
              </p>
              <p className="text-sm">{output.summary}</p>
            </div>

            {/* Confidence */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Confidence:</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${output.confidence * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono">
                {Math.round(output.confidence * 100)}%
              </span>
            </div>

            {/* Concerns */}
            {output.concerns.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Concerns ({output.concerns.length})
                </p>
                <div className="space-y-2">
                  {output.concerns.map((concern, idx) => (
                    <div
                      key={idx}
                      className="border rounded-lg p-3 space-y-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={concern.severity} />
                        <span className="text-sm font-medium">
                          {concern.title}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {concern.description}
                      </p>
                      <p className="text-xs">
                        <span className="font-medium">Recommendation:</span>{" "}
                        {concern.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Positives */}
            {output.positives.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Positives
                </p>
                <ul className="list-disc list-inside text-sm space-y-0.5">
                  {output.positives.map((pos, idx) => (
                    <li
                      key={idx}
                      className="text-green-600 dark:text-green-400"
                    >
                      {pos}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
