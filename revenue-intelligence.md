---
name: atlas-revenue-intelligence
description: Use during Atlas Module 9 — runs after operations to find the first paying customer if MRR is zero, audit pricing for money left on the table, and fix conversion funnel leaks. Produces 10 personalized outreach messages, a pricing recommendation, and specific funnel fixes committed to the codebase.
---

# Atlas Revenue Intelligence

**Input:** Business Context + live product + analytics data (PostHog, Stripe, DB)
**Purpose:** Find and fix the gap between "product exists" and "product makes money."

## The Rule

This module runs regardless of current MRR. If MRR is $0, the primary mission is the First-Dollar Sprint. If MRR > $0, the mission is pricing audit + funnel optimization.

---

## Process

### Step 1: Revenue Status Assessment

Read from Stripe (or detected payment processor):
```
Current MRR: $[X]
Total customers: [N]
Most recent charge: [date]
Churn rate: [X]% (if calculable from data)
```

If MRR = $0 → immediately execute the First-Dollar Sprint (Step 2)
If MRR > $0 → execute Pricing Audit (Step 3) then Funnel Fix (Step 4)

### Step 2: First-Dollar Sprint (MRR = $0)

**The goal: one paying customer before this module ends.**

Atlas finds them. Not the founder.

#### Sub-Step 2a: Search for Leads

Use web search to find people who expressed the exact problem this product solves:

**Search strategy:**
```
Reddit:
  site:reddit.com "[pain point keywords]" OR "[competitor name] alternatives"
  → Find posts where users describe the problem Atlas's product solves

Twitter/X:
  "[competitor name] sucks" OR "wish there was a tool for [problem]"
  → Find complaint tweets about competitors

Hacker News:
  site:news.ycombinator.com "[problem domain]"
  → Find "Ask HN" threads requesting this type of solution

Indie Hackers:
  "[problem keywords]"
  → Find founders asking about this problem

Reddit communities specific to this product's niche:
  [detect from Business Context target audience]
  → Find active users expressing pain
```

Compile a list of 20 specific people who have expressed the problem this product solves. For each:
- Platform + handle
- Quote of what they said (the expressed pain)
- Date posted
- Why Atlas's product solves their specific problem

From the 20, select the 10 most likely to convert based on:
- Recency of pain expression
- Level of frustration (stronger emotion = higher intent)
- Public visibility (large following = referral potential)

#### Sub-Step 2b: Write 10 Personalized Outreach Messages

For each of the 10 leads, write a genuine, personalized outreach message that:
- References their specific post/complaint (not generic)
- Acknowledges their exact frustration
- Explains how Atlas's product addresses that specific situation
- Offers free trial / early access / lifetime deal
- Is under 100 words (shorter = higher response rate)

Format: `docs/founder/FIRST_DOLLAR_SPRINT.md`

```markdown
# FIRST DOLLAR SPRINT

## Lead 1 — [@handle] on [platform]
Posted: [date]
They said: "[exact quote]"
Why they'd buy: [specific reasoning]
Platform to contact: [direct message / reply / email]
URL: [direct link to their post]
Message to send:
---
[personalized outreach message — ~75 words]
---

## Lead 2 — ...
```

#### Sub-Step 2c: Sweepstakes / Beta Deal Structure (if appropriate)

If product is pre-revenue or early-stage, recommend a launch deal:
- Lifetime deal pricing (calculate: what price × how many LTD sales = runway for 12 months)
- Platforms: AppSumo, PitchGround, Dealify, or direct LTD offer
- Draft AppSumo application if product qualifies (SaaS, recurring nature)

#### Sub-Step 2d: Cold Email Infrastructure

If not already set up:
- Configure `RESEND_API_KEY` cold email sequence for outbound
- Warm-up domain protocol (if custom domain not yet warmed)
- Track open/reply rates via UTM parameters

### Step 3: Pricing Audit

**The question: Is this product leaving money on the table?**

#### Sub-Step 3a: Competitive Price Research

Use web search to find pricing for 3-5 direct competitors:
```
[Competitor 1]: $[X]/mo — [feature set]
[Competitor 2]: $[X]/mo — [feature set]
...
```

Compare to current pricing from Business Context:
- Is Atlas's product priced below market despite comparable or superior features?
- Is there a premium tier opportunity that doesn't exist yet?
- Is the pricing page clear and conversion-optimized?

#### Sub-Step 3b: Pricing Recommendation

Make one recommendation — not a list of options:

