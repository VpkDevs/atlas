# Changelog

All notable changes to Atlas are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [6.3.0] — 2026-05-08

### Added
- **Growth Engine scripts** (`scripts/atlas/`): `pulse.js` (metrics collector: Stripe, PostHog, Better Uptime, Sentry — WoW deltas + anomaly detection), `decide.js` (priority rules → one recommended action), `open_pr.js` (files the weekly review as a GitHub issue), `notify.js` (Discord/Slack digest), `weekly-review.js` (orchestrator). The weekly cron collects and recommends; it does not execute or merge.
- **n8n workflow templates** in `automation-library/`: new-customer onboarding and churn detection, as real importable JSON.
- `package.json` — npm scripts for pulse, weekly-review, validate, diag.

### Changed
- `.github/workflows/weekly-review.yml` now runs the full weekly-review pipeline.
- Dashboard template: Sovereign Score naming throughout (was Runs-Itself Score); target score 90.
- ATLAS_STATE schema: `sovereignScore` field.

### Fixed (post-release coherence pass)
- Dashboard template ships with a clean, empty product state (was pre-filled with another product's data).
- Scoring conflicts removed — SKILL.md's rubric is the single canonical table; the Phase 8 launch gate is now expressed as 60% of pre-launch-earnable points.
- Secret scans are case-insensitive, scan the whole repo, and match object-literal shapes; the git-history cleanliness criterion is now achievable (rotate + purge + re-scan).
- Phase numbering normalized to the 0–14 scheme across all modules; startup-credit claims corrected (Atlas prepares applications; typical self-funded value $5,000–$25,000; Stripe Atlas is a paid service); email sequences described by their real deliverable (copy + committed trigger code); Product Hunt steps reflect that PH has no submission/DM API.

## [6.2.0] — 2026-05-08

### Fixed
- **Score integrity:** stale '70' references removed across README, edge-cases, exit-readiness, portfolio, SKILL.md — score language consistent everywhere (60 launch floor, 80 sustained, 90 sovereign).
- README replaced: v3-era content (8 modules, personal session notes) → accurate 24-module reference with full phase table, Fleet, Oracle, pricing, install.
- Phase routing fixed in exit-readiness (`/atlas portfolio`, `/atlas growth`, `/atlas status`) and business-setup (Module → Phase references).
- Git push steps added to security, automation-handoff, and operations outputs.

### Added
- Acceptance tests: business-setup (7 checks), legal-compliance (8), revenue-intelligence (5), portfolio (7), exit-readiness (7).
- Red flags: business-setup (7), revenue-intelligence (3), portfolio (9), exit-readiness (6); fleet-subagents and mission-intelligence gained full checkpoints, red flags, and acceptance tests.
- SKILL.md: 6 new Rationalization Table entries; 6 new Red Flags.

## [6.1.0] — 2026-05-08

### Added
- **security.md** — Phase 2b: OWASP Top 10, secrets scan, dependency audit, rate limiting, security headers, CSP generation. Critical vulnerabilities block launch.
- **brand-engine.md** — visual identity system: palette, typography, motion language, Playwright visual QA loop, brand profile persistence.
- **context-window.md** — phase transition protocol, context drift detection, anti-hallucination checks, long-run checkpoints.

### Changed
- SKILL.md: full `/atlas diag` procedure; `/atlas security` and `/atlas brand` subcommands; phase table updated; 5 new Red Flags; stale 70-score references fixed.
- operations.md rewritten: live queries committed, weekly-review GitHub Action, alert webhooks, investor update template, stage-calibrated thresholds.
- automation-handoff.md: score floor corrected (60 launch, 90 sovereign).
- legal-compliance.md: FTC AI guidance, EU AI Act, DMCA registration, WCAG auto-fixes.
- fleet-subagents.md, mission-intelligence.md, portfolio.md, hands-off-gaps.md upgraded (shared state protocol, churn prediction model, attention allocation formula, v6 frontmatter).

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
