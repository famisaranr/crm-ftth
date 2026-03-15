---
name: "Iterative Refinement"
description: "Generic loop-until-done pattern with convergence criteria, max iterations, progress tracking, and escalation protocol"
---

# Iterative Refinement Skill

## Purpose
Provide a reusable loop pattern that any agent or workflow can invoke to repeatedly refine output until it meets all quality criteria. This is the **core looping engine** that powers the 100% assurance guarantee.

---

## When to Invoke
- Any time an agent produces output that must meet specific criteria
- At every review gate in the orchestration workflow
- During implementation when tests must pass
- When cross-pack validation finds discrepancies

---

## Loop Architecture

```
┌─────────────────────────────────┐
│         INITIALIZE              │
│  • Define success criteria      │
│  • Set max_iterations           │
│  • Set iteration = 0            │
│  • Initialize change_log = []   │
└─────────────┬───────────────────┘
              ▼
┌─────────────────────────────────┐
│         EXECUTE                 │
│  • Agent produces/refines output│
│  • iteration += 1              │
└─────────────┬───────────────────┘
              ▼
┌─────────────────────────────────┐
│         EVALUATE                │
│  • Run all success criteria     │
│  • Count pass/fail              │
│  • Record in change_log         │
└─────────────┬───────────────────┘
              ▼
         ┌────┴────┐
         │All pass? │
         └────┬────┘
        YES   │   NO
         ▼    │    ▼
    ┌────────┐│┌──────────────────┐
    │CONVERGE││ │CHECK iteration   │
    │  EXIT  │││  < max_iters?    │
    └────────┘│└────────┬─────────┘
              │    YES  │   NO
              │     ▼   │    ▼
              │┌────────┐│┌──────────┐
              ││DIAGNOSE│││ESCALATE  │
              ││& FIX   ││ to USER  │
              │└───┬────┘│└──────────┘
              │    │     │
              │    ▼     │
              │  GO TO   │
              │  EXECUTE │
              └──────────┘
```

---

## Configuration Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `max_iterations` | Maximum loop cycles before escalation | 5 |
| `success_criteria` | List of check functions that must ALL pass | (caller-defined) |
| `convergence_check` | Detect if progress is stalling | YES |
| `stall_threshold` | Same failure count for N iterations = stalled | 2 |
| `fix_strategy` | How to address failures: `auto-fix`, `agent-refine`, `user-input` | `agent-refine` |
| `escalation_target` | Who to notify on max iterations | `user` |

---

## Usage Patterns

### Pattern A: Review Gate Loop
```markdown
LOOP_CONFIG:
  max_iterations: 3
  success_criteria:
    - artifact-quality-gate PASSES
    - all sections complete
    - no TODOs/TBDs remaining
  fix_strategy: agent-refine

LOOP:
  1. Agent produces artifact pack
  2. Run artifact-quality-gate skill
  3. IF all pass → submit for user review
  4. IF fail → agent fixes identified issues → GO TO step 2
  5. IF max_iterations reached → submit with quality report + known issues
```

### Pattern B: Cross-Pack Validation Loop
```markdown
LOOP_CONFIG:
  max_iterations: 5
  success_criteria:
    - cross-pack-validation skill ALL 10 checks pass
  fix_strategy: agent-refine (identify owning agent per failure)

LOOP:
  1. Run cross-pack-validation skill
  2. IF all 10 checks pass → produce final report → submit
  3. IF failures → identify owning agent for each failure
  4. Re-invoke owning agent with specific fix request
  5. GO TO step 1
```

### Pattern C: Implementation Verification Loop
```markdown
LOOP_CONFIG:
  max_iterations: 5
  success_criteria:
    - TypeScript compiles with zero errors
    - All unit tests pass
    - All integration tests pass
    - RBAC tests pass for all 12 roles
    - Tenant isolation tests pass
  fix_strategy: auto-fix (code changes)

LOOP:
  1. Run build + tests
  2. IF all pass → proceed to next module
  3. IF failures → analyze error output
  4. Fix code → GO TO step 1
```

### Pattern D: User Feedback Loop
```markdown
LOOP_CONFIG:
  max_iterations: 10
  success_criteria:
    - User approves the artifact
  fix_strategy: user-input

LOOP:
  1. Submit artifact for user review
  2. IF user approves → LOCK artifact → proceed
  3. IF user requests changes → parse feedback
  4. Apply changes to artifact
  5. GO TO step 1
```

---

## Progress Tracking

Each iteration must log:
```markdown
### Iteration [N] of [max]
- **Timestamp**: [datetime]
- **Checks run**: [N]
- **Passed**: [N] | **Failed**: [N]
- **New passes since last iteration**: [N]
- **Stall detected**: YES/NO
- **Changes made**: [brief description]
- **Remaining failures**: [list]
```

---

## Convergence Detection

```
IF iteration > 1:
  current_failures = count of failed checks
  previous_failures = count from previous iteration
  IF current_failures >= previous_failures for stall_threshold consecutive iterations:
    STATUS = STALLED
    ACTION = escalate to user with:
      - Full failure report
      - Changes attempted
      - Recommendation for manual intervention
  END IF
END IF
```

---

## Escalation Report Format

```markdown
## Iterative Refinement — Escalation Report

**Task**: [what was being refined]
**Iterations completed**: [N] of [max]
**Final status**: STALLED / MAX_ITERATIONS_REACHED

### Remaining Failures
| # | Check | Failure Detail | Fix Attempted | Result |
|---|-------|---------------|---------------|--------|
| 1 | ... | ... | ... | Still failing |

### Recommendation
[Specific guidance on what needs human decision/intervention]
```
