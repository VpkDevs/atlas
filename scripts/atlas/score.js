#!/usr/bin/env node
/**
 * Atlas Score — deterministic Sovereign Score computation.
 *
 * The Sovereign Score has exactly ONE rubric (SKILL.md, "Sovereign Score
 * (v6 — Recalibrated)"). This script is that rubric as code: it computes the
 * score from measurable signals only — test results, file presence, git and
 * config state — with NO language-model judgment anywhere in the number.
 * Same signals in → same score out, on every machine, every run.
 *
 * Signals live in atlas-state.json (`signals`) or a standalone JSON file
 * (--signals). Each rubric sub-check reads one signal:
 *   true          → earns its full weight
 *   false         → earns 0 (the check applies; it just isn't true yet)
 *   null / "n/a"  → not applicable: excluded from the category denominator
 *   absent        → earns 0 (unmeasured is not earned)
 * A category score = max × (earned weight ÷ applicable weight).
 * A whole category is excluded when signals.categories.<id>.applicable === false,
 * or when every sub-check in it is N/A.
 *
 * Launch floor (automation-handoff.md, implemented verbatim):
 *   floor = ⌈60% of the points earnable before launch⌉.
 *   The pre-launch earnable set is the 7 categories earnable before launch
 *   (Code & Deployment 15, Monitoring 10, Email 10, Support 10, Content 10,
 *   Social 5, Documentation 5 = 65). Active Acquisition, Iteration Loop, and
 *   Economic Sovereignty are NOT earnable pre-launch (Acquisition needs a
 *   launched product; Iteration is Phase 13's cycle; Economic Sovereignty's
 *   payment part is [LOCKED: pre-revenue]). Worked example: full earnable set
 *   → floor = ⌈0.6 × 65⌉ = 39 of 65. Categories a product doesn't have drop
 *   out and the floor recomputes. After launch, when all 10 categories are
 *   earnable, the absolute benchmarks apply: 60 floor / 80 sustained / 90 sovereign.
 *
 * Usage:
 *   node score.js [--state PATH] [--signals FILE] [--root DIR] [--json] [--no-write]
 * Exit: 0 = computed; 2 = usage/state error. (The score itself is data, not a gate —
 * gates.js is the gating script. score.js exits 0 even below the floor.)
 */

const fs = require('fs');
const path = require('path');

// ─── The canonical rubric, as data ────────────────────────────────────────────
// kind 'bool': signal true earns the weight. kind 'scaled': a numeric signal
// earns weight × min(value, target) / target (e.g. days of content scheduled).

