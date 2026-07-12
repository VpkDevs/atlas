---
name: skill-hygiene
description: Atlas module — doctrine that prevents the skill from accumulating the meta-bloat that produced v7.x's 923 files.
---

# Skill Hygiene — The Anti-Bloat Doctrine

*This module exists because the v7.2 Atlas skill, at the moment of v8.0 audit, contained 923 markdown files, 14 duplicate uppercase/lowercase filename pairs, three nested copies of SKILL.md (one recursively inside itself), a committed `node_modules/` at the skill root, and a SKILL.md body declaring v7.2 while the directory contained references to v8.3. None of those problems came from a single bad decision. They came from a thousand tiny "let me add a quick summary file" decisions. This is the doctrine that catches the thousand decisions.*

---

## The Hygiene Rule

**The Atlas skill directory contains ONLY:**

1. `SKILL.md` — the kernel
2. Module files referenced by the kernel
3. `CHARTER_v[N].md` — the single version-of-record document
4. `README.md` — outward-facing intro for humans
5. `LICENSE`
6. `automation-library/` — reusable workflow JSON
7. `scoring-engine/` (or equivalent) — compiled scoring code
8. `dashboard-template.html` — UI template

**The skill directory does NOT contain:**

- `node_modules/` at the skill root
- A nested `atlas/` directory
- Any file whose name starts with `IMPROVEMENT`, `FIX`, `SUMMARY`, `FINAL`, `MASTER`, `CONTINUATION`, `TREMENDOUS`, `WEAKEST`, `ALL_FIXES`, `IDEAL_VS_ACTUAL`, `INCONSISTENCIES`, `MODULE_AUDIT`, `STRATEGIC_ARCHITECTURE`, `WHATSNEW`
- Multiple version-tagged copies of the same document (`foo-v7.md`, `foo-v8.md`)
- Both uppercase and lowercase variants of the same file
- Compiled artifacts (`dist/`, `build/`) outside their sub-project
- Runtime or tool state directories (`.atlas-state/`, `.kiro/`, `_archive/`)
- `.bak` files older than 7 days

---

## Why These Rules Exist

Each rule above corresponds to a specific failure observed in the v7.2 audit. Each is non-arbitrary.

| Rule | Failure It Prevents |
|---|---|
| One SKILL.md per skill | Triple-nested SKILL.md at `/SKILL.md`, `/atlas/SKILL.md`, `/atlas/atlas/SKILL.md` |
| No `IMPROVEMENT*` / `FIX*` / `SUMMARY*` files | 15+ such files accumulated in v7.x, none of which Claude reads when running Atlas |
| No uppercase+lowercase pairs | 14 such pairs in v7.x, the result of incomplete rename passes |
| No `node_modules/` at root | v7.x had 164 subdirectories of node_modules in the skill, bloating loading and confusing scanning |
| No `v[N]` suffixed copies | v7.x had `fusion-router.md` AND `fusion-router-v2.md` AND `MODULE_AUDIT_v8.3.md` AND `STRATEGIC_ARCHITECTURE_v8.3.md` — Claude cannot tell which is canonical |
| No nested `atlas/` directory | The recursion bug |
| `.bak` files time-bounded | Atomic writes leave temporary `.bak` files; they should not become permanent |

---

## The "Quick Summary File" Antipattern

The single most common driver of skill bloat is the moment when, after a session of refactoring, the urge arises to summarize what was done. The urge feels productive. It is not.

| When you feel like writing... | Write instead... |
|---|---|
| `IMPROVEMENTS_INDEX.md` | One new line in `CHANGELOG.md` |
| `FIXES_COMPLETE.md` | Nothing; the git log already records this |
| `MASTER_SUMMARY.md` | Either it belongs in SKILL.md or it doesn't belong in the skill |
| `INCONSISTENCIES_FIXED.md` | A test case in `atlas-doctor-tests/` that catches the inconsistency |
| `STRATEGIC_ARCHITECTURE_v8.3.md` | An edit to SKILL.md and a `CHARTER_v8.md` line item |
| `WEAKEST_ASPECTS_FIXED.md` | The fix itself; no second document needed |
| `IDEAL_VS_ACTUAL.md` | Nothing; this is a working document, not a deliverable |
| `TREMENDOUS_IMPROVEMENTS_V8.1.md` | One `CHANGELOG.md` entry under "v8.1" |

