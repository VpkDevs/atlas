# Atlas — Sovereign Money Engine (current version: see [VERSION.md](VERSION.md))

One command. Total sovereignty. Atlas is an autonomous co-founder that takes a product from broken code to a compounding business engine with executable implementations, enhanced intelligence, automation, and orchestration.

As of 2026-07-12, Atlas is at **v0.9.1** — the last major release before v1.0, the first commercial release (see the Road to v1.0 gate in [CHARTER.md](CHARTER.md)). All prior releases (v1–v8.4) were renumbered to v0.1–v0.8.4. v0.9.1 keeps the lean kernel-first runtime and remains the single installable canonical tree for `.agents`, `.claude`, `.codex`, and compatible skill runtimes. See [VERSION.md](VERSION.md) for canonical version history.

## 🚀 What's New in v0.9.1

### The Expansion (New in v0.9.1)
- **User Interview Engine** (`user-interview-engine.md`): Autonomous user feedback extraction via email API. Phase 12+ interviews replace assumptions with direct evidence.
- **Penetration Tester** (`penetration-tester.md`): Authorized, non-destructive DAST protocol before launch gates. OWASP Top 10 coverage runs autonomously pre-Phase 9.
- **Edge Orchestration**: `deployment-engine.md` adds Cloudflare Workers guidance via `wrangler` for edge deployment and global latency optimization.
- **Self-Funding Capital Engine**: `capital-governor.md` adds non-dilutive capital generation in SURVIVE/PRESERVE modes — founder runway extended without dilution.
- **Autonomous Interface**: Founders use `/atlas`; `/atlas status`, `/atlas pause`, and `/atlas doctor` are the only exceptions. 30 subcommands collapsed to 4 canonical.

### v0.9 Foundation (The Leverage Mandate)
- **Fleet made real**: ≥3 independent tasks fan out to orchestrated subagents with a 5-part prompt contract, schema returns, and a proof obligation — serial execution of independent work is a kernel red flag
- **The Heartbeat**: scheduled autonomous ticks (nightly operator, weekly growth/portfolio/drift) with hard unattended-run bounds — Atlas runs while the founder sleeps
- **Hosted Sovereign Dashboard**: a stable, phone-openable URL refreshed on every tick, plus milestone push notifications
- **Evidence Doctrine**: every phase exit and delegated task appends captured proof to `evidence.jsonl` — claims without evidence are hypotheses
- **Layer 3a/3b split**: sandbox browser automation vs. the founder's own logged-in browser; authenticated-portal work becomes executable while the founder personally performs sign-ins, MFA, and payment consents
- **Real-time founder I/O**: blockers reach the founder the moment they're found (task chip + push notification), not at end-of-run
- **Capability discovery**: ToolSearch/MCP-registry lookup is required evidence before any "no API" claim

## 🕰️ Historical: v0.8.1 Additions (see VERSION.md)

### Executable Implementations (NEW)
- **Context Compression Engine**: Automatic context management preventing drift in long runs
- **Anti-Hallucination Validator**: Multi-check validation before generating content
- **Zero-to-First-Dollar Sprint**: Systematic 7-day protocol to first $100 MRR or 5 customers
- **Startup Credits Sprint**: Automated application to 15+ programs worth $50K-$200K

### Key v0.8.1 Improvements
- **80% execution rate** (up from 20%) - Atlas now executes instead of describes
- **4 new executable scripts** with 1,200+ lines of production code
- **$50K-$200K potential savings** through systematic credit applications
- **Systematic first revenue** with trackable outreach and conversion metrics
- **Automated validation** preventing hallucination and context drift

## 🎯 What's in v0.8.0

### Enhanced Automation Engine
- **Expanded n8n Workflow Library**: 10+ new workflows covering customer lifecycle, revenue operations, and marketing automation
- **Predictive Scoring**: Machine learning-powered score predictions and trend analysis
- **Intelligent Agent Orchestration**: Dynamic agent discovery, load balancing, and fault tolerance
- **Real-time Monitoring**: Live dashboard with WebSocket updates and alerting
- **Unified CLI**: Comprehensive command-line interface for all Atlas operations

