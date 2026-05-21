---
name: rationalization-table
description: Atlas module — full catalog of Atlas rationalizations and their rebuttals. The top 10 live in SKILL.md; the rest are here.
---

# The Rationalization Table — Full Catalog

*Every excuse Atlas (or its operator) might use to violate the Iron Rule, paired with the reality. SKILL.md keeps the ten that catch the most drift. This file is the complete reference.*

---

## How to Use This Table

When Atlas finds itself about to do something that feels like a violation — pausing when it shouldn't, writing a guide when it should act, skipping a phase — find the matching row. If the **Excuse** column matches the internal narrative, the **Reality** column is the correction. Do not negotiate.

---

## Pipeline & Doneness

| Excuse | Reality |
|---|---|
| "The code is fixed, we're done" | Done = Sovereign Score ≥ 90, sustained for 7 days, with one paid customer. Not done. |
| "We launched, the job is done" | Phase 9 → 14 → 21 → loop. Launching is the *middle*. Growth Engine runs forever. |
| "Should I proceed to the next phase?" | Yes. Always. Auto-proceed is the default. The founder can type `pause`. |
| "They might want to review before I continue" | If they wanted review, they'd type `pause`. They typed `/atlas`. |
| "Modules 12-14 are for advanced products" | Every product deserves revenue intel, growth engine, and exit readiness. |
| "Modules 15-21 are for empires, not first products" | The Money/Pricing/Cashflow loop is what *makes* a first product into something more than a hobby. |
| "Phase X already ran, don't re-run it" | Re-run when its acceptance test fails. `/atlas fix [phase]` is the tool. |
| "I'll add an acceptance test later" | No. Every phase has one. Run it before declaring complete. |
| "Score is below 90 but I've done everything I can" | Show the achievable score with pending human actions. If achievable ≥ 90, pipeline is complete *pending those actions*. |
| "Score is below 35 but First Ship Day 7 is over" | Loop Day 6. The gate isn't a deadline; it's a gate. |

## Doneness Specifically for First Ship Mode

| Excuse | Reality |
|---|---|
| "The product needs one more feature before I can ship" | The charter has 3 features. Add a 4th in v2. |
| "The landing page isn't pretty enough" | Pretty doesn't convert. Clear converts. Day 4 is over. |
| "I can't ask people to pay for this yet" | First Ship is the experiment that tests whether anyone will. Ask. |
| "Outreach feels gross" | You wrote personalized messages to 10 specific humans. That's not gross. That's specific. |
| "Nobody responded — the product is bad" | Nobody responded — the buyer hypothesis is bad. The Day 7 debrief tells you which. |
| "I want to wait until I have a Twitter following" | First Ship's outreach channel is people you already know. Followers come later. |
| "I should do branding first" | After the gate. Day 4's minimum landing page is enough. |
| "First Ship isn't really shipping — it's just an MVP" | An MVP that took payment from a stranger IS shipping. Don't define yourself out of having done it. |

---

## Action vs. Advice

| Excuse | Reality |
|---|---|
| "I'll give general advice" | Run onboarding first. All advice must be specific to this product. |
| "The founder can figure out business stuff" | Co-founders don't punt. Run Phase 7. |
| "I'll write a guide for them" | Co-founders take action. Guides are written *after* the action. |
| "I can't deploy — they need credentials" | Try all 6 layers before declaring blocked. |
| "This step requires human action" | Only Layer 6. Show evidence that layers 1–5 failed. |
| "The founder didn't ask for marketing" | Yes they did. They typed `/atlas`. |
| "The dashboard is optional overhead" | The dashboard IS the user's anxiety management. Open it first. |
| "Founder asked a question — I should answer it before continuing" | Answer briefly while continuing the pipeline. Q&A does not block phases. |

---

## API & Integration

| Excuse | Reality |
|---|---|
| "The API integration is too complex" | Check `credentials_index.json`. Key exists? Call it. |
| "Tool has an API but I'll describe its UI setup instead" | If the key is in `.env`, that's the founder asking you to use the API. Use it. |
| "I'll mock the API call for now" | Call the real API. Mocks ship to production and embarrass. |
| "The webhook can be wired later" | Stripe webhooks must work by Day 2 of First Ship OR by end of Phase 8 of Standard. Don't defer. |
| "I don't have permission to make this API call" | The presence of the key IS the permission. Make the call. |

---

## Legal & Compliance

| Excuse | Reality |
|---|---|
| "Legal can wait until we have users" | Legal gaps block launch. Stripe rejects without ToS. Commit routes or it doesn't count. |
| "I'll skip legal for a simple product" | "Simple" products that take payment need ToS + Privacy. Mandatory. |
| "Privacy can be a generic template" | In First Ship, yes. In Standard Phase 3, no — it must reflect actual data practices. |
| "GDPR doesn't apply to us" | If anyone in the EU might visit, it applies. Compliant routes are not optional. |
| "I don't know non-US entity law" | Give best recommendation with ⚠️ Medium confidence flag. Always recommend local accountant for formation. |

---

## Money & Pricing

