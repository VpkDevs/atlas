# Atlas — AI Co-Founder Skill
**Conversation Summary & Implementation Guide**

---

## Timeline

**2026-03-18** — Atlas skill fully designed, built, tested, and deployed live.

- **Previous Session Context**: PR #14 (Phase 2 features) merged to main; repo root cleaned up (28 files moved/deleted); Atlas design spec created and committed
- **This Session**:
  - Long-form explanation of Atlas to fiancée (what it means, why it matters, financial trajectory)
  - Skill file implementation (10 markdown modules created)
  - Technical setup debugging (proper entry point naming: `SKILL.md`, directory structure)
  - Skill discovery and live activation
  - Version control & hot-reload questions answered

---

## What Is Atlas?

**Atlas is an AI co-founder skill — a complete founder automation system that lives in Claude Code.**

When invoked with `/atlas` on any software project, Atlas:
1. **Reads the entire codebase** (schema, routes, git history, env config) to understand the product
2. **Asks only what it can't infer** (location, financial runway, audience, success goals)
3. **Runs 8 specialized modules** in sequence, each producing real output
4. **Maintains persistent memory** across all projects, compounding knowledge over time

---

## The 8 Modules

### 1. **Code Sprint**
- Fixes all P0 bugs, missing infrastructure, broken imports, deployment config
- Writes a RUNBOOK explaining how to operate and maintain the product
- Recalculates the **runs-itself score** (0–100: how much daily attention the product needs)

