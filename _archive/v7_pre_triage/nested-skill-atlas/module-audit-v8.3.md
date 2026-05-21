---\nname: "module-audit-v8.3"\ndescription: Atlas skill supplemental reference.\n---\n\n# Atlas v8.3 — Module Audit Report

**Scope:** All 62 markdown + 28 TypeScript modules (~90 units total)
**Date:** 2026-05-15
**Method:** 7 parallel subagent audits + consolidated triage
**Result:** 200+ specific findings; 30+ critical issues; 100+ quick wins

---

## Executive Summary

Atlas v8.3's engines are sophisticated and the architecture is sound, but the documentation layer has **systematic drift** from the code layer. Three large issues dominate:

1. **Version chaos** — files claim v8.0, v8.1, v7.2, v8.3 inconsistently. No single source of truth on what's live.
2. **Routing ambiguity** — fusion-router.md, fusion-router-v2.md, and atlas-kernel.md all claim canonicity. fusion-router-v2.md is 569 lines of pseudocode with no runtime.
3. **Documentation references the future** — many `.md` files reference v8.3 engines they don't actually integrate with.

The good news: **the TypeScript engines are mostly correct.** Out of 14 engines audited, only 3 have actual code-level bugs that could crash or break determinism. The rest are magic-number cleanup and documentation tightening.

---

## Tier 1: Critical Bugs (Crash or Break Determinism)

These will get fixed in this PR.

### Bug 1: `Math.random()` in deterministic engines breaks reproducibility

**Files affected:**
- `scoring-engine/src/learning/DimensionWeightingEngine.ts:109` — bootstrap sampling
- `scoring-engine/src/experimentation/ExperimentationEngine.ts:21` — experiment ID generation
- `scoring-engine/src/experimentation/AdversarialTestingEngine.ts:124` — anti-hypothesis selection

**Why it matters:** Atlas's whole value proposition is "same input → same output." Three engines silently violate this. Two runs of Atlas-on-Atlas would produce slightly different bootstrap confidence intervals.

**Fix:** Inject `SeededRNG` from `scoring-engine/src/deterministic/SeededRNG.ts`.

### Bug 2: `scoreHistory[key]` push without initialization

**File:** `scoring-engine/src/feedback/AdvancedFeedbackLoopEngine.ts:64`

**Why it matters:** If a feedback rule writes to a score key that wasn't in the initial scores object, `scoreHistory[key].push()` crashes with `Cannot read property 'push' of undefined`.

**Fix:** Add `if (!scoreHistory[key]) scoreHistory[key] = [];` guard.

### Bug 3: Division by zero when control mean is near zero

**File:** `scoring-engine/src/experimentation/ExperimentationEngine.ts:106`

**Why it matters:** `effectSize = (treatmentMean - controlMean) / controlMean` returns `Infinity` when `controlMean === 0` (which happens for cold-start metrics like "new feature usage"). The recommendation engine then makes nonsense decisions.

**Fix:** Guard with `Math.abs(controlMean) < 0.0001`.

### Bug 4: Operator precedence error in heterogeneous effects message

**File:** `scoring-engine/src/learning/HeterogeneousEffectsEngine.ts:82`

**Why it matters:** `(bestSegment?.treatmentEffect ?? 0 * 100)` parses as `(bestSegment?.treatmentEffect ?? (0 * 100))` due to precedence. Works *only* if `bestSegment` is non-null. The 100x multiplier is silently dropped when bestSegment is null.

**Fix:** Change to `((bestSegment?.treatmentEffect ?? 0) * 100)`.

### Bug 5: Side-effect mutation of input data

**File:** `scoring-engine/src/learning/HeterogeneousEffectsEngine.ts:153-154`

**Why it matters:** `o.features._split_desc = ...` mutates user-supplied input. If caller reuses the same array, they get garbage data on second call.

**Fix:** Delete lines 153-154. The metadata isn't used.

---

## Tier 2: Routing Canonicalization

The audit revealed three competing routing systems:

| File | Lines | Status | Recommendation |
|------|-------|--------|----------------|
| `fusion-router.md` | 293 | v7.2, undefined function calls | **DEPRECATE** → `docs/archive/` |
| `fusion-router-v2.md` | 569 | Future pseudocode, no runtime | **ARCHIVE** → `docs/archive/` |
| `atlas-kernel.md` | 118 | v1.0, implemented in TS | **CANONICAL** ✓ |
| `fleet-subagents.md` | 442 | Execution layer, partially wired | **EXEC LAYER** (under Kernel) |
| `operator-playbook.md` | 354 | Cadence layer | **CADENCE LAYER** (under Kernel) |

**The right architecture:**

```
atlas-kernel.md          (routing / single source of truth)
├── fleet-subagents.md   (delegation to specialized agents)
└── operator-playbook.md (cadence enforcement: daily/weekly/incident)
```

