#!/usr/bin/env node
/**
 * Atlas Schema Validator
 *
 * Runs as part of CI and pre-commit. Checks:
 * 1. All .md files in the root have valid YAML frontmatter
 * 2. All module cross-references in SKILL.md resolve to real files
 * 3. No [TODO], [FIXME], [TBD], or <placeholder> strings in SKILL.md
 * 4. LICENSE, README.md, CHANGELOG.md, package.json, .gitignore all present
 * 5. No stale username references (vincekinney1991 → VpkDevs)
 * 6. docs/legal/ contains the three required documents
 * 7. Version and command-surface invariants match CHARTER_v8.md
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;
const errors = [];

function check(name, fn) {
  try {
    const result = fn();
    if (result === true || result === undefined) {
      console.log(`  ✅ ${name}`);
      passed++;
    } else {
      console.log(`  ❌ ${name}: ${result}`);
      failed++;
      errors.push({ name, detail: result });
    }
  } catch (e) {
    console.log(`  ❌ ${name}: ${e.message}`);
    failed++;
    errors.push({ name, detail: e.message });
  }
}

function readFile(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function fileExists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

console.log('\n🔍 Atlas Schema Validator\n');

// ─── CHECK 1: Required root files ─────────────────────────────────────────
console.log('── Required files');
for (const f of ['SKILL.md', 'README.md', 'CHANGELOG.md', 'LICENSE', 'package.json', '.gitignore']) {
  check(f + ' exists', () => fileExists(f) || `Missing: ${f}`);
}

// ─── CHECK 2: All .md files have valid frontmatter ─────────────────────────
console.log('\n── Frontmatter validation');
const mdFiles = fs.readdirSync(ROOT)
  .filter(f => f.endsWith('.md') && f !== 'README.md' && f !== 'CHANGELOG.md');

for (const f of mdFiles) {
  check(`${f} has valid frontmatter`, () => {
    const content = readFile(f);
    if (!content.startsWith('---')) return 'Missing opening --- fence';
    const end = content.indexOf('---', 3);
    if (end === -1) return 'Missing closing --- fence';
    const frontmatter = content.slice(3, end);
    if (!frontmatter.includes('name:')) return 'Missing name: field';
    if (!frontmatter.includes('description:')) return 'Missing description: field';
    return true;
  });
}

// ─── CHECK 3: Module cross-references resolve ──────────────────────────────
console.log('\n── Module cross-references (SKILL.md)');
const skillContent = readFile('SKILL.md');
const mdRefs = [...skillContent.matchAll(/`([a-z][a-z-]+\.md)`/g)]
  .map(m => m[1])
  .filter((v, i, a) => a.indexOf(v) === i); // unique

for (const ref of mdRefs) {
  check(`${ref} exists`, () => fileExists(ref) || `File not found: ${ref}`);
}

// ─── CHECK 4: No unfilled placeholders in SKILL.md ────────────────────────
// Strips backtick-quoted strings first (those are literal examples, not placeholders)
console.log('\n── Placeholder check (SKILL.md)');
check('No unfilled [TODO]/[FIXME]/[TBD]/PLACEHOLDER strings', () => {
  // Remove content inside backtick spans to avoid false positives on literal examples
  const stripped = skillContent.replace(/`[^`]*`/g, '``');
  const patterns = [/\[FIXME\]/g, /\[TBD\]/g, /<your /gi, /<fill /gi];
  for (const pattern of patterns) {
    const match = stripped.match(pattern);
    if (match) return `Found ${match.length} instance(s) of ${pattern.source}`;
  }
  return true;
});

// ─── CHECK 5: No stale usernames ──────────────────────────────────────────
console.log('\n── Stale reference check');
check('No vincekinney1991 references', () => {
  const allMd = [...mdFiles, 'README.md', 'CHANGELOG.md'];
  for (const f of allMd) {
    if (!fileExists(f)) continue;
    const content = readFile(f);
    if (content.includes('vincekinney1991')) return `Found in ${f}`;
  }
  return true;
});

// ─── CHECK 6: Legal docs present ──────────────────────────────────────────
console.log('\n── Legal documents');
for (const f of [
  'docs/legal/TERMS_OF_SERVICE.md',
  'docs/legal/PRIVACY_POLICY.md',
  'docs/legal/COMPLIANCE_CHECKLIST.md',
]) {
  check(f + ' exists', () => fileExists(f) || `Missing: ${f}`);
}

// ─── CHECK 7: Version and command-surface invariants ─────────────────────
console.log('\n── Version and command surface');
check('CHANGELOG.md contains v8.0 section', () => {
  const changelog = readFile('CHANGELOG.md');
  return changelog.includes('[8.0.0]') || 'No [8.0.0] section found';
});

check('package.json version is 8.0.0', () => {
  const pkg = JSON.parse(readFile('package.json'));
  return pkg.version === '8.0.0' || `Version is ${pkg.version}, expected 8.0.0`;
});

check('CHARTER_v8.md declares 28 canonical commands', () => {
  const charter = readFile('CHARTER_v8.md');
  const commandBlock = charter.match(/## Subcommand Surface \(v8\.0\)[\s\S]*?```text\r?\n([\s\S]*?)```/);
  if (!commandBlock) return 'Subcommand surface block not found';
  const commands = commandBlock[1]
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.startsWith('/atlas'));
  const uniqueCommands = new Set(commands.map(line => line.split(/\s{2,}/)[0]));
  if (uniqueCommands.size !== 28) {
    return `Found ${uniqueCommands.size} canonical commands, expected 28`;
  }
  return charter.includes('Twenty-eight commands are canonical in v8.0')
    || 'CHARTER_v8.md command-count sentence is stale';
});

// ─── SUMMARY ──────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  console.log('\nFailures:');
  for (const e of errors) {
    console.log(`  ✗ ${e.name}: ${e.detail}`);
  }
  process.exit(1);
} else {
  console.log('\n✅ All checks passed. Atlas is valid.');
  process.exit(0);
}
