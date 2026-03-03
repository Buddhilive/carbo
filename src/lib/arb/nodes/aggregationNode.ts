import type { RunnableConfig } from "@langchain/core/runnables";
import type { ReviewerOutput } from "../types";

/**
 * Aggregation node — pure (no LLM call).
 * Merges all reviewer outputs into the state and computes a preliminary vote tally.
 * This node runs after the parallel fan-in from all 5 reviewer nodes.
 */
export async function aggregationNode(
  state: {
    reviewerOutputs: Record<string, ReviewerOutput>;
  },
  config: RunnableConfig,
) {
  const outputs = state.reviewerOutputs;
  const votes: Record<string, string> = {};
  let criticalCount = 0;
  let majorCount = 0;

  for (const [personaId, output] of Object.entries(outputs)) {
    votes[personaId] = output.overallStance;
    for (const concern of output.concerns) {
      if (concern.severity === "critical") criticalCount++;
      if (concern.severity === "major") majorCount++;
    }
  }

  const writer = config?.configurable?.writer;
  if (writer) {
    writer({
      type: "session-status",
      id: `agg-${Date.now()}`,
      status: "reviewing",
      message: `All reviews complete. ${criticalCount} critical, ${majorCount} major concerns identified. Moving to debate round.`,
    });
  }

  return {
    status: "debating" as const,
  };
}
