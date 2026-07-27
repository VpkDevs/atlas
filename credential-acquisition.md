---
name: atlas-credential-acquisition
description: Browser-assisted API key acquisition protocol for Atlas. Opens headed Chromium, pauses for user sign-in, resumes control, captures keys where possible, stores them in local env files or user environment variables, and updates credentials_index.json without storing secret values there.
---

# Atlas Credential Acquisition

**Input:** Missing env vars from `.env.example`, runtime checks, or provider integrations.
**Purpose:** Turn "get an API key" into a browser-assisted Atlas action.

## Rule

Atlas does not stop at "go get this key." It opens the provider page in a visible browser, lets the founder sign in, resumes control, captures the key where the page exposes it, stores it locally, updates `credentials_index.json`, and continues.

Secrets are never printed in full. `credentials_index.json` records existence, provider, storage location, and verification status, not secret values.

## Command

```bash
node scripts/atlas/cli.js credentials setup <project-slug> --providers core
```

Provider set:

```text
core = stripe,resend,sentry,betteruptime
all  = stripe,resend,sentry,betteruptime,posthog
```

Options:

```bash
--providers stripe,resend
--env-file C:\path\to\.env.local
--scope local   # writes local env file and marks current process env
--scope user    # also writes persistent user env where supported
```

## Browser Protocol

1. Launch Chromium headed (`headless: false`) with slow motion for visibility.
2. Navigate to the provider credential page.
3. Pause while the founder signs in, completes MFA, and creates/reveals the key.
4. Resume after the founder presses Enter in the terminal.
5. Attempt DOM extraction using provider-specific selectors and key patterns.
6. If extraction fails, prompt with a hidden password input.
7. Save to env storage and update `credentials_index.json`.
8. Move to the next provider automatically.

## Default Providers

| Provider | URL | Env vars |
|---|---|---|
| Stripe | `https://dashboard.stripe.com/apikeys` | `STRIPE_SECRET_KEY` |
| Resend | `https://resend.com/api-keys` | `RESEND_API_KEY` |
| Sentry | `https://sentry.io/settings/` | `SENTRY_AUTH_TOKEN`, `SENTRY_DSN` |
| Better Uptime | `https://uptime.betterstack.com/team/api-tokens` | `BETTER_UPTIME_API_KEY` |
| PostHog | `https://app.posthog.com/project/settings` | `POSTHOG_API_KEY`, `POSTHOG_PROJECT_ID` |

## Security Rules

- Do not commit `.env`, `.env.local`, or `~/.atlas/portfolio/*/.env`.
- Do not write raw secret values to logs, reports, markdown docs, screenshots, or `credentials_index.json`.
- Do not bypass MFA, captchas, identity checks, payment consent, or security prompts.
- If a provider shows a key only once, capture it immediately or fall back to hidden prompt.
- If the provider requires paid plan selection, destructive permission, or organization-wide access, pause with a `userMust`.

## Acceptance Test

- [ ] Missing provider env vars can be listed with `atlas credentials providers`.
- [ ] `atlas credentials setup <project>` opens a headed browser for each provider.
- [ ] Captured values are written to the selected env file.
- [ ] `credentials_index.json` records each captured key without storing the value.
- [ ] CLI output masks secret values.
