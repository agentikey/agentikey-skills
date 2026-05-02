# Rubric: /grill-me

Score each dimension on a 1-5 scale. Pass criteria at the bottom.

This rubric works against either format the skill might produce:
- A conversational transcript showing the back-and-forth
- A final discovery artifact summarizing what was learned
- Both

Score on substance, not format. If a dimension is unscorable from the given output, score 3 and note that in reasoning.

## Dimensions

### 1. Problem Clarity
Is the problem the skill identified concrete and specific?

- **5** — Problem is specific, actionable, ties to a real pain with measurable cost. A developer reading this could explain it back in one sentence.
- **4** — Problem is mostly clear with one fuzzy edge.
- **3** — Problem is identified but stated abstractly ("inefficient workflow").
- **2** — Problem is vague or restated from the user's hand-wave.
- **1** — Problem is not clearly identified at all.

### 2. User Specificity
Is the primary user defined concretely enough to design for?

- **5** — User is specific (role, context, frequency, alternative they currently use). A designer could build a persona from this.
- **4** — User is mostly specific; one or two attributes are inferred.
- **3** — User is identified but at a demographic level ("small business owners").
- **2** — User is vague ("users", "people").
- **1** — User is not defined.

### 3. Measurable Success
Are the success metrics concrete numbers, not adjectives?

- **5** — Metrics include both leading and lagging indicators with numerical targets and measurement sources.
- **4** — Metrics are numerical but missing a leading indicator or measurement source.
- **3** — Some metrics quantitative, some still adjective-form ("high engagement").
- **2** — Metrics are mostly aspirational ("improve productivity").
- **1** — No measurable success defined.

### 4. Scope Discipline
Is what's IN v1 tight, and what's OUT of v1 explicit?

- **5** — In-scope is the smallest valuable thing. Out-of-scope list is explicit and defends against creep.
- **4** — Scope is reasonable; one or two features could be deferred but are included.
- **3** — Scope is somewhat bloated; out-of-scope list weak or missing.
- **2** — Scope is significantly over-built for v1.
- **1** — No scope discipline at all.

### 5. Coverage Completeness
Did the skill cover the necessary discovery areas?

Areas: Problem, Users, JTBD, Scope (in & out), Success Metrics, Constraints (budget, timeline, team), Integrations, NFRs, Edge Cases.

- **5** — All 9 areas have substantive content OR explicit acknowledgment of why they don't apply.
- **4** — 7-8 areas covered substantively.
- **3** — 5-6 areas covered; some treated superficially.
- **2** — 3-4 areas covered; major gaps not acknowledged.
- **1** — Fewer than 3 areas covered.

### 6. Resistance to Vagueness (transcript-only)
*Score this only if the output is a transcript. If output is an artifact only, score 3 and note "not visible in artifact form".*

When the user gives a hand-wave answer, did the skill push back?

- **5** — Pushed back on every vague answer. Asked for numbers when numbers matter.
- **4** — Pushed back on most vague answers.
- **3** — Sometimes pushed back, sometimes accepted vagueness. (Or: artifact-only output, can't tell.)
- **2** — Rarely pushed back.
- **1** — Never pushed back.

## Anti-Patterns to Flag

- `vague-success-metrics` — metrics like "engagement" or "improve UX" with no number
- `demographic-as-user` — defines user as a demographic instead of a persona ("small business owners")
- `feature-list-as-goals` — Goals/objectives section is a feature list rather than outcome statements
- `scope-bloat` — v1 contains features that should be v2 or later
- `missing-out-of-scope` — no explicit out-of-scope list defending against creep
- `accepts-make-it-like-X` — accepts "make it like Stripe" without probing what specifically (transcripts only)
- `proposes-solutions-prematurely` — suggests stack/UI before requirements are clear
- `false-confidence` — declares 95% / done with major coverage gaps

## Pass Criteria

The case **passes** if:
- All scorable dimensions score >= 4
- No more than 1 anti-pattern triggered
- The overall (mean) score is >= 4.0

A dimension scoring 3 due to "not visible in this output format" does NOT count as a fail — it's a neutral score. Compute the mean across all dimensions including those.
