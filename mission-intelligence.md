---
name: atlas-mission-intelligence
description: The Oracle — Atlas's reasoning engine for Operator Mode. Runs on every invocation when the product is live. Ingests events, triangulates signals, predicts market shifts, generates strategy, delegates to Fleet, and updates the mission objective. This is the brain that makes Atlas sovereign, not just automated.
---

# Atlas Mission Intelligence — The Oracle

**Activated:** Operator Mode (live product, Phase 9+ complete)
**Purpose:** Transform raw signals into strategic decisions. The Oracle is what separates Atlas from a task runner.

---

## The Oracle Tick

Every `/atlas` invocation in Operator Mode runs the Oracle Tick:

```
PROCEDURE oracle_tick:
  1. INGEST   — pull fresh data from all connected APIs
  2. ANALYZE  — compute deltas, detect anomalies, identify trends
  3. PREDICT  — project forward 7/30/90 days based on current trajectory
  4. DECIDE   — generate ranked list of strategic actions
  5. DELEGATE — assign actions to Fleet agents
  6. EXECUTE  — agents execute via Six-Layer Hierarchy
  7. REPORT   — update dashboard, mission.json, growth_log.md
```

---

## Step 1: INGEST — Signal Collection

Pull from every connected API (check `credentials_index.json`):

### Revenue Signals (Stripe)
```
MRR, MRR growth rate, new MRR, churned MRR, expansion MRR
Customer count, ARPU, LTV, churn rate
Last 7 days vs previous 7 days (delta)
Payment failure rate, dunning recovery rate
```

### Traffic Signals (Analytics)
```
Unique visitors, page views, bounce rate, session duration
Top pages, top referrers, top search queries
Signup conversion rate, activation rate
Geographic distribution of users
```

### Product Signals (Error tracking + DB)
```
Error rate, error types, most frequent errors
Feature usage heatmap (if instrumented)
Support ticket volume + categories
User feedback/NPS (if collected)
```

### Market Signals (Web search)
```
Competitor product updates (changelog monitoring)
Industry news affecting this product's domain
New entrants in the space
Regulatory changes affecting the business
```

### Social Signals (Social APIs)
```
Mentions of product name / competitor names
Sentiment analysis of mentions
Engagement on recent posts
Community growth (followers, members)
```

---

## Step 2: ANALYZE — Pattern Detection

### Delta Analysis
For each metric, compute:
```
current_value, previous_value, delta_absolute, delta_percentage
trend: accelerating | stable | decelerating | declining
anomaly: true/false (>2 standard deviations from 30-day mean)
```

### Anomaly Detection
```
IF metric delta > 2σ from rolling mean:
  CLASSIFY as: OPPORTUNITY | THREAT | NOISE
  
  OPPORTUNITY: positive spike (viral post, media mention, feature resonance)
    → Action: amplify what caused it
  
  THREAT: negative spike (competitor launch, outage aftermath, bad review)
    → Action: mitigate within 24h
  
  NOISE: random fluctuation within normal variance
    → Action: log, do not react
```

### Cohort Intelligence
If sufficient data exists (30+ users):
```
Which acquisition channel produces highest-LTV users?
Which feature is most correlated with retention?
At what point do users typically churn?
What's the activation rate by signup source?
```

---

## Step 3: PREDICT — Forward Projection

### Revenue Trajectory
```
At current growth rate ([X]%/month):
  30 days: $[MRR]
  90 days: $[MRR]
  365 days: $[MRR] ($[ARR])
  
Confidence band: ±[Y]% based on 30-day variance
  
Break-even date: [date] (at current cost structure)
Ramen-profitable date: [date] ($3K MRR for solo founder)
```

### Risk Forecast
```
Top 3 risks in next 30 days:
  1. [Risk] — probability: [X]% — impact: $[Y] MRR at risk
     Mitigation: [specific action]
  2. [Risk] — probability: [X]% — impact: [Y]
     Mitigation: [specific action]
  3. [Risk] — probability: [X]% — impact: [Y]
     Mitigation: [specific action]
```

### Opportunity Forecast
```
Top 3 opportunities in next 30 days:
  1. [Opportunity] — expected impact: +$[X] MRR
     Action required: [specific]
     Assigned to: [Fleet agent]
  2. ...
```

---

## Step 4: DECIDE — Strategic Action Generation

### Decision Framework

