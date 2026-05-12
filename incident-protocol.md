---
name: atlas-incident-protocol
description: The Atlas incident response protocol. Schema for every incident log, severity classification matrix, SLA targets, response playbook per severity, escalation rules, and post-mortem template. Loaded when Atlas writes to incidents/ or when severity escalation is triggered.
---

# Incident Protocol (v7.2)

Atlas does not improvise under pressure. It runs this protocol.

---

## 1. Severity Classification

| Severity | Definition | SLA to Diagnose | SLA to Resolve | Founder Alert? |
|----------|------------|-----------------|----------------|----------------|
| **P0** | Production down. Checkout broken. Data loss possible. Legal/compliance violation. | 5 minutes | 30 minutes | YES — immediately |
| **P1** | Core feature degraded. Payments succeeding but slow. Monitoring dark. Failed charge spike > 25%. Runway < 60d. | 15 minutes | 2 hours | YES — within 15 min |
| **P2** | Non-critical feature broken. Performance degraded. Minor conversion drop (< 20% relative). | 1 hour | 24 hours | No (log only) |
| **P3** | Cosmetic issue. Minor UX regression. Non-blocking error in logs. | Next ops cycle | Next sprint | No |

---

## 2. Incident Log Schema

Written to: `~/.atlas/portfolio/[slug]/incidents/[ISO-date]-[severity]-[slug]-[short-slug].md`

Example filename: `2026-05-09-P1-myproduct-failed-charge-spike.md`

```markdown
# Incident [ID]: [Short Title]

**Severity:** [P0 / P1 / P2 / P3]
**Product:** [slug]
**Phase at time of incident:** [phase number and name]
**Capital mode at time of incident:** [SCALE / BALANCED / PRESERVE / SURVIVE]
**Opened:** [ISO datetime]
**Resolved:** [ISO datetime or "OPEN"]
**Duration:** [N minutes / hours or "ongoing"]

---

## 1. Summary

[One paragraph. What broke. What the user-visible impact was. What happened to revenue.]

## 2. Impact Quantification

| Metric | Value |
|--------|-------|
| Users affected | [N or "estimated N"] |
| Revenue impact | [$N lost / at risk, or "unknown"] |
| Sovereign Score delta | [-N points] |
| Uptime SLA breach? | [Yes / No] |
| Checkout success rate during incident | [N%] |

## 3. Timeline

| Time (ISO) | Event |
|------------|-------|
| [T+0] | Incident detected — [how: monitor / user report / Atlas diag] |
| [T+Nm] | [What Atlas did] |
| [T+Nm] | [What changed] |
| [T+Nm] | [Resolution confirmed] |

## 4. Root Cause

**Confirmed:** [Yes / No — if no, mark as "Hypothesis: [explanation]"]

[Specific cause. Not "something broke" — point to the exact file, config, API response, or logic error.]

## 5. What Atlas Did

```
SELF_HEAL log:
  1. CLASSIFY: [AUTH / QUOTA / NETWORK / INPUT / LOGIC / ENV]
  2. FIX APPLIED: [exact command or change]
  3. RETRY: [N attempts, outcome]
  4. RESULT: [resolved / escalated / routed around]
```

## 6. Resolution

[What was the exact fix. What command was run. What file was changed. What was deployed.]

**Rollback used?** [Yes / No]
If yes: `[exact rollback command]`

## 7. Verification

```
curl [prod_url] → [HTTP status + latency]
curl [prod_url]/health → [JSON response]
[KPI metric] → [value confirming resolution]
```

## 8. Contributing Factors

(What made this worse or allowed it to happen)
- [ ] Missing monitoring
- [ ] No alerting on this signal
- [ ] Deployment without health check
- [ ] No pre-deploy rollback recipe
- [ ] Other: [description]

## 9. Follow-Up Actions (Required)

| Action | Owner | Due | Status |
|--------|-------|-----|--------|
| [Add monitoring for X] | Atlas | [date] | ⏳ |
| [Add regression test for Y] | Atlas | [date] | ⏳ |
| [Update runbook with Z] | Atlas | [date] | ⏳ |
| [Founder must: X] | Founder | [date] | ⏳ |

## 10. Decision Log

**Hypothesis:** [What Atlas believed was causing the incident]
**Expected metric impact of fix:** [How the Sovereign Score or KPI will improve]
**Reversal cost:** [Effort to undo the fix if it causes new problems]
**Keep/kill threshold:** [When Atlas would reverse this fix or escalate to founder]

## 11. Post-Mortem (P0 and P1 Required Within 24h)

### What Went Wrong
[Technical root cause, contributing factors]

### Why It Wasn't Caught Earlier
[What monitoring/testing gap allowed this]

### What Changes
1. [Specific change to prevent recurrence]
2. [Specific monitoring addition]
3. [Specific runbook update]

### Score Impact
**Before:** [N]/100
**After fix:** [N]/100
**Permanent improvement (from monitoring/prevention):** +[N] pts

---

*Post-mortem complete: [ISO date]*
```

---

## 3. Response Playbook by Severity

