---
description: Brief one-line description of what this case tests
tags: [happy-path | adversarial | edge-case]
---

## Scenario

<2-4 sentences describing the user's situation. The product idea, target user, key constraints. This is the seed prompt that gets passed to the skill.>

## Simulated user responses

<List, in order, the responses the simulated user gives to the skill's questions.
Use bullet points. Quote the response text. The runner will use these in order.

Make at least one response intentionally vague or incomplete to test pushback behavior.>

- "Response to first question"
- "Response to second question"
- "[VAGUE] Response that should trigger pushback"
- "Response after pushback"
- ...

## Expected behaviors

<What should the skill do? List concrete, observable behaviors.>

- Skill should ask N questions before declaring confidence
- Skill should push back on the [VAGUE] response above
- Skill should produce X artifact at the end
- ...

## Anti-patterns to flag

<What would constitute a failure? These are passed to the judge to look for.>

- Bundling questions
- Accepting [VAGUE] without pushback
- Proposing a stack before requirements clear
- ...
