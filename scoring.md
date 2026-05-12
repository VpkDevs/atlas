---
name: atlas-scoring
description: The complete Atlas scoring engine. Every score Atlas computes, with exact formulas, sub-score calculations, and improvement path analysis. Loaded by /atlas diag and /atlas status. Reference this whenever a score changes or a decision requires numeric justification.
---

# Atlas Scoring Engine (v7.1)

Every number Atlas reports is derived from this file. No vague scores. No hand-waving.

---

## 1. Sovereign Score (Primary KPI — /100)

The Sovereign Score measures how close the business is to running itself.

### Computation Algorithm

```
FUNCTION compute_sovereign_score(state):

  s = 0

  # ── Code & Deployment (max 15) ──────────────────────────────────────────
  if zero_p0_bugs:                         s += 5
  if auto_deploy_pipeline_exists:          s += 4   # CI → deploy on push
  if health_endpoint_returns_200:          s += 3
  if runbook_committed:                    s += 3

  # ── Monitoring & Alerting (max 10) ──────────────────────────────────────
  if uptime_monitor_configured:            s += 4
  if error_alerts_configured:             s += 3
  if revenue_alerts_configured:            s += 3

  # ── Email Automation (max 10) ────────────────────────────────────────────
  if welcome_sequence_live:               s += 4
  if activation_sequence_live:            s += 3
  if retention_sequence_live:             s += 3

  # ── Support Automation (max 10) ──────────────────────────────────────────
  if top20_faq_published:                 s += 4
  if auto_responder_configured:           s += 3
  if ticket_routing_live:                 s += 3

  # ── Active Acquisition Channel (max 15) ──────────────────────────────────
  channel_traffic = measure_organic_traffic_7d()
  if channel_traffic > 0:                 s += 5
  if channel_traffic >= 50_weekly_visits: s += 5
  if channel_producing_signups:           s += 5

  # ── Content Engine (max 10) ──────────────────────────────────────────────
  posts_scheduled = count_scheduled_posts()
  if posts_scheduled >= 30:               s += 5
  if recurring_generation_cycle_active:   s += 5

  # ── Iteration Loop (max 10) ──────────────────────────────────────────────
  last_growth_log_entry = read_growth_log_last_entry()
  if last_growth_log_entry within 7 days: s += 5
  if growth_log_shows_shipped_action:     s += 5

  # ── Economic Sovereignty (max 10) ────────────────────────────────────────
  if pl_automated:                        s += 4
  if tax_reserve_funded:                  s += 3
  if credits_management_active:           s += 3

  # ── Social Presence (max 5) ──────────────────────────────────────────────
  if community_reply_rate >= 0.8:         s += 5   # ≥80% of mentions replied to
  elif community_reply_rate >= 0.5:       s += 2

  # ── Documentation (max 5) ────────────────────────────────────────────────
  if runbook_complete:                    s += 2
  if contractor_onboarding_doc_exists:    s += 2
  if investor_update_template_exists:     s += 1

  return s
```

### Thresholds and Meaning

| Score | Milestone | Meaning |
|-------|-----------|---------|
| 0–29 | Pre-launch | Product not running; no automation |
| 30–59 | Operational | Running but not self-sustaining |
| 60 | **Launch floor** | Minimum to publish; no serious gaps |
| 80 | **Sustained** | Most automation live; founder still active daily |
| 90+ | **Sovereign** | System compounds without founder intervention |

### Score Display (Required Format)

After every module, output exactly:

```
═══════════════════════════════
 SOVEREIGN SCORE: [N]/100
  ├── Achievable now:          [N]
  ├── With pending userMust:   [N] (est. [X] hours)
  └── Delta since last run:    [+/- N]

 Distance to milestones:
  ├── To 60 (Launch floor):    [+N or ✅]
  ├── To 80 (Sustained):       [+N or ✅]
  └── To 90 (Sovereign):       [+N or ✅]

 Fastest path to +5 points:
  1. [specific action] — [time estimate]
  2. [specific action] — [time estimate]
  3. [specific action] — [time estimate]
═══════════════════════════════
```

---

## 2. Portfolio Priority Score (Per-Project — /100)

Controls lane assignment. Computed weekly or on-demand.

