"use client";

interface VerdictBadgeProps {
  verdict:
    | "approve"
    | "approve-with-conditions"
    | "reject"
    | "approved"
    | "approved-with-conditions"
    | "rejected";
}

export function VerdictBadge({ verdict }: VerdictBadgeProps) {
  const config: Record<string, { label: string; className: string }> = {
    approve: {
      label: "APPROVE",
      className:
        "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
    },
    approved: {
      label: "APPROVED",
      className:
        "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
    },
    "approve-with-conditions": {
      label: "CONDITIONS",
      className:
        "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    },
    "approved-with-conditions": {
      label: "CONDITIONS",
      className:
        "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    },
    reject: {
      label: "REJECT",
      className:
        "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
    },
    rejected: {
      label: "REJECTED",
      className:
        "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
    },
  };

  const { label, className } = config[verdict] || config.approve;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${className}`}
    >
      {label}
    </span>
  );
}
