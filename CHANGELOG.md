# Changelog

All notable changes to Atlas are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [7.2.0] - 2026-05-12

### The Sovereign Money Engine

This release makes the `.claude` Atlas tree the canonical v7.2 skill while porting the concrete launch and operations infrastructure from the DEV integration repo.

#### Core Changes
- **Scoring Engine**: `scoring.md` defines exact algorithms for Sovereign Score, Portfolio Priority, Revenue Velocity, Retention Health, Monetization Confidence, Cash Discipline, Fusion Intervention Score, and Capital Mode.
- **Incident Protocol**: `incident-protocol.md` adds P0-P3 response playbooks, SLA targets, incident logging, and post-mortem structure.
- **Atlas Brain**: `atlas-brain.md` adds resumable cross-session state, decision memory, blocker tracking, and rollback registry.
- **Revenue Modules**: `money-engine.md`, `pricing-lab.md`, `cashflow-ops.md`, `offer-forge.md`, `channel-dominance.md`, `acquisition-sniper.md`, and `capital-governor.md` extend Atlas beyond launch into compounding revenue operations.
- **Fusion Router**: `fusion-router.md` routes work across available skills and specialist agents while preserving Atlas gates.

#### Ported From DEV Integration
- `docs/founder/` launch strategy, channel fitness matrix, timestamped launch sequence, and ready-to-post launch assets.
- `docs/legal/` Terms of Service, Privacy Policy, and compliance checklist templates.
- `scripts/atlas/` weekly pulse, decision, notification, and GitHub issue automation.
- `.github/workflows/` schema validation and weekly review workflow.
- `automation-library/` importable n8n workflow templates.
- Package scaffolding: `package.json`, `.gitignore`, `LICENSE`, and this changelog.

#### Script Fixes During Port
- `decide.js` now reads stdin portably with file descriptor `0` instead of `/dev/stdin`.
- `weekly-review.js` now passes pulse JSON into `decide.js` correctly and uses `os.tmpdir()` for cross-platform temp files.
- `validate.js` now checks for this v7.2 changelog section.

---

## [6.0.0] — 2026-04-30

### The Sovereign Empire

This release is a ground-up rebuild of the Atlas architecture. The goal: make the foundation unbreakable before adding empire-scale capabilities.

#### Core Changes
- **Iron Rule upgraded**: Done now means Sovereign Score ≥ 90, sustained 7 days, with revenue > opex and an actual payout in the founder's bank
- **Six-Layer Action Hierarchy**: Direct API → CLI → Browser Automation → Pre-Filled Artifact → The Swarm → Irreducible Founder. Atlas tries all six before declaring a task impossible
- **API Execution Doctrine**: If a tool has an API key in `.env`, Atlas calls it. No more describing setup
- **Deterministic Mode Detection**: Strict state machine — exactly one mode per invocation, no ambiguity
- **End-Run Protocol**: Atlas never stops mid-pipeline due to a blocker. It routes around, continues, surfaces all blockers at the end
- **Sovereign Score (0–100)**: Replaces the old "runs-itself score." New categories include Economic Sovereignty and Social Presence. Target is 90

#### New Modules
- **`fleet-subagents.md`** — Multi-agent coordination layer. 7 specialized sub-agents (Ops, Growth, Product, Wealth, HR/Swarm, Legal, M&A) with persona contracts, authority boundaries, and escalation paths
- **`mission-intelligence.md`** — The Oracle. Runs INGEST → ANALYZE → PREDICT → DECIDE → DELEGATE → EXECUTE → REPORT on every Operator Mode invocation

#### Updated Modules
- **`onboarding.md`** — Rebuilt with surgical precision. Inference-first interview, credentials_index.json population, anti-hallucination discipline
- **`code-sprint.md`** — Full rewrite. Exact commands, exact validation, exact failure recovery. Zero ambiguity

#### Structural Changes
- `v4-addendum.md` abolished — all contracts baked directly into modules
- Each module is now self-contained and authoritative
- Phase 0 (Context Load) formalized as an explicit procedure

---

## [4.0.0] — 2026-04-28

### The Operator

First version to run the business post-launch, not just build and launch it.

#### New Modules
- **`pre-flight.md`** — 11-point launch gate. RED = return to fix. GREEN = cleared to launch
- **`launch-day.md`** — Live execution driver for LAUNCH_SEQUENCE.md
- **`war-room.md`** — 72-hour post-launch live ops. T+1h, T+12h, T+24h, T+48h, T+72h retros
- **`growth-engine.md`** — Perpetual weekly operator loop. Pulse → Decide → Execute → Ship → Log. Includes `atlas-permissions.yml` trust contract and GitHub Actions cron

#### Upgraded Modules
- **`launch-strategy.md`** — 678 lines. Channel intelligence, audience archaeology, timestamped LAUNCH_SEQUENCE.md, war-room prep, rollback matrix, competitor benchmarks
- **`marketing-playbook.md`** — 484 lines. Brand voice codification, press kit generation, micro-influencer outreach, executable scheduling, 90-day content calendar
- **`growth-engine.md`** — Action library, decision tree, `atlas-permissions.yml`, weekly GitHub Action cron

#### Score Changes
- Raised target from 70 (v3) → 80 (v4) to reflect post-launch operation requirement
- New categories: Active Acquisition Channel, Content Engine, Iteration Loop

---

## [2.0.0] — 2026-03-18

### The Co-Founder

First version to treat Atlas as an operator, not a guide.

#### Modules Introduced
- Onboarding (3-pass intelligence engine)
- Code Sprint (priority scorecard, P0/P1/P2 classification)
- Legal & Compliance (product-specific ToS + Privacy Policy)
- Launch Strategy (channel selection + ready-to-post copy)
- Marketing Playbook (30-day content calendar + SEO)
- Business Setup (entity, banking, startup credits)
- Automation Handoff (runs-itself score, email sequences)
- Operations (North Star metrics, weekly review ritual, wealth trajectory)
- Portfolio (cross-project empire intelligence)

#### Philosophy
- The Co-Founder Table: "runs `vercel --prod`" not "you should deploy to Vercel"
- The Rationalization Table: preemptive defense against Atlas's own laziness
- The Quadriplegic Test: could someone physically unable to type use this and make money?

---

## [1.0.0] — 2026-03

### The Sprint Guide

Original Atlas. A structured guide for solo founders to move a project from idea to launch.
Eight sequential modules, no automation, no persistence. Foundation for everything that followed.
