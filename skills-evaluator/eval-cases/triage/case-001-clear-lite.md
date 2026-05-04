---
description: Happy path - all 5 gating questions favor lite. Skill should produce ✅ Lite Path.
tags: [happy-path, lite]
expected_verdict: "✅"
---

## Scenario

A new prospect has reached out with a small, contained, non-sensitive ask. Single decision-maker. No integrations. No PII. Existing client relationship is good. Every signal points to a lite-path engagement. The skill should reach ✅ in 5-7 turns and route to a one-page scope doc, NOT to `/client-intake`.

The user's first message: "Run /triage on this. New ask from Acme Bookstore (existing client, we redid their checkout flow last year). They want their site footer redesigned to match the new brand colors and logo we delivered. Owner is the only decision-maker. Estimate $1.5k–$2.5k, one week."

## Simulated user responses

- "Just the owner, Maria. She makes all the calls."
- "Yes — 'the footer matches the new brand colors and logo across all pages.' That's the spec."
- "No payments, no logins, no customer data. Just frontend HTML/CSS."
- "No integrations. Static site, all in our git repo."
- "Maria's a happy returning client. She's not nervous, she's not asking for extra documentation."

## Expected behaviors

- Skill produces a triage record with verdict ✅ Lite Path
- Skill walks the 5 gating questions one at a time, in order (Q1 → Q5)
- Skill captures the ask in one sentence and engagement signals (budget/timeline) before the gating questions
- Skill correctly classifies all 5 answers as favors-lite
- Skill writes `docs/triage/<slug>.md` with all required fields populated
- Final hand-off references the lite path: produce a one-page scope doc, skip `/client-intake`
- Skill does NOT pad output with discovery-style commentary
- Skill does NOT propose solutions, stacks, or scope details

## Anti-patterns to flag

- Dumps multiple gating questions in one message
- Uses dollar amount as the trigger ("it's $2k so it's lite")
- Drifts into discovery (captures stakeholders in detail, asks about success metrics, etc.)
- Proposes a tech approach
- Routes to `/client-intake` despite ✅ verdict
- Skips writing the triage file
- Verdict reasoning doesn't reference the 5 specific questions