const RUBRIC = [
  { id: 'code_deployment', name: 'Code & Deployment', max: 15, prelaunch: true, checks: [
    { signal: 'tests_all_pass', weight: 5, label: 'Full test suite passes (and exists)' },
    { signal: 'zero_p0_bugs', weight: 3, label: 'Zero open P0 bugs' },
    { signal: 'ci_green', weight: 3, label: 'CI green on the main branch' },
    { signal: 'deployed', weight: 2, label: 'Deployment / release path works' },
    { signal: 'health_check_live', weight: 1, label: 'Health check live (EC-17: smoke check for non-web)' },
    { signal: 'runbook_present', weight: 1, label: 'RUNBOOK committed' },
  ]},
  { id: 'monitoring', name: 'Monitoring & Alerting', max: 10, prelaunch: true, checks: [
    { signal: 'uptime_monitor', weight: 4, label: 'Uptime monitoring active (EC-17: crash reporting)' },
    { signal: 'error_alerting', weight: 3, label: 'Error alerts firing to a real channel' },
    { signal: 'revenue_alerting', weight: 3, label: 'Revenue alerts firing (null = pre-revenue, excluded)' },
  ]},
  { id: 'email', name: 'Email Automation', max: 10, prelaunch: true, checks: [
    { signal: 'welcome_sequence_live', weight: 4, label: 'Welcome sequence live (copy + trigger code + verified test send)' },
    { signal: 'activation_sequence_live', weight: 3, label: 'Activation sequence live' },
    { signal: 'retention_sequence_live', weight: 3, label: 'Retention sequence live' },
  ]},
  { id: 'support', name: 'Support Automation', max: 10, prelaunch: true, checks: [
    { signal: 'faq_live', weight: 4, label: 'Top-20 FAQ live' },
    { signal: 'auto_responder', weight: 3, label: 'Auto-responder active' },
    { signal: 'ticket_routing', weight: 3, label: 'Ticket routing configured' },
  ]},
  { id: 'acquisition', name: 'Active Acquisition Channel', max: 15, prelaunch: false, checks: [
    { signal: 'channel_measurable_traffic', weight: 8, label: '≥1 channel producing measurable traffic' },
    { signal: 'channel_runs_unprompted', weight: 7, label: 'Channel produces without daily founder input' },
  ]},
  { id: 'content', name: 'Content Engine', max: 10, prelaunch: true, checks: [
    { signal: 'content_days_scheduled', weight: 5, kind: 'scaled', target: 30, label: 'Days of content scheduled (target 30)' },
    { signal: 'content_generation_cycle', weight: 5, label: 'Recurring generation cycle running' },
  ]},
  { id: 'iteration', name: 'Iteration Loop', max: 10, prelaunch: false, checks: [
    { signal: 'weekly_cycles_completed', weight: 10, kind: 'scaled', target: 4, label: 'Weekly measure→decide→act→ship cycles completed (target 4)' },
  ]},
  { id: 'economic_sovereignty', name: 'Economic Sovereignty', max: 10, prelaunch: false, checks: [
    { signal: 'automated_pl', weight: 4, label: 'Automated P&L reporting' },
    { signal: 'tax_reserve', weight: 3, label: 'Tax reserve automated' },
    { signal: 'credits_managed', weight: 3, label: 'Startup credits tracked and managed' },
  ]},
  { id: 'social', name: 'Social Presence', max: 5, prelaunch: true, checks: [
    { signal: 'engagement_active', weight: 5, label: 'Real-time community engagement (replies, not just posts)' },
  ]},
  { id: 'documentation', name: 'Documentation', max: 5, prelaunch: true, checks: [
    { signal: 'runbook_complete', weight: 2, label: 'RUNBOOK complete (ops procedures, not just present)' },
    { signal: 'contractor_onboarding', weight: 2, label: 'Contractor onboarding doc exists' },
    { signal: 'investor_template', weight: 1, label: 'Investor update template exists' },
  ]},
];

// Derive boolean signals from raw counts when the raw counts are supplied.
function deriveSignals(signals) {
  const s = Object.assign({}, signals);
  if (s.tests_all_pass === undefined && typeof s.tests_total === 'number' && typeof s.tests_passed === 'number') {
    s.tests_all_pass = s.tests_total > 0 && s.tests_passed === s.tests_total;
  }
  if (s.zero_p0_bugs === undefined && typeof s.p0_bugs === 'number') {
    s.zero_p0_bugs = s.p0_bugs === 0;
  }
  return s;
}

function isNA(v) { return v === null || v === 'n/a' || v === 'na'; }

