---
description: Synthesize PRD from a complete grill-me conversation
tags: [happy-path]
---

## Scenario

A /grill-me session has just completed for a B2B invoice automation product (the same one as grill-me/case-001). The full conversation is in context. The user invokes /to-prd. The skill should synthesize the existing conversation into a 15-section PRD without re-interviewing.

The skill is invoked with this prior context summary:

```
PRIOR CONVERSATION SUMMARY (from /grill-me):
- Product: B2B SaaS for freelance graphic designers to send invoices and get paid faster
- Primary user: Solo freelance graphic designers, 1-10 clients, ~50k addressable on Instagram/Behance
- Pain: 60+ day payment delays; manual chasing eats hours per week
- MVP scope: Connect bank or Stripe -> create invoice -> send via email -> get notified when paid
- Out of scope (v1): time tracking, expenses, multi-currency, project management, team accounts
- Success metric: 30% of users send second invoice within 14 days; avg payment time drops 60d -> <30d
- Stack hints: Stripe, Plaid, Resend, Google OAuth
- Budget: $10k build, <$100/mo run
- Solo founder, no team
- Hard deadline: end of Q3 (designer conference)
- Confidence: 95% reached
```

The user's first message: "/to-prd"

## Simulated user responses

- "Yes the slug 'designer-invoice' is fine."
- "Looks good — file as draft."

## Expected behaviors

- Skill produces a complete PRD with all 15 sections
- Each section pulls from the prior conversation, NOT from invented content
- Frontmatter is present with title, slug, status: draft, owner, created date
- Functional Requirements use FR-N numbering and link to user stories
- Non-Functional Requirements use NFR-N numbering with concrete numbers (latency, uptime targets)
- At least one user story has Given/When/Then acceptance criteria
- Success metrics section is concrete (30% second-invoice rate, <30 day payment time)
- Open Questions section lists genuinely unresolved items (not faked as resolved)
- Out-of-Scope section is explicit
- Skill suggests /prd-adversarial-review as next step

## Anti-patterns to flag

- Inventing requirements not in the prior conversation
- Padding sections to look thorough (e.g., generic NFRs not derived from the context)
- Skipping frontmatter
- Generic placeholders like "TBD" or "improve user experience" instead of derived content
- Re-interviewing the user (this is synthesis, not discovery)
- Goals section that's just a feature list (should be outcome-oriented)
- Missing the Stripe/Plaid/Resend integrations in section 11
