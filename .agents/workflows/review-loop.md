---
description: "Generic review-fix-resubmit iterative loop with change tracking, convergence detection, and max retries"
---

# /review-loop – Review-Fix-Resubmit Loop

A reusable workflow for iterating on any artifact until user approval, with change tracking and convergence detection.

## Prerequisites
- An artifact or set of artifacts exists and needs user review
- `.agents/skills/iterative-refinement.md` is available

---

## Execution Steps

### Step 1: Initialize
1. Set `iteration = 0`
2. Set `max_iterations = 10` (user review loops can take many cycles)
3. Initialize `change_log = []`

### Step 2: Submit for Review
2. Present artifact(s) to user for review
3. Wait for user feedback

### Step 3: Process Feedback
4. IF user says **"Approved"** / **"Looks good"** / **"Proceed"**:
   - Mark artifact status as `Approved`
   - Update `docs/orchestrator-status.md`
   - EXIT loop → proceed to next step in orchestration
5. IF user requests changes:
   - Parse feedback into specific actionable items
   - Log feedback in change_log:
     ```
     Iteration [N]: User requested:
     - [specific change 1]
     - [specific change 2]
     ```

### Step 4: Apply Changes
6. For each requested change:
   a. Identify the specific file and section to modify
   b. Apply the change
   c. Verify the change doesn't break guardrails:
      - Run relevant guardrail checks
      - Run quality gate on modified artifact
   d. Log what was changed

### Step 5: Re-validate
// turbo
7. Run `/validate-pack` on the modified pack
8. IF validation fails: fix issues before re-submitting

### Step 6: Convergence Check
9. `iteration += 1`
10. IF `iteration >= max_iterations`:
    - Compile all changes attempted
    - Present to user: "Reached maximum review iterations. Here's a summary of all changes made. Please advise on how to proceed."
    - EXIT loop
11. IF same feedback received for 3 consecutive iterations:
    - FLAG as potential miscommunication
    - Ask user for clarification: "I've attempted this change [N] times. Could you clarify exactly what you're looking for?"

### Step 7: Re-submit
12. GO TO Step 2

---

## Change Log Format

Maintained as part of the review process:

```markdown
## Review Loop — [Pack/Artifact Name]

### Iteration 1
- **Feedback**: "Add more detail to the subscriber lifecycle states"
- **Changes made**:
  - Added 3 additional state transitions to domain-model.md (lines 45-72)
  - Added state diagram for suspended→churned path
- **Validation**: ✅ Passed

### Iteration 2
- **Feedback**: "Approved"
- **Status**: ✅ APPROVED
```

---

## Integration with Orchestrate

This workflow is invoked at every **REVIEW GATE** in the `/orchestrate` workflow:
```
Step N: Agent produces artifact pack
Step N+1: Run /validate-pack
Step N+2: Run /review-loop
  → User reviews
  → IF changes needed → fix → re-validate → re-submit → LOOP
  → IF approved → proceed to next agent
```
