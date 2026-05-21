/**
 * Interaction Effects Engine
 *
 * Closes gap #6 from IDEAL_VS_ACTUAL.md: "All models are additive. No interaction learning."
 *
 * Problem: Atlas models actions as independent and additive.
 *  - Retention alone: +10 points
 *  - Activation alone: +8 points
 *  - "Total" predicted: +18 points
 *
 * But actually:
 *  - Both together: +25 points (not 18!)
 *  - Synergy: +7 points from interaction
 *
 * Or worse:
 *  - Pricing alone: +5 points
 *  - Discount alone: +3 points
 *  - Both together: -2 points (cannibalization)
 *
 * This engine detects synergies and antagonisms between actions/dimensions.
 */

export interface InteractionObservation {
  actionsApplied: string[]; // Which actions were active in this observation
  observedEffect: number; // Combined effect when these actions ran together
  baselineEffect: number; // Sum of individual effects (additive prediction)
  sampleSize: number;
  observedAt: Date;
}

export interface ActionEffect {
  actionId: string;
  individualEffect: number; // Effect when this action runs alone
  individualEffectStdDev: number;
  sampleSize: number;
}

export interface InteractionEffect {
  actions: string[]; // The combination of actions
  individualSum: number; // Predicted by additive model
  observedJointEffect: number; // Actually observed
  interactionDelta: number; // observed - predicted
  interactionType: 'synergy' | 'antagonism' | 'neutral';
  significance: 'strong' | 'moderate' | 'weak' | 'none';
  recommendation: string;
}

export interface NonLinearityDetection {
  dimension: string;
  saturationPoint: number | null; // Value beyond which more = no additional benefit
  saturationConfidence: number;
  description: string;
}

export class InteractionEffectsEngine {
  private actionEffects: Map<string, ActionEffect> = new Map();
  private observations: InteractionObservation[] = [];

  /**
   * Record the individual effect of a single action.
   */
  recordIndividualEffect(effect: ActionEffect): void {
    this.actionEffects.set(effect.actionId, effect);
  }

  /**
   * Record an observation when multiple actions ran together.
   */
  recordJointObservation(observation: InteractionObservation): void {
    this.observations.push(observation);
  }

  /**
   * Analyze interactions: for each combination of actions, did the actual
   * joint effect differ from what we'd predict by adding individual effects?
   */
  analyzeInteractions(minSampleSize: number = 20): InteractionEffect[] {
    const interactions: InteractionEffect[] = [];

    // Group observations by action combination
    const grouped = new Map<string, InteractionObservation[]>();
    for (const obs of this.observations) {
      if (obs.sampleSize < minSampleSize) continue;
      const key = [...obs.actionsApplied].sort().join('|');
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(obs);
    }

    for (const [comboKey, observations] of grouped.entries()) {
      const actions = comboKey.split('|');
      if (actions.length < 2) continue; // Need 2+ for an interaction

      // Predicted by additive model: sum of individual effects
      let additivePredictionTotal = 0;
      let hasAllIndividualEffects = true;

      for (const action of actions) {
        const indEffect = this.actionEffects.get(action);
        if (!indEffect) {
          hasAllIndividualEffects = false;
          break;
        }
        additivePredictionTotal += indEffect.individualEffect;
      }

      if (!hasAllIndividualEffects) continue;

      // Actually observed: average across our observations of this combo
      const observedTotal = observations.reduce((sum, o) => sum + o.observedEffect, 0);
      const observedAvg = observedTotal / observations.length;

      const interactionDelta = observedAvg - additivePredictionTotal;
      const relativeDelta = additivePredictionTotal !== 0
        ? interactionDelta / Math.abs(additivePredictionTotal)
        : interactionDelta;

      let interactionType: InteractionEffect['interactionType'] = 'neutral';
      let significance: InteractionEffect['significance'] = 'none';

      if (Math.abs(relativeDelta) < 0.10) {
        interactionType = 'neutral';
        significance = 'none';
      } else if (relativeDelta > 0) {
        interactionType = 'synergy';
        significance = relativeDelta > 0.5 ? 'strong' : relativeDelta > 0.25 ? 'moderate' : 'weak';
      } else {
        interactionType = 'antagonism';
        significance = relativeDelta < -0.5 ? 'strong' : relativeDelta < -0.25 ? 'moderate' : 'weak';
      }

      const recommendation = this.recommendForInteraction(actions, interactionType, significance, interactionDelta);

      interactions.push({
        actions,
        individualSum: additivePredictionTotal,
        observedJointEffect: observedAvg,
        interactionDelta,
        interactionType,
        significance,
        recommendation,
      });
    }

    // Sort by absolute delta (largest interactions first)
    return interactions.sort((a, b) => Math.abs(b.interactionDelta) - Math.abs(a.interactionDelta));
  }

