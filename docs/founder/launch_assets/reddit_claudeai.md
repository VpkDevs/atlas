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