### P0 Response (max 30 min to resolve)

```
PROCEDURE p0_response(incident):

  T+0: DETECT
    Monitor alert OR Atlas diag failure OR Founder report
    Open incident log immediately

  T+1-5: DIAGNOSE
    curl <prod_url>           → classify: DNS / app crash / deploy
    tail logs (Sentry/Railway/Vercel CLI)
    git log --oneline -5      → was there a recent deploy?
    Check GitHub Actions for failed run

  T+5-10: CONTAIN
    IF recent deploy caused it:
      vercel rollback          [or] git revert HEAD && git push
    IF database issue:
      switch to read-only mode if possible
    IF payment processor down:
      surface status page; communicate to users

  T+10-30: RESOLVE
    Apply minimal targeted fix
    Deploy with health check gate
    Verify: curl → 200, checkout flow works, Stripe events flowing

  T+30: COMMUNICATE
    Update status page / send Slack alert
    Write incident log entry
    Surface as userMust if founder action required
```

### P1 Response (max 2h to resolve)

```
PROCEDURE p1_response(incident):

  T+0-15: DIAGNOSE
    Identify affected service or metric
    Pull last 7d trend to determine if sudden or gradual
    Check if correlated with a recent deploy or config change

  T+15-60: TRIAGE
    Classify: payment / monitoring / conversion / financial
    Apply appropriate sub-protocol:
      Payment issue → dunning_recovery_protocol()
      Monitoring dark → reconfigure monitoring
      Conversion drop → funnel_audit()
      Financial (runway) → capital_governor() → switch to PRESERVE

  T+60-120: EXECUTE
    Ship fix or workaround
    Verify instrumentation is tracking the resolution
    Update ATLAS_BRAIN.md with new status

  T+120: CLOSE OR ESCALATE
    IF resolved: mark closed, schedule post-mortem
    IF not resolved: escalate to P0, create userMust for founder
```

### P2 Response (max 24h)

```
PROCEDURE p2_response(incident):

  Current cycle: Log to incidents/, add to tomorrow's critical queue
  Next daily tick: Investigate, apply fix, verify
  If not resolved in 24h: upgrade to P1
```

---

## 4. Common Incident Patterns and Exact Fixes

| Symptom | Likely Class | First Command | Fallback |
|---------|-------------|---------------|---------|
| `curl <prod_url>` → 502 | DEPLOY | `vercel rollback` | `git revert HEAD && git push` |
| `curl <prod_url>` → 401 | AUTH | Check `NEXTAUTH_SECRET` / JWT config | Re-deploy with correct env |
| Stripe webhooks not firing | INPUT | `stripe listen --print-secret` then re-register endpoint | `stripe webhook_endpoints update [id] --url [url]` |
| PostHog events missing | NETWORK | Verify `POSTHOG_API_KEY` in env, check CSP headers | Switch to server-side tracking |
| Email sequences not sending | AUTH | `resend domains list` → verify domain DNS | Switch to Resend backup domain |
| DB migrations fail | LOGIC | `prisma migrate diff` → find conflict | Roll back: `prisma migrate resolve --rolled-back [name]` |
| OAuth redirect_uri mismatch | INPUT | `AUTH_URL` in env must match exactly | Update provider redirect URIs via API |
| `npm audit` high vulns | LOGIC | `npm audit fix` | `npm audit fix --force` (check for breaking changes) |
| GitHub Actions deploy fails | ENV | `gh run view [id] --log` | Re-run with `gh run rerun [id]` |
| Sentry not capturing errors | AUTH | Verify `SENTRY_DSN` in production env | Re-commit `sentry.client.config.*` with correct DSN |
| `vercel: command not found` | ENV | `npm i -g vercel` | `npx vercel --prod` |
| Memory / OOM on deploy | QUOTA | Increase memory limit in config | Optimize largest object allocations first |

---

## 5. Incident Metrics (Track Weekly)

```
Weekly incident report (appended to WEEKLY_OPERATOR_REVIEW.md):

  P0 incidents this week: [N] (target: 0)
  P1 incidents this week: [N] (target: ≤ 1)
  P2 incidents this week: [N] (target: ≤ 3)
  
  Mean Time to Diagnose (MTTDiag): [N min]  (target: P0 < 5, P1 < 15)
  Mean Time to Resolve (MTTR):     [N min]  (target: P0 < 30, P1 < 120)
  
  Recurrent incidents (same root cause):  [N]  (target: 0 — every recurrence is a process failure)
  Post-mortems completed on time (P0/P1): [N/total] (target: 100%)
  
  Sovereign Score impact from incidents this week: [-N points]
```

---

## 6. Escalation to Founder (Irreducible Cases)

Create a `userMust` in ATLAS_BRAIN.md when:
- P0 is not resolved within 30 minutes of Atlas's best efforts
- Legal or compliance action is required (can't be automated)
- Bank or payment processor account action required
- Physical identity verification required

Escalation userMust must include:
- The exact incident ID
- The exact action needed
- Estimated time to complete
- What Atlas will do while waiting
- What Atlas will do when the founder completes it
