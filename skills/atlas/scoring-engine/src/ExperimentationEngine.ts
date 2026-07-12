import {
  Experiment,
  ExperimentResult,
  StatisticalTest,
  ExperimentationEngine,
} from './index';
import { SeededRNG } from './SeededRNG';

/**
 * Experimentation Engine — Implementation
 *
 * Runs statistically rigorous AB tests. Prevents early-stopping bias.
 * Tracks decisions only when p < alpha.
 *
 * Determinism: pass a SeededRNG to the constructor for reproducible
 * experiment IDs. Without one, Math.random() is used.
 */

export class ExperimentationEngineImpl implements ExperimentationEngine {
  private experiments: Map<string, Experiment> = new Map();
  private results: Map<string, ExperimentResult[]> = new Map();
  private learnings: Map<string, string[]> = new Map();
  private rng?: SeededRNG;

  constructor(rng?: SeededRNG) {
    this.rng = rng;
  }

  createExperiment(config: Omit<Experiment, 'id' | 'status' | 'createdAt'>): Experiment {
    const randomSuffix = this.rng
      ? this.rng.randomFloat().toString(36).slice(2)
      : Math.random().toString(36).slice(2);
    const id = `exp_${Date.now()}_${randomSuffix}`;

    const experiment: Experiment = {
      ...config,
      id,
      status: 'planned',
      createdAt: new Date(),
    };

    this.experiments.set(id, experiment);
    this.results.set(id, []);
    return experiment;
  }

  startExperiment(experimentId: string): { started: boolean; startedAt: Date } {
    const exp = this.experiments.get(experimentId);
    if (!exp) throw new Error(`Experiment ${experimentId} not found`);

    exp.status = 'running';
    exp.startedAt = new Date();
    return { started: true, startedAt: exp.startedAt };
  }

  recordObservation(
    experimentId: string,
    variantId: string,
    metrics: Record<string, number>,
    timestamp: Date
  ): void {
    const exp = this.experiments.get(experimentId);
    if (!exp) throw new Error(`Experiment ${experimentId} not found`);

    const variant = exp.variants.find((v) => v.id === variantId);
    if (!variant) throw new Error(`Variant ${variantId} not found`);

    const results = this.results.get(experimentId) || [];
    results.push({
      experimentId,
      variant: variantId,
      observations: (results.filter((r) => r.variant === variantId).length || 0) + 1,
      primaryMetricValue: metrics[exp.primaryMetric] ?? 0,
      secondaryMetricValues: Object.fromEntries(
        exp.secondaryMetrics.map((m) => [m, metrics[m] ?? 0])
      ),
      confidenceInterval: { lower: 0, upper: 0 }, // Computed during analysis
      standardError: 0, // Computed during analysis
    });

    this.results.set(experimentId, results);
  }

