#!/usr/bin/env node
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const inquirer = require('inquirer');

const STATE_DIR = path.join(process.env.HOME || process.env.USERPROFILE || os.homedir(), '.atlas');
const PROVIDERS = {
  stripe: {
    id: 'stripe',
    name: 'Stripe',
    url: 'https://dashboard.stripe.com/apikeys',
    env: ['STRIPE_SECRET_KEY'],
    keyPatterns: [/^sk_(test|live)_[A-Za-z0-9_]+$/],
    guidance: [
      'Sign in to Stripe.',
      'Open Developers > API keys if Stripe redirects elsewhere.',
      'Reveal or create a restricted secret key for server-side payments.',
    ],
    selectors: [
      'input[value^="sk_"]',
      'textarea[value^="sk_"]',
      'code:has-text("sk_")',
      'pre:has-text("sk_")',
      '[data-testid*="secret"]',
      '[class*="secret"]',
    ],
  },
  resend: {
    id: 'resend',
    name: 'Resend',
    url: 'https://resend.com/api-keys',
    env: ['RESEND_API_KEY'],
    keyPatterns: [/^re_[A-Za-z0-9_]+$/],
    guidance: [
      'Sign in to Resend.',
      'Create an API key with send permissions for this product.',
    ],
    selectors: [
      'input[value^="re_"]',
      'textarea[value^="re_"]',
      'code:has-text("re_")',
      'pre:has-text("re_")',
    ],
  },
  sentry: {
    id: 'sentry',
    name: 'Sentry',
    url: 'https://sentry.io/settings/',
    env: ['SENTRY_AUTH_TOKEN', 'SENTRY_DSN'],
    keyPatterns: [/^sntrys_[A-Za-z0-9_]+$/, /^https:\/\/[A-Za-z0-9]+@.*sentry\.io\/\d+$/],
    guidance: [
      'Sign in to Sentry.',
      'Create an auth token for API automation or copy the project DSN for runtime error reporting.',
    ],
    selectors: [
      'input[value^="sntrys_"]',
      'textarea[value^="sntrys_"]',
      'input[value^="https://"][value*="sentry.io"]',
      'textarea[value^="https://"][value*="sentry.io"]',
      'code:has-text("sntrys_")',
      'pre:has-text("sntrys_")',
    ],
  },
  betteruptime: {
    id: 'betteruptime',
    name: 'Better Uptime',
    url: 'https://uptime.betterstack.com/team/api-tokens',
    env: ['BETTER_UPTIME_API_KEY'],
    keyPatterns: [/^[A-Za-z0-9_-]{20,}$/],
    guidance: [
      'Sign in to Better Stack.',
      'Open API tokens and create a token for monitor management.',
    ],
    selectors: [
      'input[type="text"]',
      'textarea',
      'code',
      'pre',
    ],
  },
  posthog: {
    id: 'posthog',
    name: 'PostHog',
    url: 'https://app.posthog.com/project/settings',
    env: ['POSTHOG_API_KEY', 'POSTHOG_PROJECT_ID'],
    keyPatterns: [/^phx_[A-Za-z0-9_]+$/, /^[0-9]+$/],
    guidance: [
      'Sign in to PostHog.',
      'Copy the project API key and project id from project settings.',
    ],
    selectors: [
      'input[value^="phx_"]',
      'textarea[value^="phx_"]',
      'code:has-text("phx_")',
      'pre:has-text("phx_")',
    ],
  },
};

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getProjectPath(projectSlug) {
  return path.join(STATE_DIR, 'portfolio', projectSlug);
}

function defaultEnvFile(projectSlug) {
  return path.join(getProjectPath(projectSlug), '.env');
}

function defaultCredentialIndex(projectSlug) {
  return path.join(getProjectPath(projectSlug), 'credentials_index.json');
}

