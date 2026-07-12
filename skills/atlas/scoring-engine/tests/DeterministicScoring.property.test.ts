/**
 * Property-Based Tests for Deterministic Scoring Engine
 * 
 * Tests universal properties that should hold across all valid inputs.
 * Uses fast-check for property-based testing.
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { SeededRNG } from '../src/deterministic/SeededRNG';
import { PureFunctionRegistry } from '../src/deterministic/PureFunctionRegistry';
import type { PureFunction, FunctionContext } from '../src/deterministic/PureFunctionRegistry';

describe('Property-Based Tests: Deterministic Scoring Engine', () => {
  
  /**
   * Property 1: Deterministic Score Computation
   * 
   * For any valid scoring inputs and random seed, computing the same score twice
   * with identical inputs and seed shall produce identical results.
   * 
   * **Validates: Requirements 1.1, 1.5**
   */
  describe('Property 1: Deterministic Score Computation', () => {
    it('should produce identical results for identical inputs and seed', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            seed: fc.integer({ min: 0, max: 1000000 }),
            data: fc.record({
              value: fc.float({ min: 0, max: 100, noNaN: true }),
              weight: fc.float({ min: 0, max: 1, noNaN: true }),
              count: fc.integer({ min: 1, max: 100 }),
            }),
          }),
          ({ seed, data }) => {
            // Create a simple scoring function
            const scoringFunction: PureFunction<typeof data, number> = {
              id: 'test-score',
              name: 'Test Score',
              fn: (inputs, context) => {
                const rng = new SeededRNG(context?.seed || 0);
                const randomFactor = rng.randomFloat(0.9, 1.1);
                return inputs.value * inputs.weight * randomFactor;
              },
            };

            const registry = new PureFunctionRegistry();
            registry.registerFunction(scoringFunction);

            const context: FunctionContext = { seed };

            // Execute twice with same inputs and seed
            const result1 = registry.executeFunction('test-score', data, context);
            const result2 = registry.executeFunction('test-score', data, context);

            return Promise.all([result1, result2]).then(([r1, r2]) => {
              // Results should be identical
              expect(r1.output).toBe(r2.output);
              return r1.output === r2.output;
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should produce different results for different seeds', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            seed1: fc.integer({ min: 0, max: 1000000 }),
            seed2: fc.integer({ min: 0, max: 1000000 }),
            data: fc.record({
              value: fc.float({ min: 0, max: 100, noNaN: true }),
            }),
          }).filter(({ seed1, seed2, data }) => seed1 !== seed2 && data.value !== 0), // Ensure different seeds and non-degenerate output
          ({ seed1, seed2, data }) => {
            const scoringFunction: PureFunction<typeof data, number> = {
              id: 'test-score-2',
              name: 'Test Score 2',
              fn: (inputs, context) => {
                const rng = new SeededRNG(context?.seed || 0);
                return inputs.value * rng.randomFloat(0.5, 1.5);
              },
            };

            const registry = new PureFunctionRegistry();
            registry.registerFunction(scoringFunction);

            const result1 = registry.executeFunction('test-score-2', data, { seed: seed1 });
            const result2 = registry.executeFunction('test-score-2', data, { seed: seed2 });

            return Promise.all([result1, result2]).then(([r1, r2]) => {
              // Results should be different (with very high probability)
              return r1.output !== r2.output;
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 2: Seeded Randomization Reproducibility
   * 
   * For any scoring computation involving randomization, using the same seed
   * shall produce identical results across multiple executions.
   * 
   * **Validates: Requirements 1.4**
   */
  describe('Property 2: Seeded Randomization Reproducibility', () => {
    it('should produce identical random sequences with same seed', () => {
      fc.assert(
        fc.property(
          fc.record({
            seed: fc.integer({ min: 0, max: 1000000 }),
            sequenceLength: fc.integer({ min: 1, max: 20 }),
          }),
          ({ seed, sequenceLength }) => {
            const rng1 = new SeededRNG(seed);
            const rng2 = new SeededRNG(seed);

            const sequence1 = Array.from({ length: sequenceLength }, () => rng1.randomFloat());
            const sequence2 = Array.from({ length: sequenceLength }, () => rng2.randomFloat());

            return sequence1.every((val, idx) => val === sequence2[idx]);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should produce identical results after reset with same seed', () => {
      fc.assert(
        fc.property(
          fc.record({
            seed: fc.integer({ min: 0, max: 1000000 }),
            operations: fc.integer({ min: 1, max: 10 }),
          }),
          ({ seed, operations }) => {
            const rng = new SeededRNG(seed);
            
            // Generate first sequence
            const sequence1 = Array.from({ length: operations }, () => rng.randomFloat());
            
            // Reset and generate second sequence
            rng.reset();
            const sequence2 = Array.from({ length: operations }, () => rng.randomFloat());

            return sequence1.every((val, idx) => val === sequence2[idx]);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain determinism across different RNG operations', () => {
      fc.assert(
        fc.property(
          fc.record({
            seed: fc.integer({ min: 0, max: 1000000 }),
            array: fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 5, maxLength: 10 }),
          }),
          ({ seed, array }) => {
            const rng1 = new SeededRNG(seed);
            const rng2 = new SeededRNG(seed);

            // Perform various operations
            const float1 = rng1.randomFloat();
            const float2 = rng2.randomFloat();
            
            const int1 = rng1.randomInt(1, 100);
            const int2 = rng2.randomInt(1, 100);
            
            const bool1 = rng1.randomBoolean();
            const bool2 = rng2.randomBoolean();
            
            const choice1 = rng1.randomChoice(array);
            const choice2 = rng2.randomChoice(array);

            return float1 === float2 && 
                   int1 === int2 && 
                   bool1 === bool2 && 
                   choice1 === choice2;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 3: Time-Based Score Reproducibility
   * 
   * For any time-dependent score computation in evaluation mode, using a fixed
   * timestamp shall produce reproducible results independent of actual execution time.
   * 
   * **Validates: Requirements 1.3**
   */
  describe('Property 3: Time-Based Score Reproducibility', () => {
    it('should produce identical results with fixed timestamp in evaluation mode', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            seed: fc.integer({ min: 0, max: 1000000 }),
            fixedTimestamp: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-01-01') }),
            data: fc.record({
              value: fc.float({ min: 0, max: 100, noNaN: true }),
            }),
          }),
          ({ seed, fixedTimestamp, data }) => {
            // Time-dependent scoring function
            const timeBasedFunction: PureFunction<typeof data, number> = {
              id: 'time-based-score',
              name: 'Time Based Score',
              fn: (inputs, context) => {
                const timestamp = context?.fixedTimestamp || new Date();
                const dayOfYear = Math.floor(
                  (timestamp.getTime() - new Date(timestamp.getFullYear(), 0, 0).getTime()) / 86400000
                );
                const rng = new SeededRNG(context?.seed || 0);
                return inputs.value * (1 + dayOfYear / 365) * rng.randomFloat(0.9, 1.1);
              },
            };

            const registry = new PureFunctionRegistry();
            registry.registerFunction(timeBasedFunction);

            const context: FunctionContext = {
              seed,
              evaluationMode: true,
              fixedTimestamp,
            };

            // Execute multiple times with same fixed timestamp
            const result1 = registry.executeFunction('time-based-score', data, context);
            
            // Simulate time passing (but context has fixed timestamp)
            const result2 = registry.executeFunction('time-based-score', data, context);

            return Promise.all([result1, result2]).then(([r1, r2]) => {
              return r1.output === r2.output;
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should produce different results with different fixed timestamps', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            seed: fc.integer({ min: 0, max: 1000000 }),
            timestamp1: fc.date({ min: new Date('2020-01-01'), max: new Date('2023-01-01') }),
            timestamp2: fc.date({ min: new Date('2023-01-02'), max: new Date('2025-01-01') }),
            data: fc.record({
              value: fc.float({ min: 10, max: 100, noNaN: true }),
            }),
          }).filter(({ timestamp1, timestamp2 }) => {
            const day1 = Math.floor(
              (timestamp1.getTime() - new Date(timestamp1.getFullYear(), 0, 0).getTime()) / 86400000
            );
            const day2 = Math.floor(
              (timestamp2.getTime() - new Date(timestamp2.getFullYear(), 0, 0).getTime()) / 86400000
            );
            return day1 !== day2;
          }),
          ({ seed, timestamp1, timestamp2, data }) => {
            const timeBasedFunction: PureFunction<typeof data, number> = {
              id: 'time-based-score-2',
              name: 'Time Based Score 2',
              fn: (inputs, context) => {
                const timestamp = context?.fixedTimestamp || new Date();
                const dayOfYear = Math.floor(
                  (timestamp.getTime() - new Date(timestamp.getFullYear(), 0, 0).getTime()) / 86400000
                );
                return inputs.value * (1 + dayOfYear / 365);
              },
            };

            const registry = new PureFunctionRegistry();
            registry.registerFunction(timeBasedFunction);

            const result1 = registry.executeFunction('time-based-score-2', data, {
              seed,
              evaluationMode: true,
              fixedTimestamp: timestamp1,
            });

            const result2 = registry.executeFunction('time-based-score-2', data, {
              seed,
              evaluationMode: true,
              fixedTimestamp: timestamp2,
            });

            return Promise.all([result1, result2]).then(([r1, r2]) => {
              // Results should be different due to different timestamps
              return r1.output !== r2.output;
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 4: External Data Fallback Determinism
   * 
   * For any scoring computation where external data sources are unavailable,
   * the system shall return a deterministic fallback value or error code consistently.
   * 
   * **Validates: Requirements 1.2**
   */
  describe('Property 4: External Data Fallback Determinism', () => {
    it('should return consistent fallback values when external data is unavailable', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            seed: fc.integer({ min: 0, max: 1000000 }),
            fallbackValue: fc.float({ min: 0, max: 100, noNaN: true }),
            data: fc.record({
              value: fc.float({ min: 0, max: 100, noNaN: true }),
            }),
          }),
          ({ seed, fallbackValue, data }) => {
            // Function that simulates external data dependency
            const externalDataFunction: PureFunction<typeof data, number> = {
              id: 'external-data-score',
              name: 'External Data Score',
              fn: (inputs, context) => {
                // Simulate external data unavailable
                const externalData = null; // Would normally fetch from external source
                
                // Use fallback value when external data is unavailable
                const dataValue = externalData ?? fallbackValue;
                
                const rng = new SeededRNG(context?.seed || 0);
                return inputs.value * dataValue * rng.randomFloat(0.9, 1.1);
              },
            };

            const registry = new PureFunctionRegistry();
            registry.registerFunction(externalDataFunction);

            const context: FunctionContext = { seed };

            // Execute multiple times - should get same fallback behavior
            const result1 = registry.executeFunction('external-data-score', data, context);
            const result2 = registry.executeFunction('external-data-score', data, context);

            return Promise.all([result1, result2]).then(([r1, r2]) => {
              return r1.output === r2.output;
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle multiple fallback scenarios deterministically', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            seed: fc.integer({ min: 0, max: 1000000 }),
            data: fc.record({
              value: fc.float({ min: 0, max: 100, noNaN: true }),
            }),
          }),
          ({ seed, data }) => {
            const fallbackScenarios = [
              { source: 'api', fallback: 50 },
              { source: 'database', fallback: 75 },
              { source: 'cache', fallback: 25 },
            ];

            const multiFallbackFunction: PureFunction<typeof data, number> = {
              id: 'multi-fallback-score',
              name: 'Multi Fallback Score',
              fn: (inputs, context) => {
                // Simulate all external sources unavailable
                let total = inputs.value;
                
                for (const scenario of fallbackScenarios) {
                  const externalValue = null; // Simulating unavailable
                  total += externalValue ?? scenario.fallback;
                }
                
                return total;
              },
            };

            const registry = new PureFunctionRegistry();
            registry.registerFunction(multiFallbackFunction);

            const context: FunctionContext = { seed };

            const result1 = registry.executeFunction('multi-fallback-score', data, context);
            const result2 = registry.executeFunction('multi-fallback-score', data, context);

            return Promise.all([result1, result2]).then(([r1, r2]) => {
              return r1.output === r2.output;
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional Property: Cache Consistency
   * 
   * Verifies that caching doesn't break determinism - cached results should
   * match freshly computed results.
   */
  describe('Additional Property: Cache Consistency', () => {
    it('should return identical results from cache and fresh computation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            seed: fc.integer({ min: 0, max: 1000000 }),
            data: fc.record({
              value: fc.float({ min: 0, max: 100, noNaN: true }),
              weight: fc.float({ min: 0, max: 1, noNaN: true }),
            }),
          }),
          ({ seed, data }) => {
            const cachingFunction: PureFunction<typeof data, number> = {
              id: 'caching-score',
              name: 'Caching Score',
              fn: (inputs, context) => {
                const rng = new SeededRNG(context?.seed || 0);
                return inputs.value * inputs.weight * rng.randomFloat(0.9, 1.1);
              },
            };

            const registry = new PureFunctionRegistry();
            registry.registerFunction(cachingFunction);

            const context: FunctionContext = { seed };

            return registry.executeFunction('caching-score', data, context).then(async (r1) => {
              const r2 = await registry.executeFunction('caching-score', data, context);
              expect(r1.output).toBe(r2.output);
              expect(r2.cacheHit).toBe(true);
              return r1.output === r2.output && r2.cacheHit === true;
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional Property: Serialization Consistency
   * 
   * Verifies that RNG state can be serialized and deserialized without
   * losing determinism.
   */
  describe('Additional Property: Serialization Consistency', () => {
    it('should maintain determinism after serialization and deserialization', () => {
      fc.assert(
        fc.property(
          fc.record({
            seed: fc.integer({ min: 0, max: 1000000 }),
            preOps: fc.integer({ min: 0, max: 10 }),
            postOps: fc.integer({ min: 1, max: 10 }),
          }),
          ({ seed, preOps, postOps }) => {
            const rng1 = new SeededRNG(seed);
            
            // Perform some operations
            for (let i = 0; i < preOps; i++) {
              rng1.randomFloat();
            }
            
            // Serialize
            const serialized = rng1.toJSON();
            
            // Deserialize
            const rng2 = SeededRNG.fromJSON(serialized);
            
            // Generate sequences from both
            const sequence1 = Array.from({ length: postOps }, () => rng1.randomFloat());
            const sequence2 = Array.from({ length: postOps }, () => rng2.randomFloat());
            
            return sequence1.every((val, idx) => val === sequence2[idx]);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
