#!/usr/bin/env node
/**
 * Atlas Pulse — Weekly Metrics Collector
 *
 * Called by .github/workflows/weekly-review.yml on every Monday tick.
 * Pulls live metrics from all configured APIs, computes deltas,
 * detects anomalies, and writes a structured JSON snapshot to stdout.
 *
 * Usage: node scripts/atlas/pulse.js > /tmp/pulse.json
 *
 * Required env vars (from GitHub Secrets):
 *   STRIPE_SECRET_KEY     — revenue metrics
 *   POSTHOG_API_KEY       — product analytics
 *   POSTHOG_PROJECT_ID    — PostHog project identifier
 *   BETTER_UPTIME_API_KEY — uptime monitoring
 *   SENTRY_AUTH_TOKEN     — error tracking
 *   SENTRY_ORG            — Sentry org slug
 *   SENTRY_PROJECT        — Sentry project slug
 *   GITHUB_TOKEN          — to write results back to repo
 *
 * All fields are optional — missing keys produce null values, not failures.
 * The pulse always completes; missing data is surfaced as gaps, not errors.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function safeGet(url, headers) {
  return get(url, headers).catch(err => ({ status: 0, body: null, error: err.message }));
}

// ─── Stripe metrics ───────────────────────────────────────────────────────────

async function getStripeMetrics() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return { available: false, reason: 'STRIPE_SECRET_KEY not set' };

  const auth = 'Basic ' + Buffer.from(key + ':').toString('base64');
  const headers = { 'Authorization': auth };

  // Active subscriptions
  const subs = await safeGet(
    'https://api.stripe.com/v1/subscriptions?status=active&limit=100',
    headers
  );

  // Recent charges (last 7 days)
  const since = Math.floor(Date.now() / 1000) - 7 * 24 * 3600;
  const charges = await safeGet(
    `https://api.stripe.com/v1/charges?created[gte]=${since}&limit=100`,
    headers
  );

  // Cancelled subscriptions (churned, last 7 days)
  const churned = await safeGet(
    `https://api.stripe.com/v1/subscriptions?status=canceled&created[gte]=${since}&limit=100`,
    headers
  );

  if (subs.status !== 200) return { available: false, reason: `Stripe API error: ${subs.status}` };

  const activeSubs = subs.body.data || [];
  const mrr = activeSubs.reduce((sum, sub) => {
    const amount = sub.items?.data?.[0]?.price?.unit_amount || 0;
    const interval = sub.items?.data?.[0]?.price?.recurring?.interval;
    const monthly = interval === 'year' ? amount / 12 : amount;
    return sum + monthly / 100; // convert cents to dollars
  }, 0);

  const churnedSubs = churned.body?.data || [];
  const churnedMrr = churnedSubs.reduce((sum, sub) => {
    const amount = sub.items?.data?.[0]?.price?.unit_amount || 0;
    const interval = sub.items?.data?.[0]?.price?.recurring?.interval;
    const monthly = interval === 'year' ? amount / 12 : amount;
    return sum + monthly / 100;
  }, 0);

  const recentCharges = charges.body?.data || [];
  const newMrr = recentCharges
    .filter(c => c.paid && !c.refunded)
    .reduce((sum, c) => sum + c.amount / 100, 0);

  return {
    available: true,
    mrr: Math.round(mrr * 100) / 100,
    customer_count: activeSubs.length,
    new_mrr_7d: Math.round(newMrr * 100) / 100,
    churned_mrr_7d: Math.round(churnedMrr * 100) / 100,
    net_mrr_7d: Math.round((newMrr - churnedMrr) * 100) / 100,
  };
}

// ─── PostHog metrics ──────────────────────────────────────────────────────────

async function getPostHogMetrics() {
  const key = process.env.POSTHOG_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID || '@current';
  if (!key) return { available: false, reason: 'POSTHOG_API_KEY not set' };

  const headers = { 'Authorization': `Bearer ${key}` };
  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().split('T')[0];

  const insights = await safeGet(
    `https://app.posthog.com/api/projects/${projectId}/insights/?insight=TRENDS&date_from=${since}`,
    headers
  );

  if (insights.status !== 200) return { available: false, reason: `PostHog API error: ${insights.status}` };

  return {
    available: true,
    insights_available: insights.body?.count || 0,
    note: 'Full funnel data requires saved PostHog insights. Set up via /atlas diag.'
  };
}

// ─── Better Uptime ────────────────────────────────────────────────────────────

async function getUptimeMetrics() {
  const key = process.env.BETTER_UPTIME_API_KEY;
  if (!key) return { available: false, reason: 'BETTER_UPTIME_API_KEY not set' };

  const headers = { 'Authorization': `Bearer ${key}` };
  const monitors = await safeGet('https://betteruptime.com/api/v2/monitors', headers);

  if (monitors.status !== 200) return { available: false, reason: `Better Uptime error: ${monitors.status}` };

  const data = monitors.body?.data || [];
  const results = data.map(m => ({
    name: m.attributes?.url || m.attributes?.pronounceable_name,
    status: m.attributes?.status,
    uptime_percentage: m.attributes?.uptime_percentage,
  }));

  const allUp = results.every(m => m.status === 'up');
  const lowestUptime = Math.min(...results.map(m => m.uptime_percentage || 100));

  return {
    available: true,
    monitor_count: results.length,
    all_up: allUp,
    lowest_uptime_7d: lowestUptime,
    monitors: results,
  };
}

// ─── Sentry metrics ───────────────────────────────────────────────────────────

async function getSentryMetrics() {
  const token = process.env.SENTRY_AUTH_TOKEN;
  const org = process.env.SENTRY_ORG;
  const project = process.env.SENTRY_PROJECT;
  if (!token || !org || !project) {
    return { available: false, reason: 'SENTRY_AUTH_TOKEN/SENTRY_ORG/SENTRY_PROJECT not set' };
  }

  const headers = { 'Authorization': `Bearer ${token}` };
  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

  const issues = await safeGet(
    `https://sentry.io/api/0/projects/${org}/${project}/issues/?query=is:unresolved&statsPeriod=7d&limit=25`,
    headers
  );

  if (issues.status !== 200) return { available: false, reason: `Sentry error: ${issues.status}` };

  const data = issues.body || [];
  const criticalCount = data.filter(i => i.level === 'fatal' || i.level === 'error').length;
  const totalEvents = data.reduce((sum, i) => sum + (parseInt(i.count) || 0), 0);

  return {
    available: true,
    unresolved_issues: data.length,
    critical_issues: criticalCount,
    total_events_7d: totalEvents,
    top_error: data[0] ? {
      title: data[0].title,
      count: data[0].count,
      level: data[0].level,
    } : null,
  };
}

// ─── Context: read previous pulse for deltas ──────────────────────────────────

function loadPreviousPulse() {
  // Look for last pulse in ~/.atlas/ (if running locally) or in repo
  const candidates = [
    path.join(process.env.HOME || '', '.atlas', 'last_pulse.json'),
    path.join(process.cwd(), '.atlas', 'last_pulse.json'),
  ];
  for (const p of candidates) {
    try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch {}
  }
  return null;
}

function computeDelta(current, previous, field) {
  if (!previous || current == null || previous[field] == null) return null;
  const prev = previous[field];
  if (prev === 0) return current > 0 ? Infinity : 0;
  return Math.round(((current - prev) / Math.abs(prev)) * 1000) / 10; // pct, 1dp
}

// ─── Anomaly detection ────────────────────────────────────────────────────────

function detectAnomalies(metrics, prev) {
  const anomalies = [];

  if (metrics.stripe?.available) {
    const mrrDelta = computeDelta(metrics.stripe.mrr, prev?.stripe, 'mrr');
    if (mrrDelta !== null && mrrDelta < -10) {
      anomalies.push({
        type: 'THREAT',
        metric: 'mrr',
        message: `MRR dropped ${Math.abs(mrrDelta)}% week-over-week`,
        severity: mrrDelta < -25 ? 'critical' : 'warning',
      });
    }
    if (mrrDelta !== null && mrrDelta > 20) {
      anomalies.push({
        type: 'OPPORTUNITY',
        metric: 'mrr',
        message: `MRR grew ${mrrDelta}% week-over-week — amplify what caused it`,
        severity: 'info',
      });
    }
  }

  if (metrics.uptime?.available && !metrics.uptime.all_up) {
    anomalies.push({
      type: 'THREAT',
      metric: 'uptime',
      message: 'One or more monitors are down',
      severity: 'critical',
    });
  }

  if (metrics.sentry?.available && metrics.sentry.critical_issues > 0) {
    const prevCritical = prev?.sentry?.critical_issues || 0;
    if (metrics.sentry.critical_issues > prevCritical) {
      anomalies.push({
        type: 'THREAT',
        metric: 'errors',
        message: `${metrics.sentry.critical_issues} unresolved critical errors (up from ${prevCritical})`,
        severity: 'warning',
      });
    }
  }

  return anomalies;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const prev = loadPreviousPulse();
  const timestamp = new Date().toISOString();

  process.stderr.write(`[pulse] Running at ${timestamp}\n`);
  process.stderr.write(`[pulse] Previous pulse: ${prev ? prev.timestamp : 'none'}\n`);

  const [stripe, posthog, uptime, sentry] = await Promise.all([
    getStripeMetrics(),
    getPostHogMetrics(),
    getUptimeMetrics(),
    getSentryMetrics(),
  ]);

  const metrics = { stripe, posthog, uptime, sentry };

  const deltas = {
    mrr: computeDelta(stripe?.mrr, prev?.metrics?.stripe, 'mrr'),
    customer_count: computeDelta(stripe?.customer_count, prev?.metrics?.stripe, 'customer_count'),
    unresolved_issues: computeDelta(sentry?.unresolved_issues, prev?.metrics?.sentry, 'unresolved_issues'),
  };

  const anomalies = detectAnomalies(metrics, prev?.metrics);

  // Sovereign Score estimation (basic — full score requires context.json)
  let sovereignScore = null;
  try {
    const ctxPath = path.join(process.env.HOME || '', '.atlas', 'portfolio',
      path.basename(process.cwd()), 'context.json');
    const ctx = JSON.parse(fs.readFileSync(ctxPath, 'utf8'));
    sovereignScore = ctx?.product?.runs_itself_score || null;
  } catch {}

  const pulse = {
    timestamp,
    week_index: prev ? (prev.week_index || 0) + 1 : 1,
    sovereign_score: sovereignScore,
    metrics,
    deltas,
    anomalies,
    data_gaps: Object.entries(metrics)
      .filter(([, v]) => !v.available)
      .map(([k, v]) => ({ source: k, reason: v.reason })),
  };

  // Write to stdout (captured by GitHub Action → /tmp/pulse.json)
  process.stdout.write(JSON.stringify(pulse, null, 2));

  // Save locally for next week's delta computation
  const savePath = path.join(process.env.HOME || '', '.atlas', 'last_pulse.json');
  try {
    fs.mkdirSync(path.dirname(savePath), { recursive: true });
    fs.writeFileSync(savePath, JSON.stringify(pulse));
    process.stderr.write(`[pulse] Saved to ${savePath}\n`);
  } catch (e) {
    process.stderr.write(`[pulse] Could not save locally: ${e.message}\n`);
  }

  // Exit 1 if critical anomaly — lets CI fail and surface the issue
  const hasCritical = anomalies.some(a => a.severity === 'critical');
  process.exit(hasCritical ? 1 : 0);
}

main().catch(err => {
  process.stderr.write(`[pulse] Fatal error: ${err.message}\n`);
  process.exit(1);
});
