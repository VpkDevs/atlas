/**
 * Core Interfaces for Atlas Scoring Engine
 * 
 * This module defines the foundational interfaces for the deterministic scoring engine
 * with support for feedback loops, granular dimensions, uncertainty quantification,
 * and correlation tracking.
 */

// ============================================================================
// Core Scoring Interfaces
// ============================================================================

/**
 * Main interface for the deterministic scoring engine
 * Ensures identical inputs produce identical outputs
 */
export interface DeterministicScoringEngine {
  computeScore(scoreType: string, inputs: ScoreInputs, options?: ScoringOptions): EnhancedScoreResult;
  setSeed(seed: number): void;
  setEvaluationMode(enabled: boolean): void;
  registerFallback(source: string, fallbackStrategy: FallbackStrategy): void;
}

/**
 * Input data structure for score computation
 */
export interface ScoreInputs {
  data: Record<string, any>;
  timestamp?: Date; // Optional fixed timestamp for reproducibility
  context?: ScoringContext;
}

/**
 * Options for score computation
 */
export interface ScoringOptions {
  seed?: number;
  useFixedTime?: boolean;
  forceRecompute?: boolean;
}

/**
 * Enhanced score result with metadata and uncertainty
 */
export interface EnhancedScoreResult {
  scoreType: string;
  value: number;
  confidenceInterval?: ConfidenceInterval;
  dimensions?: DimensionScore[];
  timestamp: Date;
  computationId: string;
  inputsHash: string; // For determinism verification
  metadata: {
    seed?: number;
    evaluationMode?: boolean;
    cacheHit?: boolean;
    computationTime?: number;
    uncertainty?: number;
  };
}

/**
 * Collection of scores for batch operations
 */
export interface ScoreSet {
  scores: Record<string, EnhancedScoreResult>;
  timestamp: Date;
  context: ScoringContext;
  metadata: {
    feedbackApplied: boolean;
    edgeCasesHandled: boolean;
    uncertaintyQuantified: boolean;
  };
}

/**
 * Context for score computation
 */
export interface ScoringContext {
  projectId?: string;
  userId?: string;
  environment: 'production' | 'staging' | 'development' | 'evaluation';
  mode: 'realtime' | 'batch' | 'historical';
  options: {
    forceRecompute?: boolean;
    includeUncertainty?: boolean;
    includeDimensions?: boolean;
    applyFeedback?: boolean;
  };
}

// ============================================================================
// Feedback Loop Interfaces
// ============================================================================

/**
 * Engine for managing bidirectional feedback loops between scores
 */
export interface FeedbackLoopEngine {
  applyFeedbackLoops(scores: ScoreSet): ScoreSet;
  registerRule(rule: FeedbackRule): void;
  evaluateRule(rule: FeedbackRule, scores: ScoreSet): ScoreAdjustment;
  getActiveRules(): FeedbackRule[];
}

/**
 * Rule defining feedback loop behavior
 */
export interface FeedbackRule {
  id: string;
  condition: ScoreCondition;
  action: ScoreAction;
  priority: number;
  enabled: boolean;
}

/**
 * Condition for triggering feedback rule
 */
export interface ScoreCondition {
  scoreType: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  threshold: number;
  duration?: number; // Optional duration condition
}

/**
 * Action to take when feedback rule is triggered
 */
export interface ScoreAction {
  targetScore: string;
  adjustment: ScoreAdjustment;
  notification?: string;
}

/**
 * Adjustment to apply to a score
 */
export interface ScoreAdjustment {
  type: 'absolute' | 'relative' | 'cap' | 'boost';
  value: number;
  duration?: number; // Optional duration of effect
}

// ============================================================================
// Dimension Decomposition Interfaces
// ============================================================================

/**
 * System for decomposing scores into granular dimensions
 */
export interface DimensionDecompositionSystem {
  decomposeScore(scoreType: string, inputs: any): DimensionBreakdown;
  getDimensions(scoreType: string): Dimension[];
  updateWeights(scoreType: string, weights: Record<string, number>): void;
  analyzeGaps(breakdown: DimensionBreakdown): GapAnalysis[];
}

/**
 * Definition of a scoring dimension
 */
export interface Dimension {
  id: string;
  name: string;
  description: string;
  weight: number;
  minValue: number;
  maxValue: number;
  formula?: string; // Optional custom formula
  dataSources: string[];
}

/**
 * Breakdown of a score into dimensions
 */
