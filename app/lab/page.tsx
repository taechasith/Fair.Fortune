"use client";

import { useMemo, useState } from "react";
import { AgeCurveChart } from "@/components/age-curve-chart";
import { ConvergenceChart } from "@/components/convergence-chart";
import { Button } from "@/components/ui/button";
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
      <div className="rounded-2xl border border-[#D4AF37]/55 bg-[#F8EFD8] p-4 text-sm text-[#7A0C1B]">
        This section follows the explanation doc and shows where each numerical method appears in the user experience.
      </div>

      <Card className="cny-panel">
        <CardHeader>
          <CardTitle>What Users See On Each Page</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm md:grid-cols-3">
          <div className="cny-plaque rounded-2xl p-4">
            <div className="font-semibold text-[#7A0C1B]">Giver Mode</div>
            <div>Runs full allocation flow on Calculate: interpolation, constraints, lucky rounding, root correction.</div>
            <div className="mt-2">Users see final amounts, budget difference, and stability warnings.</div>
          </div>
          <div className="cny-plaque rounded-2xl p-4">
            <div className="font-semibold text-[#7A0C1B]">Receiver Mode</div>
            <div>Shows read-focused explanation of the same computed allocations.</div>
            <div className="mt-2">Users see rounded result and exact vs closest-stable matching.</div>
          </div>
          <div className="cny-plaque rounded-2xl p-4">
            <div className="font-semibold text-[#7A0C1B]">Lab Page</div>
            <div>Shows solver comparison, residual norms, convergence charts, and sensitivity behavior.</div>
            <div className="mt-2">Floating-point effects are shown as double precision approximations.</div>
          </div>
        </CardContent>
      </Card>

      <Card className="cny-panel">
        <CardHeader>
          <CardTitle>Linear Algebra (Ax = b, r = Ax - b)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="cny-plaque rounded-2xl p-4">
            <div className="font-semibold text-[#7A0C1B]">System model from current scenario</div>
            <div className="mt-2 font-mono text-xs">
              A =
              {lab.matrixA.map((row, index) => (
                <div key={`row-${index}`}>{renderMatrixRow(row)}</div>
              ))}
            </div>
            <div className="mt-2 font-mono text-xs">b = {renderMatrixRow(lab.vectorB)}</div>
            <div className="mt-2">Residual norms shown below use ||r||2 and ||r||inf.</div>
          </div>
          <div>Diagonal dominance: {lab.diagonalDominance ? "Yes" : "No (iterative methods may diverge)"}</div>
        </CardContent>
      </Card>

      <Card className="cny-panel">
        <CardHeader>
          <CardTitle>Solver Comparison</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(lab.results).map(([name, res]) => (
              <div key={name} className="cny-plaque rounded-2xl p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="font-semibold text-[#7A0C1B]">{name}</div>
                  <span className="cny-badge">{res.converged ? "Converged" : "Not converged"}</span>
                </div>
                <div>Converged: {String(res.converged)}</div>
                <div>Iterations: {res.iterations}</div>
                <div>L2 residual: {res.l2Residual.toExponential(3)}</div>
                <div>Linf residual: {res.linfResidual.toExponential(3)}</div>
                {res.warning && <div className="text-warning">{res.warning}</div>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="cny-panel">
        <CardHeader>
          <CardTitle>Convergence History (Linf Residual)</CardTitle>
        </CardHeader>
        <CardContent>
          <ConvergenceChart
            jacobi={lab.results.jacobi.history}
            gaussSeidel={lab.results.gaussSeidel.history}
          />
        </CardContent>
      </Card>

      <Card className="cny-panel">
        <CardHeader>
          <CardTitle>Interpolation For Age Modeling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="cny-plaque rounded-2xl p-4">
            <div>Active model: <span className="font-semibold">{settings.solverSettings.ageCurveModel}</span></div>
            <div className="mt-1">
              Lagrange is conceptual background; live system uses piecewise linear or natural cubic spline.
            </div>
          </div>
          <AgeCurveChart anchors={settings.anchorPoints} model={settings.solverSettings.ageCurveModel} />
        </CardContent>
      </Card>

      <Card className="cny-panel">
        <CardHeader>
          <CardTitle>Root Finding For Budget Correction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="cny-plaque rounded-2xl p-4">
            <div>Method selected: {settings.solverSettings.rootMethod}</div>
            <div>Scale factor alpha: {allocation.alpha.toFixed(6)}</div>
            <div>Total rounded: {formatMoney(allocation.totalRounded)}</div>
            <div>Target budget: {formatMoney(settings.budget)}</div>
            <div>Difference: {formatMoney(allocation.diffFromBudget)}</div>
            <div>Status: {allocation.exactBudgetMatched ? "Exact match" : "Closest stable match"}</div>
          </div>
          {allocation.warnings.messages.length > 0 && (
            <div className="cny-plaque rounded-2xl p-4">
              <div className="font-semibold text-[#7A0C1B]">Safeguard / warning signals</div>
              {allocation.warnings.messages.map((warning) => (
                <div key={warning}>{warning}</div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="cny-panel">
        <CardHeader>
          <CardTitle>Perturb Age (+1 year)</CardTitle>
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
              <div key={d.name}>
                Delta({d.name}) = {d.delta.toFixed(2)}
              </div>
            ))}
            <div>Max absolute change: {sensitivity.maxAbsoluteChange.toFixed(2)}</div>
            <div>Relative residual proxy ||r||/||b||: {sensitivity.relativeResidual.toExponential(3)}</div>
            <div>Amplification proxy: {sensitivity.amplification.toFixed(3)}</div>
          </div>
          <Button variant="secondary">Floating-point effects: values shown are double precision approximations</Button>
        </CardContent>
      </Card>

      <Card className="cny-panel">
        <CardHeader>
          <CardTitle>Topic To Page Mapping</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><span className="font-semibold text-[#7A0C1B]">Numerical accuracy & stability:</span> mainly visible here in Lab, and reflected as warnings in Giver/Receiver results.</div>
          <div><span className="font-semibold text-[#7A0C1B]">Linear algebra (SLE):</span> shown here through Ax=b, r=Ax-b, and residual norms.</div>
          <div><span className="font-semibold text-[#7A0C1B]">Linear system solvers:</span> shown here with Gaussian, Jacobi, and Gauss-Seidel side-by-side.</div>
          <div><span className="font-semibold text-[#7A0C1B]">Interpolation for age:</span> used in Giver settings/calculation and affects both Giver and Receiver outputs.</div>
          <div><span className="font-semibold text-[#7A0C1B]">Root finding for budget correction:</span> used in Giver/Receiver flow after lucky rounding.</div>
        </CardContent>
      </Card>
    </div>
  );
}
