---
name: atlas-code-sprint
description: Use during Atlas Module 1 — eliminates every technical blocker between current state and production-ready. Runs after onboarding confirmation, before legal. Scores blockers by impact/effort, fixes P0s first, generates RUNBOOK.md.
---

# Atlas Code Sprint

**Input:** Business Context + codebase
**Purpose:** Eliminate every technical blocker between current state and production-ready.

## Priority Scorecard

Before writing a single line of code, score every gap:

```
Priority Score = Impact (1-10) × (1 / Effort (1-10))
```

Execute in priority order — highest impact, lowest effort first.

**P0 (fix now — blocks production):**
- Broken routes returning 404/500 in production paths
- Missing DB tables referenced in application code
- Schema mismatches between code and actual DB
- Auth flows that don't complete
- Broken imports / missing dependencies in production paths
- Missing environment variable handling (app crashes on undefined)

**P1 (fix before launch):**
- Missing error handling on external API calls
- No rate limiting on public endpoints
- Missing input validation on user-facing forms
- Deployment config gaps (no Vercel/Railway config)
- Missing health check endpoint

**P2 (fix this sprint if time allows):**
- Test coverage below 40%
- No error monitoring (Sentry or equivalent)
- Missing API documentation

## Process

1. Run priority scorecard on all gaps found in onboarding
2. Fix all P0 blockers in order
3. Fix P1 blockers
4. Scaffold missing infrastructure config files:
   - `vercel.json` / `railway.toml` / `fly.toml` (whichever is missing)
   - `Dockerfile` if containerized deployment is planned
   - `.env.example` if not present or incomplete
   - Sentry config if not present
5. Generate API docs from route files → `docs/API.md`
6. Write `docs/founder/RUNBOOK.md`:
   - What each service does
   - What breaks and how to fix it
   - How to hand this to a contractor
   - All environment variables documented
   - Common failure modes with fixes
7. Recalculate runs-itself score

## Runs-Itself Score Contributions (Code Sprint)

| Factor | Max Points |
|--------|-----------|
| Zero P0 blockers | +20 |
| Deployment config present | +10 |
| Error monitoring (Sentry) | +5 |
| Health check endpoint | +5 |
| RUNBOOK.md written | +10 |
| API documented | +5 |

## Output

- Fixed, committed codebase
- `docs/founder/RUNBOOK.md`
- Updated `~/.atlas/portfolio/[slug]/context.json`
- Priority scorecard (shown at checkpoint)

## Checkpoint

```
─────────────────────────────────────────────────────
CODE SPRINT COMPLETE

Done:
  ✓ Fixed [N] P0 blockers across [N] files
  ✓ Fixed [N] P1 blockers
  ✓ Scaffolded [N] config files
  ✓ RUNBOOK.md written
  ✓ API docs generated

Runs-itself score: [X] → [Y]

Needs your action:
  → [e.g., "Add SENTRY_DSN to production env vars"]

Type 'continue' to proceed to Legal & Compliance
─────────────────────────────────────────────────────
```

## Red Flags

- ❌ Fixing P2 issues before P0s are resolved
- ❌ Stopping when code "looks good" without running the scorecard
- ❌ Writing RUNBOOK as an afterthought or skipping it
- ❌ Not scaffolding deployment config ("they can do that later")
- ❌ Leaving environment variables undocumented
