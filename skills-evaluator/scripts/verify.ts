#!/usr/bin/env tsx
/**
 * Verifies the eval environment is set up correctly.
 *
 * Subscription mode: ANTHROPIC_API_KEY is NOT required. The harness uses
 * `claude -p` for both skill execution and the judge.
 *
 * Run with: npm run verify
 */

import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";
import chalk from "chalk";

const execFileAsync = promisify(execFile);

interface Check {
  name: string;
  required: boolean;
  fn: () => Promise<{ ok: boolean; detail?: string }>;
}

const checks: Check[] = [
  {
    name: "claude CLI on PATH",
    required: true,
    fn: async () => {
      try {
        const { stdout } = await execFileAsync("claude", ["--version"]);
        return { ok: true, detail: stdout.trim() };
      } catch {
        return { ok: false, detail: "Install Claude Code CLI" };
      }
    },
  },
  {
    name: "Node version >= 20",
    required: true,
    fn: async () => {
      const major = parseInt(process.versions.node.split(".")[0]);
      if (major < 20) {
        return { ok: false, detail: `Got ${process.versions.node}, need 20+` };
      }
      return { ok: true, detail: process.versions.node };
    },
  },
  {
    name: "eval-cases/ directory exists",
    required: true,
    fn: async () => ({
      ok: existsSync(join(process.cwd(), "eval-cases")),
    }),
  },
  {
    name: "rubrics/ directory exists",
    required: true,
    fn: async () => ({
      ok: existsSync(join(process.cwd(), "rubrics")),
    }),
  },
  {
    name: "ANTHROPIC_API_KEY (optional, only needed if you run the SDK directly)",
    required: false,
    fn: async () => {
      if (process.env.ANTHROPIC_API_KEY) {
        return { ok: true, detail: "set" };
      }
      return { ok: true, detail: "not set (fine for subscription mode)" };
    },
  },
];

console.log(chalk.bold("Verifying eval environment\n"));

let allRequiredOk = true;
for (const check of checks) {
  process.stdout.write(`  ${check.name} ... `);
  const result = await check.fn();
  if (result.ok) {
    process.stdout.write(chalk.green("✓"));
    if (result.detail) process.stdout.write(chalk.dim(` (${result.detail})`));
    process.stdout.write("\n");
  } else {
    process.stdout.write(check.required ? chalk.red("✗") : chalk.yellow("⚠"));
    if (result.detail) process.stdout.write(chalk.dim(` ${result.detail}`));
    process.stdout.write("\n");
    if (check.required) allRequiredOk = false;
  }
}

console.log();
if (allRequiredOk) {
  console.log(chalk.green.bold("✓ Required checks passed. Ready to evaluate."));
  console.log(
    chalk.dim("Mode: subscription (claude -p for both skill execution and judge)")
  );
  process.exit(0);
} else {
  console.log(
    chalk.red.bold("✗ Some required checks failed. Fix them before running evals.")
  );
  process.exit(1);
}