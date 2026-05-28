---
name: atlas-money-engine
description: Revenue flywheel module for Atlas v7.2. Finds the highest-leverage revenue bottleneck, ships a measurable intervention, validates the result, and records the learning.
---

# Money Engine (v7.2)

Objective: convert growth activity into compounding, attributable cashflow through measured interventions.

Money Engine owns the revenue improvement loop. It chooses one bottleneck, ships one measurable intervention, validates the result, and records the learning so the next cycle compounds.

## Required Inputs

- Current capital mode from `capital-governor.md`.
- Baseline `money_score()`, `revenue_velocity_score()`, `retention_health_score()`, and `monetization_confidence_score()` from `scoring.md`.
- Funnel metrics for 7d and 30d windows.
- Current active offer from `offer-forge.md`.
- Current pricing state from `pricing-lab.md`.
- Channel ROI data from `channel-dominance.md`.
- Open incidents from `~/.atlas/incidents/`.
- Latest growth log and anti-pattern notes from `atlas-brain.md`.

If a metric is unavailable, create or repair instrumentation before relying on the metric. Missing telemetry is a Money Engine task only when it blocks revenue attribution.

## Acceptance Gate

A Money Engine pass is complete only if:

- At least one measurable revenue, retention, activation, or collection intervention ships, unless blocked by P0/P1.
- Instrumentation exists before rollout.
- The chosen intervention has expected value, stop-loss, and rollback.
- Result and confidence are logged in `growth_log.md`.
- `money_score()` and at least one component score are recomputed with deltas.
- Negative or inconclusive outcomes create an anti-pattern or follow-up.

## Incident Blocker Check

Before proceeding, read `~/.atlas/incidents/` for unresolved incidents.

```text
IF unresolved P0 exists:
  SKIP Money Engine
  invoke incident-protocol.md p0_response()
  log defer reason
  return

IF unresolved P1 exists:
  SKIP non-critical growth work
  allow only payment, retention, uptime, or security recovery
  invoke incident-protocol.md p1_response()

IF unresolved P2/P3 exists:
  proceed only if intervention cannot worsen incident risk
  note incident in outcome log
```

## Metrics

Pull or compute:

- Traffic by channel.
- Visitor-to-signup or lead conversion.
- Activation rate and time-to-first-value.
- Trial-to-paid or lead-to-paid conversion.
- Checkout start, checkout completion, and failed payment rate.
- MRR, ARR, ARPU, expansion, contraction, and refunds.
- Logo churn and revenue churn.
- CAC or cost proxy by channel.
- Payback estimate.
- Support load or fulfillment load for monetized users.

Every metric must have source, timestamp, window, and confidence.

## Bottleneck Model

Rank funnel stages by revenue leak:

```text
stage_leak =
  reachable_volume *
  gap_to_reasonable_benchmark *
  revenue_per_success *
  confidence_multiplier
```

Stages:

1. Traffic quality.
2. Activation.
3. Conversion.
4. Payment collection.
5. Retention.
6. Expansion.

Select exactly one primary target. If two stages are within 10%, choose the one with faster feedback and lower rollback cost.

## Intervention Scoring

For each candidate:

```text
expected_value =
  ((projected_money_score_delta * 1.0) +
   (projected_revenue_velocity_delta * 0.6) +
   (projected_retention_health_delta * 0.7) +
   (projected_cash_collected_30d / max(current_mrr, 1) * 20))
  * probability_of_success
  / max(days_to_ship, 1)

risk_adjusted_value =
  expected_value
  * reversibility_multiplier
  * capital_mode_multiplier
  - instrumentation_gap_penalty
  - support_load_penalty
```

Reversibility multiplier:

- Fully reversible: 1.10
- Partially reversible: 1.00
- Hard to reverse: 0.75

Capital mode multiplier:

- SCALE: 1.10 for validated growth, 1.00 otherwise
- BALANCED: 1.00
- PRESERVE: 0.80, and only cash-near or retention work
- SURVIVE: 0.50, and only immediate cash, payment, retention, uptime, or security work

Reject any intervention with `risk_adjusted_value < 5`.

## Allowed Intervention Library

### Traffic Quality

