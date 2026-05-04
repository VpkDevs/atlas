---
name: atlas-onboarding
description: Use when starting an Atlas single-project run — builds the complete Business Context through 3-pass intelligence gathering before touching any strategy or code. Never skip. Never abbreviate. The quality of everything downstream depends on the accuracy built here.
---

# Atlas Onboarding — 3-Pass Intelligence Engine

**This module runs before anything else. No exceptions.**

The quality of every downstream module depends entirely on the accuracy of the Business Context built here. A wrong inference in Pass 2 cascades into wrong legal docs, wrong marketing copy, wrong entity advice, and wrong launch strategy. Get this right.

---

## Pre-Pass: Resume Check

Before reading any code, check:
```
~/.atlas/portfolio/[slug]/context.json
```
If it exists and contains `completed_modules` with entries → **Continuation Sprint (EC-5).** Load `edge-cases.md`. Skip completed modules. Announce:
```
Resuming [Product Name] from Module [N].
Modules 1–[N-1] complete from previous run.
Starting with [Module Name].
```

If it does not exist → first run. Continue to Pass 1.

---

## Pass 1: Raw Signals (Silent — No Founder Interaction)

Read everything. Build a complete mental model before speaking.

### Code Signals (Read in Priority Order)

1. **README, CLAUDE.md, PRD, all docs** — product intent
2. **`package.json` / `pyproject.toml` / `go.mod`** — dependencies reveal architecture + services
3. **Database schema + migrations** — data model = business model
4. **All API routes / web pages** — surface area of the product
5. **`.env.example` or `.env`** — configured infrastructure vs. gaps
   - If NEITHER exists: scan all source files for `process.env.*` / `os.environ` / `ENV[]` references. Compile variable names to infer services (EC-4)
6. **Git log (`git log --oneline -30`)** — velocity, contributors, decisions
7. **Deployment config** — Vercel/Railway/Docker/Fly/manifest.json
8. **Test files** — coverage, quality (lowest priority — lowest info density)

### Business Signals

- Landing page copy, marketing content → positioning
- Pricing configuration in code → monetization model
- Legal docs (if any) → compliance maturity
- Stripe/Paddle/LemonSqueezy integration status → `monetization_status`
- Email service configuration → communication maturity
- Analytics/monitoring setup → operational readiness

### Maturity Signals

- Feature flags → deployment sophistication
- API versioning → API maturity
- Migration count → schema stability
- Logging/monitoring → operational readiness
- Error handling patterns → code quality

### Credentials Index (Mandatory in Pass 1)

Build `~/.atlas/portfolio/[slug]/credentials_index.json` — only **have/don't have** booleans, never values:

```json
{
  "stripe": true,
  "resend": false,
  "sentry": true,
  "better_uptime": false,
  "buffer": false,
  "posthog": false,
  "vercel_token": true,
  "github_token": true
}
```

Every later phase reads this to plan around what's available. This eliminates guesswork downstream.

---

## Pass 2: Inferences (Silent — No Founder Interaction)

Build a structured picture. Tag everything with evidence:
- `[CONFIRMED]` — directly stated in docs or config
- `[INFERRED: file:line]` — concluded from specific evidence (cite the source)
- `[UNKNOWN]` — cannot determine without founder input

### Build These Inferences

- **Completion percentage (0-100%)** — based on route count, feature completeness, test coverage
- **Project type:** saas | extension | tool | marketplace | content | api | community | mobile
- **Monetization status:** `pre-revenue` (no payment processor) | `active` (Stripe/etc present)

### Special Mode Detection (Check in This Order)

| Condition | Mode | Action |
|-----------|------|--------|
| Zero source files + README exists | **Blueprint Mode (EC-2)** | Scaffold project from README |
| Structure + deps + no README | **Inference Mode (EC-3)** | Infer boldly from deps |
| `deployment_status: production` AND `completion ≥ 85%` | **Code Audit Mode (EC-1)** | Verify + fill infra gaps |
| Multiple deployment configs | **Multi-Target Mode (EC-9)** | Deploy each target |
| 50+ source files or multiple `package.json` | **Monorepo Mode (EC-13)** | Priority-ordered reading |

### Additional Inferences

- Founder type: solo/team, technical/non-technical (from code patterns)
- Infrastructure status: dev-only | staging | production-ready
- Legal status: none | partial | complete
- Market positioning: inferred from copy + competitor deps
- Runs-itself score (baseline, 0-100)
- Top 3 code blockers
- Top 3 infrastructure gaps

### Anti-Hallucination Rules

- Each `[INFERRED]` tag MUST include specific evidence (file:line)
- Discrepancies between code and founder claims surface explicitly
- Never invent metrics — use `null` and surface the gap
- Never assume a service is configured just because the package is installed

---

## Pass 3: Genuine Gaps (The Interview)

Ask ONLY what cannot be inferred. Batch by category. This is efficient onboarding, not a conversation.

### Before Asking — Attempt to Infer

| Founder Fact | Inference Method |
|-------------|-----------------|
| Location | `git config user.email` domain, commit timestamps, README mentions, domain TLD |
| Existing audience | Newsletter integrations in deps, "subscribers" in docs |
| Risk tolerance | Velocity × dependency conservatism |
| Definition of success | Pricing in code → revenue intent; non-commercial license → OSS/lifestyle |
| Prior launches | `~/.atlas/patterns/launch.md` exists? |
| Timeline pressure | `[urgent]`/`[hotfix]` commit patterns |

Present inferred values for confirmation rather than asking blank questions.

