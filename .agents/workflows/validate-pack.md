---
description: "Single-pack quality validation – runs artifact quality gate and guardrail compliance checks on one pack"
---

# /validate-pack – Single Pack Quality Validation

Validates a single artifact pack for completeness, formatting, traceability, and guardrail compliance before submitting for user review.

## Prerequisites
- The target pack's artifacts exist in the appropriate `docs/` directory
- The agent prompt for the pack exists in `.agents/`
- Skills and guardrails directories are populated

---

## Execution Steps

### Step 1: Identify the Pack
1. Determine which pack to validate (01 through 07)
2. Read the corresponding agent prompt from `.agents/` to know expected artifacts and their structure

### Step 2: Run Artifact Quality Gate
// turbo
3. Read `.agents/skills/artifact-quality-gate.md` for full instructions
4. For EACH artifact in the pack, run all 7 quality checks (QG-1 through QG-7):
   - QG-1: Completeness — all required sections present
   - QG-2: No placeholders — no TODO, TBD, or ellipsis stubs
   - QG-3: Traceability IDs — proper ID formats used
   - QG-4: Formatting — valid markdown, tables, Mermaid diagrams
   - QG-5: Cross-references — links point to real files
   - QG-6: Business rule coverage — edge cases documented
   - QG-7: Philippine ISP realism — local context considered

### Step 3: Run Guardrail Checks
// turbo
5. Read `.agents/guardrails/no-freestyle.md` — verify no invented modules/features
6. Read `.agents/guardrails/deterministic-output.md` — verify naming consistency
7. Read `.agents/guardrails/phase-boundary.md` — verify phase scope respected
8. For financial packs (03, 06): also check `.agents/guardrails/financial-precision.md`
9. For data/security packs (03, 05): also check `.agents/guardrails/tenant-boundary.md`
10. For all packs: check `.agents/guardrails/audit-completeness.md` where relevant

### Step 4: Fix-and-Retry Loop
11. Read `.agents/skills/iterative-refinement.md` for loop pattern
12. **LOOP** (max 3 iterations):
    - IF any quality gate check failed:
      - Fix the identified issue in the artifact
      - Re-run ONLY the failed check
      - Log the fix in the iteration tracker
    - IF all checks pass: EXIT loop
    - IF max iterations reached: Compile remaining failures into report
13. Produce validation summary

### Step 5: Report
14. Output a validation report:
```markdown
## Pack [NN] Validation Report
- **Artifacts checked**: [N]
- **Quality gate checks**: [N passed] / [N total]
- **Guardrail checks**: [N passed] / [N total]
- **Iterations needed**: [N]
- **Status**: ✅ PASSED / ❌ FAILED (with details)
```

### Step 6: Decision
15. IF PASSED: Update `docs/orchestrator-status.md` to "Under Review" → submit for user review
16. IF FAILED: Present failure report to user with recommended fixes
