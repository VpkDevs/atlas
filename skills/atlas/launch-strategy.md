---
name: atlas-launch-strategy
description: Use during Atlas Module 3 — researches and writes a complete, product-specific launch guide. Not generic options. The right strategy for this exact product, with all copy written and ready to post.
---

# Atlas Launch Strategy

**Input:** Business Context + `~/.atlas/patterns/launch.md` (founder's launch history)
**Purpose:** Write the complete launch guide — not strategy options, but the actual copy, ready to post.

## The Rule

Atlas does not produce a list of launch channels for the founder to choose from. Atlas:
1. Researches which channels are right for THIS product
2. Ranks them by ROI for this specific product with explicit reasoning
3. Writes complete, ready-to-post content for the top 2-3 channels

A strategy doc the founder has to read is a failure. Launch assets they can immediately use is success.

## Process

### Step 1: Channel Selection

Detect project type and target customer from Business Context. Then rank channels:

| Channel | Best For |
|---------|----------|
| Product Hunt | B2B tools, developer tools, productivity, design tools |
| Hacker News (Show HN) | Developer tools, technical products, open source |
| Reddit | Consumer products; specific subreddits by niche |
| Twitter/X threads | Building-in-public, developer audience, SaaS |
| LinkedIn | B2B, enterprise, professional services |
| Newsletter outreach | Any product with a clear niche |
| Direct outreach | B2B, high-ticket, when target customers are identifiable |
| YouTube/TikTok | Consumer apps, visual products |
| Community posts | Niche communities (Indie Hackers, specific Slacks/Discords) |

Pull relevant patterns from `~/.atlas/patterns/launch.md` — what worked for this founder before.

**Rank top 3 channels with explicit reasoning:**
```
1. [Channel] — [Why this channel fits this product] [Expected reach] [Effort level]
2. [Channel] — [Why] [Expected reach] [Effort]
3. [Channel] — [Why] [Expected reach] [Effort]
```

### Step 2: Write Launch Assets for Each Channel

**Product Hunt:**
- Tagline (60 chars max, benefit-focused, not feature-focused)
- Description (260 chars — what it does + who it's for)
- First comment (maker story: why you built this, what problem you had)
- Gallery captions (for each screenshot)
- Topics/tags (3-5 most relevant)
- Launch timing recommendation (Tuesday–Thursday, 12:01 AM PST)

**Hacker News Show HN:**
- Post title (HN format: "Show HN: [Product Name] – [one-line description]")
- Body text (HN-voice: technical, honest, direct — NOT startup speak)
- Includes: what it does, tech stack, what stage, how to try it
- Addresses: what makes it interesting to HN readers specifically

**Reddit (3-5 subreddits):**
- For each subreddit: post title + body in that community's voice
- Follows subreddit rules (no spam, genuine contribution angle)
- Includes value first, product mention naturally

**Newsletter/Press Outreach:**
- Cold email template to relevant newsletters/journalists in this niche
- Subject line (open-rate optimized for cold)
- Body (100-150 words, what's the story angle, why their readers care)
- List of 5-10 specific newsletters/journalists to contact

**Direct Outreach (if applicable):**
- Identify first 10 potential customers by role/company/community
- Personalized outreach message template
- Follow-up sequence (3 touches)

### Step 3: Parallel Universe Analysis (High-Stakes Decisions)

For timing and positioning decisions, model 3 branches:

```
Branch A: [Option] → [Expected outcome] [Confidence: High/Med/Low]
Branch B: [Option] → [Expected outcome] [Confidence: High/Med/Low]
Branch C: [Option] → [Expected outcome] [Confidence: High/Med/Low]

Recommendation: [Branch X] because [specific reasoning]
```

### Step 4: Pre-Launch Checklist

```
T-14 days:
  [ ] Product Hunt profile complete
  [ ] HN account aged (if new)
  [ ] 3 warm intro requests sent to PH hunters
  [ ] Landing page conversion-optimized

T-7 days:
  [ ] Email list teaser sent
  [ ] Social media teaser posts
  [ ] All launch copy finalized and in doc

T-1 day:
  [ ] Product Hunt scheduled
  [ ] HN post drafted
  [ ] All assets ready in one folder
  [ ] Support inbox monitored

Launch day:
  [ ] 12:01 AM PST: Product Hunt live
  [ ] 9 AM: HN Show HN post
  [ ] Community posts (stagger by 2 hours)
  [ ] Respond to every comment within 1 hour
```

### Step 5: Building-in-Public Content

Generate the launch story thread:
- Hook (the problem you had personally)
- The journey (2-3 key moments from git history)
- The product (what it does + screenshot)
- The numbers (what you've achieved so far)
- The ask (try it / give feedback / share)

## Output

- `docs/founder/LAUNCH_STRATEGY.md` — channel selection + full reasoning
- Complete ready-to-post copy for each channel
- `docs/founder/LAUNCH_TIMELINE.md`
- Building-in-public thread draft

## Checkpoint

```
─────────────────────────────────────────────────────
LAUNCH STRATEGY COMPLETE

Done:
  ✓ [N] channels analyzed, top [N] selected
  ✓ Product Hunt: tagline + description + first comment written
  ✓ [Channel 2]: complete post written
  ✓ [Channel 3]: complete post written
  ✓ Pre-launch checklist: [N] items
  ✓ Building-in-public thread drafted

Runs-itself score: [X] → [Y]

Type 'continue' to proceed to Marketing Playbook
─────────────────────────────────────────────────────
```

## Red Flags

- ❌ Providing a list of channel options instead of making a recommendation
- ❌ Writing strategy without writing actual copy
- ❌ Generic Product Hunt description not specific to this product
- ❌ Using startup speak in HN post ("disruptive", "revolutionary", "game-changing")
- ❌ Skipping the pre-launch checklist
- ❌ Not pulling from `~/.atlas/patterns/launch.md` for this founder's history
