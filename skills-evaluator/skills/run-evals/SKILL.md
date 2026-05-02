---
name: run-evals
description: Run the skills evaluation harness against one skill, multiple skills, or a single case. Invokes the npm scripts in skills-evaluator/. Use when you've just edited a SKILL.md and want to verify the change didn't regress behavior. Reports pass/fail with links to detailed run output.
---

# Run Evals

Trigger the skills-evaluator harness from inside Claude Code. This skill is a thin wrapper around the underlying npm scripts — it confirms inputs with the user, runs the evaluation, and surfaces the summary.

## When to Run

- After editing any `SKILL.md` file
- Before committing skill changes
- When investigating "why did this skill stop working"
- When tuning a rubric or check

## Preconditions

1. `skills-evaluator/` directory exists in the current workspace.
2. `npm install` has been run there.
3. `ANTHROPIC_API_KEY` is exported in the environment (only needed if running with the judge).
4. Claude Code CLI is available on PATH (`claude --version`).

If any precondition fails, abort and tell the user how to fix it.

## Process

### 1. Determine scope

Ask the user which scope they want:
- All skills with eval cases
- One specific skill
- One specific case (skill + case ID)

If they don't specify and they just edited a SKILL.md (check open editor), default to that skill.

### 2. Determine speed/cost

Ask: *"Process checks only (fast, free), or include LLM judge (slower, costs API calls)?"*

Default to including judge unless the user is iterating rapidly.

### 3. Execute

Use bash to run the appropriate npm script:

```bash
# All skills, with judge
cd skills-evaluator && npm run eval

# One skill
cd skills-evaluator && npm run eval -- --skill <name>

# Process-only (fast)
cd skills-evaluator && npm run eval -- --skill <name> --no-judge

# Single case
cd skills-evaluator && npm run eval -- --skill <name> --case <case-id>
```

### 4. Surface the summary

Read the resulting `runs/<timestamp>/summary.md` and present:

- Total pass/fail counts
- Per-skill breakdown
- Any failed checks (named, with messages)
- Any low judge scores (with the weakest dimension called out)

Don't paste the entire summary into chat — give a digest and link the file.

### 5. Recommend next steps

Based on results:
- **All passed** → "Skill changes look good. Safe to commit."
- **Process check failed** → Open the relevant transcript and walk the user through which check failed and why.
- **Judge failed** → Open the judge.md report. Show the lowest-scoring dimension. Suggest concrete edits to the SKILL.md.
- **Errored** → Diagnose: is `claude` on PATH? Is the API key set? Is the eval case malformed?

## Output Format

```
Eval run: <timestamp>
─────────────────────────────────────
✅ grill-me/case-001-saas-mvp        passed (judge: 4.4/5)
❌ grill-me/case-002-adversarial     judge failed (3.6/5)
   ↳ Weakest: Resistance to Vague Answers (3/5)
   ↳ Anti-pattern: accepts-make-it-like-X
✅ grill-me/case-003-simple-tool     passed (judge: 4.6/5)
─────────────────────────────────────
2 of 3 cases passed.

Summary: skills-evaluator/runs/<timestamp>/summary.md
Failing case detail: skills-evaluator/runs/<timestamp>/grill-me/case-002-adversarial/judge.md

Suggested next step: review case-002 transcript and tighten the "punch through resistance"
section of grill-me/SKILL.md.
```

## Anti-Patterns

- Running with judge enabled when iterating rapidly (wastes API calls) ❌
- Pasting the entire run summary into chat ❌
- Running on all skills when the user only changed one ❌
- Reporting "passed" without checking what dimensions scored low ❌
- Not opening the failing transcript when a case fails ❌
