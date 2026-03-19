# SweepBot Phase 2: Implementation Plan
## Natural Language Automation Engine + Top 25 Features

**Project Context:** Adding SweepBot Flows (the flagship differentiator) and expanding with 25 high-impact features to deepen the data moat and drive engagement/monetization.

---

## ✅ PHASE 1 COMPLETION STATUS

**Date Completed:** February 28, 2026  
**Status:** PRODUCTION READY

See `/PHASE_1_COMPLETION.md` for comprehensive completion report.

### Phase 1 Deliverables ✅
- ✅ Entity Recognizer (NLP extraction: platforms, games, actions, conditions, schedules, amounts, durations)
- ✅ Flow Interpreter (4-pass pipeline: entity extraction → intent classification → AST building → validation)
- ✅ Flow Executor (AST traversal with metrics tracking, 12+ execution metrics per run)
- ✅ Flow Scheduler (Cron-based with node-cron, timezone support, auto-recovery)
- ✅ Conversation Manager (Multi-turn refinement with intent detection and guided questions)
- ✅ Responsible Play Validator (Mandatory guardrails: max_duration, cool_down_check, max_loss, etc.)
- ✅ Database Schema (4 Drizzle ORM tables: flows, flow_executions, flow_conversations, shared_flows)
- ✅ API Endpoints (8 Fastify routes with full Zod validation)
- ✅ React Frontend (FlowsPage, FlowChatPage, FlowDetailPage with TanStack Query)
- ✅ Test Suite (200+ tests, 80%+ coverage: entity-recognizer, interpreter, executor, integration)

### Architecture Highlights
- Recursive AST traversal with proper error handling
- Type-safe with full TypeScript throughout
- Mandatory responsible play enforcement (non-negotiable)
- 70-80% rule-based entity recognition with LLM fallback
- Loop safety caps (maxIterations, maxDuration)
- Per-node failure strategies
- Real-time execution logging and metrics

### Known Phase 1 Limitations
- Action execution currently returns mock data (integration with automation engine needed)
- LLM fallback for low-confidence cases not yet implemented
- No real user testing feedback incorporated yet
- Deployment and staging testing not yet completed

---

**Current Architecture Summary:**
- Backend: Fastify v5 with raw SQL/Drizzle ORM queries, Zod validation, Supabase auth
- Frontend: React 18 + TanStack Router/Query, Zustand auth store
- Extension: WXT-based with network interception, session tracking
- Database: PostgreSQL 16 with partitioned tables (transactions, jackpot_snapshots), Row-Level Security
- All code in TypeScript with existing patterns for validation, error handling, API responses

**Key Files Reference:**
- Database client: `/apps/api/src/db/client.ts`
- Routes index: `/apps/api/src/routes/index.ts`
- Frontend types: `/packages/types/src/`
- Auth patterns: `/apps/api/src/middleware/auth.ts`, `/apps/web/src/stores/auth.ts`
- Frontend pages: `/apps/web/src/pages/`

---

## PHASE 1: SWEEPBOT FLOWS - NATURAL LANGUAGE AUTOMATION ENGINE

**Priority:** HIGHEST - This is the flagship differentiator and core value proposition.

### Scope Definition

**What This Delivers:**
- Users type plain English instructions → SweepBot converts to executable automation scripts
- No flowchart builders, no code, no drag-and-drop
- Multi-platform, multi-action automation with conditions, loops, and guardrails
- Scheduler for recurring flows (cron-based)
- Flow Marketplace where users can share/sell their automation recipes
- Full execution tracking and analytics

**Example User Input:**
> "Every day at 3:30, open Chumba, grab my daily bonus, throw it on Sweet Bonanza at minimum bet. If I hit over 5x what the bonus was, keep going. If not, stop."

**SweepBot Response:**
```
⏰ Trigger: Daily at 3:30 PM
🌐 Open Chumba Casino, log in
🎁 Claim daily login bonus → store as $BONUS
🎰 Open Sweet Bonanza, set minimum bet
🔄 Spin → IF win > 5× $BONUS → continue spinning
🛑 IF win ≤ 5× $BONUS → stop, close platform, log session
```

### Implementation Architecture

#### 1. Database Schema (Drizzle Tables)

**New tables to add** (in `/apps/api/src/db/schema/flows.ts` - NEW FILE):

