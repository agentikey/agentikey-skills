---
name: plan-from-zero
description: Orchestrate the full planning workflow from blank slate to filed GitHub issues. Runs (or invites the user to run) each skill in the correct sequence, with checkpoints between phases. Use at the start of any new product effort — internal idea or new client. Plan Mode throughout — no code is written.
---

# Plan From Zero

The complete planning workflow, end to end. From "I have an idea / a new client called" to "we have a parent epic and decomposed work in GitHub, and not a single line of code has been written."

## What This Orchestrates

```
Phase 1 — Intake (sequential, depends on user input)
└─ /client-intake (skip if internal idea)
└─ /grill-me (always)
Phase 2 — Synthesis (sequential gates, then parallel synthesis)
├─ /feasibility-pass (stress-test requirements before codifying them)
├─ /tech-stack-advisor (parallel-safe with to-prd)
├─ /to-prd
└─ /architecture-diagram (after to-prd populates data model + integrations)
Phase 3 — Review (parallel internally)
└─ /prd-adversarial-review (5 lenses concurrent)
Phase 4 — Decomposition (sequential)
├─ /to-github-prd-issue
└─ /to-issues
Phase 5 — Compounding (ad-hoc, fired throughout)
└─ /decision-log (called whenever a major call is made)
```

## Process

### Phase 1 — Intake

1. Ask: *"Is this for a new client engagement, or an internal idea?"*
   - **Client engagement** → run `/client-intake` first.
   - **Internal idea** → skip to next step.

2. Run `/grill-me`. Do not exit until 95% confidence is reached.

3. Checkpoint: show the user the running understanding summary. Get their explicit "yes, go ahead" before proceeding.

### Phase 2 — Synthesis

This phase has a **gate** (feasibility-pass) followed by a **parallel synthesis** stage. The gate exists because writing a PRD on top of fragile requirements is expensive to undo — feasibility-pass catches that before the PRD codifies anything.

#### 2a — Feasibility gate

1. Run `/feasibility-pass` against the requirements captured in Phase 1.
2. The skill produces a feasibility report at `docs/feasibility/<slug>.md` with one of three verdicts:

   | Verdict | What it means | What to do |
   | --- | --- | --- |
   | ✅ **Proceed** | No blocking issues. | Continue to 2b. |
   | ⚠️ **Resolve open questions** | Real tensions or implications the client should weigh in on. | Pause. Surface the open questions to the user. Get answers. Update the discovery summary. Re-run `/feasibility-pass` if changes were significant. |
   | 🛑 **Re-grill** | Discovery is too thin to PRD. Specific areas need another `/grill-me` pass. | Go back to Phase 1, re-grill the named areas, then return here. |

3. Skip this gate ONLY if all of these are true: the project is small (single-day or single-week internal scripts), no external integrations, no real load, no compliance concerns. When in doubt, run it — the cost is low and the catch rate is high.

4. Checkpoint: show the user the report's summary section and verdict. Get explicit confirmation before proceeding.

#### 2b — Parallel synthesis

Once the feasibility gate is cleared, three skills can run with overlapping inputs:

- `/to-prd` — writes the formal PRD using the discovery output and the feasibility report
- `/tech-stack-advisor` — proposes the stack, informed by what `/feasibility-pass` flagged as cost drivers
- `/architecture-diagram` — populates Mermaid diagrams in PRD sections 9 and 10

Practical sequencing:

1. Spawn `/tech-stack-advisor` and `/to-prd` in parallel. Tell the user: *"Working on the PRD and stack proposal in parallel — back in a minute."*
2. Wait for both. The PRD references the stack proposal in section 9; the stack proposal references PRD requirements as decision drivers. They're co-developed.
3. After `/to-prd` completes sections 9 and 10, run `/architecture-diagram` to embed Mermaid diagrams.
4. Run `/decision-log` for each major stack choice surfaced by `/tech-stack-advisor` (one ADR per major component).

5. Checkpoint: present the user with PRD + stack proposal + diagrams + feasibility report + ADRs. Get sign-off before moving to review.

### Phase 3 — Review

Run `/prd-adversarial-review`. This skill internally spawns 5 parallel lenses.

After it completes:
- If verdict is **ship-ready**: proceed to Phase 4.
- If verdict is **edits-needed**: apply the suggested edits to the PRD, then proceed.
- If verdict is **rework**: go back to whichever earlier phase has the unresolved issue:
  - Product/scope issue → back to `/grill-me`
  - Feasibility issue the review caught and `/feasibility-pass` didn't → re-run `/feasibility-pass` with the new finding
  - Stack issue → back to `/tech-stack-advisor`
  - Then re-synthesize and re-review.

### Phase 4 — Decomposition

1. Run `/to-github-prd-issue` to file the parent epic.
2. Run `/to-issues` to file child issues, ordered by dependency.

Checkpoint: show the user the issue tree. Get confirmation that decomposition is correct before closing the planning phase.

### Phase 5 — Compounding (ongoing)

Throughout phases 2–4, fire `/decision-log` whenever a non-obvious call is made. Don't batch these at the end — write them when the reasoning is fresh. Particularly important moments:

- After `/feasibility-pass` resolves a tension between requirements (record which side was relaxed and why)
- After `/tech-stack-advisor` picks a primary option over alternatives
- After `/prd-adversarial-review` produces an "edits-needed" verdict that resulted in a scope cut

## What "Done" Looks Like

You're done with planning when:

- ✅ A complete PRD exists at `docs/prd/<slug>.md`
- ✅ A feasibility report exists at `docs/feasibility/<slug>.md` with a ✅ Proceed verdict (or known open questions, all resolved)
- ✅ A parent epic GitHub issue is filed and labeled
- ✅ Child issues are filed, linked to the parent, and dependency-ordered
- ✅ Stack and major architectural choices are recorded as ADRs in `docs/decisions/`
- ✅ Adversarial review verdict is ship-ready (or known edits applied)
- ✅ Run-cost estimate is documented
- ✅ Open questions are tracked in PRD section 12, each with an owner

If any of these is missing, planning is not done.

## Hand-off to Build

Once all of the above is true, output a hand-off summary:

```
PLANNING COMPLETE — <Product Name>
Discovery:          docs/discovery/<slug>.md
Feasibility:        docs/feasibility/<slug>.md
PRD:                docs/prd/<slug>.md
Parent issue:       <URL>
Child issues:       N filed, M can run in parallel after #X
ADRs:               <count> filed in docs/decisions/
Run-cost (v1):      X–X–
X–Y / month
Open questions:     <count> tracked in PRD §12
Next:

Pick the first issue (suggested: #<top-of-dep-graph>)
Switch out of Plan Mode
Begin implementation
```

## Anti-Patterns

- Skipping phases to get to code faster — you'll pay for it 3x in rework ❌
- Running `/to-prd` before `/grill-me` reaches 95% — produces a confident-sounding wrong PRD ❌
- Skipping `/feasibility-pass` on a non-trivial project — codifies impossible or expensive requirements before anyone notices ❌
- Skipping `/prd-adversarial-review` because the PRD "looks good" — it's the cheapest reality check you'll ever buy ❌
- Filing GitHub issues before the parent epic — children become orphans ❌
- Not writing ADRs because "I'll remember why we chose this" — you won't, and the client deserves better ❌
- Treating `/feasibility-pass` output as advisory — its open questions are blockers, not nice-to-haves ❌
