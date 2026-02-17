import { describe, expect, test } from "vitest";
import { correctBudgetAfterRounding } from "@/lib/math/rootFinding";

describe("bisection root finding", () => {
  test("finds near-zero budget difference when bracket exists", () => {
    const result = correctBudgetAfterRounding({
      budget: 300,
      baseContinuous: [120, 90, 90],
      recipients: [
        { id: "a", name: "A", age: 10, roleFactor: 1, preset: "child" },
        { id: "b", name: "B", age: 20, roleFactor: 1, preset: "adult" },
        { id: "c", name: "C", age: 30, roleFactor: 1, preset: "adult" }
      ],
      roundingRules: { avoidEndings: [4], preferEndings: [8, 9], roundingUnit: 10 },
      method: "bisection"
    });

    expect(Math.abs(result.diff)).toBeLessThanOrEqual(30);
  });
});