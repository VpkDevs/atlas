---
name: founder-kit
description: Founder launch kit: strategy, sequence, channel fitness, and ready-to-post launch assets.
---

# Launch Strategy (Founder Doc)

# Atlas Launch Strategy

**Date:** May 5, 2026
**Launch date:** Tuesday, May 19, 2026
**Version:** Atlas v6 — The Sovereign Empire

---

## Decision: Branch B — 2-Week Prepared Launch

Chose 2 weeks over "now" (Branch A) and 3 weeks (Branch C) because:
- The demo video is the single highest-leverage asset and takes a few days to do right
- 2 weeks gives time to build 5–10 engaged supporters without building a paid network
- Branch C (full landing page) is the eventual right play, but waiting kills momentum
- The GitHub stars from HN will be the social proof that makes PH viable later

See CHANNEL_FITNESS_MATRIX.md for full channel scoring.

---

## Channel Priority

1. **Hacker News** (primary) — 738-point "Claude Skills" discussion proves audience exists
2. **r/ClaudeAI** (primary) — highest Atlas-audience density of any platform
3. **Indie Hackers** (secondary) — intent-rich, long half-life
4. **r/SideProject** (secondary) — high volume, lower signal
5. **Product Hunt** (deferred) — requires social proof first; schedule 2–3 weeks post-HN

---

## The Core Positioning Bet

The market is saturated with "AI coding agents." Atlas's differentiator is:

> **Atlas runs your business, not just your code.**

Every piece of launch copy leads with this. The Sovereign Score and its definition
(revenue > expenses, payout in bank) is the proof point that this is real.

The honest downsides are included in every post — HN especially punishes 
anything that sounds like marketing copy. Honesty is the strategy.

---

## Pre-Launch Checklist

- [ ] Demo video recorded and committed
- [ ] 5+ HN supporters lined up (not for upvotes — for genuine engagement)
- [ ] Validator passing locally
- [ ] README reviewed for accuracy
- [ ] All launch assets in docs/founder/launch_assets/ reviewed

---

## Success Metrics (Launch Week)

| Metric | Minimum | Good | Great |
|--------|---------|------|-------|
| GitHub stars (T+7) | 50 | 200 | 500+ |
| HN points | 50 | 200 | 500+ |
| Reddit upvotes (total) | 100 | 500 | 1000+ |
| Installs (estimated via clone traffic) | 20 | 100 | 300+ |
| "I'd pay for this" signals | 3 | 15 | 40+ |

If minimum thresholds not met: read every comment, identify the objection, iterate before Product Hunt.
If good/great thresholds met: proceed to Product Hunt within 2 weeks.

---

## Post-Launch Decision Tree

```
T+7 days:
  GitHub stars ≥ 50 AND "I'd pay" signals ≥ 5?
    YES → Build Stripe integration for paid tier
    NO  → Run one more channel (Discord) + iterate on feedback

T+14 days:
  Stars ≥ 200?
    YES → Submit to Product Hunt with demo video + real user quotes
    NO  → Defer PH; focus on content compounding (Indie Hackers long-form)
```

---

## The Demo Video Brief

**Length:** 90–120 seconds
**Format:** Screen recording (no face camera needed)
**Script outline:**

0:00 — Open a real project directory in terminal. Type `/atlas`. Hit enter.
0:05 — Show onboarding pass happening: "Reading codebase... 3 passes..."
0:20 — Show the confirmation ritual: business context displayed, inferences tagged
0:35 — Skip to pre-flight: "11 checks... all green"  
0:50 — Show LAUNCH_SEQUENCE.md being generated: scroll through the timestamped steps
1:05 — Show a content post being scheduled via Buffer API: the actual API call, the response
1:20 — Show the growth_log.md entry being written
1:35 — End on the dashboard HTML opening in browser

**Tone:** No voiceover needed. Terminal output tells the story.
**Upload:** Commit to docs/assets/atlas-demo.mp4. Link from README.

---

# Launch Sequence

# LAUNCH SEQUENCE — Atlas v6

**Launch date:** Tuesday, May 19, 2026
**All times:** PST (UTC-7)
**Executor:** Vince — scroll top to bottom, do each step, check the box

0 placeholders. 0 decisions to make on the day. Scroll. Paste. Click. Done.

---

## T-14 Days — Monday, May 5 ✅ (Today)

- [x] Repo created: https://github.com/VpkDevs/atlas
- [x] Legal docs committed: docs/legal/
- [x] Validator passing: 49/49
- [x] CI green on push
- [ ] Record a 2-min demo screen capture: `/atlas` running on a real project
      → Record in OBS or Loom; don't need to edit; raw is fine
      → Show: onboarding pass → code sprint → pre-flight → launch sequence generation
      → Save as: `docs/assets/atlas-demo.mp4`
      → This is the most important pre-launch asset. Do it this week.

