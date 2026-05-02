---
description: Adversarial user who resists specifics and wants to jump to coding, but eventually relents under pressure
tags: [adversarial]
---

## Scenario

A user comes in excited about an idea and wants to skip planning. They give hand-wave answers, push the skill to "just start," and resist questions about success metrics. The skill must hold the line: refuse to declare alignment until the user has actually been pinned down on essentials. The user eventually relents on user specificity when grilled hard enough.

The user's first message: "I want to build a Slack bot for my team that uses AI to summarize threads. Can we just start coding?"

## Simulated user responses

- "It's for my team — about 50 people. Engineering org. We have too many channels."
- "Make it like ChatGPT but for Slack threads. You know what I mean."
- "I don't know, just summarize stuff. People will figure out what they want."
- "Fine — summarize a thread when I /summarize it, and post the summary back in the thread."
- "Success looks like people using it."
- "OK fine — at least 10 unique users per week and at least 30 /summarize commands per day across the org."
- "Probably just OpenAI? Or Claude. Whichever."
- "Actually, my team standardized on Anthropic. So Claude."
- "We have a Slack admin who can install the app. Hosting — I have an AWS account. I can run a Lambda or something."
- "I want to ship in 2 weeks."
- "Fine. Last week Sarah on the platform team came back from a 3-day offsite, opened #platform-alerts which had 400+ messages, and gave up trying to catch up — she just DM'd her manager asking what she missed. Use that as the persona. Engineers who land on a thread they need to catch up on, weekly, currently scroll-and-give-up."
- "Yeah I think you have enough now."

## Expected behaviors

- Skill refuses to "just start coding" — redirects to alignment
- Skill pushes back on "make it like ChatGPT" — asks what specifically
- Skill pushes back on "people will figure it out" — pins down the actual command surface
- Skill pushes back on "people using it" as a success metric — asks for numbers
- Skill grills hard on user specificity until the user gives a concrete persona (the Sarah/PTO example)
- Skill captures the concrete persona in the final artifact (specific role, frequency, current alternative, pain incident)
- Skill notices that the user defers stack choice and gets a real answer
- Skill defers user-volunteered AWS Lambda choice to /tech-stack-advisor — does NOT incorporate it into reasoning
- Skill asks about who maintains it after the 2-week build
- Skill asks about data: what gets sent to the LLM, any sensitive data handling
- Skill confirms scope (single /summarize command) and out-of-scope (multi-thread, scheduled summaries, etc.)
- Skill stays in requirement-space — does not sketch architecture, services, or transport patterns
- Final summary covers JTBD, scope boundaries, success metrics, NFRs, deadline, AND a concrete persona

## Anti-patterns to flag

- Caving to user pressure to "just start"
- Accepting "make it like ChatGPT" as a definition
- Accepting "people using it" as a success metric
- Accepting demographic-level user definition ("engineers", "50-person org") without grilling for concrete persona
- Sketching architecture, queues, runtimes, or services (proposes-solutions-prematurely)
- Incorporating user-volunteered tech choices (AWS Lambda) into the design rather than deferring them
- Skipping the data/privacy conversation (LLM-specific concern)
- Declaring 95% confidence on weak answers
- Bundling questions to "speed things up"
- NOT recognizing/using the Sarah relenting response — if the user finally gives a concrete persona and the skill ignores it, that's a failure