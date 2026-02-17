import { IterationPoint, LinearSolveResult } from "../types";
import { cloneMatrix, isDiagonallyDominant, l2Norm, linfNorm, matVecMul, subVec } from "./linearAlgebra";

export function gaussianEliminationPartialPivoting(a: number[][], b: number[]): LinearSolveResult {
  const n = a.length;
  const m = cloneMatrix(a);
  const rhs = [...b];

  for (let k = 0; k < n - 1; k += 1) {
    let pivot = k;
    let maxAbs = Math.abs(m[k][k]);
    for (let i = k + 1; i < n; i += 1) {
      const cand = Math.abs(m[i][k]);
      if (cand > maxAbs) {
        maxAbs = cand;
        pivot = i;
      }
    }

    if (maxAbs < 1e-12) {
      return {
        x: Array.from({ length: n }, () => 0),
        iterations: 0,
        converged: false,
        residual: [],
        l2Residual: Number.POSITIVE_INFINITY,
        linfResidual: Number.POSITIVE_INFINITY,
        history: [],
        warning: "Matrix is singular or nearly singular."
      };
    }

    if (pivot !== k) {
      [m[k], m[pivot]] = [m[pivot], m[k]];
      [rhs[k], rhs[pivot]] = [rhs[pivot], rhs[k]];
    }

    for (let i = k + 1; i < n; i += 1) {
      const factor = m[i][k] / m[k][k];
      m[i][k] = 0;
      for (let j = k + 1; j < n; j += 1) {
        m[i][j] -= factor * m[k][j];
      }
      rhs[i] -= factor * rhs[k];
    }
  }

  const x = Array.from({ length: n }, () => 0);
  for (let i = n - 1; i >= 0; i -= 1) {
    let sum = rhs[i];
    for (let j = i + 1; j < n; j += 1) {
      sum -= m[i][j] * x[j];
    }
    x[i] = sum / m[i][i];
  }

  const residual = subVec(matVecMul(a, x), b);
  const l2 = l2Norm(residual);
  const linf = linfNorm(residual);

  return {
    x,
    iterations: 1,
    converged: true,
    residual,
    l2Residual: l2,
    linfResidual: linf,
    history: [{ iteration: 1, l2Residual: l2, linfResidual: linf }]
  };
}

interface IterativeOptions {
  maxIter?: number;
  tol?: number;
}

export function jacobiSolver(a: number[][], b: number[], opts: IterativeOptions = {}): LinearSolveResult {
  const n = a.length;
  const maxIter = opts.maxIter ?? 200;
  const tol = opts.tol ?? 1e-8;
  let x = Array.from({ length: n }, () => 0);
  let next = [...x];
  const history: IterationPoint[] = [];

  for (let iter = 1; iter <= maxIter; iter += 1) {
    for (let i = 0; i < n; i += 1) {
      let sigma = 0;
      for (let j = 0; j < n; j += 1) {
        if (j !== i) sigma += a[i][j] * x[j];
      }
      next[i] = (b[i] - sigma) / a[i][i];
    }

    const residual = subVec(matVecMul(a, next), b);
    const l2 = l2Norm(residual);
    const linf = linfNorm(residual);
    history.push({ iteration: iter, l2Residual: l2, linfResidual: linf });

    if (linf < tol) {
      return {
        x: [...next],
        iterations: iter,
        converged: true,
        residual,
        l2Residual: l2,
        linfResidual: linf,
        history,
        warning: isDiagonallyDominant(a) ? undefined : "Converged without diagonal dominance guarantee."
      };
    }

    x = [...next];
  }

  const residual = subVec(matVecMul(a, x), b);
  return {
    x,
    iterations: maxIter,
    converged: false,
    residual,
    l2Residual: l2Norm(residual),
    linfResidual: linfNorm(residual),
    history,
    warning: "Jacobi did not converge within max iterations."
  };
}

export function gaussSeidelSolver(
  a: number[][],
  b: number[],
  opts: IterativeOptions = {}
): LinearSolveResult {
  const n = a.length;
  const maxIter = opts.maxIter ?? 200;
  const tol = opts.tol ?? 1e-8;
  const x = Array.from({ length: n }, () => 0);
  const history: IterationPoint[] = [];

  for (let iter = 1; iter <= maxIter; iter += 1) {
    for (let i = 0; i < n; i += 1) {
      let sigma = 0;
      for (let j = 0; j < n; j += 1) {
        if (j !== i) sigma += a[i][j] * x[j];
      }
      x[i] = (b[i] - sigma) / a[i][i];
    }

    const residual = subVec(matVecMul(a, x), b);
    const l2 = l2Norm(residual);
    const linf = linfNorm(residual);
    history.push({ iteration: iter, l2Residual: l2, linfResidual: linf });

    if (linf < tol) {
      return {
        x: [...x],
        iterations: iter,
        converged: true,
        residual,
        l2Residual: l2,
        linfResidual: linf,
        history,
        warning: isDiagonallyDominant(a) ? undefined : "Converged without diagonal dominance guarantee."
      };
    }
  }

  const residual = subVec(matVecMul(a, x), b);
  return {
    x: [...x],
    iterations: maxIter,
    converged: false,
    residual,
    l2Residual: l2Norm(residual),
    linfResidual: linfNorm(residual),
    history,
    warning: "Gauss-Seidel did not converge within max iterations."
  };
}