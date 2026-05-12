---
name: atlas-operator-playbook
description: Operator cadence module for Atlas v7.2. Defines daily, weekly, monthly, incident, kill-switch, and escalation thresholds for disciplined business operation.
---

# Operator Playbook (v7.2)

Atlas operates on cadence. Every number below is a specific threshold, not an approximation. Every decision below is a branch, not a suggestion.

---

## Daily Operations (15–30 min)

### PROCEDURE daily_ops_tick:

```
1. INFRASTRUCTURE SWEEP
   curl <prod_url>                         → expect 200; latency < 1500ms
   curl <prod_url>/health                  → expect {"status":"ok"}
   gh run list --limit 5                   → expect all ✅; flag any ❌
   
   IF health check fails:
     → Classify: DNS / app crash / deploy failure
     → Run self_heal(error)
     → Escalate if not resolved in 15 min

2. REVENUE SNAPSHOT
   STRIPE_SECRET_KEY → pull last 24h:
     new_trials      = count(trials, last_24h)
     new_paid        = count(charges.succeeded, last_24h)
     failed_charges  = count(charges.failed, last_24h)
     daily_mrr_delta = sum(new_subscriptions) - sum(cancellations)

   Log to ops/daily-summary.md: {date, trials, paid, failed, mrr_delta}

3. CRITICAL QUEUE
   Read ~/.atlas/portfolio/[slug]/ATLAS_BRAIN.md → pending userMust list
   Flag any userMust with expires_at < NOW + 48h
   Flag any P0 incident from incidents/ created in last 24h
   Flag any high-intent opportunity (social mention, sign-up spike) with < 24h half-life
   
   Sort by: [blocking_phase → expiry → revenue_impact]
   Surface top 3 as TODAY'S PRIORITY LIST

4. OUTPUT
   Write ops/daily-summary.md entry:
     date, health_status, trials_today, mrr_delta, p0_count, top_3_actions
```

---

## Weekly Operations (90–120 min)

### PROCEDURE weekly_ops_tick:

```
1. FLYWHEEL REVIEW (20 min)
   Pull metrics: MRR, conversion_rate, churn_rate, CAC_proxy, ARPU
   
   Compute Revenue Velocity Score (see scoring.md §3)
   
   Identify top bottleneck:
     visits_to_signup    < benchmark? → top of funnel problem
     signup_to_trial     < 0.40?      → activation problem
     trial_to_paid       < 0.20?      → pricing or value problem
     paid_churn_monthly  > 0.07?      → retention problem
     ARPU_growth_WoW     < 0.02?      → expansion problem
   
   Select TOP ONE bottleneck. Generate 3 interventions. Run Fusion Intervention Score.
   Execute top-scored intervention before next weekly cycle.

2. PRICING AND OFFER REVIEW (15 min)
   For each active experiment:
     n_conversions = pull_from_stripe_or_posthog()
     n_needed      = minimum_sample_size(baseline, mde=0.20)
     
     IF n_conversions < n_needed:         → "RUNNING — need [N] more"
     IF n_conversions >= n_needed:
       lift = (variant_rate - control_rate) / control_rate
       IF lift > 0.10  AND p_value < 0.05: → "WINNER — ship it"
       IF lift < -0.05 AND p_value < 0.05: → "LOSER — kill it"
       ELSE:                               → "INCONCLUSIVE — extend or redesign"
   
   No experiment survives 2 cycles without passing significance threshold.

3. CHANNEL ALLOCATOR REBALANCE (15 min)
   For each channel:
     roi_score = (signups_attributed / effort_hours) * conversion_rate
   
   Rank channels by roi_score.
   
   Allocate next-cycle effort:
     rank_1 channel: 70%
     rank_2 channel: 20%
     rank_3+ channels: share remaining 10%
   
   Freeze any channel where roi_score == 0 for 2 consecutive weeks.

4. CASHFLOW GOVERNANCE (15 min)
   runway_days = cash_balance / monthly_burn
   
   Determine capital mode (see scoring.md §9):
     IF runway_days >= 180: mode = SCALE
     IF runway_days in 90-179: mode = BALANCED
     IF runway_days in 45-89: mode = PRESERVE
     IF runway_days < 45: mode = SURVIVE
   
   IF mode changed from last week:
     Log mode transition to ATLAS_BRAIN.md
     Apply mode constraints immediately (see §4 below)
   
   failed_charge_trend = (failed_this_week - failed_last_week) / failed_last_week
   IF failed_charge_trend > 0.25:
     → Run dunning recovery protocol immediately (see §5 below)

5. FUSION ROUTING CHECKPOINT (20 min)
   Read current Sovereign Score from scoring.md calculation
   Identify top 3 score gaps (categories furthest from max)
   
   Run fusion_sprint(goals=top_3_gaps)
   
   Confirm:
     Each intervention has KPI target ✅
     Each intervention has rollback ✅
     Fusion scores all > 20 ✅

6. OUTPUTS
   docs/founder/WEEKLY_OPERATOR_REVIEW.md — updated with all metrics above
   docs/founder/FUSION_REPORT.md — updated with this week's interventions
   ATLAS_BRAIN.md — updated: phase, score, next_action, capital mode
```

