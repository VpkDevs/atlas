/**
 * Pure Function Registry with Dependency Tracking
 * 
 * Provides a registry for all scoring functions with dependency graph
 * for deterministic execution order. Ensures identical inputs produce
 * identical outputs (Requirements 1.1, 1.5).
 */

/**
 * Pure function interface for scoring functions
 */
export interface PureFunction<TInput = any, TOutput = any> {
  /** Unique identifier for the function */
  id: string;
  
  /** Function name for display/debugging */
  name: string;
  
  /** The pure function implementation */
  fn: (inputs: TInput, context?: FunctionContext) => TOutput;
  
  /** Dependencies - functions that must be executed before this one */
  dependencies?: string[];
  
  /** Input validation function (optional) */
  validateInputs?: (inputs: TInput) => ValidationResult;
  
  /** Output validation function (optional) */
  validateOutput?: (output: TOutput) => ValidationResult;
  
  /** Metadata about the function */
  metadata?: {
    description?: string;
    version?: string;
    author?: string;
    tags?: string[];
  };
}

/**
 * Context passed to pure functions
 */
export interface FunctionContext {
  /** Current seed for deterministic operations */
  seed?: number;
  
  /** Whether we're in evaluation mode (fixed timestamps) */
  evaluationMode?: boolean;
  
  /** Fixed timestamp for reproducible scoring */
  fixedTimestamp?: Date;
  
  /** Cache for intermediate results */
  cache?: Map<string, any>;
  
  /** Logger for debugging */
  logger?: (message: string, data?: any) => void;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}

/**
 * Dependency graph node
 */
interface DependencyNode {
  functionId: string;
  dependencies: string[];
  dependents: string[];
  visited: boolean;
  processing: boolean;
}

/**
 * Execution result for a function
 */
export interface ExecutionResult<T = any> {
  functionId: string;
  output: T;
  executionTime: number;
  cacheHit: boolean;
  errors?: string[];
}

/**
 * Pure Function Registry with dependency tracking
 */
export class PureFunctionRegistry {
  private functions: Map<string, PureFunction> = new Map();
  private dependencyGraph: Map<string, DependencyNode> = new Map();
  private executionCache: Map<string, Map<string, any>> = new Map();

  /**
   * Register a pure function with the registry
   */
  registerFunction<TInput, TOutput>(func: PureFunction<TInput, TOutput>): void {
    if (this.functions.has(func.id)) {
      throw new Error(`Function with id '${func.id}' is already registered`);
    }

    // Validate dependencies exist
    if (func.dependencies) {
      for (const depId of func.dependencies) {
        if (!this.functions.has(depId)) {
          throw new Error(`Dependency '${depId}' for function '${func.id}' is not registered`);
        }
      }
    }

    // Register the function
    this.functions.set(func.id, func);

    // Update dependency graph
    this.updateDependencyGraph(func.id, func.dependencies || []);
  }

  /**
   * Unregister a function from the registry
   */
  unregisterFunction(functionId: string): void {
    if (!this.functions.has(functionId)) {
      throw new Error(`Function with id '${functionId}' is not registered`);
    }

    // Check if other functions depend on this one
    const node = this.dependencyGraph.get(functionId);
    if (node && node.dependents.length > 0) {
      const dependents = node.dependents.join(', ');
      throw new Error(
        `Cannot unregister function '${functionId}' because it has dependents: ${dependents}`
      );
    }

    // Remove from registry
    this.functions.delete(functionId);
    this.dependencyGraph.delete(functionId);
    this.executionCache.delete(functionId);

    // Update dependency graph for functions that depended on this one
    for (const [id, func] of this.functions.entries()) {
      const node = this.dependencyGraph.get(id);
      if (node) {
        const depIndex = node.dependencies.indexOf(functionId);
        if (depIndex !== -1) {
          node.dependencies.splice(depIndex, 1);
        }
      }
    }
  }

  /**
   * Execute a function with its dependencies in correct order
   */
  async executeFunction<TInput, TOutput>(
    functionId: string,
    inputs: TInput,
    context?: FunctionContext
  ): Promise<ExecutionResult<TOutput>> {
    if (!this.functions.has(functionId)) {
      throw new Error(`Function with id '${functionId}' is not registered`);
    }

    const func = this.functions.get(functionId) as PureFunction<TInput, TOutput>;
    
    // Get execution order (topological sort)
    const executionOrder = this.getExecutionOrder(functionId);
    
    // Create execution context
    const execContext: FunctionContext = {
      seed: context?.seed,
      evaluationMode: context?.evaluationMode,
      fixedTimestamp: context?.fixedTimestamp,
      cache: context?.cache || new Map(),
      logger: context?.logger,
    };

    // Execute dependencies first
    const dependencyResults = new Map<string, any>();
    const startTime = Date.now();

    for (const depId of executionOrder) {
      if (depId === functionId) continue; // Skip the target function itself
      
      const depFunc = this.functions.get(depId)!;
      const depResult = await this.executeSingleFunction(depFunc, {}, execContext);
      dependencyResults.set(depId, depResult.output);
    }

    // Execute the target function with dependency results
    const finalResult = await this.executeSingleFunction(func, inputs, execContext);
    
    const executionTime = Date.now() - startTime;

    return {
      functionId,
      output: finalResult.output,
      executionTime,
      cacheHit: finalResult.cacheHit,
      errors: finalResult.errors,
    };
  }

