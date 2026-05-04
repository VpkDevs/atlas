---
name: atlas-portfolio
description: Use when running Atlas in Portfolio Mode — triggered from a parent directory or any directory without a git repo. Reads all project contexts from ~/.atlas/portfolio/, generates weekly empire brief, allocates founder attention, surfaces sell signals, and runs the opportunity scanner.
---

# Atlas Portfolio — Empire Intelligence Layer

**Input:** All project contexts from `~/.atlas/portfolio/`
**Purpose:** Run the empire intelligently. Allocate founder attention where it has the highest ROI.

## The Rule

Every hour you spend on the wrong project is an hour stolen from compounding. Atlas allocates your time. You execute.

## Pre-Check: Portfolio Size

Before anything else, count projects in `~/.atlas/portfolio/`:

```
0 projects → No projects have been run through Atlas yet.
             Ask: "Which project directory should I run on first?"
             Then redirect to Single-Project Mode.

1 project  → Portfolio Intelligence requires ≥ 2 projects to be meaningful.
             Redirecting to single-project run on [Project Name].
             [Run full 11-module pipeline on that project]

2+ projects → Continue to Portfolio Audit below.
```

## Process

### Step 1: Portfolio Audit

Read all project contexts from `~/.atlas/portfolio/*/context.json`.

For each product, build the status snapshot:
```
[Product Name] ([slug])
  MRR: $[X] | Growth: [X]%/mo | Trend: ↑↓→
  Runs-itself score: [X]/100
  Last Atlas run: [date]
  Phase: [running-itself / needs-attention / in-sprint / sunset-candidate]
  Top issue: [one-line]
```

### Step 2: Portfolio Segmentation

**Running themselves (score ≥ 70, stable MRR):**
- Review quarterly, not weekly
- Flag if score drops below 60

**Need attention (score 40-70 or declining MRR):**
- Weekly check-in
- Atlas sprint recommended

**In sprint (currently being worked on):**
- Track progress against sprint targets
- Surface blockers

**Sunset candidates (declining MRR + score below 40 + not improving):**
- Calculate: is it worth selling vs. maintaining vs. shutting down?
- Provide sell recommendation with timing

### Step 3: Attention Allocation

This week, rank every product by:

```
Attention Priority Score = (Revenue Impact × Growth Rate × Leverage) / Current Runs-Itself Score
```

High revenue impact + high growth rate + low runs-itself score = needs your time most.

**Output:**
```
THIS WEEK'S ATTENTION ALLOCATION

Your most valuable hour: [Product X]
  Why: [MRR $X, growing X%/mo, runs-itself score only 45 — one sprint would free this]
  Recommended action: [specific]

Second priority: [Product Y]
  Why: [specific reasoning]
  Recommended action: [specific]

Leave alone this week: [Products Z, A, B]
  Why: Score ≥ 70, stable
```

### Step 4: Cross-Promotion Opportunities

Identify products with overlapping audiences:
- Shared target customer profiles
- Complementary (not competing) use cases
- Integration opportunities

For each opportunity:
- Which products + why their audiences overlap
- Specific cross-promotion mechanics (email mention, in-app referral, bundle)
- Revenue impact estimate

### Step 5: Sell Signal Detection

For each product showing plateau signals (< 3% MRR growth for 3+ months):

```
SELL SIGNAL: [Product Name]

Current MRR: $[X]
MRR growth: [X]%/mo (3-month avg)
Runs-itself score: [X]/100
Estimated sale price: $[X] - $[Y] ([multiple]x MRR)
Best time to sell: [now / after reaching $X MRR / other]
Where to list: Acquire.com (recommended for SaaS)

Keep vs. sell analysis:
  Keep: Generates $[X]/yr, [X] hours/month to maintain
  Sell: One-time $[X], free [X] hours/month
  Recommendation: [keep/sell] because [specific reasoning]
```

### Step 6: Opportunity Scanner

Search for new products worth building or buying:

**Acquisition targets:**
- Products on Acquire.com / Flippa matching portfolio + skill profile
- Price range: [based on portfolio_mrr × 0.5 years]
- Categories that complement existing products

**Unmet demand signals:**
- Reddit/HN/Indie Hackers patterns: "I wish there was a tool that..."
- Job postings for tools that don't exist yet
- Open source projects with traction but no monetization

**Buy vs. Build analysis (when relevant):**
- Acquisition cost vs. 12 months of development cost
- Time-to-market advantage
- Synergies with existing portfolio

### Step 7: Empire Financial Model

```
EMPIRE SNAPSHOT

Products: [N] total | [N] running themselves | [N] in sprint

Revenue:
  Total MRR: $[X]
  Passive MRR (score ≥70): $[X] ([X]% of total)
  Growth this month: +$[X] (+[X]%)

Asset value (3x ARR):
  Current portfolio: $[X]
  In 12 months at current growth: $[X]

Wealth trajectory:
  $10K MRR target: [date estimate]
  $50K MRR target: [date estimate]
  $100K MRR target: [date estimate]
  $1M/yr portfolio: [date estimate]

Personal brand content from this week's milestones:
  [list of milestones worth sharing]
```

### Step 8: Pattern Oracle (activates at 10+ projects)

When `~/.atlas/portfolio/` contains 10+ projects:

```
PATTERN ORACLE ACTIVATED

Your consistent blindspots:
  - [Pattern]: Happened in [N] projects. Correction applied automatically.

Your consistent strengths:
  - [Pattern]: Your [X] advantage is above average. Double down on this.

This week's historical parallel:
  "[Product X]" is at the same stage as "[Past Product Y]" was on [date].
  What happened with Y: [outcome]
  What this means for X: [recommendation]
```

### Step 9: YOUR_NEXT_MOVE.md

One thing. The most important action across the entire empire right now.

```
YOUR NEXT MOVE — [Date]

[One specific action]

Why this: [specific reasoning — revenue impact, growth unlock, or risk mitigation]
Time required: [estimate]
Expected outcome: [what changes after you do this]
```

Update `~/.atlas/portfolio/index.md` with current state.

## Output

- Portfolio weekly brief (displayed in terminal)
- Updated `~/.atlas/portfolio/index.md`
- `YOUR_NEXT_MOVE.md` — single most important action across the empire
- Updated `~/.atlas/memory.md` with new cross-project patterns

## Red Flags

- Recommending work on a "running itself" product that needs no attention
- Missing a sell signal in a plateaued product
- Not pulling patterns from `~/.atlas/memory.md`
- Generating empire financial model without reading actual metrics
- Opportunity scanner that suggests building instead of buying when acquisition is faster
- Not updating `~/.atlas/memory.md` with new learnings from this portfolio review