```typescript
// flows table - The Flow definitions
export const flows = pgTable('flows', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(), // original natural language input
  definition: jsonb('definition').notNull(), // FlowDefinition AST
  trigger: jsonb('trigger').notNull(), // FlowTrigger (cron, manual, event, condition)
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  version: integer('version').notNull().default(1),
  guardrails: jsonb('guardrails').notNull(), // ResponsiblePlayGuardrail[]
  isShared: boolean('is_shared').notNull().default(false),
  sharedFlowId: uuid('shared_flow_id').references(() => sharedFlows.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastExecutedAt: timestamp('last_executed_at'),
  executionCount: integer('execution_count').notNull().default(0),
  performanceStats: jsonb('performance_stats'), // execution metrics
})

// flow_executions table - Every single run is logged
export const flowExecutions = pgTable('flow_executions', {
  id: uuid('id').primaryKey().defaultRandom(),
  flowId: uuid('flow_id').notNull().references(() => flows.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  status: varchar('status', { length: 30 }).notNull(), // running, completed, failed, stopped_by_guardrail
  startedAt: timestamp('started_at').notNull(),
  completedAt: timestamp('completed_at'),
  metrics: jsonb('metrics').notNull(), // FlowExecutionMetrics
  log: jsonb('log').notNull(), // FlowExecutionLog[] - detailed action trace
  guardrailsTriggered: jsonb('guardrails_triggered'), // which guardrails fired
  errorDetails: text('error_details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// flow_conversations table - Multi-turn building history
export const flowConversations = pgTable('flow_conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  flowId: uuid('flow_id').references(() => flows.id),
  turns: jsonb('turns').notNull(), // ConversationTurn[]
  status: varchar('status', { length: 20 }).notNull(), // building, confirming, modifying, complete
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// shared_flows table - Marketplace
export const sharedFlows = pgTable('shared_flows', {
  id: uuid('id').primaryKey().defaultRandom(),
  creatorId: uuid('creator_id').notNull().references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  tags: jsonb('tags').notNull().default(sql`'[]'::jsonb`),
  flowTemplate: jsonb('flow_template').notNull(),
  priceCents: integer('price_cents').notNull().default(0), // 0 = free
  imports: integer('imports').notNull().default(0),
  activeUsers: integer('active_users').notNull().default(0),
  avgNetResult: decimal('avg_net_result', { precision: 10, scale: 2 }),
  avgTimeSavedMinutes: decimal('avg_time_saved_minutes', { precision: 8, scale: 2 }),
  rating: decimal('rating', { precision: 3, scale: 2 }),
  reviewCount: integer('review_count').notNull().default(0),
  verifiedPerformance: boolean('verified_performance').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
```

**Migration Path:**
1. Create `/apps/api/src/db/schema/flows.ts` with above tables
2. Update `/packages/types/src/flows.ts` with TypeScript types (FlowDefinition, FlowTrigger, FlowNode, etc.)
3. Create Drizzle migration (will be generated via `drizzle-kit push`)
4. Add to schema exports: `/apps/api/src/db/schema/index.ts`

#### 2. NLP Interpretation Layer (`/packages/flows/src/` - NEW PACKAGE)

**Package Setup:** New monorepo package `packages/flows/` with:
- src/interpreter/ - Natural language → Flow definition
- src/executor/ - Flow definition → Automation execution
- src/conversation/ - Multi-turn Flow building
- src/marketplace/ - Shared Flow management
- src/types.ts - Shared types
- src/utils/ - Helpers (entity mapping, validation)

**Core Modules:**

**1. `/packages/flows/src/types.ts` - Type Definitions**

Core types for the entire Flows system:

