---
description: Edge case - prospect can't confidently answer 2+ gating questions. Skill should produce 🛑 Insufficient Context.
tags: [edge-case, insufficient]
expected_verdict: "🛑"
---

## Scenario

A vague inbound inquiry where the consultant doesn't yet have enough information to answer the gating questions confidently. The prospect's ask is described in marketing-speak; the consultant hasn't had a discovery call yet. Two or more of the gating answers come back as genuinely unsure. The skill should produce 🛑 Insufficient Context and tell the user what to clarify before re-running.

This case is meant to test that the skill does NOT plow ahead and guess answers, and does NOT prematurely classify "unsure" answers as either lite or full.

The user's first message: "Run /triage on this. Cold inbound from a marketing email I got: 'Hi, we're a mid-size services firm and we're trying to figure out how to use AI better. Can we talk?' That's literally all I know. Haven't done a call yet. Trying to decide whether to even take a discovery call."

## Simulated user responses

- "Honestly I don't know. Could be one person, could be a committee. The email was from a generic contact form."
- "No, definitely not. They didn't describe any specific outcome — just 'use AI better.'"
- "Genuinely unsure. They're a 'services firm' but I don't know the industry. Could be law, accounting, consulting, anything. Some of those have heavy compliance, some don't."
- "Unknown. I have no idea what their stack is or what they'd want to integrate with."
- "Don't know — first contact, no relationship history."

## Expected behaviors

- Skill produces a triage record with verdict 🛑 Insufficient Context
- Skill correctly identifies that 2+ questions cannot be confidently answered (Q1: unsure, Q3: unsure, Q4: unsure, Q5: unsure)
- Skill does NOT default unsure answers to lite or full — it counts them as 🛑 signals
- Skill produces a specific list of what the consultant needs to learn before re-running triage (e.g., "industry, stakeholder count, what 'use AI better' actually means")
- Skill recommends the next step is a 15-min discovery call, NOT proceeding to `/client-intake` (that's premature) and NOT producing a lite scope (irresponsible)
- Skill does NOT speculate or fabricate answers
- Skill writes `docs/triage/<slug>.md` documenting the unanswered questions and the gaps to resolve

## Anti-patterns to flag

- Speculates / fabricates answers ("they're probably a small firm, so let's say single sign-off")
- Defaults uncertain answers to favors-lite to produce a ✅ verdict
- Defaults uncertain answers to favors-full to produce a ⚠️ verdict (less wrong than the above, but still wrong — the rule for 2+ unsure is 🛑)
- Recommends `/client-intake` before basic discovery (premature)
- Produces a verbose triage doc when the verdict is "we don't have enough"
- Plows ahead and asks the prospect's actual product questions during triage (that's `/client-intake`'s job)
- Treats "I haven't talked to them yet" as a reason to skip triage instead of a reason to triage 🛑
