/**
 * Invokes Claude Code in headless mode to run a skill.
 *
 * Uses spawn with stdio: ['ignore', ...] to close stdin and avoid the
 * "no stdin data received in 3s" warning from newer claude versions.
 *
 * Note: We do not force a specific output format (transcript vs. artifact).
 * `claude -p` is non-deterministic about that, and forcing a format makes
 * the harness fragile. Instead, we capture whatever Claude produces and
 * let the judge evaluate it against the rubric.
 */

import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

interface RunSkillArgs {
  skillName: string;
  scenario: string;
  simulatedResponses: string[];
  outputPath: string;
}

function buildPrompt(args: RunSkillArgs): string {
  const { skillName, scenario, simulatedResponses } = args;

  return `Execute the /${skillName} skill against the scenario below. Use the
simulated user responses (in order) for any back-and-forth the skill requires.

Produce the output the skill is designed to produce — whether that's a
conversational transcript, a final artifact (PRD, brief, ADR, etc.), or both.
Do NOT skip or short-circuit the skill's normal behavior. Do NOT ask the human
for clarification — use the simulated responses below as if they came from a
real user.

If the skill normally writes a file, output the file's full contents inline in
markdown rather than attempting to write it (file write may not be available).

Scenario:
${scenario}

Simulated user responses (in the order the skill will receive them):
${simulatedResponses.map((r, i) => `${i + 1}. "${r}"`).join("\n")}`;
}

export async function runSkill(args: RunSkillArgs): Promise<string> {
  const prompt = buildPrompt(args);

  return new Promise<string>((resolve, reject) => {
    let stdout = "";
    let stderr = "";

    // 'ignore' for stdin closes it immediately so claude doesn't wait
    const proc = spawn("claude", ["-p", prompt, "--output-format", "text"], {
      stdio: ["ignore", "pipe", "pipe"],
    });

    proc.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    const timeout = setTimeout(() => {
      proc.kill("SIGTERM");
      reject(new Error("Skill execution timed out after 5 minutes"));
    }, 5 * 60 * 1000);

    proc.on("error", (err) => {
      clearTimeout(timeout);
      const msg = err.message ?? String(err);
      if (msg.includes("ENOENT")) {
        reject(
          new Error(
            "'claude' command not found. Install Claude Code CLI and ensure it's on PATH."
          )
        );
      } else {
        reject(new Error(`spawn claude failed: ${msg}`));
      }
    });

    proc.on("close", (code) => {
      clearTimeout(timeout);

      if (stderr && stderr.trim().length > 0) {
        console.warn(`[run-skill] stderr: ${stderr.slice(0, 500)}`);
      }

      if (code !== 0) {
        reject(
          new Error(
            `claude -p exited with code ${code}. stderr: ${stderr.slice(0, 500)}`
          )
        );
        return;
      }

      writeFileSync(args.outputPath, stdout);
      resolve(stdout);
    });
  });
}
