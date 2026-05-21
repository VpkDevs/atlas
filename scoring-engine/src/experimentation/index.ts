/**
 * A/B Testing & Experimentation Framework
 *
 * Orchestrates statistically rigorous experiments, tracks treatment effects,
 * and feeds learnings back into the decision engine.
 * Prevents decision-making on noise; requires statistical significance.
 */

export type ExperimentStatus = 'planned' | 'running' | 'completed' | 'aborted';
export type AllocationStrategy = 'uniform' | 'weighted' | 'bandit' | 'sequential';
export type TestType = 'ab_test' | 'multivariate' | 'sequential' | 'rollout';

export interface Experiment {
  id: string;
  name: string;
  description: string;
  hypothesis: string; // "If we do X, we expect Y to improve by Z%"
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  status: ExperimentStatus;

  // Test design
  testType: TestType;
  variants: Variant[];
  primaryMetric: string;
  secondaryMetrics: string[];
  minSampleSize: number;
  minDuration: number; // Days
  maxDuration: number; // Days (stop early if obviously winning/losing)

  // Statistical properties
  alpha: number; // Type I error rate (0.05)
  beta: number; // Type II error rate (0.1)
  minimumDetectableEffect: number; // MIDE: smallest effect we care about (e.g., 5% improvement)

  // Execution metadata
  allocationStrategy: AllocationStrategy;
  randomSeed: string; // Deterministic allocation
  metadata?: Record<string, any>;
}

export interface Variant {
  id: string;
  name: string; // 'control' or 'treatment-a', 'treatment-b'
  description: string;
  allocatedPercentage: number; // % of traffic receiving this variant
  implementation?: Record<string, any>; // Feature flag values, code changes, etc.
}

export interface ExperimentResult {
  experimentId: string;
  variant: string;
  observations: number; // Sample size
  primaryMetricValue: number;
  secondaryMetricValues: Record<string, number>;
  confidenceInterval: { lower: number; upper: number };
  standardError: number;
}

export interface StatisticalTest {
  controlResult: ExperimentResult;
  treatmentResult: ExperimentResult;
  testStatistic: number; // t-statistic, z-score, etc.
  pValue: number; // Statistical significance
  isSignificant: boolean; // p < alpha?
  effectSize: number; // Absolute or relative change
  confidence: number; // 1 - alpha (e.g., 0.95)
  methodology: 'welchs_t' | 'ztest' | 'chi_squared' | 'mann_whitney';
  recommendation: 'deploy' | 'continue' | 'abort' | 'inconclusive';
}

export interface ExperimentationEngine {
  // Experiment lifecycle
  createExperiment(config: Omit<Experiment, 'id' | 'status' | 'createdAt'>): Experiment;
  startExperiment(experimentId: string): { started: boolean; startedAt: Date };
  recordObservation(
    experimentId: string,
    variantId: string,
    metrics: Record<string, number>,
    timestamp: Date
  ): void;

  // Statistical analysis
  analyzeExperiment(experimentId: string): StatisticalTest;
  checkEarlyStop(experimentId: string): {
    shouldStop: boolean;
    reason?: 'winner_clear' | 'loser_clear' | 'too_long';
    confidenceLevel?: number;
  };

  // Sequential testing (safer for early stopping)
  analyzeSequential(experimentId: string): {
    stillRunning: boolean;
    confidenceReached?: number;
    recommendedAction?: 'deploy' | 'continue' | 'abort';
  };

  // Multi-armed bandit (for high-velocity decisions)
  updateBanditAllocation(experimentId: string): {
    newAllocations: Record<string, number>;
    reasoning: string;
  };

  // Results & learnings
  concludeExperiment(experimentId: string): {
    winner?: string;
    effectSize: number;
    confidence: number;
    nextSteps: string;
  };

  recordLearning(experimentId: string, learning: string): void;
  getLearnings(topic: string): string[];
}

/**
 * Adaptive Uncertainty Quantification with Model Drift Detection
 *
 * Detects when confidence bounds should widen:
 * - Market conditions change (regime change)
 * - Data quality degradation
 * - Model assumptions violated
 * - Correlation breakdown (past patterns don't predict)
 */

export interface DriftIndicator {
  type: 'data_quality' | 'correlation_breakdown' | 'regime_change' | 'measurement_error';
  metric: string;
  severity: 'low' | 'medium' | 'high';
  evidence: string; // Why we think drift occurred
  suggestedAction?: string;
  detectedAt: Date;
}

export interface AdaptiveUncertaintyResult {
  baseUncertainty: number; // Original uncertainty calculation
  adjustedUncertainty: number; // After drift penalties
  driftPenalty: number; // How much we widened due to detected drift
  driftIndicators: DriftIndicator[];
  confidence: number; // Reduced if drift detected
  recommendation: string; // "collect more data", "rebuild model", etc.
}

export interface AdaptiveUncertaintyEngine {
  // Drift detection
  detectDataDrift(
    historicalDistribution: number[],
    recentDistribution: number[],
    metric: string
  ): { drifted: boolean; severity: 'low' | 'medium' | 'high'; pValue: number };

  detectCorrelationBreakdown(
    metric: string,
    pastCorrelations: Record<string, number>,
    currentWindow: Record<string, number>
  ): { broken: boolean; affectedDimensions: string[] };

  detectRegimeChange(
    contextualFeatures: Record<string, number>,
    historicalContexts: Record<string, number>[]
  ): { regimeChanged: boolean; distance: number };

  // Adaptive confidence
  quantifyAdaptiveUncertainty(
    baseScore: number,
    baseUncertainty: number,
    context: Record<string, any>
  ): AdaptiveUncertaintyResult;

  // Confidence band adjustment
  widenConfidenceBands(score: number, reason: DriftIndicator): {
    originalBounds: { lower: number; upper: number };
    widenedBounds: { lower: number; upper: number };
    widthIncrease: number;
  };
}

/**
 * Adversarial Testing — Generate and Test Null & Anti-Hypotheses
 *
 * Prevents shipping changes with hidden failure modes.
 * Requires: (1) primary hypothesis confirmed, (2) null rejected, (3) anti rejected
 */

export interface AdversarialHypothesis {
  id: string;
  type: 'primary' | 'null' | 'anti';
  statement: string;
  expectedOutcome: string;
  experimentId?: string;
}

export interface AdversarialTestResult {
  primaryHypothesisRejected: boolean;
  nullHypothesisRejected: boolean;
  antiHypothesisRejected: boolean;
  allPassed: boolean;
  primaryTest?: StatisticalTest;
  nullTest?: StatisticalTest;
  antiTest?: StatisticalTest;
  reasoning: string;
  recommendation: 'deploy' | 'continue' | 'abort' | 'redesign';
  riskFactors: string[];
}

export interface AdversarialTestingEngine {
  generateAdversarialHypotheses(
    primaryHypothesis: string,
    dimension: string
  ): AdversarialHypothesis[];

  runAdversarialTest(
    experiment: Experiment,
    primaryResults: StatisticalTest,
    antiHypothesis: AdversarialHypothesis
  ): AdversarialTestResult;

  identifyRiskFactors(
    hypothesis: string,
    context: Record<string, any>
  ): string[];

  explainCausalMechanism(
    hypothesis: string,
    observedEffect: number,
    dimensions: Record<string, number>
  ): {
    likelyMechanism: string;
    alternativeMechanisms: string[];
    confoundingRisks: string[];
  };
}
