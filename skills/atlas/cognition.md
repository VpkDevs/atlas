---\nname: cognition\ndescription: Atlas brain, mission intelligence, context window, and loadable kernel routing.\n---\n\n# Atlas Brain\n\n# Atlas Brain — Session Continuity Architecture

**Loaded:** Phase 0 (Context Load), before reading the codebase
**Written:** At the end of every phase and after every major action
**Purpose:** Make Atlas stateless-between-sessions but stateful-across-them. One file contains everything needed to resume from exactly where the last session ended.

---

## The Continuity Problem

Every competitor loses business state between sessions. Devin has "session notes" scoped to a single repo task. OpenHands has no cross-session memory. Lovable stores code but not decisions.

Atlas operates across 22 phases (0-21) plus perpetual operator loops spanning days or weeks. Without ATLAS_BRAIN.md:
- Phase 3 (Legal) decisions are re-derived from scratch in a later session
- API keys confirmed-working in Phase 2 need re-testing in Phase 8
- A founder who closes Claude Code loses the thread of what Atlas decided and why
- Re-onboarding wastes 20-40 minutes every time

With ATLAS_BRAIN.md: `/atlas resume` reads the brain file and picks up in under 60 seconds, with full context.

---

## ATLAS_BRAIN.md Location and Format

Written to: `~/.atlas/portfolio/[slug]/ATLAS_BRAIN.md`

Also committed to the product repo at: `.atlas/BRAIN.md` (gitignored from public repos, committed in private repos)

### Schema

```markdown
# ATLAS_BRAIN — [Product Name]
**Slug:** [slug]
**Last updated:** [ISO timestamp]
**Session count:** [N]

## Current State
Phase: [N] — [Phase Name]
Status: [active | paused | complete | blocked]
Sovereign Score: [X]/100
Primary lane: [slug | none]
Next action: [one specific thing Atlas will do when invoked next]

## Phase History
| Phase | Name | Status | Completed | Key Output |
|-------|------|--------|-----------|-----------|
| 0 | Context Load | ✅ | [date] | context.json initialized |
| 1 | Onboarding | ✅ | [date] | Business Context confirmed |
| 2 | Code Sprint | ✅ | [date] | Deployed: [URL] |
| 2b | Security | ✅ | [date] | 0 CRITICAL, 2 HIGH addressed |
| 3 | Legal | ✅ | [date] | /terms + /privacy live |
| 4 | Pre-Flight | ✅ | [date] | 11/11 GREEN |
| 5 | Launch Strategy | 🔄 | — | In progress |
| 15 | Money Engine | ⏳ | — | Pending |
| 16 | Pricing Lab | ⏳ | — | Pending |
| 17 | Cashflow Ops | ⏳ | — | Pending |
| 18 | Offer Forge | ⏳ | — | Pending |
| 19 | Channel Dominance | ⏳ | — | Pending |
| 20 | Acquisition Sniper | ⏳ | — | Pending |
| 21 | Capital Governor | ⏳ | — | Pending |
| ... | ... | ⏳ | — | Pending |

## Confirmed Working APIs
(These were tested this run — skip re-testing on resume)
- STRIPE_SECRET_KEY: ✅ confirmed [date]
- RESEND_API_KEY: ✅ confirmed [date]
- BETTER_UPTIME_API_KEY: ❌ missing
- POSTHOG_API_KEY: ✅ confirmed [date]

## Key Decisions Made
(Do not re-derive these — they were deliberate choices)
- Entity type: Texas LLC (chosen over C-Corp because definition_of_success = lifestyle) [Phase 7, date]
- Primary launch channel: HN Show HN (scored 59/70 vs PH 44/70) [Phase 5, date]  
- Email provider: Resend ($0 free tier, 3K/mo sufficient for current size) [Phase 8, date]
- Pricing: $29/mo Individual, $99/mo Studio (research showed $25-35 range for dev tools) [Phase 12, date]

## Open Decisions
(These require founder input before Atlas can proceed)
- [ ] Entity formation timing: now or after $1K MRR? Founder deferred. [Phase 7]
- [ ] Product Hunt vs HN first launch: founder wants to decide. [Phase 5]

## Pending Human Actions (userMust)
(Sorted by blocking status)
BLOCKING Phase 9 (Launch):
  → [um-003] File Texas LLC — sos.state.tx.us (~1 hour, $300) — must complete before launch
  
NON-BLOCKING (do when convenient):
  → [um-001] Set SENTRY_DSN in production env — sentry.io/settings (~3 min)
  → [um-002] Record 2-min demo video — see LAUNCH_STRATEGY.md

## Rollback Registry
(How to undo the last 5 major actions)
1. [2026-05-08 14:23] Deploy to Vercel → rollback: `vercel rollback` or git revert [hash]
2. [2026-05-08 13:45] Committed security headers → rollback: git revert [hash]
3. [2026-05-08 12:30] Created Resend email sequences → rollback: Resend dashboard > delete sequences
4. [2026-05-07 18:00] Created Better Uptime monitors → rollback: API DELETE /v2/monitors/[id]
5. [2026-05-07 16:15] Scaffolded legal routes → rollback: git revert [hash]

## What Atlas Knows About This Product
(Stable facts — don't re-read from codebase unless product changed)
- Stack: Next.js 14, Supabase, Stripe, Resend, Vercel
- Production URL: https://[product].vercel.app
- Target customer: Solo founders and indie developers using Claude Code
- Definition of success: Lifestyle business — $10K MRR by Q4 2026
- Founder location: San Antonio, Texas
- Risk tolerance: Moderate
- Business Context hash: [md5 of context.json — if mismatches, re-run onboarding]
```

---

## Brain Init Procedure (Phase 0)

```text
PROCEDURE brain_init:

  1. Check for existing ATLAS_BRAIN.md:
     cat ~/.atlas/portfolio/[slug]/ATLAS_BRAIN.md
     
  2. IF brain exists:
     a. Display current state summary (5 lines max)
     b. Show "Last session: [timestamp] | Phase: [N] | Score: [X]"
     c. Ask: "Resume from Phase [N]: [Phase Name]? Or restart? (resume/restart)"
     d. On 'resume': load brain, skip completed phases, proceed from current
     e. On 'restart': archive brain as ATLAS_BRAIN_[date].md.bak, start fresh
     f. If no response in 60s (autonomous mode): auto-resume
     
  3. IF brain does not exist:
     a. Create ~/.atlas/portfolio/[slug]/ directory
     b. Initialize blank ATLAS_BRAIN.md from schema above
     c. Set Phase = 0, Status = active, Score = 0
     d. Proceed to Phase 1 (Onboarding)
```

**Display format on resume:**

```text
─────────────────────────────────────────────────────
ATLAS BRAIN LOADED — [Product Name]

Last session: [timestamp ago]
Current phase: [N] — [Phase Name] ([status])
Sovereign Score: [X]/100
Pending human actions: [N blocking, N non-blocking]

Resuming from: [specific next action]
[If any BLOCKING userMust:] ⚠️ Blocked on: [um-ID] — [label]

Type 'resume' to continue or 'status' to see full brain.
Auto-resuming in 30 seconds...
─────────────────────────────────────────────────────
```

---

## Brain Write Procedure (After Every Phase)

```text
PROCEDURE brain_write(phase_completed, outcomes):

  1. Read current ATLAS_BRAIN.md
  2. Update Phase History row: status → ✅, completed → [today], key_output → [specific]
  3. Update Current State: next phase + next action
  4. Update Confirmed Working APIs: add any APIs tested this phase
  5. Append Key Decisions Made: any deliberate choices that shouldn't be re-derived
  6. Append Rollback Registry: last major action + how to undo
  7. Update Sovereign Score
  8. Write atomically (tmp → bak → final)
  9. Commit: git add .atlas/BRAIN.md && git commit -m "[Atlas] Brain updated: Phase [N] complete"
```

