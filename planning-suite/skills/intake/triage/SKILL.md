---
name: triage
description: Decide whether a new engagement warrants the full planning suite or a lite-path one-pager. Asks 5 short gating questions about a prospect/project and returns a verdict that routes to either the full chain (/client-intake → /grill-me → ...) or a lite scope doc. Use as the FIRST skill invoked for any new engagement, before /client-intake. Plan Mode only — captures routing decision, never picks solutions or scopes work.
---

# Triage

You decide whether a new engagement is worth the full planning suite. The suite (intake → grill → feasibility → PRD → adversarial review → epic → child issues) costs 3–4 hours of the consultant's attention before any code is written. On a $50k engagement that's worth it. On a $4k landing-page tweak it eats the margin and looks unprofessional to the client. This skill is the gate that prevents reflexive over-application of the suite.

## When to Run

- The earliest moment a new engagement enters the pipeline
- Before `/client-intake`
- On any prospect, internal idea, or scope expansion that might warrant planning artifacts

## When NOT to Run

- Mid-engagement (the gate has already been passed; do not re-triage to "demote" work in flight)
- For a follow-on phase that is clearly a continuation of an already-triaged engagement
- For pure operational tasks (a customer support ticket, a config change, etc.)

## What This Skill Does (and Does Not Do)

**It does:**
- Walk 5 specific gating questions, one at a time
- Produce a verdict: ✅ Lite Path, ⚠️ Full Suite, or 🛑 Insufficient Context
- Route to the next skill (lite scope writeup OR `/client-intake`)
- Save the triage record so the decision is auditable later

**It does not:**
- Discover the actual product (`/grill-me` does that)
- Capture stakeholders or budget in detail (`/client-intake` does that)
- Pick a tech stack, write requirements, or scope deliverables
- Use dollar amount as the primary trigger
- Override its own verdict because the user wants a different one

## Why Not Just Use Dollars?

Engagement size is a lagging indicator of complexity. A $4k job that touches Stripe is more dangerous than a $20k job to redesign a marketing site. A $30k internal tool with one decision-maker and a clear ask is simpler than an $8k workflow tool with three stakeholders and fuzzy success criteria.

The five gating questions below are the leading indicators. Capture dollar size as data, not as a decision input.

## The 5 Gating Questions

You ask these one at a time, in order. After each answer, classify it as **favors-lite** or **favors-full**. Do not skip ahead. Do not dump all five at once.

### Q1. Sign-off count
*"How many people on their side need to sign off on this work being done correctly?"*

- **1 person** → favors-lite
- **2+ people** → favors-full

Sign-off ≠ stakeholders. Many people may have opinions; only sign-off matters here. If the answer is "well, technically just the owner, but their head of ops will need to be happy too" — that's 2.

### Q2. One-sentence "done"
*"Can the client state what 'done' looks like in one sentence I could repeat back to them?"*

- **Yes, clear and testable** → favors-lite
- **No / "it depends" / multiple paragraphs** → favors-full

Examples of one-sentence done: "Form submissions land in this Gmail." "Weekly Stripe revenue posts to #revenue every Monday at 9am ET." "The marketing site uses the new logo and brand colors across all pages."

Examples that are NOT one-sentence done: "Modernize our internal tools." "Help us figure out how to use AI." "Improve our customer onboarding."

### Q3. Sensitive surfaces
*"Does the work touch money flow, PII, authentication, or compliance?"*

- **No** → favors-lite
- **Any yes** → favors-full

This question alone can escalate. A $3k integration that moves customer money needs the artifact set, full stop. Money/PII/auth/compliance issues become catastrophic at any size; the cost of getting them wrong dwarfs the cost of planning.

### Q4. Self-contained scope
*"Does this integrate with systems they already depend on for daily operations?"*

- **No (greenfield or self-contained)** → favors-lite
- **Yes (CRM, ERP, billing, prod database, customer-facing app)** → favors-full

Integration with existing systems means: their understanding of those systems matters, the integration's failure modes matter, and the artifact set buys you the discovery path to surface what they don't know about their own stack.

### Q5. Trust history
*"Has the client been burned on a similar project? Are they signaling they need extra documentation or comfort?"*

- **No, easy buyer, working relationship is good** → favors-lite
- **Yes, they've been burned, they're nervous, this is a high-stakes referral** → favors-full

Even on a small simple job, a burned client needs the artifact set. The PRD and ADRs aren't engineering documents in this case — they're trust documents. The client needs to feel that this person is *unlike* the last vendor.

## The Decision Rule

**ALL FIVE answers must favor lite, or the verdict is Full Suite.** No partial credit.

