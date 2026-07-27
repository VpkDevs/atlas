---
name: atlas-launch-strategy
description: Use during Atlas Phase 5 — produces a complete, intelligence-driven launch plan with channel selection, audience archaeology, ranked targeting, full ready-to-fire copy, a timestamped LAUNCH_SEQUENCE.md, a war-room protocol, and a 72-hour post-launch live-ops playbook. Not a strategy doc. A loaded gun with a fuse.
---

# Atlas Launch Strategy — The Operator's Launch System

**Input:** Business Context (Phase 1) + Pre-Flight green status (Phase 4) + `~/.atlas/patterns/launch.md`
**Output:** Everything needed to fire a coordinated, multi-channel launch — and survive the first 72 hours.

## The Iron Rule of Launch

A list of channels is not a launch.
A pile of templates is not a launch.
A strategy doc is not a launch.

A launch is: **a sequenced, time-stamped, multi-channel firing of pre-loaded assets with a live-ops monitoring layer, on a date Atlas chose for measurable reasons, with rollback procedures if something breaks.**

If what Atlas hands the founder is anything less, the launch will fail.

---

## Phase 5 Workflow (8 Stages)

```
5.1 Channel Intelligence       (research what works for THIS product)
5.2 Audience Archaeology       (where do these specific customers live?)
5.3 Channel Ranking            (top 3 with explicit ROI math)
5.4 Asset Generation           (every post, email, DM written)
5.5 Launch Sequencer           (timestamped, numbered serial recipe)
5.6 War Room Setup             (T+0 to T+72h monitoring + response)
5.7 Rollback & Contingencies   (what if X breaks)
5.8 Pre-Launch Dry Run         (verify assets render, links resolve)
```

---

## 5.1 Channel Intelligence (Replaces v3's Static Table)

v3 used a hard-coded "Best For" table. v4 does **research per-product** because the right channel for an AI image tool is not the right channel for a B2B compliance API.

### Step 1: Pull Founder Pattern History

Read `~/.atlas/patterns/launch.md`. If this founder has previously launched on a channel:
- What was the response? (upvotes, signups, MRR delta)
- What time of day worked?
- What hook angle landed?

Weight prior wins +20% in the ranking. Weight prior bombs −30%.

### Step 2: Competitor Launch Archaeology

For each competitor identified in onboarding:
1. Search Product Hunt for them → record date, day-of-week, upvote count, comment count
2. Search HN for `Show HN: [competitor]` → record points, comments, position
3. Search Reddit for the launch thread → record sub, upvotes, top objection
4. Search Twitter/X for the launch tweet → engagement, who reposted

This produces a **competitor benchmark**: "products like ours typically hit 200–500 PH upvotes" — sets realistic expectations and reveals which channel actually moved the needle for them.

### Step 3: Channel Fitness Scoring

Score every candidate channel against this product on 7 dimensions (1–10 each):

| Dimension | What it asks |
|-----------|--------------|
| Audience overlap | Does the target customer actually live here? |
| Content fit | Does the product demo well in this format (text/video/image)? |
| Conversion path | Can a viewer get to "signed up" in <60 seconds? |
| Effort | How long to produce the asset? (lower = better score) |
| Half-life | Does the post keep producing traffic for weeks (Reddit/SEO) or hours (Twitter)? |
| Defensibility | Can competitors easily copy what makes this work here? |
| Founder fit | Does the founder's voice/skill match this channel's culture? |

**Channel fitness = sum × prior-pattern weight × novelty bonus**

Output a matrix table to `docs/founder/CHANNEL_FITNESS_MATRIX.md`. The math is shown — no black-box ranking.

### Channel Universe (v4 Expanded)

