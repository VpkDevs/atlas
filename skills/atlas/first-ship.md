---
name: first-ship
description: Atlas module — compressed 7-day pipeline for founders with no prior shipped product.
---

# First Ship — The On-Ramp

*The 21-phase Sovereign pipeline assumes you already know how to launch. First Ship is for the case where you don't yet. The point is not to make a great product. The point is to find out you can finish one.*

---

## When This Module Loads

`first-ship.md` is loaded when Atlas detects either:

- `~/.atlas/founder-profile.json` shows `shipped_products: 0` AND no prior `context.json` for this project has reached Phase 9, OR
- The founder typed `/atlas ship`

If neither condition is met, Atlas runs the Standard pipeline. If both Standard and First Ship could apply, Atlas asks once — and only once — which to run.

---

## The First Ship Charter

**One commitment, in priority order:**

1. **Live URL** by end of Day 3, accepting payment by end of Day 5.
2. **First paying customer** by end of Day 7.
3. Everything else — branding polish, content calendar, exit readiness, the empire — waits.

**One number, hard-coded:**

- First Ship Gate = Sovereign Score ≥ **35** AND at least one successful Stripe charge from a non-founder email.

Below 35, you are still in First Ship. At 35 with a paying customer, Atlas auto-promotes to Standard Mode and resumes at Phase 10 (War Room). Above 35 with no customer, Atlas re-enters the Day 6–7 outreach loop until a charge lands.

**One forbidden behavior:**

- During First Ship, Atlas does not run brand polish, exit readiness, channel allocation, capital governor, or any phase numbered 13+. These are bookmarked for after the gate. A `/atlas growth` invocation during First Ship returns: *"You have not shipped yet. Use /atlas to continue First Ship."*

---

## The Anti-Perfectionism Doctrine

This module exists for one specific founder failure mode: someone who has built many things and shipped none of them. The standard pipeline cannot help with this case because the bottleneck is not capability. The bottleneck is permission.

First Ship grants permission:

- **Ugly is fine.** Brand engine does not run. Visual QA is skipped. The product can look like a hostel bunk bed.
- **Narrow is fine.** One pricing tier. One landing page. One acquisition channel. Pick one for each, ship.
- **Slow is fine.** No optimization. Database query takes 800ms? Acceptable.
- **Manual is fine.** If the email automation fails to wire on Day 2, send the first ten emails by hand. This is not Sovereign — this is First Ship.
- **Embarrassing is fine.** You will look at the v1 in a year and cringe. Cringe is the precondition of having shipped.

What is not fine:

- **Adding a feature** that was not in the Day 0 product definition. Adding scope during First Ship is a violation. Log the idea to `backlog.md` and move on.
- **Skipping payment integration.** Stripe checkout exists by Day 5 or First Ship has failed. A product no one can buy is not shipped.
- **Skipping legal.** ToS and Privacy must be live by Day 5 for compliance and buyer trust. They can be generic templates; Phase 3 will harden them later.

---

## The 7-Day Pipeline

Atlas runs these phases automatically. The founder does not approve between them. Auto-Proceed Protocol applies. End-Run Protocol applies.

### Day 0 — Scope Lock (≤ 2 hours)

```text
PROCEDURE first_ship_scope_lock:
  1. Read ~/.atlas/portfolio/[slug]/context.json (or initialize)
  2. From onboarding.md, run the 3-pass Business Context inference
  3. Write ONE-PAGE charter to docs/founder/SHIP_CHARTER.md:
     - Target buyer (one sentence)
     - Single core promise (one sentence)
     - Single price point (one number, USD)
     - Single acquisition channel (one channel)
     - Three features and ONLY three features — anything else is post-ship
     - Hard stop list: features that will NOT exist in v1
  4. Founder gets ONE chance to edit. After confirmation, scope is locked.
     Atlas refuses to add features mid-First-Ship even if asked.
  5. Commit + push SHIP_CHARTER.md
```

**Acceptance gate:** `SHIP_CHARTER.md` exists, committed, pushed. Feature count ≤ 3.

### Day 1 — Strip and Stabilize (Compressed Code Sprint)

Load `code-sprint.md` but apply First Ship constraint: **delete features not in `SHIP_CHARTER.md` rather than fix them**. This is the most important and most counterintuitive step. Atlas will be tempted to fix broken code. Don't. Cut it.

```text
PROCEDURE first_ship_strip:
  1. List every route, page, feature, model in the codebase
  2. Mark each as IN_CHARTER or OUT_OF_CHARTER
  3. For each OUT_OF_CHARTER item: delete the route handler, remove from nav,
     drop the model table if unreferenced, comment out instead of deleting if
     dependency graph is unclear
  4. Run remaining test suite (or smoke check if no tests)
  5. Deploy to the simplest target available (Vercel/Railway/Render)
  6. curl <prod_url>/ — must return 200
  7. Commit + push
```

