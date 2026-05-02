# Rubric: /prd-adversarial-review

Score each dimension on a 1-5 scale. Pass criteria at the bottom.

## Dimensions

### 1. Lens Distinctiveness
Does each lens find different issues, or do they all surface the same critique?

- **5** — Each lens finds genuinely different issues that match its perspective. Product-framing finds product issues; security finds security issues; etc.
- **4** — Mostly distinct. One lens overlaps significantly with another.
- **3** — Two or more lenses find largely the same things.
- **2** — Lenses are merely flavored versions of the same critique.
- **1** — All lenses say essentially the same thing.

### 2. Specificity of Critique
Are issues cited with section numbers and concrete fixes, or vague?

- **5** — Every issue cites the specific section/requirement and proposes a concrete edit.
- **4** — Most issues are specific. A few are general.
- **3** — Mix of specific and vague. The user would still have work to triage.
- **2** — Most critique is general ("the security section feels weak").
- **1** — Critique is uniformly vague.

### 3. Adversarial Posture
Is the review actually critical, or is it polite cover?

- **5** — Reads like a tough-but-fair senior reviewer. Names problems plainly.
- **4** — Mostly direct. Maybe softens one or two real issues.
- **3** — Mixed. Some plain talk, some hedging.
- **2** — Mostly polite cover. Critiques are heavily softened.
- **1** — Reads like a rubber-stamp approval. No real adversarial work done.

### 4. Synthesis Quality
Does the synthesis section make a real call, or just paste the lens findings?

- **5** — Synthesis is judgment, not summary. Top-3 must-fix items are clearly the highest-leverage issues across lenses. Verdict matches the evidence.
- **4** — Synthesis is mostly judgment. Top-3 list is reasonable.
- **3** — Synthesis leans toward summary but does pick top items.
- **2** — Synthesis is just a reorganization of lens findings.
- **1** — No real synthesis; verdict doesn't match the lens findings.

### 5. Verdict Calibration
Is the verdict (ship-ready / edits-needed / rework) honest given the findings?

- **5** — Verdict matches the severity. If a lens returned ❌, verdict is "rework" unless explicitly justified.
- **4** — Verdict mostly matches. Maybe one borderline call.
- **3** — Verdict is somewhat optimistic relative to findings.
- **2** — Verdict is significantly inflated to keep momentum.
- **1** — Verdict contradicts the findings outright.

## Anti-Patterns to Flag

- `false-positive-greenlight` — verdict ✅ when ❌ findings exist
- `lens-collapse` — multiple lenses converge on the same critique
- `vague-critique` — issues without section references or concrete edits
- `polite-cover` — softening that obscures the real issue
- `synthesis-as-summary` — synthesis section is a copy-paste rather than judgment
- `missing-lens` — fewer than 5 lenses present
- `no-must-fix-list` — synthesis lacks the Top-3 must-fix items

## Pass Criteria

The case **passes** if:
- All 5 dimensions score >= 4
- No more than 1 anti-pattern triggered
- The overall (mean) score is >= 4.0