| Tier | Channel | Strong Fit |
|------|---------|------------|
| Primary | Product Hunt | B2B SaaS, dev tools, productivity, design |
| Primary | Hacker News (Show HN) | Dev tools, technical depth, OSS, infra |
| Primary | Twitter/X | Building-in-public, dev/founder/AI audience |
| Primary | LinkedIn | B2B enterprise, professional services, recruiting tools |
| Primary | Reddit | Niche consumer, hobbyist, anti-SaaS |
| Primary | TikTok | Consumer apps, visual products, Gen-Z audiences |
| Primary | YouTube (Shorts + long-form) | Consumer, educational, demo-heavy |
| Secondary | Indie Hackers | Solo/bootstrap audience, milestone storytelling |
| Secondary | Dev.to / Hashnode | Technical writeups, tutorial-driven |
| Secondary | Lobsters | Highly technical, OSS, niche systems |
| Secondary | Discord servers | Niche communities (gaming, AI, design) |
| Secondary | Slack communities | B2B niche (e.g., Demand Curve, Online Geniuses) |
| Secondary | Newsletter sponsorships | Established niches with cult followings |
| Secondary | Podcast circuit | Founder-driven story, B2B trust building |
| Tertiary | Behance / Dribbble | Visual/design tools |
| Tertiary | GitHub trending | OSS, dev infrastructure |
| Tertiary | BetaList / BetaPage | Pre-launch waitlist building |
| Tertiary | AppSumo / PitchGround | Lifetime deal model, B2B SaaS |
| Tertiary | Capterra / G2 / GetApp | B2B SaaS reviews + organic SEO |
| Tertiary | Substack discovery | Newsletter products |
| Tertiary | Threads / Bluesky / Mastodon | Diaspora of Twitter audiences |
| Outreach | Cold email to journalists | Industry-specific story angle |
| Outreach | Cold DM to micro-influencers | <50K follower accounts in niche |
| Outreach | Affiliate / partner co-launch | Compatible non-competing tools |
| Outreach | Direct sales (B2B) | High-ticket, identifiable customer list |
| Paid | Google Ads (limited initial) | High-intent keywords only at launch |
| Paid | Reddit Ads | Hyper-targeted subreddits |
| Paid | LinkedIn Sponsored | B2B enterprise targeting |
| Paid | Twitter/X Ads | Specific account targeting |

---

## 5.2 Audience Archaeology

**Atlas does not assume. Atlas finds.**

For the target customer profile from Phase 1, locate where they actually congregate.

### Procedure

1. **Subreddit hunt:** Search Reddit for the customer's pain language (not the product category). E.g., not `r/SaaS` — `r/agencylife` if the target is agency owners. Record subscriber count, weekly post volume, mod's stance on self-promotion.
2. **Discord/Slack hunt:** Search "best [niche] discord 2026" + use known directories (disboard.org, top.gg). Identify the 5 most-active servers.
3. **Twitter list mining:** Find 3 accounts the target customer follows. Pull their followers' bios, identify the most-common bio keywords → that's the audience cluster.
4. **Search-intent mapping:** Run the top 10 long-tail keywords from SEO research against `site:reddit.com`, `site:news.ycombinator.com`, `site:twitter.com`. The ranking pages reveal which channels Google considers authoritative for this audience.
5. **Influencer cartography:** Identify the top 20 micro-influencers (1K–50K followers) in the niche. Output their handle, follower count, recent post that fits product angle, and a personalized DM (not a template — a genuine reference).

Save to `docs/founder/AUDIENCE_MAP.md`.

### Failure Modes

| Symptom | Action |
|---------|--------|
| Target customer is too generic ("small business owners") | Atlas re-runs onboarding's market section with more specificity questions |
| Audience archaeology returns no concentrated communities | Channel ranking weights cold outreach + direct sales higher; SEO becomes a long-game pillar |
| Founder explicitly told Atlas the audience but Atlas finds them elsewhere | Output both views; surface the discrepancy in the checkpoint |

---

## 5.3 Channel Ranking — The ROI Decision

Output the top 3 channels with explicit reasoning AND quantified expectations:

```
LAUNCH CHANNEL RANKING — [Product Name]

#1: Product Hunt
   Fitness score:     8.4 / 10
   Reasoning:         B2B dev tool, target users active on PH (validated by Audience Map),
                      competitor [X] launched here and hit 412 upvotes
   Expected reach:    8K–25K impressions over launch day
   Expected conv:     0.5–1.5% landing page → signup (40–375 signups)
   Expected MRR:      $50–$500 within 30 days
   Confidence:        Medium-High (anchored to 3 competitor benchmarks)
   Effort:            Already-written; 0 hr ongoing
   Risks:             Algorithm change since competitor launch; Tuesday slot saturated

#2: Hacker News (Show HN)
   ... (same structure)

#3: r/[specific subreddit]
   ... (same structure)

CHANNELS DELIBERATELY SKIPPED (and why):
   LinkedIn:          B2C product; audience overlap 2/10
   TikTok:            No video assets; effort too high vs. expected return
   Paid ads:          Pre-launch CAC unknown; defer until Growth Engine has signal
```

If the top channel's expected MRR is < the founder's runway burn rate, **Atlas surfaces this explicitly** and recommends either lowering the launch ceiling or expanding to channels 4–5.

---

## 5.4 Asset Generation — Everything Pre-Loaded

For each top-3 channel, write the **complete production-ready asset**.

### Product Hunt Asset Bundle

```yaml
file: docs/founder/launch_assets/product_hunt.md

tagline: "<60 chars, benefit-first, no jargon, includes a verb>"
description: "<260 chars, ends with concrete outcome for user>"
topics: [3-5 official PH topic slugs, validated against ph-categories.json]
gallery:
  - image_1: "Hero shot — full product UI"
    caption: "<one-line caption>"
    spec: "1270×760 PNG, <2MB"
  - image_2: "Feature spotlight"
    caption: "..."
  - image_3: "Use case in action"
    caption: "..."
  - image_4 (optional): "Pricing or social proof"
first_comment_maker: |
  Hi everyone, [Founder] here.
  [The personal pain that drove the build, in 2-3 sentences]
  [What it does, in 1 sentence]
  [What's free vs paid]
  [Specific ask: feedback on X]
  Happy to answer anything in the comments today.
launch_day_timing:
  publish: "Tuesday 00:01 PST"  # auto-adjusted for current week
  reasoning: "PH 24h cycle starts at midnight PST; Tuesday avoids Mon dump and weekend dip"
maker_team: ["@founderhandle"]
hunter_strategy:
  preferred: "Self-hunt (Founder mode visible 2024+)"
  fallback_if_warm_intro_exists: "<hunter handle from Audience Map>"
ship_application: |
  <complete PH Ship application text — 200 words — already drafted>
```

### Hacker News Show HN Bundle

```yaml
file: docs/founder/launch_assets/hacker_news.md

title: "Show HN: <Product> – <one specific line, no marketing>"
body: |
  [What it does, plainly. 2 sentences.]
  [Tech stack, briefly.]
  [Why I built it. 1-2 sentences. Genuine.]
  [What's interesting technically about it. The HN hook.]
  [What stage it's at. Honest.]
  [How to try it: <URL>. <Free tier or signup-required note>.]
  [Inviting feedback.]
ban_check: "Account age >= 30 days, karma >= 25 — verified before publish"
timing:
  publish: "Tuesday 09:00 PST"
  reasoning: "9am PST = peak US engineer browse window without Coast saturation"
preempt_objections:
  - "Why not just use [common alt]?"
  - "How is this different from [competitor]?"
  - "Where's the pricing?"
  - "What happens to my data?"
prepared_replies: <each objection has a prepared comment, 2-3 sentences, honest tone>
```

### Reddit Bundle (per subreddit)

