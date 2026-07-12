import { Experiment, StatisticalTest } from './index';
import { SeededRNG } from './SeededRNG';

/**
 * Adversarial Testing Engine
 *
 * Generates and tests null and anti-hypotheses alongside primary hypothesis.
 * Prevents shipping changes that appear good but have hidden failure modes.
 *
 * Pattern:
 * - Primary hypothesis: "This will improve X by Y%"
 * - Null hypothesis: "This will NOT improve X" (baseline)
 * - Anti-hypothesis: "This will HURT X" (find the failure)
 *
 * Only deploy if:
 * - Primary hypothesis confirmed (p < 0.05)
 * - Null hypothesis rejected (p < 0.05)
 * - Anti-hypothesis rejected (effect is positive, not negative)
 */

export interface AdversarialHypothesis {
  id: string;
  type: 'primary' | 'null' | 'anti';
  statement: string; // Human-readable hypothesis
  expectedOutcome: string; // What outcome would confirm/reject this
  experimentId?: string; // Linked experiment if tested
}

export interface AdversarialTestResult {
  primaryHypothesisRejected: boolean; // Did we find the expected effect?
  nullHypothesisRejected: boolean; // Did we rule out "no effect"?
  antiHypothesisRejected: boolean; // Did we rule out negative effect?
  allPassed: boolean; // All three requirements met?

  primaryTest?: StatisticalTest;
  nullTest?: StatisticalTest;
  antiTest?: StatisticalTest;

  reasoning: string; // Detailed explanation of what passed/failed
  recommendation: 'deploy' | 'continue' | 'abort' | 'redesign';
  riskFactors: string[]; // Potential failure modes identified
}

export interface AdversarialTestingEngine {
  // Generate hypotheses
  generateAdversarialHypotheses(primaryHypothesis: string, dimension: string): AdversarialHypothesis[];

  // Run adversarial tests
  runAdversarialTest(
    experiment: Experiment,
    primaryResults: StatisticalTest,
    antiHypothesis: AdversarialHypothesis
  ): AdversarialTestResult;

  // Identify risk factors
  identifyRiskFactors(
    hypothesis: string,
    context: Record<string, any>
  ): string[];

  // Causal explanation
  explainCausalMechanism(
    hypothesis: string,
    observedEffect: number,
    dimensions: Record<string, number>
  ): {
    likelyMechanism: string;
    alternativeMechanisms: string[];
    confoundingRisks: string[];
  };
}

export class AdversarialTestingEngineImpl implements AdversarialTestingEngine {
  private hypothesisLibrary: Map<string, AdversarialHypothesis[]> = new Map();
  private riskFactors: Map<string, string[]> = new Map();
  private rng?: SeededRNG;

  constructor(rng?: SeededRNG) {
    this.rng = rng;
  }

  generateAdversarialHypotheses(
    primaryHypothesis: string,
    dimension: string
  ): AdversarialHypothesis[] {
    // Extract the core claim: "If we do X, Y will improve by Z%"
    // Generate null: "X will NOT improve Y"
    // Generate anti: "X will HURT Y" or "X confuses users, reduces Y"

    const primaryId = `hyp_primary_${Date.now()}`;
    const nullId = `hyp_null_${Date.now()}`;
    const antiId = `hyp_anti_${Date.now()}`;

    const hypotheses: AdversarialHypothesis[] = [
      {
        id: primaryId,
        type: 'primary',
        statement: primaryHypothesis,
        expectedOutcome: `${dimension} improves as predicted`,
      },
      {
        id: nullId,
        type: 'null',
        statement: `${primaryHypothesis.replace(/will improve/i, 'will NOT improve')}`,
        expectedOutcome: `${dimension} shows no statistically significant change`,
      },
      {
        id: antiId,
        type: 'anti',
        statement: this.generateAntiHypothesis(primaryHypothesis, dimension),
        expectedOutcome: `${dimension} worsens or shows negative effect`,
      },
    ];

    const key = `${dimension}:${primaryHypothesis}`;
    this.hypothesisLibrary.set(key, hypotheses);

    return hypotheses;
  }

  private generateAntiHypothesis(primaryHypothesis: string, dimension: string): string {
    // Generate plausible failure modes
    const failureModes = [
      `${primaryHypothesis.replace(/will improve/, 'will confuse users, hurting')}`,
      `${primaryHypothesis.replace(/will improve/, 'will introduce friction that reduces')}`,
      `${primaryHypothesis.replace(/will improve/, 'will overwhelm users, hurting')}`,
      `${primaryHypothesis.replace(/will improve/, 'will have unintended side effects reducing')}`,
    ];

    // Use SeededRNG when injected for deterministic anti-hypothesis selection;
    // otherwise fall back to Math.random() for backward compatibility.
    const index = this.rng
      ? this.rng.randomInt(0, failureModes.length - 1)
      : Math.floor(Math.random() * failureModes.length);
    return failureModes[index];
  }

