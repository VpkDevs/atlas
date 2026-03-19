---
name: atlas-automation-handoff
description: Use during Atlas Module 6 — gets the product to runs-itself score 70+. Implements uptime monitoring, error alerting, email sequences, social scheduling, support automations, n8n/Make workflows. Does not complete until score reaches 70.
---

# Atlas Automation Handoff

**Input:** Business Context + current runs-itself score + `~/.atlas/automation-library/`
**Purpose:** Get the product to runs-itself score >= 70. This module does not complete until that threshold is reached.

## The Runs-Itself Score

A product "runs itself" when it generates revenue, handles support, monitors its own health, and onboards new users without the founder's daily involvement.

**Score calculation:**

| Category | Max Points | What Earns It |
|----------|-----------|---------------|
| Monitoring & alerting | 20 | Uptime monitoring + error alerting + revenue alerting |
| Email automation | 20 | Welcome + activation + retention sequences live |
| Support automation | 15 | FAQ bot or scripted responses for top 20 questions |
| Social/content automation | 10 | 30+ days of content scheduled |
| Documentation | 15 | RUNBOOK + contractor onboarding docs complete |
| Deployment pipeline | 10 | Auto-deploy on push, no manual steps |
| Payment/billing automation | 10 | Dunning, failed payment recovery, receipts |

**Target: 70+**

## Process

### Step 1: Gap Analysis

Calculate current score. List every automation that adds points, sorted by points-per-hour.

### Step 2: Implement Automations

**Monitoring & Alerting:**
- Uptime monitoring: configure Better Uptime or UptimeRobot
  - Alert on: downtime, SSL expiry, response time >3s
  - Notify via: email + optional Slack/Discord
- Error alerting: Sentry config (if not already from Code Sprint)
  - Alert threshold: >5 errors/hour → immediate notification
- Revenue alerting: Stripe webhook → notify on
  - New customer (celebrate + trigger onboarding)
  - Churn event (trigger win-back flow)
  - Revenue anomaly (>50% drop week-over-week)

**Email Automation:**
For each email, write the actual subject line + body copy:
- Welcome email: sent immediately on signup (confirm value, set expectations, one CTA)
- Activation email (Day 1): sent if user hasn't completed activation moment
- Day 3: value reinforcement (feature highlight most users miss)
- Day 7: social proof (user stories or metrics)
- Day 14: retention check-in (how is it going? offer to help)
- Churn prevention: sent when usage drops below threshold

**Support Automation:**
- Identify top 20 support questions (from README, common API errors, known gotchas)
- Write scripted response for each
- Configure Intercom/Crisp rules OR write FAQ page
- Set up auto-responder acknowledging receipt with expected response time

**Social Scheduling:**
- Take content from Marketing Playbook Module
- Schedule 30 days of posts in Buffer or Hypefury
- Set recurring slots for evergreen content

**n8n/Make Workflows:**
- Identify all repeatable multi-step processes
- Build automation for each (or provide n8n JSON if applicable)
- Save to `~/.atlas/automation-library/[workflow-name].json`

### Step 3: Contractor Documentation

Write `docs/founder/CONTRACTOR_ONBOARDING.md`:
- What this product is and who uses it
- Architecture overview (how the pieces connect)
- How to run it locally (step by step)
- Every environment variable and where to get it
- Deployment process
- Where the database is and how to access it
- Common issues and their fixes
- How to contact the founder with questions
- Definition of "done" for standard tasks

Generate SOW templates for foreseeable contracted work:
- Bug fix SOW template
- Feature addition SOW template
- Security audit SOW template

Budget estimates at market rates (Upwork/Toptal benchmarks).

### Step 4: Recalculate Score

After implementing automations, recalculate:

```
New runs-itself score: [X]/100

If X >= 70: Module complete
If X < 70: List remaining gap + what would close it
```

**If 70 is not reachable without human action** (account setups, API keys, etc.), document exactly:
- Current score: [X]
- Achievable without human: [Y]
- Blocked on: [specific human actions needed]
- After human actions: score will reach [Z]

## Output

- Implemented automation configs (committed to repo)
- `docs/founder/CONTRACTOR_ONBOARDING.md`
- Updated runs-itself score (target: 70+)
- New entries in `~/.atlas/automation-library/`

## Checkpoint

```
─────────────────────────────────────────────────────
AUTOMATION HANDOFF COMPLETE

Done:
  ✓ Uptime monitoring configured ([tool])
  ✓ Error alerting configured (Sentry)
  ✓ [N] email automation sequences written
  ✓ [N] support responses scripted
  ✓ 30 days social content scheduled
  ✓ [N] n8n/Make workflows built
  ✓ Contractor onboarding doc written

Runs-itself score: [X] → [Y]

[If Y < 70:]
  NOT DONE: Score is [Y]. Need [N] more points.
  Remaining gap: [specific items]
  Blocked on human action: [list]

Type 'continue' to proceed to Operations
─────────────────────────────────────────────────────
```

## Red Flags

- Declaring this module complete when score is below 70
- Skipping email sequences ("they can write those themselves")
- Writing contractor docs as an afterthought
- Not saving automation blocks to `~/.atlas/automation-library/`
- Listing automations to implement without actually implementing them
