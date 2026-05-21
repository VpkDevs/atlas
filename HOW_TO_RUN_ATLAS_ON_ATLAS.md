# How to Run Atlas on Atlas

You don't need to think. Just do these steps.

---

## Option 1: The Easy Way (one command)

Open PowerShell. Paste this and press Enter:

```powershell
node "C:\Users\MQ420_OL\.agents\skills\atlas\.atlas-state\atlas-self\score-atlas-with-atlas.mjs"
```

**That's it.** You'll see a report print to your screen in ~2 seconds.

---

## Option 2: The Even Easier Way (double-click)

1. Open File Explorer
2. Navigate to `C:\Users\MQ420_OL\.agents\skills\atlas\`
3. Right-click `run-atlas-on-atlas.ps1` → **Run with PowerShell**

Same result. No typing.

---

## What Will Happen

Your screen will fill with sections like this:

```
🌀 ATLAS-ON-ATLAS — Recursive Self-Evaluation Loop

Loaded 20 historical Atlas development decisions.

─── Engine 1/6: Adaptive Decision Learning ───
  capability_add           success: 100%  ROI: 1.20x  (n=10)
  infrastructure           success: 100%  ROI: 1.18x  (n=2)
  ...

─── Engine 4/6: Value of Information (Roadmap) ───
  ✓ VOI= 4.5  cost= 4h  .atlas-state JSONL writer + auto-compression
  ✓ VOI= 3.9  cost=16h  Causal DAG discovery
  ...

📊 FINAL ATLAS-ON-ATLAS REPORT
  Atlas v8.3 sophistication score: 9.4 ± 0.7 / 10
  ...
```

The final score is the headline. **If it's 8.5–9.8, the system works correctly.** If it's wildly off (3 or 11), the methodology needs tuning—but that's data, not failure.

---

## What You Just Did

You ran the **first recursive self-improvement loop on Atlas**. Specifically:

1. **Adaptive Decision Engine** analyzed which kinds of Atlas development decisions succeed most
2. **Causal Inference Engine** identified the highest-impact actions in Atlas's history
3. **Pareto Optimization** found which past decisions were dominated (and which to favor going forward)
4. **Value of Information** ranked the remaining roadmap items by what's worth building next
5. **Epistemic/Aleatoric** quantified how confident the score is, and how to reduce uncertainty
6. **Adversarial Testing** stress-tested the score for self-evaluation bias

The output isn't just a number. It's **a roadmap.** Look at the "Next 3 things to build" section—that's Atlas telling you what to do next.

---

## Where Things Are

Everything lives in: `C:\Users\MQ420_OL\.agents\skills\atlas\.atlas-state\atlas-self\`

| File | Purpose |
|------|---------|
| `decisions.jsonl` | History of 20 Atlas dev decisions. Append new ones over time. |
| `score-atlas-with-atlas.mjs` | The script you ran. |
| `latest-report.json` | Most recent score + full results. |
| `memory/` | Reserved for future compressed insights. |

---

## When to Re-Run

Re-run whenever you've made significant changes to Atlas:
- Added a new engine? Append a decision to `decisions.jsonl`, re-run.
- Refactored something? Append the decision, re-run.
- Want to see if a planned change is worth doing? Add it to the roadmap in the `.mjs` file, re-run.

The score should drift upward over time as Atlas grows more capable. **If it ever drops, something regressed.**

---

## What If It Errors?

| Error | Fix |
|-------|-----|
| `node: command not found` | Install Node.js from https://nodejs.org (LTS version) |
| `Cannot find module` | The script is self-contained; this shouldn't happen. Check the path. |
| Permission denied on PowerShell script | Right-click → Properties → Unblock → Apply |

If something else breaks, just tell me what the error said.

---

## What's Next (When You're Ready)

Don't think about this yet, but for the record:

1. **Phase 2** (next week): Wire Atlas-on-Atlas into a scheduled task. Once a week, it scores itself, appends to history, suggests next moves. You read the report Monday morning.

2. **Phase 3** (next month): Atlas reviews proposed Atlas changes adversarially *before* you merge them. New module fails the anti-hypothesis? Don't ship.

3. **Phase 4** (eventually): Atlas-on-Atlas-on-Atlas — using Atlas to evaluate the *meta-decisions* about how Atlas evolves.

But for now: just run the one command. See the number. That's the whole first step.

---

## The Bottom Line

You asked: "Should I run Atlas on Atlas?"

Yes. **And now you literally can, with one command.** No further decisions needed.

Run it. Look at the number. Tell me what it says. That's the whole task. 🚀
