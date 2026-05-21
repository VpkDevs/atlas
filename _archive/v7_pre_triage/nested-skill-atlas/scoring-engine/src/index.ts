/**
 * Atlas Scoring Engine
 * 
 * A deterministic scoring engine with support for:
 * - Deterministic computation (identical inputs → identical outputs)
 * - Bidirectional feedback loops between scores
 * - Granular dimension decomposition
 * - Correlation tracking with business outcomes
 * - Edge case handling and data validation
 * - Uncertainty quantification
 * - Configuration-driven extensibility
 * 
 * @version 1.0.0
 * @author Atlas Team
 */

// Export all core interfaces
export * from './interfaces';

// Export models
export * from './models';

// Export deterministic components
export * from './deterministic';

// Export feedback loop components
export * from './feedback';

// Export dimension components
export * from './dimensions';

// Export correlation tracking components
export * from './correlation';

// Export edge case handling components
export * from './edge-cases';

// Export uncertainty quantification components
export * from './uncertainty';

// Export configuration components
export * from './config';

// Export new experimentation and adversarial testing engines
export * from './experimentation/AdversarialTestingEngine';

// Export epistemic/aleatoric uncertainty separation
export { EpistemicAleatoicEngine, type EpistemicAleatoicDecomposition } from './uncertainty/EpistemicAleatoric';

// Export v8.3 modules (closing gaps from IDEAL_VS_ACTUAL.md)
export { AtlasRouter, type TaskClassification, type AtlasMode, type AtlasDomain } from './router/AtlasRouter';
export { IntelligentRouter, type Agent, type TaskAnalysis } from './router/IntelligentRouter';
export { PerformanceMonitor, type AgentMetrics } from './router/PerformanceMonitor';
export { CapitalGovernor, type CapitalMode, type CapitalState, type DecisionResult } from './deterministic/CapitalGovernor';
export { RealTimeFeedbackEngine, type DecisionInFlight, type PartialSignal, type PivotPoint } from './realtime/RealTimeFeedbackEngine';
export { ValueOfInformationEngine, type VOIAnalysis, type TestOption } from './decision/ValueOfInformationEngine';
export { HeterogeneousEffectsEngine, type HeterogeneousAnalysis, type SegmentTreatmentEffect, type UserSegment } from './learning/HeterogeneousEffectsEngine';
export { ParetoOptimizationEngine, type ParetoAnalysis, type MultiObjectiveAction, type TradeoffDiscovery } from './optimization/ParetoOptimizationEngine';
export { InteractionEffectsEngine, type InteractionEffect, type NonLinearityDetection } from './learning/InteractionEffectsEngine';
