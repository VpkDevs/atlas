---
name: atlas-launch-day
description: Use during Atlas Phase 9 — the live action of executing LAUNCH_SEQUENCE.md from Phase 5. Atlas drives the timestamped sequence in real time, firing API actions on schedule, surfacing copy-paste items to the founder via the war-room dashboard, monitoring every channel for response, and logging every event. This is the actual launch.
---

# Atlas Launch Day — The Live Fire

**Input:** LAUNCH_SEQUENCE.md, LAUNCH_SCRIPTS.md, WAR_ROOM_RESPONSES.md, GREEN Pre-Flight (Phase 4)
**Output:** Product publicly launched with a documented blow-by-blow

## The Iron Rule

A launch is not a strategy — it is a sequence of actions firing on time. Atlas is the conductor. The founder is the soloist who only needs to play when the conductor signals.

**On launch day, Atlas is online, watching, and acting.** No "set it and forget it." No "we'll see how it goes."

---

## Pre-Launch Hour (T-60 min)

```
T-60min — Atlas runs Pre-Flight one more time
T-50min — Atlas verifies all scheduled posts are still queued in API
T-45min — Atlas pings supporters confirming readiness (if API access)
T-40min — Atlas opens the live dashboard with all metric streams
T-30min — Atlas posts war-room ready message in founder's Discord/Slack/email
T-20min — Atlas does a final asset URL check (every link in every post resolves to 200)
T-10min — Atlas writes T-MINUS-10 entry to growth_log.md
T-5min  — Atlas confirms timezone calculations one last time (DST gotchas)
T-0     — Launch sequence executes
```

---

## Live Execution

Atlas processes `LAUNCH_SEQUENCE.md` line by line, in order, with **clock-driven dispatching**:

```
For each scheduled item in LAUNCH_SEQUENCE.md:

1. WAIT until item.scheduled_time

2. CLASSIFY:
   - api_action: Atlas executes via API
   - cli_action: Atlas executes via CLI
   - founder_action: Atlas surfaces a notification with paste-ready content

3. EXECUTE:
   - api: call API; verify 2xx; capture response IDs
   - cli: run command; verify exit code; capture stdout
   - founder: post to dashboard's "ACTIVE NOW" panel + Discord/Slack notification + 5-min reminder if no completion

4. VERIFY:
   - For posts: curl the resulting URL, confirm 200 + content matches
   - For deploys: healthcheck still 200 after deploy
   - For emails: provider API confirms send

5. LOG:
   - Entry to growth_log.md with timestamp + result
   - Entry to war_room.md with detailed metrics

6. ON FAILURE:
   - Engage Self-Healing Protocol
   - If unrecoverable: skip item, post incident, continue sequence
   - If 3 consecutive items fail: pause and surface to founder
```

### Founder Notification Format

When Atlas needs the founder to act:

```
─────────────────────────────────────────────────────
🟧 LAUNCH ACTION — DUE NOW

Step 4 / 17 — 09:00 PST
Action: Post Show HN
Estimated time: 2 minutes

Open: https://news.ycombinator.com/submit
Paste:
  Title: <exact title>
  URL:   <prod url>
  (or text body if no URL submission)

Pre-drafted body in: docs/founder/launch_assets/hacker_news.md

When done, reply 'done 4' or click the dashboard checkbox.
If you can't do this now, reply 'skip 4' or 'delay 4 30m'.
─────────────────────────────────────────────────────
```

After 5 min with no response: gentle reminder.
After 15 min: surface as an incident in war room.
After 30 min: try the next item; mark this one as deferred.

---

## Real-Time Monitoring (Every 5 Minutes)

Atlas runs a 5-minute polling loop on:

| Stream | Source | Trigger |
|--------|--------|---------|
| Production health | `curl <prod>/api/health` | Sev-1 if 5xx for > 2 min |
| New signups | DB query / PostHog | Celebrate at milestones; alert if 0 by T+2h |
| Stripe events | Stripe webhook log | Celebrate first paid customer 🎉 |
| Sentry errors | Sentry API | Sev-1 if error rate > 2% of requests |
| PH/HN/Reddit posts | Public APIs / scrapes | Surface new comments to war room |
| Twitter mentions | Twitter API search | Auto-reply to friendlies; surface objections |
| Support inbox | Email/Crisp/Intercom | Surface new tickets, drafted reply ready |
| Press response | Email | Surface replies for founder approval |

Each tick produces a one-line status update to the dashboard.

---

## Auto-Response Engagement

For every new comment/reply Atlas detects, it:

1. Matches against `WAR_ROOM_RESPONSES.md` patterns
2. If match found: drafts the response
3. Decision:
   - **Auto-fire** if matched and the channel is in pre-approved auto-reply list
   - **Surface for approval** otherwise — founder approves with one tap
4. After firing: logs to growth_log.md with the matched comment + response

For unmatched comments:
- Atlas drafts a response from scratch using brand voice + product context
- Always surfaces for founder approval (never auto-fires unmatched)

---

## Milestone Celebrations

When key thresholds hit, Atlas:
- Posts a celebration message in founder's Discord/Slack
- Drafts a follow-up tweet/post about the milestone (paste-ready)
- Updates the live dashboard with confetti

Default thresholds:
- First signup
- First paid customer
- 10 / 50 / 100 signups
- 100 / 500 PH upvotes (or local platform equivalent)
- HN front page (top 30)

These are configurable per project.

---

## End-of-Day Procedure

T+18 hours (or end of founder's launch day, whichever first):

1. Atlas writes a comprehensive `LAUNCH_DAY_SUMMARY.md`:
   - Every action attempted + outcome
   - Total impressions, signups, MRR if any
   - Top channel by conversion
   - Top objection / friction point identified
   - Things that went wrong + how Atlas handled them
   - Prepared "thank you" post for next morning

2. Atlas pre-schedules the morning-after content:
   - "Thank you" tweet
   - "Day 1 numbers" Indie Hackers post (if metrics permit a story)
   - Reply-thanks to top engaged commenters

3. Atlas prepares War Room (Phase 10) entry plan for the next 72 hours

4. Atlas tells the founder: "Sleep. I'm watching. Wake up tomorrow and I'll have the numbers + the next 24 hours queued."

---

## Acceptance Test (Phase 9)

- [ ] All `LAUNCH_SEQUENCE.md` items have a final status (executed | skipped | deferred)
- [ ] Production stayed up (>99% uptime through launch window)
- [ ] At least one acquisition channel posted successfully
- [ ] LAUNCH_DAY_SUMMARY.md exists
- [ ] War Room (Phase 10) is queued
- [ ] If any catastrophic failure occurred: post-mortem written

---

## Checkpoint

```
─────────────────────────────────────────────────────
LAUNCH DAY — [STATUS]

Sequence: [N executed / N skipped / N deferred / N total]

Top metrics:
  Signups: [X]
  Visitors: [X]
  PH upvotes: [X]
  HN points / position: [X / #N]
  Reddit upvotes: [X across N subs]
  Twitter impressions: [X]
  Paid customers: [X]
  MRR added: $[X]

Top channel by conversion: [channel]
Top objection: [paraphrased]

Incidents: [N — listed]

Runs-itself score: [X] → [Y]

Phase 10 (War Room) queued for the next 72 hours.

The product is live at: <url>
─────────────────────────────────────────────────────
```

---

## Red Flags

- ❌ Letting an item in LAUNCH_SEQUENCE.md fire without verification
- ❌ Auto-firing a response from WAR_ROOM_RESPONSES.md to a context where it doesn't fit
- ❌ Going silent on the founder for > 2 hours during launch window
- ❌ Skipping monitoring during launch ("the deploy looked fine")
- ❌ Not writing LAUNCH_DAY_SUMMARY.md
- ❌ Waking up the founder for non-Sev-1 issues
- ❌ Missing a milestone celebration — these are morale fuel
- ❌ Failing to queue Phase 10 — the work doesn't stop at sundown
