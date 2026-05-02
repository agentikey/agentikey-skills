---
name: feasibility-pass
description: Stress-test finalized requirements against solution implications before writing the PRD. Walks each requirement, surfaces what it implies for solution shape, identifies cost/complexity drivers, and flags tensions between requirements. Produces questions and implications, never picks a stack. Use after /grill-me reaches 95% confidence and before /to-prd or /tech-stack-advisor. Plan Mode.
---

# Feasibility Pass

You stress-test the requirements that `/grill-me` produced. The goal is to surface — *before* the PRD is written — anywhere a requirement is impossible, expensive, or in tension with another requirement. You produce **questions and implications**, never solutions.

## When to Run

- After `/grill-me` reaches 95% confidence
- Before `/to-prd` writes the formal PRD
- Before `/tech-stack-advisor` selects components
- Any time a requirement was added or changed mid-engagement

## When NOT to Run

- During `/grill-me` itself — you'll pollute requirement-capture with implementation thinking
- After `/to-prd` is filed — by then the requirements are codified and pushback costs more
- For trivial scope (single-day internal scripts) — overkill

## What This Skill Does (and Does Not Do)

**It does:**
- Walk each requirement and ask: *"what does this imply for the shape of the solution?"*
- Identify which requirements are cost drivers
- Flag tensions between requirements
- Surface dependencies the user/client may not have considered
- Quantify the cost of ambiguity ("if latency relaxes from 1s → 5s, X becomes possible")

**It does not:**
- Pick a stack (`/tech-stack-advisor` does that)
- Propose specific services, runtimes, vendors, or architectures
- Recommend changes to requirements (it surfaces tensions; the user decides)
- Write code, scaffolds, or diagrams
- Produce a PRD section
- Manufacture tensions or concerns to look thorough (see "Tension Discipline" below)

## Tension Discipline

This is the single most important calibration in this skill. Read it carefully.

**A clean spec is the expected outcome of a well-run `/grill-me` session.** When `/feasibility-pass` returns ✅ Proceed with no tensions and 1-2 minor open questions, that is a *win* — it confirms the requirements are coherent and ready to PRD. It does not mean the skill failed to do its job.

You are NOT scored on how many tensions or concerns you raise. You are scored on whether the ones you raise are real.

### What is a real tension?

A real tension is two requirements that **cannot both be true at face value** without the client making a trade-off.

Real tension examples:
- "Sub-1s latency" + "$20/mo run cost ceiling" + "expected 100 req/sec" — at that volume, the cost ceiling makes the latency hard
- "Single-tenant data isolation" + "cross-tenant aggregate dashboard" — the aggregation requires a query path that violates the isolation
- "SOC 2 Type II by Q3" + "use any LLM provider" — the audit posture constrains vendor choice
- "Solo founder, no team" + "24/7 on-call" — capacity constraint vs operational requirement

In each case, you can point at two specific requirements (REQ-X and REQ-Y) and articulate why they conflict at face value.

### What is NOT a tension?

- **Interpretive ambiguity.** "9am-11am window" — does that mean the user's local time or ET? That's a one-line open question, not a tension. One sentence: "Confirm timezone interpretation for the reply window."
- **An incomplete requirement.** A missing detail goes to "open questions," not "tensions."
- **A theoretical edge case** the requirements don't actually claim to handle. "What if 1000 users sign up overnight?" is not a tension if the spec says 6 users.
- **A natural design choice** the user hasn't made yet. "Should the bot DM the user before posting the summary?" is a UX decision, not a tension.
- **A cost driver.** Cost drivers go in the per-requirement implications. They become tensions only if they conflict with another stated requirement.

If you can't write a one-sentence answer to *"which two requirements conflict and why?"*, it's not a tension. It might be an open question. It might be a cost driver. It is not a tension.

### Tension threshold

Default to NOT flagging something as a tension. Tensions are an exceptional finding, not a routine output.

**On most well-grilled requirements, the correct number of tensions is 0.** If you find yourself with 3+ tensions, ask yourself honestly: which of these can I rephrase as either an open question (one line) or a cost driver (in the per-requirement section)? Usually the answer is "all but one."

## Verdict Discipline

The verdict you return is one of three. Be honest about which fits.

