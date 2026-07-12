#!/usr/bin/env node
// Atlas v8.1 - Context Compressor
// Automatic context compression preventing drift in long runs

const fs = require('fs');
const path = require('path');

class ContextCompressor {
  constructor(portfolioPath) {
    this.portfolioPath = portfolioPath;
    this.compressionThreshold = 150000; // tokens
    this.summaryMaxTokens = 500;
  }

  // Estimate token count (rough: 0.75 tokens per character)
  estimateTokens(text) {
    return Math.ceil(text.length * 0.75);
  }

  // Compress phase output to summary
  compressPhase(phaseNumber, phaseOutput) {
    const summary = {
      phase: phaseNumber,
      timestamp: new Date().toISOString(),
      keyDecisions: this.extractDecisions(phaseOutput),
      filesCommitted: this.extractCommittedFiles(phaseOutput),
      pendingActions: this.extractPendingActions(phaseOutput),
      scoreDelta: this.extractScoreDelta(phaseOutput),
      anomalies: this.extractAnomalies(phaseOutput)
    };

    return this.formatSummary(summary);
  }

  extractDecisions(output) {
    // Extract bullet points after "Key Decisions" or "Decisions Made"
    const decisionRegex = /(?:Key Decisions|Decisions Made)[:\s]+((?:[-•*]\s+.+\n?)+)/gi;
    const matches = output.match(decisionRegex);
    if (!matches) return [];
    
    return matches[0]
      .split('\n')
      .filter(line => line.trim().match(/^[-•*]/))
      .map(line => line.replace(/^[-•*]\s+/, '').trim())
      .slice(0, 5); // Top 5 decisions
  }

  extractCommittedFiles(output) {
    // Extract file paths from git commits or file mentions
    const fileRegex = /(?:committed|created|modified):\s*([^\s]+\.[a-z]{2,4})/gi;
    const files = [];
    let match;
    
    while ((match = fileRegex.exec(output)) !== null) {
      files.push(match[1]);
    }
    
    return [...new Set(files)]; // Deduplicate
  }

  extractPendingActions(output) {
    // Extract userMust items
    const actionRegex = /\[um-(\d+)\]:\s*(.+?)(?:\n|$)/gi;
    const actions = [];
    let match;
    
    while ((match = actionRegex.exec(output)) !== null) {
      actions.push({
        id: `um-${match[1]}`,
        label: match[2].trim()
      });
    }
    
    return actions;
  }

  extractScoreDelta(output) {
    // Extract score changes: "Score: 45 → 58 (+13)"
    const scoreRegex = /Score:\s*(\d+)\s*→\s*(\d+)\s*\(([+-]\d+)\)/i;
    const match = output.match(scoreRegex);
    
    if (match) {
      return {
        before: parseInt(match[1]),
        after: parseInt(match[2]),
        delta: parseInt(match[3])
      };
    }
    
    return null;
  }

  extractAnomalies(output) {
    // Extract warnings, errors, or unexpected findings
    const anomalyRegex = /(?:⚠️|❌|WARNING|ERROR|UNEXPECTED)[:\s]+(.+?)(?:\n|$)/gi;
    const anomalies = [];
    let match;
    
    while ((match = anomalyRegex.exec(output)) !== null) {
      anomalies.push(match[1].trim());
    }
    
    return anomalies.slice(0, 3); // Top 3 anomalies
  }

  formatSummary(summary) {
    let text = `# Phase ${summary.phase} Summary\n`;
    text += `Date: ${summary.timestamp}\n\n`;
    
    text += `## Key Decisions\n`;
    summary.keyDecisions.forEach(d => text += `- ${d}\n`);
    
    text += `\n## Files Committed\n`;
    summary.filesCommitted.forEach(f => text += `- ${f}\n`);
    
    if (summary.pendingActions.length > 0) {
      text += `\n## Pending Actions\n`;
      summary.pendingActions.forEach(a => text += `- ${a.id}: ${a.label}\n`);
    }
    
    if (summary.scoreDelta) {
      text += `\n## Score Change\n`;
      text += `${summary.scoreDelta.before} → ${summary.scoreDelta.after} (${summary.scoreDelta.delta >= 0 ? '+' : ''}${summary.scoreDelta.delta})\n`;
    }
    
    if (summary.anomalies.length > 0) {
      text += `\n## Anomalies\n`;
      summary.anomalies.forEach(a => text += `- ${a}\n`);
    }
    
    return text;
  }

