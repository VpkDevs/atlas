---
name: charter-v8
description: Canonical Atlas v8.0 charter and file inventory.
---

# Atlas Charter — v8.4

*One document. One version. Read this first if you are confused about anything.*

---

## Status

**Atlas v8.4 is the current canonical version, dated 2026-06-23.**

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

```text
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
```text
atlas-doctor.md            ← integrity check
first-ship.md              ← 7-day on-ramp pipeline
skill-hygiene.md           ← anti-bloat doctrine
rationalization-table.md   ← full catalog (SKILL.md keeps top 10)
```

**Preserved from v7.2 (canonical names — see Renames below):**
```text
SKILL.md                   ← kernel and routing table
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

```text
advanced-features.md       (was: ADVANCED_FEATURES.md)
adversarial-and-epistemic.md (was: ADVERSARIAL_AND_EPISTEMIC.md)
```

### COMPILED SUB-PROJECTS

```text
scoring-engine/            ← TypeScript scoring engine, its own package
automation-library/        ← reusable workflow JSON
```

### RETIRED IN v8.0 (preserved by git history, NOT committed in the skill)

The v7.x triage removed duplicate uppercase variants, summary/fix-report files, old versioned module copies, nested Atlas skill copies, root package artifacts, and runtime state. Those files are recoverable from git history when needed, but they are not part of the active skill tree and are not loaded by any module.

Atlas v8.0 intentionally does **not** commit `_archive/`, `.atlas-state/`, or `.kiro/` directories. This keeps the skill reviewable, installable, and aligned with the hygiene rule that runtime state and meta-bloat do not belong in the skill package.

---

## Renames in v8.0

| Old name (v7.x) | New canonical (v8.0) | Reason |
|---|---|---|
| `ATLAS_KERNEL.md` | `atlas-kernel.md` | v8.0 folds the routing table into SKILL.md; the former kernel deep-dive remains lowercase reference material |
| `ADVANCED_FEATURES.md` + `advanced-features.md` | `advanced-features.md` | Same |
| `ADVERSARIAL_AND_EPISTEMIC.md` + `adversarial-and-epistemic.md` | `adversarial-and-epistemic.md` | Same |
| `fusion-router.md` + `fusion-router-v2.md` | `fusion-router.md` | v2 content merged into canonical name |

For each rename pair, Doctor Check 3 verifies only the canonical name exists at the skill root.

---

## Why v8.0 and Not v8.1 or v8.3

The directory contained files referencing v8.1 and v8.3 (`TREMENDOUS_IMPROVEMENTS_V8.1.md`, `MODULE_AUDIT_v8.3.md`, `STRATEGIC_ARCHITECTURE_v8.3.md`) but the SKILL.md body declared v7.2 and the module files do not internally reference v8.1 or v8.3 capability changes.

This means v8.1 and v8.3 existed in *aspirational* form — documents about what v8.x *should be* — without the corresponding SKILL.md or module updates. Those documents have been archived. The actual code-state shipped to the skill is v7.2 + this triage, which equals **v8.0**.

v8.4 is the clean forward version: it keeps the v8.0 kernel-first runtime, treats the v8.1-v8.3 giant-kernel variants as historical source material, and adds an explicit propagation contract so only one canonical package is installed across agent runtimes.

---

## Subcommand Surface (v8.0)

The full surface of `/atlas X` commands. Doctor verifies the routing table in SKILL.md matches this list.

