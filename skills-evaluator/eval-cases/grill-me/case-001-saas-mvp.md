---
description: Happy-path B2B SaaS for invoice automation
tags: [happy-path]
---

## Scenario

A user wants to build a B2B SaaS for freelance graphic designers to send invoices and get paid faster. They are technical enough to know they want an MVP but have not thought through the requirements rigorously. They tend to give vague answers when pushed on metrics.

The user's first message: "I want to build an app that helps freelance designers send invoices and get paid faster."

## Simulated user responses

- "Freelance graphic designers, mostly solo, with 1 to 10 active clients at any time. Maybe 50,000 of them globally on Instagram and Behance."
- "They use a mix of PDFs, Google Docs invoices, and tools like FreshBooks. The pain is they're getting paid 60+ days late and chasing payments manually eats hours per week."
- "Engagement, mostly. Like, are they actively using it."
- "OK fine — I want 30% of users to send a second invoice within 14 days of their first. And average payment time should drop from 60 days to under 30 days."
- "MVP would be: connect bank account or Stripe, create an invoice, send it via email, get notified when paid. That's it."
- "Out of scope for v1: time tracking, expense management, multi-currency, project management, team accounts."
- "Stripe for sure. Probably Plaid for bank verification. Email via something simple like Resend. Auth via Google OAuth — designers all have Google accounts."
- "Budget is $10k for build, ideally under $100/month to run. Solo founder, no team."
- "Hard deadline is end of Q3 because I'm presenting at a designer conference."
- "I think we're good. I'm aligned."

## Expected behaviors

- Skill asks at least 8 questions before declaring confidence
- Skill pushes back specifically on "engagement" as a success metric (the [VAGUE] response above)
- Skill surfaces the JTBD (get paid faster) explicitly
- Skill identifies Stripe and Plaid as tier-1 dependencies
- Skill confirms scope cuts (out-of-scope list)
- Skill asks about budget, deadline, and team capacity
- Skill produces a final summary covering: problem, primary user, in-scope, out-of-scope, success metric, dependencies
- Skill ends by directing user to /to-prd

## Anti-patterns to flag

- Bundling multiple questions in one turn
- Accepting "engagement" as a success metric without pushback
- Proposing a stack before requirements are clear
- Skipping the budget/timeline conversation
- Declaring 95% confidence with the [VAGUE] response unaddressed
- Asking >15 questions (over-grilling for an aligned user)