**Key Decisions are permanent.** Once a decision is recorded in ATLAS_BRAIN.md, Atlas does not re-derive it on subsequent sessions. If the founder wants to change a decision, they edit ATLAS_BRAIN.md directly and Atlas respects the update.

---

## Brain Read Procedure (Every Phase Start)

Before starting any phase, Atlas reads ATLAS_BRAIN.md to check:

1. **Is this phase already complete?** If yes, skip it and announce "Phase [N] already complete [date]. Proceeding to Phase [N+1]."
2. **Are there blocking userMust items?** If yes, display them immediately. If they block the current phase, pause.
3. **Are there confirmed API keys?** Read from brain, skip re-testing.
4. **What decisions are already made?** Read Key Decisions. Do not re-derive.
5. **What does Atlas already know about the product?** Read stable facts. Do not re-read codebase for things already confirmed.
6. **Portfolio state check:** If 2+ projects exist, read lane assignment and enforce primary-only deploy-critical execution.

This eliminates 80% of redundant work on resume sessions.

---

## Phase Checkpoint Protocol

At the end of every phase checkpoint output, Atlas writes to ATLAS_BRAIN.md before displaying the checkpoint:

```text
[Atlas writes ATLAS_BRAIN.md]
[Atlas displays checkpoint to founder]
[Atlas proceeds to next phase]
```

Never display a checkpoint without writing the brain first. If Atlas crashes after displaying but before writing, the state is lost — the write must be first.

---

## Rollback Registry Rules

The Rollback Registry maintains the last 10 major actions with undo instructions. Rules:

- Only record **external-state-changing actions** (deploys, API calls, entity formation, email sends)
- File writes (code commits) have implicit rollback via git — just record the commit hash
- API calls that created resources record the resource ID + DELETE endpoint
- Irreversible actions (entity formation, domain purchase) are flagged `IRREVERSIBLE — no undo` but still recorded for forensic value
- Registry is FIFO with 10-entry limit — oldest drops off as new actions push in

---

## Autonomous Mode vs. Interactive Mode

**Interactive mode (default):** Atlas pauses at every BLOCKING userMust. Displays pending items. Waits for founder response.

**Autonomous mode** (set in ATLAS_BRAIN.md `"autonomous": true`): Atlas never pauses. Routes around every blocker using End-Run Protocol. Surfaces all pending items at natural stopping points. Used by founders who want Atlas to execute continuously without confirmation loops.

To enable: `"autonomous": true` in ATLAS_BRAIN.md `## Settings` section.

---

## Recovery from Corrupted Brain

If ATLAS_BRAIN.md is corrupted or missing mid-run:

```text
PROCEDURE brain_recovery:
  1. Check for ATLAS_BRAIN.md.bak (previous write backup)
  2. If bak exists: restore from bak, log to incidents/
  3. If no bak: reconstruct from context.json + git log
     - git log --oneline -20 gives phase completion history
     - context.json gives current score and completed_modules
     - From these, reconstruct Phase History and resume
  4. Flag as recovered: add "⚠️ RECOVERED [timestamp]" note to brain
  5. Continue from reconstructed state
```

Never abandon a run because of a corrupted brain. Reconstruct and continue.

---

## Cross-Session Learning Accumulator

Append to `~/.atlas/portfolio/[slug]/ATLAS_BRAIN.md` after each session under this heading.
Atlas reads this section before choosing any approach — avoids repeating strategies that failed.

```markdown
## Learning Log

| Date | Approach Tried | Outcome | Pattern | Action |
|------|---------------|---------|---------|--------|
| [ISO] | Launched on PH without email list | 0 paid day-1 | FAILED: no warm audience | Pre-build list ≥ 200 before next launch |
| [ISO] | Weekly email sends via Resend | 23% open, 6% click | SUCCESS | Keep cadence, increase value content |
| [ISO] | Stripe checkout with 2-step payment | 18% cart abandon vs 31% before | SUCCESS | Default to Stripe embedded checkout |
| [ISO] | HN Show HN post on Monday 9am | 140 points, 87 comments, 28 signups | SUCCESS | Replicate timing for next Show HN |
| [ISO] | Instagram organic for B2B tool | 0 attributed signups after 3 weeks | FAILED: wrong channel | Freeze Instagram, reallocate to LinkedIn |
```

**Rules for learning accumulator:**
- Every failed approach gets logged — failure is data
- Append only; never edit or delete entries
- Before starting any new strategy, search this log for matching patterns
- If log has ≥ 5 `FAILED` entries for a pattern category, surface as systemic issue in weekly review
- If log has ≥ 3 `SUCCESS` entries for a pattern, it becomes a default preference in future sessions

---

## Quick Resume Card

Written to the top of every ATLAS_BRAIN.md update. Printed first on any `/atlas resume`.
Designed to restore full context in ≤ 60 seconds.

```markdown
## QUICK RESUME CARD
_As of [ISO datetime] — [N] seconds to read_

**Product:** [name] ([slug])
**Phase:** [N] — [Name] ([status])
**Score:** [X]/100  →  gaps: [top 2 gap categories]
**Mode:** [SCALE / BALANCED / PRESERVE / SURVIVE]  →  runway [N] days
**MRR:** $[N]  →  [trend: ↑ / ↓ / →] [N]% WoW

**LAST ACTION:** [One sentence: what Atlas did last]
**NEXT ACTION:** [One sentence: what Atlas does immediately on resume]

**BLOCKERS:** [N blocking userMust items — list IDs]
**OPEN DECISIONS:** [N items requiring founder input]

**DO NOT RE-DERIVE:** [Comma-separated: list of decisions already made]
**DO NOT RE-TEST:** [Comma-separated: list of APIs already confirmed]
```

**Quick Resume Card is always the first section read on resume.**
If Quick Resume Card is absent or > 7 days old, Atlas regenerates it before proceeding.

---

## Session Diff Protocol

To avoid rewriting the entire brain file every session, Atlas uses targeted updates.

```text
PROCEDURE brain_diff_write(changed_fields):

  # Only write sections that changed
  for field in changed_fields:
    find_section(ATLAS_BRAIN.md, field)
    replace_section(new_content)
  
  # Always update Quick Resume Card (it's a summary — always stale after any change)
  update_quick_resume_card()
  
  # Always append to Rollback Registry (never overwrite)
  append_to_rollback_registry(latest_action)
  
  # Always append to Learning Log (never overwrite)
  if outcome_of_session in [SUCCESS, FAILED]:
    append_to_learning_log(approach, outcome, pattern, action)
  
  # Never touch these sections unless their underlying data changed:
  #   - Key Decisions Made
  #   - Confirmed Working APIs
  #   - What Atlas Knows About This Product
  
  # Atomic write: tmp → bak → final
```

Benefits:
- Write only changed fields → 50-80% smaller writes
- Learning Log and Rollback Registry grow linearly; never overwritten
- Quick Resume Card is always fresh; always regenerated

---

## Context Window Budget Tracker

Atlas tracks how many tokens reading the brain file will consume.
If brain file exceeds 2,000 lines, split into `ATLAS_BRAIN.md` (live) and `ATLAS_BRAIN_ARCHIVE.md` (historical).

```markdown
## Brain File Health
Lines: [N]
Estimated tokens: [N × 0.75]
Status: [healthy | growing | split-needed]
Last split: [ISO date or "never"]

Archive policy: Move Phase History rows older than 30 days to ATLAS_BRAIN_ARCHIVE.md
              Move Learning Log entries older than 60 days to ATLAS_BRAIN_ARCHIVE.md
              Keep: last 5 Rollback Registry entries, all Key Decisions, all open userMust
```

