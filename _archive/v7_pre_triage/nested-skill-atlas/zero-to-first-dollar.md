---
name: atlas-zero-to-first-dollar
description: The Zero-to-First-Dollar Sprint — Atlas's systematic approach to finding and converting the first 5-10 paying customers before any traditional marketing. Loaded when MRR = $0 or when explicitly invoked. Focuses on high-intent individual outreach, not broadcast marketing.
---

# Zero-to-First-Dollar Sprint

**Loaded:** When `MRR = $0` OR `/atlas money` invoked with no revenue
**Purpose:** Find and convert the first 5-10 paying customers through systematic high-intent outreach
**Exit Gate:** ≥ $100 MRR OR ≥ 5 paying customers OR 30 days elapsed with documented learnings

---

## The First-Dollar Problem

Most products fail not because they're bad, but because founders:
1. Build for months without talking to customers
2. Launch to crickets because they have no audience
3. Wait for "organic growth" that never comes
4. Burn out before finding product-market fit

**The Zero-to-First-Dollar Sprint solves this by finding your first customers NOW, not later.**

---

## The Sprint Protocol (7-Day Cycle)

```text
PROCEDURE zero_to_first_dollar_sprint:
  
  DAY 1: MINE HIGH-INTENT SIGNALS
  ────────────────────────────────────────────────
  1. Identify where your target customers express pain
     - Subreddits where they complain about current solutions
     - Twitter/X threads where they ask for recommendations
     - Discord/Slack communities where they seek help
     - Indie Hackers posts where they describe problems
     - Hacker News comments expressing frustration
  
  2. Search for specific high-intent phrases:
     - "looking for a tool that..."
     - "frustrated with [competitor]..."
     - "is there anything that can..."
     - "willing to pay for..."
     - "need help with..."
  
  3. Compile list of 50 high-intent individuals
     - Name
     - Platform
     - Specific pain expressed
     - Link to original post/comment
     - Recency (prefer <7 days old)
  
  DAY 2-3: PERSONALIZED OUTREACH (BATCH 1: 20 people)
  ────────────────────────────────────────────────
  For each person:
  
  1. Read their full post/comment history (5 min)
  2. Understand their specific context
  3. Write personalized message (NOT a template):
     
     Structure:
     - Reference their specific pain point
     - Show you understand their context
     - Offer your solution as a direct answer
     - Include one screenshot/demo relevant to their need
     - Ask ONE specific question
     - NO sales pitch, NO marketing speak
  
  4. Send via DM or reply (platform-appropriate)
  5. Log in outreach tracker
  
  DAY 4: FOLLOW-UP & BATCH 2 (20 more people)
  ────────────────────────────────────────────────
  1. Follow up with Day 2-3 non-responders (gentle nudge)
  2. Start outreach to next 20 people
  3. Respond to any replies within 2 hours
  
  DAY 5-6: CONVERT CONVERSATIONS TO TRIALS
  ────────────────────────────────────────────────
  For anyone who responds positively:
  
  1. Offer immediate access (free trial or beta)
  2. Personal onboarding call (15 min, optional but recommended)
  3. Custom setup if needed
  4. Ask for feedback after 48 hours of use
  
  DAY 7: CONVERT TRIALS TO PAID
  ────────────────────────────────────────────────
  For anyone who used the product:
  
  1. Ask: "Has this solved [their specific problem]?"
  2. If yes: "Would you pay $X/month to keep using it?"
  3. If hesitation: "What would make it worth $X to you?"
  4. Offer founding member discount (20-30% off)
  5. Send payment link immediately
  
  METRICS TO TRACK:
  ────────────────────────────────────────────────
  - Outreach sent: [N]
  - Response rate: [N]%
  - Trial conversions: [N]
  - Paid conversions: [N]
  - Revenue: $[N]
  - Key objections: [list]
  - Feature requests: [list]
```

---

## Executable Outreach Engine

