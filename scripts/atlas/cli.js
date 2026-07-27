#!/usr/bin/env node
/**
 * Atlas CLI v2.0 - Unified Command Interface
 * 
 * A comprehensive CLI for managing Atlas operations, automation,
 * and business intelligence from the command line.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const { Command } = require('commander');
const chalk = require('chalk');
const figlet = require('figlet');
const ora = require('ora');
const boxen = require('boxen');
const { CANONICAL_COMMANDS } = require('./command-registry');
const {
  validateContextState,
  validateProjectState,
  validateScoreHistory,
} = require('./state-schema');

const ROOT = path.resolve(__dirname, '../..');
const STATE_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.atlas');
const PACKAGE = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const ATLAS_VERSION = PACKAGE.version;

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function clampScore(value, max = 100) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(max, number));
}

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    if (fallback !== null) return fallback;
    throw new Error(`Could not read JSON at ${filePath}: ${error.message}`);
  }
}

function writeJsonAtomic(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(data, null, 2)}\n`);
  fs.renameSync(tempPath, filePath);
}

function getProjectPath(projectSlug) {
  return path.join(STATE_DIR, 'portfolio', projectSlug);
}

function defaultScoreHistory() {
  return {
    sovereign_scores: [],
    revenue_velocity: [],
    retention_health: [],
    cash_discipline: [],
    timestamps: []
  };
}

function defaultScores() {
  return {
    sovereign_score: 0,
    revenue_velocity: 0,
    retention_health: 0,
    cash_discipline: 0,
    last_updated: new Date().toISOString()
  };
}

function validationError(label, validation) {
  if (validation.ok) return null;
  return new Error(`${label} failed schema validation: ${validation.errors.join('; ')}`);
}

class AtlasCLI {
  constructor() {
    this.program = new Command();
    this.spinner = null;
    this.setupProgram();
  }

  setupProgram() {
    this.program
      .name('atlas')
      .description(`Atlas v${ATLAS_VERSION} CLI - The Sovereign Co-Founder`)
      .version(ATLAS_VERSION, '-v, --version', 'output Atlas version')
      .option('--verbose', 'enable verbose logging')
      .option('--json', 'output in JSON format');

    // Project management commands
    this.program
      .command('init <project-name>')
      .description('Initialize a new Atlas project')
      .option('--template <template>', 'project template (saas, ecommerce, marketplace)')
      .action(this.initProject.bind(this));

    this.program
      .command('status [project]')
      .description('Show project status and scores')
      .option('--detailed', 'show detailed metrics')
      .action(this.showStatus.bind(this));

    this.program
      .command('pause [project]')
      .description('Safely pause autonomous work for a project')
      .action(this.pauseProject.bind(this));

    this.program
      .command('commands')
      .description('List canonical /atlas commands')
      .action(this.listCommands.bind(this));

    const credentials = new Command('credentials')
      .description('Capture and store provider API credentials');
    credentials.addCommand(new Command('setup')
      .argument('[project]')
      .description('Open headed browser flows for missing provider credentials')
      .option('--providers <providers>', 'comma-separated providers or core/all', 'core')
      .option('--env-file <path>', 'env file to update')
      .option('--scope <scope>', 'local or user environment storage', 'local')
      .option('--no-manual-fallback', 'do not prompt if browser extraction cannot find a key')
      .action(this.setupCredentials.bind(this)));
    credentials.addCommand(new Command('providers')
      .description('List supported credential providers')
      .action(this.listCredentialProviders.bind(this)));
    this.program.addCommand(credentials);

    // Automation commands
    const automation = new Command('automation')
      .description('Manage automation workflows');
    automation.addCommand(new Command('list')
      .description('List available automation workflows')
      .action(this.listAutomations.bind(this)));
    automation.addCommand(new Command('import')
      .argument('<workflow>')
      .description('Import an automation workflow')
      .action(this.importAutomation.bind(this)));
    automation.addCommand(new Command('run')
      .argument('<workflow>')
      .description('Run an automation workflow')
      .action(this.runAutomation.bind(this)));
    automation.addCommand(new Command('validate')
      .argument('[workflow]')
      .description('Validate automation workflow templates')
      .action(this.validateAutomations.bind(this)));
    automation.addCommand(new Command('manifest')
      .description('Print automation library manifest')
      .action(this.automationManifest.bind(this)));
    this.program.addCommand(automation);

    // Scoring commands
    const score = new Command('score')
      .description('Manage scoring and predictions');
    score.addCommand(new Command('calculate')
      .argument('[project]')
      .description('Calculate current scores')
      .action(this.calculateScores.bind(this)));
    score.addCommand(new Command('predict')
      .argument('[project]')
      .description('Generate score predictions')
      .option('--days <days>', 'prediction horizon in days', '7')
      .action(this.predictScores.bind(this)));
    score.addCommand(new Command('history')
      .argument('[project]')
      .description('Show score history')
      .option('--days <days>', 'history days to show', '30')
      .action(this.showScoreHistory.bind(this)));
    this.program.addCommand(score);

    // Context commands
    const context = new Command('context')
      .description('Manage context compression and phase summaries');
    context.addCommand(new Command('compress')
      .argument('[project]')
      .description('Compress completed phase outputs into summaries to reduce context overhead')
      .action(this.compressContext.bind(this)));
    context.addCommand(new Command('verify')
      .argument('[project]')
      .description('Verify critical state is intact on disk')
      .action(this.verifyContext.bind(this)));
    this.program.addCommand(context);

    // Fusion commands
    const fusion = new Command('fusion')
      .description('Manage agent fusion and routing');
    fusion.addCommand(new Command('agents')
      .description('List available agents')
      .action(this.listAgents.bind(this)));
    fusion.addCommand(new Command('route')
      .argument('<task>')
      .description('Route a task to best agent')
      .action(this.routeTask.bind(this)));
    fusion.addCommand(new Command('performance')
      .description('Show agent performance metrics')
      .action(this.showAgentPerformance.bind(this)));
    this.program.addCommand(fusion);

    // Diagnostic commands
    this.program
      .command('diagnose [project]')
      .description('Run comprehensive diagnostics')
      .option('--fix', 'automatically fix issues')
      .action(this.runDiagnostics.bind(this));

    // Module commands
    const module = new Command('module')
      .description('Manage Atlas modules');
    module.addCommand(new Command('run')
      .argument('<module>')
      .description('Run a specific module')
      .option('--section <section>', 'Filter and print only a specific section/heading of the module')
      .action(this.runModule.bind(this)));
    module.addCommand(new Command('list')
      .description('List available modules')
      .action(this.listModules.bind(this)));
    this.program.addCommand(module);

    // Portfolio commands
    const portfolio = new Command('portfolio')
      .description('Manage project portfolio');
    portfolio.addCommand(new Command('list')
      .description('List all projects in portfolio')
      .action(this.listPortfolio.bind(this)));
    portfolio.addCommand(new Command('rebalance')
      .description('Rebalance portfolio lanes')
      .action(this.rebalancePortfolio.bind(this)));
    portfolio.addCommand(new Command('focus')
      .argument('<project>')
      .description('Set project as primary focus')
      .action(this.focusProject.bind(this)));
    this.program.addCommand(portfolio);

    // Utility commands
    this.program
      .command('dashboard')
      .description('Open Atlas dashboard')
      .action(this.openDashboard.bind(this));

    this.program
      .command('report')
      .description('Generate comprehensive report')
      .option('--format <format>', 'report format (html, pdf, markdown)', 'markdown')
      .action(this.generateReport.bind(this));

    this.program
      .command('backup')
      .description('Backup Atlas state')
      .action(this.backupState.bind(this));

    this.program
      .command('restore <backup-file>')
      .description('Restore Atlas state from backup')
      .action(this.restoreState.bind(this));
  }

  async initProject(name, options) {
    this.startSpinner(`Initializing project: ${name}`);
    
    try {
      const slug = slugify(name);
      if (!slug) throw new Error('Project name must include at least one letter or number');

      const projectPath = getProjectPath(slug);
      if (fs.existsSync(path.join(projectPath, 'context.json'))) {
        throw new Error(`Project already exists: ${slug}`);
      }
      
      // Create project directory structure
      fs.mkdirSync(projectPath, { recursive: true });
      fs.mkdirSync(path.join(projectPath, 'incidents'), { recursive: true });
      fs.mkdirSync(path.join(projectPath, 'reports'), { recursive: true });
      fs.mkdirSync(path.join(projectPath, 'backups'), { recursive: true });
      
      // Initialize project state
      const initialState = {
        project: {
          name,
          slug,
          created_at: new Date().toISOString(),
          template: options.template || 'saas',
          status: 'initialized'
        },
        scores: defaultScores(),
        context: {
          current_phase: 0,
          mode: 'first_run',
          last_activity: new Date().toISOString()
        }
      };

      const stateError = validationError('context.json', validateContextState(initialState));
      if (stateError) throw stateError;
      
      writeJsonAtomic(path.join(projectPath, 'context.json'), initialState);
      
      // Create empty score history
      const initialHistory = defaultScoreHistory();
      const historyError = validationError('score_history.json', validateScoreHistory(initialHistory));
      if (historyError) throw historyError;
      writeJsonAtomic(path.join(projectPath, 'score_history.json'), initialHistory);
      
      this.stopSpinner(`Project ${name} initialized successfully!`);
      console.log(chalk.green(`\nProject created at: ${projectPath}`));
      
      // Show next steps
      console.log(chalk.blue('\nNext steps:'));
      console.log('1. Run `atlas diagnose` to check current state');
      console.log('2. Run `atlas module run onboarding` to start setup');
      console.log('3. Visit the dashboard with `atlas dashboard`');
      
    } catch (error) {
      this.stopSpinner(`Failed to initialize project: ${error.message}`, false);
    }
  }

  async showStatus(project, options) {
    this.startSpinner('Loading project status...');
    
    try {
      const projectSlug = project || this.detectCurrentProject();
      const projectPath = getProjectPath(projectSlug);
      
      if (!fs.existsSync(projectPath)) {
        throw new Error(`Project not found: ${projectSlug}`);
      }
      
      const context = this.loadProject(projectSlug);
      
      const scores = { ...defaultScores(), ...(context.scores || {}) };
      
      this.stopSpinner();

      if (this.program.opts().json) {
        console.log(JSON.stringify({ project: context.project, context: context.context, scores }, null, 2));
        return;
      }
      
      // Display status in a nice format
      console.log(boxen(
        `📊 ${chalk.bold(context.project?.name || projectSlug)} Status\n` +
        `Mode: ${chalk.blue(context.context?.mode || 'unknown')} | Phase: ${chalk.blue(context.context?.current_phase ?? 'unknown')}\n` +
        `Last updated: ${new Date(scores.last_updated || Date.now()).toLocaleString()}`,
        { padding: 1, borderColor: 'blue' }
      ));
      
      // Display scores
      console.log('\n' + chalk.bold('📈 Current Scores:'));
      this.displayScoreBar('Sovereign Score', scores.sovereign_score, 100);
      this.displayScoreBar('Revenue Velocity', scores.revenue_velocity, 100);
      this.displayScoreBar('Retention Health', scores.retention_health, 100);
      this.displayScoreBar('Cash Discipline', scores.cash_discipline, 100);
      
      if (options.detailed) {
        console.log('\n' + chalk.bold('🔍 Detailed Metrics:'));
        // Add detailed metrics here
      }
      
    } catch (error) {
      this.stopSpinner(`Failed to load status: ${error.message}`, false);
    }
  }

  async pauseProject(project) {
    const projectSlug = project || this.detectCurrentProject();
    const projectPath = getProjectPath(projectSlug);
    const state = this.loadProject(projectSlug);
    const pausedAt = new Date().toISOString();
    const nextState = {
      ...state,
      context: {
        ...state.context,
        mode: 'paused',
        paused_at: pausedAt,
        last_activity: pausedAt,
      },
    };

    const error = validationError('context.json', validateContextState(nextState));
    if (error) throw error;
    writeJsonAtomic(path.join(projectPath, 'context.json'), nextState);
    console.log(`Atlas paused for ${projectSlug}.`);

    // Auto-compress completed phases on pause to prevent context bloat
    try {
      const ContextCompressor = require('./context-compressor');
      const portfolioPath = path.join(STATE_DIR, 'portfolio');
      const compressor = new ContextCompressor(portfolioPath);
      const result = await compressor.compress(projectSlug);
      if (result.compressed > 0) {
        console.log(chalk.blue(`✓ Auto-compressed ${result.compressed} phase(s) to reduce context overhead.`));
      }
    } catch (compressionErr) {
      // Non-fatal: log but don't fail the pause
      console.log(chalk.yellow(`⚠ Context compression skipped: ${compressionErr.message}`));
    }
  }

  async compressContext(project) {
    const projectSlug = project || this.detectCurrentProject();
    this.startSpinner('Compressing phase context...');
    try {
      const ContextCompressor = require('./context-compressor');
      const portfolioPath = path.join(STATE_DIR, 'portfolio');
      const compressor = new ContextCompressor(portfolioPath);
      const result = await compressor.compress(projectSlug);
      this.stopSpinner(`Compressed ${result.compressed} phase(s).`);
      console.log(chalk.green(`Summaries written to: ${result.summariesDir}`));
    } catch (err) {
      this.stopSpinner(`Compression failed: ${err.message}`, false);
    }
  }

  async verifyContext(project) {
    const projectSlug = project || this.detectCurrentProject();
    try {
      const ContextCompressor = require('./context-compressor');
      const portfolioPath = path.join(STATE_DIR, 'portfolio');
      const compressor = new ContextCompressor(portfolioPath);
      const state = compressor.verifyCriticalState(projectSlug);
      if (this.program.opts().json) {
        console.log(JSON.stringify(state, null, 2));
      } else {
        console.log(chalk.bold('Critical State Verification:\n'));
        console.log(`  Production URL : ${state.productionUrl}`);
        console.log(`  Sovereign Score: ${state.sovereignScore}`);
        console.log(`  Completed Phases: ${state.completedPhases.join(', ') || 'none'}`);
        console.log(`  Pending Actions: ${state.pendingActions.length}`);
        console.log(`  Last Commit    : ${state.lastCommit}`);
      }
    } catch (err) {
      console.error(chalk.red(`Verification failed: ${err.message}`));
      process.exitCode = 1;
    }
  }

  displayScoreBar(label, score, max) {
    const safeScore = clampScore(score, max);
    const percentage = (safeScore / max) * 100;
    const barLength = 20;
    const filled = Math.round((percentage / 100) * barLength);
    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
    
    let color = chalk.red;
    if (percentage >= 60) color = chalk.yellow;
    if (percentage >= 80) color = chalk.green;
    
    console.log(`${label}:`);
    console.log(`  ${color(bar)} ${color(safeScore.toFixed(1))}/${max}`);
  }

  async listCommands() {
    const commands = CANONICAL_COMMANDS.map((command) => ({ ...command }));

    if (this.program.opts().json) {
      console.log(JSON.stringify({ count: commands.length, commands }, null, 2));
      return;
    }

    console.log(chalk.bold('Canonical /atlas Commands:\n'));
    for (const command of commands) {
      const routed = command.cli ? ` -> atlas ${command.cli}` : command.module ? ` -> ${command.module}` : '';
      console.log(`${chalk.blue(command.slash)}${routed}`);
      console.log(`  ${command.description}`);
    }
  }

  async listAutomations() {
    this.startSpinner('Loading automation workflows...');
    
    try {
      const { buildManifest } = require('./automation-library');
      const manifest = buildManifest(path.join(ROOT, 'automation-library'));
      
      this.stopSpinner();

      if (this.program.opts().json) {
        console.log(JSON.stringify(manifest, null, 2));
        return;
      }
      
      console.log(chalk.bold('🤖 Available Automation Workflows:\n'));
      
      manifest.workflows.forEach(workflow => {
        const status = workflow.ok ? 'OK' : 'FAIL';
        console.log(chalk.blue(`• ${workflow.name}`));
        console.log(`  File: ${workflow.file}`);
        console.log(`  Nodes: ${workflow.nodes} | Readiness: ${workflow.readiness}/100 | ${status}`);
        console.log(`  Required env: ${workflow.required_env.join(', ') || 'none'}`);
        console.log('');
      });
      
    } catch (error) {
      this.stopSpinner(`Failed to list automations: ${error.message}`, false);
    }
  }

  async listCredentialProviders() {
    const { PROVIDERS } = require('./credential-browser');
    const providers = Object.values(PROVIDERS).map((provider) => ({
      id: provider.id,
      name: provider.name,
      url: provider.url,
      env: provider.env,
    }));

    if (this.program.opts().json) {
      console.log(JSON.stringify({ providers }, null, 2));
      return;
    }

    console.log(chalk.bold('Supported Credential Providers:\n'));
    for (const provider of providers) {
      console.log(`${chalk.blue(provider.id)} (${provider.name})`);
      console.log(`  URL: ${provider.url}`);
      console.log(`  Env: ${provider.env.join(', ')}`);
    }
  }

  async setupCredentials(project, options) {
    try {
      const { runCredentialSetup } = require('./credential-browser');
      const projectSlug = project || this.detectCurrentProject();
      const result = await runCredentialSetup({
        project: projectSlug,
        providers: options.providers,
        envFile: options.envFile,
        scope: options.scope,
        manualFallback: options.manualFallback,
      });

      if (this.program.opts().json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      console.log(chalk.green(`Credential capture complete for ${projectSlug}`));
      console.log(`Env file: ${result.envFile}`);
      console.log(`Index: ${result.indexFile}`);
      for (const item of result.captured) {
        console.log(`  ${item.key}: ${item.masked} (${item.provider})`);
      }
    } catch (error) {
      console.error(chalk.red(error.message));
      process.exitCode = 1;
    }
  }

  async calculateScores(project) {
    try {
      const projectSlug = project || this.detectCurrentProject();
      this.startSpinner(`Calculating scores for ${projectSlug}...`);

      const projectPath = getProjectPath(projectSlug);
      const context = this.loadProject(projectSlug);
      const current = { ...defaultScores(), ...(context.scores || {}) };
      const PredictiveScoringEngine = require('./predictive-scoring');
      const engine = new PredictiveScoringEngine(projectSlug);
      const analysis = engine.generateInsights(current);
      
      this.stopSpinner('Scores calculated successfully!');

      if (this.program.opts().json) {
        console.log(JSON.stringify(analysis, null, 2));
        return;
      }
      
      console.log('\n' + chalk.bold('🎯 Calculated Scores:'));
      Object.entries(analysis.current_scores).forEach(([key, value]) => {
        if (typeof value !== 'number') return;
        console.log(`  ${chalk.blue(key.replace(/_/g, ' ').toUpperCase())}: ${chalk.green(clampScore(value).toFixed(1))}/100`);
      });

      if (analysis.insights.length) {
        console.log('\n' + chalk.bold('Insights:'));
        analysis.insights.forEach((insight) => console.log(`  - ${insight.message}`));
      }
      
    } catch (error) {
      this.stopSpinner(`Failed to calculate scores: ${error.message}`, false);
    }
  }

  async runDiagnostics(project, options) {
    try {
      const projectSlug = project || this.detectCurrentProject();
      this.startSpinner(`Running diagnostics for ${projectSlug}...`);

      const projectPath = getProjectPath(projectSlug);
      const contextPath = path.join(projectPath, 'context.json');
      const scoreHistoryPath = path.join(projectPath, 'score_history.json');
      const context = fs.existsSync(contextPath) ? readJson(contextPath, {}) : {};

      let hasRemote = false;
      try {
        hasRemote = Boolean(execSync('git remote get-url origin', { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim());
      } catch {}

      const diagnostics = [
        { check: 'Project directory', ok: fs.existsSync(projectPath), message: projectPath },
        { check: 'context.json', ok: fs.existsSync(contextPath), message: fs.existsSync(contextPath) ? 'present' : 'missing' },
        { check: 'score_history.json', ok: fs.existsSync(scoreHistoryPath), message: fs.existsSync(scoreHistoryPath) ? 'present' : 'missing' },
        { check: 'Git remote', ok: hasRemote, warn: true, message: hasRemote ? 'origin configured' : 'no origin remote configured' },
        { check: 'Legal docs', ok: ['TERMS_OF_SERVICE.md', 'PRIVACY_POLICY.md', 'COMPLIANCE_CHECKLIST.md'].every((file) => fs.existsSync(path.join(ROOT, 'docs', 'legal', file))), message: 'docs/legal baseline' },
        { check: 'Automation library', ok: fs.existsSync(path.join(ROOT, 'automation-library')), message: 'automation-library directory' },
        { check: 'Revenue tracking', ok: Boolean(process.env.STRIPE_SECRET_KEY), warn: true, message: process.env.STRIPE_SECRET_KEY ? 'STRIPE_SECRET_KEY present' : 'STRIPE_SECRET_KEY not set' },
        { check: 'Monitoring', ok: Boolean(process.env.BETTER_UPTIME_API_KEY || context.monitoring?.url), warn: true, message: process.env.BETTER_UPTIME_API_KEY ? 'Better Uptime key present' : 'no monitor configured' },
      ];

      if (options.fix) {
        fs.mkdirSync(projectPath, { recursive: true });
        if (!fs.existsSync(contextPath)) {
          writeJsonAtomic(contextPath, {
            project: { name: projectSlug, slug: projectSlug, created_at: new Date().toISOString(), status: 'recovered' },
            scores: defaultScores(),
            context: { current_phase: 0, mode: 'recovered', last_activity: new Date().toISOString() }
          });
        }
        if (!fs.existsSync(scoreHistoryPath)) {
          writeJsonAtomic(scoreHistoryPath, defaultScoreHistory());
        }
      }

      const stateValidation = validateProjectState(projectPath);
      const contextValidation = stateValidation.results.find((result) => result.file === 'context.json');
      const historyValidation = stateValidation.results.find((result) => result.file === 'score_history.json');
      diagnostics.splice(3, 0,
        {
          check: 'context.json schema',
          ok: Boolean(contextValidation?.ok),
          message: contextValidation?.ok
            ? 'valid'
            : (contextValidation?.errors || ['unavailable']).join('; '),
        },
        {
          check: 'score_history.json schema',
          ok: Boolean(historyValidation?.ok),
          message: historyValidation?.ok
            ? 'valid'
            : (historyValidation?.errors || ['unavailable']).join('; '),
        }
      );
      
      this.stopSpinner();

      if (this.program.opts().json) {
        console.log(JSON.stringify({ project: projectSlug, diagnostics }, null, 2));
        return;
      }
      
      console.log(chalk.bold('🔍 Diagnostic Results:\n'));
      
      diagnostics.forEach(d => {
        const symbol = d.ok ? 'OK' : d.warn ? 'WARN' : 'FAIL';
        let statusColor = d.ok ? chalk.green : d.warn ? chalk.yellow : chalk.red;
        
        console.log(`${statusColor(symbol)} ${d.check}: ${d.message}`);
      });
      
      const criticalCount = diagnostics.filter(d => !d.ok && !d.warn).length;
      const warningCount = diagnostics.filter(d => !d.ok && d.warn).length;
      
      console.log(`\n${chalk.bold('Summary:')} ${criticalCount} critical, ${warningCount} warnings`);
      
      if (options.fix) {
        console.log('\n' + chalk.green('Auto-fix created any missing local state files.'));
      }
      
    } catch (error) {
      this.stopSpinner(`Diagnostics failed: ${error.message}`, false);
    }
  }

  async openDashboard() {
    this.startSpinner('Opening dashboard...');
    
    try {
      const dashboardPath = path.join(STATE_DIR, 'dashboard.html');
      
      // Generate or update dashboard
      if (!fs.existsSync(dashboardPath)) {
        this.generateDashboard();
      }
      
      const opener = process.platform === 'win32'
        ? ['cmd', ['/c', 'start', '', dashboardPath]]
        : process.platform === 'darwin'
          ? ['open', [dashboardPath]]
          : ['xdg-open', [dashboardPath]];
      const child = spawn(opener[0], opener[1], { stdio: 'ignore', detached: true });
      child.unref();
      
      this.stopSpinner('Dashboard opened in browser!');
      
    } catch (error) {
      this.stopSpinner(`Failed to open dashboard: ${error.message}`, false);
    }
  }

  generateDashboard() {
    fs.mkdirSync(STATE_DIR, { recursive: true });
    const projects = this.getProjects().map((project) => {
      const context = readJson(path.join(getProjectPath(project), 'context.json'), {});
      return {
        name: context.project?.name || project,
        slug: project,
        score: clampScore(context.scores?.sovereign_score),
        phase: context.context?.current_phase ?? 0,
        mode: context.context?.mode || 'unknown'
      };
    });
    const averageScore = projects.length
      ? Math.round((projects.reduce((sum, project) => sum + project.score, 0) / projects.length) * 10) / 10
      : 0;

    const template = `
<!DOCTYPE html>
<html>
<head>
    <title>Atlas Dashboard</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 40px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .card h3 { margin-top: 0; color: #333; }
        .score { font-size: 48px; font-weight: bold; text-align: center; margin: 20px 0; }
        .score.good { color: #10b981; }
        .score.warning { color: #f59e0b; }
        .score.bad { color: #ef4444; }
        .progress-bar { height: 10px; background: #e5e7eb; border-radius: 5px; overflow: hidden; margin: 10px 0; }
        .progress { height: 100%; background: #3b82f6; }
        .actions { display: flex; gap: 10px; margin-top: 20px; }
        .btn { padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer; }
        .btn:hover { background: #2563eb; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Atlas Dashboard</h1>
            <p>Your autonomous business operating system</p>
        </div>
        
        <div class="grid">
            <div class="card">
                <h3>Sovereign Score</h3>
                <div class="score good" id="sovereign-score">${averageScore}</div>
                <div class="progress-bar"><div class="progress" id="sovereign-progress" style="width: ${averageScore}%"></div></div>
                <p>Measures how close your business is to running itself.</p>
            </div>
            
            <div class="card">
                <h3>Revenue Velocity</h3>
                <div class="score warning" id="revenue-velocity">${projects.length}</div>
                <div class="progress-bar"><div class="progress" id="velocity-progress" style="width: ${Math.min(100, projects.length * 10)}%"></div></div>
                <p>Tracked portfolio projects.</p>
            </div>
            
            <div class="card">
                <h3>Active Projects</h3>
                <div class="score" id="project-count">${projects.length}</div>
                <div id="project-list">${projects.map((project) => `<div style="margin: 5px 0; padding: 5px; background: #f8f9fa; border-radius: 3px;"><strong>${project.name}</strong> - Score: ${project.score} - Phase: ${project.phase}</div>`).join('') || 'No projects yet.'}</div>
            </div>
            
            <div class="card">
                <h3>Recent Activity</h3>
                <div id="activity-log">Generated ${new Date().toLocaleString()}</div>
            </div>
            
            <div class="card">
                <h3>Quick Actions</h3>
                <div class="actions">
                    <button class="btn" onclick="runDiagnostics()">Run Diagnostics</button>
                    <button class="btn" onclick="calculateScores()">Update Scores</button>
                    <button class="btn" onclick="generateReport()">Generate Report</button>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        const atlasSnapshot = ${JSON.stringify({ generated_at: new Date().toISOString(), projects }, null, 10)};

        // Action functions
        function runDiagnostics() {
            alert('Run \`atlas diagnose <project>\` in your terminal.');
        }
        
        function calculateScores() {
            alert('Run \`atlas score calculate <project>\` in your terminal.');
        }
        
        function generateReport() {
            alert('Run \`atlas report\` in your terminal.');
        }
    </script>
</body>
</html>`;
    
    fs.writeFileSync(path.join(STATE_DIR, 'dashboard.html'), template);
  }

  getProjects() {
    const portfolioDir = path.join(STATE_DIR, 'portfolio');
    if (!fs.existsSync(portfolioDir)) return [];
    return fs.readdirSync(portfolioDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  }

  loadProject(projectSlug) {
    const projectPath = getProjectPath(projectSlug);
    if (!fs.existsSync(projectPath)) throw new Error(`Project not found: ${projectSlug}`);
    const context = readJson(path.join(projectPath, 'context.json'));
    const error = validationError('context.json', validateContextState(context));
    if (error) throw error;
    return context;
  }

  loadScoreHistory(projectSlug) {
    const historyPath = path.join(getProjectPath(projectSlug), 'score_history.json');
    const history = readJson(historyPath, defaultScoreHistory());
    const error = validationError('score_history.json', validateScoreHistory(history));
    if (error) throw error;
    return history;
  }

  detectCurrentProject() {
    // Try to detect current project from context
    const cwd = process.cwd();
    const cwdName = slugify(path.basename(cwd));
    
    const projects = this.getProjects();
    if (projects.includes(cwdName)) {
      return cwdName;
    }
    if (projects.length === 1) return projects[0];

    throw new Error(projects.length
      ? `No project specified. Choose one: ${projects.join(', ')}`
      : 'No Atlas projects found. Run `atlas init <project-name>` first.');
  }

  async importAutomation(workflow) {
    const { validateWorkflow } = require('./automation-library');
    const file = path.join(ROOT, 'automation-library', workflow.endsWith('.json') ? workflow : `${workflow}.json`);
    const content = readJson(file);
    const validation = validateWorkflow(content, file);
    if (!validation.ok) throw new Error(`Workflow failed validation: ${validation.errors.join('; ')}`);
    console.log(JSON.stringify({
      imported: path.basename(file),
      name: content.name,
      node_count: Array.isArray(content.nodes) ? content.nodes.length : 0,
      readiness: validation.readiness,
      required_env: validation.required_env,
      status: 'validated'
    }, null, 2));
  }

  async runAutomation(workflow) {
    const { validateWorkflow } = require('./automation-library');
    const file = path.join(ROOT, 'automation-library', workflow.endsWith('.json') ? workflow : `${workflow}.json`);
    const content = readJson(file);
    const validation = validateWorkflow(content, file);
    if (!validation.ok) throw new Error(`Workflow failed validation: ${validation.errors.join('; ')}`);
    console.log(chalk.red.bold('STATUS: DRY-RUN ONLY. NOT RUNNING IN PRODUCTION.'));
    console.log(chalk.yellow(`Validated template: ${content.name || workflow}`));
    console.log(`Nodes validated: ${Array.isArray(content.nodes) ? content.nodes.length : 0}`);
    console.log(`Readiness: ${validation.readiness}/100`);
    console.log(`Required env: ${validation.required_env.join(', ') || 'none'}`);
    console.log('Import into n8n, configure listed credentials, run once manually, then activate.');
  }

  async validateAutomations(workflow) {
    const { buildManifest, validateWorkflow } = require('./automation-library');
    if (workflow) {
      const file = path.join(ROOT, 'automation-library', workflow.endsWith('.json') ? workflow : `${workflow}.json`);
      const result = validateWorkflow(readJson(file), file);
      console.log(JSON.stringify(result, null, 2));
      if (!result.ok) process.exitCode = 1;
      return;
    }
    const manifest = buildManifest(path.join(ROOT, 'automation-library'));
    console.log(JSON.stringify(manifest, null, 2));
    if (manifest.failed) process.exitCode = 1;
  }

  async automationManifest() {
    const { buildManifest } = require('./automation-library');
    const manifest = buildManifest(path.join(ROOT, 'automation-library'));
    console.log(JSON.stringify(manifest, null, 2));
  }

  async predictScores(project, options) {
    const projectSlug = project || this.detectCurrentProject();
    const days = Math.max(1, Number.parseInt(options.days, 10) || 7);
    const PredictiveScoringEngine = require('./predictive-scoring');
    const engine = new PredictiveScoringEngine(projectSlug);
    const prediction = engine.predictTrend(engine.history.sovereign_scores, days);
    console.log(JSON.stringify({ project: projectSlug, days, sovereign_score: prediction }, null, 2));
  }

  async showScoreHistory(project, options) {
    const projectSlug = project || this.detectCurrentProject();
    const days = Math.max(1, Number.parseInt(options.days, 10) || 30);
    const history = this.loadScoreHistory(projectSlug);
    const rows = history.timestamps.slice(-days).map((timestamp, index, timestamps) => {
      const sourceIndex = history.timestamps.length - timestamps.length + index;
      return {
        timestamp,
        sovereign_score: history.sovereign_scores[sourceIndex],
        revenue_velocity: history.revenue_velocity[sourceIndex],
        retention_health: history.retention_health[sourceIndex],
        cash_discipline: history.cash_discipline[sourceIndex]
      };
    });
    console.log(JSON.stringify({ project: projectSlug, rows }, null, 2));
  }

  async listAgents() {
    const agents = [
      { id: 'atlas-product', focus: 'product, bugs, UX, reliability' },
      { id: 'atlas-growth', focus: 'acquisition, content, funnel, first dollar' },
      { id: 'atlas-ops', focus: 'monitoring, automation, incidents, deployments' },
      { id: 'atlas-money', focus: 'pricing, cashflow, revenue intelligence' }
    ];
    console.log(JSON.stringify({ agents }, null, 2));
  }

  async routeTask(task) {
    const normalized = task.toLowerCase();

    // Domain keyword sets with weights
    const DOMAINS = [
      {
        agent: 'atlas-growth',
        keywords: ['growth', 'content', 'launch', 'customer', 'outreach', 'funnel',
                   'acquisition', 'seo', 'marketing', 'email', 'social', 'campaign']
      },
      {
        agent: 'atlas-ops',
        keywords: ['monitor', 'deploy', 'incident', 'uptime', 'automation', 'ci',
                   'pipeline', 'infrastructure', 'server', 'alert', 'rollback', 'build']
      },
      {
        agent: 'atlas-money',
        keywords: ['price', 'pricing', 'revenue', 'cash', 'mrr', 'billing', 'churn',
                   'subscription', 'stripe', 'invoice', 'arr', 'payment', 'refund']
      },
      {
        agent: 'atlas-product',
        keywords: ['bug', 'ux', 'feature', 'product', 'design', 'fix', 'reliability',
                   'performance', 'api', 'database', 'schema', 'test', 'quality']
      }
    ];

    // Score each domain by how many keywords appear in the task
    const scores = DOMAINS.map(domain => ({
      agent: domain.agent,
      score: domain.keywords.filter(kw => normalized.includes(kw)).length,
      matched: domain.keywords.filter(kw => normalized.includes(kw))
    }));

    const maxScore = Math.max(...scores.map(s => s.score));
    const winners = scores.filter(s => s.score === maxScore);

    let agent;
    let confidence;
    let tie_broken_by = null;

    if (maxScore === 0) {
      // No domain keyword matched — default to product with explicit low confidence
      agent = 'atlas-product';
      confidence = 'low';
    } else if (winners.length === 1) {
      agent = winners[0].agent;
      confidence = maxScore >= 2 ? 'high' : 'medium';
    } else {
      // Tie: apply priority order (ops > money > growth > product) for determinism
      const PRIORITY = ['atlas-ops', 'atlas-money', 'atlas-growth', 'atlas-product'];
      agent = PRIORITY.find(p => winners.some(w => w.agent === p));
      confidence = 'medium';
      tie_broken_by = `Tie between [${winners.map(w => w.agent).join(', ')}]; ops>money>growth>product priority applied`;
    }

    const matchedDomain = scores.find(s => s.agent === agent);
    const result = {
      task,
      agent,
      confidence,
      matched_keywords: matchedDomain ? matchedDomain.matched : [],
      all_scores: scores.map(s => ({ agent: s.agent, score: s.score }))
    };
    if (tie_broken_by) result.tie_broken_by = tie_broken_by;

    console.log(JSON.stringify(result, null, 2));
  }

  async showAgentPerformance() {
    console.log(JSON.stringify({
      status: 'no runtime performance log found',
      next_step: 'Run weekly-review to begin collecting agent performance signals'
    }, null, 2));
  }

  async runModule(moduleName, options = {}) {
    const file = path.join(ROOT, moduleName.endsWith('.md') ? moduleName : `${moduleName}.md`);
    if (!fs.existsSync(file)) throw new Error(`Module not found: ${moduleName}`);
    const content = fs.readFileSync(file, 'utf8');
    if (options && options.section) {
      const target = String(options.section).trim().toLowerCase();
      const lines = content.split(/\r?\n/);
      let recording = false;
      const matched = [];
      for (const line of lines) {
        if (line.startsWith('#')) {
          const heading = line.replace(/^#+\s*/, '').trim().toLowerCase();
          if (heading.includes(target)) {
            recording = true;
          } else if (recording) {
            break;
          }
        }
        if (recording) {
          matched.push(line);
        }
      }
      if (matched.length) {
        console.log(matched.join('\n'));
        return;
      }
      console.log(chalk.yellow(`Section "${options.section}" not found in ${path.basename(file)}. Displaying module preview:`));
      console.log(lines.slice(0, 30).join('\n'));
      return;
    }
    console.log(content);
  }

  async listModules() {
    const modules = fs.readdirSync(ROOT)
      .filter((file) => file.endsWith('.md'))
      .sort();
    console.log(modules.join('\n'));
  }

  async listPortfolio() {
    const projects = this.getProjects().map((project) => {
      const context = this.loadProject(project);
      return {
        slug: project,
        name: context.project?.name || project,
        phase: context.context?.current_phase ?? null,
        sovereign_score: context.scores?.sovereign_score ?? null
      };
    });
    console.log(JSON.stringify({ projects }, null, 2));
  }

  async rebalancePortfolio() {
    const projects = this.getProjects();
    const ranked = projects
      .map((project) => ({ project, context: readJson(path.join(getProjectPath(project), 'context.json'), {}) }))
      .sort((a, b) => (b.context.scores?.sovereign_score || 0) - (a.context.scores?.sovereign_score || 0))
      .map((entry, index) => ({ slug: entry.project, lane: index === 0 ? 'primary' : 'watchlist' }));
    console.log(JSON.stringify({ lanes: ranked }, null, 2));
  }

  async focusProject(project) {
    const slug = slugify(project);
    this.loadProject(slug);
    writeJsonAtomic(path.join(STATE_DIR, 'active-project.json'), { slug, updated_at: new Date().toISOString() });
    console.log(chalk.green(`Focused project: ${slug}`));
  }

  async generateReport(options) {
    fs.mkdirSync(path.join(STATE_DIR, 'reports'), { recursive: true });
    const projects = this.getProjects();
    const lines = [
      `# Atlas Portfolio Report`,
      ``,
      `Generated: ${new Date().toISOString()}`,
      `Format requested: ${options.format}`,
      ``,
      `## Projects`,
      ...projects.map((project) => {
        const context = readJson(path.join(getProjectPath(project), 'context.json'), {});
        return `- ${context.project?.name || project}: score ${context.scores?.sovereign_score ?? 0}, phase ${context.context?.current_phase ?? 0}`;
      })
    ];
    const reportPath = path.join(STATE_DIR, 'reports', `atlas-report-${new Date().toISOString().slice(0, 10)}.md`);
    fs.writeFileSync(reportPath, `${lines.join('\n')}\n`);
    console.log(chalk.green(`Report written: ${reportPath}`));
  }

  async backupState() {
    const backupDir = path.join(STATE_DIR, 'backups');
    fs.mkdirSync(backupDir, { recursive: true });
    const backupPath = path.join(backupDir, `atlas-state-${Date.now()}.json`);
    const snapshot = {
      created_at: new Date().toISOString(),
      projects: this.getProjects().map((project) => ({
        slug: project,
        context: readJson(path.join(getProjectPath(project), 'context.json'), null)
      }))
    };
    writeJsonAtomic(backupPath, snapshot);
    console.log(chalk.green(`Backup written: ${backupPath}`));
  }

  async restoreState(backupFile) {
    const backup = readJson(path.resolve(backupFile));
    if (!Array.isArray(backup.projects)) throw new Error('Backup file does not include a projects array');
    for (const project of backup.projects) {
      if (!project || !project.slug || !project.context) continue;
      const projectSlug = slugify(project.slug);
      writeJsonAtomic(path.join(getProjectPath(projectSlug), 'context.json'), project.context);
    }
    console.log(chalk.green(`Restored ${backup.projects.length} project contexts`));
  }

  startSpinner(text) {
    if (!process.stderr.isTTY) {
      this.spinner = null;
      return;
    }
    if (this.spinner) {
      this.spinner.stop();
    }
    this.spinner = ora(text).start();
  }

  stopSpinner(text = null, success = true) {
    if (this.spinner) {
      if (text) {
        if (success) {
          this.spinner.succeed(text);
        } else {
          this.spinner.fail(text);
        }
      } else {
        this.spinner.stop();
      }
      this.spinner = null;
    }
  }

  async run() {
    const args = process.argv.slice(2);
    const quiet = args.includes('--version') || args.includes('-v') || args.includes('--help') || args.includes('-h') || args.includes('--json');
    if (!quiet) {
      console.log(chalk.blue(figlet.textSync('Atlas', { horizontalLayout: 'full' })));
      console.log(chalk.gray(`The Sovereign Co-Founder v${ATLAS_VERSION}\n`));
    }
    
    // Parse arguments
    await this.program.parseAsync(process.argv);
    
    // If no command provided, show help
    if (!args.length) {
      this.program.outputHelp();
    }
  }
}

// Run CLI
if (require.main === module) {
  const cli = new AtlasCLI();
  cli.run().catch((error) => {
    console.error(chalk.red(error.message));
    process.exitCode = 1;
  });
}

module.exports = AtlasCLI;
