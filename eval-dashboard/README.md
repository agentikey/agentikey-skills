# Eval Dashboard

Local read-only dashboard for browsing skill evaluation results produced by
[`skills-evaluator`](../skills-evaluator).

## What this is

Tier 1 (read-only viewer) of the dashboard:

- Lists all eval runs from `../skills-evaluator/runs/`, newest first
- Drill into a run to see all skills × cases with pass/fail and scores
- Drill into a case to see the transcript and judge report side-by-side

No authentication, no database, no cloud — runs entirely on `localhost`. The
dashboard reads files on demand; it does not write anything to the runs
directory.

## What this is NOT (yet)

- No "trigger a new run" buttons (Tier 2)
- No trends / diffs across runs (Tier 3)
- Not deployable as SaaS — single-user local tool

To trigger new runs, use the harness CLI:
```
cd ../skills-evaluator
npm run eval -- --skill triage
```

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