```
FUNCTION compute_priority_score(project):

  w = {
    time_to_cash:           0.30,
    launch_readiness:       0.20,
    distribution_readiness: 0.15,
    monetization_clarity:   0.20,
    confidence:             0.10,
    capital_efficiency:     0.05,
  }

  scores = {
    time_to_cash:           score_time_to_cash(project),
    launch_readiness:       score_launch_readiness(project),
    distribution_readiness: score_distribution_readiness(project),
    monetization_clarity:   score_monetization_clarity(project),
    confidence:             score_confidence(project),
    capital_efficiency:     score_capital_efficiency(project),
  }

  return sum(w[k] * scores[k] for k in w) * 100
```

### Sub-Score Formulas

#### time_to_cash (0–100)
```
days_to_first_dollar = estimate_days_to_revenue(project)

if days_to_first_dollar <= 7:   return 100
if days_to_first_dollar <= 14:  return 85
if days_to_first_dollar <= 30:  return 70
if days_to_first_dollar <= 60:  return 50
if days_to_first_dollar <= 90:  return 30
else:                           return 10
```

#### launch_readiness (0–100)
```
checklist = [
  ("core_feature_works",        20),
  ("payment_integration_done",  20),
  ("legal_pages_live",          15),
  ("deployed_accessible",       20),
  ("monitoring_configured",     15),
  ("no_p0_bugs",                10),
]
return sum(pts for (item, pts) in checklist if item is True)
```

#### distribution_readiness (0–100)
```
channels_ready = 0
if organic_seo_content_exists:          channels_ready += 25
if social_profile_setup:                channels_ready += 20
if launch_community_identified:         channels_ready += 20
if press_or_newsletter_contacts > 0:    channels_ready += 20
if paid_channel_tested:                 channels_ready += 15
return channels_ready
```

#### monetization_clarity (0–100)
```
if pricing_page_live and stripe_configured:   base = 60
elif pricing_decided but not live:            base = 35
else:                                         base = 10

if target_persona_defined:      base += 15
if payback_estimate_exists:     base += 15
if kill_criterion_defined:      base += 10
return min(base, 100)
```

#### confidence (0–100)
```
# How confident is Atlas that this project will succeed?
signals = [
  has_paying_customer_validation,      # 30 pts
  founder_domain_expertise_confirmed,  # 20 pts
  comparable_success_exists_in_market, # 20 pts
  founder_willing_to_market_it,        # 15 pts
  revenue_model_simple,                # 15 pts
]
return sum(30 if signals[0] else 0, 20 if signals[1] else 0, ...)
```

#### capital_efficiency (0–100)
```
monthly_burn = estimate_monthly_costs(project)
if monthly_burn == 0:      return 100  # pure digital, free tier
if monthly_burn <= 50:     return 90
if monthly_burn <= 200:    return 70
if monthly_burn <= 500:    return 50
if monthly_burn <= 1000:   return 30
else:                      return 10
```

### Lane Assignment Rules

```
IF priority_score >= 70: primary_candidate = True
IF priority_score >= 40: secondary_candidate = True
IF priority_score < 40:  parked = True

# Promotion rule: challenger replaces primary only if:
challenger_score >= current_primary_score + 8
AND challenger.launch_readiness >= 60
AND current_primary.sovereign_score < 60
```

---

## 3. Revenue Velocity Score (0–100)

Measures the quality and acceleration of revenue growth.

```
FUNCTION compute_revenue_velocity_score(mrr_history):

  if len(mrr_history) < 4:  return 50  # insufficient data — neutral

  w4_growth = (mrr_history[-1] - mrr_history[-4]) / max(mrr_history[-4], 1)
  w1_growth = (mrr_history[-1] - mrr_history[-2]) / max(mrr_history[-2], 1)

  # Acceleration signal: is growth rate itself growing?
  prev_w1_growth = (mrr_history[-2] - mrr_history[-3]) / max(mrr_history[-3], 1)
  acceleration = w1_growth - prev_w1_growth

  base_score = min(w4_growth * 200, 70)  # 35% monthly growth = 70 pts
  accel_bonus = min(acceleration * 100, 20)
  consistency_bonus = 10 if all(m > 0 for m in mrr_history[-4:]) else 0

  return max(0, min(base_score + accel_bonus + consistency_bonus, 100))
```