```typescript
// Flow Definition AST
export interface FlowDefinition {
  id: string
  userId: string
  name: string
  description: string // original natural language input
  version: number
  status: 'draft' | 'active' | 'paused' | 'archived'
  trigger: FlowTrigger
  rootNode: FlowNode
  variables: FlowVariable[]
  responsiblePlayGuardrails: ResponsiblePlayGuardrail[]
  createdAt: Date
  updatedAt: Date
  lastExecutedAt?: Date
  executionCount: number
  performanceStats: FlowPerformanceStats
}

export type FlowTrigger =
  | { type: 'scheduled'; cron: string; timezone: string }
  | { type: 'manual' }
  | { type: 'event'; event: FlowEventType }
  | { type: 'condition'; condition: string }

export type FlowNode =
  | FlowActionNode
  | FlowConditionNode
  | FlowLoopNode
  | FlowSequenceNode
  | FlowParallelNode
  | FlowWaitNode
  | FlowStopNode
  | FlowAlertNode
  | FlowStoreNode

export interface FlowActionNode {
  type: 'action'
  id: string
  action: string // 'open_platform', 'claim_bonus', 'spin', 'bet', 'check_balance', etc.
  platform?: string
  game?: string
  parameters: Record<string, unknown>
  timeout: number // ms
  onFailure: 'skip' | 'retry' | 'stop' | FlowNode
  next?: FlowNode
}

export interface FlowConditionNode {
  type: 'condition'
  id: string
  left: FlowValue
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=' | 'contains' | 'exists'
  right: FlowValue
  onTrue: FlowNode
  onFalse?: FlowNode
}

export interface FlowLoopNode {
  type: 'loop'
  id: string
  condition: FlowConditionNode
  body: FlowNode
  maxIterations: number // safety cap
  maxDuration: number // ms, safety cap
}

export interface FlowSequenceNode {
  type: 'sequence'
  id: string
  steps: FlowNode[]
}

export interface FlowParallelNode {
  type: 'parallel'
  id: string
  branches: FlowNode[]
  waitFor: 'all' | 'any' | 'none'
}

export interface FlowWaitNode {
  type: 'wait'
  id: string
  duration: number // ms
  next?: FlowNode
}

export interface FlowStopNode {
  type: 'stop'
  id: string
  reason?: string
}

export interface FlowAlertNode {
  type: 'alert'
  id: string
  message: string
  alertType: 'info' | 'warning' | 'error'
  next?: FlowNode
}

export interface FlowStoreNode {
  type: 'store'
  id: string
  variable: string
  value: FlowValue
  next?: FlowNode
}

export type FlowValue =
  | { type: 'literal'; value: number | string | boolean }
  | { type: 'variable'; name: string }
  | { type: 'expression'; expression: string } // "($BONUS * 5)"
  | { type: 'query'; query: string } // "my_balance_on_chumba"

export interface FlowVariable {
  name: string
  type: 'number' | 'string' | 'boolean' | 'platform' | 'game'
  value?: unknown
  source?: 'user_input' | 'action_result' | 'system_query' | 'literal'
}

export interface ResponsiblePlayGuardrail {
  type: 'max_duration' | 'max_loss' | 'balance_floor' | 'max_iterations' | 'chase_detection' | 'cool_down_check' | 'daily_aggregate'
  value: number | boolean
  source: 'user_specified' | 'system_default' | 'system_mandatory'
  overridable: boolean
}

export interface FlowExecutionMetrics {
  totalDuration: number
  actionsExecuted: number
  conditionsEvaluated: number
  loopIterations: number
  platformsAccessed: string[]
  bonusesClaimed: number
  bonusValueClaimed: number
  spinsExecuted: number
  totalWagered: number
  totalWon: number
  netResult: number
  guardrailsTriggered: string[]
}

export interface FlowExecutionLog {
  timestamp: Date
  nodeId: string
  type: 'action_start' | 'action_complete' | 'action_failed' | 'condition_evaluated' | 'loop_iteration' | 'variable_set' | 'guardrail_triggered' | 'user_alert' | 'error'
  details: Record<string, unknown>
}

export interface FlowInterpretationRequest {
  userId: string
  rawInput: string
  conversationHistory?: ConversationMessage[]
  existingFlows?: FlowDefinition[]
}

export interface FlowInterpretationResult {
  flow: FlowDefinition
  confidence: number // 0-1
  humanReadableSummary: string
  ambiguities?: Ambiguity[]
  warnings?: FlowWarning[]
  suggestedImprovements?: string[]
}

export interface ConversationState {
  userId: string
  sessionId: string
  currentFlow: Partial<FlowDefinition>
  turns: ConversationTurn[]
  pendingQuestions: string[]
  status: 'building' | 'confirming' | 'modifying' | 'complete'
}

export interface ConversationTurn {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  flowState?: Partial<FlowDefinition>
}
```

**2. `/packages/flows/src/interpreter/entities.ts` - Entity Recognition**

Recognizes domain entities from natural language (platforms, games, actions, conditions, temporal):

```typescript
export class EntityRecognizer {
  // Maps raw text to domain entities
  extractPlatforms(text: string): PlatformEntity[]
  extractGames(text: string): GameEntity[]
  extractActions(text: string): ActionEntity[]
  extractConditions(text: string): ConditionEntity[]
  extractSchedules(text: string): ScheduleEntity[]
  extractAmounts(text: string): AmountEntity[]
  extractDurations(text: string): DurationEntity[]

  // Returns the complete entity map
  recognize(text: string): EntityMap
}

export interface EntityMap {
  platforms: PlatformEntity[]
  games: GameEntity[]
  actions: ActionEntity[]
  conditions: ConditionEntity[]
  schedules: ScheduleEntity[]
  amounts: AmountEntity[]
  durations: DurationEntity[]
  variables: VariableEntity[]
}

export interface PlatformEntity {
  name: string
  normalized: string // 'chumba', 'luckyland', etc.
  confidence: number
  aliases: string[] // ['CC', 'Chumba', 'chumba casino']
}

export interface GameEntity {
  name: string
  normalized: string // game slug
  confidence: number
  provider?: string
}

export interface ActionEntity {
  text: string
  type: 'open' | 'login' | 'claim_bonus' | 'spin' | 'bet' | 'cash_out' | 'check_balance' | 'close'
  parameters?: Record<string, unknown>
}

export interface ConditionEntity {
  text: string
  type: 'comparison' | 'boolean' | 'expression'
  left?: string
  operator?: string
  right?: string
}

export interface ScheduleEntity {
  text: string
  cron: string // "0 15 * * *" for 3:30 PM daily
  timezone: string
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'custom'
}

export interface AmountEntity {
  text: string
  type: 'absolute' | 'relative'
  value?: number
  reference?: string // 'the_bonus', 'my_balance'
  multiplier?: number
}

export interface DurationEntity {
  text: string
  type: 'time' | 'iteration'
  value: number
  unit: 'minutes' | 'hours' | 'spins' | 'sessions'
}

export interface VariableEntity {
  name: string
  source: 'action_result' | 'user_input' | 'system_query'
  type: 'number' | 'string' | 'boolean'
}
```

**Key Patterns:**
- Rule-based matching (70-80% coverage) using keywords, regex, fuzzy matching
- Fallback to LLM for ambiguous cases (confidence < 0.7)
- User correction feedback loop (store corrections globally and per-user)
- Fuzzy matching with levenshtein distance for platform/game names

**3. `/packages/flows/src/interpreter/interpreter.ts` - Main Interpreter**

