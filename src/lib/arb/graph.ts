import { StateGraph, Annotation, END, START } from "@langchain/langgraph";
import type {
  ARBProposal,
  ReviewerOutput,
  DebateExchange,
  ADRDocument,
  ARBSessionStatus,
} from "./types";
import { ALL_PERSONAS } from "./personas";
import { createReviewerNode } from "./nodes/reviewerNode";
import { aggregationNode } from "./nodes/aggregationNode";
import { debateNode } from "./nodes/debateNode";
import { chairmanNode } from "./nodes/chairmanNode";

// ─── State Annotation ───────────────────────────────────────────────

const ARBStateAnnotation = Annotation.Root({
  proposal: Annotation<ARBProposal>,
  proposalBrief: Annotation<string>,
  reviewerOutputs: Annotation<Record<string, ReviewerOutput>>({
    reducer: (prev, next) => ({ ...prev, ...next }),
    default: () => ({}),
  }),
  debateRounds: Annotation<DebateExchange[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),
  adr: Annotation<ADRDocument | null>,
  sessionId: Annotation<string>,
  status: Annotation<ARBSessionStatus>,
});

export type ARBState = typeof ARBStateAnnotation.State;

// ─── Intake Validation Node (pure, no LLM) ─────────────────────────

async function intakeValidationNode(state: ARBState) {
  const { proposal } = state;
  const brief = `"${proposal.title}" proposes: ${proposal.proposedSolution}. It addresses: ${proposal.problemStatement}. Tech choices: ${proposal.techChoices}. Constraints: ${proposal.constraints}.`;

  return {
    proposalBrief: brief,
    status: "reviewing" as const,
  };
}

// ─── Build the Graph ────────────────────────────────────────────────

function buildARBGraph() {
  const graph = new StateGraph(ARBStateAnnotation);

  // Add nodes
  graph.addNode("intake-validation", intakeValidationNode);

  // Add reviewer nodes for each persona
  for (const persona of ALL_PERSONAS) {
    graph.addNode(`reviewer-${persona.id}`, createReviewerNode(persona));
  }

  graph.addNode("aggregation", aggregationNode);
  graph.addNode("debate-round", debateNode);
  graph.addNode("chairman-synthesis", chairmanNode);

  // Wire edges: START → intake-validation
  graph.addEdge(START as any, "intake-validation" as any);

  // Parallel fan-out: intake-validation → all 5 reviewer nodes
  for (const persona of ALL_PERSONAS) {
    graph.addEdge("intake-validation" as any, `reviewer-${persona.id}` as any);
  }

  // Fan-in: all 5 reviewer nodes → aggregation
  for (const persona of ALL_PERSONAS) {
    graph.addEdge(`reviewer-${persona.id}` as any, "aggregation" as any);
  }

  // Sequential: aggregation → debate → chairman → END
  graph.addEdge("aggregation" as any, "debate-round" as any);
  graph.addEdge("debate-round" as any, "chairman-synthesis" as any);
  graph.addEdge("chairman-synthesis" as any, END as any);

  return graph.compile();
}

// Compile the graph at module scope to amortize compilation cost
export const arbGraph = buildARBGraph();
