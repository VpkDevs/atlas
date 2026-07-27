#!/usr/bin/env node
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const {
  diffCommands,
  extractCharterSubcommands,
  extractSkillSubcommands,
  getCanonicalSlashCommands,
} = require('./command-registry');
const { buildManifest } = require('./automation-library');

const DEFAULT_ROOT = path.resolve(__dirname, '..', '..');

function parseArgs(argv) {
  const args = { root: DEFAULT_ROOT, json: false, strict: process.env.ATLAS_DOCTOR_STRICT === '1' || process.env.CI === 'true' };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--json') {
      args.json = true;
    } else if (arg === '--strict' || arg === '--ci') {
      args.strict = true;
    } else if (arg === '--root') {
      const value = argv[++i];
      if (!value || value.startsWith('--')) {
        throw new Error('--root requires a path');
      }
      args.root = path.resolve(value);
    } else if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function readText(root, relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

function exists(root, relPath) {
  return fs.existsSync(path.join(root, relPath));
}

function hashFile(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function walkFiles(dir, options = {}) {
  const ignored = new Set(options.ignored || []);
  const files = [];
  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath, options));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function makeCheck(id, title, status, message, details = []) {
  return { id, title, status, message, details };
}

function runCheck(id, title, fn) {
  try {
    return fn();
  } catch (error) {
    return makeCheck(id, title, 'fail', error.message);
  }
}

function canonicalVersionFromPackage(pkg) {
  return `v${pkg.version.replace(/\.0$/, '')}`;
}

function checkRoot(root) {
  if (!fs.existsSync(root)) {
    return makeCheck('root', 'Root directory', 'fail', `Root does not exist: ${root}`);
  }
  const stat = fs.statSync(root);
  return makeCheck(
    'root',
    'Root directory',
    stat.isDirectory() ? 'pass' : 'fail',
    stat.isDirectory() ? 'Root exists and is a directory' : `Root is not a directory: ${root}`
  );
}

function checkRequiredFiles(root) {
  const required = ['SKILL.md', 'README.md', 'CHANGELOG.md', 'LICENSE', 'package.json', 'package-lock.json', '.gitignore'];
  const missing = required.filter((file) => !exists(root, file));
  return makeCheck(
    'required-files',
    'Required files',
    missing.length ? 'fail' : 'pass',
    missing.length ? `Missing required files: ${missing.join(', ')}` : 'All required root files exist',
    missing
  );
}

function checkFrontmatter(root) {
  const mdFiles = fs.readdirSync(root)
    .filter((file) => file.endsWith('.md') && file !== 'README.md' && file !== 'CHANGELOG.md');
  const failures = [];

  for (const file of mdFiles) {
    const content = readText(root, file);
    const end = content.indexOf('---', 3);
    const frontmatter = end === -1 ? '' : content.slice(3, end);
    if (!content.startsWith('---') || end === -1 || !frontmatter.includes('name:') || !frontmatter.includes('description:')) {
      failures.push(file);
    }
  }

  return makeCheck(
    'frontmatter',
    'Markdown frontmatter',
    failures.length ? 'fail' : 'pass',
    failures.length ? `Root markdown files with invalid frontmatter: ${failures.join(', ')}` : 'Root module frontmatter is valid',
    failures
  );
}

function checkModuleReferences(root) {
  const skill = readText(root, 'SKILL.md');
  const refs = [...skill.matchAll(/`([a-z][a-z0-9-]+\.md)`/g)]
    .map((match) => match[1])
    .filter((value, index, all) => all.indexOf(value) === index);
  const missing = refs.filter((file) => !exists(root, file));

  return makeCheck(
    'module-refs',
    'Module references',
    missing.length ? 'fail' : 'pass',
    missing.length ? `Missing referenced modules: ${missing.join(', ')}` : `${refs.length} referenced modules resolve`,
    missing
  );
}

function checkVersionCoherence(root) {
  const pkg = JSON.parse(readText(root, 'package.json'));
  const lock = JSON.parse(readText(root, 'package-lock.json'));
  const canonicalVersion = canonicalVersionFromPackage(pkg);
  const checks = [];

  const lockRoot = lock.packages && lock.packages[''];
  if (lock.version !== pkg.version) checks.push(`package-lock.json version ${lock.version} != package.json ${pkg.version}`);
  if (!lockRoot || lockRoot.version !== pkg.version) checks.push(`package-lock packages[""].version ${lockRoot?.version} != package.json ${pkg.version}`);
  if (!readText(root, 'VERSION.md').includes(`Current canonical version:** \`${canonicalVersion}\``)) checks.push(`VERSION.md does not declare ${canonicalVersion}`);
  if (!readText(root, 'SKILL.md').includes(`# Atlas ${canonicalVersion}`)) checks.push(`SKILL.md does not declare ${canonicalVersion}`);
  if (!readText(root, 'CHARTER.md').includes(`Atlas ${canonicalVersion} is the current canonical version`)) checks.push(`CHARTER.md does not declare ${canonicalVersion}`);
  if (!readText(root, 'README.md').includes(`Atlas is at **${canonicalVersion}**`)) checks.push(`README.md does not declare ${canonicalVersion}`);
  if (!readText(root, 'CHANGELOG.md').includes(`[${pkg.version}]`)) checks.push(`CHANGELOG.md has no [${pkg.version}] section`);

  return makeCheck(
    'version-coherence',
    'Version coherence',
    checks.length ? 'fail' : 'pass',
    checks.length ? 'Version declarations disagree' : `Version declarations agree on ${canonicalVersion}`,
    checks
  );
}

function checkCommandSurface(root) {
  const skill = readText(root, 'SKILL.md');
  const charter = readText(root, 'CHARTER.md');
  const expected = getCanonicalSlashCommands();
  const skillCommands = extractSkillSubcommands(skill);
  const charterCommands = extractCharterSubcommands(charter);
  const details = [];

  if (!skillCommands.length) details.push('SKILL.md command table not found');
  if (!charterCommands.length) details.push('CHARTER.md subcommand block not found');

  const skillDiff = diffCommands(skillCommands, expected);
  const charterDiff = diffCommands(charterCommands, expected);
  for (const command of skillDiff.missing) details.push(`SKILL.md missing ${command}`);
  for (const command of skillDiff.extra) details.push(`SKILL.md extra ${command}`);
  for (const command of charterDiff.missing) details.push(`CHARTER.md missing ${command}`);
  for (const command of charterDiff.extra) details.push(`CHARTER.md extra ${command}`);

  return makeCheck(
    'command-surface',
    'Command surface',
    details.length ? 'fail' : 'pass',
    details.length
      ? 'Canonical command surface drift detected'
      : `${expected.length} canonical commands match SKILL.md and CHARTER.md`,
    details.length ? details : expected
  );
}

function checkNestedSkill(root) {
  const rootSkill = path.join(root, 'SKILL.md');
  const nested = walkFiles(root, { ignored: ['node_modules', '.git'] })
    .filter((file) => path.basename(file).toLowerCase() === 'skill.md')
    .filter((file) => path.resolve(file) !== rootSkill);

  return makeCheck(
    'no-nested-skill',
    'No nested Atlas skill copies',
    nested.length ? 'fail' : 'pass',
    nested.length ? 'Nested SKILL.md files found inside Atlas package' : 'No nested skill copies found',
    nested.map((file) => path.relative(root, file))
  );
}

function normalizeDocName(file) {
  return file
    .replace(/\.md$/i, '')
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/-v\d+(?:\.\d+)?$/i, '');
}

