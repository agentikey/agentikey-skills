import type {
  RunSummary,
  RunDetail,
  CaseDetail,
  ActiveRunSummary,
  Settings,
} from "./types.ts";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) {
    let detail = "";
    try {
      detail = await res.text();
    } catch {
      // ignore
    }
    const err = new Error(
      `${path} → ${res.status} ${res.statusText}${detail ? ": " + detail : ""}`
    );
    (err as any).status = res.status;
    (err as any).body = detail;
    throw err;
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

export function listSkills(): Promise<string[]> {
  return fetchJson<string[]>("/api/skills");
}

export function listCases(skill: string): Promise<string[]> {
  return fetchJson<string[]>(
    `/api/skills/${encodeURIComponent(skill)}/cases`
  );
}

export function startRun(opts: {
  skill?: string;
  case?: string;
}): Promise<ActiveRunSummary> {
  return fetchJson<ActiveRunSummary>("/api/runs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts),
  });
}

export function listActiveRuns(): Promise<ActiveRunSummary[]> {
  return fetchJson<ActiveRunSummary[]>("/api/active-runs");
}

export function getActiveRun(tempId: string): Promise<ActiveRunSummary> {
  return fetchJson<ActiveRunSummary>(
    `/api/active-runs/${encodeURIComponent(tempId)}`
  );
}

export function cancelRun(tempId: string): Promise<ActiveRunSummary> {
  return fetchJson<ActiveRunSummary>(
    `/api/active-runs/${encodeURIComponent(tempId)}`,
    { method: "DELETE" }
  );
}

export function pruneRun(tempId: string): Promise<{ ok: boolean }> {
  return fetchJson<{ ok: boolean }>(
    `/api/active-runs/${encodeURIComponent(tempId)}/prune`,
    { method: "DELETE" }
  );
}

export function getSettings(): Promise<Settings> {
  return fetchJson<Settings>("/api/settings");
}

export function updateSettings(settings: Partial<Settings>): Promise<Settings> {
  return fetchJson<Settings>("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
}
