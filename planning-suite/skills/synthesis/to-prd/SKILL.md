---
name: to-prd
description: Synthesize the current planning conversation into a structured Product Requirements Document. Use after a /grill-me session, or whenever the user says "write this up", "draft a PRD", "turn this into a spec". Outputs a markdown PRD to docs/prd/<slug>.md with all sections required for a parent GitHub issue. Plan Mode only — no code.
---

# To PRD

Convert what's already in the conversation into a complete PRD. Do not interview further unless something is genuinely missing — for that, hand back to `/grill-me`.

## When to Run

- After `/grill-me` reaches alignment
- When the user explicitly says "write the PRD"
- When you have enough context that another engineer could build it

## When NOT to Run

- If you're below 90% on the `/grill-me` Coverage Checklist (run `/grill-me` first)
- If the user is still exploring the idea (run `/grill-me` first)

## Output Location

`docs/prd/<kebab-case-slug>.md` (create the directory if missing).

The slug is derived from the product name in 3–6 words. Confirm the slug with the user before writing.

## PRD Structure

Use exactly these sections in this order. Skip a section only with an explicit reason inline ("N/A — single-tenant internal tool").

### 1. Summary (3–5 sentences)
What this is, who it's for, why now.

### 2. Problem & Opportunity
The pain, who has it, the cost of leaving it unsolved, why this is the right time to solve it.

### 3. Users & Stakeholders
- **Primary user:** persona, context, frequency of use
- **Secondary users:** ditto
- **Decision-maker / buyer:** if B2B
- **Internal stakeholders:** support, ops, finance touchpoints

### 4. Goals & Non-Goals
- **Goals:** 3–7 bullets, each tied to a measurable outcome
- **Non-Goals:** explicit list of what we are *not* doing in v1

### 5. Success Metrics
Table with: metric name, definition, target, measurement source, owner.

Include both leading (e.g., "DAU/WAU") and lagging (e.g., "30-day retention") indicators.

### 6. User Stories & Use Cases
Use the `As a <user>, I want <capability> so that <outcome>` format. Group by user persona. Mark each as MVP / v1.1 / v2.

For each MVP story, include 1–3 acceptance criteria in Given/When/Then form.

### 7. Functional Requirements
Numbered list (FR-1, FR-2, …) for traceability. Each requirement is testable and atomic. Link each FR to the user story it serves.

### 8. Non-Functional Requirements
Numbered (NFR-1, …). Cover at minimum:
- Performance (latency budgets per key flow)
- Availability / uptime
- Security & privacy (PII classification, encryption, auth model)
- Scalability (expected load + 12-month projection)
- Accessibility (WCAG target)
- Observability (what gets logged/measured)
- Compliance (SOC2, HIPAA, GDPR, etc., if applicable)

### 9. Tech Stack & Architecture
- Recommended stack with one-line rationale per choice (defer detail to `/tech-stack-advisor` if not yet decided)
- High-level architecture description
- Mermaid C4-style diagram (use `/architecture-diagram` skill)
- Key third-party services and their purpose

### 10. Data Model
Entities, key fields, relationships. Mermaid ER diagram for non-trivial schemas.

### 11. Integrations
External systems this touches. For each: purpose, direction (read/write/both), auth method, failure mode.

### 12. Risks & Open Questions
Two-section list. Each risk has: likelihood, impact, mitigation. Each open question has: who owns answering it, by when.

### 13. Milestones & Rough Timeline
Not a Gantt — phases (Discovery, MVP, Beta, GA) with rough week ranges and entry/exit criteria.

### 14. Out-of-Scope (v1)
Explicit list. Important — this is what protects scope later.

### 15. Appendix
- Glossary of domain terms
- Links to related ADRs (`docs/decisions/`), prior conversations, client brief

## Style Rules

- Tight prose. No filler. No "leveraging synergies" language.
- Every requirement is testable. If you can't write a test for it, rewrite it.
- Numbers, not adjectives. "Fast" → "p95 < 300ms".
- Open questions are a feature, not a bug. List them. Don't fake answers.

## Frontmatter

Every PRD file starts with:

```yaml
---
title: <Product Name>
slug: <kebab-case>
status: draft  # draft | reviewed | accepted | building | shipped
owner: <you>
client: <client-slug or "internal">
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
prd_issue:           # populated by /to-github-prd-issue
prd_issue_number:    # populated by /to-github-prd-issue
---
```

## After Writing

1. Show the user the file path.
2. Ask: *"Ready for adversarial review? I can run `/prd-adversarial-review` to stress-test this before we file the GitHub issue."*
3. If they say yes, hand off to that skill. If no, offer `/to-github-prd-issue` to create the parent issue directly.

## Anti-Patterns

- Inventing requirements that weren't in the conversation ❌
- Padding sections to look thorough — better an honest "N/A" ❌
- Writing the PRD before `/grill-me` reaches alignment ❌
- Burying open questions instead of listing them in section 12 ❌