**Targets:** < 40 = stalled. 40–70 = healthy. > 70 = compounding.

---

## 4. Retention Health Score (0–100)

```
FUNCTION compute_retention_health_score(logo_churn_rate_monthly, revenue_churn_rate_monthly):

  # logo churn: % of customers who cancel each month
  # revenue churn: % of MRR lost each month (can be negative = expansion)

  logo_score = max(0, 100 - (logo_churn_rate_monthly * 1000))
  # 0% churn = 100. 5% monthly churn = 50. 10% monthly = 0.

  revenue_score = max(0, 100 - (revenue_churn_rate_monthly * 800))
  # Negative churn (expansion) = score > 100 → cap at 100.

  return (logo_score * 0.4) + (revenue_score * 0.6)
```

**Targets:** < 50 = critical churn problem. 50–75 = manageable. > 75 = healthy. > 95 = expansion territory.

---

## 5. Monetization Confidence Score (0–100)

```
FUNCTION compute_monetization_confidence(experiment_log):

  n_experiments = len(experiment_log)
  statistically_significant = [e for e in experiment_log if e.sample >= e.min_sample]
  conclusive = [e for e in statistically_significant if abs(e.lift) > e.mde]

  cadence_score = min(n_experiments * 10, 40)  # max 40 for running experiments
  significance_score = (len(statistically_significant) / max(n_experiments, 1)) * 30
  clarity_score = (len(conclusive) / max(n_experiments, 1)) * 30

  return cadence_score + significance_score + clarity_score
```

**Targets:** < 40 = guessing on pricing. 40–70 = evidence-based. > 70 = systematic pricing engine.

---

## 6. Cash Discipline Score (0–100)

```
FUNCTION compute_cash_discipline_score(runway_days, failed_charge_trend, burn_volatility):

  runway_score = min(runway_days / 2.5, 40)  # 100 days runway = 40 pts; 250d = max 40

  # Failed charge trend: week-over-week % change
  if failed_charge_trend <= 0:       charge_score = 30    # improving or stable
  elif failed_charge_trend <= 0.10:  charge_score = 20    # < 10% increase
  elif failed_charge_trend <= 0.25:  charge_score = 10    # < 25% increase
  else:                              charge_score = 0     # > 25% increase

  # Burn volatility: standard deviation / mean (coefficient of variation)
  if burn_volatility < 0.10:   volatility_score = 30   # < 10% variation = predictable
  elif burn_volatility < 0.25: volatility_score = 15
  else:                        volatility_score = 0

  return runway_score + charge_score + volatility_score
```

**Targets:** < 30 = financial risk. 30–60 = managed. > 60 = disciplined. > 80 = sovereign.

---

## 7. Fusion Intervention Score (Per-Intervention — 0–100)

Used by the Fusion Router to rank competing interventions.

```
FUNCTION score_fusion_intervention(intervention):

  # Impact: how much will this move a key KPI?
  # 0 = no measurable impact, 10 = transforms the metric
  impact_score = intervention.expected_kpi_delta * 10  # normalized to 0-10 scale

  # Effort: implementation cost in hours (inverse — lower effort = higher score)
  effort_score = max(0, 10 - (intervention.effort_hours / 4))  # 40h effort = 0

  # Reversibility: how easy to undo?
  reversibility_score = {
    "instant":    10,   # feature flag toggle, config change
    "fast":       7,    # git revert in <5 min
    "moderate":   4,    # PR revert + deploy
    "slow":       1,    # DB migration, requires manual steps
    "irreversible": 0,  # cannot undo
  }[intervention.reversibility]

  # Time to cash: how quickly does this convert to revenue?
  ttc_score = {
    "<24h":   10,
    "1-3d":   8,
    "1 week": 6,
    "1 month": 3,
    ">1 month": 1,
  }[intervention.time_to_cash]

  # Legal/compliance risk (hard gate — zero tolerance)
  if intervention.compliance_risk == "HIGH":  return 0

  weights = {"impact": 0.40, "effort": 0.25, "reversibility": 0.20, "ttc": 0.15}

  raw = (
    weights["impact"] * impact_score +
    weights["effort"] * effort_score +
    weights["reversibility"] * reversibility_score +
    weights["ttc"] * ttc_score
  ) * 10

  return round(raw, 1)
```

