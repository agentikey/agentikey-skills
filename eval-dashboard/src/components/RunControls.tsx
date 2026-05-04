import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSettings,
  listCases,
  listSkills,
  startRun,
  updateSettings,
} from "../lib/api.ts";

export default function RunControls() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState<string[] | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [cases, setCases] = useState<string[]>([]);
  const [selectedCase, setSelectedCase] = useState<string>("");
  const [maxConcurrent, setMaxConcurrent] = useState<number>(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listSkills().then(setSkills).catch((e) => setError(String(e)));
    getSettings()
      .then((s) => setMaxConcurrent(s.maxConcurrent))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedSkill) {
      setCases([]);
      setSelectedCase("");
      return;
    }
    listCases(selectedSkill)
      .then(setCases)
      .catch((e) => setError(String(e)));
  }, [selectedSkill]);

  async function handleRun(scope: "all" | "skill" | "case") {
    setBusy(true);
    setError(null);
    try {
      const opts: { skill?: string; case?: string } = {};
      if (scope === "skill" || scope === "case") opts.skill = selectedSkill;
      if (scope === "case") opts.case = selectedCase;
      const run = await startRun(opts);
      navigate(`/run/${encodeURIComponent(run.tempId)}`);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleConcurrencyChange(n: number) {
    try {
      const updated = await updateSettings({ maxConcurrent: n });
      setMaxConcurrent(updated.maxConcurrent);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }

  if (!skills) return null;

  return (
    <div className="rounded border border-slate-300 bg-white p-4 mb-6">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-lg font-semibold">Run controls</h2>
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="maxc" className="text-slate-600">
            Max concurrent runs:
          </label>
          <select
            id="maxc"
            value={maxConcurrent}
            onChange={(e) => handleConcurrencyChange(Number(e.target.value))}
            className="border border-slate-300 rounded px-2 py-1 bg-white"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "(serial)" : "(parallel)"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-slate-600 mb-1">Skill</label>
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="border border-slate-300 rounded px-2 py-1 bg-white text-sm min-w-44"
          >
            <option value="">(all skills)</option>
            {skills.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-600 mb-1">Case</label>
          <select
            value={selectedCase}
            onChange={(e) => setSelectedCase(e.target.value)}
            disabled={!selectedSkill}
            className="border border-slate-300 rounded px-2 py-1 bg-white text-sm min-w-60 disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">(all cases)</option>
            {cases.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => handleRun("case")}
            disabled={busy || !selectedSkill || !selectedCase}
            className="px-3 py-1.5 rounded bg-slate-200 text-slate-800 hover:bg-slate-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Run case
          </button>
          <button
            onClick={() => handleRun("skill")}
            disabled={busy || !selectedSkill}
            className="px-3 py-1.5 rounded bg-slate-700 text-white hover:bg-slate-900 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Run skill
          </button>
          <button
            onClick={() => handleRun("all")}
            disabled={busy}
            className="px-3 py-1.5 rounded bg-slate-900 text-white hover:bg-black text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Run regression
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}
    </div>
  );
}
