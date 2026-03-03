import { arbGraph } from "@/lib/arb/graph";
import { ARBProposalSchema } from "@/lib/arb/types";
import type { ARBProposal } from "@/lib/arb/types";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";

// Allow streaming responses up to 2 minutes for full council review
export const maxDuration = 120;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { proposal, sessionId } = body as {
      proposal: ARBProposal;
      sessionId?: string;
    };

    // Validate proposal schema
    const validatedProposal = ARBProposalSchema.parse(proposal);
    const resolvedSessionId = sessionId || nanoid();

    // Create writable stream for Server-Sent Events
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Helper to write SSE data
    const writeEvent = async (data: unknown) => {
      const payload = `data: ${JSON.stringify(data)}\n\n`;
      await writer.write(encoder.encode(payload));
    };

    // Save initial session to Database
    await prisma.aRBSession.create({
      data: {
        id: resolvedSessionId,
        title: validatedProposal.title,
        proposal: JSON.stringify(validatedProposal),
        adr: null,
      },
    });

    // Run the graph in the background
    const runGraph = async () => {
      try {
        // Send initial session status
        await writeEvent({
          type: "session-status",
          id: `ss-start-${Date.now()}`,
          status: "intake",
          message: "ARB session started. Validating proposal...",
        });

        const result = await arbGraph.invoke(
          {
            proposal: validatedProposal,
            proposalBrief: "",
            reviewerOutputs: {},
            debateRounds: [],
            adr: null,
            sessionId: resolvedSessionId,
            status: "intake",
          },
          {
            configurable: {
              writer: async (event: unknown) => {
                await writeEvent(event);
              },
            },
          },
        );

        // Send final ADR result
        if (result.adr) {
          await writeEvent({
            type: "adr-complete",
            id: `adr-${Date.now()}`,
            adr: result.adr,
          });

          // Update DB with the generated ADR
          await prisma.aRBSession.update({
            where: { id: resolvedSessionId },
            data: { adr: JSON.stringify(result.adr) },
          });
        }

        await writeEvent({
          type: "session-status",
          id: `ss-done-${Date.now()}`,
          status: "complete",
          message: "ARB review session complete.",
        });
      } catch (error) {
        console.error("ARB graph execution error:", error);
        await writeEvent({
          type: "session-status",
          id: `ss-error-${Date.now()}`,
          status: "error",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      } finally {
        await writer.close();
      }
    };

    // Start graph execution without awaiting
    runGraph();

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in ARB review route:", error);
    return new Response(
      JSON.stringify({
        error: "An error occurred while processing your ARB review request.",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
