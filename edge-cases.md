---
name: atlas-edge-cases
description: Load when Onboarding detects an unusual scenario — finished project, empty project, previously-run project, non-US founder, failed deployment, monorepo, or portfolio of one. Contains behavioral contracts for every non-standard Atlas invocation.
---

# Atlas Edge Cases — Behavioral Contracts

*These are the rules that separate a skill that works in demos from one that works on your 47th project at 2am.*

---

## EC-1: Finished Project (deployment_status: production, completion ~90%+)

**Detection:** Onboarding Pass 2 finds `deployment_status: production` AND `completion_percentage ≥ 85`.

**What Atlas does NOT do:** Run Code Sprint in its standard form. There are no P0s to triage. Framing it that way is wrong.

**What Atlas does instead — Code Audit Mode:**
1. Verify the live URL is still responding (200).
2. Fill infrastructure gaps only: CI/CD if missing, health check endpoint if missing, RUNBOOK if missing or stale.
3. Confirm deployment is green — re-deploy if infrastructure changes were made.
4. Skip P0/P1/P2 triage framing entirely. Report: "Deployment verified ✓, infrastructure gaps filled."
5. Proceed to Module 3 (Legal) immediately. Modules 3–11 run identically — they don't care whether the product is "finished."

**Checkpoint adjustment:**
```
─────────────────────────────────────────────────────
CODE AUDIT COMPLETE (project already in production)

Atlas did:
  ✓ Live URL verified: [URL] responded 200
  ✓ [Filled N infrastructure gaps: CI/CD / health check / RUNBOOK]
  ✓ Re-deployed with infrastructure changes

Runs-itself score: [X] → [Y]

── PROCEEDING TO LEGAL & COMPLIANCE ─────────────────
```

---

## EC-2: Empty Project — README Only (Blueprint Mode)

**Detection:** Onboarding Pass 1 finds: README exists, zero or near-zero source files, no package.json or equivalent.

**What Atlas does NOT do:** Run a Code Sprint that fixes nothing. There is no code to fix.

**What Atlas does instead — Blueprint Mode:**
1. Read the README thoroughly. Infer product name, category, target customer, and tech stack recommendation from the description.
2. In Confirmation Ritual, narrate back: "I'm treating this as Blueprint Mode — you have a concept, not yet code. I'll scaffold the project."
3. Code Sprint becomes **Project Scaffold**:
   - Create repo structure appropriate to detected/recommended product type
   - Scaffold starter files (based on chosen stack)
   - Create `.env.example` with all anticipated variables
   - Create `package.json` with recommended dependencies
   - Commit `.github/workflows/ci.yml` and `deploy.yml`
   - Create initial `README.md` upgrade with setup instructions
4. Runs-itself score starts at ~10. Atlas still runs every module — it produces *foundation artifacts* instead of *fixing existing ones*.
5. Legal still writes ToS/Privacy based on inferred data practices from the README description.
6. Launch Strategy still writes copy.

**Power use case:** `/atlas` on a README is a full project bootstrap. This is a feature, not a limitation.

---

## EC-3: Empty Project — Structure + Telling Name (No README)

**Detection:** Onboarding Pass 1 finds: directory structure (`src/`, `api/`, `db/`), `package.json`, maybe `schema.sql`, minimal or no README.

**What Atlas does:** Infer boldly from what exists.

- `package.json` dependencies reveal enormous context:
  - Stripe → payments
  - Supabase → auth + DB
  - Resend → email
  - Crisp → support
  - PostHog → analytics
- Directory names reveal architecture
- Product name reveals domain (e.g., "SweepBot" → sweepstakes automation, "ClipMind" → video clip management)

**Rules:**
- Tag every inference `[INFERRED]`
- Narrate understanding in Confirmation Ritual: "Based on the name SweepBot and detected dependencies (Stripe, Supabase, Resend), I believe this is a sweepstakes automation tool. Is that correct?"
- One question, not fifteen
- If founder confirms: full pipeline runs
- Code Sprint focuses on scaffolding missing foundation rather than fixing bugs

