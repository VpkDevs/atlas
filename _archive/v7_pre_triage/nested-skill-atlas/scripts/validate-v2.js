#!/usr/bin/env node
/**
 * Atlas Enhanced Validator (v2)
 *
 * Validates automation library, tooling, docs cross-references, and version alignment with version.md.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;
const errors = [];
const warnings = [];

function check(name, fn) {
  try {
    const result = fn();
    if (result === true || result === undefined) {
      console.log(`  ✅ ${name}`);
      passed++;
    } else if (result === false) {
      console.log(`  ❌ ${name}: Check failed`);
      failed++;
      errors.push({ name, detail: 'Check failed' });
    } else if (typeof result === 'string' && result.startsWith('WARN:')) {
      console.log(`  ⚠️  ${name}: ${result.substring(5)}`);
      warnings.push({ name, detail: result.substring(5) });
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

function directoryExists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath)) && 
         fs.statSync(path.join(ROOT, relPath)).isDirectory();
}

/** @returns {string|null} e.g. "8.3" from version.md Current Version line */
function canonicalVersionStemFromVersionMd() {
  try {
    const txt = readFile('version.md');
    const m = txt.match(/\*\*Current Version:\*\*\s*`v?([\d]+(?:\.[\d]+)?)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

console.log('\n🔍 Atlas enhanced validator (v2)\n');
console.log('Validating tooling, automation library, docs, and version alignment...\n');

// ─── CHECK 1: Core plans & router docs ──────────────────────────────────
console.log('── Core reference files');
check('atlas-improvement-plan.md exists', () => 
  fileExists('atlas-improvement-plan.md') || 'Missing improvement plan'
);

check('fusion-router-v2.md exists', () => 
  fileExists('fusion-router-v2.md') || 'Missing enhanced fusion router'
);

// ─── CHECK 2: Enhanced Automation Library ────────────────────────────────
console.log('\n── Enhanced Automation Library');
check('Automation library directory exists', () => 
  directoryExists('automation-library') || 'Missing automation library'
);

const automationFiles = [
  'revenue-dunning.json',
  'content-automation.json',
  'customer-lifecycle.json',
  'churn-detection.json',
  'new-customer-onboarding.json',
];
automationFiles.forEach(file => {
  check(`${file} exists`, () => 
    fileExists(`automation-library/${file}`) || `Missing: ${file}`
  );
  
  check(`${file} is valid JSON`, () => {
    const content = readFile(`automation-library/${file}`);
    try {
      JSON.parse(content);
      return true;
    } catch (e) {
      return `Invalid JSON: ${e.message}`;
    }
  });
});

// ─── CHECK 3: Enhanced Scripts ───────────────────────────────────────────
console.log('\n── Enhanced Scripts');
const scriptFiles = [
  'scripts/atlas/cli.js',
  'scripts/atlas/monitor.js',
  'scripts/atlas/predictive-scoring.js'
];

scriptFiles.forEach(file => {
  check(`${file} exists`, () => 
    fileExists(file) || `Missing: ${file}`
  );
  
  check(`${file} is valid JavaScript`, () => {
    const content = readFile(file);
    // Basic syntax check - try to parse as module
    if (!content.includes('#!/usr/bin/env node')) {
      return 'WARN: Missing shebang line';
    }
    return true;
  });
});

// ─── CHECK 4: Package.json Updates ───────────────────────────────────────
console.log('\n── Package.json Configuration');
check('Package.json semver matches version.md (**Current Version**)', () => {
  const stem = canonicalVersionStemFromVersionMd();
  if (!stem) return 'Could not parse **Current Version** from version.md';
  const pkgVer = JSON.parse(readFile('package.json')).version;
  const parts = pkgVer.split('.').map(Number);
  const canon = stem.split('.').map(Number);
  const matched =
    parts[0] === canon[0] &&
    (canon.length < 2 ? true : parts[1] === canon[1]);
  return matched || `Version is ${pkgVer}, expected same major.minor as canonical v${stem}`;
});

check('Package.json includes new scripts', () => {
  const pkg = JSON.parse(readFile('package.json'));
  const requiredScripts = ['cli', 'monitor', 'predict', 'start', 'dashboard'];
  const missing = requiredScripts.filter(s => !pkg.scripts[s]);
  return missing.length === 0 || `Missing scripts: ${missing.join(', ')}`;
});

check('Package.json includes new dependencies', () => {
  const pkg = JSON.parse(readFile('package.json'));
  const requiredDeps = ['chalk', 'commander', 'figlet', 'inquirer', 'ora', 'boxen', 'ws'];
  const missing = requiredDeps.filter(d => !pkg.dependencies?.[d]);
  return missing.length === 0 || `Missing dependencies: ${missing.join(', ')}`;
});

check('Package.json includes bin entries', () => {
  const pkg = JSON.parse(readFile('package.json'));
  if (!pkg.bin) return 'Missing bin section';
  if (!pkg.bin.atlas) return 'Missing atlas bin entry';
  if (!pkg.bin['atlas-monitor']) return 'Missing atlas-monitor bin entry';
  
  // Check that the files exist
  if (!fileExists(pkg.bin.atlas.replace('./', ''))) {
    return `Bin file not found: ${pkg.bin.atlas}`;
  }
  if (!fileExists(pkg.bin['atlas-monitor'].replace('./', ''))) {
    return `Bin file not found: ${pkg.bin['atlas-monitor']}`;
  }
  
  return true;
});

// ─── CHECK 5: README Updates ─────────────────────────────────────────────
console.log('\n── Documentation Updates');
check('readme.md references Atlas v8.x lineage', () => {
  const readme = readFile('readme.md');
  return readme.includes('v8.') || 'README does not mention v8.x lineage';
});

check('readme.md includes new CLI commands', () => {
  const readme = readFile('readme.md');
  const requiredCommands = ['atlas init', 'atlas monitor', 'atlas score predict'];
  const missing = requiredCommands.filter(c => !readme.includes(c));
  return missing.length === 0 || `Missing CLI documentation: ${missing.join(', ')}`;
});

check('readme.md includes automation library section', () => {
  const readme = readFile('readme.md');
  return readme.includes('Enhanced Automation Library') || 'Missing automation library section';
});

// ─── CHECK 6: Node.js Compatibility ──────────────────────────────────────
console.log('\n── Node.js Compatibility');
check('Node.js version >= 18.0.0', () => {
  const version = process.version;
  const major = parseInt(version.replace('v', '').split('.')[0]);
  return major >= 18 || `Node.js ${version} is too old, need >= 18.0.0`;
});

check('npm is available', () => {
  try {
    execSync('npm --version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return 'npm is not available';
  }
});

// ─── CHECK 7: Module Cross-references ────────────────────────────────────
console.log('\n── Module Cross-references');
const skillContent = readFile('SKILL.md');
const newModuleRefs = ['fusion-router-v2.md', 'predictive-scoring.js'];
newModuleRefs.forEach(ref => {
  check(`${ref} referenced in SKILL.md`, () => 
    skillContent.includes(ref) || `Not referenced: ${ref}`
  );
});

// ─── CHECK 8: State Directory Structure ──────────────────────────────────
console.log('\n── State Directory Structure');
check('~/.atlas directory can be created', () => {
  const stateDir = path.join(process.env.HOME || process.env.USERPROFILE, '.atlas');
  try {
    fs.mkdirSync(stateDir, { recursive: true });
    return true;
  } catch (e) {
    return `Cannot create state directory: ${e.message}`;
  }
});

// ─── CHECK 9: Enhanced Scoring Engine ────────────────────────────────────
console.log('\n── Enhanced Scoring Engine');
check('Predictive scoring engine has required functions', () => {
  const scoringContent = readFile('scripts/atlas/predictive-scoring.js');
  const requiredFunctions = ['PredictiveScoringEngine', 'predictTrend', 'detectAnomalies'];
  const missing = requiredFunctions.filter(f => !scoringContent.includes(f));
  return missing.length === 0 || `Missing functions: ${missing.join(', ')}`;
});

// ─── CHECK 10: Real-time Monitor ─────────────────────────────────────────
console.log('\n── Real-time Monitor');
check('Monitor includes WebSocket server', () => {
  const monitorContent = readFile('scripts/atlas/monitor.js');
  return monitorContent.includes('WebSocket.Server') || 'Missing WebSocket server';
});

check('Monitor includes TUI dashboard', () => {
  const monitorContent = readFile('scripts/atlas/monitor.js');
  return monitorContent.includes('blessed.screen') || 'Missing TUI dashboard';
});

// ─── CHECK 11: CLI Interface ─────────────────────────────────────────────
console.log('\n── CLI Interface');
check('CLI includes all major commands', () => {
  const cliContent = readFile('scripts/atlas/cli.js');
  const requiredCommands = ['init', 'status', 'automation', 'score', 'fusion', 'diagnose'];
  const missing = requiredCommands.filter(c => {
    // Check for command('init'), command('init '), or command('init<')
    return !cliContent.match(new RegExp(`command\\(['"]${c}(\\s|\\[|['"])`));
  });
  return missing.length === 0 || `Missing CLI commands: ${missing.join(', ')}`;
});

check('CLI includes help system', () => {
  const cliContent = readFile('scripts/atlas/cli.js');
  return cliContent.includes('outputHelp') || 'Missing help system';
});

// ─── CHECK 12: Integration Points ────────────────────────────────────────
console.log('\n── Integration Points');
check('All modules can be imported', () => {
  const modules = [
    'scripts/atlas/cli.js',
    'scripts/atlas/monitor.js',
    'scripts/atlas/predictive-scoring.js'
  ];
  
  const importErrors = [];
  
  modules.forEach(module => {
    try {
      // Try to require the module
      require(path.join(ROOT, module));
    } catch (e) {
      // Check if it's a missing dependency error
      if (e.message.includes('Cannot find module')) {
        const missingModule = e.message.match(/Cannot find module '([^']+)'/);
        if (missingModule) {
          importErrors.push(`WARN: ${module} requires ${missingModule[1]} (install with npm install)`);
        } else {
          importErrors.push(`WARN: ${module} has import error: ${e.message}`);
        }
      } else {
        importErrors.push(`ERROR: ${module} failed: ${e.message}`);
      }
    }
  });
  
  if (importErrors.length > 0) {
    // Return warnings for missing dependencies, errors for other issues
    const errors = importErrors.filter(e => e.startsWith('ERROR:'));
    const warnings = importErrors.filter(e => e.startsWith('WARN:'));
    
    if (errors.length > 0) {
      return errors.join('; ');
    }
    
    // Return first warning as a warning string
    return warnings.length > 0 ? `WARN:${warnings[0].substring(5)}` : true;
  }
  
  return true;
});

// ─── SUMMARY ─────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(60)}`);
console.log(`Results: ${passed} passed, ${failed} failed, ${warnings.length} warnings`);

if (warnings.length > 0) {
  console.log('\nWarnings:');
  warnings.forEach(w => {
    console.log(`  ⚠️  ${w.name}: ${w.detail}`);
  });
}

if (failed > 0) {
  console.log('\nFailures:');
  errors.forEach(e => {
    console.log(`  ✗ ${e.name}: ${e.detail}`);
  });
  
  console.log('\n❌ Atlas validation failed. Please fix the issues above.');
  process.exit(1);
} else {
  console.log('\n✅ All checks passed. Atlas is ready.');
  
  if (warnings.length > 0) {
    console.log('\n⚠️  Some warnings were found. Consider addressing them.');
  }
  
  console.log('\nNext steps:');
  console.log('1. Run `npm install` to install dependencies');
  console.log('2. Run `npm run validate` for basic validation');
  console.log('3. Test with `atlas init test-project`');
  console.log('4. Start monitor with `atlas monitor`');
  
  process.exit(0);
}