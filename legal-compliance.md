---
name: atlas-legal-compliance
description: Use during Atlas Module 3 — generates product-specific Terms of Service, Privacy Policy, compliance checklist based on actual data practices in the codebase, AND commits the routes that serve them. Not templates. Specific to this product.
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
4. Routes that actually serve those documents (Atlas creates these)

---

## Process

### Step 1: Read the Actual Data Practices

Before writing any legal docs, read the codebase for what data this product actually:
- Collects from users
- Stores in the database (read schema)
- Sends to third parties (analytics, email services, payment processors)
- Retains and for how long (check any TTL or cleanup jobs)
- Allows users to delete

This is how you write a real privacy policy, not a template.

**Third party inventory** (auto-detect from dependencies + env variables):
- Payment: Stripe, Paddle, LemonSqueezy
- Analytics: PostHog, Mixpanel, Google Analytics, Plausible
- Email: Resend, SendGrid, Mailchimp, ConvertKit
- Auth: Clerk, Auth0, Supabase Auth, NextAuth
- Monitoring: Sentry, LogRocket, Datadog
- Support: Intercom, Crisp, HelpScout
- Infrastructure: Vercel, Railway, Fly, AWS, Cloudflare

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

**Terms of Service** — specific to this product's actual:
- Service description (what it does)
- Acceptable use for this product category
- Payment terms using actual Stripe/payment integration details
- Termination conditions specific to this service
- Limitation of liability appropriate to this risk level
- Governing law based on founder location

**Privacy Policy** — specific to what this product actually does:
- Exactly what data is collected (from Step 1 codebase reading)
- Why each data type is collected
- Who it's shared with (name the actual third parties by name — Stripe, Supabase, PostHog, etc.)
- Retention periods
- User rights (deletion, export, correction)
- Contact information for data requests

**Compliance Checklist** — actionable items:
- [ ] Each obligation by category
- [ ] Each obligation by jurisdiction
- [ ] Ongoing obligations (annual review, deletion request process)
- [ ] What requires lawyer review vs. boilerplate-safe

### Step 5: Commit the Legal Routes

**Atlas creates the routes — it does not remind the founder to create them.**

Check if `/privacy` and `/terms` routes exist in the codebase. If not, create them.

For Next.js:
```typescript
// app/privacy/page.tsx and app/terms/page.tsx
// Renders the markdown content of the legal docs
```

For Express/Fastify:
```typescript
app.get('/privacy', (req, res) => res.sendFile('docs/legal/PRIVACY_POLICY.html'));
app.get('/terms', (req, res) => res.sendFile('docs/legal/TERMS_OF_SERVICE.html'));
```

Also add links to these pages in:
- Footer component (if exists)
- Signup flow (if exists)
- Settings/account page (if exists)

### Step 6: GDPR Data Deletion Endpoint

If the product collects user data and doesn't have a deletion endpoint:

```typescript
// DELETE /api/user/account — GDPR-compliant account deletion
// Deletes all user data from all tables within 30-day window
```

Commit this endpoint. It is required for GDPR and CCPA compliance.

### Step 7: Cookie Consent (EU/International)

If the product uses analytics or tracking cookies:
- Commit a cookie consent banner component
- Set cookies only after consent
- Integrate with whatever analytics tool is detected

For Next.js, scaffold with `react-cookie-consent` or equivalent.

### Step 8: AI/LLM-Specific Compliance (Run if Product Uses AI)

**Detection:** If `anthropic`, `openai`, `@google-ai`, `replicate`, `huggingface` found in dependencies.

This product uses AI. Additional compliance obligations apply.

#### FTC AI Guidance (US) — ✅ High confidence
```
Required disclosures:
1. If AI generates content users might mistake for human-created:
   → Add "AI-generated" or "Created with AI assistance" label
   → Commit: add disclosure component to AI-generated output sections

2. If AI makes recommendations (products, prices, medical, financial):
   → Add "This is AI-generated and may be inaccurate. Verify important decisions."
   → Commit: add disclaimer adjacent to AI recommendations

3. If the product claims AI capabilities:
   → Claims must be accurate — no "100% accurate" or "guaranteed" language
   → Review marketing copy for inflated AI capability claims
```

#### EU AI Act (Applies if any EU users) — ⚠️ Medium confidence
```
Risk classification check:
  High-risk AI (requires conformity assessment):
  - Biometric identification
  - Critical infrastructure management
  - Employment decisions
  - Credit scoring
  - Law enforcement
  - Educational assessment
  
  If product falls in high-risk category:
  → Flag for lawyer review — ❌ Low confidence in self-assessment
  → Surface userMust: "EU AI Act high-risk classification may apply"
  
  Minimal/no risk (most SaaS products):
  - Productivity tools, content generation, customer service → minimal requirements
  - Transparency obligation: disclose when users interact with AI
  → Add: "Powered by AI" disclosure in footer or relevant UI
```

