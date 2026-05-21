---
name: atlas-portfolio-os
description: Portfolio operating module for Atlas v7.2. Scores projects, assigns primary and secondary lanes, constrains parallel work, and routes effort toward launch, revenue, or retirement.
---

# Portfolio Operating System (v7.2)

Objective: rank every project, pick the primary lane, constrain parallel work, and force execution toward launch, revenue, or retirement.

Portfolio OS prevents Atlas from spreading effort across too many projects. It is deterministic: score, assign lanes, execute the primary, and park distractions unless the evidence changes.

## Required State

Store the portfolio index at `~/.atlas/portfolio/index.json`:

```json
{
  "version": "7.2",
  "last_rebalance_at": "YYYY-MM-DDTHH:mm:ssZ",
  "primary_slug": "project-slug",
  "secondary_slugs": [],
  "parked_slugs": [],
  "retired_slugs": [],
  "projects": []
}
```

Each project should also keep `~/.atlas/portfolio/[slug]/context.json`.

## Project Schema

```json
{
  "slug": "project-slug",
  "name": "Project Name",
  "status": "active|parked|retired",
  "stage": "idea|prototype|prelaunch|launched|growth|maintenance",
  "capital_mode": "SCALE|BALANCED|PRESERVE|SURVIVE",
  "scores": {
    "time_to_cash": 0,
    "launch_readiness": 0,
    "distribution_readiness": 0,
    "monetization_clarity": 0,
    "confidence": 0,
    "capital_efficiency": 0,
    "strategic_fit": 0,
    "priority": 0
  },
  "evidence": {
    "revenue_30d": 0,
    "active_users_30d": 0,
    "qualified_pipeline": 0,
    "open_p0": 0,
    "open_p1": 0,
    "last_ship_at": "YYYY-MM-DD",
    "last_customer_signal_at": "YYYY-MM-DD"
  },
  "lane": "primary|secondary|parked|retired",
  "next_gate": "launch|monetization|distribution|retention|retire"
}
```

## Priority Formula

Prefer `portfolio_priority_score()` from `scoring.md` when available. If not available, compute:

```text
priority_score =
  0.25 * time_to_cash +
  0.18 * launch_readiness +
  0.14 * distribution_readiness +
  0.18 * monetization_clarity +
  0.10 * confidence +
  0.08 * capital_efficiency +
  0.07 * strategic_fit
```

Apply penalties after the weighted score:

- Open P0: -40
- Open P1: -20
- No customer signal in 30 days: -10
- No ship in 14 days while prelaunch: -8
- Unclear owner or missing context: -12
- Requires spend disallowed by current capital mode: -15

Clamp final score to 0-100.

## Lane Assignment

| Lane | Criteria | Allowed Work |
| --- | --- | --- |
| Primary | Highest eligible score >= 70 | Build, launch, revenue, critical fixes |
| Secondary | Score 45-69 or strong prep value | Diagnostics, content, research, small reversible prep |
| Parked | Score 0-44 or blocked | No build sprint actions |
| Retired | Explicitly sunset or negative expected value | Monitors and obligations only |

Only one primary lane is allowed. If two projects tie within 3 points, choose the one with faster time to cash. If still tied, choose the one with higher monetization clarity.

## Rebalance Rules

Rebalance on `/atlas portfolio-scan`, weekly cadence, or when any project crosses a gate.

Current primary is replaced only if:

- Challenger priority >= current primary priority + 8.
- Challenger launch_readiness >= 60 or revenue_30d > current primary revenue_30d.
- Challenger has no unresolved P0.
- Switching cost is lower than expected score delta.
- Capital mode allows the work required by the challenger.

In PRESERVE or SURVIVE mode, do not switch primary unless the challenger has a clearer near-term cash path.

## Execution Protocol

When running `/atlas portfolio-execute`:

1. Load `index.json`.
2. Validate the primary lane.
3. Load primary `context.json`.
4. Evaluate the active gate.
5. Reject tasks that do not move the gate.
6. Execute only the highest gate-moving action.
7. Update scores and context atomically.

## Gates

### Launch Gate

Required:

- launch_readiness >= 70
- monetization_clarity >= 65
- confidence >= 60
- open P0 count == 0
- rollback path exists

If met, run launch sequence from `launch-strategy.md`.
If not met, execute only tasks that raise launch readiness, monetization clarity, or confidence.

### Monetization Gate

Required:

- price or offer exists
- checkout or lead capture works
- primary conversion metric is instrumented
- `money_score()` baseline exists

If not met, route to `pricing-lab.md`, `offer-forge.md`, or `money-engine.md`.

### Distribution Gate

Required:

- one active channel with measurable qualified traffic
- one repeatable content, outreach, or partner motion
- CAC or cost proxy tracked

If not met, route to `channel-dominance.md` or `acquisition-sniper.md`.

### Retention Gate

Required:

- activation event defined
- churn or inactivity signal tracked
- lifecycle or dunning path exists where relevant

If not met, route to `revenue-intelligence.md`, `cashflow-ops.md`, or `operator-playbook.md`.

### Retire Gate

Retire or park if:

- Priority < 35 for two consecutive scans.
- No credible path to cash in 30 days.
- Required spend is disallowed by capital mode.
- Founder or legal constraint blocks operation.
- Another project is at least 20 points stronger and has near-term cash potential.

## Task Eligibility Rule

A task is executable only if it maps to one of:

- launch_readiness increase
- monetization_clarity increase
- distribution_readiness increase
- confidence increase
- measured revenue or retention metric increase
- P0/P1 incident resolution
- security, payment, or uptime obligation

Reject everything else as build-mode drift and record the reason.

## Parallel Work Constraints

| Lane | SCALE | BALANCED | PRESERVE | SURVIVE |
| --- | --- | --- | --- | --- |
| Primary | Full execution | Full execution | Revenue/reliability only | Cash/reliability only |
| Secondary | Prep and diagnostics | Prep only | Frozen unless cash-linked | Frozen |
| Parked | No build | No build | No build | No build |
| Retired | Obligations only | Obligations only | Obligations only | Obligations only |

Sub-agents may only work on secondary lanes if their output cannot consume primary execution attention.

## Atomic Update Protocol

When writing `index.json`:

1. Read current file.
2. Write new JSON to `index.json.tmp`.
3. Validate JSON parses.
4. Move old file to `index.json.bak`.
5. Move tmp to `index.json`.
6. Log the rebalance in `~/.atlas/portfolio/rebalance_log.md`.

Never leave a partially written portfolio index.

## Output Template

```markdown
## Portfolio OS - [Date]
**Primary:** [slug] ([score])
**Secondary:** [slugs]
**Parked:** [slugs]
**Retired:** [slugs]
**Mode:** [capital mode]
**Rejected Drift:** [task and reason]
**Primary Gate:** [gate]
**Next Action:** [single highest-impact action]
**Rebalance Rationale:** [why primary stayed or changed]
```

## Acceptance Gate

A portfolio cycle passes only if:

- Scores are refreshed for all non-retired projects.
- Lanes are assigned deterministically.
- One primary-only execution plan is produced.
- Build-drift tasks are rejected with reasons when present.
- `index.json` is updated atomically.
- The next action maps to a gate, score, incident, or revenue metric.

## Hard Rules

- One primary lane. No exceptions.
- No secondary build sprint while the primary has an unmet launch or monetization gate.
- No parked project work unless it is a legal, security, billing, or uptime obligation.
- No rebalance based on novelty; only score, evidence, and capital mode.
- Portfolio OS exists to ship and earn, not to inventory ideas.
