import type { ReviewerPersona } from "../types";

export const securityPersona: ReviewerPersona = {
  id: "security",
  displayName: "Security Reviewer",
  icon: "🛡️",
  focusAreas: [
    "Threat modeling",
    "Authentication & Authorization",
    "Data protection & encryption",
    "Secrets management",
    "Supply chain security",
    "Compliance (SOC2, GDPR)",
  ],
};

export const scalabilityPersona: ReviewerPersona = {
  id: "scalability",
  displayName: "Scalability Reviewer",
  icon: "📈",
  focusAreas: [
    "Load patterns & horizontal/vertical limits",
    "Bottleneck identification",
    "Statelessness & session management",
    "Caching strategy",
    "Database connection pooling",
    "Single points of failure",
  ],
};

export const costPersona: ReviewerPersona = {
  id: "cost",
  displayName: "Cost & Efficiency Reviewer",
  icon: "💰",
  focusAreas: [
    "Cloud spend & resource utilization",
    "Total Cost of Ownership (TCO)",
    "Over-provisioning risks",
    "Licensing costs",
    "Egress costs",
    "Cost controls & budgets",
  ],
};

export const operabilityPersona: ReviewerPersona = {
  id: "operability",
  displayName: "Operability Reviewer",
  icon: "⚙️",
  focusAreas: [
    "Observability (logs, metrics, traces)",
    "Deployment strategy & CI/CD",
    "Rollback mechanisms",
    "Incident response & runbooks",
    "SLAs & SLOs",
    "Failure mode documentation",
  ],
};

export const domainArchitectPersona: ReviewerPersona = {
  id: "domain-architect",
  displayName: "Domain Architect Reviewer",
  icon: "🏗️",
  focusAreas: [
    "Alignment with existing architecture",
    "Coupling & cohesion analysis",
    "DRY violations",
    "API contract design",
    "Data ownership boundaries",
    "Technical debt assessment",
  ],
};

export const ALL_PERSONAS: ReviewerPersona[] = [
  securityPersona,
  scalabilityPersona,
  costPersona,
  operabilityPersona,
  domainArchitectPersona,
];