```text
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

Twenty-eight commands are canonical in v8.0, including the new `/atlas doctor` and `/atlas ship` commands.

---

## What `/atlas` Loads by Default

Out of ~40 module files in the canonical inventory, a typical `/atlas` invocation loads:

- SKILL.md (always)
- atlas-doctor.md (always, before anything else)
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

**v8.0. One kernel. One charter. One changelog. Modules unchanged. Bloat archived. Doctor watches.**\n\n---\n\n# Version Note\n\n*Folded from VERSION.md*\n\n# Atlas Version Note

**Current canonical version:** `v8.4`
**Canonical authority:** [CHARTER_v8.md](CHARTER_v8.md)
**Last Updated:** 2026-06-23

This file is a compatibility pointer for older docs and tools that expect `VERSION.md` to exist. The active v8 track uses `CHARTER_v8.md` as the single source of truth for version, command surface, canonical files, and hygiene policy.

If `VERSION.md` and `CHARTER_v8.md` ever disagree, treat `CHARTER_v8.md` as authoritative and update this file.

## Version History

| Version | Status | Notes |
|---|---|---|
| v6.x | Historical | Static scoring and early operating model |
| v7.0 | Historical | Federated routing and expanded modules |
| v7.2 | Historical | Decision-tree priorities and large kernel surface |
| v8.0 | Historical | Kernel-first skill, Doctor, First Ship, Hygiene, and v7.x archive triage |
| v8.1-v8.3 | Historical planning | Aspirational docs retained in archive/history, not current runtime doctrine |
| v8.4 | Current | Coherent canonical package, install propagation contract, and stronger drift validation |\n\n\n---\n\n# Documentation Index\n\n*Folded from INDEX.md*\n\n# Atlas Documentation Index

Atlas v8.0 is the current canonical track. `CHARTER_v8.md` is the source of truth for version, command surface, canonical files, and hygiene policy.

## Start Here

| Document | Purpose |
|---|---|
| [README.md](README.md) | Project overview and quick start |
| [SKILL.md](SKILL.md) | Atlas kernel, boot order, phases, and command routing |
| [CHARTER_v8.md](CHARTER_v8.md) | Canonical version, inventory, command surface, and acceptance checks |
| [UPGRADE_GUIDE.md](UPGRADE_GUIDE.md) | v8.0 installation and triage workflow |
| [VERSION.md](VERSION.md) | Compatibility note that points back to the charter |

## v8.0 Core Modules

| Module | Purpose |
|---|---|
| [atlas-doctor.md](atlas-doctor.md) | Read-only skill integrity check |
| [first-ship.md](first-ship.md) | Seven-day first live URL and first-dollar path |
| [skill-hygiene.md](skill-hygiene.md) | Anti-bloat and archive discipline |
| [rationalization-table.md](rationalization-table.md) | Canonical rebuttals to common drift excuses |
| [atlas-triage.ps1](atlas-triage.ps1) | Safe archive script for v7.x bloat |

## Operating Modules

| Area | Modules |
|---|---|
| Launch pipeline | `onboarding.md`, `code-sprint.md`, `security.md`, `legal-compliance.md`, `pre-flight.md`, `launch-strategy.md`, `marketing-playbook.md`, `business-setup.md`, `automation-handoff.md`, `launch-day.md` |
| Growth and revenue | `war-room.md`, `operations.md`, `revenue-intelligence.md`, `growth-engine.md`, `money-engine.md`, `pricing-lab.md`, `cashflow-ops.md`, `offer-forge.md`, `channel-dominance.md`, `acquisition-sniper.md`, `capital-governor.md` |
| Portfolio and delegation | `portfolio.md`, `portfolio-os.md`, `fusion-router.md`, `fleet-subagents.md`, `operator-playbook.md`, `mission-intelligence.md` |
| Support and reference | `scoring.md`, `incident-protocol.md`, `context-window.md`, `edge-cases.md`, `brand-engine.md`, `exit-readiness.md`, `zero-to-first-dollar.md`, `startup-credits-sprint.md` |

## Archive Policy

Historical v7.x and aspirational v8.1/v8.3 files are retained in git history, not in the active skill package. They are not canonical runtime inputs.

Do not add summary, fix-report, runtime-state, `.kiro/`, `_archive/`, or nested `atlas/` files back into the active skill root. Update this index and `CHARTER_v8.md` when a canonical module changes.

## Verification

```bash
node scripts/validate.js
```

Expected result: all Atlas schema checks pass.\n\n\n---\n\n# Canonical Install\n\n*Folded from CANONICAL_INSTALL.md*\n\n# Canonical Install Contract

Atlas has exactly one canonical package at a time. For v8.4, the canonical source tree is the package whose `VERSION.md`, `package.json`, `CHARTER_v8.md`, and `SKILL.md` all agree on `v8.4`.

## Required Runtime Targets

Propagate the complete canonical tree to:

```text
~/.agents/skills/Atlas
~/.claude/skills/Atlas
~/.codex/skills/Atlas
```

Optional compatible runtimes may receive the same tree only when they use the same `SKILL.md` package format.

## Archive Rule

Every non-canonical Atlas co-founder package is archived, not deleted. Archives must preserve the original absolute path in a manifest so a specific old version can be recovered.

Do not archive unrelated products that merely contain the word Atlas, such as MongoDB Atlas tools, Atlassian plugins, texture atlas images, or project-specific files like `projectAtlas.ts`.

## Propagation Gate

Before propagation:

```bash
npm run validate
```

After propagation, run the same validation in each installed target. A target that fails validation is not canonical.\n\n\n---\n\n# Upgrade Guide\n\n*Folded from UPGRADE_GUIDE.md*\n\n# Atlas v8.0 Upgrade Pack — Install & Surgery Notes

*Hi Vince. This is the walkthrough.*

---

## What you're getting

Eight new files. They drop into your existing Atlas skill directory and replace/add a small number of things while leaving the bulk of your work (30+ existing module files, scoring engine, dashboard, automation library) untouched.

```text
SKILL.md                  ← replaces your current SKILL.md (944 lines → ~380)
CHARTER_v8.md             ← new, single source of version truth
first-ship.md             ← new module, the 7-day on-ramp
atlas-doctor.md           ← new module, the integrity check
skill-hygiene.md          ← new module, the anti-bloat doctrine
rationalization-table.md  ← new module, the anti-rationalization rebuttal table
atlas-triage.ps1          ← Windows PowerShell cleanup script (safe, dry-run by default)
UPGRADE_GUIDE.md          ← this file
```

Before triage or Doctor, verify all eight files above are present at the skill root. That's it. No new dependencies. No new sub-projects. No `node_modules` to install.

---

## The honest assessment

Before installing, here's what I think about the version of Atlas you uploaded — said directly, since you asked for tremendous improvement and that requires honesty.

**Your doctrine is excellent.** The Iron Rule, Six-Layer Action Hierarchy, Sovereign Score, Capital Governor, the Fleet sub-agents, the Money/Pricing/Cashflow/Offer/Channel/Sniper protocols — this is the work of someone who has thought very hard about what an AI co-founder *should* be. Reading the modules, I'd say the strategic IQ of Atlas is genuinely high.

**The skill scaffolding is a mess.** Specifically:

- **923 markdown files in the skill directory.** Anthropic's skill guide recommends SKILL.md under 500 lines and modules organized by clear hierarchy. You have 944 lines of SKILL.md and a flat directory.
- **14 duplicate uppercase/lowercase filename pairs.** `IMPROVEMENTS_INDEX.md` + `improvements-index.md`, `MASTER_SUMMARY.md` + `master-summary.md`, and so on. This is the residue of an incomplete rename pass that was never completed.
- **15+ "improvement summary" files** with overlapping names: `MASTER_SUMMARY`, `FINAL_SUMMARY`, `CONTINUATION_SUMMARY`, `IMPROVEMENTS_INDEX`, `IMPROVEMENTS_SUMMARY`, `IMPROVEMENT_GUIDE`, `FIXES_COMPLETE`, `ALL_FIXES_COMPLETE`, `INCONSISTENCIES_FIXED`, `WEAKEST_ASPECTS_FIXED`, `TREMENDOUS_IMPROVEMENTS_V8.1`, `MODULE_AUDIT_v8.3`, `STRATEGIC_ARCHITECTURE_v8.3`, `IDEAL_VS_ACTUAL`, `IMPROVEMENTS_DELIVERED.txt`. None of these are loaded by Atlas at runtime. They're scaffolding from your iterative work that never got cleaned up.
- **`node_modules/` committed at the skill root.** 164 subdirectories of Node packages, presumably from running `npm install` somewhere that wasn't `scoring-engine/`. They have no business in a Claude skill.
- **Three recursive copies of SKILL.md** — `/SKILL.md`, `/atlas/SKILL.md`, `/atlas/atlas/SKILL.md`. The skill literally contains itself, twice nested.
- **Version mismatch.** SKILL.md body says `v7.2`. The directory contains `MODULE_AUDIT_v8.3.md`, `STRATEGIC_ARCHITECTURE_v8.3.md`, `TREMENDOUS_IMPROVEMENTS_V8.1.md`. Claude reading this skill cannot tell which version is canonical.

**Why this matters specifically for you.** Your profile says your operating philosophy is ImprovementBot 4.1, which "prioritizes shipping and finishing over scope expansion." Atlas v7.x is the opposite of ImprovementBot. It is scope-expanded, unshipped, drifted, accumulating self-referential documentation. **You have not applied your own ImprovementBot to your own meta-tool.**

**The biggest single gap.** Your memory says you've built 600+ projects and the recent shift is "actually deploying work — SweepBot being the primary candidate for his first real launch." The current 21-phase Atlas pipeline assumes the founder already knows how to launch and is optimizing for compounding revenue. It's the wrong tool for the cold-start case. That's why v8.0 adds **First Ship Mode** — a 7-day compressed pipeline that bypasses the empire architecture and ends at a single $1 transaction from a non-founder email.

---

## What v8.0 changes

### 1. SKILL.md — 944 lines → ~380 lines

The new SKILL.md is a **kernel**. It contains the Iron Rule, Hands-Off Mandate, Six-Layer Hierarchy, mode-detection state machine, subcommand table, pipeline phase table, scoring summary, state-layer layout, and the top-10 rationalizations. Everything else (full scoring algorithms, detailed protocols, edge cases, rationalization details, deep module material) was already in your existing module files — the old SKILL.md was duplicating it. I removed the duplication. Your module files are unchanged.

This follows Anthropic's progressive disclosure principle: **metadata always loaded, SKILL.md body loaded when skill triggers, modules loaded on demand.** Your existing v7.2 SKILL.md violated this. v8.0 honors it.

### 2. First Ship Mode (`first-ship.md`) — the new module

Detects when a founder has no prior shipped products (`founder-profile.json.shipped_products: 0`) or when you type `/atlas ship`. Runs a 7-day compressed pipeline:

- **Day 0** — Scope lock to 3 features in `SHIP_CHARTER.md`
- **Day 1** — Strip out-of-charter code; deploy minimum viable artifact
- **Day 2** — Wire Stripe Checkout, test purchase end-to-end
- **Day 3** — Generic ToS/Privacy live at `/terms`, `/privacy`
- **Day 4** — Landing page that converts (no carousels, no chatbots, one CTA)
- **Day 5** — 10–25 personalized outreach messages drafted (NOT sent)
- **Day 6** — Founder sends; Atlas works on backups in parallel
- **Day 7** — First Dollar Gate — Stripe charge from non-founder email, or refine

Explicit anti-perfectionism doctrine. Explicit deferred-phases list (Brand, Exit Readiness, Capital Governor, all the v15–v21 stuff). On gate pass, auto-promotes to Standard mode at Phase 10 (War Room).

This is the most important addition for your specific case.

### 3. `/atlas doctor` (`atlas-doctor.md`) — mandatory integrity check

Runs before every `/atlas` invocation. Eight checks:
1. SKILL.md canonical (exactly one, ≤500 lines, version-correct)
2. Module references resolve (every `*.md` mentioned in SKILL.md exists)
3. No duplicate-pair files (specifically watches for the 14 v7.x clusters)
4. No recursive nesting (no `atlas/SKILL.md` inside the atlas skill)
5. State directory health (`~/.atlas/` writable, `context.json` parses)
6. Version coherence (Charter version == SKILL.md version)
7. Scoring engine reachable
8. `node_modules/` hygiene

If FAIL, Atlas refuses to run. No `--force` flag. This is the lesson learned from v7.x: a skill that runs while broken produces silent corruption.

### 4. Skill Hygiene (`skill-hygiene.md`) — anti-bloat doctrine

Hard rules:
- One SKILL.md per skill
- No files named `*IMPROVEMENT*`, `*SUMMARY*`, `*FIXES_COMPLETE*`, `*MASTER*`, `*FINAL*`, `*CONTINUATION*`, `*TREMENDOUS*`, `*WEAKEST*`, `*IDEAL_VS_*`, `*INCONSISTENCIES*`, `*MODULE_AUDIT*`, `*STRATEGIC_ARCHITECTURE*` at the skill root
- No uppercase+lowercase pairs
- No `node_modules/` at root
- No `-v[N]` suffixed copies
- No nested `atlas/` directory
- 60-module soft ceiling, with social enforcement above 50

The doctrine has a "Quick Summary File Antipattern" table that translates urges to better moves: "When you feel like writing `IMPROVEMENTS_INDEX.md`, write one new line in `CHANGELOG.md` instead."

### 5. Charter v8.0 (`CHARTER_v8.md`) — single version source

Declares v8.0 canonical. Lists which files are CORE, MODULES, REFERENCE, COMPILED, ARCHIVE. Lists the renames from v7.x. Resolves the "v7.2 in body, v8.1/v8.3 in directory" drift problem permanently.

If you want to know which version Atlas is at, you read CHARTER. If SKILL.md and CHARTER disagree, Doctor reports FAIL.

### 6. Triage script (`atlas-triage.ps1`)

Safe Windows cleanup script. **Dry-run by default.** Reports what it would move; nothing happens until you re-run with `-Force` and type `YES`. Use it as a local migration aid before committing the lean v8 tree. Runtime packages should not commit `_archive/` output.

---

## How to install

### Step 0: Back up first (1 minute)

You're already version-controlled — your skill directory has `.git/`. Good. Just commit current state before changing anything:

```powershell
cd C:\Users\MQ420_OL\.claude\skills\atlas    # or wherever yours lives
git add -A
git commit -m "Pre-v8.0 snapshot"
git push                                       # if you have a remote
```

### Step 1: Copy the eight new files in

From this upgrade pack:

```text
SKILL.md          → C:\Users\MQ420_OL\.claude\skills\atlas\SKILL.md          (overwrites)
CHARTER_v8.md     → C:\Users\MQ420_OL\.claude\skills\atlas\CHARTER_v8.md     (new)
first-ship.md     → C:\Users\MQ420_OL\.claude\skills\atlas\first-ship.md     (new)
atlas-doctor.md   → C:\Users\MQ420_OL\.claude\skills\atlas\atlas-doctor.md   (new)
skill-hygiene.md  → C:\Users\MQ420_OL\.claude\skills\atlas\skill-hygiene.md  (new)
rationalization-table.md → C:\Users\MQ420_OL\.claude\skills\atlas\rationalization-table.md (new)
atlas-triage.ps1  → C:\Users\MQ420_OL\.claude\skills\atlas\atlas-triage.ps1  (new)
UPGRADE_GUIDE.md  → wherever you want (or skill root is fine)
```

You only overwrite SKILL.md. The other seven are new files that don't conflict with anything.

### Step 2: Run triage in dry-run mode (30 seconds)

```powershell
cd C:\Users\MQ420_OL\.claude\skills\atlas
.\atlas-triage.ps1 -SkillPath .
```

You'll see a summary like:

```text
Summary of operations:
  Meta/summary bloat files:    32
  Uppercase duplicate files:   3
  Old-version modules:         1
  Root-level non-skill bloat:  3
  Recursive skill copies:      2
  ───────────────────────────────
  Total operations:            41

  DRY RUN — no files were moved.
