---
name: atlas-automation-handoff
description: Use during Atlas Phase 8 — gets the product to the launch floor (Sovereign Score ≥ 60% of the points earnable before launch) before Phase 9. Configures uptime monitoring, error alerting, email sequences (copy + trigger code committed in the product), and social scheduling via API calls (not descriptions). Implements n8n/Make workflows as importable JSON. Does not complete until the launch floor is reached. Target is 90.
---

# Atlas Automation Handoff

**Input:** Business Context + current runs-itself score + `~/.atlas/automation-library/`
**Purpose:** Get the product to the launch floor — a Sovereign Score of at least 60% of the points earnable before launch — and pushing toward 90 (sovereign) by actually configuring automations, not describing them.

## The Automation Doctrine

**Atlas configures. It does not instruct.**

For every automation in this module, the protocol is:
1. Check for API key in `.env`
2. If key exists → call the API now → confirm in checkpoint
3. If key missing → flag as irreducible → estimate 5 min for human to get key → continue with everything else

---

## The Runs-Itself Score

The Sovereign Score has exactly ONE rubric — the one in `SKILL.md` ("Sovereign Score (v6 — Recalibrated)"). This module does not score itself; it moves these canonical categories:

| Canonical Category (SKILL.md) | Max | What This Module Earns |
|----------|-----------|---------------|
| Monitoring & Alerting | 10 | Uptime monitoring + error alerting + revenue alerting firing to a real channel |
| Email Automation | 10 | Welcome + activation + retention sequences live |
| Support Automation | 10 | Top-20 FAQ live; auto-responder; ticket routing |
| Content Engine | 10 | 30+ days scheduled AND a recurring generation cycle running |
| Social Presence | 5 | Real-time community engagement (replies, not just posts) |
| Documentation | 5 | RUNBOOK + contractor onboarding + investor update template |
| Code & Deployment | 15 | The auto-deploy pipeline this module hardens (Code Sprint builds it) |
| Economic Sovereignty | 10 | The payment side: dunning, failed-payment recovery, receipts (full category also covers P&L / tax reserve / credits) |

**Launch floor: 60% of the points earnable before launch. Sovereign target: 90. This module must reach the floor before Phase 9 launches.**

The earnable set before launch, from the table above: Code & Deployment 15 + Monitoring & Alerting 10 + Email Automation 10 + Support Automation 10 + Content Engine 10 + Social Presence 5 + Documentation 5 = **65 points**. (Economic Sovereignty's payment-dependent part is excluded while `[LOCKED: pre-revenue]`; Active Acquisition and Iteration Loop are not earnable before launch at all — the first needs a launched product, the second is Phase 13's machinery.)

Launch floor = ⌈0.6 × earnable⌉ = **39 of 65** with the full set earnable. If a category does not apply to this product, remove it from the earnable set and recompute — the floor is a share of what can be earned, not a fixed number. After launch, when every category is earnable, the absolute benchmarks apply: 60 = launch floor, 80 = sustained, 90 = sovereign.

The score is always calculated from the canonical rubric across the whole pipeline — never from a module-local table. The categories above are the ones this module can move; the rest are earned in other phases.

**Computed, not estimated:** the score and this floor are calculated by `scripts/atlas/score.js` from the measurable signals recorded in `atlas-state.json` (test results, file presence, git/config state). The floor rule above is implemented verbatim — the 39-of-65 worked example is the script's own unit test — and the same signals in always produce the same number out. If a checkpoint states a score, it is score.js output, not an operator's estimate.

---

## Process

### Step 1: Gap Analysis

**Pre-revenue check:** If `monetization_status: pre-revenue` in Business Context:
- Skip: dunning, failed payment recovery, revenue alerting, billing automation
- Note in checkpoint: "Payment automations skipped — no payment processor detected. These activate once Stripe/equivalent is added."
- Mark the payment-dependent part of Economic Sovereignty `[LOCKED: pre-revenue]`, not missing — it is excluded from the achievable score until a payment processor exists

Calculate current score. List every automation that adds points, sorted by points-per-hour.

### Step 2: Monitoring & Alerting

**Better Uptime — check for API key:**
```
BETTER_UPTIME_API_KEY in .env → YES → Create monitors via API:

curl -X POST "https://betteruptime.com/api/v2/monitors" \
  -H "Authorization: Bearer $BETTER_UPTIME_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "[live URL from deployment]",
    "monitor_type": "status",
    "check_frequency": 180,
    "email_me": true,
    "paused": false
  }'

Monitors to create:
  - Main domain (check every 3 min)
  - /health endpoint (check every 3 min)
  - /api/health (if exists)

Confirm: "Created [N] monitors — all showing green"
```

