"use client";

import { useMemo, useState } from "react";
import { ConvergenceChart } from "@/components/convergence-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { computeAllocation, perturbAgeSensitivity } from "@/lib/math/engine";
import { runLabSolvers } from "@/lib/math/lab";
import { useScenarioState } from "@/lib/state/useScenarioState";

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
      <h1 className="text-3xl font-bold text-[#7A0C1B]">Behind the Scenes (For Study Use)</h1>
      <div className="rounded-2xl border border-[#D4AF37]/55 bg-[#F8EFD8] p-4 text-sm text-[#7A0C1B]">
        This section is for educational purposes.
      </div>
      <Card className="cny-panel">
        <CardHeader>
          <CardTitle>Solver Comparison</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>Diagonal dominance: {lab.diagonalDominance ? "Yes" : "No (iterative methods may diverge)"}</div>
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
    </div>
  );
}
