import { describe, expect, test } from "vitest";
import { roundLuckySingle } from "@/lib/math/luckyRounding";

describe("lucky rounding", () => {
  test("respects forbidden endings", () => {
    const out = roundLuckySingle(124, { avoidEndings: [4], preferEndings: [8, 9], roundingUnit: 10 });
    expect(Math.abs(Math.trunc(out)) % 10).not.toBe(4);
  });
});