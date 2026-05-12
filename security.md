---
name: atlas-security
description: Use during Atlas Phase 2b — runs immediately after Code Sprint, before Legal. Security hardening pass: OWASP Top 10 audit, secrets scanning, dependency vulnerability check, rate limiting verification, auth hardening, security headers, and CSP. Atlas fixes what it can commit directly; surfaces everything else as prioritized userMust items. Does not complete with any HIGH or CRITICAL vulnerabilities unaddressed.
---

# Atlas Security — Phase 2b

**Input:** Deployed codebase + live production URL
**Purpose:** Ensure the product cannot be trivially exploited before it goes public. Security gaps discovered post-launch are catastrophic — pre-launch they cost hours.

**The Security Doctrine:**

Atlas does not produce a security audit report for the founder to read later. Atlas fixes what it can, commits the fixes, and surfaces everything else as precisely scoped `userMust` items ordered by severity.

If Atlas finds a CRITICAL vulnerability, it fixes it before proceeding. If it cannot fix it, Phase 2b does not complete and Phase 3 (Legal) is blocked.

---

## Step 1: Secrets Scan (Run First — Fastest Highest-Impact Check)

### Check git history for committed secrets
```bash
# Check for common secret patterns in git history
git log --all --full-history -p | grep -E \
  "(sk_live_|pk_live_|sk_test_|AKIA[0-9A-Z]{16}|ghp_|github_pat_|xoxb-|xoxp-|AIza|ya29\.|-----BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY)" \
  | head -20
```

If ANY match found:
1. Classify severity: CRITICAL if production key, HIGH if test key
2. The committed secret is permanently in history — rotation is mandatory
3. Surface userMust: exact URL to rotate the key + "your git history contains this key; rotation is required even after deletion from code"
4. Add detected variable name to `.gitignore` immediately

### Check current working tree
```bash
# Scan for hardcoded secrets in source (not git history)
grep -rn \
  -E "(password|secret|api_key|apikey|access_token|auth_token)\s*=\s*['\"][^'\"]{8,}['\"]" \
  --include="*.ts" --include="*.js" --include="*.py" --include="*.env" \
  src/ app/ lib/ utils/ 2>/dev/null | grep -v ".env.example" | grep -v "test\|spec\|mock"
```

Any hardcoded secret in source = CRITICAL. Extract to environment variable, commit the change.

### Verify .gitignore
```bash
# Ensure .env, .env.local, *.pem, *.key are ignored
grep -E "^\.env|\.env\.local|\.env\.[a-z]|\.pem|\.key" .gitignore || \
  echo "# Secrets\n.env\n.env.local\n.env.*.local\n*.pem\n*.key" >> .gitignore
```

---

## Step 2: Dependency Vulnerability Audit

### Node.js projects
```bash
npm audit --audit-level=high --json 2>/dev/null | \
  jq '{critical: .metadata.vulnerabilities.critical, high: .metadata.vulnerabilities.high, moderate: .metadata.vulnerabilities.moderate}'
```

If critical > 0: run `npm audit fix` — commit result.
If critical remain after fix: report each with CVE + manual remediation path.
If high > 0: run `npm audit fix` — commit result. Surface remaining as ⚠️ warning.

### Python projects
```bash
pip install safety --quiet && safety check --output json 2>/dev/null | \
  python3 -c "import sys,json; data=json.load(sys.stdin); [print(v[4], v[3]) for v in data.get('vulnerabilities',[])]"
```

### All projects
Check for packages with known RCE (Remote Code Execution) CVEs from the last 12 months:
```bash
# Check package age — extremely old packages with no updates are risk indicators
npm list --depth=0 --json 2>/dev/null | jq '.dependencies | to_entries[] | .key' | \
  xargs -I {} sh -c 'npm view {} time.modified 2>/dev/null | head -1'
```

---

## Step 3: OWASP Top 10 Audit

For each item, check the codebase and rate: ✅ Mitigated | ⚠️ Partial | ❌ Vulnerable

### A01: Broken Access Control
```
Checks:
- Are all authenticated routes behind middleware? Grep for route definitions, verify auth middleware applied.
- Are there insecure direct object references? Check if `/api/users/:id` validates the requesting user owns that ID.
- Does the API have a "default deny" posture? Check if undefined routes return 403 vs. 200.
- Is admin functionality separated from user functionality?

Auto-fix if vulnerable:
  - Add route-level auth middleware to unprotected authenticated endpoints
  - Add ownership check to direct object reference endpoints
```

