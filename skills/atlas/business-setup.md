---
name: atlas-business-setup
description: Use during Atlas Module 5 — sets up the legal and financial infrastructure for this specific founder's situation. Entity type, banking, accounting, taxes, deductions, S-Corp timing, exit strategy. Specific, not generic.
---

# Atlas Business Setup

**Input:** Business Context + founder location + financial situation
**Purpose:** Get the legal/financial infrastructure right the first time. Not generically — for this founder's specific situation.

## The Rule

Atlas gives specific recommendations with reasoning, not a menu of options to research. If confidence is low, it says so — but it still gives a recommendation.

## Process

### Step 1: Entity Type Recommendation

Based on: founder location, team size, funding intentions, income expectations.

**Decision framework:**
```
Solo founder, US, <$80K/yr expected:    LLC (single-member)
Solo founder, US, >$80K/yr expected:    LLC → S-Corp election
Funded startup / VC track:              C-Corp (Delaware)
Team of 2+, profit-sharing needed:      LLC with operating agreement
Non-US founder, US customers:           Varies by country — flag for research
```

Write the recommendation with:
- Entity type
- Formation state (home state vs. Delaware vs. Wyoming — with reasoning)
- Exact formation steps (name search → Articles of Organization → EIN → bank account → operating agreement)
- Cost estimate
- Timeline
- What changes the answer (e.g., "if you raise funding, convert to C-Corp")

### Step 2: Banking Setup

Specific account recommendations:
- Business checking (which bank, why — based on founder location and deposit volume)
- Business savings (where to park runway — HYSA options)
- Separation from Stripe payouts (why this matters for bookkeeping)
- Credit card recommendation (cashback vs. travel points based on spend patterns)

### Step 3: Accounting Setup

Tool recommendation based on complexity:
- **Sole prop / early LLC:** Wave (free) or QuickBooks Simple Start
- **LLC with employees / S-Corp:** QuickBooks Online Essentials
- **Multiple products / entities:** QuickBooks Online Plus

Setup guide:
- Chart of accounts to create for this type of business
- How to connect Stripe/bank feeds
- Expense categories specific to this business
- Frequency of reconciliation

### Step 4: Tax Calendar

Every filing deadline for year 1, based on entity type and state:

| Deadline | Filing | Amount (estimated) |
|----------|--------|-------------------|
| [Date] | [Filing name] | [$ estimate or formula] |
| ... | ... | ... |

Quarterly estimated tax payment schedule with calculation method.

### Step 5: Deduction Identification

Specific to this business:
- Home office (if applicable): calculation method + documentation required
- Equipment purchased this year: Section 179 deduction eligibility
- Software subscriptions: list from .env.example dependencies
- R&D credit eligibility: does this product qualify?
- Health insurance premiums: self-employed deduction
- SEP-IRA: maximum contribution calculation at expected income
- Travel: rules for deductible business travel

### Step 6: S-Corp Election Timing

Calculate the break-even income where S-Corp saves money:

```
Self-employment tax savings from S-Corp:
  At $[X] income: save $[Y]/year
  Payroll processing cost: ~$500-1500/year
  Break-even: ~$[Z]/year in business income

S-Corp makes sense when: net profit > $[amount]
Current projected income: $[amount from Business Context]
Recommendation: [elect now / set calendar reminder for $X milestone]
```

### Step 7: Exit Strategy Options

Buyers pay for different things depending on product type:

| Product Type | Typical Buyers | Revenue Multiple | What Improves Multiple |
|-------------|---------------|-----------------|----------------------|
| SaaS (recurring) | PE, strategic | 3-8x ARR | MRR growth, churn, NPS |
| Content/SEO | Indie buyers | 30-50x monthly profit | Traffic quality, email list |
| Developer tool | Strategic | 4-10x ARR | API usage, integrations |
| Marketplace | Strategic/PE | 2-5x revenue | GMV, take rate, retention |

**Acquisition Readiness Score (initial):**
```
Documentation:     [X]/20
Revenue quality:   [X]/20  (MRR vs. one-time, churn)
Bus factor:        [X]/15  (can it run without founder?)
Growth rate:       [X]/15
Clean books:       [X]/15
IP ownership:      [X]/15

Total: [X]/100
Estimated multiple at current score: [X]x
To reach next tier: [specific improvements]
```

## Output

- `docs/founder/BUSINESS_SETUP.md`
- `docs/founder/TAX_CALENDAR.md`
- Acquisition Readiness Score (initial) with improvement roadmap

## Checkpoint

```
─────────────────────────────────────────────────────
BUSINESS SETUP COMPLETE

Done:
  ✓ Entity recommendation: [type] — [reasoning]
  ✓ Formation guide: [N] steps written
  ✓ Banking setup guide written
  ✓ Tax calendar: [N] deadlines mapped
  ✓ [N] deductions identified
  ✓ Acquisition Readiness Score: [X]/100

Runs-itself score: [X] → [Y]

Needs your action:
  → [e.g., "File Articles of Organization — $50, 1 hour online"]

Type 'continue' to proceed to Automation Handoff
─────────────────────────────────────────────────────
```