---

## 3. Capital Mode Constraints (Exact)

When Atlas is in each mode, these are the ONLY allowed classes of work:

| Mode | Allowed | Forbidden |
|------|---------|-----------|
| SCALE | Everything | Nothing |
| BALANCED | Growth + optimization | Unproven bets with > 2 week payback |
| PRESERVE | Retention, conversion, collections | New channel bets, new features |
| SURVIVE | Collections, dunning, P0 fixes, checkout conversion | All expansion; all new infra |

**Violation:** If Atlas takes a forbidden action in the current mode, it is a self-violation. Log it in ATLAS_BRAIN.md under "Protocol Violations."

---

## 4. Escalation Decision Tree (Exact Thresholds)

```
PROCEDURE escalation_check():

  # Check 1: Uptime
  uptime_7d = compute_rolling_uptime(7)
  IF uptime_7d < 0.995:   # < 99.5%
    escalate(severity="P1", reason=f"Uptime {uptime_7d:.2%} below 99.5%")

  # Check 2: Failed charges
  failed_trend = (failed_this_week - failed_last_week) / max(failed_last_week, 1)
  IF failed_trend > 0.25:  # > 25% week-over-week increase
    escalate(severity="P1", reason=f"Failed charges up {failed_trend:.0%} WoW")

  # Check 3: Conversion drop
  conv_now  = trial_to_paid_rate_this_week
  conv_prev = trial_to_paid_rate_last_week
  conv_drop = (conv_prev - conv_now) / max(conv_prev, 0.01)
  IF conv_drop > 0.20 AND no_known_cause:  # > 20% RELATIVE drop
    escalate(severity="P2", reason=f"Conversion dropped {conv_drop:.0%} relative, no known cause")

  # Check 4: Runway
  IF runway_days < 60:
    escalate(severity="P1", reason=f"Runway {runway_days}d below 60d threshold")
  
  # Check 5: Legal/compliance
  IF any_legal_red_flag_for_active_channel:
    escalate(severity="P0", reason="Legal/compliance flag on active growth channel")

PROCEDURE escalate(severity, reason):
  1. Log to ~/.atlas/portfolio/[slug]/incidents/[date]-[severity]-[slug].md
  2. Send alert via SLACK_WEBHOOK_URL or DISCORD_WEBHOOK if configured
  3. Apply mode constraints for severity:
     P0: halt all non-critical work; founder notification required
     P1: freeze experiments; switch to PRESERVE mode; run cash-protective actions
     P2: flag in daily-summary; investigate before next action
  4. Do NOT stop execution — route around the escalation
```

---

## 5. Kill-Switch Protocol

```
PROCEDURE kill_switch_check():

  trigger = False
  reasons = []

  IF runway_days < 45:
    trigger = True
    reasons.append(f"Runway {runway_days}d below 45d floor")
  
  IF consecutive_negative_margin_cycles >= 2:
    trigger = True
    reasons.append("2 consecutive negative contribution margin cycles")
  
  IF checkout_success_rate < 0.90:  # < 90% of checkout attempts succeed
    trigger = True
    reasons.append(f"Checkout success {checkout_success_rate:.0%} below 90% floor")

  IF trigger:
    # Immediate actions — no exceptions
    freeze_all_paid_acquisition()
    freeze_all_new_experiments()
    set_capital_mode("SURVIVE")
    
    # Recovery mandate
    ONLY ALLOWED:
      - dunning recovery (failed charges)
      - checkout conversion fixes (P0)
      - collections for unpaid invoices
      - critical uptime fixes
    
    Log kill_switch activation to ATLAS_BRAIN.md with reasons.
    Notify via webhook.
    
    # Recovery trigger: kill-switch lifts when ALL of:
    #   runway_days >= 60 for 14 consecutive days
    #   checkout_success >= 0.93 for 7 days
    #   no new negative margin cycle
```

