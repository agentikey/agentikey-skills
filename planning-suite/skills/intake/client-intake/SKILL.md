---
name: client-intake
description: Run a structured initial discovery for a new small-business client before any product work begins. Captures stakeholders, budget, timeline, success criteria, contractual constraints, and tech context. Use at the start of any new client engagement, before /grill-me. Output is a Client Brief used as input to product-level discovery. Plan Mode only.
---

# Client Intake

Initial discovery for a new client. This runs **before** product-level grilling — it establishes the context that everything else operates inside. A consultancy that skips this step ends up rebuilding scope twice.

## When to Run

- New client kickoff
- Before any product PRD work for this client
- Re-run when material context changes (new budget, new stakeholder, new compliance need)

## Output

`clients/<client-slug>/brief.md`

## Areas to Cover (in order)

### 1. The Business
- What does the company do? Industry, size, stage.
- Who are their customers?
- What's been growing or breaking lately?

### 2. Stakeholder Map
- Who's the **economic buyer** (signs the check)?
- Who's the **executive sponsor** (champions internally)?
- Who are the **end users** of what we're building?
- Who's the **technical contact** (if any)?
- Who could **kill the project** (and why might they)?

### 3. The Ask
- What outcome do they want from this engagement?
- Why us, why now?
- What have they tried before? Why didn't it work?

### 4. Budget & Commercial
- Budget range for this engagement (build)?
- Ongoing run-cost tolerance (per month)?
- Payment terms / milestones / fixed-price vs T&M?
- What does *out-of-scope change* cost (your hourly or change-order rate)?

### 5. Timeline & Hard Dates
- Any external deadline (event, contract, season)?
- When do they want to see the first usable thing?
- What does "done" mean to them?

### 6. Existing Tech Context
- Current stack (if any)
- Existing accounts / vendors / SaaS they're paying for
- Data they already have (CRM, spreadsheets, ops tools)
- Anyone internal who can maintain what we build?

### 7. Constraints
- Compliance / regulatory (HIPAA, PCI, GDPR, industry-specific)
- IP / contractual (do they own the code, do you, mixed)
- Security expectations (where can data live, who can see it)

### 8. Risks (your assessment, not theirs)
- What could go wrong with this engagement?
- Where is the relationship fragile?
- Where might scope explode?
- Is there an internal politics signal you're picking up?

## Process

1. Walk through the areas above. One at a time. No checklists dropped on the user.
2. Where the answer is fuzzy, push gently: *"Give me a number, even a wrong one — we'll refine."*
3. After every 2–3 areas, summarize what you have and ask for correction.
4. End with: *"Anything you wish I'd asked but didn't?"*

## Output Format

```markdown
# Client Brief: <Client Name>

- **Engagement start:** YYYY-MM-DD
- **Slug:** <kebab-case>
- **Account owner:** <you>

## 1. Business Context
…

## 2. Stakeholders
| Role | Name | Notes |
| --- | --- | --- |
| Economic buyer | … | … |
| Executive sponsor | … | … |
| End users | … | … |
| Technical contact | … | … |
| Project risk (could kill) | … | … |

## 3. The Ask
…

## 4. Commercial
- Build budget: $…
- Monthly run-cost ceiling: $…
- Terms: …
- Change-order rate: …

## 5. Timeline
- Hard deadline: …
- First-usable target: …
- Definition of done: …

## 6. Existing Tech
…

## 7. Constraints
…

## 8. Engagement Risks
…

## 9. Open Questions
- …
```

## After Writing

1. Save to `clients/<client-slug>/brief.md`.
2. Tell the user: *"Brief saved. Ready to dig into the actual product? Run `/grill-me`."*

## Anti-Patterns

- Treating intake as a sales call — this is engineering discovery ❌
- Skipping the "who could kill this" question — every project has one ❌
- Accepting "we don't have a budget yet" — at least get a ceiling ❌
- Forgetting to ask who maintains the thing on day 365 ❌
