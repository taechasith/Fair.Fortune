import { Recipient, RootMethod } from "../types";
import { roundLuckyVector } from "./luckyRounding";

interface CorrectionParams {
  budget: number;
  baseContinuous: number[];
  recipients: Recipient[];
  roundingRules: {
    avoidEndings: number[];
    preferEndings: number[];
    roundingUnit: 10 | 100;
  };
  method: RootMethod;
  eps?: number;
  maxIter?: number;
}

export interface CorrectionResult {
  alpha: number;
  rounded: number[];
  diff: number;
  exact: boolean;
  warning?: string;
}

function evalF(alpha: number, params: CorrectionParams): { f: number; rounded: number[] } {
  const scaled = params.baseContinuous.map((x) => alpha * x);
  const rounded = roundLuckyVector(scaled, params.recipients, params.roundingRules);
  const total = rounded.reduce((sum, x) => sum + x, 0);
  return { f: total - params.budget, rounded };
}

function bracketRoot(params: CorrectionParams): { a: number; b: number } | null {
  const a = 0;
  let b = 2;
  const fa = evalF(a, params).f;
  let fb = evalF(b, params).f;

  for (let i = 0; i < 30 && fa * fb > 0; i += 1) {
    b *= 2;
    fb = evalF(b, params).f;
    if (Math.abs(fb) < 1e-9) return { a: b, b };
  }

  if (fa * fb > 0) return null;
  return { a, b };
}

function solveBisection(params: CorrectionParams): CorrectionResult {
  const eps = params.eps ?? 1e-6;
  const maxIter = params.maxIter ?? 80;
  const bracket = bracketRoot(params);
  if (!bracket) {
    return bestEffort(params, "Bisection could not find a sign-changing bracket.");
  }

  let { a, b } = bracket;
  let best = evalF((a + b) / 2, params);
  let bestAlpha = (a + b) / 2;

  for (let i = 0; i < maxIter; i += 1) {
    const mid = (a + b) / 2;
    const em = evalF(mid, params);
    const ea = evalF(a, params);

    if (Math.abs(em.f) < Math.abs(best.f)) {
      best = em;
      bestAlpha = mid;
    }

    if (Math.abs(b - a) < eps || Math.abs(em.f) < 1e-9) {
      return {
        alpha: mid,
        rounded: em.rounded,
        diff: em.f,
        exact: Math.abs(em.f) < 1e-9
      };
    }

    if (ea.f * em.f <= 0) {
      b = mid;
    } else {
      a = mid;
    }
  }

  return {
    alpha: bestAlpha,
    rounded: best.rounded,
    diff: best.f,
    exact: Math.abs(best.f) < 1e-9,
    warning: "Bisection reached max iterations; returning best effort."
  };
}

function solveNewton(params: CorrectionParams): CorrectionResult {
  const eps = params.eps ?? 1e-6;
  const maxIter = params.maxIter ?? 20;
  const h = 1e-4;
  let alpha = 1;
  let best = evalF(alpha, params);
  let bestAlpha = alpha;

  for (let i = 0; i < maxIter; i += 1) {
    const fx = evalF(alpha, params);
    if (Math.abs(fx.f) < Math.abs(best.f)) {
      best = fx;
      bestAlpha = alpha;
    }
    if (Math.abs(fx.f) < 1e-9) {
      return { alpha, rounded: fx.rounded, diff: fx.f, exact: true };
    }

    const fp = evalF(alpha + h, params).f;
    const fm = evalF(Math.max(0, alpha - h), params).f;
    const derivative = (fp - fm) / (2 * h);

    if (!Number.isFinite(derivative) || Math.abs(derivative) < eps) {
      const fallback = solveBisection(params);
      fallback.warning = "Newton derivative too small; fallback to bisection.";
      return fallback;
    }

    const next = alpha - fx.f / derivative;
    if (!Number.isFinite(next) || next < 0 || next > 1e6) {
      const fallback = solveBisection(params);
      fallback.warning = "Newton diverged; fallback to bisection.";
      return fallback;
    }

    if (Math.abs(next - alpha) < eps) {
      const ex = evalF(next, params);
      return {
        alpha: next,
        rounded: ex.rounded,
        diff: ex.f,
        exact: Math.abs(ex.f) < 1e-9
      };
    }

    alpha = next;
  }

  return {
    alpha: bestAlpha,
    rounded: best.rounded,
    diff: best.f,
    exact: Math.abs(best.f) < 1e-9,
    warning: "Newton reached max iterations; returning best effort."
  };
}

function bestEffort(params: CorrectionParams, warning: string): CorrectionResult {
  const samples = [0.5, 0.8, 1, 1.2, 1.5, 2];
  let bestAlpha = 1;
  let best = evalF(1, params);

  for (const alpha of samples) {
    const current = evalF(alpha, params);
    if (Math.abs(current.f) < Math.abs(best.f)) {
      best = current;
      bestAlpha = alpha;
    }
  }

  return {
    alpha: bestAlpha,
    rounded: best.rounded,
    diff: best.f,
    exact: Math.abs(best.f) < 1e-9,
    warning
  };
}

export function correctBudgetAfterRounding(params: CorrectionParams): CorrectionResult {
  if (params.method === "bisection") {
    return solveBisection(params);
  }

  const newton = solveNewton(params);
  if (!newton.exact && Math.abs(newton.diff) > params.roundingRules.roundingUnit) {
    const bis = solveBisection(params);
    if (Math.abs(bis.diff) < Math.abs(newton.diff)) {
      return bis;
    }
  }
  return newton;
}
