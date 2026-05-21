---
name: atlas-doctor
description: Atlas module — integrity check that runs before every other command. Refuses to proceed if the skill is broken.
---

# Atlas Doctor — The Self-Check

*A skill that automates a founder's business must itself be reliably testable. Doctor is the lesson learned from v7.x.*

---

## Purpose

`atlas-doctor.md` runs **before every other Atlas command**. It verifies that the skill itself is internally coherent — that referenced module files exist, that the state directory is writable, that the skill structure has not drifted into the v7.x failure mode of duplicate files, nested copies, and version mismatches.

If integrity checks fail, **Atlas refuses to run**. This is non-negotiable. A skill that runs while broken produces silent corruption; a skill that refuses to run while broken produces a clear error.

`/atlas doctor` can also be invoked directly to inspect skill health without running any pipeline.

---

## When Doctor Runs

| Trigger | Behavior |
|---|---|
| Any `/atlas` invocation | Run silent integrity check. Halt with report if FAIL. Proceed if PASS. |
| `/atlas doctor` | Run full check with verbose output. Always exits without running pipeline. |
| Inside Self-Healing Protocol after 3 failed retries | Run check to detect whether the failure is in the user's project vs. in Atlas itself |

---

## The Integrity Check

```
PROCEDURE atlas_doctor:
  1. Verify SKILL.md is canonical
  2. Verify referenced modules exist
  3. Verify no skill-level duplicates
  4. Verify no recursive nesting
  5. Verify state directory health
  6. Verify version coherence
  7. Verify scoring engine reachable
  8. Verify node_modules hygiene
  9. Report
```

Run in order. Each check produces ✅ / ⚠️ / ❌.

### Check 1 — SKILL.md Canonical

```
[ ] Exactly ONE SKILL.md exists in the skill root
[ ] SKILL.md frontmatter has `name: atlas`
[ ] SKILL.md body line count ≤ 500 for PASS, 501–700 for WARN, >700 for WARN
[ ] SKILL.md references "v8.0" in body header
[ ] No `SKILL.md.bak`, `SKILL.OLD.md`, `SKILL_v7.md`, or similar legacy copies at skill root
```

**FAIL conditions:**
- Multiple SKILL.md files anywhere under skill root → ❌ — Atlas halts
- Version header in body does not match charter version → ❌ — Atlas halts
- SKILL.md 501–700 lines → ⚠️ — Atlas warns, proceeds (the kernel principle is being strained)
- SKILL.md > 700 lines → ⚠️ — Atlas warns, proceeds (the kernel principle is being violated)

### Check 2 — Module References Resolve

Parse SKILL.md for every reference of the form `` `[name].md` `` or `(name.md)`. For each, verify the file exists in the skill directory.

```
Expected core modules (referenced in v8.0 SKILL.md):
  atlas-doctor.md, first-ship.md, skill-hygiene.md,
  rationalization-table.md,
  onboarding.md, code-sprint.md, security.md, legal-compliance.md,
  pre-flight.md, launch-strategy.md, marketing-playbook.md,
  brand-engine.md, business-setup.md, automation-handoff.md,
  launch-day.md, war-room.md, operations.md, revenue-intelligence.md,
  growth-engine.md, exit-readiness.md, money-engine.md, pricing-lab.md,
  cashflow-ops.md, offer-forge.md, channel-dominance.md,
  acquisition-sniper.md, capital-governor.md, scoring.md,
  incident-protocol.md, context-window.md, fleet-subagents.md,
  mission-intelligence.md, operator-playbook.md, fusion-router.md,
  portfolio.md, portfolio-os.md, edge-cases.md
```

**FAIL conditions:**
- Any module referenced in SKILL.md is missing → ❌ — Atlas halts (broken reference would silently no-op)
- Module file exists but its frontmatter declares a different name → ⚠️ — Atlas warns

### Check 3 — No Duplicate Files

Scan the skill root for any pair of files where one is the uppercased/lowercased or `snake_case`/`kebab-case` variant of the other.

```
ALGORITHM:
  - List every .md file in skill root and one level deep
  - Normalize each filename: lowercase, replace _ with -, strip trailing v[0-9]+
  - Group by normalized name
  - Any group with >1 file is a duplicate cluster
```

