#!/usr/bin/env node
/**
 * Atlas Real-time Monitor v2.0
 * 
 * Monitors business metrics, system health, and automation status
 * in real-time with alerting and visualization.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const WebSocket = require('ws');
const chalk = require('chalk');
const blessed = require('blessed');
const contrib = require('blessed-contrib');

const ROOT = path.resolve(__dirname, '../..');
const STATE_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.atlas');

class RealTimeMonitor {
  constructor(options = {}) {
    this.options = {
      refreshInterval: options.refreshInterval || 5000, // 5 seconds
      port: options.port || 8080,
      alertThresholds: options.alertThresholds || {
        sovereign_score: 60,
        revenue_velocity: 50,
        retention_health: 50,
        cash_discipline: 60
      },
      ...options
    };
    
    this.metrics = {
      scores: {},
      system: {},
      automations: {},
      alerts: []
    };
    
    this.wsServer = null;
    this.clients = new Set();
    this.screen = null;
  }

  async start() {
    console.log(chalk.blue('🚀 Starting Atlas Real-time Monitor...'));
    
    // Start WebSocket server for real-time updates
    this.startWebSocketServer();
    
    // Start TUI dashboard
    if (this.options.tui) {
      this.startTUIDashboard();
    }
    
    // Start metric collection
    this.startMetricCollection();
    
    // Start alert manager
    this.startAlertManager();
    
    console.log(chalk.green(`✅ Monitor started on port ${this.options.port}`));
    console.log(chalk.gray('Press Ctrl+C to stop\\n'));
  }

  startWebSocketServer() {
    this.wsServer = new WebSocket.Server({ port: this.options.port });
    
    this.wsServer.on('connection', (ws) => {
      this.clients.add(ws);
      console.log(chalk.gray('New client connected'));
      
      // Send current metrics to new client
      ws.send(JSON.stringify({
        type: 'init',
        data: this.metrics
      }));
      
      ws.on('close', () => {
        this.clients.delete(ws);
        console.log(chalk.gray('Client disconnected'));
      });
      
      ws.on('error', (error) => {
        console.error(chalk.red('WebSocket error:', error.message));
      });
    });
    
    console.log(chalk.blue(`📡 WebSocket server listening on ws://localhost:${this.options.port}`));
  }

  startTUIDashboard() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Atlas Real-time Monitor'
    });
    
    const grid = new contrib.grid({ rows: 12, cols: 12, screen: this.screen });
    
    // Score gauges
    const sovereignGauge = grid.set(0, 0, 3, 4, contrib.gauge, {
      label: 'Sovereign Score',
      percent: [0]
    });
    
    const revenueGauge = grid.set(0, 4, 3, 4, contrib.gauge, {
      label: 'Revenue Velocity',
      percent: [0]
    });
    
    const retentionGauge = grid.set(0, 8, 3, 4, contrib.gauge, {
      label: 'Retention Health',
      percent: [0]
    });
    
    // Line chart for score history
    const scoreChart = grid.set(3, 0, 4, 12, contrib.line, {
      label: 'Score History (Last 24h)',
      showLegend: true,
      legend: { width: 20 }
    });
    
    // Alert log
    const alertLog = grid.set(7, 0, 3, 8, contrib.log, {
      label: 'Alerts',
      border: { type: 'line' },
      tags: true
    });
    
    // System metrics
    const systemTable = grid.set(7, 8, 3, 4, contrib.table, {
      label: 'System Health',
      columnWidth: [20, 10],
      columnSpacing: 2
    });
    
    // Automation status
    const automationTable = grid.set(10, 0, 2, 12, contrib.table, {
      label: 'Automation Status',
      columnWidth: [30, 15, 15],
      columnSpacing: 2
    });
    
    // Update function
    this.updateTUI = () => {
      if (!this.screen) return;
      
      // Update gauges
      sovereignGauge.setPercent(this.metrics.scores.sovereign_score || 0);
      revenueGauge.setPercent(this.metrics.scores.revenue_velocity || 0);
      retentionGauge.setPercent(this.metrics.scores.retention_health || 0);
      
      // Update score chart
      if (this.metrics.history && this.metrics.history.length > 0) {
        const history = this.metrics.history.slice(-24); // Last 24 data points
        const chartData = {
          x: history.map((_, i) => i.toString()),
          y: [
            history.map(h => h.sovereign_score),
            history.map(h => h.revenue_velocity),
            history.map(h => h.retention_health)
          ]
        };
        scoreChart.setData(chartData);
      }
      
      // Update system table
      systemTable.setData({
        headers: ['Metric', 'Value'],
        data: Object.entries(this.metrics.system).map(([key, value]) => [key, value])
      });
      
      // Update automation table
      automationTable.setData({
        headers: ['Automation', 'Status', 'Last Run'],
        data: Object.entries(this.metrics.automations).map(([name, data]) => [
          name,
          data.status,
          data.last_run ? new Date(data.last_run).toLocaleTimeString() : 'Never'
        ])
      });
      
      this.screen.render();
    };
    
    // Handle key events
    this.screen.key(['escape', 'q', 'C-c'], () => {
      process.exit(0);
    });
    
    this.screen.key(['r', 'R'], () => {
      alertLog.log('{bold}Manual refresh triggered{/bold}');
      this.collectMetrics();
    });
    
    this.screen.key(['a', 'A'], () => {
      this.checkAlerts();
    });
    
    console.log(chalk.blue('📊 TUI Dashboard started'));
  }

  startMetricCollection() {
    // Initial collection
    this.collectMetrics();
    
    // Periodic collection
    this.collectionInterval = setInterval(() => {
      this.collectMetrics();
    }, this.options.refreshInterval);
  }

  async collectMetrics() {
    try {
      const metrics = {
        timestamp: new Date().toISOString(),
        scores: await this.collectScores(),
        system: await this.collectSystemMetrics(),
        automations: await this.collectAutomationStatus(),
        projects: await this.collectProjectStatus()
      };
      
      // Update metrics
      this.metrics = metrics;
      
      // Add to history
      if (!this.metrics.history) {
        this.metrics.history = [];
      }
      this.metrics.history.push({
        timestamp: metrics.timestamp,
        ...metrics.scores
      });
      
      // Keep only last 1000 data points
      if (this.metrics.history.length > 1000) {
        this.metrics.history = this.metrics.history.slice(-1000);
      }
      
      // Broadcast to WebSocket clients
      this.broadcastMetrics();
      
      // Update TUI
      if (this.updateTUI) {
        this.updateTUI();
      }
      
      // Check for alerts
      this.checkAlerts();
      
    } catch (error) {
      console.error(chalk.red('Failed to collect metrics:', error.message));
    }
  }

  async collectScores() {
    try {
      // Try to read from state files
      const portfolioDir = path.join(STATE_DIR, 'portfolio');
      const projects = fs.existsSync(portfolioDir) ? fs.readdirSync(portfolioDir) : [];
      
      let scores = {
        sovereign_score: 0,
        revenue_velocity: 0,
        retention_health: 0,
        cash_discipline: 0
      };
      
      if (projects.length > 0) {
        // Get scores from primary project
        const primaryProject = projects[0];
        const contextPath = path.join(portfolioDir, primaryProject, 'context.json');
        
        if (fs.existsSync(contextPath)) {
          const context = JSON.parse(fs.readFileSync(contextPath, 'utf8'));
          scores = context.scores || scores;
        }
      }
      
      return scores;
      
    } catch (error) {
      console.error(chalk.red('Failed to collect scores:', error.message));
      return {};
    }
  }

  async collectSystemMetrics() {
    try {
      const metrics = {};
      
      // Disk usage
      try {
        const diskUsage = execSync('df -h / | tail -1').toString().trim();
        const [, size, used, avail, percent] = diskUsage.split(/\\s+/);
        metrics.disk_usage = percent.replace('%', '');
      } catch (e) {
        metrics.disk_usage = 'N/A';
      }
      
      // Memory usage
      try {
        if (process.platform === 'win32') {
          const memory = execSync('wmic OS get FreePhysicalMemory,TotalVisibleMemorySize /Value').toString();
          const lines = memory.split('\\n');
          const total = parseInt(lines.find(l => l.includes('TotalVisibleMemorySize')).split('=')[1]) / 1024;
          const free = parseInt(lines.find(l => l.includes('FreePhysicalMemory')).split('=')[1]) / 1024;
          const usedPercent = ((total - free) / total * 100).toFixed(1);
          metrics.memory_usage = usedPercent;
        } else {
          const memory = execSync('free -m | grep Mem:').toString().trim();
          const [, total, used] = memory.split(/\\s+/).map(Number);
          metrics.memory_usage = ((used / total) * 100).toFixed(1);
        }
      } catch (e) {
        metrics.memory_usage = 'N/A';
      }
      
      // CPU usage (simplified)
      metrics.cpu_usage = (process.cpuUsage().user / 1000000).toFixed(1);
      
      // Network status
      try {
        execSync('ping -c 1 8.8.8.8', { stdio: 'ignore' });
        metrics.network_status = 'connected';
      } catch (e) {
        metrics.network_status = 'disconnected';
      }
      
      // Atlas processes
      try {
        const atlasProcesses = execSync('ps aux | grep -i atlas | grep -v grep | wc -l').toString().trim();
        metrics.atlas_processes = parseInt(atlasProcesses) || 0;
      } catch (e) {
        metrics.atlas_processes = 0;
      }
      
      return metrics;
      
    } catch (error) {
      console.error(chalk.red('Failed to collect system metrics:', error.message));
      return {};
    }
  }

  async collectAutomationStatus() {
    try {
      const automations = {};
      const automationDir = path.join(ROOT, 'automation-library');
      
      if (fs.existsSync(automationDir)) {
        const files = fs.readdirSync(automationDir).filter(f => f.endsWith('.json'));
        
        for (const file of files) {
          const filePath = path.join(automationDir, file);
          const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          
          automations[content.name] = {
            status: 'available',
            last_run: null, // Would track from execution logs
            nodes: content.nodes.length
          };
        }
      }
      
      return automations;
      
    } catch (error) {
      console.error(chalk.red('Failed to collect automation status:', error.message));
      return {};
    }
  }

  async collectProjectStatus() {
    try {
      const projects = {};
      const portfolioDir = path.join(STATE_DIR, 'portfolio');
      
      if (fs.existsSync(portfolioDir)) {
        const projectDirs = fs.readdirSync(portfolioDir);
        
        for (const dir of projectDirs) {
          const contextPath = path.join(portfolioDir, dir, 'context.json');
          
          if (fs.existsSync(contextPath)) {
            const context = JSON.parse(fs.readFileSync(contextPath, 'utf8'));
            
            projects[dir] = {
              name: context.project?.name || dir,
              score: context.scores?.sovereign_score || 0,
              phase: context.context?.current_phase || 0,
              mode: context.context?.mode || 'unknown',
              last_activity: context.context?.last_activity || 'never'
            };
          }
        }
      }
      
      return projects;
      
    } catch (error) {
      console.error(chalk.red('Failed to collect project status:', error.message));
      return {};
    }
  }

  broadcastMetrics() {
    const message = JSON.stringify({
      type: 'update',
      data: this.metrics,
      timestamp: new Date().toISOString()
    });
    
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  startAlertManager() {
    this.alertInterval = setInterval(() => {
      this.checkAlerts();
    }, 30000); // Check every 30 seconds
  }

  checkAlerts() {
    const newAlerts = [];
    
    // Check score thresholds
    if (this.metrics.scores) {
      Object.entries(this.options.alertThresholds).forEach(([metric, threshold]) => {
        const value = this.metrics.scores[metric];
        if (value !== undefined && value < threshold) {
          newAlerts.push({
            type: 'critical',
            metric,
            value,
            threshold,
            message: `${metric.replace(/_/g, ' ')} is below threshold (${value} < ${threshold})`,
            timestamp: new Date().toISOString()
          });
        }
      });
    }
    
    // Check system metrics
    if (this.metrics.system) {
      if (this.metrics.system.disk_usage && parseInt(this.metrics.system.disk_usage) > 90) {
        newAlerts.push({
          type: 'warning',
          metric: 'disk_usage',
          value: this.metrics.system.disk_usage,
          threshold: '90%',
          message: `Disk usage is high: ${this.metrics.system.disk_usage}%`,
          timestamp: new Date().toISOString()
        });
      }
      
      if (this.metrics.system.memory_usage && parseInt(this.metrics.system.memory_usage) > 90) {
        newAlerts.push({
          type: 'warning',
          metric: 'memory_usage',
          value: this.metrics.system.memory_usage,
          threshold: '90%',
          message: `Memory usage is high: ${this.metrics.system.memory_usage}%`,
          timestamp: new Date().toISOString()
        });
      }
      
      if (this.metrics.system.network_status === 'disconnected') {
        newAlerts.push({
          type: 'critical',
          metric: 'network',
          value: 'disconnected',
          message: 'Network connection lost',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Add new alerts
    newAlerts.forEach(alert => {
      // Check if similar alert already exists
      const existingAlert = this.metrics.alerts.find(a => 
        a.metric === alert.metric && 
        a.message === alert.message &&
        (Date.now() - new Date(a.timestamp).getTime()) < 300000 // 5 minutes
      );
      
      if (!existingAlert) {
        this.metrics.alerts.unshift(alert);
        this.triggerAlert(alert);
      }
    });
    
    // Keep only last 100 alerts
    if (this.metrics.alerts.length > 100) {
      this.metrics.alerts = this.metrics.alerts.slice(0, 100);
    }
  }

  triggerAlert(alert) {
    const alertMessage = `🚨 ${alert.type.toUpperCase()}: ${alert.message}`;
    
    // Log to console
    if (alert.type === 'critical') {
      console.log(chalk.red(alertMessage));
    } else {
      console.log(chalk.yellow(alertMessage));
    }
    
    // Send to WebSocket clients
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'alert',
          data: alert
        }));
      }
    });
    
    // Log to TUI if available
    if (this.screen) {
      const alertLog = this.screen.children.find(child => child.options?.label === 'Alerts');
      if (alertLog) {
        const color = alert.type === 'critical' ? 'red' : 'yellow';
        alertLog.log(`{${color}-fg}{bold}${alert.type.toUpperCase()}{/bold}{/${color}-fg}: ${alert.message}`);
      }
    }
    
    // TODO: Send email/Slack notification for critical alerts
  }

  stop() {
    console.log(chalk.blue('\\n🛑 Stopping Atlas Monitor...'));
    
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
    }
    
    if (this.alertInterval) {
      clearInterval(this.alertInterval);
    }
    
    if (this.wsServer) {
      this.wsServer.close();
    }
    
    if (this.screen) {
      this.screen.destroy();
    }
    
    console.log(chalk.green('✅ Monitor stopped'));
  }
}

// CLI Interface
if (require.main === module) {
  const program = require('commander');
  
  program
    .name('atlas-monitor')
    .description('Atlas Real-time Monitor')
    .version('2.0.0')
    .option('-p, --port <port>', 'WebSocket port', '8080')
    .option('-i, --interval <ms>', 'Refresh interval in milliseconds', '5000')
    .option('--tui', 'Enable terminal UI dashboard')
    .option('--no-tui', 'Disable terminal UI dashboard')
    .parse(process.argv);
  
  const monitor = new RealTimeMonitor({
    port: parseInt(program.port),
    refreshInterval: parseInt(program.interval),
    tui: program.tui
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    monitor.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    monitor.stop();
    process.exit(0);
  });
  
  monitor.start().catch(console.error);
}

module.exports = RealTimeMonitor;