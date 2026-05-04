/**
 * Negative-control test for any skill's rubric calibration.
 *
 * Feeds a hand-corrupted transcript to the judge and reports whether the
 * rubric catches the corruption. A correctly calibrated rubric should mark
 * the corrupted transcript as FAILED. If a deliberately broken transcript
 * still scores PASSED, the rubric is rubber-stamping rather than scoring.
 *
 * Usage:
 *
 *   npx tsx scripts/negative-control.ts \
 *     --skill <skill-name> \
 *     --case <case-id> \
 *     --transcript <path-to-corrupted-transcript>
 *
 * Example:
 *
 *   npx tsx scripts/negative-control.ts \
 *     --skill triage \
 *     --case case-003-cheap-but-sensitive \
 *     --transcript /tmp/corrupted.md
 *
 * The eval case is loaded for context (scenario, expected behaviors,
 * anti-patterns) — the same context the real judge sees during a normal
 * run. The transcript is the file you've hand-edited to introduce a
 * specific failure mode you want the rubric to catch.
 *
 * Exit codes:
 *   0 = negative control PASSED (corruption was correctly flagged FAILED)
 *   1 = negative control FAILED (corruption scored as passing — rubric is broken)
 *   2 = invalid arguments or runtime error
 */

import { readFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import chalk from "chalk";
import { judgeOutput } from "./judge.ts";
import { loadCase } from "./lib/case-loader.ts";

const argv = await yargs(hideBin(process.argv))
  .option("skill", {
    type: "string",
    demandOption: true,
    description: "Skill name (folder name under eval-cases/)",
  })
  .option("case", {
    type: "string",
    demandOption: true,
    description:
      "Case ID — the file name without .md (e.g., case-003-cheap-but-sensitive)",
  })
  .option("transcript", {
    type: "string",
    demandOption: true,
    description: "Path to the corrupted transcript to score",
  })
  .help()
  .parse();

const ROOT = process.cwd();
const casePath = join(ROOT, "eval-cases", argv.skill, `${argv.case}.md`);
const transcriptPath = argv.transcript;

if (!existsSync(casePath)) {
  console.error(chalk.red(`Case file not found: ${casePath}`));
  process.exit(2);
}
if (!existsSync(transcriptPath)) {
  console.error(chalk.red(`Transcript not found: ${transcriptPath}`));
  process.exit(2);
}

const transcript = readFileSync(transcriptPath, "utf-8");
const evalCase = loadCase(casePath);

const outputDir = join(ROOT, "runs/negative-control", argv.skill, argv.case);
mkdirSync(outputDir, { recursive: true });
const outputPath = join(outputDir, "judge.md");

console.log(chalk.bold(`\nNegative Control: ${argv.skill} / ${argv.case}`));
console.log(chalk.dim(`Transcript: ${transcriptPath}`));
console.log(chalk.dim(`Output:     ${outputPath}\n`));

const result = await judgeOutput({
  skillName: argv.skill,
  transcript,
  evalCase,
  outputPath,
});

console.log(chalk.bold(`=== JUDGMENT ===`));
console.log(
  `Pass/fail per rubric: ${
    result.passed ? chalk.green("✅ PASSED") : chalk.red("❌ FAILED")
  }`
);
console.log(`Overall:              ${result.overall.toFixed(2)}/5\n`);

console.log(chalk.bold(`Dimensions:`));
const colWidth = Math.max(...result.dimensions.map((d) => d.name.length));
for (const d of result.dimensions) {
  const color = d.score >= 4 ? chalk.green : d.score >= 3 ? chalk.yellow : chalk.red;
  console.log(`  ${color(`${d.score}/5`)}  ${d.name.padEnd(colWidth)}`);
}

if (result.anti_patterns_triggered.length > 0) {
  console.log(`\n${chalk.bold("Anti-patterns triggered:")}`);
  for (const ap of result.anti_patterns_triggered) {
    console.log(`  - ${chalk.yellow(ap)}`);
  }
}

console.log(`\n${chalk.bold("=== NEGATIVE CONTROL VERDICT ===")}`);
if (result.passed) {
  console.log(
    chalk.red(
      `❌ RUBRIC PROBLEM: corrupted transcript scored as PASSING.\n` +
        `   The rubric is not catching the corruption you introduced.\n` +
        `   Likely calibration issue — review judge reasoning at:\n` +
        `   ${outputPath}`
    )
  );
  process.exit(1);
} else {
  console.log(
    chalk.green(
      `✅ RUBRIC WORKING: corrupted transcript correctly flagged as FAILING.`
    )
  );
  console.log(
    chalk.dim(
      `   Skim the per-dimension reasoning to confirm the deductions match\n` +
        `   the failure modes you introduced. Full report: ${outputPath}`
    )
  );
  process.exit(0);
}