```

Read through what it wants to move. If anything in the list is something you actually want kept at the skill root, **don't run with -Force yet** — tell me which one and we'll revise. Otherwise:

### Step 3: Run triage for real (1 minute)

```powershell
.\atlas-triage.ps1 -SkillPath . -Force
# Type YES when prompted
```

Files move to a local `_archive/v7_pre_triage/` staging area. Review that output, then keep only canonical v8 files in the committed package.

### Step 4: Verify with Doctor (1 minute)

In a Claude session with the Atlas skill:

```text
/atlas doctor
```

Expected output:

```text
─────────────────────────────────────────────────────
ATLAS DOCTOR — v8.0 INTEGRITY CHECK

[1] SKILL.md canonical ............... ✅
[2] Module references resolve ........ ✅
[3] No duplicate files ............... ✅
[4] No recursive nesting ............. ✅
[5] State directory health ........... ✅
[6] Version coherence ................ ✅
[7] Scoring engine reachable ......... ✅
[8] node_modules hygiene ............. ✅

VERDICT: PASS
Atlas v8.0 is healthy. Proceeding.
─────────────────────────────────────────────────────
```

If anything fails, Doctor tells you exactly what and exactly how to fix it.

### Step 5: Commit and push

```powershell
git add -A
git commit -m "[Atlas] v8.0 upgrade: kernel-first SKILL.md, First Ship mode, Doctor, Hygiene, v7.x triage"
git push
```

### Step 6: Try First Ship on SweepBot

Your profile flags SweepBot as your most-deployment-ready project. Open a session in that project's directory:

```text
/atlas ship
```

Atlas will detect First Ship Mode is appropriate, write `SHIP_CHARTER.md`, lock to 3 features, and run the 7-day pipeline.

---

## What if something breaks

Three failure modes to know about:

**Doctor reports FAIL after triage.** Re-read the specific check that failed. If it's check 2 (module references), one of your existing modules might reference a retired file. The fix: edit the module to remove the reference, OR restore the specific file from git history and make it canonical. The first is better.

**You miss one of the retired files.** Restore it from git history, then decide whether it belongs as a canonical module or a changelog note.

**You want to roll back to v7.2 entirely.** `git reset --hard HEAD~1` (or whatever commit point you want) and you're back. The triage commit is one commit; reverting it un-does the upgrade cleanly.

---

## What v8.0 doesn't fix (and the next iteration could)

I want to be honest about scope. Here's what I considered and decided to leave for later:

1. **The 30+ existing modules are unaudited.** I read the headers and the SKILL.md references. I did not read every line of `growth-engine.md`, `mission-intelligence.md`, etc. They might have their own drift problems. A v8.1 audit pass could rationalize their internal structure too. For now, they work and they're preserved.

2. **No telemetry on Atlas itself.** You can't ask "how often did Atlas trigger First Ship Mode in the last 30 days?" — that data isn't captured. A v8.x feature could write Atlas-invocation events to `~/.atlas/atlas-usage.jsonl` and let `/atlas status` report patterns.

3. **No actual `atlas-doctor-tests/` fixtures.** I describe them in `atlas-doctor.md` but didn't ship them. Creating real test fixtures for the doctor (healthy, duplicate-files, nested-skill, version-drift, broken-reference) would let you regression-test the doctor itself. ~1 hour of work.

4. **No CHANGELOG.md.** I describe it in `skill-hygiene.md` but didn't generate one. You'd want to write the v7.x history into it. ~30 minutes if you cherry-pick from the archived summary files.

5. **First Ship is opinionated.** I picked 3 features, 7 days, 10–25 outreach humans, $1 gate. These numbers come from common indie-launch advice but they're not science. If you run First Ship on SweepBot and the rhythm doesn't fit, the module is editable — adjust day counts, gate criteria, charter shape. The architecture (auto-promote at gate, defer Phase 13+ during First Ship) is the durable part.

---

## A note on tone

You wrote Atlas in a punchy, doctrinaire voice — "The Iron Rule", "Violating the letter is violating the spirit", "Atlas does not ask permission" — and I matched it in the new modules. If you find the voice grating in v8.0, the right edit is to soften it across all modules consistently. Either keep the high-conviction tone everywhere or move to a flatter analytical tone everywhere. Mixed registers confuse the read.

For what it's worth, I think the high-conviction tone is correct for this skill. A co-founder skill that hedges is a consultant skill.

---

## One last thing

The single biggest reason I think you'll ship SweepBot now and not before is **not** any of the architectural changes. It's that v8.0 gives you permission to ship at score 35 with one paying customer, instead of holding for the full Sovereign 90.

You've spent two years building skills that automate sovereignty. The lesson the work has been teaching you, that I think you haven't taken yet, is that sovereignty is downstream of the first $1. The order is: ship → learn → compound → sovereign. Not: design for sovereignty → ship.

First Ship Mode is the on-ramp the previous Atlas was missing. Use it. The other 20 phases will be there when you get to them.

---

**Atlas v8.0 — installed in seven files, hardened with one Doctor, on-ramped with one new mode.**\n