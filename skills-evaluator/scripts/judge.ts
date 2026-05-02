/**
 * LLM-as-judge: scores a skill's output against a rubric.
 *
 * Uses `claude -p` (subscription-based). The judge prompt is written to handle
 * either conversational transcripts or final artifacts — whichever the skill
 * happened to produce. The rubric is the source of truth for what "good" means.
 */

import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import type { EvalCase, JudgeResult } from "./lib/types.ts";

const JudgeSchema = z.object({
  dimensions: z.array(
    z.object({
      name: z.string(),
      score: z.number().min(1).max(5),
      reasoning: z.string(),
    })
  ),
  overall: z.number().min(1).max(5),
  passed: z.boolean(),
  anti_patterns_triggered: z.array(z.string()),
  notable_observations: z.string(),
});

interface JudgeArgs {
  skillName: string;
  transcript: string;
  evalCase: EvalCase;
  outputPath: string;
}

const JUDGE_INSTRUCTION = `You are evaluating the output of a Claude Code skill against a rubric.

DO NOT execute the skill. DO NOT run any tools. DO NOT call any other skills.
You are scoring an existing output that someone else already produced.

The output may be EITHER:
(a) a conversational transcript showing the skill's back-and-forth with a user, OR
(b) a final artifact the skill produces (PRD, discovery doc, ADR, brief, etc.), OR
(c) both — a transcript that culminates in an artifact.

Your job is to score whatever was produced against the rubric, regardless of format.

Score each dimension on a 1-5 scale:
1. Read the rubric below.
2. Read the output below.
3. Score each rubric dimension on a 1-5 scale.
4. Identify any anti-patterns triggered.
5. Compute an overall score (mean of dimensions).
6. Determine pass/fail per the rubric's pass criteria.

Be rigorous. Do NOT inflate scores to be polite. The goal is to surface real issues
so the skill can be improved. A 3 is "acceptable but has room to improve." A 5 is
"genuinely excellent." Reserve 5s for output that is hard to fault.

Common biases to resist:
- Verbosity bias: longer is not better. Score on substance.
- Politeness bias: don't soften critique.
- Coverage bias: a long checklist mention is not the same as a deep answer.
- Format bias: don't penalize an artifact for not being a transcript, or vice versa.
  The rubric judges substance, not form.

When a rubric dimension references behavior that's only visible in a transcript
(e.g., "question discipline"), and the output is a final artifact instead, infer
what you can from the artifact's content and quality. If a dimension is genuinely
unscorable from the given output, score it 3 (neutral) and note that in reasoning.

Return your evaluation as JSON matching this exact schema. Output ONLY the JSON,
wrapped in <judge_result> tags so it can be reliably extracted. No preamble, no
markdown fences, no commentary outside the tags.

<judge_result>
{
  "dimensions": [
    {
      "name": "<dimension name from rubric>",
      "score": <1-5>,
      "reasoning": "<2-3 sentences citing specific evidence from the output>"
    }
  ],
  "overall": <mean of dimension scores>,
  "passed": <boolean per rubric pass criteria>,
  "anti_patterns_triggered": ["<anti-pattern name>"],
  "notable_observations": "<anything else worth flagging>"
}
</judge_result>`;

/**
 * Runs `claude -p <prompt>` with stdin closed and returns stdout.
 */
function runClaudePrompt(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";

    const proc = spawn("claude", ["-p", prompt, "--output-format", "text"], {
      stdio: ["ignore", "pipe", "pipe"],
    });

    proc.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    const timeout = setTimeout(() => {
      proc.kill("SIGTERM");
      reject(new Error("Judge invocation timed out after 5 minutes"));
    }, 5 * 60 * 1000);

    proc.on("error", (err) => {
      clearTimeout(timeout);
      const msg = err.message ?? String(err);
      if (msg.includes("ENOENT")) {
        reject(
          new Error(
            "'claude' command not found. Install Claude Code CLI and ensure it's on PATH."
          )
        );
      } else {
        reject(new Error(`spawn claude failed: ${msg}`));
      }
    });

    proc.on("close", (code) => {
      clearTimeout(timeout);

      if (stderr && stderr.trim().length > 0) {
        console.warn(`[judge] stderr: ${stderr.slice(0, 500)}`);
      }

      if (code !== 0) {
        reject(
          new Error(
            `claude -p exited with code ${code}. stderr: ${stderr.slice(0, 500)}`
          )
        );
        return;
      }

      resolve(stdout);
    });
  });
}

