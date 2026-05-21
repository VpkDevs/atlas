/**
 * Heterogeneous Treatment Effects Engine (Causal Forest Approximation)
 *
 * Closes gap #5 from IDEAL_VS_ACTUAL.md: "Treats all users as one population."
 *
 * Problem: Current Atlas reports "onboarding improves activation 15%" as a
 * single average. But that average hides:
 *  - New users: +25% (huge win)
 *  - Power users: -5% (annoying, hurts them)
 *
 * The "average" suggests deploy to everyone, but the right action is:
 *  → Deploy only to new users; exclude power users.
 *
 * This engine learns segment-specific treatment effects (conditional average
 * treatment effects, or CATEs), without requiring ML libraries — it uses
 * recursive partitioning logic inspired by causal forests.
 */

export interface UserSegment {
  id: string;
  features: Record<string, number>; // e.g., { days_old: 7, mrr: 100 }
  outcome: number; // Observed outcome metric
  treatment: 0 | 1; // 0 = control, 1 = treatment
}

export interface SegmentTreatmentEffect {
  segmentDescription: string;
  segmentFilter: Record<string, { min?: number; max?: number; equals?: any }>;
  sampleSize: number;
  treatmentEffect: number; // Mean difference: treatment - control
  confidence: number; // Approximation: more samples = more confidence
  recommendation: 'deploy' | 'skip' | 'investigate';
}

export interface HeterogeneousAnalysis {
  averageTreatmentEffect: number; // The misleading aggregate number
  segmentEffects: SegmentTreatmentEffect[];
  hiddenHarmDetected: boolean; // Some segment is hurt by treatment
  bestSegment: SegmentTreatmentEffect | null;
  worstSegment: SegmentTreatmentEffect | null;
  recommendation: string;
}

export class HeterogeneousEffectsEngine {
  /**
   * Analyze treatment effects across segments using recursive partitioning.
   * Splits users by features and computes effect per segment.
   */
  analyze(
    observations: UserSegment[],
    features: string[],
    minSegmentSize: number = 30
  ): HeterogeneousAnalysis {
    // Compute average treatment effect (the misleading number)
    const treatment = observations.filter((o) => o.treatment === 1);
    const control = observations.filter((o) => o.treatment === 0);

    const ate = this.mean(treatment.map((o) => o.outcome)) -
                this.mean(control.map((o) => o.outcome));

    // Recursively split by features to find heterogeneous effects
    const segments = this.recursiveSplit(
      observations,
      features,
      minSegmentSize,
      0,
      3 // Max depth
    );

    // Identify hidden harm: any segment where treatment effect is negative
    const segmentEffects = segments.map((s) => this.computeSegmentEffect(s));
    const hiddenHarmDetected = segmentEffects.some((s) => s.treatmentEffect < -0.05);

    const sorted = [...segmentEffects].sort((a, b) => b.treatmentEffect - a.treatmentEffect);
    const bestSegment = sorted[0] || null;
    const worstSegment = sorted[sorted.length - 1] || null;

    let recommendation = 'Deploy to all users (no heterogeneity detected)';
    if (hiddenHarmDetected && bestSegment && worstSegment) {
      recommendation = `Deploy ONLY to segment with positive effect: ${bestSegment.segmentDescription}. SKIP segment: ${worstSegment.segmentDescription} (effect: ${(worstSegment.treatmentEffect * 100).toFixed(1)}%).`;
    } else if (segmentEffects.length > 1) {
      recommendation = `Effect varies by segment. Strongest: ${bestSegment?.segmentDescription} (+${(((bestSegment?.treatmentEffect) ?? 0) * 100).toFixed(1)}%). Consider targeting.`;
    }

    return {
      averageTreatmentEffect: ate,
      segmentEffects,
      hiddenHarmDetected,
      bestSegment,
      worstSegment,
      recommendation,
    };
  }

  /**
   * Recursive partitioning: split observations by the feature that
   * maximizes variance in treatment effect between groups.
   */
  private recursiveSplit(
    obs: UserSegment[],
    features: string[],
    minSize: number,
    depth: number,
    maxDepth: number
  ): UserSegment[][] {
    if (obs.length < minSize * 2 || depth >= maxDepth) {
      return [obs];
    }

    let bestSplit: { feature: string; threshold: number; gain: number } | null = null;

    for (const feature of features) {
      const values = obs.map((o) => o.features[feature]).filter((v) => v !== undefined);
      if (values.length < minSize) continue;

      // Try percentile-based splits
      const sortedValues = [...values].sort((a, b) => a - b);
      const candidates = [
        sortedValues[Math.floor(sortedValues.length * 0.25)],
        sortedValues[Math.floor(sortedValues.length * 0.5)],
        sortedValues[Math.floor(sortedValues.length * 0.75)],
      ];

      for (const threshold of candidates) {
        const left = obs.filter((o) => o.features[feature] !== undefined && o.features[feature] < threshold);
        const right = obs.filter((o) => o.features[feature] !== undefined && o.features[feature] >= threshold);

        if (left.length < minSize || right.length < minSize) continue;

        const leftEffect = this.computeRawEffect(left);
        const rightEffect = this.computeRawEffect(right);
        const gain = Math.abs(leftEffect - rightEffect);

        if (!bestSplit || gain > bestSplit.gain) {
          bestSplit = { feature, threshold, gain };
        }
      }
    }

    if (!bestSplit || bestSplit.gain < 0.05) {
      // No meaningful split found
      return [obs];
    }

    const left = obs.filter(
      (o) => o.features[bestSplit!.feature] !== undefined && o.features[bestSplit!.feature] < bestSplit!.threshold
    );
    const right = obs.filter(
      (o) => o.features[bestSplit!.feature] !== undefined && o.features[bestSplit!.feature] >= bestSplit!.threshold
    );

    return [
      ...this.recursiveSplit(left, features, minSize, depth + 1, maxDepth),
      ...this.recursiveSplit(right, features, minSize, depth + 1, maxDepth),
    ];
  }