function checkDuplicateDocs(root) {
  const groups = new Map();
  for (const file of fs.readdirSync(root).filter((entry) => entry.endsWith('.md'))) {
    const key = normalizeDocName(file);
    const group = groups.get(key) || [];
    group.push(file);
    groups.set(key, group);
  }

  const duplicates = [...groups.values()].filter((group) => group.length > 1);
  return makeCheck(
    'no-duplicate-docs',
    'No duplicate root docs',
    duplicates.length ? 'fail' : 'pass',
    duplicates.length ? 'Duplicate root markdown clusters found' : 'No duplicate root markdown clusters found',
    duplicates
  );
}

function checkHygiene(root, strict = false) {
  const forbidden = ['.atlas-state', '.kiro', '_archive'];
  const bulky = ['node_modules'];
  const found = [];
  const warnings = [];

  function visit(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (forbidden.includes(entry.name)) {
          found.push(path.relative(root, fullPath));
          continue;
        }
        if (bulky.includes(entry.name)) {
          warnings.push(path.relative(root, fullPath));
          continue;
        }
        if (entry.name !== '.git') visit(fullPath);
      }
    }
  }

  visit(root);
  const status = found.length || (strict && warnings.length) ? 'fail' : warnings.length ? 'warn' : 'pass';
  return makeCheck(
    'hygiene',
    'Package hygiene',
    status,
    found.length
      ? 'Runtime directories found inside skill package'
      : strict && warnings.length
        ? 'Strict mode forbids local dependency directories inside the package'
      : warnings.length
        ? 'Local dependency directories found; do not commit them'
        : 'No runtime/bulk directories found',
    found.length ? found : warnings
  );
}

