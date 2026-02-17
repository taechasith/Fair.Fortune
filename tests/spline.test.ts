import { describe, expect, test } from "vitest";
import { naturalCubicSplineInterpolation } from "@/lib/math/ageCurve";

describe("spline interpolation", () => {
  test("matches anchor values", () => {
    const anchors = [
      { age: 0, weight: 1 },
      { age: 10, weight: 2 },
      { age: 20, weight: 1.5 }
    ];
    const spline = naturalCubicSplineInterpolation(anchors);
    for (const anchor of anchors) {
      expect(spline(anchor.age)).toBeCloseTo(anchor.weight, 8);
    }
  });
});