---

## EC-4: No `.env.example` and No `.env`

**Detection:** Onboarding Pass 1 finds no environment file of either type.

**What Atlas does:** Fall back to source scanning.

1. Scan all source files for `process.env.*` (Node), `os.environ` (Python), `ENV[]` (Rails), `env()` (Laravel), etc.
2. Compile the complete list of all environment variable names referenced.
3. Generate `.env.example` from that list with comments explaining what each variable is for.
4. Use variable *names* to infer services even without values: `STRIPE_SECRET_KEY` = Stripe integrated, `RESEND_API_KEY` = Resend integrated.
5. Commit `.env.example` as the first action of Code Sprint.

**This is now the standard fallback in Code Sprint Step 4. No need to call it out — just do it.**

---

## EC-5: Atlas Has Already Run on This Project

**Detection:** Onboarding Pass 1 reads `~/.atlas/portfolio/[slug]/context.json` and finds `completed_modules` with entries.

**What Atlas does NOT do:** Start over. Re-run onboarding from scratch. Overwrite completed work.

**What Atlas does instead — Continuation Sprint:**
1. Read `context.json`. Identify which modules have `status: complete` vs `pending` vs `blocked`.
2. Skip completed modules.
3. Announce at the start:
   ```
   Resuming [Product Name] from Module [N].
   Modules 1–[N-1] complete from previous run.
   Starting with [Module Name].
   ```
4. Re-run incomplete modules from where they left off.
5. Re-run blocked modules if the human action that blocked them is now resolvable.

**What Atlas writes to `memory.md` after first-ever run:**
```markdown
## Founder Profile (established [date])
- Location: [stated]
- Preferred entity type: [recommended]
- Launch channels that worked: []
- Launch channels that didn't: []
- Audience patterns: []
- Risk tolerance: [low/medium/high]
- Definition of success: [lifestyle/grow/acquire/vc]
```
This is the seed. It compounds with every subsequent run.

---

## EC-6: Non-US Founder

**Detection:** Onboarding Pass 3 reveals founder location outside the United States.

**Entity recommendations by jurisdiction (with confidence flags):**

| Country | Recommended Entity | Notes |
|---------|-------------------|-------|
| UK | Ltd (Private Limited Company) | Companies House, ~£12 |
| Canada | Inc (Federal or Provincial) | Varies by province |
| Australia | Pty Ltd | ASIC registration |
| Germany | GmbH or UG | Notary required for GmbH |
| Netherlands | BV | |
| Other EU | Varies | Flag for local accountant |
| Other | Flag | Genuinely unknown |

**Rule:** For non-US founders, Business Setup outputs the entity recommendation with a `⚠️ Medium confidence` flag and explicitly states: "I'm confident in the structure but recommend a local accountant or Stripe Atlas to confirm formation steps for your specific jurisdiction."

**US-specific legal sections:** Legal module must flag all US-specific sections (CCPA, COPPA references, specific state laws) as needing jurisdiction review. It still writes the documents — just marks them clearly.

**Startup credits:** Most are available globally. AWS Activate, GitHub for Startups, Cloudflare for Startups — all available to non-US founders. Stripe Atlas explicitly helps non-US founders form a US entity. Always include it.

---

## EC-7: Deployment Failure

**Detection:** Code Sprint Step 8 deploy command returns non-zero exit code or URL check returns non-200.

**What Atlas does:**
1. Capture the complete error output.
2. Diagnose most likely cause from the error:
   - `Error: Missing required env var` → add variable to deployment platform
   - `Build failed: cannot find module` → `npm install` + retry
   - `Authentication required` → need platform credentials (irreducible)
   - `Port already in use` → different port or platform issue
3. Attempt fix automatically.
4. Retry deploy once.
5. If second attempt fails: log as `pending_human_action` with exact error message, most likely fix, and direct URL for platform settings.
6. Continue the pipeline — a failed deployment blocks deployment-dependent steps only, not all of Modules 3–11.

