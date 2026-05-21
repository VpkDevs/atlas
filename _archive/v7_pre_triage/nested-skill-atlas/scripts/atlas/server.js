const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const app = express();
const PORT = 3000;
const STATE_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.atlas');

app.use(cors());
app.use(express.json());

// Get Portfolio Overview
app.get('/api/portfolio', (req, res) => {
  const portfolioDir = path.join(STATE_DIR, 'portfolio');
  const projects = fs.readdirSync(portfolioDir).filter(f => fs.statSync(path.join(portfolioDir, f)).isDirectory());
  
  const data = projects.map(slug => {
    const context = JSON.parse(fs.readFileSync(path.join(portfolioDir, slug, 'context.json'), 'utf8'));
    return {
      slug,
      name: context.project.name,
      mode: context.governance?.capital_mode || 'UNKNOWN',
      score: context.scores.sovereign_score,
      lane: context.context?.lane || 'parked'
    };
  });
  
  res.json(data);
});

// Focus Project
app.post('/api/focus', (req, res) => {
  const { slug } = req.body;
  // Trigger CLI focus command
  execSync(`node scripts/atlas/cli.js portfolio focus ${slug}`);
  res.json({ success: true, focused: slug });
});

// Run Diagnostic
app.post('/api/diagnose', (req, res) => {
  const { slug } = req.body;
  const result = execSync(`node scripts/atlas/cli.js diagnose ${slug}`, { encoding: 'utf8' });
  res.json({ output: result });
});

app.listen(PORT, () => {
  console.log(`Atlas Control Center listening at http://localhost:${PORT}`);
});
