---
name: Pre-Convergence Audit
description: Audit multiple workspace variants without making changes; produces a go/no-go recommendation and actionable findings.
argument-hint: Optional: list folder paths or weighting priorities for scoring
agent: agent
---
You are performing a read-only audit of project variants before convergence.

Use the user input in this chat as constraints and priorities (if any).

## Goal
Analyze all variants, score them, identify unique improvements, and deliver a clear go/no-go recommendation—**without making any changes**.

## Required Workflow
1. Discover and inventory all project variants currently open in the workspace.
2. Compare variants thoroughly using code, configs, scripts, docs, tests, automation, and git state.
3. Score each variant with a clear rubric.
4. Analyze each non-winner for unique, valuable assets.
5. Identify risk factors and blockers (missing tests, failing builds, security issues, undocumented config).
6. Produce a single go/no-go recommendation for convergence.

## Scoring Rubric (0-5 each)
- Feature completeness and sophistication
- Code quality and maintainability
- Reliability signals (tests, validation scripts, CI readiness)
- Security and operational readiness
- Documentation quality and clarity
- Delivery readiness (can ship quickly with low risk)

**Default Weighting (unless user specifies):**
- Delivery readiness: 2x
- Architectural sophistication: 2x
- Everything else: 1x

## Risk Assessment
Flag any of these as blocking issues:
- Build or test failures
- Security vulnerabilities or deprecated dependencies
- Missing documentation for critical features
- Conflicting configurations across variants
- Code quality issues that prevent safe porting

## Output Format

1. **Variant Inventory** — list all discovered variants
2. **Comparative Scorecard** — scores for each variant
3. **Winner Recommendation** — best candidate with rationale
4. **Unique Value Found** — improvements in non-winners worth porting
5. **Risk Summary** — blockers or concerns
6. **Go/No-Go Recommendation** — clear guidance on whether convergence is safe
7. **If No-Go** — explain which issues must be resolved first
8. **If Go** — outline the next steps (use `/compare-and-converge-variants` to proceed)

**No changes are made during this audit.** If you want to proceed with convergence after audit, explicitly invoke `/compare-and-converge-variants`.