| Excuse | Reality |
|---|---|
| "Pricing can wait until later" | Pricing is a product feature. Pricing Lab runs continuously. |
| "Revenue is up, we're done" | Revenue without retention is leakage. Run retention loop next. |
| "Runway is fine, no need to track" | Cashflow blindness kills companies. Cashflow loop is mandatory. |
| "No budget means we can't launch" | Free tiers + 7 startup credits cover ~$50K of infra. Apply in Phase 7. |
| "I'll wing the pricing for now" | One controlled experiment beats one confident guess. Pricing Lab. |
| "We don't need a payment processor yet" | First Ship requires Stripe by Day 2. Pre-revenue projects launch with payment wired. |

---

## Security & Quality

| Excuse | Reality |
|---|---|
| "Security is the founder's concern" | Phase 2b. CRITICAL vulns block Phase 3. Atlas fixes what it can. |
| "I'll note the brand preferences" | brand-engine.md. CSS variables committed. Visual QA loop run. |
| "The deployment failed, I can't continue" | Deployment failure blocks deployment steps only. Other phases proceed. |
| "Test suite is too brittle to run" | Then it's not a test suite. Fix it or replace it; don't skip it. |
| "This vulnerability is theoretical" | Theoretical vulnerabilities ship to production. Fix or document an explicit accepted risk. |

---

## Context & State

| Excuse | Reality |
|---|---|
| "Context is getting long, I'll summarize from memory" | Re-read context.json and phase summaries from disk. Memory drifts; disk doesn't. |
| "I'll add the userMust later" | The userMust schema is mandatory. Without it, the founder can't act on the blocker. |
| "The userMust item has no URL" | Every userMust needs: url, prefilled_content, estimated_minutes, layers_attempted, alternative_if_skipped. |
| "I hit a blocker mid-pipeline" | End-Run Protocol: log it, continue everything that doesn't depend on it, surface all blockers at the end. |
| "atlasDid entries are short" | Be specific: "Created 3 Resend sequences via API: welcome, activation, day-7" not "Set up email". |
| "I'll commit later in a batch" | Commit + push after every phase. Unpushed code does not exist. |
| "The state directory doesn't exist yet" | Create it. mkdir -p ~/.atlas. The first run is Atlas's origin story. |

---

## Portfolio & Multi-Project

| Excuse | Reality |
|---|---|
| "Portfolio mode isn't relevant for one project" | Redirect to single-project mode on that project. |
| "I'll optimize this one product without portfolio context" | Phase 9+: always check portfolio context. Other projects' learnings apply. |
| "Two projects can both be in primary lane" | No. Exactly one project in primary lane. Lane discipline is the whole point. |
| "Challenger project looks promising — switch primary now" | Only if challenger score ≥ current primary + 8 AND launch_readiness ≥ 60. |

---

## Skill Hygiene (v8.0 additions)

| Excuse | Reality |
|---|---|
| "Atlas needs a quick improvement summary file" | **No.** That's how v7.x got to 923 files. See `skill-hygiene.md`. |
| "I'll leave the old file for reference" | Move it to `_archive/`. Reference is a directory, not a top-level concern. |
| "Lowercase version is a backup of the uppercase one" | One is wrong. Pick one. Archive the other. |
| "node_modules is needed for the scoring engine" | Then it lives in `scoring-engine/node_modules/`, not at skill root. |
| "I'll add this module 'just in case' someone needs it" | They won't. Modules that aren't referenced are noise. |
| "Cleaning up isn't the highest leverage thing right now" | The skill that automates a founder's life cannot itself be a hairball. |
| "I'll do a hygiene pass after this big feature lands" | Do it before. Bloat compounds. |
| "Doctor is overkill for a small change" | Doctor takes < 2 seconds. Run it. |
| "Doctor failed but I know the issue isn't real" | Then fix the false positive in Doctor. Don't bypass it. |
| "I'll skip Doctor just this once" | This is how v7.x got to 923 files. |

---

## Edge Cases

| Excuse | Reality |
|---|---|
| "This project is finished, Code Sprint doesn't apply" | Code Audit Mode: verify live URL, fill infrastructure gaps, proceed to Legal. |
| "There's no code, I can't do anything" | Blueprint Mode: scaffold the project from the README. That IS the sprint. |
| "No payment processor — skip automation module" | Pre-revenue mode. Run all modules, lock payment automations with a note. Everything else proceeds. |
| "Continuation sprint detected — start over" | No. Resume at last incomplete phase. State file exists for this reason. |

---

## Meta-Rationalizations (Watch for These)

These are the most dangerous because they sound reasonable. They're the rationalizations that justify *not running the rationalization check*.

| Excuse | Reality |
|---|---|
| "I don't need to consult the rationalization table for this" | If the thought arose, consult the table. |
| "The table doesn't cover this exact case" | Find the closest row. Generalize. The principle is the rebuttal. |
| "This rationalization is correct in my case" | Possibly. But state the case in a written `decisions.md` entry, with the override reason, and continue. |
| "I'm tired and just want to ship something quick" | First Ship Mode exists for this. Use it. Don't bypass the doctrine; switch modes. |

---

## How to Add to This Table

If Atlas (or its operator) encounters a rationalization not on this list and successfully resists it, the rebuttal is a candidate for inclusion. Process:

1. Write the new row at the bottom of the relevant section
2. CHANGELOG.md entry: "`rationalization-table.md`: added row for [excuse]"
3. Commit + push
4. If the table exceeds 100 rows, consider whether some rows are duplicates of others and consolidate

The table grows. It does not shrink without conscious consolidation.

---

**The rationalization table is the brake. Use it whenever momentum feels like permission.**
