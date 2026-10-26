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

// Thresholds live in atlas.config.json (founder-tunable), never in a phase
// module. Defaults match growth-engine.md's anomaly thresholds.
let THRESHOLDS = { churn_monthly_pct: 5, activation_target: 0.30, mrr_growth_pct: 20, mrr_drop_pct: -10 };
try {
  const { loadConfig } = require('./autonomy');
  THRESHOLDS = loadConfig().thresholds;
} catch {}

// ─── Decision tree (mirrors growth-engine.md logic) ───────────────────────────

function monthlyChurnPct(stripe) {
  if (!stripe?.available || stripe.mrr == null) return null;
  // Weekly churned MRR → monthly estimate; churn % of the MRR base that produced it.
  const churnedMonthly = (stripe.churned_mrr_7d || 0) * (30 / 7);
  const base = stripe.mrr + churnedMonthly;
  if (base <= 0) return null;
  return Math.round((churnedMonthly / base) * 1000) / 10;
}

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
  if (mrrDelta !== null && mrrDelta !== undefined && mrrDelta > THRESHOLDS.mrr_growth_pct) {
    return {
      action: 'amplify_growth_channel',
      reasoning: `MRR grew ${mrrDelta}% WoW — amplify the channel driving this before momentum fades.`,
      agent: 'atlas-growth',
      confidence: 'high',
      category: 'acquisition',
      estimated_impact: `compound ${mrrDelta}% weekly growth`,
    };
  }

  // Priority 4b: Activation below target (growth-engine.md decision tree:
  // "Activation < target?" → improve onboarding). Uses PostHog activation_rate
  // when the source provides it, or an activation anomaly raised by pulse.
  const activationRate = pulse.metrics?.posthog?.activation_rate;
  const activationAnomaly = anomalies.find(a => a.metric === 'activation');
  if (activationAnomaly || (typeof activationRate === 'number' && activationRate < THRESHOLDS.activation_target)) {
    return {
      action: 'improve_onboarding',
      reasoning: activationAnomaly
        ? activationAnomaly.message
        : `Activation rate ${(activationRate * 100).toFixed(0)}% is below the ${(THRESHOLDS.activation_target * 100).toFixed(0)}% target (atlas.config.json thresholds).`,
      agent: 'atlas-product',
      confidence: 'high',
      category: 'activation',
      estimated_impact: 'lift activation toward target',
    };
  }

  // Priority 4c: Churn above threshold (growth-engine.md decision tree:
  // "churn > 5%" → retention work). Threshold is founder-tunable in
  // atlas.config.json (thresholds.churn_monthly_pct, default 5).
  const churnPct = monthlyChurnPct(s);
  if (churnPct !== null && churnPct > THRESHOLDS.churn_monthly_pct) {
    return {
      action: 'retention_work',
      reasoning: `Estimated monthly churn ${churnPct}% exceeds the ${THRESHOLDS.churn_monthly_pct}% threshold (atlas.config.json thresholds).`,
      agent: 'atlas-growth',
      confidence: 'high',
      category: 'retention',
      estimated_impact: 'reduce churn below threshold',
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
    activation: 0.85,
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