  /**
   * Execute a single function (internal method)
   */
  private async executeSingleFunction<TInput, TOutput>(
    func: PureFunction<TInput, TOutput>,
    inputs: TInput,
    context: FunctionContext
  ): Promise<{ output: TOutput; cacheHit: boolean; errors?: string[] }> {
    const cacheKey = this.generateCacheKey(func.id, inputs, context);
    const cache = this.executionCache.get(func.id) || new Map();
    
    // Check cache
    if (cache.has(cacheKey)) {
      return {
        output: cache.get(cacheKey),
        cacheHit: true,
      };
    }

    // Validate inputs if validation function exists
    const errors: string[] = [];
    if (func.validateInputs) {
      const validation = func.validateInputs(inputs);
      if (!validation.isValid && validation.errors) {
        errors.push(...validation.errors);
      }
    }

    // Execute function
    let output: TOutput;
    try {
      output = await Promise.resolve(func.fn(inputs, context));
    } catch (error) {
      errors.push(`Function execution failed: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to execute function '${func.id}': ${errors.join(', ')}`);
    }

    // Validate output if validation function exists
    if (func.validateOutput) {
      const validation = func.validateOutput(output);
      if (!validation.isValid && validation.errors) {
        errors.push(...validation.errors);
      }
    }

    // Cache the result
    cache.set(cacheKey, output);
    this.executionCache.set(func.id, cache);

    return {
      output,
      cacheHit: false,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Get execution order for a function (topological sort)
   */
  getExecutionOrder(functionId: string): string[] {
    if (!this.dependencyGraph.has(functionId)) {
      return [functionId];
    }

    // Reset visited state
    for (const node of this.dependencyGraph.values()) {
      node.visited = false;
      node.processing = false;
    }

    const result: string[] = [];
    const visit = (nodeId: string) => {
      const node = this.dependencyGraph.get(nodeId);
      if (!node) return;

      if (node.processing) {
        throw new Error(`Circular dependency detected involving function '${nodeId}'`);
      }

      if (!node.visited) {
        node.processing = true;
        
        // Visit dependencies first
        for (const depId of node.dependencies) {
          visit(depId);
        }
        
        node.processing = false;
        node.visited = true;
        result.push(nodeId);
      }
    };

    visit(functionId);
    return result;
  }

  /**
   * Get all registered functions
   */
  getRegisteredFunctions(): PureFunction[] {
    return Array.from(this.functions.values());
  }

  /**
   * Get function by ID
   */
  getFunction<TInput, TOutput>(functionId: string): PureFunction<TInput, TOutput> | undefined {
    return this.functions.get(functionId) as PureFunction<TInput, TOutput> | undefined;
  }

  /**
   * Check if a function has dependencies
   */
  hasDependencies(functionId: string): boolean {
    const node = this.dependencyGraph.get(functionId);
    return node ? node.dependencies.length > 0 : false;
  }

  /**
   * Get function dependencies
   */
  getDependencies(functionId: string): string[] {
    const node = this.dependencyGraph.get(functionId);
    return node ? [...node.dependencies] : [];
  }

  /**
   * Get functions that depend on a given function
   */
  getDependents(functionId: string): string[] {
    const node = this.dependencyGraph.get(functionId);
    return node ? [...node.dependents] : [];
  }

  /**
   * Clear execution cache for a specific function or all functions
   */
  clearCache(functionId?: string): void {
    if (functionId) {
      this.executionCache.delete(functionId);
    } else {
      this.executionCache.clear();
    }
  }

  /**
   * Update dependency graph when a function is registered
   */
  private updateDependencyGraph(functionId: string, dependencies: string[]): void {
    // Create or update node for this function
    let node = this.dependencyGraph.get(functionId);
    if (!node) {
      node = {
        functionId,
        dependencies: [],
        dependents: [],
        visited: false,
        processing: false,
      };
      this.dependencyGraph.set(functionId, node);
    }

    // Update dependencies
    node.dependencies = [...dependencies];

    // Update dependents for each dependency
    for (const depId of dependencies) {
      let depNode = this.dependencyGraph.get(depId);
      if (!depNode) {
        depNode = {
          functionId: depId,
          dependencies: [],
          dependents: [],
          visited: false,
          processing: false,
        };
        this.dependencyGraph.set(depId, depNode);
      }
      
      if (!depNode.dependents.includes(functionId)) {
        depNode.dependents.push(functionId);
      }
    }
  }

  /**
   * Generate cache key for deterministic caching
   */
  private generateCacheKey(functionId: string, inputs: any, context: FunctionContext): string {
    // Create a deterministic string representation of inputs and context
    const inputStr = JSON.stringify(inputs, (key, value) => {
      // Handle special types
      if (value instanceof Date) {
        return `DATE:${value.toISOString()}`;
      }
      if (value instanceof Map) {
        return `MAP:${JSON.stringify(Array.from(value.entries()))}`;
      }
      if (value instanceof Set) {
        return `SET:${JSON.stringify(Array.from(value))}`;
      }
      return value;
    });

    const contextStr = JSON.stringify({
      seed: context.seed,
      evaluationMode: context.evaluationMode,
      fixedTimestamp: context.fixedTimestamp?.toISOString(),
    });

    // Simple hash function (for demonstration - in production use a proper hash)
    return `${functionId}:${inputStr}:${contextStr}`;
  }
}