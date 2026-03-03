"use client";

import { ALL_PERSONAS } from "@/lib/arb/personas";
import type { ARBSessionStatus } from "@/lib/arb/types";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Circle,
  Loader2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

type ReviewerStatus = "pending" | "running" | "complete" | "error";

interface ReviewerStatusBarProps {
  reviewerStatuses: Map<string, ReviewerStatus>;
  sessionStage: ARBSessionStatus;
}

const stages: { id: ARBSessionStatus; label: string }[] = [
  { id: "intake", label: "Intake Validated" },
  { id: "reviewing", label: "Individual Reviews" },
  { id: "debating", label: "Debate Round" },
  { id: "synthesizing", label: "ADR Synthesis" },
  { id: "complete", label: "Complete" },
];

const stageOrder: ARBSessionStatus[] = [
  "intake",
  "reviewing",
  "debating",
  "synthesizing",
  "complete",
];

function StageIndicator({
  stage,
  currentStage,
  label,
}: {
  stage: ARBSessionStatus;
  currentStage: ARBSessionStatus;
  label: string;
}) {
  const currentIdx = stageOrder.indexOf(currentStage);
  const targetIdx = stageOrder.indexOf(stage);

  const isComplete =
    currentIdx > targetIdx ||
    (stage === "complete" && currentStage === "complete");
  const isActive = currentIdx === targetIdx && !isComplete;

  return (
    <div className="flex items-center gap-2 py-1">
      {isComplete ? (
        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
      ) : isActive ? (
        <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
      ) : (
        <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
      )}
      <span
        className={cn(
          "text-xs",
          isComplete && "text-green-600 dark:text-green-400",
          isActive && "text-primary font-medium",
          !isComplete && !isActive && "text-muted-foreground/60",
        )}
      >
        {label}
      </span>
    </div>
  );
}

function ReviewerStatusItem({
  icon,
  name,
  status,
}: {
  icon: string;
  name: string;
  status: ReviewerStatus;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors">
      {status === "complete" ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
      ) : status === "running" ? (
        <Loader2 className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />
      ) : status === "error" ? (
        <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
      ) : (
        <Circle className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
      )}
      <span className="text-xs">
        {icon} {name}
      </span>
    </div>
  );
}

export function ReviewerStatusBar({
  reviewerStatuses,
  sessionStage,
}: ReviewerStatusBarProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Stage Progress */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Session Progress
        </h3>
        <div className="flex flex-col gap-0.5">
          {stages.map((stage) => (
            <StageIndicator
              key={stage.id}
              stage={stage.id}
              currentStage={sessionStage}
              label={stage.label}
            />
          ))}
        </div>
      </div>

      {/* Reviewer Queue */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Reviewers
        </h3>
        <div className="flex flex-col gap-0.5 border rounded-lg p-2">
          {ALL_PERSONAS.map((persona) => (
            <ReviewerStatusItem
              key={persona.id}
              icon={persona.icon}
              name={persona.displayName}
              status={reviewerStatuses.get(persona.id) || "pending"}
            />
          ))}
          <div className="border-t my-1" />
          <ReviewerStatusItem
            icon="👨‍⚖️"
            name="Chairman Synthesis"
            status={
              sessionStage === "synthesizing"
                ? "running"
                : sessionStage === "complete"
                  ? "complete"
                  : "pending"
            }
          />
        </div>
      </div>
    </div>
  );
}