**Selection rule:** Execute the top-scored intervention. If two interventions score within 5 points, run the more reversible one first.

---

## 8. A/B Test Minimum Sample Calculator

Atlas never calls a test significant without reaching minimum sample size.

```
FUNCTION minimum_sample_size(baseline_rate, minimum_detectable_effect, power=0.80, alpha=0.05):

  # Simplified two-proportion z-test
  # baseline_rate: e.g., 0.05 for 5% conversion
  # mde: e.g., 0.20 for 20% relative improvement (NOT 20pp)
  # Returns: required n per variant

  p1 = baseline_rate
  p2 = baseline_rate * (1 + minimum_detectable_effect)
  p_bar = (p1 + p2) / 2

  z_alpha = 1.960  # α = 0.05, two-tailed
  z_beta  = 0.842  # power = 0.80

  n = ((z_alpha + z_beta) ** 2) * (p1 * (1 - p1) + p2 * (1 - p2)) / ((p2 - p1) ** 2)
  return ceil(n)

# Reference table for Atlas quick decisions:
# Baseline 2%, MDE 20%rel → n = 9,123 per variant (≈18K total)
# Baseline 5%, MDE 20%rel → n = 3,624 per variant (≈7.2K total)
# Baseline 10%, MDE 20%rel → n = 1,760 per variant (≈3.5K total)
# Baseline 10%, MDE 10%rel → n = 7,030 per variant (≈14K total)
```

**Hard rules:**
- Never call a test winner below minimum sample. Log date when minimum is reached.
- Never run more than 1 test on the same funnel step simultaneously.
- Default MDE = 20% relative improvement (ambitious but achievable in SaaS).

---

## 9. Capital Mode Thresholds (Exact)

| Mode | Runway | Burn Trend | Failed Charges | Allowed Actions |
|------|--------|------------|----------------|-----------------|
| SCALE | ≥ 180d | Any | < 5% WoW increase | All growth actions |
| BALANCED | 90–179d | Stable or declining | < 10% WoW increase | Growth + optimization |
| PRESERVE | 45–89d | Any | Any | Retention + conversion only |
| SURVIVE | < 45d | Any | Any | Collections + critical P0 fixes only |

**Mode switching:** Evaluated weekly in cashflow_loop. Mode can only improve (SURVIVE → PRESERVE) when the triggering condition resolves for 14 consecutive days.

---

## 10. Score Report Format

When generating any score report:

```markdown
# Atlas Score Report — [Product Slug] — [ISO Date]

## Sovereign Score: [N]/100

| Category                 | Score | Max | Gap  | Fastest Fix |
|--------------------------|-------|-----|------|-------------|
| Code & Deployment        | [N]   | 15  | [N]  | [action]    |
| Monitoring & Alerting    | [N]   | 10  | [N]  | [action]    |
| Email Automation         | [N]   | 10  | [N]  | [action]    |
| Support Automation       | [N]   | 10  | [N]  | [action]    |
| Active Acquisition       | [N]   | 15  | [N]  | [action]    |
| Content Engine           | [N]   | 10  | [N]  | [action]    |
| Iteration Loop           | [N]   | 10  | [N]  | [action]    |
| Economic Sovereignty     | [N]   | 10  | [N]  | [action]    |
| Social Presence          | [N]   | 5   | [N]  | [action]    |
| Documentation            | [N]   | 5   | [N]  | [action]    |

## Compounding Signals

| Signal                        | Score | Trend     | Target |
|-------------------------------|-------|-----------|--------|
| Revenue Velocity Score        | [N]   | [↑/↓/→]   | > 70   |
| Retention Health Score        | [N]   | [↑/↓/→]   | > 75   |
| Monetization Confidence Score | [N]   | [↑/↓/→]   | > 70   |
| Cash Discipline Score         | [N]   | [↑/↓/→]   | > 60   |

## Top 5 Leverage Actions (Sorted by Score Impact per Hour)

1. [action] → +[N] pts Sovereign Score — [time] — ROI: [pts/hr]
2. [action] → +[N] pts — [time] — ROI: [pts/hr]
3. [action] → +[N] pts — [time] — ROI: [pts/hr]
4. [action] → +[N] pts — [time] — ROI: [pts/hr]
5. [action] → +[N] pts — [time] — ROI: [pts/hr]
```
