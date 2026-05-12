---
name: atlas-fusion-router
description: Federated routing module for Atlas v7.2. Assigns work to the best available skills and agents, scores interventions, resolves conflicts, and merges outputs under Atlas gates.
---

# Fusion Router (v7.2)

The Atlas execution multiplier. Routes every task to the best specialist, scores competing proposals, resolves conflicts, and merges outputs into one actionable plan with acceptance gates.

Atlas is the decision authority. Specialists are force multipliers. Fusion is the mechanism that makes them compounding.

---

## Global Inclusion Rule

Every available skill and agent is eligible for routing on every invocation.
No capability is excluded by default. The matrix below is a starting assignment — tasks may be routed to unlisted sources when domain fit and Fusion Intervention Score justify it.

---

## 1. Routing Matrix (Canonical)

| # | Domain | Primary Source(s) | Secondary | Expected Output |
|---|--------|-------------------|-----------|-----------------|
| 1 | **External documentation** | `context7-mcp` | Web fetch | Verified syntax, commands, config patterns — authoritative, not from memory |
| 2 | **Codebase reconnaissance** | `Explore` agent | `research` skill | Candidate files, symbol ownership, change hotspots, dependency map |
| 3 | **Competitive intelligence** | `feature-thievery-expert` | Market research | Ranked feature gap list → measurable roadmap items with conversion delta |
| 4 | **AI app lifecycle** | `AIAgentExpert` | `microsoft-foundry`, AI Toolkit skills | Model selection, eval design, tracing setup, Foundry deployment path |
| 5 | **Data-backed decisions** | `DataAnalysisExpert` | Data Viewer | Schema-aware evidence, measurable findings, recommended action |
| 6 | **Code quality & security** | `code-review` + `audit` + `harden` | `get_errors` | P0 correctness, OWASP coverage, resilience gaps — ranked by severity |
| 7 | **UI/UX and conversion** | `frontend-design`, `arrange`, `typeset`, `colorize`, `animate`, `adapt`, `optimize`, `polish`, `normalize`, `distill`, `delight`, `onboard`, `clarify`, `bolder`, `quieter`, `overdrive` | `playwright` validation | One coherent visual direction with measurable conversion delta hypothesis |
| 8 | **Browser verification** | `playwright` | Screenshot tools | Golden path coverage + regression test for last-shipped feature |
| 9 | **Azure cloud** | `azure-prepare`, `azure-validate`, `azure-deploy`, `azure-diagnostics`, `azure-cost`, `azure-compliance`, `azure-kubernetes`, `entra-*` | `mcp_azure_*` | Cloud-safe implementation, compliance posture, cost guardrails |
| 10 | **PR & review** | `create-pull-request`, `address-pr-comments`, `suggest-fix-issue` | GitHub tools | Clean, reviewable change set; addressed review threads |
| 11 | **Identity & auth** | `entra-app-registration`, `entra-agent-id`, `azure-rbac` | Docs | Least-privilege config, token exchange, RBAC assignment |
| 12 | **Observability & monitoring** | `azure-observability`, `appinsights-instrumentation` | `azure-kusto` | KQL queries, alert rules, dashboard config, APM setup |

---

## 2. Dispatch Decision Tree

```
FUNCTION route_task(task):

  # Step 1: Classify the task
  domain = classify_domain(task.description)

  # Step 2: Check if task requires external docs first
  if domain in [1, 4, 9, 11]:
    fetch_context7_docs_first()

  # Step 3: Check if codebase reconnaissance is needed
  uncertainty = estimate_code_uncertainty(task)
  if uncertainty == "HIGH":
    run_explore_agent_first()  # Domain 2 always before major edits

  # Step 4: Select primary source
  primary = ROUTING_MATRIX[domain].primary

  # Step 5: Check for parallel-safe co-dispatch
  secondary = identify_parallel_safe_secondary(task, primary)
  if secondary:
    dispatch_parallel(primary, secondary)
  else:
    dispatch_serial(primary)

  # Step 6: Collect outputs
  proposals = collect_outputs()

  # Step 7: Score and rank
  scores = [score_fusion_intervention(p) for p in proposals]

  # Step 8: Apply conflict resolution
  winner = resolve_conflicts(proposals, scores)

  # Step 9: Gate check — reject if below threshold
  if winner.fusion_score < 20:
    log_rejection(winner, reason="below score threshold")
    return None

  return winner
```

---

## 3. Parallel Dispatch Rules

Independent tasks may run in parallel. Use this matrix to determine parallelism safety:

| Task A | Task B | Safe to Parallel? |
|--------|--------|-------------------|
| Explore (read-only) | Any domain | ✅ Always safe |
| context7 doc fetch | Any domain | ✅ Always safe |
| Code edit | Another code edit (different files) | ✅ If no shared imports |
| Code edit | Deploy | ❌ Edit must complete first |
| A/B test variant A | A/B test variant B | ❌ Never parallel |
| UI redesign | Browser verification | ❌ Verification must follow edit |
| Azure validate | Azure deploy | ❌ Validate first, always |

**Default:** When uncertain, run serially. Speed from parallelism is never worth correctness risk.

---

## 4. Conflict Resolution Matrix

When two specialists produce conflicting recommendations:

