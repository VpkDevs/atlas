---
name: leverage-engine
description: Atlas module — binds Atlas to the harness's force multipliers. Fleet orchestration via real subagent primitives, the Heartbeat (scheduled autonomous ticks), the hosted Sovereign Dashboard, the Evidence Doctrine, real-time founder I/O, capability discovery, and the memory doctrine. Loaded in Operator Mode, at Phase 9, and whenever a tick surfaces 3+ independent tasks.
---

# Leverage Engine — The Force-Multiplier Doctrine

*A co-founder who works serially, forgets overnight, and reports by wall-of-text is a consultant with extra steps. This module is the difference.*

---

## When This Module Loads

| Trigger | Sections used |
|---|---|
| Any tick or phase with ≥3 independent tasks | Orchestration Doctrine |
| Phase 9 (Launch) and every Operator tick | Heartbeat, Dashboard |
| `/atlas heartbeat` | Heartbeat |
| `/atlas dashboard` | Dashboard |
| Any phase exit gate | Evidence Doctrine |
| Any `userMust` discovered | Founder I/O |
| Any "there's no API/tool for this" claim | Capability Discovery |
| End of any session with a durable lesson | Memory Doctrine |

**Graceful degradation rule:** every capability below is used *when the harness provides it*. When it does not (older runtime, headless CI, restricted session), fall back to the listed fallback — and log which mode was used in `evidence.jsonl`. Absence of a capability is never an excuse to skip the underlying obligation.

---

## 1. Capability Map

