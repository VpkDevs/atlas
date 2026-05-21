---
name: atlas-context-window
description: Context window management protocol for Atlas multi-phase runs. Loaded automatically during Phase 0. Defines when and how to compress context, refresh critical state from disk, and detect context drift before it causes errors. The single most important reliability improvement for long Atlas runs (14 phases easily reach 200K tokens without this).
---

# Atlas Context Window Protocol

**Loaded:** Phase 0 (Context Load), applied throughout all phases
**Purpose:** Prevent context drift, context exhaustion, and hallucination from stale state during long multi-phase runs.

## The Context Problem

A complete Atlas run across 14 phases involves:
- Full codebase read (Pass 1: 10K–100K tokens)
- Business context interview + confirmation
- Legal documents (ToS + Privacy Policy): ~3K tokens each
- Launch assets (HN post, Reddit posts, Indie Hackers): ~5K tokens total
- launch-sequence.md: ~3K tokens
- Marketing content (30-day calendar): ~10K tokens
- Growth engine tick outputs: ~2K tokens per phase

By Phase 8, a complex project has consumed 150K–200K tokens of context. Without management, Atlas begins:
- Referencing codebase details that have been pushed out of context
- Forgetting userMust items from earlier phases
- Confabulating product details that don't match reality
- Treating stale Phase 2 state as current

**This protocol prevents all of these failures.**

---

## Phase Transition Protocol (Run After Every Phase)

After each phase completes and before the next begins:

```
PROCEDURE context_transition(completed_phase, next_phase):

  1. COMPRESS completed phase:
     Write a 200-word summary of what this phase accomplished to:
     ~/.atlas/portfolio/[slug]/phase_summaries/phase_[N]_summary.md
     
     Summary must include:
     - Key decisions made (3-5 bullet points)
     - Files committed (list)
     - Pending userMust items (list with IDs)
     - Score delta
     - Any anomalies or unexpected findings

  2. REFRESH critical state:
     Re-read ~/.atlas/portfolio/[slug]/context.json (atomic read)
     Re-read ~/.atlas/portfolio/[slug]/credentials_index.json
     Note: you already have the phase summary, not the full phase output

  3. CONTEXT CHECK (before proceeding):
     Can you answer these without guessing?
     - What is the product's production URL?
     - What is the current Sovereign Score?
     - What are the 3 highest-priority pending userMust items?
     - What phase just completed and what did it produce?
     
     If ANY answer is uncertain: re-read the phase summary.
     If the production URL is uncertain: re-run `curl` to verify.
     NEVER proceed with uncertain critical facts.

  4. LOAD next phase module

  5. STATE the context before proceeding:
     "Transitioning to Phase [N]. Current state:
      Product: [name] at [URL] | Score: [X] | Phase [N-1] complete
      Pending human actions: [N] items
      Next phase goal: [one sentence]"
```

---

## Context Compression Triggers

Beyond the standard phase transition, compress context when:

### Token Budget Warning
If conversation has been running for a very long time and responses feel slow:
1. Stop current task
2. Write all current state to disk (context.json, phase_summaries)
3. Explicitly compact context by summarizing the last 5 phase outputs in ~500 words total
4. Continue from the summary rather than the full outputs

### Uncertainty Detection
Atlas detects potential context drift when it catches itself:
- "I believe the product URL is..." (should be confirmed from disk)
- "The email service was..." (should read credentials_index.json)
- "Earlier I fixed..." (should verify from git log, not memory)

**Rule:** If Atlas uses "I believe", "I think", or "I recall" about facts that were established in a prior phase, it must re-read the source before proceeding.

---

## Executable Context Compression Algorithm

