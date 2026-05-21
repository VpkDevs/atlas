/**
 * Pareto Multi-Objective Optimization Engine
 *
 * Closes gap #4 from IDEAL_VS_ACTUAL.md: "Optimizes one metric at a time;
 * doesn't learn hidden tradeoffs."
 *
 * Problem: Atlas optimizes MRR. Action "blast email weekly" improves MRR +3%
 * but increases churn by 8%. Net effect: lost customers, hollow growth.
 *
 * Solution: Track every action across ALL outcomes simultaneously. Identify
 * Pareto-optimal actions (improve some metrics without degrading others).
 * Avoid dominated strategies (worse on every dimension).
 *
 * Key concepts:
 *  - Pareto frontier: set of actions where no other action is strictly better
 *  - Dominated action: another action improves at least one metric while not hurting any
 *  - Pareto-optimal action: nothing dominates it
 */

export interface MultiObjectiveAction {
  id: string;
  description: string;
  outcomes: Record<string, number>; // e.g., { mrr: 100, retention: -2, activation: 5 }
  executionCost: number;
  confidence: number;
}

export interface ParetoAnalysis {
  paretoOptimal: MultiObjectiveAction[]; // Frontier (no action dominates these)
  dominated: Array<{
    action: MultiObjectiveAction;
    dominatedBy: MultiObjectiveAction[];
    reasoning: string;
  }>;
  tradeoffs: TradeoffDiscovery[];
  recommendation: string;
}

export interface TradeoffDiscovery {
  metric1: string;
  metric2: string;
  correlation: number; // -1 to 1 across actions
  description: string;
  example: string; // Concrete example action
}

export interface Preference {
  metric: string;
  weight: number; // Relative importance
  minimumAcceptable?: number; // Don't go below this
}

export class ParetoOptimizationEngine {
  private actionHistory: MultiObjectiveAction[] = [];

  /**
   * Add an action with its multi-dimensional outcomes.
   */
  recordAction(action: MultiObjectiveAction): void {
    this.actionHistory.push(action);
  }

  /**
   * Identify the Pareto frontier across all recorded actions.
   * An action is Pareto-optimal if no other action dominates it.
   */
  analyzeFrontier(actions: MultiObjectiveAction[] = this.actionHistory): ParetoAnalysis {
    const paretoOptimal: MultiObjectiveAction[] = [];
    const dominated: Array<{
      action: MultiObjectiveAction;
      dominatedBy: MultiObjectiveAction[];
      reasoning: string;
    }> = [];

    for (const action of actions) {
      const dominators = this.findDominators(action, actions);
      if (dominators.length === 0) {
        paretoOptimal.push(action);
      } else {
        dominated.push({
          action,
          dominatedBy: dominators,
          reasoning: this.explainDomination(action, dominators[0]),
        });
      }
    }

    const tradeoffs = this.discoverTradeoffs(actions);
    const recommendation = this.buildRecommendation(paretoOptimal, dominated, tradeoffs);

    return {
      paretoOptimal,
      dominated,
      tradeoffs,
      recommendation,
    };
  }

  /**
   * An action A dominates B if A is >= B on every metric and > on at least one.
   */
  private findDominators(
    candidate: MultiObjectiveAction,
    allActions: MultiObjectiveAction[]
  ): MultiObjectiveAction[] {
    return allActions.filter((other) => {
      if (other.id === candidate.id) return false;
      return this.dominates(other, candidate);
    });
  }

  private dominates(a: MultiObjectiveAction, b: MultiObjectiveAction): boolean {
    const metrics = new Set([...Object.keys(a.outcomes), ...Object.keys(b.outcomes)]);

    let strictlyBetterOnAtLeastOne = false;
    for (const metric of metrics) {
      const aValue = a.outcomes[metric] ?? 0;
      const bValue = b.outcomes[metric] ?? 0;

      // a must be >= b on every metric (assuming higher is better)
      // Note: for metrics where lower is better (e.g., churn, cost), invert sign before passing in
      if (aValue < bValue) return false;
      if (aValue > bValue) strictlyBetterOnAtLeastOne = true;
    }

    return strictlyBetterOnAtLeastOne;
  }

  private explainDomination(
    dominated: MultiObjectiveAction,
    dominator: MultiObjectiveAction
  ): string {
    const improvements: string[] = [];
    const metrics = new Set([
      ...Object.keys(dominated.outcomes),
      ...Object.keys(dominator.outcomes),
    ]);

    for (const metric of metrics) {
      const dVal = dominated.outcomes[metric] ?? 0;
      const dorVal = dominator.outcomes[metric] ?? 0;
      if (dorVal > dVal) {
        improvements.push(`${metric}: ${dVal.toFixed(1)} → ${dorVal.toFixed(1)}`);
      }
    }

    return `"${dominator.description}" beats this on: ${improvements.join(', ')}; no metric is worse.`;
  }

