---
name: upgrade-guide
description: Migration guide for upgrading from v0.8.x or v0.9 to v0.9.1.
---

# Atlas Upgrade Guide (v0.9.1)

**If you have Atlas v0.9.0 or earlier**, this guide walks you through the upgrade. No breaking changes to the Iron Rule, Sovereign Score, 21-phase pipeline, or state layer — only additions and simplifications.

---

## What Changed in v0.9.1

### New Capabilities (Additive)

Three new modules are now part of the canonical tree:

| Module | When Loaded | Purpose |
|---|---|---|
| `user-interview-engine.md` | Phase 12+ (Revenue Intel) or continuously in Phase 13 (Growth) | Autonomous user feedback extraction via email API. Replace assumptions with direct evidence. |
| `penetration-tester.md` | Phase 2b (Security); `/atlas` routes to it automatically when security work is required | Authorized, non-destructive DAST (Dynamic Application Security Testing). OWASP Top 10 coverage before launch gates. |
| `deployment-engine.md` | Phase 9 (Launch) during platform detection | Deployment platform detection and execution protocol. Vercel, Heroku, Railway, Render, AWS, Cloudflare Workers. |

**Your existing projects are unaffected.** These modules load only when their phase is reached or when explicitly invoked.

### Command Surface Simplified (Breaking)

The `/atlas` command surface has been radically simplified. If you have scripts or integrations that invoke `/atlas growth`, `/atlas money`, etc., those commands no longer exist.

**Before (v0.9.0):**
```text
30+ commands: /atlas growth, /atlas money, /atlas pricing, /atlas offer, 
/atlas channels, /atlas sniper, /atlas governor, /atlas fix [phase], etc.
```

**After (v0.9.1):**
```text
4 canonical commands:
  /atlas                 Autonomously start, resume, recover, or operate
  /atlas status          Read-only progress summary
  /atlas pause           Safely pause autonomous work
  /atlas doctor          Read-only installation diagnostic
```

**Why:** Founders never select phases, domains, fleets, or dashboards manually. `/atlas` routes to the appropriate module autonomously based on state (context.json, live URL status, prior phase completion).

### State Layer (Backward Compatible)

No changes to the state layer schema. Existing `~/.atlas/portfolio/[slug]/` directories are fully compatible with v0.9.1.

Two new optional files in evidence doctrine (v0.9 introduced, still relevant):
- `~/.atlas/portfolio/[slug]/evidence.jsonl` — proof appended after every phase and delegated task
- `~/.atlas/portfolio/[slug]/heartbeat.json` — scheduled autonomous tick manifest

These are not required for v0.8.x projects to work; they are written by v0.9+ operations.

---

## Upgrade Path

Choose your path based on what you're running.

### Option A: In-Place Upgrade (Recommended)

**For:** You have Atlas v0.9.0 running and want to stay on the same branch/worktree.

```bash
# 1. Back up your current state
cp -r ~/.atlas ~/.atlas.backup.$(date +%s)

# 2. Update the canonical tree
cd /path/to/atlas/repo
git pull origin main

# 3. Validate the new tree
cd skills/atlas
node scripts/validate.js
# Expected: ✓ all checks pass

# 4. Verify doctor passes
node scripts/atlas/doctor.js
# Expected: Atlas Doctor: PASS

# 5. Propagate to your runtime target(s) — pulling the canonical repo does
#    NOT update ~/.claude/skills/atlas or ~/.agents/atlas by itself; per
#    CANONICAL_INSTALL.md these are separate copies, not a symlink.
rm -rf ~/.claude/skills/atlas
cp -r . ~/.claude/skills/atlas
# OR, if you run from .agents:
# rm -rf ~/.agents/atlas
# cp -r . ~/.agents/atlas

# 6. Verify the propagated copy, not just the canonical checkout
node ~/.claude/skills/atlas/scripts/atlas/doctor.js
# Expected: Atlas Doctor: PASS

# 7. Verify in Claude session
# Invoke /atlas doctor
# Expected: VERDICT: PASS, header includes "Atlas v0.9.1"
```

Once the propagation step (5) has run, your next `/atlas` invocation will use v0.9.1. Skipping it leaves Claude running the old skill even though the canonical repo is up to date.

---

### Option B: Clean Install (If Stuck)

**For:** Validation or doctor fails, or you want a completely clean state.

