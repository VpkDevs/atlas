---
name: canonical-install
description: Propagation contract for canonical Atlas installation to .agents, .claude, .codex, and compatible skill runtimes.
---

# Canonical Install Contract (v0.9.1)

**Single source of truth:** the current working directory of this file (`skills/atlas/`) is the canonical Atlas skill tree. This document specifies how that tree propagates to compatible skill runtimes.

---

## Canonical Tree Definition

The canonical tree is versioned in `package.json` (source of truth for all versions). The CHARTER.md and validate.js enforce coherence — if any file disagrees with the version in package.json, that's a validation error.

### What Propagates

**Core (always required):**
```
SKILL.md              CHARTER.md            CHANGELOG.md
VERSION.md            README.md              LICENSE
package.json          package-lock.json
dashboard-template.html
```

**Modules (all or nothing — do not cherry-pick):**
```
├─ Kernel doctrines
│  ├─ atlas-doctor.md
│  ├─ leverage-engine.md
│  ├─ fleet-subagents.md
│  ├─ skill-hygiene.md
│  └─ rationalization-table.md
│
├─ Launch pipeline (Phases 0–9)
│  ├─ onboarding.md          ├─ first-ship.md         ├─ pre-flight.md
│  ├─ code-sprint.md         ├─ launch-strategy.md    ├─ launch-day.md
│  ├─ security.md            ├─ business-setup.md     ├─ war-room.md
│  ├─ penetration-tester.md  └─ legal-compliance.md
│  └─ credential-acquisition.md
│
├─ Revenue & growth (Phases 10+)
│  ├─ growth-engine.md        ├─ money-engine.md       ├─ capital-governor.md
│  ├─ operations.md           ├─ pricing-lab.md        ├─ revenue-intelligence.md
│  ├─ cashflow-ops.md         ├─ offer-forge.md        ├─ scoring.md
│  └─ acquisition-sniper.md   └─ channel-dominance.md
│
├─ Business + brand
│  ├─ brand-engine.md
│  ├─ marketing-playbook.md
│  └─ automation-handoff.md
│
├─ Intelligence & routing
│  ├─ mission-intelligence.md
│  ├─ fusion-router.md
│  ├─ portfolio.md
│  └─ portfolio-os.md
│
├─ Edge cases + reference
│  ├─ edge-cases.md
│  ├─ exit-readiness.md
│  ├─ operator-playbook.md
│  ├─ incident-protocol.md
│  └─ deployment-engine.md     (new in v0.9.1)
│       user-interview-engine.md (new in v0.9.1)
│
└─ Legal templates
   ├─ docs/legal/COMPLIANCE_CHECKLIST.md
   ├─ docs/legal/PRIVACY_POLICY.md
   └─ docs/legal/TERMS_OF_SERVICE.md
```

**Executables (optional but recommended):**
```
scripts/
  ├─ validate.js              (coherence checks — strongly recommended)
  ├─ atlas/
  │  ├─ command-registry.js   (subcommand list source)
  │  ├─ doctor.js             (diagnostic)
  │  ├─ cli.js                (REPL)
  │  ├─ pulse.js              (weekly metrics)
  │  ├─ weekly-review.js      (operator loop)
  │  ├─ decide.js             (decision log)
  │  └─ credential-browser.js (API key discovery)
  └─ ...other automations
```

**Do not propagate:**
- `tests/` (validation runs locally before propagation)
- `.github/` (CI/CD workflows, not needed in target runtimes)
- `docs/superpowers/` (internal planning, not part of skill surface)
- Runtime state (`~/.atlas/`, `.env.local`, `*.swp`, etc.)
- Generated artifacts (logs, dashboards, screenshots)

---

## Target Runtimes

### 1. `.agents` (Anthropic Agents)

**Availability:** Anthropic-hosted managed sandbox.

**Install procedure:**
```bash
# From skill root
node scripts/validate.js

# If green, propagate to Agents runtime
cp -r skills/atlas/* ~/.agents/atlas/
chmod +x ~/.agents/atlas/scripts/atlas/*.js
~/.agents/atlas/scripts/atlas/doctor.js
```

**Validation on target:**
```bash
# Target runtime
node ~/.agents/atlas/scripts/validate.js
# Expected: all checks pass
```

**Capability mapping:**
- Agent fleet dispatch: native Anthropic Agents SDK
- Dashboard hosting: Anthropic's agent infrastructure
- Heartbeat scheduler: managed cron compatible with Anthropic servers
- Subcommand routing: `/atlas` invoked from agent runtime

**Version check:**
```bash
cat ~/.agents/atlas/package.json | grep "\"version\""
# Expected: "0.9.1" or higher
```

---

### 2. `.claude` (Claude Code / Claude.ai)

**Availability:** Skill sync for Claude Code CLI and Claude.ai web.

**Install procedure:**
```bash
# From skill root (validate first)
node scripts/validate.js

# Copy to Claude workspace
cp -r skills/atlas/* ~/.claude/skills/atlas/

# Verify
node ~/.claude/skills/atlas/scripts/validate.js
```

**Capability mapping:**
- Fleet dispatch: Claude Code agent spawning (Agent tool)
- Dashboard hosting: Claude.ai web artifact or external URL
- Heartbeat: Claude Code scheduled tasks or CronCreate MCP
- Subcommand routing: `/atlas` skill invocation

**Version integrity check:**
```bash
grep '"version"' ~/.claude/skills/atlas/package.json
# Expected: "0.9.1"

~/.claude/skills/atlas/scripts/atlas/doctor.js
# Expected: Atlas Doctor: PASS
```

---

