---
name: atlas-business-setup
description: Use during Atlas Module 6 — sets up the legal and financial infrastructure for this specific founder's situation. Entity type, banking, accounting, taxes, deductions, S-Corp timing, exit strategy. Outputs complete applications for all 7 startup credit programs. Specific, not generic.
---

# Atlas Business Setup

**Input:** Business Context + founder location + financial situation
**Purpose:** Get the legal/financial infrastructure right the first time. And unlock up to $200K+ in free infrastructure credits.

## The Rule

Atlas gives specific recommendations with reasoning, not a menu of options to research. If confidence is low, it says so — but it still gives a recommendation.

**Atlas applies for all 7 startup credit programs in this module. Every time. Not optionally.**

---

## Process

### Step 1: Entity Type Recommendation

Based on: founder location, team size, funding intentions, income expectations.

**Default early-stage rule (US solo founder): do not spend the LLC money yet.**

If the founder is solo, US-based, pre-revenue or still validating first-dollar demand, Atlas defers LLC formation and operates the launch path as a sole proprietorship / individual. This keeps the founder moving through Stripe, email, monitoring, and first-dollar validation without pausing for a ~$300 formation spend.

Atlas should recommend LLC formation only when at least one trigger is true:
- Meaningful liability exposure exists (regulated advice, health, finance, physical goods, marketplace disputes, substantial user-generated content).
- The product has repeat revenue or clear sales momentum that justifies formation cost.
- A B2B customer, payment processor, bank, vendor, grant, or tax situation requires an entity.
- The founder is adding partners, contractors with IP complexity, employees, or outside capital.
- The expected annual net profit makes entity/tax planning worth doing now.

Until a trigger is true:
- Stripe should be configured as an individual / sole proprietor account when available.
- Public docs may use the founder name or product trade name, with "sole proprietorship" noted internally.
- Tax reserve still starts immediately; entity formation is deferred, not ignored.
- `pending_human_action` for LLC formation is non-blocking and must not block launch, checkout, or first customer.

**Decision framework:**
```
Solo founder, US, pre-revenue:          Sole proprietor / individual; defer LLC until trigger
Solo founder, US, <$80K/yr expected:    Sole proprietor first; LLC after revenue/risk trigger
Solo founder, US, >$80K/yr expected:    LLC → S-Corp election
Funded startup / VC track:              C-Corp (Delaware)
Team of 2+, profit-sharing needed:      LLC with operating agreement
Non-US founder, US customers:           See non-US table below
```

**Non-US founder entities (⚠️ Medium confidence — recommend local accountant for formation steps):**

| Country | Recommended Entity | Formation |
|---------|-------------------|-----------|
| UK | Ltd (Private Limited Company) | Companies House, ~£12 |
| Canada | Inc (Federal or Provincial) | Varies by province |
| Australia | Pty Ltd | ASIC registration |
| Germany | UG (haftungsbeschränkt) | Notary required for GmbH |
| Netherlands | BV | Chamber of Commerce |
| Other EU | Varies by country | ⚠️ Flag for local accountant |
| Other | Unknown | ⚠️ Flag for local accountant |

For non-US founders wanting US business presence: **Stripe Atlas** (stripe.com/atlas) handles LLC formation + US bank account. Always include this in startup credits section.

**⚠️ Confidence flag for non-US:** Output entity recommendation, then add: "I'm confident in the structure but recommend a local accountant or Stripe Atlas to confirm formation steps specific to [country]."

Write the recommendation with:
- Entity type + formation state (home state vs. Delaware vs. Wyoming — with reasoning)
- Exact formation steps only if a formation trigger is active; otherwise write "Deferred LLC trigger checklist"
- Cost estimate, including "saved now" amount if formation is deferred
- Timeline
- What changes the answer ("if you raise funding, convert to C-Corp")

### Step 2: Banking Setup

