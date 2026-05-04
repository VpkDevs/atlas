---
name: atlas-operations
description: Use during Atlas Module 7 — builds the permanent operating system for the product. Defines the 5 North Star metrics specific to this product, writes the 15-minute weekly review ritual, sets monitoring thresholds, writes the support playbook, and calculates wealth trajectory.
---

# Atlas Operations

**Input:** Business Context + metrics data (Stripe, PostHog, database — if accessible)
**Purpose:** Build the permanent operating system for this product. Not reports. A system.

**Pre-revenue mode:** If `monetization_status: pre-revenue` in Business Context:
- Replace MRR as a North Star metric with **user growth rate** and **activation rate**
- Weekly Review Step 1 becomes: "User growth pulse" (signups this week, activation rate) — not revenue pulse
- Wealth trajectory shows $0 MRR with a note: "Trajectory activates once first payment is received"
- Do not show acquisition multiple projections ($0 × multiple = $0)
- Focus Operations output on the path to first dollar, not ongoing MRR management

## Process

### Step 1: Define the 5 North Star Metrics

Not AARRR framework. The 5 numbers that actually matter for THIS product.

**How to select them:**
- What is the activation moment for this product? (metric: activation rate)
- What does retention look like for this product? (metric: [X]-day retention)
- What drives revenue for this product? (metric: MRR / ARR / LTV)
- What signals growth for this product? (metric: new signups / MAU / referrals)
- What signals product health? (metric: error rate / support volume / NPS)

**Output format:**
```
North Star Metrics for [Product Name]:
1. [Metric]: [Current value] → [Target] → [How to measure]
2. [Metric]: [Current value] → [Target] → [How to measure]
3. [Metric]: [Current value] → [Target] → [How to measure]
4. [Metric]: [Current value] → [Target] → [How to measure]
5. [Metric]: [Current value] → [Target] → [How to measure]
```

### Step 2: Weekly Review Ritual

Write the 15-minute weekly review. Not a description of it. The actual ritual:

```
WEEKLY REVIEW — [Product Name]
Total time target: 15 minutes
Day/time: [specific recommendation, e.g., "Every Monday 9 AM"]

STEP 1 (3 min): Revenue pulse
  Open: [specific dashboard URL or Stripe link]
  Check: MRR vs. last week, new MRR, churned MRR
  Question: "Is the trend up, down, or flat?"

STEP 2 (3 min): Activation health
  Open: [specific PostHog/Mixpanel query or DB query]
  Check: [specific metric] vs. [threshold]
  Question: "Are new users hitting the activation moment?"

STEP 3 (3 min): Error & uptime check
  Open: [Sentry URL] + [Better Uptime URL]
  Check: New errors this week, uptime percentage
  Question: "Anything that needs fixing this week?"

STEP 4 (3 min): Support inbox
  Open: [support email / Intercom / Crisp]
  Check: Unresolved threads, common themes
  Question: "What are users struggling with?"

STEP 5 (3 min): One decision
  Based on the above: what is the single most important thing to work on this week?
  Write it to: docs/founder/YOUR_NEXT_ACTION.md
```

### Step 3: Alert Thresholds

Define specific numbers that trigger action:

| Metric | Warning Threshold | Action Threshold | Response |
|--------|-----------------|-----------------|----------|
| MRR drop | >10% week-over-week | >25% week-over-week | Investigate churn |
| Error rate | >0.5% of requests | >2% of requests | Hotfix |
| Uptime | <99.5% | <99% | Incident response |
| Activation rate | <[X]% | <[Y]% | Fix onboarding |
| Support volume | >10 tickets/day | >25 tickets/day | FAQ update |

### Step 4: Support Playbook

Write the 20 most likely support questions for this product, with scripted responses:

For each question:
- **Question:** [exact phrasing users will use]
- **Root cause:** [why this happens]
- **Response:** [exact response to send — friendly, specific, complete]
- **Permanent fix:** [code/doc change that would eliminate this question]

### Step 5: Milestone Triggers

Define the signals that indicate major decision points:

**Hire signal:**
```
When: [time bottleneck metric] AND MRR > $[X] AND [acquisition channel] is clear
What to hire: [specific role]
Where to find: [specific platform]
```

**Fundraise signal:**
```
When: growth rate > [X]%/month AND market size > $[Y]M AND burn rate < [Z] months
What to do: [specific next step — YC, angels, Sequoia, etc.]
```

**Sell signal:**
```
When: growth plateau (< [X]%/month for 3+ months) AND MRR > $[Y]
Estimated multiple: [X]x MRR = $[Z]
Where to list: Acquire.com, Flippa, MicroAcquire
```

**Double-down signal:**
```
When: [specific growth metric] exceeds [threshold]
What to do: Increase [specific investment]
```

### Step 6: Acquisition Readiness Score (Updated)

After operations module, recalculate the Acquisition Readiness Score with operations improvements factored in.

Show delta from Business Setup module.

### Step 7: Personal Wealth Trajectory

Calculate at current growth rate:

```
Current MRR: $[X]
Growth rate: [X]%/month (or estimated from comparable products)

Milestones:
  $1K MRR:   [date estimate] — $[annualized] salary equivalent
  $5K MRR:   [date estimate] — $[annualized]
  $10K MRR:  [date estimate] — $[annualized]
  $50K MRR:  [date estimate] — $[annualized]

Asset value (at 3x ARR):
  At $10K MRR: $360K
  At $50K MRR: $1.8M

Note: These are projections, not guarantees. Based on [assumptions stated].
```

### Step 8: ROADMAP.md

Write the product roadmap with entry/exit criteria per phase:

```
PHASE 1: [Current Phase Name]
  Status: [current]
  Entry criteria: [already met]
  Exit criteria: [what defines success here]
  Focus: [2-3 specific priorities]

PHASE 2: [Next Phase]
  Entry: [what must be true to enter this phase]
  Exit: [what defines completion]
  Focus: [priorities]

PHASE 3: [Scale / Exit / etc.]
  Entry: [criteria]
  Exit: [criteria]
  Focus: [priorities]
```

## Output

- `docs/founder/OPERATIONS_HANDBOOK.md`
- `docs/founder/SUPPORT_PLAYBOOK.md`
- `docs/founder/ROADMAP.md`
- `docs/founder/YOUR_NEXT_ACTION.md` — exactly one thing, current as of today

## Checkpoint

```
─────────────────────────────────────────────────────
OPERATIONS COMPLETE

Done:
  ✓ 5 North Star metrics defined for this product
  ✓ 15-minute weekly review ritual written
  ✓ [N] alert thresholds set
  ✓ Support playbook: [N] questions with scripted responses
  ✓ Milestone triggers defined (hire/fundraise/sell/double-down)
  ✓ Wealth trajectory calculated
  ✓ ROADMAP.md written
  ✓ YOUR_NEXT_ACTION.md — [one specific thing]

Runs-itself score: [X] → [Y]

Atlas single-project run COMPLETE.
[If score < 70:] Score is [Y] — below 70. See Automation Handoff for remaining gap.
[If score >= 70:] Product is running itself. Atlas is done here.

Type 'portfolio' to run Portfolio Mode (empire intelligence)
Type 'pause' to end this session
─────────────────────────────────────────────────────
```