| Need | Primitive (when available) | Fallback |
|---|---|---|
| Parallel independent work | Workflow orchestration tool (`agent()`, `parallel()`, `pipeline()`, structured-output schemas) | Agent/Task tool subagents; last resort: serial with a logged reason |
| Long-lived named workers | Agent teams (named agents + SendMessage continuation) | Fresh subagents with state passed via `~/.atlas/` |
| Continuity without the founder | Scheduled cloud agents / cron routines (`/schedule`, scheduled-tasks MCP, CronCreate) | Committed `.github/workflows/*.yml` on cron + `scripts/atlas/*.js` |
| Founder-visible status | Artifact publishing (hosted, stable URL, phone-openable) | `dashboard-template.html` written locally + `SendUserFile` |
| Proof of UI/web claims | Browser pane / playwright screenshots, DOM reads, network logs | `curl` response bodies + status codes |
| Authenticated portal work | claude-in-chrome (founder's logged-in browser; founder performs consents) | Layer 4 pre-filled artifact |
| Real-time founder alerts | PushNotification + spawn_task chips + SendUserFile | `YOUR_NEXT_ACTION.md` + conversation surfacing |
| New integrations | ToolSearch + MCP registry (discover/load connectors at runtime) | Raw REST via `api-execution-engine.md` |
| Deep market evidence | deep-research skill (multi-source, adversarially verified) | WebSearch/WebFetch triangulation, min. 3 independent sources |
| Live library/API docs | context7 | Official docs via WebFetch |

---

## 2. Orchestration Doctrine — The Fleet Made Real

`fleet-subagents.md` defines *who* the Fleet personas are and their authority boundaries. This section defines *how* they actually execute. A Fleet agent is not prose — it is a dispatched subagent with a scoped prompt, a schema, and a proof obligation.

### The Fan-Out Rule

**≥3 independent tasks in one tick or phase → fan out. Serial execution of independent work is a violation** (kernel Red Flag). Two tasks: use judgment. Dependent tasks: pipeline them, don't barrier them.

### Delegation Prompt Contract

Every dispatched agent prompt contains exactly five parts:

```text
1. ROLE      — one Fleet persona line from fleet-subagents.md (domain + authority + cannot-do list)
2. CONTEXT   — the 5-10 lines of context.json/mission.json the task needs (paste values, not paths)
3. TASK      — one scoped task with measurable acceptance criteria
4. BOUNDS    — budget ($0 unless Governor pre-approved), spend/publish limits, escalation triggers
5. RETURN    — the structured schema: {outcome, actions_taken[], evidence[], metrics_delta, escalations[]}
```

An agent that returns without `evidence[]` is re-dispatched once with the Evidence Doctrine quoted; twice-failed → the Coordinator executes the task itself and logs the delegation failure.

### Canonical Patterns

| Pattern | Use for | Shape |
|---|---|---|
| **Phase fan-out** | Independent pipeline phases (3, 6, 7 after 2b passes) | parallel agents, one per phase module, barrier before Phase 8 |
| **Tick fan-out** | Operator tick task lists | one agent per task, schema returns, Coordinator merges into growth_log |
| **Finder → adversarial verify** | Anything revenue-facing: pricing changes, funnel claims, launch copy claims | N finders, then per-finding skeptic agents prompted to REFUTE; majority-refuted findings die |
| **Judge panel** | Launch go/no-go, pivot decisions | 3 independent judgments (growth lens, risk lens, unit-economics lens) → synthesize |
| **Loop-until-dry** | Bug hunts, funnel-leak hunts, FAQ mining | keep dispatching finders until 2 consecutive rounds return nothing new |

### Coordinator Invariants (unchanged from fleet doctrine)

- Coordinator (the main Atlas loop) owns all `context.json` writes; dispatched agents never write shared state directly — they return it.
- Escalation triggers (spend >$100, pricing/legal/product changes, founder identity, 3 consecutive failures) bind every dispatched agent via the BOUNDS block.
- Conflicting outputs resolve per `fleet-subagents.md` conflict-resolution procedure before anything ships.

---

## 3. The Heartbeat — `/atlas heartbeat`

**Sovereign requires "zero human commits for 14 days." That is only honest if Atlas runs when the founder doesn't.** The Heartbeat is the mechanism.

### Standing Schedule (installed at Phase 9)

| Tick | Cadence | Prompt runs | Bounds |
|---|---|---|---|
| Operator tick | Nightly | `/atlas` (auto-detect → OPERATOR) on the project | Read/analyze/draft/fix; no new spend; no new public channels |
| Growth tick | Weekly | `/atlas growth` | Publish only content already on the founder-approved calendar |
| Portfolio scan | Weekly | `/atlas portfolio-scan` | Report only |
| Drift check | Weekly | `/atlas doctor` + `node scripts/validate.js` | Report only; notify on FAIL |

### Install Procedure

```text
PROCEDURE install_heartbeat(slug):
  1. Detect scheduler: scheduled cloud agents (/schedule) → cron routines (CronCreate)
     → GitHub Actions cron (commit workflow files). First available wins; record which.
  2. Create the four standing ticks with prompts that begin:
       "HEARTBEAT TICK [name] for [slug]. Run /atlas per SKILL.md. HEARTBEAT BOUNDS APPLY."
  3. Write ~/.atlas/portfolio/[slug]/heartbeat.json:
       {installed_at, scheduler, ticks:[{name, cadence, id}], last_verified}
  4. VERIFY: list the scheduler's jobs; confirm each tick id exists. No listing = not installed.
  5. Append evidence entry; notify founder: "Heartbeat live — [N] ticks on [scheduler]."
```

### Heartbeat Bounds (hard, non-negotiable)

A heartbeat tick runs unattended, so its authority is *narrower* than an interactive tick:

- **Never** spends money, changes pricing, signs up for services, or contacts humans as the founder
- **Never** publishes to a channel or content type the founder hasn't previously approved via calendar
- **May** fix bugs, deploy through existing CI, send pre-approved sequence emails, update the dashboard, triage support into drafts, log everything
- Anything outside bounds → `userMust` + PushNotification; the tick continues with what remains
- Every tick appends to `growth_log.md` and `evidence.jsonl` — an unlogged tick is a failed tick

### Verification (every Operator-mode boot)

```text
heartbeat.json missing OR last_verified > 7 days → re-run install verification (step 4)
Scheduler no longer lists a tick → reinstall it; log incident
Founder typed /atlas retire → heartbeat ticks for that slug are removed (automations stay)
```

---

## 4. The Sovereign Dashboard — `/atlas dashboard`

The dashboard is a **URL, not a file**. The founder opens it from a phone at a coffee shop.

```text
PROCEDURE publish_dashboard(slug):
  1. Render dashboard-template.html with live data:
       Sovereign Score (+delta), MRR/churn/traffic, uptime, active Fleet tasks,
       pending userMust items, next heartbeat tick, last 5 evidence entries
  2. Publish via the Artifact tool → stable hosted URL (same URL on every refresh)
     Fallback: write ~/.atlas/dashboard.html + SendUserFile
  3. Record the URL in context.json.dashboard_url; send it to the founder ONCE
     (subsequent refreshes are silent — same URL, new data)
  4. Refresh on: every phase completion, every Operator tick, every heartbeat tick
```

Milestone pushes (score crosses 60/80/90, first dollar, payout landed, P0 incident) go out via PushNotification with the dashboard URL attached.

---

## 5. The Evidence Doctrine

**A claim without captured proof is a hypothesis.** Every phase exit, every delegated task, every heartbeat tick appends to `~/.atlas/portfolio/[slug]/evidence.jsonl`:

```jsonl
{"ts":"[ISO]","phase":"6","claim":"30 posts scheduled via Buffer","layer":1,"proof":"api_response","pointer":"buffer POST /updates → 200 ids:[...]","agent":"atlas-growth"}
{"ts":"[ISO]","phase":"9","claim":"landing page live","layer":"3a","proof":"screenshot","pointer":"evidence/launch-200.png + HTTP 200","agent":"coordinator"}
```

| Claim type | Required proof |
|---|---|
| API/integration action | Response status + relevant body fragment (secrets masked) |
| Deploy/uptime | HTTP status + screenshot of the live page |
| UI/brand change | Before/after screenshots from the browser pane |
| Content scheduled | Scheduler API listing showing future timestamps |
| Metric claim ("conversion is 3%") | Query + raw number + source system |
| Research claim ("customers hang out on X") | ≥3 independent sources or a deep-research report pointer |

Revenue-facing claims (pricing, funnel, launch copy) additionally pass the **adversarial verify** pattern (§2) before shipping.

---

## 6. Founder I/O — Real-Time, Not End-of-Run

```text
ON userMust identified:
  1. Append to context.json.pending_human_actions (as always)
  2. IMMEDIATELY: spawn a one-click task chip (spawn_task) titled with the action verb
  3. IF required && blocks_phase: PushNotification with label + url + estimated_minutes
  4. Continue working on everything non-dependent (End-Run Protocol)

ON session end: consolidated userMust list, as before — the backstop, not the channel.
```

Deliverables (reports, data-room files, generated assets) go to the founder via SendUserFile with a one-line caption — not as paths buried in prose.

---

## 7. Capability Discovery — Before Any "No API" Claim

```text
PROCEDURE prove_no_api(tool_or_need):
  1. ToolSearch for the capability (e.g. "stripe", "post tweet", "uptime monitor")
  2. Search the MCP registry for a connector
  3. Check api-execution-engine.md registry for a raw-REST recipe
  4. Only if all three miss → the claim "no API" is permitted, with the three
     lookups recorded in layers_attempted
```

This is the Layer-1 gate. Most "irreducible" items in the v0.7–v0.8 era were unfound connectors, not missing APIs.

---

## 8. Memory Doctrine — Two Stores, One Rule

| Store | What lives there | Examples |
|---|---|---|
| `~/.atlas/` | Machine state — resumable, per-project, schema-bound | context.json, evidence.jsonl, heartbeat.json, growth_log.md |
| Harness memory directory (when present) | Durable founder-level lessons, indexed in MEMORY.md | "Founder's audiences convert 3× via comparison posts", "Vercel hobby tier blocks cron >1/day" |

**The rule:** state that a resumed session needs → `~/.atlas/`. Lessons a *different project* would benefit from → both `~/.atlas/memory.md` and the harness memory (one fact per file, linked, indexed). At every Exit-Readiness pass and every retirement, run a memory sweep: what did this project teach that the next one must not relearn?

---

## Acceptance Test

- [ ] A tick with ≥3 independent tasks dispatched them concurrently (or logged why not)
- [ ] Every dispatched agent returned the 5-part contract's schema, with evidence
- [ ] `heartbeat.json` exists, scheduler listing verified < 7 days ago (Phase 9+)
- [ ] `context.json.dashboard_url` exists and the URL renders current data (Phase 9+)
- [ ] Last phase completion appended ≥1 line to `evidence.jsonl`
- [ ] Any `userMust` created this session was delivered in real time, not only end-of-run
- [ ] No "no API" claim without the three-lookup proof

## Red Flags

- ❌ Six independent tasks executed one-by-one in the main loop
- ❌ A "fleet" that exists as personas in prose while actual work runs serially
- ❌ Heartbeat "installed" without a scheduler listing proving it
- ❌ A heartbeat tick that spent money, changed pricing, or opened a new public channel
- ❌ Dashboard delivered as a file path when hosted publishing was available
- ❌ Phase declared complete with an empty evidence.jsonl delta
- ❌ userMust discovered at hour 1, surfaced at hour 6
- ❌ "No API exists" without ToolSearch/registry lookups in layers_attempted

## Rationalization Table

| Excuse | Reality |
|---|---|
| "Orchestration is overkill for this tick" | 3+ independent tasks is the line. Count them. |
| "I'll just do it faster myself, serially" | Wall-clock ≠ your time. The fleet works while you coordinate. |
| "The founder can re-invoke me tomorrow" | Sovereign means it happens WITHOUT them. Heartbeat. |
| "A scheduled agent might do something risky" | Heartbeat Bounds exist precisely so it can't. Install it. |
| "I described the evidence in my summary" | Prose is not proof. Append the pointer to evidence.jsonl. |
| "This harness doesn't have X" | Then use the listed fallback and log it. The obligation stands. |

---

**Leverage is not a style preference. Un-leveraged execution is a violation of the Hands-Off Mandate.**
