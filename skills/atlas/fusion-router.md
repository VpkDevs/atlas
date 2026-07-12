---
name: atlas-fusion-router
description: Federated routing module for Atlas v7.2. Assigns work to the best available skills and agents, scores interventions, resolves conflicts, and merges outputs under Atlas gates.
---

# Fusion Router (v7.2)

The Atlas execution multiplier. Routes every task to the best specialist, scores competing proposals, resolves conflicts, and merges outputs into one actionable plan with acceptance gates.

Atlas is the decision authority. Specialists are force multipliers. Fusion is the mechanism that makes them compounding.

---

## Global Inclusion Rule

Every available skill and agent is eligible for routing on every invocation.
No capability is excluded by default. The matrix below is a starting assignment — tasks may be routed to unlisted sources when domain fit and Fusion Intervention Score justify it.

---

## 1. Routing Matrix (Canonical)

| # | Domain | Primary Source(s) | Secondary | Expected Output |
|---|--------|-------------------|-----------|-----------------|
| 1 | **External documentation** | `context7-mcp` | Web fetch | Verified syntax, commands, config patterns — authoritative, not from memory |
| 2 | **Codebase reconnaissance** | `Explore` agent | `research` skill | Candidate files, symbol ownership, change hotspots, dependency map |
| 3 | **Competitive intelligence** | `feature-thievery-expert` | Market research | Ranked feature gap list → measurable roadmap items with conversion delta |
| 4 | **AI app lifecycle** | `AIAgentExpert` | `microsoft-foundry`, AI Toolkit skills | Model selection, eval design, tracing setup, Foundry deployment path |
| 5 | **Data-backed decisions** | `DataAnalysisExpert` | Data Viewer | Schema-aware evidence, measurable findings, recommended action |
| 6 | **Code quality & security** | `code-review` + `audit` + `harden` | `get_errors` | P0 correctness, OWASP coverage, resilience gaps — ranked by severity |
| 7 | **UI/UX and conversion** | `frontend-design`, `arrange`, `typeset`, `colorize`, `animate`, `adapt`, `optimize`, `polish`, `normalize`, `distill`, `delight`, `onboard`, `clarify`, `bolder`, `quieter`, `overdrive` | `playwright` validation | One coherent visual direction with measurable conversion delta hypothesis |
| 8 | **Browser verification** | `playwright` | Screenshot tools | Golden path coverage + regression test for last-shipped feature |
| 9 | **Azure cloud** | `azure-prepare`, `azure-validate`, `azure-deploy`, `azure-diagnostics`, `azure-cost`, `azure-compliance`, `azure-kubernetes`, `entra-*` | `mcp_azure_*` | Cloud-safe implementation, compliance posture, cost guardrails |
| 10 | **PR & review** | `create-pull-request`, `address-pr-comments`, `suggest-fix-issue` | GitHub tools | Clean, reviewable change set; addressed review threads |
| 11 | **Identity & auth** | `entra-app-registration`, `entra-agent-id`, `azure-rbac` | Docs | Least-privilege config, token exchange, RBAC assignment |
| 12 | **Observability & monitoring** | `azure-observability`, `appinsights-instrumentation` | `azure-kusto` | KQL queries, alert rules, dashboard config, APM setup |

---

## 2. Dispatch Decision Tree

```text
FUNCTION route_task(task):

  # Step 1: Classify the task
  domain = classify_domain(task.description)

  # Step 2: Check if task requires external docs first
  if domain in [1, 4, 9, 11]:
    fetch_context7_docs_first()

  # Step 3: Check if codebase reconnaissance is needed
  uncertainty = estimate_code_uncertainty(task)
  if uncertainty == "HIGH":
    run_explore_agent_first()  # Domain 2 always before major edits

  # Step 4: Select primary source
  primary = ROUTING_MATRIX[domain].primary

  # Step 5: Check for parallel-safe co-dispatch
  secondary = identify_parallel_safe_secondary(task, primary)
  if secondary:
    dispatch_parallel(primary, secondary)
  else:
    dispatch_serial(primary)

  # Step 6: Collect outputs
  proposals = collect_outputs()

  # Step 7: Score and rank
  scores = [score_fusion_intervention(p) for p in proposals]

  # Step 8: Apply conflict resolution
  winner = resolve_conflicts(proposals, scores)

  # Step 9: Gate check — reject if below threshold
  if winner.fusion_score < 20:
    log_rejection(winner, reason="below score threshold")
    return None

  return winner
```

---

## 3. Parallel Dispatch Rules

Independent tasks may run in parallel. Use this matrix to determine parallelism safety:

| Task A | Task B | Safe to Parallel? |
|--------|--------|-------------------|
| Explore (read-only) | Any domain | ✅ Always safe |
| context7 doc fetch | Any domain | ✅ Always safe |
| Code edit | Another code edit (different files) | ✅ If no shared imports |
| Code edit | Deploy | ❌ Edit must complete first |
| A/B test variant A | A/B test variant B | ❌ Never parallel |
| UI redesign | Browser verification | ❌ Verification must follow edit |
| Azure validate | Azure deploy | ❌ Validate first, always |

**Default:** When uncertain, run serially. Speed from parallelism is never worth correctness risk.

---

## 4. Conflict Resolution Matrix

When two specialists produce conflicting recommendations:

