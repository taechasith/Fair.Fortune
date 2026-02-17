import {
  AllocationResult,
  Recipient,
  ScenarioSettings,
  SensitivityResult
} from "../types";
import { buildAgeCurve } from "./ageCurve";
import {
  applyBounds,
  buildTargetWeights,
  continuousAllocationFromProportions
} from "./allocation";
import { correctBudgetAfterRounding } from "./rootFinding";

export function computeAllocation(
  recipients: Recipient[],
  settings: ScenarioSettings
): AllocationResult {
  const curve = buildAgeCurve(settings.solverSettings.ageCurveModel, settings.anchorPoints);
  const targets = buildTargetWeights(recipients, settings.fairnessLambda, curve.ageWeight);
  const proportions = targets.map((t) => t.proportion);

  const initial = continuousAllocationFromProportions(settings.budget, proportions);
  const bounded = applyBounds(initial, recipients, settings.budget, proportions);

  const correction = correctBudgetAfterRounding({
    budget: settings.budget,
    baseContinuous: bounded.values,
    recipients,
    roundingRules: settings.luckyRules,
    method: settings.solverSettings.rootMethod
  });

  const allocations = recipients.map((r, i) => {
    const target = targets[i];
    const ageMessage =
      settings.fairnessLambda < 0.5
        ? "age plays a stronger part in this plan"
        : settings.fairnessLambda < 0.8
          ? "age has some influence in this plan"
          : "this plan keeps amounts closer for everyone";
    return {
      recipientId: r.id,
      name: r.name,
      continuous: bounded.values[i],
      rounded: correction.rounded[i],
      proportion: target.proportion,
      ageWeight: target.rawWeight,
      blendedWeight: target.blendedWeight,
      explanation: `${r.name} receives a share that matches their age and the fairness style you chose. In this run, ${ageMessage}.`
    };
  });

  const totalRounded = correction.rounded.reduce((sum, x) => sum + x, 0);
  const warnings = [...bounded.warnings];
  if (correction.warning) warnings.push(correction.warning);
  if (!correction.exact) {
    warnings.push(
      "A perfect total match was not possible with these limits, so we returned the closest stable result."
    );
  }

  return {
    alpha: correction.alpha,
    totalRounded,
    totalContinuous: bounded.values.reduce((sum, x) => sum + x, 0),
    exactBudgetMatched: correction.exact,
    diffFromBudget: totalRounded - settings.budget,
    allocations,
    warnings: { messages: warnings }
  };
}

export function perturbAgeSensitivity(
  recipients: Recipient[],
  settings: ScenarioSettings,
  recipientId: string
): SensitivityResult {
  const before = computeAllocation(recipients, settings);
  const perturbedRecipients = recipients.map((r) =>
    r.id === recipientId ? { ...r, age: r.age + 1 } : { ...r }
  );
  const after = computeAllocation(perturbedRecipients, settings);

  const deltaVector = before.allocations.map((base, i) => ({
    name: base.name,
    delta: after.allocations[i].rounded - base.rounded
  }));

  const maxAbsoluteChange = deltaVector.reduce((acc, v) => Math.max(acc, Math.abs(v.delta)), 0);
  const outputNorm = Math.sqrt(
    before.allocations.reduce((sum, a) => sum + a.rounded * a.rounded, 0)
  );
  const deltaNorm = Math.sqrt(deltaVector.reduce((sum, d) => sum + d.delta * d.delta, 0));

  const relativeResidual =
    before.diffFromBudget === 0
      ? 0
      : Math.abs(before.diffFromBudget) / Math.max(settings.budget, 1e-12);

  const amplification = (deltaNorm / Math.max(outputNorm, 1e-12)) / (1 / 100);

  return {
    recipientId,
    deltaVector,
    maxAbsoluteChange,
    relativeResidual,
    amplification
  };
}
