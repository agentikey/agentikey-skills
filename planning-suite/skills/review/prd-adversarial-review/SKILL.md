---
name: prd-adversarial-review
description: Stress-test a finished PRD by running multiple critical lenses in parallel — product framing, technical feasibility, scope discipline, security at the plan level, and operational reality. Each lens produces a critique, then they are synthesized into a single review with actionable edits. Use after /to-prd and before /to-github-prd-issue. Plan Mode.
---

# PRD Adversarial Review

A PRD that hasn't been challenged is a PRD that will surprise you in production. Run five lenses against it, in parallel, then synthesize the verdict.

## When to Run

- After `/to-prd` produces a draft
- Before filing the parent GitHub issue
- After major PRD revisions

## Operating Rules

1. **Parallel by default.** Spawn the 5 lenses concurrently as sub-tasks. They don't depend on each other and serial review wastes minutes per pass.
2. **Each lens is adversarial.** It is not the lens's job to be polite. It's the lens's job to find what's wrong.
3. **Synthesis is your job, not the lenses'.** Each lens reports independently. You combine and prioritize.
4. **Be specific.** "Section 8 doesn't specify uptime SLO" is useful. "NFRs feel weak" is not.

## The Five Lenses

Each lens is given the full PRD and a focused prompt. Each writes into its own H2 section of `docs/prd/<slug>.review.md`.

### Lens 1: Product Framing
> *"You are a skeptical PM. Your job is to challenge whether this is solving the right problem for the right user."*

**Looks for:**
- Vague users — "small business owners" is not a user, it's a demographic
- Unmeasurable success — "improve engagement" with no number
- "Nice to have" features disguised as must-have
- Missing non-goals — what we're explicitly not doing
- The real job-to-be-done getting lost behind feature lists
- Feature/benefit confusion (we built X; what does the user get?)

### Lens 2: Technical Feasibility
> *"You are a senior engineer with a chip on your shoulder. Your job is to find where this plan won't survive contact with reality."*

**Looks for:**
- Integration assumptions that won't hold (rate limits, auth quirks, API gaps)
- Latency claims with no math behind them
- Data volumes that break the proposed stack
- Third-party dependencies whose failure isn't accounted for
- Auth/identity hand-waves ("we'll use OAuth" — with whom, how, for what?)
- Concurrency / race conditions implied but unaddressed
- Mobile/offline claims that the stack can't actually deliver

### Lens 3: Scope Discipline
> *"You are a ruthless engineering manager who has seen too many projects miss their deadline. Your job is to find what we can cut."*

**Looks for:**
- Features that aren't in the success metric
- Premature abstractions ("we'll need a plugin system someday")
- "Platform thinking" before product-market fit
- v2 features hiding in v1
- Configurability that no one will use
- "While we're at it" additions
- Empty admin panels, settings pages, dashboards built before there's data to show

### Lens 4: Security & Privacy at Plan Level
> *"You are a security reviewer. Your job is to find what goes wrong when this gets attacked or audited."*

**Looks for:**
- PII handling not specified
- Auth model unclear or mixed (session + token + API key, all undefined)
- Multi-tenancy not addressed (or single-tenant assumed without saying so)
- Secrets management absent from the plan
- Audit logging missing for sensitive actions
- Threat model not articulated
- Data retention / deletion policy missing
- Compliance trajectory not stated (SOC2-ready vs. not, HIPAA-bound vs. not)
- Webhook signature verification ignored
- Public endpoints without rate-limit story

### Lens 5: Operational Reality
> *"You are the person who will be on call for this in 6 months. Your job is to find what makes the on-call experience hell."*

**Looks for:**
- No observability plan (logs, metrics, traces — what gets captured?)
- No on-call story
- No backup / restore plan
- No cost ceiling — what stops the AWS bill from doubling?
- Single points of failure (one DB, one queue, no degradation path)
- Dependencies on the consultant personally being available
- No runbook for the top 3 likely incidents
- "We'll add monitoring later"
- Migration / schema-change story absent

## Output Format

```markdown
# Adversarial Review: <Product Name>
**PRD reviewed:** docs/prd/<slug>.md (commit <hash> if available)
**Reviewed:** YYYY-MM-DD

---

## Synthesis (read this first)

**Overall verdict:** ship-ready | edits-needed | rework

**Top 3 must-fix items before filing:**
1. …
2. …
3. …

**Open questions raised by reviewers (not yet answered):**
- …

**Lens scores:**
| Lens | Verdict |
| --- | --- |
| Product Framing | ✅ / ⚠️ / ❌ |
| Technical Feasibility | ✅ / ⚠️ / ❌ |
| Scope Discipline | ✅ / ⚠️ / ❌ |
| Security & Privacy | ✅ / ⚠️ / ❌ |
| Operational Reality | ✅ / ⚠️ / ❌ |

---

## Lens 1: Product Framing
**Verdict:** ✅ Solid / ⚠️ Concerns / ❌ Rework

**Critical issues:**
- …

**Suggested edits to PRD:**
- Section X.Y: …

---

## Lens 2: Technical Feasibility
[same structure]

## Lens 3: Scope Discipline
[same structure]

## Lens 4: Security & Privacy
[same structure]

## Lens 5: Operational Reality
[same structure]
```

## Process

1. Read the PRD in full.
2. Spawn 5 sub-tasks in parallel, one per lens. Each is given the full PRD and the lens's specific prompt.
3. Collect the 5 outputs.
4. Write the synthesis section. The synthesis is *not* a copy/paste of lens findings — it's your judgment about which issues are blocking vs. nice-to-have.
5. Show the user the synthesis first, then offer to walk through each lens in detail.
6. Ask: *"Apply these edits to the PRD now, or skip and file as-is?"*

## Verdicts

- **✅ Solid** — no blocking issues. Suggestions only.
- **⚠️ Concerns** — issues found that should be addressed but don't block filing.
- **❌ Rework** — fundamental issue that needs to be resolved before we file.

If any lens returns ❌, the overall verdict is **rework** unless you can articulate why that lens's concern is mistaken. Don't override a ❌ to keep momentum.

## Anti-Patterns

- Running lenses sequentially (slower, no benefit) ❌
- Letting one lens dominate (each gets equal weight in the synthesis) ❌
- Soft-pedaling critique to avoid "hurting feelings" — the PRD has no feelings ❌
- Synthesis that's just "here's what each lens said" — synthesis is judgment ❌
- Marking ✅ when there are real concerns, just to wrap up faster ❌
