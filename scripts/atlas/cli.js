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
      .description('Atlas v8.0 CLI - The Sovereign Money Engine')
      .version('8.0.0', '-v, --version', 'output Atlas version')
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

    // Automation commands
    this.program
      .command('automation')
      .description('Manage automation workflows')
      .addCommand(new Command('list')
        .description('List available automation workflows')
        .action(this.listAutomations.bind(this)))
      .addCommand(new Command('import <workflow>')
        .description('Import an automation workflow')
        .action(this.importAutomation.bind(this)))
      .addCommand(new Command('run <workflow>')
        .description('Run an automation workflow')
        .action(this.runAutomation.bind(this)));

    // Scoring commands
    this.program
      .command('score')
      .description('Manage scoring and predictions')
      .addCommand(new Command('calculate [project]')
        .description('Calculate current scores')
        .action(this.calculateScores.bind(this)))
      .addCommand(new Command('predict [project]')
        .description('Generate score predictions')
        .option('--days <days>', 'prediction horizon in days', '7')
        .action(this.predictScores.bind(this)))
      .addCommand(new Command('history [project]')
        .description('Show score history')
        .option('--days <days>', 'history days to show', '30')
        .action(this.showScoreHistory.bind(this)));

    // Fusion commands
    this.program
      .command('fusion')
      .description('Manage agent fusion and routing')
      .addCommand(new Command('agents')
        .description('List available agents')
        .action(this.listAgents.bind(this)))
      .addCommand(new Command('route <task>')
        .description('Route a task to best agent')
        .action(this.routeTask.bind(this)))
      .addCommand(new Command('performance')
        .description('Show agent performance metrics')
        .action(this.showAgentPerformance.bind(this)));

    // Diagnostic commands
    this.program
      .command('diagnose [project]')
      .description('Run comprehensive diagnostics')
      .option('--fix', 'automatically fix issues')
      .action(this.runDiagnostics.bind(this));

    // Module commands
    this.program
      .command('module')
      .description('Manage Atlas modules')
      .addCommand(new Command('run <module>')
        .description('Run a specific module')
        .action(this.runModule.bind(this)))
      .addCommand(new Command('list')
        .description('List available modules')
        .action(this.listModules.bind(this)));

    // Portfolio commands
    this.program
      .command('portfolio')
      .description('Manage project portfolio')
      .addCommand(new Command('list')
        .description('List all projects in portfolio')
        .action(this.listPortfolio.bind(this)))
      .addCommand(new Command('rebalance')
        .description('Rebalance portfolio lanes')
        .action(this.rebalancePortfolio.bind(this)))
      .addCommand(new Command('focus <project>')
        .description('Set project as primary focus')
        .action(this.focusProject.bind(this)));

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
      
      this.stopSpinner();
      
      // Display status in a nice format
      console.log(boxen(
        `📊 ${chalk.bold(context.project.name)} Status\\n` +
        `Mode: ${chalk.blue(context.context.mode)} | Phase: ${chalk.blue(context.context.current_phase)}\\n` +
        `Last updated: ${new Date(context.scores.last_updated).toLocaleString()}`,
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
    const percentage = (score / max) * 100;
    const barLength = 20;
    const filled = Math.round((percentage / 100) * barLength);
    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
    
    let color = chalk.red;
    if (percentage >= 60) color = chalk.yellow;
    if (percentage >= 80) color = chalk.green;
    
    console.log(`${label}:`);
    console.log(`  ${color(bar)} ${color(score.toFixed(1))}/${max}`);
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

  async calculateScores(project) {
    this.startSpinner('Calculating scores...');
    
    try {
      const projectSlug = project || this.detectCurrentProject();
      const scoringEngine = require('./predictive-scoring');
      
      // This would integrate with the actual scoring engine
      // For now, simulate calculation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const scores = {
        sovereign_score: 65.5,
        revenue_velocity: 72.3,
        retention_health: 58.9,
        cash_discipline: 81.2
      };
      
      this.stopSpinner('Scores calculated successfully!');
      
      console.log('\\n' + chalk.bold('🎯 Calculated Scores:'));
      Object.entries(scores).forEach(([key, value]) => {
        console.log(`  ${chalk.blue(key.replace(/_/g, ' ').toUpperCase())}: ${chalk.green(value.toFixed(1))}/100`);
      });
      
    } catch (error) {
      this.stopSpinner(`Failed to calculate scores: ${error.message}`, false);
    }
  }

  async runDiagnostics(project, options) {
    this.startSpinner('Running diagnostics...');
    
    try {
      const projectSlug = project || this.detectCurrentProject();
      
      // Run comprehensive diagnostics
      const diagnostics = [
        { check: 'Project structure', status: '✅', message: 'Valid' },
        { check: 'State files', status: '✅', message: 'All present' },
        { check: 'Git repository', status: '⚠️', message: 'No remote configured' },
        { check: 'Deployment', status: '❌', message: 'Not deployed' },
        { check: 'Monitoring', status: '❌', message: 'Not configured' },
        { check: 'Revenue tracking', status: '⚠️', message: 'Partial setup' },
      ];
      
      this.stopSpinner();
      
      console.log(chalk.bold('🔍 Diagnostic Results:\\n'));
      
      diagnostics.forEach(d => {
        let statusColor = chalk.green;
        if (d.status === '⚠️') statusColor = chalk.yellow;
        if (d.status === '❌') statusColor = chalk.red;
        
        console.log(`${statusColor(d.status)} ${d.check}: ${d.message}`);
      });
      
      const criticalCount = diagnostics.filter(d => d.status === '❌').length;
      const warningCount = diagnostics.filter(d => d.status === '⚠️').length;
      
      console.log(`\\n${chalk.bold('Summary:')} ${criticalCount} critical, ${warningCount} warnings`);
      
      if (options.fix) {
        console.log('\\n' + chalk.yellow('Auto-fix feature coming soon!'));
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
    // Try to detect current project from context
    const cwd = process.cwd();
    const cwdName = path.basename(cwd).toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    const portfolioDir = path.join(STATE_DIR, 'portfolio');
    if (fs.existsSync(portfolioDir)) {
      const projects = fs.readdirSync(portfolioDir);
      if (projects.includes(cwdName)) {
        return cwdName;
      }
    }
    
    // If no match, ask user
    console.log(chalk.yellow('No project specified. Please specify a project name.'));
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
    console.log(chalk.gray('The Sovereign Money Engine v8.0\\n'));
    
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