```text
FUNCTION resolve_conflicts(proposals, scores):

  # Rule 1: Hard gate — legal/compliance risk eliminates any proposal
  pairs     = [(p, s) for p, s in zip(proposals, scores) if p.compliance_risk != "HIGH"]
  proposals = [p for p, s in pairs]
  scores    = [s for p, s in pairs]

  # Rule 2: If no proposal remains after gate, return no-action with reason
  if len(proposals) == 0: return None

  # Rule 3: If only one proposal remains after gate, it wins
  if len(proposals) == 1:  return proposals[0]

  # Rule 4: Score-based selection
  ranked = sorted(zip(proposals, scores), key=lambda x: x[1], reverse=True)
  top, runner_up = ranked[0], ranked[1]

  # Rule 5: If scores within 5 points, prefer higher reversibility
  if abs(top[1] - runner_up[1]) <= 5:
    return max([top, runner_up], key=lambda x: x[0].reversibility_rank)

  # Rule 6: Top score wins
  return top[0]
```

### Reversibility Rank (for tiebreaking)
1. `instant` — feature flag / config toggle
2. `fast` — `git revert` in < 5 min
3. `moderate` — PR revert + deploy
4. `slow` — requires manual DB steps
5. `irreversible` — cannot undo (automatically rejected if alternatives exist)

---

## 5. Fusion Sprint Procedure (Full)

```text
PROCEDURE fusion_sprint(goals, blockers):

  # Phase A: Inventory
  active_goals  = collect_active_goals()
  kpi_targets   = map_goals_to_kpi(active_goals)
  score_gaps    = read_sovereign_score_gaps()   # from scoring.md

  # Phase B: Route
  routing_plan  = []
  for goal in active_goals:
    domain  = classify_domain(goal)
    primary = ROUTING_MATRIX[domain].primary
    routing_plan.append({
      "goal": goal,
      "domain": domain,
      "primary": primary
    })

  # Phase C: Dispatch
  parallel_groups = group_parallel_safe(routing_plan)
  for group in parallel_groups:
    results = dispatch_parallel(group)
    collect_outputs(results)

  # Phase D: Score interventions (see scoring.md §7)
  intervention_backlog = []
  for output in all_outputs:
    score = score_fusion_intervention(output)
    intervention_backlog.append({
      "output": output,
      "score": score
    })

  # Phase E: Rank and select
  ranked  = sort_by_score_descending(intervention_backlog)
  top3    = ranked[:3]
  skipped = ranked[3:]

  # Phase F: Gate check
  for intervention in top3:
    assert intervention.has_kpi_target,   "Reject: no KPI target"
    assert intervention.has_rollback,     "Reject: no rollback"
    assert not intervention.compliance_risk == "HIGH"

  # Phase G: Execute
  for intervention in top3:
    execute(intervention)
    verify_kpi_instrumented()
    commit_and_deploy()

  # Phase H: Report
  write_fusion_report(top3, skipped, kpi_targets, score_gaps)
```

---

## 6. Fusion Intervention Scoring

See `scoring.md §7` for the exact formula.

Quick reference:
- **Impact (40%)**: expected KPI delta normalized 0–10
- **Effort (25%)**: implementation hours (inverse — less is more)
- **Reversibility (20%)**: how fast can it be undone
- **Time-to-cash (15%)**: how quickly does this produce revenue

Score threshold: **Reject any intervention scoring below 20/100.**

---

## 7. FUSION_REPORT Format

Written to: `docs/founder/FUSION_REPORT.md`

```markdown
# FUSION_REPORT — [Slug] — [ISO Date]

## Routing Summary

| Goal | Domain | Specialist(s) | Status |
|------|--------|---------------|--------|
| [goal 1] | [domain] | [specialist] | ✅ dispatched |
| [goal 2] | [domain] | [specialist] | ⏭️ skipped (score < 20) |

## Selected Interventions (Top 3)

### 1. [Intervention Name]
- **Specialist:** [source]
- **KPI target:** [metric] from [baseline] → [target] ([+N%])
- **Fusion score:** [N]/100
- **Effort:** [N hours]
- **Reversibility:** [instant/fast/moderate/slow]
- **Rollback:** `[command or procedure]`
- **Verification:** [how to confirm it worked]
- **Status:** [pending / in-progress / shipped]

### 2. [...]
### 3. [...]

## Skipped Interventions

| Intervention | Score | Rejection Reason |
|-------------|-------|-----------------|
| [name] | [N] | [below threshold / compliance risk / no KPI] |

## Score Impact Projection

| Score | Before | After (projected) |
|-------|--------|-------------------|
| Sovereign Score | [N] | [N + delta] |
| Revenue Velocity | [N] | [N + delta] |
| Retention Health | [N] | [N + delta] |

## Next Fusion Sprint Trigger

Next sprint recommended when:
- Sovereign Score < 90 AND
- ≥ 7 days since last sprint, OR
- A new blocker is found in diag output
```

---

## 8. Rejection Rules (Hard Gates)

Reject and log any specialist output that:
1. **Lacks a measurable KPI target** — "improve UX" is not a target; "increase checkout conversion rate by 15%" is
2. **Has compliance or legal risk rated HIGH** — route to compliant alternative, log reason
3. **Is irreversible with no tested rollback** — downgrade to "prototype" status; never auto-deploy
4. **Conflicts with current capital mode** — in SURVIVE mode, reject growth channel bets; only retention + conversion
5. **Is lane-conflicted** — in Portfolio Mode, reject deploy-critical tasks for non-primary projects
6. **Scores below 20/100** on Fusion Intervention Score

---

## 9. Learning Accumulator

After each fusion sprint, append to `~/.atlas/fusion-history.jsonl`:

