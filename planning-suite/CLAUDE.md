# Planning Suite — Cross-Cutting Guidance

This file is loaded into context whenever any skill in this pack runs. It encodes rules that apply to **all** planning work, not just one skill.

## Plan Mode Discipline

These skills exist to do high-quality planning. Plan Mode means:

- **Allowed:** read code, read docs, read PRDs, write `.md` files, write Mermaid diagrams, file GitHub issues, run `gh` CLI for issue/label operations.
- **Not allowed:** write production code, run `npm install` / `pip install` / scaffolding tools, modify `package.json` / `Cargo.toml` / etc., create source files, execute build commands.

If a skill ever feels like it wants to write code, that's a signal a planning step is incomplete. Stop and surface what's missing.

## File Layout

A project that uses this pack should have:

```
docs/
  prd/                  → product requirements docs
    <slug>.md
    <slug>.review.md    → output of /prd-adversarial-review
    <slug>/
      diagrams/         → standalone .mmd files
  decisions/            → ADRs from /decision-log
    0001-<title>.md
    0002-<title>.md
  discovery/            → /grill-me transcripts (optional, useful for handoff)

clients/                → only for client engagements
  <client-slug>/
    brief.md            → from /client-intake
```

Skills create these directories as needed.

## Working with Existing Codebases

If the project already has a codebase:

1. **Read first.** Before grilling about a new feature, read enough of the codebase to understand the domain language. Look for:
   - `README.md`, `CLAUDE.md`, or `CONTEXT.md`
   - `docs/decisions/` for prior ADRs
   - `docs/prd/` for prior PRDs
2. **Don't re-litigate decided things.** If an ADR says "we use Postgres", don't grill the user about choosing a database.
3. **Speak the codebase's language.** If the codebase calls them "tenants", don't say "organizations" in the PRD.

## Working with the Client (vs. Internal Work)

Some skills (`client-intake`, parts of `tech-stack-advisor`) only fire for client engagements. The signal is the existence of `clients/<slug>/brief.md`.

For client work, additional discipline:

- **Run-cost estimates are mandatory.** Internal projects can defer this; client projects can't.
- **ADRs are deliverables.** Write them assuming the client's next dev will read them.
- **Record scope cuts as ADRs.** When the client asks for X and you talk them down to Y, that's an ADR. It protects everyone later.

## Confidence Calibration

Several skills require explicit confidence scoring. Use this scale:

| Score | Meaning |
| --- | --- |
| 95–100 | I could brief a developer right now and they'd build the right thing. |
| 80–94 | I have the shape, but at least one major area is fuzzy. |
| 60–79 | I have the topic, not the requirements. |
| <60 | I don't have enough to do useful synthesis. Keep grilling. |

Never claim 95+ unless you genuinely could pass the brief-a-stranger test.

## Tone

These skills are biased toward directness:

- Numbers, not adjectives.
- Plain language, not consulting-speak.
- Short sentences.
- Bullet points only when the information is genuinely list-shaped.
- No filler ("In order to", "It's important to note", "As mentioned earlier").

Adversarial review is meant to be adversarial. Don't soften critique to be polite — the PRD has no feelings.

## Handoff Between Skills

Skills should leave breadcrumbs for the next skill in the chain:

- `/client-intake` writes `clients/<slug>/brief.md` and tells the user *"Run /grill-me"*.
- `/grill-me` writes a discovery summary and tells the user *"Run /to-prd"*.
- `/to-prd` writes the PRD and tells the user *"Run /prd-adversarial-review"*.
- `/prd-adversarial-review` writes the review and tells the user *"Apply edits, then run /to-github-prd-issue"*.
- `/to-github-prd-issue` files the epic and tells the user *"Run /to-issues"*.
- `/to-issues` files children and tells the user *"Planning complete — switch out of Plan Mode and pick the top of the dep graph"*.

Don't skip the breadcrumbs. They're how the user knows where they are in the workflow.