```yaml
file: docs/founder/launch_assets/reddit_[sub].md

subreddit: "r/<specific>"
post_format: "<text|link>"
title: "<reads native to that sub, not promotional>"
body: |
  [Lead with the value the sub cares about, not the product]
  [Story: how this came to exist, problem first]
  [Mention the product, what it does, link]
  [Explicit: free vs paid; ask for feedback]
flair: "<exact flair string from sub>"
rules_compliance:
  - rule_1: "<sub rule>" → handled how
  - rule_2: "<sub rule>" → handled how
  - self_promotion_ratio: <"X:1 verified via reddit history">
mod_outreach_drafted: <"Yes/No — message included if rules require pre-clearance">
posting_account:
  warmup_status: "<min karma/age met>"
  fallback_account: "<if needed>"
timing:
  publish: "<best day for this sub, validated against 30d top posts>"
```

### Twitter/X Launch Thread Bundle

```yaml
file: docs/founder/launch_assets/twitter_thread.md

thread_length: 7-10 tweets
thread:
  1: "<hook tweet — the personal problem statement, includes hard number>"
  2: "<the moment you decided to build it>"
  3: "<the build journey, 2-3 milestones, screenshot>"
  4: "<what the product actually does, demo gif>"
  5: "<social proof or unique angle>"
  6: "<pricing + free tier>"
  7: "<the ask — try it, RT, give feedback> + URL"
quote_tweets_planned:
  - account: "@<friendly account>"
    text: "<their pre-agreed quote tweet text>"
launch_thread_timing: "Tuesday 06:00 ET (matches PH/HN window)"
hashtags: <max 2, niche-specific, never #startup or #saas>
```

### LinkedIn Post Bundle (if B2B)

```yaml
file: docs/founder/launch_assets/linkedin.md

format: "Long-form post (1200-1500 chars)"
hook: "<first 2 lines must stand alone before 'see more' cut>"
body: |
  [Personal narrative — credibility]
  [Industry observation — relatability]
  [The product, name-dropped naturally]
  [What it solves — specific, with a metric]
  [The ask + URL]
posting_strategy: "Post on personal profile, not company page (3-5x reach)"
tag_strategy: "Tag 2-3 mutual connections who would actually engage"
comment_seeding: "Pre-arrange 3 friends to leave thoughtful comments in first 30 min"
```

### YouTube/TikTok Bundle (if visual product)

```yaml
file: docs/founder/launch_assets/video_launch.md

format: "60-second vertical demo"
script:
  hook: "<first 3 sec — unmistakable problem statement>"
  demonstration: "<seconds 4-40 — actual product use, screen-recorded>"
  outcome: "<seconds 41-55 — what user gets>"
  CTA: "<seconds 56-60 — link in bio or pinned comment>"
caption: "<text overlay timing notes>"
title: "<SEO-optimized for the platform's search>"
description: "<150 chars + link>"
hashtags: <5 niche, 2 broad>
production_notes: |
  [If founder has no existing footage]
  <Atlas drafts a script and surfaces a userMust to record, OR>
  <Generates a Loom-style screencast plan from the actual UI>
```

### Newsletter / Press Outreach Bundle

```yaml
file: docs/founder/launch_assets/press_outreach.md

target_journalists:
  - name: "<full name>"
    outlet: "<publication>"
    beat: "<their actual coverage area>"
    recent_relevant_piece: "<URL of a recent piece>"
    angle_for_them: "<why YOUR product fits THEIR specific beat>"
    email: "<verified — via Hunter.io or outlet's masthead>"
    pitch_subject: "<7-9 words, specific>"
    pitch_body: |
      [Reference their recent piece in line 1]
      [Why this product is relevant to their beat]
      [The story angle, not the product features]
      [Offer: exclusive, demo, founder interview, embargo]
      [Tight signoff with link]

target_newsletters:
  - name: "<newsletter>"
    subscribers_estimated: "<count>"
    submission_url: "<direct submission link>"
    pitch: "<tailored to their format>"

embargo_strategy: "<if applicable — coordinate with PH launch>"
follow_up_cadence: "Day 3, Day 7, Day 14 — exact templates included"
```

