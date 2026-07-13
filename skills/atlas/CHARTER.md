---
name: charter
description: Canonical Atlas charter — version of record, file inventory, command surface, renumbering map, and the road-to-v1.0 gate.
---

# Atlas Charter

*One document. One version. Read this first if you are confused about anything.*

---

## Status

**Atlas v0.9.1 is the current canonical version, dated 2026-07-12.**

This Charter is the single source of truth for which version Atlas is at, which files are canonical, and which files have been retired. If any file in the skill directory disagrees with this document, this document wins. `/atlas doctor` and `node scripts/validate.js` enforce coherence mechanically — the canonical version is derived from `package.json`, never from a hardcoded grep.

---

## The Renumbering (July 2026)

Everything previously published as v1 through v8.4 is retroactively renumbered to v0.1 through v0.8.4. **v1.0 is reserved for the first complete, commercially distributable release.** Nothing about the renumbered releases changed except their labels.

| Original label | Canonical label | What it was |
|---|---|---|
| v1–v5 | v0.1–v0.5 | Early operating models |
| v6.x | v0.6.x | Static scoring era |
| v7.0 | v0.7.0 | Federated routing, expanded modules |
| v7.2 | v0.7.2 | Decision-tree priorities, large kernel surface |
| v8.0 | v0.8.0 | Kernel-first triage: Doctor, First Ship, Hygiene |
| v8.1–v8.3 | v0.8.1–v0.8.3 | Aspirational planning docs (historical) |
| v8.4 | v0.8.4 | Coherent canonical package, install propagation, drift validation |
| — | **v0.9** | **Current: Leverage Mandate, Heartbeat, hosted Dashboard, Evidence Doctrine** |
| — | v1.0 | The commercial gate (below) |

---

## What v0.9 Is

v0.8.4 made Atlas *coherent*. v0.9 makes it *concurrent, continuous, and evidence-bound*:

1. **The Leverage Mandate** (kernel) + **`leverage-engine.md`** (new module). Atlas binds to the harness's force multipliers: fleet fan-out for ≥3 independent tasks, adversarial verification for revenue-facing claims, capability discovery (ToolSearch/MCP registry) before any "no API" claim, graceful fallbacks when a capability is absent.
2. **The Heartbeat** (`/atlas heartbeat`). Scheduled autonomous ticks (nightly operator, weekly growth/portfolio/drift) with hard unattended-run bounds. Sovereign's "zero human commits for 14 days" is now mechanically achievable rather than aspirational.
3. **The hosted Sovereign Dashboard** (`/atlas dashboard`). A stable, phone-openable URL refreshed every tick — the primary status surface. `dashboard-template.html` remains the renderer and the fallback.
4. **The Evidence Doctrine.** Every phase exit and delegated task appends captured proof to `evidence.jsonl`. Claims without evidence are hypotheses.
5. **Layer 3 split (3a/3b).** Sandbox browser automation vs. the founder's own logged-in browser. Authenticated-portal work becomes executable; the founder still personally performs sign-ins, MFA, payment consents, and final submits. All v0.8 safety boundaries are preserved verbatim.
6. **Real-time founder I/O.** `userMust` items ship to the founder the moment they are found (task chip + push notification). End-of-run consolidation is the backstop.
7. **Fleet made real.** `fleet-subagents.md` delegation now specifies actual subagent dispatch with a 5-part prompt contract and schema returns; `fusion-router.md` routes to capabilities that exist in the current ecosystem, with runtime discovery for the rest.
8. **De-versioned plumbing.** `CHARTER_v8.md` → `CHARTER.md`; validators and doctor derive the version from `package.json`.

**What did not change:** the Iron Rule, Sovereign Score algorithm, 21-phase pipeline, First Ship mode, Self-Healing Protocol, state-layer schema (two additive files: `evidence.jsonl`, `heartbeat.json`), git protocol, hygiene doctrine, and every safety boundary.

---

## File Inventory

### CORE (always at skill root)

```text
SKILL.md                   ← the kernel
CHARTER.md                 ← this file (version of record)
CHANGELOG.md               ← the only changelog
VERSION.md                 ← compatibility pointer to this Charter
README.md                  ← outward-facing intro
CANONICAL_INSTALL.md       ← propagation contract
INDEX.md                   ← file map for humans
UPGRADE_GUIDE.md           ← migration notes
LICENSE
dashboard-template.html    ← dashboard renderer (hosted publish + fallback)
package.json / package-lock.json
```

### MODULES (active, referenced from SKILL.md)

New in v0.9:
```text
leverage-engine.md         ← force-multiplier doctrine: orchestration, heartbeat,
                             dashboard, evidence, founder I/O, discovery, memory
```

New in v0.9.1:
```text
deployment-engine.md       ← deployment platform detection and execution protocol
penetration-tester.md      ← authorized, non-destructive DAST protocol
user-interview-engine.md   ← evidence-driven customer interview workflow
```