```
Current: $[X]/mo
Recommended: $[Y]/mo

Reasoning: [competitor A charges $X for fewer features; competitor B charges $Y for comparable;
your product fills a gap between these at $Y which is still perceived as cheaper than B
while reflecting more value than A]

Expected impact: +[N]% revenue without losing customers (estimate based on price elasticity)

If you want tiered pricing:
  Starter: $[X]/mo — [specific features]
  Pro: $[Y]/mo — [specific features]
  Business: $[Z]/mo — [specific features]
```

If Atlas recommends a price change:
- Commit the updated pricing in the codebase (Stripe product prices, pricing page)
- Grandfather existing customers (add a flag to their records)
- Write the announcement email to existing users

#### Sub-Step 3c: Pricing Page Audit

Read the landing page / pricing page from the codebase:
- Is the CTA above the fold?
- Is there a free trial or freemium option? (reduces signup friction)
- Is pricing anchored correctly? (most expensive plan shown first)
- Social proof on pricing page? (testimonials, user count)
- Is the upgrade from free → paid obvious?

Commit any copy/UX improvements directly.

### Step 4: Conversion Funnel Analysis

**Track where users drop off. Fix the leaks.**

#### Sub-Step 4a: Funnel Audit

If PostHog/Mixpanel is configured, read the funnel data:
```
Signup → Activation → Paid Conversion
[X]       [Y]%         [Z]%
```

If no analytics data yet: infer likely drop-off points from codebase:
- Is the signup flow > 3 steps? (each step loses 20-40% of users)
- Does activation require any setup? (time-to-value over 5 min kills conversion)
- Is the payment flow > 2 clicks from signup? (friction kills conversion)

#### Sub-Step 4b: Commit Funnel Fixes

For each identified drop-off point, commit a fix:

**Common fixes Atlas commits directly:**
- Reduce signup form fields (remove anything not strictly needed for first login)
- Add loading states to async operations (perceived performance)
- Add empty states with clear first-action CTA (guides new users)
- Add onboarding checklist component (increases activation rate)
- Add "skip for now" to optional setup steps (removes blockers)
- Fix any broken CTA buttons (check all conversion paths actually work)

Write a PostHog funnel tracking setup if not already measuring these transitions.

### Step 5: Affiliate/Referral Opportunity

Does this product have a referral mechanic worth implementing?

```
If yes:
  - Recommend program structure (discount vs. cash vs. credit — specific)
  - Implementation: ReferralHero (free tier) OR custom referral code system
  - Commit referral code generation logic if custom
  - Write program terms

If no:
  - State why (B2B with small customer count, LTD product, etc.)
```

### Step 6: Revenue Intelligence Summary

```
REVENUE INTELLIGENCE SUMMARY — [Product Name]

Current MRR: $[X]
Pricing: [current] → [recommended]

First-Dollar Actions:
  → [N] personalized outreach messages ready in FIRST_DOLLAR_SPRINT.md
  → Expected: first response within [X] days

Funnel Fixes Committed:
  → [N] fixes committed that address [specific drop-off points]

Pricing Change:
  → [specific recommendation or "pricing is competitive"]

Referral Program:
  → [implement / not applicable because reason]
```

---

## Output

- `docs/founder/FIRST_DOLLAR_SPRINT.md` (if MRR = $0)
- Pricing changes committed to codebase (if recommended)
- Funnel fixes committed
- Referral program (if applicable)
- Git commit + push

---

## Checkpoint

```
─────────────────────────────────────────────────────
REVENUE INTELLIGENCE COMPLETE

Atlas did:
  ✓ Current MRR assessed: $[X]
  [If MRR = $0:]
  ✓ Searched [Reddit / Twitter / HN] for leads
  ✓ 20 leads identified, 10 selected
  ✓ 10 personalized outreach messages written in FIRST_DOLLAR_SPRINT.md
  [Always:]
  ✓ Pricing audit: [current] → [recommended] because [reason]
  ✓ Pricing [updated in codebase / competitive — no change]
  ✓ Funnel: [N] drop-off points identified, [N] fixes committed
  ✓ Referral program: [implemented / not applicable]

Runs-itself score: [X] → [Y]

Human must do (non-blocking):
  → Send 10 outreach messages from FIRST_DOLLAR_SPRINT.md (~15 min)

── PROCEEDING TO GROWTH ENGINE ──────────────────────
─────────────────────────────────────────────────────
```

## Red Flags

- ❌ Skipping this module because "we're not ready to think about revenue"
- ❌ Writing generic cold outreach templates instead of personalized messages
- ❌ Not searching for actual leads before writing outreach
- ❌ Pricing recommendation without researching competitor prices
- ❌ Not committing funnel fixes — describing them instead
- ❌ Skipping the referral analysis
