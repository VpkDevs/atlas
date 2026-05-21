---
name: version
description: Atlas version single source of truth.
---

# Atlas Version — Single Source of Truth

**Current Version:** `v8.3`
**Last Updated:** 2026-05-15
**Atlas Kernel:** v1.0 (loaded by all sessions; never grows)

---

## What This File Is

This is the **only** file in Atlas that declares the canonical version. Every other module's version header should reference this file rather than hard-coding a version string.

If you see version "v7.2" or "v8.0" or "v8.1" mentioned in another `.md` file, that file is stale and should be updated to reference `v8.3` (or whatever this file says).

---

## Version History

| Version | Released | Key Capability |
|---------|----------|----------------|
| v6.x | 2025-Q3 | Static scoring, no learning |
| v7.0 | 2025-Q4 | Federated routing (fusion-router v1) |
| v7.2 | 2025-Q4 | Decision tree priorities |
| v8.0 | 2026-Q1 | Sovereign money engine |
| v8.1 | 2026-Q1 | 22-phase pipeline, capital governor |
| v8.2 | 2026-05-08 | **6 deterministic engines** (adaptive decision, dimension weighting, advanced feedback, causal inference, experimentation, adaptive uncertainty) |
| **v8.3** | 2026-05-15 | **+6 more engines:** adversarial testing, epistemic/aleatoric uncertainty, real-time feedback, value of information, heterogeneous effects, Pareto optimization, interaction effects, Atlas Router/Kernel. Plus Atlas-on-Atlas recursive self-evaluation. |

---

## Engines in v8.3 (Canonical List)

### Deterministic (from v8.2)
1. `scoring-engine/src/learning/AdaptiveDecisionEngine.ts`
2. `scoring-engine/src/learning/DimensionWeightingEngine.ts`
3. `scoring-engine/src/feedback/AdvancedFeedbackLoopEngine.ts`
4. `scoring-engine/src/correlation/CausalInferenceEngine.ts`
5. `scoring-engine/src/experimentation/ExperimentationEngine.ts`
6. `scoring-engine/src/uncertainty/AdaptiveUncertaintyEngine.ts`

### Deterministic (new in v8.3)
7. `scoring-engine/src/experimentation/AdversarialTestingEngine.ts`
8. `scoring-engine/src/uncertainty/EpistemicAleatoric.ts`
9. `scoring-engine/src/realtime/RealTimeFeedbackEngine.ts`
10. `scoring-engine/src/decision/ValueOfInformationEngine.ts`
11. `scoring-engine/src/learning/HeterogeneousEffectsEngine.ts`
12. `scoring-engine/src/optimization/ParetoOptimizationEngine.ts`
13. `scoring-engine/src/learning/InteractionEffectsEngine.ts`
14. `scoring-engine/src/router/AtlasRouter.ts`

All engines accept an optional `SeededRNG` in their constructor for full determinism. Without a seed, they fall back to `Math.random()` (backward-compatible).

---

## Architecture Layers (v8.3)

```
┌─────────────────────────────────────────────────┐
│  ATLAS_KERNEL.md   (routing, single source)     │
│  ↓                                              │
│  Per-task module loading (3-5 of ~90 modules)   │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│  fleet-subagents.md  (execution delegation)     │
│  operator-playbook.md (cadence: daily/weekly)   │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│  14 Deterministic Engines (TypeScript)          │
│  Pure functions; same input → same output       │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│  .atlas-state/   (persistent JSON/JSONL)        │
│  Decision history, scorecards, learnings        │
└─────────────────────────────────────────────────┘
```

---

## Deprecated / Archived

These files reference earlier architectures and are no longer canonical:

- `docs/archive/fusion-router-v7.2-deprecated.md` — Replaced by ATLAS_KERNEL.md
- `docs/archive/fusion-router-v2-future-design.md` — Pseudocode, no runtime; future design only

---

## Atlas-on-Atlas

As of v8.3, Atlas can score itself. See:
- `HOW_TO_RUN_ATLAS_ON_ATLAS.md` — One-command launcher
- `.atlas-state/atlas-self/score-atlas-with-atlas.mjs` — The script
- `.atlas-state/atlas-self/latest-report.json` — Most recent self-score

Current self-score: **10.0 ± 4.5 / 10** (will update post-hardening).

---

## Migration Notes

**If you were running v8.0/v8.1 and want to adopt v8.3:**

1. **No breaking changes.** All v8.3 engines are opt-in. Existing pipelines continue to work.
2. **Wire engines incrementally.** See `IMPROVEMENT_GUIDE.md` for the recommended week-by-week adoption order.
3. **Update version headers.** If your custom modules claim v7.x or v8.0, change them to reference this file.
4. **Re-run Atlas-on-Atlas.** After adoption, score should rise as more engines participate.

---

## How to Reference This Version in Other Files

In any module's header, instead of writing:
```
# My Module v8.1
```

Write:
```
# My Module (Atlas v8.3 — see VERSION.md)
```

This ensures no module ever falls out of sync with the canonical version.