  private recommendForInteraction(
    actions: string[],
    type: InteractionEffect['interactionType'],
    significance: InteractionEffect['significance'],
    delta: number
  ): string {
    if (type === 'synergy' && significance !== 'none') {
      return `SYNERGY: Run ${actions.join(' + ')} together for +${delta.toFixed(1)} bonus (vs. additive prediction). These actions amplify each other.`;
    }
    if (type === 'antagonism' && significance !== 'none') {
      return `ANTAGONISM: Avoid running ${actions.join(' + ')} together. Joint effect is ${delta.toFixed(1)} LESS than additive prediction. Sequence them or pick one.`;
    }
    return `Neutral interaction: ${actions.join(' + ')} behaves additively, no special handling needed.`;
  }

  /**
   * Detect non-linear effects: does a dimension help up to a point, then plateau or hurt?
   */
  detectNonLinearity(
    dimension: string,
    observations: Array<{ value: number; outcome: number }>
  ): NonLinearityDetection {
    if (observations.length < 10) {
      return {
        dimension,
        saturationPoint: null,
        saturationConfidence: 0,
        description: 'Insufficient data for non-linearity detection',
      };
    }

    // Sort by dimension value
    const sorted = [...observations].sort((a, b) => a.value - b.value);

    // Compute marginal outcome at each percentile
    const buckets = 10;
    const bucketSize = Math.floor(sorted.length / buckets);
    const bucketMeans: Array<{ value: number; outcome: number }> = [];

    for (let i = 0; i < buckets; i++) {
      const start = i * bucketSize;
      const end = i === buckets - 1 ? sorted.length : start + bucketSize;
      const bucket = sorted.slice(start, end);

      if (bucket.length === 0) continue;

      const avgValue = bucket.reduce((s, o) => s + o.value, 0) / bucket.length;
      const avgOutcome = bucket.reduce((s, o) => s + o.outcome, 0) / bucket.length;
      bucketMeans.push({ value: avgValue, outcome: avgOutcome });
    }

    // Look for saturation: outcome stops increasing
    let saturationIndex: number | null = null;
    const initialSlope = bucketMeans.length >= 2
      ? (bucketMeans[1].outcome - bucketMeans[0].outcome) / (bucketMeans[1].value - bucketMeans[0].value || 1)
      : 0;

    for (let i = 2; i < bucketMeans.length; i++) {
      const currentSlope = (bucketMeans[i].outcome - bucketMeans[i - 1].outcome) /
                          (bucketMeans[i].value - bucketMeans[i - 1].value || 1);

      // Slope has dropped to < 20% of initial: saturation
      if (Math.abs(initialSlope) > 0 && Math.abs(currentSlope / initialSlope) < 0.2) {
        saturationIndex = i;
        break;
      }
    }

    if (saturationIndex !== null) {
      const saturationPoint = bucketMeans[saturationIndex].value;
      return {
        dimension,
        saturationPoint,
        saturationConfidence: 0.7,
        description: `${dimension} shows saturation around ${saturationPoint.toFixed(1)}. Additional investment beyond this point yields diminishing returns.`,
      };
    }

    return {
      dimension,
      saturationPoint: null,
      saturationConfidence: 0,
      description: `${dimension} appears linear; no saturation detected in observed range.`,
    };
  }

  /**
   * Find conditional interactions: "pricing matters ONLY if onboarding is good"
   */
  findConditionalEffects(
    primaryAction: string,
    conditionalActions: string[]
  ): Array<{
    primaryAction: string;
    conditionalAction: string;
    effectWhenConditionalActive: number;
    effectWhenConditionalInactive: number;
    delta: number;
    insight: string;
  }> {
    const results: Array<{
      primaryAction: string;
      conditionalAction: string;
      effectWhenConditionalActive: number;
      effectWhenConditionalInactive: number;
      delta: number;
      insight: string;
    }> = [];

    for (const conditional of conditionalActions) {
      // Find observations where primary + conditional both active
      const bothActive = this.observations.filter(
        (o) =>
          o.actionsApplied.includes(primaryAction) &&
          o.actionsApplied.includes(conditional)
      );

      // Find observations where only primary active
      const onlyPrimary = this.observations.filter(
        (o) =>
          o.actionsApplied.includes(primaryAction) &&
          !o.actionsApplied.includes(conditional)
      );

      if (bothActive.length < 5 || onlyPrimary.length < 5) continue;

      const avgBoth = bothActive.reduce((s, o) => s + o.observedEffect, 0) / bothActive.length;
      const avgOnlyPrimary = onlyPrimary.reduce((s, o) => s + o.observedEffect, 0) / onlyPrimary.length;
      const delta = avgBoth - avgOnlyPrimary;

      const insight = delta > 0
        ? `${primaryAction} is +${delta.toFixed(1)} MORE effective when ${conditional} is also active`
        : `${primaryAction} is ${delta.toFixed(1)} LESS effective when ${conditional} is also active`;

      results.push({
        primaryAction,
        conditionalAction: conditional,
        effectWhenConditionalActive: avgBoth,
        effectWhenConditionalInactive: avgOnlyPrimary,
        delta,
        insight,
      });
    }

    return results.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  }
}