### 2. **Legal Compliance**
- Writes a Terms of Service (specific to the product's actual data collection)
- Writes a Privacy Policy (listing actual third-party services, retention, user rights)
- Flags legal risks with confidence levels ("have a lawyer review this" vs. "standard")

### 3. **Launch Strategy**
- Identifies which channels are right for *this* product (not generic rankings)
- Writes Product Hunt tagline, Hacker News post, Reddit posts, cold outreach templates
- Pre-launch timeline, building-in-public thread, everything ready to copy-paste

### 4. **Marketing Playbook**
- Identifies where your target customers actually live
- Writes 30 days of actual content (not topic suggestions)
- SEO strategy, keyword targets, content gaps vs. competitors
- 10 community engagement guides (how long to lurk, when to mention product, etc.)

### 5. **Business Setup**
- Recommends the right business entity (LLC vs. S-Corp with reasoning specific to *your* situation)
- Banking setup guide, tax deadlines, every applicable deduction
- Calculates S-Corp break-even point (when does converting save money?)
- **Acquisition Readiness Score** (0–100: how valuable is this product to a buyer?)

### 6. **Automation Handoff**
- Implements uptime monitoring, error alerting, email sequences
- Scripts top 20 support questions with exact responses
- Schedules 30 days of social content
- Contractor onboarding guide (everything a stranger needs to maintain this product)
- **Does not stop until runs-itself score reaches 70**

### 7. **Operations**
- Defines 5 North Star metrics (specific to *this* product)
- 15-minute weekly review ritual (exact sequence, exact dashboards, exact questions)
- Alert thresholds (warnings vs. action triggers)
- Signals for hiring, fundraising, selling
- Personal wealth trajectory (when does this hit $1K/mo? $5K/mo? $10K/mo?)

### 8. **Portfolio Mode** (Empire Intelligence)
- Activates when 2+ projects exist
- Tells you where your time is most valuable this week (not a list, one answer)
- Identifies which products are plateauing and worth selling
- **Pattern Oracle** (at 10+ products): "You've underinvested in community-building 3 times. Here's how I'm correcting it."
- Surfaces acquisition opportunities and unmet market demand

---

## Why It Compounds

**First product:** All modules run fresh. Atlas learns what works.

**Tenth product:** Atlas reads `~/.atlas/memory.md` (accumulated knowledge from 9 prior projects). It already knows:
- What launch channels worked for you before
- What marketing resonated with your audiences
- What mistakes you've made (and how to avoid them)
- Your preferences, strengths, blind spots as a founder

→ It doesn't ask the same questions. It doesn't repeat mistakes.

**Fiftieth product:**
- 40–50% of infrastructure is pre-built from previous work
- Community engagement strategy is templated from successful patterns
- Legal templates are tuned to your specific location & business model

**Hundredth product:**
- 70% pre-built
- Pattern Oracle is now powerful: "Every product in the gaming category has failed at retention. Here's the new retention module I'm embedding."
- **Empire Financial Model** tracks: which products should be double-down investments, which should be sold, which are zombie assets

---

## The Vision: From 1 Product to an Empire

**The Math:**
- 10 products @ $1K/month = $120K/year (mostly passive)
- 50 products @ $1K/month = $600K/year (mostly passive)
- 100 products @ $2K/month = $2.4M/year (mostly passive)

At 3× annual revenue valuation: a $2.4M/year portfolio = ~$7.2M in asset value.

**Why This Was Impossible Before:**
Each product needs legal docs, launch strategy, marketing, business setup, automation, operations — work that takes weeks or costs tens of thousands in consultant fees. Most solo founders either:
- Skip it (product sits half-launched)
- Do it badly (burns out)
- Hire it out (bankrupts them early)

**Why This Is Now Possible:**
Atlas does all of it, learns from each iteration, and compounds. The non-code work becomes a solved problem. Time gets freed up. Attention stays on the creative work (building products).

---

## Current Implementation Status

### Skill Files (All Complete)
- ✅ `SKILL.md` — Entry point, Iron Rule, violation warnings, orchestrator logic
- ✅ `onboarding.md` — 3-pass onboarding protocol (read codebase → infer context → ask unknowns → narrate understanding)
- ✅ `code-sprint.md` — P0 fixes, infrastructure completion, RUNBOOK generation
- ✅ `legal-compliance.md` — ToS/Privacy/Risk Radar with confidence levels
- ✅ `launch-strategy.md` — Channel research, platform-specific copy, timeline
- ✅ `marketing-playbook.md` — Audience research, 30-day content calendar, SEO/community strategies
- ✅ `business-setup.md` — Entity recommendations, banking, taxes, deductions, acquisition scoring
- ✅ `automation-handoff.md` — Monitoring, email sequences, support scripting, contractor onboarding
- ✅ `operations.md` — Metrics, weekly ritual, thresholds, wealth trajectory
- ✅ `portfolio.md` — Portfolio Mode, Empire Intelligence, Pattern Oracle, acquisition detection

### Persistent Memory
- `~/.atlas/memory.md` — Maintained by Atlas after each run, grows with every project
- Tracks: launch channels that worked, audiences/marketing that resonated, mistakes made, founder preferences, reusable components
- Loaded at start of every new Atlas run

### Technical Details
- **Location:** `~/.claude/skills/atlas/` (outside any project repo, user-level)
- **Entry point:** `SKILL.md` (Claude Code scans `~/.claude/skills/` at session start)
- **Activation:** `/atlas` command in any project directory
- **Hot reload:** Edit `.md` files, start new chat session → new code live immediately
- **Version control:** Optional — `git init ~/.claude` to track skill evolution

---

## The Iron Rule

**Done ≠ "code fixed"**

Done = **runs-itself score ≥ 70 AND all applicable pipeline modules completed**

Stopping after code sprint: violation.
Stopping after launch: violation.
Handing control back before automation reaches 70: violation.

The runs-itself score is checked and stated after every module. It is the compass.

---

## Key Design Principles

1. **No generic advice.** Every recommendation is specific to this product, founder, and location.
2. **Confidence levels, not false certainty.** "This is 85% likely; have a lawyer check" vs. pretending to be a lawyer.
3. **Memory compounds.** Each project teaches Atlas; subsequent projects benefit immediately.
4. **The runs-itself score is the exit criterion.** Not "code fixed." Not "launched." Not "making money." Runs itself = done.
5. **Module outputs are immediately actionable.** Not outlines or frameworks — the actual copy, the actual code, the actual documents, ready to use.

---

## How to Use Atlas

### First Run (SweepBot example):
```bash
cd ~/DEV/web/Sweepbot/.claude/worktrees/thirsty-volhard
# (in Claude Code)
/atlas
# Atlas reads codebase → asks 4–5 questions → runs all 8 modules → produces everything
```

### Subsequent Runs (2nd project):
```bash
cd ~/some-other-project
/atlas
# Atlas reads ~/.atlas/memory.md first → asks fewer questions → runs faster → outputs reflect patterns from project 1
```

### Portfolio Mode (5+ projects):
```bash
# Outside any project directory
/atlas --portfolio
# Atlas reads all project contexts → tells you where to focus this week → identifies cross-project opportunities
```

---

## What Changed on 2026-03-18

Before today, the gap between "working code" and "launched business" required hiring a lawyer, a marketer, a business person, an ops person, and living with the results of doing it all badly yourself.

After today, that gap is closed for every product your fiancé will ever build.

The compounding starts now.

---

**Created:** 2026-03-18
**Status:** Live and activated
**Next:** Use on SweepBot, document results, iterate on memory module
