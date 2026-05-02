---
name: decision-log
description: Record an architectural or product decision as an immutable ADR (Architecture Decision Record). Use whenever a non-obvious choice is made — stack selection, integration approach, scope cut, vendor pick. Each ADR captures context, options considered, decision, and consequences. ADRs are immutable once accepted; new decisions supersede old ones rather than overwriting them. Plan Mode.
---

# Decision Log

Record decisions as ADRs. The point isn't bureaucracy — it's that 6 months from now, when someone (you, the next dev, the client) asks *"why did we use Postgres instead of Mongo?"*, the answer is one file away.

For a small-business consultancy, the decision log is also a deliverable: handing the client a `docs/decisions/` directory at engagement-end is a defensible artifact that justifies fees and prevents finger-pointing.

## When to Run

- After `/tech-stack-advisor` proposes a stack (one ADR per major component)
- When the user makes a scope cut or a "do this not that" call
- When you pick one vendor over another
- When you defer a decision intentionally — record what triggers revisiting
- When you discover a constraint that overrides a previous decision

## When NOT to Run

- For trivial decisions (variable names, formatting, file structure)
- For decisions that follow obviously from constraints (e.g., "we must use the client's existing AWS account")

## Output Location

`docs/decisions/NNNN-<kebab-title>.md`

NNNN is a 4-digit incrementing number. Check existing ADRs first:

```bash
ls docs/decisions/ | grep -E '^[0-9]{4}-' | sort | tail -1
```

## Template

```markdown
# NNNN. <Decision Title>

- **Status:** Proposed | Accepted | Superseded by [NNNN](./NNNN-…)
- **Date:** YYYY-MM-DD
- **Deciders:** <names>
- **Context source:** <link to PRD issue, conversation, ticket>

## Context

<2–4 paragraphs.>
- What's the situation that forced a decision?
- What constraints apply?
- What's the cost of not deciding?
- What are we explicitly NOT trying to optimize for here?

## Options Considered

### Option A: <name>
- **Pros:** …
- **Cons:** …
- **Cost:** $… (build), $…/mo (run)
- **Time-to-ship impact:** …

### Option B: <name>
- **Pros:** …
- **Cons:** …
- **Cost:** …
- **Time-to-ship impact:** …

### Option C: <name>
- **Pros:** …
- **Cons:** …
- **Cost:** …
- **Time-to-ship impact:** …

## Decision

We chose **Option <X>** because <single decisive reason>.

## Consequences

**Positive:**
- …

**Negative / accepted trade-offs:**
- …

**What we'll watch for to know we got it wrong:**
- <Specific signal that should trigger revisiting.>

## Revisit Triggers

We will reconsider this decision if:

- <Specific condition>, e.g., "monthly active users exceed 10k"
- <Specific condition>, e.g., "vendor announces deprecation of the API"
- <Specific condition>, e.g., "client adds HIPAA requirement"

## Related

- Supersedes: <NNNN, if any>
- Related to: <NNNN>
- PRD: <link>
```

## Rules

- **ADRs are immutable.** To change a decision, write a new ADR that **supersedes** the old one. Update the old ADR's status field to `Superseded by NNNN`, but never rewrite its body.
- **One decision per ADR.** If you find yourself writing two, split them.
- **Keep them short.** 1 page is the target. If it's longer than the relevant PRD section, you're over-explaining.
- **Link from the PRD.** Every PRD's section 15 (Appendix) lists relevant ADRs.

## Process

1. Confirm the decision with the user before filing. Read back: *"You're choosing X over Y because Z. Recording that?"*
2. Find the next ADR number.
3. Draft the ADR using the template.
4. Show the user. Ask for edits.
5. Save to `docs/decisions/NNNN-<title>.md`.
6. Update the PRD's appendix to link to the new ADR.

## Example: First ADR a project should have

```markdown
# 0001. Use Postgres on Supabase as primary datastore

- **Status:** Accepted
- **Date:** 2026-05-01
- **Deciders:** @owner
- **Context source:** PRD #42, /tech-stack-advisor session

## Context

We need a primary datastore for a small-business SaaS expected to serve <500 paying tenants in year one. The client has no DBA. Run-cost ceiling is $150/mo total infra. We will need row-level security for multi-tenancy.

## Options Considered

### Option A: Postgres on Supabase
- **Pros:** Hosted, RLS built-in, generous free tier, includes auth and storage, good migration story.
- **Cons:** Vendor lock-in (RLS policies, RPC functions are Supabase-flavored). Cold-start on free tier.
- **Cost:** $0–$25/mo at v1.

### Option B: Postgres on Render
- **Pros:** No vendor flavor — pure Postgres. Easy to move.
- **Cons:** Need to handle auth ourselves; no built-in storage.
- **Cost:** $7/mo + auth provider (~$25/mo Clerk) = ~$32/mo.

### Option C: PlanetScale (MySQL)
- **Pros:** Branching schemas are great for solo dev.
- **Cons:** No foreign keys at lower tiers; team lacks MySQL ops experience; client integrations expect Postgres.
- **Cost:** $39/mo+

## Decision

We chose **Option A** because the bundled auth + storage + RLS reduce v1 build time by an estimated 1–2 weeks, and the run cost is near-zero.

## Consequences

**Positive:**
- Faster v1 build.
- One vendor to manage.

**Negative / accepted trade-offs:**
- If we need to leave Supabase, we will rewrite RLS policies and migrate auth.
- Cold starts on free tier — must upgrade to Pro before public launch.

**What we'll watch for to know we got it wrong:**
- Supabase pricing changes by >2x.
- We exceed 50k MAU and need horizontal sharding.

## Revisit Triggers

- Crossing 100 paying tenants.
- Any P1 incident traced to Supabase availability.

## Related

- PRD: #42
```

## Anti-Patterns

- ADRs longer than the PRD itself ❌
- Editing accepted ADRs to "improve" them ❌
- Skipping options-considered ("we just picked X") ❌
- Recording trivial decisions (variable names, formatting) ❌
- Vague revisit triggers ("if it doesn't scale") — be specific ❌
