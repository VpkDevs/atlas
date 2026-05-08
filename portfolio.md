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

**Running themselves (score ≥ 80, stable or growing MRR):**
- Review monthly, not weekly
- Auto-tick via Growth Engine cron
- Flag for attention if score drops below 70 (investigate immediately if below 60)

**Need attention (score 50-80 or declining MRR > 10%/month):**
- Weekly Atlas Growth Engine tick
- Consider targeted sprint on lowest-score category

**In sprint (currently being worked on):**
- Track progress against sprint targets
- Surface blockers daily

**Sunset candidates (ALL THREE conditions must be true):**
1. MRR growth < 2%/month for 3 consecutive months
2. Sovereign Score < 50 and not improving
3. Founder time investment > revenue generated / 50 (i.e., paying yourself less than $50/hour)

→ Calculate: sell vs. maintain vs. shut down (see Step 5)
→ Sunset is a business decision, not a failure. Surface it clearly.

### Step 3: Attention Allocation (Executable Formula)

```python
# Attention Priority Score — run this calculation for each product
# Higher score = more deserving of founder time this week

def attention_score(product):
    mrr = product.current_mrr
    mrr_growth = product.mrr_growth_weekly  # decimal, e.g., 0.05 for 5%
    sovereign_score = product.sovereign_score  # 0-100
    hours_per_week = product.founder_hours_last_week
    
    # Revenue impact: normalized to $10K MRR = 1.0
    revenue_impact = min(mrr / 10000, 2.0)
    
    # Growth rate: weekly compound growth
    growth_factor = max(mrr_growth, 0) * 10  # 5%/week = 0.5
    
    # Leverage: how much would 2 hours of Atlas sprint improve score?
    leverage = (90 - sovereign_score) / 90  # closer to 0 = already sovereign
    
    # Denominator: time already being spent
    time_cost = max(hours_per_week, 0.1)
    
    return (revenue_impact * (1 + growth_factor) * leverage) / time_cost
```

**Output — computed, not estimated:**
```
THIS WEEK'S ATTENTION ALLOCATION

Product scores (highest = most deserving of your time):
  [Product X]: score 0.84 — MRR $2,400 (+8%/wk), Sovereign 42, 1hr/wk currently
    → Action: Run Atlas sprint on automation gap (+22 score points)
    → Expected outcome: free up this product within 2 weeks
    
  [Product Y]: score 0.31 — MRR $800 (+2%/wk), Sovereign 71, 3hrs/wk
    → Action: Reduce time investment; Growth Engine can handle this
    
  [Product Z]: score 0.08 — MRR $5,200, Sovereign 88, 0hrs/wk
    → Leave alone. Running itself.

Leave alone this week: [Products where score < 0.15]
  Why: Score ≥ 80, stable
```

### Step 4: Shared Infrastructure Audit

Before cross-promotion, check for shared infrastructure opportunities:

```
SHARED INFRASTRUCTURE SCAN:

For each pair of products, check:
  - Same Stripe account? → Can bundle pricing, share subscription management
  - Same auth provider? → Can offer SSO/single login across products
  - Same email list tool? → Can cross-promote to shared list
  - Same component library/design system? → Can share UI code, reduce maintenance
  - Same database/Supabase project? → Data sharing possible (check privacy implications)
  - Same deployment platform/team? → Shared env vars, shared logs

If same Stripe account AND complementary products:
  → Draft a "Bundle" pricing tier combining both products at discount
  → Atlas Wealth calculates: bundle LTV vs. individual LTV

If overlapping email lists (users of Product A who haven't tried Product B):
  → Atlas Growth segments and drafts cross-promo email sequence
```

### Step 4b: Cross-Promotion Opportunities

Identify products with overlapping audiences:
- Shared target customer profiles (read from each product's `context.json`)
- Complementary (not competing) use cases
- Integration opportunities

For each opportunity, produce a specific playbook:
- Which products + why their audiences overlap
- Specific cross-promotion mechanics (email mention, in-app referral, bundle)
- Estimated revenue impact: [X]% of Product A users convert to Product B = $[Y] additional MRR
- Commit: cross-promo email template + in-app referral component (if applicable)

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
  Passive MRR (score ≥80): $[X] ([X]% of total)
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

## Acceptance Test (Portfolio Mode)

- [ ] All `context.json` files in `~/.atlas/portfolio/*/` read successfully
- [ ] Attention allocation scores computed for every project (not estimated — calculated)
- [ ] `YOUR_NEXT_MOVE.md` contains exactly ONE action with specific reasoning
- [ ] `~/.atlas/portfolio/index.md` updated with current state
- [ ] `~/.atlas/memory.md` appended with new cross-project learning (if any)
- [ ] Any sunset candidate surfaced with explicit keep/sell/shutdown recommendation
- [ ] Empire financial model uses actual Stripe MRR data (not placeholder values)

## Red Flags

- ❌ Recommending work on a product with score ≥ 80 and stable MRR
- ❌ Missing a sell signal in a product with 3+ months of < 2% MRR growth
- ❌ Not reading `~/.atlas/memory.md` before generating recommendations
- ❌ Empire financial model using `[X]` placeholders instead of actual numbers
- ❌ Opportunity scanner suggesting build-vs-buy without a cost/timeline comparison
- ❌ Not updating `~/.atlas/memory.md` — this is how Atlas compounds intelligence
- ❌ YOUR_NEXT_MOVE.md containing more than one action
- ❌ Treating "I don't have metrics" as acceptable — pull them via API if credentials exist
- ❌ Sunset recommendation without the 3-condition threshold check
