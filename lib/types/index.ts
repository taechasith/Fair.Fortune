export type RolePreset = "child" | "teen" | "student" | "adult" | "elder";

export interface Bounds {
  min?: number;
  max?: number;
}

export interface Recipient extends Bounds {
  id: string;
  name: string;
  age: number;
  roleFactor: number;
  preset: RolePreset;
}

export interface LuckyRules {
  avoidEndings: number[];
  preferEndings: number[];
  roundingUnit: 10 | 100;
}

export type LinearSolverName = "gaussian" | "jacobi" | "gaussSeidel";
export type RootMethod = "bisection" | "newton";
export type AgeCurveModel = "linear" | "spline";

export interface AnchorPoint {
  age: number;
  weight: number;
}

export interface SolverSettings {
  linearSolver: LinearSolverName;
  rootMethod: RootMethod;
  ageCurveModel: AgeCurveModel;
}

export interface ScenarioSettings {
  budget: number;
  fairnessLambda: number;
  luckyRules: LuckyRules;
  solverSettings: SolverSettings;
  anchorPoints: AnchorPoint[];
}

export interface PersonResult {
  recipientId: string;
  name: string;
  continuous: number;
  rounded: number;
  proportion: number;
  ageWeight: number;
  blendedWeight: number;
  explanation: string;
}

export interface AllocationWarnings {
  messages: string[];
}

export interface AllocationResult {
  alpha: number;
  totalRounded: number;
  totalContinuous: number;
  exactBudgetMatched: boolean;
  diffFromBudget: number;
  allocations: PersonResult[];
  warnings: AllocationWarnings;
}

export interface IterationPoint {
  iteration: number;
  l2Residual: number;
  linfResidual: number;
}

export interface LinearSolveResult {
  x: number[];
  iterations: number;
  converged: boolean;
  residual: number[];
  l2Residual: number;
  linfResidual: number;
  history: IterationPoint[];
  warning?: string;
}

export interface LabResult {
  matrixA: number[][];
  vectorB: number[];
  results: Record<LinearSolverName, LinearSolveResult>;
  diagonalDominance: boolean;
}

export interface PersistedState {
  recipients: Recipient[];
  settings: ScenarioSettings;
  lastResult?: AllocationResult;
}

export interface SensitivityResult {
  recipientId: string;
  deltaVector: { name: string; delta: number }[];
  maxAbsoluteChange: number;
  relativeResidual: number;
  amplification: number;
}