# Phase 2 — Wave 1: Top Engagement Features

## Objective
Ship the 4 highest-priority features from the Top 25 list plus one natural addition, in a single implementation wave. These were explicitly called out in the plan as the highest-leverage post-Flows features.

---

## Features to Implement

### 1. Achievement System (Feature 12 — stickiness)
**Why first:** Unlocks engagement across all other features. Every other feature can award achievements. Drives daily return visits.

**DB: `achievements` table (system-defined catalogue)**
```sql
id UUID PK
key VARCHAR(100) UNIQUE        -- 'first_bonus', 'century_sessions', etc.
name VARCHAR(255)
description TEXT
icon VARCHAR(100)              -- icon slug
category VARCHAR(50)           -- 'sessions', 'bonuses', 'jackpots', 'streaks', 'social', 'flows'
tier VARCHAR(20)               -- 'bronze', 'silver', 'gold', 'platinum'
points INT
requirement JSONB              -- { type: 'session_count', threshold: 100 }
is_secret BOOLEAN DEFAULT false
created_at TIMESTAMP
```

**DB: `user_achievements` table**
```sql
id UUID PK
user_id UUID FK
achievement_id UUID FK
earned_at TIMESTAMP
progress JSONB                 -- { current: 47, required: 100 }
notified BOOLEAN DEFAULT false
```

**API Endpoints:**
- `GET /achievements` — full catalogue with user's earned status + progress
- `GET /achievements/mine` — only earned achievements
- `POST /achievements/check` — internal: re-evaluate all achievement conditions for user
- `GET /achievements/leaderboard` — users ranked by total achievement points

**React Page:** `AchievementsPage.tsx`
- Grid of achievement cards (locked/unlocked states with glow effect)
- Progress bars for in-progress ones
- Filter by category (Sessions, Bonuses, Jackpots, Streaks, Flows)
- Toast notification when a new achievement unlocks
- Total points counter in header

**Seed Data (20 achievements):**
Bronze: first_session, first_bonus, first_jackpot, five_sessions, first_redemption
Silver: century_sessions, ten_bonuses, five_platforms, first_flow, weekly_streak_4
Gold: thousand_sessions, hundred_bonuses, all_platforms, flow_power_user, jackpot_hunter
Platinum: ten_k_sessions, daily_player_365, elite_rtp, flow_marketplace_share, big_win_verified

---

### 2. Win/Loss Heatmap (Feature 7 — viral marketing)
**Why second:** Pure analytics query on existing `sessions` table — no new schema. Fast to build, highly shareable ("look at my green days!").

**DB:** None — queries existing `sessions` table

**API Endpoints:**
- `GET /analytics/heatmap` — returns daily P&L for past year (365 rows)
  - Query params: `year`, `currency`, `platform_id`
  - Returns: `{ date, net_profit, session_count, wagered, won, rtp }[]`

**React Page:** `HeatmapPage.tsx`
- GitHub-style contribution calendar heatmap (52 weeks × 7 days)
- Color scale: deep-red → neutral → deep-green based on net P&L
- Click a day → drill-down sidebar showing sessions for that day
- Filter by platform (multi-select)
- "Share my heatmap" button → generates a shareable image card
- Stats below: best day, worst day, green days %, current streak

---

### 3. Personal Records Tracker (Feature 25 — viral screenshots)
**Why third:** Users love sharing their bests. Drives organic social sharing. Re-computed from existing session data.

**DB: `personal_records` table**
```sql
id UUID PK
user_id UUID UNIQUE FK         -- one row per user
biggest_single_win DECIMAL(12,4)
biggest_win_session_id UUID FK sessions
biggest_win_date TIMESTAMP
biggest_win_game VARCHAR(255)
biggest_win_platform VARCHAR(255)
longest_win_streak INT
current_win_streak INT
best_rtp_session DECIMAL(6,4)
best_rtp_session_id UUID FK sessions
best_rtp_min_bets INT DEFAULT 100
highest_balance DECIMAL(12,4)
most_bonuses_single_day INT
total_jackpots_hit INT
biggest_jackpot DECIMAL(12,4)
last_computed_at TIMESTAMP
```

**API Endpoints:**
- `GET /records` — current personal records for user
- `POST /records/refresh` — recompute all records from raw session data (debounced, max 1/hour)

**React Page:** `RecordsPage.tsx`
- "Trophy cabinet" layout — large cards per record category
- Each card: record value, date achieved, platform/game where it happened
- "Share" button per record → generates OG-style card image (platform logo, value, date)
- "All-time vs Last 30 days" toggle
- Comparison to community percentile ("You're in the top 12% for biggest win")

---

### 4. Verified Big Win Board (Feature 10 — data moat)
**Why fourth:** Community trust signal. Verified wins require screenshot proof → drives data moat and social proof.