If key missing: flag irreducible step "Get API key at betteruptime.com ($0 free tier)".

Alternative (free, no key needed): Configure UptimeRobot via their API with `UPTIME_ROBOT_API_KEY`, or commit a GitHub Actions uptime check workflow.

**Sentry — if SENTRY_DSN in .env:**
Already handled in Code Sprint. Verify config is committed and DSN is set.

If not done: commit config now, flag DSN as env var to add.

**Revenue alerting — if STRIPE_SECRET_KEY in .env:**

Commit a Stripe webhook handler that sends alerts on:
- New customer event (new MRR) → Slack/email notification
- Customer churn event → trigger win-back flow
- Revenue anomaly (>50% drop week-over-week) → immediate alert

```typescript
// src/webhooks/stripe.ts — commit this file
// Handles: customer.subscription.created, customer.subscription.deleted
// Notifies via: SLACK_WEBHOOK_URL (if set) or email via configured email service
```

### Step 3: Email Automation

**Detect email service from dependencies / .env:**
```
RESEND_API_KEY → Use Resend API
SENDGRID_API_KEY → Use SendGrid API
MAILCHIMP_API_KEY → Use Mailchimp API
None detected → Write sequences as markdown; flag irreducible step (get Resend key — free tier: 3K/mo)
```

**The deliverable — sequences + trigger code.** Atlas does not create provider-side automations: the Resend/SendGrid APIs send individual emails; they do not host sequence logic. A sequence is real when both exist — (1) the sequence copy, written by Atlas, and (2) **trigger code committed in the product** that calls the provider's send API at the right moment: the signup handler fires the welcome email, scheduled jobs fire the timer emails, the usage-drop check fires churn prevention. Provider-side automation is used only where the provider's API genuinely supports creating it.

**If Resend API key exists:** Atlas writes the sequences below AND commits the trigger code that sends them. The send call the trigger code makes:
```bash
# Create each email via Resend API
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "[app email]",
    "to": ["user@example.com"],
    "subject": "[subject]",
    "html": "[email body HTML]"
  }'
```

Write and wire ALL of the following sequences:
- **Welcome email** (trigger: signup): confirm value, set expectations, one CTA
- **Activation email** (trigger: Day 1, if activation event not fired): nudge to complete setup
- **Day 3 value** (trigger: timer): feature highlight most users miss
- **Day 7 social proof** (trigger: timer): user stories or metrics
- **Day 14 check-in** (trigger: timer): how is it going, offer help
- **Churn prevention** (trigger: usage drops below threshold): engage before they leave
- **Win-back** (trigger: subscription cancelled): 3-email sequence, offer concession

For each email, write:
- Subject line (A/B test variant included)
- Full email body copy (HTML + plain text)
- Trigger condition (exact event or timer)

**A sequence counts as live only when its trigger code is committed and a test send through that code path is verified.** Copy without trigger code is a draft.

Confirm: "Wrote [N] email sequences and committed their trigger code — test sends verified, live and triggered on signup"

### Step 4: Support Automation

Identify top 20 support questions from:
- README FAQ section
- Common API errors in codebase
- Known gotchas from code comments
- Competitor reviews (what people complain about)

For each question:
- Exact phrasing users will use
- Root cause
- Exact scripted response (ready to send)
- Permanent code fix that would eliminate this question

**Configure auto-responder** (if Intercom/Crisp detected):
```
CRISP_WEBSITE_ID in .env → YES → Configure auto-response rules via Crisp API
INTERCOM_TOKEN in .env → YES → Configure automated messages via Intercom API
```

If no support tool: output `docs/founder/SUPPORT_PLAYBOOK.md` with 20 scripted responses.

Write FAQ page component and commit to codebase.

### Step 5: Social Scheduling

Content calendar from Phase 6 (CONTENT_CALENDAR_90.md — 90 days of posts).

```
BUFFER_ACCESS_TOKEN in .env → YES → Already done in Phase 6 (verify scheduled)
                             → NO  → Output CONTENT_CALENDAR_90.md
```

If not yet scheduled via Buffer in Phase 6, schedule now.

### Step 6: Importable n8n/Make Workflows

For each repeatable multi-step process detected, commit an actual workflow file:

```
~/.atlas/automation-library/[product-slug]-[workflow-name].json
```

Standard workflows to build for every product:
1. New customer onboarding flow (signup → welcome email → activation check)
2. Churn detection flow (usage drop → alert → win-back trigger)
3. Revenue milestone celebration (MRR milestone hit → share to Slack/Twitter)
4. Weekly metrics digest (pull from Stripe + analytics → email summary)
5. Support ticket routing (classify → route → auto-respond)

