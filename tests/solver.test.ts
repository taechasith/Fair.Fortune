import { describe, expect, test } from "vitest";
import { gaussianEliminationPartialPivoting } from "@/lib/math/solvers";

describe("gaussian elimination", () => {
  test("produces small residual on known system", () => {
    const A = [
      [3, 2, -1],
      [2, -2, 4],
      [-1, 0.5, -1]
    ];
    const b = [1, -2, 0];

    const result = gaussianEliminationPartialPivoting(A, b);
    expect(result.linfResidual).toBeLessThan(1e-8);
  });
});