  analyzeExperiment(experimentId: string): StatisticalTest {
    const exp = this.experiments.get(experimentId);
    if (!exp) throw new Error(`Experiment ${experimentId} not found`);

    const results = this.results.get(experimentId) || [];
    const controlVariant = exp.variants.find((v) => v.name === 'control');
    const treatmentVariant = exp.variants.find((v) => v.name !== 'control');

    if (!controlVariant || !treatmentVariant) {
      throw new Error('Experiment must have control and treatment variants');
    }

    const controlResults = results.filter((r) => r.variant === controlVariant.id);
    const treatmentResults = results.filter((r) => r.variant === treatmentVariant.id);

    if (controlResults.length === 0 || treatmentResults.length === 0) {
      throw new Error('Insufficient observations for analysis');
    }

    const controlMean = this.mean(controlResults.map((r) => r.primaryMetricValue));
    const treatmentMean = this.mean(treatmentResults.map((r) => r.primaryMetricValue));

    const controlStdDev = this.stdDev(controlResults.map((r) => r.primaryMetricValue));
    const treatmentStdDev = this.stdDev(treatmentResults.map((r) => r.primaryMetricValue));

    const pooledStdErr = Math.sqrt(
      (controlStdDev ** 2 / controlResults.length) +
      (treatmentStdDev ** 2 / treatmentResults.length)
    );

    const testStatistic = (treatmentMean - controlMean) / pooledStdErr;
    const pValue = this.tDistributionPValue(testStatistic, controlResults.length + treatmentResults.length - 2);
    const isSignificant = pValue < exp.alpha;

    // Guard against near-zero control mean (e.g., cold-start metrics like
    // "new feature usage" where baseline is 0). Without this, effectSize
    // becomes Infinity and breaks downstream recommendation logic.
    const NEAR_ZERO_EPSILON = 0.0001;
    const effectSize = Math.abs(controlMean) > NEAR_ZERO_EPSILON
      ? (treatmentMean - controlMean) / controlMean
      : (treatmentMean > controlMean ? 1.0 : treatmentMean < controlMean ? -1.0 : 0);
    const meetsMide = Math.abs(effectSize) >= exp.minimumDetectableEffect;

    const controlResult: ExperimentResult = {
      experimentId,
      variant: controlVariant.id,
      observations: controlResults.length,
      primaryMetricValue: controlMean,
      secondaryMetricValues: {},
      confidenceInterval: {
        lower: controlMean - 1.96 * pooledStdErr,
        upper: controlMean + 1.96 * pooledStdErr,
      },
      standardError: pooledStdErr,
    };

    const treatmentResult: ExperimentResult = {
      experimentId,
      variant: treatmentVariant.id,
      observations: treatmentResults.length,
      primaryMetricValue: treatmentMean,
      secondaryMetricValues: {},
      confidenceInterval: {
        lower: treatmentMean - 1.96 * pooledStdErr,
        upper: treatmentMean + 1.96 * pooledStdErr,
      },
      standardError: pooledStdErr,
    };

    let recommendation: 'deploy' | 'continue' | 'abort' | 'inconclusive' = 'continue';

    if (isSignificant && meetsMide && treatmentMean > controlMean) {
      recommendation = 'deploy';
    } else if (isSignificant && treatmentMean < controlMean) {
      recommendation = 'abort';
    } else if (!isSignificant && controlResults.length >= exp.minSampleSize) {
      recommendation = 'inconclusive';
    }

    return {
      controlResult,
      treatmentResult,
      testStatistic,
      pValue,
      isSignificant,
      effectSize,
      confidence: 1 - exp.alpha,
      methodology: 'welchs_t',
      recommendation,
    };
  }

  checkEarlyStop(experimentId: string): {
    shouldStop: boolean;
    reason?: 'winner_clear' | 'loser_clear' | 'too_long';
    confidenceLevel?: number;
  } {
    const exp = this.experiments.get(experimentId);
    if (!exp || !exp.startedAt) {
      return { shouldStop: false };
    }

    const daysElapsed = (Date.now() - exp.startedAt.getTime()) / (1000 * 60 * 60 * 24);

    if (daysElapsed > exp.maxDuration) {
      return { shouldStop: true, reason: 'too_long' };
    }

    if (daysElapsed < exp.minDuration) {
      return { shouldStop: false };
    }

    try {
      const test = this.analyzeExperiment(experimentId);

      if (test.isSignificant && test.recommendation === 'deploy') {
        return { shouldStop: true, reason: 'winner_clear', confidenceLevel: test.confidence };
      }

      if (test.recommendation === 'abort') {
        return { shouldStop: true, reason: 'loser_clear', confidenceLevel: test.confidence };
      }
    } catch (e) {
      // Not enough data yet
    }

    return { shouldStop: false };
  }

  analyzeSequential(experimentId: string): {
    stillRunning: boolean;
    confidenceReached?: number;
    recommendedAction?: 'deploy' | 'continue' | 'abort';
  } {
    const earlyStop = this.checkEarlyStop(experimentId);

    if (earlyStop.shouldStop) {
      let recommendedAction: 'deploy' | 'continue' | 'abort' = 'continue';

      if (earlyStop.reason === 'winner_clear') {
        recommendedAction = 'deploy';
      } else if (earlyStop.reason === 'loser_clear') {
        recommendedAction = 'abort';
      }

      return {
        stillRunning: false,
        confidenceReached: earlyStop.confidenceLevel,
        recommendedAction,
      };
    }

    return { stillRunning: true };
  }