Specific account recommendations (not generic options):
- Pre-entity path: use founder's existing bank account or a separate personal checking account for sole-prop revenue tracking until LLC trigger; keep a clean ledger from day one.
- Business checking after entity trigger: specific bank recommendation + why (Mercury for indie founders — no fees, API access, easy setup)
- Business savings: HYSA for runway (specific product recommendation)
- Stripe payout separation (why this matters for bookkeeping)
- Credit card recommendation (cashback vs. travel based on spend patterns)

### Step 3: Accounting Setup

Tool recommendation based on complexity:
- **Sole prop / early LLC:** Wave (free) or QuickBooks Simple Start
- **LLC with employees / S-Corp:** QuickBooks Online Essentials
- **Multiple products / entities:** QuickBooks Online Plus

Setup steps:
- Chart of accounts to create for this type of business
- How to connect Stripe/bank feeds
- Expense categories specific to this business
- Reconciliation frequency

### Step 4: Tax Calendar

Every filing deadline for year 1 based on entity type and state:

| Deadline | Filing | Amount (estimated) |
|----------|--------|-------------------|
| [Date] | [Filing name] | [$ estimate or formula] |

Quarterly estimated tax payment schedule with calculation method.

### Step 5: Deduction Identification

Specific to this business:
- Home office (if applicable): calculation method + documentation required
- Equipment purchased this year: Section 179 eligibility
- Software subscriptions: list from detected dependencies
- R&D credit eligibility: does this product qualify?
- Health insurance premiums: self-employed deduction
- SEP-IRA: maximum contribution at expected income
- Travel: rules for deductible business travel

### Step 6: S-Corp Election Timing

```
Self-employment tax savings from S-Corp:
  At $[X] income: save $[Y]/year
  Payroll processing cost: ~$500-1500/year
  Break-even: ~$[Z]/year in business income

S-Corp makes sense when: net profit > $[amount]
Current projected income: $[amount from Business Context]
Recommendation: [elect now / set calendar reminder for $X milestone]
```

### Step 7: Startup Credits Sprint (MANDATORY — All 7 Programs)

Atlas outputs complete application content for every applicable program. These are not optional suggestions — they are outputs of this module.

**1. AWS Activate (up to $100K)**
URL: atlas.amazon.com
Application text:
```
Company name: [product name]
Website: [URL]
Stage: [Early Stage / Seed]
Description: [2-3 sentences about the product — specific]
Accelerator/VC (if none): "Self-funded"
AWS services used: [list from detected services in codebase]
```
Expected: $5,000-$25,000 for self-funded founders

**2. Stripe Atlas ($500 credit + US entity)**
URL: stripe.com/atlas
Application text:
```
[Complete answers to all Stripe Atlas questions]
```
Note: Stripe Atlas handles entity formation and US banking support, but Atlas should not push this as the first move for a US solo founder who can sell as an individual. Treat it as a deferred option until an LLC/entity trigger is active. For non-US founders who need US business presence, it remains a stronger early option.

**3. Vercel Startup Credits**
Email to: startups@vercel.com
Subject: "Startup program inquiry — [Product Name]"
Body:
```
[Complete outreach email — specific to this product, mentions free tier usage,
growth trajectory, and why Vercel Pro would accelerate the product]
```

**4. GitHub for Startups (Free Teams forever)**
URL: github.com/solutions/startups
Application:
```
[Complete application answers]
```

**5. Cloudflare for Startups ($250K credits)**
URL: cloudflare.com/forstartups
Application:
```
Company description: [specific to this product]
How you use Cloudflare: [detect from codebase — Workers, DNS, CDN, etc.]
```

**6. Anthropic Startup Credits**
URL: console.anthropic.com/settings/credits
Application:
```
[Complete application if AI features are used in the product]
```

**7. Google for Startups ($200K GCP)**
URL: cloud.google.com/startup
Application:
```
[Complete application if GCP services are used]
```

**Output:** `docs/founder/STARTUP_CREDITS.md` — all 7 applications in one file, ready to submit in order.

**Estimated value:** $5,000–$300,000 in infrastructure credits depending on product and stage.

### Step 8: Exit Strategy Options

