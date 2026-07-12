const CANONICAL_COMMANDS = [
  { slash: '/atlas', description: 'Auto-detect mode' },
  { slash: '/atlas doctor', description: 'Integrity check', cli: 'doctor' },
  { slash: '/atlas ship', description: 'Force First Ship Mode', module: 'first-ship.md' },
  { slash: '/atlas status', description: 'Print dashboard', cli: 'status' },
  { slash: '/atlas resume', description: 'Resume at last incomplete phase' },
  { slash: '/atlas diag', description: 'Full health diagnostic', cli: 'diagnose' },
  { slash: '/atlas growth', description: 'Growth Engine tick', module: 'growth-engine.md' },
  { slash: '/atlas money', description: 'Money Engine tick', module: 'money-engine.md' },
  { slash: '/atlas pricing', description: 'Pricing Lab cycle', module: 'pricing-lab.md' },
  { slash: '/atlas offer', description: 'Offer Forge cycle', module: 'offer-forge.md' },
  { slash: '/atlas channels', description: 'Channel allocation rebalance', module: 'channel-dominance.md' },
  { slash: '/atlas sniper', description: 'Acquisition Sniper mode', module: 'acquisition-sniper.md' },
  { slash: '/atlas governor', description: 'Capital Governor', module: 'capital-governor.md' },
  { slash: '/atlas ops', description: 'Operator discipline pass', module: 'operator-playbook.md' },
  { slash: '/atlas funnel', description: 'Acquisition funnel audit', module: 'growth-engine.md' },
  { slash: '/atlas retention', description: 'Churn/reactivation pass', module: 'revenue-intelligence.md' },
  { slash: '/atlas warroom', description: 'Re-enter War Room', module: 'war-room.md' },
  { slash: '/atlas fix [phase]', description: 'Re-run a specific phase' },
  { slash: '/atlas security', description: 'Security audit', module: 'security.md' },
  { slash: '/atlas brand', description: 'Brand engine pass', module: 'brand-engine.md' },
  { slash: '/atlas portfolio', description: 'Force Portfolio Mode', module: 'portfolio.md', cli: 'portfolio list' },
  { slash: '/atlas portfolio-scan', description: 'Recompute portfolio scores', module: 'portfolio-os.md' },
  { slash: '/atlas portfolio-rebalance', description: 'Reassign lanes', module: 'portfolio-os.md', cli: 'portfolio rebalance' },
  { slash: '/atlas portfolio-execute', description: 'Execute primary lane only', module: 'portfolio-os.md' },
  { slash: '/atlas fusion', description: 'Federated skill+agent sprint', module: 'fusion-router.md', cli: 'fusion agents' },
  { slash: '/atlas fusion-report', description: 'Merged intervention report', module: 'fusion-router.md' },
  { slash: '/atlas fleet --agent --task', description: 'Direct sub-agent invocation', module: 'fleet-subagents.md' },
  { slash: '/atlas retire', description: 'Mark project retired' },
];

function getCanonicalSlashCommands() {
  return CANONICAL_COMMANDS.map((command) => command.slash);
}

function uniqueCommands(commands) {
  return [...new Set(commands)].sort();
}

function diffCommands(actual, expected = getCanonicalSlashCommands()) {
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  return {
    missing: expected.filter((command) => !actualSet.has(command)),
    extra: actual.filter((command) => !expectedSet.has(command)),
  };
}

function extractSkillSubcommands(content) {
  return uniqueCommands([...content.matchAll(/^\|\s*`(\/atlas[^`]*)`\s*\|/gm)].map((match) => match[1].trim()));
}

function extractCharterSubcommands(content) {
  const block = content.match(/## Subcommand Surface \(v8\.0\)[\s\S]*?```text\r?\n([\s\S]*?)```/);
  if (!block) return [];
  return uniqueCommands(
    block[1]
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.startsWith('/atlas'))
      .map((line) => line.split(/\s{2,}/)[0].trim())
  );
}

module.exports = {
  CANONICAL_COMMANDS,
  diffCommands,
  extractCharterSubcommands,
  extractSkillSubcommands,
  getCanonicalSlashCommands,
};