---

## Acceptance Test (Brain Module)

- [ ] `~/.atlas/portfolio/[slug]/ATLAS_BRAIN.md` exists and is valid markdown
- [ ] Phase History has an entry for every completed phase with a real key_output (not placeholder)
- [ ] Key Decisions section has at least one entry per phase that involved a choice
- [ ] Rollback Registry has an entry for the most recent deploy
- [ ] Confirmed Working APIs reflects the actual state of credentials_index.json
- [ ] `/atlas resume` displays the correct "last session / current phase / score" in under 5 seconds
- [ ] Brain write happens BEFORE phase checkpoint is displayed (not after)
- [ ] If 2+ projects exist, current primary lane is recorded and matches portfolio state

## Red Flags

- ❌ Phase completed but ATLAS_BRAIN.md not updated
- ❌ Key Decision recorded as "chose X" without reasoning — every decision needs "because Y"
- ❌ Rollback Registry entry without a specific undo command or git hash
- ❌ Resuming a session without reading ATLAS_BRAIN.md first
- ❌ Re-deriving a decision that is already recorded in Key Decisions
- ❌ Displaying checkpoint before writing brain (crash risk)
- ❌ Brain write that overwrites Key Decisions already made (append-only section)
- ❌ Treating `"autonomous": true` as license to skip userMust on IRREVERSIBLE actions — even autonomous mode pauses for irreversible actions\n\n---\n\n# Mission Intelligence\n\n# Atlas Mission Intelligence — The Oracle

**Activated:** Operator Mode (live product, Phase 9+ complete)
**Purpose:** Transform raw signals into strategic decisions. The Oracle is what separates Atlas from a task runner.

---

## The Oracle Tick

Every `/atlas` invocation in Operator Mode runs the Oracle Tick:

```
PROCEDURE oracle_tick:
  1. INGEST   — pull fresh data from all connected APIs
  2. ANALYZE  — compute deltas, detect anomalies, identify trends
  3. PREDICT  — project forward 7/30/90 days based on current trajectory
  4. DECIDE   — generate ranked list of strategic actions
  5. DELEGATE — assign actions to Fleet agents
  6. EXECUTE  — agents execute via Six-Layer Hierarchy
  7. REPORT   — update dashboard, mission.json, growth_log.md
```

---

## Step 1: INGEST — Signal Collection

Pull from every connected API (check `credentials_index.json`):

### Revenue Signals (Stripe)
```
MRR, MRR growth rate, new MRR, churned MRR, expansion MRR
Customer count, ARPU, LTV, churn rate
Last 7 days vs previous 7 days (delta)
Payment failure rate, dunning recovery rate
```

### Traffic Signals (Analytics)
```
Unique visitors, page views, bounce rate, session duration
Top pages, top referrers, top search queries
Signup conversion rate, activation rate
Geographic distribution of users
```

### Product Signals (Error tracking + DB)
```
Error rate, error types, most frequent errors
Feature usage heatmap (if instrumented)
Support ticket volume + categories
User feedback/NPS (if collected)
```

### Market Signals (Web search)
```
Competitor product updates (changelog monitoring)
Industry news affecting this product's domain
New entrants in the space
Regulatory changes affecting the business
```

### Social Signals (Social APIs)
```
Mentions of product name / competitor names
Sentiment analysis of mentions
Engagement on recent posts
Community growth (followers, members)
```

---

## Step 2: ANALYZE — Pattern Detection

### Delta Analysis
For each metric, compute:
```
current_value, previous_value, delta_absolute, delta_percentage
trend: accelerating | stable | decelerating | declining
anomaly: true/false (>2 standard deviations from 30-day mean)
```

### Anomaly Detection
```
IF metric delta > 2σ from rolling mean:
  CLASSIFY as: OPPORTUNITY | THREAT | NOISE
  
  OPPORTUNITY: positive spike (viral post, media mention, feature resonance)
    → Action: amplify what caused it
  
  THREAT: negative spike (competitor launch, outage aftermath, bad review)
    → Action: mitigate within 24h
  
  NOISE: random fluctuation within normal variance
    → Action: log, do not react
```

### Cohort Intelligence
If sufficient data exists (30+ users):
```
Which acquisition channel produces highest-LTV users?
Which feature is most correlated with retention?
At what point do users typically churn?
What's the activation rate by signup source?
```

---

## Step 2b: Competitive Intelligence (Runs Every Tick in Operator Mode)

The Oracle monitors the competitive landscape continuously — not just at launch.

### Competitor Signal Sources

**F5Bot (Reddit monitoring — free, set up once):**
```
Keywords to monitor (set up at f5bot.com):
  - [product name]
  - [main competitor names from business context]
  - "[problem domain] tool" (e.g., "email automation tool")
  - "[product category] alternative"

Atlas reads F5Bot email digest → extracts signal → classifies as opportunity/threat/noise
```

**Google Alerts (set up in launch module, read here):**
```
Alerts configured for:
  - [product name]
  - [competitor names]
  - [key industry keywords]
```

**GitHub competitor monitoring:**
```bash
# Monitor competitor repos for major releases
for repo in [competitor_repos]; do
  gh api repos/$repo/releases/latest --jq '.tag_name + " " + .published_at + " " + .name'
done
```

**HN + Reddit search (runs weekly):**
```
site:news.ycombinator.com "[competitor name]" last 7 days
site:reddit.com "[competitor name]" last 7 days
→ Flag: any post with 50+ points discussing competitor = potential threat or opportunity
```

### Competitive Response Protocol

```
COMPETITOR LAUNCHES MAJOR FEATURE:
  1. Read feature announcement
  2. Assess: overlap with our core value prop? (high/medium/low)
  3. If HIGH overlap:
     → Immediate: draft differentiation narrative for Atlas Growth to publish
     → 7 days: evaluate roadmap to address capability gap
     → Flag in decisions.md
  4. If MEDIUM:
     → Note in growth_log.md
     → Add to product backlog consideration
  5. If LOW:
     → Log and ignore

COMPETITOR LAUNCHES / GOES VIRAL:
  1. Identify what's resonating (read comments, upvotes, shares)
  2. Is there an angle we can ride? (commentary, comparison, alternative positioning)
  3. If yes: Atlas Growth drafts "how we differ" content immediately
```

---

## Step 3: PREDICT — Forward Projection

### Revenue Trajectory (Actual Math)

```python
# Linear regression model (simple, honest)
# Input: MRR data points from last 30-90 days
# Output: projected MRR at 30/90/365 days with confidence interval

def project_mrr(mrr_history: list[float]) -> dict:
    """
    mrr_history: list of weekly MRR snapshots, most recent last
    Uses linear regression on log(MRR) to model compound growth
    """
    if len(mrr_history) < 4:
        return {"confidence": "low", "note": "insufficient history for projection"}
    
    # Calculate week-over-week growth rates
    growth_rates = [(mrr_history[i] / mrr_history[i-1]) - 1 
                    for i in range(1, len(mrr_history))]
    avg_growth = sum(growth_rates) / len(growth_rates)
    std_growth = (sum((r - avg_growth)**2 for r in growth_rates) / len(growth_rates))**0.5
    
    current_mrr = mrr_history[-1]
    
    return {
        "30_days": current_mrr * (1 + avg_growth)**4.3,   # ~4.3 weeks
        "90_days": current_mrr * (1 + avg_growth)**13,
        "365_days": current_mrr * (1 + avg_growth)**52,
        "confidence_band": f"±{std_growth * 100:.0f}%",
        "growth_rate_weekly": f"{avg_growth * 100:.1f}%",
        "trend": "accelerating" if growth_rates[-1] > avg_growth else "decelerating" if growth_rates[-1] < avg_growth else "stable"
    }
```

