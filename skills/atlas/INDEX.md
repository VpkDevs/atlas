---
name: index
description: Human-readable file map for Atlas v0.9.1 skill directory.
---

# Atlas File Index

**Navigation guide for the Atlas skill tree. Start with [CHARTER.md](CHARTER.md) if confused.**

---

## Core (Read First)

- **[SKILL.md](SKILL.md)** — The kernel. Identity, Iron Rule, Six-Layer Action Hierarchy, Leverage Mandate, boot order, modes, and subcommand surface. **Keep under 400 lines forever.**
- **[CHARTER.md](CHARTER.md)** — Version of record. Canonical version, file inventory, renumbering map, Road to v1.0 gate. **If any file disagrees with this, this wins.**
- **[CHANGELOG.md](CHANGELOG.md)** — Only changelog. Semantic versioning, renumbering note, v0.9.1 additions.
- **[VERSION.md](VERSION.md)** — Compatibility pointer to CHARTER.md (for older docs/tools).
- **[README.md](README.md)** — Outward-facing intro. What's new, command surface, success conditions.

---

## Executable + Setup

- **`package.json` / `package-lock.json`** — Node.js dependencies (chalk, inquirer, playwright, ora, commander, boxen, figlet).
- **`scripts/atlas/`** — CLI, doctor, pulse, weekly-review, automation-library, monitor, decide, credential-browser.
- **`scripts/validate.js`** — 110+ mechanical coherence checks. Runs before every `/atlas` invocation.
- **`scripts/atlas/command-registry.js`** — Machine-readable subcommand list (4 commands in v0.9.1). `validate.js` asserts SKILL.md and CHARTER.md match it.
- **`dashboard-template.html`** — Dashboard renderer (hosted publish + fallback).
- **`LICENSE`** — MIT.

---

## Doctrine (Modules)

### New in v0.9.1

- **[user-interview-engine.md](user-interview-engine.md)** — Autonomous user feedback extraction via email API. Phase 12+ (Revenue Intel) and Phase 13 (Growth Engine) loaded on demand.
- **[penetration-tester.md](penetration-tester.md)** — Authorized, non-destructive DAST protocol before launch gates. Phase 2b (Security) and `/atlas security-scan`.
- **[deployment-engine.md](deployment-engine.md)** — Deployment platform detection and execution. Vercel, Heroku, Railway, Render, AWS, Cloudflare Workers guidance via `wrangler`.

### v0.9 Foundation

- **[leverage-engine.md](leverage-engine.md)** — Force-multiplier doctrine: orchestration, heartbeat, dashboard, evidence, founder I/O, discovery, memory. Mandatory for concurrent work.
- **[fleet-subagents.md](fleet-subagents.md)** — Multi-agent coordination. 5-part prompt contract, schema returns, proof obligation, escalation paths.
- **[atlas-doctor.md](atlas-doctor.md)** — Integrity-check command. Runs internally before every `/atlas` invocation.

### Launch Pipeline

- **[onboarding.md](onboarding.md)** — Phase 0: inference-first 3-pass interview, credentials_index.json population.
- **[code-sprint.md](code-sprint.md)** — Phase 1: priority scorecard, P0/P1/P2 classification, exact commands, exact validation.
- **[security.md](security.md)** — Phase 2a: static analysis, secrets scanning, OWASP.
- **[pre-flight.md](pre-flight.md)** — Phase 8: 11-point launch gate. RED = return to fix. GREEN = cleared to launch.
- **[first-ship.md](first-ship.md)** — 7-day compressed pipeline. Live URL + first paying customer. $1 gate, then promotes to STANDARD mode.
- **[launch-strategy.md](launch-strategy.md)** — Channel intelligence, audience archaeology, timestamped LAUNCH_SEQUENCE.md, war-room prep, rollback matrix.
- **[launch-day.md](launch-day.md)** — Live execution driver for LAUNCH_SEQUENCE.
- **[war-room.md](war-room.md)** — 72-hour post-launch live ops. T+1h, T+12h, T+24h, T+48h, T+72h retros.

### Revenue & Growth (Phases 10–21)

- **[growth-engine.md](growth-engine.md)** — Perpetual weekly operator loop. Pulse → Decide → Execute → Ship → Log.
- **[operations.md](operations.md)** — North Star metrics, weekly review ritual, wealth trajectory.
- **[money-engine.md](money-engine.md)** — Revenue operations, monetization strategy, unit economics.
- **[pricing-lab.md](pricing-lab.md)** — A/B testing, statistical significance, price optimization.
- **[cashflow-ops.md](cashflow-ops.md)** — P&L, tax reserve, credit optimization, payout automation.
- **[offer-forge.md](offer-forge.md)** — Offer synthesis, customer segmentation, packaging.
- **[channel-dominance.md](channel-dominance.md)** — Channel fitness matrix, ROI optimization, channel-specific playbooks.
- **[acquisition-sniper.md](acquisition-sniper.md)** — Opportunity detection, rapid response, conversion metrics.
- **[capital-governor.md](capital-governor.md)** — Runway management, capital mode switching (GROW/SURVIVE/PRESERVE), non-dilutive capital generation.
- **[revenue-intelligence.md](revenue-intelligence.md)** — Market intelligence, competitive analysis, pricing benchmarks.