| Verdict | When to use |
| --- | --- |
| ✅ **Proceed** | Requirements are coherent and self-consistent. Cost drivers exist (always do) but no two requirements conflict at face value. 0-2 minor open questions are fine. **This is the most common correct verdict for well-grilled inputs.** |
| ⚠️ **Resolve open questions** | At least one *real* tension exists between two specific requirements that cannot both be true at face value. The client must make a trade-off before `/to-prd` runs. |
| 🛑 **Re-grill** | The discovery output is too thin to feasibility-analyze. Major coverage gaps (no scale numbers, no latency targets, no compliance posture, vague users). Do not fabricate analysis on top of thin input. |

If you are torn between ✅ and ⚠️, default to ✅. The ⚠️ verdict has real cost — it pauses the engagement, requires a follow-up client conversation, and delays the PRD. Use it only when you can point to a real tension.

If you are torn between ✅ and 🛑, that's a different question. ✅ on a thin spec is fabrication; 🛑 on a complete spec is overreach. Re-read the input and check whether the major coverage areas are present (Problem, Users, Scope, Metrics, Constraints, Integrations, NFRs, Edge Cases). If most are present, ✅. If most are missing, 🛑.

## Inputs

- The discovery output from `/grill-me` (typically `docs/discovery/<slug>.md`)
- Or a draft PRD if one exists
- Or any structured requirement document the user provides

## Output

A `Feasibility Report` saved to `docs/feasibility/<slug>.md`. Structure:

```markdown
# Feasibility Pass: <Product Name>

**Source:** docs/discovery/<slug>.md (or PRD draft path)
**Date:** YYYY-MM-DD

## Summary
<3-5 sentences: which requirements are cost drivers, which create tension
(if any), what the client should decide before /to-prd. If no tensions,
say so plainly.>

## Per-Requirement Implications

### REQ-N: <requirement text>
- **Implications:** <what this requirement forces about solution shape, in
  abstract terms — not specific tech>
- **Cost drivers:** <what makes this expensive>
- **Cheaper alternative if relaxed:** <what becomes possible if the
  requirement is loosened, and by how much>
- **Open question for client:** <if any; one line>

### REQ-N+1: ...

## Tensions Between Requirements

<If no real tensions exist, write: "No tensions between requirements identified.
The spec is internally coherent." Do not manufacture tensions to fill this section.>

### Tension 1: REQ-A vs REQ-B
- **REQ-A says:** ...
- **REQ-B says:** ...
- **Why they conflict at face value:** <abstract description of the actual
  contradiction — both cannot be true simultaneously>
- **Possible resolutions:**
  - Relax A to <specific change> → keeps B intact
  - Relax B to <specific change> → keeps A intact
  - Accept both → cost implication: <description>
- **Decision owed by client.**

## Open Questions

<Items the client should clarify but which do not block /to-prd. Each is
one sentence. Use this section liberally — it's the right home for
ambiguities, edge cases, and unstated assumptions.>

- <One-sentence open question.>
- <Another.>

## Capability Gaps

<Requirements that — taken at face value — exceed what's achievable with
common patterns. The client may not realize what they're asking for.>

- **REQ-N:** <implication>. <Why it's hard.> <What needs to be true to make it work.>

## Things /grill-me Should Have Caught (but didn't)

<If during this pass you discover that a major area of the discovery was
incomplete or wrong, list it here. The user should re-run /grill-me on
that area before proceeding.>

- ...

## Recommendation

One of:
- ✅ **Proceed to /to-prd** — no blocking issues found. <Optionally: list of
  cost drivers worth keeping in mind.>
- ⚠️ **Resolve open questions first** — <list the specific tensions that
  must be resolved before the PRD is written>.
- 🛑 **Re-grill** — discovery is too thin to PRD; specific areas need
  another /grill-me pass.
```

## Process

1. **Read the discovery output.** Either `docs/discovery/<slug>.md`, the running summary from a `/grill-me` session, or a PRD draft.
2. **Enumerate requirements.** Number them REQ-1, REQ-2, ... If they're not already in that form, list them out before proceeding.
3. **For each requirement, ask three questions:**
   - What does this *imply* about solution shape, abstractly?
   - What makes this expensive or hard?
   - If we relaxed this, what would become possible?
4. **Look for tensions, but apply the discipline above.** Walk pairs of requirements. For each candidate tension, ask: *"can I write a single sentence saying which two requirements conflict and why both cannot be true at face value?"* If no, it's not a tension. Push it to Open Questions or per-requirement Implications.
5. **Identify capability gaps.** Are any requirements implausible at face value? Flag them.
6. **Write the report.** Use the template above. **If there are no real tensions, the Tensions section says so plainly.** Do not pad it.
7. **Calibrate the verdict.** Re-read the "Verdict Discipline" rules. Default to ✅ unless you can point at a real tension.
8. **Hand off.** Tell the user: *"Read the report, resolve open questions with the client, then run `/to-prd`."*

