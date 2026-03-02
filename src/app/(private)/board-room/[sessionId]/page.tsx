"use client";

import { useEffect, useState, use } from "react";
import { useARBSession } from "@/hooks/useARBSession";
import { ReviewerStatusBar } from "@/components/arb/ReviewerStatusBar";
import { ReviewerCard } from "@/components/arb/ReviewerCard";
import { DebateTimeline } from "@/components/arb/DebateTimeline";
import { ChairmanSynthesis } from "@/components/arb/ChairmanSynthesis";
import { VerdictBadge } from "@/components/arb/VerdictBadge";
import { ALL_PERSONAS } from "@/lib/arb/personas";
import type { ARBProposal } from "@/lib/arb/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, Clock, Loader2 } from "lucide-react";

export default function ARBSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId: routeSessionId } = use(params);
  const [proposal, setProposal] = useState<ARBProposal | null>(null);
  const [activeTab, setActiveTab] = useState<"reviews" | "debate" | "adr">(
    "reviews",
  );
  const [elapsedTime, setElapsedTime] = useState(0);

  const {
    reviewerStatuses,
    reviewerOutputs,
    debateExchanges,
    adr,
    sessionStage,
    statusMessage,
    isRunning,
    error,
    submitProposal,
  } = useARBSession();

  // Load proposal from sessionStorage and auto-start
  useEffect(() => {
    const stored = sessionStorage.getItem(`arb-proposal-${routeSessionId}`);
    if (stored) {
      const parsedProposal = JSON.parse(stored) as ARBProposal;
      setProposal(parsedProposal);
      submitProposal(parsedProposal);
    }
  }, [routeSessionId, submitProposal]);

  // Timer
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Auto-switch tabs based on session stage
  useEffect(() => {
    if (sessionStage === "debating") setActiveTab("debate");
    if (sessionStage === "synthesizing" || sessionStage === "complete")
      setActiveTab("adr");
  }, [sessionStage]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Session Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold truncate max-w-md">
            🏛️ {proposal?.title || "ARB Session"}
          </h1>
          {adr && <VerdictBadge verdict={adr.verdict} />}
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatTime(elapsedTime)}
          </span>
          {isRunning && (
            <span className="flex items-center gap-1 text-primary">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {statusMessage || sessionStage}
            </span>
          )}
          {error && <span className="text-destructive text-xs">{error}</span>}
        </div>
      </div>

      {/* Main 2-panel Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar — Reviewer Status */}
        <div className="w-64 border-r p-4 overflow-y-auto shrink-0 hidden lg:block">
          <ReviewerStatusBar
            reviewerStatuses={reviewerStatuses}
            sessionStage={sessionStage}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Tab Navigation */}
          <div className="flex gap-1 mb-4 border-b">
            {(
              [
                { key: "reviews", label: "Individual Reviews" },
                { key: "debate", label: "Debate Round" },
                { key: "adr", label: "ADR Output" },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "reviews" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ALL_PERSONAS.map((persona) => (
                <ReviewerCard
                  key={persona.id}
                  personaId={persona.id}
                  status={reviewerStatuses.get(persona.id) || "pending"}
                  output={reviewerOutputs.get(persona.id)}
                />
              ))}
            </div>
          )}

          {activeTab === "debate" && (
            <DebateTimeline exchanges={debateExchanges} />
          )}

          {activeTab === "adr" && (
            <ChairmanSynthesis
              adr={adr}
              isProcessing={sessionStage === "synthesizing"}
            />
          )}

          {/* Collapsible Proposal Summary */}
          {proposal && (
            <Collapsible className="mt-6">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between">
                  <span className="text-sm text-muted-foreground">
                    Proposal Summary
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Card className="mt-2">
                  <CardContent className="pt-4 space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Problem: </span>
                      {proposal.problemStatement}
                    </div>
                    <div>
                      <span className="font-medium">Solution: </span>
                      {proposal.proposedSolution}
                    </div>
                    <div>
                      <span className="font-medium">Tech: </span>
                      {proposal.techChoices}
                    </div>
                    <div>
                      <span className="font-medium">Constraints: </span>
                      {proposal.constraints}
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>
    </div>
  );
}