```javascript
// ~/.atlas/scripts/zero-to-first-dollar.js
const fs = require('fs');
const path = require('path');

class ZeroToFirstDollar {
  constructor(portfolioPath, slug) {
    this.portfolioPath = portfolioPath;
    this.slug = slug;
    this.contextPath = path.join(portfolioPath, slug, 'context.json');
    this.outreachPath = path.join(portfolioPath, slug, 'outreach_tracker.json');
  }

  // Load product context
  loadContext() {
    return JSON.parse(fs.readFileSync(this.contextPath, 'utf8'));
  }

  // Initialize outreach tracker
  initTracker() {
    if (fs.existsSync(this.outreachPath)) {
      return JSON.parse(fs.readFileSync(this.outreachPath, 'utf8'));
    }

    const tracker = {
      sprint_start: new Date().toISOString(),
      target_revenue: 100,
      target_customers: 5,
      prospects: [],
      conversations: [],
      trials: [],
      paid: [],
      learnings: []
    };

    this.saveTracker(tracker);
    return tracker;
  }

  // Save tracker
  saveTracker(tracker) {
    fs.writeFileSync(this.outreachPath, JSON.stringify(tracker, null, 2), 'utf8');
  }

  // Generate high-intent search queries
  generateSearchQueries(productContext) {
    const { name, category, target_customer, pain_points } = productContext.product;
    
    const queries = [
      // Direct pain expressions
      ...pain_points.map(pain => `"${pain}" site:reddit.com`),
      ...pain_points.map(pain => `"${pain}" site:twitter.com`),
      
      // Looking for solutions
      `"looking for" "${category}" site:reddit.com`,
      `"need a tool" "${category}" site:indiehackers.com`,
      `"is there a" "${category}" site:twitter.com`,
      
      // Competitor frustrations
      `"frustrated with" "${category}"`,
      `"alternative to" "${category}"`,
      
      // Willingness to pay
      `"willing to pay" "${category}"`,
      `"would pay for" "${category}"`,
      
      // Recent asks
      `"${category}" "recommendations" site:reddit.com`,
      `"${category}" "suggestions" site:twitter.com`
    ];

    return queries;
  }

  // Add prospect to tracker
  addProspect(prospect) {
    const tracker = this.initTracker();
    
    const prospectData = {
      id: `prospect-${Date.now()}`,
      added_at: new Date().toISOString(),
      name: prospect.name || 'Unknown',
      platform: prospect.platform,
      profile_url: prospect.profile_url,
      post_url: prospect.post_url,
      pain_expressed: prospect.pain_expressed,
      context: prospect.context,
      recency_days: prospect.recency_days,
      status: 'identified',
      outreach_sent: null,
      response_received: null,
      trial_started: null,
      paid_at: null,
      notes: []
    };

    tracker.prospects.push(prospectData);
    this.saveTracker(tracker);
    
    return prospectData;
  }

  // Generate personalized outreach message
  generateOutreach(prospect, productContext) {
    const { name, description, production_url } = productContext.product;
    
    // This is a template - in real use, Atlas would customize heavily
    const message = {
      subject: null, // For email/DM
      body: `Hey ${prospect.name},

I saw your post about ${prospect.pain_expressed}.

I actually built something that might help with exactly this: ${name}.

${this.customizeForPain(prospect.pain_expressed, description)}

Here's a quick screenshot showing how it handles your specific case: [SCREENSHOT_URL]

Would you be interested in trying it out? I can set you up with early access.