### Direct Outreach (B2B / High-Ticket)

If the product is B2B and target customers are identifiable:

```yaml
file: docs/founder/launch_assets/direct_outreach.md

target_list:
  - name: "<person>"
    role: "<title>"
    company: "<name>"
    why_them: "<specific signal — they tweeted about pain X, blog post Y>"
    contact_method: "<LinkedIn DM | Email | Twitter DM>"
    outreach_body: |
      <fully personalized — references their specific signal>
    follow_up_1: "<day 3 — different angle>"
    follow_up_2: "<day 7 — case study or value drop>"

n_targets: "Minimum 30 to start, Atlas surfaces if list <30"
crm: "<HubSpot free tier OR Notion table OR Airtable>"
```

---

## 5.5 Launch Sequencer — `LAUNCH_SEQUENCE.md`

This file replaces all the "checklists" of v3. It is a **timestamped serial recipe** the founder executes top-to-bottom on launch day.

### Format

```markdown
# LAUNCH SEQUENCE — [Product Name]

**Launch date:** 2026-05-12 (Tuesday)
**Atlas-determined timezone:** PST (everything below is PST; all times include local conversion if founder's timezone differs)

---

## T-7 Days — Tuesday 2026-05-05

[ ] 09:00 — Atlas posts the "launching next Tuesday" tweet (auto, via Twitter API if key present, else userMust)
[ ] 09:30 — Atlas sends warmup DMs to 5 PH hunters (auto via API where possible)
[ ] 10:00 — Founder posts BTS thread (Atlas-drafted, paste-ready below)
[ ] 14:00 — Atlas verifies all DNS, SSL, healthchecks
[ ] 17:00 — Atlas runs Pre-Flight Phase 4 again (gate)

## T-1 Day — Monday 2026-05-11

[ ] 08:00 — Atlas runs final Pre-Flight (acceptance test)
[ ] 09:00 — Atlas schedules PH submission as draft (via API or pre-filled URL)
[ ] 11:00 — Atlas pre-schedules Twitter thread to fire 06:00 PST Tuesday
[ ] 12:00 — Atlas verifies all asset URLs return 200
[ ] 14:00 — Founder reviews LAUNCH_SCRIPTS.md (only thing they need to do today)
[ ] 16:00 — Atlas commits and pushes a "launch-ready" tag to git
[ ] 18:00 — Atlas opens war-room dashboard, sets monitoring sensitivity to MAX
[ ] 22:00 — Atlas pings any pre-arranged supporters (auto where possible)

## T-0 Day — Tuesday 2026-05-12 (LAUNCH DAY)

[ ] 00:01 PST — Product Hunt goes live (Atlas submits via API; verifies live URL)
        ↳ verification: curl producthunt.com/posts/<slug> returns 200 with post visible
        ↳ if 4xx/5xx: war-room incident alpha-1, see WAR_ROOM_PROTOCOL.md

[ ] 00:05 — Atlas pings the 3 pre-arranged upvoter friends (DM via API, exact message ready)

[ ] 06:00 — Twitter launch thread fires (pre-scheduled)
        ↳ verification: thread URL returns 200
        ↳ Atlas pins the thread

[ ] 09:00 — Hacker News Show HN posted (userMust — HN has no API)
        ↳ exact paste-ready text in LAUNCH_SCRIPTS.md item #4
        ↳ Atlas monitors hn.algolia.com for the post; alerts founder when indexed

[ ] 09:15 — Atlas auto-replies to first 5 HN comments using prepared answers
        ↳ if comment is unprepared: surfaces a draft, founder approves in <2 min

[ ] 10:00 — LinkedIn post fires (Atlas-scheduled or userMust if no API)

[ ] 10:30 — First Reddit post (sub #1) — exact paste in LAUNCH_SCRIPTS.md
        ↳ stagger by 90 min between subs to avoid cross-mod-spam flag

[ ] 12:00 — Reddit post #2

[ ] 13:30 — Reddit post #3

[ ] 14:00 — Press outreach round 1 (Atlas sends via Resend/SendGrid API if key, else userMust batch in LAUNCH_SCRIPTS.md)

[ ] 16:00 — TikTok / YouTube Short publishes (if applicable)

[ ] 18:00 — Atlas runs T+0 retrospective: counts impressions, signups, errors, support tickets

[ ] 20:00 — Atlas drafts the "thank you" tweet for tonight, ready for paste

[ ] 22:00 — Atlas runs final daily check, posts metrics snapshot to growth_log.md

## T+1 — Wednesday 2026-05-13

[ ] 08:00 — Atlas runs T+24h retro
[ ] 09:00 — Atlas sends "thanks + here's what's next" follow-up (Twitter, email list, PH comment)
[ ] 10:00 — Atlas runs press outreach round 2 (if round 1 had no replies)
[ ] 14:00 — Atlas schedules organic content to ride launch momentum (3 posts queued)
[ ] 18:00 — Atlas drafts a "Day 1 numbers" thread (build-in-public)

## T+2 — Thursday

[ ] T+48h retro
[ ] Round-up post on Indie Hackers ("here's what happened")
[ ] Newsletter outreach to anyone who didn't reply

## T+3 — Friday

[ ] T+72h retro — closes War Room phase, opens Growth Engine
[ ] First Growth Engine tick (see GROWTH_ENGINE.md)
```

