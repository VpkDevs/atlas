# Atlas — r/SideProject Launch Asset

**Subreddit:** r/SideProject
**Target date:** Tuesday, May 19, 2026 — 12:00 PST (staggered from HN/ClaudeAI)
**Post format:** Text with link

---

## Title

```
I built an AI co-founder that deploys, launches, and runs your side project 
as a business — open source, runs locally, 14-phase pipeline
```

---

## Body

```
Built this because I kept shipping side projects that never became businesses.
Not because I couldn't code — because everything *after* coding (deployment, 
legal, marketing, running the damn thing weekly) consistently didn't happen.

So I built Atlas: a Claude Code skill that handles the full pipeline from 
"broken repo" to "this thing runs itself."

**What makes it different from AI coding tools:**

Most AI dev tools stop at "code fixed, PR merged." Atlas doesn't stop 
until you hit Sovereign Score ≥ 90 — which requires:
- Revenue > expenses for 30 consecutive days
- Zero human commits in 14 days  
- Zero human support replies in 14 days
- An actual payout in your bank account

**How the weekly loop works:**

After launch, Atlas runs a growth engine tick every week:
1. Pulls Stripe/PostHog/Plausible metrics
2. Computes deltas vs last week and 4-week average
3. Detects anomalies
4. Picks ONE action (content, bug fix, pricing test, re-engagement email)
5. Executes it using whatever API keys are in .env
6. Logs it
7. Repeats

It uses a permissions file (atlas-permissions.yml) that you define once: 
what it can do automatically, what needs your approval, what it never touches. 
Everything within the auto-approve scope fires without asking.

**The honest downsides:**
- Still requires Claude Code ($20/mo Anthropic subscription)
- Can't do things requiring physical identity (bank setup, App Store, 2FA)
- The "growth engine" is only as good as the data it has — sparse metrics = worse decisions
- It's 22 markdown files, not compiled software. Smart prompt engineering, not magic.

**MIT license. All state local. No servers.**
Free tier: phases 1-3 (code, legal, pre-flight)
Full pipeline: $29/mo

https://github.com/VpkDevs/atlas
```

---

## Subreddit Rules Compliance Check
- [x] Original project (not affiliate link)
- [x] Self-promotion explicitly allowed in r/SideProject
- [x] No misleading claims — "AI co-founder" qualified with honest downsides
- [x] Link to free/open source version
