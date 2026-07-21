# Code Review Bot Setup Guide

## Status

✅ **Automated (Done)**
- GitHub Actions workflows deployed
- CodeQL security scanning enabled (has not completed a successful run yet — see Troubleshooting)
- Secret detection (TruffleHog) enabled
- JavaScript linting enabled
- Frontmatter checked as part of schema validation (`node scripts/validate.js`) — there is no separate frontmatter job
- PR review checklist automated

🔧 **Manual Setup Required (Below)**
- Branch protection rules
- Third-party integrations (DeepSource, Snyk, GitGuardian)

---

## 1. GitHub Branch Protection (Manual Setup)

**Enable on master branch:**

1. Go to [Settings → Branches → master](https://github.com/VpkDevs/atlas/settings/branches)
2. Click **Add rule** (if no rule exists) or **Edit**
3. Configure:

   - ✅ **Require a pull request before merging**
     - Require approvals: 1
     - Dismiss stale reviews: ✓
     - Require review from code owners: (optional)

   - ✅ **Require status checks to pass**
     - Require branches to be up to date: ✓
     - Status checks (these are the real job names GitHub exposes — "Validate
       Atlas" is only the workflow's file-level name and is never itself a
       selectable check; each check only appears in the picker after it has
       run at least once):
       - `Schema & Coherence Validation`
       - `Secrets & Security Scan`
       - `Lint JavaScript`
       - `Monitor File Count`
       - `Analyze with CodeQL`
       - `Check Dependencies`

   - ✅ **Additional settings**
     - Restrict who can push: (optional)
     - Allow force pushes: ✗
     - Allow deletions: ✗
     - Require signed commits: (optional)
     - Require conversation resolution: ✓

4. Click **Save changes**

---

## 2. Third-Party Code Review Bots

### DeepSource (Code Quality)
**Why:** Identifies duplication, complexity, anti-patterns, documentation gaps

1. Visit: https://deepsource.io/signup
2. Sign in with GitHub
3. Select repository: `VpkDevs/atlas`
4. Enable **JavaScript** analyzer (default)
5. DeepSource will:
   - Comment on every PR with issues
   - Suggest refactors and improvements
   - Track code quality trends

**Setup time:** 2 minutes | **Cost:** Free for public repos

---

### Snyk (Vulnerability Scanning)
**Why:** Continuous dependency scanning, automated security fixes

1. Visit: https://app.snyk.io/signup
2. Sign in with GitHub
3. Import project: `VpkDevs/atlas`
4. Snyk will:
   - Scan `package.json` and lock files
   - Flag vulnerable dependencies
   - Create auto-fix PRs
   - Monitor for new CVEs

**Setup time:** 2 minutes | **Cost:** Free for open source

---

### GitGuardian (Secrets Management)
**Why:** Advanced secret detection, policy enforcement, remediation automation

1. Visit: https://dashboard.gitguardian.com
2. Sign in with GitHub
3. Add repository: `VpkDevs/atlas`
4. Configure:
   - Monitor commits in real-time
   - Detect leaked API keys, tokens, credentials
   - Alert on violations
   - Suggest remediation

**Setup time:** 3 minutes | **Cost:** Free tier includes basic scanning

**Note:** We already had to remove Supabase secrets earlier — GitGuardian would have caught those automatically.

---

### CodeFactor (Code Quality Dashboard)
**Why:** Simple, visual code quality tracking; PRs show delta

1. Visit: https://www.codefactor.io/
2. Sign in with GitHub
3. Add repository: `VpkDevs/atlas`
4. CodeFactor will:
   - Grade overall code quality (A–F)
   - Show quality delta on every PR
   - Flag problematic files
   - Provide actionable feedback

**Setup time:** 2 minutes | **Cost:** Free for public repos

---

## 3. GitHub Actions Workflows (Already Enabled)

### Validate Atlas (workflow file: `validate.yml`)
- **Runs on:** pushes to `master`/`main` that touch `skills/atlas/**` (or the
  workflow file itself), and pull requests targeting those branches that touch
  `skills/atlas/**`. A PR that only changes root-level docs like this file
  will **not** trigger it.
- **Jobs:**
  - `Schema & Coherence Validation` — runs `node scripts/validate.js` (98
    checks as of this writing — verify with your own run rather than trusting
    a number in this doc, since it will drift as checks are added) and
    `node scripts/atlas/doctor.js`. Frontmatter is checked here, not by a
    separate job.
  - `Secrets & Security Scan` — TruffleHog (PR events only) plus a grep for
    hardcoded GitHub tokens.
  - `Lint JavaScript` — `node --check` on every `.js` file under
    `scripts/` and `tests/`.
  - `Monitor File Count` — warns (does not fail) if `skills/atlas` exceeds
    100 files, and comments the count on the PR.

### CodeQL Security Scanning (workflow file: `codeql.yml`)
- **Runs on:** pushes to `master`/`main`, pull requests targeting those
  branches, and weekly on a schedule. Not triggered by feature-branch pushes
  or PRs against other branches.
- **Jobs:**
  - `Analyze with CodeQL` — security-and-quality query suite.
  - `Check Dependencies` — `npm ci --dry-run` plus `npm audit --audit-level=high`.

### PR Review Checklist (workflow file: `pr-comment.yml`)
- **Runs on:** every PR, on open only (not on later pushes to the same PR).
- **Posts:** one comment with a static checklist (schema, security,
  documentation, hygiene) — it does not evaluate anything itself, it's a
  reminder for the human reviewer.

---

## 4. Manual Checks (Before Merge)

Even with all automation, manually verify:

```bash
# In your worktree
cd skills/atlas

# Install dependencies first — the commands below fail on a fresh
# checkout without this
npm ci

# Validate schema
node scripts/validate.js

# Run doctor
node scripts/atlas/doctor.js

# Check for secrets locally
grep -r "gho_\|ghp_\|sk_\|OPENAI_API_KEY" . 2>/dev/null || echo "✅ No obvious secrets"

# Check file count
find . -type f | wc -l

# Test any new scripts
node scripts/atlas/cli.js --help
```

---

## 5. Quick Reference: Which Bot Does What?

| Bot | Scope | Cost | Setup |
|---|---|---|---|
| **GitHub Actions** | Schema, secrets, lint | Free | ✅ Done |
| **CodeQL** | Security vulnerabilities | Free | ✅ Done |
| **DeepSource** | Code quality, duplication | Free* | 2 min |
| **Snyk** | Dependency vulnerabilities | Free* | 2 min |
| **GitGuardian** | Secrets, credentials | Free* | 3 min |
| **CodeFactor** | Quality dashboard | Free* | 2 min |
| **Branch Protection** | Enforce status checks | Free | Manual |

_*Free for public repos; paid tiers for private repos_

---

## 6. Recommended Setup Order

1. ✅ **Merge the PR** with GitHub Actions + CodeQL workflows
2. **Branch Protection** (Settings → Branches → master) — 5 minutes
3. **DeepSource** — 2 minutes (most useful for quality)
4. **Snyk** — 2 minutes (catches dependency issues)
5. **GitGuardian** — 3 minutes (prevents secrets leakage)
6. **CodeFactor** — 2 minutes (visual quality trend)

**Total setup:** ~15 minutes for all automation.

---

## 7. Troubleshooting

**Q: Workflows not running?**
A: Check `.github/workflows/` files are committed. Push again. Workflows trigger on next commit.

**Q: "Status check missing" on branch protection?**
A: Wait for first PR to run workflows. Status check contexts appear after first run.

**Q: Third-party bot not showing?**
A: Verify you're signed in with the GitHub account that owns the repo. Re-authorize if needed.

**Q: Too many comments/notifications?**
A: Adjust workflow conditions in `.github/workflows/` or bot settings to run only on PRs (not pushes).

---

## 8. After Setup

Once the workflows are live and you've walked through sections 1–2 above, a
good habit for future PRs: link this file in the PR description so reviewers
know automation is expected to run, e.g. "See CODEBOT_SETUP.md for what's
automated on this repo."
