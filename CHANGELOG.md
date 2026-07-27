# Changelog

All notable changes to Atlas are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

> **Renumbering note (2026-07-12):** all releases previously labeled v1–v8.4 were
> retroactively renumbered to v0.1–v0.8.4 (`N.M.P` → `0.N.M`). v1.0.0 is reserved for the
> first commercial release — see the Road to v1.0 gate in `CHARTER.md`. Original labels
> are preserved in parentheses below. Nothing about the renumbered releases changed
> except their labels.

---

## [0.9.1] - 2026-07-12

### The Expansion
- **User Interview Engine (`user-interview-engine.md`)**: Autonomous user feedback extraction via email API.
- **Penetration Tester (`penetration-tester.md`)**: Authorized, non-destructive DAST protocol before launch gates.
- **Edge Orchestration**: `deployment-engine.md` adds Cloudflare Workers guidance via `wrangler`.
- **Self-Funding Capital Engine**: `capital-governor.md` adds non-dilutive capital generation during SURVIVE/PRESERVE modes.
- **Autonomous Interface**: founders use `/atlas`; `/atlas status`, `/atlas pause`, and `/atlas doctor` are the only exceptions.

## [0.9.0] - 2026-07-12

### Concurrent, Continuous, Evidence-Bound

- **Leverage Mandate + `leverage-engine.md`**: Atlas binds to the harness's force multipliers. Fleet fan-out is mandatory for ≥3 independent tasks; adversarial verification gates revenue-facing claims; ToolSearch/MCP-registry lookup is required before any "no API" claim; every capability has a logged graceful fallback.
- **The Heartbeat (`/atlas heartbeat`)**: scheduled autonomous ticks (nightly operator, weekly growth/portfolio/drift) with hard unattended-run bounds (no spend, no new channels, no pricing changes) and a verified `heartbeat.json` manifest. Sovereign's "zero human commits for 14 days" is now mechanically achievable.
- **Hosted Sovereign Dashboard (`/atlas dashboard`)**: the dashboard is a stable hosted URL refreshed on every tick, phone-openable; `dashboard-template.html` remains the renderer and local fallback. Milestone push notifications on score crossings, first dollar, payouts, and P0s.
- **Evidence Doctrine**: every phase exit and delegated task appends captured proof (API response, screenshot, scheduler listing, query output) to `~/.atlas/portfolio/[slug]/evidence.jsonl`. Claims without evidence are hypotheses.
- **Action Hierarchy Layer 3 split**: 3a sandbox browser automation vs. 3b the founder's own logged-in browser (founder personally performs sign-ins, MFA, payment consents, final submits). Authenticated-portal work becomes executable instead of falling to paste-ready artifacts. All safety boundaries preserved verbatim.
- **Real-time founder I/O**: `userMust` items are delivered the moment they are found (task chip + push notification); end-of-run consolidation is the backstop. Deliverables ship via file delivery, not paths in prose.
- **Fleet made real**: `fleet-subagents.md` delegation specifies actual subagent dispatch — 5-part prompt contract (ROLE/CONTEXT/TASK/BOUNDS/RETURN) with structured-schema returns and a proof obligation. `fusion-router.md` routing matrix rebuilt around capabilities that exist in the current ecosystem, with runtime discovery for the rest; ghost specialists removed.
- **Oracle upgrades**: market/competitive INGEST may use deep-research; REPORT publishes the hosted dashboard and pushes milestones; the Sovereign-tier weekly tick runs on the heartbeat scheduler.
- **De-versioned plumbing**: `CHARTER_v8.md` → `CHARTER.md`; validate.js/doctor.js derive the canonical version from `package.json` and check the command surface against `scripts/atlas/command-registry.js` (now 30 commands: +`/atlas heartbeat`, +`/atlas dashboard`).
- **Renumbering**: the v0.x scheme adopted; Road to v1.0 commercial gate defined in `CHARTER.md`.

---

## [0.8.4] (originally v8.4) - 2026-06-23

### Canonical Runtime

- Promoted the clean kernel-first Atlas package as the installable canonical version.
- Added an explicit propagation target contract for `.agents`, `.claude`, `.codex`, and compatible skill runtimes.
- Updated validation to check version coherence dynamically instead of hardcoding v8.0.
- Clarified that v8.1-v8.3 giant-kernel variants are historical source material, not the active runtime package.

---

## [0.8.0] (originally v8.0) - 2026-05-21

### Kernel-First Atlas

This release made the charter the canonical version authority and trimmed Atlas into a kernel-first Claude skill with on-demand modules, Doctor integrity checks, First Ship mode, and a stricter skill hygiene policy.

#### Core Changes
- **Kernel-first `SKILL.md`**: Runtime routing stays compact, with deeper doctrine loaded only when a command needs it.
- **`/atlas doctor`**: Adds an explicit integrity-check command before operational work proceeds.
- **`/atlas ship`**: Adds a compressed First Ship mode for founders who need a direct path to first public launch.
- **Skill hygiene doctrine**: `skill-hygiene.md` defines anti-bloat rules for archives, runtime state, summaries, and generated artifacts.
- **v7 triage**: Historical v7.x and aspirational v8.x materials retired from the active tree (recoverable from git history) so the runtime surface stays coherent.

#### Validation
- `validate.js` began checking the active changelog section, root package manifest, and charter command-surface count.

---

## [0.7.2] (originally v7.2) - 2026-05-12

### The Sovereign Money Engine

This release made the `.claude` Atlas tree the canonical skill while porting the concrete launch and operations infrastructure from the DEV integration repo.

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

---

## [0.6.0] (originally v6.0) — 2026-04-30

### The Sovereign Empire

This release was a ground-up rebuild of the Atlas architecture. The goal: make the foundation unbreakable before adding empire-scale capabilities.

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

## [0.4.0] (originally v4.0) — 2026-04-28

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
- Raised target from 70 → 80 to reflect post-launch operation requirement
- New categories: Active Acquisition Channel, Content Engine, Iteration Loop

---

## [0.2.0] (originally v2.0) — 2026-03-18

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

## [0.1.0] (originally v1.0) — 2026-03

### The Sprint Guide

Original Atlas. A structured guide for solo founders to move a project from idea to launch.
Eight sequential modules, no automation, no persistence. Foundation for everything that followed.
