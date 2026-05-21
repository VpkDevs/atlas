---
name: upgrade-guide
description: Atlas v8.0 upgrade pack installation and surgery notes.
---

# Atlas v8.0 Upgrade Pack — Install & Surgery Notes

*Hi Vince. This is the walkthrough.*

---

## What you're getting

Eight new files. They drop into your existing Atlas skill directory and replace/add a small number of things while leaving the bulk of your work (30+ existing module files, scoring engine, dashboard, automation library) untouched.

```
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

Safe Windows cleanup script. **Dry-run by default.** Reports what it would move; nothing happens until you re-run with `-Force` and type `YES`. Moves files to `_archive/v7_pre_triage/` with a `TRIAGE_LOG.txt` recording every operation. Idempotent. Never deletes.

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

### Step 1: Copy the seven new files in

From this upgrade pack:

```
SKILL.md          → C:\Users\MQ420_OL\.claude\skills\atlas\SKILL.md          (overwrites)
CHARTER_v8.md     → C:\Users\MQ420_OL\.claude\skills\atlas\CHARTER_v8.md     (new)
first-ship.md     → C:\Users\MQ420_OL\.claude\skills\atlas\first-ship.md     (new)
atlas-doctor.md   → C:\Users\MQ420_OL\.claude\skills\atlas\atlas-doctor.md   (new)
skill-hygiene.md  → C:\Users\MQ420_OL\.claude\skills\atlas\skill-hygiene.md  (new)
atlas-triage.ps1  → C:\Users\MQ420_OL\.claude\skills\atlas\atlas-triage.ps1  (new)
UPGRADE_GUIDE.md  → wherever you want (or skill root is fine)
```

You only overwrite SKILL.md. The other six are new files that don't conflict with anything.

### Step 2: Run triage in dry-run mode (30 seconds)

```powershell
cd C:\Users\MQ420_OL\.claude\skills\atlas
.\atlas-triage.ps1 -SkillPath .
```

You'll see a summary like:

```
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

Files move to `_archive/v7_pre_triage/`. Nothing is deleted.

### Step 4: Verify with Doctor (1 minute)

In a Claude session with the Atlas skill:

```
/atlas doctor
```

Expected output:

```
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

```
/atlas ship
```

Atlas will detect First Ship Mode is appropriate, write `SHIP_CHARTER.md`, lock to 3 features, and run the 7-day pipeline.

---

## What if something breaks

Three failure modes to know about:

**Doctor reports FAIL after triage.** Re-read the specific check that failed. If it's check 2 (module references), one of your existing modules might reference an archived file. The fix: edit the module to remove the reference, OR un-archive the specific file from `_archive/v7_pre_triage/`. Both work; the first is better.

**You miss one of the archived files.** Everything is in `_archive/v7_pre_triage/` with a `TRIAGE_LOG.txt`. Move it back to wherever it came from. Nothing was deleted.

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

**Atlas v8.0 — installed in seven files, hardened with one Doctor, on-ramped with one new mode.**
