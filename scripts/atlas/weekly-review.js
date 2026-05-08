#!/usr/bin/env node
/**
 * Atlas Weekly Review — Orchestrator
 *
 * Called by .github/workflows/weekly-review.yml
 * Runs the full weekly review pipeline:
 *   1. Pulse   — collect metrics
 *   2. Decide  — pick this week's action
 *   3. Open PR — create GitHub issue with review
 *   4. Notify  — send digest to configured channels
 *
 * All steps are independent — a failure in one does not block the others.
 *
 * Usage: node scripts/atlas/weekly-review.js
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PULSE_PATH = '/tmp/atlas_pulse.json';
const DECISION_PATH = '/tmp/atlas_decision.json';
const SCRIPT_DIR = path.join(__dirname);

function run(label, cmd, args = [], input = null) {
  process.stderr.write(`\n[weekly-review] ── ${label} ──\n`);
  const opts = { stdio: ['pipe', 'pipe', 'inherit'] };
  const result = spawnSync(process.execPath, [path.join(SCRIPT_DIR, cmd), ...args], opts);

  if (result.error) {
    process.stderr.write(`[weekly-review] ${label} failed: ${result.error.message}\n`);
    return { success: false, output: null };
  }

  if (result.status !== 0) {
    process.stderr.write(`[weekly-review] ${label} exited with code ${result.status}\n`);
    // Not a fatal error for the pipeline — continue
  }

  const output = result.stdout?.toString() || '';
  if (output) process.stderr.write(`[weekly-review] ${label} output: ${output.substring(0, 200)}\n`);
  return { success: result.status === 0, output };
}

async function main() {
  process.stderr.write('[weekly-review] Atlas Growth Engine — weekly tick starting\n');

  // Step 1: Pulse
  const pulseResult = run('PULSE', 'pulse.js');
  if (pulseResult.output) {
    try {
      fs.writeFileSync(PULSE_PATH, pulseResult.output);
      process.stderr.write(`[weekly-review] Pulse saved to ${PULSE_PATH}\n`);
    } catch (e) {
      process.stderr.write(`[weekly-review] Could not save pulse: ${e.message}\n`);
    }
  }

  // Step 2: Decide (requires pulse)
  let decisionResult = { success: false, output: null };
  if (fs.existsSync(PULSE_PATH)) {
    const decideResult = run('DECIDE', 'decide.js', [], fs.readFileSync(PULSE_PATH));
    if (decideResult.output) {
      try {
        // decide.js reads from stdin — re-run with stdin piped
        const { spawnSync } = require('child_process');
        const result = spawnSync(process.execPath, [path.join(SCRIPT_DIR, 'decide.js')], {
          input: fs.readFileSync(PULSE_PATH),
          stdio: ['pipe', 'pipe', 'inherit'],
        });
        const output = result.stdout?.toString();
        if (output) {
          fs.writeFileSync(DECISION_PATH, output);
          process.stderr.write(`[weekly-review] Decision saved to ${DECISION_PATH}\n`);
          decisionResult = { success: true, output };
        }
      } catch (e) {
        process.stderr.write(`[weekly-review] Decision error: ${e.message}\n`);
      }
    }
  }

  // Step 3: Open PR / GitHub Issue
  const prArgs = [PULSE_PATH];
  if (fs.existsSync(DECISION_PATH)) prArgs.push(DECISION_PATH);
  run('OPEN_PR', 'open_pr.js', prArgs);

  // Step 4: Notify
  const notifyArgs = [PULSE_PATH];
  if (fs.existsSync(DECISION_PATH)) notifyArgs.push(DECISION_PATH);
  run('NOTIFY', 'notify.js', notifyArgs);

  process.stderr.write('\n[weekly-review] ── Pipeline complete ──\n');

  // Summary to stdout (captured in CI logs)
  if (fs.existsSync(PULSE_PATH)) {
    try {
      const pulse = JSON.parse(fs.readFileSync(PULSE_PATH));
      const s = pulse.metrics?.stripe;
      const anomalies = pulse.anomalies || [];
      process.stdout.write([
        `Week ${pulse.week_index} | `,
        s?.available ? `MRR: $${s.mrr}` : 'MRR: N/A',
        ` | Anomalies: ${anomalies.length}`,
        ` | Score: ${pulse.sovereign_score ?? 'N/A'}`,
      ].join('') + '\n');
    } catch {}
  }
}

main().catch(err => {
  process.stderr.write(`[weekly-review] Fatal: ${err.message}\n`);
  process.exit(1);
});