```bash
# 1. Back up your portfolio
cp -r ~/.atlas ~/.atlas.backup.$(date +%s)

# 2. Remove the old skill
rm -rf ~/.claude/skills/atlas
# OR (if using .agents)
rm -rf ~/.agents/atlas

# 3. Clone v0.9.1 canonical tree
git clone --depth 1 https://github.com/VpkDevs/atlas.git
cd atlas/skills/atlas

# 4. Validate
node scripts/validate.js

# 5. Install to your runtime — pick ONE target and verify that same one
cp -r . ~/.claude/skills/atlas
node ~/.claude/skills/atlas/scripts/atlas/doctor.js
# OR, if you run from .agents instead:
# cp -r . ~/.agents/atlas
# node ~/.agents/atlas/scripts/atlas/doctor.js
```

**Your portfolio state (`~/.atlas/`) is preserved.** When you invoke `/atlas` with the new skill, it will read your existing context.json and resume from where it left off.

---

### Option C: Parallel Install (Testing)

**For:** You want to test v0.9.1 without affecting your current v0.9.0 setup.

```bash
# 1. Clone v0.9.1 to a temporary location
git clone --depth 1 https://github.com/VpkDevs/atlas.git ~/atlas-v0.9.1-test

# 2. Create a parallel skill directory
mkdir -p ~/.claude/skills/atlas-v0.9.1-test
cp -r ~/atlas-v0.9.1-test/skills/atlas/* ~/.claude/skills/atlas-v0.9.1-test/

# 3. Test the new skill in a separate Claude session
# In Claude: /atlas-v0.9.1-test doctor
# (This invokes the new skill without affecting your current v0.9.0 setup)

# 4. When ready to promote
rm -rf ~/.claude/skills/atlas
mv ~/.claude/skills/atlas-v0.9.1-test ~/.claude/skills/atlas
```

---

## Breaking Changes to Account For

### 1. Command Surface Deprecated

If you have any automation, scripts, or integrations that call the old subcommands, update them:

| Old Command | New Equivalent |
|---|---|
| `/atlas growth` | `/atlas` (automatic routing in OPERATOR mode) |
| `/atlas money` | `/atlas` (automatic routing) |
| `/atlas pricing` | `/atlas` (automatic routing) |
| `/atlas offer` | `/atlas` (automatic routing) |
| `/atlas channels` | `/atlas` (automatic routing) |
| `/atlas fix [phase]` | `/atlas` (automatic RECOVERY mode detection) |
| `/atlas diag` | `/atlas doctor` |
| `/atlas fleet --agent [name]` | Not exposed; fleet dispatch is internal to `/atlas` |

**All operational logic is preserved.** Only the command names have changed. The phase execution, growth loop, scoring, and capital governance work exactly as before.

### 2. CLI Commands Changed

If you call `npm run` scripts or CLI commands directly:

```bash
# Old (v0.9.0)
npm run diagnose     # →  node scripts/atlas/doctor.js

# New (v0.9.1) — same script, just invoked differently
node scripts/atlas/doctor.js

# Dashboard access
# Old: /atlas dashboard
# New: `/atlas` invokes autonomously; check ~/.atlas/portfolio/[slug]/dashboard.json or /atlas status
```

### 3. No Manual Phase Selection

If you have a process that explicitly invokes `/atlas` with phase selection:

```bash
# Old: /atlas fix phase 5
```

v0.9.1 has no equivalent command. `/atlas` picks the mode automatically from state:
RESUME continues from the last incomplete phase; RECOVERY re-enters from Phase 2
when `live_url` stops returning 200. Neither lets you target an arbitrary phase.

**Do not delete `context.json` to force a specific phase to rerun.** That discards
all resume state and drops you into FIRST RUN — Atlas will redo Phases 0+ from
scratch, including anything with real external side effects (emails sent, API
calls made, accounts created).

If you genuinely need one already-completed phase to rerun — its output was
wrong and needs regenerating — edit only that phase's entry back to `pending`
in `~/.atlas/portfolio/[slug]/context.json` (the file has a `phases` object
keyed by phase number, each with a `status` field) and leave every other
phase's `status` untouched. That reruns the one phase without discarding the
rest. Back up the file first.

---

## Migration Checklist

### Before Upgrade

- [ ] Back up `~/.atlas/` (test restore once to verify)
- [ ] Verify your current version: `/atlas doctor` shows "v0.9.0" (or earlier)
- [ ] List any automation or scripts that invoke `/atlas` subcommands (will need updating)
- [ ] Confirm no uncommitted changes in your project repo

### During Upgrade

- [ ] Run `node scripts/validate.js` on the new tree (expect PASS)
- [ ] Run `node scripts/atlas/doctor.js` (expect PASS)
- [ ] Copy new tree to your runtime (`.claude/skills/atlas` or `.agents/atlas`)
- [ ] Verify disk space is available for backup (`~/.atlas.backup.NNN/`)

### After Upgrade