### A02: Cryptographic Failures
```
Checks:
- Is sensitive data transmitted only over HTTPS? (Check deployment config for HTTP redirect)
- Are passwords hashed with bcrypt/argon2/scrypt? (NOT MD5, SHA1, or plain)
- Is session data encrypted? (Check session config)
- Are JWTs using HS256 with a strong secret (not hardcoded)?

Auto-fix if vulnerable:
  - Add HTTPS redirect middleware if missing
  - Flag password hashing algorithm if using weak hash
  - Add secure session configuration
```

### A03: Injection
```
Checks (SQL injection):
- Are raw SQL queries constructed with string concatenation? (grep for template literals in DB calls)
- Are all DB interactions using parameterized queries or ORM?

Checks (XSS):
- Is user-generated content rendered as innerHTML anywhere?
- Is dangerous HTML output sanitized before rendering?

Auto-fix if vulnerable:
  - Flag raw SQL construction — provide parameterized query equivalent
  - Add DOMPurify or equivalent if innerHTML usage found
```

### A04: Insecure Design
```
Checks:
- Does the password reset flow use time-limited tokens?
- Is there a rate limit on authentication endpoints?
- Can users enumerate other users via error messages ("email not found" vs "invalid credentials")?

Auto-fix if vulnerable:
  - Normalize auth error messages to prevent enumeration
  - Add rate limiting to /login, /signup, /forgot-password (see A05)
```

### A05: Security Misconfiguration (High Atlas Impact — Most Fixable)
```
Checks + Auto-Fixes:

Security Headers (commit these if missing):
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: [generated based on detected CDNs + inline scripts]

For Next.js — add to next.config.js:
  headers: () => [{ source: '/(.*)', headers: [...] }]

For Express — add helmet:
  import helmet from 'helmet'; app.use(helmet());

Verify error messages don't leak stack traces in production:
  - Check if NODE_ENV=production suppresses stack traces
  - Check if error handlers return generic messages vs. internal errors
```

### A06: Vulnerable and Outdated Components
```
Already covered in Step 2. Cross-reference here.
```

### A07: Identification and Authentication Failures
```
Checks:
- Is there brute-force protection on login? (rate limiting, lockout, CAPTCHA)
- Are session tokens invalidated on logout?
- Are "remember me" tokens stored securely (HttpOnly, Secure, SameSite cookies)?
- Is MFA available for high-privilege accounts?

Auto-fix if vulnerable:
  - Add rate-limit middleware to authentication endpoints
  - Verify cookie flags if session management is custom
```

### A08: Software and Data Integrity Failures
```
Checks:
- Are npm packages pinned to exact versions or use lockfile?
- Is CI/CD pipeline protected (branch protection, required reviews)?
- Are GitHub Actions using specific SHA versions, not @main?

Auto-fix if vulnerable:
  - Add lockfile if missing (npm ci vs npm install)
  - Update GitHub Actions to use SHA-pinned versions
```

### A09: Security Logging and Monitoring Failures
```
Checks:
- Are failed authentication attempts logged?
- Are high-privilege operations (admin actions, payment events) logged?
- Are logs stored somewhere other than the application server?

Auto-fix if vulnerable:
  - Add authentication event logging middleware
  - Verify Sentry captures auth failures (not just unhandled errors)
```

### A10: Server-Side Request Forgery (SSRF)
```
Checks (only relevant if product fetches user-provided URLs):
- Does any endpoint accept a URL and make a server-side HTTP request?
- Is that URL validated against an allowlist?

Auto-fix if vulnerable:
  - Add URL validation function that rejects private IP ranges (10.x, 172.16.x, 192.168.x, 127.x)
```

---

## Step 4: Rate Limiting Verification

**Every public endpoint that could be abused needs rate limiting.**

Priority endpoints:
```
/api/auth/*           → 10 requests/min per IP
/api/signup           → 5 requests/min per IP  
/api/forgot-password  → 3 requests/min per IP
/api/contact          → 5 requests/min per IP
/api/*                → 100 requests/min per IP (general API)
```

If using Express/Next.js API routes — commit `upstash/ratelimit` or `express-rate-limit`:
```typescript
// For Next.js API routes
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});
```

If no Redis available: use in-memory rate limiting with `express-rate-limit` (less effective but better than nothing).

Flag `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` as needed env vars if not present.

---

## Step 5: Content Security Policy Generation

Generate a CSP tailored to the detected stack:

