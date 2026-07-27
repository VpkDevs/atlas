---
name: atlas-marketing-playbook
description: Use during Atlas Phase 6 — builds the executable marketing engine that runs through and after launch. Audience archaeology informs channel choice; content is written AND scheduled via API where possible; press kit is committed; micro-influencer outreach is personalized; SEO foundations ship; and the 90-day cycle is set up so Phase 11 (Growth Engine) has fuel.
---

# Atlas Marketing Playbook — The Executable Marketing System

**Input:** Business Context (Phase 1) + Audience Map (Phase 5) + channel ranking (Phase 5) + Press Kit folder (this phase)
**Purpose:** Build a marketing engine that produces output without daily founder input. Phase 6 lays the foundation; Phase 11 (Growth Engine) runs it.

## The Iron Rule of Marketing

A content calendar that nobody schedules is a wishlist.
A bio that's never posted is paper.
A press kit that exists in a folder no journalist sees is a tree falling alone.

**Atlas does not write about marketing. Atlas marketing.**

If a tool has an API and the founder has a key, Atlas calls the API. If a tool has a CLI, Atlas runs the CLI. Atlas only delegates a marketing action to the founder when no automation path exists.

---

## Phase 6 Workflow (9 Stages)

```
6.1 Audience Reconfirmation         (Phase 5's map → action targets)
6.2 Brand Voice Codification        (consistency before scale)
6.3 Platform Setup & Bios           (every profile, every bio, ready to post)
6.4 Press Kit Generation            (10x outreach response rates)
6.5 Content Engine                  (90 days of content + scheduling)
6.6 SEO Foundation                  (technical + content roadmap shipped)
6.7 Community Engagement Plan       (top 10 communities, lurk-then-contribute calendar)
6.8 Micro-Influencer Outreach       (personalized DMs to 30+ accounts)
6.9 Email & Newsletter System       (capture + nurture + send infrastructure live)
```

---

## 6.1 Audience Reconfirmation

The Audience Map from Phase 5 is the ground truth. Phase 6 turns it into:
- **Persona cards** (3–5 specific personas with name, role, pain, channel, vocabulary)
- **Voice/vocab lexicon** (words this audience uses; words to avoid)
- **Anti-personas** (who the product is NOT for — keeps copy focused)

If the Audience Map is thin (<5 communities, no influencer cartography), **Phase 6 returns to Phase 5 to deepen it.** Don't proceed on a weak foundation.

---

## 6.2 Brand Voice Codification

Atlas writes a single-page voice doc:

```yaml
file: docs/founder/BRAND_VOICE.md

archetype: "<one of: Sage | Outlaw | Hero | Magician | Caregiver | Lover | Jester | Everyman | Innocent | Explorer | Ruler | Creator>"
adjectives: [3-5 specific words, e.g., "direct, technical, dry-witty"]
forbidden:
  - "AI-powered" (overused)
  - "revolutionary" (startup-speak)
  - "leverage" (corporate)
  - <add per audience>
sentence_length:
  preferred: "Short. Lots of periods."
  avoid: "Long, winding sentences with multiple subordinate clauses that bury the point."
emoji_policy: "<None | Sparingly: ✅ ⚡ 🔥 only | Liberal>"
example_voice_match: |
  ❌ "Our revolutionary AI-powered platform leverages cutting-edge technology..."
  ✅ "Paste a CSV. Get a chart in 4 seconds. That's the whole product."
```

Every downstream asset is checked against this doc. Atlas runs a self-review pass before publishing anything.

---

## 6.3 Platform Setup & Bios

For every chosen channel, generate a **complete profile package**:

```yaml
file: docs/founder/profiles/twitter.md

handle_options: ["@<name>", "@<alt1>", "@<alt2>"]  # availability checked via API
display_name: "<Name | One-line tagline>"
bio: "<160 char max — includes value prop + URL>"
header_image: "<1500x500 spec; description for Atlas to design via canvas-design skill>"
profile_image: "<400x400 — product logo>"
pinned_tweet: |
  <a thread starter that introduces the product, ready to post>
location: "<city, or 'Building <product>'>"
website: "<full URL with UTM>"
join_date_strategy: "<warm up account 7 days before launch by following + engaging>"
```

Repeat for each platform: LinkedIn personal + company, GitHub org, YouTube, TikTok, Instagram, Threads, Bluesky, Reddit, Indie Hackers, Dev.to, Hashnode.

**Action layer:** If platform has an API and the founder has a key, Atlas calls the API to update the bio. Otherwise, generates a paste-ready package + direct settings URL.

---

## 6.4 Press Kit Generation

A press kit is the highest-leverage asset Atlas can produce — it dramatically increases reply rates from journalists, podcasters, newsletter operators, and partner companies.