export interface DimensionBreakdown {
  scoreType: string;
  overallScore: number;
  dimensions: DimensionScore[];
  timestamp: Date;
}

/**
 * Individual dimension score with contribution
 */
export interface DimensionScore {
  dimensionId: string;
  score: number;
  contribution: number; // Contribution to overall score
  rawValue: any;
  normalizedValue: number;
}

/**
 * Gap analysis for improvement opportunities
 */
export interface GapAnalysis {
  dimensionId: string;
  currentScore: number;
  maxScore: number;
  gap: number;
  improvementPotential: number;
  recommendedActions: string[];
  estimatedTimeToImprove?: number;
  estimatedROI?: number;
}

// ============================================================================
// Correlation Tracking Interfaces
// ============================================================================

/**
 * System for tracking correlation between scores and business outcomes
 */
export interface CorrelationTrackingSystem {
  recordOutcome(scoreType: string, score: number, outcome: BusinessOutcome): void;
  computeCorrelation(scoreType: string, period?: DateRange): CorrelationResult;
  getConfidenceInterval(scoreType: string, score: number): ConfidenceInterval;
  checkCorrelationHealth(scoreType: string): CorrelationHealth;
}

/**
 * Business outcome for correlation tracking
 */
export interface BusinessOutcome {
  type: string; // e.g., 'revenue_growth', 'customer_satisfaction', 'operational_efficiency'
  value: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Result of correlation computation
 */
export interface CorrelationResult {
  scoreType: string;
  correlation: number; // Pearson correlation coefficient
  sampleSize: number;
  period: DateRange;
  pValue: number;
  confidence: number; // Confidence level (0-1)
}

/**
 * Confidence interval for a score
 */
export interface ConfidenceInterval {
  score: number;
  lowerBound: number;
  upperBound: number;
  confidenceLevel: number; // e.g., 0.95 for 95% confidence
  width: number; // upperBound - lowerBound
}

/**
 * Health status of score-outcome correlation
 */
export interface CorrelationHealth {
  scoreType: string;
  correlation: number;
  isHealthy: boolean;
  flaggedForReview: boolean;
  lastChecked: Date;
  recommendation?: string;
}

/**
 * Date range for time-based queries
 */
export interface DateRange {
  start: Date;
  end: Date;
}

// ============================================================================
// Edge Case Handling Interfaces
// ============================================================================

/**
 * Handler for edge cases and data anomalies
 */
export interface EdgeCaseHandler {
  validateInputs(inputs: any): ValidationResult;
  handleMissingData(inputs: any, strategy: MissingDataStrategy): any;
  detectOutliers(values: number[], method?: OutlierMethod): OutlierResult;
  applyRobustScaling(values: number[], method?: ScalingMethod): number[];
}

/**
 * Result of input validation
 */
export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  sanitizedInputs?: any;
}

/**
 * Individual validation issue
 */
export interface ValidationIssue {
  field: string;
  type: 'missing' | 'outlier' | 'invalid' | 'incomplete';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestedFix?: string;
}

/**
 * Strategy for handling missing data
 */
export interface MissingDataStrategy {
  type: 'default' | 'average' | 'median' | 'interpolate' | 'null';
  defaultValue?: any;
  useRelatedData?: boolean;
}

/**
 * Result of outlier detection
 */
export interface OutlierResult {
  outliers: number[];
  indices: number[];
  method: OutlierMethod;
  threshold: number;
}

/**
 * Method for detecting outliers
 */
export type OutlierMethod = 'zscore' | 'iqr' | 'mad';

/**
 * Method for scaling data
 */
export type ScalingMethod = 'robust' | 'minmax' | 'standard';

/**
 * Strategy for handling fallback values
 */
export interface FallbackStrategy {
  type: 'default' | 'cached' | 'computed' | 'error';
  value?: any;
  computeFn?: () => any;
}

// ============================================================================
// Uncertainty Quantification Interfaces
// ============================================================================

/**
 * System for quantifying uncertainty in scores
 */
export interface UncertaintyQuantifier {
  quantifyUncertainty(scoreType: string, score: number, context: any): UncertaintyResult;
  estimateModelUncertainty(model: any, inputs: any): ModelUncertainty;
  propagateUncertainty(scores: UncertainScore[], aggregation: AggregationMethod): UncertainScore;
  formatUncertainty(result: UncertaintyResult, format: UncertaintyFormat): string;
}

