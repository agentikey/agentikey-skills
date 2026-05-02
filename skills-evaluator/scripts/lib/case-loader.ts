/**
 * Loads an eval case from a markdown file.
 *
 * Eval cases are markdown files with frontmatter and labeled sections.
 * See eval-cases/_template.md for the expected format.
 */

import { readFileSync } from "node:fs";
import { basename } from "node:path";
import matter from "gray-matter";
import type { EvalCase } from "./types.ts";

export function loadCase(filePath: string): EvalCase {
  const raw = readFileSync(filePath, "utf-8");
  const parsed = matter(raw);
  const body = parsed.content;
  const meta = parsed.data;

  const sections = parseSections(body);

  const required = [
    "Scenario",
    "Simulated user responses",
    "Expected behaviors",
    "Anti-patterns to flag",
  ];
  for (const section of required) {
    if (!sections[section]) {
      throw new Error(`${filePath}: missing section '## ${section}'`);
    }
  }

  return {
    caseId: basename(filePath, ".md"),
    scenario: sections["Scenario"].trim(),
    simulatedResponses: parseList(sections["Simulated user responses"]),
    expectedBehaviors: parseList(sections["Expected behaviors"]),
    antiPatterns: parseList(sections["Anti-patterns to flag"]),
    metadata: meta,
  };
}

/**
 * Splits markdown body into a map of H2 section name → content.
 *
 * Ignores H2 lines that appear inside fenced code blocks (``` or ~~~).
 * This is critical because eval cases often embed full markdown documents
 * (PRDs, discovery docs, etc.) inside their scenario, and those embedded
 * docs may legitimately use ## headings that should NOT be treated as
 * case-file section breaks.
 */
function parseSections(body: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const lines = body.split("\n");
  let current: string | null = null;
  let buffer: string[] = [];
  let inFence = false;
  let fenceMarker: string | null = null;

  for (const line of lines) {
    // Track fence open/close. Accept ``` or ~~~ with optional language tag.
    const fenceMatch = line.match(/^(```+|~~~+)/);
    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (!inFence) {
        inFence = true;
        fenceMarker = marker;
      } else if (fenceMarker && line.startsWith(fenceMarker)) {
        inFence = false;
        fenceMarker = null;
      }
      // Fence lines are content, not section breaks
      if (current) buffer.push(line);
      continue;
    }

    // Only treat ## as a section break if we're NOT inside a fenced block
    if (!inFence) {
      const h2Match = line.match(/^##\s+(.+?)\s*$/);
      if (h2Match) {
        if (current) {
          sections[current] = buffer.join("\n");
        }
        current = h2Match[1];
        buffer = [];
        continue;
      }
    }

    if (current) {
      buffer.push(line);
    }
  }
  if (current) {
    sections[current] = buffer.join("\n");
  }
  return sections;
}

/**
 * Parses a markdown bulleted/numbered list into an array of strings.
 * Handles both - and 1. styles. Strips numeric prefixes.
 * Preserves quoted strings as-is.
 */
function parseList(content: string): string[] {
  const lines = content.split("\n");
  const items: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Match bulleted: - text, * text, + text
    // Match numbered: 1. text, 2) text
    const bulletMatch = trimmed.match(/^[-*+]\s+(.+)$/);
    const numberedMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);

    if (bulletMatch) {
      items.push(stripQuotes(bulletMatch[1]));
    } else if (numberedMatch) {
      items.push(stripQuotes(numberedMatch[1]));
    }
  }

  return items;
}

function stripQuotes(s: string): string {
  const trimmed = s.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}