---
name: legal-templates
description: ToS, Privacy Policy, and compliance checklist templates for target projects.
---

# Terms of Service Template

# Atlas Terms of Service

**Effective date:** May 5, 2026
**Last updated:** May 5, 2026
**Governing law:** State of Texas, United States

---

## 1. Acceptance

By installing Atlas, invoking `/atlas`, or using any part of this software, you agree to these Terms. If you do not agree, do not use Atlas.

These Terms apply to the Atlas Claude Code skill available at https://github.com/VpkDevs/atlas and any associated services, including the paid Individual and Studio subscription tiers when they become available.

---

## 2. What Atlas Is

Atlas is a Claude Code skill — a set of instruction files that run inside Anthropic's Claude Code environment. It is a developer tool that autonomously executes tasks on your behalf: reading your codebase, writing code, deploying software, posting content to third-party platforms, and operating software businesses.

**Atlas is not:**
- A managed service operated on our servers
- A financial advisor, legal advisor, or accountant
- A guarantee of business success
- A guarantee of software correctness, security, or fitness for any purpose

---

## 3. How Atlas Works (Data Implications)

Understanding what Atlas does is essential to understanding what you're agreeing to.

**Atlas runs on your machine** (or wherever Claude Code runs). It:

- Reads files in your project directory, including source code, configuration files, git history, and `.env` file presence (never `.env` values)
- Writes files to your project directory and to `~/.atlas/` on your local filesystem
- Executes shell commands on your machine (git, vercel CLI, npm, etc.)
- Makes API calls to third-party services using **your own API keys** stored in your own `.env` file — not Atlas's servers
- Posts content to third-party platforms (Twitter, LinkedIn, Reddit, Product Hunt, etc.) using credentials you provide
- Calls Claude Code's underlying Claude API — governed by Anthropic's own Terms of Service

**Atlas does not transmit your code, credentials, or business data to any Atlas-operated server.** All state is stored locally at `~/.atlas/`.

---

## 4. Your Responsibilities

You are responsible for:

**4.1 Everything Atlas does on your behalf.** When Atlas deploys code, posts content, sends emails, or makes purchases using your credentials — those are your actions. You are the legal actor. Atlas is a tool you are using.

**4.2 The content Atlas generates.** Atlas generates marketing copy, legal document drafts, business correspondence, and code. You must review all generated content before relying on it. Atlas-generated legal documents (ToS, Privacy Policies) are starting points — they are not reviewed by a licensed attorney and do not constitute legal advice.

**4.3 Compliance with third-party platform terms.** Atlas interacts with platforms including but not limited to: Twitter/X, LinkedIn, Reddit, Product Hunt, Hacker News, GitHub, Vercel, Railway, Fly.io, Stripe, Resend, SendGrid, Buffer, PostHog, Sentry, Better Uptime. You are responsible for complying with each platform's terms of service. Automated posting, account creation, and API usage are governed by those platforms' rules — not ours.

**4.4 API keys and credentials.** You are responsible for the security of your API keys. Do not share `.env` files. Do not commit secrets to git. Atlas stores only the *existence* (not the values) of credentials in `credentials_index.json`.

**4.5 Financial decisions.** Atlas may recommend or execute actions with financial implications: applying for startup credits, configuring Stripe products and pricing, placing ad spend. You bear all financial responsibility for these actions.

**4.6 Your codebase's compliance.** Atlas deploys your code. You are responsible for ensuring your product complies with applicable laws (GDPR, CCPA, HIPAA where relevant, export controls, etc.).

---

## 5. Acceptable Use

You may not use Atlas to:

- Generate, distribute, or publish content that is fraudulent, defamatory, harassing, or illegal under applicable law
- Create fake reviews, fake social proof, fake user testimonials, or engage in astroturfing
- Scrape platforms in violation of their terms of service
- Circumvent platform rate limits or anti-spam systems in ways that violate those platforms' rules
- Build products that themselves violate applicable law
- Reverse-engineer, redistribute, or sublicense Atlas in ways inconsistent with the MIT License

---

## 6. No Warranties

**ATLAS IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND.**

We make no warranties, express or implied, including but not limited to:
- Fitness for a particular purpose
- Accuracy of AI-generated content
- Correctness of generated code
- Success of any business, product, or launch
- Availability or uptime of any service

