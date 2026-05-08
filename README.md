# Atlas v6 — The Sovereign Empire

> *One command. Total sovereignty. A business that outlives its founder.*

Atlas is a Claude Code skill — 24 modules, ~9,000 lines — that acts as your AI co-founder. It takes a software project from broken code to a self-running, revenue-generating business. It does not guide you. It acts.

---

## What Atlas Actually Does

```
/atlas
```

That's the full interface. Atlas reads your codebase, understands your product, and executes autonomously:

| Phase | What happens |
|-------|-------------|
| 0–1 | Reads the codebase silently. Interviews you on only what it can't infer. |
| 2 | Fixes every P0 blocker. Deploys. Verifies live URL returns 200. |
| 2b | Security hardening: OWASP Top 10, secrets scan, dep audit, security headers, rate limiting. |
| 3 | Writes product-specific ToS and Privacy Policy. Commits the serving routes. |
| 4 | 11-point pre-flight check. Blocks launch if anything is RED. |
| 5 | Channel intelligence research. Writes every launch asset. Generates LAUNCH_SEQUENCE.md — a timestamped recipe, not a strategy doc. |
| 6 | Schedules 90 days of content. Builds press kit. Applies the brand system. Visual QA loop. |
| 7 | Recommends entity type. Applies to every startup credit program ($50K+ available). |
| 8 | Configures monitoring, email sequences, and support automation via API — not descriptions. |
| 9 | Executes the launch sequence in real time. |
| 10 | 72-hour war room: live ops, fires patched, one data-driven iteration shipped. |
| 11–14 | Runs the business weekly. Monitors metrics. Picks one action. Executes it. Repeats forever. |

**Atlas stops when the product is Sovereign** — Sovereign Score ≥ 90, revenue > expenses 30 days, zero human commits 14 days, first payout in your bank.

---

## The Difference

| ❌ AI assistant | ✅ Atlas |
|----------------|---------|
| "You should deploy to Vercel" | Runs `vercel --prod`. Curls the URL. Reports it live. |
| "Set up email sequences" | Calls the Resend API. Creates the sequences. Sends a test. |
| "Apply for AWS Activate" | Outputs the complete, paste-ready application. Opens the URL. |
| "Schedule your content" | Calls the Buffer API. Schedules 30 days. Returns the schedule URL. |
| "You need a ToS" | Reads your actual data collection from code. Writes a specific ToS. Commits the route. |

If a tool has an API and the key is in `.env`, Atlas calls it. It does not describe calling it.

---

## The Sovereign Score

Atlas tracks a **Sovereign Score** (0–100) across 10 categories, checked after every phase:

```
Score now: 58/100
  Without any human action: 58
  With pending human actions (est. 2 hrs): 74 ✅
```

**Targets:** 60 = launch floor. 80 = sustained. **90 = sovereign.**

---

## Install

Requires [Claude Code](https://claude.ai/code).

```bash
# Option 1: Clone directly into skills directory
git clone https://github.com/VpkDevs/atlas ~/.claude/skills/atlas

# Option 2: Copy
cp -r atlas ~/.claude/skills/atlas
```

Verify in Claude Code:
```
/skills    # should list "atlas"
/atlas     # run on any project
```

---

## Usage

```bash
/atlas                          # auto-detect mode and run
/atlas status                   # dashboard without running
/atlas resume                   # continue from last incomplete phase
/atlas growth                   # weekly growth tick only
/atlas diag                     # full health check, report only
/atlas security                 # security audit only
/atlas brand                    # brand engine only
/atlas fix [phase-number]        # re-run a specific phase
/atlas fleet --agent growth \
  --task "schedule 7 posts"      # direct sub-agent invocation
```

---

## The Modules (24)

| Module | Purpose |
|--------|---------|
| `SKILL.md` | Entry point, mode detection, phase pipeline, Iron Rule |
| `onboarding.md` | 3-pass intelligence engine — builds Business Context |
| `code-sprint.md` | Deploys, fixes P0s, commits CI/CD |
| `security.md` | OWASP Top 10, secrets scan, security headers, rate limiting |
| `legal-compliance.md` | ToS, Privacy Policy, GDPR, AI Act compliance |
| `pre-flight.md` | 11-point launch gate |
| `launch-strategy.md` | Channel intelligence, LAUNCH_SEQUENCE.md, war room prep |
| `marketing-playbook.md` | Brand voice, 90-day content, press kit, micro-influencers |
| `brand-engine.md` | Visual identity system, CSS tokens, Visual QA loop |
| `business-setup.md` | Entity type, banking, startup credits ($50K+) |
| `automation-handoff.md` | Monitoring, email sequences, support — all via API |
| `launch-day.md` | Live launch execution driver |
| `war-room.md` | 72-hour post-launch live ops |
| `operations.md` | North Star metrics, weekly review cron, alert webhooks |
| `revenue-intelligence.md` | First-dollar sprint, pricing audit, funnel fixes |
| `growth-engine.md` | Perpetual weekly operator loop with `atlas-permissions.yml` |
| `exit-readiness.md` | Data room, valuation, acquisition marketplace listing |
| `fleet-subagents.md` | 7 specialized sub-agents (Ops, Growth, Product, Wealth, HR, Legal, M&A) |
| `mission-intelligence.md` | The Oracle — INGEST→ANALYZE→PREDICT→DECIDE→DELEGATE→EXECUTE→REPORT |
| `context-window.md` | Phase transition protocol, drift detection, anti-hallucination |
| `portfolio.md` | Cross-project empire intelligence, attention allocation |
| `edge-cases.md` | Non-standard scenario handling (blueprints, finished products, monorepos) |
| `hands-off-gaps.md` | Living reference of what to automate vs. delegate to humans |
| `dashboard-template.html` | Live cockpit HTML — opens on every invocation |

---

## The Fleet (Operator Mode)

After launch, Atlas activates 7 specialized sub-agents:

| Agent | Domain |
|-------|--------|
| Atlas Ops | Infrastructure, uptime, incident response |
| Atlas Growth | Content, social, SEO, distribution |
| Atlas Product | Features, A/B tests, UX |
| Atlas Wealth | P&L, tax, credits, M&A readiness |
| Atlas HR | Swarm coordination (API-driven freelancer hiring) |
| Atlas Legal | Entity, IP, compliance |
| Atlas M&A | Acquisition scouting, due diligence |

The Oracle runs **INGEST → ANALYZE → PREDICT → DECIDE → DELEGATE → EXECUTE → REPORT** on every `/atlas` invocation in Operator Mode.

---

## Pricing

| Tier | Price | What you get |
|------|-------|-------------|
| **Free** | $0/mo | Phases 1–3 (Onboarding, Code Sprint, Legal) |
| **Individual** | $29/mo | Full 14-phase pipeline, single project |
| **Studio** | $99/mo | Full pipeline, unlimited projects, Fleet activation |

---

## Philosophy

1. **Co-founder, not consultant.** Atlas takes action. It does not produce guides for founders to follow.
2. **Six layers before surrender.** Direct API → CLI → Browser automation → Pre-filled artifact → The Swarm → Irreducible founder. Atlas tries all six before calling something impossible.
3. **Sovereign or not done.** The exit condition is a business that runs itself — not a product that shipped.

---

## License

MIT — use it, fork it, ship with it.

GitHub: [VpkDevs/atlas](https://github.com/VpkDevs/atlas)
Built in San Antonio, Texas.
