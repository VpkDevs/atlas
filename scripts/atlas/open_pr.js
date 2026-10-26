#!/usr/bin/env node
/**
 * Atlas Open PR — weekly review reporter, and (at autonomy Tier ≥ 2) a real
 * pull-request opener.
 *
 * Default mode (what the weekly cron runs): reads pulse.json + decision.json,
 * formats a structured weekly review, and files it as a GitHub Issue (the
 * review dashboard). Despite the historic filename, default mode creates an
 * ISSUE — no PR, no diff, no merge. The filename is kept because
 * weekly-review.js and package.json reference it.
 *
 * PR mode (`--pr`): when the project's autonomy tier is ≥ 2 (autonomy.js),
 * dry-run is OFF, and the `gh` CLI is available, this script commits the
 * working tree on a fresh branch, pushes it, and opens a REAL pull request
 * via `gh pr create`. Every step is recorded in the append-only actions log
 * (atlas-actions.jsonl). If the tier refuses, dry-run is on, gh is missing,
 * or any git step fails, PR mode falls back to filing the review issue and
 * logs the fallback — it never silently pretends a PR exists.
 *
 * Usage:
 *   node scripts/atlas/open_pr.js /tmp/pulse.json /tmp/decision.json
 *   node scripts/atlas/open_pr.js /tmp/pulse.json /tmp/decision.json --pr \
 *     --branch atlas/week-3-fix --title "Atlas: fix onboarding" [--body-file FILE]
 *
 * Required env (issue mode): GITHUB_TOKEN, GITHUB_REPOSITORY (Actions sets it).
 * Required for PR mode: a git repo with an `origin` remote + `gh` authenticated.
 */

const https = require('https');
const fs = require('fs');
const { spawnSync } = require('child_process');

let autonomy = null;
try { autonomy = require('./autonomy'); } catch {}

const argv = process.argv.slice(2);
const flagVal = (name) => {
  const i = argv.indexOf('--' + name);
  return i >= 0 ? argv[i + 1] : undefined;
};
const positional = argv.filter((a, i) => !a.startsWith('--') && (i === 0 || !argv[i - 1].startsWith('--')));
const [pulsePath, decisionPath] = positional;
const PR_MODE = argv.includes('--pr');

if (!pulsePath) {
  process.stderr.write('Usage: node open_pr.js <pulse.json> [decision.json] [--pr --branch NAME --title TEXT]\n');
  process.exit(1);
}

function logAction(entry) {
  if (!autonomy) return;
  try { autonomy.logAction(entry); } catch {}
}

const pulse = JSON.parse(fs.readFileSync(pulsePath, 'utf8'));
const decision = decisionPath && fs.existsSync(decisionPath)
  ? JSON.parse(fs.readFileSync(decisionPath, 'utf8'))
  : null;

// ─── Format issue body ────────────────────────────────────────────────────────

