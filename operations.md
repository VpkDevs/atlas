---
name: atlas-operations
description: Use during Atlas Module 11 — builds the permanent operating system: 5 product-specific North Star metrics with live queries committed, a 15-minute weekly review ritual as an actual runnable script, alert webhooks configured via API, investor update template, and a wealth trajectory. Atlas commits the monitoring infrastructure — it does not describe it.
---

# Atlas Operations

**Input:** Business Context + metrics data (Stripe, PostHog/Plausible/Mixpanel, DB, Sentry)
**Purpose:** Build the permanent operating system for this product. Not reports. A system that runs.

**Pre-revenue mode:** If `monetization_status: pre-revenue` in Business Context:
- Replace MRR North Star with **user growth rate** and **activation rate**
- Weekly Review Step 1 becomes "User growth pulse" not revenue pulse
- Wealth trajectory shows $0 with note: "Trajectory activates on first payment"
- Skip acquisition multiple projections
- Focus output on path to first dollar, not ongoing MRR management

---

## Process

### Step 1: Define the 5 North Star Metrics (Product-Specific)

Not AARRR. The 5 numbers that actually matter for THIS product specifically.

**Selection heuristics by product type:**

| Product Type | Typical North Stars |
|-------------|---------------------|
| SaaS subscription | MRR, Activation rate, D30 retention, Churn, CAC payback |
| Freemium | Free→Paid conversion, Activation, DAU/MAU, MRR, Churn |
| API/developer tool | API calls/day, Active integrations, Error rate, MRR, Time-to-first-call |
| Marketplace | GMV, Take rate, Buyer/seller retention, Liquidity, CAC |
| Content/SEO | Organic sessions, Email subscribers, Conversion rate, MRR, DAU |
| Consumer app | DAU, D7/D30 retention, Session length, Activation, Revenue/user |

**Output format — every metric with a live query:**
```
North Star Metrics for [Product Name]:

1. [Metric name]: [current value]
   Target: [specific number + timeframe]
   Live query: [exact Stripe API call / PostHog query / SQL / dashboard URL]
   Alert if: [drops below X or doesn't grow Y%/week]

2. [Metric name]: [current value]
   ...
```

**Atlas commits the queries.** Not just the metrics — the saved queries.

For PostHog (if `POSTHOG_API_KEY` present):
```bash
# Create saved insight via API
curl -X POST "https://app.posthog.com/api/projects/@current/insights/" \
  -H "Authorization: Bearer $POSTHOG_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "Weekly Active Users", "filters": {...}}'
```

For Stripe (if `STRIPE_SECRET_KEY` present):
- MRR: `stripe.subscriptions.list({status: 'active'})` summed
- New MRR: filter by `created` in last 7 days
- Churned MRR: filter `canceled_at` in last 7 days

---

### Step 2: Weekly Review Ritual (Runnable, Not Described)

Atlas commits `.github/workflows/weekly-review.yml` — a GitHub Action that:
1. Pulls all 5 North Star metrics from their APIs
2. Computes week-over-week deltas
3. Opens a GitHub issue titled "Weekly Review — [Date]" with the data pre-populated
4. Sends a Slack/Discord digest (if webhook configured)

```yaml
# .github/workflows/weekly-review.yml
name: Weekly Review
on:
  schedule:
    - cron: '0 14 * * 1'  # Mondays 9am EST / 14:00 UTC
  workflow_dispatch:

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Pull metrics & open issue
        env:
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
          POSTHOG_API_KEY: ${{ secrets.POSTHOG_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          DISCORD_WEBHOOK: ${{ secrets.DISCORD_WEBHOOK }}
        run: node scripts/weekly-review.js
```

Atlas also writes the human ritual (15 min) as the issue template:

```
WEEKLY REVIEW — [Product Name] — {{date}}
Target: 15 minutes

STEP 1 (3 min): Revenue pulse
  Stripe: [direct link to MRR dashboard]
  → MRR this week: $___  | vs. last week: $___  | trend: ↑ ↓ →
  → New customers: ___ | Churned: ___ | Net: ___

STEP 2 (3 min): Activation health
  PostHog/dashboard: [direct link to activation funnel]
  → Activation rate: ___% | vs. target: ___% | vs. last week: ___%
  → Drop-off point: ___

STEP 3 (3 min): Error & uptime check
  Sentry: [direct link] | Better Uptime: [direct link]
  → New errors this week: ___ | Top error: ___
  → Uptime: ___% | Any incidents: Y/N

STEP 4 (3 min): Support inbox
  [support channel direct link]
  → Open tickets: ___ | Common theme: ___

STEP 5 (3 min): ONE decision
  Based on above, the single most important action this week:
  → [write it here]
  → Saved to: docs/founder/YOUR_NEXT_ACTION.md
```

