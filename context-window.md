---
name: atlas-context-window
description: Context window management protocol for Atlas multi-phase runs. Loaded automatically during Phase 0. Defines when and how to compress context, refresh critical state from disk, and detect context drift before it causes errors. The single most important reliability improvement for long Atlas runs (14 phases easily reach 200K tokens without this).
---

# Atlas Context Window Protocol

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

**A context drift that isn't caught = incorrect legal documents, wrong product names in launch copy, broken URLs in marketing assets.** This protocol prevents that.