function checkSecretFiles(root) {
  const envFiles = walkFiles(root, { ignored: ['node_modules', '.git'] })
    .filter((file) => path.basename(file).toLowerCase().startsWith('.env'));
  return makeCheck(
    'no-env-files',
    'No env files',
    envFiles.length ? 'fail' : 'pass',
    envFiles.length ? 'Environment files do not belong in the skill package' : 'No env files found',
    envFiles.map((file) => path.relative(root, file))
  );
}

function checkAutomationLibrary(root) {
  const automationDir = path.join(root, 'automation-library');
  if (!fs.existsSync(automationDir)) {
    return makeCheck('automation-library', 'Automation library', 'fail', 'automation-library directory is missing');
  }
  const manifest = buildManifest(automationDir);
  const failures = manifest.workflows
    .filter((workflow) => !workflow.ok)
    .map((workflow) => `${workflow.file}: ${workflow.errors.join('; ')}`);
  const lowReadiness = manifest.workflows
    .filter((workflow) => workflow.readiness < 80)
    .map((workflow) => `${workflow.file}: readiness ${workflow.readiness}/100`);
  const details = [...failures, ...lowReadiness];

  return makeCheck(
    'automation-library',
    'Automation library',
    failures.length ? 'fail' : lowReadiness.length ? 'warn' : 'pass',
    failures.length
      ? 'Automation workflows failed validation'
      : lowReadiness.length
        ? 'Some automation workflows have low readiness'
        : `${manifest.workflow_count} automation workflows validate; average readiness ${manifest.average_readiness}/100`,
    details
  );
}

function maybeCheckInstallTargets(root, strict = false) {
  const expectedSource = path.join(os.homedir(), '.agents', 'skills', 'Atlas');
  if (path.resolve(root).toLowerCase() !== path.resolve(expectedSource).toLowerCase()) {
    return makeCheck('install-targets', 'Install targets', 'warn', 'Skipped install-target comparison outside canonical .agents source');
  }

  const targets = [
    path.join(os.homedir(), '.claude', 'skills', 'Atlas'),
    path.join(os.homedir(), '.codex', 'skills', 'Atlas'),
    path.join(os.homedir(), '.cursor', 'skills', 'Atlas'),
    path.join(os.homedir(), '.trae', 'skills', 'Atlas'),
  ];
  const probeFiles = ['SKILL.md', 'VERSION.md', 'CHARTER.md', 'business-setup.md', 'automation-handoff.md', 'credential-acquisition.md', 'package.json', 'package-lock.json', 'scripts/validate.js', 'scripts/atlas/doctor.js', 'scripts/atlas/automation-library.js', 'scripts/atlas/cli.js', 'scripts/atlas/command-registry.js', 'scripts/atlas/credential-browser.js', 'scripts/atlas/predictive-scoring.js', 'scripts/atlas/state-schema.js'];
  const failures = [];

  for (const target of targets) {
    if (!fs.existsSync(target)) {
      failures.push(`${target}: missing`);
      continue;
    }
    for (const rel of probeFiles) {
      const sourceFile = path.join(root, rel);
      const targetFile = path.join(target, rel);
      if (!fs.existsSync(targetFile)) {
        failures.push(`${target}: missing ${rel}`);
      } else if (hashFile(sourceFile) !== hashFile(targetFile)) {
        failures.push(`${target}: differs ${rel}`);
      }
    }
  }

  return makeCheck(
    'install-targets',
    'Install targets',
    failures.length && strict ? 'fail' : failures.length ? 'warn' : 'pass',
    failures.length ? 'Canonical runtime targets are out of sync; source package integrity still passes' : 'Canonical runtime targets match key files',
    failures
  );
}