```
public/press/
├── README.md                       (overview + contact)
├── one-liner.txt                   (8-12 word elevator pitch, exact)
├── short-description.txt           (50 words)
├── medium-description.txt          (150 words)
├── long-description.txt            (400 words)
├── founder-bio.md                  (with 1-line, 50-word, 150-word versions)
├── founder-photo.jpg               (userMust if not present, with exact spec)
├── product-screenshots/
│   ├── README.md                   (screenshot list + when to use which)
│   ├── hero.png                    (or userMust to capture)
│   ├── feature-1.png
│   ├── feature-2.png
│   └── demo-gif.gif                (or userMust)
├── logos/
│   ├── logo-mark.svg
│   ├── logo-wordmark.svg
│   ├── logo-on-dark.svg
│   └── logo-on-light.svg
├── brand-colors.txt                (hex codes)
├── key-stats.json                  (auto-updated from metrics — users, MRR, growth)
├── notable-quotes.md               (early user quotes, with consent)
├── press-coverage.md               (running log — populated as it accrues)
└── contact.md                      (press@<domain>, response SLA, founder availability)
```

The kit lives at `<production-url>/press` so journalists can find it themselves. Atlas commits the route handler (Next.js: `app/press/page.tsx`; etc.).

`key-stats.json` is generated by a cron Atlas commits — refreshes weekly from production metrics.

---

## 6.5 Content Engine — 90 Days Generated, Scheduled, Repeating

v3 wrote 30 posts on one platform. v4 writes 90 days × 2-3 platforms × executes the schedule.

### Output

`docs/founder/CONTENT_CALENDAR_90.md` — every post for the next 90 days, ready to publish.

### Structure (per platform)

```
WEEK STRUCTURE (repeats with variation):

Mon  Pillar post — value/insight (long-form on LinkedIn, thread on Twitter, video on TikTok)
Tue  Build-in-public update — metric or shipped feature
Wed  Tactical tip — direct utility for target audience
Thu  Social proof — user quote, milestone, screenshot of in-product win
Fri  Engagement — question, poll, or hot take
Sat  Repurpose — pull a top performer from the past + reformat
Sun  Rest OR evergreen reshare
```

### Per-Post Schema

```yaml
post_id: 2026-W18-mon-twitter
date: 2026-05-04
time_local: 09:00
platform: twitter
format: thread (5 tweets)
pillar: pillar-post
content:
  - "<exact tweet 1>"
  - "<exact tweet 2>"
  - "<...>"
media: <image path or "none">
hashtags: <max 2>
cta: <"Reply with X" | "Try it: <url>" | "RT if you agree" | "none">
predicted_engagement_baseline: <integer based on past performance>
auto_schedule: true   # if Buffer/Typefury/Typefully API key present
auto_scheduled_at_run: <set by Atlas after API call>
```

### Automation Layer

Atlas attempts in this order to actually schedule each post:

1. **Typefully API** (`TYPEFULLY_API_KEY`) — best for Twitter/LinkedIn/Threads
2. **Buffer API** (`BUFFER_ACCESS_TOKEN`) — broad platform support
3. **Hypefury API** (`HYPEFURY_API_KEY`) — Twitter focused
4. **Native APIs** (Twitter/X v2, LinkedIn Marketing) — if creds present
5. **GitHub Action cron** — Atlas commits a workflow that posts via API on schedule
6. **Fallback:** generate `docs/founder/CONTENT_PASTE_QUEUE.md` — sorted by date, ready to manual-paste, founder spends ~10 min/week pasting

State which automation tier was reached for each post.

### Content Variety Rules (Anti-Burnout)

Atlas distributes:
- ≤ 30% promotional (with explicit CTA to product)
- ≥ 50% value-only (no product mention)
- ≥ 20% engagement (question/poll/community)

Why: pure promo accounts get throttled by every algorithm. Atlas knows this. Atlas plans for it.

### Content Repurposing Engine

Each pillar post is broken into 5 derivative pieces across formats:
- LinkedIn long-form → Twitter thread → Instagram carousel → TikTok script → newsletter section

This is committed as a generator script `scripts/repurpose.ts` that takes a pillar URL and outputs the derivative drafts. Phase 11 calls this script weekly.

---

## 6.6 SEO Foundation

### Technical SEO Audit + Fix

Atlas runs through a checklist and **fixes** items it can:

| Item | Action |
|------|--------|
| `<title>` per page | Generates from content, commits |
| `meta description` per page | Generates, commits |
| `og:image` per page | Generates from screenshots or commits Atlas-designed default |
| `sitemap.xml` | Generates dynamically (e.g., `app/sitemap.ts`), commits |
| `robots.txt` | Commits with sane defaults |
| Canonical URLs | Adds `<link rel="canonical">` to every page |
| Structured data | JSON-LD for SoftwareApplication, FAQPage, Organization |
| Alt text on all images | Audits + adds where missing |
| Internal linking | Generates a contextual link plan, commits if blog/docs structure supports it |
| Core Web Vitals | Runs Lighthouse via `chrome-devtools-mcp` if available; fixes top 3 issues |
| HTTPS, HSTS | Verifies; surfaces userMust if not configured at platform level |
| `<h1>` per page | Audits one per page, no duplicates |

### Content Roadmap (90 days)

```
Week 1-2: Foundation pages
  - "What is <product>?"
  - "How to <core use case>"
  - "<Product> vs <competitor 1>"
  - "<Product> vs <competitor 2>"

Week 3-4: Use case landing pages
  - "<Product> for <persona 1>"
  - "<Product> for <persona 2>"
  - "<Product> for <persona 3>"

Week 5-8: Long-tail tutorials
  - 8 specific how-to guides matching long-tail keywords

Week 9-12: Evergreen + comparison
  - "Best <category> tools 2026"
  - "Open source vs hosted: <category>"
  - Case studies (when 3+ real users exist)
```

For each piece, Atlas writes:
- Target keyword + estimated volume + difficulty
- Outline (H2/H3 structure)
- First-draft body OR a 200-word lead + outline (full draft if Atlas has bandwidth this phase)

### Search Console + Analytics Setup

If domain DNS is via Cloudflare/Vercel CLI access, Atlas:
1. Adds DNS TXT verification record automatically
2. Submits sitemap.xml via Search Console API (if API key)
3. Configures Plausible/PostHog/GA4 (whichever is in scope) via API or commits the snippet

---

## 6.7 Community Engagement Plan

For each of the top 10 communities from the Audience Map, Atlas writes:

```yaml
community_id: r/<sub> (or Discord server name, etc.)
size: <member count>
activity: <posts/day>
self_promotion_rules:
  prohibited: <yes/no>
  ratio_required: <e.g., "9:1 contribution to promotion">
  flair_required: <yes/no, value>
mod_friendliness: <"strict | moderate | permissive">
lurk_period_days: <e.g., 7 for friendly subs, 30 for strict ones>
contribution_calendar:
  week_1:
    - day_1: "Comment helpfully on top post of day"
    - day_3: "Answer a question in good faith, no product mention"
    - day_5: "Share a free resource related to <topic>"
  week_2: ...
  week_3: <product mention allowed if rules permit>
sample_contributions:
  - "<actual comment text Atlas drafted, ready for founder to paste>"
  - "<another draft, different post type>"
product_mention_when:
  trigger: "After 6 helpful contributions OR explicit invitation"
  template: "<exact text that introduces product naturally>"
```

This gives Phase 11 (Growth Engine) a recurring source of community contributions to draft each week.

---

## 6.8 Micro-Influencer Outreach (NEW vs v3)

The v3 marketing module missed this. v4 makes it a first-class action.

### Discovery

Atlas finds 30+ accounts in the niche with 1K–50K followers (sweet spot: high engagement, accessible):
- Twitter/X: search bio keywords + check engagement rate (likes ÷ followers)
- YouTube: search niche keywords, filter by subscriber range
- TikTok: hashtag + niche keyword search
- Substack: niche newsletters with public subscriber counts
- Podcast guesting prospects: host directories (Listen Notes API)

### Per-Influencer Output

```yaml
account: @<handle>
platform: <twitter|youtube|tiktok|substack|podcast>
followers: <count>
recent_relevant_post:
  url: <link>
  topic: <what they posted about>
  date: <recent>
why_them: "<1 sentence: why their audience overlaps with target>"
contact_method: <DM | Email | platform-specific>
contact_value: <handle or email>
outreach_message: |
  [References their specific recent post in line 1]
  [Genuine appreciation, not flattery]
  [The product, what it does, in 1 sentence]
  [Specific ask: feedback, try free, would they share if useful]
  [Tight signoff]
  Atlas does NOT promise affiliate $ or kickbacks unless Phase 7 budget allows
follow_up: <day 7 if no reply, different angle>
priority: <P1|P2|P3 based on follower×engagement>
```

### Action Layer

If contact is via Twitter/LinkedIn DM AND the founder has authorized account access, Atlas drafts the messages and queues them in `OUTREACH_QUEUE.md` with paste-ready content. For email, Atlas sends via Resend/SendGrid API if key is present.

Atlas paces sends: max 10/day to avoid spam flags. Tracks replies via reply-to tracking links.

---

## 6.9 Email & Newsletter System

### Capture