```typescript
export class FlowInterpreter {
  constructor(private llmClient?: LLMClient) {}

  async interpret(request: FlowInterpretationRequest): Promise<FlowInterpretationResult> {
    // Pass 1: Entity Extraction
    const entities = this.entityRecognizer.recognize(request.rawInput)

    // Pass 2: Intent Classification
    const intent = this.classifyIntent(request.rawInput, entities)

    // Pass 3: Logic Structuring - build the AST
    const flowNode = this.buildFlowAST(entities, intent, request.rawInput)

    // Pass 4: Responsible Play Validation
    const guardrails = this.rpValidator.validate(flowNode, request.userId)

    // Confidence check - if low, use LLM
    let confidence = this.calculateConfidence(entities, intent)
    if (confidence < 0.7 && this.llmClient) {
      return await this.llmClient.interpretFlow(request, entities, intent)
    }

    // Build Flow Definition
    const flow: FlowDefinition = {
      id: generateId(),
      userId: request.userId,
      name: this.generateFlowName(entities),
      description: request.rawInput,
      version: 1,
      status: 'draft',
      trigger: this.extractTrigger(entities.schedules),
      rootNode: flowNode,
      variables: entities.variables,
      responsiblePlayGuardrails: guardrails,
      createdAt: new Date(),
      updatedAt: new Date(),
      executionCount: 0,
      performanceStats: {},
    }

    return {
      flow,
      confidence,
      humanReadableSummary: this.generateSummary(flow),
      warnings: this.generateWarnings(flow, request.userId),
    }
  }

  private buildFlowAST(entities: EntityMap, intent: string, rawText: string): FlowNode {
    // Multi-pass AST building
    // 1. Extract main action sequence
    // 2. Inject conditions
    // 3. Add loops
    // 4. Wrap with error handling
    // Returns the root node of the AST tree
  }

  private generateSummary(flow: FlowDefinition): string {
    // Human-readable text summary with emoji bullets
    // "⏰ Trigger: Daily at 3:30 PM\n🌐 Open Chumba Casino\n🎁 Claim daily bonus..."
  }

  private generateWarnings(flow: FlowDefinition, userId: string): FlowWarning[] {
    // Check for common issues:
    // - Chase detection (if lose, double bet)
    // - Long sessions (>2 hours)
    // - High loss limits
    // - Complex conditions that might fail
    // - Platform-specific limitations
  }
}

export interface FlowWarning {
  type: 'responsible_play' | 'platform_limitation' | 'logic_error' | 'performance'
  severity: 'info' | 'warning' | 'error'
  message: string
  suggestion?: string
}
```

**4. `/packages/flows/src/validator/responsible-play-validator.ts` - Guardrail Enforcement**

CRITICAL: Every Flow MUST pass responsible play validation before activation.

```typescript
export class ResponsiblePlayValidator {
  validate(flowNode: FlowNode, userId: string): ResponsiblePlayGuardrail[] {
    const guardrails: ResponsiblePlayGuardrail[] = []

    // 1. MAX SESSION DURATION
    // Default: 2 hours if not specified
    const sessionDuration = this.extractMaxDuration(flowNode)
    if (!sessionDuration) {
      guardrails.push({
        type: 'max_duration',
        value: 2 * 60 * 60 * 1000, // 2 hours in ms
        source: 'system_default',
        overridable: true,
      })
    }

    // 2. MAX LOSS LIMIT
    // User MUST specify or we reject the flow
    const maxLoss = this.extractMaxLoss(flowNode)
    if (!maxLoss) {
      throw new FlowValidationError('MISSING_LOSS_LIMIT', 'Flow must specify a max loss limit')
    }

    // 3. CHASE DETECTION
    if (this.detectChasePattern(flowNode)) {
      guardrails.push({
        type: 'chase_detection',
        value: true,
        source: 'system_mandatory',
        overridable: false,
      })
    }

    // 4. INFINITE LOOP PROTECTION
    // Every loop must have maxIterations and maxDuration
    this.validateLoops(flowNode, guardrails)

    // 5. BALANCE FLOOR
    // User's existing cool-down setting
    const userSettings = await this.userService.getSettings(userId)
    if (userSettings.balanceFloor) {
      guardrails.push({
        type: 'balance_floor',
        value: userSettings.balanceFloor,
        source: 'user_specified',
        overridable: false,
      })
    }

    // 6. DAILY AGGREGATE LIMITS
    // Check user's subscription tier limits
    guardrails.push(...this.getSubscriptionLimits(userId))

    // 7. COOL-DOWN ENFORCEMENT
    const hasCoolDown = await this.userService.hasActiveCoolDown(userId)
    if (hasCoolDown) {
      guardrails.push({
        type: 'cool_down_check',
        value: true,
        source: 'system_mandatory',
        overridable: false,
      })
    }

    return guardrails
  }

  private detectChasePattern(node: FlowNode): boolean {
    // Recursively check for patterns like:
    // "IF lose THEN double bet" or "IF lose THEN continue spinning"
    // These are chase patterns and require explicit user acknowledgment
  }

  private validateLoops(node: FlowNode, guardrails: ResponsiblePlayGuardrail[]): void {
    // Every loop node must have:
    // - maxIterations (e.g., max 100 spins)
    // - maxDuration (e.g., max 30 minutes)
    // Both are non-negotiable
  }

  private getSubscriptionLimits(userId: string): ResponsiblePlayGuardrail[] {
    // Based on user's subscription tier:
    // free: 1 active flow, max 1 hour/day
    // starter: 3 active flows, max 2 hours/day
    // pro: 10 active flows, max 4 hours/day
    // elite/analyst: unlimited
  }
}

export class FlowValidationError extends Error {
  constructor(public code: string, message: string) {
    super(message)
  }
}
```

