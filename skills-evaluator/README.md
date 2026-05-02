# Skills Evaluator

A meta-evaluation harness for testing Claude Code skills. Runs your skill against scenarios, then uses LLM-as-judge to score the output against a rubric.

**Subscription-only mode** — uses your Claude Code subscription via `claude -p` for everything. No API key required.

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│  npm run eval (TypeScript orchestrator)                        │
│                                                                │
│  Runs N cases in parallel (default 3):                         │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Per case (sequential within):                         │    │
│  │    1. claude -p "execute the skill"  → output          │    │
│  │    2. claude -p "judge this output"  → judge.md        │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                │
│  Aggregates → runs/<timestamp>/summary.md                      │
└────────────────────────────────────────────────────────────────┘
```

Both Claude calls go through your subscription. The judge is the sole arbiter of pass/fail.

## Why no structural checks?

Earlier versions of this harness had deterministic checks (regex against the transcript). They were brittle — `claude -p` produces different output formats run-to-run (sometimes a transcript, sometimes a final artifact, sometimes both). The checks kept producing false negatives on legitimately good output.

The judge handles both formats and scores on substance. That's what you actually care about.

## Layout

```
skills-evaluator/
├── README.md                       this file
├── package.json
├── tsconfig.json
├── .vscode/tasks.json              VS Code task definitions
├── eval-cases/                     test corpus
│   └── <skill-name>/
│       ├── case-001-<slug>.md      one case per file
│       └── case-002-<slug>.md
├── rubrics/                        what "good" looks like
│   └── <skill-name>.rubric.md
├── scripts/
│   ├── run-eval.ts                 main entry point (parallel orchestrator)
│   ├── run-skill.ts                invokes claude -p to execute a skill
│   ├── judge.ts                    invokes claude -p to score against a rubric
│   ├── verify.ts                   environment sanity check
│   ├── open-summary.ts             opens latest run summary in VS Code
│   └── lib/                        shared utilities
├── skills/                         Claude Code skills for the evaluator itself
│   ├── run-evals/SKILL.md
│   └── judge-output/SKILL.md
└── runs/                           timestamped output, gitignored
    └── <iso-timestamp>/
        ├── summary.md
        └── <skill-name>/
            ├── SKILL.snapshot.md   copy of the SKILL.md being tested
            └── <case>/
                ├── transcript.md   what the skill produced
                └── judge.md        LLM-as-judge score
```

## Setup

### Where this lives relative to your skills

This is a **separate repo** from your skills. Recommended layout:

```
~/code/
├── planning-suite/              ← your skills (markdown only)
│   ├── skills/
│   ├── commands/
│   └── README.md
└── skills-evaluator/            ← this thing
    ├── eval-cases/
    ├── rubrics/
    ├── scripts/
    └── runs/                    ← gitignored, eval output lives here
```

Skills get installed to `~/.claude/skills/` (Claude Code's pickup path). The
evaluator targets that path by default.

### Iteration workflow

The fast loop when tweaking a skill:

```bash
# 1. Edit the source
vim ~/code/planning-suite/skills/grill-me/SKILL.md

# 2. Sync to deployed location (or use a symlink — see below)
cp ~/code/planning-suite/skills/grill-me/SKILL.md \
   ~/.claude/skills/grill-me/SKILL.md

# 3. Run evals
cd ~/code/skills-evaluator
npm run eval -- --skill grill-me
```

To skip step 2 forever, symlink instead of copy:

```bash
rm -rf ~/.claude/skills/grill-me
ln -s ~/code/planning-suite/skills/grill-me ~/.claude/skills/grill-me
```

### Prerequisites

- macOS or Linux
- Node.js 20+
- Claude Code CLI installed and authenticated (`claude --version`)
- Active Claude subscription (Pro, Max, Team)

### Install

```bash
cd skills-evaluator
npm install
npm run verify
```

## Usage

```bash
# All skills, all cases
npm run eval

# One skill
npm run eval -- --skill grill-me

# Single case
npm run eval -- --skill grill-me --case case-001-saas-mvp

# Serial (avoid rate limits)
npm run eval -- --concurrency 1

# More parallelism (faster)
npm run eval -- --concurrency 5
```

### From VS Code

`Cmd+Shift+P → Tasks: Run Task`, then pick:

- **Evaluate: All Skills**
- **Evaluate: Current Skill**
- **Evaluate: Single Case**
- **Evaluate: Serial (lowest subscription burst)**
- **Open Last Run Summary**
- **Verify Eval Environment**

### Output

After a run:

```
runs/<timestamp>/summary.md
```

Includes:
- Per-case verdict and score
- Failed cases with weakest dimension called out
- Borderline passes (score < 4.5/5)
- Links to individual transcripts and judge reports

Each run also snapshots `SKILL.md` at `runs/<timestamp>/<skill>/SKILL.snapshot.md` so you can diff against old runs to attribute regressions.

## Concurrency tuning

Each parallel case spawns up to 2 `claude -p` processes (skill + judge). Default `--concurrency 3` means up to 6 concurrent claude processes.

| Situation | Recommended |
| --- | --- |
| First-time run, want to see it work | `--concurrency 1` |
| Daily iteration, ~10 cases | `3` (default) |
| Big batch, ~50 cases | `5` |
| Hitting subscription rate limits | `1` or `2` |

## Adding a new eval case

1. Create `eval-cases/<skill-name>/case-NNN-<slug>.md`
2. Use `eval-cases/_template.md` as a starting point
3. Run `npm run eval -- --skill <skill-name> --case case-NNN-<slug>` to validate

## Adding a new skill to evaluate

1. Add a rubric: `rubrics/<skill-name>.rubric.md`
2. Add at least 3 eval cases under `eval-cases/<skill-name>/`
3. Run `npm run eval -- --skill <new-skill>` to verify

That's it. No checks to write.

## Caveats

- LLM-as-judge is non-deterministic. Run important comparisons 3x and average.
- The judge has biases (verbosity, politeness). The rubrics try to counteract them.
- This evaluator does NOT test that skills "feel right" interactively — only that their output is good. For UX feel, run them manually.
- Eval cases need maintenance. When you intentionally change a skill's behavior, update the cases and rubrics.
- `claude -p` runs the judge inside full Claude Code context (your installed skills are loaded). The judge prompt explicitly says *"DO NOT execute the skill. DO NOT call any other skills."* — but if scores feel off, check whether it tried.

## When the harness isn't worth running

Be honest with yourself: if you're running fewer than 5 evals a week, manual review of `claude -p` output is probably faster than maintaining this harness. Use it when:

- You're tuning a skill's prompt and want regression detection across a fixed scenario set
- You've shipped a skill change and want to verify nothing broke before deploying
- You have a corpus of "this worked"/"this didn't" cases worth automating against

Don't use it as a substitute for actually running your skills on real engagements.
