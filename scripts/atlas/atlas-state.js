#!/usr/bin/env node
/**
 * Atlas State — machine-readable project state (atlas-state.json)
 *
 * The single source of truth the Atlas scripts read and write:
 *   score.js  — reads `signals`, writes the computed `score`
 *   gates.js  — reads `product` / `phases` / `applicable_systems`, writes `gates`
 *   pulse.js  — reads state for the deterministic Sovereign Score
 *   decide.js — reads thresholds from atlas.config.json (see autonomy.js)
 *
 * This file is the programmatic companion to ~/.atlas/portfolio/[slug]/context.json:
 * context.json remains the narrative/session state the founder-facing flow uses;
 * atlas-state.json is the measured state the scripts compute from. `/atlas status`
 * is computed from this file (see SKILL.md) — never narrated from memory.
 *
 * Usage (library):  const state = require('./atlas-state');
 * Usage (CLI):
 *   node atlas-state.js init [--root DIR] [--type cli] [--name "My App"]
 *   node atlas-state.js status [--state PATH]
 *   node atlas-state.js get product.type [--state PATH]
 *   node atlas-state.js set phases.8.status complete [--state PATH]
 *   node atlas-state.js path
 *
 * Writes are atomic (tmp file + rename), matching SKILL.md's Atomic Write Protocol.
 */

const fs = require('fs');
const path = require('path');

const PHASE_IDS = ['0', '1', '2', '2b', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'];
const PRODUCT_TYPES = ['web', 'desktop', 'cli', 'library', 'mobile'];

function defaultState() {
  const phases = {};
  for (const id of PHASE_IDS) phases[id] = { status: 'pending' };
  return {
    schema_version: 1,
    product: {
      name: '',
      slug: '',
      type: 'web',            // web | desktop | cli | library | mobile (EC-17)
      production_url: null,   // web products only
      artifact_path: null,    // non-web: path to the built artifact / entry point
      smoke_command: null,    // non-web: command that proves a clean launch (exit 0)
      rollback_path: null,    // path to rollback script or previous-release artifact
      launched: false,
    },
    phases,
    applicable_systems: { auth: true, payments: true, email: true },
    autonomy: { tier: 0, dry_run: true },
    signals: {},
    score: { total: null, earnable: null, floor: null, floor_met: null, computed_at: null, breakdown: null, history: [] },
    gates: { ran_at: null, verdict: null, checks: [] },
    updated_at: null,
  };
}

function resolveStatePath(opts = {}) {
  if (opts.statePath) return path.resolve(opts.statePath);
  if (process.env.ATLAS_STATE) return path.resolve(process.env.ATLAS_STATE);
  const root = opts.root ? path.resolve(opts.root) : process.cwd();
  return path.join(root, 'atlas-state.json');
}

function loadState(opts = {}) {
  const p = resolveStatePath(opts);
  try {
    const raw = fs.readFileSync(p, 'utf8');
    const parsed = JSON.parse(raw);
    // Merge over defaults so older/partial files gain new sections deterministically.
    const merged = Object.assign(defaultState(), parsed);
    merged.product = Object.assign(defaultState().product, parsed.product || {});
    merged.autonomy = Object.assign(defaultState().autonomy, parsed.autonomy || {});
    merged.applicable_systems = Object.assign(defaultState().applicable_systems, parsed.applicable_systems || {});
    return merged;
  } catch {
    return null;
  }
}

function saveState(state, opts = {}) {
  const p = resolveStatePath(opts);
  state.updated_at = new Date().toISOString();
  const tmp = p + '.tmp';
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2) + '\n');
  fs.renameSync(tmp, p);
  return p;
}

function getPath(obj, dotted) {
  return dotted.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}

function setPath(obj, dotted, value) {
  const keys = dotted.split('.');
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (cur[keys[i]] == null || typeof cur[keys[i]] !== 'object') cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
}