This rule is asymmetric on purpose. The cost of running the full suite on a job that didn't need it: ~3 wasted hours and a slightly bored client. The cost of running lite-path on a job that needed full: scope creep, blown estimates, an ADR-less project that becomes a maintenance nightmare, possibly a damaged relationship. False negatives are catastrophic; false positives are inconvenient.

## Verdict Discipline

| Verdict | When to use | Routes to |
| --- | --- | --- |
| ✅ **Lite Path** | All 5 questions favor lite. Engagement is small enough and contained enough that artifact-heavy planning is overhead, not value. | `/lite-scope` (when implemented) or a one-pager: ask, definition of done, out of scope, price + timeline, sign-off |
| ⚠️ **Full Suite** | At least one question favors full. The artifact set earns its keep. | `/client-intake` → `/grill-me` → `/feasibility-pass` → `/to-prd` → ... |
| 🛑 **Insufficient Context** | The user/consultant cannot confidently answer 2 or more of the 5 questions. Triage cannot be done. | Get the missing context (a 15-min prospect call, a follow-up email), then re-run `/triage` |

### Critical Discipline Rules

1. **"I'm not sure" is a full-suite signal**, not a tie-break. If the user hesitates on Q3 (sensitive surfaces) and isn't sure whether the integration touches PII, treat that as favors-full. Uncertainty about a complexity signal IS a complexity signal.

2. **Do not override your own verdict.** Once you've classified all 5, the verdict is mechanical. If the user pushes back ("but it's only $3k, can we just do lite?"), explain the rule, do not change the verdict. Solo operators cheat their own gates; the skill is the cop.

3. **Never demote in flight.** If an engagement was full-suite at triage, it stays full-suite. Don't let mid-engagement scope shrinkage be a justification for skipping the artifact set.

4. **Do not turn triage into discovery.** Each gating question is a single, narrow probe. If the user starts describing the actual product in detail, redirect: *"Save that for `/client-intake`. Right now I just need to know if the integration touches money flow — yes or no."*

## Inputs

A short prose description of the prospect/engagement. Could be:
- A summary of an inbound email or DM
- Notes from a 15-min discovery call
- An internal idea the consultant is sizing
- A scope-expansion request from an existing client

## Output

`docs/triage/<slug>.md`. Structure:

```markdown
# Triage: <Prospect or Project Name>

**Date:** YYYY-MM-DD
**Verdict:** <✅ Lite Path / ⚠️ Full Suite / 🛑 Insufficient Context>
**Slug:** <kebab-case-slug>

## The Ask
<One sentence in the prospect's own words.>

## Engagement Signals (data, not decision input)
- Estimated budget: <range, or "unknown">
- Estimated timeline: <range, or "unknown">

## Gating Answers

| # | Question | Answer | Favors |
| --- | --- | --- | --- |
| Q1 | Single sign-off? | <yes/no/unsure> | lite / full |
| Q2 | One-sentence "done"? | <yes/no/unsure> | lite / full |
| Q3 | Touches money/PII/auth/compliance? | <yes/no/unsure> | lite / full |
| Q4 | Self-contained scope? | <yes/no/unsure> | lite / full |
| Q5 | Client needs trust documentation? | <yes/no/unsure> | lite / full |

## Verdict Reasoning
<2-3 sentences. Reference which specific question(s) drove the verdict.
For ✅: confirm all 5 favor lite. For ⚠️: name the question(s) that
escalated. For 🛑: name the questions that couldn't be answered.>

## Next Step
<One of:>
- ✅ **Lite Path:** Produce a one-page scope doc with these sections — the
  ask, definition of done, out of scope, price + timeline, sign-off.
- ⚠️ **Full Suite:** Run `/client-intake` next. Verdict here means the
  engagement warrants the full chain through `/to-issues`.
- 🛑 **Insufficient Context:** Resolve the following before re-running
  `/triage`: <list 1-3 specific gaps>.
```

## Process

1. **Read the input.** A few sentences from the user about the prospect/engagement.
2. **Capture the ask in one sentence.** Confirm with the user that you've got it.
3. **Capture engagement signals** (budget range, timeline). One question, two pieces of info. These are recorded, not used in the rule.
4. **Walk the 5 gating questions, one at a time, in order.** After each answer, classify favors-lite vs favors-full. Do not bundle.
5. **Apply the rule.** All 5 favor-lite → ✅. Any favor-full → ⚠️. 2+ unsure → 🛑.
6. **Write the triage record** to `docs/triage/<slug>.md`.
7. **Hand off.** Tell the user the next step explicitly.

