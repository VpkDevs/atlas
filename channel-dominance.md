---
name: atlas-channel-dominance
description: Algorithmic channel effort allocator. Pulls per-channel metrics, computes marginal ROI for each channel, applies the 70/20/10 split to this week's effort budget, freezes underperforming channels, and ships one concrete asset for the top channel. Integrates with scoring.md Revenue Velocity and operator-playbook.md capital mode constraints.
---

# Channel Dominance (v7.2)

**Objective:** Never spread growth effort equally across channels. Always concentrate on highest marginal ROI and cut what doesn't compound.

**Activated by:** `/atlas channels` or Growth Engine weekly tick.

---

## Acceptance Gate

Complete **only** if ALL of:
- Per-channel metrics pulled from live sources for last 28 days
- Marginal ROI computed for every active channel
- Effort allocation table updated (70/20/10)
- At least one channel frozen or graduated based on performance data
- One specific asset shipped for the current winner channel
- Allocation logged to `docs/founder/CHANNEL_ALLOCATION.md`

---

## Step 0: Capital Mode Constraints

```text
Read capital_mode from ATLAS_BRAIN.md

IF capital_mode == "SURVIVE":
  Run only: winner channel maintenance (scheduled content already queued)
  Freeze ALL challenger and frontier tests
  LOG: "Channel Dominance — SURVIVE mode. Maintaining winner channel only."
  RETURN after Step 3

IF capital_mode == "PRESERVE":
  Winner channel: full effort
  Challenger channels: FROZEN (no new spend or new asset creation)
  Frontier: FROZEN

IF capital_mode in ["BALANCED", "SCALE"]:
  Full 70/20/10 allocation active
```

---

## Step 1: Pull Per-Channel Metrics (28-Day Window)

For each active channel, pull:

```bash
# PostHog / Plausible / GA4: traffic + signups by referral source
curl "https://app.posthog.com/api/projects/@current/insights/trends/" \
  -H "Authorization: Bearer $POSTHOG_API_KEY" \
  -d '{
    "breakdown": "utm_source",
    "events": [
      {"id": "pageview"},
      {"id": "signup_completed"}
    ],
    "date_from": "-28d"
  }'
```

```bash
# Stripe: MRR from customers by acquisition source
# (requires UTM → customer mapping in your DB or PostHog person properties)
# If not available, use signup-to-paid conversion rate as proxy
stripe customers list --limit=100 \
  | jq '[.data[] | select(.metadata.utm_source != null) | {source: .metadata.utm_source, created: .created}]'
```

**Channel data schema (compute for each):**

```text
channel_metrics = {
  "name": "HN / Reddit / Twitter / SEO / Email / Referral / Direct / ...",
  "visits_28d": N,
  "visits_prior_28d": N,
  "signups_28d": N,
  "paid_conversions_28d": N,
  "mrr_attributed_28d": $N,       # best estimate or null
  "visit_to_signup_rate": N/N,
  "signup_to_paid_rate": N/N,
  "overall_conversion_rate": N/N, # visits → paid
  "cac_proxy": paid_conversions_28d > 0 ? spend_28d / paid_conversions_28d : null,
  "effort_hours_28d": N,          # time Atlas / founder spent on this channel
}
```

If a channel has < 50 visits in 28 days: mark as `data_insufficient` — do not compute marginal ROI.

---

## Step 2: Compute Marginal ROI Score

```python
def compute_marginal_roi(channel):
    """
    Marginal ROI: what does one additional hour of effort produce
    in expected MRR, relative to current baseline?
    """
    
    # Revenue efficiency: MRR per visit (proxy for quality)
    if channel.visits_28d == 0:
        return 0
    
    revenue_per_visit = channel.mrr_attributed_28d / max(channel.visits_28d, 1)
    
    # Effort efficiency: MRR produced per hour invested
    if channel.effort_hours_28d == 0:
        effort_efficiency = revenue_per_visit * 10  # organic with no effort = very high
    else:
        effort_efficiency = channel.mrr_attributed_28d / channel.effort_hours_28d
    
    # Growth trajectory bonus: is this channel accelerating?
    # Compare this 28d window to prior 28d window
    trajectory_multiplier = 1.0
    if channel.visits_prior_28d and channel.visits_prior_28d > 0:
        if channel.visits_28d > channel.visits_prior_28d * 1.1:  # > 10% growth
            trajectory_multiplier = 1.3
        elif channel.visits_28d < channel.visits_prior_28d * 0.9:  # > 10% decline
            trajectory_multiplier = 0.7
    
    # CAC penalty: paid channels need to beat organic equivalent
    cac_penalty = 1.0
    if channel.cac_proxy > 0:
        cac_penalty = max(0.3, 1 - (channel.cac_proxy / 500))  # $500 CAC = 0 penalty removed
    
    raw_score = effort_efficiency * trajectory_multiplier * cac_penalty
    
    # Normalize to 0-100 scale (calibrated to typical SaaS channels)
    return min(100, raw_score * 10)
```

**Rank all channels by `marginal_roi_score`. Highest score = more effort next cycle.**

---

## Step 3: Apply 70/20/10 Effort Allocation

