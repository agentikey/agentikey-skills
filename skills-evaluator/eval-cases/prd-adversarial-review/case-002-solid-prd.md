---
description: Adversarial review of a genuinely solid PRD - should NOT manufacture issues
tags: [adversarial]
---

## Scenario

The user provides a well-constructed PRD. The review should find few or no must-fix issues and verdict ship-ready or edits-needed (not rework). This tests that the review doesn't over-rotate into manufactured critique to look thorough.

The user's first message: "Run /prd-adversarial-review on this PRD:"

```markdown
---
title: Internal Stripe Revenue Bot
slug: stripe-revenue-bot
status: draft
owner: alice
created: 2026-05-01
---

# PRD: Internal Stripe Revenue Bot

## 1. Summary
Internal Slack bot that posts weekly Stripe revenue (gross + net, by product line) to #revenue every Monday 9am ET. Used by 4-person team. Replaces a manual spreadsheet update.

## 2. Problem
The team manually pulls revenue numbers from Stripe weekly. Takes ~30 min, prone to copy errors, sometimes forgotten. Need automated weekly snapshot in Slack.

## 3. Users
- Primary: 4 team members in #revenue (founder, 2 engineers, ops lead)
- No external users

## 4. Goals
- Eliminate manual weekly revenue update
- Surface week-over-week change for early detection of issues
- Zero ongoing maintenance burden

## 5. Non-Goals
- Customer-level revenue analysis
- Multi-tenant deployment
- Public dashboard
- Real-time revenue tracking

## 6. Success Metrics
| Metric | Target | Source |
| --- | --- | --- |
| Weekly post success rate | >= 99% | Slack message logs |
| Manual update incidents | 0 / quarter | Team self-report |
| Time saved | ~2 hrs / month | Estimated baseline |

## 7. User Stories
- As a team member, I want a weekly revenue post in #revenue so I see numbers without logging into Stripe.
  - **AC:** Given Monday 9am ET, when the scheduler fires, then a message posts with gross/net by product line.
  - **AC:** Given a >20% week-over-week revenue drop, when posting, then @alice is mentioned.

## 8. Functional Requirements
- FR-1: Pull last 7 days of completed charges from Stripe API (linked to story above)
- FR-2: Aggregate by product line (Pro, Team, Enterprise) (linked to story above)
- FR-3: Format as Slack block kit message
- FR-4: Post to #revenue channel via webhook
- FR-5: Compare to prior week; @-mention alice if drop >20%
- FR-6: Log every run (success/failure) to stdout for Render logs

## 9. Non-Functional Requirements
- NFR-1: Job completes within 60 seconds
- NFR-2: On failure, post error message to same channel within 90 seconds
- NFR-3: Uptime SLO: 99% (4 missed runs/year acceptable for internal tool)
- NFR-4: Stripe API key rotation supported via Render env vars
- NFR-5: No PII logged (only aggregate revenue numbers)

## 10. Tech Stack
- Node.js + TypeScript
- Stripe SDK (official)
- Slack webhook (incoming-webhook URL stored in Render env)
- Render scheduled job (cron: `0 13 * * 1` UTC = 9am ET)
- Render Postgres for prior-week revenue snapshot (single table)

## 11. Data Model
Single table: `weekly_snapshots`
- id (uuid)
- week_start (date, unique)
- gross_pro (numeric)
- gross_team (numeric)
- gross_enterprise (numeric)
- net_total (numeric)
- created_at (timestamp)

## 12. Integrations
- Stripe: read-only API key, scoped to charges/subscriptions
- Slack: incoming webhook to #revenue, scoped to one channel

## 13. Risks & Open Questions
**Risks:**
- Stripe API outage at 9am Monday → log error to channel; team falls back to manual check.
- Slack webhook URL leaks → rotate; impact limited to spam in one channel.

**Open Questions:**
- Q: Do we want to track refunds separately? Owner: alice. Decide by: 2026-05-08.

## 14. Out-of-Scope (v1)
- Multi-channel posting
- Customizable schedule per user
- Daily snapshots
- Customer-level breakdown
- Charts or visualizations

## 15. Appendix
- Glossary: "Net" = gross - refunds - chargebacks
- ADR: 0001-render-cron-over-aws-eventbridge
```

## Simulated user responses

- "Yes, run all 5 lenses."

## Expected behaviors

- Verdict is "ship-ready" or "edits-needed" — NOT rework
- Most lenses return ✅ Solid; at most one returns ⚠️ Concerns
- Each lens still produces something (even if just confirming the PRD is solid in that area)
- If issues are flagged, they are real (not manufactured)
- Synthesis Top-3 should be small or empty if nothing major to fix
- Skill does NOT manufacture issues to "look thorough"
- Skill DOES note real edge cases worth considering (e.g., if Stripe API key compromise was unaddressed — but it's addressed in NFR-4, so no flag)

## Anti-patterns to flag

- Verdict "rework" on a PRD that is genuinely solid
- Manufactured critique (e.g., "the success metrics could be more ambitious" — that's not a flaw)
- Padding lens reports to look like work was done
- Listing nice-to-haves as "must-fix"
- Generic concerns not tied to specific PRD sections
