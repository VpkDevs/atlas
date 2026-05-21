import { AdvancedFeedbackLoopEngine, ConvergenceMetrics } from '../learning';

/**
 * Advanced Feedback Loop Engine with Convergence Detection — Implementation
 *
 * Replaces crude max-iteration approach with mathematical convergence detection.
 * Uses residual norms, tolerance bands, and oscillation detection.
 */

export class AdvancedFeedbackLoopEngineImpl implements AdvancedFeedbackLoopEngine {
  applyFeedbackLoopsWithConvergence(
    scores: Record<string, number>,
    rules: any[],
    options?: {
      toleranceBand?: number;
      maxIterations?: number;
      oscillationThreshold?: number;
    }
  ) {
    const toleranceBand = options?.toleranceBand ?? 0.01;
    const maxIterations = options?.maxIterations ?? 100;
    const oscillationThreshold = options?.oscillationThreshold ?? 0.02;

    let current = { ...scores };
    let previous = { ...scores };
    const convergenceHistory: ConvergenceMetrics[] = [];
    const scoreHistory: Record<string, number[]> = {};

    // Initialize score history
    for (const key of Object.keys(scores)) {
      scoreHistory[key] = [scores[key]];
    }

    for (let iter = 0; iter < maxIterations; iter++) {
      // Apply feedback rules
      for (const rule of rules) {
        if (!rule.condition || !rule.action) continue;

        const score = current[rule.condition.scoreType];
        if (score === undefined) continue;

        const conditionMet = this.evaluateCondition(score, rule.condition);
        if (!conditionMet) continue;

        const adjustment = rule.action.adjustment;
        const targetScore = rule.action.targetScore;

        if (adjustment.type === 'absolute') {
          current[targetScore] = (current[targetScore] ?? 0) + adjustment.value;
        } else if (adjustment.type === 'relative') {
          current[targetScore] = (current[targetScore] ?? 0) * (1 + adjustment.value);
        } else if (adjustment.type === 'cap') {
          current[targetScore] = Math.min(100, current[targetScore] ?? 0);
        } else if (adjustment.type === 'boost') {
          current[targetScore] = (current[targetScore] ?? 0) + adjustment.value;
        }

        // Clamp to [0, 100]
        current[targetScore] = Math.max(0, Math.min(100, current[targetScore]));
      }

      // Record score history
      for (const key of Object.keys(current)) {
        if (!scoreHistory[key]) scoreHistory[key] = [];
        scoreHistory[key].push(current[key]);
      }

      // Compute convergence metrics
      const residualNorm = this.computeResidualNorm(current, previous);
      const maxResidual = this.computeMaxResidual(current, previous);
      const convergedDimensions = Object.keys(current).filter(
        (k) => Math.abs(current[k] - previous[k]) < toleranceBand
      );
      const remainingUnsettled = Object.keys(current).filter(
        (k) => Math.abs(current[k] - previous[k]) >= toleranceBand
      );

      // Detect oscillations
      const oscillating = this.detectOscillation(
        scoreHistory,
        oscillationThreshold
      );

      convergenceHistory.push({
        iteration: iter,
        residualNorm,
        maxResidual,
        oscillating,
        convergedDimensions,
        remainingUnsettled,
      });

      // Check early exit conditions
      if (residualNorm < toleranceBand && !oscillating) {
        // Converged!
        return {
          finalScores: current,
          convergenceMetrics: convergenceHistory,
          iterationsNeeded: iter + 1,
          converged: true,
        };
      }

      if (oscillating && iter > 10) {
        // Oscillating after several iterations; stop and average
        const averaged: Record<string, number> = {};
        for (const key of Object.keys(current)) {
          const recent = scoreHistory[key].slice(-5);
          averaged[key] = recent.reduce((a, b) => a + b, 0) / recent.length;
        }
        return {
          finalScores: averaged,
          convergenceMetrics: convergenceHistory,
          iterationsNeeded: iter + 1,
          converged: false, // Partial
        };
      }

      previous = { ...current };
    }

    // Max iterations reached
    return {
      finalScores: current,
      convergenceMetrics: convergenceHistory,
      iterationsNeeded: maxIterations,
      converged: false,
    };
  }

  private evaluateCondition(score: number, condition: any): boolean {
    const { operator, threshold } = condition;
    switch (operator) {
      case '>':
        return score > threshold;
      case '<':
        return score < threshold;
      case '>=':
        return score >= threshold;
      case '<=':
        return score <= threshold;
      case '==':
        return score === threshold;
      case '!=':
        return score !== threshold;
      default:
        return false;
    }
  }

  private computeResidualNorm(current: Record<string, number>, previous: Record<string, number>): number {
    let sum = 0;
    for (const key of Object.keys(current)) {
      const delta = (current[key] ?? 0) - (previous[key] ?? 0);
      sum += delta * delta;
    }
    return Math.sqrt(sum);
  }

  private computeMaxResidual(current: Record<string, number>, previous: Record<string, number>): number {
    let max = 0;
    for (const key of Object.keys(current)) {
      const delta = Math.abs((current[key] ?? 0) - (previous[key] ?? 0));
      max = Math.max(max, delta);
    }
    return max;
  }

  private detectOscillation(scoreHistory: Record<string, number[]>, threshold: number): boolean {
    for (const scores of Object.values(scoreHistory)) {
      if (scores.length < 6) continue;

      const recent = scores.slice(-5);
      let direction_changes = 0;

      for (let i = 1; i < recent.length; i++) {
        const delta1 = recent[i] - recent[i - 1];
        const delta2 = recent[i - 1] - (recent[i - 2] ?? 0);

        if (Math.sign(delta1) !== Math.sign(delta2) && delta1 !== 0 && delta2 !== 0) {
          direction_changes++;
        }
      }

      // 3+ direction changes in 5 steps = oscillating
      if (direction_changes >= 3) {
        return true;
      }
    }

    return false;
  }

  detectOscillations(scoreHistory: number[][]): { oscillating: boolean; period?: number } {
    for (const scores of scoreHistory) {
      if (scores.length < 6) continue;

      const recent = scores.slice(-10);
      let directionChanges = 0;
      let period = null;

      for (let i = 1; i < recent.length; i++) {
        const delta1 = recent[i] - recent[i - 1];
        const delta2 = recent[i - 1] - (recent[i - 2] ?? 0);

        if (Math.sign(delta1) !== Math.sign(delta2) && delta1 !== 0 && delta2 !== 0) {
          directionChanges++;
          if (period === null) {
            period = i;
          }
        }
      }

      if (directionChanges >= 3) {
        return { oscillating: true, period: period ?? undefined };
      }
    }

    return { oscillating: false };
  }
}
