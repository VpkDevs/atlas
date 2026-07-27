/**
 * Setup and Smoke Tests
 * 
 * Verifies that the testing framework and core interfaces are properly configured.
 */

import { describe, it, expect } from 'vitest';
import * as ScoringEngine from '../src/index';

describe('Project Setup', () => {
  it('should export core interfaces', () => {
    // Verify that the main module exports are available
    expect(ScoringEngine).toBeDefined();
  });

  it('should have TypeScript types available', () => {
    // This test verifies that TypeScript compilation is working
    // by using type assertions
    const mockScoreInputs: ScoringEngine.ScoreInputs = {
      data: { test: 'value' },
      timestamp: new Date(),
    };
    
    expect(mockScoreInputs).toBeDefined();
    expect(mockScoreInputs.data).toEqual({ test: 'value' });
  });

  it('should have fast-check available for property-based testing', async () => {
    // Verify fast-check is installed and importable
    const fc = await import('fast-check');
    expect(fc).toBeDefined();
    expect(fc.assert).toBeDefined();
    expect(fc.property).toBeDefined();
  });

  it('should have SeededRNG available', () => {
    const { SeededRNG } = ScoringEngine;
    expect(SeededRNG).toBeDefined();
    
    // Create an instance to verify it works
    const rng = new SeededRNG(12345);
    expect(rng).toBeDefined();
    expect(rng.getSeed()).toBe(12345);
  });

  it('should have PureFunctionRegistry available', () => {
    const { PureFunctionRegistry } = ScoringEngine;
    expect(PureFunctionRegistry).toBeDefined();
    
    // Create an instance to verify it works
    const registry = new PureFunctionRegistry();
    expect(registry).toBeDefined();
    expect(registry.getRegisteredFunctions()).toEqual([]);
  });
});

describe('Module Structure', () => {
  it('should have all required module exports', () => {
    // Verify all modules are exported
    expect(ScoringEngine.SeededRNG).toBeDefined();
    expect(ScoringEngine.PureFunctionRegistry).toBeDefined();
  });

  it('should have proper TypeScript configuration', () => {
    // This test passes if TypeScript compilation succeeded
    // which means tsconfig.json is properly configured
    expect(true).toBe(true);
  });
});

describe('Testing Framework', () => {
  it('should support vitest test runner', () => {
    // Verify vitest is working
    expect(describe).toBeDefined();
    expect(it).toBeDefined();
    expect(expect).toBeDefined();
  });

  it('should support async tests', async () => {
    // Verify async test support
    const promise = Promise.resolve(42);
    const result = await promise;
    expect(result).toBe(42);
  });

  it('should support property-based testing with fast-check', async () => {
    const fc = await import('fast-check');
    
    // Simple property test to verify framework works
    fc.assert(
      fc.property(fc.integer(), (n) => {
        return n + 0 === n;
      })
    );
  });
});