### LAUNCH_SCRIPTS.md (Serial Paste Companion)

A separate file containing **only** the items the founder needs to copy-paste, numbered in execution order, each item containing:
- Step number + UTC timestamp
- Direct link to the destination (PH submission URL, exact subreddit submit URL, etc.)
- The exact text to paste, in a code fence
- Estimated time: "~90 sec"

The founder's mental model is **scroll, paste, click, scroll** — never "decide."

---

## 5.6 War Room Setup (T+0 to T+72h)

The launch day itself is governed by `atlas:war-room` (Phase 10). This module **prepares** the war room. It must commit:

1. **Live metrics dashboard URL** (PostHog / Plausible / Mixpanel — created via API if key exists)
2. **Alert channels** (Discord webhook / Slack webhook / email → email forwards to Atlas re-entry trigger)
3. **Auto-response queue** — Atlas pre-drafts 30 likely comments/objections with replies, ready to fire when the matching thread appears
4. **Incident response matrix** — see 5.7

### Pre-Drafted Response Library

For each launch channel, generate 30 likely comments with prepared responses. Examples:

```yaml
PH_comments:
  - pattern: "Looks like a wrapper around <competitor>"
    response: "Fair! The differences: <X>, <Y>, <Z>. Here's a 90-sec demo: <url>"
  - pattern: "What's the pricing?"
    response: "Free tier covers <X>. Paid starts at $<Y>/mo for <Z>. Pricing page: <url>"
  - pattern: "When will <feature> be available?"
    response: "<Real timeline if known, or 'roadmap is at <url>, depends on demand'>"
HN_comments: [...similar pattern...]
Reddit_comments: [...similar pattern...]
```

These auto-fire if Atlas has API access OR sit in `WAR_ROOM_RESPONSES.md` for instant copy-paste.

---

## 5.7 Rollback & Contingency Matrix

**Every launch has a way it can go wrong. Atlas pre-commits the response.**

