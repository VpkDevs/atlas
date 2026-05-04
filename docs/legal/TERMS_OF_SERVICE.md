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
