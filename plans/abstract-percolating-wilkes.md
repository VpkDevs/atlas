# Comprehensive Test & Data Protection Plan for SweepBot

**Goal**: Ensure critical data paths (sessions, payments, authentication, user flows) cannot be silently corrupted or lost.

**Timeline**: 6 weeks, structured in 3 phases

**Success Criteria**:
- ≥70% test coverage across API package
- 100% coverage of critical data paths (auth, payments, sessions, flows)
- All async operations tracked with error monitoring
- Zero silent failures in production

---

## PHASE 1: Test Infrastructure & Critical Path Coverage (Weeks 1-2)

### 1.1 Setup API Test Infrastructure
**Files to create**:
- `/apps/api/vitest.config.ts` - Test configuration (mirrors flows package setup)
- `/apps/api/src/__tests__/setup.ts` - Shared test utilities and mocks
- `/apps/api/src/__tests__/fixtures/` - Test data factories

**Mocks to implement**:
- `SuperbaseClientMock.ts` - Mock Supabase auth/database calls
- `StripeMock.ts` - Mock Stripe webhook events
- `DatabaseFixtures.ts` - Pre-built test user, subscription, flow data

**Example structure**:
```typescript
// /apps/api/src/__tests__/setup.ts
export const createTestUser = (overrides?: Partial<TestUser>) => ({
  id: 'user-test-001',
  email: 'test@example.com',
  tier: 'starter',
  ...overrides
})

export const mockSupabaseAuth = {
  getUser: vi.fn().mockResolvedValue({
    data: { user: createTestUser() }
  })
}

export const mockStripeWebhook = (eventType: string) => ({
  type: eventType,
  data: { object: { /* event data */ } }
})
```

### 1.2 Critical Path Test Suite: Authentication (`/apps/api/src/routes/auth.ts`)
**File to create**: `/apps/api/src/__tests__/routes/auth.test.ts`

**Test cases** (minimum 12 tests):
1. Signup with valid email → User created in DB
2. Signup with invalid email → Error returned, no user created
3. Login with valid credentials → JWT token returned
4. Login with invalid credentials → 401 error, no session created
5. Token expiration → 401 on protected routes
6. Token modification → JWT verification fails
7. Missing auth header → 401 on protected routes
8. Concurrent logins → Both sessions valid
9. Logout → Token invalidated
10. Password reset flow → Email verification required
11. Email verification → User confirmed in DB
12. Duplicate signup attempt → Error, no duplicate user created

**Risk protected**: User authentication corruption, unauthorized access, session leaks

### 1.3 Critical Path Test Suite: Payments (`/apps/api/src/routes/webhook.ts`)
**File to create**: `/apps/api/src/__tests__/routes/webhooks.test.ts`

**Test cases** (minimum 15 tests):
1. `customer.subscription.created` → Subscription row inserted with correct Stripe ID
2. `customer.subscription.updated` → Subscription status updated atomically
3. `customer.subscription.deleted` → Subscription marked as canceled
4. `charge.succeeded` → Payment recorded in transactions table
5. `charge.failed` → User notified, no credit given
6. Invalid webhook signature → 401, event ignored
7. Duplicate webhook delivery → Idempotent (no duplicate payment)
8. Webhook timeout → Stripe retry logic activated
9. Customer mismatch → Event rejected (user owns subscription)
10. Concurrent subscription updates → Last update wins (no race conditions)
11. Webhook with missing fields → Validation fails, DB unchanged
12. Subscription downgrade → Flow execution limits enforced
13. Trial expiration → Status updated in DB
14. Payment method update → Stripe ID persisted
15. Webhook delivery on server restart → Events replayed from Stripe

**Risk protected**: Payment processing corruption, duplicate charges, unauthorized subscription changes

### 1.4 Critical Path Test Suite: Sessions & Data (`/apps/api/src/routes/flows.ts`, `jackpot.ts`, `analytics.ts`)
**File to create**: `/apps/api/src/__tests__/routes/flows.test.ts`

**Test cases** (minimum 18 tests):
1. Create flow with valid definition → Flow stored in DB with correct structure
2. Create flow with invalid definition → Validation error, no flow created
3. Execute flow → flowExecutions row created, status = 'running'
4. Flow execution completes → Status updated to 'completed', metrics persisted
5. Flow execution fails → Status = 'failed', error logged, user notified
6. Flow execution timeout → Graceful termination, partial metrics saved
7. Concurrent flow executions → Both tracked independently, metrics separate
8. Delete flow → flowExecutions history preserved, flow marked deleted
9. Query flow metrics → Returns accurate data for user's timezone
10. Update guardrails → Values persisted without race conditions
11. Flow with missing DB reference → Transaction rolled back, no partial state
12. Flow with invalid platform trigger → Validation catches before execution
13. Retrieve session history → Data returned in correct order, complete records
14. Session history pagination → Correct pages returned, no duplicates
15. Session data filtering → Filter applied server-side, accurate results
16. Export session data → All records included, no truncation
17. Concurrent reads of same session → Both get consistent data
18. Transaction rollback on error → No partial session data persists