**FAIL conditions:**
- Any duplicate cluster found → ❌ — Atlas halts; reports cluster and suggests which to archive

Known v7.x duplicate clusters that v8.0 doctor specifically watches for:

```
{IMPROVEMENTS_INDEX.md, improvements-index.md}
{MASTER_SUMMARY.md, master-summary.md}
{FINAL_SUMMARY.md, final-summary.md}
{FIXES_COMPLETE.md, fixes-complete.md}
{ALL_FIXES_COMPLETE.md, all-fixes-complete.md}
{INCONSISTENCIES_FIXED.md, inconsistencies-fixed.md}
{IMPROVEMENT_GUIDE.md, improvement-guide.md}
{IMPROVEMENTS_SUMMARY.md, improvements-summary.md}
{IDEAL_VS_ACTUAL.md, ideal-vs-actual.md}
{WEAKEST_ASPECTS_FIXED.md, weakest-aspects-fixed.md}
{STRATEGIC_ARCHITECTURE_v8.3.md, strategic-architecture-v8.3.md}
{TREMENDOUS_IMPROVEMENTS_V8.1.md, tremendous-improvements-v8.1.md}
{CONTINUATION_SUMMARY.md, continuation-summary.md}
{MODULE_AUDIT_v8.3.md, module-audit-v8.3.md}
{ATLAS_KERNEL.md, atlas-kernel.md}
{ADVANCED_FEATURES.md, advanced-features.md}
{ADVERSARIAL_AND_EPISTEMIC.md, adversarial-and-epistemic.md}
```

These specific clusters are evidence of an incomplete rename pass. If Doctor finds any of them, it reports — and recommends running `atlas-triage.ps1`.

### Check 4 — No Recursive Nesting

```
[ ] No directory named "atlas" exists inside the atlas skill root
[ ] No SKILL.md exists below the skill root
```

**FAIL conditions:**
- A nested `atlas/` directory contains a SKILL.md → ❌ — Atlas halts. This is the v7.x recursion bug: SKILL.md inside SKILL.md inside SKILL.md.

### Check 5 — State Directory Health

```
[ ] ~/.atlas/ exists and is writable
[ ] ~/.atlas/memory.md exists (create if missing)
[ ] ~/.atlas/founder-profile.json exists and parses as valid JSON
[ ] ~/.atlas/portfolio/ exists
[ ] For each portfolio subdirectory:
      [ ] context.json exists and parses
      [ ] context.json.bak exists (or context.json is < 24h old)
      [ ] credentials_index.json exists and parses
      [ ] ATLAS_BRAIN.md exists
```

**FAIL conditions:**
- `~/.atlas/` not writable → ❌ — Atlas halts; permissions issue
- `context.json` exists but does not parse → ❌ — Atlas halts; attempt restore from `.bak`
- `founder-profile.json` does not parse → ⚠️ — Atlas warns; runs in degraded mode

### Check 6 — Version Coherence

```
[ ] CHARTER_v8.md exists at skill root
[ ] CHARTER_v8.md declares canonical version
[ ] SKILL.md header version matches CHARTER_v8.md
[ ] No file at skill root contains a "v[0-9]+.[0-9]+" version tag higher than the charter version
```

**FAIL conditions:**
- Version drift detected (e.g., charter is v8.0, a referenced doc says "v8.3 current") → ❌ — Atlas halts; one of them is wrong

### Check 7 — Scoring Engine Reachable

```
IF scoring-engine/ directory exists:
  [ ] scoring-engine/src/index.ts exists
  [ ] scoring-engine/package.json exists
  [ ] node_modules/ exists OR npm install can succeed
  [ ] Run: node -e "require('./scoring-engine/dist/index.js')" — no error

IF scoring-engine/ does not exist:
  [ ] scoring.md contains all formulas referenced in SKILL.md
```

**FAIL conditions:**
- Scoring formula referenced in SKILL.md (e.g., `compute_sovereign_score()`) cannot be located in either `scoring-engine/` or `scoring.md` → ❌ — Atlas halts

### Check 8 — `node_modules` Hygiene

```
[ ] No node_modules/ directory at the SKILL root (it should be inside scoring-engine/ or other sub-projects only)
[ ] .gitignore includes node_modules
```

