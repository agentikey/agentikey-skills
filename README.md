# Agentikey Skills

A monorepo containing the **planning skills** Agentikey uses to take a small-business client from "I have an idea" to "developers are building the right thing", plus the **evaluation harness** that keeps those skills honest as they evolve.

This repo exists to make two things reproducible:

1. **The planning workflow itself** — every step from client intake through filed GitHub issues, encoded as Claude Code skills so a junior consultant gets the same rigor as a senior one.
2. **The quality bar of those skills over time** — every change to a skill is regression-tested with LLM-as-judge against a corpus of fixed scenarios, so prompt edits do not silently degrade output.

If you only want to *use* the skills, you only need [planning-suite/](planning-suite/). If you are *editing* the skills (or building new ones), you also want [skills-evaluator/](skills-evaluator/).

---

## Repo layout

```
agentikey-skills/
├── README.md                  ← you are here
├── planning-suite/            ← the skills (markdown only, Plan-Mode)
│   ├── README.md              full skill catalog + workflow diagram
│   ├── CLAUDE.md              cross-cutting rules every skill obeys
│   ├── commands/              orchestrator commands (e.g. /plan-from-zero)
│   └── skills/
│       ├── intake/            client-intake, grill-me
│       ├── synthesis/         to-prd, tech-stack-advisor, architecture-diagram, feasibility-pass
│       ├── review/            prd-adversarial-review
│       ├── decomposition/     to-github-prd-issue, to-issues
│       └── compounding/       decision-log
└── skills-evaluator/          ← the eval harness (TypeScript, runs against subscription)
    ├── README.md              setup, usage, concurrency tuning, caveats
    ├── eval-cases/            test corpus, one folder per skill
    ├── rubrics/               what "good" looks like, per skill
    ├── scripts/               run-eval.ts, judge.ts, etc.
    └── runs/                  timestamped output (gitignored)
```

---

## What this project does

### 1. Planning Suite — opinionated skills for the planning phase

A pack of Claude Code skills that together form a **complete planning pipeline** for a client engagement. Each skill is a markdown file with a frontmatter description and a body of instructions; Claude Code loads them as slash commands.

The pipeline is intentionally sequential and gated:

```
/client-intake          capture stakeholders, budget, deadlines, constraints
        ↓
/grill-me               Socratic interrogation until 95% alignment confidence
        ↓
/feasibility-pass       walk each requirement, surface implications + tensions
        ↓
/tech-stack-advisor     stack proposal with run-cost estimate
        ↓
/to-prd                 structured PRD synthesized from the conversation
        ↓
/architecture-diagram   Mermaid: C4 context, sequence, ER, state, deployment
        ↓
/prd-adversarial-review 5 critical lenses in parallel, then synthesized
        ↓
/to-github-prd-issue    parent epic issue filed via gh CLI
        ↓
/to-issues              vertical-slice child issues, dependency-ordered
        ↓
/decision-log           ADRs for every non-obvious call made along the way
```

The whole chain runs in **Plan Mode** — read code, read docs, write markdown and GitHub issues. **No production code is written until planning is signed off.** That separation is the whole point.

For the skill-by-skill catalog, mode rules, and the `/plan-from-zero` orchestrator, see [planning-suite/README.md](planning-suite/README.md).

### 2. Skills Evaluator — keeping the skills honest

A meta-evaluation harness that tests the skills the way a CI suite tests code. For each skill:

- A **rubric** defines what "good" output looks like.
- A folder of **eval cases** defines representative inputs (clean, adversarial, insufficient-context, etc.).
- The harness runs the skill against each case via `claude -p`, then runs an LLM-as-judge to score the output against the rubric.
- A **summary** report flags failures and borderline passes, with links to per-case transcripts and judge reasoning.

It runs entirely through your **Claude subscription** (no API key required) — both the skill execution and the judge use `claude -p`.

For setup, usage, concurrency tuning, and the rationale behind LLM-as-judge over deterministic checks, see [skills-evaluator/README.md](skills-evaluator/README.md).

---

## What this project should be used for

### Use it when

- You are running a **small-business consultancy** that ships products for clients and need every engagement to start with a defensible planning artifact set (PRD, ADRs, GitHub epic + child issues).
- You are an **internal product team** that wants the same discipline on cross-team initiatives.
- You are **iterating on a Claude Code skill** and want regression detection before you ship the change.
- You are **building a new planning skill** and want a rubric-driven way to know it actually works.

### Do not use it for

