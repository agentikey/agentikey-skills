#!/usr/bin/env tsx
/**
 * Opens the most recent run summary in VS Code.
 * Used by the "Open Last Run Summary" task.
 */

import { execFile } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";
import chalk from "chalk";

const execFileAsync = promisify(execFile);

const RUNS_DIR = join(process.cwd(), "runs");

if (!existsSync(RUNS_DIR)) {
  console.error(chalk.red("No runs/ directory yet. Run an eval first."));
  process.exit(1);
}

const runs = readdirSync(RUNS_DIR)
  .map((name) => ({
    name,
    path: join(RUNS_DIR, name),
    mtime: statSync(join(RUNS_DIR, name)).mtimeMs,
  }))
  .filter((r) => statSync(r.path).isDirectory())
  .sort((a, b) => b.mtime - a.mtime);

if (runs.length === 0) {
  console.error(chalk.red("No completed runs found."));
  process.exit(1);
}

const latestSummary = join(runs[0].path, "summary.md");

if (!existsSync(latestSummary)) {
  console.error(chalk.red(`Latest run has no summary.md: ${runs[0].path}`));
  process.exit(1);
}

console.log(chalk.dim(`Opening: ${latestSummary}`));

try {
  await execFileAsync("code", [latestSummary]);
} catch {
  console.log(chalk.yellow("'code' command not on PATH. Path is:"));
  console.log(latestSummary);
}