**FAIL conditions:**
- `node_modules/` at skill root → ⚠️ — Atlas warns; suggests `atlas-triage.ps1` to clean

---

## Output Format

```
─────────────────────────────────────────────────────
ATLAS DOCTOR — v8.0 INTEGRITY CHECK

[1] SKILL.md canonical ............... [✅ / ⚠️ / ❌]
[2] Module references resolve ........ [✅ / ⚠️ / ❌]
[3] No duplicate files ............... [✅ / ⚠️ / ❌]
[4] No recursive nesting ............. [✅ / ⚠️ / ❌]
[5] State directory health ........... [✅ / ⚠️ / ❌]
[6] Version coherence ................ [✅ / ⚠️ / ❌]
[7] Scoring engine reachable ......... [✅ / ⚠️ / ❌]
[8] node_modules hygiene ............. [✅ / ⚠️ / ❌]

VERDICT: [PASS / WARN / FAIL]

[If FAIL:]
  Atlas cannot proceed. Specific issues:
    ❌ [issue 1 with exact file path]
    ❌ [issue 2 with exact file path]
  Remediation:
    1. [specific command or action]
    2. [specific command or action]
  After fixing, re-run /atlas doctor.

[If WARN:]
  Atlas will proceed but the following should be addressed:
    ⚠️ [warning 1]
  Recommendation: [action]

[If PASS:]
  Atlas v8.0 is healthy. Proceeding to [next mode].
─────────────────────────────────────────────────────
```

---

## Doctor Cannot Self-Repair

By design, `/atlas doctor` is **read-only**. It does not delete, rename, or move files. It does not run `git` commands. It does not modify state.

When issues are found, Doctor recommends a specific remediation:

- For duplicate files → run `atlas-triage.ps1` (or the equivalent on macOS/Linux)
- For broken module references → manually create the missing file or remove the reference
- For state corruption → restore from `.bak` (Doctor outputs the exact command)
- For version drift → edit the offending file to match the charter

This is deliberate. Doctor's job is to detect, not to act. An auto-repairing self-check produces an attack surface (a corrupt skill that quietly rewrites itself is worse than one that refuses to run).

---

## Doctor Inside Self-Healing

When the universal Self-Healing Protocol exhausts its 3 retries on the same root cause, the next step (before logging as `pending_human_action`) is a Doctor check. If Doctor reports FAIL, the failure is in Atlas itself, not the user's project — and the surfaced `userMust` reflects that:

```
userMust: {
  label: "Atlas skill integrity check failed. Repair Atlas before continuing.",
  url: "(see Doctor output above)",
  blocks_phase: "all",
  required: true
}
```

This prevents the worst failure mode: Atlas attempting to fix the user's code when the bug is in Atlas.

---

## Doctor Test Suite (Optional but Recommended)

A reference test bench lives in `atlas-doctor-tests/` (separate package, not loaded by default):

- `fixtures/healthy/` — a minimal valid skill structure; should PASS
- `fixtures/duplicate-files/` — contains an `IMPROVEMENTS_INDEX.md` / `improvements-index.md` pair; should FAIL Check 3
- `fixtures/nested-skill/` — contains `atlas/SKILL.md`; should FAIL Check 4
- `fixtures/version-drift/` — SKILL.md says v8.0, CHARTER says v7.2; should FAIL Check 6
- `fixtures/broken-reference/` — SKILL.md references `nonexistent.md`; should FAIL Check 2

Run via `node atlas-doctor-tests/run.js`. Atlas v8.0 ships with these fixtures so the doctor can be regression-tested when it is itself modified.

---

## Doctor Rationalization Table

| Excuse | Reality |
|---|---|
| "Doctor is overkill for a small change" | Doctor takes < 2 seconds. Run it. |
| "Doctor failed but I know the issue isn't real" | Then fix the false positive in Doctor. Don't bypass it. |
| "I'll skip Doctor just this once" | This is how v7.x got to 923 files. |
| "Doctor says version drift but the version is fine" | Either Doctor is wrong (fix it) or the version is wrong (fix it). Don't shrug. |

---

**Atlas Doctor runs first. Always. No exceptions. No `--force` flag exists.**
