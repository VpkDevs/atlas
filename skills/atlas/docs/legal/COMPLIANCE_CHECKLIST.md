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
