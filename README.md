# Atlas v6 — The Sovereign Empire

> *One command. Total sovereignty. A business that outlives its founder.*

Atlas is a Claude Code skill that acts as your AI co-founder — from broken code to a self-running, revenue-generating product. It doesn't guide you through a checklist. It **does the work**.

---

## What Atlas Actually Does

```
/atlas
```

That's the entire interface. Atlas reads your codebase, understands your product, and executes autonomously through 14 phases:

| Phase | What happens |
|-------|-------------|
| 0–1 | Reads the codebase. Interviews you on only what it can't infer. |
| 2 | Fixes every P0 blocker. Deploys to production. Verifies live URL returns 200. |
| 3 | Writes product-specific ToS and Privacy Policy. Commits the serving routes. |
| 4 | 11-point pre-flight check. Rolls back if anything is red. |
| 5 | Researches your actual audience. Writes every launch asset. Generates a timestamped LAUNCH_SEQUENCE.md — a numbered recipe, not a strategy doc. |
| 6 | Schedules 90 days of content. Builds the press kit. Identifies and DMs micro-influencers. |
| 7 | Recommends your entity type. Applies to every applicable startup credit program ($50K+ infra value). |
| 8 | Configures monitoring, email sequences, and support automation via API — not descriptions. |
| 9 | Executes the launch. Posts to every channel on the exact schedule. Monitors in real time. |
| 10 | 72-hour live ops. Ships one iteration based on real data. |
| 11–14 | Runs the business weekly. Monitors metrics. Decides one action. Executes it. Logs it. Repeats forever. |

**Atlas stops when your product is Sovereign** — score ≥ 90, revenue > expenses for 30 days, zero human commits in 14 days, first payout in your bank account.

---

## The Difference

Most AI tools produce documents. Atlas produces outcomes.

| ❌ AI assistant | ✅ Atlas |
|----------------|---------|
| "You should deploy to Vercel" | Runs `vercel --prod`. Pings the URL. Reports it live. |
| "Consider setting up email sequences" | Calls the Resend API. Creates the sequences. Sends a test. |
| "Apply for AWS Activate credits" | Outputs the complete, paste-ready application. Opens the URL. |
| "Schedule your social content" | Calls the Buffer API. Schedules 30 days of posts. Returns the schedule URL. |
| "You need a ToS" | Reads your actual data collection from your codebase. Writes a specific ToS. Commits the route. |

If a tool has an API and the key is in your `.env`, Atlas calls it. It does not describe calling it.

---

## The Sovereign Score

Atlas tracks a 0–100 **Sovereign Score** across 10 categories. It's checked after every phase and shown as three numbers:

```
Score now: 58/100
  Achievable without any human action: 58
  Achievable with pending human actions (est. 2 hrs): 74 ✅
```

Targets: **60** = cleared to launch. **80** = sustained operation. **90** = sovereign.

---

## Install

