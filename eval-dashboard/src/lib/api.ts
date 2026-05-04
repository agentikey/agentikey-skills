import type { RunSummary, RunDetail, CaseDetail } from "./types.ts";

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(
      `${path} → ${res.status} ${res.statusText}: ${await res.text()}`
    );
  }
  return res.json() as Promise<T>;
}

export function listRuns(): Promise<RunSummary[]> {
  return fetchJson<RunSummary[]>("/api/runs");
}

export function getRun(runId: string): Promise<RunDetail> {
  return fetchJson<RunDetail>(`/api/runs/${encodeURIComponent(runId)}`);
}

export function getCase(
  runId: string,
  skill: string,
  caseId: string
): Promise<CaseDetail> {
  return fetchJson<CaseDetail>(
    `/api/runs/${encodeURIComponent(runId)}/${encodeURIComponent(
      skill
    )}/${encodeURIComponent(caseId)}`
  );
}
