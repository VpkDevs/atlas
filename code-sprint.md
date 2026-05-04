---
name: atlas-code-sprint
description: Use during Atlas Phase 2 — eliminates every technical blocker between current state and production-ready. Deploys automatically. Commits CI/CD. Pushes to remote. Self-heals on failures. Runs after onboarding confirmation, before legal. Contains its own acceptance gate — no forward progress without zero P0s and a live 200 response.
---

# Atlas Code Sprint — Phase 2

**Input:** Business Context + codebase + `credentials_index.json`
**Purpose:** Eliminate every technical blocker, deploy to production, wire up CI/CD — without writing a single guide.

---

## Mode Check (Before Starting)

```
Read Business Context:
  deployment_status: production AND completion_percentage ≥ 85
      → Code Audit Mode (EC-1). Skip P0/P1/P2 triage.
        Verify live URL → fill infrastructure gaps → re-deploy if needed.
        Do not use "fix P0 blockers" framing.
        
  Otherwise:
      → Standard Code Sprint — continue below.
```

---

## Step 1: Triage (Priority Scorecard)

Before writing a single line of code, score every gap:

```
Priority Score = Impact (1-10) × (1 / Effort (1-10))
```

Execute in priority order — highest impact, lowest effort first.

### P0 — Fix Now (Blocks Production)

| Issue | Detection Method |
|-------|-----------------|
| Broken routes returning 404/500 | `grep -r "router\|app\.get\|app\.post" + manual route walk` |
| Missing DB tables referenced in code | Compare schema with ORM models/queries |
| Schema mismatches (code vs DB) | Diff migration history against current models |
| Auth flows that don't complete | Trace login → callback → session → redirect |
| Broken imports / missing deps | `npm ls --all 2>&1 \| grep ERR` or `tsc --noEmit` |
| Crash on undefined env var | Grep `process.env.` without fallback/check |

### P1 — Fix Before Launch

- Missing error handling on external API calls
- No rate limiting on public endpoints
- Missing input validation on user-facing forms
- Deployment config gaps (no `vercel.json` / `railway.toml`)
- Missing health check endpoint
- No CI/CD pipeline

### P2 — Fix This Sprint If Time Allows

- Test coverage below 40%
- No error monitoring (Sentry or equivalent)
- Missing API documentation
- Performance issues (N+1 queries, missing indexes)

---

## Step 2: Fix P0s

Fix every P0 blocker. Commit after each fix:
```bash
git add -A && git commit -m "[Atlas] Fix: [specific P0 description]"
```

### Self-Healing During Fixes

When a fix introduces a new error:
```
1. Run the relevant test/check immediately after the fix
2. If new error detected → classify per Self-Healing Protocol
3. Fix the regression before moving to next P0
4. Log the fix chain in the commit message
```

### Zero Tolerance Rule

**Phase 2 does not exit with any P0 remaining.** If a P0 cannot be fixed:
1. Log to `~/.atlas/incidents/[date]-[slug]-p0.md` with full diagnosis
2. Attempt 3 different fix strategies (documented)
3. If all 3 fail: downgrade to P1 ONLY if the product can launch without this feature
4. Otherwise: mark phase as blocked and surface `userMust`

---

## Step 3: Fix P1s

Fix every P1 blocker. Commit after each group.

---

## Step 4: Scaffold Missing Infrastructure

### Deployment Config

Detect from `package.json` framework field or existing config:

| Detected | Config File | Template |
|----------|-------------|----------|
| Next.js | `vercel.json` | `{"framework": "nextjs"}` |
| Vite/React | `vercel.json` | `{"framework": "vite", "outputDirectory": "dist"}` |
| Express/Fastify | `railway.toml` or `Dockerfile` | Node runtime config |
| Python/Django | `Dockerfile` | Python + gunicorn |
| Static site | `vercel.json` | `{"outputDirectory": "public"}` |

### `.env.example` Generation

```bash
# Scan all source files for env var references
grep -rn "process\.env\.\|os\.environ\|ENV\[" src/ app/ --include="*.ts" --include="*.js" --include="*.py"
```

Generate `.env.example` with every variable documented:
```
# Stripe — Payment processing (https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend — Email service (https://resend.com/api-keys)
RESEND_API_KEY=re_...
```

### Sentry Config

If `SENTRY_DSN` in `.env.example` or `.env`:
- Commit `sentry.client.config.ts` with DSN interpolated
- Commit `sentry.server.config.ts`
- Add error boundary component if React frontend detected

### Health Check Endpoint

If missing, add `GET /health`:
```typescript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: process.env.npm_package_version });
});
```

---

## Step 5: GitHub Actions CI/CD

**Always commit `.github/workflows/deploy.yml`** — Atlas creates it, not suggests it:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build --if-present
      - run: npm test --if-present
      - name: Deploy to Vercel
        if: ${{ hashFiles('vercel.json') != '' }}
        run: npx vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

Also commit `.github/workflows/ci.yml` for PRs (lint + test on every pull request).

---

## Step 6: Generate API Docs

Scan all route files → generate `docs/API.md`:
- Every endpoint: method, path, params, response shape, auth requirements
- Generated from actual route files, not from memory

---

