import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { cancelRun, getActiveRun, pruneRun } from "../lib/api.ts";
import type {
  ActiveRunSummary,
  ProgressEvent as ProgressEventType,
} from "../lib/types.ts";

interface CaseEntry {
  skill: string;
  caseId: string;
  status: "running" | "passed" | "failed" | "errored";
  score: number | null;
  message: string | null;
}

export default function RunInProgress() {
  const { tempId } = useParams<{ tempId: string }>();
  const navigate = useNavigate();

  const [run, setRun] = useState<ActiveRunSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cases, setCases] = useState<CaseEntry[]>([]);
  const [stdoutLines, setStdoutLines] = useState<string[]>([]);
  const [showStdout, setShowStdout] = useState(false);
  const [terminal, setTerminal] = useState<string | null>(null); // 'completed' | 'failed' | 'cancelled'

  // Track keys we've seen to avoid duplicate-render races on event replay
  const seenStarts = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!tempId) return;

    // Snapshot first so we have status even if SSE drops
    getActiveRun(tempId).then(setRun).catch((e) => setError(String(e)));

    const es = new EventSource(`/api/runs/active/${encodeURIComponent(tempId)}/stream`);

    function applyEvent(ev: ProgressEventType) {
      switch (ev.type) {
        case "started": {
          if (ev.data.finalRunId) {
            setRun((prev) =>
              prev ? { ...prev, finalRunId: ev.data.finalRunId } : prev
            );
          }
          break;
        }
        case "case-started": {
          const key = `${ev.data.skill}/${ev.data.caseId}`;
          if (seenStarts.current.has(key)) break;
          seenStarts.current.add(key);
          setCases((prev) => [
            ...prev,
            {
              skill: ev.data.skill,
              caseId: ev.data.caseId,
              status: "running",
              score: null,
              message: null,
            },
          ]);
          break;
        }
        case "case-completed": {
          setCases((prev) =>
            prev.map((c) =>
              c.skill === ev.data.skill && c.caseId === ev.data.caseId
                ? {
                    ...c,
                    status: ev.data.status as CaseEntry["status"],
                    score: ev.data.score ?? null,
                    message: ev.data.message ?? null,
                  }
                : c
            )
          );
          break;
        }
        case "stdout": {
          setStdoutLines((prev) => [...prev, ev.data.line]);
          break;
        }
        case "completed":
        case "failed":
        case "cancelled": {
          setTerminal(ev.type);
          // Refresh run summary at end
          if (tempId) {
            getActiveRun(tempId)
              .then(setRun)
              .catch(() => {
                /* may have been pruned */
              });
          }
          break;
        }
      }
    }

    const handler = (raw: MessageEvent) => {
      try {
        const ev = JSON.parse(raw.data) as ProgressEventType;
        applyEvent(ev);
      } catch {
        /* ignore malformed */
      }
    };
    // Listen on every named event we emit
    const names = [
      "started",
      "case-started",
      "case-completed",
      "stdout",
      "completed",
      "failed",
      "cancelled",
    ];
    for (const n of names) es.addEventListener(n, handler as any);

    es.onerror = () => {
      // Stream closes naturally on terminal events; don't treat as a hard error
      es.close();
    };

    return () => {
      es.close();
    };
  }, [tempId]);

  if (error) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4 text-red-900">
        <p className="font-semibold">Failed to load run</p>
        <p className="text-sm mt-1">{error}</p>
        <Link to="/" className="text-blue-700 underline text-sm mt-2 inline-block">
          ← Back
        </Link>
      </div>
    );
  }

  const totals = {
    passed: cases.filter((c) => c.status === "passed").length,
    failed: cases.filter((c) => c.status === "failed").length,
    errored: cases.filter((c) => c.status === "errored").length,
    running: cases.filter((c) => c.status === "running").length,
  };

  const isTerminal = !!terminal;
  const finalRunId = run?.finalRunId ?? null;

  async function handleCancel() {
    if (!tempId) return;
    if (!confirm("Cancel this run?")) return;
    try {
      await cancelRun(tempId);
    } catch (e) {
      alert(`Cancel failed: ${e}`);
    }
  }

  async function handleDismiss() {
    if (!tempId) return;
    try {
      await pruneRun(tempId);
    } catch {
      // ignore
    }
    navigate("/");
  }

  return (
    <div>
      <div className="text-sm text-slate-500 mb-1">
        <Link to="/" className="text-blue-600 hover:underline">
          ← All runs
        </Link>
      </div>
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
        <h1 className="text-2xl font-semibold">
          {isTerminal
            ? terminal === "completed"
              ? "✓ Run complete"
              : terminal === "failed"
                ? "✗ Run failed"
                : "⊘ Run cancelled"
            : "▶ Run in progress"}
        </h1>
        <div className="flex gap-2">
          {!isTerminal && run?.status !== "cancelled" && (
            <button
              onClick={handleCancel}
              className="px-3 py-1 rounded bg-red-100 text-red-800 hover:bg-red-200 text-sm font-medium"
            >
              Cancel run
            </button>
          )}
          {isTerminal && finalRunId && (
            <Link
              to={`/runs/${encodeURIComponent(finalRunId)}`}
              className="px-3 py-1 rounded bg-slate-900 text-white hover:bg-slate-700 text-sm font-medium"
            >
              View results →
            </Link>
          )}
          {isTerminal && (
            <button
              onClick={handleDismiss}
              className="px-3 py-1 rounded bg-slate-200 text-slate-800 hover:bg-slate-300 text-sm"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>

      <div className="text-sm text-slate-600 mb-4 font-mono text-xs">
        {run?.command}
        {finalRunId && (
          <>
            {" · "}
            <span className="text-slate-500">runs/</span>
            <span className="text-slate-700">{finalRunId}</span>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <Stat label="Passed" value={totals.passed} color="green" />
        <Stat label="Failed" value={totals.failed} color="red" />
        <Stat label="Errored" value={totals.errored} color="amber" />
        <Stat label="In flight" value={totals.running} color="blue" />
      </div>

      <div className="rounded border border-slate-300 bg-white overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="text-left px-3 py-2">Case</th>
              <th className="text-right px-3 py-2 w-20">Score</th>
              <th className="text-right px-3 py-2 w-24">Status</th>
            </tr>
          </thead>
          <tbody>
            {cases.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-3 py-4 text-center text-slate-500"
                >
                  Waiting for first case to start…
                </td>
              </tr>
            )}
            {cases.map((c) => (
              <tr
                key={`${c.skill}/${c.caseId}`}
                className="border-t border-slate-200"
              >
                <td className="px-3 py-2 font-mono text-xs">
                  <span className="text-slate-500">{c.skill}/</span>
                  {finalRunId && (c.status === "passed" || c.status === "failed") ? (
                    <Link
                      className="text-blue-600 hover:underline"
                      to={`/runs/${encodeURIComponent(
                        finalRunId
                      )}/${encodeURIComponent(c.skill)}/${encodeURIComponent(c.caseId)}`}
                    >
                      {c.caseId}
                    </Link>
                  ) : (
                    c.caseId
                  )}
                </td>
                <td className="px-3 py-2 text-right font-mono text-xs">
                  {c.score != null ? `${c.score.toFixed(2)}/5` : "—"}
                </td>
                <td className="px-3 py-2 text-right">
                  {c.status === "running" && (
                    <span className="text-blue-700 font-medium">running…</span>
                  )}
                  {c.status === "passed" && (
                    <span className="text-green-700 font-medium">✓ pass</span>
                  )}
                  {c.status === "failed" && (
                    <span className="text-red-700 font-medium">✗ fail</span>
                  )}
                  {c.status === "errored" && (
                    <span
                      className="text-amber-700 font-medium"
                      title={c.message ?? ""}
                    >
                      ⚠ error
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <button
          onClick={() => setShowStdout((s) => !s)}
          className="text-sm text-slate-600 hover:text-slate-900 underline"
        >
          {showStdout ? "Hide" : "Show"} raw stdout ({stdoutLines.length} lines)
        </button>
        {showStdout && (
          <pre className="mt-2 bg-slate-900 text-slate-100 text-xs p-3 rounded font-mono overflow-x-auto max-h-[40vh] overflow-y-auto">
            {stdoutLines.join("\n")}
          </pre>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "green" | "red" | "amber" | "blue";
}) {
  const colorClass =
    color === "green"
      ? "text-green-700 bg-green-50 border-green-200"
      : color === "red"
        ? "text-red-700 bg-red-50 border-red-200"
        : color === "amber"
          ? "text-amber-700 bg-amber-50 border-amber-200"
          : "text-blue-700 bg-blue-50 border-blue-200";
  return (
    <div className={`rounded border px-3 py-2 ${colorClass}`}>
      <div className="text-xs uppercase tracking-wide opacity-75">{label}</div>
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