Atlas runs this model and reports:
```
Revenue Trajectory (linear regression on [N] weeks of data):
  Weekly growth rate: [X]% (trend: [accelerating/stable/decelerating])
  
  30 days:  $[MRR] (±[Y]%)
  90 days:  $[MRR] (±[Y]%)
  365 days: $[MRR] (±[Y]%) = $[ARR] ARR
  
Break-even: [date] (at current cost structure of $[monthly_cost]/mo)
Ramen-profitable: [date] ($3K MRR)
S-Corp-threshold: [date] ($80K ARR — when S-Corp election saves money)

Confidence: [High (>12 data points) / Medium (6-12) / Low (<6)]
Note: [any factors that make this projection unreliable]
```

### Churn Prediction Signal

The Oracle watches for churn precursors:
```
High-risk user signals (check weekly):
  - User hasn't logged in for 14+ days AND was previously active daily → at-risk
  - User viewed pricing/cancellation page in last 7 days → high-risk
  - User opened "billing" support thread → high-risk
  - User's feature usage dropped >50% week-over-week → at-risk

Response:
  high-risk (pricing page viewed) → Atlas Growth sends "can we help?" email immediately
  at-risk (usage drop) → Atlas Growth queues re-engagement email in 3 days
  Logged to growth_log.md for measurement
```

### Risk Forecast
```
Top 3 risks in next 30 days:
  1. [Risk] — probability: [X]% — impact: $[Y] MRR at risk
     Mitigation: [specific action]
  2. [Risk] — probability: [X]% — impact: [Y]
     Mitigation: [specific action]
  3. [Risk] — probability: [X]% — impact: [Y]
     Mitigation: [specific action]
```

### Opportunity Forecast
```
Top 3 opportunities in next 30 days:
  1. [Opportunity] — expected impact: +$[X] MRR
     Action required: [specific]
     Assigned to: [Fleet agent]
  2. ...
```

---

## Step 4: DECIDE — Strategic Action Generation

### Decision Framework

**P0 Incident Override (evaluate before scoring anything):**
```
PROCEDURE p0_override_check:
  1. Scan ~/.atlas/incidents/ for any file where:
       - date == today AND resolved == false
  2. IF found AND severity == P0:
       → Load incident-protocol.md
       → Execute p0_response() immediately
       → THIS TICK HAS ONE ACTION: resolve the P0
       → All Action Score ranking is skipped
       → Defer all other actions to next tick
       → Log: "Tick [N] pre-empted by P0 incident [filename]"
  3. IF found AND severity == P1:
       → p1_response() is the mandatory first action this tick
       → Continue to Action Score for remaining capacity (1-2 actions)
  4. IF none found:
       → Continue to Action Score below
```

For each non-incident action, score:
```
Action Score = (Revenue Impact × Probability of Success × Time Sensitivity) / (Effort in Hours × Risk)
```

Rank all actions by score. Execute top 3 this tick (or fewer if P1 consumed capacity).

### Strategy Check

Read `~/.atlas/portfolio/[slug]/mission.json`:
```json
{
  "objective": "Reach $10K MRR by Q3 2026",
  "strategy": "Product-led growth via freemium conversion",
  "constraints": ["$0 marketing budget", "solo founder"],
  "current_bet": "SEO + Reddit community engagement",
  "pivot_trigger": "If signup-to-paid conversion < 2% after 90 days"
}
```

Does the current strategy still make sense given new data?
- If yes: continue executing
- If pivot trigger hit: generate new strategy recommendation, surface to founder
- If strategy is working better than expected: recommend doubling down

### Mission Update

If metrics indicate the mission needs updating:
```
MISSION UPDATE RECOMMENDATION:
  Current: "Reach $10K MRR by Q3 2026"
  Recommended: "Reach $15K MRR by Q3 2026" 
  Reason: Growth rate 40% above projection; raise the target

  Accept? (Atlas auto-accepts if delta is positive. Negative pivots require founder confirmation.)
```

---

## Step 5: DELEGATE — Fleet Task Assignment

Map each decided action to the appropriate Fleet agent:

```
Action: "Post launch retrospective on Indie Hackers"
  → Atlas Growth (authority: can post to communities)
  → Acceptance: post live, 3+ comments received within 48h

Action: "Fix Sentry error #4521 (auth redirect loop)"
  → Atlas Product (authority: can fix bugs, create PRs)
  → Acceptance: error count drops to 0, PR merged

Action: "Apply for Cloudflare startup credits (renewal)"
  → Atlas Wealth (authority: can apply for credits)
  → Acceptance: application submitted, confirmation email logged
```

---

## Step 6: EXECUTE — Six-Layer Hierarchy

Each delegated task follows the Six-Layer Hierarchy (see SKILL.md). The executing agent tries Layer 1 first and only escalates when genuinely blocked.

---

## Step 7: REPORT — State Update

### Sovereign Score Recompute (runs first)
Before updating any display or log, recompute the score:
```
Load scoring.md → call compute_sovereign_score() with this tick's metrics
Write to context.json:
  {
    "runs_itself_score": [new_score],
    "score_updated_at": "[ISO timestamp]",
    "score_delta": [new_score - previous_score]
  }
If score dropped ≥5 points: immediately classify the drop category and add to Risk Forecast
If score crossed 90: emit sovereign milestone alert (Discord/Slack webhook if configured)
```

### Dashboard Update
Update `~/.atlas/dashboard.html` with:
- Current score and delta since last tick
- Active Fleet tasks and their status
- Top 3 metrics (MRR, traffic, activation)
- Risk/opportunity radar
- Next scheduled actions

### Growth Log
Append to `~/.atlas/portfolio/[slug]/growth_log.md`:
```markdown
## [Date] — Oracle Tick #[N]

**Metrics:** MRR $[X] (+[Y]%), Traffic [X] (+[Y]%), Activation [X]%
**Anomalies:** [list or "none"]
**Actions taken:** [list]
**Actions delegated:** [list with agent assignments]
**Strategy status:** [on-track | pivot-recommended | exceeding]
**Score:** [X]/100 (Δ +[Y])
```

### Cross-Project Intelligence
If portfolio has 2+ projects, append relevant learnings to:
- `~/.atlas/memory.md` — what's true across projects
- `~/.atlas/patterns/` — reusable patterns for this founder

---

## Pattern Oracle (10+ Projects)

When `~/.atlas/portfolio/` contains 10+ project histories:

```
PATTERN ORACLE ACTIVATED

Founder blindspots detected:
  - [Pattern] observed in [N] projects → auto-correcting in current project

Founder strengths detected:
  - [Pattern] → consistently above benchmark → doubling down

Historical parallel:
  "[Current Product]" at $[X] MRR resembles "[Past Product]" at same stage.
  Past outcome: [what happened]
  Recommendation: [specific action based on what worked/didn't]
```

---

## Oracle Frequency

| Mode | Frequency | Depth |
|------|-----------|-------|
| War Room (T+0 to T+72h) | Every `/atlas` invocation | Full tick + real-time monitoring |
| Active Growth (score 60-89) | Every `/atlas` invocation | Full tick |
| Sovereign (score 90+) | Weekly auto-tick via cron | Metrics snapshot + anomaly check |
| Portfolio review | Weekly | Cross-project analysis |

---

## Acceptance Test (Oracle Tick)

- [ ] All connected APIs queried successfully (or failures logged)
- [ ] Delta analysis computed for all available metrics
- [ ] At least 1 strategic action generated and delegated
- [ ] `growth_log.md` updated with this tick's entry
- [ ] Dashboard reflects current state
- [ ] `mission.json` reviewed (update proposed if warranted)

