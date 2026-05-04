/**
 * Eval Dashboard server.
 *
 * Reads the skills-evaluator/runs/ directory and exposes endpoints for:
 *
 *   Run-history reads:
 *     GET /api/runs                          → list all runs (newest first)
 *     GET /api/runs/:runId                   → run detail with per-case scores
 *     GET /api/runs/:runId/:skill/:caseId    → transcript + judge markdown
 *
 *   Discovery (Tier 2):
 *     GET /api/skills                        → list available skills
 *     GET /api/skills/:skill/cases           → list available cases for a skill
 *
 *   Run triggers (Tier 2):
 *     POST   /api/runs                       → start a run, body: { skill?, case? }
 *     GET    /api/runs/active                → list all active runs
 *     GET    /api/runs/active/:tempId        → snapshot of one active run
 *     DELETE /api/runs/active/:tempId        → cancel an active run
 *     GET    /api/runs/active/:tempId/stream → SSE stream of progress events
 *     GET    /api/settings                   → { maxConcurrent }
 *     POST   /api/settings                   → update settings
 *
 * No DB. Reads everything from disk on demand. Cheap to call, easy to debug.
 */

import express from "express";
import cors from "cors";
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { runManager, HARNESS_DIR, type ProgressEvent } from "./runManager.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const RUNS_DIR =
  process.env.RUNS_DIR ??
  resolve(__dirname, "../../skills-evaluator/runs");

const EVAL_CASES_DIR =
  process.env.EVAL_CASES_DIR ?? resolve(HARNESS_DIR, "eval-cases");

const PORT = Number(process.env.PORT ?? 4000);

const app = express();
app.use(cors());
app.use(express.json());

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
    evalCasesDir: EVAL_CASES_DIR,
    evalCasesDirExists: isDir(EVAL_CASES_DIR),
    harnessDir: HARNESS_DIR,
    harnessDirExists: isDir(HARNESS_DIR),
    maxConcurrentRuns: runManager.getMaxConcurrent(),
    activeRuns: runManager.countActive(),
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

