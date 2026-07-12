/**
 * Atlas Scoring Engine — flattened module surface
 * @version 1.0.0
 */

export * from './interfaces';

export { SeededRNG } from './SeededRNG';
export { PureFunctionRegistry } from './PureFunctionRegistry';
export type { PureFunction, FunctionContext, ExecutionResult } from './PureFunctionRegistry';

export { CausalInferenceEngineImpl as CausalInferenceEngine } from './CausalInferenceEngine';
export { AdvancedFeedbackLoopEngineImpl as AdvancedFeedbackLoopEngine } from './AdvancedFeedbackLoopEngine';
export { AdaptiveUncertaintyEngineImpl as AdaptiveUncertaintyEngine } from './AdaptiveUncertaintyEngine';
export { EpistemicAleatoicEngine, type EpistemicAleatoicDecomposition } from './EpistemicAleatoric';

export {
  AdversarialTestingEngineImpl as AdversarialTestingEngine,
  type AdversarialHypothesis,
  type AdversarialTestResult,
} from './AdversarialTestingEngine';
export { ExperimentationEngineImpl as ExperimentationEngine } from './ExperimentationEngine';
export * from './experimentation-types';

export { AdaptiveDecisionEngineImpl as AdaptiveDecisionEngine } from './AdaptiveDecisionEngine';
export { DimensionWeightingEngineImpl as DimensionWeightingEngine } from './DimensionWeightingEngine';
export {
  HeterogeneousEffectsEngine,
  type HeterogeneousAnalysis,
  type SegmentTreatmentEffect,
  type UserSegment,
} from './HeterogeneousEffectsEngine';
export {
  InteractionEffectsEngine,
  type InteractionEffect,
  type NonLinearityDetection,
} from './InteractionEffectsEngine';
export * from './learning-adaptive';

export { AtlasRouter, type TaskClassification, type AtlasMode, type AtlasDomain } from './AtlasRouter';
export {
  RealTimeFeedbackEngine,
  type DecisionInFlight,
  type PartialSignal,
  type PivotPoint,
} from './RealTimeFeedbackEngine';
export { ValueOfInformationEngine, type VOIAnalysis, type TestOption } from './ValueOfInformationEngine';
export {
  ParetoOptimizationEngine,
  type ParetoAnalysis,
  type MultiObjectiveAction,
  type TradeoffDiscovery,
} from './ParetoOptimizationEngine';
