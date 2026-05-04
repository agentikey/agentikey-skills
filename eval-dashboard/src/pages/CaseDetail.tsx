import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getCase } from "../lib/api.ts";
import type { CaseDetail as CaseDetailType } from "../lib/types.ts";

export default function CaseDetail() {
  const { runId, skill, caseId } = useParams<{
    runId: string;
    skill: string;
    caseId: string;
  }>();
  const [data, setData] = useState<CaseDetailType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"side-by-side" | "judge" | "transcript">(
    "side-by-side"
  );

  useEffect(() => {
    if (!runId || !skill || !caseId) return;
    getCase(runId, skill, caseId)
      .then(setData)
      .catch((e) => setError(String(e)));
  }, [runId, skill, caseId]);

  if (error) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4 text-red-900">
        <p className="font-semibold">Failed to load case</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }
  if (!data) return <p className="text-slate-500">Loading case…</p>;

  return (
    <div>
      <div className="text-sm text-slate-500 mb-1">
        <Link to="/" className="text-blue-600 hover:underline">
          All runs
        </Link>
        {" · "}
        <Link
          to={`/runs/${encodeURIComponent(data.runId)}`}
          className="text-blue-600 hover:underline font-mono text-xs"
        >
          {data.runId}
        </Link>
      </div>
      <h1 className="text-2xl font-semibold mb-1">
        <span className="text-slate-600">{data.skill}</span>
        <span className="text-slate-400"> / </span>
        <span className="font-mono">{data.caseId}</span>
      </h1>

      <div className="flex gap-1 mt-4 mb-3 text-sm">
        {(["side-by-side", "judge", "transcript"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 rounded ${
              tab === t
                ? "bg-slate-900 text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            {t === "side-by-side"
              ? "Side-by-side"
              : t === "judge"
                ? "Judge"
                : "Transcript"}
          </button>
        ))}
      </div>

      {tab === "side-by-side" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Pane title="Transcript" md={data.transcript} />
          <Pane title="Judge" md={data.judge} />
        </div>
      )}
      {tab === "judge" && <Pane title="Judge" md={data.judge} />}
      {tab === "transcript" && (
        <Pane title="Transcript" md={data.transcript} />
      )}
    </div>
  );
}

function Pane({ title, md }: { title: string; md: string }) {
  return (
    <div className="rounded border border-slate-300 bg-white overflow-hidden">
      <div className="bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 border-b border-slate-300">
        {title}
      </div>
      <div className="px-4 py-3 prose-judge max-h-[75vh] overflow-y-auto">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
      </div>
    </div>
  );
}