What's the biggest blocker you're hitting right now with ${prospect.pain_expressed}?`,
      
      platform_specific: this.formatForPlatform(prospect.platform)
    };

    return message;
  }

  customizeForPain(pain, productDescription) {
    // Extract relevant features from product description
    // In real implementation, this would use NLP or LLM to match pain to features
    return `It specifically helps with ${pain} by ${productDescription.substring(0, 100)}...`;
  }

  formatForPlatform(platform) {
    const formats = {
      reddit: {
        max_length: 10000,
        tone: 'casual, helpful',
        avoid: ['sales pitch', 'marketing speak', 'emojis']
      },
      twitter: {
        max_length: 280,
        tone: 'concise, direct',
        allow: ['emojis', 'hashtags']
      },
      discord: {
        max_length: 2000,
        tone: 'friendly, technical',
        allow: ['emojis', 'code blocks']
      },
      email: {
        max_length: null,
        tone: 'professional, personal',
        structure: ['greeting', 'context', 'offer', 'question', 'signature']
      }
    };

    return formats[platform] || formats.email;
  }

  // Track outreach sent
  markOutreachSent(prospectId, message) {
    const tracker = this.initTracker();
    const prospect = tracker.prospects.find(p => p.id === prospectId);
    
    if (prospect) {
      prospect.status = 'outreach_sent';
      prospect.outreach_sent = new Date().toISOString();
      prospect.message = message;
      
      tracker.conversations.push({
        prospect_id: prospectId,
        started_at: new Date().toISOString(),
        messages: [
          {
            from: 'atlas',
            sent_at: new Date().toISOString(),
            content: message.body
          }
        ]
      });
      
      this.saveTracker(tracker);
    }
  }

  // Track response received
  markResponseReceived(prospectId, response) {
    const tracker = this.initTracker();
    const prospect = tracker.prospects.find(p => p.id === prospectId);
    const conversation = tracker.conversations.find(c => c.prospect_id === prospectId);
    
    if (prospect && conversation) {
      prospect.status = 'responded';
      prospect.response_received = new Date().toISOString();
      
      conversation.messages.push({
        from: 'prospect',
        received_at: new Date().toISOString(),
        content: response,
        sentiment: this.analyzeSentiment(response)
      });
      
      this.saveTracker(tracker);
    }
  }

  analyzeSentiment(text) {
    // Simple keyword-based sentiment analysis
    const positive = ['interested', 'yes', 'sounds good', 'love', 'great', 'perfect'];
    const negative = ['no', 'not interested', 'spam', 'unsubscribe'];
    const neutral = ['maybe', 'tell me more', 'how', 'what'];
    
    const lowerText = text.toLowerCase();
    
    if (positive.some(word => lowerText.includes(word))) return 'positive';
    if (negative.some(word => lowerText.includes(word))) return 'negative';
    if (neutral.some(word => lowerText.includes(word))) return 'neutral';
    
    return 'unknown';
  }

  // Track trial started
  markTrialStarted(prospectId, trialDetails) {
    const tracker = this.initTracker();
    const prospect = tracker.prospects.find(p => p.id === prospectId);
    
    if (prospect) {
      prospect.status = 'trial';
      prospect.trial_started = new Date().toISOString();
      
      tracker.trials.push({
        prospect_id: prospectId,
        started_at: new Date().toISOString(),
        trial_length_days: trialDetails.length_days || 14,
        custom_setup: trialDetails.custom_setup || false,
        onboarding_call: trialDetails.onboarding_call || false
      });
      
      this.saveTracker(tracker);
    }
  }

  // Track conversion to paid
  markPaid(prospectId, paymentDetails) {
    const tracker = this.initTracker();
    const prospect = tracker.prospects.find(p => p.id === prospectId);
    
    if (prospect) {
      prospect.status = 'paid';
      prospect.paid_at = new Date().toISOString();
      
      tracker.paid.push({
        prospect_id: prospectId,
        paid_at: new Date().toISOString(),
        amount: paymentDetails.amount,
        plan: paymentDetails.plan,
        discount_applied: paymentDetails.discount || null,
        payment_method: paymentDetails.method
      });
      
      this.saveTracker(tracker);
      
      // Update context.json MRR
      const context = this.loadContext();
      context.revenue = context.revenue || {};
      context.revenue.mrr = (context.revenue.mrr || 0) + paymentDetails.amount;
      context.revenue.customers = (context.revenue.customers || 0) + 1;
      fs.writeFileSync(this.contextPath, JSON.stringify(context, null, 2), 'utf8');
    }
  }

  // Generate sprint report
  generateReport() {
    const tracker = this.initTracker();
    const sprintDays = Math.floor(
      (Date.now() - new Date(tracker.sprint_start).getTime()) / (1000 * 60 * 60 * 24)
    );

    const stats = {
      sprint_days: sprintDays,
      prospects_identified: tracker.prospects.length,
      outreach_sent: tracker.prospects.filter(p => p.outreach_sent).length,
      responses_received: tracker.prospects.filter(p => p.response_received).length,
      trials_started: tracker.trials.length,
      paid_conversions: tracker.paid.length,
      total_revenue: tracker.paid.reduce((sum, p) => sum + p.amount, 0),
      response_rate: 0,
      trial_conversion_rate: 0,
      paid_conversion_rate: 0
    };

    if (stats.outreach_sent > 0) {
      stats.response_rate = (stats.responses_received / stats.outreach_sent * 100).toFixed(1);
    }

    if (stats.responses_received > 0) {
      stats.trial_conversion_rate = (stats.trials_started / stats.responses_received * 100).toFixed(1);
    }

    if (stats.trials_started > 0) {
      stats.paid_conversion_rate = (stats.paid_conversions / stats.trials_started * 100).toFixed(1);
    }

    return stats;
  }

  // Format report for display
  formatReport(stats) {
    let report = '\n';
    report += '═══════════════════════════════════════════════\n';
    report += 'ZERO-TO-FIRST-DOLLAR SPRINT REPORT\n';
    report += `Day ${stats.sprint_days} of Sprint\n`;
    report += '═══════════════════════════════════════════════\n\n';
    
    report += 'FUNNEL METRICS:\n';
    report += `  Prospects Identified:  ${stats.prospects_identified}\n`;
    report += `  Outreach Sent:         ${stats.outreach_sent}\n`;
    report += `  Responses Received:    ${stats.responses_received} (${stats.response_rate}%)\n`;
    report += `  Trials Started:        ${stats.trials_started} (${stats.trial_conversion_rate}%)\n`;
    report += `  Paid Conversions:      ${stats.paid_conversions} (${stats.paid_conversion_rate}%)\n\n`;
    
    report += 'REVENUE:\n';
    report += `  Total Revenue:         $${stats.total_revenue}\n`;
    report += `  Target:                $${100}\n`;
    report += `  Progress:              ${(stats.total_revenue / 100 * 100).toFixed(0)}%\n\n`;
    
    const exitGateMet = stats.total_revenue >= 100 || stats.paid_conversions >= 5;
    report += `EXIT GATE: ${exitGateMet ? '✅ MET' : '⏳ IN PROGRESS'}\n`;
    
    if (!exitGateMet) {
      report += `  Need: $${100 - stats.total_revenue} more OR ${5 - stats.paid_conversions} more customers\n`;
    }
    
    report += '═══════════════════════════════════════════════\n';
    
    return report;
  }
}

module.exports = ZeroToFirstDollar;

// CLI usage
if (require.main === module) {
  const portfolioPath = process.argv[2] || path.join(require('os').homedir(), '.atlas', 'portfolio');
  const slug = process.argv[3];
  const action = process.argv[4];

  if (!slug) {
    console.error('Usage: node zero-to-first-dollar.js <portfolio-path> <slug> <action>');
    process.exit(1);
  }

  const sprint = new ZeroToFirstDollar(portfolioPath, slug);

  if (action === 'init') {
    sprint.initTracker();
    console.log('✓ Sprint tracker initialized');
  } else if (action === 'report') {
    const stats = sprint.generateReport();
    console.log(sprint.formatReport(stats));
  } else if (action === 'queries') {
    const context = sprint.loadContext();
    const queries = sprint.generateSearchQueries(context);
    console.log('HIGH-INTENT SEARCH QUERIES:\n');
    queries.forEach((q, i) => console.log(`${i + 1}. ${q}`));
  }
}
```