// NOTE: /api/runs/active must be registered before /api/runs/:runId to avoid
// route shadowing. The active-run sub-routes with extra path segments (.../stream,
// .../prune, .../:tempId) don't collide because Express matches on segment count,
// but bare /api/runs/active and /api/runs/:runId both have three segments.
app.get("/api/runs/active", (_req, res) => {
  res.json(runManager.list().map(serializeRun));
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
/* Tier 2: Discovery                                                   */
/* ------------------------------------------------------------------ */

app.get("/api/skills", (_req, res) => {
  if (!isDir(EVAL_CASES_DIR)) {
    res.json([]);
    return;
  }
  const skills = readdirSync(EVAL_CASES_DIR)
    .filter((entry) => isDir(join(EVAL_CASES_DIR, entry)) && !entry.startsWith("_") && !entry.startsWith("."))
    .sort();
  res.json(skills);
});

app.get("/api/skills/:skill/cases", (req, res) => {
  const skillDir = join(EVAL_CASES_DIR, req.params.skill);
  if (!isDir(skillDir)) {
    res.status(404).json({ error: `Skill not found: ${req.params.skill}` });
    return;
  }
  const cases = readdirSync(skillDir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map((f) => f.replace(/\.md$/, ""))
    .sort();
  res.json(cases);
});

/* ------------------------------------------------------------------ */
/* Tier 2: Run triggers                                                */
/* ------------------------------------------------------------------ */

function serializeRun(run: ReturnType<typeof runManager.get>) {
  if (!run) return null;
  return {
    tempId: run.tempId,
    finalRunId: run.finalRunId,
    command: run.command,
    startedAt: run.startedAt,
    status: run.status,
    exitCode: run.exitCode,
    totals: run.totals,
    cancelRequested: run.cancelRequested,
  };
}

app.post("/api/runs", (req, res) => {
  const body = req.body ?? {};
  const skill = typeof body.skill === "string" ? body.skill : undefined;
  const caseId = typeof body.case === "string" ? body.case : undefined;

  try {
    const run = runManager.startRun({ skill, case: caseId });
    res.status(201).json(serializeRun(run));
  } catch (err: any) {
    if (err.code === "MAX_CONCURRENT") {
      res.status(409).json({ error: err.message });
    } else {
      res.status(500).json({ error: err.message ?? String(err) });
    }
  }
});

// (GET /api/runs/active is registered earlier — see route-shadowing note above.)

app.get("/api/runs/active/:tempId", (req, res) => {
  const run = runManager.get(req.params.tempId);
  if (!run) {
    res.status(404).json({ error: "Active run not found" });
    return;
  }
  res.json(serializeRun(run));
});

app.delete("/api/runs/active/:tempId", (req, res) => {
  const cancelled = runManager.cancel(req.params.tempId);
  if (!cancelled) {
    res.status(404).json({
      error:
        "Run not found, already finished, or already cancelled — cannot cancel.",
    });
    return;
  }
  res.json(serializeRun(runManager.get(req.params.tempId)));
});

app.get("/api/runs/active/:tempId/stream", (req, res) => {
  const run = runManager.get(req.params.tempId);
  if (!run) {
    res.status(404).end();
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const send = (ev: ProgressEvent) => {
    res.write(`event: ${ev.type}\n`);
    res.write(`data: ${JSON.stringify(ev)}\n\n`);
  };

  // Replay existing events so the client gets full history
  for (const ev of run.events) send(ev);

  // If the run already finished, close the stream after the replay
  if (
    run.status === "completed" ||
    run.status === "failed" ||
    run.status === "cancelled"
  ) {
    res.end();
    return;
  }

  const listener = (ev: ProgressEvent) => {
    send(ev);
    if (
      ev.type === "completed" ||
      ev.type === "failed" ||
      ev.type === "cancelled"
    ) {
      // Allow the client to receive the terminal event before closing
      setTimeout(() => res.end(), 50);
    }
  };
  runManager.on(`event:${req.params.tempId}`, listener);

  req.on("close", () => {
    runManager.off(`event:${req.params.tempId}`, listener);
  });
});

app.delete("/api/runs/active/:tempId/prune", (req, res) => {
  const ok = runManager.prune(req.params.tempId);
  if (!ok) {
    res.status(409).json({
      error: "Cannot prune: run is still active or not found.",
    });
    return;
  }
  res.json({ ok: true });
});

app.get("/api/settings", (_req, res) => {
  res.json({ maxConcurrent: runManager.getMaxConcurrent() });
});

app.post("/api/settings", (req, res) => {
  const body = req.body ?? {};
  if (typeof body.maxConcurrent === "number") {
    try {
      runManager.setMaxConcurrent(body.maxConcurrent);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
      return;
    }
  }
  res.json({ maxConcurrent: runManager.getMaxConcurrent() });
});

/* ------------------------------------------------------------------ */
/* Start                                                               */
/* ------------------------------------------------------------------ */

app.listen(PORT, () => {
  console.log(`[eval-dashboard] listening on http://localhost:${PORT}`);
  console.log(`[eval-dashboard] runs dir:       ${RUNS_DIR}`);
  console.log(`[eval-dashboard] eval cases dir: ${EVAL_CASES_DIR}`);
  console.log(`[eval-dashboard] harness dir:    ${HARNESS_DIR}`);
  if (!isDir(RUNS_DIR)) {
    console.warn(
      `[eval-dashboard] WARNING: runs dir does not exist. Set RUNS_DIR env var or run from eval-dashboard/`
    );
  }
  if (!isDir(HARNESS_DIR)) {
    console.warn(
      `[eval-dashboard] WARNING: harness dir does not exist — run triggers will fail. Set HARNESS_DIR env var.`
    );
  }
});
