/**
 * Epistemic vs. Aleatoric Uncertainty Separation
 *
 * Epistemic (reducible): Uncertainty from lack of knowledge
 *  - "We've only tested 2 cohorts" → More tests reduce this
 *  - "Model hasn't seen winter yet" → Collect seasonal data
 *  - "Confidence interval is wide" → Get more samples
 *
 * Aleatoric (irreducible): Inherent randomness in the system
 *  - User behavior varies naturally
 *  - External shocks (market, competition)
 *  - Measurement noise
 *
 * Why it matters:
 * - Epistemic ±6 uncertainty can be reduced with 2 more weeks of testing
 * - Aleatoric ±2 uncertainty can't be reduced; it's just natural noise
 * - Atlas should recommend: "Collect more data" (epistemic) vs. "Accept this level" (aleatoric)
 */

export interface EpistemicAleatoicDecomposition {
  totalUncertainty: number;
  epistemicUncertainty: number; // Reducible via more experiments/data
  aleatoicUncertainty: number; // Inherent randomness
  epistemicRatio: number; // % of total that is reducible (0-1)

  epistemicSources: {
    sampleSizeInadequate: boolean;
    cohortsCovered: number; // How many user segments tested?
    seasonalCoverage: number; // % of year covered? (0-100)
    contextCoverage: number; // Market conditions tested? (0-100)
    timeSeriesCoverage: number; // How many measurement periods?
  };

  aleatoicSources: {
    measurementNoise: number; // Inherent noise in metric
    userBehaviorVariance: number; // Natural variation in user actions
    externalShocks: number; // Market/competitive shocks
  };

  recommendation: string; // "Collect more data" or "Accept this uncertainty"
}

export class EpistemicAleatoicEngine {
  /**
   * Decompose uncertainty into epistemic (reducible) and aleatoric (irreducible)
   */
  decomposeUncertainty(
    baseUncertainty: number,
    context: {
      sampleSize: number;
      minimumSampleSize: number;
      cohortsTestedCount: number;
      expectedCohortsTotal: number;
      seasonsCovered: number; // 0-4 (spring, summer, fall, winter)
      measurementNoise: number; // Std dev of metric
      userBehaviorVariance: number; // Historical variance in key behaviors
    }
  ): EpistemicAleatoicDecomposition {
    // Calculate epistemic uncertainty: from lack of data/coverage
    let epistemicUncertainty = 0;

    // 1. Sample size inadequacy
    const sampleRatio = context.sampleSize / context.minimumSampleSize;
    if (sampleRatio < 1) {
      epistemicUncertainty += baseUncertainty * (1 - sampleRatio) * 0.5; // Can reduce this by collecting more data
    }

    // 2. Cohort coverage: haven't tested all user segments
    const cohortRatio = context.cohortsTestedCount / context.expectedCohortsTotal;
    if (cohortRatio < 1) {
      epistemicUncertainty += baseUncertainty * (1 - cohortRatio) * 0.3;
    }

    // 3. Seasonal coverage: haven't tested all seasons
    const seasonRatio = context.seasonsCovered / 4;
    if (seasonRatio < 1) {
      epistemicUncertainty += baseUncertainty * (1 - seasonRatio) * 0.2;
    }

    // Calculate aleatoric uncertainty: inherent noise that can't be reduced
    const aleatoicUncertainty =
      context.measurementNoise + context.userBehaviorVariance;

    const totalUncertainty = epistemicUncertainty + aleatoicUncertainty;
    const epistemicRatio =
      totalUncertainty > 0 ? epistemicUncertainty / totalUncertainty : 0;

    const recommendation = this.recommendAction(
      epistemicUncertainty,
      aleatoicUncertainty,
      context
    );

    return {
      totalUncertainty,
      epistemicUncertainty,
      aleatoicUncertainty,
      epistemicRatio,
      epistemicSources: {
        sampleSizeInadequate: context.sampleSize < context.minimumSampleSize,
        cohortsCovered: context.cohortsTestedCount,
        seasonalCoverage: (seasonRatio * 100),
        contextCoverage: 50, // Placeholder; would track market conditions
        timeSeriesCoverage: context.sampleSize,
      },
      aleatoicSources: {
        measurementNoise: context.measurementNoise,
        userBehaviorVariance: context.userBehaviorVariance,
        externalShocks: 0, // Placeholder; would detect external events
      },
      recommendation,
    };
  }