/**
 * Result of uncertainty quantification
 */
export interface UncertaintyResult {
  score: number;
  confidenceInterval: ConfidenceInterval;
  uncertaintySources: UncertaintySource[];
  overallUncertainty: number; // 0-1 scale
  recommendation?: string; // e.g., "collect more data"
}

/**
 * Source of uncertainty
 */
export interface UncertaintySource {
  type: 'data' | 'model' | 'sampling' | 'measurement';
  contribution: number; // Contribution to overall uncertainty (0-1)
  description: string;
  mitigation?: string;
}

/**
 * Score with uncertainty
 */
export interface UncertainScore {
  value: number;
  uncertainty: number; // Standard deviation or similar
  sampleSize?: number;
}

/**
 * Model uncertainty estimate
 */
export interface ModelUncertainty {
  type: string;
  uncertainty: number;
  confidenceInterval: ConfidenceInterval;
  method: string;
}

/**
 * Method for aggregating scores
 */
export type AggregationMethod = 'mean' | 'weighted' | 'median' | 'max' | 'min';

/**
 * Format for displaying uncertainty
 */
export type UncertaintyFormat = 'interval' | 'plusminus' | 'percentage' | 'verbose';

// ============================================================================
// Configuration Interfaces
// ============================================================================

/**
 * Manager for scoring configuration
 */
export interface ConfigurationManager {
  getConfig(scoreType: string, version?: string): ScoringConfig;
  updateConfig(scoreType: string, config: Partial<ScoringConfig>): void;
  validateConfig(config: ScoringConfig): ValidationResult;
  getConfigHistory(scoreType: string): ConfigHistory[];
  migrateConfig(scoreType: string, fromVersion: string, toVersion: string): MigrationResult;
}

/**
 * Configuration for a score type
 */
export interface ScoringConfig {
  version: string;
  scoreType: string;
  dimensions: DimensionConfig[];
  weights: Record<string, number>;
  formulas: Record<string, string>;
  thresholds: ThresholdConfig;
  feedbackRules: FeedbackRule[];
  edgeCaseHandling: EdgeCaseConfig;
  uncertainty: UncertaintyConfig;
  metadata: ConfigMetadata;
}

/**
 * Configuration for a dimension
 */
export interface DimensionConfig {
  id: string;
  name: string;
  weight: number;
  min: number;
  max: number;
  formula?: string;
  dataSources: string[];
  validationRules: ValidationRule[];
}

/**
 * Validation rule for configuration
 */
export interface ValidationRule {
  type: string;
  params: Record<string, any>;
  message: string;
}

/**
 * Threshold configuration
 */
export interface ThresholdConfig {
  [key: string]: number;
}

/**
 * Edge case handling configuration
 */
export interface EdgeCaseConfig {
  missingDataStrategy: MissingDataStrategy;
  outlierMethod: OutlierMethod;
  scalingMethod: ScalingMethod;
  minSampleSize: number;
}

/**
 * Uncertainty configuration
 */
export interface UncertaintyConfig {
  confidenceLevel: number;
  minSampleSize: number;
  flagThreshold: number; // Width threshold for flagging
  includeModelUncertainty: boolean;
}

/**
 * Configuration metadata
 */
export interface ConfigMetadata {
  createdAt: Date;
  updatedAt: Date;
  author: string;
  description: string;
  changeLog: string[];
}

/**
 * Configuration history entry
 */
export interface ConfigHistory {
  version: string;
  config: ScoringConfig;
  timestamp: Date;
  author: string;
  description: string;
}

/**
 * Result of configuration migration
 */
export interface MigrationResult {
  success: boolean;
  fromVersion: string;
  toVersion: string;
  changes: string[];
  errors?: string[];
}

// ============================================================================
// Data Model Interfaces
// ============================================================================

/**
 * Record of a business outcome for correlation tracking
 */
export interface OutcomeRecord {
  id: string;
  scoreType: string;
  scoreValue: number;
  outcomeType: string;
  outcomeValue: number;
  timestamp: Date;
  lagDays: number; // Days between score and outcome
  metadata: {
    projectId?: string;
    userId?: string;
    confidence?: number;
  };
}

/**
 * Configuration version record
 */
export interface ConfigVersion {
  id: string;
  scoreType: string;
  version: string;
  config: ScoringConfig;
  hash: string;
  createdAt: Date;
  author: string;
  description: string;
  isActive: boolean;
}
