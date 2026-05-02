---
description: Adversarial review of an obviously weak PRD - should flag many issues
tags: [happy-path]
---

## Scenario

The user provides a deliberately weak PRD and invokes /prd-adversarial-review. A good review must catch the obvious issues across multiple lenses. The PRD content is included in the scenario below.

The user's first message: "Run /prd-adversarial-review on this PRD:"

```markdown
---
title: TaskBuddy
slug: taskbuddy
status: draft
---

# PRD: TaskBuddy

## 1. Summary
TaskBuddy is a productivity app that helps teams manage tasks. It uses AI to be smarter than other task managers.

## 2. Problem
People have too many tasks and forget things.

## 3. Users
Anyone who has tasks. Especially knowledge workers.

## 4. Goals
- Help users be more productive
- Use AI to be smart
- Look beautiful

## 5. Success Metrics
- High engagement
- Users love it

## 6. User Stories
- As a user, I want to add tasks so I can remember them.
- As a user, I want to see my tasks.

## 7. Functional Requirements
- The app must let users add tasks.
- The app must use AI.
- The app must work on mobile and web.

## 8. Non-Functional Requirements
- Must be fast.
- Must be secure.
- Must scale.

## 9. Tech Stack
React, Node, MongoDB, OpenAI.

## 10. Data Model
Users have tasks. Tasks have titles.

## 11. Integrations
None for now.

## 12. Risks
- Competition is high.

## 13. Timeline
- 3 months to launch.

## 14. Out-of-Scope
N/A
```

## Simulated user responses

- "Yes, run all 5 lenses."

## Expected behaviors

- Skill produces all 5 lenses (Product Framing, Technical Feasibility, Scope Discipline, Security, Operational Reality)
- Each lens identifies AT LEAST 3 specific issues with the PRD
- Issues cite the PRD section they appear in
- Synthesis section produces a Top 3 must-fix list
- Overall verdict is "rework" (not ship-ready, given the obvious weaknesses)
- Product Framing lens flags: vague users, unmeasurable success metrics, generic goals
- Technical Feasibility lens flags: undefined AI behavior, no integration story, no auth model
- Scope Discipline lens flags: scope is undefined, no v1 cutoff, "use AI to be smart" is not scope
- Security lens flags: no PII handling, no auth model specified, multi-tenancy unaddressed
- Operational Reality lens flags: no observability plan, no on-call, no cost ceiling

## Anti-patterns to flag

- Verdict ✅ ship-ready (this PRD is clearly not ready)
- Lenses converge on the same 1-2 critiques (lens collapse)
- Generic critique without section references
- Polite cover that obscures real issues
- Synthesis is just a summary of lens findings, not a Top-3 must-fix call
- Missing any of the 5 lenses
