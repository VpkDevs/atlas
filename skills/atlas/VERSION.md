---
name: version
description: Atlas version compatibility note; CHARTER.md is authoritative.
---

# Atlas Version Note

**Current canonical version:** `v0.9.1`
**Canonical authority:** [CHARTER.md](CHARTER.md)
**Last Updated:** 2026-07-12

This file is a compatibility pointer for older docs and tools that expect `VERSION.md` to exist. The active track uses `CHARTER.md` as the single source of truth for version, command surface, canonical files, and hygiene policy. Validators derive the canonical version from `package.json`.

If `VERSION.md` and `CHARTER.md` ever disagree, treat `CHARTER.md` as authoritative and update this file.

## The v0.x Renumbering

All releases previously labeled v1–v8.4 were retroactively renumbered to v0.1–v0.8.4 on 2026-07-12. **v1.0 is reserved for the first commercial release** — the eight-gate criteria live in `CHARTER.md` ("The Road to v1.0"). Original labels appear in parentheses below.

## Version History

| Version | Original label | Status | Notes |
|---|---|---|---|
| v0.6.x | v6.x | Historical | Static scoring and early operating model |
| v0.7.0 | v7.0 | Historical | Federated routing and expanded modules |
| v0.7.2 | v7.2 | Historical | Decision-tree priorities and large kernel surface |
| v0.8.0 | v8.0 | Historical | Kernel-first skill, Doctor, First Ship, Hygiene, v7.x archive triage |
| v0.8.1–v0.8.3 | v8.1–v8.3 | Historical planning | Aspirational docs retained in git history, not runtime doctrine |
| v0.8.4 | v8.4 | Historical | Coherent canonical package, install propagation contract, drift validation |
| v0.9 | — | Historical | Leverage Mandate, Heartbeat, hosted Sovereign Dashboard, Evidence Doctrine, Fleet-made-real, de-versioned plumbing |
| **v0.9.1** | — | **Current** | User interview engine, authorized DAST protocol, edge deployment guidance, and capital-generation posture |
| v1.0 | — | Reserved | First commercial release; gated by CHARTER.md Road to v1.0 |
