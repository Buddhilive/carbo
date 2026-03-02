import { z } from "zod";

// ─── Proposal Intake ────────────────────────────────────────────────

export const ARBProposalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  problemStatement: z.string().min(1, "Problem statement is required"),
  proposedSolution: z.string().min(1, "Proposed solution is required"),
  techChoices: z.string().describe("Comma-separated or freetext tech choices"),
  constraints: z.string().describe("Budget, timeline, compliance, etc."),
  outOfScope: z.string().optional().default(""),
});

export type ARBProposal = z.infer<typeof ARBProposalSchema>;

// ─── Reviewer Persona ───────────────────────────────────────────────

export type PersonaId =
  | "security"
  | "scalability"
  | "cost"
  | "operability"
  | "domain-architect";

export interface ReviewerPersona {
  id: PersonaId;
  displayName: string;
  icon: string;
  focusAreas: string[];
}

// ─── Reviewer Output (enforced via Zod) ─────────────────────────────

export const ConcernSchema = z.object({
  title: z.string(),
  severity: z.enum(["critical", "major", "minor", "informational"]),
  category: z.string(),
  description: z.string(),
  recommendation: z.string(),
});

export const ReviewerOutputSchema = z.object({
  personaId: z.string(),
  summary: z.string().describe("2-3 sentence TL;DR"),
  concerns: z.array(ConcernSchema),
  positives: z.array(z.string()),
  overallStance: z.enum(["approve", "approve-with-conditions", "reject"]),
  confidence: z.number().min(0).max(1),
});

export type ReviewerOutput = z.infer<typeof ReviewerOutputSchema>;

// ─── Debate ─────────────────────────────────────────────────────────

export interface DebateExchange {
  personaId: string;
  rebuttal: string;
}

// ─── ADR Document ───────────────────────────────────────────────────

export const ADRDocumentSchema = z.object({
  sessionId: z.string(),
  title: z.string(),
  date: z.string(),
  verdict: z.enum(["approved", "approved-with-conditions", "rejected"]),
  context: z.string(),
  decision: z.string(),
  rationale: z.string(),
  conditions: z.array(z.string()),
  risks: z.array(
    z.object({
      description: z.string(),
      severity: z.string(),
      mitigation: z.string(),
    }),
  ),
  dissentingOpinions: z.array(
    z.object({
      personaId: z.string(),
      reason: z.string(),
    }),
  ),
  consequences: z.string(),
  reviewerVotes: z.record(
    z.string(),
    z.enum(["approve", "approve-with-conditions", "reject"]),
  ),
});

export type ADRDocument = z.infer<typeof ADRDocumentSchema>;

// ─── Session Status ─────────────────────────────────────────────────

export type ARBSessionStatus =
  | "intake"
  | "reviewing"
  | "debating"
  | "synthesizing"
  | "complete"
  | "error";

// ─── Stream Event Types (emitted via config.writer()) ───────────────

export type ARBStreamEvent =
  | {
      type: "reviewer-start";
      id: string;
      personaId: string;
      displayName: string;
    }
  | {
      type: "reviewer-complete";
      id: string;
      personaId: string;
      output: ReviewerOutput;
    }
  | { type: "debate-start"; id: string }
  | {
      type: "debate-exchange";
      id: string;
      personaId: string;
      rebuttal: string;
    }
  | { type: "chairman-start"; id: string }
  | { type: "adr-complete"; id: string; adr: ADRDocument }
  | {
      type: "session-status";
      id: string;
      status: ARBSessionStatus;
      message: string;
    };
