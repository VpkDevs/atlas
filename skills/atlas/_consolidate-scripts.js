const fs = require('fs');
const path = require('path');

const dir = 'scripts/atlas';

function read(name) {
  return fs.readFileSync(path.join(dir, name), 'utf8');
}

function stripShebang(code) {
  return code.replace(/^#!.*\r?\n/, '');
}

// --- core.js: command-registry + state-schema ---
const reg = stripShebang(read('command-registry.js'));
const schema = stripShebang(read('state-schema.js'));
fs.writeFileSync(
  path.join(dir, 'core.js'),
  `${reg}\n\n// ===== state-schema =====\n${schema}\n`
);
console.log('wrote core.js');

// --- weekly-pipeline.js: decide + notify + open_pr ---
const decide = stripShebang(read('decide.js'));
const notify = stripShebang(read('notify.js'));
const openPr = stripShebang(read('open_pr.js'));
fs.writeFileSync(
  path.join(dir, 'weekly-pipeline.js'),
  `#!/usr/bin/env node
/**
 * Weekly pipeline tools (merged): decide | notify | open_pr
 * Usage: node weekly-pipeline.js <decide|notify|open_pr> [...args]
 */
const __cmd = process.argv[2];
const __rest = process.argv.slice(3);
if (!__cmd || __cmd === 'help' || __cmd === '--help') {
  process.stderr.write('Usage: weekly-pipeline.js <decide|notify|open_pr> [...args]\\n');
  process.exit(__cmd ? 0 : 1);
}
process.argv = [process.argv[0], process.argv[1], ...__rest];

if (__cmd === 'decide') {
${decide}
} else if (__cmd === 'notify') {
${notify}
} else if (__cmd === 'open_pr' || __cmd === 'open-pr') {
${openPr}
} else {
  process.stderr.write('Unknown command: ' + __cmd + '\\n');
  process.exit(1);
}
`
);
console.log('wrote weekly-pipeline.js');

// --- first-revenue.js: zero-to-first-dollar + startup-credits-generator ---
const z = stripShebang(read('zero-to-first-dollar.js'));
const s = stripShebang(read('startup-credits-generator.js'));
fs.writeFileSync(
  path.join(dir, 'first-revenue.js'),
  `#!/usr/bin/env node
/**
 * First-revenue tools (merged): first-dollar | credits
 * Usage: node first-revenue.js [first-dollar|credits] [...args]
 */
const __cmd = process.argv[2];
const __rest = process.argv.slice(3);
if (__cmd === 'credits' || __cmd === 'startup-credits') {
  process.argv = [process.argv[0], process.argv[1], ...__rest];
${s}
} else {
  // default / first-dollar — keep original argv shape for first-dollar CLI
  if (__cmd === 'first-dollar' || __cmd === 'zero-to-first-dollar') {
    process.argv = [process.argv[0], process.argv[1], ...__rest];
  }
${z}
}
`
);
console.log('wrote first-revenue.js');

// Update requires across scripts
function walk(d, fn) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const full = path.join(d, e.name);
    if (e.isDirectory()) walk(full, fn);
    else if (e.name.endsWith('.js')) fn(full);
  }
}

walk('scripts', (file) => {
  let c = fs.readFileSync(file, 'utf8');
  const next = c
    .split("require('./command-registry')").join("require('./core')")
    .split('require("./command-registry")').join("require('./core')")
    .split("require('./state-schema')").join("require('./core')")
    .split('require("./state-schema")').join("require('./core')");
  if (next !== c) {
    fs.writeFileSync(file, next);
    console.log('updated requires', path.relative('.', file));
  }
});

// Update weekly-review.js if it spawns decide/notify/open_pr
const wrPath = path.join(dir, 'weekly-review.js');
if (fs.existsSync(wrPath)) {
  let wr = fs.readFileSync(wrPath, 'utf8');
  const next = wr
    .split('decide.js').join('weekly-pipeline.js decide')
    .split('notify.js').join('weekly-pipeline.js notify')
    .split('open_pr.js').join('weekly-pipeline.js open_pr')
    .split('zero-to-first-dollar.js').join('first-revenue.js')
    .split('startup-credits-generator.js').join('first-revenue.js credits');
  if (next !== wr) {
    fs.writeFileSync(wrPath, next);
    console.log('updated weekly-review.js paths');
  }
}

// Delete merged sources
const remove = [
  'command-registry.js',
  'state-schema.js',
  'decide.js',
  'notify.js',
  'open_pr.js',
  'zero-to-first-dollar.js',
  'startup-credits-generator.js',
];
for (const name of remove) {
  const full = path.join(dir, name);
  if (fs.existsSync(full)) {
    fs.unlinkSync(full);
    console.log('removed', name);
  }
}

// Merge github prompts
const promptsDir = '.github/prompts';
if (fs.existsSync(promptsDir)) {
  const files = fs.readdirSync(promptsDir).filter((f) => f.endsWith('.md'));
  if (files.length > 1) {
    const parts = files.map((f) => `## ${f}\n\n${fs.readFileSync(path.join(promptsDir, f), 'utf8').trim()}`);
    fs.writeFileSync(path.join(promptsDir, 'atlas-prompts.md'), `# Atlas Prompts\n\n${parts.join('\n\n---\n\n')}\n`);
    for (const f of files) fs.unlinkSync(path.join(promptsDir, f));
    console.log('merged prompts -> atlas-prompts.md');
  }
}

// Merge scoring-advanced into scoring.md
if (fs.existsSync('scoring-advanced.md')) {
  let scoring = fs.readFileSync('scoring.md', 'utf8');
  let adv = fs.readFileSync('scoring-advanced.md', 'utf8');
  if (adv.startsWith('---')) {
    const end = adv.indexOf('---', 3);
    if (end !== -1) adv = adv.slice(end + 3).replace(/^\r?\n/, '');
  }
  if (!scoring.includes('# Advanced Features') && !scoring.includes('Advanced Scoring')) {
    scoring = `${scoring.trimEnd()}\n\n---\n\n# Advanced Scoring (merged from scoring-advanced.md)\n\n${adv.trim()}\n`;
    fs.writeFileSync('scoring.md', scoring);
  }
  fs.unlinkSync('scoring-advanced.md');
  console.log('merged scoring-advanced into scoring.md');
}

// Count
function countFiles(root) {
  let n = 0;
  function walk2(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk2(full);
      else n++;
    }
  }
  walk2(root);
  return n;
}
console.log('TOTAL_FILES', countFiles('.'));
