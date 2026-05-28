/**
 * Deterministic Scoring Engine Module
 *
 * Provides deterministic scoring capabilities with seeded random number generation,
 * time abstraction, and external data fallback strategies.
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

export { SeededRNG } from './SeededRNG';
export { PureFunctionRegistry } from './PureFunctionRegistry';
export type { PureFunction, FunctionContext, ExecutionResult } from './PureFunctionRegistry';

// Re-export deterministic-specific interfaces from shared interfaces
export type {
  DeterministicScoringEngine,
  ScoreInputs,
  ScoringOptions,
  ScoringContext,
  FallbackStrategy,
} from '../interfaces';