### Business Setup & Brand

- **[business-setup.md](business-setup.md)** — Entity formation, banking, startup credits (AWS, GCP, Digital Ocean, etc.).
- **[credential-acquisition.md](credential-acquisition.md)** — API key discovery, env setup, credentials_index.json management.
- **[brand-engine.md](brand-engine.md)** — Brand voice codification, press kit generation, micro-influencer outreach.
- **[marketing-playbook.md](marketing-playbook.md)** — 30-day content calendar, SEO, executable scheduling, 90-day roadmap.

### Operations & Resilience

- **[automation-handoff.md](automation-handoff.md)** — Runs-itself score, email sequences, product automation.
- **[incident-protocol.md](incident-protocol.md)** — P0–P3 response playbooks, SLA targets, incident logging, post-mortem structure.
- **[exit-readiness.md](exit-readiness.md)** — Acquisition prep, buyer qualification, deal structure.
- **[operator-playbook.md](operator-playbook.md)** — Decision-making framework, blocker resolution, escalation paths.

### Intelligence & Routing

- **[mission-intelligence.md](mission-intelligence.md)** — Oracle. INGEST → ANALYZE → PREDICT → DECIDE → DELEGATE → EXECUTE → REPORT.
- **[fusion-router.md](fusion-router.md)** — Routes work across available skills and specialist agents while preserving Atlas gates.
- **[portfolio.md](portfolio.md)** — Cross-project empire intelligence, score comparison, rebalancing.
- **[portfolio-os.md](portfolio-os.md)** — Lane discipline (primary/secondary/parked), intelligent priority scoring.

### Reference & Doctrine

- **[skill-hygiene.md](skill-hygiene.md)** — Anti-bloat rules. No archives, runtime state, summaries, or generated artifacts in the tree.
- **[rationalization-table.md](rationalization-table.md)** — Preemptive defense against Atlas's own laziness.
- **[edge-cases.md](edge-cases.md)** — Known failure modes, workarounds, escalation playbooks.
- **[scoring.md](scoring.md)** — Sovereign Score algorithm (0–100), Economic Sovereignty, Social Presence, all category definitions.

### Legal

- **`docs/legal/COMPLIANCE_CHECKLIST.md`** — Product-specific compliance template.
- **`docs/legal/PRIVACY_POLICY.md`** — Privacy policy template (GDPR, CCPA, etc.).
- **`docs/legal/TERMS_OF_SERVICE.md`** — Terms of Service template.

---

## Testing & Validation

- **`tests/`** — Command registry tests, pause tests, CLI tests.
- **`.github/workflows/`** — Schema validation + weekly review automation.
- **`.github/prompts/`** — Pre-convergence audit, compare-and-converge-variants.

---

## Propagation Targets

Atlas propagates to compatible skill runtimes. See [CANONICAL_INSTALL.md](CANONICAL_INSTALL.md).

- **`.agents`** — Anthropic Agents (server-hosted managed sandbox).
- **`.claude`** — Claude Code and Claude.ai file sync.
- **`.codex`** — .codex runtime for other agents.

---

## Quick Navigation

### By Task

- **"I'm stuck, run diagnostics"** → `/atlas doctor` (loads [atlas-doctor.md](atlas-doctor.md))
- **"Start fresh"** → `/atlas` (loads [onboarding.md](onboarding.md) via Phase 0)
- **"I've shipped before, compress to launch"** → `/atlas` with FIRST SHIP detection (loads [first-ship.md](first-ship.md))
- **"I'm live, run the growth loop"** → `/atlas` (loads [growth-engine.md](growth-engine.md))
- **"Check portfolio status"** → `/atlas status` (read-only)
- **"Pause everything safely"** → `/atlas pause`

### By Phase

1. **Phase 0** — [onboarding.md](onboarding.md)
2. **Phase 1** — [code-sprint.md](code-sprint.md)
3. **Phase 2a** — [security.md](security.md)
4. **Phase 2b** — [penetration-tester.md](penetration-tester.md)
5. **Phase 3–7** — [launch-strategy.md](launch-strategy.md), [business-setup.md](business-setup.md), etc.
6. **Phase 8** — [pre-flight.md](pre-flight.md)
7. **Phase 9** — [launch-day.md](launch-day.md) → [war-room.md](war-room.md)
8. **Phase 10+** — [growth-engine.md](growth-engine.md) (weekly loop: [operations.md](operations.md), [money-engine.md](money-engine.md), [revenue-intelligence.md](revenue-intelligence.md))

---

**v0.9.1. One kernel. One charter. One changelog. Fleet real. Heartbeat live. Evidence or it didn't happen.**
