#!/usr/bin/env node
// Atlas v8.1 - Startup Credits Generator
// Automated application to 15+ programs worth $50K-$200K

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
    if (!fs.existsSync(this.contextPath)) {
      throw new Error(`Context file not found: ${this.contextPath}`);
    }
    return JSON.parse(fs.readFileSync(this.contextPath, 'utf8'));
  }

  generateCompanyDescription(context) {
    const { name, category, description, target_customer } = context.product || {};
    const { location } = context.founder || {};

    return `${name || 'Our company'} is a ${category || 'technology'} platform that ${description || 'provides innovative solutions'}. We help ${target_customer || 'businesses'} by providing a solution that runs itself with minimal human intervention. Founded in ${location || 'the US'}, we're building a product that prioritizes automation and founder sovereignty.`;
  }

  generateProductDescription(context) {
    const { name, description, tech_stack, key_features } = context.product || {};

    let desc = `${name || 'Our product'} is built on ${(tech_stack || []).join(', ') || 'modern technologies'} and provides:\n\n`;
    
    if (key_features && key_features.length > 0) {
      key_features.slice(0, 5).forEach(feature => {
        desc += `• ${feature}\n`;
      });
    } else {
      desc += `• Automated workflows\n`;
      desc += `• Self-running operations\n`;
      desc += `• Minimal manual intervention\n`;
    }

    desc += `\nOur product is designed to be self-running, with automated monitoring, error recovery, and customer support workflows.`;

    return desc;
  }

  generateTargetCustomer(context) {
    const { target_customer, pain_points } = context.product || {};

    let desc = `Our target customers are ${target_customer || 'businesses and individuals'}. `;
    
    if (pain_points && pain_points.length > 0) {
      desc += `They currently struggle with: ${pain_points.slice(0, 3).join(', ')}. `;
    }

    desc += `We solve these problems by providing an automated, hands-off solution that works 24/7.`;

    return desc;
  }

  generateTractionMetrics(context) {
    const { production_url, deployment_status } = context.product || {};
    const { mrr, customers } = context.revenue || {};

    let metrics = [];

    if (deployment_status === 'production') {
      metrics.push(`✓ Live in production: ${production_url || 'URL pending'}`);
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
    const { definition_of_success } = context.founder || {};

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
      website: context.product?.production_url || 'In development',
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
    
    const dir = path.dirname(this.outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
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

  try {
    const generator = new StartupCreditsGenerator(portfolioPath, slug);
    const result = generator.generate();

    console.log('✓ Startup credits applications generated');
    console.log(`  Output: ${result.outputPath}`);
    console.log('\nNext steps:');
    console.log('1. Open the generated file');
    console.log('2. Follow the checklist week by week');
    console.log('3. Copy-paste the components into each application');
    console.log('4. Track approvals and credit amounts');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}