Format: n8n-compatible JSON (importable at n8n.io directly).

### Step 7: Deployment Pipeline Verification

Verify GitHub Actions workflow from Code Sprint is working:
- Check `.github/workflows/deploy.yml` exists and is valid
- Verify `VERCEL_TOKEN` (or equivalent) is set in GitHub Secrets (flag if not)
- Trigger a test deployment if possible

If CI/CD not yet set up: commit now (not describe — commit).

### Step 8: Payment Automation

**Skip entirely if `monetization_status: pre-revenue`.** Log: "Payment automation [LOCKED: pre-revenue] — add Stripe to activate (see BUSINESS_SETUP.md)."

If Stripe is integrated:

- **Dunning:** Configure automatic email reminders for failed payments (3 attempts: 3 days, 7 days, 14 days)
- **Failed payment recovery:** Commit a webhook handler for `invoice.payment_failed`
- **Receipt emails:** Verify Stripe is sending automatic receipt emails (it does by default — verify setting is enabled)
- **Proration:** Verify upgrade/downgrade proration logic is correct in the billing code

### Step 9: Contractor Documentation

`docs/founder/CONTRACTOR_ONBOARDING.md`:
- What this product is and who uses it
- Architecture overview (how the pieces connect)
- How to run it locally (step by step with exact commands)
- Every environment variable and where to get it
- Deployment process
- Database location and access
- Common issues and their fixes
- How to contact the founder
- Definition of "done" for standard tasks

SOW templates:
- Bug fix SOW template (with market rate: $75-150/hr)
- Feature addition SOW template
- Security audit SOW template

### Step 10: Recalculate Score

```
New runs-itself score: [X]/100

If X >= launch floor (⌈0.6 × earnable⌉ — 39 of 65 with the full pre-launch set): ✅ Launch floor reached → proceed to Phase 9
If X >= 80: ✅ Sustained operation level
If X >= 90: ✅ Sovereign
If X < launch floor: ❌ BLOCKED — cannot launch. List gap + exactly what would close it.
```

**If the floor is not reachable without human action:**
```
Current score: [X]
Achievable without human: [Y]
Blocked on: [specific human actions needed with URLs + estimated time each]
After human actions: score will reach [Z]
```

---

## Output
- Git commit + push to remote

- Monitoring configured (Better Uptime API calls confirmed)
- Email sequences written + trigger code committed (test sends verified)
- Support automations configured
- n8n workflow JSONs committed to `~/.atlas/automation-library/`
- `docs/founder/CONTRACTOR_ONBOARDING.md`
- Updated runs-itself score (launch floor: 60% of pre-launch-earnable points, target: 90)
- Git commit + push

---

## Checkpoint

```
─────────────────────────────────────────────────────
AUTOMATION HANDOFF COMPLETE

Atlas did:
  ✓ Uptime monitoring: [N] monitors created via [Better Uptime / UptimeRobot] API
  ✓ Error alerting: Sentry [configured / verified]
  ✓ Revenue alerting: Stripe webhook committed (new customer, churn, anomaly)
  ✓ Email sequences: [N] written + trigger code committed ([Resend / SendGrid] send API)
  ✓ Support: [N] responses scripted in SUPPORT_PLAYBOOK.md
  ✓ Social: [N] posts [scheduled via Buffer API / queued in CONTENT_CALENDAR.md]
  ✓ [N] n8n workflow JSONs committed to automation-library
  ✓ CI/CD deployment pipeline [verified / committed]
  ✓ Stripe dunning configured
  ✓ Contractor onboarding doc: [N] sections

Runs-itself score: [X] → [Y]

[If Y >= launch floor:]
── PROCEEDING TO PHASE 9: LAUNCH ────────────────────

[If Y < launch floor:]
❌ LAUNCH BLOCKED: Score is [Y]. Need [N] more points to reach the launch floor ([F] of [E] pre-launch-earnable points).
Gap: [specific items with point values]
Blocked on human actions: [list with direct URLs + estimated time each]
Continuing to implement what I can now...
Will re-score and check again before declaring blocked.
─────────────────────────────────────────────────────
```

## Red Flags

- ❌ Declaring this module complete when score is below the launch floor
- ❌ API key exists and Atlas described the setup instead of calling the API
- ❌ Writing contractor docs as an afterthought
- ❌ Not saving automation blocks to `~/.atlas/automation-library/`
- ❌ Writing about n8n workflows without committing importable JSON
- ❌ Writing email sequence copy without committing the trigger code that sends it
- ❌ Not verifying CI/CD pipeline is actually working