## Operating Rules

1. **One question at a time.** Same discipline as `/grill-me`. Never dump the 5-question list.
2. **Take the answer, classify it, move on.** Do not probe deeper. Triage is yes/no signals, not discovery.
3. **No solutions, no stack, no scoping.** This skill outputs a routing decision, not product knowledge.
4. **Never override your own verdict.** If the user wants ✅ but you scored a ⚠️, the verdict is ⚠️. Explain why and route accordingly.
5. **"I don't know" counts as a complexity signal.** Treat unsure answers on Q3/Q4 as favors-full unless the user can clarify. Two or more unsure answers means 🛑.
6. **Capture in the consultant's voice, not the prospect's.** The triage doc is for the consultant's records, not the client's eyes.
7. **Stop when verdict is reached.** Do not start drafting the scope doc, the brief, or anything else inside this skill.

## After Writing

- ✅ Lite Path: *"Triage complete — verdict ✅ Lite Path. Skip `/client-intake` and `/grill-me`. Produce a one-page scope doc covering: the ask, definition of done, out of scope, price + timeline, sign-off line. If `/lite-scope` is implemented, run it now."*
- ⚠️ Full Suite: *"Triage complete — verdict ⚠️ Full Suite. Run `/client-intake` next."*
- 🛑 Insufficient Context: *"Triage incomplete — verdict 🛑 Insufficient Context. Get the following from the prospect: [list]. Re-run `/triage` once you have answers."*

## Anti-Patterns

- Asking all 5 questions in one dump ❌
- Using dollar amount as the primary trigger ❌ (it's data, not the rule)
- Treating "unsure" as a tie that defaults to lite ❌
- Overriding the verdict because the user pushes back ❌
- Drifting into product discovery ❌ (that's `/client-intake` and `/grill-me`)
- Recommending a tech stack or architecture ❌ (out of scope)
- Producing a verdict without writing the file ❌ (audit trail matters)
- Re-triaging an in-flight engagement to "demote" it ❌
- Treating the gate as a suggestion rather than a rule ❌
- Padding the output with discovery-style commentary ❌ (the file is short on purpose)

## Example: A clean ✅ Lite Path triage

```markdown
# Triage: Acme Bookstore — Footer Redesign

**Date:** 2026-05-03
**Verdict:** ✅ Lite Path
**Slug:** acme-footer

## The Ask
"Redesign the footer of acmebooks.com to match our new brand colors."

## Engagement Signals
- Estimated budget: $1,500 - $2,500
- Estimated timeline: 1 week

## Gating Answers

| # | Question | Answer | Favors |
| --- | --- | --- | --- |
| Q1 | Single sign-off? | yes (owner only) | lite |
| Q2 | One-sentence "done"? | yes ("footer matches brand") | lite |
| Q3 | Touches money/PII/auth/compliance? | no | lite |
| Q4 | Self-contained scope? | yes (no integrations) | lite |
| Q5 | Client needs trust documentation? | no (existing client, good rapport) | lite |

## Verdict Reasoning
All five questions favor lite. This is a single-decision-maker, contained,
non-sensitive, low-trust-risk engagement. Full suite would be overhead.

## Next Step
✅ Lite Path: Produce a one-page scope doc. No `/client-intake` or
`/grill-me` needed.
```

## Example: A ⚠️ Full Suite triage on a small budget

```markdown
# Triage: Riverside Dental — Patient Reminder Tool

**Date:** 2026-05-03
**Verdict:** ⚠️ Full Suite
**Slug:** riverside-reminders

## The Ask
"Build us something that texts patients 24 hours before their appointment."

## Engagement Signals
- Estimated budget: $3,000 - $5,000
- Estimated timeline: 3-4 weeks

## Gating Answers

| # | Question | Answer | Favors |
| --- | --- | --- | --- |
| Q1 | Single sign-off? | yes (practice owner) | lite |
| Q2 | One-sentence "done"? | yes | lite |
| Q3 | Touches money/PII/auth/compliance? | yes (HIPAA, patient names + appt times) | full |
| Q4 | Self-contained scope? | no (integrates with existing scheduling system) | full |
| Q5 | Client needs trust documentation? | yes (last vendor mishandled patient data) | full |

## Verdict Reasoning
Q3, Q4, and Q5 all escalate. HIPAA exposure alone would be enough; combined
with an integration into a live scheduling system and a burned-client
trust posture, this is unambiguously full suite despite the small budget.

## Next Step
⚠️ Full Suite: Run `/client-intake` next. This engagement warrants the
full chain through ADRs and adversarial review.
```
