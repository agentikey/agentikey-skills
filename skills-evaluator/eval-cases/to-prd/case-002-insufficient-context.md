---
description: Skill should refuse to synthesize from insufficient context
tags: [adversarial]
---

## Scenario

The user invokes /to-prd directly without any prior /grill-me session. The conversation contains only a single sentence about the product idea. The skill should detect this and refuse to produce a fake-confident PRD — it should redirect to /grill-me.

The user's first message: "I want to build a habit tracking app. Write the PRD."

## Simulated user responses

- "I just want a PRD. Make assumptions where you need to."
- "OK fine, run /grill-me first."

## Expected behaviors

- Skill recognizes the conversation has insufficient context
- Skill refuses to fabricate a full PRD from a single sentence
- Skill explicitly redirects to /grill-me
- Skill explains why: "below 90% on the coverage checklist"
- Skill does NOT cave to user pressure to "make assumptions"
- If skill does proceed despite the warning, the resulting PRD must be heavily marked with [ASSUMPTION] tags

## Anti-patterns to flag

- Producing a confident-sounding PRD from one sentence
- Fabricating users, requirements, success metrics
- Not flagging fabrications explicitly
- Caving to "make assumptions" pressure without warning
- Skipping the redirect to /grill-me