- [ ] Run `/atlas doctor` in a Claude session (expect VERDICT: PASS, version v0.9.1)
- [ ] Run `/atlas status` (should show your existing portfolio + projects in OPERATOR or RESUME state)
- [ ] Invoke `/atlas` once to confirm it routes correctly to your active mode
- [ ] Update any automation/scripts to use the new 4-command surface
- [ ] Delete backup (`rm -rf ~/.atlas.backup.NNN/`) once confident

---

## Troubleshooting

### "Doctor fails after upgrade"

```bash
# 1. Validate canonical tree
cd /path/to/atlas/repo
node scripts/validate.js
# If FAIL: fix the discrepancies in CHARTER.md, package.json, SKILL.md

# 2. Re-propagate
rm -rf ~/.claude/skills/atlas
cp -r skills/atlas ~/.claude/skills/atlas

# 3. Try doctor again
node ~/.claude/skills/atlas/scripts/atlas/doctor.js
```

### "My portfolio state is lost"

**You backed it up, right?** Restore it:

```bash
rm -rf ~/.atlas
cp -r ~/.atlas.backup.NNN ~/.atlas
```

Then verify it's readable:

```bash
cat ~/.atlas/portfolio/*/context.json | head -5
# If you see JSON, the backup is intact
```

### "Old subcommands still exist in my setup"

This can happen if you're running from a cached version or a different skill directory.

```bash
# Find all Atlas skill directories
find ~ -name "atlas" -type d -path "*/skills/*" 2>/dev/null

# Verify you're using the right one
echo $ATLAS_SKILL_PATH

# Ensure only one canonical atlas exists
ls -la ~/.claude/skills/ | grep atlas
```

### "Version mismatch: package.json says v0.9.1 but CHARTER says v0.9.0"

**The canonical source is package.json.** Update any disagreeing files:

```bash
# Check current version
cat skills/atlas/package.json | jq '.version'

# Update CHARTER.md line 14 to match
# Update VERSION.md line 8 to match
# Commit and validate
node scripts/validate.js
```

---

## Rollback (If Needed)

If v0.9.1 breaks something and you need to go back to v0.9.0:

```bash
# 1. Restore backup
rm -rf ~/.claude/skills/atlas
rm -rf ~/.atlas
cp -r ~/.atlas.backup.NNN ~/.atlas

# 2. Check out v0.9.0 from git
cd /path/to/atlas/repo
git checkout v0.9.0  # or the appropriate tag/branch

# 3. Re-copy skill
cp -r skills/atlas ~/.claude/skills/atlas

# 4. Verify
node ~/.claude/skills/atlas/scripts/atlas/doctor.js
```

**State is preserved.** You can rollback and forward safely as long as you keep backups.

---

## What to Report If Upgrade Fails

If you encounter an issue that doesn't fit the troubleshooting above, report it with:

1. **Version info:**
   ```bash
   cat ~/.claude/skills/atlas/package.json | jq '.version'
   node ~/.claude/skills/atlas/scripts/atlas/doctor.js
   cat ~/.atlas/portfolio/*/context.json | jq '.status.mode'
   ```

2. **Last error:**
   ```bash
   cat ~/.atlas/portfolio/*/incidents/latest.json
   # or the console output from `/atlas`
   ```

3. **Steps to reproduce** (exact CLI commands you ran)

4. **Expected behavior vs. actual behavior**

Report to: [GitHub Issues](https://github.com/VpkDevs/atlas/issues) or your support channel.

---

## FAQ

**Q: Will v0.9.1 break my existing projects?**
A: No. The 21-phase pipeline, Sovereign Score, First Ship mode, and state layer are unchanged. Only the command surface and three new modules are affected.

**Q: Do I have to use the new modules?**
A: No. They load only when their phase is reached. If you want to skip them, your project continues normally.

**Q: Can I run v0.9.0 and v0.9.1 side-by-side?**
A: Yes (Option C above), but only one should be installed as `~/.claude/skills/atlas`. Use separate directories for testing.

**Q: What if I have custom scripts that call `/atlas growth`?**
A: Those will fail with "command not found." Update them to call `/atlas` instead. The logic is the same; only the command name changed.

**Q: Is my portfolio backed up if I upgrade?**
A: Not automatically. **Back it up yourself** (`cp -r ~/.atlas ~/.atlas.backup`) before upgrade.

**Q: How long does upgrade take?**
A: 2–5 minutes (copy + validation + doctor). No long-running operations.

**Q: What if validate.js reports warnings?**
A: Warnings are non-blocking (e.g., "advisory: unused file found"). Doctor will still pass. Address them on your next iteration.

---

**v0.9.1. One kernel. One charter. One changelog. Fleet real. Heartbeat live. Evidence or it didn't happen.**
