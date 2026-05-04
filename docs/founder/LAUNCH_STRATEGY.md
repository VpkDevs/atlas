# Atlas Launch Strategy

**Date:** May 5, 2026
**Launch date:** Tuesday, May 19, 2026
**Version:** Atlas v6 — The Sovereign Empire

---

## Decision: Branch B — 2-Week Prepared Launch

Chose 2 weeks over "now" (Branch A) and 3 weeks (Branch C) because:
- The demo video is the single highest-leverage asset and takes a few days to do right
- 2 weeks gives time to build 5–10 engaged supporters without building a paid network
- Branch C (full landing page) is the eventual right play, but waiting kills momentum
- The GitHub stars from HN will be the social proof that makes PH viable later

See CHANNEL_FITNESS_MATRIX.md for full channel scoring.

---

## Channel Priority

1. **Hacker News** (primary) — 738-point "Claude Skills" discussion proves audience exists
2. **r/ClaudeAI** (primary) — highest Atlas-audience density of any platform
3. **Indie Hackers** (secondary) — intent-rich, long half-life
4. **r/SideProject** (secondary) — high volume, lower signal
5. **Product Hunt** (deferred) — requires social proof first; schedule 2–3 weeks post-HN

---

## The Core Positioning Bet

The market is saturated with "AI coding agents." Atlas's differentiator is:

> **Atlas runs your business, not just your code.**

Every piece of launch copy leads with this. The Sovereign Score and its definition
(revenue > expenses, payout in bank) is the proof point that this is real.

The honest downsides are included in every post — HN especially punishes 
anything that sounds like marketing copy. Honesty is the strategy.

---

## Pre-Launch Checklist

- [ ] Demo video recorded and committed
- [ ] 5+ HN supporters lined up (not for upvotes — for genuine engagement)
- [ ] Validator passing locally
- [ ] README reviewed for accuracy
- [ ] All launch assets in docs/founder/launch_assets/ reviewed

---

## Success Metrics (Launch Week)

| Metric | Minimum | Good | Great |
|--------|---------|------|-------|
| GitHub stars (T+7) | 50 | 200 | 500+ |
| HN points | 50 | 200 | 500+ |
| Reddit upvotes (total) | 100 | 500 | 1000+ |
| Installs (estimated via clone traffic) | 20 | 100 | 300+ |
| "I'd pay for this" signals | 3 | 15 | 40+ |

If minimum thresholds not met: read every comment, identify the objection, iterate before Product Hunt.
If good/great thresholds met: proceed to Product Hunt within 2 weeks.

---

## Post-Launch Decision Tree

```
T+7 days:
  GitHub stars ≥ 50 AND "I'd pay" signals ≥ 5?
    YES → Build Stripe integration for paid tier
    NO  → Run one more channel (Discord) + iterate on feedback

T+14 days:
  Stars ≥ 200?
    YES → Submit to Product Hunt with demo video + real user quotes
    NO  → Defer PH; focus on content compounding (Indie Hackers long-form)
```

---

## The Demo Video Brief

**Length:** 90–120 seconds
**Format:** Screen recording (no face camera needed)
**Script outline:**

0:00 — Open a real project directory in terminal. Type `/atlas`. Hit enter.
0:05 — Show onboarding pass happening: "Reading codebase... 3 passes..."
0:20 — Show the confirmation ritual: business context displayed, inferences tagged
0:35 — Skip to pre-flight: "11 checks... all green"  
0:50 — Show LAUNCH_SEQUENCE.md being generated: scroll through the timestamped steps
1:05 — Show a content post being scheduled via Buffer API: the actual API call, the response
1:20 — Show the growth_log.md entry being written
1:35 — End on the dashboard HTML opening in browser

**Tone:** No voiceover needed. Terminal output tells the story.
**Upload:** Commit to docs/assets/atlas-demo.mp4. Link from README.
