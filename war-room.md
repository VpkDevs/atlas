---
name: atlas-war-room
description: Use during Atlas Phase 10 — the 72-hour live-ops period after launch. Atlas runs continuous monitoring, drives the post-launch content cycle, fields support requests, fires follow-up engagement on every channel, watches for incidents, runs T+24h / T+48h / T+72h retros, and hands off to Phase 11 (Growth Engine) with a clean baseline.
---

# Atlas War Room — The 72-Hour Live-Ops Period

**Input:** LAUNCH_DAY_SUMMARY.md, all post-launch channels active, monitoring infrastructure live
**Output:** Stable post-launch baseline + clean handoff to Phase 11 Growth Engine

## The Iron Rule

The 72 hours after launch decide whether the launch becomes a foundation or a flash. Most products lose 70%+ of attention by T+72h. Atlas is the difference between losing it and converting it.

**Atlas does not declare launch over until T+72h has passed AND all open threads are closed AND the next 30 days of activity is queued.**

---

## The 72-Hour Cadence

```
T+0      Launch — handoff from Phase 9
T+1h     First metrics snapshot
T+4h     Mid-day check-in + content fire-off
T+12h    First full retro
T+24h    Day-1 milestone post + iteration decision
T+48h    Day-2 momentum decision
T+72h    Final retro; transition to Phase 11
```

Between checkpoints: 5-min monitoring loops (per Phase 9), auto-response engagement, support coverage.

---

## T+1 Hour: First Metrics Snapshot

```yaml
snapshot_t_plus_1h:
  timestamp: <ISO>
  visitors: <count from analytics>
  signups: <count>
  paid: <count>
  ph_upvotes: <count>
  hn_position: <#N or null>
  reddit_top_post_upvotes: <count>
  twitter_thread_impressions: <count>
  errors_in_window: <count>
  uptime: <%>
  open_support_tickets: <count>
```

If **any** metric is anomalous (e.g., 0 visitors, > 50 errors, < 50% expected): Atlas raises an incident and pivots from "ride the wave" to "stabilize."

---

## T+4 Hours: Mid-Day Pulse

Atlas runs a structured check-in:

1. **Top channel review** — which channel is converting? Double down (post a follow-up there)
2. **Bottom channel review** — which is stalling? Atlas drafts a recovery post or quietly stops feeding it
3. **Comment queue** — clear all unreplied comments via auto-response or surface for approval
4. **Support backlog** — clear or escalate
5. **Hot bug scan** — Sentry top errors; hotfix any new launch-introduced bugs

Output: a single-line update to the dashboard ("T+4h: 87 signups, 412 PH, HN #14, 0 P0 bugs, 3 unanswered comments queued").

---

## T+12 Hours: First Full Retro

Atlas writes `WAR_ROOM_T12H_RETRO.md`:

- What's working (top 3)
- What's underperforming (top 3)
- What changed about the plan based on signal
- Tomorrow's plan (T+24 to T+48)
- Founder action needed (if any)

Then drafts content for tomorrow morning:
- "Day 1 numbers" thread for Twitter/X (paste-ready)
- LinkedIn reflection post (paste-ready)
- Reddit follow-up if first sub had traction
- Email to launch list with stats and thanks

---

## T+24 Hours: Day-1 Milestone

The biggest content moment after launch itself. Atlas:

1. Compiles **Day 1 stats** into a tweet thread (auto-fires at 09:00 founder time)
2. Posts to Indie Hackers with the launch story (Atlas drafts, founder approves)
3. Sends "Day 1 thanks" to anyone who interacted (Twitter API + email)
4. Identifies the top 5 friction points from analytics drop-off
5. **Picks one** to fix today — Atlas implements the fix, ships, monitors
6. Re-engages dormant channels (LinkedIn 2nd post, fresh subreddit, etc.)

### The Day-1 Iteration Decision

```
If activation < 20%: fix onboarding (top friction point)
If activation > 30% but signups dropping: fix top-of-funnel (landing page)
If signups holding but no paid: fix pricing page or trial flow
If everything healthy: keep momentum (more content, more channels)
```

Atlas executes the decision, doesn't just document it.

---

## T+48 Hours: Day-2 Momentum

Two scenarios:

**Scenario A — Launch landed (signups > target):**
- Press follow-ups: Atlas re-pings journalists who didn't reply with new social proof
- Partnerships: Atlas drafts 5 partnership outreach emails using launch metrics as proof
- Content compound: Atlas publishes the SEO post that's been waiting in the roadmap
- Founder action: 1 customer interview call (Atlas drafts the email)

**Scenario B — Launch underperformed:**
- Diagnostic dive: Atlas pulls full funnel analytics, identifies the choke point
- Hypothesis + experiment: A/B test on the choke point (Atlas implements feature flag)
- Pivot decision: if signups < 20% of expected, Atlas drafts a "what we learned" public post (transparency wins) AND maps a recovery sprint
- Channel pivot: re-prioritize Phase 5's #4 channel (skipped originally) and run it now

---

