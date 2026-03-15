---
description: "Cross-pack consistency validation – runs all 10 cross-pack checks with iterative fix loop"
---

# /cross-validate – Cross-Pack Consistency Validation

Runs comprehensive consistency checks across all 7 artifact packs to ensure end-to-end alignment of entities, screens, APIs, RBAC, tests, and more.

## Prerequisites
- All 7 packs exist and ideally are Approved
- `.agents/skills/cross-pack-validation.md` exists
- `.agents/skills/iterative-refinement.md` exists

---

## Execution Steps

### Step 1: Load Validation Skill
// turbo
1. Read `.agents/skills/cross-pack-validation.md` for all 10 check definitions
2. Read `.agents/skills/iterative-refinement.md` for loop protocol

### Step 2: Run All 10 Checks
// turbo
3. **Check 1**: ERD → Screen Registry (every entity has a screen)
4. **Check 2**: Screen Registry → RBAC Matrix (every screen has role access)
5. **Check 3**: API Contracts → Test Scenarios (every endpoint has tests)
6. **Check 4**: Workflows → Acceptance Criteria (all 17 workflows covered)
7. **Check 5**: Modules → Definition of Done (every module has DoD)
8. **Check 6**: Phase Boundaries Consistent (phase numbers agree across docs)
9. **Check 7**: Tenant Scoping Complete (all scoped entities have rules)
10. **Check 8**: Financial Traceability Chain (invoice → payment → ledger → settlement)
11. **Check 9**: Enum Consistency (enum values match across all docs)
12. **Check 10**: Audit Coverage (every sensitive action has logging)

### Step 3: Iterative Fix Loop
13. **LOOP** (max 5 iterations):
    - Count PASS / FAIL across all checks
    - IF all 10 PASS: EXIT loop → produce final report
    - IF any FAIL:
      a. Identify the owning agent for each failure
      b. Group failures by agent
      c. For each agent's failures:
         - Re-invoke the agent with specific fix instructions
         - Agent corrects the artifact
      d. Re-run ONLY the failed checks
      e. Log iteration: checks passed, checks still failing, changes made
    - **Convergence check**: If same failures persist for 2 consecutive iterations → STALL detected
    - IF stalled or max iterations reached: escalate to user

### Step 4: Produce Report
14. Write `docs/cross-pack-validation-report.md`:
```markdown
# Cross-Pack Validation Report
> Generated: [date]
> Iterations: [N]

| # | Check | Result | Discrepancies |
|---|-------|:------:|---------------|
| 1 | ERD → Screen Registry | ✅ / ❌ | [details if failed] |
| 2 | Screen → RBAC | ✅ / ❌ | [details] |
... (all 10 checks)

## Overall Status: ✅ ALL CHECKS PASSED / ❌ [N] CHECKS FAILED
```

### Step 5: Decision
15. IF ALL PASS: Update `docs/orchestrator-status.md`: Cross-Pack Validation → "Under Review"
16. Present to user for final approval
17. IF approved: ALL packs → "Locked" status. Ready for Phase 0 implementation.
