import {
  DriftIndicator,
  AdaptiveUncertaintyResult,
  AdaptiveUncertaintyEngine,
} from '../experimentation';

/**
 * Adaptive Uncertainty Engine with Model Drift Detection — Implementation
 *
 * Detects when confidence bounds should widen due to:
 * - Data quality degradation
 * - Correlation breakdown (past patterns stop predicting)
 * - Regime change (market conditions shifted)
 * - Measurement error
 */

export class AdaptiveUncertaintyEngineImpl implements AdaptiveUncertaintyEngine {
  private driftHistory: Map<string, DriftIndicator[]> = new Map();

  detectDataDrift(
    historicalDistribution: number[],
    recentDistribution: number[],
    metric: string
  ): { drifted: boolean; severity: 'low' | 'medium' | 'high'; pValue: number } {
    // Kolmogorov-Smirnov test: compare distributions
    const ksStatistic = this.kolmogorovSmirnovTest(historicalDistribution, recentDistribution);
    const pValue = this.ksDistributionPValue(ksStatistic, historicalDistribution.length, recentDistribution.length);

    let severity: 'low' | 'medium' | 'high' = 'low';
    if (ksStatistic > 0.3) severity = 'high';
    else if (ksStatistic > 0.2) severity = 'medium';

    const drifted = pValue < 0.05;

    if (drifted) {
      this.recordDrift({
        type: 'data_quality',
        metric,
        severity,
        evidence: `KS statistic ${ksStatistic.toFixed(3)}; p-value ${pValue.toFixed(4)}`,
        detectedAt: new Date(),
      });
    }

    return { drifted, severity, pValue };
  }

  detectCorrelationBreakdown(
    metric: string,
    pastCorrelations: Record<string, number>,
    currentWindow: Record<string, number>
  ): { broken: boolean; affectedDimensions: string[] } {
    const affectedDimensions: string[] = [];

    for (const [dimension, pastCorr] of Object.entries(pastCorrelations)) {
      const currentCorr = currentWindow[dimension] ?? 0;
      const shift = Math.abs(currentCorr - pastCorr);

      // Significant shift = breakdown
      if (shift > 0.3) {
        affectedDimensions.push(dimension);
      }
    }

    const broken = affectedDimensions.length > 0;

    if (broken) {
      this.recordDrift({
        type: 'correlation_breakdown',
        metric,
        severity: affectedDimensions.length > 2 ? 'high' : 'medium',
        evidence: `${affectedDimensions.length} dimensions show correlation breakdown`,
        suggestedAction: 'Rebuild correlation model with recent data',
        detectedAt: new Date(),
      });
    }

    return { broken, affectedDimensions };
  }

  detectRegimeChange(
    contextualFeatures: Record<string, number>,
    historicalContexts: Record<string, number>[]
  ): { regimeChanged: boolean; distance: number } {
    if (historicalContexts.length === 0) {
      return { regimeChanged: false, distance: 0 };
    }

    // Compute distance to nearest historical context (Euclidean)
    let minDistance = Infinity;

    for (const historical of historicalContexts) {
      let sumSq = 0;
      for (const [key, value] of Object.entries(contextualFeatures)) {
        const historicalValue = historical[key] ?? 0;
        sumSq += Math.pow(value - historicalValue, 2);
      }
      const distance = Math.sqrt(sumSq);
      minDistance = Math.min(minDistance, distance);
    }

    // Threshold: distance > 2 std devs = regime change
    const regimeChanged = minDistance > 2;

    if (regimeChanged) {
      this.recordDrift({
        type: 'regime_change',
        metric: 'global',
        severity: 'high',
        evidence: `Context distance ${minDistance.toFixed(2)}; outside historical range`,
        suggestedAction: 'Market conditions may have shifted; collect new baseline data',
        detectedAt: new Date(),
      });
    }

    return { regimeChanged, distance: minDistance };
  }

