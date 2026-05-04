---
description: Edge case - Q4 (existing-system integration) is the unique escalator, but the consultant frames the integration in lite-favoring terms. Tests question interpretation, not rule application.
tags: [edge-case, full, q4-interpretation]
expected_verdict: "⚠️"
---

## Scenario

A static marketing site rebuild for a small bakery, with one wrinkle: the new site pulls blog posts and store hours from the bakery's existing Sanity CMS so staff can keep managing content there. The consultant frames this in lite-favoring terms — *"it's just a read-only API call at build time, the site doesn't actually talk to Sanity in production"* — but the rule is clear: Sanity is a system the client depends on for daily operations, and that dependency is what Q4 measures. A change to the Sanity schema or API breaks the site. That makes it an integration with a depended-on system, regardless of the technical pattern (build-time vs runtime).

This case tests **interpretation**, not rule application. The skill must look past the consultant's lite-framing of Q4 and classify it correctly. Q1, Q2, Q3, Q5 all favor lite; Q4 alone escalates.

The user's first message: "Run /triage on this. Existing client (Riverside Bakery). They want their marketing site rebuilt — same content shape as today (info, hours, location, blog) but with a fresh design. The new wrinkle: they want blog posts and hours pulled from their existing Sanity CMS so the staff can manage content there instead of asking us for every text edit. Single owner, $4k budget, three-week timeline. No e-commerce, no logins, no contact form."

## Simulated user responses

- "Just the owner, Tomás. He makes all the decisions."
- "Yes — 'a redesigned five-page marketing site that pulls blog posts and store hours from their Sanity CMS at build time.'"
- "No payments, no PII, no logins. Genuinely zero customer data flowing through the site."
- "Sort of — there's an integration with their existing Sanity CMS to fetch blog posts and hours, but it's read-only at build time. The site doesn't really *talk* to Sanity in production, it just bakes the content in at deploy. So I wouldn't call it integration in the traditional sense. Sanity is just a CMS, not a depended-on system in the way ERP or billing would be."
- "No trust issues. Existing client, fourth project together, smooth working relationship."

## Expected behaviors

- Skill produces a triage record with verdict ⚠️ Full Suite
- Skill correctly classifies Q4 as **favors-full** despite the consultant's lite-favoring framing
- Skill correctly classifies Q1, Q2, Q3, Q5 as favors-lite
- Skill applies the rule mechanically: Q4 alone escalates → ⚠️
- Skill explicitly addresses the consultant's framing: read-only build-time integration is still integration; Sanity IS a depended-on system because the bakery's content management workflow lives there; a Sanity schema/API change breaks the site
- Verdict reasoning specifically names Sanity as the depended-on system and explains why build-time vs runtime doesn't change the dependency
- Skill does not let the framing ("not integration in the traditional sense") downgrade Q4 — the SKILL.md examples explicitly include CMS dependencies
- Skill writes `docs/triage/<slug>.md` with all required fields
- Final hand-off routes to `/client-intake`

## Anti-patterns to flag

- Accepts the consultant's lite-favoring framing of Q4 ("just a CMS, just build-time, not real integration")
- Classifies Q4 as favors-lite because the integration is read-only or build-time only
- Verdict is ✅ instead of ⚠️ (this is the auto-fail condition)
- Verdict reasoning is generic ("Q4 escalated") without naming Sanity specifically and without explaining why build-time integration counts
- Skill spends time arguing about technical patterns (build-time vs runtime) instead of focusing on the dependency question
- Skill is hesitant or hedged — Q4 is unambiguous when the question is read carefully, the skill should classify confidently
- Skill drifts into proposing how to manage the Sanity dependency (out of scope)
- Skill defers the call back to the consultant ("if you don't think it counts, it might not") — the SKILL.md is explicit that CMS counts
