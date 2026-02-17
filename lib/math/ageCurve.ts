import { AnchorPoint } from "../types";

export interface AgeCurve {
  ageWeight: (age: number) => number;
}

function sortedAnchors(anchors: AnchorPoint[]): AnchorPoint[] {
  return [...anchors].sort((a, b) => a.age - b.age);
}

export function piecewiseLinearInterpolation(anchors: AnchorPoint[]): (x: number) => number {
  const pts = sortedAnchors(anchors);
  return (x: number) => {
    if (x <= pts[0].age) return pts[0].weight;
    if (x >= pts[pts.length - 1].age) return pts[pts.length - 1].weight;

    for (let i = 0; i < pts.length - 1; i += 1) {
      const left = pts[i];
      const right = pts[i + 1];
      if (x >= left.age && x <= right.age) {
        const t = (x - left.age) / (right.age - left.age);
        return left.weight + t * (right.weight - left.weight);
      }
    }
    return pts[pts.length - 1].weight;
  };
}

export function naturalCubicSplineInterpolation(anchors: AnchorPoint[]): (x: number) => number {
  const pts = sortedAnchors(anchors);
  const n = pts.length;
  if (n < 3) {
    return piecewiseLinearInterpolation(pts);
  }

  const xs = pts.map((p) => p.age);
  const ys = pts.map((p) => p.weight);
  const h = Array.from({ length: n - 1 }, (_, i) => xs[i + 1] - xs[i]);
  const alpha = Array.from({ length: n }, () => 0);

  for (let i = 1; i < n - 1; i += 1) {
    alpha[i] = (3 / h[i]) * (ys[i + 1] - ys[i]) - (3 / h[i - 1]) * (ys[i] - ys[i - 1]);
  }

  const l = Array.from({ length: n }, () => 0);
  const mu = Array.from({ length: n }, () => 0);
  const z = Array.from({ length: n }, () => 0);
  const c = Array.from({ length: n }, () => 0);
  const b = Array.from({ length: n - 1 }, () => 0);
  const d = Array.from({ length: n - 1 }, () => 0);

  l[0] = 1;
  mu[0] = 0;
  z[0] = 0;

  for (let i = 1; i < n - 1; i += 1) {
    l[i] = 2 * (xs[i + 1] - xs[i - 1]) - h[i - 1] * mu[i - 1];
    mu[i] = h[i] / l[i];
    z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i];
  }

  l[n - 1] = 1;
  z[n - 1] = 0;
  c[n - 1] = 0;

  for (let j = n - 2; j >= 0; j -= 1) {
    c[j] = z[j] - mu[j] * c[j + 1];
    b[j] = (ys[j + 1] - ys[j]) / h[j] - (h[j] * (c[j + 1] + 2 * c[j])) / 3;
    d[j] = (c[j + 1] - c[j]) / (3 * h[j]);
  }

  return (x: number) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];

    let i = 0;
    for (let j = 0; j < n - 1; j += 1) {
      if (x >= xs[j] && x <= xs[j + 1]) {
        i = j;
        break;
      }
    }

    const dx = x - xs[i];
    return ys[i] + b[i] * dx + c[i] * dx * dx + d[i] * dx * dx * dx;
  };
}

export function buildAgeCurve(
  model: "linear" | "spline",
  anchors: AnchorPoint[]
): AgeCurve {
  const fn =
    model === "linear"
      ? piecewiseLinearInterpolation(anchors)
      : naturalCubicSplineInterpolation(anchors);
  return {
    ageWeight: (age: number) => Math.max(0, fn(age))
  };
}