```
FUNCTION resolve_conflicts(proposals, scores):

  # Rule 1: Hard gate — legal/compliance risk eliminates any proposal
  proposals = [p for p in proposals if p.compliance_risk != "HIGH"]

  # Rule 2: If only one proposal remains after gate, it wins
  if len(proposals) == 1:  return proposals[0]

  # Rule 3: Score-based selection
  ranked = sorted(zip(proposals, scores), key=lambda x: x[1], reverse=True)
  top, runner_up = ranked[0], ranked[1]

  # Rule 4: If scores within 5 points, prefer higher reversibility
  if abs(top[1] - runner_up[1]) <= 5:
    return max([top, runner_up], key=lambda x: x[0].reversibility_rank)

  # Rule 5: Top score wins
  return top[0]
```

### Reversibility Rank (for tiebreaking)
1. `instant` — feature flag / config toggle
2. `fast` — `git revert` in < 5 min
3. `moderate` — PR revert + deploy
4. `slow` — requires manual DB steps
5. `irreversible` — cannot undo (automatically rejected if alternatives exist)

---

## 5. Fusion Sprint Procedure (Full)

```
PROCEDURE fusion_sprint(goals, blockers):

  # Phase A: Inventory
  active_goals  = collect_active_goals()
  kpi_targets   = map_goals_to_kpi(active_goals)
  score_gaps    = read_sovereign_score_gaps()   # from scoring.md

  # Phase B: Route
  routing_plan  = []
  for goal in active_goals:
    domain  = classify_domain(goal)
    primary = ROUTING_MATRIX[domain].primary
    routing_plan.append({goal, domain, primary})

  # Phase C: Dispatch
  parallel_groups = group_parallel_safe(routing_plan)
  for group in parallel_groups:
    results = dispatch_parallel(group)
    collect_outputs(results)

  # Phase D: Score interventions (see scoring.md §7)
  intervention_backlog = []
  for output in all_outputs:
    score = score_fusion_intervention(output)
    intervention_backlog.append({output, score})

  # Phase E: Rank and select
  ranked  = sort_by_score_descending(intervention_backlog)
  top3    = ranked[:3]
  skipped = ranked[3:]

  # Phase F: Gate check
  for intervention in top3:
    assert intervention.has_kpi_target,   "Reject: no KPI target"
    assert intervention.has_rollback,     "Reject: no rollback"
    assert not intervention.compliance_risk == "HIGH"

  # Phase G: Execute
  for intervention in top3:
    execute(intervention)
    verify_kpi_instrumented()
    commit_and_deploy()

  # Phase H: Report
  write_fusion_report(top3, skipped, kpi_targets, score_gaps)
```

---

## 6. Fusion Intervention Scoring

See `scoring.md §7` for the exact formula.

Quick reference:
- **Impact (40%)**: expected KPI delta normalized 0–10
- **Effort (25%)**: implementation hours (inverse — less is more)
- **Reversibility (20%)**: how fast can it be undone
- **Time-to-cash (15%)**: how quickly does this produce revenue

Score threshold: **Reject any intervention scoring below 20/100.**

---

## 7. FUSION_REPORT Format

Written to: `docs/founder/FUSION_REPORT.md`

```markdown
# FUSION_REPORT — [Slug] — [ISO Date]

## Routing Summary

| Goal | Domain | Specialist(s) | Status |
|------|--------|---------------|--------|
| [goal 1] | [domain] | [specialist] | ✅ dispatched |
| [goal 2] | [domain] | [specialist] | ⏭️ skipped (score < 20) |

## Selected Interventions (Top 3)

### 1. [Intervention Name]
- **Specialist:** [source]
- **KPI target:** [metric] from [baseline] → [target] ([+N%])
- **Fusion score:** [N]/100
- **Effort:** [N hours]
- **Reversibility:** [instant/fast/moderate/slow]
- **Rollback:** `[command or procedure]`
- **Verification:** [how to confirm it worked]
- **Status:** [pending / in-progress / shipped]

### 2. [...]
### 3. [...]

## Skipped Interventions

| Intervention | Score | Rejection Reason |
|-------------|-------|-----------------|
| [name] | [N] | [below threshold / compliance risk / no KPI] |

## Score Impact Projection

| Score | Before | After (projected) |
|-------|--------|-------------------|
| Sovereign Score | [N] | [N + delta] |
| Revenue Velocity | [N] | [N + delta] |
| Retention Health | [N] | [N + delta] |

## Next Fusion Sprint Trigger

Next sprint recommended when:
- Sovereign Score < 90 AND
- ≥ 7 days since last sprint, OR
- A new blocker is found in diag output
```

---

## 8. Rejection Rules (Hard Gates)

Reject and log any specialist output that:
1. **Lacks a measurable KPI target** — "improve UX" is not a target; "increase checkout conversion rate by 15%" is
2. **Has compliance or legal risk rated HIGH** — route to compliant alternative, log reason
3. **Is irreversible with no tested rollback** — downgrade to "prototype" status; never auto-deploy
4. **Conflicts with current capital mode** — in SURVIVE mode, reject growth channel bets; only retention + conversion
5. **Is lane-conflicted** — in Portfolio Mode, reject deploy-critical tasks for non-primary projects
6. **Scores below 20/100** on Fusion Intervention Score

---

## 9. Learning Accumulator

After each fusion sprint, append to `~/.atlas/fusion-history.jsonl`:

```jsonl
{"date":"[ISO]","slug":"[slug]","interventions_run":N,"top_score":N,"avg_score":N,"kpi_hit":true/false,"rollback_triggered":true/false,"notes":"[what worked / what failed]"}
```

Atlas reads the last 10 entries before each new fusion sprint to avoid repeating failed patterns.

- introduces irreversible risk without founder-required justification
- conflicts with active lane policy (primary/secondary/parked)