**Acceptance gate:** Live URL returns 200. Charter features work end-to-end on the live URL. Out-of-charter features are inaccessible.

### Day 2 — Payment Wired (Mandatory)

This is the day First Ship lives or dies. Stripe Checkout must work.

```text
PROCEDURE first_ship_payment:
  1. If STRIPE_SECRET_KEY in .env:
       a. Call Stripe API to create product + price matching SHIP_CHARTER.md
       b. Wire Checkout session endpoint
       c. Wire webhook handler for checkout.session.completed
  2. If STRIPE_SECRET_KEY missing:
       a. userMust: "Sign up for Stripe — https://dashboard.stripe.com/register
          — paste secret key in .env as STRIPE_SECRET_KEY — ~10 min"
       b. While waiting: continue with all non-payment work
  3. Run an actual test purchase from the live URL using Stripe test card 4242 4242 4242 4242
  4. Verify webhook fires, customer record created
  5. Commit + push
```

**Acceptance gate:** Test purchase succeeds end-to-end. Customer record exists in Stripe dashboard.

### Day 3 — Legal Minimum + Live Verification

```text
PROCEDURE first_ship_legal_min:
  1. Load legal-compliance.md but generate MINIMUM viable docs only
  2. ToS, Privacy, Cookie notice — generic templates customized with
     business name, jurisdiction, contact email
  3. Live at /terms, /privacy, /cookies — all return 200
  4. Footer links from every page
  5. Stripe Checkout test passes with these documents in place
  6. Commit + push
```

**Acceptance gate:** `curl <prod>/terms` returns 200. Stripe Checkout flow does not reject for missing ToS.

### Day 4 — Landing Page That Converts

```text
PROCEDURE first_ship_landing:
  1. Generate landing page from SHIP_CHARTER.md:
     - Headline = core promise
     - One subhead = target buyer + outcome
     - Three feature blocks = the three charter features
     - One CTA button = "Buy now — $[price]"
     - One social proof element (or skip if none exists yet)
  2. NO carousels, NO chatbots, NO multi-tier pricing, NO feature comparisons
  3. PostHog or analytics snippet wired (if key present); otherwise skip
  4. Mobile-responsive minimum: no horizontal scroll, CTA above the fold on iPhone SE
  5. Deploy, curl, screenshot, commit + push
```

**Acceptance gate:** Landing page loads in < 2 seconds. CTA is visible on a 375×667 viewport without scrolling. Buy button leads to working Stripe Checkout.

### Day 5 — Outreach List (Not Yet Sent)

```text
PROCEDURE first_ship_outreach_prep:
  1. Founder identifies 10–25 specific humans who could plausibly want this product
     (NOT "tech twitter" — specific names and contexts)
  2. For each: generate one personalized outreach message (~3 sentences)
     - Greeting using their name
     - One sentence referencing why THEY specifically
     - One sentence offering the product + price + link
  3. Write all messages to docs/founder/FIRST_DOLLAR_SPRINT.md
  4. Founder reviews; Atlas does NOT send
  5. Commit + push
```

**Acceptance gate:** `FIRST_DOLLAR_SPRINT.md` exists with 10+ named, personalized messages. Each message is < 100 words. None are templated.

**This is the irreducible founder step of First Ship.** Atlas can write the messages, identify likely buyers from contact context, even draft variations. It cannot send them. Outreach from an unrecognized name burns the relationship. The founder presses send.

### Day 6 — Send + Iterate

```text
PROCEDURE first_ship_send:
  1. Founder sends 5 messages
  2. While waiting for response: Atlas works on:
     - Day-7 backup channels (Reddit post, IndieHackers post, ProductHunt prep)
     - Activation email sequence (Resend API if key present)
     - Stripe receipt customization
  3. After 24h with zero responses: Atlas drafts follow-ups; founder sends remaining 5+ + follow-ups
  4. After 48h with zero responses: enter Day 7 fallback
```

**Acceptance gate:** 10+ outreach messages sent. At least 3 responses received (any content — including "not interested"). If < 3 responses after 48h, the target buyer hypothesis is wrong and Atlas drafts a one-pass revision to `SHIP_CHARTER.md` for founder review.

### Day 7 — First Dollar Gate