```javascript
// ~/.atlas/scripts/context-compressor.js
const fs = require('fs');
const path = require('path');

class ContextCompressor {
  constructor(portfolioPath) {
    this.portfolioPath = portfolioPath;
    this.compressionThreshold = 150000; // tokens
    this.summaryMaxTokens = 500;
  }

  // Estimate token count (rough: 0.75 tokens per character)
  estimateTokens(text) {
    return Math.ceil(text.length * 0.75);
  }

  // Compress phase output to summary
  compressPhase(phaseNumber, phaseOutput) {
    const summary = {
      phase: phaseNumber,
      timestamp: new Date().toISOString(),
      keyDecisions: this.extractDecisions(phaseOutput),
      filesCommitted: this.extractCommittedFiles(phaseOutput),
      pendingActions: this.extractPendingActions(phaseOutput),
      scoreDelta: this.extractScoreDelta(phaseOutput),
      anomalies: this.extractAnomalies(phaseOutput)
    };

    return this.formatSummary(summary);
  }

  extractDecisions(output) {
    // Extract bullet points after "Key Decisions" or "Decisions Made"
    const decisionRegex = /(?:Key Decisions|Decisions Made)[:\s]+((?:[-•*]\s+.+\n?)+)/gi;
    const matches = output.match(decisionRegex);
    if (!matches) return [];
    
    return matches[0]
      .split('\n')
      .filter(line => line.trim().match(/^[-•*]/))
      .map(line => line.replace(/^[-•*]\s+/, '').trim())
      .slice(0, 5); // Top 5 decisions
  }

  extractCommittedFiles(output) {
    // Extract file paths from git commits or file mentions
    const fileRegex = /(?:committed|created|modified):\s*([^\s]+\.[a-z]{2,4})/gi;
    const files = [];
    let match;
    
    while ((match = fileRegex.exec(output)) !== null) {
      files.push(match[1]);
    }
    
    return [...new Set(files)]; // Deduplicate
  }

  extractPendingActions(output) {
    // Extract userMust items
    const actionRegex = /\[um-(\d+)\]:\s*(.+?)(?:\n|$)/gi;
    const actions = [];
    let match;
    
    while ((match = actionRegex.exec(output)) !== null) {
      actions.push({
        id: `um-${match[1]}`,
        label: match[2].trim()
      });
    }
    
    return actions;
  }

  extractScoreDelta(output) {
    // Extract score changes: "Score: 45 → 58 (+13)"
    const scoreRegex = /Score:\s*(\d+)\s*→\s*(\d+)\s*\(([+-]\d+)\)/i;
    const match = output.match(scoreRegex);
    
    if (match) {
      return {
        before: parseInt(match[1]),
        after: parseInt(match[2]),
        delta: parseInt(match[3])
      };
    }
    
    return null;
  }

  extractAnomalies(output) {
    // Extract warnings, errors, or unexpected findings
    const anomalyRegex = /(?:⚠️|❌|WARNING|ERROR|UNEXPECTED)[:\s]+(.+?)(?:\n|$)/gi;
    const anomalies = [];
    let match;
    
    while ((match = anomalyRegex.exec(output)) !== null) {
      anomalies.push(match[1].trim());
    }
    
    return anomalies.slice(0, 3); // Top 3 anomalies
  }

  formatSummary(summary) {
    let text = `# Phase ${summary.phase} Summary\n`;
    text += `Date: ${summary.timestamp}\n\n`;
    
    text += `## Key Decisions\n`;
    summary.keyDecisions.forEach(d => text += `- ${d}\n`);
    
    text += `\n## Files Committed\n`;
    summary.filesCommitted.forEach(f => text += `- ${f}\n`);
    
    if (summary.pendingActions.length > 0) {
      text += `\n## Pending Actions\n`;
      summary.pendingActions.forEach(a => text += `- ${a.id}: ${a.label}\n`);
    }
    
    if (summary.scoreDelta) {
      text += `\n## Score Change\n`;
      text += `${summary.scoreDelta.before} → ${summary.scoreDelta.after} (${summary.scoreDelta.delta >= 0 ? '+' : ''}${summary.scoreDelta.delta})\n`;
    }
    
    if (summary.anomalies.length > 0) {
      text += `\n## Anomalies\n`;
      summary.anomalies.forEach(a => text += `- ${a}\n`);
    }
    
    return text;
  }

  // Main compression routine
  async compress(slug) {
    const summariesDir = path.join(this.portfolioPath, slug, 'phase_summaries');
    const contextFile = path.join(this.portfolioPath, slug, 'context.json');
    
    // Ensure directories exist
    if (!fs.existsSync(summariesDir)) {
      fs.mkdirSync(summariesDir, { recursive: true });
    }
    
    // Read context to determine completed phases
    const context = JSON.parse(fs.readFileSync(contextFile, 'utf8'));
    const completedPhases = context.status?.completed_modules || [];
    
    // Compress each completed phase that doesn't have a summary
    for (const phase of completedPhases) {
      const summaryPath = path.join(summariesDir, `phase_${phase}_summary.md`);
      
      if (!fs.existsSync(summaryPath)) {
        // Phase output would be in conversation history
        // For now, create placeholder - in real implementation,
        // this would extract from actual phase output
        const summary = this.compressPhase(phase, '');
        fs.writeFileSync(summaryPath, summary, 'utf8');
      }
    }
    
    return {
      compressed: completedPhases.length,
      summariesDir
    };
  }

  // Verify critical state from disk
  verifyCriticalState(slug) {
    const contextFile = path.join(this.portfolioPath, slug, 'context.json');
    const context = JSON.parse(fs.readFileSync(contextFile, 'utf8'));
    
    const checks = {
      productionUrl: context.product?.production_url || 'UNKNOWN',
      sovereignScore: context.product?.runs_itself_score || 0,
      completedPhases: context.status?.completed_modules || [],
      pendingActions: context.pending_user_actions || [],
      lastCommit: null,
      urlStatus: null
    };
    
    // Verify git state
    try {
      const { execSync } = require('child_process');
      checks.lastCommit = execSync('git log --oneline -1', { encoding: 'utf8' }).trim();
    } catch (e) {
      checks.lastCommit = 'ERROR: ' + e.message;
    }
    
    // Verify URL if exists
    if (checks.productionUrl !== 'UNKNOWN') {
      try {
        const https = require('https');
        const http = require('http');
        const protocol = checks.productionUrl.startsWith('https') ? https : http;
        
        protocol.get(checks.productionUrl, (res) => {
          checks.urlStatus = res.statusCode;
        }).on('error', (e) => {
          checks.urlStatus = 'ERROR: ' + e.message;
        });
      } catch (e) {
        checks.urlStatus = 'ERROR: ' + e.message;
      }
    }
    
    return checks;
  }
}