**5. `/packages/flows/src/executor/executor.ts` - Runtime Engine**

```typescript
export class FlowExecutor {
  async execute(flowId: string, userId: string, context?: Record<string, unknown>): Promise<FlowExecutionResult> {
    // Load flow definition from DB
    const flow = await this.flowRepository.getFlow(flowId, userId)

    // Check responsible play status
    const rpStatus = await this.responsiblePlayService.checkStatus(userId)
    if (rpStatus.blockedUntil) {
      throw new ResponsiblePlayBlockedError(`Blocked until ${rpStatus.blockedUntil}`)
    }

    // Create execution context
    const executionContext: FlowExecutionContext = {
      flowId,
      executionId: generateId(),
      userId,
      variables: new Map(context || {}),
      startedAt: new Date(),
      currentNode: flow.rootNode.id,
      status: 'running',
      log: [],
      metrics: { /* ... */ },
    }

    try {
      // Execute the flow AST recursively
      await this.executeNode(flow.rootNode, executionContext, flow)
      executionContext.status = 'completed'
    } catch (error) {
      if (error instanceof ResponsiblePlayBlockedError) {
        executionContext.status = 'stopped_by_guardrail'
      } else {
        executionContext.status = 'failed'
        executionContext.metrics.errorDetails = error.message
      }
    }

    // Log execution to DB
    await this.flowRepository.logExecution(executionContext)

    // Feed session data back into analytics
    await this.analyticsService.ingestFlowExecution(executionContext)

    // Send real-time status updates to user if online
    this.notificationService.sendFlowUpdate(userId, executionContext)

    return this.buildExecutionResult(executionContext)
  }

  private async executeNode(node: FlowNode, ctx: FlowExecutionContext, flow: FlowDefinition): Promise<void> {
    ctx.currentNode = node.id

    switch (node.type) {
      case 'action':
        return await this.executeAction(node as FlowActionNode, ctx)
      case 'condition':
        return await this.executeCondition(node as FlowConditionNode, ctx, flow)
      case 'loop':
        return await this.executeLoop(node as FlowLoopNode, ctx, flow)
      case 'sequence':
        return await this.executeSequence(node as FlowSequenceNode, ctx, flow)
      case 'stop':
        return await this.executeStop(node as FlowStopNode, ctx)
      case 'alert':
        return await this.executeAlert(node as FlowAlertNode, ctx, flow)
      case 'store':
        return await this.executeStore(node as FlowStoreNode, ctx, flow)
    }
  }

  private async executeAction(node: FlowActionNode, ctx: FlowExecutionContext): Promise<void> {
    // Log action start
    ctx.log.push({
      timestamp: new Date(),
      nodeId: node.id,
      type: 'action_start',
      details: { action: node.action, platform: node.platform, parameters: node.parameters },
    })

    try {
      // Map action to automation engine
      const actionHandler = this.getActionHandler(node.action)
      const result = await actionHandler(node.parameters, ctx)

      // Store result in variables if named
      if (node.parameters.storeAs) {
        ctx.variables.set(node.parameters.storeAs, result)
        ctx.log.push({
          timestamp: new Date(),
          nodeId: node.id,
          type: 'variable_set',
          details: { variable: node.parameters.storeAs, value: result },
        })
      }

      // Log success
      ctx.log.push({
        timestamp: new Date(),
        nodeId: node.id,
        type: 'action_complete',
        details: result,
      })

      // Execute next node
      if (node.next) {
        await this.executeNode(node.next, ctx, /* flow */)
      }
    } catch (error) {
      ctx.log.push({
        timestamp: new Date(),
        nodeId: node.id,
        type: 'action_failed',
        details: { error: error.message },
      })

      // Handle failure per node configuration
      if (node.onFailure === 'skip') {
        // Continue to next node
        if (node.next) {
          await this.executeNode(node.next, ctx, /* flow */)
        }
      } else if (node.onFailure === 'retry') {
        // Retry up to 3 times
        // (implementation omitted for brevity)
      } else if (node.onFailure === 'stop') {
        throw error
      } else if (typeof node.onFailure === 'object') {
        // Execute fallback node
        await this.executeNode(node.onFailure, ctx, /* flow */)
      }
    }
  }

  private async executeCondition(node: FlowConditionNode, ctx: FlowExecutionContext, flow: FlowDefinition): Promise<void> {
    const left = await this.evaluateValue(node.left, ctx)
    const right = await this.evaluateValue(node.right, ctx)

    const conditionMet = this.evaluateOperator(node.operator, left, right)

    ctx.log.push({
      timestamp: new Date(),
      nodeId: node.id,
      type: 'condition_evaluated',
      details: { left, operator: node.operator, right, result: conditionMet },
    })

    const nextNode = conditionMet ? node.onTrue : node.onFalse
    if (nextNode) {
      await this.executeNode(nextNode, ctx, flow)
    }
  }

  private async executeLoop(node: FlowLoopNode, ctx: FlowExecutionContext, flow: FlowDefinition): Promise<void> {
    const loopStartTime = Date.now()
    let iterationCount = 0

    while (iterationCount < node.maxIterations && (Date.now() - loopStartTime) < node.maxDuration) {
      // Check responsible play before each iteration
      const rpStatus = await this.responsiblePlayService.checkStatus(ctx.userId)
      if (rpStatus.blockedUntil) {
        throw new ResponsiblePlayBlockedError()
      }

      // Evaluate condition
      const left = await this.evaluateValue(node.condition.left, ctx)
      const right = await this.evaluateValue(node.condition.right, ctx)
      const conditionMet = this.evaluateOperator(node.condition.operator, left, right)

      if (!conditionMet) break

      // Execute loop body
      await this.executeNode(node.body, ctx, flow)
      iterationCount++

      ctx.log.push({
        timestamp: new Date(),
        nodeId: node.id,
        type: 'loop_iteration',
        details: { iteration: iterationCount, conditionMet },
      })
    }

    // Log if we hit the cap
    if (iterationCount >= node.maxIterations || (Date.now() - loopStartTime) >= node.maxDuration) {
      ctx.log.push({
        timestamp: new Date(),
        nodeId: node.id,
        type: 'guardrail_triggered',
        details: { guardrail: 'max_iterations', iteration: iterationCount },
      })
    }
  }

  private async evaluateValue(value: FlowValue, ctx: FlowExecutionContext): Promise<unknown> {
    if (value.type === 'literal') return value.value
    if (value.type === 'variable') return ctx.variables.get(value.name)
    if (value.type === 'expression') return this.evaluateExpression(value.expression, ctx)
    if (value.type === 'query') return await this.executeQuery(value.query, ctx)
  }

  private getActionHandler(action: string): (params: Record<string, unknown>, ctx: FlowExecutionContext) => Promise<unknown> {
    // Map action names to handlers in the automation engine
    // Actions: open_platform, login, claim_bonus, spin, bet, check_balance, close_platform, etc.
    // Each handler calls the extension or backend service to perform the action
  }
}

export interface FlowExecutionContext {
  flowId: string
  executionId: string
  userId: string
  variables: Map<string, unknown>
  startedAt: Date
  currentNode: string
  status: 'running' | 'paused' | 'completed' | 'failed' | 'stopped_by_guardrail'
  log: FlowExecutionLog[]
  metrics: FlowExecutionMetrics
}
```

