---
name: atlas-acquisition-sniper
description: Rapid-response acquisition module. Detects high-intent demand windows (competitor outages, keyword spikes, migration urgency, platform changes) and deploys a conversion-optimized response package within 24 hours. Every trigger must have timestamped evidence. Every deployment must have measurement hooks. Integrates with channel-dominance.md for effort allocation and scoring.md for Revenue Velocity.
---

# Acquisition Sniper (v7.2)

**Objective:** Capture demand that competitors are losing, that urgency is creating, or that the market is signaling — before the window closes.

**Activated by:** `/atlas sniper` or automatic trigger when signal detection fires (see Step 1).

**Core principle:** Speed is the differentiator here. A 48-hour response to a competitor outage is worth 10x a 2-week campaign. This module optimizes for deployment velocity without sacrificing measurement.

---

## Acceptance Gate

Complete **only** if ALL of:
- A specific, timestamped trigger signal is identified and cited (no vague "seems like a good time")
- Response package is deployed in under 24 hours of signal detection
- Conversion telemetry is active and verified before package is live
- Revenue attribution is wired (UTM parameters or source tracking)
- Result logged to `docs/founder/SNIPER_LOG.md` within 48 hours of deployment

---

## Step 0: Capital Mode Check

```text
Read capital_mode from ATLAS_BRAIN.md

ALL modes: Sniper is allowed — high-intent demand has immediate ROI, justifying temporary spend
in any mode EXCEPT SURVIVE where cash preservation is absolute.

IF capital_mode == "SURVIVE":
  ONLY deploy if the sniper requires ZERO spend (organic-only response)
  No paid amplification, no new tooling costs
  Organic sniper still allowed: content + outreach only

IF capital_mode == "PRESERVE":
  Organic sniper: YES
  Paid amplification: only if CAC payback < 14 days (immediate revenue signal required)

IF capital_mode in ["BALANCED", "SCALE"]:
  Full sniper allowed including paid amplification
```

---

## Step 1: Signal Detection

Atlas monitors for the following trigger types on every Oracle Tick:

### Trigger Type A: Competitor Outage or Trust Event

```bash
# F5Bot / Google Alerts: check for competitor mentions with negative sentiment
# (configured in launch-strategy.md and mission-intelligence.md)

# Also: monitor competitor status pages
curl -s "https://[competitor].statuspage.io/api/v2/status.json" \
  | jq '.status.indicator'  # "none" = operational; anything else = incident

# Twitter/X search for competitor + negative keywords
# "(competitor_name) (down OR outage OR broken OR not working OR error)"
# If 10+ complaints in past hour: HIGH INTENT WINDOW OPEN

SIGNAL_CONFIRMED = {
  "type": "competitor_outage",
  "evidence_url": "[link to status page or tweet thread]",
  "detected_at": "[ISO timestamp]",
  "window_estimate": "4-24 hours",
  "estimated_affected_users": "[N if visible]"
}
```

### Trigger Type B: Demand Spike in Target Keywords

```bash
# Google Search Console: check for sudden rank improvements or impression spikes
curl "https://searchconsole.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query" \
  -H "Authorization: Bearer [GSC_TOKEN]" \
  -d '{"startDate": "7daysAgo", "endDate": "today", "dimensions": ["query"]}'

# PostHog: check for unusual traffic source spikes
curl "https://app.posthog.com/api/projects/@current/insights/trends/" \
  -H "Authorization: Bearer $POSTHOG_API_KEY" \
  -d '{"events": [{"id": "pageview"}], "date_from": "-1d", "breakdown": "utm_source"}'

# Threshold: if any referral source up > 300% day-over-day: SIGNAL
```

### Trigger Type C: Buyer Segment Complaint Trend

```bash
# Reddit monitoring (F5Bot or direct API)
# Search: "[competitor] alternative" OR "[pain point] solution"
# If 5+ posts in 48h asking for alternatives: SIGNAL

# Hacker News
curl "https://hacker-news.firebaseio.com/v0/topstories.json" \
  | jq '.[0:100]' | xargs -I {} \
  curl -s "https://hacker-news.firebaseio.com/v0/item/{}.json" \
  | jq 'select(.title | contains("[competitor_name]"))'

SIGNAL_CONFIRMED = {
  "type": "buyer_complaint_trend",
  "evidence": "[links to 3+ posts]",
  "pain_expressed": "[exact phrasing they use]",
  "detected_at": "[ISO timestamp]",
  "window_estimate": "24-72 hours"
}
```

### Trigger Type D: Platform Policy Change or Market Event

