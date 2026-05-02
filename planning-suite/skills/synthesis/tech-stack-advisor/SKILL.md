---
name: tech-stack-advisor
description: Recommend a tech stack for a product based on a PRD or in-flight discussion. Optimizes for total cost of ownership for small-business engagements — favoring boring tech, hosted services, and minimal ops burden. Outputs a stack proposal with rationale, alternatives considered, and run-cost estimate. Use after /grill-me has captured load profile and constraints, typically before or alongside /to-prd. Plan Mode — no code.
---

# Tech Stack Advisor

Pick the stack. Bias toward proven, boring, low-ops technology. The goal isn't the most exciting stack — it's the one a one-person consultancy can ship and a client can maintain.

## Operating Principles

1. **Boring is good.** Postgres, not a graph DB. Next.js, not a hand-rolled SSR framework.
2. **Hosted > self-hosted.** Vercel, Supabase, Render, Fly, Resend. Every server you don't run is a server you don't get paged for.
3. **One stack across as many surfaces as possible.** Same language for backend and frontend if reasonable.
4. **Run cost matters.** A $40/month small-business product can't sit on a $400/month infra bill.
5. **Maintenance is a feature.** Pick what the client (or their next dev) can plausibly own.
6. **Document the rejected options.** Half the value of a stack proposal is showing the client you considered the obvious alternatives.

## Inputs

- PRD (or in-progress notes) — especially sections 4 (Goals), 8 (NFRs), 11 (Integrations)
- Client Brief (`clients/<slug>/brief.md`) if it exists
- Any existing tech context the client already has (don't replace what already works)

## Output

A `## Stack Proposal` section to be merged into PRD section 9, plus a standalone `docs/decisions/stack-<slug>.md` (filed via `/decision-log`).

## Output Format

```markdown
# Stack Proposal: <Product Name>

## TL;DR
<3 lines: what we recommend, why, and what it costs to run.>

## Decision Drivers
<3–5 bullets pulled from PRD/brief that drive these choices: load profile,
compliance posture, team skill, run-cost ceiling, integration needs.>

## Components

| Layer | Choice | Rationale | Alternatives considered | Why not them |
| --- | --- | --- | --- | --- |
| Frontend framework | … | … | … | … |
| Backend / API | … | … | … | … |
| Database | … | … | … | … |
| Auth | … | … | … | … |
| Hosting | … | … | … | … |
| File storage | … | … | … | … |
| Email | … | … | … | … |
| Payments | … | … | … | … |
| Background jobs | … | … | … | … |
| Search (if needed) | … | … | … | … |
| Analytics | … | … | … | … |
| Error tracking | … | … | … | … |
| Logs / observability | … | … | … | … |
| CI/CD | … | … | … | … |

## Run-Cost Estimate

| Service | Plan | Monthly | Notes |
| --- | --- | --- | --- |
| … | … | $… | … |

**Total monthly at v1 usage:** $X–$Y
**Total monthly at projected 12-month usage:** $X–$Y

## Risks & Lock-in
- Where vendor lock-in matters and what the exit looks like
- Where the stack might struggle past v1
- What happens if a key vendor (Vercel, Supabase, etc.) raises prices or pivots

## Maintenance Profile
- Who can maintain this on day 365 with what skill set?
- What's the upgrade cadence we're committing to?
- What breaks first if no one touches it for 6 months?

## Open Questions for the Client
- <Anything we couldn't decide without their input.>
```

## Process

1. Read PRD sections 1–8 and the client brief.
2. Identify the **decision drivers**: load profile, compliance, team skill, run-cost ceiling, integration needs. Write them down before picking anything.
3. For each layer, propose a primary choice and 1–2 alternatives. Be honest about why you rejected the alternatives.
4. Estimate run-cost using current public pricing (verify if possible via web search). Show the user the math.
5. Show the user the proposal. Ask: *"Lock this in or push back on anything?"*
6. On approval, write to the PRD section 9 and create an ADR via `/decision-log`.

## Default Stacks (starting points, not gospel)

These are sensible defaults to start the conversation. **Always justify your final choice against the PRD's actual constraints.**

### "Standard SaaS for small business"
- Next.js (App Router) on Vercel
- Postgres on Supabase (auth + storage + DB in one)
- Resend for email
- Stripe for payments
- Sentry for errors
- PostHog or Plausible for analytics
- ~$40–$120/mo at v1

### "Internal tool for an SMB ops team"
- Retool, or Next.js + Postgres on Render
- Postgres on Render or Neon
- Auth0 or Clerk if multi-user; otherwise basic email magic links
- ~$20–$80/mo at v1

### "AI-augmented business app"
- Next.js on Vercel
- Postgres on Supabase
- Anthropic API (Claude) for the LLM layer
- Vercel AI SDK for streaming UX
- LangSmith or Langfuse for trace observability
- Background jobs on Inngest or Trigger.dev
- ~$60–$300/mo at v1 (LLM cost is the variable)

## Anti-Patterns

- Recommending Kubernetes for a 10-user internal tool ❌
- Picking the framework you used last (cargo cult) ❌
- Skipping run-cost estimate ❌
- Not naming alternatives — looks like you didn't consider them ❌
- Hiding lock-in — the client deserves to know the exit cost ❌
