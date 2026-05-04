# Eval Dashboard

Local read-only dashboard for browsing skill evaluation results produced by
[`skills-evaluator`](../skills-evaluator).

## What this is

Tier 1 + Tier 2 of the dashboard:

**Tier 1 — viewer (read-only):**
- Lists all eval runs from `../skills-evaluator/runs/`, newest first
- Drill into a run to see all skills × cases with pass/fail and scores
- Drill into a case to see the transcript and judge report side-by-side

**Tier 2 — run triggers:**
- Run controls on the home page: pick a skill (or all), optionally a case, click run
- Live SSE streaming of run progress (case-by-case completion, scores, raw stdout)
- "Cancel" button mid-run sends SIGTERM to the harness subprocess
- Re-run shortcuts on RunDetail (per-skill) and CaseDetail (per-case)
- Concurrency setting: serial (1) or up to 5 parallel runs
- Active runs are visible from the home page at all times

No authentication, no database, no cloud — runs entirely on `localhost`. The
dashboard does not write to the runs directory itself; it spawns the harness
which writes via the existing `npm run eval` flow.

## What this is NOT (yet)

- No trends / diffs across runs (Tier 3)
- Not deployable as SaaS — single-user local tool

## Quick start

```
cd eval-dashboard
npm install
npm run dev
# → opens http://localhost:5173
```

`npm run dev` starts the API server on `:4000` and the Vite dev server on
`:5173` concurrently. The Vite dev server proxies `/api/*` to the API
server.

## Configuration

`RUNS_DIR` env var, if set, overrides the default
(`../skills-evaluator/runs/`). Useful if you want the dashboard to point
at a different harness checkout.

## Stack

- Server: Express + tsx
- Frontend: Vite + React + TypeScript + Tailwind
- Markdown rendering: react-markdown + remark-gfm
- Routing: react-router-dom