```bash
# Examples:
# - Stripe raises fees → target Stripe-dependent businesses
# - App Store policy change → target affected iOS developers
# - Competitor acquires + changes pricing → target price-sensitive segment

# Detection: Google Alerts for competitor names + "pricing" / "policy" / "changes"
# Manual flag: if founder or Atlas spots a relevant announcement, 
#   Atlas immediately evaluates and routes to sniper if applicable

SIGNAL_CONFIRMED = {
  "type": "platform_policy_change",
  "source": "[URL of announcement]",
  "affected_segment": "[description]",
  "window_estimate": "1-4 weeks",  # longer windows for policy changes
  "detected_at": "[ISO timestamp]"
}
```

---

## Step 2: Evaluate Signal Urgency

```python
def score_signal_urgency(signal):
    """
    Returns: (score 0-100, recommended_response_hours)
    """
    
    window_score = {
        "1-4 hours": 100,
        "4-24 hours": 80,
        "24-72 hours": 60,
        "1-4 weeks": 30
    }.get(signal["window_estimate"], 20)
    
    volume_score = min(signal.get("evidence_count", 1) * 10, 40)
    
    # Revenue potential: does this audience clearly have budget?
    # (paying customers of a competitor = yes; free-tier complainers = maybe)
    revenue_potential = 40 if signal.get("paying_competitor_customers") else 20
    
    total = window_score * 0.5 + volume_score * 0.3 + revenue_potential * 0.2
    
    # Recommended response time based on activation policy below
    if total < 40:
        return total, None
    response_hours = 4 if total > 80 else 12 if total > 70 else 24
    
    return total, response_hours

# If signal score < 40: log it but don't activate sniper
# If signal score 40-70: activate sniper, standard 24h window
# If signal score > 70 and <= 80: activate sniper, expedited 12h window
# If signal score > 80: activate sniper, highest-priority 4h window
```

---

## Step 3: Build the Rapid Response Package

Deploy these in order — fastest first, highest-ROI first. Stop when time budget is exhausted.

### Asset 1: Intent-Matched Landing Page (2-4 hours)
```text
URL pattern: [product.com]/[competitor-name] OR /[trigger-event]
Example: /switch-from-[competitor] OR /[crisis-type]-alternative

Content structure:
  H1: "[specific pain they expressed] — here's the solution"
  (NOT: "Welcome to [product]" — that's generic)
  
  Section 1: Acknowledge the specific situation
    "If you're affected by [competitor's outage / price increase / policy change]..."
  
  Section 2: Specific differentiation (3 bullets)
    Directly address what caused the switch intent
    Use their language from the complaint posts you read
  
  Section 3: Migration path (if applicable)
    "Import from [competitor] in under 10 minutes"
    Specific steps, not vague promises
  
  Section 4: Social proof matching their persona
    "X companies in [their industry/size] switched last month"
  
  CTA: "[Try free for 14 days / Start in 5 minutes / Import your data]"
    Direct to signup — no intermediate steps

Atlas writes this page. Commits to branch. Deploys to Vercel preview URL.
If page is approved: merges and deploys to production.
```

### Asset 2: Comparison Page (1-2 hours)
```text
URL: [product.com]/vs/[competitor]

Use the exact objections from Signal Step 1 as section headers.
If they said "too expensive": lead with pricing comparison.
If they said "missing feature X": lead with feature X demonstration.

Format:
  | Feature | [Product] | [Competitor] |
  | Price | $X | $Y |
  | [Key pain point] | ✅ [specific] | ❌ [gap] |

Factual. No misleading comparisons. Only claims Atlas can verify.
```

### Asset 3: Outreach Sequence (1-2 hours)
```text
Target: people who posted the trigger signal publicly

Platform-appropriate outreach:
  Reddit: Reply to the specific post where they expressed pain
    Format: Value-first (answer their question) → mention product as one option
    Do NOT lead with product name — answer their actual question first
  
  Twitter/X: Reply to the complaint thread
    Format: "I built [product] for exactly this. [Specific thing they mentioned] is [how we handle it]. [link]"
    Keep under 280 chars. One link. No emoji padding.
  
  HN: Reply to the thread if relevant
    Format: technical + honest. HN readers are allergic to marketing-speak.
    Acknowledge tradeoffs. Be specific. Link in text body.

Atlas drafts all outreach. Founder approves before sending.
(Public replies = review always. DMs = may auto-send within tone guidelines.)
```

