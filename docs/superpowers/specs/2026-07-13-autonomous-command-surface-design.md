# Autonomous Command Surface

## Goal

Make Atlas autonomous by default: a founder normally invokes `/atlas` once and Atlas determines the correct mode, validates its environment, resumes state, and proceeds without further command selection.

## Public Commands

- `/atlas` — the sole operational entry point. It runs internal integrity checks, determines whether to start, resume, recover, or operate, and proceeds automatically.
- `/atlas status` — a read-only progress summary.
- `/atlas pause` — a durable emergency stop. Atlas finishes any non-destructive in-flight write, records paused state, and performs no new external actions.
- `/atlas doctor` — a read-only diagnostic escape hatch for a stuck or inconsistent installation. Atlas also runs its checks internally before normal operation.

All current phase, domain, fleet, dashboard, and portfolio commands become internal routing behavior selected by `/atlas`; they are not founder-facing controls.

## Routing and Safety

`/atlas` retains existing mode detection and automatically invokes the modules formerly exposed by granular commands. `pause` is the only control that alters a run; it must be safe to repeat and cannot trigger deployment, spend, outreach, or other external action. `status` and `doctor` must not mutate project or business state.

## Verification

The canonical command registry, `SKILL.md`, and `CHARTER.md` must declare exactly these four commands. Tests will verify registry uniqueness, documentation parity, and that the internal doctor check remains part of normal `/atlas` startup.
