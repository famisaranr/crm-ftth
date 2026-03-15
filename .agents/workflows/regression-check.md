---
description: "Post-change regression workflow – re-validates affected packs and downstream dependencies after any modification"
---

# /regression-check – Post-Change Regression Validation

After any change to a locked artifact or implemented code, this workflow ensures all affected packs and downstream dependencies remain consistent.

## Prerequisites
- A change has been made (via change request or bug fix)
- The change's impact has been identified

---

## Execution Steps

### Step 1: Identify Change Scope
1. Determine what was changed:
   - Which pack(s) were modified?
   - Which specific artifact(s)?
   - What type of change? (content, schema, API, UI, RBAC, test)

### Step 2: Map Downstream Dependencies
// turbo
2. Using the dependency chain, identify all affected downstream packs:

```
Pack 01 (Product) → Pack 02, 03, 04, 05, 06, 07
Pack 02 (Solution) → Pack 03, 05, 06
Pack 03 (Data) → Pack 04, 05, 06, 07
Pack 04 (UX) → Pack 05, 06, 07
Pack 05 (Security) → Pack 06, 07
Pack 06 (Delivery) → Pack 07
Pack 07 (Governance) → Cross-Pack Validation
```

3. List all packs downstream of the changed pack

### Step 3: Run Targeted Checks
// turbo
4. For the CHANGED pack:
   - Run `/validate-pack` (full quality gate + guardrail checks)
5. For each DOWNSTREAM pack:
   - Run the specific cross-pack checks that involve the changed content:
     - If schema changed → run SC-1 (Entity→API), SC-3 (Schema→Form)
     - If API changed → run Check 3 (API→Tests), SC-2 (API→Screen)
     - If RBAC changed → run Check 2 (Screen→RBAC)
     - If screen changed → run Check 1 (ERD→Screen)
     - If workflow changed → run Check 4 (Workflow→Acceptance)
     - If enum changed → run Check 9 (Enum Consistency)

### Step 4: Fix-and-Retry Loop
6. **LOOP** (max 3 iterations):
   - IF all targeted checks pass: EXIT loop
   - IF any check fails:
     a. Identify the fix needed
     b. Apply fix to the affected artifact
     c. Re-run the failed check
     d. Check if the fix introduces new failures (cascade check)
   - Track iteration count and changes made

### Step 5: Code Regression (if implementation exists)
// turbo
7. IF this phase has implemented code:
   a. Run TypeScript compilation
   b. Run unit tests for affected modules
   c. Run integration tests for affected API endpoints
   d. Run regression test suite for the current phase
   e. Run regression suites for ALL previous (locked) phases
   f. IF any test fails: fix → re-run → loop (max 3 iterations)

### Step 6: Report
8. Produce regression report:
```markdown
## Regression Check Report
> Triggered by: [change description]
> Date: [date]

### Change Scope
- Modified: [pack/artifact]
- Downstream packs checked: [list]

### Results
| Pack | Check | Before | After | Status |
|------|-------|--------|-------|:------:|
| 03 | Schema→API | ✅ | ✅ | ✅ OK |
| 06 | API→Tests | ✅ | ❌→✅ | ⚠️ Fixed |

### Code Regression
- Compilation: ✅
- Unit tests: ✅ [N] passed
- Integration tests: ✅ [N] passed
- Phase regression: ✅ [N] passed

### Overall: ✅ REGRESSION PASSED / ❌ REGRESSION FAILED
```

### Step 7: Status Update
9. IF all passed: Mark affected packs as re-approved
10. IF failures remain: Present to user for decision (accept risk or continue fixing)
