import { ChatGroq } from "@langchain/groq";
import type { RunnableConfig } from "@langchain/core/runnables";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { ReviewerOutput, DebateExchange, ADRDocument } from "../types";
import { ADRDocumentSchema } from "../types";
import { buildChairmanPrompt } from "../prompts";

/**
 * Chairman synthesis node.
 * Receives all reviewer outputs + debate exchanges and produces the final ADR.
 */
export async function chairmanNode(
  state: {
    reviewerOutputs: Record<string, ReviewerOutput>;
    debateRounds: DebateExchange[];
    sessionId: string;
    proposal: Record<string, string>;
  },
  config: RunnableConfig,
) {
  const writer = config?.configurable?.writer;

  if (writer) {
    writer({
      type: "chairman-start",
      id: `cs-${Date.now()}`,
    });
  }

  const model = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    temperature: 0.5,
  });

  const structuredModel = model.withStructuredOutput(ADRDocumentSchema, {
    name: "adr_synthesis",
  });

  const systemPrompt = buildChairmanPrompt(state.sessionId);

  // Build the context for the chairman
  const reviewSummaries = Object.entries(state.reviewerOutputs)
    .map(
      ([personaId, output]) =>
        `--- ${personaId.toUpperCase()} REVIEW ---
Summary: ${output.summary}
Stance: ${output.overallStance} (confidence: ${output.confidence})
Concerns:
${output.concerns.map((c) => `  [${c.severity.toUpperCase()}] ${c.title}: ${c.description}\n  Recommendation: ${c.recommendation}`).join("\n")}
Positives: ${output.positives.join("; ")}
`,
    )
    .join("\n");

  const debateSummary =
    state.debateRounds.length > 0
      ? state.debateRounds
          .map((ex) => `${ex.personaId.toUpperCase()}: ${ex.rebuttal}`)
          .join("\n")
      : "No debate round occurred.";

  const userMessage = `PROPOSAL UNDER REVIEW:
Title: ${state.proposal.title}
Problem: ${state.proposal.problemStatement}
Solution: ${state.proposal.proposedSolution}

INDIVIDUAL REVIEWS:
${reviewSummaries}

DEBATE ROUND:
${debateSummary}

Please synthesize these into a complete ADR.`;

  try {
    const adr = (await structuredModel.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userMessage),
    ])) as ADRDocument;

    if (writer) {
      writer({
        type: "session-status",
        id: `ss-complete-${Date.now()}`,
        status: "complete",
        message: `ARB review complete. Verdict: ${adr.verdict}`,
      });
    }

    return {
      adr,
      status: "complete" as const,
    };
  } catch (error) {
    console.error("Chairman synthesis failed:", error);

    if (writer) {
      writer({
        type: "session-status",
        id: `ss-error-${Date.now()}`,
        status: "error",
        message: "Chairman synthesis failed. Please retry the review.",
      });
    }

    return {
      adr: null,
      status: "error" as const,
    };
  }
}