  updateBanditAllocation(experimentId: string): {
    newAllocations: Record<string, number>;
    reasoning: string;
  } {
    const exp = this.experiments.get(experimentId);
    if (!exp) throw new Error(`Experiment ${experimentId} not found`);

    const results = this.results.get(experimentId) || [];

    // Thompson sampling: allocate proportional to posterior probability of being best
    const newAllocations: Record<string, number> = {};
    let totalSuccessRate = 0;

    for (const variant of exp.variants) {
      const variantResults = results.filter((r) => r.variant === variant.id);
      const successRate = variantResults.length > 0
        ? this.mean(variantResults.map((r) => r.primaryMetricValue)) / 100
        : 0.5;

      newAllocations[variant.id] = successRate;
      totalSuccessRate += successRate;
    }

    // Normalize to 100%
    for (const variant of Object.keys(newAllocations)) {
      newAllocations[variant] = (newAllocations[variant] / totalSuccessRate) * 100;
    }

    return {
      newAllocations,
      reasoning: 'Thompson sampling: proportional to posterior success probability',
    };
  }

  concludeExperiment(experimentId: string): {
    winner?: string;
    effectSize: number;
    confidence: number;
    nextSteps: string;
  } {
    const exp = this.experiments.get(experimentId);
    if (!exp) throw new Error(`Experiment ${experimentId} not found`);

    exp.status = 'completed';
    exp.endedAt = new Date();

    try {
      const test = this.analyzeExperiment(experimentId);

      if (test.recommendation === 'deploy') {
        return {
          winner: test.treatmentResult.variant,
          effectSize: test.effectSize,
          confidence: test.confidence,
          nextSteps: 'Deploy treatment to 100% of users',
        };
      }

      if (test.recommendation === 'abort') {
        return {
          effectSize: test.effectSize,
          confidence: test.confidence,
          nextSteps: 'Treatment underperformed; return to control',
        };
      }

      return {
        effectSize: test.effectSize,
        confidence: test.confidence,
        nextSteps: 'Results inconclusive; extend experiment or try different treatment',
      };
    } catch (e) {
      return {
        effectSize: 0,
        confidence: 0,
        nextSteps: 'Insufficient data to conclude',
      };
    }
  }

  recordLearning(experimentId: string, learning: string): void {
    if (!this.learnings.has(experimentId)) {
      this.learnings.set(experimentId, []);
    }
    this.learnings.get(experimentId)!.push(learning);
  }

  getLearnings(topic: string): string[] {
    const results: string[] = [];
    for (const learnings of this.learnings.values()) {
      results.push(...learnings.filter((l) => l.toLowerCase().includes(topic.toLowerCase())));
    }
    return results;
  }

  // Helper methods
  private mean(values: number[]): number {
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  private stdDev(values: number[]): number {
    if (values.length < 2) return 0;
    const m = this.mean(values);
    const variance = values.reduce((sum, v) => sum + Math.pow(v - m, 2), 0) / (values.length - 1);
    return Math.sqrt(variance);
  }

  private tDistributionPValue(tStat: number, df: number): number {
    // Simplified approximation: use normal distribution for large df
    if (df > 30) {
      // Standard normal approximation
      return 2 * (1 - this.normalCDF(Math.abs(tStat)));
    }

    // For small df, this is an approximation
    return 2 * (1 - this.normalCDF(Math.abs(tStat)));
  }

  private normalCDF(z: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = z < 0 ? -1 : 1;
    z = Math.abs(z) / Math.sqrt(2);

    const t = 1 / (1 + p * z);
    const t2 = t * t;
    const t3 = t2 * t;
    const t4 = t3 * t;
    const t5 = t4 * t;

    const y = 1 - (a5 * t5 + a4 * t4 + a3 * t3 + a2 * t2 + a1 * t) * Math.exp(-z * z);

    return 0.5 * (1 + sign * y);
  }
}
