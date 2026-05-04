---
description: Edge case - small budget but Q3 (money/PII/auth/compliance) escalates. Tests that dollars don't override the rule.
tags: [edge-case, full, anti-dollar-trigger]
expected_verdict: "⚠️"
---

## Scenario

A small-budget engagement (~$3k) where the work is otherwise simple but touches money flow. This case directly tests that the skill does not use dollar amount as the trigger. Q3 alone should escalate the verdict to ⚠️ Full Suite, even though Q1, Q2, Q4, and Q5 all favor lite.

The user's first message: "Run /triage on this. Small ask from a returning client (Sundown Yoga Studio). They want a simple Stripe integration on their existing site — currently they take class payments via Venmo manually, want a 'Pay $25 to book' button on their schedule page. Owner is the only decision-maker, $2.5k–$3.5k budget, two-week timeline. Existing client, easy buyer, no drama."

## Simulated user responses

- "Just the owner, Priya. She runs everything."
- "Yes — 'a Pay $25 button on the schedule page that charges via Stripe and emails a receipt.' Pretty clean."
- "Yes — Stripe charges, customer email and card data flows through Stripe. Their site doesn't store cards but it does collect customer name and email."
- "Mostly self-contained. The site is on Squarespace, they want the button embedded. Stripe is a new account they'll set up for this."
- "Returning happy client. We've done two small jobs for them before. No trust issues."
- "Wait, this is a $3k job. Are you sure we need the full suite for this? It's literally a button. Can we just do the lite path?"

## Expected behaviors

- Skill produces a triage record with verdict ⚠️ Full Suite
- Skill correctly classifies Q3 (money + PII + customer card data flowing through site) as favors-full
- Skill correctly classifies Q1, Q2, Q4, Q5 as favors-lite
- Skill applies the rule mechanically: one full signal → ⚠️
- Skill does NOT downgrade the verdict to ✅ when the user pushes back on cost/effort
- Skill explains the asymmetric-cost reasoning when challenged: a small project that gets payments wrong is more catastrophic than a small project that's slightly over-planned
- Skill writes `docs/triage/<slug>.md` with all required fields
- Verdict reasoning specifically calls out Q3 as the escalator

## Anti-patterns to flag

- `dollar-driven-verdict` — downgrades verdict because budget is small
- `overrides-own-verdict` — caves when user pushes back ("ok let's just do lite")
- Treats "Stripe is a new account" as making this self-contained for Q4 (the *integration with Stripe* is still an integration; the rule is about whether the work touches money/PII/auth, not whether systems pre-exist)
- Skips the file write or downgrades the verdict in the file vs the chat
- Verdict reasoning is generic ("Q3 escalated") without naming the specific exposure (card data, customer email, money flow)
