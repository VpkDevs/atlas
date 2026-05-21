---
name: atlas-automation-library
description: Importable workflow templates for n8n. Each file is a complete n8n workflow JSON ready to import at app.n8n.cloud or your self-hosted instance. Replace [PLACEHOLDER] values with your actual credentials before importing.
---

# Atlas Automation Library

Importable n8n workflow templates. Each `.json` file can be imported directly into n8n.

## How to Import

1. Open your n8n instance (app.n8n.cloud or self-hosted)
2. Go to Workflows → Import from file
3. Select the `.json` file
4. Replace all `[PLACEHOLDER]` values with your actual credentials
5. Activate the workflow

## Templates

| File | Purpose | Trigger |
|------|---------|---------|
| `new-customer-onboarding.json` | Signup → welcome email → activation check → Slack notification | Stripe webhook: `customer.subscription.created` |
| `churn-detection.json` | Usage drop detected → at-risk email → escalation if no response | Scheduled: daily |

Additional templates should be added here only after the matching `.json` file exists.

## Placeholder Reference

Before importing, replace these values:

```
[STRIPE_WEBHOOK_SECRET]   — from Stripe Dashboard > Webhooks
[RESEND_API_KEY]          — from resend.com/api-keys
[SLACK_WEBHOOK_URL]       — from Slack > Incoming Webhooks
[POSTHOG_API_KEY]         — from PostHog > Settings > API Keys
[FOUNDER_EMAIL]           — your email address
[PRODUCT_NAME]            — your product's name
[PRODUCT_URL]             — your production URL
```
