/**
 * Atlas Router — Lazy Module Loading for Context Efficiency
 *
 * Inspired by OpenClaw's Gateway/Lane architecture and Hermes Agent's
 * skill-loading pattern. Solves the "Atlas-is-too-big" problem:
 *
 * Without this router, Atlas requires the AI to hold the entire skill
 * (60MB, 1000+ files) in working memory. Most of it is irrelevant to
 * any single task.
 *
 * With this router, each Atlas invocation:
 *  1. Classifies the task type
 *  2. Loads ONLY the modules needed (typically 3-5 of 1000+)
 *  3. Queries persistent state from .atlas-state/ on demand
 *  4. Releases module references when task completes
 */

export type AtlasMode = 'DECIDE' | 'EXECUTE' | 'LEARN';

export interface TaskClassification {
  mode: AtlasMode;
  primaryDomain: AtlasDomain;
  secondaryDomains: AtlasDomain[];
  estimatedComplexity: 'simple' | 'medium' | 'complex';
  modulesToLoad: string[];
  modulesToSkip: string[];
}

export type AtlasDomain =
  | 'scoring'
  | 'growth'
  | 'experimentation'
  | 'launch'
  | 'diagnostics'
  | 'setup'
  | 'metrics'
  | 'execution'
  | 'learning';

export interface RouterConfig {
  // Maximum modules to load per task (prevents context bloat)
  maxModulesPerTask: number;
  // Cache routing decisions for repeat tasks
  enableCache: boolean;
  // Aggressive compression: drop loaded modules when context > N% full
  compressionThreshold: number;
}

export interface LoadedModule {
  path: string;
  loadedAt: Date;
  reason: string;
  size: number; // Approximate line count
}

export class AtlasRouter {
  private config: RouterConfig;
  private loadedModules: Map<string, LoadedModule> = new Map();
  private routingCache: Map<string, TaskClassification> = new Map();

  // The routing table — single source of truth for what each task needs
  private static readonly ROUTING_TABLE: Record<string, {
    domains: AtlasDomain[];
    modules: string[];
  }> = {
    'score_business': {
      domains: ['scoring', 'metrics'],
      modules: ['scoring.md', 'atlas-brain.md', 'scoring-engine/src/index.ts'],
    },
    'plan_growth': {
      domains: ['growth', 'experimentation'],
      modules: ['growth-engine.md', 'IMPROVEMENTS_SUMMARY.md'],
    },
    'run_ab_test': {
      domains: ['experimentation', 'learning'],
      modules: [
        'scoring-engine/src/experimentation/ExperimentationEngine.ts',
        'scoring-engine/src/experimentation/AdversarialTestingEngine.ts',
        'ADVERSARIAL_AND_EPISTEMIC.md',
      ],
    },
    'launch_product': {
      domains: ['launch'],
      modules: ['launch-strategy.md', 'launch-day.md', 'marketing-playbook.md'],
    },
    'diagnose_problem': {
      domains: ['diagnostics'],
      modules: ['atlas-brain.md', 'edge-cases.md', 'INCONSISTENCIES_FIXED.md'],
    },
    'setup_business': {
      domains: ['setup'],
      modules: ['business-setup.md', 'legal-compliance.md', 'brand-engine.md'],
    },
    'track_metrics': {
      domains: ['metrics'],
      modules: ['scoring.md', 'IMPROVEMENTS_INDEX.md', 'scoring-engine/src/uncertainty/'],
    },
    'execute_action': {
      domains: ['execution'],
      modules: ['api-execution-engine.md', 'automation-handoff.md', 'fleet-subagents.md'],
    },
    'learn_from_outcome': {
      domains: ['learning'],
      modules: [
        'scoring-engine/src/learning/AdaptiveDecisionEngine.ts',
        'scoring-engine/src/learning/DimensionWeightingEngine.ts',
        'IDEAL_VS_ACTUAL.md',
      ],
    },
  };

