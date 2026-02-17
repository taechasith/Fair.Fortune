"use client";

import { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ScenarioSettings } from "@/lib/types";

export function SettingsPanel({
  settings,
  onChange
}: {
  settings: ScenarioSettings;
  onChange: (next: ScenarioSettings) => void;
}) {
  function updateAvoid(e: ChangeEvent<HTMLInputElement>) {
    const avoid = e.target.value
      .split(",")
      .map((x) => Number(x.trim()))
      .filter((x) => Number.isInteger(x) && x >= 0 && x <= 9);
    onChange({
      ...settings,
      luckyRules: { ...settings.luckyRules, avoidEndings: avoid }
    });
  }

  function updatePrefer(e: ChangeEvent<HTMLInputElement>) {
    const prefer = e.target.value
      .split(",")
      .map((x) => Number(x.trim()))
      .filter((x) => Number.isInteger(x) && x >= 0 && x <= 9);
    onChange({
      ...settings,
      luckyRules: { ...settings.luckyRules, preferEndings: prefer }
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-[#7A0C1B]">Budget</Label>
        <Input
          className="border-[#7A0C1B]/65 bg-[linear-gradient(140deg,#C8102E,#7A0C1B)] font-semibold text-[#FDF6EC] placeholder:text-[#F8EFD8]/70"
          type="number"
          min={0}
          value={settings.budget}
          onChange={(e) => onChange({ ...settings, budget: Number(e.target.value) })}
        />
      </div>
      <div className="cny-divider" />
      <div>
        <Label className="text-[#7A0C1B]">Fairness Slider: {settings.fairnessLambda.toFixed(2)}</Label>
        <Slider
          value={settings.fairnessLambda}
          onValueChange={(value) => onChange({ ...settings, fairnessLambda: value })}
        />
      </div>
      <div className="cny-divider" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-[#7A0C1B]">Age Curve</Label>
          <Select
            value={settings.solverSettings.ageCurveModel}
            onChange={(e) =>
              onChange({
                ...settings,
                solverSettings: {
                  ...settings.solverSettings,
                  ageCurveModel: e.target.value as "linear" | "spline"
                }
              })
            }
          >
            <option value="linear">Piecewise Linear</option>
            <option value="spline">Natural Cubic Spline</option>
          </Select>
        </div>
        <div>
          <Label className="text-[#7A0C1B]">Root Method</Label>
          <Select
            value={settings.solverSettings.rootMethod}
            onChange={(e) =>
              onChange({
                ...settings,
                solverSettings: {
                  ...settings.solverSettings,
                  rootMethod: e.target.value as "bisection" | "newton"
                }
              })
            }
          >
            <option value="bisection">Bisection</option>
            <option value="newton">Newton + Fallback</option>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-[#7A0C1B]">Linear Solver</Label>
          <Select
            value={settings.solverSettings.linearSolver}
            onChange={(e) =>
              onChange({
                ...settings,
                solverSettings: {
                  ...settings.solverSettings,
                  linearSolver: e.target.value as "gaussian" | "jacobi" | "gaussSeidel"
                }
              })
            }
          >
            <option value="gaussian">Gaussian PP</option>
            <option value="jacobi">Jacobi</option>
            <option value="gaussSeidel">Gauss-Seidel</option>
          </Select>
        </div>
        <div>
          <Label className="text-[#7A0C1B]">Rounding Unit</Label>
          <Select
            value={String(settings.luckyRules.roundingUnit)}
            onChange={(e) =>
              onChange({
                ...settings,
                luckyRules: {
                  ...settings.luckyRules,
                  roundingUnit: Number(e.target.value) as 10 | 100
                }
              })
            }
          >
            <option value="10">10</option>
            <option value="100">100</option>
          </Select>
        </div>
      </div>
      <div>
        <Label className="text-[#7A0C1B]">Avoid endings (comma-separated)</Label>
        <Input value={settings.luckyRules.avoidEndings.join(",")} onChange={updateAvoid} />
      </div>
      <div>
        <Label className="text-[#7A0C1B]">Prefer endings (comma-separated)</Label>
        <Input value={settings.luckyRules.preferEndings.join(",")} onChange={updatePrefer} />
      </div>
      <Button variant="ghost" onClick={() => onChange(settings)}>
        Settings saved automatically
      </Button>
    </div>
  );
}
