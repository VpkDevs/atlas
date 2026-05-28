#!/usr/bin/env node
// Atlas v8.1 - Anti-Hallucination Validator
// Multi-check validation before generating content

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

class AntiHallucinationValidator {
  constructor(portfolioPath, slug) {
    this.portfolioPath = portfolioPath;
    this.slug = slug;
    this.contextPath = path.join(portfolioPath, slug, 'context.json');
    this.credentialsPath = path.join(portfolioPath, slug, 'credentials_index.json');
  }

  // Load and validate context.json
  loadContext() {
    if (!fs.existsSync(this.contextPath)) {
      throw new Error(`Context file not found: ${this.contextPath}`);
    }

    try {
      const context = JSON.parse(fs.readFileSync(this.contextPath, 'utf8'));
      return context;
    } catch (e) {
      // Try backup
      const backupPath = this.contextPath + '.bak';
      if (fs.existsSync(backupPath)) {
        console.warn('⚠️ Primary context corrupted, loading from backup');
        return JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      }
      throw new Error(`Context file corrupted and no backup: ${e.message}`);
    }
  }

  // Verify product name matches across all artifacts
  async verifyProductName(generatedContent) {
    const context = this.loadContext();
    const officialName = context.product?.name;

    if (!officialName) {
      return {
        valid: false,
        error: 'Product name not set in context.json'
      };
    }

    // Check if generated content uses the correct product name
    const nameRegex = new RegExp(officialName, 'gi');
    const matches = generatedContent.match(nameRegex);

    // Check for common variations that might indicate hallucination
    const suspiciousPatterns = [
      /\[Product Name\]/gi,
      /\[Your Product\]/gi,
      /\[TODO: name\]/gi,
      /YourApp/gi,
      /MyProduct/gi
    ];

    const suspiciousMatches = suspiciousPatterns.some(pattern => 
      pattern.test(generatedContent)
    );

    return {
      valid: matches && matches.length > 0 && !suspiciousMatches,
      officialName,
      foundInContent: matches ? matches.length : 0,
      suspiciousPlaceholders: suspiciousMatches
    };
  }

  // Verify production URL is live
  async verifyProductionUrl() {
    const context = this.loadContext();
    const url = context.product?.production_url;

    if (!url || url === 'null' || url === 'UNKNOWN') {
      return {
        valid: false,
        url: null,
        status: 'NOT_SET'
      };
    }

    return new Promise((resolve) => {
      const protocol = url.startsWith('https') ? https : http;
      const startTime = Date.now();

      const req = protocol.get(url, (res) => {
        const latency = Date.now() - startTime;
        resolve({
          valid: res.statusCode >= 200 && res.statusCode < 400,
          url,
          status: res.statusCode,
          latency,
          message: `${res.statusCode} in ${latency}ms`
        });
      });

      req.on('error', (e) => {
        resolve({
          valid: false,
          url,
          status: 'ERROR',
          message: e.message
        });
      });

      req.setTimeout(5000, () => {
        req.destroy();
        resolve({
          valid: false,
          url,
          status: 'TIMEOUT',
          message: 'Request timeout after 5s'
        });
      });
    });
  }

  // Verify sovereign score is accurate
  verifySovereignScore() {
    const context = this.loadContext();
    const score = context.product?.runs_itself_score;

    if (typeof score !== 'number') {
      return {
        valid: false,
        score: null,
        error: 'Score not set or invalid type'
      };
    }

    if (score < 0 || score > 100) {
      return {
        valid: false,
        score,
        error: 'Score out of valid range (0-100)'
      };
    }

    return {
      valid: true,
      score,
      lastUpdated: context.product?.score_last_updated || 'UNKNOWN'
    };
  }

  // Verify API credentials match what's referenced
  verifyCredentials(referencedKeys) {
    if (!fs.existsSync(this.credentialsPath)) {
      return {
        valid: false,
        error: 'credentials_index.json not found'
      };
    }

    const credentials = JSON.parse(fs.readFileSync(this.credentialsPath, 'utf8'));
    const results = {};

    for (const key of referencedKeys) {
      results[key] = {
        exists: key in credentials,
        confirmed: credentials[key]?.confirmed || false,
        lastChecked: credentials[key]?.last_checked || null
      };
    }

    return {
      valid: true,
      credentials: results
    };
  }

  // Verify git state
  verifyGitState() {
    const { execSync } = require('child_process');

    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      const lastCommit = execSync('git log --oneline -1', { encoding: 'utf8' }).trim();
      const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      const remote = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();

      return {
        valid: true,
        clean: status.trim() === '',
        uncommittedFiles: status.split('\n').filter(l => l.trim()).length,
        lastCommit,
        branch,
        remote
      };
    } catch (e) {
      return {
        valid: false,
        error: e.message
      };
    }
  }

  // Run all validations
  async runAll(options = {}) {
    const results = {
      timestamp: new Date().toISOString(),
      slug: this.slug,
      checks: {}
    };

    // Product name check
    if (options.generatedContent) {
      results.checks.productName = await this.verifyProductName(options.generatedContent);
    }

    // Production URL check
    results.checks.productionUrl = await this.verifyProductionUrl();

    // Sovereign score check
    results.checks.sovereignScore = this.verifySovereignScore();

    // Credentials check
    if (options.referencedKeys) {
      results.checks.credentials = this.verifyCredentials(options.referencedKeys);
    }

    // Git state check
    results.checks.gitState = this.verifyGitState();

    // Overall validity
    results.valid = Object.values(results.checks).every(check => check.valid !== false);

    return results;
  }

  // Format results for display
  formatResults(results) {
    let output = '═══════════════════════════════════════════════\n';
    output += 'ANTI-HALLUCINATION VALIDATION REPORT\n';
    output += `Timestamp: ${results.timestamp}\n`;
    output += `Project: ${results.slug}\n`;
    output += '═══════════════════════════════════════════════\n\n';

    for (const [checkName, checkResult] of Object.entries(results.checks)) {
      const icon = checkResult.valid === false ? '❌' : checkResult.valid === true ? '✅' : '⚠️';
      output += `${icon} ${checkName.toUpperCase()}\n`;

      if (checkResult.error) {
        output += `   Error: ${checkResult.error}\n`;
      } else {
        for (const [key, value] of Object.entries(checkResult)) {
          if (key !== 'valid' && typeof value !== 'object') {
            output += `   ${key}: ${value}\n`;
          }
        }
      }
      output += '\n';
    }

    output += '═══════════════════════════════════════════════\n';
    output += `OVERALL: ${results.valid ? '✅ VALID' : '❌ VALIDATION FAILED'}\n`;
    output += '═══════════════════════════════════════════════\n';

    return output;
  }
}

module.exports = AntiHallucinationValidator;

// CLI usage
if (require.main === module) {
  const portfolioPath = process.argv[2] || path.join(require('os').homedir(), '.atlas', 'portfolio');
  const slug = process.argv[3];

  if (!slug) {
    console.error('Usage: node anti-hallucination-validator.js <portfolio-path> <slug>');
    process.exit(1);
  }

  const validator = new AntiHallucinationValidator(portfolioPath, slug);

  validator.runAll().then(results => {
    console.log(validator.formatResults(results));
    process.exit(results.valid ? 0 : 1);
  }).catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}
