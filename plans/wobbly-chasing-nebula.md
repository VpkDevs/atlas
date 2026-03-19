# Plan: Business OS v2 — Free-to-Start, Self-Funding Autonomous Business System

## Context

The existing system (v1) was built on paid external services: Neon PostgreSQL (~$5+/mo), Render.com hosting (~$7+/mo), Gmail OAuth (requires a Google Cloud project with a 15-step setup), and Anthropic API with no budget management. It also has no revenue generation — it only spends money without earning any back.

The goal for v2 is three things simultaneously:
1. **Entirely free to start** — zero upfront cost, no credit card, no SaaS subscriptions
2. **Turnkey** — `npm run setup` works in 5 minutes, everything configured automatically
3. **Self-funding flywheel** — the system creates digital products, earns money, and reinvests revenue into better AI and infrastructure

The self-funding loop is the key breakthrough: start with Groq's free LLM API, create digital products (ebooks, prompt packs, templates) and sell them on Gumroad (free to list, 10% fee on sales only). Revenue flows into a treasury, which automatically upgrades the LLM tier and infrastructure as balance grows.

---

## The Self-Funding Flywheel

```
Day 0:   npm run setup (5 min) → Groq API (free) + Gmail app password (2 steps) + Gumroad (free)
Day 1-2: Growth Agent creates first digital product (AI prompt pack, $9.99)
Day 3-7: Sales Agent promotes in communities → first sales trickle in
Week 2:  Treasury hits $5 → system upgrades to Claude Haiku (better quality)
Week 4:  Treasury hits $50 → full Claude Agent SDK unlocked (Polsia mode)
Month 2: Treasury hits $200 → auto-deploys to Railway free tier (24/7)
Month 3: Treasury hits $500 → creates 2nd autonomous company
```

Zero startup cost. First revenue within a week. Compounds from there.

---

## What Changes vs v1

| v1 (costly, manual) | v2 (free, turnkey) |
|---------------------|-------------------|
| Neon PostgreSQL (signup + $5+/mo) | SQLite (zero setup, lives in file) |
| Gmail OAuth (15+ steps, Google Cloud project) | SMTP/IMAP with app password (2 steps) |
| Render.com hosting required | Runs locally first; auto-deploys when funded |
| No LLM cost management | Groq free tier → Haiku → Sonnet → Opus router |
| No revenue generation | Digital products + Gumroad marketplace integration |
| No treasury tracking | SQLite treasury + auto tier upgrader |
| Manual setup with many env vars | `npm run setup` wizard, 5 minutes |

---

## New Architecture

```
business-os/
├── packages/
│   ├── setup-wizard/       ← NEW: npm run setup — 5-minute turnkey wizard
│   ├── llm-router/         ← NEW: Groq(free)→Haiku→Sonnet→Opus based on treasury
│   ├── revenue-engine/     ← NEW: product creation + Gumroad + treasury + reinvestment
│   ├── agent-core/         ← MODIFIED: LLM router integration, revenue cycle added
│   ├── company-template/   ← MODIFIED: SQLite replaces PostgreSQL, revenue CLAUDE.md
│   ├── email-agent/        ← MODIFIED: smtp-mcp replaces gmail-mcp
│   ├── sales-agent/        ← MODIFIED: smtp-mcp, community promotion added
│   └── orchestrator/       ← MODIFIED: SQLite, treasury-aware factory
├── mcp-servers/
│   ├── smtp-mcp/           ← NEW: nodemailer + imapflow (app password, 2 steps)
│   ├── gumroad-mcp/        ← NEW: Gumroad marketplace API
│   ├── gmail-mcp/          ← KEEP as optional (for power users)
│   └── render-mcp/         ← KEEP as optional (for funded mode)
└── pipelines/              ← MINOR: use ORCHESTRATOR_URL env var
```

---

## Implementation: New Packages

### 1. `packages/setup-wizard/src/setup.ts`
Interactive CLI wizard. Single entry point: `npm run setup`.

