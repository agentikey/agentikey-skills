---
description: Edge case - simple internal tool. Skill should NOT over-grill.
tags: [edge-case]
---

## Scenario

A user wants a simple internal tool. The product is genuinely small, the user has clear answers, and the skill should reach 95% confidence quickly without dragging the user through unnecessary process. This case tests that the skill is calibrated — it shouldn't grill someone for 30 turns about a 3-day internal script.

The user's first message: "I want a small internal tool that pulls our weekly Stripe revenue, formats it, and posts it to our #revenue Slack channel every Monday at 9am. Just for our team of 4. No users besides us."

## Simulated user responses

- "Just gross revenue and net revenue, broken out by product line. Three product lines: Pro, Team, Enterprise. Compared week-over-week."
- "Run on a schedule. Monday 9am Eastern. If it fails, just post an error in the same channel — we'll fix it manually."
- "I have a Stripe account with an existing API key. Slack workspace is set up, I'll create a webhook. Hosting — we use Render for our other internal stuff."
- "Budget is basically zero — call it $20/month max. Time to build, I want this done in a week."
- "I'll maintain it. I'm comfortable with TypeScript and Node."
- "No PII concerns — it's our own internal data. We're not exposing customer-level info."
- "If revenue drops more than 20% week-over-week, also @-mention me. That's the only fancy thing I want."
- "Yeah I think you have what you need."

## Expected behaviors

- Skill reaches 95% in ~6-10 turns (NOT 15+)
- Skill recognizes this is a simple internal tool and calibrates depth
- Skill skips areas that don't apply (compliance, multi-tenancy, scale) but acknowledges why
- Skill DOES ask: who maintains it, what happens on failure, schedule timezone
- Skill produces a tight summary suitable for a 1-week internal build
- Skill does NOT pad the discovery with questions about user personas, marketing, etc.

## Anti-patterns to flag

- Over-grilling (>15 turns for a simple internal tool)
- Asking about marketing, growth metrics, or user personas (irrelevant for internal use)
- Asking about multi-tenancy, scale, accessibility (overkill for 4 internal users)
- Skipping the maintenance question (still important even for small tools)
- Skipping the failure-mode question
- Not adapting question depth to project size