---

## Oracle Checkpoint (Every Tick)

```
─────────────────────────────────────────────────────
ORACLE TICK #[N] — [Product Name] — [Timestamp]

INGEST: [N] APIs queried | [N] failures logged
ANALYZE: [N] anomalies detected ([N] opportunity, [N] threat, [N] noise)
PREDICT:
  MRR trajectory: $[X] → $[Y] in 30 days (±[Z]%)
  Top risk: [description] ([X]% probability)
  Top opportunity: [description] (expected +$[X] MRR)
DECIDE: [chosen action] — score [X.XX]
DELEGATE:
  → [Agent]: [task description]
EXECUTE: [outcome summary]
REPORT: growth_log.md updated | dashboard refreshed | mission.json reviewed

Sovereign Score: [X] | Delta: [+/-N] since last tick
─────────────────────────────────────────────────────
```

## Red Flags

- ❌ Oracle tick that doesn't update growth_log.md
- ❌ PREDICT step without citing the data it's based on (not "I estimate")
- ❌ DECIDE step choosing more than one primary action for this tick
- ❌ DELEGATE step assigning a task to an agent whose domain doesn't cover it
- ❌ Competitor signal detected and classified as NOISE without explicit reasoning
- ❌ Churn precursor signal detected and not triggering a re-engagement action within 48h
- ❌ Pivot trigger reached in mission.json and not surfaced to founder
- ❌ Oracle running in Operator Mode without checking mission.json first
- ❌ Revenue trajectory projection without stating the assumption (growth rate, time period)\n\n---\n\n# Context Window\n\n# Atlas Context Window Protocol

**Loaded:** Phase 0 (Context Load), applied throughout all phases
**Purpose:** Prevent context drift, context exhaustion, and hallucination from stale state during long multi-phase runs.

## The Context Problem

A complete Atlas run across 14 phases involves:
- Full codebase read (Pass 1: 10K–100K tokens)
- Business context interview + confirmation
- Legal documents (ToS + Privacy Policy): ~3K tokens each
- Launch assets (HN post, Reddit posts, Indie Hackers): ~5K tokens total
- LAUNCH_SEQUENCE.md: ~3K tokens
- Marketing content (30-day calendar): ~10K tokens
- Growth engine tick outputs: ~2K tokens per phase

By Phase 8, a complex project has consumed 150K–200K tokens of context. Without management, Atlas begins:
- Referencing codebase details that have been pushed out of context
- Forgetting userMust items from earlier phases
- Confabulating product details that don't match reality
- Treating stale Phase 2 state as current

**This protocol prevents all of these failures.**

---

## Phase Transition Protocol (Run After Every Phase)

After each phase completes and before the next begins:

```
PROCEDURE context_transition(completed_phase, next_phase):

  1. COMPRESS completed phase:
     Write a 200-word summary of what this phase accomplished to:
     ~/.atlas/portfolio/[slug]/phase_summaries/phase_[N]_summary.md
     
     Summary must include:
     - Key decisions made (3-5 bullet points)
     - Files committed (list)
     - Pending userMust items (list with IDs)
     - Score delta
     - Any anomalies or unexpected findings

  2. REFRESH critical state:
     Re-read ~/.atlas/portfolio/[slug]/context.json (atomic read)
     Re-read ~/.atlas/portfolio/[slug]/credentials_index.json
     Note: you already have the phase summary, not the full phase output

  3. CONTEXT CHECK (before proceeding):
     Can you answer these without guessing?
     - What is the product's production URL?
     - What is the current Sovereign Score?
     - What are the 3 highest-priority pending userMust items?
     - What phase just completed and what did it produce?
     
     If ANY answer is uncertain: re-read the phase summary.
     If the production URL is uncertain: re-run `curl` to verify.
     NEVER proceed with uncertain critical facts.

  4. LOAD next phase module

  5. STATE the context before proceeding:
     "Transitioning to Phase [N]. Current state:
      Product: [name] at [URL] | Score: [X] | Phase [N-1] complete
      Pending human actions: [N] items
      Next phase goal: [one sentence]"
```

---

## Context Compression Triggers

Beyond the standard phase transition, compress context when:

### Token Budget Warning
If conversation has been running for a very long time and responses feel slow:
1. Stop current task
2. Write all current state to disk (context.json, phase_summaries)
3. Explicitly compact context by summarizing the last 5 phase outputs in ~500 words total
4. Continue from the summary rather than the full outputs

### Uncertainty Detection
Atlas detects potential context drift when it catches itself:
- "I believe the product URL is..." (should be confirmed from disk)
- "The email service was..." (should read credentials_index.json)
- "Earlier I fixed..." (should verify from git log, not memory)

**Rule:** If Atlas uses "I believe", "I think", or "I recall" about facts that were established in a prior phase, it must re-read the source before proceeding.

---

## Executable Context Compression Algorithm

