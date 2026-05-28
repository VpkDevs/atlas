---
name: atlas-startup-credits
description: The Startup Credits Sprint — systematic application to 15+ startup programs that provide $50K-$200K in free infrastructure credits. Loaded in Business Setup (Phase 6). Atlas applies to all qualifying programs automatically with pre-filled applications.
---

# Startup Credits Sprint

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
- [ ] Approval tracking in place