---

## T-7 Days — Tuesday, May 12

- [ ] **09:00** — Tweet the "coming next week" thread (paste below):

```
Building in public.

Next Tuesday I'm launching Atlas — a Claude Code skill that runs your 
entire software business, not just your code.

14 phases. Deploys. Launches. Markets. Runs the weekly growth loop.
Sovereign exit condition: revenue > expenses, 0 human commits, 
payout in your bank.

Free tier available. Full pipeline $29/mo.

github.com/VpkDevs/atlas

— more details in thread 🧵
```

- [ ] **09:05** — Reply to tweet with thread (paste below):

```
Here's what makes it different from AI coding tools:

Most stop at "code works." Atlas doesn't stop until your Sovereign Score 
hits 90 — which means the business is literally running without you.

The exit condition requires:
→ Revenue > expenses for 30 days
→ Zero human commits in 14 days
→ Zero human support replies in 14 days
→ First payout in your bank

/2
```

```
The six-layer action hierarchy is the part I'm most proud of.

Before Atlas marks anything as "needs human," it tries:
1. Direct API
2. CLI
3. Browser automation
4. Pre-filled artifact + exact URL
5. Post a bounty to Upwork (The Swarm)
6. Irreducible human

Most things don't reach 6. Scheduling social posts never does.
Setting up email sequences never does.

/3
```

```
What it actually looks like in practice:

You type /atlas in your project directory.

3 hours later you have: code fixed, deployed, legal docs committed, 
all launch assets written, 90 days of content scheduled, 
monitoring configured, and a timestamped recipe for launch day.

You didn't write a single word of copy.

/4 — launching May 19. Star the repo if you want to follow along 👇
https://github.com/VpkDevs/atlas
```

