---
name: atlas-marketing-playbook
description: Use during Atlas Module 4 — builds the complete executable marketing system. Not a strategy doc. Produces actual social bios, a 30-day content calendar with real post text, SEO keyword targets, and community engagement guides.
---

# Atlas Marketing Playbook

**Input:** Business Context + launch channel selection
**Purpose:** Build the complete marketing system — not a strategy doc, an executable playbook.

## The Rule

Atlas does not write "content topics to explore." Atlas writes actual posts. The difference:

❌ "Post about your launch journey on Twitter"
✅ [Actual tweet text, ready to copy-paste]

## Process

### Step 1: Platform Identification

Identify which platforms actually host the target customer — not which platforms are popular generally.

For each recommended platform, write:
- Exact bio copy (character-count appropriate)
- Profile setup instructions (what to put where)
- Pinned post / featured content recommendation
- Posting frequency and best times for this audience

**Platform decision matrix:**
| Audience | Best Platforms |
|----------|---------------|
| Developers | Twitter/X, HN, GitHub, Dev.to, Lobsters |
| B2B SaaS buyers | LinkedIn, Twitter/X |
| Consumer app users | TikTok, Instagram, YouTube |
| Indie makers | Twitter/X, Indie Hackers, Product Hunt |
| Design tools | Twitter/X, Dribbble, Behance |
| Gaming/entertainment | Discord, Reddit, TikTok |
| Finance/investing | Twitter/X, Reddit (r/personalfinance etc.) |

### Step 2: 30-Day Content Calendar

Generate 30 actual posts — not topics, actual post text — for the primary platform.

**Content mix (one repeating cycle per week):**
- Day 1: Value post (tip, insight, or tutorial relevant to target audience)
- Day 2: Product feature spotlight (specific feature + use case)
- Day 3: Behind the scenes (build story, decision made, challenge overcome)
- Day 4: Social proof (user story, metric milestone, win)
- Day 5: Community engagement (question, poll, or discussion prompt)
- Day 6: Repurposed long-form content (if applicable)
- Day 7: Rest or evergreen content

**Post format:** Ready to copy-paste. Include:
- Post text
- Hashtags (if applicable)
- Image/screenshot recommendation
- Best time to post

### Step 3: SEO Strategy

Research and document:

**Target keywords:**
- Primary keyword (highest volume, most relevant to core product)
- Secondary keywords (3-5 supporting terms)
- Long-tail keywords (5-10 specific use case terms)
- For each keyword: estimated search volume, difficulty, current ranking opportunity

**Content gaps vs. competitors:**
- What competitors rank for that this product should
- Missing content types (tutorials, comparisons, use case pages)

**Technical SEO checklist:**
- [ ] Page titles optimized (primary keyword in title)
- [ ] Meta descriptions written for all pages
- [ ] Sitemap.xml present and submitted
- [ ] Robots.txt present
- [ ] Core Web Vitals acceptable (LCP <2.5s, CLS <0.1)
- [ ] Structured data for product/software
- [ ] Alt text on all images
- [ ] Internal linking structure

**Content roadmap (first 90 days):**
- Week 1-2: Foundation posts (what is [product], how to use [product])
- Week 3-4: Use case posts (for [specific role/industry])
- Week 5-8: Comparison posts ([product] vs. [competitor])
- Week 9-12: Advanced tutorials + case studies

### Step 4: Community Engagement Strategy

Identify top 10 communities where the target customer lives.

For each community, write:
- Platform and community name
- Size and activity level
- Lurk period before posting (respect culture)
- Contribution approach (what to offer, not what to promote)
- Product mention timing (only after establishing presence)
- Rules about self-promotion (note any prohibitions)

### Step 5: Personal Brand Layer

Generate:
- Launch story thread (building-in-public, from git commits + milestones)
- 3-part case study outline (for when product reaches $1K MRR):
  1. The problem and why existing solutions failed
  2. The build process (technical + business decisions)
  3. The results (metrics, learnings, what would be done differently)

### Step 6: Affiliate/Referral Program (if applicable)

If product category benefits from referral:
- Referral program structure recommendation
- Incentive design (discount vs. cash vs. credit)
- Implementation path (ReferralHero, Rewardful, or custom)

## Output

- `docs/founder/MARKETING_PLAYBOOK.md`
- `docs/founder/CONTENT_CALENDAR_30.md` (30 actual posts ready to schedule)
- `docs/founder/SEO_STRATEGY.md`

## Checkpoint

```
─────────────────────────────────────────────────────
MARKETING PLAYBOOK COMPLETE

Done:
  ✓ [N] platforms identified and set up guides written
  ✓ 30 posts written for [primary platform]
  ✓ [N] SEO keywords targeted, [N] content pieces planned
  ✓ [N] communities identified with engagement guides
  ✓ Launch story thread drafted

Runs-itself score: [X] → [Y]

Type 'continue' to proceed to Business Setup
─────────────────────────────────────────────────────
```
