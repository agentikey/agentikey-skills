/**
 * Shared types across the eval harness.
 */

export interface EvalCase {
  caseId: string;
  scenario: string;
  simulatedResponses: string[];
  expectedBehaviors: string[];
  antiPatterns: string[];
  metadata: Record<string, unknown>;
}

export interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
}

export interface CheckBatchResult {
  passed: boolean;
  results: CheckResult[];
}

export interface JudgeDimension {
  name: string;
  score: number;
  reasoning: string;
}

export interface JudgeResult {
  dimensions: JudgeDimension[];
  overall: number;
  passed: boolean;
  anti_patterns_triggered: string[];
  notable_observations: string;
}

export type CaseStage =
  | "loaded"
  | "ran"
  | "checked"
  | "passed"
  | "judge-failed"
  | "error";

export interface CaseResult {
  skillName: string;
  caseId: string;
  stage: CaseStage;
  checks: CheckBatchResult;
  judge: JudgeResult | null;
  transcript: string;
  error: string | null;
}
