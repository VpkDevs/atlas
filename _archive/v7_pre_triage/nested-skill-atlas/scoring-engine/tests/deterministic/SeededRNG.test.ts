/**
 * Unit tests for SeededRNG class
 * 
 * Tests deterministic behavior, seed management, and state tracking
 * Validates: Requirements 1.4
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SeededRNG } from '../../src/deterministic/SeededRNG';

describe('SeededRNG', () => {
  describe('Initialization', () => {
    it('should create an instance with a provided seed', () => {
      const rng = new SeededRNG(42);
      expect(rng.getSeed()).toBe(42);
    });

    it('should create an instance with default seed if not provided', () => {
      const rng = new SeededRNG();
      expect(typeof rng.getSeed()).toBe('number');
    });

    it('should initialize call count to 0', () => {
      const rng = new SeededRNG(42);
      expect(rng.getCallCount()).toBe(0);
    });
  });

  describe('Deterministic Behavior', () => {
    it('should produce identical sequences with the same seed', () => {
      const rng1 = new SeededRNG(12345);
      const rng2 = new SeededRNG(12345);

      const sequence1 = Array.from({ length: 10 }, () => rng1.randomFloat());
      const sequence2 = Array.from({ length: 10 }, () => rng2.randomFloat());

      expect(sequence1).toEqual(sequence2);
    });

    it('should produce different sequences with different seeds', () => {
      const rng1 = new SeededRNG(12345);
      const rng2 = new SeededRNG(54321);

      const sequence1 = Array.from({ length: 10 }, () => rng1.randomFloat());
      const sequence2 = Array.from({ length: 10 }, () => rng2.randomFloat());

      expect(sequence1).not.toEqual(sequence2);
    });

    it('should produce identical results when reset with same seed', () => {
      const rng = new SeededRNG(42);
      const sequence1 = Array.from({ length: 5 }, () => rng.randomFloat());

      rng.setSeed(42);
      const sequence2 = Array.from({ length: 5 }, () => rng.randomFloat());

      expect(sequence1).toEqual(sequence2);
    });
  });

  describe('randomFloat', () => {
    it('should generate floats in the range [min, max)', () => {
      const rng = new SeededRNG(42);
      const min = 10;
      const max = 20;

      for (let i = 0; i < 100; i++) {
        const value = rng.randomFloat(min, max);
        expect(value).toBeGreaterThanOrEqual(min);
        expect(value).toBeLessThan(max);
      }
    });

    it('should generate floats in [0, 1) by default', () => {
      const rng = new SeededRNG(42);

      for (let i = 0; i < 100; i++) {
        const value = rng.randomFloat();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it('should throw error if min >= max', () => {
      const rng = new SeededRNG(42);
      expect(() => rng.randomFloat(10, 10)).toThrow();
      expect(() => rng.randomFloat(20, 10)).toThrow();
    });

    it('should increment call count', () => {
      const rng = new SeededRNG(42);
      expect(rng.getCallCount()).toBe(0);
      rng.randomFloat();
      expect(rng.getCallCount()).toBe(1);
      rng.randomFloat();
      expect(rng.getCallCount()).toBe(2);
    });
  });

  describe('randomInt', () => {
    it('should generate integers in the range [min, max]', () => {
      const rng = new SeededRNG(42);
      const min = 1;
      const max = 10;

      for (let i = 0; i < 100; i++) {
        const value = rng.randomInt(min, max);
        expect(value).toBeGreaterThanOrEqual(min);
        expect(value).toBeLessThanOrEqual(max);
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    it('should throw error if min > max', () => {
      const rng = new SeededRNG(42);
      expect(() => rng.randomInt(10, 5)).toThrow();
    });

    it('should throw error if arguments are not integers', () => {
      const rng = new SeededRNG(42);
      expect(() => rng.randomInt(1.5, 10)).toThrow();
      expect(() => rng.randomInt(1, 10.5)).toThrow();
    });

    it('should allow min === max', () => {
      const rng = new SeededRNG(42);
      const value = rng.randomInt(5, 5);
      expect(value).toBe(5);
    });
  });

  describe('randomBoolean', () => {
    it('should generate booleans with default probability 0.5', () => {
      const rng = new SeededRNG(42);
      const results = Array.from({ length: 1000 }, () => rng.randomBoolean());
      const trueCount = results.filter(x => x).length;

      // With 1000 samples, expect roughly 500 true values (within reasonable margin)
      expect(trueCount).toBeGreaterThan(400);
      expect(trueCount).toBeLessThan(600);
    });

    it('should respect custom probability', () => {
      const rng = new SeededRNG(42);
      const results = Array.from({ length: 1000 }, () => rng.randomBoolean(0.8));
      const trueCount = results.filter(x => x).length;

      // With probability 0.8 and 1000 samples, expect roughly 800 true values
      expect(trueCount).toBeGreaterThan(700);
      expect(trueCount).toBeLessThan(900);
    });

    it('should throw error if probability is out of range', () => {
      const rng = new SeededRNG(42);
      expect(() => rng.randomBoolean(-0.1)).toThrow();
      expect(() => rng.randomBoolean(1.1)).toThrow();
    });

    it('should always return true with probability 1', () => {
      const rng = new SeededRNG(42);
      for (let i = 0; i < 10; i++) {
        expect(rng.randomBoolean(1)).toBe(true);
      }
    });

    it('should always return false with probability 0', () => {
      const rng = new SeededRNG(42);
      for (let i = 0; i < 10; i++) {
        expect(rng.randomBoolean(0)).toBe(false);
      }
    });
  });

  describe('randomChoice', () => {
    it('should select elements from array', () => {
      const rng = new SeededRNG(42);
      const array = ['a', 'b', 'c', 'd', 'e'];

      for (let i = 0; i < 20; i++) {
        const choice = rng.randomChoice(array);
        expect(array).toContain(choice);
      }
    });

    it('should throw error on empty array', () => {
      const rng = new SeededRNG(42);
      expect(() => rng.randomChoice([])).toThrow();
    });

    it('should select from single-element array', () => {
      const rng = new SeededRNG(42);
      const choice = rng.randomChoice(['only']);
      expect(choice).toBe('only');
    });

    it('should produce deterministic choices with same seed', () => {
      const array = [1, 2, 3, 4, 5];
      const rng1 = new SeededRNG(42);
      const rng2 = new SeededRNG(42);

      const choices1 = Array.from({ length: 10 }, () => rng1.randomChoice(array));
      const choices2 = Array.from({ length: 10 }, () => rng2.randomChoice(array));

      expect(choices1).toEqual(choices2);
    });
  });

  describe('shuffle', () => {
    it('should shuffle array elements', () => {
      const rng = new SeededRNG(42);
      const original = [1, 2, 3, 4, 5];
      const shuffled = rng.shuffle(original);

      // Should contain same elements
      expect(shuffled.sort((a, b) => a - b)).toEqual(original.sort((a, b) => a - b));
    });

    it('should not modify original array', () => {
      const rng = new SeededRNG(42);
      const original = [1, 2, 3, 4, 5];
      const originalCopy = [...original];
      rng.shuffle(original);

      expect(original).toEqual(originalCopy);
    });

    it('should produce deterministic shuffles with same seed', () => {
      const array = [1, 2, 3, 4, 5];
      const rng1 = new SeededRNG(42);
      const rng2 = new SeededRNG(42);

      const shuffled1 = rng1.shuffle(array);
      const shuffled2 = rng2.shuffle(array);

      expect(shuffled1).toEqual(shuffled2);
    });

    it('should handle single-element array', () => {
      const rng = new SeededRNG(42);
      const shuffled = rng.shuffle([1]);
      expect(shuffled).toEqual([1]);
    });

    it('should handle empty array', () => {
      const rng = new SeededRNG(42);
      const shuffled = rng.shuffle([]);
      expect(shuffled).toEqual([]);
    });
  });

  describe('sample', () => {
    it('should sample n elements from array', () => {
      const rng = new SeededRNG(42);
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const sample = rng.sample(array, 5);

      expect(sample.length).toBe(5);
      expect(sample.every(x => array.includes(x))).toBe(true);
    });

    it('should sample without replacement', () => {
      const rng = new SeededRNG(42);
      const array = [1, 2, 3, 4, 5];
      const sample = rng.sample(array, 5);

      // All elements should be unique
      expect(new Set(sample).size).toBe(5);
    });

    it('should throw error if sample size > array length', () => {
      const rng = new SeededRNG(42);
      expect(() => rng.sample([1, 2, 3], 5)).toThrow();
    });

    it('should throw error if sample size is negative', () => {
      const rng = new SeededRNG(42);
      expect(() => rng.sample([1, 2, 3], -1)).toThrow();
    });

    it('should produce deterministic samples with same seed', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const rng1 = new SeededRNG(42);
      const rng2 = new SeededRNG(42);

      const sample1 = rng1.sample(array, 5);
      const sample2 = rng2.sample(array, 5);

      expect(sample1).toEqual(sample2);
    });

    it('should allow sampling 0 elements', () => {
      const rng = new SeededRNG(42);
      const sample = rng.sample([1, 2, 3], 0);
      expect(sample).toEqual([]);
    });
  });

  describe('reset', () => {
    it('should reset state to initial value', () => {
      const rng = new SeededRNG(42);
      const value1 = rng.randomFloat();
      rng.reset();
      const value2 = rng.randomFloat();

      expect(value1).toBe(value2);
    });

    it('should reset call count to 0', () => {
      const rng = new SeededRNG(42);
      rng.randomFloat();
      rng.randomFloat();
      expect(rng.getCallCount()).toBe(2);

      rng.reset();
      expect(rng.getCallCount()).toBe(0);
    });
  });

  describe('setSeed', () => {
    it('should change the seed', () => {
      const rng = new SeededRNG(42);
      expect(rng.getSeed()).toBe(42);

      rng.setSeed(100);
      expect(rng.getSeed()).toBe(100);
    });

    it('should reset state when setting new seed', () => {
      const rng = new SeededRNG(42);
      const value1 = rng.randomFloat();

      rng.setSeed(42);
      const value2 = rng.randomFloat();

      expect(value1).toBe(value2);
    });

    it('should reset call count when setting new seed', () => {
      const rng = new SeededRNG(42);
      rng.randomFloat();
      rng.randomFloat();

      rng.setSeed(100);
      expect(rng.getCallCount()).toBe(0);
    });
  });

  describe('getState', () => {
    it('should return current state', () => {
      const rng = new SeededRNG(42);
      const state1 = rng.getState();
      expect(typeof state1).toBe('number');

      rng.randomFloat();
      const state2 = rng.getState();
      expect(state1).not.toBe(state2);
    });
  });

  describe('clone', () => {
    it('should create a clone with same state', () => {
      const rng = new SeededRNG(42);
      rng.randomFloat();
      rng.randomFloat();

      const clone = rng.clone();
      expect(clone.getSeed()).toBe(rng.getSeed());
      expect(clone.getState()).toBe(rng.getState());
      expect(clone.getCallCount()).toBe(rng.getCallCount());
    });

    it('should produce identical sequences from clone', () => {
      const rng = new SeededRNG(42);
      rng.randomFloat();
      rng.randomFloat();

      const clone = rng.clone();
      const sequence1 = Array.from({ length: 5 }, () => rng.randomFloat());
      const sequence2 = Array.from({ length: 5 }, () => clone.randomFloat());

      expect(sequence1).toEqual(sequence2);
    });

    it('should not affect original when modifying clone', () => {
      const rng = new SeededRNG(42);
      const clone = rng.clone();

      clone.setSeed(100);
      expect(rng.getSeed()).toBe(42);
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON', () => {
      const rng = new SeededRNG(42);
      rng.randomFloat();
      rng.randomFloat();

      const json = rng.toJSON();
      expect(json.seed).toBe(42);
      expect(typeof json.state).toBe('number');
      expect(json.callCount).toBe(2);
    });

    it('should deserialize from JSON', () => {
      const rng = new SeededRNG(42);
      rng.randomFloat();
      rng.randomFloat();

      const json = rng.toJSON();
      const restored = SeededRNG.fromJSON(json);

      expect(restored.getSeed()).toBe(rng.getSeed());
      expect(restored.getState()).toBe(rng.getState());
      expect(restored.getCallCount()).toBe(rng.getCallCount());
    });

    it('should produce identical sequences after deserialization', () => {
      const rng = new SeededRNG(42);
      rng.randomFloat();
      rng.randomFloat();

      const json = rng.toJSON();
      const restored = SeededRNG.fromJSON(json);

      const sequence1 = Array.from({ length: 5 }, () => rng.randomFloat());
      const sequence2 = Array.from({ length: 5 }, () => restored.randomFloat());

      expect(sequence1).toEqual(sequence2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle large seed values', () => {
      const rng = new SeededRNG(Number.MAX_SAFE_INTEGER);
      expect(typeof rng.randomFloat()).toBe('number');
    });

    it('should handle negative seed values', () => {
      const rng = new SeededRNG(-12345);
      expect(typeof rng.randomFloat()).toBe('number');
    });

    it('should handle zero seed', () => {
      const rng = new SeededRNG(0);
      expect(typeof rng.randomFloat()).toBe('number');
    });

    it('should handle many consecutive calls', () => {
      const rng = new SeededRNG(42);
      for (let i = 0; i < 10000; i++) {
        const value = rng.randomFloat();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
      expect(rng.getCallCount()).toBe(10000);
    });
  });
});
