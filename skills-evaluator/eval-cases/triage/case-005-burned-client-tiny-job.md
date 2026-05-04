---
description: Edge case - tiny simple job, but client was burned previously. Q5 alone should escalate to ⚠️.
tags: [edge-case, full, trust-history]
expected_verdict: "⚠️"
---

## Scenario

A small-budget, low-complexity engagement where Q1, Q2, Q3, and Q4 all favor lite — but the client was burned by a previous vendor and is explicitly asking for documentation and process to feel comfortable. Q5 alone should escalate the verdict to ⚠️ Full Suite. This tests that the skill respects trust-history as a real complexity signal, even on technically simple work.

The artifact set in this case is not for engineering rigor — it's for trust signaling. The PRD, ADRs, and adversarial review function as proof to the client that this engagement will be different from the last one.

The user's first message: "Run /triage on this. New prospect (referral from an existing client). Single owner of a small bakery wants a basic five-page marketing site. No e-commerce, no logins, just static content + a contact form to her Gmail. Budget around $4k, three-week timeline. BUT — she explicitly told me on the intro call: 'The last person who built me a website ghosted me halfway through and I had to hire someone else to finish it. I want to know what I'm getting and when I'm getting it before you start.'"

## Simulated user responses

- "Just her, the owner. One sign-off."
- "Yes — 'a five-page marketing site with my brand, with a contact form that emails me.' Clean."
- "No payments, no PII beyond the contact form (name + email). No logins. No compliance concerns."
- "Self-contained. New domain, new hosting, no existing systems to integrate with."
- "Yes. She was very clear that she needs to see a plan, scope, and timeline up front. She used the word 'milestones' three times. She wants a paper trail this time."
- "Hmm, this is a $4k five-page brochure site. The full suite seems like overkill. Can we just do lite?"

## Expected behaviors

- Skill produces a triage record with verdict ⚠️ Full Suite
- Skill correctly classifies Q1, Q2, Q3, Q4 as favors-lite and Q5 as favors-full
- Skill applies the rule mechanically: one full signal → ⚠️, even when four favor lite
- Skill does NOT downgrade verdict when user pushes back about overkill
- Skill explains the trust-history reasoning when challenged: the artifact set is the trust contract, not engineering rigor
- Verdict reasoning specifically calls out Q5 as the escalator and notes that the artifact set serves the trust function
- Skill writes `docs/triage/<slug>.md` with all required fields
- Final hand-off routes to `/client-intake`

## Anti-patterns to flag

- `overrides-own-verdict` — caves to user push-back about "overkill"
- Downgrades trust-history to a lite signal because the work is technically simple
- Verdict reasoning treats Q5 as merely "nice to have" rather than mechanically escalating
- Skill argues with the user about whether trust history "really" matters
- Skill recommends "lite path with extra documentation" as a hybrid (the lite path is single-page; that's not the artifact density a burned client needs)
- Skill drifts into proposing what the trust-building artifacts should look like (that's a deliverable in the full suite, not a triage output)
