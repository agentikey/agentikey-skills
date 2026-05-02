/**
 * Writes a summary report after an eval run.
 */

import { writeFileSync } from "node:fs";
import type { CaseResult } from "./types.ts";

interface WriteSummaryArgs {
  runDir: string;
  timestamp: string;
  results: CaseResult[];
  outputPath: string;
}

export function writeSummary(args: WriteSummaryArgs): void {
  const { timestamp, results, outputPath } = args;

  const lines: string[] = [];
  lines.push(`# Eval Run: ${timestamp}\n`);

  const total = results.length;
  const passed = results.filter((r) => r.stage === "passed").length;
  const judgeFailed = results.filter((r) => r.stage === "judge-failed").length;
  const errored = results.filter((r) => r.stage === "error").length;

  lines.push(`## Summary\n`);
  lines.push(`- **Total cases:** ${total}`);
  lines.push(`- **Passed:** ${passed} ${passed === total ? "✅" : ""}`);
  lines.push(`- **Judge failures:** ${judgeFailed}`);
  lines.push(`- **Errored:** ${errored}\n`);

  // Group by skill
  const bySkill = new Map<string, CaseResult[]>();
  for (const r of results) {
    if (!bySkill.has(r.skillName)) bySkill.set(r.skillName, []);
    bySkill.get(r.skillName)!.push(r);
  }

  lines.push(`## Results by Skill\n`);
  for (const [skill, cases] of bySkill) {
    const skillPassed = cases.filter((c) => c.stage === "passed").length;
    lines.push(`### ${skill} (${skillPassed}/${cases.length})\n`);
    lines.push(`| Case | Verdict | Score | Notes |`);
    lines.push(`| --- | --- | --- | --- |`);
    for (const c of cases) {
      const verdictIcon =
        c.stage === "passed" ? "✅" : c.stage === "error" ? "💥" : "❌";
      const score = c.judge ? `${c.judge.overall.toFixed(2)}/5` : "—";
      const notes = c.error ?? notableForResult(c);
      const safeNotes = notes
        .replace(/\|/g, "\\|")
        .replace(/\n/g, " ")
        .slice(0, 200);
      const link = `./${c.skillName}/${c.caseId}/transcript.md`;
      lines.push(
        `| [${c.caseId}](${link}) | ${verdictIcon} ${c.stage} | ${score} | ${safeNotes} |`
      );
    }
    lines.push("");
  }

  // Judge failures with reasoning
  const judgeIssues = results.filter((r) => r.judge && !r.judge.passed);
  if (judgeIssues.length > 0) {
    lines.push(`## Judge Failures — Weakest Dimensions\n`);
    for (const r of judgeIssues) {
      lines.push(`### ${r.skillName}/${r.caseId} — ${r.judge!.overall.toFixed(2)}/5\n`);
      const sorted = [...r.judge!.dimensions].sort((a, b) => a.score - b.score);
      const weakest = sorted.slice(0, 2);
      for (const d of weakest) {
        lines.push(`- **${d.name}** (${d.score}/5): ${d.reasoning}`);
      }
      if (r.judge!.anti_patterns_triggered.length > 0) {
        lines.push(
          `- Anti-patterns: ${r.judge!.anti_patterns_triggered.join(", ")}`
        );
      }
      lines.push("");
    }
  }

  // Low judge scores even on passing cases (worth tightening)
  const lowOnPass = results
    .filter((r) => r.stage === "passed" && r.judge && r.judge.overall < 4.5)
    .sort((a, b) => a.judge!.overall - b.judge!.overall);
  if (lowOnPass.length > 0) {
    lines.push(`## Passed but Borderline (judge < 4.5/5)\n`);
    for (const r of lowOnPass) {
      lines.push(`- **${r.skillName}/${r.caseId}** — ${r.judge!.overall.toFixed(2)}/5`);
    }
    lines.push("");
  }

  writeFileSync(outputPath, lines.join("\n"));
}

function notableForResult(c: CaseResult): string {
  if (c.stage === "passed") return "all good";
  if (c.judge && !c.judge.passed) {
    const weakest = [...c.judge.dimensions].sort((a, b) => a.score - b.score)[0];
    return `weakest: ${weakest.name} ${weakest.score}/5`;
  }
  return c.error ?? "";
}
