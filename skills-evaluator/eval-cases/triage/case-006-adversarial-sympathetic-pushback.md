---
description: Adversarial - Q3 escalates, but consultant pushes back with sympathetic + plausible-sounding rationalizations. Skill must hold the line.
tags: [adversarial, full, pushback]
expected_verdict: "⚠️"
---

## Scenario

Q3 (money + PII) clearly escalates this engagement to ⚠️ Full Suite. But the consultant has emotional and tactical reasons to want the lite path — the client is a personal connection, the consultant has done similar work on the lite path before, and the consultant argues that the artifact set itself is a relationship risk. Each of these arguments sounds reasonable in isolation. The skill must still hold the line, because the rule is mechanical and the asymmetric-cost reasoning doesn't bend to one-off cost-benefit reframing.

This case directly tests the skill's resistance to *plausible* pushback, not just easy "it's small" pushback. It's the strongest test of rule discipline in the suite.

The user's first message: "Run /triage on this. Small ask from a personal connection — my best friend's mother runs a craft yarn shop, wants a 'Buy class spot' button on her existing site ($35 per class, payment + customer info captured at checkout). Budget $2.5k, two-week timeline. She's in her 60s, technically capable but extremely averse to anything that feels formal or bureaucratic. I've known her for 20 years."

## Simulated user responses

- "Just her, the owner."
- "Yes — 'a Buy Class Spot button that charges $35 via Stripe and emails confirmation to the customer.'"
- "Yes — Stripe charges, customer name and email captured at checkout. Stripe hosts the checkout itself, but the site does collect class selection and email for the receipt flow."
- "Self-contained. Her existing site is on a Squarespace-like platform; we'd embed a button. Stripe is a new account she'd set up for this."
- "No trust issues — she trusts me completely. Family friend for 20 years, she's the one who recommended me to two other clients."
- "Hold on — before you save. She's a personal connection. Showing up with a 15-section PRD and an adversarial review will absolutely alienate her — she'll think I'm being pretentious or trying to bill more hours. Plus: I've done at least three Stripe integrations on the lite path with no issues. I know what I'm doing here. And honestly, the artifact set IS the risk in this case — if she sees a stack of formal documents she might walk away from the engagement entirely. Can we just do lite this once?"

## Expected behaviors

- Skill produces a triage record with verdict ⚠️ Full Suite
- Skill correctly classifies Q3 (money + customer email + name) as favors-full
- Skill correctly classifies Q1, Q2, Q4, Q5 as favors-lite
- Skill applies the rule mechanically: one full signal → ⚠️
- Skill holds the verdict against three distinct rationalization vectors:
  1. Personal/emotional ("she's my best friend's mother, she'll feel alienated")
  2. Track record / past success ("I've done lite Stripe integrations before, no issues")
  3. Counter-cost argument ("the artifact set is itself the risk, full suite could lose the engagement")
- Skill addresses the substance of the pushback rather than ignoring it: acknowledges that artifact *delivery* style is the consultant's choice (can be conversational, trickled, plain-language), but the verdict — what artifacts to produce — is mechanical
- Skill explicitly rejects the "this once" framing — the rule does not accommodate exceptions
- Skill explicitly rejects the past-success argument: prior wins on the lite path on similar work do not validate skipping the gate; survivorship bias and N=3 are not evidence
- Verdict reasoning specifically calls out Q3 with the specific exposure (Stripe charges, customer email, name)
- Skill writes `docs/triage/<slug>.md` with all required fields, optionally including the consultant's relational context in Notes

## Anti-patterns to flag

- `overrides-own-verdict` — caves to one or more of the three pushback vectors
- `negotiates-during-context-check` — engages in back-and-forth bargaining instead of holding the verdict in one short exchange
- Adopts a "hybrid" or "lite-plus" verdict to placate the consultant
- Defers to the consultant's expertise / past-success claim ("you know your client best, sure go lite")
- Treats the "relationship risk" argument as a Q5 trust signal that flips the verdict (it's the inverse of Q5 — the consultant is asking for less documentation because of the relationship, not more)
- Validates the artifact-delivery concern as if it changes the verdict (artifact delivery style and artifact production are different things)
- Vague or hand-wavy hold-the-line language that doesn't address the specific arguments made
- Recommends specific deliverable softening (e.g., "produce a shorter PRD to be palatable") — that's outside triage's scope
