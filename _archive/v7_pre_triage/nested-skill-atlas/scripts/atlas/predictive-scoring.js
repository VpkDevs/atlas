#!/usr/bin/env node
/**
 * Atlas Predictive Scoring Engine v2.0
 * 
 * Enhanced scoring with machine learning predictions, trend analysis,
 * and anomaly detection for proactive business management.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const STATE_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.atlas');

class PredictiveScoringEngine {
  constructor(projectSlug) {
    this.projectSlug = projectSlug;
    this.statePath = path.join(STATE_DIR, 'portfolio', projectSlug);
    this.historyPath = path.join(this.statePath, 'score_history.json');
    this.loadHistory();
  }

  loadHistory() {
    try {
      if (fs.existsSync(this.historyPath)) {
        this.history = JSON.parse(fs.readFileSync(this.historyPath, 'utf8'));
      } else {
        this.history = {
          sovereign_scores: [],
          revenue_velocity: [],
          retention_health: [],
          cash_discipline: [],
          timestamps: []
        };
      }
    } catch (e) {
      this.history = {
        sovereign_scores: [],
        revenue_velocity: [],
        retention_health: [],
        cash_discipline: [],
        timestamps: []
      };
    }
  }

  saveHistory() {
    fs.writeFileSync(this.historyPath, JSON.stringify(this.history, null, 2));
  }

  addScore(scoreData) {
    const timestamp = new Date().toISOString();
    
    this.history.sovereign_scores.push(scoreData.sovereign_score);
    this.history.revenue_velocity.push(scoreData.revenue_velocity);
    this.history.retention_health.push(scoreData.retention_health);
    this.history.cash_discipline.push(scoreData.cash_discipline);
    this.history.timestamps.push(timestamp);

    // Keep only last 90 days of history
    if (this.history.timestamps.length > 90) {
      this.history.sovereign_scores = this.history.sovereign_scores.slice(-90);
      this.history.revenue_velocity = this.history.revenue_velocity.slice(-90);
      this.history.retention_health = this.history.retention_health.slice(-90);
      this.history.cash_discipline = this.history.cash_discipline.slice(-90);
      this.history.timestamps = this.history.timestamps.slice(-90);
    }

    this.saveHistory();
  }

  // Simple linear regression for trend prediction
  predictTrend(scores, daysAhead = 7) {
    if (scores.length < 3) return { trend: 'insufficient_data', prediction: null, confidence: 0 };

    const n = scores.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    for (let i = 0; i < n; i++) {
      const x = i;
      const y = scores[i];
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const prediction = intercept + slope * (n + daysAhead - 1);
    const rSquared = this.calculateRSquared(scores, slope, intercept);

    let trend;
    if (slope > 0.5) trend = 'strong_growth';
    else if (slope > 0.1) trend = 'moderate_growth';
    else if (slope > -0.1) trend = 'stable';
    else if (slope > -0.5) trend = 'moderate_decline';
    else trend = 'strong_decline';

    return {
      trend,
      prediction: Math.max(0, Math.min(100, prediction)),
      confidence: rSquared,
      slope,
      days_to_target: this.calculateDaysToTarget(scores, 90) // Days to reach sovereign score 90
    };
  }

  calculateRSquared(scores, slope, intercept) {
    const n = scores.length;
    let ssTotal = 0, ssResidual = 0;
    const mean = scores.reduce((a, b) => a + b) / n;

    for (let i = 0; i < n; i++) {
      const y = scores[i];
      const yPred = intercept + slope * i;
      ssTotal += Math.pow(y - mean, 2);
      ssResidual += Math.pow(y - yPred, 2);
    }

    return 1 - (ssResidual / ssTotal);
  }

  calculateDaysToTarget(scores, target) {
    if (scores.length < 2) return null;

    const recentScores = scores.slice(-7); // Last 7 days
    const avgDailyChange = (recentScores[recentScores.length - 1] - recentScores[0]) / (recentScores.length - 1);
    
    if (avgDailyChange <= 0) return Infinity; // Not improving
    
    const currentScore = scores[scores.length - 1];
    const pointsNeeded = target - currentScore;
    
    return Math.ceil(pointsNeeded / avgDailyChange);
  }

  detectAnomalies(scores) {
    if (scores.length < 5) return [];

    const anomalies = [];
    const mean = scores.reduce((a, b) => a + b) / scores.length;
    const stdDev = Math.sqrt(scores.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / scores.length);

    for (let i = 0; i < scores.length; i++) {
      const zScore = Math.abs((scores[i] - mean) / stdDev);
      if (zScore > 2.5) { // 2.5 standard deviations
        anomalies.push({
          index: i,
          score: scores[i],
          z_score: zScore,
          deviation: scores[i] - mean,
          is_positive: scores[i] > mean
        });
      }
    }

    return anomalies;
  }

  generateInsights(scoreData) {
    const insights = [];
    
    // Add current scores to history for analysis
    this.addScore(scoreData);

    // Analyze sovereign score trend
    const sovereignTrend = this.predictTrend(this.history.sovereign_scores);
    if (sovereignTrend.trend === 'strong_growth') {
      insights.push({
        type: 'positive',
        message: `Sovereign score showing strong growth trend (${sovereignTrend.slope.toFixed(2)} points/day)`,
        confidence: sovereignTrend.confidence
      });
    } else if (sovereignTrend.trend === 'strong_decline') {
      insights.push({
        type: 'critical',
        message: `Sovereign score declining rapidly (${sovereignTrend.slope.toFixed(2)} points/day)`,
        confidence: sovereignTrend.confidence,
        action: 'Investigate root cause immediately'
      });
    }

    // Predict future scores
    const predictions = {
      sovereign_7d: this.predictTrend(this.history.sovereign_scores, 7),
      revenue_velocity_7d: this.predictTrend(this.history.revenue_velocity, 7),
      retention_health_7d: this.predictTrend(this.history.retention_health, 7)
    };

    // Check for convergence to sovereign target
    if (sovereignTrend.days_to_target && sovereignTrend.days_to_target < 30) {
      insights.push({
        type: 'milestone',
        message: `On track to reach sovereign score 90 in ${sovereignTrend.days_to_target} days`,
        confidence: sovereignTrend.confidence
      });
    }

    // Detect anomalies
    const anomalies = this.detectAnomalies(this.history.sovereign_scores);
    if (anomalies.length > 0) {
      const latestAnomaly = anomalies[anomalies.length - 1];
      insights.push({
        type: latestAnomaly.is_positive ? 'opportunity' : 'warning',
        message: `Detected ${latestAnomaly.is_positive ? 'positive' : 'negative'} anomaly in sovereign score`,
        deviation: latestAnomaly.deviation.toFixed(1),
        action: latestAnomaly.is_positive ? 'Investigate what caused improvement' : 'Investigate root cause'
      });
    }

    // Cross-metric correlation insights
    if (this.history.sovereign_scores.length >= 5 && this.history.revenue_velocity.length >= 5) {
      const correlation = this.calculateCorrelation(
        this.history.sovereign_scores.slice(-5),
        this.history.revenue_velocity.slice(-5)
      );
      
      if (correlation > 0.7) {
        insights.push({
          type: 'insight',
          message: 'Strong correlation between sovereign score and revenue velocity',
          correlation: correlation.toFixed(2),
          implication: 'Focus on revenue growth to improve overall sovereignty'
        });
      }
    }

    return {
      current_scores: scoreData,
      predictions,
      insights,
      history_summary: {
        days_recorded: this.history.timestamps.length,
        sovereign_avg: this.history.sovereign_scores.length > 0 ? 
          this.history.sovereign_scores.reduce((a, b) => a + b) / this.history.sovereign_scores.length : 0,
        best_score: this.history.sovereign_scores.length > 0 ? Math.max(...this.history.sovereign_scores) : 0,
        worst_score: this.history.sovereign_scores.length > 0 ? Math.min(...this.history.sovereign_scores) : 0
      }
    };
  }

  calculateCorrelation(array1, array2) {
    if (array1.length !== array2.length || array1.length < 2) return 0;

    const n = array1.length;
    let sum1 = 0, sum2 = 0, sum1Sq = 0, sum2Sq = 0, pSum = 0;

    for (let i = 0; i < n; i++) {
      sum1 += array1[i];
      sum2 += array2[i];
      sum1Sq += array1[i] * array1[i];
      sum2Sq += array2[i] * array2[i];
      pSum += array1[i] * array2[i];
    }

    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));

    return den === 0 ? 0 : num / den;
  }

  generateReport(scoreData) {
    const analysis = this.generateInsights(scoreData);
    
    const report = `
# Predictive Scoring Report - ${this.projectSlug} - ${new Date().toISOString().split('T')[0]}

## Current Scores
- **Sovereign Score**: ${scoreData.sovereign_score}/100
- **Revenue Velocity**: ${scoreData.revenue_velocity}/100
- **Retention Health**: ${scoreData.retention_health}/100
- **Cash Discipline**: ${scoreData.cash_discipline}/100

## 7-Day Predictions
- **Sovereign Score**: ${analysis.predictions.sovereign_7d.prediction?.toFixed(1) || 'N/A'}/100 (${analysis.predictions.sovereign_7d.trend})
- **Revenue Velocity**: ${analysis.predictions.revenue_velocity_7d.prediction?.toFixed(1) || 'N/A'}/100 (${analysis.predictions.revenue_velocity_7d.trend})
- **Retention Health**: ${analysis.predictions.retention_health_7d.prediction?.toFixed(1) || 'N/A'}/100 (${analysis.predictions.retention_health_7d.trend})

## Key Insights
${analysis.insights.map(insight => `- **${insight.type.toUpperCase()}**: ${insight.message}${insight.action ? ` → ${insight.action}` : ''}`).join('\\n')}

## History Summary
- Days recorded: ${analysis.history_summary.days_recorded}
- Average sovereign score: ${analysis.history_summary.sovereign_avg.toFixed(1)}
- Best score: ${analysis.history_summary.best_score}
- Worst score: ${analysis.history_summary.worst_score}

## Recommended Actions
${this.generateRecommendedActions(analysis)}
`;

    return report;
  }

  generateRecommendedActions(analysis) {
    const actions = [];
    
    // Based on trends
    if (analysis.predictions.sovereign_7d.trend === 'strong_decline') {
      actions.push('1. **Immediate investigation**: Review recent changes that may have caused decline');
      actions.push('2. **Rollback consideration**: Consider reverting recent deployments');
      actions.push('3. **Customer feedback**: Survey users for pain points');
    }
    
    if (analysis.predictions.sovereign_7d.days_to_target && analysis.predictions.sovereign_7d.days_to_target < 30) {
      actions.push('1. **Accelerate growth**: Double down on what\'s working');
      actions.push('2. **Remove blockers**: Identify and eliminate remaining dependencies');
      actions.push('3. **Prepare for sovereignty**: Document runbooks and automate remaining tasks');
    }
    
    // Based on scores
    if (analysis.current_scores.sovereign_score < 60) {
      actions.push('1. **Foundation first**: Focus on core functionality and reliability');
      actions.push('2. **Automation priority**: Implement basic monitoring and alerting');
      actions.push('3. **Revenue focus**: Establish clear pricing and payment flow');
    } else if (analysis.current_scores.sovereign_score < 80) {
      actions.push('1. **Scale automation**: Expand email sequences and support automation');
      actions.push('2. **Growth channels**: Test and optimize acquisition channels');
      actions.push('3. **Retention focus**: Implement churn prevention measures');
    } else {
      actions.push('1. **Optimize efficiency**: Fine-tune existing automations');
      actions.push('2. **Expand offerings**: Test new pricing tiers or features');
      actions.push('3. **Prepare for scale**: Document processes for team expansion');
    }
    
    return actions.map(action => `- ${action}`).join('\\n');
  }

  updateContext(scoreData) {
    const contextPath = path.join(this.statePath, 'context.json');
    if (fs.existsSync(contextPath)) {
      try {
        const context = JSON.parse(fs.readFileSync(contextPath, 'utf8'));
        context.scores = {
          ...context.scores,
          ...scoreData,
          last_updated: new Date().toISOString()
        };
        fs.writeFileSync(contextPath, JSON.stringify(context, null, 2));
      } catch (e) {
        console.error(`[predictive-scoring] Failed to update context.json: ${e.message}`);
      }
    }
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: node predictive-scoring.js <project-slug> [sovereign_score revenue_velocity retention_health cash_discipline]');
    process.exit(1);
  }

  const projectSlug = args[0];
  const engine = new PredictiveScoringEngine(projectSlug);

  if (args.length >= 5) {
    // Add new scores and generate report
    const scoreData = {
      sovereign_score: parseFloat(args[1]),
      revenue_velocity: parseFloat(args[2]),
      retention_health: parseFloat(args[3]),
      cash_discipline: parseFloat(args[4])
    };

    engine.updateContext(scoreData);
    const report = engine.generateReport(scoreData);
    console.log(report);

    // Save report to file
    const reportPath = path.join(engine.statePath, 'predictive_reports', `${new Date().toISOString().split('T')[0]}.md`);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, report);
  } else {
    // Just generate insights from existing history
    const analysis = engine.generateInsights({
      sovereign_score: engine.history.sovereign_scores[engine.history.sovereign_scores.length - 1] || 0,
      revenue_velocity: engine.history.revenue_velocity[engine.history.revenue_velocity.length - 1] || 0,
      retention_health: engine.history.retention_health[engine.history.retention_health.length - 1] || 0,
      cash_discipline: engine.history.cash_discipline[engine.history.cash_discipline.length - 1] || 0
    });
    
    console.log(JSON.stringify(analysis, null, 2));
  }
}

module.exports = PredictiveScoringEngine;