function formatMrr(v) {
  if (v == null) return 'N/A';
  return `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatDelta(v) {
  if (v == null) return '';
  const sign = v > 0 ? '+' : '';
  return ` (${sign}${v}% WoW)`;
}

function anomalyIcon(type) {
  return type === 'OPPORTUNITY' ? '🟢' : type === 'THREAT' ? '🔴' : '🟡';
}

function buildBody(pulse, decision) {
  const s = pulse.metrics?.stripe;
  const u = pulse.metrics?.uptime;
  const e = pulse.metrics?.sentry;
  const anomalies = pulse.anomalies || [];
  const gaps = pulse.data_gaps || [];
  const score = pulse.sovereign_score;
  const date = new Date(pulse.timestamp).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  let body = `# 📊 Atlas Weekly Review — Week ${pulse.week_index}\n\n`;
  body += `**Date:** ${date}\n`;
  if (score != null) body += `**Sovereign Score:** ${score}/100\n`;
  body += `\n---\n\n`;

  // Metrics
  body += `## 📈 Metrics\n\n`;
  body += `| Metric | Value |\n|--------|-------|\n`;

  if (s?.available) {
    body += `| MRR | ${formatMrr(s.mrr)}${formatDelta(pulse.deltas?.mrr)} |\n`;
    body += `| Customers | ${s.customer_count} |\n`;
    body += `| New MRR (7d) | ${formatMrr(s.new_mrr_7d)} |\n`;
    body += `| Churned MRR (7d) | ${formatMrr(s.churned_mrr_7d)} |\n`;
  } else {
    body += `| MRR | ⚠️ ${s?.reason || 'Stripe not configured'} |\n`;
  }

  if (u?.available) {
    body += `| Uptime (7d) | ${u.all_up ? '✅ All monitors up' : '🔴 Incident detected'} |\n`;
    body += `| Lowest uptime | ${u.lowest_uptime_7d}% |\n`;
  }

  if (e?.available) {
    body += `| Unresolved errors | ${e.unresolved_issues} |\n`;
    if (e.top_error) {
      body += `| Top error | \`${e.top_error.title?.substring(0, 60)}\` (${e.top_error.count} events) |\n`;
    }
  }

  body += `\n`;

  // Anomalies
  if (anomalies.length > 0) {
    body += `## 🔍 Anomalies Detected\n\n`;
    anomalies.forEach(a => {
      body += `- ${anomalyIcon(a.type)} **${a.type}** (${a.metric}): ${a.message}\n`;
    });
    body += `\n`;
  }

  // Decision
  if (decision) {
    body += `## 🎯 This Week's Action\n\n`;
    body += `**Action:** \`${decision.action}\`\n`;
    body += `**Agent:** ${decision.agent}\n`;
    body += `**Confidence:** ${decision.confidence}\n`;
    body += `**Reasoning:** ${decision.reasoning}\n`;
    body += `**Expected impact:** ${decision.estimated_impact}\n`;
    body += `\n`;
  }

  // Data gaps
  if (gaps.length > 0) {
    body += `## ⚠️ Data Gaps\n\n`;
    body += `The following metrics are unavailable. Run \`/atlas diag\` to configure:\n\n`;
    gaps.forEach(g => {
      body += `- **${g.source}**: ${g.reason}\n`;
    });
    body += `\n`;
  }

  // Weekly review checklist
  body += `## ✅ 15-Minute Review Checklist\n\n`;
  body += `Complete this before closing the issue:\n\n`;
  body += `- [ ] Revenue: MRR trend reviewed\n`;
  body += `- [ ] Activation: funnel drop-off checked\n`;
  body += `- [ ] Errors: Sentry top issues reviewed\n`;
  body += `- [ ] Support: inbox cleared or triaged\n`;
  body += `- [ ] Decision: \`YOUR_NEXT_ACTION.md\` updated with one specific action\n`;

  body += `\n---\n*Generated by Atlas Growth Engine — Week ${pulse.week_index}*\n`;

  return body;
}

// ─── Create GitHub Issue ──────────────────────────────────────────────────────

