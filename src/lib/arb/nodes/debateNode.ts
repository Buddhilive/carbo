import { ChatGroq } from "@langchain/groq";
import type { RunnableConfig } from "@langchain/core/runnables";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { ReviewerOutput, DebateExchange } from "../types";
import { ALL_PERSONAS } from "../personas";
import { buildDebatePrompt } from "../prompts";

/**
 * Debate node — sequential LLM calls.
 * Each reviewer receives anonymized excerpts of 2-3 most critical peer concerns
 * and can emit a brief rebuttal or concurrence statement.
 */
export async function debateNode(
  state: {
    reviewerOutputs: Record<string, ReviewerOutput>;
    debateRounds: DebateExchange[];
  },
  config: RunnableConfig,
) {
  const writer = config?.configurable?.writer;

  if (writer) {
    writer({
      type: "debate-start",
      id: `ds-${Date.now()}`,
    });
  }

  const model = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    temperature: 0.4,
    maxTokens: 500,
  });

  const exchanges: DebateExchange[] = [];

  for (const persona of ALL_PERSONAS) {
    const ownOutput = state.reviewerOutputs[persona.id];
    if (!ownOutput) continue;

    // Collect critical/major concerns from OTHER reviewers
    const peerConcerns: string[] = [];
    for (const [otherId, otherOutput] of Object.entries(
      state.reviewerOutputs,
    )) {
      if (otherId === persona.id) continue;
      const criticalConcerns = otherOutput.concerns.filter(
        (c) => c.severity === "critical" || c.severity === "major",
      );
      for (const concern of criticalConcerns.slice(0, 2)) {
        peerConcerns.push(
          `[${concern.severity.toUpperCase()}] ${concern.title}: ${concern.description}`,
        );
      }
    }

    if (peerConcerns.length === 0) {
      // No critical/major peer concerns to respond to
      exchanges.push({
        personaId: persona.id,
        rebuttal:
          "No critical or major peer concerns intersect with my domain. I concur with my original assessment.",
      });
      if (writer) {
        writer({
          type: "debate-exchange",
          id: `de-${persona.id}-${Date.now()}`,
          personaId: persona.id,
          rebuttal: exchanges[exchanges.length - 1].rebuttal,
        });
      }
      continue;
    }

    const ownReviewSummary = `Summary: ${ownOutput.summary}\nStance: ${ownOutput.overallStance}\nKey concerns: ${ownOutput.concerns.map((c) => c.title).join(", ")}`;
    const peerConcernsText = peerConcerns.slice(0, 6).join("\n");

    try {
      const debatePrompt = buildDebatePrompt(
        persona,
        ownReviewSummary,
        peerConcernsText,
      );

      const response = await model.invoke([
        new SystemMessage(debatePrompt),
        new HumanMessage("Please provide your rebuttal or concurrence."),
      ]);

      const rebuttal =
        typeof response.content === "string"
          ? response.content
          : JSON.stringify(response.content);

      exchanges.push({
        personaId: persona.id,
        rebuttal,
      });

      if (writer) {
        writer({
          type: "debate-exchange",
          id: `de-${persona.id}-${Date.now()}`,
          personaId: persona.id,
          rebuttal,
        });
      }
    } catch (error) {
      console.error(`Debate failed for ${persona.id}:`, error);
      exchanges.push({
        personaId: persona.id,
        rebuttal:
          "Unable to provide rebuttal due to technical error. Original assessment stands.",
      });
    }
  }

  return {
    debateRounds: exchanges,
    status: "synthesizing" as const,
  };
}