- Reallocate effort to the channel with highest qualified conversion.
- Ship comparison, alternative, or problem-aware content for high-intent searches.
- Create one targeted outreach sequence for a narrow trigger.
- Remove low-intent traffic sources that consume support or onboarding.

### Activation

- Reduce onboarding steps to first-value.
- Add empty-state action that creates the first successful outcome.
- Add lifecycle prompt for users stalled before activation.
- Repair instrumentation for activation event.

### Conversion

- Clarify pricing and package boundaries.
- Add proof near purchase decision.
- Remove checkout friction.
- Launch one `offer-forge.md` candidate.
- Run a constrained `pricing-lab.md` test.

### Payment Collection

- Repair failed payment flow.
- Trigger dunning cadence from `operator-playbook.md`.
- Add payment update path.
- Move high-value invoices into direct follow-up.

### Retention

- Identify churn cohort and ship one save intervention.
- Add success milestone email or in-app reminder.
- Improve reliability or performance for retained users.
- Create win-back path for recently churned accounts.

### Expansion

- Test premium packaging for high-usage accounts.
- Add seat, usage, or team expansion prompt.
- Surface value summary before renewal.
- Identify accounts with expansion trigger and route outreach.

## Procedure

### 1. Establish Baseline

Write:

```markdown
Baseline: [date]
money_score: [value]
revenue_velocity: [value]
retention_health: [value]
monetization_confidence: [value]
capital_mode: [mode]
```

If baseline cannot be computed, fix the smallest missing telemetry path first.

### 2. Select Primary Target

Compute stage leaks and choose one target. Do not split the tick across multiple unrelated funnel stages.

### 3. Score Candidate Interventions

Create 3-5 candidates. Include at least one intervention that can ship in less than one day. Reject candidates that violate capital mode.

### 4. Ship

Before shipping:

- Confirm analytics event names.
- Define before/after window.
- Write rollback steps.
- Define stop-loss threshold.
- Confirm the intervention does not conflict with active incidents.

Ship the highest risk-adjusted intervention.

### 5. Validate

Immediately after shipping:

- Confirm events fire.
- Confirm purchase/payment paths still work.
- Confirm support or fulfillment load did not spike.
- Confirm rollback path is still available.

### 6. Record Outcome

Write to `~/.atlas/portfolio/[slug]/growth_log.md`:

```markdown
## Money Engine - [Date]
**Primary Target:** [stage]
**Baseline:** money [x], component [y]
**Intervention:** [what shipped]
**Hypothesis:** [expected revenue or score delta]
**Expected Value:** [score]
**Capital Mode:** [mode]
**Implementation:** [commit/deploy/content link]
**Instrumentation:** [events/source/window]
**Rollback:** [steps]
**Stop-loss:** [threshold]
**Immediate Validation:** [pass/fail]
**Measured Delta:** [before -> after, when available]
**Confidence:** [high|medium|low + reason]
**Follow-up:** [next queued action]
```

If the result is negative, rollback and append an anti-pattern to `~/.atlas/patterns/`.

## Cadence

- SCALE: weekly Money Engine, plus rapid readouts for high-confidence wins.
- BALANCED: every two weeks or after a major launch.
- PRESERVE: weekly only for conversion, retention, or collection.
- SURVIVE: daily only for payment recovery, retention rescue, or immediate cash collection.

## Handoffs

- Pricing issue: load `pricing-lab.md`.
- Offer issue: load `offer-forge.md`.
- Channel issue: load `channel-dominance.md`.
- Payment collection issue: load `cashflow-ops.md` and `operator-playbook.md`.
- Incident issue: load `incident-protocol.md`.
- Repeated failure pattern: load `atlas-brain.md`.
- Product implementation: load `code-sprint.md`.

## Hard Rules

- No unmeasured interventions.
- No irreversible rollout without rollback recipe.
- No vanity metrics without revenue linkage.
- No parallel unrelated interventions that corrupt attribution.
- No growth work that violates active capital mode.
- If impact is negative, rollback, log the anti-pattern, and do not repeat the same bet without new evidence.
- Recompute `money_score()` at the end of every tick; score delta is the evidence this tick mattered.