**Risk protected**: Flow definition corruption, execution data loss, metrics inaccuracy, race conditions

---

## PHASE 2: Error Handling & Monitoring (Weeks 3-4)

### 2.1 Implement Sentry Error Tracking
**Files to modify**:
- `/apps/api/src/server.ts` - Initialize Sentry on server start
- `/apps/api/src/utils/env.ts` - Add Sentry configuration validation

**Implementation**:
```typescript
// /apps/api/src/server.ts - Add at top of file
import * as Sentry from "@sentry/node"

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
    beforeSend(event) {
      // Strip PII before sending
      if (event.request) {
        delete event.request.cookies
        delete event.request.headers['authorization']
      }
      return event
    }
  })
}

// Add Sentry error handler before other handlers
server.register(async (server) => {
  server.setErrorHandler((error, request, reply) => {
    Sentry.captureException(error, {
      tags: { route: request.url, method: request.method },
      user: { id: request.user?.id }
    })
    // ... existing error handling
  })
})
```

**Test cases** (5 tests):
1. Unhandled error captured and sent to Sentry
2. PII fields stripped from error context
3. Error context includes route, method, user ID
4. Errors in different routes tagged correctly
5. Production errors don't include stack traces in response

### 2.2 Enhance Error Logging (No PII Leakage)
**Files to modify**:
- `/apps/api/src/routes/*.ts` - All route files
- `/apps/api/src/middleware/auth.ts` - Auth middleware

**Pattern**:
```typescript
// ❌ BAD - Logs sensitive user data
logger.error({ user: request.user }, 'Auth failed')  // Exposes user ID & email

// ✅ GOOD - Logs safe identifiers
logger.error({ userId: maskId(request.user.id), route: request.url }, 'Auth failed')

// ✅ GOOD - Logs error without sensitive data
logger.error({ errorCode: error.code, statusCode: error.statusCode }, 'Route error')
```

**Test cases** (8 tests):
1. Error logs exclude user.id
2. Error logs exclude user.email
3. Error logs exclude JWT tokens
4. Error logs exclude credit card numbers
5. Error logs exclude Stripe secrets
6. Sensitive data in errors is masked
7. Error rate limiting prevents log spam
8. Production errors are rate-limited

### 2.3 Async Operation Tracking
**Files to modify**:
- `/apps/api/src/routes/flows.ts` - Flow execution (lines 370-437)
- `/apps/api/src/routes/webhooks.ts` - Async webhook processing
- `/apps/api/src/routes/user.ts` - Email sending async

**Pattern for flow execution**:
```typescript
// ❌ BAD - Silent failures
server.post('/flows/:id/execute', async (request, reply) => {
  const flow = await getFlow(id)
  executeFlowAsync(flow).then(...).catch(err => logger.error(err))  // ⚠️ Silent
  return { status: 'executing' }
})

// ✅ GOOD - Tracked execution with error visibility
server.post('/flows/:id/execute', async (request, reply) => {
  const flow = await getFlow(id)

  const execution = await db.flowExecutions.create({
    flowId: flow.id,
    status: 'running',
    startedAt: new Date(),
    userId: request.user.id
  })

  executeFlowAsync(flow, execution.id)
    .then(result => {
      db.flowExecutions.update(execution.id, {
        status: 'completed',
        metrics: result,
        endedAt: new Date()
      })
    })
    .catch(error => {
      db.flowExecutions.update(execution.id, {
        status: 'failed',
        errorDetails: error.message,
        endedAt: new Date()
      })
      Sentry.captureException(error)
      notifyUser(request.user.id, `Flow failed: ${error.message}`)
    })

  return { executionId: execution.id, status: 'queued' }
})
```

**Test cases** (6 tests):
1. Async operation tracked in DB before execution
2. Success updates DB with metrics
3. Failure updates DB with error details
4. Sentry notified on failure
5. User notified on failure
6. Concurrent async operations don't interfere

---

## PHASE 3: Data Integrity & Integration Tests (Weeks 5-6)

### 3.1 Database Integrity Tests
**File to create**: `/apps/api/src/__tests__/db/integrity.test.ts`

