import { Recipient } from "../types";
import { clamp } from "../utils";

export interface TargetWeight {
  recipientId: string;
  name: string;
  rawWeight: number;
  blendedWeight: number;
  proportion: number;
}

export interface BoundedAllocation {
  values: number[];
  warnings: string[];
}

export function buildTargetWeights(
  recipients: Recipient[],
  lambda: number,
  ageWeightFn: (age: number) => number
): TargetWeight[] {
  const blended = recipients.map((r) => {
    const rawWeight = ageWeightFn(r.age) * r.roleFactor;
    const blendedWeight = (1 - lambda) * 1 + lambda * rawWeight;
    return {
      recipientId: r.id,
      name: r.name,
      rawWeight,
      blendedWeight: Math.max(blendedWeight, 1e-12),
      proportion: 0
    };
  });

  const total = blended.reduce((sum, x) => sum + x.blendedWeight, 0);
  return blended.map((x) => ({ ...x, proportion: x.blendedWeight / total }));
}

export function continuousAllocationFromProportions(budget: number, p: number[]): number[] {
  return p.map((pi) => budget * pi);
}

export function applyBounds(
  baseline: number[],
  recipients: Recipient[],
  budget: number,
  proportions: number[],
  maxIterations = 50
): BoundedAllocation {
  const n = baseline.length;
  const values = [...baseline];
  const clamped = Array.from({ length: n }, () => false);
  const warnings: string[] = [];

  for (let iter = 0; iter < maxIterations; iter += 1) {
    let changed = false;

    for (let i = 0; i < n; i += 1) {
      const min = recipients[i].min ?? 0;
      const max = recipients[i].max ?? Number.POSITIVE_INFINITY;
      const next = clamp(values[i], min, max);
      if (Math.abs(next - values[i]) > 1e-9) {
        values[i] = next;
        clamped[i] = true;
        changed = true;
      }
    }

    const used = values.reduce((sum, x) => sum + x, 0);
    const residual = budget - used;
    if (Math.abs(residual) <= 1e-8 && !changed) {
      return { values, warnings };
    }

    const freeIndices = Array.from({ length: n }, (_, i) => i).filter((i) => !clamped[i]);
    if (freeIndices.length === 0) {
      warnings.push("All allocations are clamped by bounds; exact budget may be infeasible.");
      return { values, warnings };
    }

    const freeWeightSum = freeIndices.reduce((sum, i) => sum + proportions[i], 0);
    if (freeWeightSum <= 1e-12) {
      warnings.push("Redistribution stalled because free proportional weight is near zero.");
      return { values, warnings };
    }

    for (const idx of freeIndices) {
      values[idx] += (residual * proportions[idx]) / freeWeightSum;
    }
  }

  warnings.push("Bound adjustment reached max iterations; returning stable best effort.");
  return { values, warnings };
}