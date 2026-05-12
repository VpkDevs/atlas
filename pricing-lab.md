---
name: atlas-pricing-lab
description: Continuous pricing and packaging experimentation with statistical rigor. Runs controlled A/B tests on pricing page, checkout flow, and offer framing. Computes statistical significance before declaring any result. Never makes permanent pricing changes without evidence. Integrates with scoring.md for monetization_confidence scoring and operator-playbook.md for mode constraints.
---

# Pricing Lab (v7.2)

**Objective:** Run a continuous, rigorous pricing experiment cadence that compounds `monetization_confidence_score()` over time.

**Activated by:** `/atlas pricing` or Growth Engine tick when `monetization_confidence < 40` or `conversion_rate < benchmark`.

---

## Acceptance Gate

A Pricing Lab tick is complete **only** if ALL of:
- Baseline metrics pulled from live instrumentation (not estimated)
- One experiment running OR a launch decision documented with reason
- Statistical significance threshold defined for the active experiment
- Stop-loss threshold defined and wired to auto-rollback
- `compute_monetization_confidence()` recomputed from `scoring.md` and delta logged
- Result written to `docs/founder/PRICING_LOG.md`

---

## Step 0: Capital Mode Check

```
Read capital_mode from ATLAS_BRAIN.md → current_capital_mode

IF capital_mode == "SURVIVE":
  SKIP new experiment launch
  DO: process any running experiments (read existing results, make decisions)
  LOG: "Pricing Lab — no new tests in SURVIVE mode. Evaluating existing [N] tests."
  RETURN after Step 3

IF capital_mode in ["PRESERVE", "BALANCED"]:
  MAX 1 active experiment at a time (strict)
  
IF capital_mode == "SCALE":
  MAX 3 concurrent experiments (different funnel stages only)
```

---

## Step 1: Pull Baseline Metrics

Pull the following from live sources. Do not estimate any of these:

```bash
# PostHog: pricing page conversion funnel
# (Adjust event names to match product's actual instrumentation)
curl "https://app.posthog.com/api/projects/@current/insights/funnel/" \
  -H "Authorization: Bearer $POSTHOG_API_KEY" \
  -d '{
    "events": [
      {"id": "viewed_pricing"},
      {"id": "selected_plan"},
      {"id": "checkout_started"},
      {"id": "checkout_completed"}
    ],
    "date_from": "-30d"
  }'
```

```bash
# Stripe: ARPU and failed-payment rate
stripe subscriptions list --status=active --limit=100 \
  | jq '[.data[] | .items.data[0].price.unit_amount] | add / length / 100'
  # → monthly ARPU in dollars
```

**Baseline record (write to `docs/founder/PRICING_LOG.md` before any change):**

```markdown
## Pricing Baseline — [ISO date]
| Metric | Value | Source |
|--------|-------|--------|
| Pricing page → plan selected | [X]% | PostHog funnel |
| Plan selected → checkout start | [X]% | PostHog funnel |
| Checkout start → paid | [X]% | PostHog / Stripe |
| Overall: pricing page → paid | [X]% | Computed |
| ARPU | $[X]/mo | Stripe |
| MRR | $[X] | Stripe |
| monetization_confidence_score | [X]/100 | scoring.md |
```

**If ANY event is missing** (viewed_pricing not tracked, etc.):
- Commit the tracking event before proceeding
- The baseline is invalid without instrumentation

---

## Step 2: Identify the Highest-Leverage Test

Use this priority order — the first applicable test is the one to run:

```
FUNCTION select_experiment(baseline):

  # 1. Highest-leverage test by funnel position
  # Fix the biggest leak first
  
  if baseline.pricing_to_plan_selected < 0.15:
    return "PRICING_PAGE_CLARITY"
    # Problem: visitors don't understand what they're buying
    # Test: clearer value proposition, fewer plan options, better comparison

  if baseline.plan_selected_to_checkout_start < 0.60:
    return "FRICTION_REDUCTION"
    # Problem: people select a plan but don't start checkout
    # Test: inline checkout, remove redirect step, stronger CTA copy

  if baseline.checkout_to_paid < 0.70:
    return "CHECKOUT_TRUST"
    # Problem: checkout dropout (objections, fear)
    # Test: trust signals (logos, refund policy, testimonial near button)

  if baseline.arpu < benchmark_arpu_for_segment:
    return "PRICE_POINT_TEST"
    # Problem: underpriced
    # Test: +20% price increase on new signups only

  if no_active_annual_option:
    return "ANNUAL_PLAN_TEST"
    # Test: add annual option at ~2 months discount (~17% off)
    # Expected: ARPU uplift + reduced churn

  return "PACKAGING_TEST"
  # Default: reframe what's included at each tier
```

