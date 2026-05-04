/**
 * Eval Dashboard server.
 *
 * Reads the skills-evaluator/runs/ directory and exposes three endpoints:
 *
 *   GET /api/runs                          → list all runs (newest first)
 *   GET /api/runs/:runId                   → run detail with per-case scores
 *   GET /api/runs/:runId/:skill/:caseId    → transcript + judge markdown
 *
 * No DB. Reads everything from disk on demand. Cheap to call, easy to debug.
 */

import express from "express";
import cors from "cors";
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const RUNS_DIR =
  process.env.RUNS_DIR ??
  resolve(__dirname, "../../skills-evaluator/runs");

const PORT = Number(process.env.PORT ?? 4000);

const app = express();
app.use(cors());

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

interface CaseResult {
  skill: string;
  caseId: string;
  passed: boolean;
  overall: number | null;
  errored: boolean;
  errorMessage?: string;
}

function isDir(p: string): boolean {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function listSkillFolders(runDir: string): string[] {
  return readdirSync(runDir).filter((entry) => {
    if (entry.startsWith(".")) return false;
    if (entry === "summary.md") return false;
    return isDir(join(runDir, entry));
  });
}

/**
 * Parse a judge.md file. The harness writes a known shape:
 *
 *   # Judge Report
 *   **Verdict:** ✅ PASSED   |   ❌ FAILED
 *   **Overall:** 5.00/5
 *
 * We extract just enough to populate the dashboard summary view.
 */
function parseJudge(judgeMd: string): {
  passed: boolean;
  overall: number | null;
} {
  const passed = /\*\*Verdict:\*\*\s*✅\s*PASSED/i.test(judgeMd);
  const overallMatch = judgeMd.match(/\*\*Overall:\*\*\s*([\d.]+)\s*\/\s*5/);
  const overall = overallMatch ? parseFloat(overallMatch[1]) : null;
  return { passed, overall };
}

function readCaseResults(runDir: string): CaseResult[] {
  const results: CaseResult[] = [];
  const skills = listSkillFolders(runDir);

  for (const skill of skills) {
    const skillDir = join(runDir, skill);
    const caseDirs = readdirSync(skillDir).filter((c) =>
      isDir(join(skillDir, c))
    );

    for (const caseId of caseDirs) {
      const judgePath = join(skillDir, caseId, "judge.md");
      const transcriptPath = join(skillDir, caseId, "transcript.md");

      if (!existsSync(judgePath)) {
        const transcriptExists = existsSync(transcriptPath);
        results.push({
          skill,
          caseId,
          passed: false,
          overall: null,
          errored: true,
          errorMessage: transcriptExists
            ? "judge.md missing — case may have errored before judging"
            : "transcript.md and judge.md missing",
        });
        continue;
      }

      try {
        const judgeMd = readFileSync(judgePath, "utf-8");
        const { passed, overall } = parseJudge(judgeMd);
        results.push({ skill, caseId, passed, overall, errored: false });
      } catch (err) {
        results.push({
          skill,
          caseId,
          passed: false,
          overall: null,
          errored: true,
          errorMessage: String(err),
        });
      }
    }
  }

  results.sort((a, b) => {
    if (a.skill !== b.skill) return a.skill.localeCompare(b.skill);
    return a.caseId.localeCompare(b.caseId);
  });
  return results;
}

function summarizeRun(runId: string) {
  const runDir = join(RUNS_DIR, runId);
  if (!isDir(runDir)) return null;

  const cases = readCaseResults(runDir);
  const passed = cases.filter((c) => c.passed && !c.errored).length;
  const errored = cases.filter((c) => c.errored).length;
  const failed = cases.length - passed - errored;
  const skills = Array.from(new Set(cases.map((c) => c.skill))).sort();

  return {
    runId,
    startedAt: runId, // ISO-ish timestamp is the folder name
    totalCases: cases.length,
    passed,
    failed,
    errored,
    skills,
    cases,
  };
}

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    runsDir: RUNS_DIR,
    runsDirExists: isDir(RUNS_DIR),
  });
});

app.get("/api/runs", (_req, res) => {
  if (!isDir(RUNS_DIR)) {
    res.status(500).json({
      error: `RUNS_DIR does not exist: ${RUNS_DIR}`,
    });
    return;
  }

  const runIds = readdirSync(RUNS_DIR)
    .filter((entry) => isDir(join(RUNS_DIR, entry)) && !entry.startsWith("."))
    .sort()
    .reverse(); // newest first (timestamp folder names)

  const summaries = runIds.map((runId) => {
    const summary = summarizeRun(runId);
    if (!summary) return null;
    // Strip the case-level detail for the list view
    const { cases: _cases, ...rest } = summary;
    return rest;
  });

  res.json(summaries.filter(Boolean));
});

app.get("/api/runs/:runId", (req, res) => {
  const summary = summarizeRun(req.params.runId);
  if (!summary) {
    res.status(404).json({ error: `Run not found: ${req.params.runId}` });
    return;
  }
  res.json(summary);
});

app.get("/api/runs/:runId/:skill/:caseId", (req, res) => {
  const { runId, skill, caseId } = req.params;
  const caseDir = join(RUNS_DIR, runId, skill, caseId);
  if (!isDir(caseDir)) {
    res.status(404).json({ error: `Case not found: ${runId}/${skill}/${caseId}` });
    return;
  }

  const transcriptPath = join(caseDir, "transcript.md");
  const judgePath = join(caseDir, "judge.md");

  const transcript = existsSync(transcriptPath)
    ? readFileSync(transcriptPath, "utf-8")
    : "_transcript.md not found_";
  const judge = existsSync(judgePath)
    ? readFileSync(judgePath, "utf-8")
    : "_judge.md not found_";

  res.json({ runId, skill, caseId, transcript, judge });
});

/* ------------------------------------------------------------------ */
/* Start                                                               */
/* ------------------------------------------------------------------ */

app.listen(PORT, () => {
  console.log(`[eval-dashboard] listening on http://localhost:${PORT}`);
  console.log(`[eval-dashboard] runs dir: ${RUNS_DIR}`);
  if (!isDir(RUNS_DIR)) {
    console.warn(
      `[eval-dashboard] WARNING: runs dir does not exist. Set RUNS_DIR env var or run from eval-dashboard/`
    );
  }
});
