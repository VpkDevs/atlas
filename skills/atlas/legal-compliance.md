---
name: atlas-legal-compliance
description: Use during Atlas Module 2 — generates product-specific Terms of Service, Privacy Policy, and compliance checklist based on actual data practices in the codebase. Not templates. Specific to this product.
---

# Atlas Legal & Compliance

**Input:** Business Context + project type + founder location
**Purpose:** Get legally clean before launch. Not after. Before.

## The Rule

Legal is not optional. Legal gaps that emerge post-launch are catastrophic. Legal gaps pre-launch cost 2 hours.

**Every product needs at minimum:**
1. Terms of Service
2. Privacy Policy
3. Compliance checklist for its category + jurisdiction

## Process

### Step 1: Read the Actual Data Practices

Before writing any legal docs, read the codebase for what data this product actually:
- Collects from users
- Stores in the database
- Sends to third parties (analytics, email services, payment processors)
- Retains and for how long
- Allows users to delete

This is how you write a real privacy policy, not a template.

### Step 2: Identify Category-Specific Obligations

| Product Type | Key Obligations |
|-------------|-----------------|
| SaaS | GDPR/CCPA if collecting PII, data deletion requests |
| Financial tools | Not financial advice disclaimer, regulatory risk |
| Health/wellness | HIPAA consideration, medical disclaimer |
| Children's content | COPPA (US), under-13 prohibition |
| Sweepstakes/gaming | State sweepstakes laws, responsible play, age verification |
| Marketplace | Payment terms, dispute resolution, seller agreements |
| API product | Rate limit terms, SLA, acceptable use |
| Browser extension | Manifest permissions justification, data handling |

### Step 3: Identify Jurisdiction-Specific Obligations

| Location | Key Obligations |
|----------|-----------------|
| EU/EEA | GDPR: consent, right to erasure, DPA if required |
| California | CCPA: opt-out rights, data sale disclosure |
| US general | CAN-SPAM (email), FTC disclosure (affiliates) |
| UK | UK GDPR (post-Brexit equivalent) |
| Canada | PIPEDA, CASL (email marketing) |
| Australia | Privacy Act, Australian Consumer Law |

### Step 4: Write the Documents

**Terms of Service** — fill in with this product's actual:
- Service description
- Acceptable use for this product category
- Payment terms (if applicable) using actual Stripe integration details
- Termination conditions specific to this service
- Limitation of liability appropriate to this risk level
- Governing law based on founder location

**Privacy Policy** — specific to what this product actually does:
- Exactly what data is collected (from codebase reading in Step 1)
- Why each data type is collected
- Who it's shared with (name the actual third parties: Stripe, Supabase, PostHog, etc.)
- Retention periods
- User rights (deletion, export, correction)
- Contact information for data requests

**Compliance Checklist** — actionable items:
- [ ] Each obligation by category
- [ ] Each obligation by jurisdiction
- [ ] Ongoing obligations (annual review, deletion request process)
- [ ] What requires lawyer review vs. boilerplate-safe

### Step 5: Risk Radar

Flag specific risks with:
- **Severity:** 🔴 High / 🟡 Medium / 🟢 Low
- **Likelihood:** High / Medium / Low
- **Specific fix:** What to do about it
- **Who fixes it:** Atlas can fix | Needs lawyer | Needs human action

### Step 6: Ongoing Obligations

Document what must happen repeatedly:
- GDPR data deletion requests (respond within 30 days)
- CCPA opt-out requests (respond within 45 days)
- Annual privacy policy review
- Cookie consent update when adding new trackers

## Confidence Model

Every legal recommendation carries a confidence level:

| Level | Meaning | What to Do |
|-------|---------|-----------|
| ✅ High | Standard boilerplate, well-established | Use as-is |
| ⚠️ Medium | Common but jurisdiction-dependent | Review before publishing |
| ❌ Low | Complex or jurisdiction-specific | Have a lawyer review |

**Atlas never fabricates legal certainty.** Low-confidence items are always flagged.

## Output

- `docs/legal/TERMS_OF_SERVICE.md`
- `docs/legal/PRIVACY_POLICY.md`
- `docs/legal/COMPLIANCE_CHECKLIST.md`

## Checkpoint

```
─────────────────────────────────────────────────────
LEGAL & COMPLIANCE COMPLETE

Done:
  ✓ Terms of Service — [N] sections, specific to this product
  ✓ Privacy Policy — covers [N] data types actually collected
  ✓ Compliance checklist — [N] items, [N] require lawyer review
  ✓ [N] risks flagged by Risk Radar

Runs-itself score: [X] → [Y]

Needs your action:
  → [e.g., "Have a lawyer review Section 4 (liability cap) — flagged LOW confidence"]

Type 'continue' to proceed to Launch Strategy
─────────────────────────────────────────────────────
```

## Red Flags

- ❌ Copy-pasting a generic template without reading the actual codebase
- ❌ Skipping legal because "it's a small product"
- ❌ Not flagging jurisdiction-specific obligations
- ❌ Fabricating legal certainty on low-confidence items
- ❌ Writing privacy policy without reading what data is actually collected
