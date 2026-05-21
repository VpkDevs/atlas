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
const inquirer = require('inquirer');
const ora = require('ora');
const boxen = require('boxen');

const ROOT = path.resolve(__dirname, '../..');
const STATE_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.atlas');

class AtlasCLI {
  constructor() {
    this.program = new Command();
    this.spinner = null;
    this.setupProgram();
  }

  setupProgram() {
    this.program
      .name('atlas')
      .description('Atlas v8.3 CLI - The Sovereign Money Engine')
      .version('8.3.0', '-v, --version', 'output Atlas version')
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

    // Scoring commands
    const score = new Command('score')
      .description('Manage scoring and predictions');
    
    score.command('calculate [project]')
      .description('Calculate current scores')
      .action(this.calculateScores.bind(this));
      
    score.command('predict [project]')
      .description('Generate score predictions')
      .option('--days <days>', 'prediction horizon in days', '7')
      .action(this.predictScores.bind(this));
      
    score.command('history [project]')
      .description('Show score history')
      .option('--days <days>', 'history days to show', '30')
      .action(this.showScoreHistory.bind(this));

    this.program.addCommand(score);

    // Fusion commands
    const fusion = new Command('fusion')
      .description('Manage agent fusion and routing');
      
    fusion.command('agents')
      .description('List available agents')
      .action(this.listAgents.bind(this));
      
    fusion.command('route <task>')
      .description('Route a task to best agent')
      .action(this.routeTask.bind(this));
      
    fusion.command('performance')
      .description('Show agent performance metrics')
      .action(this.showAgentPerformance.bind(this));

    this.program.addCommand(fusion);

    // Automation commands
    const automation = new Command('automation')
      .description('Manage automation workflows');
      
    automation.command('list')
      .description('List available automation workflows')
      .action(this.listAutomations.bind(this));
      
    automation.command('import <workflow>')
      .description('Import an automation workflow')
      .action(this.importAutomation.bind(this));
      
    automation.command('run <workflow>')
      .description('Run an automation workflow')
      .action(this.runAutomation.bind(this));

    this.program.addCommand(automation);

    // Portfolio commands
    const portfolio = new Command('portfolio')
      .description('Manage project portfolio');
      
    portfolio.command('list')
      .description('List all projects in portfolio')
      .action(this.listPortfolio.bind(this));
      
    portfolio.command('rebalance')
      .description('Rebalance portfolio lanes')
      .action(this.rebalancePortfolio.bind(this));
      
    portfolio.command('focus <project>')
      .description('Set project as primary focus')
      .action(this.focusProject.bind(this));

    this.program.addCommand(portfolio);

    // Module commands
    const modules = new Command('module')
      .description('Manage Atlas modules');
      
    modules.command('run <module>')
      .description('Run a specific module')
      .action(this.runModule.bind(this));
      
    modules.command('list')
      .description('List available modules')
      .action(this.listModules.bind(this));

    this.program.addCommand(modules);

    // Adapter commands
    const adapter = new Command('adapter')
      .description('Manage platform-specific Atlas adapters');
      
    adapter.command('sync')
      .description('Sync all projects in DEV directory with all AI platform adapters')
      .option('--dev-dir <path>', 'custom DEV directory path', 'C:\\Users\\MQ420_OL\\DEV')
      .action(this.syncAllAdapters.bind(this));
      
    adapter.command('project <project>')
      .description('Apply all adapters to a specific project')
      .action(this.applyAdaptersToProject.bind(this));

    this.program.addCommand(adapter);

    this.program
      .command('harvest')
      .description('Scavenge local and cloud environments for API keys')
      .option('--link', 'open browser to create missing keys')
      .action(this.harvestCredentials.bind(this));

    this.program
      .command('serve')
      .description('Start Atlas Control Center server')
      .action(this.startServer.bind(this));

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

  async startServer() {
    this.startSpinner('Starting Atlas Server...');
    try {
      const serverPath = path.join(__dirname, 'server.js');
      spawn('node', [serverPath], { stdio: 'inherit', detached: true });
      this.stopSpinner('Atlas Control Center running at http://localhost:3000');
    } catch (error) {
      this.stopSpinner(`Failed to start server: ${error.message}`, false);
    }
  }

  async initProject(name, options) {
    this.startSpinner(`Initializing project: ${name}`);
    
    try {
      const projectPath = path.join(STATE_DIR, 'portfolio', name);
      
      // Create project directory structure
      fs.mkdirSync(projectPath, { recursive: true });
      fs.mkdirSync(path.join(projectPath, 'incidents'), { recursive: true });
      fs.mkdirSync(path.join(projectPath, 'reports'), { recursive: true });
      fs.mkdirSync(path.join(projectPath, 'backups'), { recursive: true });
      
      // Initialize project state
      const initialState = {
        project: {
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          created_at: new Date().toISOString(),
          template: options.template || 'saas',
          status: 'initialized'
        },
        scores: {
          sovereign_score: 0,
          revenue_velocity: 0,
          retention_health: 0,
          cash_discipline: 0,
          last_updated: new Date().toISOString()
        },
        context: {
          current_phase: 0,
          mode: 'first_run',
          last_activity: new Date().toISOString()
        }
      };
      
      fs.writeFileSync(
        path.join(projectPath, 'context.json'),
        JSON.stringify(initialState, null, 2)
      );
      
      // Create empty score history
      fs.writeFileSync(
        path.join(projectPath, 'score_history.json'),
        JSON.stringify({
          sovereign_scores: [],
          revenue_velocity: [],
          retention_health: [],
          cash_discipline: [],
          timestamps: []
        }, null, 2)
      );
      
      this.stopSpinner(`Project ${name} initialized successfully!`);
      console.log(chalk.green(`\\nProject created at: ${projectPath}`));
      
      // Show next steps
      console.log(chalk.blue('\\nNext steps:'));
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
      const projectPath = path.join(STATE_DIR, 'portfolio', projectSlug);
      
      if (!fs.existsSync(projectPath)) {
        throw new Error(`Project not found: ${projectSlug}`);
      }
      
      const context = JSON.parse(
        fs.readFileSync(path.join(projectPath, 'context.json'), 'utf8')
      );
      
      const scores = context.scores;
      const mode = context.context?.mode || context.status?.mode || 'unknown';
      const phase = context.context?.current_phase ?? context.status?.current_phase ?? 0;
      
      this.stopSpinner();
      
      // Display status in a nice format
      console.log(boxen(
        `📊 ${chalk.bold(context.project.name)} Status\\n` +
        `Mode: ${chalk.blue(mode)} | Phase: ${chalk.blue(phase)}\\n` +
        `Last updated: ${new Date(context.scores.last_updated || context.scores.computed_at).toLocaleString()}`,
        { padding: 1, borderColor: 'blue' }
      ));
      
      // Display scores
      console.log('\\n' + chalk.bold('📈 Current Scores:'));
      this.displayScoreBar('Sovereign Score', scores.sovereign_score, 100);
      this.displayScoreBar('Revenue Velocity', scores.revenue_velocity, 100);
      this.displayScoreBar('Retention Health', scores.retention_health, 100);
      this.displayScoreBar('Cash Discipline', scores.cash_discipline, 100);
      
      if (options.detailed) {
        console.log('\\n' + chalk.bold('🔍 Detailed Metrics:'));
        // Add detailed metrics here
      }
      
    } catch (error) {
      this.stopSpinner(`Failed to load status: ${error.message}`, false);
    }
  }

  displayScoreBar(label, score, max) {
    const val = score || 0;
    const percentage = (val / max) * 100;
    const barLength = 20;
    const filled = Math.round((percentage / 100) * barLength);
    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
    
    let color = chalk.red;
    if (percentage >= 60) color = chalk.yellow;
    if (percentage >= 80) color = chalk.green;
    
    console.log(`${label}:`);
    console.log(`  ${color(bar)} ${color(val.toFixed(1))}/${max}`);
  }

  async listAutomations() {
    this.startSpinner('Loading automation workflows...');
    
    try {
      const automationDir = path.join(ROOT, 'automation-library');
      const files = fs.readdirSync(automationDir).filter(f => f.endsWith('.json'));
      
      this.stopSpinner();
      
      console.log(chalk.bold('🤖 Available Automation Workflows:\\n'));
      
      files.forEach(file => {
        const filePath = path.join(automationDir, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        console.log(chalk.blue(`• ${content.name}`));
        console.log(`  File: ${file}`);
        console.log(`  Nodes: ${content.nodes.length}`);
        console.log(`  Purpose: ${content.description || 'No description'}`);
        console.log('');
      });
      
    } catch (error) {
      this.stopSpinner(`Failed to list automations: ${error.message}`, false);
    }
  }

  async importAutomation(workflow) {
    this.startSpinner(`Importing automation: ${workflow}`);
    // Implementation coming in Phase 4
    this.stopSpinner('Automation import not yet implemented in v8.3', false);
  }

  async runAutomation(workflow) {
    this.startSpinner(`Running automation: ${workflow}`);
    // Implementation coming in Phase 4
    this.stopSpinner('Automation execution not yet implemented in v8.3', false);
  }

  async predictScores(project, options) {
    this.startSpinner('Generating score predictions...');
    try {
      const projectSlug = project || this.detectCurrentProject();
      const scriptPath = path.join(__dirname, 'predictive-scoring.js');
      const result = execSync(`node ${scriptPath} ${projectSlug}`, { 
        encoding: 'utf8',
        env: { ...process.env, HOME: process.env.HOME || process.env.USERPROFILE }
      });
      const analysis = JSON.parse(result);
      this.stopSpinner('Predictions generated!');
      console.log(chalk.bold(`\\n🔮 7-Day Predictions for ${projectSlug}:`));
      console.log(`  Sovereign Score: ${chalk.green(analysis.predictions.sovereign_7d.prediction.toFixed(1))}`);
      console.log(`  Trend: ${chalk.yellow(analysis.predictions.sovereign_7d.trend)}`);
    } catch (error) {
      this.stopSpinner(`Failed to predict scores: ${error.message}`, false);
    }
  }

  async showScoreHistory(project, options) {
    this.startSpinner('Loading score history...');
    this.stopSpinner('History visualization coming soon', false);
  }

  async listAgents() {
    console.log(chalk.bold('🤖 Available Sovereign Agents:'));
    console.log('• Atlas Ops (Infrastructure)');
    console.log('• Atlas Growth (Marketing)');
    console.log('• Atlas Product (Features)');
    console.log('• Atlas Wealth (Finance)');
  }

  async routeTask(task) {
    this.startSpinner(`Routing task: ${task}`);
    try {
      const { AtlasRouter } = require('../../scoring-engine/dist/router/AtlasRouter');
      const router = new AtlasRouter();
      const classification = await router.classify(task);
      
      this.stopSpinner('Task routed!');
      
      console.log('\n' + chalk.bold('🎯 Routing Decision:'));
      console.log(`  Mode: ${chalk.cyan(classification.mode)}`);
      console.log(`  Primary Domain: ${chalk.yellow(classification.primaryDomain)}`);
      console.log(`  Assigned Agent: ${chalk.green(classification.assignedAgent.name)}`);
      console.log(`  Routing Score: ${chalk.green((classification.routingScore * 100).toFixed(1))}/100`);
      
      console.log('\n' + chalk.bold('📦 Modules to Load:'));
      classification.modulesToLoad.forEach(m => console.log(`  • ${m}`));
      
      if (classification.assignedAgent) {
        console.log('\n' + chalk.bold('🤖 Agent Capabilities:'));
        classification.assignedAgent.capabilities.forEach(c => console.log(`  • ${c}`));
      }
    } catch (error) {
      this.stopSpinner(`Failed to route task: ${error.message}`, false);
      // Fallback if dist is not built
      if (error.message.includes('Cannot find module')) {
        console.log(chalk.yellow('\nTip: Run `npm run build` in scoring-engine to enable advanced routing.'));
      }
    }
  }

  async showAgentPerformance() {
    this.stopSpinner('Agent performance metrics not yet active.', false);
  }

  async runModule(module) {
    this.startSpinner(`Executing module: ${module}`);
    this.stopSpinner(`Module ${module} execution not yet wired to CLI.`, false);
  }

  async listModules() {
    console.log(chalk.bold('📦 Available Atlas Modules:'));
    const modules = [
      'onboarding', 'code-sprint', 'security', 'legal', 'pre-flight',
      'launch-strategy', 'marketing', 'business-setup', 'automation',
      'launch', 'growth', 'money', 'pricing', 'cashflow'
    ];
    modules.forEach(m => console.log(`• ${m}`));
  }

  async listPortfolio() {
    this.startSpinner('Loading portfolio...');
    const portfolioDir = path.join(STATE_DIR, 'portfolio');
    if (fs.existsSync(portfolioDir)) {
      const projects = fs.readdirSync(portfolioDir).filter(f => fs.statSync(path.join(portfolioDir, f)).isDirectory());
      this.stopSpinner();
      console.log(chalk.bold('📂 Current Portfolio:'));
      projects.forEach(p => console.log(`• ${p}`));
    } else {
      this.stopSpinner('Portfolio empty', false);
    }
  }

  async rebalancePortfolio() {
    this.startSpinner('Rebalancing portfolio lanes...');
    
    try {
      const portfolioDir = path.join(STATE_DIR, 'portfolio');
      const projects = fs.readdirSync(portfolioDir).filter(f => fs.statSync(path.join(portfolioDir, f)).isDirectory());
      
      const { CapitalGovernor } = require('../../scoring-engine/dist/index');
      const governor = new CapitalGovernor(STATE_DIR);
      
      console.log(chalk.bold('\n⚖️ Portfolio Lane Audit:'));
      
      let primaryFound = false;
      
      for (const slug of projects) {
        const contextPath = path.join(portfolioDir, slug, 'context.json');
        if (!fs.existsSync(contextPath)) continue;
        
        const context = JSON.parse(fs.readFileSync(contextPath, 'utf8'));
        const isPrimary = context.context?.lane === 'primary';
        
        // Mock financial state for demonstration (in production this comes from pulse.js)
        const capState = {
          as_of: new Date().toISOString(),
          available_cash: context.financials?.cash || 5000,
          runway_days: context.financials?.runway || 120,
          monthly_net_burn: 1000,
          burn_volatility: 0.1,
          failed_payment_ratio: 0.05,
          refund_dispute_ratio: 0.01,
          data_confidence: 'high',
          open_incidents: { p0: 0, p1: 0, p2: 0, p3: 0 }
        };
        
        const decision = governor.evaluate(capState);
        governor.updateProjectContext(slug, decision);
        
        let statusMarker = chalk.gray('○ Parked');
        if (isPrimary) {
          if (primaryFound) {
            // ENFORCE LANE POLICY: Only one primary
            context.context.lane = 'parked';
            fs.writeFileSync(contextPath, JSON.stringify(context, null, 2));
            statusMarker = chalk.red('▼ Parked (Policy Violation)');
          } else {
            statusMarker = chalk.green('★ Primary');
            primaryFound = true;
          }
        }
        
        console.log(`• ${slug.padEnd(25)} | Lane: ${statusMarker} | Mode: ${chalk.blue(decision.final_mode)}`);
      }
      
      this.stopSpinner('Rebalance complete!');
      
    } catch (error) {
      this.stopSpinner(`Rebalance failed: ${error.message}`, false);
    }
  }

  async focusProject(project) {
    const slug = project.toLowerCase();
    this.startSpinner(`Setting primary focus to: ${slug}`);
    
    try {
      const portfolioDir = path.join(STATE_DIR, 'portfolio');
      const projects = fs.readdirSync(portfolioDir).filter(f => fs.statSync(path.join(portfolioDir, f)).isDirectory());
      
      if (!projects.includes(slug)) {
        throw new Error(`Project ${slug} not found in portfolio.`);
      }
      
      // Update ALL projects to enforce single primary lane
      for (const p of projects) {
        const contextPath = path.join(portfolioDir, p, 'context.json');
        if (!fs.existsSync(contextPath)) continue;
        
        const context = JSON.parse(fs.readFileSync(contextPath, 'utf8'));
        if (!context.context) context.context = {};
        
        context.context.lane = (p === slug) ? 'primary' : 'parked';
        fs.writeFileSync(contextPath, JSON.stringify(context, null, 2));
      }
      
      this.stopSpinner(`Focus shifted to ${slug}. Lane Policy Enforced.`, true);
      
    } catch (error) {
      this.stopSpinner(`Failed to shift focus: ${error.message}`, false);
    }
  }

  async generateReport(options) {
    this.startSpinner('Generating report...');
    this.stopSpinner('Report generation not yet implemented.', false);
  }

  async backupState() {
    this.startSpinner('Backing up Atlas state...');
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(STATE_DIR, 'backups');
      if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
      
      const backupFile = path.join(backupDir, `atlas-backup-${timestamp}.json`);
      
      // Collect all portfolio data
      const portfolioDir = path.join(STATE_DIR, 'portfolio');
      const data = {
        timestamp: new Date().toISOString(),
        version: '8.3.0',
        portfolio: {}
      };
      
      if (fs.existsSync(portfolioDir)) {
        const projects = fs.readdirSync(portfolioDir).filter(f => fs.statSync(path.join(portfolioDir, f)).isDirectory());
        for (const slug of projects) {
          const contextPath = path.join(portfolioDir, slug, 'context.json');
          if (fs.existsSync(contextPath)) {
            data.portfolio[slug] = JSON.parse(fs.readFileSync(contextPath, 'utf8'));
          }
        }
      }
      
      fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
      this.stopSpinner(`Backup created: ${path.basename(backupFile)}`);
    } catch (error) {
      this.stopSpinner(`Backup failed: ${error.message}`, false);
    }
  }

  async restoreState(backupFile) {
    this.startSpinner(`Restoring state from ${backupFile}...`);
    try {
      if (!fs.existsSync(backupFile)) {
        // Check in backups dir if not absolute
        const backupPath = path.join(STATE_DIR, 'backups', backupFile);
        if (!fs.existsSync(backupPath)) throw new Error('Backup file not found.');
        backupFile = backupPath;
      }
      
      const data = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
      const portfolioDir = path.join(STATE_DIR, 'portfolio');
      
      for (const [slug, context] of Object.entries(data.portfolio)) {
        const projectPath = path.join(portfolioDir, slug);
        if (!fs.existsSync(projectPath)) fs.mkdirSync(projectPath, { recursive: true });
        fs.writeFileSync(path.join(projectPath, 'context.json'), JSON.stringify(context, null, 2));
      }
      
      this.stopSpinner(`Restored ${Object.keys(data.portfolio).length} projects successfully!`);
    } catch (error) {
      this.stopSpinner(`Restore failed: ${error.message}`, false);
    }
  }

  async syncAllAdapters(options) {
    const devDir = options.devDir;
    this.startSpinner(`Scanning ${devDir} for all software projects...`);
    
    try {
      if (!fs.existsSync(devDir)) {
        throw new Error(`DEV directory not found: ${devDir}`);
      }
      
      const projectPaths = [];
      const markers = [
        // Version Control
        '.git', '.hg', '.svn',
        // Node.js / JS
        'package.json', 'node_modules', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb',
        // Python
        'requirements.txt', 'pyproject.toml', 'setup.py', 'Pipfile', 'venv', '.venv',
        // Rust / Go
        'Cargo.toml', 'go.mod',
        // Ruby / PHP
        'Gemfile', 'composer.json',
        // Java / Kotlin / Mobile
        'pom.xml', 'build.gradle', 'build.gradle.kts', 'Podfile', 'AndroidManifest.xml',
        // Infrastructure / General
        'Dockerfile', 'docker-compose.yml', 'terraform', '.tf', 'Makefile', 'CMakeLists.txt',
        'index.html', 'src'
      ];

      const scanDirectory = (dir, depth = 0) => {
        if (depth > 4) return; // Increase depth for monorepos
        
        let entries;
        try {
          entries = fs.readdirSync(dir);
        } catch (e) { return; } // Skip inaccessible dirs

        let isProjectRoot = false;

        // 1. Check if current dir is a project root
        for (const marker of markers) {
          if (entries.includes(marker)) {
            projectPaths.push(dir);
            isProjectRoot = true;
            break;
          }
        }

        // 2. Look deeper, but skip massive non-project dirs
        const skipDirs = ['node_modules', '.git', 'dist', 'build', 'vendor', 'venv', '.venv', 'target', 'backups', 'incidents'];
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry);
          try {
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory() && !skipDirs.includes(entry)) {
              // Always scan deeper if we haven't reached depth limit
              // Special case: if we are in a known monorepo folder, we MUST scan deeper
              const monorepoDirs = ['packages', 'apps', 'services', 'libs', 'modules'];
              if (depth < 4) {
                scanDirectory(fullPath, depth + 1);
              }
            }
          } catch (e) {}
        }
      };

