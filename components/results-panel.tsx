"use client";

import { AllocationResult } from "@/lib/types";
import { formatMoney } from "@/lib/utils";
import { Alert } from "./ui/alert";

export function ResultsPanel({ result, budget }: { result?: AllocationResult; budget: number }) {
  if (!result) {
    return <Alert>No allocation run yet.</Alert>;
  }

  return (
    <div className="space-y-3">
      <div className="cny-plaque rounded-xl p-3">
        <div>Total rounded: {formatMoney(result.totalRounded)}</div>
        <div>Budget: {formatMoney(budget)}</div>
        <div>
          Difference: {formatMoney(result.diffFromBudget)} ({result.exactBudgetMatched ? "exact" : "best effort"})
        </div>
        <div>Alpha*: {result.alpha.toFixed(4)}</div>
      </div>
      <div className="space-y-2">
        {result.allocations.map((a) => (
          <div key={a.recipientId} className="cny-plaque rounded-xl p-3">
            <div className="font-medium">{a.name}</div>
            <div className="text-sm">Continuous: {formatMoney(a.continuous)}</div>
            <div className="text-sm">Final: {formatMoney(a.rounded)}</div>
            <div className="text-sm text-muted-foreground">{a.explanation}</div>
          </div>
        ))}
      </div>
      {result.warnings.messages.length > 0 && (
        <Alert className="border-warning text-warning">
          {result.warnings.messages.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </Alert>
      )}
    </div>
  );
}
