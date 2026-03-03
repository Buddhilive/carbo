"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type {
  ARBProposal,
  ReviewerOutput,
  DebateExchange,
  ADRDocument,
  ARBSessionStatus,
  ARBStreamEvent,
} from "@/lib/arb/types";
import { nanoid } from "nanoid";

type ReviewerStatus = "pending" | "running" | "complete" | "error";

interface UseARBSessionReturn {
  reviewerStatuses: Map<string, ReviewerStatus>;
  reviewerOutputs: Map<string, ReviewerOutput>;
  debateExchanges: DebateExchange[];
  adr: ADRDocument | null;
  sessionStage: ARBSessionStatus;
  sessionId: string;
  statusMessage: string;
  isRunning: boolean;
  error: string | null;
  submitProposal: (proposal: ARBProposal) => Promise<void>;
  loadHistoricalSession: (sessionData: { adr?: ADRDocument | null }) => void;
}

export function useARBSession(): UseARBSessionReturn {
  const [sessionId] = useState(() => nanoid());
  const [reviewerStatuses, setReviewerStatuses] = useState<
    Map<string, ReviewerStatus>
  >(
    () =>
      new Map([
        ["security", "pending"],
        ["scalability", "pending"],
        ["cost", "pending"],
        ["operability", "pending"],
        ["domain-architect", "pending"],
      ]),
  );
  const [reviewerOutputs, setReviewerOutputs] = useState<
    Map<string, ReviewerOutput>
  >(() => new Map());
  const [debateExchanges, setDebateExchanges] = useState<DebateExchange[]>([]);
  const [adr, setAdr] = useState<ADRDocument | null>(null);
  const [sessionStage, setSessionStage] = useState<ARBSessionStatus>("intake");
  const [statusMessage, setStatusMessage] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Process incoming stream events
  const handleEvent = useCallback(
    (event: ARBStreamEvent & { type: string; adr?: ADRDocument }) => {
      switch (event.type) {
        case "reviewer-start":
          if ("personaId" in event) {
            setReviewerStatuses((prev) => {
              const next = new Map(prev);
              next.set(event.personaId, "running");
              return next;
            });
          }
          break;

        case "reviewer-complete":
          if ("personaId" in event && "output" in event) {
            setReviewerStatuses((prev) => {
              const next = new Map(prev);
              next.set(event.personaId, "complete");
              return next;
            });
            setReviewerOutputs((prev) => {
              const next = new Map(prev);
              next.set(event.personaId, event.output as ReviewerOutput);
              return next;
            });
          }
          break;

        case "debate-start":
          setSessionStage("debating");
          break;

        case "debate-exchange":
          if ("personaId" in event && "rebuttal" in event) {
            setDebateExchanges((prev) => [
              ...prev,
              {
                personaId: event.personaId,
                rebuttal: event.rebuttal as string,
              },
            ]);
          }
          break;

        case "chairman-start":
          setSessionStage("synthesizing");
          break;

        case "adr-complete":
          if ("adr" in event && event.adr) {
            setAdr(event.adr);
          }
          break;

        case "session-status":
          if ("status" in event) {
            setSessionStage(event.status as ARBSessionStatus);
            if ("message" in event) {
              setStatusMessage(event.message as string);
            }
          }
          break;
      }
    },
    [],
  );

  const submitProposal = useCallback(
    async (proposal: ARBProposal) => {
      setIsRunning(true);
      setError(null);
      setSessionStage("intake");
      setReviewerStatuses(
        new Map([
          ["security", "pending"],
          ["scalability", "pending"],
          ["cost", "pending"],
          ["operability", "pending"],
          ["domain-architect", "pending"],
        ]),
      );
      setReviewerOutputs(new Map());
      setDebateExchanges([]);
      setAdr(null);

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/arb/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ proposal, sessionId }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                handleEvent(data);
              } catch {
                // Ignore parse errors for non-JSON lines
              }
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        const message =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(message);
        setSessionStage("error");
      } finally {
        setIsRunning(false);
      }
    },
    [sessionId, handleEvent],
  );

  const loadHistoricalSession = useCallback(
    (sessionData: { adr?: ADRDocument | null }) => {
      if (sessionData.adr) {
        setAdr(sessionData.adr);
        setSessionStage("complete");
        setReviewerStatuses(
          new Map([
            ["security", "complete"],
            ["scalability", "complete"],
            ["cost", "complete"],
            ["operability", "complete"],
            ["domain-architect", "complete"],
          ]),
        );
      } else {
        setSessionStage("intake");
      }
    },
    [],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    reviewerStatuses,
    reviewerOutputs,
    debateExchanges,
    adr,
    sessionStage,
    sessionId,
    statusMessage,
    isRunning,
    error,
    submitProposal,
    loadHistoricalSession,
  };
}
