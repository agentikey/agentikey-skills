---
description: Happy path - clean requirements with mild cost drivers but no real tensions. Skill should produce ✅ Proceed.
tags: [happy-path]
---

## Scenario

A `/grill-me` session has just completed for an internal team productivity tool. The requirements are clean and self-consistent. The user invokes `/feasibility-pass` to stress-test before writing the PRD.

The user's first message: "Run /feasibility-pass on this discovery output:"

```markdown
# Discovery — Internal Team Standup Bot
**Date:** 2026-05-02
**Status:** 95% confidence

## Problem
A 6-person engineering team forgets to post async standups in their Slack channel. Currently uses a Google Form that nobody fills out. Need something lower-friction that prompts each person directly and aggregates responses for the team.

## Primary User
Engineers on a 6-person platform team (specific personas: Alex, Sarah, Jamal, plus 3 others). Each works async across PT and ET timezones. Currently paste standups manually 2-3x/week when they remember.

## MVP Scope (v1)
1. Bot DMs each team member every weekday at 9am ET
2. Member replies with three-line standup (yesterday/today/blockers)
3. Bot aggregates all replies and posts a single summary to #platform-standups at 11am ET
4. Missing replies show as "no update from <name>"

## Out of Scope (v1)
- Cross-team aggregation
- Standup history / search
- Anything beyond Slack
- Custom prompts per person

## Success Metrics
- Leading: ≥80% reply rate (5/6 people respond) within first 4 weeks
- Lagging: Team self-reports the daily summary is read by >50% of members in week 4 retrospective

## Constraints
- Budget: $20/month max
- Timeline: 2 weeks to MVP
- Maintainer: Alex, comfortable with TypeScript/Node
- Compliance: None (internal team only, no PII beyond names)

## Integrations
- Slack (bot user, DMs out, channel post in)
- No external integrations

## NFRs
- Reply window: 9am-11am ET, weekdays
- Uptime: 99% on weekdays during business hours; downtime acceptable on weekends
- Data: standup text retained 30 days then auto-deleted
- Single-tenant (one team only)
```

## Simulated user responses

- "Yes, run the full feasibility pass."
- "That's all the input I have. Proceed."

## Expected behaviors

- Skill produces a feasibility report with a verdict
- Verdict is ✅ Proceed (this is a clean spec with no real tensions)
- Skill walks each major requirement and identifies cost drivers
- Skill identifies 1-3 low-stakes open questions (e.g., "what timezone does the bot infer from?", "what happens if Slack DM API rate limits?")
- Skill does NOT manufacture tensions between requirements where none exist
- Skill stays in implication-space — does not pick a stack, runtime, or vendor
- Skill identifies any genuine cost drivers (e.g., "9am-local scheduling means storing per-user timezone state")
- Final recommendation references /to-prd or /tech-stack-advisor as next step

## Anti-patterns to flag

- Manufactures fake tensions to look thorough
- Picks specific services or vendors (e.g., "use AWS Lambda")
- Recommends changes to the requirements (the skill surfaces, the client decides)
- Produces a verdict of ⚠️ or 🛑 without specific blocking issues
- Generates analysis longer than the discovery doc itself
- Vague implications without quantification ("this might be hard")
- Treats every requirement as a tension or risk