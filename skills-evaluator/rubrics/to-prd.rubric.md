# Rubric: /to-prd

Score each dimension on a 1-5 scale. Pass criteria at the bottom.

## Dimensions

### 1. Fidelity to Conversation
Does the PRD accurately capture what was said in the discovery? Or does it invent things?

- **5** — Every claim in the PRD traces back to the conversation. No fabrications.
- **4** — Strong fidelity. Maybe one or two minor extrapolations clearly marked as assumptions.
- **3** — Mostly faithful. Some claims feel inferred without being marked as such.
- **2** — Significant fabrication. The PRD says things the user never said.
- **1** — Heavily fabricated. The PRD bears little resemblance to the conversation.

### 2. Testability of Requirements
Can each FR/NFR be verified? Is each acceptance criterion testable?

- **5** — Every requirement is concrete, measurable, testable. Numbers where numbers belong.
- **4** — Almost every requirement is testable. One or two soft ones.
- **3** — Mix of testable and aspirational. A QA could test some but not all.
- **2** — Most requirements are vague ("be performant", "be user-friendly").
- **1** — Untestable throughout.

### 3. Completeness Without Padding
Are all 15 sections filled in with real content, or is there filler?

- **5** — Every section has substantive content OR is explicitly marked N/A with reason.
- **4** — Mostly complete. One or two sections have weak content.
- **3** — Some sections are clearly padded to look thorough.
- **2** — Many sections are filler ("TBD", generic platitudes).
- **1** — PRD is a skeleton with little real content.

### 4. Honest Treatment of Open Questions
Are unresolved items surfaced in section 12, or are they faked into looking resolved?

- **5** — Open Questions section is real and substantive. Owner + deadline per question.
- **4** — Open questions surfaced but missing owner or deadline.
- **3** — Some open questions surfaced; others quietly papered over.
- **2** — Almost no open questions despite obvious gaps in the conversation.
- **1** — No open questions section, or "none" listed when there clearly are some.

### 5. Scope Discipline
Are the goals tight, the non-goals explicit, and the out-of-scope list defended?

- **5** — Tight scope. Non-goals explicit. v1 is genuinely the smallest valuable thing.
- **4** — Reasonable scope. Maybe one feature that could be deferred but is included.
- **3** — Somewhat bloated. Several "while we're at it" features.
- **2** — Significantly over-scoped. v1 reads like v2.
- **1** — No scope discipline. Everything is in v1.

## Anti-Patterns to Flag

- `fabricated-requirements` — requirements that contradict or invent beyond the conversation
- `vague-success-metrics` — metrics like "improve engagement" with no number
- `padded-sections` — sections with filler content to look thorough
- `missing-frontmatter` — no YAML frontmatter
- `goals-equal-features` — Goals section is just a feature list, not outcome statements
- `nonfunctional-handwave` — NFR section says "be fast and secure" with no specifics
- `no-open-questions` — declares everything resolved despite obvious gaps
- `overlapping-with-grill-me` — interviews further instead of synthesizing what's already there

## Pass Criteria

The case **passes** if:
- All 5 dimensions score >= 4
- No more than 1 anti-pattern triggered
- The overall (mean) score is >= 4.0
