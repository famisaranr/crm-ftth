---
name: "Cross-Pack Validation"
description: "Systematic consistency checks across all 7 artifact packs to ensure ERD ↔ Screen Registry ↔ RBAC ↔ API ↔ Tests alignment"
---

# Cross-Pack Validation Skill

## Purpose
Verify that all 7 artifact packs are internally consistent and mutually aligned. Every entity, screen, permission, API endpoint, and test must be traceable end-to-end.

---

## When to Invoke
- After all 7 packs are produced (Step 8 of `/orchestrate`)
- When any locked pack receives a change request
- Before final sign-off for any delivery phase

---

## Validation Matrix

Run ALL of the following checks. For each check, produce a **PASS / FAIL + details** row.

### Check 1: ERD → Screen Registry
- Every entity in `docs/03-data-and-rules/erd.md` MUST have at least one screen in `docs/04-ux-frontend/screen-registry.md` that displays or manages it.
- **How**: Extract entity names from ERD. Search Screen Registry for matching `dataSource` or `module` references.
- **Fail condition**: Entity exists in ERD but has no screen referencing it.

### Check 2: Screen Registry → RBAC Matrix
- Every screen in `docs/04-ux-frontend/screen-registry.md` MUST have role access rules in `docs/05-security-access/rbac-matrix.md`.
- **How**: Extract `screenId` list. Verify each appears in the RBAC matrix.
- **Fail condition**: Screen has no RBAC entry.

### Check 3: API Contracts → Test Scenarios
- Every API endpoint in `docs/06-delivery-engineering/api-contracts.md` MUST have at least one test scenario in `docs/07-governance-qa/e2e-test-scenarios.md` or `docs/06-delivery-engineering/testing-strategy.md`.
- **How**: Extract endpoint list (METHOD + PATH). Search test docs for coverage.
- **Fail condition**: Endpoint has zero test references.

### Check 4: Workflows → Acceptance Criteria
- Each of the 17 mandatory workflows MUST have acceptance criteria in `docs/07-governance-qa/acceptance-criteria.md`.
- **How**: Extract workflow IDs from `docs/02-solution-architecture/event-workflow-architecture.md`. Search acceptance criteria.
- **Fail condition**: Workflow has no acceptance criteria.

### Check 5: Modules → Definition of Done
- Every module in `docs/01-product-definition/module-map.md` MUST have a Definition of Done entry in `docs/07-governance-qa/definition-of-done.md`.
- **How**: Extract module IDs. Search DoD document.
- **Fail condition**: Module has no DoD entry.

### Check 6: Phase Boundaries Consistent
- Phase assignments in module-map, phase-strategy, backend-scaffolding, and frontend-scaffolding MUST agree.
- **How**: Cross-reference phase numbers for each module across all 4 documents.
- **Fail condition**: Module assigned to different phases in different documents.

### Check 7: Tenant Scoping Complete
- Every entity with `barangay_id` in the schema MUST have scoping rules in `docs/05-security-access/tenant-scoping-rules.md`.
- **How**: Extract scoped entities from schema. Verify scoping rules exist.
- **Fail condition**: Entity has `barangay_id` but no scoping rule.

### Check 8: Financial Traceability Chain
- Invoice → Payment → Ledger → Settlement chain must be complete.
- **How**: Verify billing-rules.md defines the full chain. Verify settlement-rules.md consumes billing outputs.
- **Fail condition**: Break in the financial data flow.

### Check 9: Enum Consistency
- Status enum values in `database-schema.md` must match those referenced in `screen-registry.md`, `api-contracts.md`, and `e2e-test-scenarios.md`.
- **How**: Extract all enum definitions. Search for mismatched values.
- **Fail condition**: Enum value used in one doc but not defined in schema.

### Check 10: Audit Coverage
- Every mutation listed in `docs/05-security-access/audit-policy.md` must have a corresponding audit log field in `docs/03-data-and-rules/audit-logging-model.md`.
- **How**: Cross-reference sensitive action lists.
- **Fail condition**: Auditable action has no logging model.

---

## Output Format

Produce a report at `docs/cross-pack-validation-report.md`:

```markdown
# Cross-Pack Validation Report
> Generated: [date]

| # | Check | Result | Discrepancies |
|---|-------|--------|---------------|
| 1 | ERD → Screen Registry | ✅ PASS / ❌ FAIL | [list] |
| 2 | Screen → RBAC | ✅ PASS / ❌ FAIL | [list] |
| ... | ... | ... | ... |

## Discrepancy Details
### [Check #]: [Check Name]
- **Missing**: [specific item]
- **Expected in**: [document path]
- **Action required**: [what to fix]
```

---

## Iteration Protocol

If ANY check fails:
1. Identify the owning agent for the missing artifact
2. Log the discrepancy with specific file and line references
3. The orchestrator must re-invoke that agent with the fix request
4. Re-run this validation after fixes
5. **Loop until all 10 checks pass** (max 5 iterations)
6. If not converged after 5 iterations, escalate to user with detailed report
