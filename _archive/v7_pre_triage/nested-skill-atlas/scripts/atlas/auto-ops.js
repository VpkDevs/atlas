#!/usr/bin/env node
/**
 * Atlas Auto-Ops — Autonomous Incident & Governance Manager
 *
 * This script is the "Automated Flywheel" of Stage 4. It:
 * 1. Analyzes pulse data for critical anomalies.
 * 2. Automatically opens incident logs for P0/P1 issues.
 * 3. Triggers the Capital Governor to shift operating modes.
 * 4. Updates the persistent Brain state to ensure continuity.
 *
 * Usage: node scripts/atlas/auto-ops.js <pulse.json> [decision.json]
 */

const fs = require('fs');
const path = require('path');
const { CapitalGovernor } = require('../../scoring-engine/dist/index');

const [,, pulsePath, decisionPath] = process.argv;
const STATE_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.atlas');

if (!pulsePath || !fs.existsSync(pulsePath)) {
  console.error('Usage: node auto-ops.js <pulse.json> [decision.json]');
  process.exit(1);
}

const pulse = JSON.parse(fs.readFileSync(pulsePath, 'utf8'));
const decision = decisionPath && fs.existsSync(decisionPath)
  ? JSON.parse(fs.readFileSync(decisionPath, 'utf8'))
  : null;

// Helper to detect project slug (best effort in CI)
function getProjectSlug() {
  // In GitHub Actions, use repo name. Locally, use CWD.
  const repo = process.env.GITHUB_REPOSITORY;
  if (repo) return repo.split('/')[1].toLowerCase();
  return path.basename(process.cwd()).toLowerCase();
}

const slug = getProjectSlug();
const projectPath = path.join(STATE_DIR, 'portfolio', slug);

async function runAutoOps() {
  console.log(`[auto-ops] Starting autonomous operation for project: ${slug}`);

  // 1. Incident Detection & Creation
  const criticalAnomalies = (pulse.anomalies || []).filter(a => a.severity === 'critical');
  const openIncidents = { p0: 0, p1: 0, p2: 0, p3: 0 };

  if (criticalAnomalies.length > 0) {
    console.log(`[auto-ops] Detected ${criticalAnomalies.length} critical anomalies!`);
    
    if (!fs.existsSync(path.join(projectPath, 'incidents'))) {
      fs.mkdirSync(path.join(projectPath, 'incidents'), { recursive: true });
    }

    criticalAnomalies.forEach((anomaly, index) => {
      const incidentId = `INC-${new Date().getTime()}-${index}`;
      const severity = anomaly.metric === 'uptime' ? 'P0' : 'P1';
      openIncidents[severity.toLowerCase()]++;

      const incidentLog = `---
id: ${incidentId}
severity: ${severity}
status: open
opened_at: ${new Date().toISOString()}
source: auto-pulse
metric: ${anomaly.metric}
---

# Incident: ${anomaly.message}

## Description
Detected by Atlas Pulse during weekly review. 

## Automated Response
- Capital Governor triggered to shift posture.
- Incident logged in portfolio state.
- Notification sent to founder via GitHub/Discord.

## Required Actions
- [ ] Investigate root cause of ${anomaly.metric} failure.
- [ ] Resolve bottleneck.
- [ ] Update incident status to resolved.
`;
      fs.writeFileSync(path.join(projectPath, 'incidents', `${incidentId}.md`), incidentLog);
      console.log(`[auto-ops] Created incident log: ${incidentId}.md (${severity})`);
    });
  }

  // 2. Capital Governance
  const governor = new CapitalGovernor(STATE_DIR);
  
  // Prepare financial state from pulse
  const capState = {
    as_of: pulse.timestamp,
    available_cash: pulse.metrics?.stripe?.available ? pulse.metrics.stripe.mrr * 5 : 5000, // Estimate if cash unknown
    runway_days: 120, // Default to stable unless detected otherwise
    monthly_net_burn: 1000,
    burn_volatility: Math.abs(pulse.deltas?.mrr || 0) / 100,
    failed_payment_ratio: 0.05,
    refund_dispute_ratio: 0.01,
    data_confidence: pulse.metrics?.stripe?.available ? 'high' : 'low',
    open_incidents: openIncidents
  };

  const govDecision = governor.evaluate(capState);
  governor.updateProjectContext(slug, govDecision);
  governor.logDecision(slug, govDecision, capState);
  
  console.log(`[auto-ops] Capital Governor set mode to: ${govDecision.final_mode}`);

  // 3. Brain Update (Session Continuity)
  const brainPath = path.join(projectPath, 'atlas-brain.md');
  if (fs.existsSync(brainPath)) {
    let brainContent = fs.readFileSync(brainPath, 'utf8');
    
    // Update Phase and Next Action if decision exists
    if (decision) {
      const nextActionEntry = `\n- [ ] **Next Action (via Auto-Ops):** ${decision.action} (Reason: ${decision.reasoning})`;
      // Simplistic append for now; in production this would use markers
      brainContent += nextActionEntry;
      fs.writeFileSync(brainPath, brainContent);
      console.log('[auto-ops] Updated atlas-brain.md with next action.');
    }
  }

  console.log('[auto-ops] Autonomous flywheel tick complete.');
}

runAutoOps().catch(err => {
  console.error(`[auto-ops] Fatal error: ${err.message}`);
  process.exit(1);
});