```text
FUNCTION allocate_effort(channels_ranked, total_effort_hours_next_cycle):

  # Remove channels with insufficient data
  eligible = [c for c in channels_ranked if c.data_status == "sufficient"]
  
  IF len(eligible) == 0:
    SKIP allocation — log "No channels with sufficient data. Build tracking first."
    RETURN
  
  winner    = eligible[0]      # top marginal ROI
  challenger = eligible[1] if len(eligible) > 1 else None
  frontier   = eligible[2] if len(eligible) > 2 else None
  
  # Apply allocation
  winner_hours    = total_effort_hours_next_cycle * 0.70
  challenger_hours = total_effort_hours_next_cycle * 0.20 if challenger else 0
  frontier_hours   = total_effort_hours_next_cycle * 0.10 if frontier else 0
  
  # Freeze rule: any channel outside top 3 with < 3 marginal_roi_score
  channels_to_freeze = [c for c in eligible[3:] if c.marginal_roi_score < 3]
  
  return {
    "winner": (winner, winner_hours),
    "challenger": (challenger, challenger_hours),
    "frontier": (frontier, frontier_hours),
    "frozen": channels_to_freeze
  }
```

**Total effort hours** = founder available hours + Atlas automated hours (scheduled posts, outreach queue).

---

## Step 4: Channel Lifecycle Decisions

Apply these rules deterministically:

```text
FREEZE rule (3-strike):
  A channel that scores below 3/100 marginal ROI for 3 consecutive cycles
  is FROZEN. It receives 0 effort allocation. It is not deleted — it may
  be re-evaluated if product or market context changes significantly.
  Log freeze to ATLAS_BRAIN.md: "[DATE] Froze [channel] — 3 cycles below floor"

GRADUATE rule:
  A frontier channel that exceeds challenger's marginal_roi_score
  for 2 consecutive cycles GRADUATES to challenger (and challenger → winner
  if it exceeds the winner for 2 consecutive cycles).
  Log graduation to ATLAS_BRAIN.md.

MANDATORY WINNER PROTECTION:
  If the current winner channel has declined for 2 cycles but still leads,
  do NOT replace it. Wait for 3 cycles of decline before considering swap.
  Reason: channel lag — new content often dips before compounding.

CHALLENGER GRADUATION THRESHOLD:
  Challenger replaces winner only when:
  challenger.marginal_roi_score > winner.marginal_roi_score * 1.15
  (15% improvement required — prevents constant thrashing)
```

---

## Step 5: Ship One Winner Asset

For the winner channel, Atlas ships exactly one specific asset this cycle:

```text
WINNER ASSET SELECTION:

For each channel type, the highest-leverage default asset is:

HN / Dev communities:
  → Write a Show HN post OR a technical deep-dive post
  → Atlas writes, founder reviews, Atlas schedules/posts

Reddit communities:
  → Write a specific subreddit post with value-first framing
  → Atlas writes targeting the subreddit's idiom, founder approves

Twitter/X:
  → Write a thread: insight (hook) → mechanism → proof → CTA
  → Atlas writes + schedules via Buffer/Typefully API

SEO / Organic search:
  → Identify top ranking opportunity from Google Search Console
    (queries where product ranks 8-20 = quick wins)
  → Write or update the page targeting that query

Email / Newsletter:
  → Write and queue the next nurture email in the sequence
  → Atlas sends via Resend API

Referral / Partner:
  → Identify one high-probability referral partner
  → Draft outreach email + send via Resend API

Content / YouTube / Video:
  → Write a short-form script (90 seconds) for the top-performing topic
  → Surface as userMust for recording; Atlas writes the caption + description
```

**The asset must be live or queued before this step is complete.** Writing it and not shipping it does not count.

---

## Step 6: Update Allocation Record

Write to `docs/founder/CHANNEL_ALLOCATION.md`:

```markdown
## Channel Allocation — Cycle [N] — [ISO date]

### Winner: [Channel Name] (70% effort = [N] hours)
Marginal ROI score: [X]/100
Last cycle MRR attributed: $[X]
Trend: [↑ accelerating / → stable / ↓ decelerating]
Asset shipped this cycle: [description + link/commit]

### Challenger: [Channel Name] (20% effort = [N] hours)
Marginal ROI score: [X]/100
Action: [what Atlas does in this channel this cycle]

### Frontier: [Channel Name] (10% effort = [N] hours)
Marginal ROI score: [X]/100
This is a TEST — exit criteria: [specific threshold to graduate or freeze]

### Frozen channels: [list]
Reason: [3-strike / capital mode / below floor]
Re-evaluation trigger: [specific condition]

### Decision log
- [Channel]: [kept / froze / graduated / demoted] — [specific reason with data]
```

---

## Channel Benchmark Targets (Calibrated for SaaS Dev Tools)

| Metric | Struggling | Healthy | Compounding |
|--------|-----------|---------|-------------|
| Visit-to-signup | < 1% | 1–3% | > 3% |
| Signup-to-paid (organic) | < 10% | 10–25% | > 25% |
| CAC payback (paid) | > 12 months | 3–6 months | < 3 months |
| Channel MRR growth (4-week) | < 0% | 0–10% | > 10% |

---

## Hard Rules

- No equal-weight channel allocation: the 70/20/10 rule is non-negotiable
- No channel survives 3 cycles scoring below 3/100 marginal ROI
- No new paid channel spend without a defined CAC payback target and timeline
- No channel "paused indefinitely" — either active or frozen with a re-eval trigger
- Every channel allocation decision must cite specific metrics, not intuition
- No shipping the same asset type twice in a row for the winner channel (avoid repetition)

## Red Flags

- ❌ Equal effort across 5 channels (diffusion kills compounding)
- ❌ Continuing to invest in a channel that has declined for 4+ consecutive cycles
- ❌ "Challenger" channel that has been challenger for > 6 cycles without graduating or freezing
- ❌ Winner asset written but not published/queued before closing the cycle
- ❌ Frontier test with no exit criteria (perpetual "testing" with no decision)
- ❌ Allocating effort to frozen channels because "we should try harder"
