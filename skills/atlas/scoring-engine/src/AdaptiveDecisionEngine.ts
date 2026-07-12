import {
  DecisionHistory,
  DecisionCorrelation,
  AdaptiveDecisionResult,
  LearningEngine,
} from './index';

/**
 * Adaptive Decision Learning Engine — Implementation
 *
 * Learns which decision types produce best outcomes, adjusts priorities dynamically.
 * Maintains decision history, computes success rates, identifies underutilized winners.
 */

export class AdaptiveDecisionEngineImpl implements LearningEngine {
  private decisionHistory: Map<string, DecisionHistory[]> = new Map();
  private decisionCorrelations: Map<string, DecisionCorrelation> = new Map();
  private readonly minBootstrapSamples = 5; // Need 5+ decisions before adaptation

  recordDecision(history: DecisionHistory): void {
    if (!this.decisionHistory.has(history.decisionType)) {
      this.decisionHistory.set(history.decisionType, []);
    }
    this.decisionHistory.get(history.decisionType)!.push(history);

    // Recompute correlation for this decision type
    this.updateCorrelation(history.decisionType);
  }

  private updateCorrelation(decisionType: string): void {
    const histories = this.decisionHistory.get(decisionType) || [];
    if (histories.length === 0) return;

    const succeededCount = histories.filter((h) => h.succeeded).length;
    const successRate = succeededCount / histories.length;

    // Compare actual outcome to predicted impact
    const deltas = histories.map((h) => h.actualOutcome - h.predictedImpact);
    const avgActualVsPredicted = deltas.reduce((a, b) => a + b, 0) / deltas.length;

    // Compute average ROI (outcome per unit effort, assuming effort is predictedImpact)
    const rois = histories.map((h) =>
      h.predictedImpact > 0 ? (h.actualOutcome - h.predictedImpact) / h.predictedImpact : 0
    );
    const averageROI = rois.reduce((a, b) => a + b, 0) / rois.length;

    // Compute confidence: sample size + consistency
    const variance =
      deltas.reduce((sum, delta) => sum + Math.pow(delta - avgActualVsPredicted, 2), 0) /
      deltas.length;
    const stdDev = Math.sqrt(variance);
    const standardError = stdDev / Math.sqrt(histories.length);
    const confidence = Math.min(1, 1 / (1 + standardError)); // Higher consistency = higher confidence

    // Detect trend: is success rate improving over time?
    const recent = histories.slice(-Math.ceil(histories.length / 3));
    const recentSuccessRate = recent.filter((h) => h.succeeded).length / recent.length;
    const trendDirection = recentSuccessRate > successRate * 1.1 ? 'improving' :
                           recentSuccessRate < successRate * 0.9 ? 'declining' : 'stable';

    this.decisionCorrelations.set(decisionType, {
      decisionType,
      successRate,
      averageActualVsPredicted: avgActualVsPredicted,
      averageROI,
      sampleSize: histories.length,
      confidence,
      trendDirection,
      lastUpdated: new Date(),
    });
  }

  adaptDecisionPriority(
    baseDecisionTree: Array<{ type: string; priority: number }>
  ): AdaptiveDecisionResult {
    const learningPhase =
      Math.max(...Array.from(this.decisionHistory.values()).map((h) => h.length)) <
      this.minBootstrapSamples
        ? 'bootstrap'
        : 'active';

    const rankedDecisions = baseDecisionTree
      .map((decision) => {
        const correlation = this.decisionCorrelations.get(decision.type);
        const historicalComparable = this.decisionHistory
          .get(decision.type)
          ?.sort((a, b) => b.actualOutcome - a.actualOutcome)[0];

        // Score: base priority weighted by historical success and ROI
        let score = decision.priority;

        if (correlation && learningPhase === 'active') {
          const successWeight = correlation.successRate; // 0-1
          const roiWeight = Math.max(0, correlation.averageROI); // 0+
          const confidenceWeight = correlation.confidence; // 0-1

          // Adaptive multiplier: success × (1 + ROI) × confidence
          const adaptiveMultiplier = successWeight * (1 + roiWeight) * confidenceWeight;
          score = score * adaptiveMultiplier;
        }

        return {
          decisionType: decision.type,
          score,
          successRate: correlation?.successRate ?? 0,
          reasoning:
            learningPhase === 'bootstrap'
              ? `[Bootstrap] Not enough data yet; using default priority ${decision.priority}`
              : `Success rate: ${(correlation?.successRate ?? 0).toFixed(2)}; ` +
                `ROI: ${(correlation?.averageROI ?? 0).toFixed(2)}x; ` +
                `Trend: ${correlation?.trendDirection ?? 'unknown'}`,
          historicalComparable,
        };
      })
      .sort((a, b) => b.score - a.score);

    return {
      rankedDecisions,
      metadata: {
        learningPhase,
        decisionHistorySize: Array.from(this.decisionHistory.values()).reduce(
          (sum, arr) => sum + arr.length,
          0
        ),
        recommendedRetestAge: 7, // Days
      },
    };
  }

  getDecisionCorrelation(decisionType: string): DecisionCorrelation | null {
    return this.decisionCorrelations.get(decisionType) ?? null;
  }

  identifyUnderutilizedWinners(): string[] {
    const correlations = Array.from(this.decisionCorrelations.values());
    const highSuccessRate = 0.7;
    const lowFrequency = 2; // Used ≤ 2 times

    return correlations
      .filter(
        (c) =>
          c.successRate >= highSuccessRate &&
          c.sampleSize <= lowFrequency &&
          c.trendDirection !== 'declining'
      )
      .map((c) => c.decisionType);
  }

  getFailurePatterns(): Array<{
    pattern: string;
    frequency: number;
    commonContext?: Record<string, any>;
  }> {
    const patterns: Record<string, number> = {};
    const contextMap: Record<string, Record<string, any>> = {};

    for (const [decisionType, histories] of this.decisionHistory.entries()) {
      const failures = histories.filter((h) => !h.succeeded);
      if (failures.length === 0) continue;

      const pattern = `${decisionType}_failed`;
      patterns[pattern] = (patterns[pattern] ?? 0) + failures.length;

      // Aggregate common context from failures
      contextMap[pattern] = failures
        .reduce((acc, failure) => {
          acc.avgConfidence = (acc.avgConfidence ?? 0) + failure.confidenceAtDecision;
          acc.avgLagDays = (acc.avgLagDays ?? 0) + failure.lagDays;
          return acc;
        }, {} as Record<string, any>);

      contextMap[pattern].avgConfidence /= failures.length;
      contextMap[pattern].avgLagDays /= failures.length;
    }

    return Object.entries(patterns).map(([pattern, frequency]) => ({
      pattern,
      frequency,
      commonContext: contextMap[pattern],
    }));
  }
}
