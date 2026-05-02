---
description: Requirements with genuine tensions across latency, cost, security, and integration. Skill should produce ⚠️ Resolve open questions and surface specific trade-offs.
tags: [adversarial]
---

## Scenario

A `/grill-me` session has just completed for a client-facing customer support tool. The requirements look reasonable in isolation but have several genuine tensions between them. The user invokes `/feasibility-pass` to stress-test.

The user's first message: "Run /feasibility-pass on this discovery output:"

```markdown
# Discovery — Customer Support Triage Assistant
**Date:** 2026-05-02
**Status:** 95% confidence

## Problem
SaaS company (Acme, ~12 customer support reps) wants an AI assistant that drafts response suggestions for incoming support tickets. Reps currently spend 8-15 minutes per ticket researching account history before responding. Goal is to cut average response time in half.

## Primary User
Customer support rep (specific persona: Maria, 2 years tenure, handles ~25 tickets/day). Maria reads each ticket, looks up the customer in 3 systems (CRM, billing, product analytics), and drafts a response. Wants the AI to do the lookup-and-draft step.

## MVP Scope (v1)
1. AI reads incoming ticket (from Zendesk webhook)
2. AI pulls account context from Salesforce, Stripe, and Mixpanel
3. AI drafts a suggested response
4. Rep sees draft inline in Zendesk; can accept, edit, or reject
5. AI must respond within 3 seconds of ticket arriving

## Out of Scope (v1)
- Auto-sending responses (always rep-approved)
- Multi-language (English only)
- Voice / phone tickets
- Sentiment analysis

## Success Metrics
- Leading: ≥40% of AI drafts accepted with no edits within 6 weeks
- Lagging: Average response time drops from 15min to 7min within 8 weeks

## Constraints
- Build budget: $15k
- Run cost: ≤$300/month total
- Timeline: 8 weeks to production
- Maintainer: Acme has one part-time contractor, no in-house ML expertise
- Compliance: Acme has SOC 2 Type II in progress, must not regress
- Data residency: Customer data stays in US-East

## Integrations
- Zendesk (read tickets, inject draft into rep view)
- Salesforce (read account history)
- Stripe (read billing status, recent invoices)
- Mixpanel (read product usage events)
- LLM provider (TBD, deferred to /tech-stack-advisor)

## NFRs
- Latency: AI draft must appear within 3 seconds of ticket arrival
- Availability: 99.9% during business hours (Mon-Fri 6am-9pm PT)
- Throughput: Peak 50 tickets/hour across all reps
- Data: Customer data must never leave US-East. No PII in logs.
- Multi-tenant: All Acme reps share the same instance, but different reps see different ticket subsets per Zendesk permissions
```

## Simulated user responses

- "Yes, run the full feasibility pass on those requirements."
- "I want to see all the tensions. Don't hold back."

## Expected behaviors

- Skill produces a feasibility report with verdict ⚠️ Resolve open questions
- Skill identifies AT LEAST 3 genuine tensions, including:
  - Latency (3s) vs cost ($300/mo) — sub-3s synchronous LLM + 3 lookups is hard at low cost
  - SOC 2 compliance + LLM provider choice — vendor selection affects audit posture
  - Run cost ceiling vs throughput — 50 tickets/hr × multiple LLM calls each pushes against the budget
  - Maintainer capacity (one part-time contractor) vs system complexity (4 integrations + LLM + observability)
- For each tension, skill proposes 2-3 specific resolutions with trade-offs
- Skill identifies cost drivers per requirement (especially the 3s latency requirement)
- Skill surfaces capability gaps if any (e.g., 3 sync API calls + LLM in <3s is non-trivial)
- Skill stays in implication-space — does NOT pick specific vendors, services, or runtimes
- Skill produces clear "decisions owed by client" — at minimum 3 questions Maria/Acme must answer before /to-prd
- Recommendation does NOT proceed to /to-prd until tensions are resolved

## Anti-patterns to flag

- Picks specific services or vendors (e.g., "use AWS Lambda + Anthropic Claude")
- Recommends changes to requirements (says "you should drop the 3s requirement")
- Vague tensions without quantification ("this might be expensive")
- Lists every requirement as a tension — fake-thoroughness
- Misses the maintainer-capacity vs complexity tension (it's the most-skipped real-world tension)
- Misses the latency-vs-cost tension (it's the most obvious one)
- Recommends ✅ Proceed despite the obvious tensions
- Produces analysis with no quantification or specific resolutions
- Skips the "decisions owed by client" section