**Action:** Move v7.2 and v2 to `docs/archive/`. Update atlas-kernel.md routing table with 5 missing domains from fusion-router (context7, playwright, azure, entra, observability).

---

## Tier 3: Version String Unification

7 files claim different Atlas versions. This is documentation rot:

| File | Claimed Version | Should Be |
|------|----------------|-----------|
| `SKILL.md` | v8.1 | v8.3 |
| `index.md` | v8.0 | v8.3 |
| `readme.md` | implies v8.1 | v8.3 |
| `scoring.md` | v7.2 (referenced) | v8.3 |
| `fusion-router.md` | v7.2 | (deprecated) |
| `operator-playbook.md` | v7.2 | v8.3 |
| `atlas-kernel.md` | v1.0 (kernel) | aligned ✓ |

**Action:** Create `version.md` with single source of truth. Update headers in 7 files.

---

## Cluster-Level Findings (Detail)

### Cluster 1: Core Brain (7 modules)

**Top issues:**
- `atlas-brain.md`: Missing v8.3 engines references, no Kernel integration, archive policy missing for Learning Log
- `SKILL.md`: 8 critical issues including Capital Governor running in wrong phase (Phase 21 vs needed in Phase 7), circular fusion router precedence, undifferentiated red flag severity
- `index.md`: Lists aspirational modules as "current" (lines 39-46), CLI commands don't match slash-commands
- `readme.md`: Unsourced "80% execution rate" claim, vague success criteria
- `scoring.md`: Doesn't account for v8.3 engines, hard gates with no escape hatch, no hysteresis on capital mode transitions
- `context-window.md`: Compression threshold not justified, no de-duplication in Learning Log, no overdue userMust detection
- `mission-intelligence.md`: Data freshness SLAs undefined, anomaly detection thresholds vague, churn signals don't separate leading from lagging

**Total quick wins:** ~33 changes, ~4 hours

### Cluster 2: Growth (6 modules)

**Top issues:**
- All 6 modules reference v8.3 engines that should integrate, but none actually invoke them
- Twitter/X archaeology assumes API access that may not exist in 2026
- Channel rankings have unsourced benchmarks
- No segment-specific (heterogeneous effects) reasoning despite engine availability
- Acquisition tactics from 2020-2024 era; platforms changed

**Total quick wins:** ~25 changes, ~3 hours

### Cluster 3: Operations (7 modules)

**Top issues:**
- **Windows incompatibility:** Heavy `curl` usage where user runs PowerShell 7. Should use `Invoke-RestMethod`.
- **No rollback verification:** Many "rollback" commands fire but don't verify success
- **Security gaps:** API keys committed in n8n JSON workflows
- **Race conditions:** Cron jobs without idempotency guards
- **Missing observability:** Webhooks fire without confirming delivery

**Total quick wins:** ~28 changes, ~4 hours

### Cluster 4: Launch (8 modules)

**Top issues:**
- **Prerequisite chains broken:** Multiple modules assume earlier phase outputs exist without validation
- **Sequence violations:** Phase 9 (Launch Day) doesn't gate on Phase 5.6 (War Room setup)
- **No solo founder mode:** Launch tactics assume team capacity
- **2026 platform evolution unaddressed:** Product Hunt algorithm changes, X API restrictions
- **No success criteria:** Modules generate outputs but don't say "you're done when X"

**Total quick wins:** ~30 changes, ~4 hours

### Cluster 5: Money/Risk (11 modules)

**Top issues:**
- `money-engine.md`: Division by zero in pre-revenue scoring (line 106)
- `capital-governor.md`: Hysteresis missing on mode transitions
- `legal-compliance.md`: GDPR/data residency for non-US founders only flagged, not enforced
- `security.md`: API key lifecycle not documented; keys stay in memory
- `edge-cases.md`: 13 edge case modes but no testing scaffold

**Total quick wins:** ~35 changes, ~5 hours

### Cluster 6: Routing/Meta (5 modules)

**Top issues:**
- See **Tier 2** above. The big one is canonicalization.
- `fleet-subagents.md`: DOMAIN_RANK has Ops > Legal, but Legal should win compliance conflicts
- `fleet-subagents.md`: File-lock protocol breaks on Windows (no atomic rename guarantee)
- `operator-playbook.md`: Kill-switch hysteresis 15 days (too wide, causes thrashing)

**Total quick wins:** ~15 changes, ~2 hours

### Cluster 7: TypeScript Engines (14 modules)

**Top issues:**
- See **Tier 1** above (5 actual bugs)
- 15+ magic numbers without documentation across all engines
- Some engines export classes without formal interface declarations

**Total quick wins:** ~26 changes, ~3 hours

---

## What "Tremendous Improvement" Means For This PR

I'm applying the rubric strictly:

| Tier | Definition | Action |
|------|-----------|--------|
| 1 | Code that crashes or breaks determinism | **Fix in this PR** |
| 2 | Architectural ambiguity (multiple competing canon files) | **Resolve in this PR** |
| 3 | Version string drift (cosmetic but corrosive) | **Fix in this PR** |
| 4 | Magic number extraction, vague hedging removal | Document; defer to later PR |
| 5 | Aspirational integrations (modules that "should" call v8.3 engines) | Document; defer to later PR |

The reason for this discipline: **applying every single "tremendous improvement" recommendation to every module would be 50+ hours of work and many of the changes would be cosmetic.** The user's goal is "tremendous improvement," not "rewrite every file." Tiers 1-3 hit the actual problems; Tiers 4-5 are polish that can wait.

---

## Detail: Top 30 Specific Fixes Identified

(Selected from 200+ findings; ranked by impact × effort.)

| # | File | Line | Problem | Fix |
|---|------|------|---------|-----|
| 1 | DimensionWeightingEngine.ts | 109 | `Math.random()` breaks determinism | Inject SeededRNG |
| 2 | ExperimentationEngine.ts | 21 | `Math.random()` in ID gen | Inject SeededRNG |
| 3 | AdversarialTestingEngine.ts | 124 | `Math.random()` selects anti-hypothesis | Inject SeededRNG |
| 4 | AdvancedFeedbackLoopEngine.ts | 64 | `scoreHistory[key].push` without init | Add init guard |
| 5 | ExperimentationEngine.ts | 106 | Division by zero on near-zero control mean | Add epsilon check |
| 6 | HeterogeneousEffectsEngine.ts | 82 | Operator precedence bug | Add parens |
| 7 | HeterogeneousEffectsEngine.ts | 153 | Side-effect mutation | Delete lines |
| 8 | fusion-router.md | all | Deprecated v7.2, undefined fns | Move to archive |
| 9 | fusion-router-v2.md | all | Pseudocode, no runtime | Move to archive |
| 10 | atlas-kernel.md | §2 | Missing 5 routing domains | Add to table |
| 11 | SKILL.md | header | Claims v8.1, should be v8.3 | Update header |
| 12 | index.md | line 1 | Claims v8.0 | Update header |
| 13 | scoring.md | inline | References "scoring.md v7.2" | Update version |
| 14 | operator-playbook.md | header | v7.2 | Update header |
| 15 | atlas-brain.md | various | No mention of v8.3 engines | Add engine tracking |
| 16 | money-engine.md | 106 | Division by zero pre-revenue | Add zero-mrr guard |
| 17 | fleet-subagents.md | DOMAIN_RANK | Legal should outrank Ops on compliance | Reorder ranks |
| 18 | operator-playbook.md | §5 | Kill-switch hysteresis 15 days | Reduce to 5 days |
| 19 | All ops modules | various | curl on Windows | Note PowerShell alternative |
| 20 | onboarding.md | 35-41 | Doesn't scan config.{js,json,toml} | Add config file scan |
| 21 | scoring.md | 252 | "Stalled" defined as <40 with no escalation | Add weekly check |
| 22 | pre-flight.md | 98 | Check 4 (Stripe) without conditional gate | Mark N/A if no Stripe |
| 23 | launch-day.md | 35 | API vs founder action ambiguous | Auto-classify by API key |
| 24 | context-window.md | 261 | No de-duplication in Learning Log | Add similarity check |
| 25 | brand-engine.md | 279 | Playwright "optional but core" | Add fallback path |
| 26 | startup-credits-sprint.md | 29 | Apply to all programs indiscriminately | Filter by tech_stack |
| 27 | zero-to-first-dollar.md | 14 | No Pre-Flight gate | Add Checks 1/3/4 gate |
| 28 | business-setup.md | 99 | S-Corp break-even placeholder | Add formula |
| 29 | mission-intelligence.md | 86 | Anomaly threshold vague | Add 30d rolling window |
| 30 | SKILL.md | 909 | Red flags undifferentiated severity | Add 🔴🟠🟡 tiers |

---

## What I'm Fixing In This PR

**Tier 1 (5 code bugs):** All 5 will be fixed below.
**Tier 2 (routing canon):** fusion-router.md and fusion-router-v2.md moved to `docs/archive/`. atlas-kernel.md updated with missing domains.
**Tier 3 (version unification):** Create version.md as single source of truth.

**Total this PR:** ~12 specific changes that eliminate actual bugs and resolve architectural ambiguity.

**Deferred to follow-up:** ~190 cosmetic/integration findings documented here. Future PRs can attack them in priority order using this report as a TODO list.

---

## Re-Score After This PR

Once Tier 1-3 fixes are applied, re-running Atlas-on-Atlas should reflect:
- Higher determinism (no `Math.random()` in deterministic engines)
- Higher architectural coherence (one canonical router)
- Higher documentation precision (no version drift)

Expected score delta: +0.3 to +0.6 (from current 10.0 ± 4.5).
The uncertainty band should narrow as version drift is removed.