Atlas runs inside [Claude Code](https://claude.ai/code). You need an active Claude Code subscription.

### Option 1 — Clone (recommended)

```bash
git clone https://github.com/vincekinney1991/atlas ~/.claude/skills/atlas
```

### Option 2 — Direct copy

```bash
cp -r atlas ~/.claude/skills/atlas
```

### Option 3 — Via zip

Download `atlas.zip` from [Releases](../../releases), then:

```bash
cd ~/.claude/skills && unzip atlas.zip
```

Then in Claude Code:

```
/skills   # should list "atlas"
/atlas    # run it on any project
```

---

## Usage

Navigate to any project directory in Claude Code, then:

```bash
/atlas                          # Auto-detects mode and runs
/atlas status                   # Show dashboard without running
/atlas resume                   # Resume from last incomplete phase
/atlas growth                   # Run weekly growth tick only
/atlas fix [phase-number]        # Re-run a specific phase
/atlas fleet --agent growth \
  --task "schedule 7 posts"      # Direct sub-agent invocation
```

---

## The Fleet (Operator Mode)

Once your product is live, Atlas activates its Fleet — seven specialized sub-agents coordinated by the Oracle:

| Agent | Domain |
|-------|--------|
| Atlas Ops | Infrastructure, uptime, incident response |
| Atlas Growth | Content, social, SEO, distribution |
| Atlas Product | Features, A/B tests, UX |
| Atlas Wealth | P&L, tax, credits, M&A readiness |
| Atlas HR | Swarm coordination (API-driven freelancer hiring) |
| Atlas Legal | Entity architecture, IP, compliance |
| Atlas M&A | Repo scouting, acquisition, empire expansion |

The Oracle runs a full **INGEST → ANALYZE → PREDICT → DECIDE → DELEGATE → EXECUTE → REPORT** cycle on every invocation.

---

## Pricing

| Tier | Price | What you get |
|------|-------|-------------|
| **Free** | $0/mo | Phases 1–3 (Onboarding, Code Sprint, Legal) |
| **Individual** | $29/mo | Full 14-phase pipeline, single project |
| **Studio** | $99/mo | Full pipeline, unlimited projects, Fleet activation |

---

## Roadmap

- [ ] Schema validator (CI check that all module cross-references resolve)
- [ ] Test harness (simulate `/atlas` invocations against sample projects)
- [ ] Landing page (GSAP + ScrollTrigger, dark haunted vaporwave)
- [ ] Self-improvement loop (Atlas opens PRs proposing edits to its own modules)
- [ ] Web dashboard (Cockpit — Next.js, real-time activity feed, approval queue)
- [ ] CLI (`atlas new`, `atlas status`, `atlas review`)

---

## Architecture

```
~/.claude/skills/atlas/
├── SKILL.md                  ← Entry point. Mode detection. Phase pipeline.
├── onboarding.md             ← 3-pass intelligence engine
├── code-sprint.md            ← Deploy-or-die
├── legal-compliance.md       ← Real ToS, not templates
├── pre-flight.md             ← 11-point launch gate
├── launch-strategy.md        ← Channel intelligence + LAUNCH_SEQUENCE
├── marketing-playbook.md     ← Audience archaeology + executable scheduling
├── business-setup.md         ← Entity + $50K in credits
├── automation-handoff.md     ← Score ≥ 60 or we don't launch
├── launch-day.md             ← Live execution driver
├── war-room.md               ← 72-hour live ops
├── operations.md             ← North Star + weekly review
├── revenue-intelligence.md   ← First dollar + pricing audit
├── growth-engine.md          ← Perpetual operator loop
├── exit-readiness.md         ← Data room + acquisition listing
├── fleet-subagents.md        ← 7 sub-agent personas
├── mission-intelligence.md   ← The Oracle
├── edge-cases.md             ← Non-standard scenario handling
├── portfolio.md              ← Cross-project empire intelligence
└── dashboard-template.html   ← Live cockpit HTML
```

Runtime state lives at `~/.atlas/` — never committed to this repo:

```
~/.atlas/
├── founder-profile.json
├── portfolio/[slug]/
│   ├── context.json            ← Live state (atomic writes)
│   ├── credentials_index.json  ← Which keys exist (never values)
│   ├── mission.json
│   └── growth_log.md
└── patterns/                   ← What worked for this founder
```

---

## Philosophy

Atlas has three rules that override everything else:

1. **Co-founder, not consultant.** Atlas takes action. It does not produce guides for founders to follow.
2. **Six layers before surrender.** Direct API → CLI → Browser automation → Pre-filled artifact → The Swarm → Irreducible founder. Atlas tries all six before calling something impossible.
3. **Sovereign or not done.** The exit condition is a business that runs itself — not a product that shipped.

---

## Contributing

PRs welcome. Each module is self-contained — you can improve any phase independently.

The self-improvement loop is on the roadmap: Atlas will eventually open PRs proposing edits to its own modules based on friction signals from real runs. Until then, humans do it.

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

## License

MIT

Built by [Vince Kinney](https://github.com/vincekinney1991) in San Antonio, Texas.
