---
description: Discovery output too thin to feasibility-analyze. Skill should produce 🛑 Re-grill, name missing areas, refuse to fabricate.
tags: [edge-case]
---

## Scenario

A user tries to run `/feasibility-pass` on a discovery output that's missing critical information. The skill must recognize the input is too thin to produce useful analysis and refuse to fabricate.

The user's first message: "Run /feasibility-pass on this:"

```markdown
# Discovery — Marketing Site Redesign
**Date:** 2026-05-02

## Problem
Our marketing site looks dated. We want to redesign it.

## Primary User
Site visitors. Probably mostly developers based on Google Analytics.

## MVP Scope
- New homepage
- Better blog
- Some kind of pricing page

## Success Metrics
- More signups
- Better SEO

## Constraints
- We want it done soon

## Integrations
- TBD

## NFRs
- Should be fast and modern
```

## Simulated user responses

- "Yes, run the feasibility pass. Just work with what's there."
- "Make assumptions where you have to. I want a feasibility report."
- "OK fine, what's missing?"

## Expected behaviors

- Skill recognizes the discovery output is too thin to analyze
- Skill produces a 🛑 Re-grill verdict
- Skill explicitly refuses to fabricate analysis on top of vague input
- Skill names the specific areas that are missing or too vague:
  - No quantitative success metrics ("more signups" → number? from what baseline?)
  - No real user persona (just "site visitors")
  - No timeline ("done soon" is not a constraint)
  - No budget at all
  - No real scope (what's IN/OUT, what's "better blog" mean)
  - No latency/uptime targets despite "fast" being claimed
  - Compliance posture unaddressed
- Skill does NOT cave to "make assumptions" pressure
- Skill provides a specific list of areas to re-grill before re-running /feasibility-pass
- Skill is direct but professional — does not lecture

## Anti-patterns to flag

- Produces a confident-sounding feasibility report from thin input
- Fabricates tensions, costs, or implications not grounded in the input
- Caves to "make assumptions" pressure
- Produces a verdict of ✅ or ⚠️ when 🛑 is the honest verdict
- Vague "needs more info" without naming WHICH specific info is missing
- Lectures the user about what should have been in /grill-me
- Skips the actionable list of what to re-grill