  quantifyAdaptiveUncertainty(
    baseScore: number,
    baseUncertainty: number,
    context: Record<string, any>
  ): AdaptiveUncertaintyResult {
    let adjustedUncertainty = baseUncertainty;
    let driftPenalty = 0;
    const driftIndicators: DriftIndicator[] = [];

    // Collect all detected drifts for this context
    for (const drifts of this.driftHistory.values()) {
      const recentDrifts = drifts.filter(
        (d) => Date.now() - d.detectedAt.getTime() < 7 * 24 * 60 * 60 * 1000
      ); // Last 7 days

      for (const drift of recentDrifts) {
        driftIndicators.push(drift);

        // Apply penalty based on severity
        const penalty =
          drift.severity === 'high' ? 0.3 :
          drift.severity === 'medium' ? 0.15 : 0.05;
        driftPenalty += penalty;
      }
    }

    // Adjusted uncertainty = base + penalty
    adjustedUncertainty = baseUncertainty * (1 + driftPenalty);
    adjustedUncertainty = Math.min(100, adjustedUncertainty); // Cap at 100

    // Confidence reduced by drift
    const confidence = Math.max(0, 1 - driftPenalty * 0.5);

    // Recommendation
    let recommendation = 'confidence is sufficient';
    if (adjustedUncertainty > 20) {
      recommendation = 'collect more data to reduce uncertainty';
    }
    if (driftIndicators.some((d) => d.type === 'regime_change')) {
      recommendation = 'market conditions appear to have shifted; establish new baseline';
    }

    return {
      baseUncertainty,
      adjustedUncertainty,
      driftPenalty,
      driftIndicators,
      confidence,
      recommendation,
    };
  }

  widenConfidenceBands(
    score: number,
    reason: DriftIndicator
  ): {
    originalBounds: { lower: number; upper: number };
    widenedBounds: { lower: number; upper: number };
    widthIncrease: number;
  } {
    const originalUncertainty = score * 0.1; // Assume 10% uncertainty
    const originalBounds = {
      lower: Math.max(0, score - originalUncertainty),
      upper: Math.min(100, score + originalUncertainty),
    };

    // Widening factor based on drift severity
    const widthFactor =
      reason.severity === 'high' ? 2.0 :
      reason.severity === 'medium' ? 1.5 : 1.2;

    const widenedUncertainty = originalUncertainty * widthFactor;
    const widenedBounds = {
      lower: Math.max(0, score - widenedUncertainty),
      upper: Math.min(100, score + widenedUncertainty),
    };

    const widthIncrease =
      (widenedBounds.upper - widenedBounds.lower) -
      (originalBounds.upper - originalBounds.lower);

    return {
      originalBounds,
      widenedBounds,
      widthIncrease,
    };
  }

  // Helper methods
  private kolmogorovSmirnovTest(dist1: number[], dist2: number[]): number {
    const sorted1 = [...dist1].sort((a, b) => a - b);
    const sorted2 = [...dist2].sort((a, b) => a - b);

    let i = 0,
      j = 0;
    let maxDiff = 0;

    while (i < sorted1.length && j < sorted2.length) {
      const cdf1 = i / sorted1.length;
      const cdf2 = j / sorted2.length;
      maxDiff = Math.max(maxDiff, Math.abs(cdf1 - cdf2));

      if (sorted1[i] < sorted2[j]) {
        i++;
      } else {
        j++;
      }
    }

    return maxDiff;
  }

  private ksDistributionPValue(ksStatistic: number, n1: number, n2: number): number {
    // Simplified approximation using Kolmogorov distribution
    const en = Math.sqrt((n1 * n2) / (n1 + n2));
    const z = ksStatistic * en;

    if (z < 0.27) return 1.0;
    if (z < 3.4) return 2 * Math.exp(-2 * z * z);
    return 0.0;
  }

  private recordDrift(indicator: DriftIndicator): void {
    const key = `${indicator.type}:${indicator.metric}`;
    if (!this.driftHistory.has(key)) {
      this.driftHistory.set(key, []);
    }
    this.driftHistory.get(key)!.push(indicator);
  }
}
