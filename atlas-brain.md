---
name: atlas-brain
description: ATLAS_BRAIN.md state machine — the session continuity layer that makes Atlas resumable across any number of sessions, restarts, or context resets. Loaded in Phase 0 before anything else. Maintains a phase-aware business state graph so Atlas never re-derives decisions already made. Eliminates the #1 objection to autonomous AI agents for business: "I'm afraid I'll lose everything if the session ends."
---

# Atlas Brain — Session Continuity Architecture

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

```
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

```
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

```
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

```
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

```
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

```
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
- ❌ Treating `"autonomous": true` as license to skip userMust on IRREVERSIBLE actions — even autonomous mode pauses for irreversible actions