Flow:
1. Print welcome banner explaining the flywheel
2. Ask: your name, your email address, niche (or "let AI pick" option)
3. Guide Gmail app password setup: show exact steps, verify SMTP connection
4. Guide Groq API key: open console.groq.com in browser, wait for user to paste key
5. Guide Gumroad account: open gumroad.com in browser (free)
6. Write `.env` file automatically from all inputs
7. Init SQLite databases (no external service)
8. Create first company from selected niche template (see Niche Templates below)
9. Write Day 1 product creation task to `todos/pending/`
10. Start all processes
11. Print: "Your business is running. Expected first product: 24h. Expected first sale: 3-7 days."

**Niche templates** (pre-defined CLAUDE.md configs):
- `ai-prompts` — "100 AI Prompts for [X]" packs. Low effort, $7-$20, proven to sell.
- `solopreneur-toolkit` — Templates/checklists for freelancers and consultants. $15-$30.
- `notion-templates` — Productivity system templates. $10-$40.
- `business-guides` — How-to guides for specific business problems. $10-$25.
- `custom` — User enters their own vision.

**Key files:**
- `packages/setup-wizard/src/setup.ts`
- `packages/setup-wizard/src/niche-templates.ts`
- `packages/setup-wizard/package.json`

---

### 2. `packages/llm-router/src/index.ts`
The core economic engine — routes agent tasks to the cheapest capable LLM based on treasury balance.

```typescript
// Tier 0: Groq free (llama-3.3-70b, 14k TPM) — research, prospecting, content drafts
// Tier 1 ($5+): Claude Haiku (anthropic client SDK, direct tool use loop)
// Tier 2 ($50+): Claude Haiku via Agent SDK (full tool ecosystem)
// Tier 3 ($200+): Claude Sonnet via Agent SDK
// Tier 4 ($500+): Claude Opus via Agent SDK (full Polsia mode)

export async function runAgentTask(task: AgentTask): Promise<string>
export function getCurrentTier(): Promise<Tier>
```

**Groq agent loop** (`groq-agent.ts`): uses `groq-sdk` npm package with OpenAI-compatible tool calling. Implements the same tool interface as Claude Agent SDK: WebSearch, WebFetch, Read, Write, Bash. This is the zero-cost agent that runs product research, content writing, and lead research.

**Key files:**
- `packages/llm-router/src/index.ts` — tier selection + routing
- `packages/llm-router/src/groq-agent.ts` — Groq tool-calling agent loop
- `packages/llm-router/src/claude-agent.ts` — Claude API agent (Haiku/Sonnet)
- `packages/llm-router/src/tools.ts` — shared tool implementations
- `packages/llm-router/package.json`

---

### 3. `packages/revenue-engine/`
The self-funding core. Creates products, sells them, tracks treasury, upgrades tiers.

**`product-creator.ts`** — AI creates digital product content:
- Researches trending topics in the company's niche via WebSearch
- Writes full content (ebook text, prompt collection, guide)
- Saves to `projects/products/` directory
- Triggers PDF build

**`pdf-builder.ts`** — Converts markdown content to PDF using `pdfkit`:
- Professional formatting with cover page, table of contents
- Saves to `projects/products/*.pdf`

**`marketplace.ts`** — Gumroad API integration:
- Creates product listing with description, price, tags
- Uploads PDF file as the product
- Returns product URL for promotion

**`treasury.ts`** — SQLite-based revenue tracking:
```sql
CREATE TABLE treasury (
  id INTEGER PRIMARY KEY,
  source TEXT NOT NULL,      -- 'gumroad', 'stripe', 'manual'
  type TEXT NOT NULL,        -- 'revenue', 'expense'
  amount REAL NOT NULL,
  description TEXT,
  balance_after REAL,
  recorded_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE treasury_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  balance REAL DEFAULT 0,
  lifetime_revenue REAL DEFAULT 0,
  current_tier INTEGER DEFAULT 0,  -- 0=groq, 1=haiku, 2=agent-haiku, 3=sonnet, 4=opus
  last_tier_upgrade TEXT
);
```

**`reinvestment.ts`** — Checks treasury and upgrades tiers:
- Runs after every Gumroad webhook
- Tier upgrade thresholds: $5, $50, $200, $500
- Writes new tier to `.env` automatically
- Logs upgrade event to treasury