  /**
   * Discover hidden tradeoffs: pairs of metrics that anti-correlate across actions.
   * E.g., "content increases acquisition but hurts retention" is a discovered tradeoff.
   */
  private discoverTradeoffs(actions: MultiObjectiveAction[]): TradeoffDiscovery[] {
    if (actions.length < 5) return []; // Need enough data

    const tradeoffs: TradeoffDiscovery[] = [];
    const allMetrics = new Set<string>();
    actions.forEach((a) => Object.keys(a.outcomes).forEach((m) => allMetrics.add(m)));

    const metrics = Array.from(allMetrics);

    for (let i = 0; i < metrics.length; i++) {
      for (let j = i + 1; j < metrics.length; j++) {
        const m1 = metrics[i];
        const m2 = metrics[j];
        const values1 = actions.map((a) => a.outcomes[m1] ?? 0);
        const values2 = actions.map((a) => a.outcomes[m2] ?? 0);

        const corr = this.correlation(values1, values2);

        if (corr < -0.3) {
          // Strong negative correlation = real tradeoff
          const worstExample = actions
            .filter((a) => a.outcomes[m1] > 0 && a.outcomes[m2] < 0)
            .sort((a, b) => (b.outcomes[m1] - b.outcomes[m2]) - (a.outcomes[m1] - a.outcomes[m2]))[0];

          tradeoffs.push({
            metric1: m1,
            metric2: m2,
            correlation: corr,
            description: `Actions that improve ${m1} tend to hurt ${m2} (correlation: ${corr.toFixed(2)})`,
            example: worstExample
              ? `"${worstExample.description}": ${m1} +${worstExample.outcomes[m1].toFixed(1)}, ${m2} ${worstExample.outcomes[m2].toFixed(1)}`
              : 'No concrete example yet',
          });
        }
      }
    }

    return tradeoffs;
  }

  private correlation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;
    const mx = x.reduce((a, b) => a + b, 0) / x.length;
    const my = y.reduce((a, b) => a + b, 0) / y.length;

    let num = 0;
    let dx = 0;
    let dy = 0;

    for (let i = 0; i < x.length; i++) {
      const xd = x[i] - mx;
      const yd = y[i] - my;
      num += xd * yd;
      dx += xd * xd;
      dy += yd * yd;
    }

    const denom = Math.sqrt(dx * dy);
    return denom > 0 ? num / denom : 0;
  }

  /**
   * Given user's preferences (weights and constraints), pick the best Pareto-optimal action.
   */
  pickBestAction(
    paretoActions: MultiObjectiveAction[],
    preferences: Preference[]
  ): {
    bestAction: MultiObjectiveAction | null;
    score: number;
    reasoning: string;
    feasibleActions: MultiObjectiveAction[];
  } {
    // Filter to actions meeting minimum constraints
    const feasible = paretoActions.filter((action) => {
      for (const pref of preferences) {
        if (pref.minimumAcceptable !== undefined) {
          const value = action.outcomes[pref.metric] ?? 0;
          if (value < pref.minimumAcceptable) return false;
        }
      }
      return true;
    });

    if (feasible.length === 0) {
      return {
        bestAction: null,
        score: 0,
        reasoning: 'No actions meet minimum constraints',
        feasibleActions: [],
      };
    }

    // Score each feasible action by weighted sum
    let bestAction: MultiObjectiveAction | null = null;
    let bestScore = -Infinity;

    for (const action of feasible) {
      let score = 0;
      for (const pref of preferences) {
        const value = action.outcomes[pref.metric] ?? 0;
        score += value * pref.weight;
      }

      if (score > bestScore) {
        bestScore = score;
        bestAction = action;
      }
    }

    const reasoning = bestAction
      ? `Highest weighted score (${bestScore.toFixed(1)}) among ${feasible.length} feasible Pareto-optimal actions.`
      : 'No feasible action';

    return {
      bestAction,
      score: bestScore,
      reasoning,
      feasibleActions: feasible,
    };
  }

  private buildRecommendation(
    paretoOptimal: MultiObjectiveAction[],
    dominated: any[],
    tradeoffs: TradeoffDiscovery[]
  ): string {
    const parts: string[] = [];

    parts.push(
      `${paretoOptimal.length} Pareto-optimal actions; ${dominated.length} dominated (avoid these)`
    );

    if (tradeoffs.length > 0) {
      parts.push(
        `Discovered ${tradeoffs.length} hidden tradeoff(s): ${tradeoffs.map((t) => `${t.metric1}↔${t.metric2}`).join(', ')}`
      );
    }

    if (paretoOptimal.length > 0) {
      const top = paretoOptimal[0];
      parts.push(`Top frontier action: "${top.description}"`);
    }

    return parts.join('. ');
  }
}
