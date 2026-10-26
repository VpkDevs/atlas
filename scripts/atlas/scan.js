#!/usr/bin/env node
/**
 * Atlas Scan — the shipped secrets scan (security.md Step 1, as code).
 *
 * Implements the pack's rewritten scan semantics exactly:
 *   · Whole tree, from the root it is pointed at — no directory whitelist,
 *     so keys in pages/api/, server/, scripts/, or root files are in scope.
 *   · Case-insensitive identifier matching (API_KEY, ApiKey, api_key are one hit).
 *   · Both assignment shapes: name = "value" AND name: "value" (object
 *     literals — the most common JS config shape).
 *   · Exclusions are PATH-based only (test/spec/__tests__/fixtures dirs),
 *     never line-content filters — a secret in src/latest.js is still caught.
 *   · Known token prefixes (sk_live_, AKIA…, ghp_, AIza, private-key headers…)
 *     caught even under a meaningless variable name. Round 3 adds the Resend
 *     prefix (re_…) — the audit's example leak: resend: "re_…" in
 *     pages/api/send.js escaped both old scans at once.
 *   · Values are REDACTED in output (first 4 chars + …). A scan report must
 *     never become a second leak.
 *
 * Usage:
 *   node scan.js [--root DIR] [--history] [--json]
 * Exit: 0 = clean · 1 = findings · 2 = usage error.
 * --history additionally scans `git log --all --full-history -p` output
 * (a secret that ever entered history stays compromised until rotated —
 * see security.md's acceptance test for the rotate + purge path).
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const EXCLUDE_DIRS = new Set(['.git', 'node_modules', 'test', 'tests', 'spec', '__tests__', 'fixtures']);
const EXCLUDE_FILES = new Set(['.env.example']);
const INCLUDE_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.py', '.json', '.yml', '.yaml', '.env']);

const IDENT_RE = /(password|passwd|secret|api[-_]?key|apikey|access[-_]?token|auth[-_]?token|private[-_]?key|client[-_]?secret)\s*[:=]\s*['"]([^'"]{8,})['"]/i;
// Token prefixes must start at a token boundary (negative lookbehind): the
// bare `re_` prefix inside a longer identifier — e.g. the string
// 'wire_missing_metric_source' — is not a Resend key.
const PREFIX_RE = /(?<![A-Za-z0-9_])(sk_live_[A-Za-z0-9]{8,}|pk_live_[A-Za-z0-9]{8,}|sk_test_[A-Za-z0-9]{8,}|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|xox[bap]-[A-Za-z0-9-]{10,}|AIza[A-Za-z0-9_-]{10,}|ya29\.[A-Za-z0-9_-]{10,}|re_[A-Za-z0-9_]{16,}|-----BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY-----)/;

function redact(value) {
  return value.length <= 4 ? '…' : value.slice(0, 4) + '…';
}

function scanLine(line) {
  // A value that is pure environment interpolation is not a hardcoded secret.
  const m = line.match(IDENT_RE);
  if (m && !m[2].includes('${')) {
    return { kind: 'identifier', name: m[1], value: redact(m[2]) };
  }
  const p = line.match(PREFIX_RE);
  if (p) return { kind: 'token-prefix', name: p[1].split(/[^A-Za-z0-9]/)[0], value: redact(p[1]) };
  return null;
}

function includedFile(name) {
  if (EXCLUDE_FILES.has(name)) return false;
  if (name === '.env' || name.startsWith('.env.')) return true;
  return INCLUDE_EXTS.has(path.extname(name));
}

function walk(dir, out = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!EXCLUDE_DIRS.has(e.name)) walk(full, out);
    } else if (e.isFile() && includedFile(e.name)) {
      out.push(full);
    }
  }
  return out;
}

function scanTree(root) {
  const findings = [];
  for (const file of walk(root)) {
    let content;
    try { content = fs.readFileSync(file, 'utf8'); } catch { continue; }
    if (content.includes('\0')) continue; // binary
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const hit = scanLine(lines[i]);
      if (hit) findings.push({ file: path.relative(root, file), line: i + 1, ...hit });
    }
  }
  return findings;
}

function scanHistory(root) {
  let out;
  try {
    out = execFileSync('git', ['-C', root, 'log', '--all', '--full-history', '-p', '--no-color'],
      { maxBuffer: 256 * 1024 * 1024, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    return { error: `git history scan failed: ${e.message}` };
  }
  const findings = [];
  const lines = out.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith('+') || lines[i].startsWith('+++')) continue;
    const hit = scanLine(lines[i].slice(1));
    if (hit) findings.push({ file: '(git history)', line: i + 1, ...hit });
  }
  return { findings };
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const optVal = (n) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : undefined; };
  const root = path.resolve(optVal('root') || process.cwd());
  if (!fs.existsSync(root)) {
    process.stderr.write(`scan: root does not exist: ${root}\n`);
    process.exit(2);
  }
  let findings = scanTree(root);
  if (args.includes('--history')) {
    const h = scanHistory(root);
    if (h.error) process.stderr.write(`scan: ${h.error}\n`);
    else findings = findings.concat(h.findings);
  }
  if (args.includes('--json')) {
    process.stdout.write(JSON.stringify({ root, findings, clean: findings.length === 0 }, null, 2) + '\n');
  } else if (findings.length === 0) {
    process.stdout.write(`✅ scan: no hardcoded secrets found in ${root}\n`);
  } else {
    for (const f of findings) {
      process.stdout.write(`❌ ${f.file}:${f.line} — ${f.kind} "${f.name}" = "${f.value}" (redacted)\n`);
    }
    process.stdout.write(`scan: ${findings.length} finding(s). Any hardcoded secret is CRITICAL — move it to an environment variable; if it ever entered git history, rotate it at the provider (security.md Step 1).\n`);
  }
  process.exit(findings.length ? 1 : 0);
}

if (require.main === module) main();

module.exports = { scanTree, scanHistory, scanLine };