**6. `/packages/flows/src/scheduler/scheduler.ts` - Cron Scheduling**

```typescript
export class FlowScheduler {
  private jobs = new Map<string, CronJob>()

  async activateFlow(flow: FlowDefinition, userId: string): Promise<void> {
    if (flow.trigger.type !== 'scheduled') return

    const { cron, timezone } = flow.trigger

    // Create cron job
    const job = new CronJob(cron, async () => {
      try {
        await this.flowExecutor.execute(flow.id, userId)
      } catch (error) {
        this.logger.error(`Flow ${flow.id} execution failed:`, error)
        // Send error alert to user
        await this.notificationService.sendError(userId, {
          title: 'Flow Execution Failed',
          message: `Your flow "${flow.name}" failed to execute: ${error.message}`,
        })
      }
    }, null, true, timezone)

    this.jobs.set(flow.id, job)
    this.logger.info(`Flow ${flow.id} scheduled: ${cron} in ${timezone}`)
  }

  async pauseFlow(flowId: string): Promise<void> {
    const job = this.jobs.get(flowId)
    if (job) {
      job.stop()
      this.jobs.delete(flowId)
    }
  }

  async resumeFlow(flow: FlowDefinition, userId: string): Promise<void> {
    await this.pauseFlow(flow.id)
    await this.activateFlow(flow, userId)
  }

  // On startup, reactivate all active user flows
  async reactivateAllFlows(): Promise<void> {
    const activeFlows = await this.flowRepository.getAllActive()
    for (const flow of activeFlows) {
      await this.activateFlow(flow, flow.userId)
    }
  }
}
```

**7. `/packages/flows/src/conversation/conversation-manager.ts` - Multi-Turn Builder**

