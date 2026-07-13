const CANONICAL_COMMANDS = [
  { slash: '/atlas', description: 'Autonomously start, resume, recover, or operate Atlas' },
  { slash: '/atlas status', description: 'Read-only progress summary', cli: 'status' },
  { slash: '/atlas pause', description: 'Safely pause autonomous work', cli: 'pause' },
  { slash: '/atlas doctor', description: 'Read-only installation diagnostic', cli: 'doctor' },
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
  const block = content.match(/## Subcommand Surface[^\n]*[\s\S]*?```text\r?\n([\s\S]*?)```/);
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
