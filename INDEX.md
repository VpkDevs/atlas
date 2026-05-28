---
name: index
description: Atlas v8.0 documentation index and canonical module inventory.
---

# Atlas Documentation Index

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

Expected result: all Atlas schema checks pass.