#### AI Output Liability Disclaimer (All Products)
Add to Terms of Service under appropriate section:
```
"AI-Generated Content: [Product Name] uses artificial intelligence to generate 
content/recommendations/analysis. AI output may contain errors, inaccuracies, or 
outdated information. Do not rely on AI-generated content for medical, legal, 
financial, or other professional decisions without independent verification. 
[Company] is not liable for actions taken based on AI-generated output."
```

#### Model and Data Transparency
Add to Privacy Policy:
```
"AI Processing: We use [model provider(s)] to process [specific data types] for 
the purpose of [specific feature]. Your inputs may be used to improve AI models 
per [provider's] policies. See [provider privacy policy URL]. 
You may opt out of AI processing by [specific method or contact]."
```

#### DMCA Agent Registration (US products with user-generated content)
```
If product allows user content uploads (images, text, files, code):

1. Register a DMCA Designated Agent at:
   https://www.copyright.gov/dmca-directory/
   Cost: $6 (one-time)
   Time: ~15 minutes

2. Add DMCA notice + takedown procedure to Terms of Service:
   "To report copyright infringement, contact: dmca@[yourdomain.com]
   Include: [required DMCA elements listed]"

3. Commit: POST /api/dmca-notice endpoint that receives reports
   Store reports in DB for 3-year retention (required)

Atlas surfaces this as a userMust if user-generated content detected,
with the exact copyright.gov URL and 15-minute time estimate.
```

#### Accessibility (ADA + Section 508, US Products)
```
If product has a web interface accessible to the public:

WCAG 2.1 AA is the legal standard for ADA compliance.

Atlas runs a quick accessibility audit:
  - Check for alt text on all images (grep for <img without alt)
  - Check for form labels (grep for <input without associated <label)
  - Check color contrast (requires visual inspection — surface as userMust)
  - Check keyboard navigation (requires manual testing — surface as userMust)

For commits:
  - Add alt text to any img elements found without it
  - Add labels to form inputs found without them
  - Add aria-label to icon buttons

Surface as ⚠️ Medium: "Full WCAG 2.1 AA audit recommended before significant growth.
Automated fix committed for found issues. Manual review needed for contrast + keyboard nav."
```

### Step 9: Risk Radar

Flag specific risks with:
- **Severity:** 🔴 High / 🟡 Medium / 🟢 Low
- **Likelihood:** High / Medium / Low
- **Specific fix:** What to do about it
- **Who fixes it:** Atlas already fixed | Needs lawyer | Needs human action

### Step 10: Ongoing Obligations

Document what must happen repeatedly:
- GDPR data deletion requests (respond within 30 days)
- CCPA opt-out requests (respond within 45 days)
- Annual privacy policy review
- Cookie consent update when adding new trackers

---

## Confidence Model

Every legal recommendation carries a confidence level:

| Level | Meaning | What to Do |
|-------|---------|-----------|
| ✅ High | Standard boilerplate, well-established | Use as-is |
| ⚠️ Medium | Common but jurisdiction-dependent | Review before publishing |
| ❌ Low | Complex or jurisdiction-specific | Have a lawyer review |

**Atlas never fabricates legal certainty.** Low-confidence items are always flagged.

---

## Output

- `docs/legal/TERMS_OF_SERVICE.md`
- `docs/legal/PRIVACY_POLICY.md`
- `docs/legal/COMPLIANCE_CHECKLIST.md`
- `/privacy` and `/terms` routes committed to codebase
- GDPR deletion endpoint (if applicable)
- Cookie consent banner (if applicable)
- Git commit: all legal docs and routes pushed

---

## Checkpoint

```
─────────────────────────────────────────────────────
LEGAL & COMPLIANCE COMPLETE

Atlas did:
  ✓ Read codebase — [N] data types identified, [N] third parties named
  ✓ Terms of Service — [N] sections, product-specific
  ✓ Privacy Policy — covers all [N] data types actually collected
  ✓ Compliance checklist — [N] items, [N] flagged for lawyer review
  ✓ /privacy and /terms routes committed
  ✓ GDPR deletion endpoint [created / already existed]
  ✓ Cookie consent [added / not needed: no tracking cookies detected]
  ✓ [N] risks flagged by Risk Radar
  ✓ Pushed to remote

Runs-itself score: [X] → [Y]

Human must do (non-blocking):
  → Have a lawyer review Section 4 (liability cap) — LOW confidence flagged

── PROCEEDING TO LAUNCH STRATEGY ────────────────────
─────────────────────────────────────────────────────
```

## Red Flags

- ❌ Copy-pasting a generic template without reading the actual codebase
- ❌ Skipping legal because "it's a small product"
- ❌ Not flagging jurisdiction-specific obligations
- ❌ Fabricating legal certainty on low-confidence items
- ❌ Writing privacy policy without reading what data is actually collected
- ❌ Not committing the /privacy and /terms routes
- ❌ Not creating GDPR deletion endpoint when product stores user data
- ❌ Not pushing legal docs and routes to remote
