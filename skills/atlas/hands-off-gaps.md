# Atlas Hands-Off Gap Analysis

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
6. **Sentry + Better Uptime API calls** (Module 7) — configure monitoring, don't describe it
