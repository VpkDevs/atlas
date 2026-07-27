const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const CLI = path.join(ROOT, 'scripts', 'atlas', 'cli.js');

test('pause persists a safe paused state without external work', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'atlas-pause-'));
  const env = { ...process.env, HOME: home, USERPROFILE: home };

  try {
    execFileSync(process.execPath, [CLI, 'init', 'pause-test'], { env, stdio: 'pipe' });
    execFileSync(process.execPath, [CLI, 'pause', 'pause-test'], { env, stdio: 'pipe' });

    const contextPath = path.join(home, '.atlas', 'portfolio', 'pause-test', 'context.json');
    const state = JSON.parse(fs.readFileSync(contextPath, 'utf8'));
    assert.equal(state.context.mode, 'paused');
    assert.match(state.context.paused_at, /^\d{4}-\d{2}-\d{2}T/);
    assert.equal(state.context.last_activity, state.context.paused_at);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});