export async function judgeOutput(args: JudgeArgs): Promise<JudgeResult> {
  const { skillName, transcript, evalCase, outputPath } = args;

  const rubricPath = join(process.cwd(), "rubrics", `${skillName}.rubric.md`);
  if (!existsSync(rubricPath)) {
    throw new Error(`Rubric not found: ${rubricPath}`);
  }
  const rubric = readFileSync(rubricPath, "utf-8");

  const prompt = `${JUDGE_INSTRUCTION}

---

# Rubric

${rubric}

---

# Eval Case Context

**Scenario:** ${evalCase.scenario}

**Expected behaviors:**
${evalCase.expectedBehaviors.map((b) => `- ${b}`).join("\n")}

**Anti-patterns to flag:**
${evalCase.antiPatterns.map((a) => `- ${a}`).join("\n")}

---

# Output to Score

${transcript}`;

  let stdout: string;
  try {
    stdout = await runClaudePrompt(prompt);
  } catch (err: any) {
    const msg = err.message ?? String(err);
    if (msg.includes("ENOENT") || msg.includes("not found")) {
      throw new Error(
        `'claude' command not found. Install Claude Code CLI and ensure it's on PATH.`
      );
    }
    throw new Error(`Judge claude -p failed: ${msg}`);
  }

  // Extract JSON from <judge_result> tags
  const tagMatch = stdout.match(/<judge_result>\s*([\s\S]+?)\s*<\/judge_result>/);
  let jsonText: string;
  if (tagMatch) {
    jsonText = tagMatch[1].trim();
  } else {
    // Fallback: try to find a JSON object in the output
    const braceMatch = stdout.match(/\{[\s\S]+\}/);
    if (!braceMatch) {
      throw new Error(
        `Judge returned no recognizable JSON. Raw output:\n${stdout.slice(0, 1000)}`
      );
    }
    jsonText = braceMatch[0];
  }

  jsonText = jsonText.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();

  let parsed: z.infer<typeof JudgeSchema>;
  try {
    parsed = JudgeSchema.parse(JSON.parse(jsonText));
  } catch (err: any) {
    throw new Error(
      `Judge returned malformed JSON. Extracted text:\n${jsonText.slice(0, 1000)}\n\nError: ${err.message}`
    );
  }

  const report = renderJudgeReport(parsed);
  writeFileSync(outputPath, report);

  return parsed;
}

function renderJudgeReport(result: z.infer<typeof JudgeSchema>): string {
  const lines: string[] = [];
  lines.push(`# Judge Report\n`);
  lines.push(`**Verdict:** ${result.passed ? "✅ PASSED" : "❌ FAILED"}`);
  lines.push(`**Overall:** ${result.overall.toFixed(2)}/5\n`);

  lines.push(`## Dimensions\n`);
  lines.push(`| Dimension | Score | Reasoning |`);
  lines.push(`| --- | --- | --- |`);
  for (const dim of result.dimensions) {
    const reasoning = dim.reasoning.replace(/\|/g, "\\|").replace(/\n/g, " ");
    lines.push(`| ${dim.name} | ${dim.score}/5 | ${reasoning} |`);
  }
  lines.push("");

  if (result.anti_patterns_triggered.length > 0) {
    lines.push(`## Anti-Patterns Triggered\n`);
    for (const ap of result.anti_patterns_triggered) {
      lines.push(`- ⚠️ ${ap}`);
    }
    lines.push("");
  }

  lines.push(`## Notable Observations\n`);
  lines.push(result.notable_observations);
  lines.push("");

  return lines.join("\n");
}