**Key files:**
- `packages/revenue-engine/src/product-creator.ts`
- `packages/revenue-engine/src/pdf-builder.ts`
- `packages/revenue-engine/src/marketplace.ts`
- `packages/revenue-engine/src/treasury.ts`
- `packages/revenue-engine/src/reinvestment.ts`
- `packages/revenue-engine/package.json`

---

### 4. `mcp-servers/smtp-mcp/src/index.ts`
Replaces the Gmail OAuth MCP. Works with any email provider via SMTP/IMAP.

Setup (2 steps for Gmail):
1. In Gmail: Settings → See all settings → Forwarding and POP/IMAP → Enable IMAP
2. Go to myaccount.google.com → Security → 2-Step Verification → App passwords → Generate

Tools exposed:
- `send_email(to, subject, body, reply_to_message_id?)` — via nodemailer SMTP
- `list_emails(folder, limit, search?)` — via imapflow IMAP
- `read_email(uid)` — fetch full message with body
- `search_emails(query)` — IMAP search
- `mark_read(uid)` — mark as seen

**Key files:**
- `mcp-servers/smtp-mcp/src/index.ts`
- `mcp-servers/smtp-mcp/package.json`

---

### 5. `mcp-servers/gumroad-mcp/src/index.ts`
Gumroad marketplace API wrapper.

Tools:
- `create_product(name, description, price_cents, tags)` → product id + url
- `upload_file(product_id, file_path)` → attaches downloadable file
- `list_products()` → all products with sales count + revenue
- `get_sales(product_id?, since?)` → recent sales with buyer email + amount
- `get_total_revenue()` → aggregate revenue across all products

Auth: Gumroad API access token (from gumroad.com/settings/api) — free.

**Key files:**
- `mcp-servers/gumroad-mcp/src/index.ts`
- `mcp-servers/gumroad-mcp/package.json`

---

## Implementation: Modified Files

### `packages/company-template/` — SQLite migration

**`server.js`**: Replace `pg.Pool` with `better-sqlite3`. Key change:
```javascript
// BEFORE: const pool = new Pool({ connectionString: process.env.DATABASE_URL })
// AFTER:
const Database = require('better-sqlite3');
const db = new Database(process.env.DB_PATH ?? './data/company.db');
```

All route handlers switch from `await pool.query()` to synchronous `db.prepare().all()` / `.run()`.

**`migrate.js`**: Switch from async pg migrations to sync better-sqlite3 `db.exec()`.

**`package.json`**: Replace `pg` with `better-sqlite3`. Add `DB_PATH` env var.

**`routes/tasks.js`, `leads.js`, `metrics.js`**: Update all DB calls to sync better-sqlite3 API. The logic is identical, just sync instead of async with `await`.

**`.claude/CLAUDE.md`** — Add Revenue Mission section:
```markdown
## Revenue Mission
This company generates revenue through digital products and services.

### Revenue Agent (5th role — runs weekly)
1. Check treasury: curl {instanceUrl}/api/treasury
2. Research what's trending in this niche via WebSearch
3. Create one new digital product per week (see product creation guide in projects/)
4. List it on Gumroad via the gumroad-mcp
5. Draft 5 promotional posts for communities where our audience hangs out
6. Report product URL and initial promotion plan to todos/completed/

### CEO Revenue Decisions
- If treasury balance < $5: prioritize product creation over lead gen
- If treasury balance $5-$50: split 50/50 product + lead gen
- If treasury balance > $50: full lead gen mode, product creation is secondary
- Always reinvest 20% of revenue into better tools (handled automatically)
```

---

### `packages/agent-core/src/daily-cycle.ts` — LLM Router integration

Add a 5th agent role: `revenue-agent` (weekly, not daily).

Modify `runDailyCycle()` to:
1. Import `getCurrentTier()` from llm-router
2. If tier >= 2 (Claude Agent SDK available): use existing `query()` flow
3. If tier 0-1 (Groq/Haiku API): call `runAgentTask()` from llm-router instead
4. Add weekly revenue cycle trigger (Fridays): runs revenue-agent to create + list product