### Asset 4: Social Distribution (30-60 minutes)
```text
Twitter/X thread or LinkedIn post:
  "Here's what [trigger event] means for [affected segment] and how to handle it"
  
  Structure:
    Tweet 1: State what happened (factual, no editorializing)
    Tweet 2: Who is affected and how
    Tweet 3-4: The options (include alternatives, including non-[product] options)
    Tweet 5: How [product] handles this specifically
    Tweet 6: CTA (try free / link to landing page)
  
  Key: Lead with information value, not product push.
  People share useful takes, not product announcements.

Atlas writes. Schedules via Buffer/Typefully API if keys exist.
```

### Asset 5: Paid Amplification (if capital mode allows)
```text
ONLY if capital_mode in ["BALANCED", "SCALE"] AND signal_score > 70:

Option 1: Reddit Ads targeting the subreddit where signal appeared
  Budget: $50-200 for 72h burst
  Ad: link the comparison page or landing page
  Targeting: subreddit + competing brand keywords

Option 2: Google Ads on competitor brand terms
  Bid on: "[competitor] alternative", "[competitor] down alternative", "[competitor] vs"
  Budget: $100-500 for 72h
  CPC estimate: $3-15 depending on competitor

Expected CAC payback: < 7 days if signal is high-quality
If no CAC payback evidence in 72h: pause and review
```

---

## Step 4: Measurement Setup (Required Before Going Live)

```bash
# UTM parameters on ALL sniper URLs
# [product.com]/switch-from-[competitor]?utm_source=sniper&utm_medium=[twitter/reddit/etc]&utm_campaign=[signal-date]

# PostHog: verify events fire
# viewed_sniper_page, signup_started, signup_completed, checkout_completed

# Stripe webhook: tag customers from sniper campaigns
# metadata: {acquisition_source: "sniper", signal_type: "competitor_outage", signal_date: "ISO"}
```

---

## Step 5: Log and Evaluate

Write to `docs/founder/SNIPER_LOG.md` within 48 hours:

```markdown
## Sniper Deployment — [ISO date]

**Signal type:** [competitor_outage / demand_spike / complaint_trend / platform_change]
**Evidence:** [specific links, screenshots, or data]
**Signal score:** [X]/100
**Window estimate:** [X hours/days]

**Deployment timeline:**
| Asset | Deployed | Time to deploy |
|-------|---------|----------------|
| Landing page | [URL] | [N] hours |
| Comparison page | [URL] | [N] hours |
| Outreach posts | [N] replies posted | [N] hours |
| Thread / post | [URL] | [N] hours |

**Results (72h):**
| Metric | Value |
|--------|-------|
| Page visits | [N] |
| Signups from sniper | [N] |
| Paid conversions | [N] |
| Revenue attributed | $[N] |
| CAC (if paid amplification) | $[N] |

**Was signal worth acting on?** [Yes / Marginal / No — and why]
**Sniper pattern to repeat?** [Yes — add to playbook / No — don't repeat this signal type]
```

---

## Sniper Playbook (Grows Over Time)

Each successful sniper becomes a playbook entry. When the same trigger fires again, Atlas executes the proven playbook instead of rebuilding from scratch.

`docs/founder/SNIPER_PLAYBOOK.md` — Atlas maintains this file. Structure:

```markdown
## Playbook: Competitor Outage ([competitor name])

**Last activated:** [date]
**Average deploy time:** [N] hours
**Average 72h revenue:** $[N]
**ROI:** [X]x

### Proven assets (link to last version):
- Landing page: [URL/commit]
- Twitter thread: [template]
- Reddit reply: [template]

### What worked: [specific]
### What didn't: [specific]
### Next time, change: [specific]
```

---

## Hard Rules

- No trigger without timestamped evidence — "feels like a good time" is not a trigger
- No deployment without measurement hooks — untracked traffic is worthless
- No predatory, deceptive, or manipulative messaging — competitive respect in framing
- No sniper in SURVIVE mode unless zero-cost organic-only
- Every paid amplification requires CAC payback estimate before spend
- Response package must be live within 24 hours or the window is closed — abort and log
- Public reply outreach requires founder approval before posting

## Red Flags

- ❌ Sniper activated based on competitor announcement that has no user pain signal
- ❌ Landing page deployed without UTM parameters (can't measure what caused signups)
- ❌ Paid amplification in PRESERVE or SURVIVE mode without explicit override rationale
- ❌ Reply outreach auto-posted without founder review (tone + accuracy risk)
- ❌ Sniper log missing after 48 hours — if you don't measure it, you can't improve it
- ❌ Same sniper template reused without updating for current signal context (stale messaging)
- ❌ Response > 48 hours after signal detection — if it's not deployed fast, don't deploy at all
