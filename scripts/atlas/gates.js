#!/usr/bin/env node
/**
 * Atlas Gates — pre-flight.md as an executable.
 *
 * Runs the mechanically checkable subset of the 11 Pre-Flight checks against
 * atlas-state.json and reports each check as GREEN / YELLOW / RED / N/A /
 * DEFERRED / MANUAL:
 *
 *   N/A      — the product has no such system (round-1 rule: decided by what
 *              the product IS, reason recorded, excluded from the count).
 *   DEFERRED — the check's system is built by a later phase (Checks 6–8 are
 *              Phase 8's; round-1 rule: not RED, not YELLOW, never blocks —
 *              until that phase has run, then the check runs for real).
 *   MANUAL   — real, due, and applicable, but not mechanically checkable
 *              (auth E2E, payment E2E, Lighthouse). Excluded from the count;
 *              listed so a human/agent verifies it. A MANUAL check is never
 *              silently counted as passed.
 *   EC-17    — non-web products (desktop/CLI/library/mobile) get the
 *              edge-cases.md variants automatically from product.type:
 *              install-and-launches (smoke command) instead of URL 200;
 *              legal text in repo/in-app instead of served routes.
 *
 * Verdict: PASS when no applicable-and-due check is RED and YELLOWs < 3
 * (pre-flight.md's gate); BLOCKED otherwise. The gate stays absolute for
 * everything that genuinely applies and is due.
 *
 * Exit: 0 = PASS · 1 = BLOCKED · 2 = usage/state error.
 * Usage: node gates.js [--state PATH] [--root DIR] [--json] [--no-write]
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { execFile } = require('child_process');

function fetchUrl(url, timeoutMs = 10000, redirects = 5) {
  return new Promise((resolve) => {
    let u;
    try { u = new URL(url); } catch { return resolve({ ok: false, error: 'invalid URL' }); }
    const lib = u.protocol === 'https:' ? https : http;
    const req = lib.get(u, { timeout: timeoutMs }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirects > 0) {
        res.resume();
        return resolve(fetchUrl(new URL(res.headers.location, u).toString(), timeoutMs, redirects - 1));
      }
      let size = 0;
      res.on('data', (c) => { size += c.length; });
      res.on('end', () => resolve({ ok: true, status: res.statusCode, size, headers: res.headers }));
    });
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'timeout' }); });
    req.on('error', (e) => resolve({ ok: false, error: e.message }));
  });
}

function runCommand(cmd, cwd, timeoutMs = 30000) {
  return new Promise((resolve) => {
    execFile('/bin/sh', ['-c', cmd], { cwd, timeout: timeoutMs }, (err, stdout, stderr) => {
      resolve({ code: err ? (err.code ?? 1) : 0, stdout: String(stdout), stderr: String(stderr) });
    });
  });
}

function fileNonEmpty(p) {
  try { return fs.statSync(p).size > 0; } catch { return false; }
}

// ─── The checks ───────────────────────────────────────────────────────────────
// ctx: { state, root }

const PHASE8 = '8';

function phaseComplete(state, id) {
  return state.phases?.[id]?.status === 'complete';
}

const CHECKS = [
  {
    n: 1, id: 'responsive', name: 'Product responsive',
    async run(ctx) {
      const { state, root } = ctx;
      if (state.product.type !== 'web') {
        // EC-17 variant: clean install launches + smoke test passes.
        if (state.product.smoke_command) {
          const r = await runCommand(state.product.smoke_command, root);
          return r.code === 0
            ? { status: 'GREEN', detail: `EC-17: smoke command exited 0 (${state.product.smoke_command})` }
            : { status: 'RED', detail: `EC-17: smoke command exited ${r.code} (${state.product.smoke_command})` };
        }
        if (state.product.artifact_path && fs.existsSync(path.resolve(root, state.product.artifact_path))) {
          return { status: 'GREEN', detail: `EC-17: artifact present at ${state.product.artifact_path} (no smoke command configured)` };
        }
        return { status: 'RED', detail: 'EC-17: no smoke_command and no artifact_path in atlas-state.json — nothing proves the product launches' };
      }
      const url = state.product.production_url;
      if (!url) return { status: 'RED', detail: 'No production_url in atlas-state.json' };
      const r = await fetchUrl(url);
      if (!r.ok) return { status: 'RED', detail: `GET ${url} failed: ${r.error}` };
      if (r.status === 200 && r.size > 1024) return { status: 'GREEN', detail: `GET ${url} → 200, ${r.size} bytes` };
      return { status: 'RED', detail: `GET ${url} → ${r.status}, ${r.size} bytes (need 200 and > 1KB)` };
    },
  },
  {
    n: 2, id: 'healthcheck', name: 'Healthcheck endpoint live',
    async run(ctx) {
      const { state } = ctx;
      if (state.product.type !== 'web') {
        return { status: 'N/A', detail: 'EC-17: no served health endpoint on a non-web product' };
      }
      const url = state.product.production_url;
      if (!url) return { status: 'RED', detail: 'No production_url in atlas-state.json' };
      const healthUrl = url.replace(/\/?$/, '') + '/api/health';
      const r = await fetchUrl(healthUrl);
      if (r.ok && r.status === 200) return { status: 'GREEN', detail: `GET ${healthUrl} → 200` };
      return { status: 'RED', detail: `GET ${healthUrl} → ${r.ok ? r.status : r.error} (need 200 {"status":"ok"})` };
    },
  },
  {
    n: 3, id: 'auth_flow', name: 'Auth flow end-to-end',
    async run(ctx) {
      if (!ctx.state.applicable_systems.auth) {
        return { status: 'N/A', detail: 'Product has no user accounts (applicable_systems.auth = false)' };
      }
      return { status: 'MANUAL', detail: 'Requires the Playwright E2E run (pre-flight.md Check 3) — not mechanically checkable by this script' };
    },
  },
  {
    n: 4, id: 'payment_flow', name: 'Payment flow end-to-end',
    async run(ctx) {
      if (!ctx.state.applicable_systems.payments) {
        return { status: 'N/A', detail: 'Product takes no payments (applicable_systems.payments = false)' };
      }
      return { status: 'MANUAL', detail: 'Requires the Stripe test-mode run (pre-flight.md Check 4) — not mechanically checkable by this script' };
    },
  },
  {
    n: 5, id: 'legal_pages', name: 'Legal pages / legal text present',
    async run(ctx) {
      const { state, root } = ctx;
      if (state.product.type !== 'web') {
        // EC-17 variant: legal text shipped in-app / installer / repo.
        const terms = ['docs/legal/TERMS_OF_SERVICE.md', 'docs/legal/Terms.md', 'TERMS.md'];
        const privacy = ['docs/legal/PRIVACY_POLICY.md', 'docs/legal/Privacy.md', 'PRIVACY.md'];
        const has = (list) => list.some((p) => fileNonEmpty(path.join(root, p)));
        if (has(terms) && has(privacy)) {
          return { status: 'GREEN', detail: 'EC-17: Terms + Privacy present in repo (docs/legal/)' };
        }
        return { status: 'RED', detail: 'EC-17: Terms/Privacy not found in repo (expected under docs/legal/)' };
      }
      const base = state.product.production_url;
      if (!base) return { status: 'RED', detail: 'No production_url in atlas-state.json' };
      const [t, p] = await Promise.all([
        fetchUrl(base.replace(/\/?$/, '') + '/terms'),
        fetchUrl(base.replace(/\/?$/, '') + '/privacy'),
      ]);
      const ok = (r) => r.ok && r.status === 200 && r.size > 500;
      if (ok(t) && ok(p)) return { status: 'GREEN', detail: `/terms and /privacy → 200, > 500B each` };
      return { status: 'RED', detail: `/terms → ${t.ok ? t.status : t.error} (${t.size || 0}B), /privacy → ${p.ok ? p.status : p.error} (${p.size || 0}B) — need 200 and > 500B each` };
    },
  },
  {
    n: 6, id: 'email_delivery', name: 'Email delivery works',
    async run(ctx) {
      const { state, root } = ctx;
      if (!state.applicable_systems.email) {
        return { status: 'N/A', detail: 'Product sends no email (applicable_systems.email = false)' };
      }
      if (!phaseComplete(state, PHASE8)) {
        return { status: 'DEFERRED', detail: 'Email infrastructure is built in Phase 8, which has not completed — re-run after Phase 8' };
      }
      // Phase 8 has run: the mechanical evidence is the sequences' trigger code
      // committed in the product (the pack's definition of "live"). Actually
      // sending a test email is a send — outside what a gate script does.
      const evidence = state.gate_evidence?.email_trigger_paths || [];
      const found = evidence.filter((p) => fs.existsSync(path.resolve(root, p)));
      if (evidence.length && found.length === evidence.length) {
        return { status: 'GREEN', detail: `Trigger code present for all sequences (${found.join(', ')}); delivery itself verified by the Phase 8 test send` };
      }
      return { status: 'RED', detail: 'Phase 8 complete but no email trigger-code evidence recorded (state.gate_evidence.email_trigger_paths)' };
    },
  },
  {
    n: 7, id: 'error_monitoring', name: 'Error monitoring fires',
    async run(ctx) {
      const { state, root } = ctx;
      if (!phaseComplete(state, PHASE8)) {
        return { status: 'DEFERRED', detail: 'Error monitoring is configured in Phase 8, which has not completed — re-run after Phase 8' };
      }
      const candidates = ['sentry.client.config.js', 'sentry.client.config.ts', 'sentry.server.config.js', 'sentry.server.config.ts', 'instrumentation.ts', 'src/instrumentation.ts'];
      const found = candidates.filter((p) => fs.existsSync(path.join(root, p)));
      const dsn = process.env.SENTRY_DSN || state.signals?.error_alerting === true;
      if (found.length && dsn) return { status: 'GREEN', detail: `Sentry config present (${found[0]}) and DSN/alerting signal recorded` };
      if (state.product.type !== 'web' && state.signals?.error_alerting === true) {
        return { status: 'GREEN', detail: 'EC-17: crash/error reporting signal recorded in state' };
      }
      return { status: 'RED', detail: 'Phase 8 complete but no error-monitoring config found (looked for Sentry config / error_alerting signal)' };
    },
  },
  {
    n: 8, id: 'uptime_monitoring', name: 'Uptime monitoring active',
    async run(ctx) {
      const { state } = ctx;
      if (!phaseComplete(state, PHASE8)) {
        return { status: 'DEFERRED', detail: 'Uptime monitoring is configured in Phase 8, which has not completed — re-run after Phase 8' };
      }
      if (state.signals?.uptime_monitor === true) {
        return { status: 'GREEN', detail: 'Uptime monitor recorded active in state signals (set by Phase 8 after verifying with the provider)' };
      }
      if (state.product.type !== 'web') {
        return { status: 'N/A', detail: 'EC-17: uptime monitoring does not apply to a non-web product (crash reporting is Check 7)' };
      }
      return { status: 'RED', detail: 'Phase 8 complete but no active uptime monitor recorded (signals.uptime_monitor)' };
    },
  },
  {
    n: 9, id: 'security_headers', name: 'DNS, SSL, security headers',
    async run(ctx) {
      const { state } = ctx;
      if (state.product.type !== 'web') {
        return { status: 'N/A', detail: 'EC-17: no served pages to carry headers on a non-web product' };
      }
      const url = state.product.production_url;
      if (!url) return { status: 'RED', detail: 'No production_url in atlas-state.json' };
      const r = await fetchUrl(url);
      if (!r.ok) return { status: 'RED', detail: `GET ${url} failed: ${r.error}` };
      const wanted = ['strict-transport-security', 'content-security-policy', 'x-content-type-options', 'x-frame-options', 'referrer-policy'];
      const present = wanted.filter((h) => r.headers && r.headers[h]);
      if (present.length >= 3) return { status: 'GREEN', detail: `${present.length}/5 security headers present (${present.join(', ')})` };
      if (present.length >= 1) return { status: 'YELLOW', detail: `Only ${present.length}/5 security headers present (${present.join(', ')})` };
      return { status: 'RED', detail: 'No security headers present on the production response' };
    },
  },
  {
    n: 10, id: 'rollback', name: 'Rollback procedure tested / available',
    async run(ctx) {
      const { state, root } = ctx;
      const candidates = ['scripts/rollback.sh'];
      if (state.product.rollback_path) candidates.unshift(state.product.rollback_path);
      const found = candidates.filter((p) => fs.existsSync(path.resolve(root, p)));
      if (found.length) return { status: 'GREEN', detail: `Rollback path present: ${found[0]} (executing it remains a staged-environment step — pre-flight.md Check 10)` };
      return { status: 'RED', detail: 'No rollback script found (expected scripts/rollback.sh or product.rollback_path)' };
    },
  },
  {
    n: 11, id: 'mobile_responsive', name: 'Mobile responsiveness',
    async run(ctx) {
      if (ctx.state.product.type !== 'web') {
        return { status: 'N/A', detail: 'EC-17: no web UI to score on a non-web product' };
      }
      return { status: 'MANUAL', detail: 'Requires Lighthouse (pre-flight.md Check 11, mobile score ≥ 80) — not mechanically checkable by this script' };
    },
  },
];

async function runGates(state, root) {
  const ctx = { state, root };
  const checks = [];
  for (const chk of CHECKS) {
    let r;
    try { r = await chk.run(ctx); }
    catch (e) { r = { status: 'RED', detail: `check errored: ${e.message}` }; }
    checks.push({ n: chk.n, id: chk.id, name: chk.name, status: r.status, detail: r.detail });
  }
  const counted = checks.filter((c) => !['N/A', 'DEFERRED', 'MANUAL'].includes(c.status));
  const reds = counted.filter((c) => c.status === 'RED').length;
  const yellows = counted.filter((c) => c.status === 'YELLOW').length;
  const verdict = reds === 0 && yellows < 3 ? 'PASS' : 'BLOCKED';
  return { ran_at: new Date().toISOString(), verdict, reds, yellows, checks };
}

function formatGates(result) {
  const icon = { GREEN: '✅', YELLOW: '⚠️', RED: '❌', 'N/A': '➖', DEFERRED: '⏸️', MANUAL: '👁️' };
  const lines = result.checks.map((c) => `${icon[c.status] || ''} Check ${c.n} (${c.id}): ${c.status} — ${c.detail}`);
  lines.push('');
  lines.push(`VERDICT: ${result.verdict === 'PASS' ? '✅ PASS' : '❌ BLOCKED'} (${result.reds} RED, ${result.yellows} YELLOW; N/A, DEFERRED and MANUAL are excluded from the count)`);
  return lines.join('\n');
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const optVal = (n) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : undefined; };
  const stateMod = require('./atlas-state');
  const root = path.resolve(optVal('root') || process.cwd());
  const state = stateMod.loadState({ statePath: optVal('state'), root });
  if (!state) {
    process.stderr.write('gates: no atlas-state.json found. Run: node atlas-state.js init\n');
    process.exit(2);
  }
  const result = await runGates(state, root);
  if (args.includes('--json')) process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  else process.stdout.write(formatGates(result) + '\n');
  if (!args.includes('--no-write')) {
    state.gates = result;
    stateMod.saveState(state, { statePath: optVal('state'), root });
  }
  process.exit(result.verdict === 'PASS' ? 0 : 1);
}

if (require.main === module) main();

module.exports = { runGates, CHECKS };
