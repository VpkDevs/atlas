---\nname: first-revenue\ndescription: Zero-to-first-dollar sprint and startup credits acquisition.\n---\n\n# Zero to First Dollar\n\n# Zero-to-First-Dollar Sprint

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
- [ ] Exit gate met OR pivot plan documented\n\n---\n\n# Startup Credits Sprint\n\n# Startup Credits Sprint

**Loaded:** Phase 6 (Business Setup) OR `/atlas credits`
**Purpose:** Apply to all qualifying startup credit programs to reduce infrastructure costs
**Potential Value:** $50,000 - $200,000 in free credits
**Time Investment:** 2-4 hours total (mostly copy-paste)

---

## The Credits Opportunity

Most founders don't know these programs exist or think they're "not ready yet." Wrong.

**You qualify if:**
- You have a working product (even MVP)
- You're pre-Series A (includes bootstrapped)
- You're incorporated (or willing to incorporate)
- You're building a tech product

**These programs want to give you credits.** They're customer acquisition for cloud providers.

---

## The Master List (Priority Order)

### Tier 1: Highest Value, Easiest Approval

| Program | Value | Requirements | Approval Time | Apply URL |
|---------|-------|--------------|---------------|-----------|
| **AWS Activate** | Up to $100,000 | Incorporated, working product | 2-5 days | https://aws.amazon.com/activate/ |
| **Google Cloud for Startups** | Up to $200,000 | Incorporated, VC-backed OR accelerator | 1-3 days | https://cloud.google.com/startup |
| **Microsoft for Startups** | Up to $150,000 | B2B product, incorporated | 3-7 days | https://www.microsoft.com/startups |
| **Stripe Atlas** | $5,000 credits + US entity | Willing to form Delaware C-Corp | Immediate | https://stripe.com/atlas |
| **Vercel Pro** | $2,000/year | Any startup | Immediate | https://vercel.com/support/contact |
| **GitHub for Startups** | Enterprise free | Incorporated | 1-2 days | https://github.com/enterprise/startups |

### Tier 2: Moderate Value, Specific Use Cases

| Program | Value | Requirements | Approval Time | Apply URL |
|---------|-------|--------------|---------------|-----------|
| **Cloudflare for Startups** | $250,000 | VC-backed OR accelerator | 3-5 days | https://www.cloudflare.com/forstartups/ |
| **DigitalOcean Hatch** | $10,000 | Any startup | 1-3 days | https://www.digitalocean.com/hatch |
| **Anthropic Credits** | $5,000 | AI product | 1-2 days | https://console.anthropic.com/settings/credits |
| **OpenAI Startup Credits** | $10,000 | AI product, VC-backed | 5-10 days | https://openai.com/form/startups |
| **Supabase Pro** | $2,000 | Any startup | Immediate | https://supabase.com/partners/integrations |
| **Render Startup** | $5,000 | Any startup | 1-2 days | https://render.com/startups |

### Tier 3: Niche But Valuable

| Program | Value | Requirements | Approval Time | Apply URL |
|---------|-------|--------------|---------------|-----------|
| **Twilio Startup** | $1,000 | Communications product | 3-5 days | https://www.twilio.com/startup |
| **SendGrid Startup** | 50,000 emails/mo | Email product | 1-2 days | https://sendgrid.com/partners/startup-program/ |
| **MongoDB Startup** | $5,000 | Database-heavy product | 2-4 days | https://www.mongodb.com/startups |
| **Algolia Startup** | $10,000 | Search product | 3-5 days | https://www.algolia.com/for-startups/ |
| **Segment Startup** | $50,000 | Analytics product | 5-7 days | https://segment.com/industry/startups/ |
| **Mixpanel Startup** | $50,000 | Analytics product | 3-5 days | https://mixpanel.com/startups/ |

---

## Application Strategy

### The Batch Approach

**Week 1:** Apply to all Tier 1 programs (6 applications)
**Week 2:** Apply to all Tier 2 programs (6 applications)
**Week 3:** Apply to relevant Tier 3 programs (3-5 applications)

**Total time:** 2-4 hours spread over 3 weeks
**Expected approvals:** 60-80% of applications
**Expected value:** $30,000 - $100,000 in credits

### Application Components (Reusable)

Every application needs some combination of:
1. Company description (150 words)
2. Product description (200 words)
3. Target customer (100 words)
4. Current traction (metrics)
5. Funding status
6. Website URL
7. Incorporation details
8. Founder LinkedIn

**Atlas generates all of these once, then you copy-paste into each application.**

---

## Executable Application Generator