Atlas uses Claude (Anthropic's AI). AI-generated output can be wrong, incomplete, or inappropriate. Review everything.

---

## 7. Limitation of Liability

To the maximum extent permitted by applicable law:

**We are not liable for any damages arising from your use of Atlas**, including but not limited to: lost profits, lost data, deployment failures, security breaches caused by code Atlas helped write, platform bans resulting from Atlas-assisted automation, failed launches, incorrect legal documents, or incorrect financial advice.

**Cap on liability:** If any liability is found despite the above, our maximum liability is limited to the amount you paid for Atlas in the 12 months preceding the claim. If you are on the free tier, our maximum liability is $0.

---

## 8. Paid Tiers

When paid tiers (Individual: $29/mo, Studio: $99/mo) become available:

- Subscriptions are billed monthly or annually
- Cancellation takes effect at the end of the current billing period
- No refunds for partial months
- Free tier features remain available after cancellation

Payment processing is handled by Stripe. Their terms apply to all payment transactions.

---

## 9. Intellectual Property

**Atlas itself** is MIT licensed. You may use, copy, modify, and distribute it per the MIT License. See [LICENSE](../../LICENSE).

**Content Atlas generates for your projects** belongs to you. We claim no ownership over code, marketing copy, legal documents, or any other content Atlas generates in the course of operating your project.

**Your codebase** remains entirely yours. Atlas reads it to do its job. We have no rights to it.

---

## 10. Modifications

We may update these Terms. Material changes will be noted in [CHANGELOG.md](../../CHANGELOG.md) and in a new commit to the repository. Continued use after changes constitutes acceptance.

---

## 11. Governing Law and Disputes

These Terms are governed by the laws of the State of Texas, without regard to conflict-of-law principles. Any disputes shall be resolved in the courts of Bexar County, Texas.

---

## 12. Contact

Legal questions: legal@vpkdevs.com
General questions: https://github.com/VpkDevs/atlas/issues

---

*Atlas generates legal documents for your products. It is deeply ironic that it needs one itself. Here it is.*

---

# Privacy Policy Template

# Atlas Privacy Policy

**Effective date:** May 5, 2026
**Last updated:** May 5, 2026

---

## The Short Version

**Atlas does not collect, transmit, or store your data on any Atlas server.**

All data Atlas produces lives on your own machine at `~/.atlas/`. Atlas calls APIs using your own API keys from your own `.env` file. There are no Atlas servers in the loop during normal operation.

The only time Atlas-the-company receives any data from you is if you subscribe to a paid tier — at which point Stripe processes your payment, and we receive your email address and payment confirmation.

---

## 1. What Data Atlas Processes (Locally)

When you run `/atlas`, it processes the following on your local machine:

### 1.1 Your Codebase
Atlas reads your project files, including source code, configuration files, README and documentation files, `package.json` / `pyproject.toml` dependencies, git commit history and author metadata, and `.env` file **presence** (to know which API keys exist — never the values themselves).

This data is processed in memory during your Claude Code session. It is passed to Anthropic's Claude API as part of the conversation context. Anthropic's Privacy Policy governs how Claude processes conversation data.

### 1.2 Runtime State at `~/.atlas/`
Atlas writes the following files to your local filesystem:

| File | Contents | Sensitivity |
|------|----------|-------------|
| `context.json` | Project metadata, phase status, sovereign score | Low |
| `credentials_index.json` | Boolean map of which API keys exist (never values) | Low |
| `mission.json` | Active strategy objective | Low |
| `growth_log.md` | Log of actions taken and outcomes | Low-Medium |
| `decisions.md` | Decision rationale log | Low |
| `incidents/` | Tool failure logs | Low |
| `founder-profile.json` | Your stated goals, location, team size | Medium |
| `memory.md` | Cross-project learnings | Low |

None of this data is transmitted to any Atlas server. It stays on your machine.

### 1.3 What Atlas Passes to Third-Party Services
Atlas calls third-party APIs on your behalf using your own credentials. The data sent to each service is determined by that service's purpose:

| Service | Data sent | Their Privacy Policy |
|---------|-----------|---------------------|
| Anthropic (Claude) | Your codebase, conversation context | [anthropic.com/privacy](https://www.anthropic.com/privacy) |
| Vercel / Railway / Fly | Your source code (for deployment) | Per platform |
| Stripe | Payment config (no personal data from users) | [stripe.com/privacy](https://stripe.com/privacy) |
| Resend / SendGrid | Email content + recipient addresses you provide | Per platform |
| Buffer / Typefully | Social post content you approve | Per platform |
| Sentry | Error logs from your deployed product | [sentry.io/privacy](https://sentry.io/privacy) |
| PostHog / Plausible | Analytics from your deployed product's users | Per platform |
| GitHub | Your code (for repo creation/CI) | [docs.github.com/privacy](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement) |

You control which services Atlas connects to. If a service's API key is not in your `.env`, Atlas does not contact that service.

---

## 2. What Atlas-the-Company Collects (Paid Tier Only)

If you subscribe to a paid tier:

**We collect:**
- Email address (for account management and receipts)
- Payment confirmation from Stripe (we do not see or store your card number)
- Usage metadata (which tier you're on, subscription status)

**We do not collect:**
- Your codebase
- Your `.env` file or API keys
- Your `~/.atlas/` runtime state
- Content Atlas generates for your projects

**We use your email to:**
- Send receipts and billing notifications
- Send product updates (you can unsubscribe at any time)
- Respond to support requests

We do not sell your email address. We do not share it with third parties except as required by law or to process your payment (Stripe).

---

## 3. Children

Atlas is a developer tool. It is not directed at anyone under 13. If you are under 13, do not use Atlas.

---

## 4. Data Retention

**Local data (`~/.atlas/`):** Under your control. Delete the directory at any time.

**Paid tier account data:** Retained for the duration of your subscription and for 90 days after cancellation (for dispute resolution), then deleted on request.

To request deletion of your account data: email legal@vpkdevs.com with the subject "Data deletion request."

---

## 5. Your Rights

Depending on your location:

**Texas (and US generally):** You may request access to or deletion of personal data we hold about you.

**EU/EEA (GDPR):** You have rights of access, rectification, erasure, portability, and objection. Atlas-the-company does not currently have EU operations — if you are an EU resident using the paid tier, contact us to exercise your rights.

**California (CCPA):** You have the right to know what data we collect, to delete it, and to opt out of sale (we do not sell data).

To exercise any of these rights: legal@vpkdevs.com

---

## 6. Security

**Local data:** Secured by your machine's own access controls. We have no access to it.

**Paid tier account data:** Stored with industry-standard encryption. Payment data handled entirely by Stripe (PCI-DSS compliant).

If you discover a security vulnerability in Atlas: please report it via GitHub's Security Advisory feature at https://github.com/VpkDevs/atlas/security/advisories/new

---

## 7. Changes to This Policy

Material changes will be committed to this repository with a note in CHANGELOG.md. If you are a paid subscriber, we will notify you by email.

---

## 8. Contact

Privacy questions: legal@vpkdevs.com
GitHub: https://github.com/VpkDevs/atlas

---

# Compliance Checklist

# Atlas Compliance Checklist

**Last reviewed:** May 5, 2026
**Jurisdiction:** Texas, United States (primary); US federal; EU (secondary, paid tier)

Confidence levels: ✅ High (standard, well-established) | ⚠️ Medium (review before relying) | ❌ Low (consult a lawyer)

---

## Current Status

### Documents in Place
- [x] Terms of Service — `docs/legal/TERMS_OF_SERVICE.md`
- [x] Privacy Policy — `docs/legal/PRIVACY_POLICY.md`
- [ ] Cookie Policy — N/A (no website yet; needed before landing page)
- [ ] Data Processing Agreement — Needed if EU paid customers exist

### Served Routes (needed before landing page launch)
- [ ] `/terms` → renders TERMS_OF_SERVICE.md
- [ ] `/privacy` → renders PRIVACY_POLICY.md
- [ ] `/security` → vulnerability disclosure info

---

## US Federal Requirements

### CAN-SPAM (Email Marketing)
✅ **Applicable** when Atlas sends marketing emails on your behalf or when Atlas-the-product sends newsletters.

Required:
- [x] ToS prohibits deceptive subject lines — covered in Section 5
- [ ] Unsubscribe mechanism in all marketing emails (implement when email list exists)
- [ ] Physical mailing address in email footers — needed: San Antonio, TX address

### FTC Disclosure Requirements
⚠️ **Applicable** to Atlas-generated marketing content, testimonials, affiliate relationships.

Required:
- [x] ToS prohibits fake testimonials — Section 5
- [ ] If Atlas posts sponsored content, disclosures must be added to generated posts
- [ ] If affiliate links are ever generated, disclose in the content

### CFAA (Computer Fraud and Abuse Act)
✅ **Applicable** to Atlas's automated browser operations.

Assessment: Atlas only accesses platforms using credentials the user owns and has authorized. Low risk. Section 4 of ToS places responsibility on user for platform compliance.

---

## Texas State Requirements

### Texas Business & Commerce Code
✅ **Standard** for software ToS operating under Texas law.

- [x] Governing law clause — Section 11 of ToS
- [x] Jurisdiction — Bexar County courts — Section 11 of ToS

### Texas LLC / Business Entity
- [ ] **Action required:** Form Texas LLC for VpkDevs to operate paid tier
  - URL: https://www.sos.state.tx.us/corp/forms_boc.shtml
  - Filing fee: ~$300
  - Estimated time: 5-7 business days
  - No registered agent required (you can be your own)
  - Note: Texas has no state income tax — favorable for software revenue
- [ ] Registered agent address established
- [ ] EIN obtained from IRS (free, online, 5 minutes): https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online

---

## EU / GDPR (Applies if EU users subscribe to paid tier)

⚠️ **Partially applicable now** — free tier users may be EU residents; paid tier will definitely have EU users.

### GDPR Minimum Requirements Before EU Paid Launch
- [x] Privacy Policy covers EU rights — Section 5 of Privacy Policy
- [ ] **Legal basis for processing** must be specified (consent, contract, legitimate interest)
  - For paid tier: contract basis is appropriate
  - For analytics: legitimate interest or consent
- [ ] **Data Processing Agreements (DPAs)** needed with sub-processors if any EU personal data flows through them
  - Stripe: has a DPA — execute it at https://stripe.com/legal/dpa
  - GitHub: has a DPA
  - Others: check before onboarding EU paid customers
- [ ] **Cookie consent banner** — needed before landing page if analytics cookies used
- [ ] **Right to erasure endpoint** — outlined in Privacy Policy; mechanism to be built when user accounts exist
- [ ] Consider appointing an EU representative (required if > 250 employees OR processing EU data at scale — not required yet)

Confidence: ⚠️ Medium — GDPR compliance for a small SaaS is manageable but consult a lawyer before actively marketing to EU customers.

---

## California / CCPA

⚠️ **Applicable** if California residents subscribe to paid tier or use the product.

- [x] CCPA rights mentioned in Privacy Policy — Section 5
- [ ] "Do Not Sell My Personal Information" link — needed on landing page before California marketing
- [ ] Privacy Policy must list categories of data collected — ✅ done in Section 1-2

CCPA only requires full compliance machinery (opt-out link, etc.) if annual gross revenue > $25M OR data of > 100K consumers. Atlas is below both thresholds initially, but the Privacy Policy covers the basics.

---

## Product Category Specific

### Automated Posting / Bot Activity
⚠️ **Relevant** — Atlas posts to Twitter, LinkedIn, Reddit, Product Hunt on user's behalf.

- [x] ToS places responsibility on user — Section 4.3
- [ ] Rate limiting per-platform must be respected in code (implement in marketing-playbook execution)
- [ ] Disclosure that content is AI-assisted may be required on some platforms (Twitter policies, FTC guidance)

### AI-Generated Legal Documents
⚠️ **Relevant** — Atlas writes ToS and Privacy Policies for users' products.

- [x] ToS explicitly states these are not reviewed by an attorney — Section 4.2
- [x] ToS states Atlas does not constitute legal advice — Section 2
- Confidence: ✅ High — disclaimer is clear and explicit

### Financial Advice
⚠️ **Relevant** — Atlas makes business entity recommendations, tax calendar suggestions.

- [x] ToS disclaims financial and legal advice — Section 2
- Confidence: ✅ High — standard disclaimer coverage

---

## Ongoing Obligations

| Obligation | Frequency | Owner | Due |
|-----------|-----------|-------|-----|
| Review Privacy Policy for accuracy | Annually + when data practices change | Vince | May 2027 |
| Review ToS for new feature coverage | Quarterly | Vince | Aug 2026 |
| Stripe DPA execution (if EU customers) | One-time | Vince | Before first EU paid customer |
| Texas LLC annual report | Annually | Vince | Per LLC formation date |
| Texas franchise tax report | Annually (if revenue > $2.47M, otherwise No Tax Due) | Vince | May 15 each year |
| GDPR data deletion request response | Within 30 days of request | Atlas / Vince | Ongoing |
| CCPA opt-out response | Within 45 days | Atlas / Vince | Ongoing |

---

## Lawyer Review Flags

These items should be reviewed by a licensed attorney before the paid tier launches:

1. ❌ **Limitation of liability clause** — standard software ToS language but jurisdiction-specific enforceability varies
2. ❌ **GDPR adequacy** — if actively marketing to EU residents, a brief GDPR compliance review is worth the cost (~$500-1500 for a startup attorney)
3. ❌ **AI-generated content liability** — the space is evolving; the FTC has been active on AI disclosure requirements
4. ❌ **Automated social posting disclosures** — platform-specific requirements are changing; worth a review before a large-scale launch

---

*Confidence model: ✅ High = standard boilerplate, well-established | ⚠️ Medium = common but jurisdiction-dependent, review before relying | ❌ Low = have a lawyer look at this*