## T+72 Hours: Final Retro + Handoff

Atlas writes `WAR_ROOM_FINAL_RETRO.md`:

```markdown
# War Room Retro — [Product] — T+72h

## Numbers
- Final visitors: X (vs Y expected)
- Final signups: X
- Final paid: X (MRR: $X)
- Final PH: X upvotes, #N rank
- Final HN: X points, #N max position
- Top channel by conversion: <channel>
- Top organic referrer: <site>

## Wins
- [3-5 specific things that worked]

## Misses
- [3-5 specific things that didn't]

## Surprises
- [Unexpected positive or negative]

## Top customer feedback themes
- [Distilled from comments + support tickets]

## What changes for Phase 11
- [Specific channel/content/feature decisions to carry forward]

## Patterns saved to ~/.atlas/patterns/launch.md
- [What worked for THIS founder, in their voice, captured for next launch]

## Phase 11 starting baseline
- MRR: $X
- Active users: X
- 7-day trailing growth: X%
- Growth Engine first-week priority: <one specific action>
```

### Handoff Procedure

1. Write all retros + summaries to disk
2. Update context.json with post-launch baseline metrics
3. Append to `~/.atlas/patterns/launch.md` (cross-project learning)
4. Commit cron workflows for Phase 11 (the GH Action that fires the weekly loop)
5. Schedule the first Phase 11 cycle for next Monday
6. Final dashboard update: "War Room closed. Growth Engine begins [date]."

---

## Continuous (T+0 through T+72h) Activities

### Support Coverage

Atlas drafts replies to every inbound support message:
- If pattern matches existing FAQ: auto-reply
- If new question: draft + surface for founder approval (~30 sec turnaround)
- If sentiment is negative: surface immediately, never auto-fire

Track: response time SLA target < 1 hour during launch window.

### Content Cycling

Pre-scheduled posts continue firing per LAUNCH_SEQUENCE.md and CONTENT_CALENDAR_30.md. Atlas verifies each fired correctly. If a scheduled post failed: Atlas reschedules it OR posts the fallback variant.

### Sentiment Monitoring

Atlas runs every comment through a sentiment classifier:
- Positive: thank, retweet/quote, save for case study
- Neutral: standard reply
- Negative: surface to founder + draft empathic response with concrete fix promise

If 3+ negative comments cluster on the same theme: this becomes a Day-2 iteration target.

### Incident Response

Per the Phase 5 Incident Response Matrix. Every incident logs to `~/.atlas/incidents/` with timestamp, severity, action taken, resolution time.

If founder is offline during an incident: Atlas takes the safest defensive action and surfaces a delayed notification with what was done and why.

---

## Founder Time Budget

War Room should require **<1 hour/day** of founder time across the 72 hours:

- ~15 min/day reviewing Atlas's drafts before they fire
- ~15 min/day on customer interactions Atlas surfaces (only the ones requiring human voice)
- ~15 min/day on T+24/T+48 milestone reviews
- ~15 min flex for surprises

If Atlas is consuming > 1 hr/day of founder time: it's a violation, log to feedback for tuning.

---

## Acceptance Test (Phase 10)

- [ ] Snapshots exist at T+1h, T+12h, T+24h, T+48h, T+72h
- [ ] WAR_ROOM_T12H_RETRO.md, WAR_ROOM_FINAL_RETRO.md exist
- [ ] At least one iteration shipped between T+0 and T+72h based on data
- [ ] All comments/messages either replied to or queued
- [ ] No incidents in `~/.atlas/incidents/` left unresolved
- [ ] Phase 11 cron workflow committed
- [ ] Patterns appended to `~/.atlas/patterns/launch.md`
- [ ] context.json updated with post-launch baseline

---

## Checkpoint

```
─────────────────────────────────────────────────────
WAR ROOM CLOSED — T+72h Retro

72-hour totals:
  Visitors: [X]
  Signups: [X]  ([%] of T+72h expected)
  Paid: [X] customers, $[X] MRR
  Top channel: [channel] ([X] signups)
  Iterations shipped: [N]
  Incidents: [N resolved / 0 open]

Wins: [3 bullets]
Misses: [2 bullets]
Carry forward: [what Phase 11 starts with]

Runs-itself score: [X] → [Y]

Phase 11 (Growth Engine) begins [date]. Cron workflow committed.

The launch is over. The business begins.
─────────────────────────────────────────────────────
```

---

## Red Flags

- ❌ Skipping any of the T+1/T+12/T+24/T+48/T+72 checkpoints
- ❌ Letting comments/messages go unanswered overnight
- ❌ Not iterating between T+0 and T+72 based on data
- ❌ Treating War Room as "wait and watch" — it is "watch and act"
- ❌ Failing to commit Phase 11 cron before declaring complete
- ❌ Missing the patterns/launch.md update — losing cross-project learning
- ❌ Auto-firing replies on negative-sentiment comments
- ❌ Going silent on the founder during stable periods (post a "things are stable" once per shift)
- ❌ Burning > 1 hr/day of founder time without surfacing the cost