```javascript
// ~/.atlas/scripts/startup-credits-generator.js
const fs = require('fs');
const path = require('path');

class StartupCreditsGenerator {
  constructor(portfolioPath, slug) {
    this.portfolioPath = portfolioPath;
    this.slug = slug;
    this.contextPath = path.join(portfolioPath, slug, 'context.json');
    this.outputPath = path.join(portfolioPath, slug, 'STARTUP_CREDITS_APPLICATIONS.md');
  }

  loadContext() {
    return JSON.parse(fs.readFileSync(this.contextPath, 'utf8'));
  }

  generateCompanyDescription(context) {
    const { name, category, description, target_customer } = context.product;
    const { location } = context.founder;

    return `${name} is a ${category} platform that ${description}. We help ${target_customer} by providing a solution that runs itself with minimal human intervention. Founded in ${location}, we're building a product that prioritizes automation and founder sovereignty.`;
  }

  generateProductDescription(context) {
    const { name, description, tech_stack, key_features } = context.product;

    let desc = `${name} is built on ${tech_stack.join(', ')} and provides:\n\n`;
    
    if (key_features && key_features.length > 0) {
      key_features.slice(0, 5).forEach(feature => {
        desc += `• ${feature}\n`;
      });
    }

    desc += `\nOur product is designed to be self-running, with automated monitoring, error recovery, and customer support workflows.`;

    return desc;
  }

  generateTargetCustomer(context) {
    const { target_customer, pain_points } = context.product;

    let desc = `Our target customers are ${target_customer}. `;
    
    if (pain_points && pain_points.length > 0) {
      desc += `They currently struggle with: ${pain_points.slice(0, 3).join(', ')}. `;
    }

    desc += `We solve these problems by providing an automated, hands-off solution that works 24/7.`;

    return desc;
  }

  generateTractionMetrics(context) {
    const { production_url, deployment_status } = context.product;
    const { mrr, customers } = context.revenue || {};

    let metrics = [];

    if (deployment_status === 'production') {
      metrics.push(`✓ Live in production: ${production_url}`);
    }

    if (mrr && mrr > 0) {
      metrics.push(`✓ MRR: $${mrr}`);
    }

    if (customers && customers > 0) {
      metrics.push(`✓ Paying customers: ${customers}`);
    }

    if (metrics.length === 0) {
      metrics.push('✓ MVP deployed and accepting beta users');
      metrics.push('✓ Pre-revenue, focused on product-market fit');
    }

    return metrics.join('\n');
  }

  generateFundingStatus(context) {
    const { definition_of_success } = context.founder;

    if (definition_of_success === 'vc') {
      return 'Pre-seed / Seeking funding';
    } else if (definition_of_success === 'acquire') {
      return 'Bootstrapped / Build-to-sell';
    } else {
      return 'Bootstrapped / Self-funded';
    }
  }

  generateApplications() {
    const context = this.loadContext();
    
    const components = {
      company_description: this.generateCompanyDescription(context),
      product_description: this.generateProductDescription(context),
      target_customer: this.generateTargetCustomer(context),
      traction: this.generateTractionMetrics(context),
      funding_status: this.generateFundingStatus(context),
      website: context.product.production_url || 'In development',
      incorporation: context.business?.entity_type || 'Planning to incorporate',
      founder_linkedin: context.founder?.linkedin || 'N/A'
    };

    return components;
  }

  generateMarkdownOutput(components) {
    let md = '# Startup Credits Applications\n\n';
    md += `Generated: ${new Date().toISOString()}\n\n`;
    md += '---\n\n';
    
    md += '## Reusable Components\n\n';
    md += 'Copy-paste these into each application form:\n\n';
    
    md += '### Company Description (150 words)\n';
    md += '```\n' + components.company_description + '\n```\n\n';
    
    md += '### Product Description (200 words)\n';
    md += '```\n' + components.product_description + '\n```\n\n';
    
    md += '### Target Customer (100 words)\n';
    md += '```\n' + components.target_customer + '\n```\n\n';
    
    md += '### Current Traction\n';
    md += '```\n' + components.traction + '\n```\n\n';
    
    md += '### Funding Status\n';
    md += '```\n' + components.funding_status + '\n```\n\n';
    
    md += '### Website URL\n';
    md += '```\n' + components.website + '\n```\n\n';
    
    md += '### Incorporation Details\n';
    md += '```\n' + components.incorporation + '\n```\n\n';
    
    md += '---\n\n';
    md += '## Application Checklist\n\n';
    md += 'Apply to these programs in order:\n\n';
    
    md += '### Week 1: Tier 1 (Highest Priority)\n\n';
    md += '- [ ] AWS Activate - https://aws.amazon.com/activate/\n';
    md += '  - Value: Up to $100,000\n';
    md += '  - Time: 15 min\n';
    md += '  - Paste: Company Description, Product Description, Traction\n\n';
    
    md += '- [ ] Google Cloud for Startups - https://cloud.google.com/startup\n';
    md += '  - Value: Up to $200,000\n';
    md += '  - Time: 10 min\n';
    md += '  - Paste: Company Description, Product Description\n\n';
    
    md += '- [ ] Microsoft for Startups - https://www.microsoft.com/startups\n';
    md += '  - Value: Up to $150,000\n';
    md += '  - Time: 15 min\n';
    md += '  - Paste: Company Description, Product Description, Target Customer\n\n';
    
    md += '- [ ] Stripe Atlas - https://stripe.com/atlas\n';
    md += '  - Value: $5,000 + US entity formation\n';
    md += '  - Time: 20 min\n';
    md += '  - Note: Forms Delaware C-Corp for you\n\n';
    
    md += '- [ ] Vercel Pro - https://vercel.com/support/contact\n';
    md += '  - Value: $2,000/year\n';
    md += '  - Time: 5 min\n';
    md += '  - Email template below\n\n';
    
    md += '- [ ] GitHub for Startups - https://github.com/enterprise/startups\n';
    md += '  - Value: Enterprise free\n';
    md += '  - Time: 10 min\n';
    md += '  - Paste: Company Description, Website\n\n';
    
    md += '### Week 2: Tier 2 (Moderate Priority)\n\n';
    md += '- [ ] Cloudflare for Startups\n';
    md += '- [ ] DigitalOcean Hatch\n';
    md += '- [ ] Anthropic Credits\n';
    md += '- [ ] OpenAI Startup Credits\n';
    md += '- [ ] Supabase Pro\n';
    md += '- [ ] Render Startup\n\n';
    
    md += '### Week 3: Tier 3 (Niche)\n\n';
    md += '- [ ] Twilio Startup (if using SMS/voice)\n';
    md += '- [ ] SendGrid Startup (if sending emails)\n';
    md += '- [ ] MongoDB Startup (if using MongoDB)\n';
    md += '- [ ] Algolia Startup (if using search)\n';
    md += '- [ ] Segment Startup (if using analytics)\n';
    md += '- [ ] Mixpanel Startup (if using analytics)\n\n';
    
    md += '---\n\n';
    md += '## Email Templates\n\n';
    
    md += '### Vercel Pro Application\n\n';
    md += '```\n';
    md += 'Subject: Startup Program Application - [Product Name]\n\n';
    md += 'Hi Vercel team,\n\n';
    md += 'I\'m applying for the Vercel for Startups program.\n\n';
    md += components.company_description + '\n\n';
    md += 'We\'re currently deployed on Vercel and would benefit greatly from Pro features as we scale.\n\n';
    md += 'Website: ' + components.website + '\n';
    md += 'Funding: ' + components.funding_status + '\n\n';
    md += 'Thank you for considering our application!\n\n';
    md += 'Best,\n';
    md += '[Your Name]\n';
    md += '```\n\n';
    
    return md;
  }

  generate() {
    const components = this.generateApplications();
    const markdown = this.generateMarkdownOutput(components);
    
    fs.writeFileSync(this.outputPath, markdown, 'utf8');
    
    return {
      outputPath: this.outputPath,
      components
    };
  }
}