```jsonl
{"date":"[ISO]","slug":"[slug]","interventions_run":N,"top_score":N,"avg_score":N,"kpi_hit":true/false,"rollback_triggered":true/false,"notes":"[what worked / what failed]"}
```

Atlas reads the last 10 entries before each new fusion sprint to avoid repeating failed patterns.

- introduces irreversible risk without founder-required justification
- conflicts with active lane policy (primary/secondary/parked)

---

# Appendix: Future Design (archived v2)

*Preserved from docs/archive/fusion-router-v2-future-design.md during the file-count consolidation. Not active runtime doctrine; reference only.*

# Fusion Router v2.0 - Intelligent Agent Orchestration

The next-generation fusion router with dynamic agent discovery, performance-aware load balancing, and predictive task routing.

## Key Enhancements Over v1

1. **Dynamic Agent Discovery**: Auto-detects available agents and their capabilities
2. **Performance Monitoring**: Tracks agent performance and success rates
3. **Load Balancing**: Intelligent workload distribution across agents
4. **Predictive Routing**: Uses ML to predict best agent for each task type
5. **Fault Tolerance**: Automatic failover and recovery
6. **Cost Optimization**: Considers agent cost vs. performance tradeoffs

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Fusion Router v2.0                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Discovery │  │  Monitor │  │  Router  │  │  Logger  │    │
│  │  Engine   │  │  Engine  │  │  Engine  │  │  Engine  │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Agent Performance Database                   │
├─────────────────────────────────────────────────────────────┤
│ • Success rates by task type                                 │
│ • Average execution time                                     │
│ • Cost per execution                                         │
│ • Reliability scores                                         │
│ • Specialization patterns                                    │
└─────────────────────────────────────────────────────────────┘
```

## 1. Dynamic Agent Discovery

### Agent Registry Protocol

Agents register themselves with the fusion router by providing:
- **Agent ID**: Unique identifier
- **Capabilities**: List of supported task types
- **Performance Metrics**: Historical success rates, avg execution time
- **Cost Structure**: Free, token-based, or subscription
- **Health Status**: Current availability and load

```javascript
// Example agent registration
{
  "agent_id": "explore-agent-v2",
  "name": "Enhanced Explore Agent",
  "version": "2.1.0",
  "capabilities": [
    "codebase_reconnaissance",
    "dependency_analysis", 
    "hotspot_detection",
    "architecture_review"
  ],
  "performance": {
    "success_rate": 0.92,
    "avg_execution_time_seconds": 45,
    "reliability_score": 0.95
  },
  "cost": {
    "model": "free",
    "rate_limit": "100/day"
  },
  "health": {
    "status": "available",
    "current_load": 0.3,
    "last_heartbeat": "2024-01-15T10:30:00Z"
  }
}
```

### Discovery Methods

1. **Static Configuration**: Pre-defined agent list
2. **Dynamic Scanning**: Scan for available agents in environment
3. **Network Discovery**: Discover agents on local network
4. **Marketplace Integration**: Discover community agents

## 2. Performance Monitoring Engine

### Metrics Collection

```javascript
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map(); // agent_id -> metrics
  }
  
  recordExecution(agentId, taskType, result) {
    const metrics = this.metrics.get(agentId) || this.initializeMetrics(agentId);
    
    metrics.total_executions++;
    metrics.executions_by_type[taskType] = (metrics.executions_by_type[taskType] || 0) + 1;
    
    if (result.success) {
      metrics.successful_executions++;
      metrics.success_rate = metrics.successful_executions / metrics.total_executions;
    } else {
      metrics.failed_executions++;
      metrics.failure_reasons[result.error_type] = (metrics.failure_reasons[result.error_type] || 0) + 1;
    }
    
    metrics.avg_execution_time = (
      (metrics.avg_execution_time * (metrics.total_executions - 1)) + result.execution_time
    ) / metrics.total_executions;
    
    // Update reliability score (weighted moving average)
    const reliabilityWeight = 0.1;
    metrics.reliability_score = (
      (1 - reliabilityWeight) * metrics.reliability_score + 
      reliabilityWeight * (result.success ? 1 : 0)
    );
    
    this.metrics.set(agentId, metrics);
  }
  
  getAgentScore(agentId, taskType) {
    const metrics = this.metrics.get(agentId);
    if (!metrics) return 0.5; // Default neutral score
    
    // Base score on multiple factors
    const weights = {
      success_rate: 0.4,
      reliability_score: 0.3,
      speed_factor: 0.2,
      specialization_factor: 0.1
    };
    
    const speedFactor = Math.max(0, 1 - (metrics.avg_execution_time / 300)); // Normalize to 5 minutes
    const specializationFactor = metrics.executions_by_type[taskType] 
      ? Math.min(1, metrics.executions_by_type[taskType] / 10) 
      : 0.5;
    
    return (
      weights.success_rate * metrics.success_rate +
      weights.reliability_score * metrics.reliability_score +
      weights.speed_factor * speedFactor +
      weights.specialization_factor * specializationFactor
    );
  }
}
```

## 3. Intelligent Routing Engine

### Routing Algorithm

```javascript
class IntelligentRouter {
  constructor(discoveryEngine, performanceMonitor) {
    this.discovery = discoveryEngine;
    this.monitor = performanceMonitor;
    this.routingCache = new Map();
  }
  