**Checkpoint on persistent failure:**
```
⚠️ DEPLOYMENT: Could not complete automatically

Error: [exact error message]
Most likely cause: [diagnosis]
Fix required: [exact steps] — [URL] (~X min)

Everything else proceeding. Live URL will be confirmed once this is resolved.
```

---

## EC-8: Git Push Failure

**Detection:** `git push` returns non-zero exit code.

**Diagnosis and auto-fix by error type:**

| Error | Diagnosis | Atlas Action |
|-------|-----------|--------------|
| `fatal: 'origin' does not exist` | No remote configured | Ask for repo URL → `git remote add origin [URL]` → retry |
| `Permission denied (publickey)` | SSH auth failure | Explain SSH key setup with GitHub URL; flag as irreducible |
| `rejected ... non-fast-forward` | Branch diverged | `git pull --rebase origin [branch]` → retry push |
| `protected branch` | Branch protection | Create new branch `atlas/sprint-[date]` → push → note "Created PR branch — merge when ready" |

**If Atlas creates a PR branch:** Log it as a non-blocking human action: "Merge `atlas/sprint-[date]` into `main` when ready — [estimated 2 min]."

---

## EC-9: Multiple Deployment Targets

**Detection:** Onboarding Pass 1 finds more than one deployment config:
- `manifest.json` → Chrome/Firefox extension
- `vercel.json` → web app
- `fly.toml` → server
- `package.json` scripts with both `build:extension` and `build:web`

**What Atlas does:** Deploy each target separately in Code Sprint.

1. List all detected deployment targets at the start of Code Sprint.
2. Deploy each one in order.
3. Confirm each is live with URL/store link.
4. Set runs-itself score accounting for all targets: if any target fails to deploy, note which one.

**Checkpoint format:**
```
✓ Web app deployed: [URL] (200 confirmed)
✓ Extension build: dist/ folder ready (manual CWS submission required — irreducible: phone verification)
```

---

## EC-10: No Payment Processor

**Detection:** Onboarding Pass 2 finds no Stripe, Paddle, Lemon Squeezy, or equivalent in dependencies or `.env`.

**What Atlas does:** Mark `monetization_status: pre-revenue` in Business Context.

**Module adjustments:**
- **Automation Handoff:** Skip dunning, failed payment recovery, revenue alerting. Note: "Payment processor not yet integrated — these automations activate once Stripe is added."
- **Operations:** MRR = $0 sprint. Do not show MRR trajectory charts. Show user growth and activation metrics instead.
- **Revenue Intelligence:** Zero-to-first-dollar sprint is the entire focus. Recommend Stripe setup as prerequisite before running the payment automation sections.
- **Business Setup:** Add Stripe account setup to `userMust` list as a high-priority non-blocking step.

**Do not skip these modules** — they still run, they just adjust their focus to pre-revenue realities.

---

## EC-11: Runs-Itself Score — Blocked vs. Achievable

**The score must be honest about what's blocked.**

After every module, the checkpoint shows three numbers, not one:

```
Score now: 58/100
  Achievable without any human action: 58
  Achievable with human actions (est. 2 hrs): 74 ✅
  Remaining gap after human actions: 26 (low priority, no deadline)
```

This is the actionable version. "Score is 58, need 60 (launch floor) → 90 (sovereign)" is not.

**The achievable score calculation:** Add the point value of every blocked automation where the only blocker is a listed `pending_human_action`. If the human does those actions, what score results?

---

## EC-12: Portfolio Mode — Single Project

**Detection:** Portfolio Mode triggered but `~/.atlas/portfolio/` contains only one project.

**What Atlas does:** Redirect to Single-Project Mode.

```
Portfolio mode detected, but only 1 project found.
Redirecting to single-project run on [Project Name].
```

Run the full 11-module pipeline on that one project. Portfolio intelligence requires ≥2 projects to be meaningful.

---

## EC-13: Massive Codebase (50+ Files, Monorepo)

**Detection:** `find . -name "*.ts" -o -name "*.js" -o -name "*.py" | wc -l` returns > 50, OR multiple `package.json` files at different directory levels.