---

## Platform-Specific Outreach Guides

### Reddit Outreach
```text
DO:
- Reply to comments, not posts (more personal)
- Reference their specific situation
- Offer to DM if they want to try it
- Be genuinely helpful first
- Wait 24-48h before mentioning your product

DON'T:
- Post promotional content
- Use marketing language
- Spam multiple subreddits
- Ignore subreddit rules
- Be pushy
```

### Twitter/X Outreach
```text
DO:
- Reply to their tweet first (add value)
- Follow them
- DM after they engage with your reply
- Keep it under 280 characters
- Include a screenshot or demo

DON'T:
- Cold DM without engagement
- Use generic templates
- Send multiple messages
- Ignore their response time
```

### Discord/Slack Outreach
```text
DO:
- Participate in the community first
- Help others before promoting
- DM after establishing presence
- Offer beta access
- Be technical and specific

DON'T:
- Join just to promote
- Spam channels
- Ignore community guidelines
- Be salesy
```

---

## Exit Gate Criteria

Sprint ends when ANY of these is true:

1. **Revenue Target:** ≥ $100 MRR
2. **Customer Target:** ≥ 5 paying customers
3. **Time Limit:** 30 days elapsed
4. **Learning Threshold:** 50+ outreach attempts with documented patterns

If time/attempt limit reached without revenue:
- Document all learnings
- Identify top 3 objections
- Pivot product or messaging
- Restart sprint with new approach

---

## Success Metrics

| Metric | Good | Great | Exceptional |
|--------|------|-------|-------------|
| Response Rate | 10-20% | 20-30% | 30%+ |
| Trial Conversion | 30-50% | 50-70% | 70%+ |
| Paid Conversion | 10-20% | 20-40% | 40%+ |
| Days to First Dollar | 14-21 | 7-14 | <7 |

---

## Common Failure Patterns

| Pattern | Symptom | Fix |
|---------|---------|-----|
| Generic outreach | <5% response rate | Read their history, personalize deeply |
| Wrong audience | High response, low trial conversion | Find different communities |
| Unclear value | High trial, low paid conversion | Clarify outcome, not features |
| Too expensive | "Interested but..." | Offer founding member discount |
| Product not ready | Trials don't use it | Fix onboarding or core UX first |

---

## Acceptance Test

- [ ] Outreach tracker initialized at `~/.atlas/portfolio/[slug]/outreach_tracker.json`
- [ ] 50+ high-intent prospects identified with specific pain points
- [ ] 20+ personalized outreach messages sent (not templates)
- [ ] Response rate tracked and ≥ 10%
- [ ] At least 1 trial started
- [ ] At least 1 paid conversion OR clear learning documented
- [ ] Sprint report generated with funnel metrics
- [ ] Top 3 objections documented
- [ ] Top 3 feature requests documented
- [ ] Exit gate met OR pivot plan documented