  async routeTask(task) {
    // Step 1: Task analysis
    const taskAnalysis = this.analyzeTask(task);
    
    // Step 2: Candidate discovery
    const candidates = await this.discovery.findCandidates(taskAnalysis);
    
    // Step 3: Score candidates
    const scoredCandidates = candidates.map(agent => ({
      agent,
      score: this.scoreCandidate(agent, taskAnalysis)
    }));
    
    // Step 4: Apply constraints
    const filteredCandidates = this.applyConstraints(scoredCandidates, task.constraints);
    
    // Step 5: Select winner
    const winner = this.selectWinner(filteredCandidates);
    
    // Step 6: Update routing cache
    this.updateRoutingCache(taskAnalysis.taskType, winner.agent.id);
    
    return winner;
  }
  
  analyzeTask(task) {
    return {
      taskType: this.classifyTaskType(task),
      complexity: this.estimateComplexity(task),
      urgency: task.urgency || 'normal',
      requiredCapabilities: this.extractRequiredCapabilities(task),
      estimatedExecutionTime: this.estimateExecutionTime(task),
      costSensitivity: task.costSensitivity || 'medium'
    };
  }
  
  scoreCandidate(agent, taskAnalysis) {
    let score = 0;
    
    // Base performance score
    const performanceScore = this.monitor.getAgentScore(agent.id, taskAnalysis.taskType);
    score += performanceScore * 0.4;
    
    // Capability match
    const capabilityMatch = this.calculateCapabilityMatch(agent.capabilities, taskAnalysis.requiredCapabilities);
    score += capabilityMatch * 0.3;
    
    // Load consideration
    const loadPenalty = agent.health.current_load * 0.2;
    score -= loadPenalty;
    
    // Cost consideration
    const costScore = this.calculateCostScore(agent.cost, taskAnalysis.costSensitivity);
    score += costScore * 0.1;
    
    return Math.max(0, Math.min(1, score));
  }
  
  calculateCapabilityMatch(agentCapabilities, requiredCapabilities) {
    if (requiredCapabilities.length === 0) return 1;
    
    const matched = requiredCapabilities.filter(req => 
      agentCapabilities.some(agentCap => 
        agentCap.toLowerCase().includes(req.toLowerCase()) || 
        req.toLowerCase().includes(agentCap.toLowerCase())
      )
    ).length;
    
    return matched / requiredCapabilities.length;
  }
  
  calculateCostScore(costModel, sensitivity) {
    const sensitivityWeights = {
      high: { free: 1, low: 0.5, medium: 0.2, high: 0 },
      medium: { free: 0.8, low: 0.7, medium: 0.5, high: 0.2 },
      low: { free: 0.5, low: 0.8, medium: 0.7, high: 0.5 }
    };
    
    const weight = sensitivityWeights[sensitivity]?.[costModel.tier] || 0.5;
    return weight;
  }
  
  selectWinner(candidates) {
    if (candidates.length === 0) {
      throw new Error('No suitable agents found for task');
    }
    
    // Sort by score descending
    candidates.sort((a, b) => b.score - a.score);
    
    const topCandidate = candidates[0];
    
    // If multiple candidates have similar scores (within 5%), consider load balancing
    if (candidates.length > 1) {
      const scoreDiff = topCandidate.score - candidates[1].score;
      if (scoreDiff < 0.05) {
        // Prefer less loaded agent for similar scores
        const lessLoaded = candidates.slice(0, 3).sort((a, b) => 
          a.agent.health.current_load - b.agent.health.current_load
        )[0];
        
        return lessLoaded;
      }
    }
    
    return topCandidate;
  }
}
```

## 4. Load Balancing Strategies

### Adaptive Load Balancing

```javascript
class LoadBalancer {
  constructor() {
    this.agentLoads = new Map();
    this.strategy = 'weighted_round_robin';
  }
  
  getNextAgent(agents, taskType) {
    switch (this.strategy) {
      case 'round_robin':
        return this.roundRobin(agents);
      case 'weighted_round_robin':
        return this.weightedRoundRobin(agents, taskType);
      case 'least_connections':
        return this.leastConnections(agents);
      case 'performance_based':
        return this.performanceBased(agents, taskType);
      default:
        return this.weightedRoundRobin(agents, taskType);
    }
  }
  
  weightedRoundRobin(agents, taskType) {
    // Calculate weights based on performance and current load
    const weightedAgents = agents.map(agent => {
      const performanceWeight = this.calculatePerformanceWeight(agent, taskType);
      const loadWeight = 1 - agent.health.current_load; // Inverse of load
      const weight = performanceWeight * 0.7 + loadWeight * 0.3;
      
      return { agent, weight };
    });
    
    // Normalize weights
    const totalWeight = weightedAgents.reduce((sum, wa) => sum + wa.weight, 0);
    const normalized = weightedAgents.map(wa => ({
      ...wa,
      normalizedWeight: wa.weight / totalWeight
    }));
    
    // Select using weighted random
    const random = Math.random();
    let cumulative = 0;
    
    for (const wa of normalized) {
      cumulative += wa.normalizedWeight;
      if (random <= cumulative) {
        return wa.agent;
      }
    }
    
    return normalized[0].agent;
  }
  
