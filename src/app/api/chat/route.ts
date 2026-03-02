import { streamText, UIMessage, convertToModelMessages } from "ai";
import { groq } from "@ai-sdk/groq";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const {
      messages,
      model,
      webSearch,
    }: {
      messages: UIMessage[];
      model: string;
      webSearch: boolean;
    } = await req.json();

    const result = streamText({
      // We don't have perplexity provider set up, dropping webSearch for now
      // and just using groq provider
      model: groq(model),
      messages: await convertToModelMessages(messages),
      system:
        "You are a helpful assistant that can answer questions and help with tasks",
    });

    // send sources and reasoning back to the client
    return result.toUIMessageStreamResponse({
      sendSources: true,
      sendReasoning: true,
    });
  } catch (error) {
    console.error("Error in chat route:", error);
    return new Response(
      JSON.stringify({
        error: "An error occurred while processing your request.",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