```typescript
export class ConversationManager {
  async continue(conversationId: string, userMessage: string): Promise<ConversationState> {
    // Load conversation state
    const state = await this.conversationRepository.getState(conversationId)

    // Add user message
    state.turns.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    })

    // Interpret new message in context of existing flow
    const updateResult = await this.interpretUpdate(state, userMessage)

    // Update current flow
    state.currentFlow = updateResult.updatedFlow
    state.pendingQuestions = updateResult.pendingQuestions

    // Determine next action
    if (state.pendingQuestions.length > 0) {
      // Still need more info
      const botMessage = `Got it. ${state.pendingQuestions[0]}`
      state.turns.push({
        role: 'assistant',
        content: botMessage,
        timestamp: new Date(),
      })
    } else if (updateResult.requiresConfirmation) {
      // Ready to confirm
      const summary = this.generateSummary(state.currentFlow)
      state.turns.push({
        role: 'assistant',
        content: `Here's your Flow:\n\n${summary}\n\nActivate?`,
        timestamp: new Date(),
      })
      state.status = 'confirming'
    } else {
      state.status = 'complete'
    }

    // Save state
    await this.conversationRepository.setState(state)

    return state
  }

  async confirm(conversationId: string): Promise<FlowDefinition> {
    // User said "yes" - create the flow
    const state = await this.conversationRepository.getState(conversationId)
    const flow = state.currentFlow as FlowDefinition

    // Save to DB
    const saved = await this.flowRepository.create(flow)

    // Clean up conversation
    await this.conversationRepository.delete(conversationId)

    return saved
  }

  private async interpretUpdate(state: ConversationState, userMessage: string): Promise<UpdateResult> {
    // Determine what the user is updating
    // "Change the time to 8 AM" → update trigger
    // "Also do Chumba first" → reorder actions
    // "Add a limit of $100 loss" → add guardrail
    // Fuzzy match against current flow structure
  }

  private generateSummary(flow: Partial<FlowDefinition>): string {
    // Generate the structured confirmation card
    // "⏰ Trigger: Daily at 3:30 PM\n🌐 Open Chumba..."
  }
}

