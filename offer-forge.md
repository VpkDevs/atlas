---
name: atlas-offer-forge
description: Offer experiment module for Atlas v7.2. Creates, scores, validates, and retires offers with explicit buyer, trigger, outcome, price, proof path, telemetry, and kill criteria.
---

# Offer Forge (v7.2)

Objective: continuously create, validate, and retire offers until the business has a high-conviction path to cashflow.

Offer Forge is not copywriting. It is a controlled revenue experiment system. Every offer must connect a named buyer, a painful trigger, a concrete outcome, a believable mechanism, a price, and a measurable proof path.

## Required Inputs

Before drafting or changing any offer, collect:

- Current product state and delivery constraints.
- Best-fit persona and disqualified persona.
- Last 10 support objections, sales objections, failed checkout reasons, or churn reasons.
- Current pricing and packaging from `pricing-lab.md`.
- Current funnel leak from `money-engine.md`.
- Baseline `money_score()` and `monetization_confidence_score()` from `scoring.md`.
- Any active capital mode from `capital-governor.md`.

If real customer data is absent, use evidence proxies in this order: search intent, competitor positioning, community complaints, founder notes, then reasoned assumptions. Mark every proxy as low-confidence until validated.

## Acceptance Gate

An Offer Forge pass is complete only if:

- One offer is launched or one existing offer is explicitly killed with evidence.
- Keep, iterate, and kill thresholds are declared before launch.
- Instrumentation is active for views, qualified actions, checkout starts, purchases, refunds, and churn.
- The offer has a rollback path that can be executed in one work session.
- `monetization_confidence_score()` and projected `money_score()` delta are logged.
- The offer record is written to `~/.atlas/portfolio/[slug]/offers/[date]-[offer-slug].json`.

## Offer Types

Use the smallest offer that can test the riskiest monetization assumption.

| Type | Use When | Success Signal | Failure Signal |
| --- | --- | --- | --- |
| Entry Offer | Trust is low or first-value moment is unclear | High qualified conversion and low refund risk | Buyers need hand-holding that breaks margin |
| Core Offer | Product value is understood and delivery is reliable | Trial-to-paid or direct paid conversion improves | Objections cluster around unclear outcome |
| Premium Offer | Buyers value speed, certainty, support, or leverage | ARPU rises without churn or support load spike | Expansion demand is weak or delivery risk rises |
| Rescue Offer | Churn or failed payments are rising | Retention or recovery improves | Discounts train low-quality demand |
| Waitlist Offer | Product is not ready but demand needs proof | Qualified deposits, calls, or committed LOIs | Interest is vague and not tied to urgency |

## Offer Card Schema

Each offer must be written with this schema:

```json
{
  "id": "YYYY-MM-DD-offer-slug",
  "persona": "specific buyer segment",
  "disqualified_persona": "who should not buy",
  "trigger": "urgent event that creates buying intent",
  "pain": "cost of inaction in buyer language",
  "promise": "measurable outcome",
  "mechanism": "why this offer can deliver the outcome",
  "proof": "evidence, demo, benchmark, case study, or proxy",
  "package": "what is included and excluded",
  "price": "amount and billing model",
  "guarantee": "risk reversal or none with rationale",
  "payback_hypothesis": "how buyer recovers cost",
  "primary_metric": "single metric deciding the test",
  "guardrail_metrics": ["refunds", "support load", "churn"],
  "keep_threshold": "numeric threshold",
  "iterate_threshold": "numeric threshold",
  "kill_threshold": "numeric threshold",
  "rollback": "exact revert steps",
  "confidence": "high|medium|low with evidence"
}
```

## Scoring

Score every candidate before launch:

```text
offer_ev =
  ((projected_mrr_delta * conversion_probability) +
   (projected_retention_delta * current_mrr) +
   (projected_expansion_delta * active_accounts * arpu))
  / max(days_to_validate, 1)

risk_penalty =
  delivery_complexity * 0.20 +
  support_load_risk * 0.20 +
  brand_risk * 0.15 +
  refund_risk * 0.25 +
  instrumentation_gap * 0.20

offer_score = clamp((offer_ev * confidence_multiplier) - risk_penalty, 0, 100)
```

