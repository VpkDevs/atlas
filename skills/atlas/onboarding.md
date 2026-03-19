---
name: atlas-onboarding
description: Use when starting an Atlas single-project run — builds the complete Business Context through 3-pass intelligence gathering before touching any strategy or code. Never skip. Never abbreviate.
---

# Atlas Onboarding — 3-Pass Intelligence Engine

**This module runs before anything else. No exceptions.**

The quality of every downstream module depends entirely on the accuracy of the Business Context built here.

## The 3 Passes

### Pass 1: Raw Signals (Silent)

Read everything. Do not interact with the founder yet.

**Code signals:**
- README, CLAUDE.md, PRD, all docs
- All API routes, web pages, database schema, migration history
- `package.json` / `pyproject.toml` dependencies → reveals architecture + third-party services
- Git log: velocity, contributors, decisions made over time
- `.env.example`: configured infrastructure vs. gaps
- Test coverage percentage
- Error handling quality
- Deployment config (Vercel, Railway, Docker, Fly, etc.)

**Business signals:**
- Landing page copy, marketing content
- Pricing configuration in code
- Legal docs (if any exist)
- Stripe/payment integration status
- Email service configuration
- Analytics/monitoring setup

**Maturity signals:**
- Feature flags → deployment sophistication
- API versioning → API maturity
- Migration count → schema stability
- Logging/monitoring → operational readiness

### Pass 2: Inferences (Silent)

Build a structured picture from what you read. Tag everything:
- `[CONFIRMED]` — directly stated in docs or config
- `[INFERRED]` — reasonably concluded from code/signals
- `[UNKNOWN]` — cannot determine without founder input

**Build these inferences:**
- Completion percentage (0-100%)
- Project type: saas | extension | tool | marketplace | content | api | community | mobile
- Founder type: solo/team, technical/non-technical, experience level from code patterns
- Infrastructure status: dev-only | staging | production-ready
- Legal status: none | partial | complete
- Market positioning: inferred from landing copy + competitor dependencies
- Runs-itself score (baseline, 0-100)
- Top 3 code blockers
- Top 3 infrastructure gaps

### Pass 3: Genuine Gaps (The Interview)

Ask ONLY what cannot be inferred. Batch by category. This is efficient onboarding, not a conversation.

**Business fundamentals:**
- Geographic location (affects entity type, tax advice, compliance jurisdiction)
- Definition of success: lifestyle business | grow to sell | acquisition target | VC-scale
- Timeline pressure: soft | 3 months | ASAP
- Financial runway or monthly budget ceiling

**Distribution:**
- Existing audience: email list size, social following, community presence
- Prior launch experience: what worked, what didn't

**Team:**
- Solo founder or co-founders? If team, roles?
- Any contractors or employees?

**Personal:**
- Risk tolerance: conservative | moderate | aggressive

**Do not ask about things you can infer.** If you can see Stripe is integrated, don't ask "do you have payments?" If the stack is Next.js + Supabase, don't ask what stack they're using.

## Confirmation Ritual

Before any sprint begins, narrate back the complete Business Context:

```
Here is my complete understanding of [Product Name].
Please correct anything wrong before I begin.

PRODUCT
  Name: [name]
  Category: [type]  [CONFIRMED/INFERRED]
  Target customer: [customer]  [CONFIRMED/INFERRED]
  Pricing: [model + amount]  [INFERRED from code]
  Completion: ~[X]%  [INFERRED]
  Current runs-itself score: [X]/100

FOUNDER
  Location: [stated]
  Team: [solo/team composition]
  Runway: [stated or UNKNOWN]
  Definition of success: [stated]
  Experience: [INFERRED from code patterns]

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

Is this understanding correct? Any corrections before I begin?
Type 'correct: [correction]' or 'begin' to start.
```

## Business Context Schema

This JSON object is built during onboarding and passed to every module:

```json
{
  "product": {
    "name": "",
    "slug": "",
    "category": "",
    "type": "saas|extension|tool|marketplace|content|api|community|mobile",
    "description": "",
    "target_customer": "",
    "core_value_prop": "",
    "pricing_model": "",
    "completion_percentage": 0,
    "runs_itself_score": 0,
    "tech_stack": [],
    "deployment_status": "none|dev|staging|production"
  },
  "founder": {
    "location": "",
    "team_size": 1,
    "runway_months": 0,
    "timeline": "",
    "definition_of_success": "lifestyle|grow|acquire|vc",
    "existing_audience": 0,
    "prior_launches": 0,
    "risk_tolerance": "low|medium|high"
  },
  "market": {
    "competitors": [],
    "target_communities": [],
    "launch_channels_ranked": [],
    "estimated_tam": ""
  },
  "status": {
    "current_phase": "",
    "code_blockers": [],
    "infrastructure_gaps": [],
    "legal_gaps": [],
    "completed_modules": []
  },
  "portfolio_context": {
    "total_projects": 0,
    "portfolio_mrr": 0,
    "cross_promotion_opportunities": [],
    "shared_audience_products": []
  }
}
```

## Save State

After founder confirms, write to:
```
~/.atlas/portfolio/[slug]/context.json   ← Business Context JSON
~/.atlas/founder-profile.json           ← update founder profile
```

Then proceed to Code Sprint.

## Red Flags — Skipping Onboarding

- ❌ "The codebase is obvious, I don't need to read everything" → Read everything.
- ❌ "I can infer the founder's goals" → You cannot infer location, runway, or definition of success.
- ❌ "Let me just start fixing code" → Onboarding first. Always.
- ❌ "I'll ask questions as I go" → Batch the interview. Do it here.
- ❌ "I already know this product" → Re-run Pass 1 anyway. Products change.