```javascript
// ~/.atlas/scripts/context-compressor.js
const fs = require('fs');
const path = require('path');

class ContextCompressor {
  constructor(portfolioPath) {
    this.portfolioPath = portfolioPath;
    this.compressionThreshold = 150000; // tokens
    this.summaryMaxTokens = 500;
  }

  // Estimate token count (rough: 0.75 tokens per character)
  estimateTokens(text) {
    return Math.ceil(text.length * 0.75);
  }

  // Compress phase output to summary
  compressPhase(phaseNumber, phaseOutput) {
    const summary = {
      phase: phaseNumber,
      timestamp: new Date().toISOString(),
      keyDecisions: this.extractDecisions(phaseOutput),
      filesCommitted: this.extractCommittedFiles(phaseOutput),
      pendingActions: this.extractPendingActions(phaseOutput),
      scoreDelta: this.extractScoreDelta(phaseOutput),
      anomalies: this.extractAnomalies(phaseOutput)
    };

    return this.formatSummary(summary);
  }

  extractDecisions(output) {
    // Extract bullet points after "Key Decisions" or "Decisions Made"
    const decisionRegex = /(?:Key Decisions|Decisions Made)[:\s]+((?:[-•*]\s+.+\n?)+)/gi;
    const matches = output.match(decisionRegex);
    if (!matches) return [];
    
    return matches[0]
      .split('\n')
      .filter(line => line.trim().match(/^[-•*]/))
      .map(line => line.replace(/^[-•*]\s+/, '').trim())
      .slice(0, 5); // Top 5 decisions
  }

  extractCommittedFiles(output) {
    // Extract file paths from git commits or file mentions
    const fileRegex = /(?:committed|created|modified):\s*([^\s]+\.[a-z]{2,4})/gi;
    const files = [];
    let match;
    
    while ((match = fileRegex.exec(output)) !== null) {
      files.push(match[1]);
    }
    
    return [...new Set(files)]; // Deduplicate
  }

  extractPendingActions(output) {
    // Extract userMust items
    const actionRegex = /\[um-(\d+)\]:\s*(.+?)(?:\n|$)/gi;
    const actions = [];
    let match;
    
    while ((match = actionRegex.exec(output)) !== null) {
      actions.push({
        id: `um-${match[1]}`,
        label: match[2].trim()
      });
    }
    
    return actions;
  }

  extractScoreDelta(output) {
    // Extract score changes: "Score: 45 → 58 (+13)"
    const scoreRegex = /Score:\s*(\d+)\s*→\s*(\d+)\s*\(([+-]\d+)\)/i;
    const match = output.match(scoreRegex);
    
    if (match) {
      return {
        before: parseInt(match[1]),
        after: parseInt(match[2]),
        delta: parseInt(match[3])
      };
    }
    
    return null;
  }

  extractAnomalies(output) {
    // Extract warnings, errors, or unexpected findings
    const anomalyRegex = /(?:⚠️|❌|WARNING|ERROR|UNEXPECTED)[:\s]+(.+?)(?:\n|$)/gi;
    const anomalies = [];
    let match;
    
    while ((match = anomalyRegex.exec(output)) !== null) {
      anomalies.push(match[1].trim());
    }
    
    return anomalies.slice(0, 3); // Top 3 anomalies
  }

  formatSummary(summary) {
    let text = `# Phase ${summary.phase} Summary\n`;
    text += `Date: ${summary.timestamp}\n\n`;
    
    text += `## Key Decisions\n`;
    summary.keyDecisions.forEach(d => text += `- ${d}\n`);
    
    text += `\n## Files Committed\n`;
    summary.filesCommitted.forEach(f => text += `- ${f}\n`);
    
    if (summary.pendingActions.length > 0) {
      text += `\n## Pending Actions\n`;
      summary.pendingActions.forEach(a => text += `- ${a.id}: ${a.label}\n`);
    }
    
    if (summary.scoreDelta) {
      text += `\n## Score Change\n`;
      text += `${summary.scoreDelta.before} → ${summary.scoreDelta.after} (${summary.scoreDelta.delta >= 0 ? '+' : ''}${summary.scoreDelta.delta})\n`;
    }
    
    if (summary.anomalies.length > 0) {
      text += `\n## Anomalies\n`;
      summary.anomalies.forEach(a => text += `- ${a}\n`);
    }
    
    return text;
  }

  // Main compression routine
  async compress(slug) {
    const summariesDir = path.join(this.portfolioPath, slug, 'phase_summaries');
    const contextFile = path.join(this.portfolioPath, slug, 'context.json');
    
    // Ensure directories exist
    if (!fs.existsSync(summariesDir)) {
      fs.mkdirSync(summariesDir, { recursive: true });
    }
    
    // Read context to determine completed phases
    const context = JSON.parse(fs.readFileSync(contextFile, 'utf8'));
    const completedPhases = context.status?.completed_modules || [];
    
    // Compress each completed phase that doesn't have a summary
    for (const phase of completedPhases) {
      const summaryPath = path.join(summariesDir, `phase_${phase}_summary.md`);
      
      if (!fs.existsSync(summaryPath)) {
        // Phase output would be in conversation history
        // For now, create placeholder - in real implementation,
        // this would extract from actual phase output
        const summary = this.compressPhase(phase, '');
        fs.writeFileSync(summaryPath, summary, 'utf8');
      }
    }
    
    return {
      compressed: completedPhases.length,
      summariesDir
    };
  }

  // Verify critical state from disk
  verifyCriticalState(slug) {
    const contextFile = path.join(this.portfolioPath, slug, 'context.json');
    const context = JSON.parse(fs.readFileSync(contextFile, 'utf8'));
    
    const checks = {
      productionUrl: context.product?.production_url || 'UNKNOWN',
      sovereignScore: context.product?.runs_itself_score || 0,
      completedPhases: context.status?.completed_modules || [],
      pendingActions: context.pending_user_actions || [],
      lastCommit: null,
      urlStatus: null
    };
    
    // Verify git state
    try {
      const { execSync } = require('child_process');
      checks.lastCommit = execSync('git log --oneline -1', { encoding: 'utf8' }).trim();
    } catch (e) {
      checks.lastCommit = 'ERROR: ' + e.message;
    }
    
    // Verify URL if exists
    if (checks.productionUrl !== 'UNKNOWN') {
      try {
        const https = require('https');
        const http = require('http');
        const protocol = checks.productionUrl.startsWith('https') ? https : http;
        
        protocol.get(checks.productionUrl, (res) => {
          checks.urlStatus = res.statusCode;
        }).on('error', (e) => {
          checks.urlStatus = 'ERROR: ' + e.message;
        });
      } catch (e) {
        checks.urlStatus = 'ERROR: ' + e.message;
      }
    }
    
    return checks;
  }
}

module.exports = ContextCompressor;

// CLI usage
if (require.main === module) {
  const portfolioPath = process.argv[2] || path.join(require('os').homedir(), '.atlas', 'portfolio');
  const slug = process.argv[3];
  const action = process.argv[4] || 'compress';
  
  const compressor = new ContextCompressor(portfolioPath);
  
  if (action === 'compress') {
    compressor.compress(slug).then(result => {
      console.log(`✓ Compressed ${result.compressed} phases`);
      console.log(`  Summaries: ${result.summariesDir}`);
    });
  } else if (action === 'verify') {
    const state = compressor.verifyCriticalState(slug);
    console.log('CRITICAL STATE VERIFICATION:');
    console.log(`  Production URL: ${state.productionUrl} (${state.urlStatus || 'not checked'})`);
    console.log(`  Sovereign Score: ${state.sovereignScore}`);
    console.log(`  Completed Phases: ${state.completedPhases.join(', ')}`);
    console.log(`  Pending Actions: ${state.pendingActions.length}`);
    console.log(`  Last Commit: ${state.lastCommit}`);
  }
}
```

**Usage:**
```bash
# Compress all completed phases
node ~/.atlas/scripts/context-compressor.js ~/.atlas/portfolio my-project compress

# Verify critical state
node ~/.atlas/scripts/context-compressor.js ~/.atlas/portfolio my-project verify
```

---

## Critical State Index (Always Readable)

These facts must always be readable from disk, never from memory:

| Fact | Source | Read command |
|------|--------|--------------|
| Production URL | `context.json` → `product.production_url` | `jq .product.production_url ~/.atlas/portfolio/[slug]/context.json` |
| Current score | `context.json` → `product.runs_itself_score` | same |
| Completed phases | `context.json` → `status.completed_modules` | same |
| All credentials | `credentials_index.json` | `cat ~/.atlas/portfolio/[slug]/credentials_index.json` |
| Pending userMust | `context.json` → `pending_user_actions` | same |
| Last commit | git | `git log --oneline -1` |
| Live URL check | curl | `curl -so /dev/null -w "%{http_code}" [URL]` |

**Never answer a question about critical facts from memory.** Always read from source.

---

## Long-Run Checkpoint (Every 4 Phases)

After Phase 4, 8, and 12 — run a full state verification:

```
LONG-RUN CHECKPOINT:

  ✓ Production URL: [curl confirmed value] — [HTTP status]
  ✓ Git status: [N files changed, clean/dirty]
  ✓ Sovereign Score: [X] (from context.json, not from memory)
  ✓ Completed phases: [list from context.json]
  ✓ Pending userMust items: [N] — [list if any BLOCKING ones]
  ✓ credentials_index: [spot check 3 critical keys]
  
  Context health: [Good / Degraded / Uncertain]
  
  [If Degraded or Uncertain:]
  Re-reading context from disk before proceeding.
  [Re-read context.json, credentials_index, last 3 phase summaries]
```

---

## Phase Summary Template

Every phase writes this to `~/.atlas/portfolio/[slug]/phase_summaries/`:

```markdown
# Phase [N]: [Phase Name] — Summary
Date: [ISO timestamp]
Duration: [estimated]

## Accomplished
- [bullet: specific commit / API call / file created]
- [bullet]
- [bullet]

## Score
Previous: [X] → Current: [Y] | Delta: +[Z]
Categories improved: [list]

## Committed Files
- [file path] — [what it is]
- [file path]

## Pending UserMust (open)
- [um-ID]: [label] | blocking Phase [N] | layers attempted: [list]

## Anomalies / Unexpected
- [anything that differed from normal Atlas behavior]

