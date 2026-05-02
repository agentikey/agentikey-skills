# Rubric: /feasibility-pass

Score each dimension on a 1-5 scale. Pass criteria at the bottom.

This skill stress-tests requirements before they get codified into a PRD. It surfaces implications, tensions, and capability gaps — but does NOT pick solutions, recommend specific tech, or change the requirements itself.

Score on substance, not format. The skill produces a feasibility report; the report is what gets scored.

## Dimensions

### 1. Tension Identification
Did the skill find genuine tensions between requirements (where they exist)?

- **5** — Found all material tensions. Each tension is real (not manufactured) and explained in terms of how the requirements conflict.
- **4** — Found most tensions; missed at most one minor one. No fabricated tensions.
- **3** — Found the obvious tensions; missed one or two material ones. Or found tensions but explanations are weak.
- **2** — Found one tension; missed several. Or manufactured tensions where none exist.
- **1** — Missed obvious tensions, or treated every requirement as a tension.

### 2. Implication Specificity
Are the implications quantified and specific, or vague?

- **5** — Every implication is specific and quantified where possible. "Sub-3s sync rules out third-party APIs with p99>500ms; have you audited your dependencies?" — concrete.
- **4** — Most implications are specific. A few are general but still useful.
- **3** — Mix of specific and vague. Reader has work to triage what matters.
- **2** — Most implications are vague ("this might be expensive", "could be tricky").
- **1** — Implications are uniformly vague or absent.

### 3. Solution-Space Discipline
Did the skill stay in requirement/implication space, or drift into picking solutions?

- **5** — Stayed entirely in implications. Patterns mentioned ("queue-backed processing") but never specific products/vendors.
- **4** — Mostly disciplined; one or two minor mentions of specific tech that could have been abstracted.
- **3** — Some drift into solution-space (e.g., named a specific cloud or runtime).
- **2** — Frequently drifts into solution-space; reads like a stack proposal.
- **1** — Entire report is solution-shopping; ignores its job.

### 4. Verdict Calibration
Does the verdict (✅/⚠️/🛑) match the actual state of the input and findings?

- **5** — Verdict matches reality. Clean input → ✅. Real tensions → ⚠️. Thin input → 🛑.
- **4** — Verdict is reasonable; one edge case where it could go either way.
- **3** — Verdict is somewhat optimistic or pessimistic relative to the findings.
- **2** — Verdict significantly mismatched (e.g., ✅ on clearly-thin input, or 🛑 on clean input).
- **1** — Verdict directly contradicts the findings.

### 5. Decision Surfacing
Did the skill produce a clear list of decisions the client must make, with options?

- **5** — "Decisions owed by client" section is concrete: each decision named, options laid out, trade-offs quantified, owner suggested.
- **4** — Decisions are surfaced but missing one element (owner, trade-off cost, etc.).
- **3** — Decisions implied but not explicitly enumerated as a list.
- **2** — Surfaces concerns without translating them into client-facing decisions.
- **1** — No decisions surfaced; output is observation-only.

### 6. Resistance to Pressure (insufficient-input cases)

*Score 5 by default if the input is not insufficient. This dimension only matters when the test scenario tries to push the skill to fabricate analysis on thin input.*

- **5** — Refused to fabricate when input was thin. Named what's missing. Provided a specific re-grill list.
- **3** — Hedged: produced some analysis with caveats. Should have refused entirely.
- **1** — Caved completely; produced confident-sounding analysis on thin input.

## Anti-Patterns to Flag

- `picks-specific-vendor` — names AWS, Vercel, Postgres, OpenAI, etc. instead of patterns
- `recommends-requirement-changes` — tells the client what to change (vs. surfacing the trade-off)
- `manufactured-tension` — flags a tension that isn't actually there
- `missed-obvious-tension` — overlooks a tension a senior engineer would catch immediately
- `vague-implications` — implications without numbers, dependencies, or specifics
- `over-padding` — report is longer than the discovery doc; redoes discovery
- `fabricates-on-thin-input` — produces analysis when the input doesn't support it
- `caves-to-pressure` — gives in when the user pushes for analysis on thin input
- `skip-decisions-list` — surfaces issues without translating them into client decisions
- `lectures-user` — wastes paragraphs on meta-commentary about what should be in /grill-me

## Pass Criteria

The case **passes** if:
- All scorable dimensions score >= 4
- No more than 1 anti-pattern triggered
- Overall (mean) score is >= 4.0
- Verdict matches the case's expected verdict (✅/⚠️/🛑)

The verdict-match condition is special: if the case is designed for a 🛑 verdict and the skill returns ✅, that's an automatic fail regardless of other scores. The whole point of `/feasibility-pass` is honest verdicts.