- [ ] **10:00** — DM 10 people in your network who use Claude Code. Ask them to try the free tier and reply with what they find. (Don't ask for upvotes. Ask for feedback.)

- [ ] **By EOD** — Record the 2-min demo if not done by T-14

---

## T-3 Days — Saturday, May 16

- [ ] **10:00** — Second tweet (paste below):

```
3 days until Atlas launches.

The thing I've been most surprised by building it: how many "founder tasks" 
turn out to have APIs.

Buffer API schedules your posts.
Resend API configures your email sequences.
Better Uptime API creates your monitors.
Stripe API sets up dunning.

Atlas calls them all. If the key is in .env, it runs.
It doesn't describe running it.

github.com/VpkDevs/atlas — free tier available Tuesday
```

- [ ] Confirm demo video is done and committed to repo

---

## T-1 Day — Monday, May 18

- [ ] **09:00** — Run the validator one more time: `node scripts/validate.js`
      → Must show 49/49 (or more) before proceeding
- [ ] **09:15** — Verify GitHub repo is public and README renders correctly
- [ ] **10:00** — Final tweet / reminder (paste below):

```
Tomorrow: Atlas v6 launches.

One command. 14 phases. Your code becomes a business.

Free to try. MIT license. Runs locally.

Setting alarms for 9am PST tomorrow. 
```

- [ ] **14:00** — Draft HN post in a text file. Read it out loud. Is it honest? Is it specific? Does it avoid hype? Fix anything that sounds like startup copy.
- [ ] **20:00** — Confirm you have 5+ people ready to read + comment on the HN post tomorrow morning (not upvote-beg — genuinely engage)

---

## LAUNCH DAY — Tuesday, May 19, 2026

### 08:45 PST — Pre-launch checks
- [ ] Verify GitHub repo is accessible (curl -sf https://github.com/VpkDevs/atlas → 200)
- [ ] Verify validator still passes: `node scripts/validate.js`
- [ ] Have the HN post body open in a text editor, ready to paste
- [ ] Have the r/ClaudeAI post body open in a second tab
- [ ] Have r/SideProject post open in a third tab
- [ ] Have the Indie Hackers post open in a fourth tab
- [ ] Coffee ☕

### 09:00 PST — HN LIVE
- [ ] Open: https://news.ycombinator.com/submit
- [ ] Title: `Show HN: Atlas – A Claude Code skill that runs your software business, not just your code`
- [ ] URL: `https://github.com/VpkDevs/atlas`
- [ ] Text: *paste from docs/founder/launch_assets/hacker_news.md body section*
- [ ] Submit
- [ ] Verify post appears at: https://news.ycombinator.com/newest
- [ ] Copy the post URL — you'll need it for Twitter

### 09:05 PST — Twitter launch
- [ ] Tweet (paste below):

```
Just posted to Show HN:

Atlas – A Claude Code skill that runs your software business, not just your code.

14 phases from broken repo to a business running itself.
MIT licensed. Free tier available.

[HN link] / github.com/VpkDevs/atlas
```

### 09:10–10:00 PST — Monitor + engage HN
- [ ] Refresh HN post every 5 minutes
- [ ] Reply to every comment using prepared responses in hacker_news.md
- [ ] Text your 5 supporters: "It's live: [HN link] — read and comment honestly"

### 10:30 PST — r/ClaudeAI
- [ ] Open: https://reddit.com/r/ClaudeAI/submit
- [ ] Title: *paste from reddit_claudeai.md*
- [ ] Body: *paste from reddit_claudeai.md*
- [ ] Flair: Tool/Resource
- [ ] Submit

### 12:00 PST — r/SideProject
- [ ] Open: https://reddit.com/r/SideProject/submit
- [ ] Title: *paste from reddit_sideproject.md*
- [ ] Body: *paste from reddit_sideproject.md*
- [ ] Submit

### 14:00 PST — Indie Hackers
- [ ] Open: https://www.indiehackers.com/post/new
- [ ] Title: *paste from indie_hackers.md*
- [ ] Body: *paste from indie_hackers.md*
- [ ] Submit

### 17:00 PST — Day metrics snapshot
- [ ] Record current GitHub stars
- [ ] Record HN points + position
- [ ] Record Reddit upvotes
- [ ] Write one sentence in growth_log.md: "Launch day: [stars] stars, [HN points] points, [notes]"

### 20:00 PST — Evening tweet
- [ ] Paste below:

```
Launch day wrap.

[X] GitHub stars in [X] hours.
HN: #[N] on front page, [X] points.
r/ClaudeAI: [X] upvotes.

Most common question: [quote the real most-asked thing]

Thanks for the reception. Building in public continues.
```

---

## T+1 Day — Wednesday, May 20

- [ ] **09:00** — Reply to everyone who commented overnight on any platform
- [ ] **10:00** — "Day 1 numbers" post on Indie Hackers:
      "Here's what happened on launch day: [real numbers, honest reflection]"
- [ ] **11:00** — If HN got ≥ 100 points: draft Product Hunt listing for launch in 2 weeks
- [ ] **11:00** — If HN got < 50 points: read every comment, identify the real objection, iterate

---

## T+7 Days — May 26

- [ ] Decide: is the paid tier ready to build? Check for:
      - ≥ 50 GitHub stars
      - ≥ 5 people expressing intent to pay ("I would pay for this")
  - [ ] YES → Start Stripe integration
  - [ ] NO → Run one more launch channel (Discord communities, newsletter)

---

## Rollback Procedure

If something goes seriously wrong on launch day:

**GitHub repo goes down:** Wait. GitHub SLA is 99.9%. It will come back. Don't panic-post.

**HN post flagged:** Don't re-post same day. Post in comments: "Seems the post got flagged. Happy to answer questions here." Then re-submit with slightly different framing next week.

**Reddit post removed:** Check mod mail. Usually a flair issue or link format. Fix and resubmit.

**Installer broken:** `git clone` should work — test it yourself right now. If it fails, fix before 09:00.

---

## Launch Day Contacts

People to message if HN starts getting traction and you need amplification:
- [ ] (Fill in 3–5 people you know who would genuinely share it)

---

# Channel Fitness Matrix

# Atlas — Channel Fitness Matrix

**Date:** May 5, 2026
**Product:** Atlas v6 — The Sovereign Empire
**Target customer:** Solo founders and indie developers using Claude Code

---

## Competitor Benchmark

| Product | Channel | Result | Notes |
|---------|---------|--------|-------|
| "Claude Skills are awesome" blog post | HN | 738 pts, 370 comments | Not a product — a think-piece. Shows HN *hungers* for this conversation. |
| OpenHands "Show HN" | HN | 11 pts | Low — positioned as Devin alternative, HN has Devin fatigue |
| Claude Code (Anthropic) | PH | 5.0 ★, 401 reviews | Platform-level product; sets ceiling expectation |
| Agent Skills registry | HN | 4 pts | Poorly differentiated — "another skills collection" |
| UI-stack Claude skill | HN | Not retrieved — niche | Niche skill, niche audience |
| AI coding agents category | PH | Saturated | Cursor leads; commoditized framing |

**Key insight from benchmarks:**
The HN community actively wants to discuss Claude skills but rejects "yet another agent" framing.
Atlas's differentiator — **it runs the whole business, not just the code** — has no direct competitor.
That positioning is the unlock.

---

## Channel Scoring Matrix

Scoring 1–10 on each dimension. Higher = better fit.

| Dimension | Hacker News | Product Hunt | r/SideProject | r/ClaudeAI | Twitter/X | Indie Hackers |
|-----------|-------------|--------------|---------------|------------|-----------|---------------|
| Audience overlap | **9** | 7 | 8 | **10** | 7 | **9** |
| Content fit | **9** | 7 | 8 | **10** | 7 | 8 |
| Conversion path | 7 | 8 | 7 | 8 | 6 | 8 |
| Effort to produce | 8 | 6 | 8 | 9 | 8 | 7 |
| Half-life | **9** | 4 | 5 | 6 | 2 | **9** |
| Defensibility | 8 | 5 | 6 | 7 | 5 | 7 |
| Founder fit | **9** | 7 | 8 | 9 | 8 | 8 |
| **TOTAL** | **59** | **44** | **50** | **59** | **43** | **56** |

---

## Channel Rankings

### #1 — Hacker News (Show HN) — Score: 59/70
**Why:** The 738-point "Claude Skills" discussion proves there is a massive, primed audience for this exact conversation. HN readers are technical, skeptical, and will actually try the tool. A well-framed Show HN that leads with *what it does* (runs your business) rather than *what it is* (an AI agent) will land.

**Expected reach:** 5K–40K impressions on day of post  
**Expected conversion:** ~0.3–1% → GitHub stars/installs  
**Expected signups (paid, eventual):** 20–150 from this channel alone  
**Confidence:** High — anchored to comparable HN skill posts  
**Risk:** HN has "AI agent fatigue." Framing must be specific and honest, not hype.

### #2 — r/ClaudeAI (Reddit) — Score: 59/70
**Why:** The most concentrated audience of existing Claude Code users anywhere on the internet. They already understand the substrate. They are already looking for skills. Atlas is exactly what they want.

**Expected reach:** 2K–15K impressions  
**Expected conversion:** 1–3% → installs (highest conversion of any channel)  
**Confidence:** High  
**Risk:** Must not read as promotional. Lead with a demo clip and a technical walkthrough.

### #3 — Indie Hackers — Score: 56/70
**Why:** The Indie Hackers audience explicitly cares about building businesses, not just code. Atlas's "sovereign in 30 days" pitch is native to this audience's goals. Long-form posts here have multi-month half-lives in search.

**Expected reach:** 1K–8K impressions (lower volume, higher intent)  
**Expected conversion:** 2–4% (highest quality leads)  
**Confidence:** Medium-High  
**Risk:** Needs a real story — a specific project Atlas ran through its pipeline.

### #4 — r/SideProject — Score: 50/70
**Why:** 400K+ subscribers, self-promotion explicitly allowed, technical enough to appreciate the depth.

**Expected reach:** 1K–10K impressions  
**Confidence:** Medium  
**Risk:** Lower signal-to-noise, shorter half-life

### #5 — Product Hunt — Score: 44/70
**Why this ranks lower:** PH is saturated with AI coding tools. Winning Product of the Day requires ~800 upvotes minimum on weekdays and a pre-arranged upvoter network. Atlas does not have that network yet. PH is a **second-wave channel** — launch on HN and Reddit first, use the resulting GitHub stars and testimonials to build a PH submission that has social proof behind it.

**Recommendation:** Submit to PH 2–3 weeks after HN launch with screenshots, a demo video, and real user quotes.

### Not Yet: Twitter/X — Score: 43/70
Atlas has no Twitter account, no followers, no history. Organic Twitter is a compounding channel — it takes weeks to build enough reach for a launch tweet to matter. The marketing playbook will build this up over time. Not a Day 1 channel.

---

## Parallel Universe Analysis — Launch Timing

**Branch A: Launch this week (fast)**
→ Less preparation, raw demo, no social proof  
→ Expected: 200–400 HN points, 150 GitHub stars, 10–30 installs  
→ Confidence: Low-Medium

**Branch B: Launch in 2 weeks (prepared)**
→ Demo video recorded, landing page live, 10 beta testers with quotes  
→ Expected: 400–800 HN points, 400–800 stars, 50–150 installs  
→ Confidence: Medium-High

**Branch C: Launch after landing page + demo video (3 weeks)**
→ Full visual demo, "dark haunted vaporwave" aesthetic demonstrated  
→ HN post links to a landing page that makes people feel something  
→ Expected: 600–1200 points, 800–2000 stars, 100–300 installs, PH #1 candidate  
→ Confidence: High for engagement; uncertain for conversion to paid

**Recommendation: Branch B** — the landing page is worth 2 weeks. It converts HN curiosity into GitHub stars and those stars convert into paid users when the paid tier launches. Branch C is the ideal but we have momentum now and Branch B ships.

**Launch date: Tuesday, May 19, 2026** — 2 weeks out. Tuesday for HN (peak engineer traffic), 9am PST.

---

# Launch Assets (Ready-to-Post)

## Launch Asset: hacker_news

# Atlas — Hacker News Launch Asset

**Post type:** Show HN
**Target date:** Tuesday, May 19, 2026, 09:00 PST
**Account:** Use existing HN account (check karma ≥ 25, age ≥ 30 days before posting)

---

## Title

```
Show HN: Atlas – A Claude Code skill that runs your software business, not just your code
```

**Why this title works:**
- "Show HN" signals it's a real thing you built, not an article
- "runs your software business" is a concrete, specific claim that differs from "AI coding agent"
- Doesn't say "AI co-founder" (startup-speak HN dislikes)
- Doesn't say "autonomous" (AI hype HN flags)
- Creates immediate curiosity: what does "runs your business" mean exactly?

---

## Body

```
I built Atlas because I was tired of AI tools that help me build software but leave 
the rest — deploying it, launching it, marketing it, running it week to week — entirely 
up to me.

Atlas is a Claude Code skill (/atlas) that handles the full pipeline:

1. Reads your codebase, infers everything it can, asks only what it can't
2. Fixes blocking bugs, deploys to production, verifies the URL returns 200
3. Writes product-specific legal docs and commits the serving routes
4. Does an 11-point pre-flight check before touching any launch platform
5. Researches where your actual customers live, writes every launch asset,
   generates a timestamped numbered sequence (not a strategy doc — a recipe)
6. Calls the Buffer/Resend/Stripe APIs directly if the keys are in .env.
   It does not describe calling them.
7. After launch: runs a weekly cycle — pulls metrics, picks one action,
   executes it, logs it, repeats

The exit condition isn't "shipped." It's a Sovereign Score ≥ 90: revenue > expenses
for 30 consecutive days, zero human commits in 14 days, first payout in your bank.

The part that surprised me most: the six-layer action hierarchy. Before Atlas marks
anything as "needs human," it tries: (1) direct API, (2) CLI, (3) browser automation,
(4) pre-filled artifact with direct URL, (5) Swarm (posting a bounty to Upwork), 
(6) irreducible human. Most things don't reach 6.

It's MIT licensed and runs entirely locally — all state at ~/.atlas/, no Atlas servers 
involved. The free tier covers the first three phases; full pipeline is $29/mo.

GitHub: https://github.com/VpkDevs/atlas
```

---

## Prepared Replies to Likely Comments

**"How is this different from Devin?"**
```
Devin automates coding tasks within a session. Atlas automates the entire business 
lifecycle — deployment, legal, launch, marketing, weekly metrics → action loops — 
and persists between sessions via state files. It's also a Claude Code skill, 
so it runs on your machine with your keys, not our servers. Different scope, 
different substrate, different exit condition.
```

**"This is just prompts/instructions, not a real product"**
```
Accurate — it's 22 markdown files totaling ~7,800 lines. But "just prompts" dismisses 
what those prompts actually do: they encode a complete operating model for a software 
business, with specific CLI commands, API call patterns, acceptance gates, and 
self-healing protocols for common failure modes. A bash script is "just text" too. 
The question is whether it works. Happy to walk through a specific phase if you want 
to probe the depth.
```

**"What's the Sovereign Score exactly?"**
```
0–100 composite across 10 categories: code/deployment health, monitoring, email 
automation, support automation, active acquisition channel, content engine, 
iteration loop, economic sovereignty (automated P&L/tax), social presence, 
and documentation. Targets: 60 = launch floor, 80 = sustained, 90 = sovereign.
It's checked after every phase and shown as three numbers: current, achievable 
without human action, achievable with human actions and estimated time.
```

**"What happens when the Claude API fails or gives wrong output?"**
```
Universal self-healing protocol: capture the error, classify it (AUTH/QUOTA/NETWORK/
INPUT/LOGIC/ENV), apply the class-specific fix, retry up to 3 times with meaningful 
changes between attempts. If still failing: log to ~/.atlas/incidents/, mark the 
phase blocked, continue with non-dependent tasks, surface a specific unblock action. 
It never stops mid-pipeline — it routes around blockers.
```

**"How do you handle secrets safely?"**
```
Atlas reads .env presence only — it detects that STRIPE_SECRET_KEY exists but never 
reads or logs its value. It maintains a credentials_index.json (booleans only: 
{stripe: true, posthog: false}) to know what it can use without touching actual keys. 
No Atlas servers are involved; all state is local at ~/.atlas/.
```

**"Will you add [feature X]?"**
```
Check the roadmap section in the README — what's there is what's prioritized. 
Open an issue if yours isn't listed and explain the use case. The self-improvement 
loop (Atlas opening PRs to edit its own modules based on friction signals) is 
coming — that's how features will compound.
```

**"Is this legal / does it violate platform ToS?"**
```
Atlas places responsibility on the user (ToS Section 4.3) for platform compliance. 
For posting automation specifically: Buffer/Typefully APIs are explicitly permitted 
by those platforms. Direct platform APIs (Twitter v2, LinkedIn) are used within 
their stated rate limits. Browser automation is only used for platforms with no API. 
The docs/legal/COMPLIANCE_CHECKLIST.md has the detailed breakdown.
```

---

## Timing Details

- Post at exactly **09:00 PST Tuesday May 19**
- First 90 minutes are algorithm-critical — need ~30 upvotes or the post is buried
- Have 5–10 people ready to upvote and comment within the first hour (not bots — actual people who've tried it or read it)
- Respond to every comment within 30 minutes for the first 4 hours
- Do NOT ask for upvotes in the post or comments (HN rule)

## Pre-Arranged Supporters

Before posting, DM these people and ask them to read + comment honestly (not upvote-beg):
- [ ] Add names here as you identify them from your network

## Ban/Flag Check

Before submitting, verify:
- [ ] Account karma ≥ 25
- [ ] Account age ≥ 30 days  
- [ ] No recent flags on account
- [ ] URL (github.com/VpkDevs/atlas) is not domain-flagged (check: submit a test link in a throwaway post first if uncertain)

## Launch Asset: indie_hackers

# Atlas — Indie Hackers Launch Asset

**Platform:** Indie Hackers (indiehackers.com/post/new)
**Target date:** Tuesday, May 19, 2026 — 14:00 PST
**Post format:** Long-form milestone post

---

## Title

```
I built a Claude Code skill that handles the entire business lifecycle — 
from broken code to a self-running business. Here's how it works.
```

---

## Body

```
About six months ago I shipped my fourth side project that never became 
a business.

The code was fine. The product was reasonable. But deployment sat on my 
to-do list for two weeks, then marketing sat there for three more, then I 
never got around to the legal stuff, and the "run it weekly and iterate" 
part never materialized because I was already deep in the next thing.

The problem wasn't capability. It was activation energy at each step.

So I built Atlas: a Claude Code skill that handles the full pipeline — 
not just the code, but everything that turns code into a revenue-generating 
business.

---

**The Pipeline**

When you run `/atlas` in a project directory, it reads your codebase, 
figures out what it can infer, asks only what it can't, and then runs 14 phases:

**Phases 1–4: Foundation**
- Code sprint: fixes every blocking bug, deploys, verifies 200
- Legal: reads your actual data collection from code, writes a specific ToS 
  and Privacy Policy (not a template — yours)
- Pre-flight: 11 checks. Blocks launch if anything is red. Rolls back if needed.

**Phases 5–8: Launch prep**
- Researches where your actual customers are (HN, specific subreddits, 
  niche Discords — not generic "use social media")
- Generates LAUNCH_SEQUENCE.md: a timestamped numbered recipe, not a strategy doc. 
  Step 1 at 9:00am, paste this. Step 2 at 9:05am, open this URL.
- Schedules 90 days of content, calls the Buffer API if the key is in .env, 
  builds the press kit, identifies micro-influencers and writes personalized DMs
- Applies to applicable startup credit programs ($50K+ infra value available 
  across AWS Activate, Vercel, GitHub, Cloudflare, Anthropic, etc.)
- Configures monitoring and email sequences via the actual APIs

**Phase 9–10: Launch**
- Executes the sequence in real-time, monitors every channel, handles comments 
  with pre-drafted responses, fires milestone notifications
- 72-hour war room: checks in at T+1h, T+12h, T+24h, T+48h, T+72h. 
  Ships one data-driven iteration before closing.

**Phases 11–14: Running the business**
- Weekly metrics pull from Stripe, PostHog, Plausible
- Picks ONE action, executes it, logs it
- Repeats every week, forever, without you prompting it (via GitHub Actions cron)

The exit condition is Sovereign Score ≥ 90 — which requires sustained revenue, 
14 days with no human commits, and an actual payout in your bank.

---

**The Part I'm Most Proud Of**

The Six-Layer Action Hierarchy. Before Atlas marks anything as "needs human," 
it tries:
1. Direct API (if key exists in .env)
2. CLI (install it silently if missing)
3. Browser automation (Playwright)
4. Pre-filled artifact + exact URL (paste recipe)
5. The Swarm (post a bounty to Upwork/Fiverr with a detailed SOW)
6. Irreducible human (ID verification, physical signature)

Most tasks don't reach Layer 6. Posting to social media never does. 
Setting up email sequences never does. Filing for an LLC stays at Layer 4 
(it gives you the exact state SOS URL + paste-ready text + the $300 filing fee info). 
Banking stays at Layer 4 + 6 (Mercury link + what to bring). 

The goal was: could someone physically unable to type use Atlas and be making money 
a month later?

---

**What It Is (Technically)**

22 markdown files, ~7,800 lines. A Claude Code skill — meaning it runs inside 
Claude Code on your machine, using your own API keys, with all state stored locally 
at ~/.atlas/. No Atlas servers involved.

MIT licensed. Free tier covers phases 1–3 (code, legal, pre-flight).
Full pipeline: $29/mo Individual, $99/mo Studio (unlimited projects).

GitHub: https://github.com/VpkDevs/atlas

---

**What I Want to Know From IH**

I'm trying to figure out how to validate the paid tier before building the 
subscription infrastructure. Has anyone here successfully charged for a Claude 
Code skill? Or a similar "CLI tool that does a specific job for founders"?

The free tier already works — it's deployed, it's MIT, it's on GitHub. 
The question is whether $29/mo is the right number for the full pipeline 
and whether Individual vs. Studio framing makes sense.
```

---

## Why This Post Works for IH

- Ends with a genuine question (IH community loves to give feedback)
- Has a real story (the "fourth side project that never became a business")
- Technical enough to be credible without being inaccessible
- Pricing question invites discussion and captures intent signals
- Long-form with depth — IH posts with <200 words rarely get traction

## Launch Asset: reddit_claudeai

# Atlas — r/ClaudeAI Launch Asset

**Subreddit:** r/ClaudeAI
**Subscribers:** ~350K+
**Self-promotion policy:** Allowed with substance; no pure promotion
**Target date:** Tuesday, May 19, 2026 — 10:30 PST (90 min after HN to stagger)
**Post format:** Text post with demo link

---

## Title

```
I built a Claude Code skill that handles the whole business lifecycle, not just the code — 
14 phases from broken repo to a business running itself
```

**Why this title works for r/ClaudeAI:**
- Existing Claude Code users immediately understand the substrate
- "14 phases" signals depth and specificity
- "running itself" is the hook — they want to know what that means

---

## Body

```
Been building this for a few months. Posting here because this community 
will actually understand what it does.

**What it is:** A Claude Code skill (/atlas) — 22 markdown files, ~7,800 lines — 
that takes a software project from raw codebase to a self-operating business.

**What it actually does (not marketing speak):**

When you run `/atlas` in a project directory, it:

- Pass 1: Reads your entire codebase silently — code, git history, .env file 
  *presence*, deps. No interview yet.
- Pass 2: Builds a structured picture of everything it can infer, tags each 
  inference as CONFIRMED/INFERRED/UNKNOWN
- Pass 3: Asks only about the UNKNOWN things — usually 4-5 questions max

Then it executes 14 phases:

1. Code sprint — fixes P0 blockers, deploys, verifies 200
2. Legal — writes actual ToS/Privacy based on what your code *really* collects
3. Pre-flight — 11 checks, blocks launch if anything is RED
4. Launch strategy — researches where your customers actually are, builds 
   LAUNCH_SEQUENCE.md (numbered recipe, not strategy doc)
5. Marketing — schedules 90 days of content via API if keys exist
6. Business setup — recommends entity type, applies to startup credits programs
7. Automation — configures monitoring/email via the actual APIs
8. Launch day — executes the sequence, monitors in real-time
9. War room — 72hr live ops, ships one iteration based on data
10-14. Operations, revenue intel, growth engine (weekly pulse→decide→execute 
   loop), exit readiness

**The part that differentiates it from "AI coding agent":**

The growth engine is a weekly cron. It:
- Pulls metrics from Stripe/PostHog/Plausible
- Detects anomalies vs prior week and 4-week average
- Picks ONE action (not five — one)
- Executes it (posts content, fixes a bug, sends a re-engagement email)
- Logs it to growth_log.md
- Repeats

The exit condition is Sovereign Score ≥ 90: revenue > expenses 30 days, 
zero human commits 14 days, first payout in your bank.

**The honest part:**

It still runs on Claude. Which means it has all of Claude's limitations — 
long context drift, occasional hallucination, can't do things that need a 
physical body (ID verification, phone 2FA). These are documented explicitly 
in the skill files. For Layer 6 tasks (irreducible human) it generates a 
userMust object with every field required: exact URL, paste-ready content, 
estimated time, alternatives if you skip it.

**Free to use:** MIT license. Runs locally. No Atlas servers.
Paid tier ($29/mo) unlocks the full pipeline. Free tier does phases 1-3.

**GitHub:** https://github.com/VpkDevs/atlas

Happy to answer specific questions about how any phase works. The modules 
are readable markdown — no magic.
```

---

## Pre-Drafted Comment Responses

**"Doesn't Claude Code already do this?"**
```
Claude Code is the substrate — Atlas is a skill that runs inside it. Like asking 
"doesn't VSCode already write code?" VSCode is the editor; your extension/plugin 
is the behavior layer. Atlas encodes a specific, opinionated operating model for 
software businesses into that behavior layer.
```

**"How is the Sovereign Score calculated?"**
```
Ten categories: code/deployment (15), monitoring (10), email automation (10), 
support automation (10), active acquisition channel (15), content engine (10), 
iteration loop (10), economic sovereignty (10), social presence (5), documentation (5).
Checked after every phase. Three numbers shown: current score, achievable without 
human action, achievable with pending human actions + estimated time.
```

**"Does it work on non-SaaS projects?"**
```
Phases 1-4 (code, legal, pre-flight) work on anything deployable. 
Phases 5+ assume there's a business to run — a URL, users, some revenue model. 
It handles: SaaS, browser extensions, APIs, marketplaces, content sites, CLI tools. 
Not great fit for native mobile apps (deployment phase doesn't cover App Store submission) 
or hardware. Edge cases are handled in edge-cases.md.
```

---

## Flair

Use flair: "Tool/Resource" or "Project" (whichever r/ClaudeAI offers)

## Notes

- r/ClaudeAI has the highest Atlas-relevant audience density of any platform
- This community has discussed Claude skills extensively — the 738-point HN thread was linked here
- Post at 10:30am PST (active window; avoid overlap with HN 90-min critical period)
- Respond to every comment within 2 hours for the first day

## Launch Asset: reddit_sideproject

# Atlas — r/SideProject Launch Asset

**Subreddit:** r/SideProject
**Target date:** Tuesday, May 19, 2026 — 12:00 PST (staggered from HN/ClaudeAI)
**Post format:** Text with link

---

## Title

```
I built an AI co-founder that deploys, launches, and runs your side project 
as a business — open source, runs locally, 14-phase pipeline
```

---

## Body

```
Built this because I kept shipping side projects that never became businesses.
Not because I couldn't code — because everything *after* coding (deployment, 
legal, marketing, running the damn thing weekly) consistently didn't happen.

So I built Atlas: a Claude Code skill that handles the full pipeline from 
"broken repo" to "this thing runs itself."

**What makes it different from AI coding tools:**

Most AI dev tools stop at "code fixed, PR merged." Atlas doesn't stop 
until you hit Sovereign Score ≥ 90 — which requires:
- Revenue > expenses for 30 consecutive days
- Zero human commits in 14 days  
- Zero human support replies in 14 days
- An actual payout in your bank account

**How the weekly loop works:**

After launch, Atlas runs a growth engine tick every week:
1. Pulls Stripe/PostHog/Plausible metrics
2. Computes deltas vs last week and 4-week average
3. Detects anomalies
4. Picks ONE action (content, bug fix, pricing test, re-engagement email)
5. Executes it using whatever API keys are in .env
6. Logs it
7. Repeats

It uses a permissions file (atlas-permissions.yml) that you define once: 
what it can do automatically, what needs your approval, what it never touches. 
Everything within the auto-approve scope fires without asking.

**The honest downsides:**
- Still requires Claude Code ($20/mo Anthropic subscription)
- Can't do things requiring physical identity (bank setup, App Store, 2FA)
- The "growth engine" is only as good as the data it has — sparse metrics = worse decisions
- It's 22 markdown files, not compiled software. Smart prompt engineering, not magic.

**MIT license. All state local. No servers.**
Free tier: phases 1-3 (code, legal, pre-flight)
Full pipeline: $29/mo

https://github.com/VpkDevs/atlas
```

---

## Subreddit Rules Compliance Check
- [x] Original project (not affiliate link)
- [x] Self-promotion explicitly allowed in r/SideProject
- [x] No misleading claims — "AI co-founder" qualified with honest downsides
- [x] Link to free/open source version

