---
name: Compare And Converge Variants
description: Compare multiple workspace variants of the same project, pick the strongest baseline, and merge unique high-value improvements before converging all copies.
argument-hint: Optional: list folder paths, weighting priorities, and strict rules (for example: never delete, prefer docs, prefer shipping speed)
agent: agent
---
You are performing a full multi-variant convergence workflow for the same project.

Use the user input in this chat as constraints and priorities.

## Goal
Identify the best project variant, extract unique valuable improvements from the weaker variants, integrate those improvements into the winner, and then converge all variants to one best state.

## Required Workflow
1. Discover and inventory all project variants currently open in the workspace.
2. Compare variants thoroughly using code, configs, scripts, docs, tests, automation, and git state.
3. Score each variant with a clear rubric and select one winner.
4. Analyze each non-winner for unique, valuable assets not present in the winner.
5. Port only high-value, non-regressive assets into the winner.
6. Validate the upgraded winner (build, tests, lint, key scripts where available).
7. Present the final convergence decision:
   - A) Delete non-winner variants
   - B) Replace non-winner variants with the upgraded winner

## Scoring Rubric (0-5 each)
- Feature completeness and sophistication
- Code quality and maintainability
- Reliability signals (tests, validation scripts, CI readiness)
- Security and operational readiness
- Documentation quality and clarity
- Delivery readiness (can ship quickly with low risk)

Provide weighted scoring if the user supplies priorities; otherwise use equal weighting.

## Porting Rules
- Port only changes that are both unique and beneficial.
- Reject changes that add risk, regress behavior, duplicate existing functionality, or conflict with project conventions.
- Keep the winner's architecture unless a non-winner improvement is clearly superior.
- If two non-winners have overlapping improvements, choose the cleaner implementation.

## Safety Rules
- Never perform destructive actions (delete folders, overwrite entire variants) until the user confirms A or B.
- Show a short dry-run summary before any destructive step.

## Output Format
Use this exact section order:

1. Variant Inventory
2. Comparative Scorecard
3. Winner Selection (with rationale)
4. Unique Value Found In Non-Winners
5. Port Decisions (port or reject with reason)
6. Validation Results
7. Convergence Options (A delete or B sync)
8. Final Execution Summary

Be decisive, evidence-based, and focused on reaching one best canonical version.