Buyers pay for different things depending on product type:

| Product Type | Typical Buyers | Revenue Multiple | What Improves Multiple |
|-------------|---------------|-----------------|----------------------|
| SaaS (recurring) | PE, strategic | 3-8x ARR | MRR growth, churn, NPS |
| Content/SEO | Indie buyers | 30-50x monthly profit | Traffic, email list |
| Developer tool | Strategic | 4-10x ARR | API usage, integrations |
| Marketplace | Strategic/PE | 2-5x revenue | GMV, take rate, retention |

**Acquisition Readiness Score (initial):**
```
Documentation:     [X]/20
Revenue quality:   [X]/20  (MRR vs. one-time, churn)
Bus factor:        [X]/15  (can it run without founder?)
Growth rate:       [X]/15
Clean books:       [X]/15
IP ownership:      [X]/15

Total: [X]/100
Estimated multiple at current score: [X]x
To reach next tier: [specific improvements]
```

---

## Output

- `docs/founder/BUSINESS_SETUP.md`
- `docs/founder/TAX_CALENDAR.md`
- `docs/founder/STARTUP_CREDITS.md` ← all 7 applications ready to submit
- Acquisition Readiness Score (initial)

---

## Checkpoint

```
─────────────────────────────────────────────────────
BUSINESS SETUP COMPLETE

Atlas did:
  ✓ Entity recommendation: [sole prop now / LLC now / C-Corp now] — [reasoning]
  ✓ LLC formation decision: [deferred / active] — trigger: [none / reason]
  ✓ Formation guide or deferred-trigger checklist written with exact URLs and costs
  ✓ Banking setup: Mercury recommended — [URL]
  ✓ Tax calendar: [N] deadlines mapped
  ✓ [N] deductions identified
  ✓ Startup credits: all 7 applications written in STARTUP_CREDITS.md
  ✓ Estimated credit value: $[X] - $[Y] if approved
  ✓ Acquisition Readiness Score: [X]/100

Runs-itself score: [X] → [Y]

Human must do (non-blocking):
  → LLC formation deferred until [trigger]; saved ~$[cost] today
  → Open Mercury account — mercury.com (~15 min, phone verification needed)
  → Submit 7 startup credit applications — STARTUP_CREDITS.md

── PROCEEDING TO PHASE 8: AUTOMATION HANDOFF ────────
─────────────────────────────────────────────────────
```

## Acceptance Test (Phase 7)

- [ ] Entity type recommendation made with explicit reasoning
- [ ] US solo/pre-revenue founders default to sole proprietor / individual unless an LLC trigger is present
- [ ] If LLC is deferred, output includes trigger checklist, saved-now cost, and Stripe individual/sole-prop path
- [ ] If LLC is active, formation guide written with exact state SOS URL + fee + timeline
- [ ] Banking recommendation includes specific account link (not generic "find a bank")
- [ ] `docs/founder/TAX_CALENDAR.md` committed with all applicable deadlines
- [ ] `docs/founder/STARTUP_CREDITS.md` committed with ≥ 5 program applications (complete text)
- [ ] Acquisition Readiness Score calculated and shown
- [ ] All docs committed and pushed to remote

## Red Flags

- ❌ Recommending "consult a lawyer" without also providing a specific entity recommendation
- ❌ Blocking Stripe setup, checkout, or first-dollar validation on LLC formation for a US solo founder without a concrete trigger
- ❌ Treating the $300 LLC spend as mandatory before revenue validation
- ❌ Not applying for all 7 credit programs — each takes 5-15 min and can save thousands
- ❌ Generic "open a bank account" without recommending Mercury specifically for indie founders
- ❌ Tax calendar without actual deadlines — "[Q1 estimated taxes]" is not a date
- ❌ Acquisition Readiness Score without showing which specific improvements would raise it
- ❌ Not committing docs to the repo — STARTUP_CREDITS.md sitting in chat is worthless
- ❌ Non-US founder receiving US-only advice — check location from Business Context