**Rule of thumb:** If the document's title is a self-assessment, it does not belong in the skill. The skill is for Claude. Claude does not need to be told the work is "tremendous."

---

## The CHANGELOG Discipline

Atlas v8.0 has exactly one changelog file: `CHANGELOG.md`. Format:

```markdown
# Atlas Changelog

## v8.0 — 2026-05-21
- New: First Ship mode (`first-ship.md`)
- New: `/atlas doctor` integrity check (`atlas-doctor.md`)
- New: Skill Hygiene doctrine (`skill-hygiene.md`)
- New: `CHARTER_v8.md` as single source of version truth
- Triage: 923 markdown files → ~50 canonical modules
- Removed from skill root: 14 duplicate-pair files, 15 summary/audit/fix files, nested atlas/atlas/ directory, node_modules/
- Kernel: SKILL.md 944 lines → 380 lines

## v7.2 — 2025-05-15
- New: Scoring engine, fusion router v7.2, operator playbook, incident protocol
- Verbose v7.x/v8.x planning documents are recoverable from git history if an audit needs them.

## v7.1
...
```

If you want to add a CHANGELOG entry, edit `CHANGELOG.md`. Do not create a new document.

---

## Module File Conventions

Every module file (`*.md` in skill root, not SKILL.md or README.md):

```yaml
---
name: [module-id, must match filename without .md]
description: Atlas module — [one sentence purpose].
---

# [Module Title] — [Tagline]

*[Optional epigraph]*

---

## [Section]

[Content]

---

## [Section]

[Content]
```

