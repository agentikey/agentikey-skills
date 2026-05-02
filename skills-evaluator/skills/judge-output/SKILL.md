---
name: judge-output
description: Score a specific transcript against a rubric using LLM-as-judge. Uses claude -p (subscription mode) — no API key required. Useful for spot-checking a single skill output ad-hoc, outside the full eval harness. Takes a transcript file path and a skill name (to find the rubric). Outputs structured scores.
---

# Judge Output

Score a single transcript against a rubric. This is a manual / exploratory entry point — for full eval runs, use `/run-evals`.

## When to Run

- You captured a real Claude Code session transcript and want to score it
- You're debugging a rubric and want to test it against a known-good or known-bad transcript
- You want to compare two transcripts (run twice, compare scores)

## Inputs

- `--transcript <path>` — path to the markdown transcript to score
- `--skill <name>` — which skill's rubric to use (must exist at `rubrics/<name>.rubric.md`)
- `--output <path>` (optional) — where to write the judge report (default: stdout)

## Process

1. Verify the rubric exists: `rubrics/<skill>.rubric.md`
2. Verify the transcript file exists and has content
3. Verify `claude` is on PATH (`claude --version`)
4. Call the judge via the underlying script (`scripts/judge.ts`) — which spawns `claude -p` against your subscription
5. Display the result

## Bash invocation

```bash
cd skills-evaluator
npx tsx -e '
  import { judgeOutput } from "./scripts/judge.ts";
  import { readFileSync } from "node:fs";

  const transcript = readFileSync("<transcript-path>", "utf-8");
  const result = await judgeOutput({
    skillName: "<skill>",
    transcript,
    evalCase: {
      caseId: "ad-hoc",
      scenario: "manual judge invocation",
      simulatedResponses: [],
      expectedBehaviors: [],
      antiPatterns: [],
      metadata: {},
    },
    outputPath: "<output-path>",
  });
  console.log(JSON.stringify(result, null, 2));
'
```

## Output

The judge produces a JSON object with:
- `dimensions[]` — score per rubric dimension with reasoning
- `overall` — mean score
- `passed` — boolean per the rubric's pass criteria
- `anti_patterns_triggered[]` — list of anti-patterns found
- `notable_observations` — anything else worth flagging

A markdown version is written to `--output` if provided.

## Caveats

- LLM-as-judge is non-deterministic. Score the same transcript 3 times to gauge variance.
- The judge is biased toward verbosity. Rubrics try to counter this — if you see a long-but-empty transcript get a 5, the rubric needs tightening.
- Subscription mode means the judge runs inside full Claude Code (with your installed skills loaded). The judge prompt explicitly tells Claude not to call other skills, but watch the output if scores feel off.
- "Ad-hoc" mode passes empty `expectedBehaviors` and `antiPatterns` to the judge, so you lose the case-specific anchors. For better judgments, package the transcript as a real eval case.

## Anti-Patterns

- Running the judge once and treating the score as authoritative ❌
- Using ad-hoc mode for production-like evaluation (use real cases) ❌
- Skipping the rubric review when scores feel "off" ❌
