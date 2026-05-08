#!/usr/bin/env node
/**
 * Atlas Notify — Founder Notification Dispatcher
 *
 * Sends a concise weekly digest to the founder's configured channels.
 * Reads pulse.json and decision.json, formats a short message,
 * and dispatches to Discord webhook and/or Slack webhook.
 *
 * Usage: node scripts/atlas/notify.js /tmp/pulse.json /tmp/decision.json
 *
 * Required env (at least one):
 *   DISCORD_WEBHOOK       — Discord webhook URL
 *   SLACK_WEBHOOK_URL     — Slack incoming webhook URL
 */

const https = require('https');
const fs = require('fs');

const [,, pulsePath, decisionPath] = process.argv;
const pulse = pulsePath ? JSON.parse(fs.readFileSync(pulsePath, 'utf8')) : null;
const decision = decisionPath && fs.existsSync(decisionPath)
  ? JSON.parse(fs.readFileSync(decisionPath, 'utf8'))
  : null;

if (!pulse) {
  process.stderr.write('Usage: node notify.js <pulse.json> [decision.json]\n');
  process.exit(1);
}

// ─── Format message ────────────────────────────────────────────────────────────

function formatDigest(pulse, decision) {
  const s = pulse.metrics?.stripe;
  const u = pulse.metrics?.uptime;
  const anomalies = pulse.anomalies || [];
  const score = pulse.sovereign_score;
  const critical = anomalies.filter(a => a.severity === 'critical');

  const header = critical.length > 0
    ? `🚨 **Atlas Alert — Week ${pulse.week_index}**`
    : `📊 **Atlas Weekly — Week ${pulse.week_index}**`;

  const lines = [header, ''];

  // Score
  if (score != null) lines.push(`**Sovereign Score:** ${score}/100`);

  // Key metrics
  if (s?.available) {
    const mrrDelta = pulse.deltas?.mrr;
    const deltaStr = mrrDelta != null ? ` (${mrrDelta > 0 ? '+' : ''}${mrrDelta}%)` : '';
    lines.push(`**MRR:** $${s.mrr?.toLocaleString()}${deltaStr}`);
    lines.push(`**Customers:** ${s.customer_count}`);
  }

  if (u?.available && !u.all_up) {
    lines.push(`⚠️ **Uptime alert:** one or more monitors down`);
  }

  // Anomalies
  if (critical.length > 0) {
    lines.push('', '**Critical issues:**');
    critical.forEach(a => lines.push(`• ${a.message}`));
  }

  // Decision
  if (decision) {
    lines.push('', `**This week's action:** ${decision.action}`);
    lines.push(`_${decision.reasoning}_`);
  }

  // Data gaps
  const gaps = pulse.data_gaps || [];
  if (gaps.length > 0) {
    lines.push('', `⚠️ Missing data: ${gaps.map(g => g.source).join(', ')} — run \`/atlas diag\``);
  }

  return lines.join('\n');
}

// ─── Send to webhook ──────────────────────────────────────────────────────────

function postWebhook(url, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function sendDiscord(message) {
  const url = process.env.DISCORD_WEBHOOK;
  if (!url) return;
  const res = await postWebhook(url, { content: message }).catch(e => ({ error: e.message }));
  process.stderr.write(`[notify] Discord: ${res.status || res.error}\n`);
}

async function sendSlack(message) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;
  const res = await postWebhook(url, { text: message }).catch(e => ({ error: e.message }));
  process.stderr.write(`[notify] Slack: ${res.status || res.error}\n`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const message = formatDigest(pulse, decision);

  const discordUrl = process.env.DISCORD_WEBHOOK;
  const slackUrl = process.env.SLACK_WEBHOOK_URL;

  if (!discordUrl && !slackUrl) {
    process.stderr.write('[notify] No webhooks configured — printing to stdout\n');
    process.stdout.write(message + '\n');
    return;
  }

  await Promise.all([sendDiscord(message), sendSlack(message)]);
  process.stderr.write('[notify] Notifications sent\n');
}

main().catch(err => {
  process.stderr.write(`[notify] Fatal: ${err.message}\n`);
  process.exit(1);
});
