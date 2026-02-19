"use client";

import { useMemo, useState } from "react";
import { AgeCurveChart } from "@/components/age-curve-chart";
import { ConvergenceChart } from "@/components/convergence-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { computeAllocation, perturbAgeSensitivity } from "@/lib/math/engine";
import { runLabSolvers } from "@/lib/math/lab";
import { useScenarioState } from "@/lib/state/useScenarioState";
import { formatMoney } from "@/lib/utils";

function renderMatrixRow(row: number[]): string {
  return `[${row.map((value) => value.toFixed(3)).join(", ")}]`;
}

export default function LabPage() {
  const { recipients, settings } = useScenarioState();
  const allocation = useMemo(() => computeAllocation(recipients, settings), [recipients, settings]);
  const proportions = allocation.allocations.map((a) => a.proportion);
  const lab = useMemo(() => runLabSolvers(proportions, settings.budget), [proportions, settings.budget]);

  const [targetId, setTargetId] = useState(recipients[0]?.id ?? "");
  const sensitivity = useMemo(
    () => perturbAgeSensitivity(recipients, settings, targetId || recipients[0]?.id || ""),
    [recipients, settings, targetId]
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#7A0C1B]">Lab (Behind the Scenes)</h1>

      <Card className="cny-panel">
        <CardHeader>
          <CardTitle>How The Engine Runs</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <div className="cny-plaque rounded-2xl p-4">
            <div className="text-base font-semibold text-[#7A0C1B]">1) Age interpolation</div>
            <div>Functions: <code>buildAgeCurve</code>, <code>piecewiseLinearInterpolation</code>, <code>naturalCubicSplineInterpolation</code></div>
          </div>
          <div className="cny-plaque rounded-2xl p-4">
            <div className="text-base font-semibold text-[#7A0C1B]">2) Build constrained allocation</div>
            <div>Functions: <code>buildTargetWeights</code>, <code>applyBounds</code>, <code>computeAllocation</code></div>
          </div>
          <div className="cny-plaque rounded-2xl p-4">
            <div className="text-base font-semibold text-[#7A0C1B]">3) Root-correct rounded totals</div>
            <div>Functions: <code>correctBudgetAfterRounding</code>, <code>solveBisection</code>, <code>solveNewton</code></div>
          </div>
          <div className="cny-plaque rounded-2xl p-4">
            <div className="text-base font-semibold text-[#7A0C1B]">4) Diagnose numerical behavior</div>
            <div>Functions: <code>runLabSolvers</code>, <code>perturbAgeSensitivity</code>, <code>l2Norm</code>, <code>linfNorm</code></div>
          </div>
        </CardContent>
      </Card>

      <Card className="cny-panel">
        <CardHeader>
          <CardTitle>Algorithm To Function To Output</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="cny-plaque rounded-2xl p-4">
            <div className="font-semibold text-[#7A0C1B]">Numerical accuracy & stability</div>
            <div><code>perturbAgeSensitivity</code>, <code>l2Norm</code>, <code>linfNorm</code> to sensitivity and residual size shown below.</div>
          </div>
          <div className="cny-plaque rounded-2xl p-4">
            <div className="font-semibold text-[#7A0C1B]">Linear algebra (Ax=b)</div>
            <div><code>buildLabSystem</code>, <code>matVecMul</code>, <code>subVec</code> to matrix/vector and residual metrics.</div>
          </div>
          <div className="cny-plaque rounded-2xl p-4">
            <div className="font-semibold text-[#7A0C1B]">Linear solvers</div>
            <div><code>gaussianEliminationPartialPivoting</code>, <code>jacobiSolver</code>, <code>gaussSeidelSolver</code> to comparison and convergence chart.</div>
          </div>
          <div className="cny-plaque rounded-2xl p-4">
            <div className="font-semibold text-[#7A0C1B]">Interpolation for age model</div>
            <div><code>buildAgeCurve</code> (spline/linear) to age-weight curve visual.</div>
          </div>
          <div className="cny-plaque rounded-2xl p-4">
            <div className="font-semibold text-[#7A0C1B]">Root finding for budget correction</div>
            <div><code>correctBudgetAfterRounding</code> (Newton/Bisection safeguards) to budget match status and delta.</div>
          </div>
        </CardContent>
      </Card>

      <Card className="cny-panel">
        <CardHeader>
          <CardTitle>Live Solver Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(lab.results).map(([name, res]) => (
              <div key={name} className="cny-plaque rounded-2xl p-4">
                <div className="text-base font-semibold text-[#7A0C1B]">{name}</div>
                <div>Converged: {String(res.converged)}</div>
                <div>Iterations: {res.iterations}</div>
                <div>||r||2: {res.l2Residual.toExponential(3)}</div>
                <div>||r||inf: {res.linfResidual.toExponential(3)}</div>
                {res.warning && <div className="text-warning">{res.warning}</div>}
              </div>
            ))}
          </div>

          <details className="rounded-xl border border-[#D4AF37]/35 p-3">
            <summary className="cursor-pointer font-medium text-[#7A0C1B]">Show Ax = b</summary>
            <div className="mt-2 text-xs font-mono">
              <div>A =</div>
              {lab.matrixA.map((row, index) => (
                <div key={`row-${index}`}>{renderMatrixRow(row)}</div>
              ))}
              <div className="mt-2">b = {renderMatrixRow(lab.vectorB)}</div>
              <div className="mt-2 font-sans text-sm text-[#2B2B2B]">
                Diagonal dominance: {lab.diagonalDominance ? "Yes" : "No"}
              </div>
            </div>
          </details>
        </CardContent>
      </Card>

      <Card className="cny-panel">
        <CardHeader>
          <CardTitle>Convergence (Iterative Solvers)</CardTitle>
        </CardHeader>
        <CardContent>
          <ConvergenceChart jacobi={lab.results.jacobi.history} gaussSeidel={lab.results.gaussSeidel.history} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="cny-panel">
          <CardHeader>
            <CardTitle>Age Interpolation (Live)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>Model: <span className="font-semibold">{settings.solverSettings.ageCurveModel}</span></div>
            <AgeCurveChart anchors={settings.anchorPoints} model={settings.solverSettings.ageCurveModel} />
          </CardContent>
        </Card>

        <Card className="cny-panel">
          <CardHeader>
            <CardTitle>Budget Correction (Live)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>Method: {settings.solverSettings.rootMethod}</div>
            <div>alpha: {allocation.alpha.toFixed(6)}</div>
            <div>Total rounded: {formatMoney(allocation.totalRounded)}</div>
            <div>Budget: {formatMoney(settings.budget)}</div>
            <div>Difference: {formatMoney(allocation.diffFromBudget)}</div>
            <div>Status: {allocation.exactBudgetMatched ? "Exact match" : "Closest stable match"}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="cny-panel">
        <CardHeader>
          <CardTitle>Sensitivity Test (+1 Year Age)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Label className="text-[#7A0C1B]">Recipient</Label>
          <Select value={targetId} onChange={(e) => setTargetId(e.target.value)}>
            {recipients.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
          <div className="cny-plaque rounded-2xl p-4">
            {sensitivity.deltaVector.map((d) => (
              <div key={d.name}>Delta({d.name}) = {d.delta.toFixed(2)}</div>
            ))}
            <div>Max absolute change: {sensitivity.maxAbsoluteChange.toFixed(2)}</div>
            <div>Relative residual proxy ||r||/||b||: {sensitivity.relativeResidual.toExponential(3)}</div>
            <div>Amplification proxy: {sensitivity.amplification.toFixed(3)}</div>
          </div>
          <div className="text-xs text-[#5f5148]">Floating-point effects: values are double precision approximations.</div>
        </CardContent>
      </Card>
    </div>
  );
}