function summarize(state) {
  if (!state) return 'No atlas-state.json found. Run: node scripts/atlas/atlas-state.js init';
  const done = PHASE_IDS.filter(id => state.phases?.[id]?.status === 'complete');
  const active = PHASE_IDS.filter(id => state.phases?.[id]?.status === 'active');
  const blocked = PHASE_IDS.filter(id => state.phases?.[id]?.status === 'blocked');
  const s = state.score || {};
  const lines = [];
  lines.push(`Product: ${state.product.name || '(unnamed)'} [${state.product.type}]${state.product.launched ? ' — launched' : ' — pre-launch'}`);
  lines.push(`Phases: ${done.length}/${PHASE_IDS.length} complete` +
    (active.length ? ` | active: ${active.join(', ')}` : '') +
    (blocked.length ? ` | blocked: ${blocked.join(', ')}` : ''));
  if (s.total != null) {
    lines.push(`Sovereign Score: ${s.total}/100 (earnable ${s.earnable}, launch floor ${s.floor} — ${s.floor_met ? 'MET' : 'NOT MET'}) as of ${s.computed_at}`);
  } else {
    lines.push('Sovereign Score: not computed yet — run: node scripts/atlas/score.js');
  }
  if (state.gates?.verdict) {
    const g = state.gates;
    const reds = g.checks.filter(c => c.status === 'RED').length;
    lines.push(`Pre-flight gates: ${g.verdict} (${reds} RED) as of ${g.ran_at} — node scripts/atlas/gates.js`);
  } else {
    lines.push('Pre-flight gates: not run yet — run: node scripts/atlas/gates.js');
  }
  lines.push(`Autonomy: tier ${state.autonomy.tier}, dry-run ${state.autonomy.dry_run ? 'ON' : 'OFF'} (founder-set; see autonomy.js)`);
  return lines.join('\n');
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

function parseFlags(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) flags[key] = argv[++i];
      else flags[key] = true;
    } else positional.push(argv[i]);
  }
  return { flags, positional };
}

function main() {
  const { flags, positional } = parseFlags(process.argv.slice(2));
  const cmd = positional[0] || 'status';
  const opts = { statePath: flags.state, root: flags.root };

  if (cmd === 'path') {
    process.stdout.write(resolveStatePath(opts) + '\n');
    return;
  }
  if (cmd === 'init') {
    const existing = loadState(opts);
    if (existing && !flags.force) {
      process.stderr.write('atlas-state.json already exists (use --force to overwrite).\n');
      process.exit(2);
    }
    const st = defaultState();
    if (flags.type) {
      if (!PRODUCT_TYPES.includes(flags.type)) {
        process.stderr.write(`Unknown product type "${flags.type}" (expected: ${PRODUCT_TYPES.join(', ')})\n`);
        process.exit(2);
      }
      st.product.type = flags.type;
    }
    if (flags.name) st.product.name = flags.name;
    if (flags.url) st.product.production_url = flags.url;
    const p = saveState(st, opts);
    process.stdout.write(`Initialized ${p}\n`);
    return;
  }
  const state = loadState(opts);
  if (!state) {
    process.stderr.write('No atlas-state.json found. Run: node atlas-state.js init\n');
    process.exit(2);
  }
  if (cmd === 'status') {
    process.stdout.write(summarize(state) + '\n');
  } else if (cmd === 'get') {
    const v = getPath(state, positional[1] || '');
    process.stdout.write((typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)) + '\n');
  } else if (cmd === 'set') {
    let value = positional[2];
    try { value = JSON.parse(value); } catch { /* keep as string */ }
    setPath(state, positional[1], value);
    saveState(state, opts);
    process.stdout.write(`Set ${positional[1]} = ${JSON.stringify(value)}\n`);
  } else {
    process.stderr.write(`Unknown command "${cmd}" (init|status|get|set|path)\n`);
    process.exit(2);
  }
}

if (require.main === module) main();

module.exports = { defaultState, loadState, saveState, resolveStatePath, summarize, getPath, setPath, PHASE_IDS, PRODUCT_TYPES };