  private computeRawEffect(obs: UserSegment[]): number {
    const t = obs.filter((o) => o.treatment === 1).map((o) => o.outcome);
    const c = obs.filter((o) => o.treatment === 0).map((o) => o.outcome);
    if (t.length === 0 || c.length === 0) return 0;
    return this.mean(t) - this.mean(c);
  }

  private computeSegmentEffect(obs: UserSegment[]): SegmentTreatmentEffect {
    const t = obs.filter((o) => o.treatment === 1).map((o) => o.outcome);
    const c = obs.filter((o) => o.treatment === 0).map((o) => o.outcome);

    const effect = t.length > 0 && c.length > 0
      ? this.mean(t) - this.mean(c)
      : 0;

    const confidence = Math.min(0.95, Math.log(obs.length + 1) / 8); // Rough confidence proxy

    // Describe segment by common feature ranges
    const description = this.describeSegment(obs);
    const filter = this.filterFromSegment(obs);

    let recommendation: SegmentTreatmentEffect['recommendation'] = 'investigate';
    if (effect > 0.05 && confidence > 0.5) recommendation = 'deploy';
    else if (effect < -0.05 && confidence > 0.5) recommendation = 'skip';

    return {
      segmentDescription: description,
      segmentFilter: filter,
      sampleSize: obs.length,
      treatmentEffect: effect,
      confidence,
      recommendation,
    };
  }

  private describeSegment(obs: UserSegment[]): string {
    if (obs.length === 0) return 'empty';

    const features = Object.keys(obs[0].features).filter((f) => !f.startsWith('_'));
    const ranges: string[] = [];

    for (const feature of features) {
      const values = obs.map((o) => o.features[feature]).filter((v) => v !== undefined);
      if (values.length === 0) continue;

      const min = Math.min(...values);
      const max = Math.max(...values);
      const mean = this.mean(values);

      if (max - min < 0.1 * Math.abs(mean)) {
        ranges.push(`${feature}≈${mean.toFixed(1)}`);
      } else {
        ranges.push(`${feature}∈[${min.toFixed(1)}, ${max.toFixed(1)}]`);
      }
    }

    return ranges.slice(0, 3).join(', ') || 'all users';
  }

  private filterFromSegment(obs: UserSegment[]): Record<string, { min?: number; max?: number }> {
    if (obs.length === 0) return {};

    const filter: Record<string, { min?: number; max?: number }> = {};
    const features = Object.keys(obs[0].features).filter((f) => !f.startsWith('_'));

    for (const feature of features) {
      const values = obs.map((o) => o.features[feature]).filter((v) => v !== undefined);
      if (values.length === 0) continue;
      filter[feature] = { min: Math.min(...values), max: Math.max(...values) };
    }

    return filter;
  }

  private mean(values: number[]): number {
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  /**
   * Predict treatment effect for a new user with given features.
   * Maps user to the most similar segment, returns that segment's effect.
   */
  predictEffect(
    userFeatures: Record<string, number>,
    analysis: HeterogeneousAnalysis
  ): {
    predictedEffect: number;
    matchedSegment: SegmentTreatmentEffect | null;
    confidence: number;
    recommendation: 'deploy' | 'skip';
  } {
    let bestMatch: SegmentTreatmentEffect | null = null;
    let bestDistance = Infinity;

    for (const segment of analysis.segmentEffects) {
      const distance = this.distanceToSegment(userFeatures, segment);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestMatch = segment;
      }
    }

    if (!bestMatch) {
      return {
        predictedEffect: analysis.averageTreatmentEffect,
        matchedSegment: null,
        confidence: 0.3,
        recommendation: analysis.averageTreatmentEffect > 0 ? 'deploy' : 'skip',
      };
    }

    return {
      predictedEffect: bestMatch.treatmentEffect,
      matchedSegment: bestMatch,
      confidence: bestMatch.confidence,
      recommendation: bestMatch.treatmentEffect > 0 ? 'deploy' : 'skip',
    };
  }

  private distanceToSegment(
    features: Record<string, number>,
    segment: SegmentTreatmentEffect
  ): number {
    let sumSq = 0;
    let count = 0;

    for (const [key, range] of Object.entries(segment.segmentFilter)) {
      const value = features[key];
      if (value === undefined) continue;

      const min = range.min ?? value;
      const max = range.max ?? value;
      const midpoint = (min + max) / 2;
      const halfWidth = (max - min) / 2 || 1;

      // Normalized distance from midpoint
      const normalizedDist = Math.abs(value - midpoint) / halfWidth;
      sumSq += normalizedDist * normalizedDist;
      count++;
    }

    return count > 0 ? Math.sqrt(sumSq / count) : Infinity;
  }
}
