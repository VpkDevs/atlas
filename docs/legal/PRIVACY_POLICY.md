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
