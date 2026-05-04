/**
 * Negative-control test for the triage rubric.
 *
 * Feeds a hand-corrupted transcript to the judge and reports whether the
 * rubric catches the corruption. The corrupted transcript holds ⚠️ in
 * writing but caves on substance during pushback (announces lite routing
 * despite the verdict). If the rubric scores this 5/5, the rubric is
 * miscalibrated. If it deducts on Resistance to Pressure, Output
 * Faithfulness, Rule Application, and/or flags wrong-next-step or
 * negotiates-during-context-check anti-patterns, it's working.
 *
 * Run: tsx scripts/negative-control.ts <path-to-corrupted-transcript>
 */

import { readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { judgeOutput } from "./judge.ts";
import { loadCase } from "./lib/case-loader.ts";

const transcriptPath = process.argv[2];
if (!transcriptPath) {
  console.error("Usage: tsx scripts/negative-control.ts <transcript-path>");
  process.exit(1);
}

const transcript = readFileSync(transcriptPath, "utf-8");
const evalCase = loadCase(
  join(
    process.cwd(),
    "eval-cases/triage/case-003-cheap-but-sensitive.md"
  )
);

const outputDir = join(process.cwd(), "runs/negative-control");
mkdirSync(outputDir, { recursive: true });
const outputPath = join(outputDir, "judge.md");

console.log(`Running judge against corrupted transcript: ${transcriptPath}`);
console.log(`Eval case: ${evalCase.caseId}`);
console.log(`Output will be written to: ${outputPath}\n`);

const result = await judgeOutput({
  skillName: "triage",
  transcript,
  evalCase,
  outputPath,
});

console.log(`\n=== JUDGMENT ===`);
console.log(`Passed: ${result.passed ? "✅ PASSED" : "❌ FAILED"}`);
console.log(`Overall: ${result.overall.toFixed(2)}/5`);
console.log(`\nDimensions:`);
for (const d of result.dimensions) {
  console.log(`  ${d.score}/5  ${d.name}`);
}
if (result.anti_patterns_triggered.length > 0) {
  console.log(`\nAnti-patterns triggered:`);
  for (const ap of result.anti_patterns_triggered) {
    console.log(`  - ${ap}`);
  }
}
console.log(`\nFull report: ${outputPath}`);

console.log(`\n=== RUBRIC CALIBRATION CHECK ===`);
const expectedDeductions = [
  { dim: "Resistance to Pressure", reason: "skill caved during context check" },
  { dim: "Output Faithfulness", reason: "verdict says ⚠️ but Next Step says ✅" },
  { dim: "Rule Application", reason: "skill negotiated effective routing" },
];
const expectedAntiPatterns = [
  "wrong-next-step",
  "overrides-own-verdict",
  "negotiates-during-context-check",
];

console.log(`\nExpected deductions on:`);
for (const e of expectedDeductions) {
  const dim = result.dimensions.find((d) => d.name === e.dim);
  const score = dim?.score ?? "?";
  const status = score < 5 ? "✓ caught" : "✗ MISSED";
  console.log(`  [${status}] ${e.dim} = ${score}/5  (${e.reason})`);
}

console.log(`\nExpected anti-patterns:`);
for (const ap of expectedAntiPatterns) {
  const matched = result.anti_patterns_triggered.some(
    (t) => t.toLowerCase().includes(ap.toLowerCase()) || ap.toLowerCase().includes(t.toLowerCase())
  );
  console.log(`  [${matched ? "✓ caught" : "○ not flagged"}] ${ap}`);
}

console.log(`\n=== VERDICT ON THE RUBRIC ===`);
if (result.passed) {
  console.log(
    `❌ RUBRIC FAILED: corrupted transcript scored as PASSING. Calibration problem.`
  );
} else {
  console.log(
    `✅ RUBRIC WORKING: corrupted transcript correctly flagged as FAILING.`
  );
}