---

## Step 3: Experiment Design Protocol

For every experiment, define ALL of these before any code is written:

```markdown
## Experiment: [NAME] — [ISO date]

**Hypothesis:**
"Changing [X] will increase [metric] from [baseline] to [target]
because [causal mechanism]."

**Variant A (Control):** [current state — exact description]
**Variant B (Test):**    [proposed change — exact description]

**Primary metric:** [one metric — e.g., checkout_completion_rate]
**Guardrail metric:** [must not degrade — e.g., 30d retention rate]

**Segment:**
- [ ] All new visitors (clean split)
- [ ] Specific plan tier only
- [ ] Geographic segment: [specify]
- [ ] Traffic source: [specify]

**Sample size requirement:**
minimum_n = ceil(
  (z_alpha + z_beta)^2 * 2 * p * (1-p) / mde^2
)
# Using: α = 0.05 (z = 1.96), β = 0.20 (z = 0.84), p = baseline_rate, mde = 0.05 (5% abs)
# Pre-compute this number. Do not run the test without knowing when to stop.

**Minimum detectable effect (MDE):** [X]% absolute change
**Expected duration:** [N] days at current traffic volume

**Stop-loss threshold:**
If primary metric drops > [X]% below baseline for > [N] consecutive days:
  AUTO-ROLLBACK: [exact command or feature flag toggle]

**Decision threshold:**
If primary metric improves > [X]% above baseline AND sample >= minimum_n:
  Statistical test: chi-square for rates, t-test for continuous
  Required p-value: < 0.05
  KEEP if: result is statistically significant AND guardrail metric not degraded

**Rollback procedure:**
  git revert [commit] && git push
  # OR: feature flag: process.env.PRICING_VARIANT = 'control'
  # OR: config change: [exact file + line]
```

---

## Step 4: Statistical Significance Test

Do not declare any result without running this:

```python
# chi-square test for conversion rate comparison
from scipy.stats import chi2_contingency
import numpy as np

def significance_test(control_visitors, control_conversions,
                      test_visitors, test_conversions):
    """
    Returns: (is_significant, p_value, lift_pct, confidence_interval)
    """
    table = np.array([
        [control_conversions, control_visitors - control_conversions],
        [test_conversions,    test_visitors - test_conversions]
    ])
    
    chi2, p_value, dof, expected = chi2_contingency(table)
    
    control_rate = control_conversions / control_visitors
    test_rate    = test_conversions / test_visitors
    lift_pct     = (test_rate - control_rate) / control_rate * 100
    
    # Wilson confidence interval for test rate
    z = 1.96
    center = test_rate
    margin = z * np.sqrt(test_rate * (1 - test_rate) / test_visitors)
    
    return {
        "is_significant": p_value < 0.05,
        "p_value": round(p_value, 4),
        "lift_pct": round(lift_pct, 1),
        "ci_low":  round((center - margin) * 100, 1),
        "ci_high": round((center + margin) * 100, 1),
        "sample_sufficient": min(control_visitors, test_visitors) >= minimum_n
    }
```

**If `sample_sufficient` is False:** Do NOT declare a result. Extend the test.
**If `p_value >= 0.05`:** Inconclusive. Extend or kill if direction is clearly negative.
**If `p_value < 0.05` and `lift_pct > 0`:** Implement the winner.
**If `p_value < 0.05` and `lift_pct < 0`:** The test variant is worse. Roll back immediately.

---

## Step 5: Price Point Test Mechanics

This is the most impactful and most dangerous test. Specific rules:

