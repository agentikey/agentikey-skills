import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listRuns } from "../lib/api.ts";
import type { RunSummary } from "../lib/types.ts";
import RunControls from "../components/RunControls.tsx";
import ActiveRunsPanel from "../components/ActiveRunsPanel.tsx";

function formatTimestamp(iso: string): string {
  // The runId is an ISO-ish string with colons/periods replaced by hyphens.
  // Reconstruct enough to make a Date.
  const recovered = iso.replace(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d+)Z$/,
    "$1-$2-$3T$4:$5:$6.$7Z"
  );
  const d = new Date(recovered);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export default function RunList() {
  const [runs, setRuns] = useState<RunSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listRuns()
      .then(setRuns)
      .catch((e) => setError(String(e)));
  }, []);

  if (error) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4 text-red-900">
        <p className="font-semibold">Failed to load runs</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!runs) {
    return <p className="text-slate-500">Loading runs…</p>;
  }

  return (
    <div>
      <RunControls />
      <ActiveRunsPanel />

      {runs.length === 0 ? (
        <div className="rounded border border-slate-300 bg-white p-6 text-center text-slate-600">
          No completed runs yet. Trigger one from the controls above.
        </div>
      ) : (
        <RunsTable runs={runs} />
      )}
    </div>
  );
}

function RunsTable({ runs }: { runs: RunSummary[] }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Eval Runs</h1>
      <div className="rounded border border-slate-300 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="text-left px-3 py-2">Run</th>
              <th className="text-left px-3 py-2">Skills</th>
              <th className="text-right px-3 py-2">Cases</th>
              <th className="text-right px-3 py-2">Pass / Fail / Error</th>
              <th className="text-right px-3 py-2">Result</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((r) => {
              const allPassed =
                r.totalCases > 0 &&
                r.passed === r.totalCases &&
                r.errored === 0;
              return (
                <tr
                  key={r.runId}
                  className="border-t border-slate-200 hover:bg-slate-50"
                >
                  <td className="px-3 py-2">
                    <Link
                      to={`/runs/${encodeURIComponent(r.runId)}`}
                      className="text-blue-600 hover:underline font-mono text-xs"
                    >
                      {formatTimestamp(r.runId)}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-slate-600">
                    {r.skills.join(", ") || "—"}
                  </td>
                  <td className="px-3 py-2 text-right">{r.totalCases}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs">
                    <span className="text-green-700">{r.passed}</span>
                    {" / "}
                    <span className={r.failed > 0 ? "text-red-700" : ""}>
                      {r.failed}
                    </span>
                    {" / "}
                    <span className={r.errored > 0 ? "text-amber-700" : ""}>
                      {r.errored}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    {allPassed ? (
                      <span className="text-green-700 font-medium">
                        ✓ all pass
                      </span>
                    ) : r.errored > 0 ? (
                      <span className="text-amber-700 font-medium">
                        ⚠ errors
                      </span>
                    ) : (
                      <span className="text-red-700 font-medium">
                        ✗ failures
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