  calculatePerformanceWeight(agent, taskType) {
    // Base weight on historical performance for this task type
    const successRate = agent.performance.success_rate || 0.5;
    const reliability = agent.performance.reliability_score || 0.5;
    const speedFactor = Math.max(0, 1 - (agent.performance.avg_execution_time_seconds || 60) / 300);
    
    return (successRate * 0.5 + reliability * 0.3 + speedFactor * 0.2);
  }
}
```

## 5. Fault Tolerance & Recovery

### Circuit Breaker Pattern

```javascript
class CircuitBreaker {
  constructor(agentId, options = {}) {
    this.agentId = agentId;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 60 seconds
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.nextAttempt = 0;
  }
  
  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() > this.nextAttempt) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error(`Circuit breaker OPEN for agent ${this.agentId}`);
      }
    }
    
    try {
      const result = await operation();
      
      if (this.state === 'HALF_OPEN') {
        this.reset();
      }
      
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }
  
  recordFailure() {
    this.failureCount++;
    
    if (this.failureCount >= this.failureThreshold) {
      this.trip();
    }
  }
  
  trip() {
    this.state = 'OPEN';
    this.nextAttempt = Date.now() + this.resetTimeout;
    console.log(`Circuit breaker TRIPPED for agent ${this.agentId}`);
  }
  
  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.nextAttempt = 0;
    console.log(`Circuit breaker RESET for agent ${this.agentId}`);
  }
}
```

## 6. Predictive Task Routing

### Machine Learning Integration

```javascript
class PredictiveRouter {
  constructor() {
    this.model = null;
    this.trainingData = [];
    this.featureExtractor = new FeatureExtractor();
  }
  
  async predictBestAgent(task, candidates) {
    // Extract features from task and candidates
    const features = this.featureExtractor.extract(task, candidates);
    
    // Use trained model to predict success probability for each candidate
    const predictions = await this.model.predict(features);
    
    // Select candidate with highest predicted success probability
    const bestIndex = predictions.indexOf(Math.max(...predictions));
    return candidates[bestIndex];
  }
  
  async trainModel(historicalData) {
    // Train model on historical execution data
    const features = historicalData.map(data => 
      this.featureExtractor.extractFromHistory(data)
    );
    const labels = historicalData.map(data => data.success ? 1 : 0);
    
    // Simple neural network or gradient boosting implementation
    this.model = await this.trainClassifier(features, labels);
  }
  
  async trainClassifier(features, labels) {
    // Implementation using TensorFlow.js or similar
    // This is a simplified placeholder
    return {
      predict: async (inputFeatures) => {
        // Simple linear model for demonstration
        const weights = [0.3, 0.2, 0.2, 0.3]; // Example weights
        const score = inputFeatures.reduce((sum, feat, i) => 
          sum + feat * weights[i % weights.length], 0
        );
        return [score]; // Normalized to 0-1
      }
    };
  }
}
```

## 7. Integration with Atlas Core

### Enhanced Fusion Sprint Procedure

```text
PROCEDURE enhanced_fusion_sprint(goals, context):
  1. AGENT DISCOVERY
     available_agents = discovery_engine.scan_environment()
     register_new_agents(available_agents)
  
  2. TASK DECOMPOSITION
     decomposed_tasks = decompose_goals(goals)
     for each task:
       task.analysis = analyze_task(task)
       task.constraints = extract_constraints(task, context)
  
  3. INTELLIGENT ROUTING
     for each task:
       candidates = find_candidates(task.analysis)
       scored_candidates = score_candidates(candidates, task.analysis)
       selected_agent = select_agent(scored_candidates, task.constraints)
       task.assigned_agent = selected_agent
  
  4. LOAD-BALANCED EXECUTION
     execution_plan = create_execution_plan(tasks)
     for each parallel_group in execution_plan:
       results = execute_parallel(group)
       monitor_execution(results)
  
  5. FAULT HANDLING
     for each failed_execution:
       if circuit_breaker.open(agent):
         reroute_to_backup_agent(task)
       else:
         retry_with_exponential_backoff(task)
  
  6. LEARNING UPDATE
     for each execution:
       record_performance_metrics(agent, task, result)
       update_routing_model(agent, task, result)
  
  7. REPORT GENERATION
     generate_enhanced_report(tasks, results, metrics)
```

## 8. Configuration Options

```yaml
fusion_router_v2:
  discovery:
    enabled: true
    scan_interval: 300  # seconds
    methods:
      - static_config
      - environment_scan
      - network_discovery
  
  routing:
    strategy: "intelligent"
    fallback_strategy: "performance_based"
    cost_sensitivity: "medium"
    
  load_balancing:
    strategy: "weighted_round_robin"
    max_concurrent_per_agent: 3
    cool_down_period: 30  # seconds
    
  fault_tolerance:
    circuit_breaker:
      failure_threshold: 3
      reset_timeout: 60  # seconds
    retry_policy:
      max_retries: 2
      backoff_factor: 2
      
  monitoring:
    metrics_collection: true
    performance_history_days: 90
    alert_thresholds:
      success_rate: 0.7
      avg_response_time: 120  # seconds
