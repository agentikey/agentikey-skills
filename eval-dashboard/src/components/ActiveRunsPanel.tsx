import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listActiveRuns } from "../lib/api.ts";
import type { ActiveRunSummary } from "../lib/types.ts";

const POLL_MS = 2500;

export default function ActiveRunsPanel() {
  const [runs, setRuns] = useState<ActiveRunSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const list = await listActiveRuns();
        if (!cancelled) setRuns(list);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? String(e));
      }
    }
    poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Show in-flight first, then terminal-but-not-pruned
  const inFlight = runs.filter(
    (r) => r.status === "starting" || r.status === "running"
  );
  const recent = runs.filter(
    (r) => r.status !== "starting" && r.status !== "running"
  );

  if (inFlight.length === 0 && recent.length === 0 && !error) return null;

  return (
    <div className="mb-6">
      {error && (
        <div className="text-xs text-red-700 mb-2">
          Polling active runs failed: {error}
        </div>
      )}

      {inFlight.length > 0 && (
        <div className="rounded border border-blue-300 bg-blue-50 p-3 mb-2">
          <div className="text-sm font-semibold text-blue-900 mb-2">
            ▶ Active runs ({inFlight.length})
          </div>
          <ul className="space-y-1.5">
            {inFlight.map((r) => (
              <RunRow key={r.tempId} run={r} />
            ))}
          </ul>
        </div>
      )}

      {recent.length > 0 && (
        <div className="rounded border border-slate-300 bg-slate-50 p-3">
          <div className="text-sm font-semibold text-slate-700 mb-2">
            Recently finished (this session)
          </div>
          <ul className="space-y-1.5">
            {recent.map((r) => (
              <RunRow key={r.tempId} run={r} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function RunRow({ run }: { run: ActiveRunSummary }) {
  const total =
    run.totals.passed + run.totals.failed + run.totals.errored;
  return (
    <li>
      <Link
        to={`/run/${encodeURIComponent(run.tempId)}`}
        className="flex items-center gap-3 text-sm hover:bg-white/60 rounded px-2 py-1"
      >
        <StatusBadge status={run.status} />
        <span className="font-mono text-xs text-slate-700 flex-1 truncate">
          {run.command}
        </span>
        <span className="text-xs text-slate-600 tabular-nums whitespace-nowrap">
          <span className="text-green-700">{run.totals.passed}</span>
          {" / "}
          <span className={run.totals.failed > 0 ? "text-red-700" : ""}>
            {run.totals.failed}
          </span>
          {run.totals.errored > 0 && (
            <>
              {" / "}
              <span className="text-amber-700">{run.totals.errored}</span>
            </>
          )}
          {" of "}
          {total > 0 ? total : "?"}
        </span>
      </Link>
    </li>
  );
}

function StatusBadge({ status }: { status: ActiveRunSummary["status"] }) {
  const cls = {
    starting: "bg-blue-200 text-blue-800",
    running: "bg-blue-200 text-blue-800",
    completed: "bg-green-200 text-green-800",
    failed: "bg-red-200 text-red-800",
    cancelled: "bg-slate-200 text-slate-700",
  }[status];
  const label = {
    starting: "starting",
    running: "running",
    completed: "✓ done",
    failed: "✗ failed",
    cancelled: "⊘ cancelled",
  }[status];
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium tabular-nums ${cls}`}
    >
      {label}
    </span>
  );
}