**What Atlas does:** Read in priority order, stop when context is sufficient.

**Reading priority:**
1. README + all docs (always)
2. Root `package.json` → dependencies → infer services
3. Database schema / migrations
4. Entry points + routes
5. `.env.example`
6. `git log --oneline -20` → velocity + recent decisions
7. Tests (last — lowest information density)

**Stop reading** when confidence in Business Context reaches ~85% and all `[UNKNOWN]` fields are resolved.

**For monorepos:** Identify the primary product service first. Treat other services as supporting infrastructure. Code Sprint focuses on the primary service unless a supporting service has a P0 blocker.

---

## EC-14: The End-Run Protocol (Blocker Mid-Pipeline)

**The core rule: Atlas never stops because of a blocker. It routes around it.**

When Atlas hits something it cannot do (phone verification, missing API key, financial transaction):

1. **Do not stop.** Log the blocker as a `pending_human_action` item.
2. **Determine scope:** Does this block the *entire current module*, or just *this step*? Most blockers only block one step.
3. **Continue** with everything in the module that doesn't depend on the blocked step.
4. **Continue to subsequent modules** — most modules don't depend on prior human actions.
5. **At the natural stopping point** (score ≥ 60 minimum, targeting 90 or end of pipeline), surface all pending human actions in a single consolidated list.

**Consolidated pending actions format:**
```
── ALL MODULES COMPLETE ──────────────────────────────

Runs-itself score: 74/100 ✅

PENDING HUMAN ACTIONS (priority order):
  [required, ~10 min] File LLC — sos.[state].gov — $[cost]
                      Business name: "[name]", Business type: LLC
  [required, ~15 min] Open Mercury bank account — mercury.com
                      Bring: EIN, LLC formation doc, SSN
  [optional, ~5 min]  Add SENTRY_DSN to Vercel env vars
                      vercel.com/[project]/settings/env
  [optional, ~5 min]  Create Buffer account — buffer.com/signup
                      (phone verification required)
                      Your 30 posts are in CONTENT_CALENDAR_30.md, ready to paste
  [optional, ~30 min] Submit 7 startup credit applications
                      See STARTUP_CREDITS.md — all text pre-filled

Total required time: ~25 min
Total optional time: ~40 min
──────────────────────────────────────────────────────
```

**What "required" means here:** The product cannot make money without this. Not "Atlas needs it to continue."

---

## EC-15: `pause` Command

**When founder types `pause` mid-pipeline:**

1. Write complete current state to `~/.atlas/portfolio/[slug]/context.json`:
   - Which module was active
   - Which steps within that module were complete
   - All `pending_human_action` items accumulated so far
   - Current runs-itself score
2. Output:
   ```
   ── PAUSED ──────────────────────────────────────────
   State saved. Paused during [Module Name], step [N].
   Runs-itself score at pause: [X]/100

   Pending human actions accumulated so far:
   [list]

   To resume: type 'continue' or run /atlas again.
   Atlas will resume from exactly this point.
   ── ─────────────────────────────────────────────────
   ```
3. Stop. Do not proceed.

**On next `/atlas` invocation:** Onboarding detects the saved state (EC-5) and resumes from the paused module.

---

## EC-16: Product Type Misclassification Risk

**High-stakes single verification question in Confirmation Ritual:**

If product type affects deployment, legal, or distribution significantly, add one explicit verification:

```
I've classified this as: [SaaS / Browser Extension / Mobile App / CLI Tool / API / Marketplace]

This affects deployment, legal documents, and launch strategy significantly.
Please confirm: [SaaS] [Browser Extension] [Mobile App] [CLI Tool] [API] [Marketplace]
(One word is fine)
```

**Why it matters:**
- Extension → Manifest V3, Chrome Web Store approval, no Vercel deploy
- Mobile → App Store review, different legal requirements
- API → No landing page needed, different marketing entirely
- Marketplace → Two-sided legal, escrow considerations

**If the founder doesn't correct Atlas:** The classification stands. The confirmation ritual is the safeguard. Atlas proceeds.
