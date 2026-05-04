# Rubric: /triage

Score each dimension on a 1-5 scale. Pass criteria at the bottom.

This skill is a fast routing decision, not a discovery exercise. The output is short, structured, and verdict-driven. Score on substance, not length — a tight 1-page triage doc that nails the verdict is a 5, not a 3.

The skill produces a transcript (the 5-question walk) and a triage record (`docs/triage/<slug>.md`). Score against both when available.

## Dimensions

### 1. Verdict Correctness
Did the verdict match the actual signals in the scenario?

This is the most important dimension. Triage's whole job is honest routing.

- **5** — Verdict matches reality. ✅ on a fully-lite scenario, ⚠️ on a scenario with at least one full signal, 🛑 on a scenario with 2+ unanswerable questions.
- **4** — Verdict is reasonable; one edge case where it could go either way.
- **3** — Verdict is somewhat optimistic or pessimistic relative to the signals captured.
- **2** — Verdict significantly mismatched (e.g., ✅ on a scenario with HIPAA exposure).
- **1** — Verdict directly contradicts the gating answers.

### 2. Question Discipline
Did the skill walk the 5 gating questions one at a time, in order, without bundling or skipping?

- **5** — One question at a time. Each answer captured and classified before the next question. No bundling.
- **4** — Mostly disciplined; one minor lapse (combined two related questions, or asked a follow-up that bordered on discovery).
- **3** — Some bundling; asked 2-3 of the gating questions at once.
- **2** — Dumped most of the questions in one block.
- **1** — No discipline; treated triage as a single multi-part question.

### 3. Rule Application
Did the skill apply the "all 5 must favor lite" rule mechanically, without overriding its own verdict?

- **5** — Rule applied cleanly. If even one answer favored full, verdict was ⚠️. Did not negotiate the verdict with the user.
- **4** — Rule applied; one minor wobble (e.g., briefly considered overriding before correctly holding).
- **3** — Rule applied but reasoning suggests the skill was tempted to negotiate.
- **2** — Rule misapplied: e.g., 4-of-5 lite scored as ✅, or "unsure" treated as lite without justification.
- **1** — Rule ignored; verdict driven by something else (dollar amount, vibes, user pressure).

### 4. Scope Discipline
Did the skill stay in routing-decision space, or drift into discovery, scoping, or solution-picking?

- **5** — Stayed in triage. No product discovery, no stack proposals, no scoping. Each question was a narrow probe.
- **4** — Mostly disciplined; one or two minor drifts (asked an extra clarifying question that veered toward discovery).
- **3** — Some drift; started capturing requirements or proposing approaches.
- **2** — Frequent drift; reads like an abbreviated `/grill-me` or `/client-intake`.
- **1** — Triage abandoned entirely; output is a discovery doc or scope proposal.

### 5. Output Faithfulness
Does the triage record (the file output) accurately reflect the conversation, with all required fields populated?

Required fields: date, verdict, slug, the ask, engagement signals (budget/timeline), gating answers table (all 5 rows), verdict reasoning, next step.

- **5** — All required fields present and accurate. Verdict reasoning specifically references the questions that drove the call.
- **4** — All fields present; one is shallow or generic (e.g., "see above" reasoning).
- **3** — One required field missing or significantly inaccurate.
- **2** — Multiple fields missing; record is partial.
- **1** — No file written, or record is unusable.

### 6. Resistance to Pressure
*Score 5 by default if the scenario does not include user pushback. This dimension only matters when the scenario tries to push the skill to override its verdict or skip questions.*

- **5** — Held the verdict under pressure. Explained the rule when challenged. Did not negotiate.
- **3** — Hedged: explained the rule but caveated. Did not change verdict.
- **1** — Caved to pressure: changed verdict, skipped questions, or downgraded ⚠️ to ✅ on user request.

## Anti-Patterns to Flag

- `dumps-questions` — asks 2+ gating questions in one message
- `dollar-driven-verdict` — uses budget as the trigger rather than the 5 questions
- `accepts-unsure-as-lite` — treats hedged answers as favoring lite without justification
- `overrides-own-verdict` — changes verdict because user pushes back
- `triage-as-discovery` — drifts into capturing requirements, stakeholders, or scope details
- `proposes-solutions` — suggests stack, architecture, or implementation during triage
- `skips-file-write` — issues a verdict verbally without producing the triage record
- `pads-output` — produces a long discovery-style document instead of a tight triage record
- `re-grills-the-prospect` — asks follow-up questions that go deeper than the gating signal
- `vague-verdict-reasoning` — verdict reasoning doesn't reference specific questions
- `skips-engagement-signals` — fails to capture budget/timeline as data
- `wrong-next-step` — routes to the wrong skill given the verdict (e.g., ✅ followed by "run /client-intake")

## Pass Criteria

The case **passes** if:
- All scorable dimensions score >= 4
- No more than 1 anti-pattern triggered
- Overall (mean) score is >= 4.0
- **Verdict matches the case's expected verdict (✅/⚠️/🛑)**

The verdict-match condition is special: if the case is designed for a ⚠️ verdict and the skill returns ✅, that's an automatic fail regardless of other scores. Triage's entire purpose is honest routing.
