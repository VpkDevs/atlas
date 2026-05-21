/**
 * Seeded Random Number Generator with deterministic behavior
 * 
 * Implements a deterministic pseudo-random number generator with configurable seed
 * and state tracking. This ensures identical inputs produce identical outputs
 * across all executions when the same seed is used.
 * 
 * Validates: Requirements 1.4
 */
export class SeededRNG {
  private state: number;
  private originalSeed: number;
  private callCount: number = 0;

  /**
   * Creates a new SeededRNG instance
   * @param seed - The seed value for deterministic random number generation
   */
  constructor(seed: number = Date.now()) {
    this.originalSeed = seed;
    this.state = this.hashSeed(seed);
  }

  /**
   * Hash function to initialize state from seed
   * Uses a simple but effective mixing function
   */
  private hashSeed(seed: number): number {
    let hash = seed;
    hash = (hash ^ 61) ^ (hash >>> 16);
    hash = hash + (hash << 3);
    hash = hash ^ (hash >>> 4);
    hash = hash * 0x27d4eb2d;
    hash = hash ^ (hash >>> 15);
    return hash >>> 0; // Ensure positive 32-bit integer
  }

  /**
   * Generates the next pseudo-random number in the sequence
   * Uses xorshift32 algorithm for fast, high-quality randomness
   */
  private next(): number {
    this.callCount++;
    
    // xorshift32 algorithm
    let x = this.state;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.state = x >>> 0; // Ensure positive 32-bit integer
    
    // Convert to float in range [0, 1)
    return (x >>> 0) / 0x100000000;
  }

  /**
   * Generates a random float in the range [min, max)
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (exclusive)
   */
  randomFloat(min: number = 0, max: number = 1): number {
    if (min >= max) {
      throw new Error(`Invalid range: min (${min}) must be less than max (${max})`);
    }
    return min + (this.next() * (max - min));
  }

  /**
   * Generates a random integer in the range [min, max]
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   */
  randomInt(min: number, max: number): number {
    if (!Number.isInteger(min) || !Number.isInteger(max)) {
      throw new Error('min and max must be integers');
    }
    if (min > max) {
      throw new Error(`Invalid range: min (${min}) must be less than or equal to max (${max})`);
    }
    return Math.floor(this.randomFloat(min, max + 1));
  }

  /**
   * Generates a random boolean with given probability
   * @param probability - Probability of returning true (0 to 1)
   */
  randomBoolean(probability: number = 0.5): boolean {
    if (probability < 0 || probability > 1) {
      throw new Error(`Probability must be between 0 and 1, got ${probability}`);
    }
    return this.next() < probability;
  }

  /**
   * Randomly selects an element from an array
   * @param array - Array to select from
   */
  randomChoice<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error('Cannot choose from empty array');
    }
    const index = this.randomInt(0, array.length - 1);
    return array[index];
  }

  /**
   * Shuffles an array in place using Fisher-Yates algorithm
   * @param array - Array to shuffle
   */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.randomInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Samples n random elements from an array without replacement
   * @param array - Array to sample from
   * @param n - Number of elements to sample
   */
  sample<T>(array: T[], n: number): T[] {
    if (n < 0) {
      throw new Error(`Sample size must be non-negative, got ${n}`);
    }
    if (n > array.length) {
      throw new Error(`Sample size (${n}) cannot exceed array length (${array.length})`);
    }
    
    const shuffled = this.shuffle(array);
    return shuffled.slice(0, n);
  }

  /**
   * Resets the generator to its initial state
   */
  reset(): void {
    this.state = this.hashSeed(this.originalSeed);
    this.callCount = 0;
  }

  /**
   * Sets a new seed and resets the generator
   * @param seed - New seed value
   */
  setSeed(seed: number): void {
    this.originalSeed = seed;
    this.reset();
  }

  /**
   * Gets the current seed
   */
  getSeed(): number {
    return this.originalSeed;
  }

  /**
   * Gets the current state (for debugging and serialization)
   */
  getState(): number {
    return this.state;
  }

  /**
   * Gets the number of random numbers generated since last reset
   */
  getCallCount(): number {
    return this.callCount;
  }

  /**
   * Creates a clone of the current RNG with the same state
   */
  clone(): SeededRNG {
    const clone = new SeededRNG(this.originalSeed);
    clone.state = this.state;
    clone.callCount = this.callCount;
    return clone;
  }

  /**
   * Serializes the RNG state to JSON
   */
  toJSON(): { seed: number; state: number; callCount: number } {
    return {
      seed: this.originalSeed,
      state: this.state,
      callCount: this.callCount
    };
  }

  /**
   * Creates an RNG from serialized state
   * @param data - Serialized RNG data
   */
  static fromJSON(data: { seed: number; state: number; callCount: number }): SeededRNG {
    const rng = new SeededRNG(data.seed);
    rng.state = data.state;
    rng.callCount = data.callCount;
    return rng;
  }
}

/**
 * Default export for convenience
 */
export default SeededRNG;