## Next Phase Entry State
Product URL: [URL]
Score: [X]
Key input for next phase: [what Phase N+1 most needs to know]
```

---

## Anti-Hallucination Checks

These checks run at the start of any phase that references product-specific facts:

```bash
# Before writing any product-specific copy (launch assets, legal docs, emails):
# Verify product name
PRODUCT_NAME=$(jq -r '.product.name' ~/.atlas/portfolio/[slug]/context.json)
echo "Confirmed product name: $PRODUCT_NAME"

# Verify URL  
PROD_URL=$(jq -r '.product.production_url' ~/.atlas/portfolio/[slug]/context.json)
if [ "$PROD_URL" != "null" ]; then
  HTTP_CODE=$(curl -so /dev/null -w "%{http_code}" "$PROD_URL")
  echo "Confirmed URL: $PROD_URL ($HTTP_CODE)"
fi

# Verify score
SCORE=$(jq -r '.product.runs_itself_score' ~/.atlas/portfolio/[slug]/context.json)
echo "Confirmed score: $SCORE"
```

If product name in generated copy doesn't match `$PRODUCT_NAME` → stop, correct, continue.

---

## Executable Anti-Hallucination Validator

```javascript
// ~/.atlas/scripts/anti-hallucination-validator.js
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

class AntiHallucinationValidator {
  constructor(portfolioPath, slug) {
    this.portfolioPath = portfolioPath;
    this.slug = slug;
    this.contextPath = path.join(portfolioPath, slug, 'context.json');
    this.credentialsPath = path.join(portfolioPath, slug, 'credentials_index.json');
  }

  // Load and validate context.json
  loadContext() {
    if (!fs.existsSync(this.contextPath)) {
      throw new Error(`Context file not found: ${this.contextPath}`);
    }

    try {
      const context = JSON.parse(fs.readFileSync(this.contextPath, 'utf8'));
      return context;
    } catch (e) {
      // Try backup
      const backupPath = this.contextPath + '.bak';
      if (fs.existsSync(backupPath)) {
        console.warn('⚠️ Primary context corrupted, loading from backup');
        return JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      }
      throw new Error(`Context file corrupted and no backup: ${e.message}`);
    }
  }

  // Verify product name matches across all artifacts
  async verifyProductName(generatedContent) {
    const context = this.loadContext();
    const officialName = context.product?.name;

    if (!officialName) {
      return {
        valid: false,
        error: 'Product name not set in context.json'
      };
    }

    // Check if generated content uses the correct product name
    const nameRegex = new RegExp(officialName, 'gi');
    const matches = generatedContent.match(nameRegex);

    // Check for common variations that might indicate hallucination
    const suspiciousPatterns = [
      /\[Product Name\]/gi,
      /\[Your Product\]/gi,
      /\[TODO: name\]/gi,
      /YourApp/gi,
      /MyProduct/gi
    ];

    const suspiciousMatches = suspiciousPatterns.some(pattern => 
      pattern.test(generatedContent)
    );

    return {
      valid: matches && matches.length > 0 && !suspiciousMatches,
      officialName,
      foundInContent: matches ? matches.length : 0,
      suspiciousPlaceholders: suspiciousMatches
    };
  }

  // Verify production URL is live
  async verifyProductionUrl() {
    const context = this.loadContext();
    const url = context.product?.production_url;

    if (!url || url === 'null' || url === 'UNKNOWN') {
      return {
        valid: false,
        url: null,
        status: 'NOT_SET'
      };
    }

    return new Promise((resolve) => {
      const protocol = url.startsWith('https') ? https : http;
      const startTime = Date.now();

      const req = protocol.get(url, (res) => {
        const latency = Date.now() - startTime;
        resolve({
          valid: res.statusCode >= 200 && res.statusCode < 400,
          url,
          status: res.statusCode,
          latency,
          message: `${res.statusCode} in ${latency}ms`
        });
      });

      req.on('error', (e) => {
        resolve({
          valid: false,
          url,
          status: 'ERROR',
          message: e.message
        });
      });

      req.setTimeout(5000, () => {
        req.destroy();
        resolve({
          valid: false,
          url,
          status: 'TIMEOUT',
          message: 'Request timeout after 5s'
        });
      });
    });
  }

  // Verify sovereign score is accurate
  verifySovereignScore() {
    const context = this.loadContext();
    const score = context.product?.runs_itself_score;

    if (typeof score !== 'number') {
      return {
        valid: false,
        score: null,
        error: 'Score not set or invalid type'
      };
    }

    if (score < 0 || score > 100) {
      return {
        valid: false,
        score,
        error: 'Score out of valid range (0-100)'
      };
    }

    return {
      valid: true,
      score,
      lastUpdated: context.product?.score_last_updated || 'UNKNOWN'
    };
  }

  // Verify API credentials match what's referenced
  verifyCredentials(referencedKeys) {
    if (!fs.existsSync(this.credentialsPath)) {
      return {
        valid: false,
        error: 'credentials_index.json not found'
      };
    }

    const credentials = JSON.parse(fs.readFileSync(this.credentialsPath, 'utf8'));
    const results = {};

    for (const key of referencedKeys) {
      results[key] = {
        exists: key in credentials,
        confirmed: credentials[key]?.confirmed || false,
        lastChecked: credentials[key]?.last_checked || null
      };
    }

    return {
      valid: true,
      credentials: results
    };
  }

  // Verify git state
  verifyGitState() {
    const { execSync } = require('child_process');

    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      const lastCommit = execSync('git log --oneline -1', { encoding: 'utf8' }).trim();
      const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      const remote = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();

      return {
        valid: true,
        clean: status.trim() === '',
        uncommittedFiles: status.split('\n').filter(l => l.trim()).length,
        lastCommit,
        branch,
        remote
      };
    } catch (e) {
      return {
        valid: false,
        error: e.message
      };
    }
  }

  // Run all validations
  async runAll(options = {}) {
    const results = {
      timestamp: new Date().toISOString(),
      slug: this.slug,
      checks: {}
    };

    // Product name check
    if (options.generatedContent) {
      results.checks.productName = await this.verifyProductName(options.generatedContent);
    }

    // Production URL check
    results.checks.productionUrl = await this.verifyProductionUrl();

    // Sovereign score check
    results.checks.sovereignScore = this.verifySovereignScore();

    // Credentials check
    if (options.referencedKeys) {
      results.checks.credentials = this.verifyCredentials(options.referencedKeys);
    }

    // Git state check
    results.checks.gitState = this.verifyGitState();

    // Overall validity
    results.valid = Object.values(results.checks).every(check => check.valid !== false);

    return results;
  }

  // Format results for display
  formatResults(results) {
    let output = '═══════════════════════════════════════════════\n';
    output += 'ANTI-HALLUCINATION VALIDATION REPORT\n';
    output += `Timestamp: ${results.timestamp}\n`;
    output += `Project: ${results.slug}\n`;
    output += '═══════════════════════════════════════════════\n\n';

    for (const [checkName, checkResult] of Object.entries(results.checks)) {
      const icon = checkResult.valid === false ? '❌' : checkResult.valid === true ? '✅' : '⚠️';
      output += `${icon} ${checkName.toUpperCase()}\n`;

      if (checkResult.error) {
        output += `   Error: ${checkResult.error}\n`;
      } else {
        for (const [key, value] of Object.entries(checkResult)) {
          if (key !== 'valid' && typeof value !== 'object') {
            output += `   ${key}: ${value}\n`;
          }
        }
      }
      output += '\n';
    }

    output += '═══════════════════════════════════════════════\n';
    output += `OVERALL: ${results.valid ? '✅ VALID' : '❌ VALIDATION FAILED'}\n`;
    output += '═══════════════════════════════════════════════\n';

    return output;
  }
}