### 3. `.codex` (Compatible Skill Runtimes)

**Availability:** Open-source agent frameworks compatible with skill manifest format.

**Install procedure:**
```bash
# From skill root
node scripts/validate.js --strict

# Create manifest
cat > ~/.codex/atlas/skill.manifest.json <<'EOF'
{
  "name": "atlas",
  "version": "0.9.1",
  "type": "skill",
  "kernel": "SKILL.md",
  "charter": "CHARTER.md",
  "modules": [
    "leverage-engine.md",
    "fleet-subagents.md",
    "growth-engine.md",
    "money-engine.md",
    ...
  ],
  "scripts": "scripts/",
  "validation": "scripts/validate.js",
  "doctor": "scripts/atlas/doctor.js"
}
EOF

# Propagate tree
cp -r skills/atlas/* ~/.codex/skills/atlas/

# Run validation
~/.codex/skills/atlas/scripts/validate.js --strict
```

**Capability mapping:**
- Fleet dispatch: .codex agent spawn protocol
- Dashboard: file URI or HTTP endpoint
- Heartbeat: .codex scheduler interface
- Subcommand routing: manifest-driven command dispatch

**Interop requirements:**
- Node.js >= 20.x on target
- File I/O access to `~/.codex/atlas/`
- Network access for API calls (ToolSearch, MCP registry)
- stdout/stderr for logging

---

## Validation Protocol

**Before propagation**, run the canonical validator:
```bash
cd skills/atlas/
npm install
node scripts/validate.js
# Expected output: ✓ all checks pass (0 errors, 0 warnings)
```

**After propagation**, run doctor on the target:
```bash
# On target runtime
node scripts/atlas/doctor.js
# Expected: Atlas Doctor: PASS
```

Validator checks (110+):
- ✓ Version coherence (package.json == CHARTER.md == VERSION.md)
- ✓ File inventory (all CORE files present, no unexpected files)
- ✓ Module integrity (no orphaned modules, no missing deps)
- ✓ Subcommand surface (SKILL.md match CHARTER.md match command-registry.js)
- ✓ Script executability (all scripts have valid shebang and permissions)
- ✓ No secrets in repo (no `.env`, no credentials, no API keys)
- ✓ License present and consistent

---

## Coherence Responsibilities

### Canonical Tree (skills/atlas/)
- `package.json` is the version source (e.g., `"version": "0.9.1"`)
- All other files derive version from package.json
- CHARTER.md is the file inventory source of truth
- File changes trigger `node scripts/validate.js` before commit
- Doctor runs before any `/atlas` invocation

### Target Runtime
- After install, run `doctor.js` once to verify integrity
- If doctor reports a discrepancy, follow the remedy instructions
- If target modifies files, those changes are local-only — do not propagate back
- Version drift between target and canonical is a re-installation trigger

---

## Update Protocol

**When v0.9.1 → v0.9.2 (patch) or v0.9.1 → v0.10 (minor):**

1. Update canonical tree:
   ```bash
   git pull origin main
   node scripts/validate.js
   ```

2. Re-run installation on each target runtime:
   ```bash
   # Target: .agents, .claude, .codex, etc.
   rm -rf ~/.RUNTIME/atlas
   cp -r /path/to/canonical/skills/atlas ~/.RUNTIME/atlas
   node ~/.RUNTIME/atlas/scripts/validate.js
   node ~/.RUNTIME/atlas/scripts/atlas/doctor.js
   ```

**No incremental patches.** Always re-propagate the entire tree — the skill modules are interdependent and splicing is not supported.

---

## Troubleshooting

**Validator fails with "version mismatch":**
```bash
# Check canonical
cat skills/atlas/package.json | jq '.version'
cat skills/atlas/CHARTER.md | head -20

# Update the disagreeing file to match package.json
# Commit and re-run validate.js
```

**Doctor fails on target:**
```bash
# Re-run validation on canonical first
node scripts/validate.js

# If canonical is clean, re-propagate
rm -rf ~/.target_runtime/atlas
cp -r skills/atlas ~/.target_runtime/atlas
node ~/.target_runtime/atlas/scripts/validate.js
node ~/.target_runtime/atlas/scripts/atlas/doctor.js
```

**Command-registry.js disagrees with SKILL.md:**
```bash
# command-registry.js is the source; update SKILL.md to match
grep -A 50 "const commands" scripts/atlas/command-registry.js
# Copy those 4 commands into SKILL.md § Subcommands
# Re-run validate.js
```

---

## Propagation Checklist

Before shipping v0.9.1 to all targets:

- [ ] Canonical `node scripts/validate.js` passes (zero errors, zero warnings)
- [ ] CHARTER.md § "File Inventory" is complete and accurate
- [ ] package.json version is "0.9.1"
- [ ] All three new v0.9.1 modules exist:
  - [ ] `user-interview-engine.md`
  - [ ] `penetration-tester.md`
  - [ ] `deployment-engine.md`
- [ ] Subcommand surface reduced to 4 commands (SKILL.md + command-registry.js)
- [ ] README.md reflects v0.9.1 (not v0.9, not v0.8.x)
- [ ] LICENSE present and correct
- [ ] All legal templates present (`docs/legal/`)
- [ ] No `.env`, `.swp`, or runtime state in tree
- [ ] Propagate to `.agents`; run doctor; verify PASS
- [ ] Propagate to `.claude`; run doctor; verify PASS
- [ ] Propagate to `.codex` (if applicable); run doctor; verify PASS
- [ ] Announce v0.9.1 availability

---

**v0.9.1. One canonical tree. One validator. Fleet real. Heartbeat live.**
