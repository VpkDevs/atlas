---
name: charter-v8
description: Canonical Atlas v8.0 charter and file inventory.
---

# Atlas Charter — v8.0

*One document. One version. Read this first if you are confused about anything.*

---

## Status

**Atlas v8.0 is the current canonical version, dated 2026-05-21.**

This Charter is the single source of truth for which version Atlas is at, which files are canonical, and which files have been retired. If any file in the skill directory disagrees with this document, this document wins.

`/atlas doctor` enforces this by checking Charter version against SKILL.md and the module references.

---

## What v8.0 Is

Atlas v8.0 is an architectural cleanup of v7.2 with two new capability additions. It is not a rewrite. All of v7.2's doctrine — Iron Rule, Six-Layer Action Hierarchy, Sovereign Score, Capital Governor, Fleet sub-agents, Money/Pricing/Cashflow/Offer/Channel/Sniper protocols, Fusion Router, Incident Protocol — is preserved in the existing module files unchanged.

**What changed:**

1. **The kernel.** SKILL.md was reduced from 944 lines to ~380 lines by relocating content to existing module files. Progressive disclosure per Anthropic's skill best practices.
2. **First Ship Mode.** A new compressed 7-day pipeline (`first-ship.md`) for founders without prior shipped products. The Standard 21-phase pipeline assumed launch competence; First Ship builds it.
3. **`/atlas doctor`.** A mandatory integrity check (`atlas-doctor.md`) that runs before every Atlas command and refuses to proceed if the skill is internally broken.
4. **Skill Hygiene.** A doctrine (`skill-hygiene.md`) preventing the meta-bloat that produced v7.x's 923-file state.
5. **One charter, one changelog.** This file, plus `CHANGELOG.md`. The 15+ summary/audit/improvement files from v7.x are archived.

**What did not change:**

- The 30+ existing module files (`onboarding.md`, `code-sprint.md`, `growth-engine.md`, etc.) are unchanged. Your work is preserved.
- The scoring algorithm, dashboard template, state directory schema, output artifact layout, git protocol, deployment protocol, self-healing protocol — all unchanged.
- All `/atlas X` subcommands continue to work.

---

## File Inventory After v8.0 Triage

### CORE (always at skill root)

```
SKILL.md                          ← the kernel
CHARTER_v8.md                     ← this file
CHANGELOG.md                      ← the only changelog
README.md                         ← outward-facing intro
LICENSE
dashboard-template.html
```

### MODULES (active, referenced from SKILL.md)

The following are the modules SKILL.md routes to. Doctor verifies all are present.

**New in v8.0:**
```
atlas-doctor.md            ← integrity check
first-ship.md              ← 7-day on-ramp pipeline
skill-hygiene.md           ← anti-bloat doctrine
rationalization-table.md   ← full catalog (SKILL.md keeps top 10)
```

**Preserved from v7.2 (canonical names — see Renames below):**
```
atlas-kernel.md            ← routing table (existing)
onboarding.md
code-sprint.md
security.md
legal-compliance.md
pre-flight.md
launch-strategy.md
marketing-playbook.md
brand-engine.md
business-setup.md
automation-handoff.md
launch-day.md
war-room.md
operations.md
revenue-intelligence.md
growth-engine.md
exit-readiness.md
money-engine.md
pricing-lab.md
cashflow-ops.md
offer-forge.md
channel-dominance.md
acquisition-sniper.md
capital-governor.md
scoring.md
incident-protocol.md
context-window.md
fleet-subagents.md
mission-intelligence.md
operator-playbook.md
fusion-router.md           ← canonical (see Renames)
portfolio.md
portfolio-os.md
edge-cases.md
atlas-brain.md
api-execution-engine.md
deployment-engine.md
startup-credits-sprint.md
zero-to-first-dollar.md
hands-off-gaps.md
```

### REFERENCE (deep-dive material, loaded on demand)

```
advanced-features.md       (was: ADVANCED_FEATURES.md)
adversarial-and-epistemic.md (was: ADVERSARIAL_AND_EPISTEMIC.md)
```

