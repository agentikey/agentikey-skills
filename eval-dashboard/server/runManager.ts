/**
 * RunManager — spawns `npm run eval` subprocesses and exposes their progress
 * as parsed events.
 *
 * Concurrency: configurable via `setMaxConcurrent`. Default 1 (serial).
 * The harness has its own internal concurrency for cases within a run; this
 * is the orchestrator-level limit (how many top-level runs at once).
 *
 * Events per run (sent over SSE):
 *   - started      { tempId, finalRunId, command }
 *   - case-started { skill, caseId }
 *   - case-completed { skill, caseId, status, score? }   status: passed|failed|errored
 *   - stdout       { line }   (every other line — useful for visibility)
 *   - completed    { totalCases, passed, failed, errored, exitCode }
 *   - cancelled    {}
 *   - failed       { exitCode, message }
 */

import { spawn, ChildProcess } from "node:child_process";
import { EventEmitter } from "node:events";
import { randomUUID } from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const HARNESS_DIR =
  process.env.HARNESS_DIR ??
  resolve(__dirname, "../../skills-evaluator");

// Strip ANSI escape codes (chalk colors) from harness stdout
const ANSI_RE = /\x1b\[[0-9;]*m/g;

export interface ProgressEvent {
  type:
    | "started"
    | "case-started"
    | "case-completed"
    | "stdout"
    | "completed"
    | "failed"
    | "cancelled";
  data: Record<string, any>;
  ts: string;
}

export interface ActiveRun {
  tempId: string;
  finalRunId: string | null;
  command: string;
  args: string[];
  startedAt: string;
  status: "starting" | "running" | "completed" | "failed" | "cancelled";
  events: ProgressEvent[];
  child: ChildProcess | null;
  exitCode: number | null;
  cancelRequested: boolean;
  // Aggregate counters
  totals: {
    started: number;
    passed: number;
    failed: number;
    errored: number;
  };
}

interface StartRunOptions {
  skill?: string;
  case?: string;
}

class RunManagerImpl extends EventEmitter {
  private active = new Map<string, ActiveRun>();
  private maxConcurrent = 1;

  setMaxConcurrent(n: number) {
    if (!Number.isFinite(n) || n < 1) {
      throw new Error(`maxConcurrent must be >= 1`);
    }
    this.maxConcurrent = Math.floor(n);
  }
  getMaxConcurrent() {
    return this.maxConcurrent;
  }

  countActive(): number {
    let n = 0;
    for (const r of this.active.values()) {
      if (r.status === "starting" || r.status === "running") n++;
    }
    return n;
  }

  list(): ActiveRun[] {
    return [...this.active.values()];
  }

  get(tempId: string): ActiveRun | undefined {
    return this.active.get(tempId);
  }

  startRun(opts: StartRunOptions): ActiveRun {
    const activeCount = this.countActive();
    if (activeCount >= this.maxConcurrent) {
      const err = new Error(
        `Max concurrent runs reached (${activeCount}/${this.maxConcurrent}). ` +
          `Cancel an active run or raise the limit.`
      );
      (err as any).code = "MAX_CONCURRENT";
      throw err;
    }

    const tempId = randomUUID();
    const args = ["run", "eval", "--"];
    if (opts.skill) {
      args.push("--skill", opts.skill);
    }
    if (opts.case) {
      args.push("--case", opts.case);
    }

    const command = `npm ${args.join(" ")}`;
    const startedAt = new Date().toISOString();

    const run: ActiveRun = {
      tempId,
      finalRunId: null,
      command,
      args,
      startedAt,
      status: "starting",
      events: [],
      child: null,
      exitCode: null,
      cancelRequested: false,
      totals: { started: 0, passed: 0, failed: 0, errored: 0 },
    };

    this.active.set(tempId, run);

    // Spawn the harness
    const child = spawn("npm", args, {
      cwd: HARNESS_DIR,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });
    run.child = child;
    run.status = "running";

    this.emitEvent(run, {
      type: "started",
      data: { tempId, command, skill: opts.skill, case: opts.case },
      ts: new Date().toISOString(),
    });

    let stdoutBuf = "";
    child.stdout?.on("data", (chunk: Buffer) => {
      stdoutBuf += chunk.toString();
      const lines = stdoutBuf.split("\n");
      stdoutBuf = lines.pop() ?? ""; // keep partial line
      for (const raw of lines) {
        this.handleLine(run, raw);
      }
    });

    let stderrBuf = "";
    child.stderr?.on("data", (chunk: Buffer) => {
      stderrBuf += chunk.toString();
    });

    child.on("error", (err) => {
      run.status = "failed";
      this.emitEvent(run, {
        type: "failed",
        data: { exitCode: -1, message: err.message },
        ts: new Date().toISOString(),
      });
    });

    child.on("close", (code) => {
      // Flush any remaining partial line
      if (stdoutBuf.trim().length > 0) this.handleLine(run, stdoutBuf);
      stdoutBuf = "";

      run.exitCode = code;
      if (run.status === "cancelled") {
        // Already emitted cancellation event
        return;
      }
      if (code === 0) {
        run.status = "completed";
        this.emitEvent(run, {
          type: "completed",
          data: {
            exitCode: code,
            ...run.totals,
            totalCases:
              run.totals.passed + run.totals.failed + run.totals.errored,
          },
          ts: new Date().toISOString(),
        });
      } else {
        run.status = "failed";
        this.emitEvent(run, {
          type: "failed",
          data: { exitCode: code, message: stderrBuf.slice(0, 2000) },
          ts: new Date().toISOString(),
        });
      }
    });

    return run;
  }

  cancel(tempId: string): boolean {
    const run = this.active.get(tempId);
    if (!run) return false;
    if (run.status !== "running" && run.status !== "starting") return false;

    run.cancelRequested = true;
    run.status = "cancelled";
    if (run.child && run.child.pid) {
      try {
        run.child.kill("SIGTERM");
        // Hard-kill after grace period if still alive
        setTimeout(() => {
          if (run.child && !run.child.killed) {
            try {
              run.child.kill("SIGKILL");
            } catch {}
          }
        }, 3000);
      } catch (err) {
        // best effort
      }
    }
    this.emitEvent(run, {
      type: "cancelled",
      data: {},
      ts: new Date().toISOString(),
    });
    return true;
  }

  /** Forget a run from the active map. Used after the user dismisses it. */
  prune(tempId: string): boolean {
    const run = this.active.get(tempId);
    if (!run) return false;
    if (run.status === "running" || run.status === "starting") return false;
    this.active.delete(tempId);
    return true;
  }

  private emitEvent(run: ActiveRun, ev: ProgressEvent) {
    run.events.push(ev);
    this.emit("event", { tempId: run.tempId, event: ev });
    this.emit(`event:${run.tempId}`, ev);
  }

  private handleLine(run: ActiveRun, rawLine: string) {
    const line = rawLine.replace(ANSI_RE, "").trimEnd();
    if (line.length === 0) return;

    // Always emit raw stdout for visibility
    this.emitEvent(run, {
      type: "stdout",
      data: { line },
      ts: new Date().toISOString(),
    });

    // Run: <timestamp>  → finalRunId
    let m = line.match(/^Run:\s*(\S+)/);
    if (m) {
      run.finalRunId = m[1];
      // Also broadcast as a "started" supplement so clients know the runId
      this.emitEvent(run, {
        type: "started",
        data: { tempId: run.tempId, finalRunId: m[1], command: run.command },
        ts: new Date().toISOString(),
      });
      return;
    }

    // ▶ start  <skill>/<case>
    m = line.match(/^▶\s+start\s+(\S+)\/(\S+)/);
    if (m) {
      run.totals.started++;
      this.emitEvent(run, {
        type: "case-started",
        data: { skill: m[1], caseId: m[2] },
        ts: new Date().toISOString(),
      });
      return;
    }

    // ✓ <skill>/<case>  passed (<score>/5)
    m = line.match(/^✓\s+(\S+)\/(\S+)\s+passed\s+\(([\d.]+)\/5\)/);
    if (m) {
      run.totals.passed++;
      this.emitEvent(run, {
        type: "case-completed",
        data: {
          skill: m[1],
          caseId: m[2],
          status: "passed",
          score: parseFloat(m[3]),
        },
        ts: new Date().toISOString(),
      });
      return;
    }

    // ✗ <skill>/<case>  failed (<score>/5)
    m = line.match(/^✗\s+(\S+)\/(\S+)\s+failed\s+\(([\d.]+)\/5\)/);
    if (m) {
      run.totals.failed++;
      this.emitEvent(run, {
        type: "case-completed",
        data: {
          skill: m[1],
          caseId: m[2],
          status: "failed",
          score: parseFloat(m[3]),
        },
        ts: new Date().toISOString(),
      });
      return;
    }

    // ✗ <skill>/<case>  <some error message>
    m = line.match(/^✗\s+(\S+)\/(\S+)\s+(.*)$/);
    if (m) {
      run.totals.errored++;
      this.emitEvent(run, {
        type: "case-completed",
        data: {
          skill: m[1],
          caseId: m[2],
          status: "errored",
          message: m[3],
        },
        ts: new Date().toISOString(),
      });
      return;
    }
  }
}

// Singleton
export const runManager = new RunManagerImpl();
