#!/usr/bin/env node
/**
 * Atlas Credential Harvester v1.0
 * 
 * Scans local and cloud environments to consolidate API keys into the Atlas Brain.
 * Supports: Local .env, GitHub Secrets, Vercel Envs, Replit Secrets.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

const STATE_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.atlas');
const DEV_DIR = 'C:\\Users\\MQ420_OL\\DEV';

const KEY_MAP = [
  'STRIPE_SECRET_KEY', 'VERCEL_TOKEN', 'GITHUB_TOKEN', 'POSTHOG_API_KEY',
  'SENTRY_DSN', 'RESEND_API_KEY', 'BUFFER_ACCESS_TOKEN', 'ANTHROPIC_API_KEY',
  'OPENAI_API_KEY', 'LEMON_SQUEEZY_API_KEY'
];

async function harvest() {
  console.log(chalk.blue('\n🚀 Starting Sovereign Credential Harvest...\n'));

  const discoveredKeys = new Set();
  const credentialsIndex = {};

  // 1. Local .env Scavenging
  console.log(chalk.yellow('🔍 Scanning local projects for .env files...'));
  const envFiles = scanForEnvFiles(DEV_DIR);
  console.log(`   Found ${envFiles.length} potential secret sources.`);

  for (const file of envFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      KEY_MAP.forEach(key => {
        if (content.includes(key + '=') || content.includes(key + ':')) {
          discoveredKeys.add(key);
        }
      });
    } catch (e) {}
  }

  // 2. GitHub Secrets Liberation (via gh CLI)
  try {
    console.log(chalk.yellow('🔍 Attempting to list GitHub Secrets...'));
    const repos = execSync('gh repo list --limit 10 --json nameWithOwner', { encoding: 'utf8' });
    const repoList = JSON.parse(repos);
    for (const repo of repoList) {
      try {
        const secrets = execSync(`gh secret list -R ${repo.nameWithOwner}`, { encoding: 'utf8' });
        KEY_MAP.forEach(key => {
          if (secrets.includes(key)) discoveredKeys.add(key);
        });
      } catch (e) {}
    }
  } catch (e) {
    console.log(chalk.gray('   GitHub CLI not authenticated or not installed. Skipping.'));
  }

  // 3. Vercel Env Liberation (via vercel CLI)
  try {
    console.log(chalk.yellow('🔍 Attempting to list Vercel Environment Variables...'));
    // This is more complex as it requires project linking, but we check if logged in
    const whoami = execSync('vercel whoami', { encoding: 'utf8' });
    if (whoami) discoveredKeys.add('VERCEL_TOKEN');
  } catch (e) {}

  // 4. Update Credentials Index
  KEY_MAP.forEach(key => {
    credentialsIndex[key.toLowerCase()] = discoveredKeys.has(key);
  });

  const indexPath = path.join(STATE_DIR, 'credentials_index.json');
  fs.writeFileSync(indexPath, JSON.stringify(credentialsIndex, null, 2));

  console.log(chalk.green('\n✅ Harvest Complete.'));
  console.log(chalk.bold('\nCredential Presence Status:'));
  Object.entries(credentialsIndex).forEach(([key, present]) => {
    const status = present ? chalk.green('✓ PRESENT') : chalk.red('✘ MISSING');
    console.log(`  ${key.padEnd(25)}: ${status}`);
  });

  // 5. Deep-Link Recommendations
  const missing = Object.entries(credentialsIndex).filter(([_, p]) => !p);
  if (missing.length > 0) {
    console.log(chalk.yellow('\n💡 Action Required: To achieve total sovereignty, you need to create the missing keys.'));
    console.log('   Atlas can open your browser to the creation pages. Run `atlas harvest --link`');
  }
}

function scanForEnvFiles(dir, depth = 0) {
  if (depth > 3) return [];
  let files = [];
  try {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (!['node_modules', '.git', 'dist'].includes(entry)) {
          files = files.concat(scanForEnvFiles(fullPath, depth + 1));
        }
      } else if (entry === '.env' || entry === '.env.local' || entry === '.env.development') {
        files.push(fullPath);
      }
    }
  } catch (e) {}
  return files;
}

if (require.main === module) {
  harvest().catch(console.error);
}

module.exports = harvest;