### COMPILED SUB-PROJECTS

```
scoring-engine/            ← TypeScript scoring engine, its own package
automation-library/        ← reusable workflow JSON
```

### ARCHIVE (retired in v8.0, preserved for history, NOT loaded)

The following files were retired in v8.0. They are not deleted — they live in `_archive/v7_pre_triage/`. They are not loaded by any module and do not affect Atlas behavior.

**Duplicate uppercase variants (retired in favor of lowercase canonical):**
```
_archive/v7_pre_triage/ADVANCED_FEATURES.md
_archive/v7_pre_triage/ADVERSARIAL_AND_EPISTEMIC.md
_archive/v7_pre_triage/ALL_FIXES_COMPLETE.md
_archive/v7_pre_triage/ATLAS_KERNEL.md
_archive/v7_pre_triage/CONTINUATION_SUMMARY.md
_archive/v7_pre_triage/FINAL_SUMMARY.md
_archive/v7_pre_triage/FIXES_COMPLETE.md
_archive/v7_pre_triage/IDEAL_VS_ACTUAL.md
_archive/v7_pre_triage/IMPROVEMENTS_INDEX.md
_archive/v7_pre_triage/IMPROVEMENTS_SUMMARY.md
_archive/v7_pre_triage/IMPROVEMENT_GUIDE.md
_archive/v7_pre_triage/INCONSISTENCIES_FIXED.md
_archive/v7_pre_triage/MASTER_SUMMARY.md
_archive/v7_pre_triage/MODULE_AUDIT_v8.3.md
_archive/v7_pre_triage/STRATEGIC_ARCHITECTURE_v8.3.md
_archive/v7_pre_triage/TREMENDOUS_IMPROVEMENTS_V8.1.md
_archive/v7_pre_triage/WEAKEST_ASPECTS_FIXED.md
```

**Meta-files that v8.0 Skill Hygiene forbids at skill root:**
```
_archive/v7_pre_triage/ALL_FIXES_COMPLETE.md
_archive/v7_pre_triage/ATLAS_IMPROVEMENT_PLAN.md
_archive/v7_pre_triage/IMPROVEMENTS_DELIVERED.txt
_archive/v7_pre_triage/improvements-delivered.txt
```

**Old-version module files superseded by canonical names:**
```
_archive/v7_pre_triage/fusion-router-v2.md   (superseded by fusion-router.md)
```

**Recursive skill copies (the nesting bug):**
```
_archive/v7_pre_triage/atlas-self-nested/SKILL.md      (was: atlas/SKILL.md)
_archive/v7_pre_triage/atlas-self-nested-2/SKILL.md    (was: atlas/atlas/SKILL.md)
```

**Bloat (does not belong in skill root):**
```
_archive/v7_pre_triage/node_modules/         (was: ./node_modules — 164+ subdirs)
_archive/v7_pre_triage/package.json          (only relevant inside scoring-engine/)
_archive/v7_pre_triage/package-lock.json     (only relevant inside scoring-engine/)
```

---

## Renames in v8.0

| Old name (v7.x) | New canonical (v8.0) | Reason |
|---|---|---|
| `ATLAS_KERNEL.md` + `atlas-kernel.md` | `atlas-kernel.md` | One of the duplicate pair retained; lowercase-kebab is the v8.0 convention |
| `ADVANCED_FEATURES.md` + `advanced-features.md` | `advanced-features.md` | Same |
| `ADVERSARIAL_AND_EPISTEMIC.md` + `adversarial-and-epistemic.md` | `adversarial-and-epistemic.md` | Same |
| `fusion-router.md` + `fusion-router-v2.md` | `fusion-router.md` | v2 content merged into canonical name |

For each rename pair, Doctor Check 3 verifies only the canonical name exists at the skill root.

---

## Why v8.0 and Not v8.1 or v8.3

The directory contained files referencing v8.1 and v8.3 (`TREMENDOUS_IMPROVEMENTS_V8.1.md`, `MODULE_AUDIT_v8.3.md`, `STRATEGIC_ARCHITECTURE_v8.3.md`) but the SKILL.md body declared v7.2 and the module files do not internally reference v8.1 or v8.3 capability changes.

