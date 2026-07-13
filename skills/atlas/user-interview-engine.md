---
name: atlas-user-interview-engine
description: Use during Phase 12 (Revenue Intel) or continuously in Phase 13 (Growth Engine) to autonomously interview users, gather feedback, and synthesize feature requests.
---

# User Interview Engine (v8.4+)

**Loaded:** When user feedback is required, or periodically in Phase 13 to gather qualitative data.
**Purpose:** Replace assumptions with direct user evidence. Atlas is not just a builder, it is an active listener.
**Exit Gate:** 5+ synthesized user interviews leading to at least 1 validated hypothesis.

---

## 1. The Evidence Mandate

Building in a vacuum is a failure mode. Atlas does not guess what users want. It asks them.

Before any major feature is queued in Phase 13, this engine must be run to generate a **Validated Problem Hypothesis**. If users are not complaining about a problem, Atlas does not solve it.

---

## 2. The Interview Protocol

```text
PROCEDURE run_interview_engine:

  1. IDENTIFY TARGET COHORT
     - Query database for active users in the last 7 days.
     - Filter out users who have already been interviewed in the last 30 days.
     - Target size: 20 users.

  2. GENERATE CONTEXTUAL QUESTIONS
     - Read the user's specific usage patterns.
     - Formulate 3 specific, open-ended questions.
     - Example: "I noticed you used the export feature 5 times this week. What were you trying to achieve with those exports?"

  3. DISPATCH OUTREACH (Layer 1: Email API)
     - Send personalized emails from the founder's address.
     - Keep it short, casual, and text-only. No formatting.

  4. SYNTHESIZE REPLIES
     - When replies are received (via IMAP/Webhook), parse the text.
     - Extract:
       * Pain points
       * Feature requests
       * Workarounds they are currently using
       * Aha! moments

  5. GENERATE ROADMAP RECOMMENDATIONS
     - Cross-reference extracted pain points with the current feature set.
     - Output prioritized list of features to build next.
```

---

## 3. Automated Outreach Template

This template is dynamically filled by the engine.

```text
Subject: Quick question about how you use [Product]

Hey [Name],

I saw you've been using [Product] a lot lately, specifically [Feature].

I'm trying to figure out what to build next to make it better for you.
Could you reply and let me know what the biggest friction point is for you right now?

No surveys, just a quick reply.

Thanks,
[Founder Name]
```

---

## 4. Synthesis & Roadmapping

Once feedback is collected, this module uses the `adversarial-and-epistemic.md` engine to test hypotheses.

If 3 users ask for a "calendar view", the hypothesis is: "A calendar view will increase retention."
The engine generates the Null and Anti-hypotheses before writing the feature spec.

The final synthesized report is written to `~/.atlas/portfolio/[slug]/user_feedback_log.md` and prioritized in the next Phase 13 iteration.
