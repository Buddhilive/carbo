import { ChatGroq } from "@langchain/groq";
import type { RunnableConfig } from "@langchain/core/runnables";
import type { ReviewerPersona, ReviewerOutput } from "../types";
import { ReviewerOutputSchema } from "../types";
import { buildReviewerPrompt } from "../prompts";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

/**
 * Factory function: creates a LangGraph node function for a given reviewer persona.
 * Each reviewer runs ChatGroq with structured output enforced via Zod.
 */
export function createReviewerNode(persona: ReviewerPersona) {
  return async (
    state: {
      proposalBrief: string;
      proposal: Record<string, string>;
    },
    config: RunnableConfig,
  ) => {
    // Emit reviewer-start event
    const writer = config?.configurable?.writer;
    if (writer) {
      writer({
        type: "reviewer-start",
        id: `rs-${persona.id}-${Date.now()}`,
        personaId: persona.id,
        displayName: persona.displayName,
      });
    }

    try {
      const model = new ChatGroq({
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
      });

      const structuredModel = model.withStructuredOutput(ReviewerOutputSchema, {
        name: `${persona.id}_review`,
      });

      const systemPrompt = buildReviewerPrompt(persona);

      const userMessage = `Proposal Brief: ${state.proposalBrief}

Full Proposal:
Title: ${state.proposal.title}
Problem Statement: ${state.proposal.problemStatement}
Proposed Solution: ${state.proposal.proposedSolution}
Tech Choices: ${state.proposal.techChoices}
Constraints: ${state.proposal.constraints}
Out of Scope: ${state.proposal.outOfScope || "N/A"}`;

      const result = (await structuredModel.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(userMessage),
      ])) as ReviewerOutput;

      // Ensure personaId is set
      const output: ReviewerOutput = {
        ...result,
        personaId: persona.id,
      };

      // Emit reviewer-complete event
      if (writer) {
        writer({
          type: "reviewer-complete",
          id: `rc-${persona.id}-${Date.now()}`,
          personaId: persona.id,
          output,
        });
      }

      return {
        reviewerOutputs: { [persona.id]: output },
      };
    } catch (error) {
      console.error(`Reviewer ${persona.id} failed:`, error);

      // Produce a degraded output on failure
      const degradedOutput: ReviewerOutput = {
        personaId: persona.id,
        summary: `The ${persona.displayName} was unable to complete the review due to a technical error.`,
        concerns: [],
        positives: [],
        overallStance: "approve-with-conditions",
        confidence: 0,
      };

      if (writer) {
        writer({
          type: "reviewer-complete",
          id: `rc-${persona.id}-${Date.now()}`,
          personaId: persona.id,
          output: degradedOutput,
        });
      }

      return {
        reviewerOutputs: { [persona.id]: degradedOutput },
      };
    }
  };
}
