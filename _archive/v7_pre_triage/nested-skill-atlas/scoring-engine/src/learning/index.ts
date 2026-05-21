/**
 * Adaptive Decision Learning Engine
 *
 * Learns which decision types historically produce the best business outcomes,
 * dynamically adjusts decision tree priorities based on correlation strength.
 * Enables Atlas to improve its decision-making over time rather than static rules.
 */

export interface DecisionHistory {
  id: string;
  timestamp: Date;
  decisionType: string;
  actions: string[];
  predictedImpact: number;
  actualOutcome: number;
  outcomeMetric: string; // e.g., 'mrr', 'activation_rate', 'churn'
  confidenceAtDecision: number;
  lagDays: number; // Days between decision and measurable outcome
  succeeded: boolean; // Did actual outcome exceed predicted impact?
}

export interface DecisionCorrelation {
  decisionType: string;
  successRate: number; // % of decisions that led to positive outcomes
  averageActualVsPredicted: number; // How well do we predict this decision type?
  averageROI: number; // (actual outcome - effort) / effort
  sampleSize: number;
  confidence: number; // 0-1, based on sample size and variance
  trendDirection: 'improving' | 'stable' | 'declining'; // Is this decision getting better or worse?
  lastUpdated: Date;
}

export interface AdaptiveDecisionResult {
  rankedDecisions: Array<{
    decisionType: string;
    score: number; // Impact × Confidence ÷ Effort, but now weighted by historical success
    successRate: number;
    reasoning: string;
    historicalComparable?: DecisionHistory;
  }>;
  metadata: {
    learningPhase: 'bootstrap' | 'active'; // Bootstrap = not enough data yet
    decisionHistorySize: number;
    recommendedRetestAge: number; // Days before re-evaluating a stale decision type
  };
}

export interface LearningEngine {
  recordDecision(history: DecisionHistory): void;
  adaptDecisionPriority(
    baseDecisionTree: Array<{ type: string; priority: number }>
  ): AdaptiveDecisionResult;
  getDecisionCorrelation(decisionType: string): DecisionCorrelation | null;
  identifyUnderutilizedWinners(): string[]; // Decision types with high success rate but low frequency
  getFailurePatterns(): Array<{
    pattern: string;
    frequency: number;
    commonContext?: Record<string, any>;
  }>;
}

/**
 * Adaptive Dimension Weighting Engine
 *
 * Learns optimal dimension weights for THIS specific business rather than using
 * static 1:1 weights. Some businesses care more about retention (SaaS), others
 * about acquisition (marketplaces).
 */

export interface DimensionWeightHistory {
  timestamp: Date;
  dimensionId: string;
  weight: number; // Original weight
  appliedWeight: number; // Adaptive weight for this period
  confidenceScore: number;
}

export interface OptimalWeights {
  dimensionId: string;
  staticWeight: number; // Default weight
  adaptiveWeight: number; // Learned weight for this business
  confidenceInterval: { lower: number; upper: number };
  reasoning: string; // Why this weight?
  evidenceStrength: 'strong' | 'moderate' | 'weak';
}

export interface DimensionWeightingEngine {
  adaptWeights(
    dimensions: Array<{ id: string; staticWeight: number }>,
    outcomesHistory: Array<{ dimension: string; dimensionScore: number; outcome: number }>
  ): OptimalWeights[];
  getAdaptiveScorecard(): Record<string, OptimalWeights>;
  detectDimensionShifts(): Array<{
    dimensionId: string;
    shift: number;
    significance: 'minor' | 'major';
  }>;
}

/**
 * Advanced Feedback Loop Convergence Engine
 *
 * Detects mathematical convergence with precision rather than crude max iterations.
 * Uses residual norm, tolerance bands, and oscillation detection.
 */

export interface ConvergenceMetrics {
  iteration: number;
  residualNorm: number; // ||current - previous|| (how much changed)
  maxResidual: number; // Max change in any dimension
  oscillating: boolean; // Bouncing between values?
  convergedDimensions: string[]; // Which dimensions have settled
  remainingUnsettled: string[];
}

export interface AdvancedFeedbackLoopEngine {
  applyFeedbackLoopsWithConvergence(
    scores: Record<string, number>,
    rules: any[],
    options?: {
      toleranceBand?: number; // Default 0.01
      maxIterations?: number; // Safety limit
      oscillationThreshold?: number; // How much bouncing triggers early exit
    }
  ): {
    finalScores: Record<string, number>;
    convergenceMetrics: ConvergenceMetrics[];
    iterationsNeeded: number;
    converged: boolean;
  };
  detectOscillations(scoreHistory: number[][]): { oscillating: boolean; period?: number };
}

/**
 * Causal Inference Engine
 *
 * Inverts correlation analysis: "which actions on dimension X drive outcome Y?"
 * Moves beyond observational "does dimension X predict outcome Y?" to actionable
 * "what actions should we take on X to improve Y?"
 */

export interface CausalAction {
  action: string; // e.g., "optimize onboarding flow"
  targetDimension: string; // e.g., "activation"
  expectedOutcome: string; // e.g., "increased trial-to-paid"
  causalStrength: number; // 0-1, estimated causal effect size
  confidence: number; // Statistical confidence
  priorAttempts: number;
  successRate: number; // % of times this action led to expected outcome
  averageTimeToOutcome: number; // Days
  sampleSize: number;
}

export interface CausalInferenceEngine {
  inferActions(
    dimension: string,
    outcome: string
  ): CausalAction[];
  estimateCausalEffect(
    action: string,
    beforeMetrics: Record<string, number>,
    afterMetrics: Record<string, number>,
    controlGroup?: Record<string, number>
  ): {
    estimatedEffect: number;
    confidence: number;
    methodology: 'ab_test' | 'diff_in_diff' | 'propensity_match' | 'observational';
  };
  buildActionPlaybook(): Record<string, CausalAction[]>; // Dimension → actions
}
