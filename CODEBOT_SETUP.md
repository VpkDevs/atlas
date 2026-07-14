# Code Review Bot Setup Guide

## Status

✅ **Automated (Done)**
- GitHub Actions workflows deployed
- CodeQL security scanning enabled
- Secret detection (TruffleHog) enabled
- JavaScript linting enabled
- Frontmatter validation enabled
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
     - Status checks:
       - `Validate Atlas`
       - `Analyze with CodeQL`
       - `Check Dependencies`
       - `Lint JavaScript`
       - `Secrets & Security Scan`

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

### Validate Atlas
- **Runs on:** Every push to master, every PR
- **Checks:**
  - 110+ schema coherence checks
  - Doctor diagnostic pass
  - Version consistency (package.json ↔ CHARTER.md ↔ VERSION.md)
  - File inventory validation

### CodeQL Security Scanning
- **Runs on:** Every push, every PR, weekly
- **Detects:**
  - Security vulnerabilities
  - Code patterns
  - TypeScript/JavaScript issues

### Secrets Detection (TruffleHog)
- **Runs on:** Every push, every PR
- **Detects:**
  - API keys, tokens, credentials
  - Common secret patterns
  - High-entropy strings

### Lint & Syntax Check
- **Runs on:** Every PR
- **Checks:**
  - JavaScript syntax validity
  - Leftover `console.log` statements
  - Markdown frontmatter completeness

### File Count Monitoring
- **Runs on:** Every PR
- **Reports:**
  - Total file count in `skills/atlas`
  - Warning if exceeding 100 files
  - Inline comment on PR

### PR Review Checklist
- **Runs on:** Every PR created
- **Posts:**
  - Automated checklist comment
  - Schema validation checklist
  - Security checklist
  - Documentation checklist
  - File hygiene checklist
  - Testing checklist

---

## 4. Manual Checks (Before Merge)

Even with all automation, manually verify:

```bash
# In your worktree
cd skills/atlas

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

## 8. Next: Update PR #4

The workflows are now live. Push the `CODEBOT_SETUP.md` file and update PR #4 with a note about the automation setup.

```bash
git add CODEBOT_SETUP.md
git commit -m "docs: code review bot setup guide"
git push origin claude/v0-9-1-reminders-metadata-20b1b8
```

Then visit PR #4 and add a comment:
> 🤖 **Automation enabled!** All GitHub Actions workflows are now live. CodeQL, secret scanning, linting, and validation run on every PR. See [CODEBOT_SETUP.md](CODEBOT_SETUP.md) for next steps (third-party bots: DeepSource, Snyk, GitGuardian).
