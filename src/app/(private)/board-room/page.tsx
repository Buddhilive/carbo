"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProposalForm } from "@/components/arb/ProposalForm";
import type { ARBProposal } from "@/lib/arb/types";
import { nanoid } from "nanoid";

export default function BoardRoomPage() {
  const router = useRouter();

  const handleSubmit = useCallback(
    (proposal: ARBProposal) => {
      const sessionId = nanoid();
      // Store proposal in sessionStorage for the session page to pick up
      sessionStorage.setItem(
        `arb-proposal-${sessionId}`,
        JSON.stringify(proposal),
      );
      router.push(`/board-room/${sessionId}`);
    },
    [router],
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          🏛️ Architecture Review Board
        </h1>
        <p className="text-muted-foreground">
          Submit your architecture proposal for a multi-perspective AI review.
          Five specialized reviewers will independently analyze, debate, and
          produce a formal Architectural Decision Record (ADR).
        </p>
      </div>

      <ProposalForm onSubmit={handleSubmit} />
    </div>
  );
}