```

## 9. Performance Benefits

### Expected Improvements

| Metric | v1 | v2 | Improvement |
|--------|----|----|-------------|
| Task success rate | 85% | 92% | +7% |
| Average execution time | 120s | 85s | -29% |
| Agent utilization | 65% | 85% | +20% |
| Cost efficiency | Baseline | -25% | +25% |
| Fault recovery time | 300s | 60s | -80% |

## 10. Migration Path

### From v1 to v2

1. **Phase 1**: Co-existence mode - v2 runs alongside v1
2. **Phase 2**: Gradual traffic shift - 25% of tasks to v2
3. **Phase 3**: Performance comparison - measure improvements
4. **Phase 4**: Full migration - 100% to v2
5. **Phase 5**: v1 deprecation - remove v1 code

### Backward Compatibility

- v2 can read v1 configuration files
- v2 includes v1 routing matrix as fallback
- v2 maintains v1 API compatibility
- Migration tools provided for state transfer

---

**Next Steps**: Implement core components, integrate with Atlas, and begin phased rollout.\n\n---\n\n# Fleet Sub-Agents\n\n*Merged from fleet-subagents.md*\n\n# Atlas Fleet — Sub-Agent Architecture

**Activated:** When Atlas reaches Operator Mode (Phase 9+ complete, live URL returns 200)
**Purpose:** Atlas becomes the Coordinator. The Fleet handles domain-specific execution.

---

## The Coordination Protocol

Atlas (Coordinator) runs the Oracle Tick (see `mission-intelligence.md`) and delegates tasks to Fleet agents. Each agent:

1. **Receives** a scoped task with clear acceptance criteria
2. **Executes** autonomously within its domain boundaries
3. **Reports** outcome + metrics delta + any escalations
4. **Escalates** to Coordinator only when crossing domain boundaries

### Delegation Format

```json
{
  "from": "coordinator",
  "to": "atlas-growth",
  "task": "Schedule 7 days of content and post the launch announcement",
  "acceptance_criteria": ["7 posts scheduled in Buffer", "launch post live on Twitter/X"],
  "deadline": "T+2h",
  "authority": "can post to all social channels; cannot change pricing or product features",
  "budget": "$0 — organic only"
}
```

### Escalation Triggers (Any Agent → Coordinator)

- Task requires spending > $100
- Task would change product pricing, features, or legal terms
- Task requires founder identity (biometric, signature)
- Agent detects conflict with another agent's active task
- 3 consecutive failures on the same task

---

## Agent Roster

### Atlas Ops — Infrastructure Commander

**Domain:** Uptime, deployment, security, scaling, incident response
**KPIs:** 99.9% uptime, 0 unresolved P0s, <5min MTTR for automated recovery
**Authority:** Can deploy, rollback, scale, modify infrastructure configs, create alerts
**Cannot:** Change application logic, modify pricing, post publicly

**Standing Orders:**
- Monitor production health every tick
- Auto-rollback on error rate spike >2%
- Rotate secrets approaching expiry (if vault API available)
- Upgrade dependencies monthly (minor/patch only; major = escalate)
- Maintain incident log in `~/.atlas/portfolio/[slug]/incidents/`

### Atlas Growth — Distribution Commander

**Domain:** Marketing, content, social, SEO, community engagement, press
**KPIs:** Traffic growth rate, signup conversion, content engagement, channel ROI
**Authority:** Can post to social, schedule content, submit to directories, reply to comments
**Cannot:** Change product, modify pricing, spend money, create accounts requiring phone verification

**Standing Orders:**
- Execute weekly content cycle from `CONTENT_CALENDAR_30.md`
- Monitor social mentions and draft replies (Layer 1: API; Layer 4: artifact for founder)
- Track which channels produce signups; reallocate effort toward winners
- Submit to new directories/aggregators monthly
- Update SEO strategy quarterly based on Search Console data

### Atlas Product — Feature Velocity Commander

**Domain:** Feature development, bug fixes, UX optimization, A/B testing
**KPIs:** Tickets resolved/week, activation rate, user satisfaction signals
**Authority:** Can create PRs, fix bugs, run A/B tests, modify UI copy
**Cannot:** Deploy to production without CI passing, change core architecture, remove features

**Standing Orders:**
- Pull support tickets → identify top-requested features → create PRs
- Run A/B test on highest-impact conversion point
- Optimize onboarding flow based on activation metrics
- Fix bugs reported via Sentry within 24h (auto-triage by severity)
- Maintain `ROADMAP.md` based on data, not opinions

### Atlas Wealth — Economic Sovereignty Commander

**Domain:** P&L, tax, credits, financial modeling, invoicing
**KPIs:** Net margin %, tax efficiency, credits captured, cash runway
**Authority:** Can generate reports, apply for credits, set up accounting rules
**Cannot:** Move money, sign contracts, open bank accounts

**Standing Orders:**
- Generate monthly P&L from Stripe + expense data
- Track tax reserve (set aside estimated quarterly taxes)
- Monitor credit program deadlines and re-apply when eligible
- Calculate runway monthly; alert if <6 months
- Update `TAX_CALENDAR.md` with upcoming deadlines
- Maintain `FINANCIALS.md` in data room

### Atlas HR — The Swarm Commander

**Domain:** Freelancer hiring, SOW generation, task posting, quality review
**KPIs:** Task completion rate, cost per task, time-to-completion
**Authority:** Can draft SOWs, post to freelancer platforms (Layer 5), review deliverables
**Cannot:** Commit to contracts >$500, share proprietary code, grant repo access

**Standing Orders:**
- When Layers 1-4 fail on a task, draft a Swarm bounty
- Generate SOW with exact deliverables, acceptance criteria, budget
- Post to appropriate platform (Upwork for ongoing; Contra for one-off; Fiverr for assets)
- Review deliverables against acceptance criteria
- Escalate to Coordinator if deliverable fails QA 2x

**SOW Template:**
```markdown
## Task: [Title]
**Budget:** $[X] fixed / $[X]/hr estimated [Y]h
**Deadline:** [date]
**Deliverables:**
1. [Specific deliverable with acceptance criteria]
2. [Specific deliverable with acceptance criteria]

**Context:** [What the product does, what this task accomplishes]
**Access provided:** [Read-only repo link / design files / API docs]
**NOT provided:** Production credentials, database access, admin panel