**Test cases** (10 tests):
1. Foreign key constraint enforced (can't create flow without user)
2. Unique constraint enforced (can't create duplicate subscription for user)
3. Cascade delete works (deleting user removes flows & sessions)
4. Transaction rollback on error (partial inserts don't persist)
5. Database backup/restore consistency
6. Column data types enforced (can't store string in uuid column)
7. Timestamp defaults set correctly
8. JSON schema validation on JSONB columns
9. RLS policies: user can only access own data
10. No orphaned records after deletion

### 3.2 End-to-End Integration Tests
**File to create**: `/apps/api/src/__tests__/integration/e2e.test.ts`

**Test scenarios** (8 tests):
1. **Full Auth Flow**: Signup → Email verify → Login → Get JWT → Access protected route
2. **Full Payment Flow**: Create subscription → Stripe webhook → DB updated → Verify limits enforced
3. **Full Flow Execution**: Create flow → Execute → Monitor progress → Complete → Verify metrics
4. **Data Consistency**: Create session → Query analytics → Update guardrails → Verify all linked
5. **Error Recovery**: Start flow → Simulate API failure → Resume → Complete
6. **Concurrent Users**: 5 users create/execute flows simultaneously → All data correct
7. **Data Export**: Create multiple sessions → Export data → Verify completeness
8. **Rollback Safety**: Start transaction → Simulate crash → Verify no partial state

### 3.3 Performance & Load Tests
**File to create**: `/apps/api/src/__tests__/performance/load.test.ts`

**Test scenarios** (5 tests):
1. Analytics query with 10K sessions → Response time < 500ms
2. Flow execution with 20 concurrent users → All tracked correctly
3. Webhook processing with 50/sec spike → No dropped events
4. User pagination with 100K records → Consistent pagination
5. Memory doesn't leak under sustained load (1M operations)

---

## PHASE 4: Verification Checklist (End of Week 6)

### Pre-Launch Tests
```bash
# Run full test suite
pnpm test           # Must pass 100%

# Check coverage
pnpm test:coverage  # Must show ≥70% across all files

# Type check
pnpm typecheck      # Zero errors

# Lint
pnpm lint           # Zero warnings (--max-warnings 0)

# Manual verification
- [ ] Sentry errors visible in dashboard
- [ ] No PII in Sentry error reports
- [ ] Error logs don't contain secrets
- [ ] All async operations tracked in DB
- [ ] User notified of failed operations
- [ ] Database backups working
- [ ] Deployment can rollback safely
```

### Data Validation
```typescript
// Run data validation in production before going live
const dataIntegrityCheck = async () => {
  // Check for orphaned records
  const orphanedFlows = await db.query`
    SELECT f.id FROM flows f
    WHERE f.user_id NOT IN (SELECT id FROM profiles)
  `

  // Check for data type mismatches
  const invalidSessions = await db.query`
    SELECT * FROM sessions
    WHERE wager_amount IS NOT NULL AND NOT isnumeric(wager_amount)
  `

  // Verify foreign key integrity
  const missingReferences = await db.query`
    SELECT * FROM flow_executions
    WHERE flow_id NOT IN (SELECT id FROM flows)
  `

  return {
    orphanedFlows: orphanedFlows.length === 0,
    invalidSessions: invalidSessions.length === 0,
    missingReferences: missingReferences.length === 0
  }
}
```

---

## Implementation Order

1. **Week 1-2**: Test infrastructure + critical path tests (Auth, Payments, Sessions)
   - Create 40+ tests covering 100% of critical flows
   - Target: 65% coverage

2. **Week 3-4**: Error handling + Sentry + logging fixes
   - Instrument all routes with error tracking
   - Strip PII from logs
   - Target: 70% coverage

3. **Week 5-6**: Integration tests + data integrity + performance
   - Test real-world scenarios (concurrent users, API failures)
   - Database integrity verification
   - Load testing
   - Target: 75% coverage, 0 test failures

---

## Files to Create/Modify Summary

### New Test Files
- `/apps/api/vitest.config.ts`
- `/apps/api/src/__tests__/setup.ts`
- `/apps/api/src/__tests__/fixtures/index.ts`
- `/apps/api/src/__tests__/routes/auth.test.ts` (12 tests)
- `/apps/api/src/__tests__/routes/webhooks.test.ts` (15 tests)
- `/apps/api/src/__tests__/routes/flows.test.ts` (18 tests)
- `/apps/api/src/__tests__/db/integrity.test.ts` (10 tests)
- `/apps/api/src/__tests__/integration/e2e.test.ts` (8 tests)
- `/apps/api/src/__tests__/performance/load.test.ts` (5 tests)

### Files to Modify
- `/apps/api/src/server.ts` - Add Sentry initialization
- `/apps/api/src/utils/env.ts` - Validate Sentry DSN
- `/apps/api/src/routes/*.ts` (all 12 route files) - Add error tracking, fix logging
- `/apps/api/src/middleware/auth.ts` - Remove PII logging
- `/apps/api/package.json` - Add @sentry/node dependency

### Configuration
- `/apps/api/tsconfig.json` - Ensure strict mode enabled
- Add `.env.example` with SENTRY_DSN field

---

## Success Metrics

**After this plan is executed**:
- ✅ Zero silent async failures (all tracked in DB + Sentry)
- ✅ No PII in error logs or monitoring
- ✅ 70%+ test coverage with 100% critical path coverage
- ✅ Database integrity verified
- ✅ Performance baseline established
- ✅ Ready for 10K+ users without data loss risk
