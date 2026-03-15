---
description: "Phase implementation workflow – scaffold, code, test, validate, and gate-check with iterative loops until passing"
---

# /implement-phase – Phase Implementation Workflow

Drives the implementation of a specific delivery phase (0–4) through scaffolding, coding, testing, and acceptance gate with iterative loops.

## Prerequisites
- All artifact packs are Locked (cross-pack validation passed)
- Target phase dependencies are satisfied (previous phase gate passed)
- `.agents/references/module-registry.md` identifies which modules belong to which phase

---

## Execution Steps

### Step 1: Phase Scope Identification
1. Read `.agents/references/module-registry.md` to identify modules in this phase
2. Read `.agents/guardrails/phase-boundary.md` to confirm scope constraints
3. Read relevant pack artifacts for design specifications:
   - Schema from `docs/03-data-and-rules/database-schema.md`
   - API contracts from `docs/06-delivery-engineering/api-contracts.md`
   - Screen specs from `docs/04-ux-frontend/screen-registry.md`
   - RBAC from `docs/05-security-access/rbac-matrix.md`
   - Tests from `docs/07-governance-qa/e2e-test-scenarios.md`

### Step 2: Scaffold
// turbo
4. Create backend module directories per `docs/06-delivery-engineering/monorepo-structure.md`
5. Create file stubs per module pattern:
   - `[module].controller.ts`
   - `[module].service.ts`
   - `[module].repository.ts`
   - `[module].validator.ts`
   - `[module].types.ts`
   - `[module].events.ts`
   - `[module].test.ts`
6. Create frontend route pages per `docs/06-delivery-engineering/frontend-scaffolding.md`
7. Create/update Prisma schema for phase entities

### Step 3: Implement (per module)
8. For EACH module in the phase:
   a. Implement repository layer (Prisma queries with tenant scoping)
   b. Implement service layer (business logic, validation, events)
   c. Implement controller layer (routes, request/response handling)
   d. Implement validator schemas (Zod)
   e. Implement frontend pages and components
   f. **GUARDRAIL CHECK** after each module:
      - `.agents/guardrails/tenant-boundary.md` — scoping enforced?
      - `.agents/guardrails/audit-completeness.md` — mutations logged?
      - `.agents/guardrails/financial-precision.md` — (if financial module)
      - `.agents/guardrails/no-freestyle.md` — only spec'd features?

### Step 4: Test Loop
// turbo
9. **LOOP** (max 5 iterations):
   a. Run TypeScript compilation (`tsc --noEmit`)
   b. Run linting (`eslint`)
   c. Run unit tests (`vitest run`)
   d. Run integration tests (API endpoint tests)
   e. Run RBAC tests (role × endpoint verification)
   f. Run tenant isolation tests
   g. IF all pass: EXIT loop
   h. IF failures:
      - Analyze error output
      - Fix code
      - Re-run failed tests only
   i. **Convergence check**: same failures for 2 iterations → need different approach
   j. IF stalled: escalate with error details

### Step 5: Phase Gate Check
10. Run the phase-specific acceptance from `docs/07-governance-qa/definition-of-done.md`
11. Run regression suite for ALL previous phases
12. Verify:
    - [ ] All features in scope are implemented
    - [ ] All unit tests pass
    - [ ] All integration tests pass
    - [ ] RBAC enforcement verified
    - [ ] Tenant isolation verified
    - [ ] Audit logging confirmed
    - [ ] No Phase N+1 features included

### Step 6: Submission
13. IF gate passes: Present phase deliverables for user review
14. IF gate fails: Fix → Re-run gate check → Loop (max 3 iterations)
15. User approves → Lock phase → Proceed to next phase
