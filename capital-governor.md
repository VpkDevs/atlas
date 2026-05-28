---
name: atlas-capital-governor
description: Capital posture module for Atlas v7.2. Selects and enforces scale, balanced, preserve, or survive mode from runway, volatility, collections, cash discipline, and incident state.
---

# Capital Governor (v7.2)

Objective: maximize survival and compounding by adapting Atlas's operating posture to runway, volatility, collections, and incident risk.

Capital Governor is the authority for spend posture. It does not replace founder consent for real financial commitments; it constrains what Atlas is allowed to propose, ship, or automate under current capital conditions.

## Required Inputs

- Cash snapshot from `cashflow-ops.md`.
- Revenue, churn, failed payment, and refund data.
- Current `survival_score()` and `cash_discipline_score()` from `scoring.md`.
- Open P0-P3 incidents from `incident-protocol.md`.
- Active experiments and budgets from `money-engine.md`, `growth-engine.md`, `pricing-lab.md`, and `offer-forge.md`.
- Portfolio priority from `portfolio-os.md` if multiple projects exist.

If cash data is stale, Governor must reduce confidence and choose the more conservative mode.

## Acceptance Gate

Complete only if:

- Current mode is selected from hard thresholds.
- Any incident or stale-data override is applied.
- Mode-specific spend, experiment, and execution constraints are written.
- Transition rationale is logged when mode changes.
- `survival_score()` and `cash_discipline_score()` are recomputed and delta from last tick recorded.
- Downstream modules receive the active mode in their next action plan.

## Mode Selection

Base mode is selected by runway. Overrides can only make the mode more conservative.

| Mode | Runway Condition | Burn Stability | Default Cadence | Spend Posture |
| --- | --- | --- | --- | --- |
| SCALE | >= 180d | stable | weekly growth and money cycles | fund validated growth |
| BALANCED | 90-179d | any | biweekly money cycles | ROI-gated experimentation |
| PRESERVE | 45-89d | any | weekly cash and retention cycles | freeze low-value spend |
| SURVIVE | < 45d | any | daily cash control | revenue-immediate only |

## Override Rules

Apply in this order:

1. Unresolved P0: mode becomes SURVIVE until resolved.
2. Unresolved P1: mode floors to PRESERVE until mitigated.
3. Finance data stale > 14 days: mode floors to PRESERVE.
4. Failed payments > 20% of MRR: mode floors to PRESERVE.
5. Refunds/disputes > 8% of 30d revenue: mode floors to PRESERVE and routes to `incident-protocol.md` P2.
6. Burn volatility > 35% month over month: SCALE is disallowed.
7. Portfolio has no launched revenue lane: SCALE is disallowed even with high runway.

## Procedure

### 1. Compute Capital State

```json
{
  "as_of": "YYYY-MM-DD",
  "available_cash": 0,
  "runway_days": 0,
  "monthly_net_burn": 0,
  "burn_volatility": 0,
  "failed_payment_ratio": 0,
  "refund_dispute_ratio": 0,
  "data_confidence": "high|medium|low",
  "open_incidents": {"p0": 0, "p1": 0, "p2": 0, "p3": 0}
}
```

### 2. Select Mode

Choose base mode from runway, apply overrides, and record:

```markdown
## Capital Mode Decision - [Date]
Base mode: [mode]
Overrides: [none or list]
Final mode: [mode]
Reason: [data-backed rationale]
Scores: survival [before -> after], cash_discipline [before -> after]
```

### 3. Apply Constraints

| Constraint | SCALE | BALANCED | PRESERVE | SURVIVE |
| --- | --- | --- | --- | --- |
| New paid tools | Allowed with ROI case | Only if payback <= 30d | Blocked unless critical | Blocked unless uptime/payment/security |
| Growth experiments | Multiple lanes | One or two ROI-gated lanes | One cash-near lane | Only immediate cash recovery |
| Product build | Revenue or retention linked | Revenue or reliability linked | Conversion, retention, uptime only | Critical fixes only |
| Pricing tests | Continuous | Controlled | Cash-positive only | Immediate collection/recovery |
| Offer tests | Entry/core/premium | Entry/core | Rescue/core only | Rescue/cash collection only |
| Portfolio work | Primary plus secondary prep | Primary plus limited prep | Primary only | Active revenue lane only |

### 4. Budget Experiments

Set budget ceilings as percentages of available cash, unless the founder has a stricter cap:

- SCALE: up to 6% monthly experiment budget.
- BALANCED: up to 3% monthly experiment budget.
- PRESERVE: up to 1%, only reversible and cash-near.
- SURVIVE: 0% except payment, uptime, security, or collection tooling.

No budget is authorized unless the action has owner, expected value, stop-loss, and review date.

### 5. Notify Downstream Modules

Write the mode into:

- `~/.atlas/portfolio/[slug]/context.json` as `capital_mode`
- `~/.atlas/portfolio/[slug]/capital_log.md`
- Dashboard state if present

Downstream behavior:

- `money-engine.md`: uses mode to reject low-EV interventions.
- `offer-forge.md`: uses mode to choose allowed offer types.
- `pricing-lab.md`: uses mode to choose risk tolerance.
- `portfolio-os.md`: uses mode to constrain active lanes.
- `fleet-subagents.md`: uses mode to limit parallel work.

## Transition Playbooks

### SCALE -> BALANCED

- Freeze speculative experiments that lack 30d readouts.
- Keep validated acquisition and retention work.
- Increase Cashflow Ops cadence to weekly.
- Require rollback for every new growth change.

### BALANCED -> PRESERVE

- Cancel or pause convenience spend.
- Collapse execution to one revenue lane.
- Run failed-payment and retention pass immediately.
- Queue only conversion, collection, retention, and reliability work.

### PRESERVE -> SURVIVE

- Invoke `incident-protocol.md` as P2 minimum, P1 if critical payment risk exists.
- Stop all non-critical build and brand work.
- Run daily Cashflow Ops.
- Ship only cash collection, payment recovery, conversion repair, uptime, or security fixes.

### Conservative -> Less Conservative

Only move to a less restrictive mode if:

- Runway threshold is cleared for 14 consecutive days.
- No unresolved P0/P1 incident exists.
- Data confidence is high or medium.
- Cash Discipline score is stable or improving.
- Active experiments have rollback paths.

## Output Template

```markdown
## Capital Governor - [Date]
**Final Mode:** [SCALE|BALANCED|PRESERVE|SURVIVE]
**Runway:** [days]
**Data Confidence:** [high|medium|low]
**Overrides:** [list]
**Allowed Work:** [summary]
**Blocked Work:** [summary]
**Experiment Budget:** [amount or 0]
**Scores:** survival [before -> after], cash_discipline [before -> after]
**Next Review:** [date or trigger]
```

## Hard Rules

- No mode without data or an explicit stale-data fallback.
- No spend increase in PRESERVE or SURVIVE without founder-visible override rationale.
- No SCALE mode with unresolved P0/P1 incidents or stale cash data.
- Always keep one measurable revenue or retention improvement lane active unless a P0 blocks all work.
- Recompute scores at every mode evaluation; mode is an evidence-backed control, not a mood.
