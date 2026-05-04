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

export interface ActiveRunSummary {
  tempId: string;
  finalRunId: string | null;
  command: string;
  startedAt: string;
  status: "starting" | "running" | "completed" | "failed" | "cancelled";
  exitCode: number | null;
  totals: {
    started: number;
    passed: number;
    failed: number;
    errored: number;
  };
  cancelRequested: boolean;
}

export interface Settings {
  maxConcurrent: number;
}

export interface ProgressEvent {
  type:
    | "started"
    | "case-started"
    | "case-completed"
    | "stdout"
    | "completed"
    | "failed"
    | "cancelled";
  data: Record<string, any>;
  ts: string;
}
