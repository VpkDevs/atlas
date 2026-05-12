---
name: atlas-cashflow-ops
description: Cashflow operations module for Atlas v7.2. Tracks runway, receivables, failed payments, collections, dunning, and spend guardrails so growth work stays solvent.
---

# Cashflow Ops (v7.2)

Objective: keep the business solvent, resilient, margin-aware, and able to keep compounding without founder guesswork.

Cashflow Ops controls the operating cash loop. It does not make optimistic projections unless the money is collectible, attributable, and tied to a dated source.

## Required Inputs

Collect the latest available:

- Bank balance and pending payouts.
- Stripe, Paddle, Lemon Squeezy, PayPal, invoice, or marketplace revenue.
- Failed charges, disputes, refunds, credits, and receivables.
- Recurring expenses, committed annual contracts, payroll/contractor obligations, and infrastructure costs.
- Active capital mode from `capital-governor.md`.
- Latest `survival_score()` and `cash_discipline_score()` from `scoring.md`.
- Open incidents from `~/.atlas/portfolio/[slug]/incidents/`.

If an account cannot be queried, mark it as stale and use the last known value with a confidence penalty. Do not treat unknown cash as available.

## Acceptance Gate

A Cashflow Ops pass is complete only if:

- Runway estimate is refreshed with date, assumptions, and confidence.
- Failed payment and receivable queues are processed or explicitly blocked.
- Spend guardrail status is evaluated against current capital mode.
- A weekly cashflow summary is written.
- `survival_score()` and `cash_discipline_score()` are recomputed and deltas logged.
- Any cash-threatening issue is routed to `incident-protocol.md` with severity.

## Core Formulas

```text
available_cash =
  bank_cash +
  pending_processor_payouts * payout_confidence -
  restricted_cash -
  committed_critical_payments_14d

monthly_net_burn =
  max(avg_cash_out_30d - avg_cash_in_30d, 0)

runway_days =
  if monthly_net_burn == 0:
    365
  else:
    floor(available_cash / (monthly_net_burn / 30))

collection_risk =
  failed_payment_amount_14d +
  overdue_receivables_30d +
  disputes_open_amount

cash_pressure_score =
  clamp(100 - runway_days_penalty - collection_risk_penalty - burn_volatility_penalty, 0, 100)
```

Use conservative assumptions. If data is stale by more than 7 days, cap confidence at medium. If data is stale by more than 14 days, route a P2 operational incident.

## Modes

Cashflow Ops inherits the current mode from `capital-governor.md`, but may escalate if cash evidence is worse than the selected mode.

| Mode | Trigger | Operating Rule |
| --- | --- | --- |
| STANDARD | runway >= 180d and burn stable | Optimize efficiency, keep growth tests funded |
| WATCH | runway 90-179d or collection risk rising | Weekly review, freeze questionable spend |
| PRESERVATION | runway 45-89d | Cut low-value spend, prioritize collections and conversion |
| EMERGENCY | runway < 45d or critical payment risk | Daily control, revenue-immediate work only |

## Procedure

### 1. Reconcile Cash

Create a cash snapshot:

```json
{
  "as_of": "YYYY-MM-DD",
  "bank_cash": 0,
  "pending_payouts": 0,
  "restricted_cash": 0,
  "critical_payments_14d": 0,
  "available_cash": 0,
  "confidence": "high|medium|low",
  "stale_sources": []
}
```

If reconciliation fails because credentials or exports are missing, write the blocker and proceed with last known values. Missing data is a risk, not a reason to skip the pass.

### 2. Process Collections

Handle failed payments and receivables in this order:

1. High-value failed charges from active customers.
2. Accounts with product usage in the last 14 days.
3. Overdue invoices with clear business value delivered.
4. Low-value failed charges.

Apply the `operator-playbook.md` dunning cadence:

- Day 0: notify with payment update link and product continuity warning.
- Day 3: retry and send value reminder.
- Day 7: escalate with account impact and support path.
- Day 14: final notice, downgrade, pause, or write-off decision.

Do not shame customers. Keep copy factual and helpful.

### 3. Review Spend

Classify expenses:

| Class | Definition | Action |
| --- | --- | --- |
| Critical | Required for uptime, security, payment, or delivery | Keep, monitor renewal |
| Revenue Direct | Clearly tied to active revenue or validated growth | Keep if ROI remains positive |
| Learning | Validated experiment with explicit stop date | Keep only inside mode budget |
| Convenience | Saves time but not tied to revenue or reliability | Cut in PRESERVATION/EMERGENCY |
| Waste | Unused, duplicate, or negative ROI | Cancel immediately |

Every new or increased recurring expense must include expected value, owner, review date, and cancellation path.

### 4. Update Runway And Scores

Recompute:

- `survival_score()` from `scoring.md`
- `cash_discipline_score()` from `scoring.md`
- Capital mode if runway crossed a threshold

If mode changes, invoke `capital-governor.md` for transition handling.

### 5. Route Cash Incidents

Use these severity triggers:

- P0: payment processor unavailable, payroll/critical bill cannot be paid, or cash data shows runway <= 14 days.
- P1: runaway spend, critical subscription at cancellation risk, or failed payments exceed 20% of MRR.
- P2: stale finance data > 14 days, runway below 45 days, or unresolved receivables exceed 10% of MRR.
- P3: minor forecast drift, low-value unused subscription, or documentation gap.

Route P0/P1 immediately to `incident-protocol.md` and pause non-critical Money Engine work.

### 6. Write Weekly Snapshot

Write to `docs/founder/CASHFLOW.md` when that path exists, otherwise write to `~/.atlas/portfolio/[slug]/cashflow.md`.

```markdown
## Cashflow Snapshot - [Date]
**Available Cash:** [amount]
**Revenue In:** [7d, 30d]
**Cash Out:** [7d, 30d]
**Net Burn:** [amount]
**Runway:** [days]
**Mode:** [mode]
**Collection Queue:** [amount/count/action]
**Spend Actions:** [kept/cut/review]
**Top Risk:** [risk]
**Top Mitigation:** [action]
**Scores:** survival [before -> after], cash_discipline [before -> after]
```

## Decision Rules

- If runway is below 90 days, every task must explain cash impact.
- If runway is below 45 days, only retention, collection, conversion, pricing, uptime, and security tasks are eligible.
- If collection risk rises for two consecutive checks, run `offer-forge.md` and `pricing-lab.md` to reduce payment friction.
- If spend waste is found, cancel it before proposing new spend.
- If data confidence is low, the next action is instrumentation or reconciliation, not strategy.

## Hard Rules

- No spending increase without expected-value rationale and review date.
- No unpaid critical-service risk left untracked.
- No optimistic runway based on uncollected pipeline.
- No failed payment queue ignored after a Cashflow Ops pass.
- Always maintain a documented fallback plan for the next capital threshold.