```text
PROCEDURE first_ship_gate_check:
  1. Query Stripe API: count successful charges with customer email ≠ founder email
  2. IF count ≥ 1:
       a. SHIP_CHARTER.md → docs/founder/SHIPPED_LOG.md
          (entry: timestamp, customer, amount, channel)
       b. Update ~/.atlas/founder-profile.json:
          shipped_products: [previous + 1]
       c. Update Sovereign Score; expect 35–45 range
       d. Set context.json.first_ship_gate_passed = true
       e. Auto-promote to Standard Mode
       f. Resume at Phase 10 (War Room — operates on the live customer)
  3. IF count == 0 AND outreach responses ≥ 3:
       a. Loop Day 6 — refine messages, add channels
       b. Repeat until charge lands or 14-day extension expires
  4. IF count == 0 AND outreach responses < 3:
       a. Halt First Ship
       b. Write docs/founder/FIRST_SHIP_DEBRIEF.md:
          - What was tried
          - Where the buyer hypothesis broke
          - Three reframings to consider before next attempt
       c. Return to Day 0 with charter revision OR retire project
```

**This is the only gate that matters.** A First Ship that produces a paying customer is a success even if every other metric is mediocre. A First Ship that produces a beautiful site, a polished funnel, and zero customers is a failure.

---

## What First Ship Doesn't Do

The following Standard pipeline phases are **explicitly deferred** during First Ship. After the gate passes, they re-engage automatically:

- Phase 2b (full Security audit — minimum secrets check only during First Ship)
- Phase 6 (full Brand Engine — landing page minimum only)
- Phase 7 (Business Setup / LLC — generic sole-prop or pass-through until revenue exists)
- Phase 13 (Growth Engine — manual outreach only)
- Phase 14 (Exit Readiness — premature)
- Phases 15–21 (Money Engine, Pricing Lab, Cashflow Ops, Offer Forge, Channel Dominance, Acquisition Sniper, Capital Governor — all premature)

Atlas may **mention** these phases in checkpoints ("Phase 14 will run after First Ship gate") but does not run them.

---

## First Ship Checkpoint Format

```text
─────────────────────────────────────────────────────
DAY [N] — [PHASE NAME] COMPLETE

Atlas did:
  ✓ [specific accomplishment]
  ✓ [specific accomplishment]

First Ship progress: Day [N] of 7
Sovereign Score: [X] (gate: 35)
Paying customers: [N] (gate: 1)

Charter features status:
  ✓ [feature 1] — live
  ✓ [feature 2] — live
  ⚠ [feature 3] — partial

Human must do (non-blocking):
  → [action] (~X min)

Human must do BEFORE NEXT DAY (blocking):
  → [action] (~X min)  [required: true]

── PROCEEDING TO DAY [N+1] ──────────────────────────
─────────────────────────────────────────────────────
```

---

## First Ship Rationalization Table

| Excuse | Reality |
|---|---|
| "The product needs one more feature before I can ship" | The charter has 3 features. Add a 4th in v2. |
| "The landing page isn't pretty enough" | Pretty doesn't convert. Clear converts. Day 4 is over. |
| "I can't ask people to pay for this yet" | First Ship is the experiment that tests whether anyone will. Ask. |
| "I'll do First Ship after I fix [thing]" | First Ship IS the fixing. The fixing happens by shipping and learning. |
| "Outreach feels gross" | You wrote 100-word personalized messages to 10 specific humans. That's not gross. That's specific. |
| "Nobody responded — the product is bad" | Nobody responded — the buyer hypothesis is bad. The Day 7 debrief tells you which. |
| "I want to wait until I have a Twitter following" | First Ship's outreach channel is people you already know. Followers come later. |
| "I should do branding first" | After the gate. Day 4's minimum landing page is enough. |
| "First Ship isn't really shipping — it's just an MVP" | An MVP that took payment from a stranger is shipping. Don't define yourself out of having done it. |

---

## First Ship Red Flags

- ❌ You added a feature to `SHIP_CHARTER.md` after Day 0 lock
- ❌ You skipped Day 2 (payment wiring) to polish Day 4 (landing page)
- ❌ Atlas sent the outreach messages instead of the founder
- ❌ Day 7 passed and the gate-check was deferred
- ❌ Atlas ran a Phase 13+ during First Ship
- ❌ You declared First Ship "done" without a Stripe charge from a non-founder email
- ❌ You ran First Ship more than 3 times on the same project without revising `SHIP_CHARTER.md`

---

## After the Gate

When First Ship passes:

1. `context.json.first_ship_gate_passed = true`
2. `founder-profile.json.shipped_products += 1`
3. `~/.atlas/patterns/[founder]/first-ship-wins.md` gets a new entry: which channel converted, what charter shape worked, how long Day 6 took
4. Sovereign Score is recomputed (expect ~35–50)
5. Atlas auto-loads Phase 10 (`war-room.md`) and continues the Standard pipeline
6. The "never shipped" identity is over. Future projects skip First Ship and go straight to Standard — *unless* the founder explicitly types `/atlas ship` to re-enter

The first First Ship is the hardest one. After it, the pattern is unlocked.

---

**First Ship is the on-ramp, not the destination. Standard Mode is where compounding happens. But you cannot compound from zero.**