function parseProviderList(value) {
  if (!value || value === 'core') return ['stripe', 'resend', 'sentry', 'betteruptime'];
  if (value === 'all') return Object.keys(PROVIDERS);
  return String(value)
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

function getProviders(value) {
  return parseProviderList(value).map((id) => {
    const provider = PROVIDERS[id];
    if (!provider) throw new Error(`Unknown provider: ${id}. Known providers: ${Object.keys(PROVIDERS).join(', ')}`);
    return provider;
  });
}

function parseEnv(content) {
  const entries = {};
  for (const rawLine of String(content || '').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    entries[match[1]] = match[2].replace(/^"|"$/g, '');
  }
  return entries;
}

function serializeEnv(entries) {
  return `${Object.keys(entries)
    .sort()
    .map((key) => `${key}=${entries[key]}`)
    .join('\n')}\n`;
}

function writeEnvValue(envFile, key, value) {
  fs.mkdirSync(path.dirname(envFile), { recursive: true });
  const existing = fs.existsSync(envFile) ? parseEnv(fs.readFileSync(envFile, 'utf8')) : {};
  existing[key] = value;
  fs.writeFileSync(envFile, serializeEnv(existing), { mode: 0o600 });
}

function writeUserEnv(key, value) {
  if (process.platform === 'win32') {
    execFileSync('setx', [key, value], { stdio: ['ignore', 'ignore', 'ignore'] });
  } else {
    const profile = path.join(os.homedir(), '.atlas_env');
    writeEnvValue(profile, key, value);
  }
}

function updateCredentialIndex(indexFile, provider, capturedKeys, envFile, scope) {
  fs.mkdirSync(path.dirname(indexFile), { recursive: true });
  const index = fs.existsSync(indexFile)
    ? JSON.parse(fs.readFileSync(indexFile, 'utf8'))
    : {};
  const now = new Date().toISOString();

  for (const key of capturedKeys) {
    index[key] = {
      provider: provider.id,
      confirmed: true,
      storage: scope === 'user' ? 'user-env' : path.resolve(envFile),
      last_checked: now,
      value_stored: false,
    };
  }

  fs.writeFileSync(indexFile, `${JSON.stringify(index, null, 2)}\n`);
}

function mask(value) {
  if (!value) return '';
  if (value.length <= 8) return '********';
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function valueMatchesProvider(provider, value) {
  return provider.keyPatterns.some((pattern) => pattern.test(String(value || '').trim()));
}

function resolveEnvKey(provider, value) {
  if (provider.env.length === 1) return provider.env[0];
  if (/^https:\/\/.*sentry\.io\/\d+$/.test(value)) return 'SENTRY_DSN';
  if (/^[0-9]+$/.test(value)) return 'POSTHOG_PROJECT_ID';
  return provider.env[0];
}

async function waitForEnter(message) {
  await inquirer.prompt([{ type: 'input', name: 'continue', message }]);
}

async function promptForSecret(provider, envKey) {
  const answer = await inquirer.prompt([{
    type: 'password',
    name: 'value',
    mask: '*',
    message: `${provider.name} ${envKey} was not auto-detected. Paste it here`,
    validate: (value) => valueMatchesProvider(provider, value) || 'Value does not match the expected provider pattern.',
  }]);
  return answer.value.trim();
}

async function extractCandidates(page, provider) {
  const candidates = new Set();
  for (const selector of provider.selectors) {
    try {
      const locators = await page.locator(selector).all();
      for (const locator of locators.slice(0, 25)) {
        const value = (await locator.getAttribute('value').catch(() => null))
          || (await locator.textContent().catch(() => null))
          || '';
        for (const token of value.split(/\s+/)) {
          const clean = token.trim().replace(/^["'`]+|["'`,;]+$/g, '');
          if (valueMatchesProvider(provider, clean)) candidates.add(clean);
        }
      }
    } catch {}
  }
  return [...candidates];
}

function loadPlaywright() {
  const candidates = [
    'playwright',
    path.join(__dirname, '..', '..', 'node_modules', 'playwright'),
    path.join(os.homedir(), '.agents', 'skills', 'Atlas', 'node_modules', 'playwright'),
  ];
  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch {}
  }
  try {
    return require('playwright');
  } catch (error) {
    throw new Error('Playwright is required for headed credential capture. Run `npm install playwright` in the Atlas skill directory, then retry.');
  }
}

async function captureProvider(provider, options = {}) {
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({
    headless: false,
    slowMo: Number(options.slowMo || 100),
  });
  const page = await browser.newPage();
  try {
    await page.goto(provider.url, { waitUntil: 'domcontentloaded' });
    console.log(`\n${provider.name}: ${provider.url}`);
    for (const item of provider.guidance) console.log(`- ${item}`);
    await waitForEnter('Sign in, create/reveal the key, then press Enter here so Atlas can continue');

    const candidates = await extractCandidates(page, provider);
    const values = {};
    for (const candidate of candidates) {
      values[resolveEnvKey(provider, candidate)] = candidate;
    }

    for (const envKey of provider.env) {
      if (!values[envKey] && options.manualFallback !== false) {
        values[envKey] = await promptForSecret(provider, envKey);
      }
    }

    return values;
  } finally {
    await browser.close();
  }
}

async function runCredentialSetup(options = {}) {
  const projectSlug = slugify(options.project || 'default');
  const providers = getProviders(options.providers || 'core');
  const envFile = path.resolve(options.envFile || defaultEnvFile(projectSlug));
  const indexFile = path.resolve(options.indexFile || defaultCredentialIndex(projectSlug));
  const scope = options.scope === 'user' ? 'user' : 'local';
  const captured = [];

  for (const provider of providers) {
    const values = await captureProvider(provider, options);
    for (const [key, value] of Object.entries(values)) {
      if (!value) continue;
      if (scope === 'user') writeUserEnv(key, value);
      writeEnvValue(envFile, key, value);
      process.env[key] = value;
      captured.push({ provider: provider.id, key, masked: mask(value) });
    }
    updateCredentialIndex(indexFile, provider, Object.keys(values), envFile, scope);
  }

  return { project: projectSlug, envFile, indexFile, captured };
}

function parseArgs(argv) {
  const options = { providers: 'core', scope: 'local' };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--project') options.project = argv[++i];
    else if (arg === '--providers') options.providers = argv[++i];
    else if (arg === '--env-file') options.envFile = argv[++i];
    else if (arg === '--index-file') options.indexFile = argv[++i];
    else if (arg === '--scope') options.scope = argv[++i];
    else if (arg === '--no-manual-fallback') options.manualFallback = false;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log('Usage: node scripts/atlas/credential-browser.js [--project <slug>] [--providers stripe,resend] [--env-file <path>] [--scope local|user]');
    return;
  }
  const result = await runCredentialSetup(options);
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  PROVIDERS,
  defaultCredentialIndex,
  defaultEnvFile,
  getProviders,
  mask,
  parseEnv,
  parseProviderList,
  runCredentialSetup,
  serializeEnv,
  updateCredentialIndex,
  writeEnvValue,
};