Verify email capture exists in production. If missing:
1. Pick the right tool by product type (ConvertKit/Beehiiv for newsletters, Loops/Resend for SaaS, Mailchimp for general)
2. Sign up via API if API key in `.env`, else surface a quick userMust with the exact platform recommendation and reasoning
3. Commit a signup form component if one doesn't exist
4. Add capture to: landing hero, footer, blog post end, exit-intent

### Welcome Sequence (Drip)

```
Email 0: Confirm + immediate value (sent at signup)
   Subject: "<Product>: here's <thing they signed up for>"
   Body: <one-line value, link to it, signoff>

Email 1 (Day 1): "How <similar people> use <Product>"
   Subject: "<Specific use case> in <Product>"
   Body: <walk them through one quick win>

Email 3: "The thing most people miss"
   Subject: "<Hidden feature or gotcha>"

Email 7: Social proof
   Subject: "<User result> from <Product>"

Email 14: Re-engagement
   Subject: "Are you stuck somewhere?"

Email 21: Upgrade offer (if applicable)
   Subject: "<Limited offer or paid feature spotlight>"
```

Each email's body is fully drafted, voice-checked against `BRAND_VOICE.md`, includes one CTA, and is configured via the email tool's API.

### Newsletter Cadence

Bi-weekly publication recommended for indie products. Atlas drafts the first 4 issues:
1. Launch story + early metrics
2. Use case spotlight + customer quote
3. Behind-the-scenes build update
4. Industry observation + product tie-in

Each is set up as a scheduled send if API supports it.

---

## Output Files (Phase 6)

```
docs/founder/
├── MARKETING_PLAYBOOK.md
├── BRAND_VOICE.md
├── CONTENT_CALENDAR_30.md
├── CONTENT_CALENDAR_90.md
├── CONTENT_PASTE_QUEUE.md           (fallback if no scheduling API)
├── SEO_STRATEGY.md
├── SEO_CONTENT_ROADMAP.md
├── COMMUNITY_ENGAGEMENT_PLAN.md
├── INFLUENCER_OUTREACH.md
├── OUTREACH_QUEUE.md
├── EMAIL_SEQUENCES.md
└── profiles/
    ├── twitter.md
    ├── linkedin.md
    ├── github.md
    └── ...

public/press/
└── (full press kit per 6.4)

scripts/
└── repurpose.ts                     (content repurposing generator)

.github/workflows/
├── content-tick.yml                 (Atlas posts via API on schedule)
└── seo-stats-snapshot.yml           (weekly SEO metrics → growth_log)
```

---

## Acceptance Test (Phase 6)

- [ ] BRAND_VOICE.md exists with concrete examples and forbidden words list
- [ ] Press kit live at `/press` route returning 200
- [ ] CONTENT_CALENDAR_90.md has ≥ 90 distinct dated posts
- [ ] At least one post is verifiably scheduled via API (or paste queue is generated as fallback with reason logged)
- [ ] Email signup is functional in production (test signup → confirm received)
- [ ] Welcome sequence is configured and verified by sending a test email
- [ ] OUTREACH_QUEUE.md has ≥ 30 personalized influencer messages
- [ ] At least 5 community contribution drafts ready in COMMUNITY_ENGAGEMENT_PLAN.md
- [ ] SEO technical audit shows: sitemap, robots.txt, structured data, og:images, canonicals all present
- [ ] `repurpose.ts` works on a sample input

---

## Checkpoint

```
─────────────────────────────────────────────────────
MARKETING PLAYBOOK COMPLETE

Done:
  ✓ Brand voice codified, examples + forbidden lists
  ✓ [N] platform profiles set up ([M] live via API)
  ✓ Press kit committed at /press
  ✓ 90 days of content written ([M] auto-scheduled, [N] in paste queue)
  ✓ SEO foundations: [N] technical fixes shipped, [N] content pieces planned
  ✓ [N] communities mapped with engagement calendars
  ✓ [N] micro-influencers identified with personalized DMs
  ✓ Email capture + welcome sequence live

Acceptance test: [PASS/FAIL]
Auto-scheduling tier reached: [API|GH-Action|Paste-fallback]

Runs-itself score: [X] → [Y]

Type 'continue' to proceed to Business Setup.
─────────────────────────────────────────────────────
```

---

## Red Flags

- ❌ Content written but not scheduled when API access exists
- ❌ Press kit absent or hidden behind a 404
- ❌ Generic outreach templates instead of personalized DMs
- ❌ "Schedule these posts in Buffer" as a userMust when Buffer API key is in `.env`
- ❌ Email sequence existing only as text, not configured in the actual email tool
- ❌ SEO audit produced as a list of suggestions instead of fixes
- ❌ Community plan that ignores subreddit self-promotion rules
- ❌ Voice doc that is generic ("be authentic, be helpful")
- ❌ < 90 posts in calendar — short of the 90-day target
- ❌ Skipping the repurposing engine — every product has 5x output potential per piece