This means v8.1 and v8.3 existed in *aspirational* form — documents about what v8.x *should be* — without the corresponding SKILL.md or module updates. Those documents have been archived. The actual code-state shipped to the skill is v7.2 + this triage, which equals **v8.0**.

Future versions go forward from here cleanly.

---

## Subcommand Surface (v8.0)

The full surface of `/atlas X` commands. Doctor verifies the routing table in SKILL.md matches this list.

```
/atlas                       Auto-detect mode
/atlas doctor                Integrity check (NEW in v8.0)
/atlas ship                  Force First Ship Mode (NEW in v8.0)
/atlas status                Print dashboard
/atlas resume                Resume at last incomplete phase
/atlas diag                  Full health diagnostic
/atlas growth                Growth Engine tick
/atlas money                 Money Engine tick
/atlas pricing               Pricing Lab cycle
/atlas offer                 Offer Forge cycle
/atlas channels              Channel allocation rebalance
/atlas sniper                Acquisition Sniper mode
/atlas governor              Capital Governor
/atlas ops                   Operator discipline pass
/atlas funnel                Acquisition funnel audit
/atlas retention             Churn/reactivation pass
/atlas warroom               Re-enter War Room
/atlas fix [phase]           Re-run a specific phase
/atlas security              Security audit
/atlas brand                 Brand engine pass
/atlas portfolio             Force Portfolio Mode
/atlas portfolio-scan        Recompute portfolio scores
/atlas portfolio-rebalance   Reassign lanes
/atlas portfolio-execute     Execute primary lane only
/atlas fusion                Federated skill+agent sprint
/atlas fusion-report         Merged intervention report
/atlas fleet --agent --task  Direct sub-agent invocation
/atlas retire                Mark project retired
```

Twenty-eight commands. The previous v7.2 surface had twenty-seven; v8.0 adds `/atlas doctor` and `/atlas ship`.

---

## What `/atlas` Loads by Default

Out of ~40 module files in the canonical inventory, a typical `/atlas` invocation loads:

- SKILL.md (always)
- atlas-doctor.md (always, before anything else)
- atlas-kernel.md (always, for the routing table)
- One mode-specific module (e.g., `first-ship.md` OR `onboarding.md` OR `growth-engine.md` depending on mode)
- 2–4 phase-specific modules as the pipeline progresses

This is approximately 15–25 KB of context per invocation, down from v7.2's habit of loading ~80 KB across SKILL.md + multiple summary files.

---

## v8.0 Acceptance Test

To verify v8.0 is correctly installed:

```bash
# 1. Doctor passes
/atlas doctor
# Expected: VERDICT: PASS

# 2. Help / status shows v8.0
/atlas status
# Expected: header line includes "Atlas v8.0"

# 3. Module references resolve
# Doctor Check 2 catches any missing module

# 4. No nested skill
ls atlas/SKILL.md 2>/dev/null && echo "FAIL: nested skill found" || echo "OK: no nested skill"

# 5. No duplicate-pair files
# Doctor Check 3 catches any pair

# 6. Charter version matches SKILL.md
grep -E "v8\.0" SKILL.md > /dev/null && grep -E "v8\.0" CHARTER_v8.md > /dev/null && echo "OK: versions aligned"
```

---

## v8.0 Hand-off Note

This Charter is short on purpose. The full architectural narrative — what the Iron Rule means, why the Six-Layer Action Hierarchy is structured as it is, how the Sovereign Score is computed, etc. — lives in SKILL.md and the module files. This document only answers one question: *which version are we, and which files are canonical.*

If you are reading this because Doctor reported a discrepancy, the fix is one of:
1. Update the disagreeing file to match this Charter, OR
2. Update this Charter and bump the version, then run Doctor

Both are valid. Drift between them is not.

---

**v8.0. One kernel. One charter. One changelog. Modules unchanged. Bloat archived. Doctor watches.**
