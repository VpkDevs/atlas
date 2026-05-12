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

## Step 2b: Competitive Intelligence (Runs Every Tick in Operator Mode)

The Oracle monitors the competitive landscape continuously — not just at launch.

### Competitor Signal Sources

**F5Bot (Reddit monitoring — free, set up once):**
```
Keywords to monitor (set up at f5bot.com):
  - [product name]
  - [main competitor names from business context]
  - "[problem domain] tool" (e.g., "email automation tool")
  - "[product category] alternative"

Atlas reads F5Bot email digest → extracts signal → classifies as opportunity/threat/noise
```

**Google Alerts (set up in launch module, read here):**
```
Alerts configured for:
  - [product name]
  - [competitor names]
  - [key industry keywords]
```

**GitHub competitor monitoring:**
```bash
# Monitor competitor repos for major releases
for repo in [competitor_repos]; do
  gh api repos/$repo/releases/latest --jq '.tag_name + " " + .published_at + " " + .name'
done
```

**HN + Reddit search (runs weekly):**
```
site:news.ycombinator.com "[competitor name]" last 7 days
site:reddit.com "[competitor name]" last 7 days
→ Flag: any post with 50+ points discussing competitor = potential threat or opportunity
```

### Competitive Response Protocol

```
COMPETITOR LAUNCHES MAJOR FEATURE:
  1. Read feature announcement
  2. Assess: overlap with our core value prop? (high/medium/low)
  3. If HIGH overlap:
     → Immediate: draft differentiation narrative for Atlas Growth to publish
     → 7 days: evaluate roadmap to address capability gap
     → Flag in decisions.md
  4. If MEDIUM:
     → Note in growth_log.md
     → Add to product backlog consideration
  5. If LOW:
     → Log and ignore

COMPETITOR LAUNCHES / GOES VIRAL:
  1. Identify what's resonating (read comments, upvotes, shares)
  2. Is there an angle we can ride? (commentary, comparison, alternative positioning)
  3. If yes: Atlas Growth drafts "how we differ" content immediately
```

---

## Step 3: PREDICT — Forward Projection

### Revenue Trajectory (Actual Math)

```python
# Linear regression model (simple, honest)
# Input: MRR data points from last 30-90 days
# Output: projected MRR at 30/90/365 days with confidence interval

def project_mrr(mrr_history: list[float]) -> dict:
    """
    mrr_history: list of weekly MRR snapshots, most recent last
    Uses linear regression on log(MRR) to model compound growth
    """
    if len(mrr_history) < 4:
        return {"confidence": "low", "note": "insufficient history for projection"}
    
    # Calculate week-over-week growth rates
    growth_rates = [(mrr_history[i] / mrr_history[i-1]) - 1 
                    for i in range(1, len(mrr_history))]
    avg_growth = sum(growth_rates) / len(growth_rates)
    std_growth = (sum((r - avg_growth)**2 for r in growth_rates) / len(growth_rates))**0.5
    
    current_mrr = mrr_history[-1]
    
    return {
        "30_days": current_mrr * (1 + avg_growth)**4.3,   # ~4.3 weeks
        "90_days": current_mrr * (1 + avg_growth)**13,
        "365_days": current_mrr * (1 + avg_growth)**52,
        "confidence_band": f"±{std_growth * 100:.0f}%",
        "growth_rate_weekly": f"{avg_growth * 100:.1f}%",
        "trend": "accelerating" if growth_rates[-1] > avg_growth else "decelerating" if growth_rates[-1] < avg_growth else "stable"
    }
```

Atlas runs this model and reports:
```
Revenue Trajectory (linear regression on [N] weeks of data):
  Weekly growth rate: [X]% (trend: [accelerating/stable/decelerating])
  
  30 days:  $[MRR] (±[Y]%)
  90 days:  $[MRR] (±[Y]%)
  365 days: $[MRR] (±[Y]%) = $[ARR] ARR
  
Break-even: [date] (at current cost structure of $[monthly_cost]/mo)
Ramen-profitable: [date] ($3K MRR)
S-Corp-threshold: [date] ($80K ARR — when S-Corp election saves money)

Confidence: [High (>12 data points) / Medium (6-12) / Low (<6)]
Note: [any factors that make this projection unreliable]
```