  private recommendAction(
    epistemicUncertainty: number,
    aleatoicUncertainty: number,
    context: any
  ): string {
    const epistemicRatio =
      epistemicUncertainty / (epistemicUncertainty + aleatoicUncertainty);

    if (epistemicRatio > 0.6) {
      // Most uncertainty is epistemic (reducible)
      const weeksNeeded = this.estimateWeeksToReduce(
        epistemicUncertainty,
        context.sampleSize
      );
      return `High epistemic uncertainty (${(epistemicRatio * 100).toFixed(0)}% reducible). Collect more data for ${weeksNeeded} weeks to reduce uncertainty by ~30%.`;
    }

    if (epistemicRatio > 0.3) {
      // Mixed epistemic and aleatoric
      return `Moderate epistemic uncertainty (${(epistemicRatio * 100).toFixed(0)}% reducible). Additional data collection could help, but expect ~${(aleatoicUncertainty * 100).toFixed(0)}% irreducible noise.`;
    }

    // Mostly aleatoric
    return `Low epistemic uncertainty (${(epistemicRatio * 100).toFixed(0)}% reducible). Further data collection unlikely to help; ${(aleatoicUncertainty * 100).toFixed(0)}% is inherent randomness.`;
  }

  private estimateWeeksToReduce(
    epistemicUncertainty: number,
    currentSampleSize: number
  ): number {
    // Uncertainty scales as 1/sqrt(n), so to halve it, need 4x the data
    // Estimate based on growth rate
    if (currentSampleSize < 100) return 2;
    if (currentSampleSize < 500) return 3;
    if (currentSampleSize < 2000) return 4;
    return 6;
  }

  /**
   * Quantify each source of uncertainty separately
   */
  quantifyUncertaintySources(metrics: {
    metricStdDev: number; // σ of the primary metric
    sampleSize: number;
    historicalVariance: number; // How much does this metric vary historically?
    externalShockSensitivity: number; // 0-1: how much does external events affect this?
  }): {
    samplingError: number; // σ / sqrt(n)
    inherentVariance: number; // Historical variation
    externalRisk: number; // Shock sensitivity
    total: number;
  } {
    const samplingError = metrics.metricStdDev / Math.sqrt(metrics.sampleSize);
    const inherentVariance = metrics.historicalVariance;
    const externalRisk = metrics.externalShockSensitivity * 10; // Scale to comparable units

    return {
      samplingError, // Epistemic: goes away with more samples
      inherentVariance, // Aleatoric: permanent
      externalRisk, // Aleatoric: permanent
      total: samplingError + inherentVariance + externalRisk,
    };
  }

  /**
   * Predict: how many more samples to reduce uncertainty by target amount?
   */
  predictSamplesNeededForConfidence(
    currentSampleSize: number,
    currentUncertainty: number,
    targetUncertainty: number,
    epistemicRatio: number
  ): {
    samplesNeeded: number;
    weeksEstimate: number;
    feasible: boolean; // Can we actually reduce to target?
  } {
    if (epistemicRatio < 0.2) {
      // Most uncertainty is aleatoric; can't reduce much
      return {
        samplesNeeded: Infinity,
        weeksEstimate: Infinity,
        feasible: false,
      };
    }

    // Epistemic uncertainty scales as 1/sqrt(n)
    // Current epistemic = currentUncertainty * epistemicRatio
    // Target epistemic = targetUncertainty * epistemicRatio
    // Solve: target = current / sqrt(newN / oldN)

    const currentEpistemic = currentUncertainty * epistemicRatio;
    const targetEpistemic = targetUncertainty * epistemicRatio;

    if (targetEpistemic > currentEpistemic) {
      return { samplesNeeded: 0, weeksEstimate: 0, feasible: true };
    }

    const ratio = (currentEpistemic / targetEpistemic) ** 2;
    const samplesNeeded = currentSampleSize * ratio;
    const additionalSamples = samplesNeeded - currentSampleSize;

    // Estimate weeks: assume ~100 samples per week
    const weeksEstimate = additionalSamples / 100;

    return {
      samplesNeeded: Math.ceil(samplesNeeded),
      weeksEstimate: Math.ceil(weeksEstimate),
      feasible: weeksEstimate < 12, // Feasible if less than 3 months
    };
  }
}