**Acceptance criteria:**
- [ ] [Measurable criterion]
- [ ] [Measurable criterion]
- [ ] Code passes CI (if code task)
```

### Atlas Legal — Corporate Defender

**Domain:** Entity management, IP protection, compliance monitoring, contract review
**KPIs:** Compliance score, IP coverage, contract turnaround
**Authority:** Can draft legal documents, file trademark applications (Layer 4), monitor compliance
**Cannot:** Sign contracts, make legal commitments, provide legal advice (always flag for lawyer review)

**Standing Orders:**
- Monitor ToS/Privacy for staleness (flag if >12 months old)
- Track trademark search results for the product name
- Monitor for IP infringement (GitHub code search for proprietary patterns)
- Update compliance checklist when regulations change
- Review contractor agreements for IP assignment clauses

### Atlas M&A — Empire Expansion Commander

**Domain:** Acquisition scouting, due diligence, deal structuring, integration planning
**KPIs:** Deals scouted/month, acquisition success rate, integration speed
**Authority:** Can search marketplaces, analyze targets, draft LOI templates
**Cannot:** Make offers, commit funds, contact targets directly without Coordinator approval

**Standing Orders:**
- Scout Acquire.com, Flippa, MicroAcquire weekly for targets matching portfolio profile
- Score targets on: audience overlap, tech stack compatibility, revenue quality, price/value
- Maintain `~/.atlas/portfolio/ACQUISITION_PIPELINE.md`
- For top-3 targets: generate full due diligence brief
- Calculate post-acquisition integration cost + timeline

---

## Fleet Communication Protocol

All inter-agent communication goes through the Coordinator:

```text
Agent A → Coordinator → Agent B
Never: Agent A → Agent B directly
```

This prevents conflicting actions (e.g., Growth posting about a feature Product just deprecated).

### Conflict Resolution

When two agents propose conflicting actions, execute `resolve_conflict()`:

```text
PROCEDURE resolve_conflict(action_A, agent_A, action_B, agent_B):

  # 1. Domain precedence — lower number wins when domains collide
  DOMAIN_RANK = {
    "ops":     1,   # infrastructure > everything (prevents outages)
    "legal":   2,   # compliance blocker > revenue
    "product": 3,   # shipping gates growth
    "growth":  4,
    "wealth":  5,
    "hr":      6,
    "ma":      7,
  }

  # 2. Compute revenue-impact score for each action (0–100)
  score_A = estimate_revenue_impact(action_A)  # from scoring.md rubric
  score_B = estimate_revenue_impact(action_B)

  # 3. Check reversibility — prefer reversible action if scores within 15 pts
  rev_A = is_reversible(action_A)   # bool
  rev_B = is_reversible(action_B)

  # 4. Resolution logic
  IF action_A blocks a P0/P1 incident OR action_B blocks a P0/P1 incident:
    WINNER = whichever action unblocks the incident
    REASON = "incident unblock override"

  ELSE IF abs(score_A - score_B) >= 15:
    WINNER = action with higher revenue-impact score
    REASON = f"revenue-impact delta: {abs(score_A - score_B)} pts"

  ELSE IF rev_A != rev_B:
    WINNER = reversible action
    REASON = "reversibility tiebreaker (scores within 15 pts)"

  ELSE:
    WINNER = action from agent with lower DOMAIN_RANK
    REASON = f"domain precedence: {agent with lower rank} > {other agent}"

  # 5. Adjust and log
  losing_agent.adjust_plan(exclude=WINNER_action)
  decisions.append({
    "conflict": [action_A, action_B],
    "winner": WINNER,
    "reason": REASON,
    "revenue_scores": [score_A, score_B],
    "timestamp": now()
  })
  RETURN WINNER
```

**Tiebreaker chain** (applies when scores within 15 pts and both same reversibility):
1. Ops > Legal > Product > Growth > Wealth > HR > M&A (domain precedence)
2. If same agent type: later-queued action wins (agent already in motion)
3. If deadlock: escalate to Coordinator + pause both tasks; log `conflict_escalation` flag

---

## Fleet Activation Checklist

Before activating the Fleet, verify:
- [ ] Product is deployed and live (200 response)
- [ ] Monitoring is active (uptime + error tracking)
- [ ] At least 1 revenue channel exists (even if $0 MRR)
- [ ] `context.json` has complete business context
- [ ] Dashboard is showing real data

**Fleet runs in the background of every `/atlas` invocation in Operator Mode.**

---

## Shared State Protocol

Each agent reads from and writes to `context.json` — but never simultaneously. The Coordinator owns the write lock.

### What each agent reads (inputs)
```json
{
  "atlas-ops":     ["product.production_url", "status.current_phase", "incidents"],
  "atlas-growth":  ["market.launch_channels_ranked", "product.target_customer", "growth_log"],
  "atlas-product": ["status.code_blockers", "support_tickets_summary", "roadmap"],
  "atlas-wealth":  ["founder.runway_months", "product.pricing_model", "stripe_metrics"],
  "atlas-hr":      ["pending_swarm_tasks", "budget_ceiling"],
  "atlas-legal":   ["founder.location", "product.type", "legal_gaps"],
  "atlas-ma":      ["portfolio_mrr", "acquisition_pipeline"]
}
```

### What each agent writes (outputs)
Every agent appends to its own section of `~/.atlas/portfolio/[slug]/agent_log.md`:
```markdown
## [Agent Name] — [Timestamp]
Task: [task received from coordinator]
Actions taken: [list]
Outcome: [success/failure/partial]
Metrics delta: [if any]
Escalations: [if any]
```

The Coordinator writes to `context.json` after each tick — agents NEVER write to `context.json` directly.

### Lock Protocol
```text
Coordinator lock acquisition:
  1. Write context.json.lock with timestamp
  2. Complete write to context.json.tmp
  3. Atomic move .tmp → context.json
  4. Delete context.json.lock