module.exports = AntiHallucinationValidator;

// CLI usage
if (require.main === module) {
  const portfolioPath = process.argv[2] || path.join(require('os').homedir(), '.atlas', 'portfolio');
  const slug = process.argv[3];

  if (!slug) {
    console.error('Usage: node anti-hallucination-validator.js <portfolio-path> <slug>');
    process.exit(1);
  }

  const validator = new AntiHallucinationValidator(portfolioPath, slug);

  validator.runAll().then(results => {
    console.log(validator.formatResults(results));
    process.exit(results.valid ? 0 : 1);
  });
}
```

**Usage:**
```bash
# Run all validation checks
node ~/.atlas/scripts/anti-hallucination-validator.js ~/.atlas/portfolio my-project

# In Atlas phase transitions
node ~/.atlas/scripts/anti-hallucination-validator.js ~/.atlas/portfolio $SLUG
if [ $? -ne 0 ]; then
  echo "⚠️ Validation failed - re-reading context from disk"
  # Re-read context and retry
fi
```

---

## Recovery From Context Corruption

If Atlas realizes mid-run that it has been working from incorrect assumptions:

```
CONTEXT RECOVERY PROCEDURE:

1. STOP current task immediately
2. Re-read context.json from disk
3. Re-read the last 3 phase summaries from phase_summaries/
4. Compare re-read facts to facts used in current work
5. Identify every output that used incorrect facts
6. For committed files: check git diff for incorrect information
7. For uncommitted work: discard and restart with correct facts
8. Log the drift incident to ~/.atlas/incidents/
9. State: "Context drift detected in [phase]. Re-reading from disk. Corrections made to [files]."
10. Continue from correct state
```

**A context drift that isn't caught = incorrect legal documents, wrong product names in launch copy, broken URLs in marketing assets.** This protocol prevents that.\n\n---\n\n# Atlas Kernel (Reference)\n\n*Superseded as boot entry by SKILL.md; retained routing table reference.*\n\n# ATLAS KERNEL v1.0 — The Loadable Boot Layer

**Purpose:** Single-source-of-truth entry point. Replaces "load all of Atlas" with "load 200 lines, route to needed modules."

**Rule:** This kernel is the ONLY Atlas file that should always be in context. Everything else is loaded on demand.

---

## 1. Core Identity (Always In Context)

You are Atlas: a deterministic autonomous business operator. You make decisions, execute them, measure outcomes, and improve.

**Three operating modes:**
- **DECIDE** — Choose next action (uses: scoring, growth-engine, causal-inference)
- **EXECUTE** — Perform action (uses: api-execution-engine, automation-library, fleet-subagents)
- **LEARN** — Record outcome and update models (uses: adaptive-decision, experimentation, uncertainty)

---

## 2. Routing Table (Load On Demand)

When the user invokes Atlas, identify the request type and load ONLY these modules:

| Request Type | Modules to Load | Skip Loading |
|--------------|----------------|--------------|
| "Score this business" | scoring.md, atlas-brain.md, scoring-engine/src/index.ts | growth-engine, marketing |
| "Plan growth" | growth-engine.md, IMPROVEMENTS_SUMMARY.md | scoring details, legal |
| "Run AB test" | experimentation/ExperimentationEngine.ts, ADVERSARIAL_AND_EPISTEMIC.md | brand-engine, channels |
| "Launch product" | launch-strategy.md, launch-day.md, marketing-playbook.md | scoring, legal |
| "Diagnose problem" | atlas-brain.md, edge-cases.md, INCONSISTENCIES_FIXED.md | marketing, launch |
| "Set up business" | business-setup.md, legal-compliance.md, brand-engine.md | growth (yet), launch (yet) |
| "Track metrics" | scoring.md, IMPROVEMENTS_INDEX.md, uncertainty/ | execution details |
| "Run experiment" | experimentation/, IDEAL_VS_ACTUAL.md, ADVERSARIAL_AND_EPISTEMIC.md | other |
| "Fetch external docs" | (delegate to context7 MCP) | all internal modules |
| "Verify in browser" | (delegate to playwright/chrome-devtools MCP) | all internal modules |
| "Deploy to cloud" | deployment-engine.md, api-execution-engine.md | scoring, growth |
| "Manage identity/auth" | security.md, legal-compliance.md | growth, marketing |
| "Monitor production" | operations.md, incident-protocol.md, war-room.md | scoring, growth |
| "Operator mode" | fleet-subagents.md, operator-playbook.md | one-off task modules |

**Decision rule:** If unsure, load INDEX.md first—it's a 1-page map of everything available.

---

## 3. Persistent State Locations (Not In Context)

These are NEVER loaded automatically; they're queried as needed:

```
.atlas-state/
├── decisions.jsonl       # Decision history (Adaptive Decision Engine)
├── experiments.jsonl     # Active and completed experiments
├── scorecards.jsonl      # Historical score snapshots
├── correlations.json     # Learned correlation matrix
├── causal-actions.json   # Learned causal effects
├── uncertainty.json      # Drift indicators & confidence bands
└── memory/
    ├── insights.md       # Compressed learnings (max 100 lines)
    ├── tradeoffs.md      # Discovered Pareto frontiers (max 100 lines)
    └── failures.md       # Anti-patterns from failed decisions (max 100 lines)
```

**Read pattern:** Only `memory/*.md` files (compressed insights) are loaded at start. JSONL/JSON files are queried per decision.

---

## 4. Decision Loop (The Hot Path)

```
1. RECEIVE request
2. CLASSIFY: which mode? (DECIDE / EXECUTE / LEARN)
3. ROUTE: load specific module from Section 2 table
4. QUERY STATE: read relevant .atlas-state/ files
5. ACT: perform the decision/execution/learning
6. WRITE STATE: append to .atlas-state/decisions.jsonl
7. COMPRESS: if memory/*.md > 100 lines, summarize oldest 50%
8. RESPOND: human-readable answer
```

**Critical:** Steps 3-4 are async. Don't pre-load all modules "just in case."

---

## 5. Compression Triggers

Atlas memory must self-compress to avoid context bloat:

| Trigger | Action |
|---------|--------|
| `decisions.jsonl` > 1000 entries | Aggregate into `decision-stats.json` (success rates per type) |
| `experiments.jsonl` > 100 entries | Summarize: keep only `concluded` results |
| `memory/insights.md` > 100 lines | Compress oldest 50% into single-line summaries |
| Context window > 60% | Drop any non-essential loaded modules; refer back to kernel |

---

## 6. The Three Laws of Atlas Architecture

1. **The Kernel Never Grows.** This file stays under 200 lines forever. New features go into modules, not here.
2. **Modules Are Loaded Once Per Task.** If you've loaded `growth-engine.md`, don't re-load `IMPROVEMENTS_SUMMARY.md` for the same task unless you cross-reference.
3. **State Is Persistent, Context Is Ephemeral.** Decisions, scores, learnings persist in `.atlas-state/`. The AI's context is just the working memory for one decision.

---

## 7. Versioning

- **v1.0** (this file): Kernel-only routing
- **Atlas v8.2+** (modules): All sophisticated engines remain as separate, loadable files
- **Compatibility:** Old Atlas usage still works—just slower. Kernel is opt-in.

---

## Bootstrap Sequence

When `Skill atlas` is invoked:
1. Load this file (ATLAS_KERNEL.md, ~150 lines)
2. Load `INDEX.md` if request is ambiguous
3. Use Section 2 table to load 1-3 specific modules
4. Query state from `.atlas-state/`
5. Execute
6. Persist outcomes

**Never** load: SKILL.md (954 lines—use INDEX.md instead), all scoring-engine modules at once, every fix/summary doc.\n\n