  // Main compression routine
  async compress(slug) {
    const summariesDir = path.join(this.portfolioPath, slug, 'phase_summaries');
    const contextFile = path.join(this.portfolioPath, slug, 'context.json');
    
    // Ensure directories exist
    if (!fs.existsSync(summariesDir)) {
      fs.mkdirSync(summariesDir, { recursive: true });
    }
    
    // Read context to determine completed phases
    if (!fs.existsSync(contextFile)) {
      throw new Error(`Context file not found: ${contextFile}`);
    }
    
    const context = JSON.parse(fs.readFileSync(contextFile, 'utf8'));
    const completedPhases = context.status?.completed_modules || [];
    
    // Compress each completed phase that doesn't have a summary
    for (const phase of completedPhases) {
      const summaryPath = path.join(summariesDir, `phase_${phase}_summary.md`);
      
      if (!fs.existsSync(summaryPath)) {
        const summary = this.compressPhase(phase, '');
        fs.writeFileSync(summaryPath, summary, 'utf8');
      }
    }
    
    return {
      compressed: completedPhases.length,
      summariesDir
    };
  }

  // Verify critical state from disk
  verifyCriticalState(slug) {
    const contextFile = path.join(this.portfolioPath, slug, 'context.json');
    
    if (!fs.existsSync(contextFile)) {
      throw new Error(`Context file not found: ${contextFile}`);
    }
    
    const context = JSON.parse(fs.readFileSync(contextFile, 'utf8'));
    
    const checks = {
      productionUrl: context.product?.production_url || 'UNKNOWN',
      sovereignScore: context.product?.runs_itself_score || 0,
      completedPhases: context.status?.completed_modules || [],
      pendingActions: context.pending_user_actions || [],
      lastCommit: null,
      urlStatus: null
    };
    
    // Verify git state
    try {
      const { execSync } = require('child_process');
      checks.lastCommit = execSync('git log --oneline -1', { encoding: 'utf8' }).trim();
    } catch (e) {
      checks.lastCommit = 'ERROR: ' + e.message;
    }
    
    return checks;
  }
}

module.exports = ContextCompressor;

// CLI usage
if (require.main === module) {
  const portfolioPath = process.argv[2] || path.join(require('os').homedir(), '.atlas', 'portfolio');
  const slug = process.argv[3];
  const action = process.argv[4] || 'compress';
  
  if (!slug) {
    console.error('Usage: node context-compressor.js <portfolio-path> <slug> <action>');
    console.error('Actions: compress, verify');
    process.exit(1);
  }
  
  const compressor = new ContextCompressor(portfolioPath);
  
  if (action === 'compress') {
    compressor.compress(slug).then(result => {
      console.log(`✓ Compressed ${result.compressed} phases`);
      console.log(`  Summaries: ${result.summariesDir}`);
    }).catch(err => {
      console.error('Error:', err.message);
      process.exit(1);
    });
  } else if (action === 'verify') {
    try {
      const state = compressor.verifyCriticalState(slug);
      console.log('CRITICAL STATE VERIFICATION:');
      console.log(`  Production URL: ${state.productionUrl} (${state.urlStatus || 'not checked'})`);
      console.log(`  Sovereign Score: ${state.sovereignScore}`);
      console.log(`  Completed Phases: ${state.completedPhases.join(', ')}`);
      console.log(`  Pending Actions: ${state.pendingActions.length}`);
      console.log(`  Last Commit: ${state.lastCommit}`);
    } catch (err) {
      console.error('Error:', err.message);
      process.exit(1);
    }
  } else {
    console.error(`Unknown action: ${action}`);
    process.exit(1);
  }
}