The revenue-agent prompt:
```
You are the Revenue Agent for {companyName}.
Weekly task: Create and list one digital product.
1. Check projects/products/ to see what already exists
2. Research top 3 trending topics in our niche via WebSearch
3. Pick the most promising one
4. Write full product content (ebook/prompt pack/template) to projects/products/{slug}/
5. Build PDF via: node ../../packages/revenue-engine/pdf-builder.js {content_path} {output_path}
6. List on Gumroad via gumroad-mcp: create_product + upload_file
7. Write promotional copy to projects/social/product-{slug}.md
8. Update treasury with expected revenue from Gumroad listing
```

---

### `packages/orchestrator/src/registry.ts` — SQLite migration

Replace `pg.Pool` with `better-sqlite3`. The orchestrator's master database (`orchestrator.db`) is a local SQLite file at `./data/orchestrator.db`.

Schema additions:
```sql
-- Add to companies table:
ALTER TABLE companies ADD COLUMN IF NOT EXISTS revenue_total REAL DEFAULT 0;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS products_count INTEGER DEFAULT 0;
```

---

### `packages/orchestrator/src/company-factory.ts` — Remove Render assumption

Changes:
1. Remove hardcoded `https://{slug}.onrender.com` URL → default to `http://localhost:{port}` for local mode
2. Remove `neonDatabaseUrl` requirement → default to SQLite (`./data/company.db`)
3. Add port auto-assignment: scan from 3001 upward to find an open port
4. Register gumroad-mcp in company's `.claude/settings.json` automatically

---

### `packages/email-agent/src/cycle.ts` — smtp-mcp instead of gmail-mcp

Change the `mcpServers` config from:
```typescript
gmail: { command: "node", args: [GMAIL_MCP_PATH] }
```
to:
```typescript
smtp: { command: "node", args: [SMTP_MCP_PATH] }
```

Update all tool references from `gmail_*` to `smtp_*` equivalents.

---

### `packages/sales-agent/src/prospector.ts` — smtp-mcp + community promotion

1. Update email send to use smtp-mcp
2. Add community promotion step to the agent prompt:
   - After finding prospects, also identify 3 relevant online communities (subreddits, Discord servers, Slack groups)
   - Write value-first post for each community that naturally mentions the product
   - Save posts to `projects/community-posts/`

---

### `.env.example` — Simplified for v2

```bash
# ─── LLM (start with Groq free, upgrade automatically) ──────────────────────
GROQ_API_KEY=             # Free at console.groq.com (no credit card)
ANTHROPIC_API_KEY=        # Optional — unlocked automatically when treasury > $5

# ─── Email (2-step Gmail setup, see README) ──────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=                # Gmail App Password (16 chars, not your real password)
IMAP_HOST=imap.gmail.com
IMAP_USER=you@gmail.com
IMAP_PASS=                # Same App Password

# ─── Revenue (free Gumroad account) ─────────────────────────────────────────
GUMROAD_ACCESS_TOKEN=     # From gumroad.com/settings/api (free)
GUMROAD_SELLER_ID=        # Your Gumroad user ID

# ─── Identity ────────────────────────────────────────────────────────────────
USER_NAME=Your Name
USER_EMAIL=you@gmail.com

# ─── System (auto-configured by setup wizard) ────────────────────────────────
LLM_TIER=0                # 0=groq, 1=haiku, 2=agent-haiku, 3=sonnet, 4=opus
ORCHESTRATOR_PORT=4000
DATA_DIR=./data           # SQLite files live here
COMPANIES_DIR=./companies

# ─── Notifications (optional) ────────────────────────────────────────────────
BRIEFING_WEBHOOK=         # Slack/Discord webhook for morning briefing
```

---

### `package.json` — Root scripts

Add:
```json
"scripts": {
  "setup": "tsx packages/setup-wizard/src/setup.ts",
  "start": "tsx scripts/start-all.ts",
  "dev:all": "concurrently 'pnpm dev:orchestrator' 'pnpm dev:email' 'pnpm dev:sales'"
}
```

---

## New `scripts/start-all.ts`

Starts all processes in the right order:
1. Build MCP servers (smtp-mcp, gumroad-mcp)
2. Start orchestrator (with SQLite init)
3. Start email-agent
4. Start sales-agent
5. Start revenue-engine (Gumroad webhook listener + product creation scheduler)
6. Print status table