- Replacing engineering judgment. The skills produce a strong default; a human still owns the final call.
- One-off questions where a five-minute conversation with the user would do. The pipeline has overhead — it is worth it for engagements, not for trivia.
- Production-code generation. These skills explicitly stop at the planning boundary. After `/to-issues`, you switch out of Plan Mode and a different toolchain takes over.
- Continuous evaluation in a tight loop. The harness is for **before/after** comparisons on intentional changes, not for every keystroke. See "When the harness isn't worth running" in [skills-evaluator/README.md](skills-evaluator/README.md#when-the-harness-isnt-worth-running).

---

## Getting started

### As a skill consumer (you only want to run the skills)

1. Clone this repo.
2. Symlink the skills into Claude Code's pickup path:
   ```bash
   bash planning-suite/skills/link-skills.sh
   ```
   This wires every skill folder under `~/.claude/skills/` so edits to source files take effect immediately.
3. Open a project in Claude Code and run `/plan-from-zero` for a brand-new engagement, or any individual skill (e.g. `/grill-me`) for a single step.
4. Install and authenticate the GitHub CLI for the issue-filing skills:
   ```bash
   gh auth status
   ```

### As a skill author (you are editing the skills)

1. Clone this repo.
2. Set up the evaluator:
   ```bash
   cd skills-evaluator
   npm install
   npm run verify
   ```
3. Edit a skill in `planning-suite/skills/<category>/<skill-name>/SKILL.md`.
4. Run the eval for just that skill:
   ```bash
   npm run eval -- --skill grill-me
   ```
5. Review `runs/<timestamp>/summary.md` and iterate.

The evaluator targets `~/.claude/skills/`, so make sure you symlinked (step 2 in the consumer flow) — otherwise you will be evaluating a stale copy.

---

## Guidelines for using this project

### Plan Mode is the contract

Every skill in `planning-suite/` is **Plan Mode only**:

- ✅ Read code, read docs, read prior PRDs and ADRs.
- ✅ Write markdown artifacts (`.md`), Mermaid diagrams, GitHub issues, ADRs.
- ❌ Write production code, install dependencies, scaffold projects, modify `package.json` / `Cargo.toml` / lockfiles.

If a skill's output ever feels like it wants to start coding, **a planning step is incomplete**. Go back, do not work around it.

### File layout for projects that consume the skills

A project that uses these skills should have:

```
docs/
  prd/                  product requirements
    <slug>.md
    <slug>.review.md    output of /prd-adversarial-review
    <slug>/diagrams/    standalone .mmd files
  decisions/            ADRs from /decision-log
  discovery/            /grill-me transcripts (optional, useful for handoff)

clients/                only for client engagements
  <client-slug>/brief.md    from /client-intake
```

Skills create these directories as needed.

### Confidence calibration

Skills that synthesize (e.g. `/grill-me`) require explicit confidence scoring before they let you proceed:

| Score | Meaning |
| --- | --- |
| 95–100 | I could brief a developer right now and they'd build the right thing. |
| 80–94 | I have the shape, but at least one major area is fuzzy. |
| 60–79 | I have the topic, not the requirements. |
| <60 | Not enough to do useful synthesis. Keep grilling. |

Never claim 95+ unless you could pass the brief-a-stranger test.

### Handoff between skills

Each skill leaves a breadcrumb pointing to the next:

- `/client-intake` → *"Run /grill-me"*
- `/grill-me` → *"Run /to-prd"*
- `/to-prd` → *"Run /prd-adversarial-review"*
- `/prd-adversarial-review` → *"Apply edits, then run /to-github-prd-issue"*
- `/to-github-prd-issue` → *"Run /to-issues"*
- `/to-issues` → *"Planning complete — switch out of Plan Mode."*

Don't skip the breadcrumbs. They are how the user knows where they are in the pipeline.

### When you change a skill, run the evals

The contract for editing a skill in `planning-suite/`:

1. Edit `SKILL.md`.
2. Run `npm run eval -- --skill <name>` from `skills-evaluator/`.
3. Read the summary. Pass = ship. Borderline = investigate. Regression = revert or rework.
4. If you intentionally changed behavior, **update the rubric and/or eval cases in the same commit** so the harness reflects the new bar.

A skill change without a matching eval-case update will silently drift the bar. That is the failure mode this repo exists to prevent.

---

## Tone and conventions

The skills (and this README) are biased toward directness:

- Numbers, not adjectives.
- Plain language, not consulting-speak.
- Short sentences, bullets only when the content is genuinely list-shaped.
- No filler. Adversarial review is adversarial — the PRD has no feelings.

That tone is enforced inside the skills themselves. If output ever drifts toward "In order to ensure success, it is important to note that..." — that is a regression, file a case for it.

---

## Prior art and credits

The planning-suite borrows heavily from two prior packs:

- **[mattpocock/skills](https://github.com/mattpocock/skills)** — `grill-me`, `to-prd`, `to-issues` are battle-tested versions of the engineering planning skills. If you are layering this onto an existing project, install Matt's pack first.
- **[EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin)** — the parallel-persona-review pattern is the basis for `/prd-adversarial-review`.

What this repo adds on top:

1. **Client intake** as a first-class skill — the things an internal-engineer pack never has to ask (budget, hard deadlines, who maintains this on day 365).
2. **Tech stack advisor with run-cost output** — small-business products live or die on a $40 vs $400/month bill.
3. **"Operational reality" lens** in adversarial review — for one-person shops, "who runs this on day 90" is the most-skipped question in the industry.
4. **Decision log baked in** — when you hand off, the ADRs are the deliverable that makes the engagement defensible.
5. **An evaluation harness that ships with the skills** — so quality is measurable, not folkloric.

---

## Where to read next

- [planning-suite/README.md](planning-suite/README.md) — full skill catalog, workflow diagram, sequential vs parallel execution.
- [planning-suite/CLAUDE.md](planning-suite/CLAUDE.md) — cross-cutting rules every skill obeys (loaded into Claude's context whenever any skill runs).
- [skills-evaluator/README.md](skills-evaluator/README.md) — eval harness setup, usage, rubric format, concurrency tuning.
