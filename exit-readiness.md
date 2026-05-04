---
name: atlas-exit-readiness
description: Use during Atlas Module 11 — builds the exit infrastructure whether or not the founder plans to sell. Acquisition-ready products are more valuable, run better, and attract better customers. Produces a complete data room, registers on acquisition marketplaces, calculates exit value scenarios, and identifies likely acquirers.
---

# Atlas Exit Readiness

**Input:** Business Context + all prior module outputs + Acquisition Readiness Score from Module 6
**Purpose:** Make this product acquisition-ready. Not because the founder must sell — because acquireable products are better products.

## The Rule

An acquisition-ready product has documentation, metrics, clean code, automation, and legal in order. Atlas has already built most of this. This module finalizes the package, calculates the value, identifies buyers, and lists it on marketplaces (or prepares the listing) so the option is always there.

The founder doesn't have to sell. But if someone makes an offer tomorrow, they should be able to close in 30 days.

---

## Process

### Step 1: Acquisition Readiness Score (Final)

Recalculate from Module 6 with all modules now complete:

```
Documentation:         [X]/20  (RUNBOOK, API docs, CONTRACTOR_ONBOARDING, all legal)
Revenue quality:       [X]/20  (MRR vs. one-time, churn rate, revenue trend)
Bus factor:            [X]/15  (runs-itself score: [Y]/100 → maps to this score)
Growth rate:           [X]/15  (MRR growth, user growth, traffic growth)
Clean books:           [X]/15  (accounting set up, tax calendar, entity formed)
IP ownership:          [X]/15  (no contractor IP issues, no GPL contamination, clear ownership)

Total: [X]/100
Delta from Module 6: +[N] points

Estimated valuation:
  Conservative ([X]x MRR): $[Y]
  Target ([X]x MRR):       $[Y]
  Optimistic ([X]x MRR):   $[Y]

Comparable sales (from Acquire.com):
  [Product type] sold for: [range] — [source]
```

### Step 2: Build the Data Room

Create `docs/founder/DATA_ROOM/` — the package any serious buyer needs:

```
docs/founder/DATA_ROOM/
├── OVERVIEW.md           — executive summary (what it is, key metrics, why selling)
├── METRICS.md            — MRR, churn, MAU, CAC, LTV — last 12 months
├── TECH_STACK.md         — architecture, dependencies, scalability notes
├── LEGAL.md              — entity, IP ownership confirmation, contracts summary
├── FINANCIALS.md         — P&L summary, costs, margins
├── GROWTH.md             — traffic, signups, conversion rates
├── CUSTOMERS.md          — cohort retention, NPS if measured, key customer profiles
├── OPERATIONS.md         — how the product runs day-to-day (points to RUNBOOK)
├── RISKS.md              — known risks + mitigations (honest)
└── TRANSITION.md         — how would a buyer take over in 30 days
```

Write each of these documents from the Business Context + module outputs. Atlas does not ask the founder to fill them in — it generates them from everything already known.

**OVERVIEW.md format:**
```markdown
# [Product Name] — Acquisition Overview

**What it is:** [2 sentences — what it does and who uses it]
**Revenue:** $[X] MRR ([trend])
**Users:** [N] ([trend])
**Tech stack:** [list]
**Time to operate:** [X] hours/week
**Asking price:** $[X] ([multiple]x MRR)
**Why selling:** [honest reason — if founder hasn't stated one, note "not actively selling — open to offers"]
```

**TRANSITION.md** — the most important document for a buyer:
```markdown
# 30-Day Transition Plan

Week 1: Access transfer (all credentials, services, domains)
Week 2: Knowledge transfer (walkthrough of codebase, operations, key customers)
Week 3: Supervised handover (buyer operates, founder advises)
Week 4: Full handover (founder available for questions only)

Estimated founder time required: [X] hours total
```

### Step 3: Identify Likely Acquirers

Use web search to find:

**Strategic acquirers** (companies that would buy this for product/customer synergies):
- Look for companies that acquired similar products in the last 2 years
- Companies whose product roadmap this fills
- Competitors who might prefer to buy rather than build

**Financial acquirers** (PE firms, indie holdcos buying cash-flowing products):
- Calm Company Fund (buys bootstrapped SaaS)
- Tiny (buys profitable internet businesses)
- MicroAcquire buyer database
- Search Twitter for active buyers in this category