function runDoctor(root = DEFAULT_ROOT, options = {}) {
  const strict = Boolean(options.strict);
  const rootCheck = checkRoot(root);
  if (rootCheck.status === 'fail') {
    return {
      ok: false,
      root,
      strict,
      summary: { passed: 0, warned: 0, failed: 1 },
      checks: [rootCheck],
    };
  }

  const checks = [
    rootCheck,
    runCheck('required-files', 'Required files', () => checkRequiredFiles(root)),
    runCheck('frontmatter', 'Markdown frontmatter', () => checkFrontmatter(root)),
    runCheck('module-refs', 'Module references', () => checkModuleReferences(root)),
    runCheck('version-coherence', 'Version coherence', () => checkVersionCoherence(root)),
    runCheck('command-surface', 'Command surface', () => checkCommandSurface(root)),
    runCheck('no-nested-skill', 'No nested Atlas skill copies', () => checkNestedSkill(root)),
    runCheck('no-duplicate-docs', 'No duplicate root docs', () => checkDuplicateDocs(root)),
    runCheck('hygiene', 'Package hygiene', () => checkHygiene(root, strict)),
    runCheck('no-env-files', 'No env files', () => checkSecretFiles(root)),
    runCheck('automation-library', 'Automation library', () => checkAutomationLibrary(root)),
    runCheck('install-targets', 'Install targets', () => maybeCheckInstallTargets(root, strict)),
  ];

  const failed = checks.filter((check) => check.status === 'fail').length;
  const warned = checks.filter((check) => check.status === 'warn').length;
  return {
    ok: failed === 0,
    root,
    strict,
    summary: { passed: checks.length - failed - warned, warned, failed },
    checks,
  };
}

function printText(report) {
  console.log(`Atlas Doctor: ${report.ok ? 'PASS' : 'FAIL'}`);
  console.log(`Root: ${report.root}`);
  for (const check of report.checks) {
    const icon = check.status === 'pass' ? 'OK' : check.status === 'warn' ? 'WARN' : 'FAIL';
    console.log(`[${icon}] ${check.title}: ${check.message}`);
    if (check.status !== 'pass' && check.details?.length) {
      for (const detail of check.details) console.log(`  - ${Array.isArray(detail) ? detail.join(', ') : detail}`);
    }
  }
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    const report = {
      ok: false,
      root: DEFAULT_ROOT,
      summary: { passed: 0, warned: 0, failed: 1 },
      checks: [makeCheck('arguments', 'CLI arguments', 'fail', error.message)],
    };
    if (process.argv.includes('--json')) {
      process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    } else {
      printText(report);
    }
    process.exitCode = 1;
    return;
  }
  if (args.help) {
    console.log('Usage: node scripts/atlas/doctor.js [--root <path>] [--json] [--strict]');
    return;
  }

  const report = runDoctor(args.root, { strict: args.strict });
  if (args.json) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } else {
    printText(report);
  }
  process.exitCode = report.ok ? 0 : 1;
}

if (require.main === module) {
  main();
}

module.exports = { parseArgs, runDoctor };