Carried forward (canonical names):
```text
atlas-doctor.md  first-ship.md  skill-hygiene.md  rationalization-table.md
onboarding.md  code-sprint.md  security.md  legal-compliance.md  pre-flight.md
launch-strategy.md  marketing-playbook.md  brand-engine.md  business-setup.md
automation-handoff.md  credential-acquisition.md  launch-day.md  war-room.md
operations.md  revenue-intelligence.md  growth-engine.md  exit-readiness.md
money-engine.md  pricing-lab.md  cashflow-ops.md  offer-forge.md
channel-dominance.md  acquisition-sniper.md  capital-governor.md  scoring.md
incident-protocol.md  context-window.md  fleet-subagents.md
mission-intelligence.md  operator-playbook.md  fusion-router.md
portfolio.md  portfolio-os.md  edge-cases.md  atlas-brain.md
api-execution-engine.md  deployment-engine.md  startup-credits-sprint.md
zero-to-first-dollar.md  hands-off-gaps.md
```

### REFERENCE (deep-dive, loaded on demand)

```text
atlas-kernel.md  advanced-features.md  adversarial-and-epistemic.md
```

### EXECUTABLE + SUB-PROJECTS

```text
scripts/validate.js        ← 110+ mechanical coherence checks
scripts/atlas/             ← doctor, cli, pulse, monitor, weekly-review, etc.
scoring-engine/            ← TypeScript scoring engine (own package)
automation-library/        ← reusable workflow JSON
atlas-triage.ps1  run-atlas-on-atlas.ps1
.github/                   ← validate + weekly-review workflows, prompts
```

### RETIRED

Retired files are recoverable from git history only. The active tree does not carry `_archive/`, runtime state, or meta-summary files. See `skill-hygiene.md`.

---

## Subcommand Surface

The full surface of `/atlas X` commands. `scripts/atlas/command-registry.js` is the machine-readable source; validate.js asserts SKILL.md and this block match it.

```text
/atlas                       Autonomously start, resume, recover, or operate Atlas
/atlas status                Read-only progress summary
/atlas pause                 Safely pause autonomous work
/atlas doctor                Read-only installation diagnostic
```

4 commands are canonical. `/atlas` runs Doctor internally and routes to the appropriate internal module; founders never select phases, domains, fleets, or dashboards manually. `/atlas pause` persists the pause after any non-destructive in-flight write and starts no new external action.

---

## Acceptance Test

To verify v0.9 is correctly installed, from the skill root:

```bash
node scripts/validate.js        # Expected: all checks pass
node scripts/atlas/doctor.js    # Expected: Atlas Doctor: PASS
```

Then in a Claude session: `/atlas doctor` → VERDICT: PASS, and `/atlas status` → header includes "Atlas v0.9". Both validators derive the version from `package.json`; there is nothing version-specific to update in them at the next bump.

---

## The Road to v1.0 — The Commercial Gate

v1.0 is the first version the founder charges money for. It ships when **all** of the following are true, each with evidence:

| # | Gate | Proof required |
|---|---|---|
| 1 | **Proven end-to-end.** Atlas has taken ≥3 real projects (≥1 not the author's) from broken code to First Ship gate ($1 collected), and ≥1 to Sovereign Score 80+ | evidence.jsonl trails + dashboard URLs |
| 2 | **Behavioral test suite green.** Scenario suite (parallel-operator, overnight-autonomy, dashboard-delivery, ghost-capability routing, channel-research, verify-before-claim) passes against the shipped kernel | recorded scenario transcripts |
| 3 | **One-command install.** A single installer propagates the canonical tree to all runtime targets and validates each (`CANONICAL_INSTALL.md` automated) | installer run log on a clean machine |
| 4 | **Zero validator debt.** validate.js + doctor.js pass on every propagation target; no WARNs | validator output |
| 5 | **Buyer-grade docs.** Quickstart (≤10 min to first `/atlas` run), demo recording, FAQ, troubleshooting — written for a stranger, not the author | docs reviewed by ≥1 outside beta user |
| 6 | **Licensing + pricing decided.** License terms, price point, refund policy, update/support policy | committed LICENSE + pricing one-pager |
| 7 | **Security pass.** security-review of all scripts (esp. credential-browser.js); no secret-handling regressions | review report |
| 8 | **Support surface.** A buyer can report a bug and get updates (repo/issues/channel) | live channel |

Until all eight gates hold, the version stays 0.9.x. Hardening fixes bump the patch; the gates bump the major.

---

## Hand-off Note

This Charter is short on purpose. The doctrine lives in SKILL.md and the modules. This document answers one question: *which version are we, which files are canonical, and what stands between here and v1.0.*

If Doctor reports a discrepancy: update the disagreeing file to match this Charter, or update this Charter and bump the version — then re-run Doctor. Both are valid. Drift between them is not.

---

**v0.9.1. One kernel. One charter. One changelog. Fleet real. Heartbeat live. Evidence or it didn't happen.**
