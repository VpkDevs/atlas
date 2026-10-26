#!/usr/bin/env node
/**
 * Atlas Autonomy — the founder-set ladder that bounds what Atlas may do alone.
 *
 * Tiers (set per project in atlas.config.json, mirrored in atlas-state.json):
 *   Tier 0 — Advise only. Atlas reports; it takes no product-modifying action.
 *   Tier 1 — Act and report on reversible work: branch commits, scaffolding,
 *            dependency updates. Every action is logged with a revert hint.
 *   Tier 2 — Open real pull requests; merge only when CI is green.
 *   Tier 3 — Scheduled autonomous maintenance (the weekly loop) with a digest.
 *
 * Dry-run defaults ON at every tier: an action-taking script prints what it
 * WOULD do and logs it as `dry_run`, changing nothing, until the founder
 * explicitly sets dry_run to false.
 *
 * HARD LINES — refused at every tier, in code, not by convention. These
 * actions do not exist as capabilities anywhere in Atlas:
 *   spend money · post publicly · message a real person · deploy to
 *   production · delete resources · force-push.
 * A founder who wants one of those done does it themselves (userMust).
 *
 * Actions log: append-only JSONL (default ./atlas-actions.jsonl, override
 * with ATLAS_ACTIONS_LOG). One line per attempted action:
 *   { ts, tier, dry_run, action, target, result, revert }
 *
 * Config resolution order: env (ATLAS_TIER / ATLAS_DRY_RUN) →
 * atlas.config.json → atlas-state.json `autonomy` → defaults (tier 0, dry-run on).
 * atlas.config.json may also carry `thresholds` for decide.js:
 *   { "thresholds": { "churn_monthly_pct": 5, "activation_target": 0.30,
 *                     "mrr_growth_pct": 20, "mrr_drop_pct": -10 } }
 *
 * Usage (CLI):
 *   node autonomy.js config                 — print the effective config
 *   node autonomy.js check open_pr          — exit 0 if allowed, 1 if refused
 *   node autonomy.js log commit src/x.js ok "git revert <sha>"
 */

const fs = require('fs');
const path = require('path');

// Minimum tier required per action. Reporting actions are not product-modifying
// and are allowed at every tier (they are how the loop reports at all).
const ACTION_MIN_TIER = {
  create_issue: 0,   // report: file the weekly review / findings
  notify: 0,         // report: send the founder digest to founder-owned channels
  commit: 1,         // reversible: branch commit
  scaffold: 1,       // reversible: generate files (templates, CI, .gitignore)
  update_deps: 1,    // reversible: dependency update on a branch
  open_pr: 2,        // branch + push + gh pr create
  merge_pr: 2,       // only with green CI (checked by the caller via gh)
  scheduled_run: 3,  // unattended weekly maintenance tick
};

// Refused at every tier. No config value enables these.
const FORBIDDEN_ACTIONS = new Set([
  'spend', 'purchase', 'charge',
  'post_public', 'publish_post', 'tweet',
  'message_person', 'send_email_person', 'dm',
  'deploy_production', 'deploy',
  'delete', 'delete_resource', 'drop_table',
  'force_push',
]);

