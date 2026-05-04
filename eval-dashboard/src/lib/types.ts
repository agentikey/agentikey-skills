export interface RunSummary {
  runId: string;
  startedAt: string;
  totalCases: number;
  passed: number;
  failed: number;
  errored: number;
  skills: string[];
}

export interface CaseResult {
  skill: string;
  caseId: string;
  passed: boolean;
  overall: number | null;
  errored: boolean;
  errorMessage?: string;
}

export interface RunDetail extends RunSummary {
  cases: CaseResult[];
}

export interface CaseDetail {
  runId: string;
  skill: string;
  caseId: string;
  transcript: string;
  judge: string;
}