**Constraints:**
- Frontmatter `name` MUST equal filename without `.md` extension
- First H1 MUST be the module's name (not "Atlas v8.0 — ..."; just "Module Name — ...")
- File length ideal: 200–400 lines. Over 600 is a warning. Over 1000 is a violation.
- No nested H1s — only one `#` per file
- Code blocks in fenced markdown (` ``` `) only — never indent-coded

---

## Retirement Discipline

When a file is retired (no longer referenced from SKILL.md or another active module):

1. **Do not keep it in the active package.** Atlas's current tree must stay reviewable and installable.
2. **Preserve the reason in `CHANGELOG.md`** when the retirement is user-facing or architectural.
3. **Rely on git history for recovery.** If a retired file matters later, restore it from a specific commit and make it canonical again.
4. **Update SKILL.md or relevant module** to remove any reference to the retired file.
5. **Run `/atlas doctor`** to verify no dangling references.

Do not commit `_archive/` directories to the skill repo. They keep the old confusion physically close to the current runtime and make automated review tools skip the PR.

---

## The Recursion Bug — Specific Prevention

In v7.x, the skill directory at one point contained:
- `/SKILL.md`
- `/atlas/SKILL.md`
- `/atlas/atlas/SKILL.md`
- `/atlas/atlas/atlas/...` (it's unclear how deep this went)

This happened because some tool (probably during a backup, restore, or import) wrote the skill inside itself. The recursion went unnoticed because no check existed for it.

**v8.0 Doctor Check 4 specifically catches this.** Additionally:

- The `.gitignore` for the skill should include `**/atlas/SKILL.md` *inside the atlas skill itself* — meaning if a nested copy ever appears, git will not track it, surfacing the bug.
- Any backup tooling that touches the skill directory should write to `~/atlas-backup/` (outside the skill root), not into a subdirectory.
- The `atlas-triage.ps1` script's first action is to check for this and report it.

---

## When New Modules Are Permitted

A new module file may be added to the skill when **all** of:

1. It is referenced from SKILL.md or another active module
2. It has a single, clear purpose expressible in one sentence
3. It does not duplicate content in an existing module
4. The total module count after adding stays under 60
5. `/atlas doctor` PASSES after the addition

A new module may **not** be added when:

- Its purpose is to summarize, audit, or describe other modules (that's CHANGELOG.md or the README)
- It is "for completeness" or "to be safe" or "in case someone needs it"
- It exists only to record a session's work output

---

## When Existing Modules Get Edited Instead of Added

In v7.x, the response to "we should add anti-pattern detection" was to create a new file (`adversarial-and-epistemic.md`). In v8.0, the response is to add a section to an existing module:

| Urge | Better Move |
|---|---|
| New file: `error-handling-patterns.md` | Section in `code-sprint.md` |
| New file: `prompt-injection-defense.md` | Section in `security.md` |
| New file: `pricing-mistakes.md` | Section in `pricing-lab.md` |
| New file: `growth-anti-patterns.md` | Section in `growth-engine.md` |
| New file: `founder-burnout-signals.md` | Section in `operator-playbook.md` |

If a section in an existing module exceeds 200 lines and the module exceeds 600 lines, *then* a split may be justified. Until then, sections inside existing modules are the default.

---

## The 60-Module Soft Ceiling

Atlas v8.0 ships with ~30 module files. The soft ceiling is 60. At 60, the kernel pattern starts to break down — Claude cannot route between 60+ modules effectively, and human maintainers cannot hold the structure in mind.

If you find yourself approaching 60 modules:

1. Look for modules that have not been referenced from SKILL.md in 90 days → candidates for archive
2. Look for module clusters (3+ modules covering one domain) → candidates for consolidation
3. Look at SKILL.md routing table: any row that triggers loading of 4+ modules suggests the modules should be merged
4. Run `/atlas doctor` — it includes a module count check above 50

The ceiling is soft because some skills genuinely need more modules. The ceiling is *enforced socially*: every module above 50 requires a CHANGELOG entry justifying its addition.

---

## Skill Hygiene Rationalization Table

| Excuse | Reality |
|---|---|
| "I'll just leave the old file for reference" | Git history is the reference. The active package is for runtime inputs. |
| "Lowercase version is a backup of the uppercase one" | One is wrong. Pick one. Archive the other. |
| "This summary file documents what I did" | Edit CHANGELOG.md. That IS the documentation. |
| "node_modules is needed for the scoring engine" | Then it lives in `scoring-engine/node_modules/`, not at skill root. |
| "I'll add this module 'just in case' someone needs it" | They won't. Modules that aren't referenced are noise. |
| "The skill works fine with the extra files" | Until it doesn't. v7.x worked fine until the audit. |
| "Cleaning up isn't the highest leverage thing right now" | The skill that automates a founder's life cannot itself be a hairball. |
| "I'll do a hygiene pass after this big feature lands" | Do it before. Bloat compounds. |

---

## Hygiene Red Flags

- ❌ Created a `*_SUMMARY.md` or `*_FIXES_COMPLETE.md` at the skill root
- ❌ Renamed a file from UPPER_CASE.md to lower-case.md without deleting/archiving the original
- ❌ Saved a new version as `[name]-v[N].md` instead of editing in place + CHANGELOG entry
- ❌ Added a new module without a corresponding SKILL.md routing table entry
- ❌ Allowed `node_modules/` to appear in the skill root
- ❌ Did not run `/atlas doctor` after structural changes
- ❌ The skill directory exceeded 100 files (excluding committed sub-projects)

---

## The Single Sentence

**The skill that ships products must itself ship as a skill — small, coherent, testable, and free of the meta-debris that proves its author got lost in process.**

If Atlas violates this sentence, repair Atlas before continuing to run Atlas on user projects. There is no path to user success that runs through skill-level chaos.

---

**Hygiene is not a polish phase. It is a precondition.**\n\n---\n\n# Hands-Off Gaps\n\n*Merged from hands-off-gaps.md*\n\n# Atlas Hands-Off Gap Analysis

*What each module currently delegates to humans that Atlas could do itself.*

This is a living reference. When Atlas generates a `userMust` item, check here first: can Atlas do it instead?

---

## The Quadriplegic Test

**Could someone physically unable to type have Atlas run on their project and be making money in a week?**

For each gap below: `[ATLAS CAN DO]`, `[PARTIAL]`, or `[IRREDUCIBLE HUMAN STEP]`.

---

## Module 1 — Onboarding

| Task | Current | Should Be |
|------|---------|-----------|
| Learn founder location | Asks in interview | Infer from git config `user.email` domain, `.env` timezone, README country mentions — only ask if `[UNKNOWN]` |
| Learn tech stack | Reads code ✓ | Already handled |
| Understand revenue model | Reads Stripe config ✓ | Already handled |
| Learn existing audience | Asks | Try: check package.json for newsletter integrations, search docs for "subscribers" or "users" mentions |
| Identify competitor mentions | Silent | Read dependencies for competitor SDKs, search docs for competitor names → already partially done |

**Remaining irreducible steps in Onboarding:**
- Financial runway (genuinely unknowable from code) `[IRREDUCIBLE]`
- Risk tolerance (personal preference) `[IRREDUCIBLE]`
- Definition of success (personal) `[IRREDUCIBLE]`
- Confirmation of accuracy (founder review) `[IRREDUCIBLE]` — but Atlas should minimize the time needed

---

## Module 2 — Code Sprint

| Task | Current | Status | Fix |
|------|---------|--------|-----|
| Fix code bugs | Does ✓ | `[ATLAS CAN DO]` | Already done |
| Push fixes to remote | Commits but doesn't push | `[ATLAS CAN DO]` | Run `git push` after committing |
| Deploy to staging | Writes guide | `[ATLAS CAN DO]` | Run `vercel --prod` or `railway up` |
| Set up GitHub Actions CI | Writes guide | `[ATLAS CAN DO]` | Commit `.github/workflows/ci.yml` automatically |
| Generate API docs | Does ✓ | `[ATLAS CAN DO]` | Already done |
| Add env vars to Vercel | Writes list | `[PARTIAL]` | Run `vercel env add KEY` for each one that doesn't contain a secret |
| Create env vars in CI | Writes guide | `[ATLAS CAN DO]` | Commit `.github/workflows/ci.yml` with env var names (values are secrets) |
| Run `pnpm db:migrate` | Delegates | `[IRREDUCIBLE]` until production DB credentials exist | But Atlas can: run it locally to verify it works |

**What Atlas should always do, not suggest:**
- `git push origin main` (or current branch) after all commits
- `vercel --prod` if vercel.json exists
- Commit a complete `.github/workflows/deploy.yml` so future pushes auto-deploy

---

## Module 3 — Legal & Compliance

| Task | Current | Status | Fix |
|------|---------|--------|-----|
| Draft ToS | Does ✓ | `[ATLAS CAN DO]` | Already done |
| Draft Privacy Policy | Does ✓ | `[ATLAS CAN DO]` | Already done |
| Add legal routes to codebase | Sometimes | `[ATLAS CAN DO]` | Always check if `/privacy` and `/terms` routes exist; create them if not |
| Publish legal pages | Delegates | `[PARTIAL]` | Atlas deploys; legal pages become live as part of deployment |
| Register with Chrome Web Store | Delegates | `[IRREDUCIBLE]` | CWS requires phone verification. Atlas can: pre-fill all fields, open the URL |
| GDPR data deletion endpoint | Sometimes | `[ATLAS CAN DO]` | Check if `DELETE /user/account` exists; create if not |
| Cookie consent banner | Rarely | `[ATLAS CAN DO]` | Commit a cookie consent component if EU audience is possible |

**The key gap:** Atlas writes legal docs but doesn't commit routes that serve them. Fix: after writing legal docs, always check if serving routes exist and create them if not.

---

## Module 4 — Launch Strategy

| Task | Current | Status | Fix |
|------|---------|--------|-----|
| Write launch copy | Does ✓ | `[ATLAS CAN DO]` | Already done |
| Write affiliate outreach | Does ✓ | `[ATLAS CAN DO]` | Already done |
| Post to Product Hunt | Can't (no API) | `[IRREDUCIBLE]` | Atlas provides: draft pre-filled in PH's exact format, direct link to "New Product" |
| Post to Hacker News | Can't (no API) | `[IRREDUCIBLE]` | Atlas provides: Show HN text in correct format, timing recommendation, direct link |
| Post to Reddit | Can't | `[IRREDUCIBLE]` | Atlas provides: complete post text per sub, direct link to subreddit's submit page |
| Schedule Product Hunt for Tuesday | Can't | `[IRREDUCIBLE]` | Atlas specifies exact UTC time to maximize upvotes |
| Apply for PH Ship | Can't | `[ATLAS CAN DO]` | Draft and output the Ship application text ready to paste |
| Create short link for launch | Can't | `[PARTIAL]` | Recommend Dub.co free tier, provide the exact URL to create |

**The launch assets gap:** Atlas creates text. The human still has to paste them in 6 different places. Better: Atlas creates a `LAUNCH_SCRIPTS.md` that is ordered sequentially — paste item 1, then item 2, etc. — so the human spends 15 minutes copy-pasting, not thinking.

---

## Module 5 — Marketing

| Task | Current | Status | Fix |
|------|---------|--------|-----|
| Write content calendar | Does ✓ | `[ATLAS CAN DO]` | Already done |
| Write SEO strategy | Does ✓ | `[ATLAS CAN DO]` | Already done |
| Write social media bios | Does ✓ | `[ATLAS CAN DO]` | Already done |
| Schedule posts to Buffer | Delegates | `[PARTIAL]` | Buffer API exists. Atlas can generate the exact API calls if Buffer API key is in .env |
| Create Buffer account | Delegates | `[IRREDUCIBLE]` | Phone verification required. Atlas: opens buffer.com/signup |
| Create Twitter/X account | Delegates | `[IRREDUCIBLE]` | Phone verification required. Atlas: provides complete profile content ready to paste |
| Create LinkedIn page | Delegates | `[IRREDUCIBLE]` | Requires existing personal account. Atlas: provides all content pre-written |
| Set up Google Search Console | Delegates | `[PARTIAL]` | Atlas can: generate DNS TXT verification record if domain is on Cloudflare/Vercel (add via CLI) |
| Identify micro-influencers | Misses | `[ATLAS CAN DO]` | Use web search to find top accounts in the niche with 1-50K followers; write DM templates |
| Write press kit | Missing module | `[ATLAS CAN DO]` | Add: founder bio, product screenshots description, key stats, logo usage — standard press kit |

**The scheduling gap:** Buffer's API allows posting via HTTP. If `BUFFER_ACCESS_TOKEN` is in `.env`, Atlas should actually call the Buffer API to schedule posts, not just write a calendar.

---

## Module 6 — Business Setup

| Task | Current | Status | Fix |
|------|---------|--------|-----|
| Recommend entity type | Does ✓ | `[ATLAS CAN DO]` | Already done |
| Write entity formation steps | Does ✓ | `[ATLAS CAN DO]` | Already done |
| File LLC | Delegates | `[IRREDUCIBLE]` | Physical signature + payment required. Atlas: opens exact state SOS URL, provides pre-filled info |
| Open bank account | Delegates | `[IRREDUCIBLE]` | ID verification required. Atlas: provides Mercury Bank link (best for indie founders, no fees), all business info to bring |
| Set up Wave/QuickBooks | Delegates | `[PARTIAL]` | Atlas can: output the exact categories to create, chart of accounts, and first-year setup steps |
| Apply for AWS Activate | Missing | `[ATLAS CAN DO]` | Write and output complete AWS Activate application (up to $100K credits) |
| Apply for Stripe Atlas | Missing | `[ATLAS CAN DO]` | Write and output the Stripe Atlas application — handles LLC formation + US bank account |
| Apply for Vercel startup credits | Missing | `[ATLAS CAN DO]` | Write the application email for Vercel's startup program |
| Calculate estimated tax payments | Does | `[ATLAS CAN DO]` | Already done — improve to generate actual IRS Form 1040-ES payment schedule |

**The startup credits gap:** AWS Activate, Stripe Atlas, Vercel Pro, GitHub for Startups, Cloudflare for Startups — together these can cover >$50K in infrastructure costs. Atlas should apply to all of them as part of Module 6, not mention them optionally.

---

## Module 7 — Automation Handoff

| Task | Current | Status | Fix |
|------|---------|--------|-----|
| Write n8n/Make configs | Does | `[PARTIAL]` | Better: commit actual workflow JSON files (importable) |
| Commit GitHub Actions | Does ✓ | `[ATLAS CAN DO]` | Already done |
| Set up Sentry | Delegates config | `[PARTIAL]` | Commit `sentry.client.config.ts` and `sentry.server.config.ts` automatically |
| Configure Better Uptime | Delegates | `[PARTIAL]` | If `BETTER_UPTIME_API_KEY` in .env, call the API to create monitors |
| Set up email sequences | Writes copy | `[PARTIAL]` | If Resend/SendGrid API key in .env, create the actual sequences via API |
| Create Stripe webhook | Delegates | `[PARTIAL]` | Stripe CLI: `stripe listen --forward-to localhost:3001/webhooks/stripe` for testing; prod URL after deploy |
| Write support FAQ | Does ✓ | `[ATLAS CAN DO]` | Already done |
| Configure Crisp/Intercom rules | Misses | `[ATLAS CAN DO]` | Write the exact auto-response rules if support tool is detected |

**The automation execution gap:** Atlas writes about automations. The real power is Atlas configuring them. For every tool with an API and a key in `.env`, Atlas should configure it — not describe how to.

---

## Module 8 — Operations

| Task | Current | Status | Fix |
|------|---------|--------|-----|
| Define North Star metrics | Does ✓ | `[ATLAS CAN DO]` | Already done |
| Write weekly review ritual | Does ✓ | `[ATLAS CAN DO]` | Already done |
| Write support playbook | Does ✓ | `[ATLAS CAN DO]` | Already done |
| Set up PostHog | Delegates | `[PARTIAL]` | If POSTHOG_API_KEY in .env, create dashboards via PostHog API |
| Create milestone alerts | Writes about | `[ATLAS CAN DO]` | Commit actual Stripe webhook handler for MRR milestone alerts |
| Write investor update template | Missing | `[ATLAS CAN DO]` | Generate monthly investor update template keyed to the North Star metrics |
| Calculate acquisition value | Does | `[ATLAS CAN DO]` | Already done — improve to show Acquire.com comparable sales |

---

## Gaps Across All Modules

### Missing Entirely

These capabilities don't exist in any module and should:

**1. Deployment Automation (New: runs automatically in Module 2)**
```
If vercel.json present → vercel --prod
If railway.toml present → railway up
If Dockerfile present → ask for platform choice, then deploy
In all cases: confirm live URL, ping it to verify 200 response
```

**2. Startup Credits Sprint (New: runs in Module 6)**
```
For each program below, if product qualifies:
- AWS Activate (up to $100K): atlas.amazon.com
- Stripe Atlas ($500 credit + US entity formation): stripe.com/atlas
- Vercel startup credits: vercel.com/support/contact (email template)
- GitHub for Startups: github.com/solutions/startups
- Cloudflare for Startups: cloudflare.com/forstartups
- Anthropic startup credits: console.anthropic.com/settings/credits
Atlas outputs: complete application content for each, direct link, expected turnaround
```

**3. Zero-to-First-Dollar Sprint (New: runs after Module 4 if MRR = 0)**
```
Find the 5-10 most likely first paying customers:
- Search the relevant subreddits for people who expressed the pain this product solves
- Search Twitter/X for complaints about competitor products
- Check relevant Discord servers for questions Atlas's product answers
Write: personalized cold DM for each (not a template — a genuine message)
Track: don't move on until one response is received
```

**4. Launch Sequencer (Enhancement to Module 4)**
```
Instead of: "Here are the posts to copy-paste"
Generate: LAUNCH_SEQUENCE.md — numbered steps in exact chronological order
  Step 1: [09:00 Tuesday] Post on Product Hunt — paste this: [exact text]
  Step 2: [09:05] Post Show HN — paste this: [exact text] at [exact URL]
  Step 3: [09:10] Post r/sweepstakescasinos — paste this: [exact text]
  ...
Human follows a recipe, not a strategy doc.
```

**5. Press Kit Generator (New: in Module 5)**
```
Create: /public/press/ folder with:
  - press-kit.md (founder bio, product facts, key stats, logo usage)
  - logo.svg (reference existing from codebase or commission)
  - screenshots/ (instructions for exact screenshots needed)
  - press@[domain].com email setup instructions
```

---

## What Requires a Human Body (True Irreducibles)

No matter how automated Atlas becomes, these always require human action:

1. **Phone number verification** — Twitter, LinkedIn, Google, most banks
2. **Government ID verification** — banking, Stripe identity, LLC signatures
3. **Financial transactions** — domain purchase, LLC filing fee, hardware
4. **Physical screenshots** — the product running on their machine
5. **Live calls/demos** — investor calls, customer discovery
6. **Biometric authentication** — FaceID, fingerprint for banking apps

Everything else is a failure of imagination or automation.

---

## Priority Order (Highest-Impact Gaps to Close First)

1. **Deployment execution** (Module 2) — Atlas should deploy, not describe deployment
2. **Startup credits applications** (Module 6) — could save $50K+ in infrastructure costs
3. **Launch Sequencer format** (Module 4) — numbered recipe eliminates all copy-paste anxiety
4. **Buffer API scheduling** (Module 5) — if key exists, actually schedule the posts
5. **Zero-to-First-Dollar Sprint** (new module) — revenue before MRR, not after
6. **Sentry + Better Uptime API calls** (Module 7) — configure monitoring, don't describe it\n