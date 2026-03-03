"use client";

import type { ADRDocument } from "@/lib/arb/types";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VerdictBadge } from "./VerdictBadge";

interface ChairmanSynthesisProps {
  adr: ADRDocument | null;
  isProcessing?: boolean;
}

export function ChairmanSynthesis({
  adr,
  isProcessing,
}: ChairmanSynthesisProps) {
  if (isProcessing) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-pulse space-y-3">
            <p className="text-sm text-muted-foreground">
              👨‍⚖️ The Chairman is synthesizing the ADR...
            </p>
            <div className="h-2 bg-muted rounded-full w-3/4 mx-auto" />
            <div className="h-2 bg-muted rounded-full w-1/2 mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!adr) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground text-sm">
          ADR will appear here once the Chairman completes synthesis.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>📋 Architectural Decision Record</span>
          <VerdictBadge verdict={adr.verdict} />
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Session: {adr.sessionId} | Date: {adr.date}
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Title */}
        <div>
          <h3 className="text-lg font-semibold">{adr.title}</h3>
        </div>

        {/* Context */}
        <section>
          <h4 className="text-sm font-semibold text-muted-foreground mb-1">
            Context
          </h4>
          <p className="text-sm">{adr.context}</p>
        </section>

        {/* Decision */}
        <section>
          <h4 className="text-sm font-semibold text-muted-foreground mb-1">
            Decision
          </h4>
          <p className="text-sm">{adr.decision}</p>
        </section>

        {/* Rationale */}
        <Reasoning>
          <ReasoningTrigger>View Rationale</ReasoningTrigger>
          <ReasoningContent>{adr.rationale}</ReasoningContent>
        </Reasoning>

        {/* Conditions */}
        {adr.conditions.length > 0 && (
          <section>
            <h4 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-1">
              Conditions for Approval
            </h4>
            <ul className="list-disc list-inside text-sm space-y-0.5">
              {adr.conditions.map((condition, idx) => (
                <li key={idx}>{condition}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Risks */}
        {adr.risks.length > 0 && (
          <section>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">
              Risks
            </h4>
            <div className="space-y-2">
              {adr.risks.map((risk, idx) => (
                <div key={idx} className="border rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded">
                      {risk.severity}
                    </span>
                    <span className="text-sm">{risk.description}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Mitigation:</span>{" "}
                    {risk.mitigation}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Dissenting Opinions */}
        {adr.dissentingOpinions.length > 0 && (
          <section>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">
              Dissenting Opinions
            </h4>
            <div className="space-y-2">
              {adr.dissentingOpinions.map((dissent, idx) => (
                <div
                  key={idx}
                  className="border-l-2 border-orange-500 pl-3 py-1"
                >
                  <p className="text-xs font-semibold uppercase text-orange-500">
                    {dissent.personaId}
                  </p>
                  <p className="text-sm">{dissent.reason}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Consequences */}
        <section>
          <h4 className="text-sm font-semibold text-muted-foreground mb-1">
            Consequences
          </h4>
          <p className="text-sm">{adr.consequences}</p>
        </section>

        {/* Reviewer Votes */}
        <section>
          <h4 className="text-sm font-semibold text-muted-foreground mb-2">
            Reviewer Votes
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(adr.reviewerVotes).map(([personaId, vote]) => (
              <div
                key={personaId}
                className="flex items-center gap-1.5 text-xs"
              >
                <span className="font-medium capitalize">{personaId}:</span>
                <VerdictBadge verdict={vote} />
              </div>
            ))}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