**DB: `big_wins` table**
```sql
id UUID PK
user_id UUID FK
session_id UUID FK sessions    -- optional link to tracked session
platform_id UUID FK platforms
game_id UUID FK games          -- nullable
win_amount_sc DECIMAL(12,4)
win_amount_gc DECIMAL(12,4)    -- nullable
multiplier DECIMAL(10,2)       -- win / bet
bet_amount DECIMAL(12,4)
screenshot_url TEXT            -- Supabase Storage
verification_status VARCHAR(30) -- 'pending', 'verified', 'rejected', 'auto_verified'
verified_by UUID               -- null = auto-verified via extension data
verified_at TIMESTAMP
is_public BOOLEAN DEFAULT true
display_name VARCHAR(100)      -- user's chosen display name for board
occurred_at TIMESTAMP
notes TEXT
created_at TIMESTAMP
```

**API Endpoints:**
- `GET /community/big-wins` — paginated public leaderboard
  - Filters: platform, game, time_period (7d/30d/all), min_multiplier
- `POST /community/big-wins` — submit a big win (with screenshot)
- `GET /community/big-wins/mine` — user's own submitted wins
- `PATCH /community/big-wins/:id` — update visibility/display_name
- `GET /community/big-wins/stats` — aggregate stats (total verified wins, biggest ever, etc.)

**React Page:** `BigWinsPage.tsx`
- Leaderboard table: rank, display_name, platform logo, game, win amount, multiplier, date, verified badge
- Filter bar: platform dropdown, time period tabs (Today / This Week / All Time)
- "Submit Your Win" button → modal with screenshot upload + win details form
- My Wins tab → user's own submitted wins with verification status
- Stats banner at top: community biggest win, total verified wins, biggest multiplier

---

### 5. Streak Tracker (natural addition — addictive daily return)
**Why:** Existing analytics already computes streak data. This surfaces it prominently with alerts, making it sticky. Minimal new code.

**DB:** Extends existing query, adds to `user_achievements` trigger logic. No new tables.

**API Endpoints:**
- `GET /analytics/streaks` — current streak, best streak, streak calendar
  - Returns: `{ current_win_streak, current_loss_streak, longest_win_streak, longest_loss_streak, streak_history[] }`

**React Component:** `StreakWidget.tsx`  
- Embedded in DashboardPage and AchievementsPage
- Fire emoji animation when streak > 7 days
- Current streak badge with count
- Achievement unlocks tied to streak milestones (7, 30, 90, 365 days)

---

## Implementation Order

1. **DB Schema first** — create all 3 new tables (achievements, user_achievements, big_wins, personal_records) in a single schema file `/apps/api/src/db/schema/features.ts`
2. **Seed achievement catalogue** — 20 achievement definitions seeded via a migration
3. **API endpoints** — one new route file: `/apps/api/src/routes/features.ts` (achievements, records, big-wins, streaks all in one)
4. **React pages** — AchievementsPage, HeatmapPage, RecordsPage, BigWinsPage (+ StreakWidget)
5. **Register routes** — add to `/apps/api/src/routes/index.ts`
6. **Register pages** — add to `/apps/web/src/routeTree.tsx`

---

## Tech Notes

- **DB pattern:** Drizzle ORM tables + `query(sql\`...\`)` raw SQL for all reads (matches existing code)
- **Response format:** `{ success: true, data: T }` (matches existing routes)
- **Auth:** `requireAuth` hook on all routes (matches existing middleware)
- **Frontend:** TanStack Query hooks, Recharts for charts, Tailwind + dark theme (zinc-900/800), lucide-react icons
- **Heatmap library:** `react-calendar-heatmap` (already popular, lightweight)
- **Image sharing:** Canvas API or html2canvas for generating shareable image cards
- **File upload (BigWins):** Supabase Storage via existing supabase client

---

## Files to Create/Modify

**New files:**
- `apps/api/src/db/schema/features.ts` — achievements, user_achievements, big_wins, personal_records tables
- `apps/api/src/routes/features.ts` — all Phase 2 Wave 1 endpoints
- `apps/web/src/pages/AchievementsPage.tsx`
- `apps/web/src/pages/HeatmapPage.tsx`
- `apps/web/src/pages/RecordsPage.tsx`
- `apps/web/src/pages/BigWinsPage.tsx`
- `apps/web/src/components/ui/StreakWidget.tsx`

**Modified files:**
- `apps/api/src/routes/index.ts` — register featuresRoutes
- `apps/web/src/routeTree.tsx` — add 4 new page routes
- `apps/web/src/pages/DashboardPage.tsx` — embed StreakWidget

**Estimated line count:** ~2,200 lines of new production TypeScript/TSX