      scanDirectory(devDir);
      
      // De-duplicate paths
      const uniqueProjects = [...new Set(projectPaths)];
      
      this.stopSpinner(`Found ${uniqueProjects.length} projects across all ecosystems!`);
      
      for (const projectPath of uniqueProjects) {
        await this.applyAdaptersToProject(projectPath);
      }
      
      console.log(chalk.green(`\n✅ Omni-Sync Complete! Entire DEV fleet is now Atlas-Sovereign.`));
      
    } catch (error) {
      this.stopSpinner(`Sync failed: ${error.message}`, false);
    }
  }

  async applyAdaptersToProject(projectPath) {
    const fullPath = path.isAbsolute(projectPath) ? projectPath : path.join(process.cwd(), projectPath);
    const projectName = path.basename(fullPath);
    
    console.log(`\nAdapting project: ${chalk.blue(projectName)}...`);
    
    const adapters = [
      {
        file: '.cursorrules',
        content: `Instructions for Cursor AI: Always sync your mental model with the Atlas Sovereign Protocol before starting. Core state is at ~/.atlas/portfolio/${projectName.toLowerCase()}/atlas-brain.md. Follow the decision lock and next actions defined there.`
      },
      {
        file: '.claudecode.md',
        content: `Atlas Sovereign Protocol Active. Session state: ~/.atlas/portfolio/${projectName.toLowerCase()}/context.json. Resume from the last Key Decision in the Brain.`
      },
      {
        file: '.windsurfrules',
        content: `Atlas OS pointing active. Project slug: ${projectName.toLowerCase()}. Read brain state from ~/.atlas before executing flow.`
      },
      {
        file: 'GEMINI.md',
        content: `# Atlas Sovereign Integration\n\nThis project is managed by Atlas v8.3. Always read ~/.atlas/portfolio/${projectName.toLowerCase()}/atlas-brain.md before proposing changes.`
      }
    ];
    
    try {
      // Create .atlas directory in project if it doesn't exist
      const projectAtlasDir = path.join(fullPath, '.atlas');
      if (!fs.existsSync(projectAtlasDir)) {
        fs.mkdirSync(projectAtlasDir, { recursive: true });
      }
      
      // Write adapters
      for (const adapter of adapters) {
        fs.writeFileSync(path.join(fullPath, adapter.file), adapter.content);
        console.log(`  ${chalk.green('✔')} Created ${adapter.file}`);
      }
      
    } catch (error) {
      console.log(`  ${chalk.red('✘')} Failed to adapt ${projectName}: ${error.message}`);
    }
  }

  async harvestCredentials(options) {
    try {
      this.startSpinner('Scavenging for credentials...');
      
      const harvestPath = path.join(__dirname, 'harvest.js');
      execSync(`node ${harvestPath}`, { 
        stdio: 'inherit',
        env: { ...process.env, HOME: process.env.HOME || process.env.USERPROFILE }
      });
      
      this.stopSpinner('Harvest complete!');

      if (options.link) {
        console.log(chalk.blue('\n🔗 Opening service pages for missing keys...'));
        const links = [
          { name: 'Stripe', url: 'https://dashboard.stripe.com/apikeys' },
          { name: 'Vercel', url: 'https://vercel.com/account/tokens' },
          { name: 'PostHog', url: 'https://app.posthog.com/project/settings' },
          { name: 'Sentry', url: 'https://sentry.io/settings/account/api/auth-tokens/' },
          { name: 'Resend', url: 'https://resend.com/api-keys' },
          { name: 'GitHub', url: 'https://github.com/settings/tokens' }
        ];

        const openCommand = process.platform === 'win32' ? 'start' : 'open';
        for (const link of links) {
          console.log(`   - Opening ${link.name}...`);
          spawn(openCommand, [link.url], { stdio: 'ignore', detached: true });
          await new Promise(r => setTimeout(r, 500)); // Stagger slightly
        }
      }
      
    } catch (error) {
      this.stopSpinner(`Harvest failed: ${error.message}`, false);
    }
  }

  async calculateScores(project) {
    try {
      const projectSlug = project || this.detectCurrentProject();
      this.startSpinner(`Calculating scores for ${projectSlug}...`);
      
      const scriptPath = path.join(__dirname, 'predictive-scoring.js');
      
      // Execute predictive-scoring to get current analysis
      const result = execSync(`node ${scriptPath} ${projectSlug}`, { 
        encoding: 'utf8',
        env: { ...process.env, HOME: process.env.HOME || process.env.USERPROFILE }
      });
      
      const analysis = JSON.parse(result);
      
      this.stopSpinner('Scores calculated successfully!');
      
      console.log('\n' + chalk.bold('🎯 Latest Scores & Analysis:'));
      const scores = analysis.current_scores;
      Object.entries(scores).forEach(([key, value]) => {
        console.log(`  ${chalk.blue(key.replace(/_/g, ' ').toUpperCase())}: ${chalk.green(value.toFixed(1))}/100`);
      });

      if (analysis.insights && analysis.insights.length > 0) {
        console.log('\n' + chalk.bold('💡 Insights:'));
        analysis.insights.forEach(insight => {
          console.log(`  • ${insight.message}`);
        });
      }
      
    } catch (error) {
      this.stopSpinner(`Failed to calculate scores: ${error.message}`, false);
    }
  }

  async runDiagnostics(project, options) {
    try {
      const projectSlug = project || this.detectCurrentProject();
      this.startSpinner(`Running diagnostics for ${projectSlug}...`);
      
      const pulsePath = path.join(__dirname, 'pulse.js');
      const decidePath = path.join(__dirname, 'decide.js');
      
      // Execute pulse | decide pipeline
      const pipeline = execSync(`node ${pulsePath} | node ${decidePath}`, { 
        encoding: 'utf8',
        env: { ...process.env, HOME: process.env.HOME || process.env.USERPROFILE }
      });
      
      const decision = JSON.parse(pipeline);
      
      this.stopSpinner('Diagnostics complete!');
      
      console.log('\n' + chalk.bold('🔍 Diagnostic Logic Decision:\n'));
      console.log(`Action: ${chalk.cyan(decision.action)}`);
      console.log(`Category: ${chalk.yellow(decision.category)}`);
      console.log(`Reasoning: ${decision.reasoning}`);
      console.log(`Estimated Impact: ${chalk.green(decision.estimated_impact)}`);
      
      if (options.fix) {
        console.log('\n' + chalk.yellow(`Executing fix: ${decision.action}...`));
        // Execution of fix would go here
      }
      
    } catch (error) {
      this.stopSpinner(`Diagnostics failed: ${error.message}`, false);
      console.log(chalk.red('\nTip: Ensure all required API keys are set in your environment or .env file.'));
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
      
      // Open dashboard in default browser
      const openCommand = process.platform === 'win32' ? 'start' : 'open';
      spawn(openCommand, [dashboardPath], { stdio: 'ignore', detached: true });
      
      this.stopSpinner('Dashboard opened in browser!');
      
    } catch (error) {
      this.stopSpinner(`Failed to open dashboard: ${error.message}`, false);
    }
  }

  generateDashboard() {
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
                <div class="score good" id="sovereign-score">--</div>
                <div class="progress-bar"><div class="progress" id="sovereign-progress" style="width: 0%"></div></div>
                <p>Measures how close your business is to running itself.</p>
            </div>
            
            <div class="card">
                <h3>Revenue Velocity</h3>
                <div class="score warning" id="revenue-velocity">--</div>
                <div class="progress-bar"><div class="progress" id="velocity-progress" style="width: 0%"></div></div>
                <p>Growth rate and acceleration of revenue.</p>
            </div>
            
            <div class="card">
                <h3>Active Projects</h3>
                <div class="score" id="project-count">--</div>
                <div id="project-list"></div>
            </div>
            
            <div class="card">
                <h3>Recent Activity</h3>
                <div id="activity-log"></div>
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
        // Load data from Atlas state
        async function loadDashboardData() {
            try {
                const response = await fetch('/.atlas/state.json');
                const data = await response.json();
                
                // Update scores
                document.getElementById('sovereign-score').textContent = data.scores.sovereign_score.toFixed(1);
                document.getElementById('sovereign-progress').style.width = data.scores.sovereign_score + '%';
                
                document.getElementById('revenue-velocity').textContent = data.scores.revenue_velocity.toFixed(1);
                document.getElementById('velocity-progress').style.width = data.scores.revenue_velocity + '%';
                
                // Update project count
                document.getElementById('project-count').textContent = data.projects.length;
                
                // Update project list
                const projectList = document.getElementById('project-list');
                projectList.innerHTML = data.projects.map(p => 
                    \`<div style="margin: 5px 0; padding: 5px; background: #f8f9fa; border-radius: 3px;">
                        <strong>\${p.name}</strong> - Score: \${p.score}
                    </div>\`
                ).join('');
                
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            }
        }
        
        // Initial load
        loadDashboardData();
        
        // Auto-refresh every 30 seconds
        setInterval(loadDashboardData, 30000);
        
        // Action functions
        function runDiagnostics() {
            alert('Running diagnostics... (This would trigger the CLI)');
        }
        
        function calculateScores() {
            alert('Calculating scores... (This would trigger the CLI)');
        }
        
        function generateReport() {
            alert('Generating report... (This would trigger the CLI)');
        }
    </script>
</body>
</html>`;
    
    fs.writeFileSync(path.join(STATE_DIR, 'dashboard.html'), template);
  }

  detectCurrentProject() {
    // 1. Check for .atlas directory in current or parent dirs
    let currentDir = process.cwd();
    while (currentDir !== path.parse(currentDir).root) {
      const atlasContext = path.join(currentDir, '.atlas', 'brain.md');
      if (fs.existsSync(atlasContext)) {
        return path.basename(currentDir).toLowerCase().replace(/[^a-z0-9]/g, '-');
      }
      currentDir = path.dirname(currentDir);
    }

    // 2. Fallback to existing logic (matching CWD name to portfolio)
    const cwd = process.cwd();
    const cwdName = path.basename(cwd).toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    const portfolioDir = path.join(STATE_DIR, 'portfolio');
    if (fs.existsSync(portfolioDir)) {
      const projects = fs.readdirSync(portfolioDir);
      if (projects.includes(cwdName)) {
        return cwdName;
      }
    }

    // 3. Check for index.json primary_slug
    const indexPath = path.join(portfolioDir, 'index.json');
    if (fs.existsSync(indexPath)) {
      try {
        const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
        if (index.primary_slug) return index.primary_slug;
      } catch (e) {}
    }
    
    // If no match, ask user
    console.log(chalk.yellow('No project specified and could not auto-detect. Please specify a project name.'));
    process.exit(1);
  }

  startSpinner(text) {
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
    // Show banner
    console.log(chalk.blue(figlet.textSync('Atlas', { horizontalLayout: 'full' })));
    console.log(chalk.gray('The Sovereign Money Engine v8.3\\n'));
    
    // Parse arguments
    await this.program.parseAsync(process.argv);
    
    // If no command provided, show help
    if (!process.argv.slice(2).length) {
      this.program.outputHelp();
    }
  }
}

// Run CLI
if (require.main === module) {
  const cli = new AtlasCLI();
  cli.run().catch(console.error);
}

module.exports = AtlasCLI;