async function createIssue(title, body) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;
  const cfg = autonomy ? autonomy.loadConfig() : { dry_run: false };

  if (cfg.dry_run) {
    process.stderr.write('[open_pr] Dry-run is ON — printing the review instead of filing it. Set dry_run:false (atlas.config.json) to file for real.\n');
    process.stdout.write(`\n${title}\n\n${body}\n`);
    logAction({ action: 'create_issue', target: repo || '(no repo configured)', result: 'dry_run', revert: 'n/a — nothing was written' });
    return { dryRun: true };
  }

  if (!token || !repo) {
    process.stderr.write('[open_pr] GITHUB_TOKEN or GITHUB_REPOSITORY not set — printing to stdout\n');
    process.stdout.write(`\n${title}\n\n${body}\n`);
    logAction({ action: 'create_issue', target: repo || '(no repo configured)', result: 'printed_no_token', revert: 'n/a — nothing was written' });
    return { printed: true };
  }

  const [owner, repoName] = repo.split('/');
  const payload = JSON.stringify({
    title,
    body,
    labels: ['atlas-review'],
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repoName}/issues`,
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'User-Agent': 'atlas-growth-engine',
        'Accept': 'application/vnd.github.v3+json',
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 201) {
          const issue = JSON.parse(data);
          process.stderr.write(`[open_pr] Issue created: ${issue.html_url}\n`);
          logAction({ action: 'create_issue', target: issue.html_url, result: 'ok', revert: 'close the issue' });
          resolve(issue);
        } else {
          process.stderr.write(`[open_pr] GitHub API error ${res.statusCode}: ${data}\n`);
          reject(new Error(`GitHub API error ${res.statusCode}`));
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ─── PR mode (autonomy Tier ≥ 2) ─────────────────────────────────────────────

function sh(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', timeout: 120000 });
  return { code: r.status ?? 1, stdout: String(r.stdout || ''), stderr: String(r.stderr || '') };
}

async function tryOpenPR(fallbackTitle, fallbackBody) {
  const cfg = autonomy ? autonomy.loadConfig() : { tier: 0, dry_run: true };
  const branch = flagVal('branch');
  const prTitle = flagVal('title') || fallbackTitle;
  const bodyFile = flagVal('body-file');
  const prBody = bodyFile ? fs.readFileSync(bodyFile, 'utf8') : fallbackBody;

  const verdict = autonomy ? autonomy.can('open_pr', cfg) : { allowed: false, reason: 'autonomy module unavailable' };
  if (!verdict.allowed) {
    process.stderr.write(`[open_pr] PR refused: ${verdict.reason} Falling back to the review issue.\n`);
    logAction({ action: 'open_pr', target: branch || '(no branch)', result: 'refused', reason: verdict.reason, revert: 'n/a' });
    await createIssue(fallbackTitle, fallbackBody);
    return;
  }
  if (!branch) {
    process.stderr.write('[open_pr] PR mode needs --branch NAME. Falling back to the review issue.\n');
    logAction({ action: 'open_pr', target: '(no branch)', result: 'failed', reason: 'missing --branch', revert: 'n/a' });
    await createIssue(fallbackTitle, fallbackBody);
    return;
  }
  if (cfg.dry_run) {
    process.stdout.write(`\n[DRY RUN] Would open a pull request:\n  branch: ${branch}\n  title:  ${prTitle}\n  (dry-run is ON — nothing was committed, pushed, or opened. The plan is in the actions log.)\n`);
    logAction({ action: 'open_pr', target: branch, result: 'dry_run', reason: 'dry_run enabled', revert: 'n/a — nothing was written' });
    return;
  }
  if (sh('gh', ['--version']).code !== 0) {
    process.stderr.write('[open_pr] gh CLI not available — cannot open a PR. Falling back to the review issue.\n');
    logAction({ action: 'open_pr', target: branch, result: 'fallback', reason: 'gh CLI unavailable', revert: 'n/a' });
    await createIssue(fallbackTitle, fallbackBody);
    return;
  }
  const dirty = sh('git', ['status', '--porcelain']);
  if (dirty.code !== 0) {
    process.stderr.write('[open_pr] Not inside a git repository — cannot open a PR. Falling back to the review issue.\n');
    logAction({ action: 'open_pr', target: branch, result: 'fallback', reason: 'not a git repo', revert: 'n/a' });
    await createIssue(fallbackTitle, fallbackBody);
    return;
  }
  if (!dirty.stdout.trim()) {
    process.stderr.write('[open_pr] Working tree is clean — nothing to put in a PR. Falling back to the review issue.\n');
    logAction({ action: 'open_pr', target: branch, result: 'fallback', reason: 'clean working tree', revert: 'n/a' });
    await createIssue(fallbackTitle, fallbackBody);
    return;
  }

  const steps = [
    ['git', ['checkout', '-B', branch]],
    ['git', ['add', '-A']],
    ['git', ['commit', '-m', prTitle]],
    ['git', ['push', '-u', 'origin', branch]],
    ['gh', ['pr', 'create', '--title', prTitle, '--body', prBody, '--head', branch]],
  ];
  for (const [cmd, args] of steps) {
    const r = sh(cmd, args);
    if (r.code !== 0) {
      process.stderr.write(`[open_pr] Step failed (${cmd} ${args[0]}): ${r.stderr.trim().slice(0, 300)}\nFalling back to the review issue.\n`);
      logAction({ action: 'open_pr', target: branch, result: 'failed', reason: `${cmd} ${args[0]} exited ${r.code}`, revert: `git checkout - (return to previous branch); git branch -D ${branch}` });
      await createIssue(fallbackTitle, fallbackBody);
      return;
    }
    if (cmd === 'gh') {
      const url = r.stdout.trim().split('\n').pop();
      process.stderr.write(`[open_pr] Pull request created: ${url}\n`);
      logAction({ action: 'open_pr', target: url || branch, result: 'ok', revert: `gh pr close ${url || branch}; git branch -D ${branch}` });
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const weekNum = pulse.week_index;
  const dateStr = new Date(pulse.timestamp).toISOString().split('T')[0];
  const hasCritical = (pulse.anomalies || []).some(a => a.severity === 'critical');

  const emoji = hasCritical ? '🚨' : '📊';
  const title = `${emoji} Atlas Weekly Review — Week ${weekNum} (${dateStr})`;
  const body = buildBody(pulse, decision);

  if (PR_MODE) await tryOpenPR(title, body);
  else await createIssue(title, body);
}

main().catch(err => {
  process.stderr.write(`[open_pr] Fatal: ${err.message}\n`);
  process.exit(1);
});
