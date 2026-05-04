import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getRun } from "../lib/api.ts";
import type { RunDetail as RunDetailType } from "../lib/types.ts";

export default function RunDetail() {
  const { runId } = useParams<{ runId: string }>();
  const [run, setRun] = useState<RunDetailType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) return;
    getRun(runId)
      .then(setRun)
      .catch((e) => setError(String(e)));
  }, [runId]);

  if (error) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4 text-red-900">
        <p className="font-semibold">Failed to load run</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }
  if (!run) return <p className="text-slate-500">Loading run…</p>;

  // Group cases by skill
  const casesBySkill = run.cases.reduce<
    Record<string, typeof run.cases>
  >((acc, c) => {
    (acc[c.skill] ??= []).push(c);
    return acc;
  }, {});

  return (
    <div>
      <div className="text-sm text-slate-500 mb-1">
        <Link to="/" className="text-blue-600 hover:underline">
          ← All runs
        </Link>
      </div>
      <h1 className="text-2xl font-semibold mb-1 font-mono text-slate-700">
        {run.runId}
      </h1>
      <p className="text-sm text-slate-600 mb-6">
        {run.totalCases} cases · {" "}
        <span className="text-green-700">{run.passed} passed</span> · {" "}
        <span className={run.failed > 0 ? "text-red-700" : ""}>
          {run.failed} failed
        </span>
        {run.errored > 0 && (
          <>
            {" · "}
            <span className="text-amber-700">{run.errored} errored</span>
          </>
        )}
      </p>

      <div className="space-y-6">
        {Object.entries(casesBySkill).map(([skill, cases]) => (
          <section key={skill}>
            <h2 className="text-lg font-semibold mb-2">
              {skill}{" "}
              <span className="text-sm font-normal text-slate-500">
                ({cases.filter((c) => c.passed).length}/{cases.length})
              </span>
            </h2>
            <div className="rounded border border-slate-300 bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="text-left px-3 py-2">Case</th>
                    <th className="text-right px-3 py-2 w-20">Score</th>
                    <th className="text-right px-3 py-2 w-24">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c) => (
                    <tr
                      key={c.caseId}
                      className="border-t border-slate-200 hover:bg-slate-50"
                    >
                      <td className="px-3 py-2">
                        <Link
                          to={`/runs/${encodeURIComponent(
                            run.runId
                          )}/${encodeURIComponent(skill)}/${encodeURIComponent(
                            c.caseId
                          )}`}
                          className="text-blue-600 hover:underline font-mono text-xs"
                        >
                          {c.caseId}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-xs">
                        {c.overall != null
                          ? `${c.overall.toFixed(2)}/5`
                          : "—"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {c.errored ? (
                          <span
                            className="text-amber-700 font-medium"
                            title={c.errorMessage}
                          >
                            ⚠ error
                          </span>
                        ) : c.passed ? (
                          <span className="text-green-700 font-medium">
                            ✓ pass
                          </span>
                        ) : (
                          <span className="text-red-700 font-medium">
                            ✗ fail
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
