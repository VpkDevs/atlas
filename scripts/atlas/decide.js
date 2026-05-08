#!/usr/bin/env node
/**
 * Atlas Decide — Weekly Action Selector
 *
 * Reads pulse.json, applies the Growth Engine decision tree,
 * and outputs a single recommended action with reasoning.
 *
 * Usage: node scripts/atlas/decide.js < /tmp/pulse.json
 *
 * Output: JSON to stdout — { action, reasoning, agent, confidence, score }
 */

const fs = require('fs');

const pulse = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));

// ─── Decision tree (mirrors growth-engine.md logic) ───────────────────────────

function decide(pulse) {
  const s = pulse.metrics?.stripe;
  const u = pulse.metrics?.uptime;
  const e = pulse.metrics?.sentry;
  const anomalies = pulse.anomalies || [];
  const gaps = pulse.data_gaps || [];

  // Priority 1: Critical anomalies (always override)
  const critical = anomalies.filter(a => a.severity === 'critical');
  if (critical.length > 0) {
    const top = critical[0];
    if (top.metric === 'uptime') {
      return {
        action: 'hotfix_uptime_incident',
        reasoning: top.message,
        agent: 'atlas-ops',
        confidence: 'high',
        category: 'incident_response',
        estimated_impact: 'restore service continuity',
      };
    }
    if (top.metric === 'errors') {
      return {
        action: 'hotfix_top_sentry_error',
        reasoning: top.message,
        agent: 'atlas-product',
        confidence: 'high',
        category: 'incident_response',
        estimated_impact: 'reduce error rate',
      };
    }
    if (top.metric === 'mrr') {
      return {
        action: 'investigate_mrr_drop',
        reasoning: top.message,
        agent: 'atlas-growth',
        confidence: 'high',
        category: 'retention',
        estimated_impact: 'identify and address churn cause',
      };
    }
  }

  // Priority 2: Data gaps — wire up missing metrics
  if (gaps.length > 0 && pulse.week_index <= 3) {
    const top = gaps[0];
    return {
      action: 'wire_missing_metric_source',
      reasoning: `No ${top.source} data: ${top.reason}. Can't make data-driven decisions without metrics.`,
      agent: 'atlas-ops',
      confidence: 'high',
      category: 'observability',
      estimated_impact: 'enable data-driven growth decisions',
      detail: top,
    };
  }

  // Priority 3: Pre-revenue — acquisition push
  if (!s?.available || s?.mrr === 0) {
    return {
      action: 'first_dollar_outreach',
      reasoning: 'MRR is $0. The only thing that matters right now is finding the first paying customer.',
      agent: 'atlas-growth',
      confidence: 'high',
      category: 'acquisition',
      estimated_impact: 'first revenue signal',
    };
  }

  // Priority 4: MRR growth opportunity
  const mrrDelta = pulse.deltas?.mrr;
  if (mrrDelta !== null && mrrDelta > 20) {
    return {
      action: 'amplify_growth_channel',
      reasoning: `MRR grew ${mrrDelta}% WoW — amplify the channel driving this before momentum fades.`,
      agent: 'atlas-growth',
      confidence: 'high',
      category: 'acquisition',
      estimated_impact: `compound ${mrrDelta}% weekly growth`,
    };
  }

  // Priority 5: Content cadence (always-on if healthy)
  return {
    action: 'schedule_weekly_content',
    reasoning: 'All systems nominal. Maintaining content cadence is the highest-leverage default action.',
    agent: 'atlas-growth',
    confidence: 'medium',
    category: 'content',
    estimated_impact: 'sustain organic acquisition',
  };
}

// ─── Score the decision ────────────────────────────────────────────────────────

function scoreDecision(decision) {
  const confidenceMap = { high: 0.9, medium: 0.6, low: 0.3 };
  const categoryImpact = {
    incident_response: 1.0,
    observability: 0.8,
    acquisition: 0.7,
    retention: 0.9,
    content: 0.4,
  };
  const conf = confidenceMap[decision.confidence] || 0.5;
  const impact = categoryImpact[decision.category] || 0.5;
  return Math.round(conf * impact * 100) / 100;
}

const decision = decide(pulse);
decision.decision_score = scoreDecision(decision);
decision.week_index = pulse.week_index;
decision.timestamp = new Date().toISOString();

process.stdout.write(JSON.stringify(decision, null, 2) + '\n');
process.exit(0);