function loadConfig(cwd = process.cwd(), state = undefined) {
  let fileCfg = {};
  try { fileCfg = JSON.parse(fs.readFileSync(path.join(cwd, 'atlas.config.json'), 'utf8')); } catch {}
  let stateAutonomy = {};
  if (state === undefined) {
    try {
      const { loadState } = require('./atlas-state');
      stateAutonomy = (loadState({ root: cwd }) || {}).autonomy || {};
    } catch {}
  } else if (state) {
    stateAutonomy = state.autonomy || {};
  }
  const cfgAutonomy = fileCfg.autonomy || {};

  let tier = 0;
  if (stateAutonomy.tier != null) tier = stateAutonomy.tier;
  if (cfgAutonomy.tier != null) tier = cfgAutonomy.tier;
  if (process.env.ATLAS_TIER != null && process.env.ATLAS_TIER !== '') {
    const t = parseInt(process.env.ATLAS_TIER, 10);
    if (!Number.isNaN(t)) tier = t;
  }
  tier = Math.max(0, Math.min(3, tier));

  let dryRun = true;
  if (stateAutonomy.dry_run != null) dryRun = !!stateAutonomy.dry_run;
  if (cfgAutonomy.dry_run != null) dryRun = !!cfgAutonomy.dry_run;
  if (process.env.ATLAS_DRY_RUN != null && process.env.ATLAS_DRY_RUN !== '') {
    dryRun = !['0', 'false', 'off', 'no'].includes(process.env.ATLAS_DRY_RUN.toLowerCase());
  }

  const thresholds = Object.assign(
    { churn_monthly_pct: 5, activation_target: 0.30, mrr_growth_pct: 20, mrr_drop_pct: -10 },
    fileCfg.thresholds || {}
  );

  return { tier, dry_run: dryRun, thresholds };
}

function can(action, cfg) {
  if (FORBIDDEN_ACTIONS.has(action)) {
    return { allowed: false, reason: `"${action}" is a hard line — Atlas has no such capability at any tier; it is a founder action (userMust).` };
  }
  const min = ACTION_MIN_TIER[action];
  if (min == null) {
    return { allowed: false, reason: `Unknown action "${action}" — not in the autonomy ladder.` };
  }
  if (cfg.tier < min) {
    return { allowed: false, reason: `"${action}" requires autonomy tier ${min}; this project is at tier ${cfg.tier}.` };
  }
  return { allowed: true, reason: `tier ${cfg.tier} ≥ ${min}` };
}

function resolveLogPath(cwd = process.cwd()) {
  if (process.env.ATLAS_ACTIONS_LOG) return path.resolve(process.env.ATLAS_ACTIONS_LOG);
  return path.join(cwd, 'atlas-actions.jsonl');
}

function logAction(entry, opts = {}) {
  const cwd = opts.cwd || process.cwd();
  const cfg = opts.config || loadConfig(cwd);
  const line = {
    ts: new Date().toISOString(),
    tier: cfg.tier,
    dry_run: !!cfg.dry_run,
    action: entry.action,
    target: entry.target || null,
    result: entry.result, // 'ok' | 'refused' | 'dry_run' | 'failed' | 'fallback'
    reason: entry.reason || null,
    revert: entry.revert || null,
  };
  const p = opts.logPath || resolveLogPath(cwd);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.appendFileSync(p, JSON.stringify(line) + '\n');
  return line;
}

function readLog(opts = {}) {
  const p = opts.logPath || resolveLogPath(opts.cwd || process.cwd());
  try {
    return fs.readFileSync(p, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l));
  } catch {
    return [];
  }
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

function main() {
  const [cmd, a, b, c, d] = process.argv.slice(2);
  const cfg = loadConfig();
  if (cmd === 'config' || !cmd) {
    process.stdout.write(JSON.stringify(cfg, null, 2) + '\n');
  } else if (cmd === 'check') {
    const verdict = can(a, cfg);
    process.stdout.write(`${a}: ${verdict.allowed ? 'ALLOWED' : 'REFUSED'} — ${verdict.reason}\n`);
    process.exit(verdict.allowed ? 0 : 1);
  } else if (cmd === 'log') {
    const line = logAction({ action: a, target: b, result: c || 'ok', revert: d || null });
    process.stdout.write(JSON.stringify(line) + '\n');
  } else {
    process.stderr.write('Usage: autonomy.js [config|check <action>|log <action> <target> <result> [revert]]\n');
    process.exit(2);
  }
}

if (require.main === module) main();

module.exports = { loadConfig, can, logAction, readLog, resolveLogPath, ACTION_MIN_TIER, FORBIDDEN_ACTIONS };