### Questions to Ask (Only If Still [UNKNOWN])

**Business fundamentals:**
- Geographic location (affects entity type, tax, compliance)
- Definition of success: lifestyle | grow to sell | acquisition target | VC-scale
- Timeline pressure: soft | 3 months | ASAP
- Financial runway or monthly budget ceiling

**Distribution:**
- Existing audience: email list size, social following, community presence
- Prior launch experience: what worked, what didn't

**Team:**
- Solo or co-founders? If team, roles?

**Personal:**
- Risk tolerance: conservative | moderate | aggressive

**Do not ask about things you can infer.** If Stripe is integrated, don't ask "do you have payments?" If the stack is Next.js + Supabase, don't ask what stack they're using.

**Non-US founders:** If location is outside US, load EC-6 from `edge-cases.md`. Entity and legal modules will adjust.

---

## Confirmation Ritual

Before any sprint begins, narrate back the complete Business Context:

```
Here is my complete understanding of [Product Name].
Please correct anything wrong before I begin.

[If Blueprint Mode:] ⚠️ BLUEPRINT MODE — No source code. I'll scaffold from the README.
[If Code Audit Mode:] ⚠️ CODE AUDIT MODE — Already in production. I'll verify and fill gaps.

PRODUCT
  Name: [name]
  Category: [type]  [CONFIRMED/INFERRED: package.json]
  Target customer: [customer]  [CONFIRMED/INFERRED: landing copy]
  Pricing: [model + amount]  [INFERRED: stripe config]
  Completion: ~[X]%  [INFERRED]
  Monetization: [active / pre-revenue]  [INFERRED: deps]
  Current runs-itself score: [X]/100

FOUNDER
  Location: [stated or INFERRED: git config]
  Team: [solo/team composition]
  Runway: [stated or UNKNOWN]
  Definition of success: [stated]
  Experience: [INFERRED: code patterns]

MARKET
  Competitors identified: [list]
  Best launch channel (preliminary): [INFERRED]
  Community opportunities: [list]

BLOCKERS
  Code: [list of critical issues]
  Infrastructure: [list]
  Legal: [status]

RISKS I'VE NOTICED
  🔴 [severity: high] [specific risk]
  🟡 [severity: medium] [specific risk]
```

### Product Type Verification

If detected type is extension, mobile, CLI, or API — ask this one question:
```
I've classified this as: [type]. This affects deployment, legal, and launch strategy.
Confirm: [SaaS] [Browser Extension] [Mobile App] [CLI Tool] [API] [Marketplace]
```

Then:
```
Is this understanding correct? Any corrections before I begin?
Type 'correct: [correction]' or 'begin' to start.
Atlas proceeds immediately after 'begin' — no further confirmation between modules.
```

### Auto-Confirm Timer

If the founder doesn't reply within 10 minutes (and Atlas is in autonomous mode), proceed with all `[INFERRED]` values. Log "auto-confirmed at <timestamp>." Surface a single recap when founder returns. **Never block forever on confirmation.**

---

## Business Context Schema

```json
{
  "product": {
    "name": "", "slug": "", "category": "",
    "type": "saas|extension|tool|marketplace|content|api|community|mobile",
    "description": "", "target_customer": "", "core_value_prop": "",
    "pricing_model": "", "completion_percentage": 0, "runs_itself_score": 0,
    "tech_stack": [], "deployment_status": "none|dev|staging|production",
    "monetization_status": "pre-revenue|active", "production_url": ""
  },
  "founder": {
    "location": "", "team_size": 1, "runway_months": 0,
    "timeline": "", "definition_of_success": "lifestyle|grow|acquire|vc",
    "existing_audience": 0, "prior_launches": 0,
    "risk_tolerance": "low|medium|high"
  },
  "market": {
    "competitors": [], "target_communities": [],
    "launch_channels_ranked": [], "estimated_tam": ""
  },
  "status": {
    "current_phase": "", "code_blockers": [],
    "infrastructure_gaps": [], "legal_gaps": [],
    "completed_modules": []
  },
  "portfolio_context": {
    "total_projects": 0, "portfolio_mrr": 0,
    "cross_promotion_opportunities": [],
    "shared_audience_products": []
  }
}
```

---

## Save State (Atomic Write)

After founder confirms:
```
~/.atlas/portfolio/[slug]/context.json      ← Business Context JSON (atomic write)
~/.atlas/portfolio/[slug]/credentials_index.json ← credentials map
~/.atlas/founder-profile.json               ← update/create founder profile
```

Then proceed to Code Sprint. No pause. No question.

---

## Acceptance Test (Phase 1)

- [ ] `context.json` exists and is valid JSON
- [ ] `credentials_index.json` exists
- [ ] Founder confirmed OR auto-confirmed after timeout
- [ ] All `[INFERRED]` tags have specific evidence citations
- [ ] Mode detection produced exactly one mode
- [ ] Dashboard opened and showing Phase 1 complete

---

## Red Flags — Skipping Onboarding

- ❌ "The codebase is obvious, I don't need to read everything" → Read everything.
- ❌ "I can infer the founder's goals" → You cannot infer location, runway, or definition of success without evidence.
- ❌ "Let me just start fixing code" → Onboarding first. Always.
- ❌ "I'll ask questions as I go" → Batch the interview. Do it here.
- ❌ "I already know this product" → Re-run Pass 1 anyway. Products change.
- ❌ Tagged something `[INFERRED]` without citing the specific file:line evidence.
- ❌ Asked a question that could have been inferred from code signals.
