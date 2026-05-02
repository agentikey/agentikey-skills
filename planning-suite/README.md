# Planning Suite

A Claude Code skill pack for AI consultancies that ship products for small businesses. Optimized for the **planning and design phase** — every skill operates in Plan Mode and never writes a line of production code.

## What's in the box

```
intake/         → Capture client + product context
  client-intake     Stakeholder map, budget, constraints (new client kickoff)
  grill-me          Socratic interrogation until 95% alignment

synthesis/      → Turn conversation into artifacts
  to-prd                Structured PRD from the conversation
  tech-stack-advisor    Stack proposal with run-cost estimate
  architecture-diagram  Mermaid diagrams (C4, sequence, ER)

review/         → Stress-test before filing
  prd-adversarial-review  5 lenses in parallel: product / feasibility /
                          scope / security / operations

decomposition/  → Turn artifacts into work
  to-github-prd-issue   Parent epic issue from the PRD
  to-issues             Vertical-slice child issues, dependency-ordered

compounding/    → Knowledge that survives the engagement
  decision-log    Immutable ADRs for non-obvious choices
```

## The workflow

```mermaid
flowchart TD
    A[New idea or new client] --> B{Client engagement?}
    B -->|Yes| C[/client-intake]
    B -->|No, my idea| D[/grill-me]
    C --> D
    D --> E{95% aligned?}
    E -->|No| D
    E -->|Yes| F[/tech-stack-advisor]
    F --> G[/to-prd]
    G --> H[/architecture-diagram]
    H --> I[/prd-adversarial-review]
    I --> J{Verdict?}
    J -->|Rework| G
    J -->|Edits needed| G
    J -->|Ship-ready| K[/to-github-prd-issue]
    K --> L[/to-issues]
    L --> M[/decision-log for major calls]
    M --> N[Hand off to build phase]
```

## Quick start

1. Drop this `planning-suite/` folder into your project's `.claude/` directory (or symlink it from a central location across projects).
2. The skills become available as slash commands in Claude Code: `/grill-me`, `/to-prd`, etc.
3. For a brand-new client engagement, run `/plan-from-zero` (see `commands/plan-from-zero.md`) — it orchestrates the whole chain.
4. Requires `gh` CLI installed and authenticated for the GitHub-issue skills.

## Sequential vs parallel

| Phase | Skills | Mode |
| --- | --- | --- |
| Discovery | `client-intake`, `grill-me` | **Sequential** — depends on previous answers |
| Synthesis | `to-prd`, `tech-stack-advisor`, `architecture-diagram` | **Parallel-friendly** — can run simultaneously once enough context exists |
| Review | `prd-adversarial-review` (5 internal lenses) | **Parallel** — all 5 lenses spawn as concurrent sub-tasks |
| Decomposition | `to-github-prd-issue` → `to-issues` | **Sequential** — child issues need parent issue ID |
| Compounding | `decision-log` | **Ad-hoc** — fired any time a non-trivial call is made |

## Why this exists (and what it borrows from)

Two prior-art packs do most of this well:

- **[mattpocock/skills](https://github.com/mattpocock/skills)** — `grill-me`, `to-prd`, `to-issues` are battle-tested versions of the core engineering planning skills. If you want to install on top of an existing project, install Matt's pack first.
- **[EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin)** — the parallel-persona-review pattern (`/ce-doc-review`, document-lens reviewers) is the basis for our `prd-adversarial-review`.

This pack adds what's specific to a small-business consultancy:

1. **Client intake** as a first-class skill — the things a Matt-Pocock-style internal engineer never has to ask (budget, hard deadlines, who can maintain this on day 365).
2. **Tech stack advisor with run-cost output** — small-business products live or die on a $40 vs. $400/month infra bill.
3. **Adversarial review with an "operational reality" lens** — for one-person shops, "who runs this on day 90" is the most-skipped question in the industry.
4. **Decision log baked in** — when you hand off to the client, the ADRs are the deliverable that makes the engagement defensible.

## Plan-Mode discipline

Every skill enforces this:

- Read code, read docs, read PRDs — yes
- Write planning artifacts (`.md`, GitHub issues, ADRs, diagrams) — yes
- Write production code, run scaffolding tools, modify `package.json`, install dependencies — **no, until planning is signed off**

If you find yourself wanting to write code, that's a signal a planning step is incomplete. Go back.