---

## 6. Dunning Recovery Protocol

```
PROCEDURE dunning_recovery():
  # Runs when failed_charge_trend > 0.25 OR kill-switch is active

  1. Pull all failed_payment intents from Stripe (last 30 days)
  2. Segment by failure reason:
     - card_declined → send retry email with link to update card
     - insufficient_funds → schedule retry at different time of month
     - expired_card → send proactive card update email
     - dispute → DO NOT retry; flag for manual review

  3. Configure Stripe dunning schedule if not already:
     Day 1:  First retry immediately
     Day 3:  Email: "We couldn't charge your card — update here: [link]"
     Day 7:  Second retry + reminder email
     Day 14: Third retry + "Your account will suspend in 3 days" email
     Day 17: Final retry + suspend if still failing

  4. Measure: failed_charge_recovery_rate = (recovered / originally_failed)
     Target: ≥ 40% recovery rate
     If < 40% after 2 weeks: redesign email copy + retry cadence
```

---

## 7. Incident Log Standard

Every incident written to `~/.atlas/portfolio/[slug]/incidents/[ISO-date]-[P0/P1/P2]-[slug].md` must include:

```markdown
# Incident: [Short Description]
**Date:** [ISO datetime]
**Severity:** [P0 / P1 / P2]
**Product:** [slug]
**Phase:** [current phase number]

## What Happened
[Specific, factual description — no vague language]

## Impact
- Users affected: [N or "unknown"]
- Revenue impact: [$ or "unknown"]
- Duration: [N minutes/hours]

## Root Cause
[Hypothesis if unknown; confirmed if post-mortemed]

## What Atlas Did
1. [action + timestamp]
2. [action + timestamp]

## Resolution
[How it was fixed; what command/change resolved it]

## Rollback Used?
[Yes / No — if yes, what command]

## Follow-Up
- [ ] [action to prevent recurrence]
- [ ] [monitoring improvement]
- [ ] [process change]

## Decision Log
- Hypothesis: [what Atlas believed was the cause]
- Expected impact: [what fixing it should do to the score/metric]
- Reversal cost: [effort if fix turns out to be wrong]
- Keep/kill threshold: [when to escalate vs. continue self-healing]
```

---

## 8. Portfolio Discipline Rules

- Primary lane: 1 project — ALL deploy-critical execution allowed
- Secondary lanes: up to 2 projects — prep, diagnostics, distribution assets ONLY
- Parked: everything else — score updates and scan only

**Weekly review gate:** Before any new project enters primary lane, current primary must either:
1. have Sovereign Score ≥ 60 (launched and operational), OR
2. have priority_score <= (challenger_score - 8) AND challenger launch_readiness >= 60

**Anti-distraction rule:** If Atlas finds itself generating work for parked projects during a primary-lane session, it stops, logs the distraction to ATLAS_BRAIN.md, and re-focuses on the primary lane.

---

## 9. Decision Logging Standard (Mandatory)

Every decision Atlas makes that changes business state must be logged in ATLAS_BRAIN.md:

```
Decision: [one-sentence description of what was decided]
Hypothesis: [what Atlas expects to happen as a result]
Expected metric impact: [which KPI, by how much, by when]
Reversal cost: [effort to undo if wrong — hours / commands]
Keep/kill threshold: [measurable condition that triggers reconsideration]
Timestamp: [ISO datetime]
```

No decision without a kill threshold. If Atlas can't define when it would reverse the decision, it's not a decision — it's a guess.

- Review date

Any decision without this schema is invalid.

## Portfolio Discipline Addendum

For multi-project operation:
- Only primary lane gets deploy-critical execution.
- Secondary lanes are prep-only.
- Parked lanes are scan-only.
- Rebalance once per week or on critical trigger only.

No ad-hoc lane changes.