  // Patterns for classifying user requests
  private static readonly TASK_PATTERNS: Array<{
    pattern: RegExp;
    taskKey: string;
    mode: AtlasMode;
  }> = [
    { pattern: /\b(score|rate|evaluate|measure)\b.*\b(business|company|startup)\b/i, taskKey: 'score_business', mode: 'DECIDE' },
    { pattern: /\b(grow|growth|scale|acquire)\b/i, taskKey: 'plan_growth', mode: 'DECIDE' },
    { pattern: /\b(ab test|a\/b test|experiment|test variant|test treatment)\b/i, taskKey: 'run_ab_test', mode: 'EXECUTE' },
    { pattern: /\b(launch|release|ship|deploy)\b/i, taskKey: 'launch_product', mode: 'EXECUTE' },
    { pattern: /\b(diagnose|debug|why is|what's wrong|broken)\b/i, taskKey: 'diagnose_problem', mode: 'DECIDE' },
    { pattern: /\b(setup|set up|initialize|bootstrap|start)\b.*\b(business|company)\b/i, taskKey: 'setup_business', mode: 'EXECUTE' },
    { pattern: /\b(track|monitor|measure|metric)\b/i, taskKey: 'track_metrics', mode: 'LEARN' },
    { pattern: /\b(execute|run|perform|do|action)\b/i, taskKey: 'execute_action', mode: 'EXECUTE' },
    { pattern: /\b(learn|record|log|outcome|result)\b/i, taskKey: 'learn_from_outcome', mode: 'LEARN' },
  ];

  constructor(config?: Partial<RouterConfig>) {
    this.config = {
      maxModulesPerTask: 5,
      enableCache: true,
      compressionThreshold: 0.6,
      ...config,
    };
  }

  /**
   * Classify a user request and determine which modules to load.
   * This is the core lazy-loading decision.
   */
  classify(userRequest: string): TaskClassification {
    // Check cache first
    const cacheKey = this.cacheKey(userRequest);
    if (this.config.enableCache && this.routingCache.has(cacheKey)) {
      return this.routingCache.get(cacheKey)!;
    }

    // Match against patterns
    let bestMatch: { taskKey: string; mode: AtlasMode } | null = null;

    for (const { pattern, taskKey, mode } of AtlasRouter.TASK_PATTERNS) {
      if (pattern.test(userRequest)) {
        bestMatch = { taskKey, mode };
        break; // First match wins; patterns are ordered by specificity
      }
    }

    // Fallback: load the kernel index only
    if (!bestMatch) {
      const classification: TaskClassification = {
        mode: 'DECIDE',
        primaryDomain: 'scoring',
        secondaryDomains: [],
        estimatedComplexity: 'simple',
        modulesToLoad: ['INDEX.md', 'ATLAS_KERNEL.md'],
        modulesToSkip: this.everythingElse(['INDEX.md', 'ATLAS_KERNEL.md']),
      };
      this.routingCache.set(cacheKey, classification);
      return classification;
    }

    const routing = AtlasRouter.ROUTING_TABLE[bestMatch.taskKey];
    const modulesToLoad = routing.modules.slice(0, this.config.maxModulesPerTask);

    const classification: TaskClassification = {
      mode: bestMatch.mode,
      primaryDomain: routing.domains[0],
      secondaryDomains: routing.domains.slice(1),
      estimatedComplexity: this.estimateComplexity(userRequest, modulesToLoad.length),
      modulesToLoad,
      modulesToSkip: this.everythingElse(modulesToLoad),
    };

    if (this.config.enableCache) {
      this.routingCache.set(cacheKey, classification);
    }

    return classification;
  }

  /**
   * Estimate task complexity from request length and module count.
   */
  private estimateComplexity(
    request: string,
    moduleCount: number
  ): 'simple' | 'medium' | 'complex' {
    if (request.length < 50 && moduleCount <= 2) return 'simple';
    if (request.length < 200 && moduleCount <= 4) return 'medium';
    return 'complex';
  }

  /**
   * Track that a module was loaded for telemetry/debugging.
   */
  trackLoad(modulePath: string, reason: string, approximateSize: number = 0): void {
    this.loadedModules.set(modulePath, {
      path: modulePath,
      loadedAt: new Date(),
      reason,
      size: approximateSize,
    });
  }

  /**
   * Release loaded modules when task completes.
   * Critical for keeping context window clean across multiple invocations.
   */
  release(modulePaths?: string[]): void {
    if (modulePaths) {
      for (const path of modulePaths) {
        this.loadedModules.delete(path);
      }
    } else {
      this.loadedModules.clear();
    }
  }

  /**
   * Get current context-pressure estimate.
   */
  getContextPressure(): {
    loadedCount: number;
    estimatedLines: number;
    nearLimit: boolean;
    recommendation: string;
  } {
    const loadedCount = this.loadedModules.size;
    const estimatedLines = Array.from(this.loadedModules.values()).reduce(
      (sum, m) => sum + m.size,
      0
    );

    const nearLimit = estimatedLines > 5000; // Rough threshold

    let recommendation = 'context is healthy';
    if (nearLimit) {
      recommendation = 'release non-essential modules; consult only kernel + 1-2 modules';
    } else if (loadedCount > this.config.maxModulesPerTask) {
      recommendation = 'exceeding max modules per task; consider task decomposition';
    }

    return { loadedCount, estimatedLines, nearLimit, recommendation };
  }

  /**
   * Provide the routing decision as a human-readable plan.
   */
  explainRouting(classification: TaskClassification): string {
    return `
Routing Decision:
─────────────────────────────────────
Mode: ${classification.mode}
Primary domain: ${classification.primaryDomain}
Secondary domains: ${classification.secondaryDomains.join(', ') || 'none'}
Complexity: ${classification.estimatedComplexity}

Modules to load (${classification.modulesToLoad.length}):
${classification.modulesToLoad.map((m) => `  + ${m}`).join('\n')}

Modules to skip (preserves context):
  - ${classification.modulesToSkip.length} other Atlas modules

─────────────────────────────────────
    `.trim();
  }

  private cacheKey(request: string): string {
    // Normalize for cache hit rate
    return request.toLowerCase().trim().slice(0, 200);
  }

  private everythingElse(loaded: string[]): string[] {
    const allKnownModules = new Set<string>();
    for (const routing of Object.values(AtlasRouter.ROUTING_TABLE)) {
      for (const module of routing.modules) {
        allKnownModules.add(module);
      }
    }
    return Array.from(allKnownModules).filter((m) => !loaded.includes(m));
  }
}