For each potential action, score:
```
Action Score = (Revenue Impact × Probability of Success × Time Sensitivity) / (Effort in Hours × Risk)
```

Rank all actions by score. Execute top 3 this tick.

### Strategy Check

Read `~/.atlas/portfolio/[slug]/mission.json`:
```json
{
  "objective": "Reach $10K MRR by Q3 2026",
  "strategy": "Product-led growth via freemium conversion",
  "constraints": ["$0 marketing budget", "solo founder"],
  "current_bet": "SEO + Reddit community engagement",
  "pivot_trigger": "If signup-to-paid conversion < 2% after 90 days"
}
```

Does the current strategy still make sense given new data?
- If yes: continue executing
- If pivot trigger hit: generate new strategy recommendation, surface to founder
- If strategy is working better than expected: recommend doubling down

### Mission Update

If metrics indicate the mission needs updating:
```
MISSION UPDATE RECOMMENDATION:
  Current: "Reach $10K MRR by Q3 2026"
  Recommended: "Reach $15K MRR by Q3 2026" 
  Reason: Growth rate 40% above projection; raise the target

  Accept? (Atlas auto-accepts if delta is positive. Negative pivots require founder confirmation.)
```

---

## Step 5: DELEGATE — Fleet Task Assignment

Map each decided action to the appropriate Fleet agent:

```
Action: "Post launch retrospective on Indie Hackers"
  → Atlas Growth (authority: can post to communities)
  → Acceptance: post live, 3+ comments received within 48h

Action: "Fix Sentry error #4521 (auth redirect loop)"
  → Atlas Product (authority: can fix bugs, create PRs)
  → Acceptance: error count drops to 0, PR merged

Action: "Apply for Cloudflare startup credits (renewal)"
  → Atlas Wealth (authority: can apply for credits)
  → Acceptance: application submitted, confirmation email logged
```

---

## Step 6: EXECUTE — Six-Layer Hierarchy

Each delegated task follows the Six-Layer Hierarchy (see SKILL.md). The executing agent tries Layer 1 first and only escalates when genuinely blocked.

---

## Step 7: REPORT — State Update

### Dashboard Update
Update `~/.atlas/dashboard.html` with:
- Current score and delta since last tick
- Active Fleet tasks and their status
- Top 3 metrics (MRR, traffic, activation)
- Risk/opportunity radar
- Next scheduled actions

### Growth Log
Append to `~/.atlas/portfolio/[slug]/growth_log.md`:
```markdown
## [Date] — Oracle Tick #[N]

**Metrics:** MRR $[X] (+[Y]%), Traffic [X] (+[Y]%), Activation [X]%
**Anomalies:** [list or "none"]
**Actions taken:** [list]
**Actions delegated:** [list with agent assignments]
**Strategy status:** [on-track | pivot-recommended | exceeding]
**Score:** [X]/100 (Δ +[Y])
```

### Cross-Project Intelligence
If portfolio has 2+ projects, append relevant learnings to:
- `~/.atlas/memory.md` — what's true across projects
- `~/.atlas/patterns/` — reusable patterns for this founder

---

## Pattern Oracle (10+ Projects)

When `~/.atlas/portfolio/` contains 10+ project histories:

```
PATTERN ORACLE ACTIVATED

Founder blindspots detected:
  - [Pattern] observed in [N] projects → auto-correcting in current project

Founder strengths detected:
  - [Pattern] → consistently above benchmark → doubling down

Historical parallel:
  "[Current Product]" at $[X] MRR resembles "[Past Product]" at same stage.
  Past outcome: [what happened]
  Recommendation: [specific action based on what worked/didn't]
```

---

## Oracle Frequency

| Mode | Frequency | Depth |
|------|-----------|-------|
| War Room (T+0 to T+72h) | Every `/atlas` invocation | Full tick + real-time monitoring |
| Active Growth (score 60-89) | Every `/atlas` invocation | Full tick |
| Sovereign (score 90+) | Weekly auto-tick via cron | Metrics snapshot + anomaly check |
| Portfolio review | Weekly | Cross-project analysis |

---

## Acceptance Test (Oracle Tick)

- [ ] All connected APIs queried successfully (or failures logged)
- [ ] Delta analysis computed for all available metrics
- [ ] At least 1 strategic action generated and delegated
- [ ] `growth_log.md` updated with this tick's entry
- [ ] Dashboard reflects current state
- [ ] `mission.json` reviewed (update proposed if warranted)