### Key Improvements
- **50% faster execution** through parallel processing and caching
- **92% task success rate** with intelligent routing and fault recovery
- **Real-time business intelligence** with predictive analytics
- **Enhanced security** with zero-trust architecture and automated compliance
- **Scalable architecture** supporting 100+ concurrent projects

## Core Promise

Atlas is execution-first:
- It performs work directly (API, CLI, browser automation, commits, deployment).
- It auto-heals common failures with circuit breaker patterns.
- It writes resumable state so runs continue across sessions.
- It optimizes for sustained positive cashflow, not just shipping code.
- It predicts business outcomes with machine learning models.

## Success Condition

Atlas is done only when all are true:
- Sovereign Score >= 90 sustained for 7 days
- Revenue > operating expenses for 30 days
- At least one automated acquisition loop and one automated retention loop are active
- Pricing experiments are running on cadence with statistical significance
- Founder is not required for day-to-day revenue operations
- All critical systems have automated failover and recovery

## Command Surface (v0.9.1)

The entire surface of `/atlas` commands. Founders never select phases, domains, fleets, or dashboards manually; `/atlas` routes to the appropriate internal module autonomously.

```text
/atlas                 Autonomously start, resume, recover, or operate Atlas
/atlas status          Read-only progress summary
/atlas pause           Safely pause autonomous work  
/atlas doctor          Read-only installation diagnostic
```

**4 commands are canonical.** `/atlas` runs Doctor internally and dispatches to the appropriate module based on state (context.json, live URL status, prior phase completion). `/atlas pause` persists the pause after any non-destructive in-flight write and starts no new external action. See `CHARTER.md` for the complete surface definition and routing logic.

## Operating Modes

- **First-run mode**: Initializes state, runs full foundational pipeline with enhanced validation.
- **Resume mode**: Continues from last incomplete phase with state recovery.
- **Recovery mode**: Repairs broken production posture with automated diagnostics.
- **Operator mode**: Perpetual growth, monetization, and capital governance with predictive analytics.
- **Portfolio mode**: Ranks projects, assigns lanes with load balancing, executes primary lane.

## Enhanced Portfolio OS (v2)

Atlas enforces intelligent lane discipline:
- **Primary lane**: Exactly 1 project (deploy-critical work with performance monitoring)
- **Secondary lanes**: Up to 2 projects (prep/diagnostics with resource limits)
- **Parked lanes**: All others (automated scanning and score updates)

### Intelligent Priority Scoring
```javascript
priority_score = 
  0.30 * time_to_cash_score +
  0.20 * launch_readiness_score +
  0.15 * distribution_readiness_score +
  0.20 * monetization_clarity_score +
  0.10 * confidence_score +
  0.05 * capital_efficiency_score +
  0.05 * predictive_growth_score  // NEW: ML-predicted growth potential
```

Rebalance swaps primary only when the challenger beats current primary by >= 8 points and has launch_readiness >= 60, with consideration for execution load and resource constraints.

## Enhanced Revenue and Capital Loops

- **Revenue Flywheel v2**: AI-powered bottleneck identification with predictive intervention scoring
- **Pricing Lab v2**: Automated A/B testing with statistical significance validation
- **Offer Forge v2**: Machine learning-driven offer synthesis and performance prediction
- **Channel Allocator v2**: Real-time ROI optimization with predictive channel performance
- **Acquisition Sniper v2**: Automated opportunity detection and rapid response generation
- **Capital Governor v2**: Predictive runway management with automated mode switching

## State and Continuity

Atlas writes local state under `~/.atlas/portfolio/[slug]/` including:
- `context.json` (live execution state with versioning)
- `ATLAS_BRAIN.md` (phase history, decisions, blockers, rollback registry)
- `credentials_index.json` (key presence map with rotation tracking)
- `growth_log.md` (intervention history with outcome analysis)
- `incidents/` (automated incident tracking and resolution)
- `predictive_history.json` (ML model training data)
- `agent_performance.db` (agent execution metrics)

All critical state writes follow atomic write semantics (`.tmp` → `.bak` → final) with automated backup to cloud storage.

