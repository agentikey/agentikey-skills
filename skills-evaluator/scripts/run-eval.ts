#!/usr/bin/env tsx
/**
 * Main entry point for running evaluations.
 *
 * Single-stage harness: run skill via claude -p, then judge the output via
 * claude -p against the rubric. No deterministic structural checks — the
 * judge is the sole arbiter of pass/fail.
 *
 * Both Claude invocations use your subscription. No API key required.
 *
 * Usage:
 *   npm run eval                                        # all skills, all cases
 *   npm run eval -- --skill grill-me                    # one skill
 *   npm run eval -- --skill grill-me --case case-001    # one case
 *   npm run eval -- --concurrency 1                     # serial (lowest burst)
 *   npm run eval -- --concurrency 5                     # more parallel (faster)
 */

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import chalk from "chalk";
import { runSkill } from "./run-skill.ts";
import { judgeOutput } from "./judge.ts";
import { loadCase } from "./lib/case-loader.ts";
import { writeSummary } from "./lib/summary-writer.ts";
import { pLimit } from "./lib/p-limit.ts";
import type { CaseResult } from "./lib/types.ts";

const DEFAULT_SKILLS_DIR = join(homedir(), ".claude", "skills");

const argv = await yargs(hideBin(process.argv))
  .option("skill", {
    type: "string",
    description: "Run evals for a single skill (folder name under eval-cases/)",
  })
  .option("case", {
    type: "string",
    description: "Run a single case (file name without .md)",
  })
  .option("concurrency", {
    type: "number",
    default: 3,
    description:
      "How many cases to run in parallel. Each case spawns 2 claude -p processes " +
      "(skill + judge), so concurrency=3 means up to 6 concurrent claude processes. " +
      "Lower this if you hit subscription rate limits.",
  })
  .option("skills-dir", {
    type: "string",
    default: DEFAULT_SKILLS_DIR,
    description:
      "Directory containing the skills being evaluated. Used for snapshotting " +
      "the SKILL.md into the run output for reproducibility.",
  })
  .help()
  .parse();

const ROOT = process.cwd();
const EVAL_CASES_DIR = join(ROOT, "eval-cases");
const RUNS_DIR = join(ROOT, "runs");

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const runDir = join(RUNS_DIR, timestamp);
mkdirSync(runDir, { recursive: true });

console.log(chalk.bold(`\n📋 Skills Evaluator`));
console.log(chalk.dim(`Run: ${timestamp}`));
console.log(chalk.dim(`Output: ${runDir}`));
console.log(chalk.dim(`Concurrency: ${argv.concurrency}`));
console.log();

const skillsToRun = argv.skill
  ? [argv.skill]
  : readdirSync(EVAL_CASES_DIR).filter(
      (d) => !d.startsWith("_") && !d.startsWith(".")
    );

interface PendingCase {
  skillName: string;
  caseId: string;
  caseDir: string;
  evalCase: ReturnType<typeof loadCase>;
}

const pending: PendingCase[] = [];

for (const skillName of skillsToRun) {
  const skillDir = join(EVAL_CASES_DIR, skillName);
  if (!existsSync(skillDir)) {
    console.log(chalk.yellow(`⚠️  Skipping ${skillName}: no eval cases directory`));
    continue;
  }

  const caseFiles = readdirSync(skillDir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .filter((f) => !argv.case || f.startsWith(argv.case));

  if (caseFiles.length === 0) {
    console.log(chalk.yellow(`⚠️  No cases found for ${skillName}`));
    continue;
  }

  // Snapshot SKILL.md once per skill for reproducibility
  const skillSnapshotSrc = join(argv["skills-dir"]!, skillName, "SKILL.md");
  const skillRunDir = join(runDir, skillName);
  mkdirSync(skillRunDir, { recursive: true });
  if (existsSync(skillSnapshotSrc)) {
    copyFileSync(skillSnapshotSrc, join(skillRunDir, "SKILL.snapshot.md"));
  } else {
    console.log(
      chalk.yellow(
        `  ⚠️  could not snapshot SKILL.md (not found at ${skillSnapshotSrc})`
      )
    );
  }

  for (const caseFile of caseFiles) {
    const caseId = caseFile.replace(/\.md$/, "");
    const caseDir = join(runDir, skillName, caseId);
    mkdirSync(caseDir, { recursive: true });
    const evalCase = loadCase(join(skillDir, caseFile));
    pending.push({ skillName, caseId, caseDir, evalCase });
  }
}

if (pending.length === 0) {
  console.log(chalk.yellow("No cases to run."));
  process.exit(0);
}

console.log(
  chalk.bold(
    `Running ${pending.length} cases across ${skillsToRun.length} skills (max ${argv.concurrency} parallel)\n`
  )
);

const limit = pLimit(argv.concurrency);

const allResults = await Promise.all(
  pending.map((p) =>
    limit(async (): Promise<CaseResult> => {
      const result: CaseResult = {
        skillName: p.skillName,
        caseId: p.caseId,
        stage: "loaded",
        checks: { passed: true, results: [] }, // legacy field, always pass
        judge: null,
        transcript: "",
        error: null,
      };

      const label = `${p.skillName}/${p.caseId}`;
      console.log(chalk.dim(`▶ start  ${label}`));

      try {
        // Stage 1: Run the skill via claude -p
        const transcript = await runSkill({
          skillName: p.skillName,
          scenario: p.evalCase.scenario,
          simulatedResponses: p.evalCase.simulatedResponses,
          outputPath: join(p.caseDir, "transcript.md"),
        });
        result.transcript = transcript;
        result.stage = "ran";

        // Sanity: transcript not trivially empty/errored
        if (transcript.trim().length < 200) {
          result.error = `transcript too short (${transcript.trim().length} chars) — claude -p may have failed`;
          result.stage = "error";
          console.log(chalk.red(`✗ ${label}  transcript too short`));
          return result;
        }
        if (/^Error:|Authentication failed|API key/i.test(transcript.slice(0, 500))) {
          result.error = "claude returned an error — see transcript";
          result.stage = "error";
          console.log(chalk.red(`✗ ${label}  claude returned error`));
          return result;
        }

        // Stage 2: Judge
        const judge = await judgeOutput({
          skillName: p.skillName,
          transcript,
          evalCase: p.evalCase,
          outputPath: join(p.caseDir, "judge.md"),
        });
        result.judge = judge;
        result.stage = judge.passed ? "passed" : "judge-failed";

        if (judge.passed) {
          console.log(
            chalk.green(`✓ ${label}  passed (${judge.overall.toFixed(1)}/5)`)
          );
        } else {
          console.log(
            chalk.red(`✗ ${label}  failed (${judge.overall.toFixed(1)}/5)`)
          );
        }
      } catch (err: any) {
        result.error = err.message ?? String(err);
        result.stage = "error";
        console.log(chalk.red(`✗ ${label}  error: ${result.error}`));
      }

      return result;
    })
  )
);

const summaryPath = join(runDir, "summary.md");
writeSummary({ runDir, timestamp, results: allResults, outputPath: summaryPath });

console.log(chalk.bold(`\n📄 Summary: ${summaryPath}`));

const failed = allResults.filter((r) => r.stage !== "passed").length;
if (failed > 0) {
  console.log(chalk.red(`\n✗ ${failed} of ${allResults.length} cases failed`));
  process.exit(1);
} else {
  console.log(chalk.green(`\n✓ All ${allResults.length} cases passed`));
  process.exit(0);
}
