const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const {
  CANONICAL_COMMANDS,
  diffCommands,
  extractCharterSubcommands,
  extractSkillSubcommands,
  getCanonicalSlashCommands,
} = require('../scripts/atlas/command-registry');

test('command registry exposes the four-command autonomous surface', () => {
  assert.equal(CANONICAL_COMMANDS.length, 4);
  assert.deepEqual(getCanonicalSlashCommands(), [
    '/atlas',
    '/atlas status',
    '/atlas pause',
    '/atlas doctor',
  ]);
});

test('command registry matches SKILL.md and CHARTER.md', () => {
  const expected = getCanonicalSlashCommands();
  const skill = fs.readFileSync(path.join(ROOT, 'SKILL.md'), 'utf8');
  const charter = fs.readFileSync(path.join(ROOT, 'CHARTER.md'), 'utf8');
  const skillDiff = diffCommands(extractSkillSubcommands(skill), expected);
  const charterDiff = diffCommands(extractCharterSubcommands(charter), expected);

  assert.deepEqual(skillDiff, { missing: [], extra: [] });
  assert.deepEqual(charterDiff, { missing: [], extra: [] });
});
