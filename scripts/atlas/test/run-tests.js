#!/usr/bin/env node
/**
 * Atlas script tests — plain node, no dependencies.
 * Run: node scripts/atlas/test/run-tests.js   (or: npm run test:scripts)
 *
 * Covers: score.js determinism + the automation-handoff worked example
 * (floor 39 of 65), category N/A recompute, post-launch absolute floor;
 * gates.js exit codes + N/A / DEFERRED / EC-17 routing on fixtures;
 * scan.js catches the round-2 audit shapes (object literal in pages/api/,
 * secret in src/latest.js, Resend re_ key) and honors path exclusions;
 * autonomy.js tier gating (tiers 0/1 refuse PR creation), hard lines at
 * tier 3, dry-run default, and the append-only actions log.
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { spawnSync } = require('child_process');

const ATLAS = path.join(__dirname, '..');
const { computeScore } = require(path.join(ATLAS, 'score'));
const { scanTree } = require(path.join(ATLAS, 'scan'));
const { runGates } = require(path.join(ATLAS, 'gates'));
const autonomy = require(path.join(ATLAS, 'autonomy'));
const stateMod = require(path.join(ATLAS, 'atlas-state'));

let passed = 0, failed = 0;
const failures = [];
async function test(name, fn) {
  try { await fn(); passed++; console.log(`  ✅ ${name}`); }
  catch (e) { failed++; failures.push(`${name}: ${e.message}`); console.log(`  ❌ ${name}: ${e.message}`); }
}
function tmpdir(prefix) { return fs.mkdtempSync(path.join(os.tmpdir(), prefix)); }
function write(root, rel, content) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
  return p;
}
function cli(script, args, opts = {}) {
  return spawnSync(process.execPath, [path.join(ATLAS, script), ...args],
    { encoding: 'utf8', cwd: opts.cwd, env: { ...process.env, ...(opts.env || {}) }, timeout: 60000 });
}

const FULL_PRELAUNCH = {
  tests_all_pass: true, zero_p0_bugs: true, ci_green: true, deployed: true,
  health_check_live: true, runbook_present: true,
  uptime_monitor: true, error_alerting: true, revenue_alerting: null,
  welcome_sequence_live: true, activation_sequence_live: true, retention_sequence_live: true,
  faq_live: true, auto_responder: true, ticket_routing: true,
  content_days_scheduled: 30, content_generation_cycle: true,
  engagement_active: true,
  runbook_complete: true, contractor_onboarding: true, investor_template: true,
};

async function main() {
  console.log('\n── score.js');
  await test('worked example: full pre-launch earnable set → total 65, earnable 65, floor 39, met', () => {
    const r = computeScore(FULL_PRELAUNCH, { launched: false });
    assert.strictEqual(r.earnable, 65);
    assert.strictEqual(r.floor, 39);
    assert.strictEqual(r.total, 65);
    assert.strictEqual(r.floor_met, true);
  });
  await test('determinism: identical signals → identical result, twice', () => {
    const a = computeScore(FULL_PRELAUNCH, { launched: false });
    const b = computeScore(JSON.parse(JSON.stringify(FULL_PRELAUNCH)), { launched: false });
    assert.deepStrictEqual(a, b);
  });
  await test('honest partial run lands below the floor (code-only → 15 < 39)', () => {
    const r = computeScore({
      tests_all_pass: true, zero_p0_bugs: true, ci_green: true, deployed: true,
      health_check_live: true, runbook_present: true,
    }, { launched: false });
    assert.strictEqual(r.total, 15);
    assert.strictEqual(r.floor_met, false);
  });
  await test('category N/A drops out and the floor recomputes (email off → 55 earnable, floor 33)', () => {
    const r = computeScore({ ...FULL_PRELAUNCH, categories: { email: { applicable: false } } }, { launched: false });
    assert.strictEqual(r.earnable, 55);
    assert.strictEqual(r.floor, 33);
  });
  await test('sub-check N/A leaves the category denominator (revenue_alerting null → monitoring still earnable at full)', () => {
    const mon = computeScore(FULL_PRELAUNCH, { launched: false }).breakdown.find(c => c.id === 'monitoring');
    assert.strictEqual(mon.score, 10);
    assert.strictEqual(mon.applicable, true);
  });
  await test('post-launch with full rubric earnable → absolute floor 60', () => {
    const r = computeScore({ ...FULL_PRELAUNCH }, { launched: true });
    assert.strictEqual(r.earnable, 100);
    assert.strictEqual(r.floor, 60);
  });
  await test('raw counts derive booleans (tests 12/12 + 0 P0s → code 8/15)', () => {
    const r = computeScore({ tests_total: 12, tests_passed: 12, p0_bugs: 0 }, { launched: false });
    assert.strictEqual(r.breakdown.find(c => c.id === 'code_deployment').score, 8);
    const r2 = computeScore({ tests_total: 12, tests_passed: 9, p0_bugs: 2 }, { launched: false });
    assert.strictEqual(r2.breakdown.find(c => c.id === 'code_deployment').score, 0);
  });
  await test('scaled checks scale (15 days scheduled → 2.5 of 5)', () => {
    const r = computeScore({ content_days_scheduled: 15 }, { launched: false });
    assert.strictEqual(r.breakdown.find(c => c.id === 'content').score, 2.5);
  });
  await test('absent signals score 0 — unmeasured is not earned', () => {
    const r = computeScore({}, { launched: false });
    assert.strictEqual(r.total, 0);
    assert.strictEqual(r.floor_met, false);
  });

  console.log('\n── scan.js');
  const scanRoot = tmpdir('atlas-scan-');
  write(scanRoot, 'pages/api/send.js', 'const cfg = { apiKey: "hardcoded-value-123456" };\nmodule.exports = cfg;\n');
  write(scanRoot, 'src/latest.js', 'const PASSWORD = "hunter2-hunter2";\n');
  write(scanRoot, 'src/app.js', 'const key = process.env.APP_KEY;\nconsole.log("clean");\n');
  write(scanRoot, 'lib/pay.js', 'const resend = "re_AbCdEfGh12345678";\n');
  write(scanRoot, 'tests/fixture.js', 'const api_key = "test-fixture-value-123";\n');
  write(scanRoot, '.env.example', 'API_KEY=your-key-here-123456\n');
  const findings = scanTree(scanRoot);
  await test('catches the object-literal shape in pages/api/ (round-2 audit example)', () => {
    assert.ok(findings.some(f => f.file === path.join('pages', 'api', 'send.js')), JSON.stringify(findings));
  });
  await test('catches a secret in src/latest.js (path exclusions, never line filters)', () => {
    assert.ok(findings.some(f => f.file === path.join('src', 'latest.js')));
  });
  await test('catches the Resend re_ prefix under a generic name', () => {
    assert.ok(findings.some(f => f.file === path.join('lib', 'pay.js')));
  });
  await test('path-excluded test fixtures and .env.example are not flagged', () => {
    assert.ok(!findings.some(f => f.file.includes('fixture') || f.file.includes('.env.example')), JSON.stringify(findings));
  });
  await test('no false positive: re_ inside a longer identifier is not a Resend key', () => {
    const r2 = tmpdir('atlas-scan-fp-');
    write(r2, 'decide.js', "const action = 'wire_missing_metric_source';\n");
    assert.deepStrictEqual(scanTree(r2), []);
  });
  await test('clean file produces no finding; output redacts values', () => {
    assert.ok(!findings.some(f => f.file === path.join('src', 'app.js')));
    assert.ok(findings.every(f => !JSON.stringify(f).includes('hunter2-hunter2')));
  });
  await test('CLI exit codes: 1 with findings, 0 clean', () => {
    assert.strictEqual(cli('scan.js', ['--root', scanRoot]).status, 1);
    const cleanRoot = tmpdir('atlas-scan-clean-');
    write(cleanRoot, 'index.js', 'const x = 1;\n');
    assert.strictEqual(cli('scan.js', ['--root', cleanRoot]).status, 0);
  });

  console.log('\n── gates.js');
  // Local HTTP server fixture for the web checks.
  const server = http.createServer((req, res) => {
    if (req.url === '/api/health') { res.writeHead(200, { 'content-type': 'application/json' }); res.end('{"status":"ok"}'); }
    else if (req.url === '/terms' || req.url === '/privacy') { res.writeHead(200); res.end('x'.repeat(600)); }
    else { res.writeHead(200, { 'strict-transport-security': 'max-age=1', 'x-content-type-options': 'nosniff', 'content-security-policy': "default-src 'self'" }); res.end('x'.repeat(2048)); }
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;

  function baseState(overrides = {}) {
    const st = stateMod.defaultState();
    Object.assign(st.product, overrides.product || {});
    Object.assign(st.applicable_systems, overrides.systems || {});
    if (overrides.phases) for (const [k, v] of Object.entries(overrides.phases)) st.phases[k].status = v;
    return st;
  }

  await test('web product, healthy local server, Phase 8 not run → PASS, checks 6–8 DEFERRED, 3/4 MANUAL', async () => {
    const st = baseState({ product: { type: 'web', production_url: `http://127.0.0.1:${port}` } });
    const root = tmpdir('atlas-gates-web-');
    write(root, 'scripts/rollback.sh', '#!/bin/sh\ntrue\n');
    const r = await runGates(st, root);
    assert.strictEqual(r.verdict, 'PASS', JSON.stringify(r.checks, null, 1));
    const byId = Object.fromEntries(r.checks.map(c => [c.id, c.status]));
    assert.strictEqual(byId.email_delivery, 'DEFERRED');
    assert.strictEqual(byId.error_monitoring, 'DEFERRED');
    assert.strictEqual(byId.uptime_monitoring, 'DEFERRED');
    assert.strictEqual(byId.auth_flow, 'MANUAL');
    assert.strictEqual(byId.responsive, 'GREEN');
  });
  await test('web product, server down → BLOCKED with RED on responsive, exit code path is verdict-driven', async () => {
    const st = baseState({ product: { type: 'web', production_url: 'http://127.0.0.1:1' } });
    const r = await runGates(st, tmpdir('atlas-gates-down-'));
    assert.strictEqual(r.verdict, 'BLOCKED');
    assert.ok(r.reds >= 1);
  });
  await test('N/A rule: no-auth / no-payments / no-email product excludes checks 3, 4, 6 from the count', async () => {
    const st = baseState({
      product: { type: 'web', production_url: `http://127.0.0.1:${port}` },
      systems: { auth: false, payments: false, email: false },
    });
    const root = tmpdir('atlas-gates-na-');
    write(root, 'scripts/rollback.sh', '#!/bin/sh\ntrue\n');
    const r = await runGates(st, root);
    const byId = Object.fromEntries(r.checks.map(c => [c.id, c.status]));
    assert.strictEqual(byId.auth_flow, 'N/A');
    assert.strictEqual(byId.payment_flow, 'N/A');
    assert.strictEqual(byId.email_delivery, 'N/A');
    assert.strictEqual(r.verdict, 'PASS');
  });
  await test('DEFERRED expires: Phase 8 complete but no monitoring evidence → checks 7/8 run for real and go RED', async () => {
    const st = baseState({
      product: { type: 'web', production_url: `http://127.0.0.1:${port}` },
      phases: { '8': 'complete' },
    });
    st.signals = {};
    const r = await runGates(st, tmpdir('atlas-gates-p8-'));
    const byId = Object.fromEntries(r.checks.map(c => [c.id, c.status]));
    assert.strictEqual(byId.error_monitoring, 'RED');
    assert.strictEqual(byId.uptime_monitoring, 'RED');
    assert.strictEqual(r.verdict, 'BLOCKED');
  });
  await test('EC-17: CLI product routes via smoke command; web-only checks go N/A', async () => {
    const st = baseState({ product: { type: 'cli', smoke_command: 'node -e "process.exit(0)"' }, systems: { auth: false, payments: false, email: false } });
    const root = tmpdir('atlas-gates-cli-');
    write(root, 'docs/legal/TERMS_OF_SERVICE.md', '# Terms\n');
    write(root, 'docs/legal/PRIVACY_POLICY.md', '# Privacy\n');
    write(root, 'scripts/rollback.sh', '#!/bin/sh\ntrue\n');
    const r = await runGates(st, root);
    const byId = Object.fromEntries(r.checks.map(c => [c.id, c.status]));
    assert.strictEqual(byId.responsive, 'GREEN', JSON.stringify(r.checks));
    assert.strictEqual(byId.healthcheck, 'N/A');
    assert.strictEqual(byId.security_headers, 'N/A');
    assert.strictEqual(byId.legal_pages, 'GREEN');
    assert.strictEqual(r.verdict, 'PASS');
  });
  await test('EC-17: failing smoke command → RED on check 1, verdict BLOCKED', async () => {
    const st = baseState({ product: { type: 'cli', smoke_command: 'node -e "process.exit(3)"' } });
    const r = await runGates(st, tmpdir('atlas-gates-cli2-'));
    assert.strictEqual(r.checks.find(c => c.id === 'responsive').status, 'RED');
    assert.strictEqual(r.verdict, 'BLOCKED');
  });
  await test('gates CLI exit codes: 0 on PASS fixture, 1 on BLOCKED fixture', async () => {
    const root = tmpdir('atlas-gates-cli-');
    const st = baseState({ product: { type: 'cli', smoke_command: 'node -e "process.exit(0)"' }, systems: { auth: false, payments: false, email: false } });
    write(root, 'docs/legal/TERMS_OF_SERVICE.md', '# Terms\n');
    write(root, 'docs/legal/PRIVACY_POLICY.md', '# Privacy\n');
    write(root, 'scripts/rollback.sh', '#!/bin/sh\ntrue\n');
    stateMod.saveState(st, { root });
    assert.strictEqual(cli('gates.js', [], { cwd: root }).status, 0);
    const st2 = baseState({ product: { type: 'cli', smoke_command: 'node -e "process.exit(1)"' } });
    stateMod.saveState(st2, { root });
    assert.strictEqual(cli('gates.js', [], { cwd: root }).status, 1);
  });
  server.close();

  console.log('\n── autonomy.js + actions log');
  await test('defaults: tier 0, dry-run ON', () => {
    const cfg = autonomy.loadConfig(tmpdir('atlas-auto-'));
    assert.strictEqual(cfg.tier, 0);
    assert.strictEqual(cfg.dry_run, true);
  });
  await test('tier gating: tiers 0 and 1 refuse open_pr; tier 2 allows it', () => {
    assert.strictEqual(autonomy.can('open_pr', { tier: 0, dry_run: true }).allowed, false);
    assert.strictEqual(autonomy.can('open_pr', { tier: 1, dry_run: true }).allowed, false);
    assert.strictEqual(autonomy.can('open_pr', { tier: 2, dry_run: false }).allowed, true);
    assert.strictEqual(autonomy.can('commit', { tier: 1, dry_run: true }).allowed, true);
    assert.strictEqual(autonomy.can('commit', { tier: 0, dry_run: true }).allowed, false);
  });
  await test('hard lines refuse at tier 3: spend, post_public, message_person, deploy_production, delete, force_push', () => {
    const cfg = { tier: 3, dry_run: false };
    for (const a of ['spend', 'post_public', 'message_person', 'deploy_production', 'delete', 'force_push']) {
      assert.strictEqual(autonomy.can(a, cfg).allowed, false, a);
    }
  });
  await test('unknown actions refuse', () => {
    assert.strictEqual(autonomy.can('launch_missiles', { tier: 3, dry_run: false }).allowed, false);
  });
  await test('actions log appends JSONL with the required fields', () => {
    const dir = tmpdir('atlas-log-');
    const logPath = path.join(dir, 'atlas-actions.jsonl');
    autonomy.logAction({ action: 'commit', target: 'file.js', result: 'ok', revert: 'git revert abc' }, { logPath, config: { tier: 1, dry_run: false } });
    autonomy.logAction({ action: 'open_pr', target: 'b', result: 'refused', reason: 'tier' }, { logPath, config: { tier: 1, dry_run: false } });
    const lines = autonomy.readLog({ logPath });
    assert.strictEqual(lines.length, 2);
    for (const l of lines) {
      assert.ok(l.ts && typeof l.tier === 'number' && l.action && l.result !== undefined && 'revert' in l);
    }
    assert.strictEqual(lines[0].revert, 'git revert abc');
  });
  await test('open_pr.js refuses PR creation at tier 1 (subprocess, --pr): falls back, logs refusal', () => {
    const dir = tmpdir('atlas-openpr-');
    write(dir, 'pulse.json', JSON.stringify({ timestamp: new Date().toISOString(), week_index: 1, metrics: {}, anomalies: [], data_gaps: [] }));
    const r = cli('open_pr.js', ['pulse.json', '--pr', '--branch', 'atlas/test', '--title', 'x'],
      { cwd: dir, env: { ATLAS_TIER: '1', ATLAS_ACTIONS_LOG: path.join(dir, 'log.jsonl') } });
    assert.strictEqual(r.status, 0, r.stderr);
    const lines = autonomy.readLog({ logPath: path.join(dir, 'log.jsonl') });
    assert.ok(lines.some(l => l.action === 'open_pr' && l.result === 'refused'), JSON.stringify(lines));
  });
  await test('open_pr.js at tier 2 with dry-run ON plans the PR and creates nothing', () => {
    const dir = tmpdir('atlas-openpr2-');
    write(dir, 'pulse.json', JSON.stringify({ timestamp: new Date().toISOString(), week_index: 1, metrics: {}, anomalies: [], data_gaps: [] }));
    const r = cli('open_pr.js', ['pulse.json', '--pr', '--branch', 'atlas/test', '--title', 'x'],
      { cwd: dir, env: { ATLAS_TIER: '2', ATLAS_DRY_RUN: '1', ATLAS_ACTIONS_LOG: path.join(dir, 'log.jsonl') } });
    assert.strictEqual(r.status, 0, r.stderr);
    assert.ok((r.stdout + r.stderr).includes('DRY RUN'), r.stdout + r.stderr);
    const lines = autonomy.readLog({ logPath: path.join(dir, 'log.jsonl') });
    assert.ok(lines.some(l => l.action === 'open_pr' && l.result === 'dry_run'), JSON.stringify(lines));
  });

  console.log('\n── atlas-state.js');
  await test('state round-trips through save/load and status summarizes it', () => {
    const dir = tmpdir('atlas-state-');
    const st = stateMod.defaultState();
    st.product.name = 'Round Trip';
    st.product.type = 'cli';
    stateMod.saveState(st, { root: dir });
    const back = stateMod.loadState({ root: dir });
    assert.strictEqual(back.product.name, 'Round Trip');
    assert.ok(stateMod.summarize(back).includes('Round Trip'));
  });
  await test('score CLI writes the computed score into state', () => {
    const dir = tmpdir('atlas-scorecli-');
    const st = stateMod.defaultState();
    st.signals = { ...FULL_PRELAUNCH };
    stateMod.saveState(st, { root: dir });
    const r = cli('score.js', [], { cwd: dir });
    assert.strictEqual(r.status, 0, r.stderr);
    const back = stateMod.loadState({ root: dir });
    assert.strictEqual(back.score.total, 65);
    assert.strictEqual(back.score.floor, 39);
  });

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Script tests: ${passed} passed, ${failed} failed`);
  if (failures.length) { console.log('\nFailures:'); failures.forEach(f => console.log('  ✗ ' + f)); }
  process.exit(failed ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