Agent detects stale lock (> 30 sec old):
  1. Log to incidents/
  2. Attempt to read current context.json directly (read-only, no lock needed)
  3. Escalate to Coordinator
```

---

## Agent Cold-Start Protocol

When a Fleet agent is invoked for the first time (or after a long dormant period):

```text
COLD START PROCEDURE:

1. READ context.json completely
2. READ agent_log.md for own previous actions (last 30 entries)
3. READ growth_log.md (last 7 days)
4. ASSESS: what is the current state of my domain?
5. IDENTIFY: what is the highest-priority task in my domain right now?
6. REPORT to Coordinator: "Cold start complete. Domain state: [summary]. Recommended action: [specific]."
7. AWAIT Coordinator task assignment before executing anything

An agent never self-assigns work. It always receives a delegated task from Coordinator.
```

---

## Agent Health Monitoring

The Coordinator monitors all active Fleet agents:

```text
HEALTH CHECK (every Oracle tick):
  For each agent with an active task:
  - Has it reported progress in the last 2 hours?
  - If no: mark as STALE, attempt re-ping
  - If stale after re-ping: reassign task to another agent or escalate to founder
  
AGENT STATUS STATES:
  active     — currently executing a task
  idle       — waiting for task assignment
  stale      — no update in > 2 hours (Coordinator investigates)
  blocked    — explicitly blocked on a dependency or human action
  completed  — last task complete, ready for next
```

---

## Inter-Agent Dependency Graph

Some tasks have cross-agent dependencies. The Coordinator enforces order:

```text
Atlas Growth posting about a feature
  → requires: Atlas Product has verified feature is live (deps: Atlas Ops deployed it)
  → blocks: nothing

Atlas Wealth applying for startup credits
  → requires: Atlas Legal has confirmed entity type
  → blocks: Atlas HR hiring contractors (no entity = no contracts)

Atlas M&A scouting acquisitions
  → requires: Atlas Wealth has calculated acquisition budget
  → blocks: nothing

Atlas Legal updating ToS
  → requires: Atlas Product has finalized feature set for this release
  → blocks: Atlas Growth promoting the release
```

The Coordinator checks this dependency graph before delegating. If a dependency isn't met, the delegating task is queued, not rejected.

---

## The Swarm Integration (Atlas HR → Layer 5)

When Atlas HR determines a task needs The Swarm:

```text
SWARM DISPATCH PROCEDURE:

1. Generate SOW from template (see Agent Roster above)
2. Determine platform:
   - Code task → Upwork (most vetted, highest quality)
   - Design task → Contra (portfolio-forward, good for visual work)
   - One-off small task → Fiverr (fast, cheap, variable quality)
   - Specific expert → direct outreach via LinkedIn (Atlas HR drafts message)

3. Post via appropriate Layer:
   - Upwork: no API → Layer 4 (pre-filled form artifact) + userMust
   - Contra: no API → Layer 4 + userMust
   - Fiverr: no API → Layer 4 + userMust
   - Budget: all Swarm tasks require founder approval if > $100

4. After posting confirmed:
   - Log in ~/.atlas/portfolio/[slug]/swarm_tasks.md
   - Set follow-up reminder: check deliverable in [deadline + 1 day]
   - Atlas HR reviews deliverable against acceptance criteria on deadline

5. If deliverable fails QA twice:
   - Escalate to Coordinator
   - Consider finding different contractor or breaking task smaller
```

---

## Fleet Checkpoint (Operator Mode — Every Oracle Tick)

```text
─────────────────────────────────────────────────────
FLEET STATUS — [Product Name] — [Timestamp]

Active agents: [N]
  Atlas Ops:    [active | idle | stale] — last action: [description]
  Atlas Growth: [active | idle | stale] — last action: [description]
  Atlas Product:[active | idle | stale] — last action: [description]
  Atlas Wealth: [active | idle | stale] — last action: [description]

This tick:
  Tasks delegated: [N]
  Tasks completed: [N]
  Tasks stale:     [N]
  Escalations to Coordinator: [N]
  Escalations to Founder: [N]

Sovereign Score: [X] → [Y]
─────────────────────────────────────────────────────
```

## Acceptance Test (Fleet Activation)

- [ ] All 7 agent personas loaded with domain boundaries understood
- [ ] Coordinator role confirmed (Atlas = Coordinator, agents = subordinate)
- [ ] Shared state protocol active (agents read context.json, never write directly)
- [ ] First task delegation issued in correct JSON format with acceptance criteria
- [ ] agent_log.md created at `~/.atlas/portfolio/[slug]/agent_log.md`
- [ ] Conflict resolution protocol ready (revenue-impact algorithm loaded)

## Red Flags

- ❌ Agent assigned a task outside its defined domain without Coordinator approval
- ❌ Two agents working on conflicting tasks simultaneously without Coordinator awareness
- ❌ Agent writing to context.json directly (only Coordinator writes context.json)
- ❌ Swarm task posted with budget > $100 without founder approval
- ❌ Agent marked as stale for > 4 hours without Coordinator investigating
- ❌ Atlas Growth posting about a feature that Atlas Product hasn't verified is live
- ❌ Atlas Wealth applying for credits before Atlas Legal confirmed entity type
- ❌ Fleet activated before product is live (Phase 9 must be complete first)
- ❌ Delegation without acceptance criteria — vague tasks produce vague results\n