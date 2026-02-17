import { LabResult, LinearSolverName } from "../types";
import { isDiagonallyDominant } from "./linearAlgebra";
import {
  gaussSeidelSolver,
  gaussianEliminationPartialPivoting,
  jacobiSolver
} from "./solvers";

export function buildLabSystem(proportions: number[], budget: number): { A: number[][]; b: number[] } {
  const n = proportions.length;
  const A = Array.from({ length: n }, () => Array.from({ length: n }, () => 0));
  const b = Array.from({ length: n }, () => 0);

  const pn = proportions[n - 1] <= 1e-12 ? 1e-12 : proportions[n - 1];
  for (let i = 0; i < n - 1; i += 1) {
    A[i][i] = 1;
    A[i][n - 1] = -(proportions[i] / pn);
    b[i] = 0;
  }

  for (let j = 0; j < n; j += 1) {
    A[n - 1][j] = 1;
  }
  b[n - 1] = budget;

  return { A, b };
}

export function runLabSolvers(proportions: number[], budget: number): LabResult {
  const { A, b } = buildLabSystem(proportions, budget);
  const results: Record<LinearSolverName, ReturnType<typeof gaussianEliminationPartialPivoting>> = {
    gaussian: gaussianEliminationPartialPivoting(A, b),
    jacobi: jacobiSolver(A, b),
    gaussSeidel: gaussSeidelSolver(A, b)
  };

  const dd = isDiagonallyDominant(A);
  if (!dd) {
    results.jacobi.warning =
      results.jacobi.warning ?? "Matrix is not diagonally dominant; Jacobi may diverge.";
    results.gaussSeidel.warning =
      results.gaussSeidel.warning ?? "Matrix is not diagonally dominant; Gauss-Seidel may diverge.";
  }

  return {
    matrixA: A,
    vectorB: b,
    results,
    diagonalDominance: dd
  };
}