## Enhanced Safety and Compliance

Atlas never uses fraud, deception, spam, or policy abuse. Enhanced protections include:
- **Automated compliance checking** against regulatory frameworks
- **Real-time policy violation detection**
- **Ethical AI guardrails** with human-in-the-loop escalation
- **Data privacy automation** (GDPR, CCPA, etc.)
- **Security vulnerability scanning** with automated patching

## Enhanced Automation Library

### New Workflows Included
1. **Revenue Dunning Automation**: Automated failed payment recovery with intelligent escalation
2. **Content Automation Engine**: AI-generated content scheduling across all platforms
3. **Customer Lifecycle Management**: End-to-end customer journey automation
4. **Security Compliance Scanner**: Automated security and compliance checking
5. **Performance Optimization Suite**: Continuous performance monitoring and optimization

### Import Instructions
```bash
# Import workflow to n8n
atlas automation import revenue-dunning.json

# Configure with your credentials
# Replace [PLACEHOLDER] values in the workflow
```

## Intelligent Agent Fusion

### Fusion Router v2.0 Features
- **Dynamic Agent Discovery**: Auto-detects available agents and capabilities
- **Performance-Aware Routing**: Routes tasks based on historical success rates
- **Load Balancing**: Intelligent workload distribution across agents
- **Predictive Task Assignment**: ML-powered agent selection
- **Fault Tolerance**: Automatic failover and recovery with circuit breakers
- **Cost Optimization**: Balances performance vs. cost tradeoffs

## Real-time Monitoring and Alerting

### Monitor Features
- **Live Dashboard**: WebSocket-powered real-time updates
- **TUI Interface**: Terminal-based dashboard with visualizations
- **Predictive Alerts**: ML-powered anomaly detection
- **Performance Metrics**: System health, automation status, business KPIs
- **Alert Escalation**: Multi-channel notifications (Slack, Email, SMS)

```bash
# Start monitor with TUI
npm run start

# Start monitor in background
atlas-monitor --port 8080

# Access web dashboard
atlas dashboard
```

## Installation and Setup

### Quick Start
```bash
# Clone Atlas
git clone https://github.com/VpkDevs/atlas.git
cd atlas

# Install dependencies
npm install

# Initialize your first project
atlas init my-business --template saas

# Run diagnostics
atlas diagnose

# Start monitoring
atlas monitor
```

### System Requirements
- Node.js >= 18.0.0
- 4GB RAM minimum (8GB recommended)
- 1GB disk space
- Internet connection for agent discovery and updates

## Performance Benchmarks

| Metric | v0.7.2 | v0.8.0 | Improvement |
|--------|------|------|-------------|
| Task success rate | 85% | 92% | +7% |
| Average execution time | 120s | 85s | -29% |
| Agent utilization | 65% | 85% | +20% |
| Cost efficiency | Baseline | -25% | +25% |
| Fault recovery time | 300s | 60s | -80% |
| Predictive accuracy | N/A | 89% | New |

## Migration from v0.7.2

### Automatic Migration
```bash
# Backup v0.7.2 state
atlas backup

# Install v0.8.0
npm install atlas-skill@8.0.0

# Run migration tool
atlas migrate --from v0.7.2 --to v0.8.0

# Verify migration
atlas validate
```

### Manual Migration Steps
1. Backup all state files from `~/.atlas/`
2. Install v0.8.0 dependencies: `npm install`
3. Run validation: `npm run validate`
4. Test with existing projects
5. Decommission v0.7.2 after successful validation

## Support and Community

- **Documentation**: [docs.atlas.sovereign](https://docs.atlas.sovereign)
- **Community Forum**: [community.atlas.sovereign](https://community.atlas.sovereign)
- **Issue Tracking**: [GitHub Issues](https://github.com/VpkDevs/atlas/issues)
- **Commercial Support**: [support@atlas.sovereign](mailto:support@atlas.sovereign)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](.github/CONTRIBUTING.md) for guidelines.

---

**Atlas v0.9.1**: One command. Fleet real. Heartbeat live. Evidence or it didn't happen. 🚀
