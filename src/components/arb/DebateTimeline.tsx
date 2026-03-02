"use client";

import type { DebateExchange } from "@/lib/arb/types";
import { ALL_PERSONAS } from "@/lib/arb/personas";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DebateTimelineProps {
  exchanges: DebateExchange[];
}

export function DebateTimeline({ exchanges }: DebateTimelineProps) {
  if (exchanges.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground text-sm">
          Debate round has not started yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Debate Round</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {exchanges.map((exchange, idx) => {
          const persona = ALL_PERSONAS.find((p) => p.id === exchange.personaId);
          return (
            <Message from="assistant" key={idx}>
              <MessageContent>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold">
                    {persona?.icon} {persona?.displayName || exchange.personaId}
                  </span>
                </div>
                <MessageResponse>{exchange.rebuttal}</MessageResponse>
              </MessageContent>
            </Message>
          );
        })}
      </CardContent>
    </Card>
  );
}