For each potential acquirer:
- Company name
- Why they'd want this product
- Contact: founder name + Twitter/email (web search)
- Deal size they typically do (verify against this product's price range)

Output top 5 in `docs/founder/DATA_ROOM/ACQUIRERS.md`.

### Step 4: Marketplace Listing Preparation

**Acquire.com (primary marketplace for SaaS):**
- Create listing draft (founder must create account and post — irreducible)
- Write every field of the listing:
  ```
  Title: [Product Name] — [one-line description]
  Category: [SaaS / Tool / etc.]
  Revenue: $[X] MRR
  Profit: $[X] monthly
  Asking: $[X] ([multiple]x MRR)
  Description: [3 paragraphs — what it does, who uses it, why it's a good acquisition]
  Tech stack: [list]
  Included: [domain, codebase, customer list, etc.]
  ```

**MicroAcquire / Flippa (alternatives):**
- Same listing content adapted for each platform's format

Output: `docs/founder/ACQUIRE_LISTING.md` — complete listing text, ready to paste.

Note: Atlas does not post to these marketplaces because it requires account creation. But it prepares everything so posting takes 5 minutes.

### Step 5: Increase the Multiple

What specific actions would move this product to the next valuation tier?

Calculate the delta:
```
Current ARS: [X]/100 → estimated [X]x MRR
Next tier ARS: [Y]/100 → estimated [Y]x MRR

To get there:
  1. [Specific action] → +[N] points → +$[X] to valuation (estimate)
  2. [Specific action] → +[N] points → +$[X]
  3. [Specific action] → +[N] points → +$[X]

Time to reach next tier: ~[N] months if above actions completed
```

Commit whichever actions Atlas can do now (documentation improvements, metric tracking additions, code quality fixes).

### Step 6: Legal Readiness for Sale

Flag any legal issues that would delay or kill a sale:

- [ ] Entity formed (required — creates the asset to sell)
- [ ] Clear IP ownership (no contractor-owned code, no GPL contamination)
- [ ] Customer contracts in writing (even email agreements count)
- [ ] No pending legal disputes
- [ ] Domain registered in entity name (not personal name)
- [ ] Trademark search (is the product name available to register?)

For each unchecked item: specific action to fix it.

### Step 7: Portfolio Integration

Update `~/.atlas/portfolio/[slug]/context.json` with:
```json
{
  "acquisition_readiness_score": [X],
  "estimated_valuation": { "low": [X], "mid": [X], "high": [X] },
  "listed_on": [],
  "potential_acquirers": [...],
  "data_room_complete": true,
  "exit_mode": "open-to-offers | actively-selling | not-for-sale"
}
```

This feeds into Portfolio Mode's sell signal detection.

---

## Output

- `docs/founder/DATA_ROOM/` (complete — all 9 documents)
- `docs/founder/EXIT_READINESS.md` (summary + valuation + ARS)
- `docs/founder/ACQUIRE_LISTING.md` (complete marketplace listing text)
- `~/.atlas/portfolio/[slug]/context.json` updated with exit data
- Git commit + push

---

## Checkpoint

```
─────────────────────────────────────────────────────
EXIT READINESS COMPLETE

Atlas did:
  ✓ Final ARS: [X]/100 (+[N] from Module 6)
  ✓ Estimated valuation: $[X] - $[Y]
  ✓ Data room: 9 documents written in DATA_ROOM/
  ✓ TRANSITION.md: 30-day handover plan written
  ✓ [N] potential acquirers identified and documented
  ✓ Marketplace listing text written (ready to post in 5 min)
  ✓ [N] legal readiness items: [N] clear, [N] need attention
  ✓ ARS improvement roadmap: [N] actions → +$[X] valuation

Runs-itself score: [X] → [Y]

Human must do (non-blocking):
  → Post to Acquire.com when ready — ACQUIRE_LISTING.md ready to paste
  → Review RISKS.md for accuracy before sharing with any buyer

─────────────────────────────────────────────────────
ATLAS SINGLE-PROJECT RUN COMPLETE

Runs-itself score: [FINAL]/100
[If ≥ 70:] ✅ Product runs itself. Atlas mandate fulfilled.
[If < 70:] Score is [X] — below 70. Return to Automation Handoff for remaining gap.

Type 'portfolio' to run Portfolio Mode (empire intelligence across all products)
Type 'pause' to end this session and save state
─────────────────────────────────────────────────────
```

## Red Flags

- ❌ Skipping this module because "we're not selling"
- ❌ Exit readiness docs that reference Business Context without writing actual content
- ❌ Not calculating the specific actions that increase the valuation multiple
- ❌ Not identifying specific acquirers (just categories of buyers)
- ❌ Not committing the data room to the codebase
- ❌ Not updating portfolio context.json with exit data