export interface UpdateResult {
  updatedFlow: Partial<FlowDefinition>
  pendingQuestions: string[]
  requiresConfirmation: boolean
}
```

#### 3. API Endpoints (`/apps/api/src/routes/flows.ts` - NEW FILE)

Fastify routes following existing patterns:

```typescript
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function registerFlowRoutes(app: FastifyInstance) {
  // POST /api/v1/flows/interpret
  // Takes raw natural language, returns FlowInterpretationResult
  app.post('/flows/interpret', {
    schema: {
      body: z.object({
        rawInput: z.string().min(10).max(2000),
      }),
    },
    preValidation: [requireAuth],
  }, async (request, reply) => {
    const result = await flowInterpreter.interpret({
      userId: request.user!.id,
      rawInput: request.body.rawInput,
    })
    return reply.send({ success: true, data: result })
  })

  // POST /api/v1/flows/converse
  // Continues multi-turn Flow building conversation
  app.post('/flows/converse', {
    schema: {
      body: z.object({
        conversationId: z.string().uuid(),
        userMessage: z.string().min(1).max(1000),
      }),
    },
    preValidation: [requireAuth],
  }, async (request, reply) => {
    const state = await conversationManager.continue(
      request.body.conversationId,
      request.body.userMessage
    )
    return reply.send({ success: true, data: state })
  })

  // POST /api/v1/flows
  // Create/save a Flow from a confirmed FlowDefinition
  app.post('/flows', {
    schema: {
      body: z.object({
        name: z.string(),
        description: z.string(),
        definition: z.record(z.unknown()),
        trigger: z.record(z.unknown()),
        guardra ils: z.array(z.record(z.unknown())),
      }),
    },
    preValidation: [requireAuth],
  }, async (request, reply) => {
    const flow = await flowService.create(request.user!.id, request.body)
    return reply.code(201).send({ success: true, data: flow })
  })

  // PATCH /api/v1/flows/:id
  // Update a Flow (status, definition, guardrails, etc.)
  app.patch('/flows/:id', {
    schema: {
      params: z.object({ id: z.string().uuid() }),
      body: z.object({
        status: z.enum(['draft', 'active', 'paused', 'archived']).optional(),
        name: z.string().optional(),
        definition: z.record(z.unknown()).optional(),
      }),
    },
    preValidation: [requireAuth],
  }, async (request, reply) => {
    const flow = await flowService.update(request.user!.id, request.params.id, request.body)
    return reply.send({ success: true, data: flow })
  })

  // POST /api/v1/flows/:id/execute
  // Manually trigger a Flow execution
  app.post('/flows/:id/execute', {
    schema: { params: z.object({ id: z.string().uuid() }) },
    preValidation: [requireAuth],
  }, async (request, reply) => {
    const execution = await flowService.executeFlow(request.user!.id, request.params.id)
    return reply.code(202).send({ success: true, data: execution })
  })

  // GET /api/v1/flows/:id/executions
  // Get execution history for a Flow
  app.get('/flows/:id/executions', {
    schema: {
      params: z.object({ id: z.string().uuid() }),
      querystring: z.object({
        page: z.coerce.number().int().positive().default(1),
        pageSize: z.coerce.number().int().min(1).max(100).default(20),
      }),
    },
    preValidation: [requireAuth],
  }, async (request, reply) => {
    const executions = await flowService.getExecutions(request.user!.id, request.params.id, request.query)
    return reply.send({ success: true, data: executions, meta: { /* ... */ } })
  })

  // Additional endpoints...
  // GET /flows, POST /flows/:id/share, GET /flows/marketplace, etc.
}
```

#### 4. Frontend Components (`/apps/web/src/pages/FlowsPage.tsx` - NEW)

Key pages to create:

1. **FlowsPage.tsx** - Dashboard of user's Flows
   - List all user flows with status badges
   - Filter: active/draft/paused/archived
   - Actions: Edit, Activate, Pause, Delete
   - Link to create new Flow

2. **FlowChat.tsx** - The conversational builder (chat interface)
   - Text input for initial Flow description
   - Chat history showing bot suggestions + user refines
   - Structured confirmation card before activation
   - Multi-turn refinement support

3. **FlowDetail.tsx** - Single Flow view
   - Show full definition as readable text
   - Execution history with timeline
   - Performance stats over time
   - Edit/pause/delete/share options

4. **FlowExecutionView.tsx** - Detailed execution log viewer
   - Step-by-step log of every action, condition, loop
   - Timeline visualization
   - Error details if failed
   - Metrics: duration, actions, spins, wagered, won, RTP

5. **FlowMarketplace.tsx** - Browse/search/import shared Flows
   - Search and filter Flows
   - View ratings, # of imports, average performance
   - "Import" button to copy into user's account
   - Free vs paid Flows

**Component Patterns:**
- Use `useQuery()` from TanStack Query for data fetching
- Use Zustand auth store for user context
- Use TypeScript interfaces from `@sweepbot/types/flows`
- Follow existing Radix UI + Tailwind styling patterns

### Implementation Sequence (Phase 1)

**Week 1: Core Infrastructure**
1. Create `/packages/flows/` monorepo package structure
2. Define all TypeScript types in `/packages/flows/src/types.ts`
3. Create database schema in `/apps/api/src/db/schema/flows.ts` using Drizzle
4. Create Drizzle migration and apply to database
5. Set up Zod schemas for validation

**Week 2: NLP Interpreter**
1. Implement EntityRecognizer with rule-based matching (70-80%)
2. Implement FlowInterpreter main service
3. Implement ResponsiblePlayValidator
4. Add LLM fallback integration (Claude API)

**Week 3: Executor & Scheduler**
1. Implement FlowExecutor (runtime engine)
2. Implement FlowScheduler (cron-based triggering)
3. Create action handlers that bridge to automation engine

**Week 4: Conversation & Marketplace**
1. Implement ConversationManager for multi-turn building
2. Set up Flow sharing/marketplace infrastructure
3. Create all API endpoints in `/apps/api/src/routes/flows.ts`

**Week 5: Frontend**
1. Create React pages: FlowsPage, FlowChat, FlowDetail, etc.
2. Add routes to TanStack Router
3. Style with Radix UI + Tailwind
4. Integration testing

**Week 6: Polish & Testing**
1. End-to-end testing
2. Edge case handling
3. Performance optimization
4. Documentation

---

## PHASE 2-6: TOP 25 FEATURES

**Will be scoped in Phase 2 after Phase 1 completion.**

Each feature follows similar patterns:
- Add database table(s) using Drizzle
- Add API endpoint(s) in Fastify
- Add React page/component in frontend
- Integration with existing analytics engine

**High Priority (do after Flows):**
- Feature 7: Win/Loss Heatmaps (viral marketing)
- Feature 10: Verified Big Win Board (data moat)
- Feature 12: Achievement System (stickiness)
- Feature 25: Personal Records Tracker (viral screenshots)

---

## CRITICAL IMPLEMENTATION PRINCIPLES

1. **Production-Grade Code Only**
   - Full TypeScript types everywhere
   - Zod validation on ALL inputs
   - Error handling on every async operation
   - Database transactions where needed
   - Rate limiting on all endpoints
   - Input sanitization

2. **Responsible Play is Non-Negotiable**
   - Every automation feature passes through RP validation
   - Guardrails are mandatory, not optional
   - Chase detection, loss limits, session caps enforced
   - Cool-down checks before every Flow execution

3. **Data Moat First**
   - Every feature feeds data back into analytics
   - Execution logs stored in DB for auditability
   - User behavior patterns inform product decisions
   - Community data (benchmarks, trust signals) drives engagement

4. **Follow Existing Patterns**
   - Use raw SQL with Drizzle `sql` template literals (matches existing code)
   - Standard response format: `{ success: true, data: T }`
   - Error codes and validation patterns
   - TanStack Query for frontend data fetching
   - Zustand for client auth state

5. **Tier-Based Feature Gating**
   - Free: 1 active Flow, basic analytics
   - Pro: 10 active Flows, advanced analytics
   - Elite: Unlimited, Flow marketplace access

---

## VERIFICATION / TESTING

**Unit Tests:**
- EntityRecognizer: Test entity extraction for 20+ platform/game/action patterns
- FlowInterpreter: Test AST building for common user inputs
- ResponsiblePlayValidator: Test all guardrail types
- FlowExecutor: Mock automation engine and test execution flow

**Integration Tests:**
- End-to-end Flow creation: "natural language → API → interpreter → saved to DB → can execute"
- Multi-turn refinement: Build a Flow over 3-4 conversation turns
- Scheduler: Create a daily Flow, verify cron job is registered
- Execution: Execute a Flow, verify metrics are logged

**Manual Testing:**
- Create a simple Flow via chat
- Edit and refine via natural language
- Activate and watch it execute
- View execution history and metrics
- Test responsive play blocking scenarios