```
PRICE POINT TEST PROCEDURE:

1. Only test on NEW signups (never change price for existing customers mid-term)
2. Implement via feature flag or URL parameter (A/B traffic split at routing layer)
3. Start with +20% price increase as first test
   Rationale: most SaaS products are underpriced; +20% rarely kills conversion
   enough to reduce MRR
4. Run for minimum 200 paid conversions per variant (not just visitors)
5. Measure: not just conversion rate but MRR impact
   MRR_impact = (test_conversion_rate × test_price) vs. (control_rate × control_price)
   A 10% conversion drop with a 25% price increase = net MRR positive
6. Guardrail: 90-day retention rate must not drop > 5% relative
   (Higher prices attract better customers; lower prices attract price-sensitive ones)

ROLLBACK:
  feature_flag_off OR:
  git revert [pricing-component commit] && vercel --prod
```

---

## Step 6: Decision and Logging

After every experiment concludes (statistically significant result or timeout):

```markdown
## Experiment Result — [NAME] — [ISO date]

**Status:** [WON / LOST / INCONCLUSIVE / KILLED]

**Final metrics:**
| Metric | Control | Test | Lift | p-value |
|--------|---------|------|------|---------|
| [primary_metric] | [X]% | [X]% | [+/-X]% | [X] |
| [guardrail_metric] | [X] | [X] | [+/-X]% | [X] |

**Sample:** [N control] / [N test] visitors (minimum required: [N])
**Duration:** [N] days

**Decision:** [IMPLEMENT / ROLL BACK / EXTEND / KILL]
**Reason:** [specific — not "not significant" but why]

**Action taken:**
  - [git commit hash if implemented]
  - [rollback command if reverted]

**monetization_confidence_score delta:** [before] → [after]

**Next experiment queued:** [NAME or "none — monitoring current state"]
```

---

## Step 7: Update Scores and Brain

```
1. Recompute compute_monetization_confidence() from scoring.md
   → Inputs: n_experiments, statistically_significant count, conclusive count
   → Log delta

2. Write ATLAS_BRAIN.md update:
   Key Decision if winner: "[DATE] Raised Individual plan to $X — +Y% MRR confirmed, p=Z"

3. If monetization_confidence_score > 70:
   → Pricing Lab shifts to quarterly cadence
   → Note in ATLAS_BRAIN.md: "Pricing systematized — lab on quarterly review"
```

---

## Experiment Queue (Canonical Priority Order)

Run in this order. Never run two tests that touch the same funnel stage simultaneously.

| # | Test | Funnel Stage | Expected Lift | Effort |
|---|------|-------------|---------------|--------|
| 1 | Pricing page clarity (fewer options, clearer value) | Page → plan select | +5-15% | Low |
| 2 | Annual plan introduction (17% discount) | Plan select → ARPU | +20-40% ARPU | Low |
| 3 | Price point +20% for new signups | Plan select → paid | +10-20% MRR | Low |
| 4 | Trial length test (7d vs 14d vs no trial) | Paid conversion | Variable | Medium |
| 5 | Trust signals near checkout button | Checkout → paid | +5-10% | Low |
| 6 | Removal of lowest-priced tier | ARPU | +15-30% ARPU | Low |
| 7 | Usage-based pricing signal (if applicable) | ARPU expansion | +10-25% | High |

---

## Hard Rules

- No permanent pricing changes without statistically significant evidence (p < 0.05)
- No test declared significant without minimum sample size met
- No dark patterns: no fake urgency, no hidden fees, no bait-and-switch
- No test without a rollback procedure written before the test starts
- No two tests touching the same funnel stage simultaneously
- Price changes apply only to new signups unless explicitly stated otherwise

## Red Flags

- ❌ Declaring "pricing page improved" based on < 50 conversions
- ❌ Running a test for 3 days and calling it conclusive
- ❌ Changing existing customers' prices without explicit communication
- ❌ A/B testing with an unfair split (90/10 instead of 50/50)
- ❌ No guardrail metric defined (primary metric wins but retention collapses)
- ❌ Experiment running in SURVIVE mode (collections first, experiments later)