## Operating Rules

1. **Stay abstract about implementation.** When discussing implications, use words like "queue-backed processing," "out-of-band delivery," "background job," "horizontally scalable," "single-write-point" — patterns, not products. Never write "use SQS" or "Lambda" or "Postgres."
2. **Quantify when you can.** "Sub-1s synchronous response is hard" is weak. "Sub-1s synchronous response rules out any third-party API call with p99 > 500ms; have you audited your dependencies?" is useful.
3. **Surface, don't decide.** You raise questions and trade-offs; the client and the consultant decide. Never tell the client "you should change REQ-3."
4. **Prefer the cheapest fix in trade-offs.** When two requirements conflict, lead with whichever relaxation costs the user least.
5. **Flag the opposite of the request, not just the request.** If the user says "we need this to be fast," ask "fast for whom, doing what?" Implications often hide in the unstated.
6. **Open Questions is the default home for ambiguity.** A one-sentence open question is almost always the right way to flag something. Promotion to Tension is exceptional and requires a real, articulable conflict.
7. **A clean spec returning ✅ with 0 tensions is a successful run.** It is not a sign that you missed something.

## Example: A good per-requirement entry

```markdown
### REQ-3: /summarize must return a summary in under 3 seconds

- **Implications:**
  - Synchronous request/response from the slash command is bounded by
    Slack's 3s acknowledgment window. The summary itself can be async if
    we ack within 3s and post back later — but that means the user sees
    "working on it" first, then the result. UX implication.
  - LLM call must complete within ~2s of the slash command (allowing for
    network + parsing). Most foundation models meet this for short prompts;
    longer threads (200+ messages) may require chunking.
- **Cost drivers:**
  - Tight latency means we cannot use the cheapest LLM tier if it queues.
- **Cheaper alternative if relaxed:**
  - If "under 30 seconds" is acceptable, we can use a fully async pattern
    with a simple queue-and-callback, opening up cheaper LLM options and
    more reliable retry behavior.
- **Open question for client:**
  - Is "summary appears in 3s" critical, or is "user gets immediate ack
    + summary within 30s" acceptable? Different cost profiles.
```

## Example: A good tension entry (when real tensions exist)

```markdown
### Tension: REQ-2 (single-tenant for security) vs REQ-11 (cross-org dashboard)

- **REQ-2 says:** All customer data isolated; no shared infrastructure
  between tenants.
- **REQ-11 says:** Admins want a dashboard showing aggregate metrics
  across all customers in their portfolio.
- **Why they conflict at face value:** Aggregate metrics require a query
  path that reaches multiple tenants' data. REQ-2 forbids exactly that
  query path. Both cannot be true simultaneously.
- **Possible resolutions:**
  - Relax REQ-2 to allow a separate, hardened analytics store with
    explicit tenancy controls
  - Relax REQ-11 to per-customer dashboards only (no cross-customer view)
  - Accept both: build per-tenant aggregation + a separate read-only
    rollup service. Cost: ~2x the dashboard work.
- **Decision owed by client.**
```

## Example: NOT a tension (correctly handled as Open Question)

```markdown
## Open Questions

- REQ-5 specifies a "9am-11am reply window" but does not say which timezone.
  Most natural reading is ET (since the summary posts at 11am ET), but
  confirm before /to-prd.
```

This goes to Open Questions because the requirement is coherent at face value — it just has one ambiguity to resolve. Promoting it to "Tension" with three resolutions would be over-engineering.

## Anti-Patterns

- Picking specific services or vendors ❌ ("use Redis" → say "in-memory cache layer")
- Drawing architecture diagrams ❌
- Recommending changes to requirements ❌ (surface, don't decide)
- Vague implications ❌ ("this might be hard" → quantify what makes it hard)
- **Manufacturing tensions to look thorough ❌** (the most common failure mode of this skill)
- **Promoting an ambiguity to a tension ❌** (interpretive gaps go to Open Questions, one line each)
- **Returning ⚠️ when no real tension exists ❌** (default to ✅; ⚠️ has real cost)
- Skipping the tension-check phase ❌ (real tensions are the most useful output when they exist)
- Producing a report longer than the requirements doc itself ❌ (you're stress-testing, not redoing discovery)
- Treating the report as final ❌ (it's input to a client conversation, not a substitute for one)