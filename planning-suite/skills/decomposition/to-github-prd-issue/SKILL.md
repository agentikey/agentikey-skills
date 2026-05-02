---
name: to-github-prd-issue
description: Create a parent GitHub issue from a finished PRD using the `gh` CLI. The parent issue acts as the epic — it contains the PRD body and a placeholder checklist that gets populated when /to-issues runs. Use after /to-prd is complete and the user is ready to file work. Requires `gh` CLI installed and authenticated.
---

# To GitHub PRD Issue

Convert a completed PRD into a parent (epic) GitHub issue. This issue is the canonical reference — every child implementation issue links back to it.

## Preconditions

Before doing anything, verify all of these:

- `docs/prd/<slug>.md` exists and is complete
- `gh` CLI is installed: `gh --version`
- User is authenticated: `gh auth status`
- Repo is confirmed (default: current directory's git remote)

If any precondition fails, stop and tell the user how to fix it.

## Process

### 1. Confirm target repo

```bash
gh repo view --json nameWithOwner -q .nameWithOwner
```

Show the user the result. Ask: *"File the PRD issue here?"* If they want a different repo, ask which.

### 2. Confirm labels

Default labels to apply: `prd`, `epic`, `planning`.

Check that they exist:
```bash
gh label list --json name -q '.[].name'
```

If any are missing, **don't auto-create them.** Ask: *"Label `prd` doesn't exist. Create it (color: blue, description: 'Product requirement document')?"*

### 3. Draft the issue body

Format:

```markdown
# PRD: <Product Name>

> _This issue is the canonical PRD. It is the parent of all implementation issues for this product._
>
> Source of truth: [`docs/prd/<slug>.md`](../blob/main/docs/prd/<slug>.md)

<Body of PRD here, sections 1-15>

---

## Implementation Checklist

_Populated by `/to-issues`. Each item links to a child issue._

- [ ] Awaiting decomposition

---

## Status

- **Phase:** Planning
- **Owner:** @<username>
- **Last updated:** <YYYY-MM-DD>

## Adversarial Review

<If `/prd-adversarial-review` ran, link or paste the synthesis section here.>
```

### 4. Show the user the draft body

Output the rendered markdown. Ask: *"File this as an issue, or edit first?"*

### 5. Create the issue

```bash
gh issue create \
  --title "PRD: <Product Name>" \
  --body-file <temp-file> \
  --label prd,epic,planning \
  --assignee @me
```

Capture the returned URL.

### 6. Update the PRD frontmatter

Write back into `docs/prd/<slug>.md`:

```yaml
---
prd_issue: https://github.com/owner/repo/issues/123
prd_issue_number: 123
status: filed
last_updated: <today>
---
```

### 7. Report back

Show the user:
- Issue URL (clickable)
- Issue number for reference
- Suggested next step: *"Run `/to-issues` to break this into child work items."*

## Optional: Create a GitHub Project

If the engagement is substantial enough to warrant a project board, after the issue is filed, ask:

*"Add this to a GitHub Project? I can create one named `<Product Name>` and add the parent issue as the first item."*

If yes:
```bash
gh project create --owner @me --title "<Product Name>"
gh project item-add <project-number> --owner @me --url <issue-url>
```

## Anti-Patterns

- Filing the issue without showing the user the body first ❌
- Auto-creating labels without confirmation ❌
- Writing code or scaffolds — this is Plan Mode ❌
- Including PRD sections that aren't actually filled in ❌
- Forgetting to write the issue number back to the PRD frontmatter ❌
