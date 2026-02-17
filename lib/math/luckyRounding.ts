import { Recipient } from "../types";
import { clamp } from "../utils";

export interface LuckyRoundingRules {
  avoidEndings: number[];
  preferEndings: number[];
  roundingUnit: 10 | 100;
}

function ending(value: number): number {
  return Math.abs(Math.trunc(value)) % 10;
}

function nearestUnit(value: number, unit: number): number {
  return Math.round(value / unit) * unit;
}

function candidatesAround(base: number, unit: number, span = 4): number[] {
  const out: number[] = [];
  for (let k = -span; k <= span; k += 1) {
    out.push(base + k * unit);
  }
  return out;
}

export function roundLuckySingle(
  value: number,
  rules: LuckyRoundingRules,
  bounds?: { min?: number; max?: number }
): number {
  const min = bounds?.min ?? 0;
  const max = bounds?.max ?? Number.POSITIVE_INFINITY;
  const unit = rules.roundingUnit;

  let current = clamp(nearestUnit(value, unit), min, max);

  if (rules.avoidEndings.includes(ending(current))) {
    const up = clamp(current + unit, min, max);
    const down = clamp(current - unit, min, max);
    const upBad = rules.avoidEndings.includes(ending(up));
    const downBad = rules.avoidEndings.includes(ending(down));

    if (!upBad && !downBad) {
      current = Math.abs(up - value) <= Math.abs(down - value) ? up : down;
    } else if (!upBad) {
      current = up;
    } else if (!downBad) {
      current = down;
    }
  }

  if (rules.preferEndings.length > 0) {
    const options = candidatesAround(current, unit)
      .map((x) => clamp(x, min, max))
      .filter((x, idx, arr) => arr.indexOf(x) === idx)
      .filter((x) => !rules.avoidEndings.includes(ending(x)));

    const preferred = options.filter((x) => rules.preferEndings.includes(ending(x)));
    if (preferred.length > 0) {
      preferred.sort((a, b) => Math.abs(a - value) - Math.abs(b - value));
      current = preferred[0];
    }
  }

  current = clamp(current, min, max);
  if (rules.avoidEndings.includes(ending(current))) {
    const options = candidatesAround(current, unit)
      .map((x) => clamp(x, min, max))
      .filter((x) => !rules.avoidEndings.includes(ending(x)));
    if (options.length > 0) {
      options.sort((a, b) => Math.abs(a - value) - Math.abs(b - value));
      current = options[0];
    }
  }

  return Math.max(0, current);
}

export function roundLuckyVector(
  values: number[],
  recipients: Recipient[],
  rules: LuckyRoundingRules
): number[] {
  return values.map((v, i) =>
    roundLuckySingle(v, rules, { min: recipients[i].min, max: recipients[i].max })
  );
}