---

## Implementation Order

1. **SQLite migration** (company-template server + migrate + routes)
2. **smtp-mcp** (replaces Gmail OAuth, unlocks email functionality)
3. **LLM router** (Groq free tier unlocks zero-cost agents)
4. **Setup wizard** (makes everything turnkey)
5. **Revenue engine** (product-creator, pdf-builder, treasury)
6. **gumroad-mcp** (closes the revenue loop)
7. **agent-core update** (revenue agent + LLM router integration)
8. **Orchestrator SQLite migration**
9. **Update email/sales agents** (smtp-mcp, community promotion)
10. **Updated .env.example, README, docker-compose**

---

## Critical Files to Modify

| File | Change |
|------|--------|
| `packages/company-template/server.js` | `pg` → `better-sqlite3` |
| `packages/company-template/migrate.js` | async pg → sync SQLite |
| `packages/company-template/routes/*.js` | all DB calls to SQLite sync API |
| `packages/company-template/.claude/CLAUDE.md` | Add Revenue Mission + 5th agent |
| `packages/agent-core/src/daily-cycle.ts` | LLM router + revenue-agent role |
| `packages/orchestrator/src/registry.ts` | `pg` → `better-sqlite3` |
| `packages/orchestrator/src/company-factory.ts` | remove Render/Neon deps, local defaults |
| `packages/email-agent/src/cycle.ts` | gmail-mcp → smtp-mcp |
| `packages/email-agent/src/tone-learner.ts` | gmail-mcp → smtp-mcp |
| `packages/sales-agent/src/prospector.ts` | smtp-mcp + community posts |
| `packages/sales-agent/src/index.ts` | smtp-mcp env vars |
| `docker-compose.yml` | remove postgres service, add SQLite volumes |
| `.env.example` | new simplified structure |
| `package.json` | add setup + start scripts |

## Critical Files to Create

| File | Purpose |
|------|---------|
| `packages/setup-wizard/src/setup.ts` | 5-min turnkey wizard |
| `packages/setup-wizard/src/niche-templates.ts` | Pre-built niche configs |
| `packages/llm-router/src/index.ts` | Tier-based LLM routing |
| `packages/llm-router/src/groq-agent.ts` | Free Groq agent loop |
| `packages/llm-router/src/claude-agent.ts` | Claude direct API agent |
| `packages/llm-router/src/tools.ts` | WebSearch/WebFetch/Bash implementations |
| `packages/revenue-engine/src/product-creator.ts` | AI ebook/prompt pack writer |
| `packages/revenue-engine/src/pdf-builder.ts` | Markdown → PDF via pdfkit |
| `packages/revenue-engine/src/marketplace.ts` | Gumroad list/upload/track |
| `packages/revenue-engine/src/treasury.ts` | Revenue tracking + tier state |
| `packages/revenue-engine/src/reinvestment.ts` | Auto tier upgrade logic |
| `mcp-servers/smtp-mcp/src/index.ts` | SMTP send + IMAP read |
| `mcp-servers/gumroad-mcp/src/index.ts` | Gumroad API tools |
| `scripts/start-all.ts` | Single-command process launcher |

---

## Verification

1. **Zero-cost baseline**: `GROQ_API_KEY=xxx npm run start` → orchestrator and one company run entirely on Groq free tier, no other paid services
2. **Setup wizard**: `npm run setup` completes in <5 min, creates `.env`, SQLite DBs, and a first company
3. **Email without OAuth**: SMTP send/receive works with just `SMTP_USER` + `SMTP_PASS` (app password)
4. **Product creation**: `node packages/revenue-engine/src/product-creator.js` → creates a PDF ebook in `projects/products/`
5. **Gumroad listing**: `node mcp-servers/gumroad-mcp/src/index.js` → `create_product` tool creates a live Gumroad listing
6. **Treasury**: Revenue appears in SQLite treasury after Gumroad webhook fires
7. **Tier upgrade**: Manually set treasury balance to $5 → system writes `LLM_TIER=1` to `.env`, restarts with Haiku
8. **End-to-end**: Run setup wizard → wait 24h → verify product listed on Gumroad → verify outreach sent to communities
