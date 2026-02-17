"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ScenarioSettings } from "@/lib/types";

export type SpendingStyle = "balanced" | "younger" | "auto";

export function SettingsPanel({
  settings,
  onChange,
  spendingStyle,
  onSpendingStyleChange
}: {
  settings: ScenarioSettings;
  onChange: (next: ScenarioSettings) => void;
  spendingStyle: SpendingStyle;
  onSpendingStyleChange: (next: SpendingStyle) => void;
}) {
  const luckyEnabled = settings.luckyRules.preferEndings.length > 0;

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-[#7A0C1B]">Step 1: Enter Budget</Label>
        <Input
          className="border-[#7A0C1B]/65 bg-[linear-gradient(140deg,#C8102E,#7A0C1B)] font-semibold text-[#FDF6EC] placeholder:text-[#F8EFD8]/70"
          type="number"
          min={0}
          value={settings.budget}
          onChange={(e) => onChange({ ...settings, budget: Number(e.target.value) })}
        />
        <p className="mt-1 text-xs text-[#5f5148]">Example: 600 means total hongbao budget is $600.</p>
      </div>
      <div className="cny-divider" />
      <div>
        <Label className="text-[#7A0C1B]">Step 3: How fair should it feel?</Label>
        <Slider
          value={settings.fairnessLambda}
          onValueChange={(value) => onChange({ ...settings, fairnessLambda: value })}
        />
        <div className="mt-1 flex justify-between text-xs text-[#5f5148]">
          <span>More equal</span>
          <span>More based on age</span>
        </div>
        <p className="mt-1 text-xs text-[#5f5148]" title="If you choose More equal, everyone gets similar amounts.">
          Tip: More equal means amounts stay closer.
        </p>
      </div>
      <div className="cny-divider" />
      <div>
        <Label className="text-[#7A0C1B]">Step 3: Spending Style</Label>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          <Button
            variant={spendingStyle === "balanced" ? "default" : "secondary"}
            onClick={() => onSpendingStyleChange("balanced")}
          >
            Very Balanced
          </Button>
          <Button
            variant={spendingStyle === "younger" ? "default" : "secondary"}
            onClick={() => onSpendingStyleChange("younger")}
          >
            Slightly Favor Younger
          </Button>
          <Button
            variant={spendingStyle === "auto" ? "default" : "secondary"}
            onClick={() => onSpendingStyleChange("auto")}
          >
            Let the System Decide
          </Button>
        </div>
        <p className="mt-1 text-xs text-[#5f5148]">Choose the style that matches your family preference.</p>
      </div>
      <div>
        <Label className="text-[#7A0C1B]">Lucky Ending</Label>
        <button
          type="button"
          role="switch"
          aria-checked={luckyEnabled}
          onClick={() =>
            onChange({
              ...settings,
              luckyRules: luckyEnabled
                ? { ...settings.luckyRules, preferEndings: [], avoidEndings: [] }
                : { ...settings.luckyRules, preferEndings: [8, 9], avoidEndings: [4] }
            })
          }
          className={`mt-2 inline-flex items-center rounded-full border px-3 py-2 text-sm font-medium ${
            luckyEnabled
              ? "border-[#D4AF37] bg-[#7A0C1B]/10 text-[#7A0C1B]"
              : "border-[#D4AF37]/50 bg-[#FDF6EC] text-[#5f5148]"
          }`}
        >
          {luckyEnabled ? "On: Use lucky number endings" : "Off: No lucky ending preference"}
        </button>
        <p className="mt-1 text-xs text-[#5f5148]">When on, amounts try to end in lucky numbers.</p>
      </div>
      <details className="rounded-xl border border-[#D4AF37]/45 p-3">
        <summary className="cursor-pointer text-sm font-semibold text-[#7A0C1B]">
          Advanced Settings
        </summary>
        <p className="mt-2 text-xs text-[#5f5148]">
          Optional fine-tuning. Most families can skip this.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[#7A0C1B]">Round by</Label>
            <div className="mt-2 flex gap-2">
              <Button
                size="sm"
                variant={settings.luckyRules.roundingUnit === 10 ? "default" : "secondary"}
                onClick={() =>
                  onChange({
                    ...settings,
                    luckyRules: {
                      ...settings.luckyRules,
                      roundingUnit: 10
                    }
                  })
                }
              >
                10
              </Button>
              <Button
                size="sm"
                variant={settings.luckyRules.roundingUnit === 100 ? "default" : "secondary"}
                onClick={() =>
                  onChange({
                    ...settings,
                    luckyRules: {
                      ...settings.luckyRules,
                      roundingUnit: 100
                    }
                  })
                }
              >
                100
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-[#7A0C1B]">Age influence style</Label>
            <div className="mt-2 flex gap-2">
              <Button
                size="sm"
                variant={settings.solverSettings.ageCurveModel === "linear" ? "default" : "secondary"}
                onClick={() =>
                  onChange({
                    ...settings,
                    solverSettings: {
                      ...settings.solverSettings,
                      ageCurveModel: "linear"
                    }
                  })
                }
              >
                Smooth
              </Button>
              <Button
                size="sm"
                variant={settings.solverSettings.ageCurveModel === "spline" ? "default" : "secondary"}
                onClick={() =>
                  onChange({
                    ...settings,
                    solverSettings: {
                      ...settings.solverSettings,
                      ageCurveModel: "spline"
                    }
                  })
                }
              >
                Adaptive
              </Button>
            </div>
          </div>
        </div>
      </details>
      <Button variant="ghost" onClick={() => onChange(settings)}>
        Saved automatically
      </Button>
    </div>
  );
}
