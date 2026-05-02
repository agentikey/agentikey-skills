#!/usr/bin/env bash
# Symlinks every skill in planning-suite/skills/<category>/<skill-name>/
# to ~/.claude/skills/<skill-name>/

set -euo pipefail

SOURCE_ROOT="/Users/osoto/AgentikeySkillEvaluator/planning-suite/skills"
TARGET_ROOT="$HOME/.claude/skills"

if [[ ! -d "$SOURCE_ROOT" ]]; then
  echo "❌ Source not found: $SOURCE_ROOT"
  exit 1
fi

mkdir -p "$TARGET_ROOT"

echo "Linking skills from:"
echo "  $SOURCE_ROOT"
echo "to:"
echo "  $TARGET_ROOT"
echo

# Find every directory that contains a SKILL.md, two levels deep
# (skips the category folders, finds the actual skill folders)
linked=0
skipped=0

while IFS= read -r skill_md; do
  skill_dir=$(dirname "$skill_md")
  skill_name=$(basename "$skill_dir")
  target="$TARGET_ROOT/$skill_name"

  # Skip the planning-suite root SKILL.md if any (there shouldn't be one, defensive)
  if [[ "$skill_dir" == "$SOURCE_ROOT" ]]; then
    continue
  fi

  if [[ -e "$target" || -L "$target" ]]; then
    # Already exists — check if it's already the right symlink
    if [[ -L "$target" ]]; then
      current=$(readlink "$target")
      if [[ "$current" == "$skill_dir" ]]; then
        echo "  ✓ $skill_name (already correct)"
        ((skipped++))
        continue
      fi
    fi
    # Different content — remove and replace
    rm -rf "$target"
  fi

  ln -s "$skill_dir" "$target"
  echo "  → $skill_name"
  ((linked++))
done < <(find "$SOURCE_ROOT" -name "SKILL.md" -type f)

echo
echo "Linked $linked skill(s), skipped $skipped already-correct."
echo

# Verify
echo "Verification — contents of $TARGET_ROOT:"
ls -la "$TARGET_ROOT" | grep -E "^l" || echo "  (no symlinks found)"