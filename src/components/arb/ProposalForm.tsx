"use client";

import { useState, useCallback } from "react";
import type { ARBProposal } from "@/lib/arb/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ShieldCheck,
  Zap,
  DollarSign,
  Settings2,
  Building2,
} from "lucide-react";

interface ProposalFormProps {
  onSubmit: (proposal: ARBProposal) => void;
  isSubmitting?: boolean;
}

export function ProposalForm({ onSubmit, isSubmitting }: ProposalFormProps) {
  const [formData, setFormData] = useState<ARBProposal>({
    title: "",
    problemStatement: "",
    proposedSolution: "",
    techChoices: "",
    constraints: "",
    outOfScope: "",
  });

  const handleChange = useCallback(
    (field: keyof ARBProposal) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      },
    [],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    },
    [formData, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* How it works section */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-8">
        {[
          { icon: ShieldCheck, label: "Security", color: "text-red-500" },
          { icon: Zap, label: "Scalability", color: "text-yellow-500" },
          { icon: DollarSign, label: "Cost", color: "text-green-500" },
          { icon: Settings2, label: "Operability", color: "text-blue-500" },
          { icon: Building2, label: "Architecture", color: "text-purple-500" },
        ].map(({ icon: Icon, label, color }) => (
          <Card key={label} className="text-center border-dashed bg-muted/30">
            <CardContent className="pt-4 pb-3 px-3">
              <Icon className={`mx-auto mb-1 h-5 w-5 ${color}`} />
              <p className="text-xs font-medium">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Architecture Proposal</CardTitle>
          <CardDescription>
            Submit your architecture proposal for review by the AI council. Five
            specialized reviewers will evaluate it independently, debate, and
            produce a formal ADR.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Proposal Title</Label>
            <Input
              id="title"
              placeholder="e.g., Migrate auth service to OAuth 2.1 with PKCE"
              value={formData.title}
              onChange={handleChange("title")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="problemStatement">Problem Statement</Label>
            <Textarea
              id="problemStatement"
              placeholder="What problem does this proposal solve? Why is the current state insufficient?"
              value={formData.problemStatement}
              onChange={handleChange("problemStatement")}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proposedSolution">Proposed Solution</Label>
            <Textarea
              id="proposedSolution"
              placeholder="Describe the proposed architecture, components, and how they interact..."
              value={formData.proposedSolution}
              onChange={handleChange("proposedSolution")}
              rows={5}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="techChoices">Technology Choices</Label>
              <Textarea
                id="techChoices"
                placeholder="e.g., Next.js, PostgreSQL, Redis, AWS Lambda, Kafka..."
                value={formData.techChoices}
                onChange={handleChange("techChoices")}
                rows={2}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="constraints">Constraints</Label>
              <Textarea
                id="constraints"
                placeholder="Budget, timeline, compliance requirements, team expertise..."
                value={formData.constraints}
                onChange={handleChange("constraints")}
                rows={2}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="outOfScope">Out of Scope (optional)</Label>
            <Textarea
              id="outOfScope"
              placeholder="What is explicitly NOT part of this proposal?"
              value={formData.outOfScope}
              onChange={handleChange("outOfScope")}
              rows={2}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={
              isSubmitting ||
              !formData.title ||
              !formData.problemStatement ||
              !formData.proposedSolution
            }
          >
            {isSubmitting ? "Submitting..." : "Submit for ARB Review"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
