import { AnchorPoint, Recipient, RolePreset, ScenarioSettings } from "../types";

export const rolePresetFactors: Record<RolePreset, number> = {
  child: 1.2,
  teen: 1.05,
  student: 1.1,
  adult: 1,
  elder: 1.15
};

export const defaultAnchors: AnchorPoint[] = [
  { age: 3, weight: 0.6 },
  { age: 7, weight: 0.8 },
  { age: 12, weight: 1 },
  { age: 16, weight: 1.2 },
  { age: 20, weight: 1.4 },
  { age: 25, weight: 0.2 },
  { age: 60, weight: 0.6 },
  { age: 75, weight: 0.8 }
];

export const defaultRecipients: Recipient[] = [
  { id: "r1", name: "Aiden", age: 9, roleFactor: rolePresetFactors.child, preset: "child" },
  { id: "r2", name: "Mia", age: 18, roleFactor: rolePresetFactors.student, preset: "student" },
  { id: "r3", name: "Uncle Chen", age: 58, roleFactor: rolePresetFactors.adult, preset: "adult" }
];

export const defaultSettings: ScenarioSettings = {
  budget: 600,
  fairnessLambda: 0.75,
  luckyRules: {
    avoidEndings: [4],
    preferEndings: [8, 9],
    roundingUnit: 10
  },
  solverSettings: {
    linearSolver: "gaussian",
    rootMethod: "newton",
    ageCurveModel: "spline"
  },
  anchorPoints: defaultAnchors
};