Confidence multipliers:

- High: 1.00, based on customer behavior or paid commitments.
- Medium: 0.70, based on repeated objections, demos, or competitor evidence.
- Low: 0.45, based on founder intuition or weak proxy data.

Launch the highest `offer_score` that also clears the capital mode constraint:

- SCALE: score >= 55 and risk penalty <= 35.
- BALANCED: score >= 65 and risk penalty <= 25.
- PRESERVE: score >= 75, reversible, and expected cash impact inside 14 days.
- SURVIVE: only launch offers that can collect cash or recover revenue inside 7 days.

## Procedure

### 1. Diagnose Demand

Build an objection map:

```text
objection -> source -> frequency -> revenue impact -> offer lever
```

Offer levers are: persona, promise, package, price, proof, guarantee, urgency, onboarding, payment terms, or retention support.

If objections are mostly product capability gaps, route to `code-sprint.md`.
If objections are mostly price or packaging gaps, route to `pricing-lab.md`.
If objections are mostly trust gaps, route to `brand-engine.md` and `marketing-playbook.md`.

### 2. Draft Candidates

Create exactly three candidates:

- Conservative: small packaging or proof change with fast validation.
- Focused: direct fix for the highest-revenue objection.
- Aggressive: premium, guarantee, or market repositioning bet.

Reject candidates that cannot be measured in the current system.

### 3. Choose The Test

Rank by `offer_score`. If the top two are within 5 points, choose the one with faster validation and lower rollback cost.

Write the decision:

```markdown
## Offer Decision - [Date]
Selected: [offer id]
Rejected: [candidate ids]
Reason: [score, evidence, risk]
Capital mode: [mode]
Primary metric: [metric]
Stop-loss: [kill threshold]
```

### 4. Ship The Minimum Viable Offer

Ship only what is needed to test purchase intent:

- Landing page or pricing section copy.
- Checkout or lead capture path.
- Confirmation/onboarding message.
- Analytics events.
- Internal fulfillment checklist.
- Rollback commit or content revert steps.

Do not build new product surface unless the offer cannot be honestly represented without it.

### 5. Monitor

Check metrics at the declared cadence:

- First 24 hours: broken tracking, checkout errors, obvious confusion.
- Day 3: qualified action rate, objections, refund risk.
- Day 7: early conversion, activation, payment quality.
- Day 14 or 30: retention, expansion, payback confidence.

If any P0/P1 incident appears, freeze offer changes and route to `incident-protocol.md`.

### 6. Decide

Classify with evidence:

- Keep: primary metric clears keep threshold and guardrails are healthy.
- Iterate: primary metric is between iterate and keep threshold with a clear bottleneck.
- Kill: primary metric misses kill threshold, guardrails fail, or delivery risk exceeds expected value.

Never let an offer survive two cycles without measurable traction.

## State Writes

Write or update:

- `~/.atlas/portfolio/[slug]/offers/[offer-id].json`
- `~/.atlas/portfolio/[slug]/growth_log.md`
- `~/.atlas/portfolio/[slug]/context.json` under `active_offer`
- `docs/founder/OFFERS.md` if the repo has founder docs

## Output Template

```markdown
## Offer Forge - [Date]
**Selected Offer:** [name]
**Buyer:** [persona]
**Trigger:** [trigger]
**Promise:** [promise]
**Price:** [price]
**Primary Metric:** [metric]
**Thresholds:** keep [x], iterate [y], kill [z]
**Instrumentation:** [events confirmed]
**Expected Score Delta:** monetization_confidence [before -> projected], money_score [before -> projected]
**Rollback:** [steps]
**Next Checkpoint:** [date or condition]
```

## Hard Rules

- No vague buyer, vague pain, vague promise, or vague price.
- No offer ships without telemetry and rollback.
- No discounting without a retention and brand-risk rationale.
- No offer is kept because it "sounds good"; only behavior counts.
- Every offer must improve conversion, retention, ARPU, CAC efficiency, cash collection speed, or learning quality.