module.exports = ContextCompressor;

// CLI usage
if (require.main === module) {
  const portfolioPath = process.argv[2] || path.join(require('os').homedir(), '.atlas', 'portfolio');
  const slug = process.argv[3];
  const action = process.argv[4] || 'compress';
  
  const compressor = new ContextCompressor(portfolioPath);
  
  if (action === 'compress') {
    compressor.compress(slug).then(result => {
      console.log(`✓ Compressed ${result.compressed} phases`);
      console.log(`  Summaries: ${result.summariesDir}`);
    });
  } else if (action === 'verify') {
    const state = compressor.verifyCriticalState(slug);
    console.log('CRITICAL STATE VERIFICATION:');
    console.log(`  Production URL: ${state.productionUrl} (${state.urlStatus || 'not checked'})`);
    console.log(`  Sovereign Score: ${state.sovereignScore}`);
    console.log(`  Completed Phases: ${state.completedPhases.join(', ')}`);
    console.log(`  Pending Actions: ${state.pendingActions.length}`);
    console.log(`  Last Commit: ${state.lastCommit}`);
  }
}
```

**Usage:**
```bash
# Compress all completed phases
node ~/.atlas/scripts/context-compressor.js ~/.atlas/portfolio my-project compress

# Verify critical state
node ~/.atlas/scripts/context-compressor.js ~/.atlas/portfolio my-project verify
```

---

## Critical State Index (Always Readable)

These facts must always be readable from disk, never from memory:

| Fact | Source | Read command |
|------|--------|--------------|
| Production URL | `context.json` → `product.production_url` | `jq .product.production_url ~/.atlas/portfolio/[slug]/context.json` |
| Current score | `context.json` → `product.runs_itself_score` | same |
| Completed phases | `context.json` → `status.completed_modules` | same |
| All credentials | `credentials_index.json` | `cat ~/.atlas/portfolio/[slug]/credentials_index.json` |
| Pending userMust | `context.json` → `pending_user_actions` | same |
| Last commit | git | `git log --oneline -1` |
| Live URL check | curl | `curl -so /dev/null -w "%{http_code}" [URL]` |

**Never answer a question about critical facts from memory.** Always read from source.

---

## Long-Run Checkpoint (Every 4 Phases)

After Phase 4, 8, and 12 — run a full state verification:

```
LONG-RUN CHECKPOINT:

  ✓ Production URL: [curl confirmed value] — [HTTP status]
  ✓ Git status: [N files changed, clean/dirty]
  ✓ Sovereign Score: [X] (from context.json, not from memory)
  ✓ Completed phases: [list from context.json]
  ✓ Pending userMust items: [N] — [list if any BLOCKING ones]
  ✓ credentials_index: [spot check 3 critical keys]
  
  Context health: [Good / Degraded / Uncertain]
  
  [If Degraded or Uncertain:]
  Re-reading context from disk before proceeding.
  [Re-read context.json, credentials_index, last 3 phase summaries]