### Churn Prediction Signal

The Oracle watches for churn precursors:
```
High-risk user signals (check weekly):
  - User hasn't logged in for 14+ days AND was previously active daily → at-risk
  - User viewed pricing/cancellation page in last 7 days → high-risk
  - User opened "billing" support thread → high-risk
  - User's feature usage dropped >50% week-over-week → at-risk

Response:
  high-risk (pricing page viewed) → Atlas Growth sends "can we help?" email immediately
  at-risk (usage drop) → Atlas Growth queues re-engagement email in 3 days
  Logged to growth_log.md for measurement
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

**P0 Incident Override (evaluate before scoring anything):**
```
PROCEDURE p0_override_check:
  1. Scan ~/.atlas/incidents/ for any file where:
       - date == today AND resolved == false
  2. IF found AND severity == P0:
       → Load incident-protocol.md
       → Execute p0_response() immediately
       → THIS TICK HAS ONE ACTION: resolve the P0
       → All Action Score ranking is skipped
       → Defer all other actions to next tick
       → Log: "Tick [N] pre-empted by P0 incident [filename]"
  3. IF found AND severity == P1:
       → p1_response() is the mandatory first action this tick
       → Continue to Action Score for remaining capacity (1-2 actions)
  4. IF none found:
       → Continue to Action Score below
```

For each non-incident action, score:
```
Action Score = (Revenue Impact × Probability of Success × Time Sensitivity) / (Effort in Hours × Risk)
```

Rank all actions by score. Execute top 3 this tick (or fewer if P1 consumed capacity).

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

### Sovereign Score Recompute (runs first)
Before updating any display or log, recompute the score:
```
Load scoring.md → call compute_sovereign_score() with this tick's metrics
Write to context.json:
  {
    "runs_itself_score": [new_score],
    "score_updated_at": "[ISO timestamp]",
    "score_delta": [new_score - previous_score]
  }
If score dropped ≥5 points: immediately classify the drop category and add to Risk Forecast
If score crossed 90: emit sovereign milestone alert (Discord/Slack webhook if configured)
```

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

---

## Oracle Checkpoint (Every Tick)

```
─────────────────────────────────────────────────────
ORACLE TICK #[N] — [Product Name] — [Timestamp]

INGEST: [N] APIs queried | [N] failures logged
ANALYZE: [N] anomalies detected ([N] opportunity, [N] threat, [N] noise)
PREDICT:
  MRR trajectory: $[X] → $[Y] in 30 days (±[Z]%)
  Top risk: [description] ([X]% probability)
  Top opportunity: [description] (expected +$[X] MRR)
DECIDE: [chosen action] — score [X.XX]
DELEGATE:
  → [Agent]: [task description]
EXECUTE: [outcome summary]
REPORT: growth_log.md updated | dashboard refreshed | mission.json reviewed

Sovereign Score: [X] | Delta: [+/-N] since last tick
─────────────────────────────────────────────────────
```

## Red Flags

- ❌ Oracle tick that doesn't update growth_log.md
- ❌ PREDICT step without citing the data it's based on (not "I estimate")
- ❌ DECIDE step choosing more than one primary action for this tick
- ❌ DELEGATE step assigning a task to an agent whose domain doesn't cover it
- ❌ Competitor signal detected and classified as NOISE without explicit reasoning
- ❌ Churn precursor signal detected and not triggering a re-engagement action within 48h
- ❌ Pivot trigger reached in mission.json and not surfaced to founder
- ❌ Oracle running in Operator Mode without checking mission.json first
- ❌ Revenue trajectory projection without stating the assumption (growth rate, time period)