## Step 7: Write RUNBOOK.md

`docs/founder/RUNBOOK.md` — what a stranger needs to operate this product:
- What each service does
- How to run it locally (exact commands, no assumptions)
- All environment variables documented (what, where to get it, what happens without it)
- Common failure modes with exact fixes
- How to roll back a bad deployment
- Database backup and restore procedure
- How to hand this to a contractor

---

## Step 8: Deploy to Production

**Atlas deploys. This is not a step the founder does.**

### Deployment Sequence

```bash
# 1. Detect platform from config files
# 2. Install CLI if missing (self-heal: ENV class)
# 3. Deploy
vercel --prod        # or railway up / fly deploy

# 4. Verify
LIVE_URL=$(vercel inspect --json | jq -r '.url')
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$LIVE_URL")
HEALTH=$(curl -s "$LIVE_URL/health")

# 5. Report
echo "Live URL: $LIVE_URL"
echo "Status: $HTTP_CODE"
echo "Health: $HEALTH"
```

### Multiple Deployment Targets (EC-9)

If Onboarding detected multiple targets, deploy each one in order:
```
✓ Web app deployed: [URL] (200 confirmed)
✓ Extension build: dist/ folder ready (CWS submission irreducible: phone verification)
```

### Deployment Failure Handling (Self-Healing)

| Error Class | First Fix | Retry | Fallback |
|-------------|-----------|-------|----------|
| Missing env var | Add to platform settings | Redeploy | `userMust` with exact var name |
| Build error / module not found | `npm install` → rebuild | Redeploy | Log incident, surface error |
| Auth required | Check `credentials_index.json` | Try `npx vercel login` | `userMust` with exact URL |
| Port conflict | Adjust start script | Redeploy | Different port |

If deploy fails after 2 attempts:
```
⚠️ DEPLOYMENT: Could not complete automatically
Error: [exact error]
Most likely fix: [diagnosis] — [URL] (~X min)
Everything else proceeding. Live URL confirmed once this is resolved.
```

**Deployment failure does not block Phases 3–14.**

### Git Push Failure Handling

| Error | Atlas Action |
|-------|-------------|
| No remote configured | `gh repo create --source=. --push` or ask for URL |
| Permission denied (publickey) | Explain SSH setup → flag as irreducible |
| Non-fast-forward rejected | `git pull --rebase` → retry |
| Protected branch | Push to `atlas/sprint-[date]` → note merge needed |

---

## Step 9: Push Everything

```bash
git add -A
git commit -m "[Atlas] Code Sprint complete: fixes, CI/CD, deployment config, RUNBOOK"
git push origin $(git branch --show-current)
```

---

## Step 10: Recalculate Score

| Factor | Max Points |
|--------|-----------|
| Zero P0 blockers | +20 |
| Deployment succeeded + live URL confirmed | +15 |
| GitHub Actions CI/CD committed | +10 |
| Error monitoring configured (Sentry) | +5 |
| Health check endpoint live | +5 |
| RUNBOOK.md written | +10 |
| API documented | +5 |

---

## Acceptance Test (Phase 2)

- [ ] Zero P0 blockers remaining (or all documented in incidents/ with 3 fix attempts)
- [ ] `curl <production_url>` returns 200 (or deployment failure logged with diagnosis)
- [ ] `.github/workflows/deploy.yml` committed
- [ ] `.env.example` committed with all variables documented
- [ ] `docs/founder/RUNBOOK.md` committed
- [ ] All changes pushed to remote
- [ ] Score recalculated and stated

**If any acceptance test fails:** Do not proceed to Phase 3. Fix the failure. If unfixable, log the specific reason in `incidents/` and surface a `userMust` with `layers_attempted`.

---

## Checkpoint

```
─────────────────────────────────────────────────────
CODE SPRINT COMPLETE

Atlas did:
  ✓ Fixed [N] P0 blockers across [N] files
  ✓ Fixed [N] P1 blockers
  ✓ Scaffolded: [vercel.json / railway.toml / etc.]
  ✓ Committed GitHub Actions CI/CD
  ✓ Sentry config committed
  ✓ RUNBOOK.md written ([N] sections)
  ✓ API docs generated ([N] endpoints)
  ✓ Deployed to production: [live URL]
  ✓ Live URL verified: [200 response confirmed]
  ✓ Pushed to remote

Runs-itself score: [X] → [Y]

Human must do (non-blocking):
  → Add SENTRY_DSN to production env vars — [Sentry URL] (~3 min)

── PROCEEDING TO LEGAL & COMPLIANCE ─────────────────
─────────────────────────────────────────────────────
```

---

## Red Flags

- ❌ Fixing P2 issues before P0s are resolved
- ❌ Stopping when code "looks good" without running the scorecard
- ❌ Writing RUNBOOK as an afterthought or skipping it
- ❌ Not committing GitHub Actions
- ❌ Writing "deploy with `vercel --prod`" instead of running `vercel --prod`
- ❌ Not pushing to remote after commits
- ❌ Leaving environment variables undocumented
- ❌ Skipping deployment because "the founder hasn't set up their account"
- ❌ Exiting Phase 2 with a P0 remaining and no incident log
- ❌ Not running acceptance tests before declaring complete