```

---

## Phase Summary Template

Every phase writes this to `~/.atlas/portfolio/[slug]/phase_summaries/`:

```markdown
# Phase [N]: [Phase Name] — Summary
Date: [ISO timestamp]
Duration: [estimated]

## Accomplished
- [bullet: specific commit / API call / file created]
- [bullet]
- [bullet]

## Score
Previous: [X] → Current: [Y] | Delta: +[Z]
Categories improved: [list]

## Committed Files
- [file path] — [what it is]
- [file path]

## Pending UserMust (open)
- [um-ID]: [label] | blocking Phase [N] | layers attempted: [list]

## Anomalies / Unexpected
- [anything that differed from normal Atlas behavior]

## Next Phase Entry State
Product URL: [URL]
Score: [X]
Key input for next phase: [what Phase N+1 most needs to know]
```

---

## Anti-Hallucination Checks

These checks run at the start of any phase that references product-specific facts:

```bash
# Before writing any product-specific copy (launch assets, legal docs, emails):
# Verify product name
PRODUCT_NAME=$(jq -r '.product.name' ~/.atlas/portfolio/[slug]/context.json)
echo "Confirmed product name: $PRODUCT_NAME"

# Verify URL  
PROD_URL=$(jq -r '.product.production_url' ~/.atlas/portfolio/[slug]/context.json)
if [ "$PROD_URL" != "null" ]; then
  HTTP_CODE=$(curl -so /dev/null -w "%{http_code}" "$PROD_URL")
  echo "Confirmed URL: $PROD_URL ($HTTP_CODE)"
fi

# Verify score
SCORE=$(jq -r '.product.runs_itself_score' ~/.atlas/portfolio/[slug]/context.json)
echo "Confirmed score: $SCORE"
```

If product name in generated copy doesn't match `$PRODUCT_NAME` → stop, correct, continue.

---

## Executable Anti-Hallucination Validator

```javascript
// ~/.atlas/scripts/anti-hallucination-validator.js
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
  });
}
```

**Usage:**
```bash
# Run all validation checks
node ~/.atlas/scripts/anti-hallucination-validator.js ~/.atlas/portfolio my-project

# In Atlas phase transitions
node ~/.atlas/scripts/anti-hallucination-validator.js ~/.atlas/portfolio $SLUG
if [ $? -ne 0 ]; then
  echo "⚠️ Validation failed - re-reading context from disk"
  # Re-read context and retry
fi
```

---

## Recovery From Context Corruption

If Atlas realizes mid-run that it has been working from incorrect assumptions:

```
CONTEXT RECOVERY PROCEDURE:

1. STOP current task immediately
2. Re-read context.json from disk
3. Re-read the last 3 phase summaries from phase_summaries/
4. Compare re-read facts to facts used in current work
5. Identify every output that used incorrect facts
6. For committed files: check git diff for incorrect information
7. For uncommitted work: discard and restart with correct facts
8. Log the drift incident to ~/.atlas/incidents/
9. State: "Context drift detected in [phase]. Re-reading from disk. Corrections made to [files]."
10. Continue from correct state
```

**A context drift that isn't caught = incorrect legal documents, wrong product names in launch copy, broken URLs in marketing assets.** This protocol prevents that.
