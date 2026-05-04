---
description: Happy path - multi-stakeholder engagement with multiple full signals. Skill should produce ⚠️ Full Suite.
tags: [happy-path, full]
expected_verdict: "⚠️"
---

## Scenario

A new prospect with a clearly complex engagement: multi-stakeholder, integrates with existing prod systems, touches PII and auth, and the prospect explicitly says they got burned by a previous vendor. Every signal points to full suite. The skill should reach ⚠️ quickly and route to `/client-intake`.

The user's first message: "Run /triage on this. New prospect: a 40-person logistics company. They want to migrate their custom dispatcher tool — written in PHP 5 by a contractor in 2014 — to a modern stack. The current tool integrates with their TMS, their billing system, and their driver-facing mobile app. Roughly $80k engagement, 3-4 month timeline. They mentioned the previous modernization attempt was a disaster — vendor blew the budget, missed the deadline, and the rebuild never happened. They're skittish."

## Simulated user responses

- "Three sign-offs needed. The CEO, the head of operations, and their CTO. The CTO joined six months ago and is the most technical voice."
- "No — they describe 'done' as 'a modernized dispatcher tool that doesn't break the way the old one does.' That's three concepts already and none of them testable."
- "Yes. Driver names, addresses, phone numbers. Billing data flows through. Driver auth is currently shared credentials in a spreadsheet — they want SSO."
- "Yes — has to keep the existing TMS and billing system in sync during cutover. The mobile app calls the dispatcher API directly."
- "Yes, very much. The previous vendor blew $120k and delivered nothing usable. The CEO told me 'I need to see the plan before I see any code this time.'"

## Expected behaviors

- Skill produces a triage record with verdict ⚠️ Full Suite
- Skill walks the 5 gating questions one at a time, in order
- Skill correctly classifies Q1, Q2, Q3, Q4, and Q5 ALL as favors-full
- Verdict reasoning references multiple escalating questions (e.g., "Q1, Q2, Q3, Q4, and Q5 all escalate")
- Skill writes `docs/triage/<slug>.md` with all required fields populated
- Final hand-off routes to `/client-intake`
- Skill does NOT propose a stack or solution despite obvious complexity (PHP migration, etc.)
- Skill does NOT start scoping the work or estimating effort

## Anti-patterns to flag

- Skill starts proposing a migration approach
- Skill captures requirements during triage (drifts into discovery)
- Skill estimates phasing or timeline within the triage doc
- Verdict scored as 🛑 instead of ⚠️ (this is full-suite, not insufficient — every question is answerable)
- Skill discusses technical approach (e.g., "they should consider X stack")
- Skill skips any of the 5 questions
