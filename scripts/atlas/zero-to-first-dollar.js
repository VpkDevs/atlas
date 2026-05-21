#!/usr/bin/env node
// Atlas v8.1 - Zero-to-First-Dollar Sprint
// Systematic 7-day protocol to first $100 MRR or 5 customers

const fs = require('fs');
const path = require('path');

class ZeroToFirstDollar {
  constructor(portfolioPath, slug) {
    this.portfolioPath = portfolioPath;
    this.slug = slug;
    this.contextPath = path.join(portfolioPath, slug, 'context.json');
    this.outreachPath = path.join(portfolioPath, slug, 'outreach_tracker.json');
  }

  // Load product context
  loadContext() {
    if (!fs.existsSync(this.contextPath)) {
      throw new Error(`Context file not found: ${this.contextPath}`);
    }
    return JSON.parse(fs.readFileSync(this.contextPath, 'utf8'));
  }

  // Initialize outreach tracker
  initTracker() {
    if (fs.existsSync(this.outreachPath)) {
      return JSON.parse(fs.readFileSync(this.outreachPath, 'utf8'));
    }

    const tracker = {
      sprint_start: new Date().toISOString(),
      target_revenue: 100,
      target_customers: 5,
      prospects: [],
      conversations: [],
      trials: [],
      paid: [],
      learnings: []
    };

    this.saveTracker(tracker);
    return tracker;
  }

  // Save tracker
  saveTracker(tracker) {
    const dir = path.dirname(this.outreachPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.outreachPath, JSON.stringify(tracker, null, 2), 'utf8');
  }

  // Generate high-intent search queries
  generateSearchQueries(productContext) {
    const { name, category, target_customer, pain_points } = productContext.product || {};
    
    if (!category) {
      return ['No category defined in context.json'];
    }
    
    const queries = [
      // Direct pain expressions
      ...(pain_points || []).map(pain => `"${pain}" site:reddit.com`),
      ...(pain_points || []).map(pain => `"${pain}" site:twitter.com`),
      
      // Looking for solutions
      `"looking for" "${category}" site:reddit.com`,
      `"need a tool" "${category}" site:indiehackers.com`,
      `"is there a" "${category}" site:twitter.com`,
      
      // Competitor frustrations
      `"frustrated with" "${category}"`,
      `"alternative to" "${category}"`,
      
      // Willingness to pay
      `"willing to pay" "${category}"`,
      `"would pay for" "${category}"`,
      
      // Recent asks
      `"${category}" "recommendations" site:reddit.com`,
      `"${category}" "suggestions" site:twitter.com`
    ];

    return queries;
  }

  // Generate sprint report
  generateReport() {
    const tracker = this.initTracker();
    const sprintDays = Math.floor(
      (Date.now() - new Date(tracker.sprint_start).getTime()) / (1000 * 60 * 60 * 24)
    );

    const stats = {
      sprint_days: sprintDays,
      prospects_identified: tracker.prospects.length,
      outreach_sent: tracker.prospects.filter(p => p.outreach_sent).length,
      responses_received: tracker.prospects.filter(p => p.response_received).length,
      trials_started: tracker.trials.length,
      paid_conversions: tracker.paid.length,
      total_revenue: tracker.paid.reduce((sum, p) => sum + p.amount, 0),
      response_rate: 0,
      trial_conversion_rate: 0,
      paid_conversion_rate: 0
    };

    if (stats.outreach_sent > 0) {
      stats.response_rate = (stats.responses_received / stats.outreach_sent * 100).toFixed(1);
    }

    if (stats.responses_received > 0) {
      stats.trial_conversion_rate = (stats.trials_started / stats.responses_received * 100).toFixed(1);
    }

    if (stats.trials_started > 0) {
      stats.paid_conversion_rate = (stats.paid_conversions / stats.trials_started * 100).toFixed(1);
    }

    return stats;
  }

  // Format report for display
  formatReport(stats) {
    let report = '\n';
    report += '═══════════════════════════════════════════════\n';
    report += 'ZERO-TO-FIRST-DOLLAR SPRINT REPORT\n';
    report += `Day ${stats.sprint_days} of Sprint\n`;
    report += '═══════════════════════════════════════════════\n\n';
    
    report += 'FUNNEL METRICS:\n';
    report += `  Prospects Identified:  ${stats.prospects_identified}\n`;
    report += `  Outreach Sent:         ${stats.outreach_sent}\n`;
    report += `  Responses Received:    ${stats.responses_received} (${stats.response_rate}%)\n`;
    report += `  Trials Started:        ${stats.trials_started} (${stats.trial_conversion_rate}%)\n`;
    report += `  Paid Conversions:      ${stats.paid_conversions} (${stats.paid_conversion_rate}%)\n\n`;
    
    report += 'REVENUE:\n';
    report += `  Total Revenue:         $${stats.total_revenue}\n`;
    report += `  Target:                $100\n`;
    report += `  Progress:              ${(stats.total_revenue / 100 * 100).toFixed(0)}%\n\n`;
    
    const exitGateMet = stats.total_revenue >= 100 || stats.paid_conversions >= 5;
    report += `EXIT GATE: ${exitGateMet ? '✅ MET' : '⏳ IN PROGRESS'}\n`;
    
    if (!exitGateMet) {
      report += `  Need: $${100 - stats.total_revenue} more OR ${5 - stats.paid_conversions} more customers\n`;
    }
    
    report += '═══════════════════════════════════════════════\n';
    
    return report;
  }
}

module.exports = ZeroToFirstDollar;

// CLI usage
if (require.main === module) {
  const portfolioPath = process.argv[2] || path.join(require('os').homedir(), '.atlas', 'portfolio');
  const slug = process.argv[3];
  const action = process.argv[4];

  if (!slug) {
    console.error('Usage: node zero-to-first-dollar.js <portfolio-path> <slug> <action>');
    console.error('Actions: init, queries, report');
    process.exit(1);
  }

  const sprint = new ZeroToFirstDollar(portfolioPath, slug);

  try {
    if (action === 'init') {
      sprint.initTracker();
      console.log('✓ Sprint tracker initialized');
      console.log(`  Location: ${sprint.outreachPath}`);
    } else if (action === 'report') {
      const stats = sprint.generateReport();
      console.log(sprint.formatReport(stats));
    } else if (action === 'queries') {
      const context = sprint.loadContext();
      const queries = sprint.generateSearchQueries(context);
      console.log('HIGH-INTENT SEARCH QUERIES:\n');
      queries.forEach((q, i) => console.log(`${i + 1}. ${q}`));
    } else {
      console.error(`Unknown action: ${action}`);
      console.error('Valid actions: init, queries, report');
      process.exit(1);
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}
