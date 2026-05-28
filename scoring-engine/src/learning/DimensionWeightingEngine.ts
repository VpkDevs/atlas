import {
  OptimalWeights,
  DimensionWeightingEngine,
} from './index';
import { SeededRNG } from '../deterministic/SeededRNG';

/**
 * Adaptive Dimension Weighting Engine — Implementation
 *
 * Learns optimal weights for business dimensions via ridge regression.
 * SaaS emphasizes retention; marketplaces emphasize acquisition.
 * This engine discovers the right balance for THIS specific business.
 *
 * Determinism: pass a SeededRNG to the constructor for reproducible
 * bootstrap weights. Without one, Math.random() is used (backward-compatible).
 */

export class DimensionWeightingEngineImpl implements DimensionWeightingEngine {
  private optimalWeights: Map<string, OptimalWeights> = new Map();
  private outcomesHistory: Array<{ dimension: string; dimensionScore: number; outcome: number }> =
    [];
  private rng?: SeededRNG;

  constructor(rng?: SeededRNG) {
    this.rng = rng;
  }

  adaptWeights(
    dimensions: Array<{ id: string; staticWeight: number }>,
    outcomesHistory: Array<{ dimension: string; dimensionScore: number; outcome: number }>
  ): OptimalWeights[] {
    this.outcomesHistory = outcomesHistory;

    const result: OptimalWeights[] = [];

    for (const dim of dimensions) {
      const dimOutcomes = outcomesHistory.filter((o) => o.dimension === dim.id);

      if (dimOutcomes.length < 3) {
        // Not enough data; use static weight
        result.push({
          dimensionId: dim.id,
          staticWeight: dim.staticWeight,
          adaptiveWeight: dim.staticWeight,
          confidenceInterval: { lower: dim.staticWeight * 0.5, upper: dim.staticWeight * 1.5 },
          reasoning: 'Insufficient data; using default weight',
          evidenceStrength: 'weak',
        });
        continue;
      }

      // Compute correlation between dimension score and outcome
      const correlation = this.computeCorrelation(
        dimOutcomes.map((o) => o.dimensionScore),
        dimOutcomes.map((o) => o.outcome)
      );

      // Ridge regression: weight = correlation × static weight (regularized)
      const adaptiveWeight = this.ridgeRegression(correlation, dim.staticWeight);
      const confidenceScore = Math.min(1, dimOutcomes.length / 10); // Saturate at 10 samples

      // Confidence interval via bootstrap
      const bootstrapWeights = this.bootstrapWeights(dimOutcomes, 100);
      const sorted = bootstrapWeights.sort((a, b) => a - b);
      const lower = sorted[Math.floor(sorted.length * 0.025)];
      const upper = sorted[Math.floor(sorted.length * 0.975)];

      const evidenceStrength =
        confidenceScore > 0.8 ? 'strong' : confidenceScore > 0.5 ? 'moderate' : 'weak';

      result.push({
        dimensionId: dim.id,
        staticWeight: dim.staticWeight,
        adaptiveWeight,
        confidenceInterval: { lower, upper },
        reasoning:
          `Correlation with outcomes: ${correlation.toFixed(3)}; ` +
          `Adjusted from ${dim.staticWeight.toFixed(2)} to ${adaptiveWeight.toFixed(2)}; ` +
          `Evidence: ${evidenceStrength}`,
        evidenceStrength,
      });

      this.optimalWeights.set(dim.id, result[result.length - 1]);
    }

    return result;
  }

  private computeCorrelation(x: number[], y: number[]): number {
    if (x.length < 2) return 0;

    const meanX = x.reduce((a, b) => a + b, 0) / x.length;
    const meanY = y.reduce((a, b) => a + b, 0) / y.length;

    const numerator = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0);
    const denomX = Math.sqrt(x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0));
    const denomY = Math.sqrt(y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0));

    return denomX === 0 || denomY === 0 ? 0 : numerator / (denomX * denomY);
  }

  private ridgeRegression(correlation: number, staticWeight: number): number {
    // Ridge: w = (corr × w_static) / (1 + λ)
    // λ = regularization parameter (0.5 is moderate)
    const lambda = 0.5;
    return (correlation * staticWeight) / (1 + lambda);
  }

  private bootstrapWeights(
    outcomes: Array<{ dimension: string; dimensionScore: number; outcome: number }>,
    iterations: number
  ): number[] {
    const weights: number[] = [];

    // Use injected RNG when provided for deterministic bootstrap;
    // otherwise fall back to Math.random() for backward compatibility.
    const nextRandom = this.rng ? () => this.rng!.randomFloat() : Math.random;

    for (let i = 0; i < iterations; i++) {
      // Random sample with replacement
      const sample = Array.from({ length: outcomes.length }, () =>
        outcomes[Math.floor(nextRandom() * outcomes.length)]
      );

      const corr = this.computeCorrelation(
        sample.map((o) => o.dimensionScore),
        sample.map((o) => o.outcome)
      );

      weights.push(corr * sample[0].dimensionScore);
    }

    return weights;
  }

  getAdaptiveScorecard(): Record<string, OptimalWeights> {
    const result: Record<string, OptimalWeights> = {};
    for (const [id, weights] of this.optimalWeights.entries()) {
      result[id] = weights;
    }
    return result;
  }

  detectDimensionShifts(): Array<{
    dimensionId: string;
    shift: number;
    significance: 'minor' | 'major';
  }> {
    const shifts: Array<{ dimensionId: string; shift: number; significance: 'minor' | 'major' }> =
      [];

    // Compare recent vs older correlations
    const recent = this.outcomesHistory.slice(-10);
    const older = this.outcomesHistory.slice(0, Math.max(5, this.outcomesHistory.length - 20));

    const dimensions = new Set(
      [...recent, ...older].map((o) => o.dimension)
    );

    for (const dim of dimensions) {
      const recentDimOutcomes = recent.filter((o) => o.dimension === dim);
      const olderDimOutcomes = older.filter((o) => o.dimension === dim);

      if (recentDimOutcomes.length < 3 || olderDimOutcomes.length < 3) continue;

      const recentCorr = this.computeCorrelation(
        recentDimOutcomes.map((o) => o.dimensionScore),
        recentDimOutcomes.map((o) => o.outcome)
      );

      const olderCorr = this.computeCorrelation(
        olderDimOutcomes.map((o) => o.dimensionScore),
        olderDimOutcomes.map((o) => o.outcome)
      );

      const shift = recentCorr - olderCorr;
      const significance = Math.abs(shift) > 0.2 ? 'major' : 'minor';

      if (Math.abs(shift) > 0.1) {
        shifts.push({
          dimensionId: dim,
          shift,
          significance,
        });
      }
    }

    return shifts;
  }
}