module.exports = StartupCreditsGenerator;

// CLI usage
if (require.main === module) {
  const portfolioPath = process.argv[2] || path.join(require('os').homedir(), '.atlas', 'portfolio');
  const slug = process.argv[3];

  if (!slug) {
    console.error('Usage: node startup-credits-generator.js <portfolio-path> <slug>');
    process.exit(1);
  }

  const generator = new StartupCreditsGenerator(portfolioPath, slug);
  const result = generator.generate();

  console.log('✓ Startup credits applications generated');
  console.log(`  Output: ${result.outputPath}`);
  console.log('\nNext steps:');
  console.log('1. Open the generated file');
  console.log('2. Follow the checklist week by week');
  console.log('3. Copy-paste the components into each application');
  console.log('4. Track approvals and credit amounts');
}
```

---

## Approval Tracking

Create `~/.atlas/portfolio/[slug]/credits_tracker.json`:

```json
{
  "applications": [
    {
      "program": "AWS Activate",
      "applied_at": "2026-05-15",
      "status": "pending",
      "approved_at": null,
      "credit_amount": null,
      "expiry_date": null,
      "notes": ""
    }
  ],
  "total_approved": 0,
  "total_value": 0
}
```

---

## Common Rejection Reasons & Fixes

| Rejection Reason | Fix |
|------------------|-----|
| "Not incorporated yet" | Apply to Stripe Atlas first, then reapply |
| "No traction" | Deploy to production, get 10 beta users, reapply |
| "Not VC-backed" | Apply to programs that accept bootstrapped (AWS, Vercel, GitHub) |
| "Product not ready" | Show working demo URL, even if it's MVP |
| "Wrong industry" | Focus on programs without industry restrictions |

---

## Expected Timeline

| Week | Action | Expected Approvals | Cumulative Value |
|------|--------|-------------------|------------------|
| 1 | Apply to Tier 1 | 3-4 programs | $10,000 - $50,000 |
| 2 | Apply to Tier 2 | 2-3 programs | $20,000 - $70,000 |
| 3 | Apply to Tier 3 | 1-2 programs | $25,000 - $85,000 |
| 4 | Follow up on pending | 1-2 more | $30,000 - $100,000 |

---

## Acceptance Test

- [ ] `STARTUP_CREDITS_APPLICATIONS.md` generated with all reusable components
- [ ] Company description is 150 words or less
- [ ] Product description is 200 words or less
- [ ] Target customer description is 100 words or less
- [ ] Traction metrics are accurate and up-to-date
- [ ] Application checklist includes all Tier 1 programs
- [ ] Email templates are personalized with product name
- [ ] Credits tracker initialized
- [ ] At least 3 Tier 1 applications submitted
- [ ] Approval tracking in place\n\n