| Incident | Detection | Atlas Response | Founder Action |
|----------|-----------|----------------|----------------|
| Production goes down at T+0 | Healthcheck 5xx for 2+ min | Auto-rollback via `vercel rollback`, post "we're investigating" reply on every channel, switch landing to status page | None unless rollback fails |
| Stripe webhook fails | Sentry alert | Disable signup flow, surface "we'll reach out for a manual sign-up" on landing, queue manual stripe.com creation | Approve the workaround copy |
| Database migration broken | Healthcheck + error rate | Rollback migration, redeploy previous tag, post incident page | None |
| Ratelimit hit on signup | 429 spike | Atlas raises plan limits if API key for upstream service exists, else queues signups in waitlist mode | Pay for upgrade if invoice surfaces |
| Negative HN top comment dominating | Sentiment scan | Atlas drafts measured response, surfaces for founder approval, posts within 15 min of approval | Read draft, approve or edit |
| Major bug discovered in product | Sentry / user reports | Atlas reproduces, fixes, deploys hotfix, posts "fix is live" reply on the channel where bug was reported | None unless fix requires architecture call |
| Domain DNS not propagated | Atlas's curl returns NXDOMAIN | Verify Cloudflare/Vercel record, force propagation, fall back to apex domain if subdomain fails | None |
| PH submission rejected | API error or moderator email | Atlas reads rejection reason, regenerates submission, retries; if rules require change, surfaces userMust with exact fix | Approve revision |
| HN flagged | "[flagged]" appears | Atlas drafts an honest "I'm the maker, AMA" comment, requests vouch via founder's HN network if any | Use the network |
| Reddit removed by mod | Post removed | Atlas reads mod message if accessible, regenerates per their notes, identifies a more permissive sub | Reach out to mod if Atlas's regenerated version is rejected |
| No signups in first 4 hours | Metric < 5 | Atlas pulls landing-page conversion logs (PostHog), identifies drop-off point, drafts an A/B variant for hero copy, deploys via feature flag | None — Atlas iterates |
| Server crashes from traffic | Uptime alert | Atlas scales (Vercel/Railway plan upgrade if budget approved in Phase 7), enables CDN, queues static fallback | Approve scale-up cost if > preset cap |
| Founder is unavailable | No founder messages for 2h on launch day | Atlas continues per the sequencer using prepared responses, never invents commitments, posts "founder will reply tonight" if asked something unanswerable | Sleep, eat, breathe — Atlas runs |

### Auto-Rollback Procedure

```bash
# Atlas commits this script as scripts/rollback.sh
#!/bin/bash
set -euo pipefail

PREV_TAG=$(git tag --sort=-creatordate | grep -E '^launch-ready' | sed -n '2p')
if [ -z "$PREV_TAG" ]; then
  echo "ERROR: no previous launch-ready tag found"
  exit 1
fi

git checkout "$PREV_TAG"

if [ -f vercel.json ]; then
  vercel rollback --yes
elif [ -f railway.toml ]; then
  railway redeploy
elif [ -f fly.toml ]; then
  fly releases rollback
fi

# post incident
curl -X POST "$DISCORD_WEBHOOK" -d "{\"content\":\"⚠️ Auto-rollback to $PREV_TAG completed\"}"
```

---

## 5.8 Pre-Launch Dry Run

T-1 day mandatory. Atlas:

1. Verifies every URL in every asset returns 200
2. Renders every Markdown post locally (formatting check)
3. Validates every email body against spam filters (uses mail-tester.com via API if available)
4. Pings every supporter on the upvoter list to confirm availability
5. Tests the full signup → activation flow end-to-end
6. Tests the rollback script in staging
7. Verifies all monitoring webhooks fire on synthetic test events
8. Runs a 30-minute load test (k6 or autocannon, free tier)

**Dry run failures block launch.** Slip the date by 1 day rather than launch broken.

---

## Output Files (Phase 5)

