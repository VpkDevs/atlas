# Autonomous Command Surface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce Atlas's founder-facing command surface to `/atlas`, `/atlas status`, `/atlas pause`, and `/atlas doctor`.

**Architecture:** `command-registry.js` remains the sole machine-readable source of truth. The kernel and charter mirror that registry, while removed commands become internal routing behavior automatically selected by `/atlas`.

**Tech Stack:** Node.js built-in test runner, CommonJS, Markdown documentation.

## Global Constraints

- `/atlas` is the only operational entry point and runs integrity checks internally.
- `/atlas status` and `/atlas doctor` are read-only.
- `/atlas pause` records paused state and may not initiate external actions.
- No new dependencies.

---

### Task 1: Define the four-command registry

**Files:**
- Modify: `skills/Atlas/scripts/atlas/command-registry.js`
- Test: `skills/Atlas/tests/command-registry.test.js`

**Interfaces:**
- Produces: `CANONICAL_COMMANDS` containing exactly `/atlas`, `/atlas status`, `/atlas pause`, and `/atlas doctor`.

- [ ] Write a failing test that asserts the four exact commands.
- [ ] Run `node --test tests/command-registry.test.js` and confirm it fails.
- [ ] Replace `CANONICAL_COMMANDS` with `/atlas`, `/atlas status`, `/atlas pause`, and `/atlas doctor`.
- [ ] Run `node --test tests/command-registry.test.js` and confirm it passes.

### Task 2: Align the kernel and charter

**Files:**
- Modify: `skills/Atlas/SKILL.md`
- Modify: `skills/Atlas/CHARTER.md`

**Interfaces:**
- Consumes: the four registry entries from Task 1.
- Produces: documentation whose extracted command surfaces exactly match the registry.

- [ ] Replace the subcommand tables with the four public commands.
- [ ] State that former granular commands are internal routing behavior selected by `/atlas`.
- [ ] Define pause as a persisted safe stop that starts no new external action.
- [ ] Run `node scripts/validate.js` and confirm command-surface parity.

### Task 3: Verify the final package

**Files:**
- Test: `skills/Atlas/tests/command-registry.test.js`

- [ ] Run `node --test tests/command-registry.test.js`.
- [ ] Run `npm test && npm run validate && npm run doctor:strict`.
- [ ] Run `git diff --cached --check && git diff --cached --stat`.
- [ ] Commit the focused Atlas and runtime-hygiene changes.