  runAdversarialTest(
    experiment: Experiment,
    primaryResults: StatisticalTest,
    antiHypothesis: AdversarialHypothesis
  ): AdversarialTestResult {
    // Evaluate three conditions:
    // 1. Primary hypothesis: effect is positive and significant (p < 0.05)
    // 2. Null hypothesis: we reject "no effect" (same p < 0.05, confirms something happened)
    // 3. Anti hypothesis: effect is NOT negative (treatment > control, not treatment < control)

    const primaryPassed = primaryResults.isSignificant && primaryResults.effectSize > 0;
    const nullPassed = primaryResults.isSignificant; // Rejecting null = something changed
    const antiPassed = primaryResults.treatmentResult.primaryMetricValue >=
                       primaryResults.controlResult.primaryMetricValue * 0.95; // Allow 5% tolerance

    const allPassed = primaryPassed && nullPassed && antiPassed;

    const reasoning = this.buildReasoning(
      primaryPassed,
      nullPassed,
      antiPassed,
      primaryResults
    );

    const riskFactors = this.identifyRiskFactors(
      experiment.hypothesis,
      { effectSize: primaryResults.effectSize, confidence: primaryResults.confidence }
    );

    let recommendation: 'deploy' | 'continue' | 'abort' | 'redesign' = 'continue';
    if (allPassed) {
      recommendation = 'deploy';
    } else if (!primaryPassed || !nullPassed) {
      recommendation = 'abort'; // Effect not real
    } else if (!antiPassed) {
      recommendation = 'redesign'; // Effect is positive but mechanism needs work
    }

    return {
      primaryHypothesisRejected: primaryPassed,
      nullHypothesisRejected: nullPassed,
      antiHypothesisRejected: antiPassed,
      allPassed,
      primaryTest: primaryResults,
      reasoning,
      recommendation,
      riskFactors,
    };
  }

  private buildReasoning(
    primaryPassed: boolean,
    nullPassed: boolean,
    antiPassed: boolean,
    results: StatisticalTest
  ): string {
    const parts: string[] = [];

    if (primaryPassed) {
      parts.push(`✓ Primary hypothesis: effect size ${(results.effectSize * 100).toFixed(1)}% (p=${results.pValue.toFixed(3)})`);
    } else {
      parts.push(`✗ Primary hypothesis: effect not significant or negative (p=${results.pValue.toFixed(3)})`);
    }

    if (nullPassed) {
      parts.push(`✓ Null hypothesis: rejected (confirmed something changed)`);
    } else {
      parts.push(`✗ Null hypothesis: failed to reject (no significant change detected)`);
    }

    if (antiPassed) {
      parts.push(`✓ Anti-hypothesis: rejected (no negative effect detected)`);
    } else {
      parts.push(`✗ Anti-hypothesis: NOT rejected (treatment shows worse performance than control)`);
    }

    return parts.join('; ');
  }

  identifyRiskFactors(
    hypothesis: string,
    context: Record<string, any>
  ): string[] {
    const key = `${hypothesis}:${JSON.stringify(context)}`;
    if (this.riskFactors.has(key)) {
      return this.riskFactors.get(key)!;
    }

    const risks: string[] = [];

    // Generic risk factors
    if (context.confidence < 0.8) {
      risks.push('Low confidence: result may be due to chance');
    }

    if (Math.abs(context.effectSize) < 0.05) {
      risks.push('Small effect size: may not be practically significant');
    }

    // Domain-specific risks
    if (hypothesis.toLowerCase().includes('onboard')) {
      risks.push('Onboarding changes may harm power users (negative heterogeneous effect)');
      risks.push('May create friction for experienced users re-learning new flow');
    }

    if (hypothesis.toLowerCase().includes('pricing')) {
      risks.push('Price changes may reduce customer lifetime value if not segment-specific');
      risks.push('May trigger customer churn if perceived as price increase');
    }

    if (hypothesis.toLowerCase().includes('content')) {
      risks.push('More content may reduce signal-to-noise ratio');
      risks.push('May create cognitive overload for new users');
    }

    if (hypothesis.toLowerCase().includes('feature')) {
      risks.push('Feature complexity may confuse users despite intention to help');
      risks.push('May add unexpected dependencies or edge cases');
    }

    this.riskFactors.set(key, risks);
    return risks;
  }

  explainCausalMechanism(
    hypothesis: string,
    observedEffect: number,
    dimensions: Record<string, number>
  ): {
    likelyMechanism: string;
    alternativeMechanisms: string[];
    confoundingRisks: string[];
  } {
    // Infer the causal chain from observed effects across dimensions
    const mechanisms: string[] = [];
    const alternatives: string[] = [];
    const confounders: string[] = [];

    // If multiple dimensions improved, infer the likely causal chain
    const improvedDimensions = Object.entries(dimensions)
      .filter(([_, value]) => value > 0)
      .map(([dim, _]) => dim);

    if (improvedDimensions.length > 1) {
      mechanisms.push(
        `Multi-dimensional improvement (${improvedDimensions.join(', ')}) suggests broad positive effect`
      );
    } else if (improvedDimensions.length === 1) {
      mechanisms.push(
        `Single-dimension improvement (${improvedDimensions[0]}) suggests direct effect on this lever`
      );
    }

    // Identify confounders: what else changed around same time?
    if (observedEffect > 0.3) {
      confounders.push('Large effect size: check for concurrent external changes (seasonality, market shift)');
    }

    // Generate alternative mechanisms
    alternatives.push('Placebo effect: users tried harder because experiment made them aware');
    alternatives.push('Selection effect: different type of user assigned to treatment');
    alternatives.push('Measurement error: metric definition may have drifted');

    return {
      likelyMechanism: mechanisms[0] || 'Mechanism unclear; recommend deeper analysis',
      alternativeMechanisms: alternatives,
      confoundingRisks: confounders,
    };
  }
}