```
docs/founder/
├── LAUNCH_STRATEGY.md                  ← reasoning + channel ranking
├── LAUNCH_SEQUENCE.md                  ← timestamped serial recipe
├── LAUNCH_SCRIPTS.md                   ← copy-paste assets, ordered
├── CHANNEL_FITNESS_MATRIX.md           ← scoring math
├── AUDIENCE_MAP.md                     ← where customers actually live
├── COMPETITOR_LAUNCH_BENCHMARKS.md     ← what others achieved
├── WAR_ROOM_PROTOCOL.md                ← T+0 to T+72h playbook
├── WAR_ROOM_RESPONSES.md               ← pre-drafted reply library
├── INCIDENT_RESPONSE_MATRIX.md         ← rollback procedures
├── PRE_LAUNCH_DRY_RUN_REPORT.md        ← dry-run results
└── launch_assets/
    ├── product_hunt.md
    ├── hacker_news.md
    ├── reddit_<sub1>.md
    ├── reddit_<sub2>.md
    ├── reddit_<sub3>.md
    ├── twitter_thread.md
    ├── linkedin.md
    ├── video_launch.md (if applicable)
    ├── press_outreach.md
    └── direct_outreach.md (if B2B)
scripts/
└── rollback.sh
```

Plus state writes:

```
~/.atlas/portfolio/[slug]/
├── context.json (updated: launch_date, channels_chosen, expected_metrics)
├── decisions.md (entry: "Chose Channel X because Y")
└── metrics/launch_baseline.json (pre-launch numbers for comparison)
```

---

## Acceptance Test (Phase 5)

Phase 5 is not complete until ALL of these are true:

- [ ] `LAUNCH_SEQUENCE.md` exists with no `[TODO]` or placeholder strings
- [ ] `LAUNCH_SCRIPTS.md` items are sequentially numbered and each has a destination URL
- [ ] All asset files render valid Markdown
- [ ] All asset URLs (e.g., demo videos, screenshots referenced) resolve to 200
- [ ] `rollback.sh` is committed and executable
- [ ] `WAR_ROOM_RESPONSES.md` has ≥ 30 pre-drafted responses across all channels
- [ ] Audience Map identifies ≥ 5 specific communities with mod policy notes
- [ ] Channel ranking has explicit ROI math, not vibes
- [ ] Pre-Launch Dry Run scheduled in `LAUNCH_SEQUENCE.md` for T-1
- [ ] Founder has been told the exact launch date and what they'll need to do that day (≤ 2 hours of paste/click action)

---

## Checkpoint

```
─────────────────────────────────────────────────────
LAUNCH STRATEGY COMPLETE

Done:
  ✓ Channel intelligence run on [N] candidate channels
  ✓ Audience archaeology mapped [N] communities
  ✓ Top 3 channels chosen with explicit ROI math
  ✓ [N] complete asset bundles generated
  ✓ LAUNCH_SEQUENCE.md timestamped end-to-end
  ✓ LAUNCH_SCRIPTS.md serial paste recipe written
  ✓ War Room protocol + [N] pre-drafted responses
  ✓ Incident matrix + rollback.sh committed
  ✓ Pre-Launch Dry Run scheduled for [T-1 date]

Acceptance test: [PASS/FAIL with specifics]

Runs-itself score: [X] → [Y]
Launch date locked: [YYYY-MM-DD]

Type 'continue' to proceed to Marketing Setup.
Type 'shift launch [date]' to move the launch.
Type 'rerank' if a channel selection feels wrong.
─────────────────────────────────────────────────────
```

---

## Red Flags

- ❌ Returning a list of channel options for the founder to choose
- ❌ Producing strategy without the timestamped sequence
- ❌ Writing assets but no rollback procedure
- ❌ "We'll figure out responses on the day" — pre-draft them
- ❌ Generic Product Hunt copy that could describe any product
- ❌ HN post that uses startup-speak ("disruptive", "revolutionary", "AI-powered")
- ❌ Skipping competitor benchmarks because "every product is unique"
- ❌ Launch date that has no defensible reasoning
- ❌ Press outreach that doesn't reference the journalist's actual recent work
- ❌ Direct outreach lists with > 50% generic role-based emails (info@, hello@)
- ❌ No dry run — "we'll be careful on the day"
- ❌ No fallback channels for if the top channel fails on launch day
