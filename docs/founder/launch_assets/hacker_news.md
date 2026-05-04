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