---

### Step 3: Alert Configuration (Atlas Configures — Does Not Describe)

**Threshold matrix — personalized to product stage:**

| Stage | MRR drop warning | MRR drop action | Error rate | Uptime action |
|-------|-----------------|-----------------|------------|---------------|
| Pre-revenue | N/A | N/A | >1% | <99% |
| $0–$1K MRR | >20% WoW | >40% WoW | >0.5% | <99.5% |
| $1K–$10K MRR | >10% WoW | >25% WoW | >0.5% | <99.5% |
| $10K+ MRR | >5% WoW | >15% WoW | >0.1% | <99.9% |

**Alert channel configuration:**

If `DISCORD_WEBHOOK` or `SLACK_WEBHOOK_URL` in `.env`:
```bash
# Test the webhook now
curl -X POST "$DISCORD_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{"content": "✅ Atlas alert channel configured. MRR drops, error spikes, and uptime incidents will appear here."}'
```

If Sentry `SENTRY_AUTH_TOKEN` present — configure alert rules via API:
```bash
# Create error-rate alert
curl -X POST "https://sentry.io/api/0/projects/$SENTRY_ORG/$SENTRY_PROJECT/alert-rules/" \
  -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Error rate spike",
    "aggregate": "count()",
    "timeWindow": 60,
    "threshold": 10,
    "triggers": [{"label": "critical", "alertThreshold": 10}],
    "actions": [{"type": "discord", "integrationId": "[id]"}]
  }'
```

If no webhook configured: generate a `userMust` with exact setup URL and estimated 5 minutes.

---

### Step 4: Support Playbook

Write the 20 most likely support questions for THIS product specifically.

Source them from:
1. Error messages in the codebase (likely confusing error = likely support ticket)
2. README "common issues" or "troubleshooting" sections
3. Product type patterns (auth issues, billing issues, onboarding confusion)

For each question:

```markdown
**Q: [exact phrasing users will type]**
Root cause: [why this happens — specific to this codebase]
Response: [exact response — friendly, specific, resolves the issue completely]
Permanent fix: [code/doc change that would eliminate this question]
Automate: [can this be handled by auto-responder? if yes, exact trigger phrase]
```

Identify the top 5 by frequency potential → configure auto-responses in Crisp/Intercom/HelpScout if API key present.

---

### Step 5: Milestone Triggers (Calibrated to This Product)

Do not use generic thresholds. Calibrate from Business Context.

```
HIRE SIGNAL:
  Trigger when: founder is spending > [X] hrs/week on [bottleneck task]
               AND MRR > $[calculate: 3x monthly cost of that role]
               AND same acquisition channel is producing signups reliably
  First hire: [specific role based on actual bottleneck]
  Where to find: [Contra / Toptal / X / specific community]
  Estimated cost: $[range]
  Decision framework: hire replaces founder time → founder focuses on higher-leverage

FUNDRAISE SIGNAL (if VC track):
  Trigger when: MRR growth > 15%/month for 3+ months
               AND market size > $100M (confirmed)
               AND burn rate < 18 months at current pace
  Action: YC application (deadline tracking) OR angel outreach via [specific network]
  Note: If definition_of_success = lifestyle → skip this section

SELL SIGNAL:
  Trigger when: MRR growth < 3%/month for 3 consecutive months
               AND founder interest declining
               AND MRR > $2,000 (below this: shut down is faster)
  Estimated multiple: [product-type multiple]x MRR = $[calculated range]
  List at: Acquire.com (primary), Flippa (secondary)
  Timeline: 60-90 days from listing to close typical

DOUBLE-DOWN SIGNAL:
  Trigger when: [specific acquisition channel] producing > [X] signups/week
               AND activation rate > [Y]%
               AND churn < [Z]%
  Action: 10x investment in that channel; cut underperformers

```

---

### Step 6: Investor Update Template

Even if the founder isn't raising — writing this monthly builds the discipline and creates a paper trail that's invaluable at acquisition time.

```markdown
# [Product Name] — Monthly Update — [Month Year]

**One sentence:** [What the product does, current MRR, stage]

## Key Metrics
- MRR: $[X] ([+/-Y%] vs. last month)
- Customers: [N] ([+/-N] vs. last month)
- Activation rate: [X]%
- Churn: [X]%
- Traffic: [X] unique visitors

## What We Did
- [3–5 bullet points: shipped, launched, fixed]

## What We Learned
- [1–2 honest learnings — what surprised us]

## Next 30 Days
- [Top 3 priorities]

## Ask (if any)
- [Intro to X / Advice on Y / Nothing this month]
```