function computeScore(signals = {}, opts = {}) {
  const sig = deriveSignals(signals);
  const launched = !!opts.launched;
  const catOverrides = sig.categories || {};

  const breakdown = [];
  let total = 0;
  let earnableMax = 0;

  for (const cat of RUBRIC) {
    const override = catOverrides[cat.id] || {};
    let applicableWeight = 0;
    let earnedWeight = 0;
    const rows = [];
    for (const chk of cat.checks) {
      const v = sig[chk.signal];
      if (isNA(v)) { rows.push({ ...chk, value: v, earned: null }); continue; }
      applicableWeight += chk.weight;
      let earned = 0;
      if (chk.kind === 'scaled') {
        const n = typeof v === 'number' ? v : 0;
        earned = chk.weight * Math.min(Math.max(n, 0), chk.target) / chk.target;
      } else {
        earned = v === true ? chk.weight : 0;
      }
      earnedWeight += earned;
      rows.push({ ...chk, value: v === undefined ? '(absent)' : v, earned: Math.round(earned * 100) / 100 });
    }
    // A category is applicable unless explicitly disabled or every check is N/A.
    const applicable = override.applicable !== false && applicableWeight > 0;
    const score = applicable ? cat.max * (earnedWeight / applicableWeight) : 0;
    // Earnable set: pre-launch, only prelaunch categories count. Post-launch, all count.
    const earnable = applicable && (launched || cat.prelaunch);
    if (earnable) earnableMax += cat.max;
    if (applicable) total += score;
    breakdown.push({
      id: cat.id, name: cat.name, max: cat.max,
      applicable, earnable_prelaunch: cat.prelaunch, in_earnable_set: earnable,
      score: Math.round(score * 100) / 100, checks: rows,
    });
  }

  total = Math.round(total * 100) / 100;
  // Floor rule: post-launch with the full rubric earnable → absolute 60.
  // Otherwise 60% of the currently-earnable maximum.
  const floor = (launched && earnableMax >= 100) ? 60 : Math.ceil(0.6 * earnableMax);
  return {
    total,
    earnable: earnableMax,
    floor,
    floor_met: total >= floor,
    launched,
    benchmarks: { launch_floor: floor, sustained: 80, sovereign: 90 },
    breakdown,
  };
}

function formatBreakdown(result) {
  const lines = [];
  lines.push('Sovereign Score — computed by scripts/atlas/score.js (deterministic; no judgment in the number)');
  lines.push('');
  for (const c of result.breakdown) {
    const tag = !c.applicable ? 'N/A (excluded)' : c.in_earnable_set ? '' : ' (not earnable pre-launch)';
    lines.push(`${c.name}: ${c.applicable ? c.score : '—'}/${c.max}${tag}`);
    for (const r of c.checks) {
      if (r.earned === null) lines.push(`  · ${r.label} — n/a`);
      else lines.push(`  · ${r.label} — ${r.earned}/${r.weight}`);
    }
  }
  lines.push('');
  lines.push(`TOTAL: ${result.total}/100`);
  lines.push(`Earnable now: ${result.earnable} | Launch floor: ${result.floor} — ${result.floor_met ? '✅ MET' : '❌ NOT MET'}`);
  lines.push(`Benchmarks: floor ${result.benchmarks.launch_floor} · sustained 80 · sovereign 90`);
  return lines.join('\n');
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const flag = (name) => args.includes('--' + name);
  const optVal = (name) => {
    const i = args.indexOf('--' + name);
    return i >= 0 ? args[i + 1] : undefined;
  };
  let stateMod;
  try { stateMod = require('./atlas-state'); } catch {}
  const state = stateMod ? stateMod.loadState({ statePath: optVal('state'), root: optVal('root') }) : null;

  let signals = (state && state.signals) || {};
  if (optVal('signals')) {
    try { signals = JSON.parse(fs.readFileSync(optVal('signals'), 'utf8')); }
    catch (e) { process.stderr.write(`Cannot read signals file: ${e.message}\n`); process.exit(2); }
  }
  const launched = state ? !!state.product.launched : flag('launched');
  const result = computeScore(signals, { launched });

  if (flag('json')) process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  else process.stdout.write(formatBreakdown(result) + '\n');

  if (state && stateMod && !flag('no-write')) {
    state.signals = signals;
    const prev = state.score.total;
    state.score = {
      total: result.total, earnable: result.earnable, floor: result.floor,
      floor_met: result.floor_met, computed_at: new Date().toISOString(),
      breakdown: result.breakdown,
      history: [...(state.score.history || []), { total: result.total, at: new Date().toISOString() }].slice(-52),
    };
    if (prev != null && prev !== result.total) {
      process.stderr.write(`[score] ${prev} → ${result.total} (Δ ${result.total - prev > 0 ? '+' : ''}${Math.round((result.total - prev) * 100) / 100})\n`);
    }
    stateMod.saveState(state, { statePath: optVal('state'), root: optVal('root') });
  }
  process.exit(0);
}

if (require.main === module) main();

module.exports = { computeScore, RUBRIC, deriveSignals };