```
Base CSP (safe defaults):
  default-src 'self';
  script-src 'self' [detected CDN domains];
  style-src 'self' 'unsafe-inline' [detected font CDNs];
  img-src 'self' data: [detected image CDNs];
  connect-src 'self' [detected API domains];
  font-src 'self' [detected font CDNs];
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

Detect CDN domains from:
- `package.json` (Google Fonts, Cloudflare, Stripe.js, Segment, PostHog)
- `next.config.js` / `vite.config.js` external domains
- HTML templates for `<script src>` references

Commit the CSP as part of the security headers update.

---

## Step 6: Environment Variable Security Audit

```bash
# List all env vars the app uses
grep -rn "process\.env\." src/ app/ | grep -oP "process\.env\.\K[A-Z_]+" | sort -u

# Compare to .env.example
diff <(grep -oP "^[A-Z_]+" .env.example | sort) <(grep -rn "process\.env\." src/ app/ | grep -oP "process\.env\.\K[A-Z_]+" | sort -u)
```

For each env var referenced in code but NOT in `.env.example`:
1. Add it to `.env.example` with a description
2. Check if it's missing from the production environment (surfaces as a deployment risk)

For env vars in `.env.example` but NOT referenced in code:
1. Flag as dead variable — remove from `.env.example` (reduces attack surface)

---

## Step 7: Security Score & Severity Matrix

After completing all checks, produce:

```
SECURITY AUDIT — [Product Name] — [Date]

CRITICAL (block launch):
  ❌ [issue] — [file:line] — Fix: [specific command or code change]

HIGH (fix before public traffic):
  ⚠️ [issue] — [file:line] — Fix: [specific]

MEDIUM (fix before $1K MRR):
  ⚠️ [issue] — [note]

LOW (fix when convenient):
  ℹ️ [issue] — [note]

Fixed in this run:
  ✅ [fix] — committed in [commit hash]
  ✅ [fix] — committed in [commit hash]

Security posture: [Poor / Fair / Good / Strong]
OWASP coverage: [N]/10 categories addressed
```

**Gate rule:**
- CRITICAL remaining → Phase 2b does not complete → Phase 3 blocked → invoke `p0_response()` from `incident-protocol.md`
- HIGH remaining → open a P1 incident in `~/.atlas/incidents/` (see `incident-protocol.md`) + surface as userMust
- MEDIUM/LOW → surfaced in compliance checklist; log as P3 incident for tracking

---

## Output
- Git commit + push to remote

- All auto-fixable issues committed
- `.gitignore` updated
- Security headers committed to framework config
- Rate limiting middleware committed (or userMust if Redis key needed)
- CSP committed
- `docs/legal/SECURITY.md` — vulnerability disclosure policy
- `docs/founder/SECURITY_AUDIT.md` — full audit results with remediation status
- Git commit + push

---

## Acceptance Test

- [ ] `git log --all -p | grep -E "(sk_live_|AKIA|ghp_)" | wc -l` returns 0
- [ ] `npm audit --audit-level=critical` returns 0 critical vulnerabilities
- [ ] Security headers present: `curl -I <prod_url>` shows `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`
- [ ] Rate limiting on `/api/auth/*` confirmed (test: 11 rapid requests → 429 on 11th)
- [ ] SECURITY.md committed
- [ ] 0 CRITICAL issues remaining

---

## Checkpoint

```
─────────────────────────────────────────────────────
SECURITY HARDENING COMPLETE

Atlas did:
  ✓ Secrets scan: [N secrets found / clean]
  ✓ Dependency audit: [N critical / N high fixed]
  ✓ OWASP A01-A10: [N/10 mitigated, N partial, N flagged]
  ✓ Security headers committed (HSTS, CSP, X-Frame, X-Content-Type)
  ✓ Rate limiting: [committed / userMust logged]
  ✓ CSP generated and committed
  ✓ SECURITY.md committed

Security posture: [Poor / Fair / Good / Strong]

CRITICAL remaining: [N — Phase 3 blocked until resolved]
HIGH remaining (non-blocking): [N — see SECURITY_AUDIT.md]

Sovereign Score: [X] → [Y]

[If 0 CRITICAL:]
── PROCEEDING TO PHASE 3: LEGAL ─────────────────────

[If CRITICAL > 0:]
❌ BLOCKED: [N] critical vulnerabilities must be resolved.
[List each with specific fix]
Type 'atlas fix 2b' after resolving to re-run security check.
─────────────────────────────────────────────────────
```

## Red Flags

- ❌ Proceeding to Phase 3 with any CRITICAL vulnerability
- ❌ Running a security scan and not fixing what Atlas can fix directly
- ❌ Writing a security report instead of committing security fixes
- ❌ Not scanning git history — only scanning working tree
- ❌ Skipping dependency audit because "we just installed these"
- ❌ Not committing security headers because "the framework handles this"
- ❌ Generic CSP (`default-src *`) — must be tailored to detected stack
- ❌ Marking issue as fixed without verifying the fix works