Atlas commits this as `docs/founder/INVESTOR_UPDATE_TEMPLATE.md` and creates a cron to remind the founder monthly.

---

### Step 7: Personal Wealth Trajectory

Calculate at current growth rate. Show the math, not just the numbers.

```
WEALTH TRAJECTORY — [Product Name]

Current MRR: $[X]
Monthly growth rate: [X]% (estimated from [source: onboarding input / Stripe data])
Current cost structure: $[Y]/month

At [X]%/month growth from $[current MRR]:
  $1K MRR:   [date] — annualized $12K → freelance income equivalent
  $5K MRR:   [date] — annualized $60K → full replacement income (if TX-based)
  $10K MRR:  [date] — annualized $120K → strong solo income
  $50K MRR:  [date] — annualized $600K → empire tier

Asset value at these milestones (3x ARR for SaaS):
  At $5K MRR:  $180K
  At $10K MRR: $360K
  At $50K MRR: $1.8M

Assumptions: [growth rate, churn, cost structure stated explicitly]
These are projections, not guarantees.

Ramen-profitable date: [when MRR > $3K — covers basic living + expenses for solo TX founder]
```

---

### Step 8: ROADMAP.md

Write with entry/exit criteria per phase. Make it decision-ready, not aspirational.

```
PHASE 1: [Current] — [Status: ACTIVE]
  Entry: [already met — list what got us here]
  Exit: [specific measurable criteria — "500 active users AND MRR > $2K"]
  Focus: [2–3 specific priorities, not vague themes]
  Timeline estimate: [X weeks based on current velocity]

PHASE 2: [Growth] — [Status: PENDING]
  Entry: [exact criteria from Phase 1 exit]
  Exit: ["$10K MRR AND churn < 5% AND team of 2"]
  Focus: [priorities]
  What changes: [new hires, new channels, new pricing]

PHASE 3: [Scale/Exit/Lifestyle] — [Status: FUTURE]
  Entry: [Phase 2 exit criteria]
  Focus: [determined by definition_of_success: lifestyle | grow | acquire | vc]
```

---

## Output

- `docs/founder/OPERATIONS_HANDBOOK.md`
- `docs/founder/SUPPORT_PLAYBOOK.md`
- `docs/founder/ROADMAP.md`
- `docs/founder/INVESTOR_UPDATE_TEMPLATE.md`
- `docs/founder/YOUR_NEXT_ACTION.md` — exactly one thing
- `.github/workflows/weekly-review.yml` — committed and active
- Alert webhooks configured (or userMust if keys missing)
- 5 North Star queries saved in analytics platform (or as saved SQL)

---

## Acceptance Test

- [ ] 5 North Star metrics defined with product-specific live queries
- [ ] Weekly review workflow committed to `.github/workflows/`
- [ ] Alert channel tested (webhook fires successfully) OR userMust logged
- [ ] Support playbook: ≥ 20 questions with scripted responses
- [ ] Milestone triggers calibrated to this product's stage and definition_of_success
- [ ] ROADMAP.md has measurable exit criteria per phase
- [ ] YOUR_NEXT_ACTION.md has exactly one specific action

---

## Checkpoint

```
─────────────────────────────────────────────────────
OPERATIONS COMPLETE

Atlas did:
  ✓ 5 North Star metrics: [list with current values]
  ✓ Weekly review workflow committed: .github/workflows/weekly-review.yml
  ✓ Alert channel [configured via webhook / userMust logged]
  ✓ Support playbook: [N] questions, [N] auto-responses configured
  ✓ Milestone triggers calibrated to [product stage + goal]
  ✓ Wealth trajectory: ramen-profitable by [date] at current growth
  ✓ ROADMAP.md: [N] phases with measurable exit criteria
  ✓ YOUR_NEXT_ACTION.md: [the one specific thing]
  ✓ INVESTOR_UPDATE_TEMPLATE.md: monthly reminder scheduled

Sovereign Score: [X] → [Y]

── PROCEEDING TO REVENUE INTELLIGENCE ───────────────
─────────────────────────────────────────────────────
```

## Red Flags

- ❌ Defining North Star metrics without committing the live queries
- ❌ Writing the weekly review ritual as prose instead of a runnable workflow
- ❌ Alert thresholds that don't match the product's current stage
- ❌ Support playbook that lists generic SaaS questions instead of THIS product's error messages
- ❌ Milestone triggers with generic numbers instead of calibrated-to-this-product numbers
- ❌ Wealth trajectory without stating the growth rate assumption explicitly
- ❌ ROADMAP.md phases with vague goals ("improve retention") instead of measurable exit criteria
- ❌ Score still references 70 — the target is 90 in v6
