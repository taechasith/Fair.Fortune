export function dot(a: number[], b: number[]): number {
  return a.reduce((acc, v, i) => acc + v * b[i], 0);
}

export function matVecMul(a: number[][], x: number[]): number[] {
  return a.map((row) => dot(row, x));
}

export function subVec(a: number[], b: number[]): number[] {
  return a.map((v, i) => v - b[i]);
}

export function l2Norm(v: number[]): number {
  return Math.sqrt(v.reduce((acc, x) => acc + x * x, 0));
}

export function linfNorm(v: number[]): number {
  return v.reduce((acc, x) => Math.max(acc, Math.abs(x)), 0);
}

export function cloneMatrix(a: number[][]): number[][] {
  return a.map((row) => [...row]);
}

export function isDiagonallyDominant(a: number[][]): boolean {
  return a.every((row, i) => {
    const diag = Math.abs(row[i]);
    const offDiag = row.reduce((sum, v, j) => (j === i ? sum : sum + Math.abs(v)), 0);
    return diag >= offDiag;
  });
}