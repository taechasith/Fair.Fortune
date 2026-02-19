"use client";

import { AllocationResult } from "@/lib/types";
import { formatMoney } from "@/lib/utils";
import { Alert } from "./ui/alert";

function friendlyWarning(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("exact") || lower.includes("residual")) {
    return "We could not match the budget perfectly, so we chose the closest stable result.";
  }
  if (lower.includes("bound")) {
    return "Some minimum or maximum limits made this setup harder to satisfy perfectly.";
  }
  if (lower.includes("singular") || lower.includes("diverge")) {
    return "This setup could not find a stable result right away. Please try slightly different settings.";
  }
  return "One setting was unstable, so we used the safest result.";
}

export function ResultsPanel({ result, budget }: { result?: AllocationResult; budget: number }) {
  if (!result) {
    return <Alert>No result yet. Click Calculate to see gift amounts.</Alert>;
  }

  return (
    <div className="space-y-3">
      <div className="cny-plaque rounded-xl p-3">
        <div>Total prepared: {formatMoney(result.totalRounded)}</div>
        <div>Your budget: {formatMoney(budget)}</div>
        <div>
          Difference: {formatMoney(result.diffFromBudget)} ({result.exactBudgetMatched ? "perfect match" : "closest match"})
        </div>
      </div>
      <div className="space-y-2">
        {result.allocations.map((a) => (
          <div key={a.recipientId} className="cny-plaque rounded-xl p-3">
            <div className="font-medium">{a.name}</div>
            <div className="text-lg font-semibold text-[#C8102E]">🧧 {formatMoney(a.rounded)}</div>
            <div className="text-sm text-[#5f5148]">{a.explanation}</div>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-[#7A0C1B]">See detailed numbers</summary>
              <div className="mt-1 text-xs text-[#5f5148]">
                Planned amount before rounding: {formatMoney(a.continuous)}
              </div>
            </details>
          </div>
        ))}
      </div>
      {result.warnings.messages.length > 0 && (
        <Alert className="border-warning text-warning">
          {Array.from(new Set(result.warnings.messages.map((w) => friendlyWarning(w)))).map((w) => (
            <div key={w} className="overflow-x-auto whitespace-nowrap">
              {w}
            </div>
          ))}
        </Alert>
      )}
    </div>
  );
}
