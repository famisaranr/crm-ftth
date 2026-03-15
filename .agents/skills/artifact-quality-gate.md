---
name: "Artifact Quality Gate"
description: "Pre-review-gate quality checklist ensuring every artifact is complete, formatted, traceable, and free of placeholders before user review"
---

# Artifact Quality Gate Skill

## Purpose
Every artifact produced by a specialist agent must pass this quality gate BEFORE being submitted for user review. This ensures no incomplete, placeholder-laden, or unformatted documents reach the review gate.

---

## When to Invoke
- After an agent completes its artifact pack
- Before updating `orchestrator-status.md` to "Under Review"
- Before any `REVIEW GATE` step in the orchestration workflow

---

## Quality Checks

### QG-1: Completeness Check
- [ ] All sections defined in the agent prompt are present
- [ ] No empty sections or stub content
- [ ] All tables have data rows (not just headers)
- [ ] All required diagrams (Mermaid) are present and syntactically valid

### QG-2: No Placeholders
- [ ] No `TODO` markers remaining
- [ ] No `TBD` markers remaining
- [ ] No `[placeholder]` or `[fill in]` text
- [ ] No `...` used as content ellipsis (only allowed in code examples)
- [ ] No `*... (all X mapped)*` — these must be fully expanded

### QG-3: Traceability IDs
- [ ] Requirements have traceable IDs (e.g., `BRD-CRM-001`, `PRD-USR-001`)
- [ ] Module IDs follow `MOD-XXX` pattern
- [ ] Screen IDs follow `SCR-XXX-NNN` pattern
- [ ] Entities are consistently named across all references

### QG-4: Formatting Standards
- [ ] Markdown renders correctly (headings, tables, code blocks)
- [ ] Tables align properly and have consistent column counts
- [ ] Mermaid diagrams use valid syntax
- [ ] Links to other artifacts use correct relative paths
- [ ] No orphan headings (heading with no content below)

### QG-5: Cross-Reference Integrity
- [ ] References to other pack's artifacts point to actual files
- [ ] Entity names match those in the data model
- [ ] Role names match the 12 defined roles exactly
- [ ] Module names match the module registry
- [ ] Phase numbers are consistent with phase-strategy.md

### QG-6: Business Rule Coverage
- [ ] Edge cases documented (not ignored with "handle appropriately")
- [ ] Error paths specified (not just happy path)
- [ ] Validation rules are specific (not "validate input")
- [ ] Status transitions are exhaustive (all from/to pairs listed)

### QG-7: Philippine ISP Realism
- [ ] Considers rural connectivity constraints
- [ ] Local payment methods included (GCash, bank transfer, cash)
- [ ] Barangay governance structures reflected
- [ ] Philippine Data Privacy Act (RA 10173) addressed where relevant

---

## Execution Protocol

```
FOR each artifact in the pack:
  RUN checks QG-1 through QG-7
  IF any check FAILS:
    LOG the specific failure with file path and line
    FIX the issue in the artifact
    RE-RUN the failed check
    LOOP until the check passes (max 3 iterations per check)
  END IF
END FOR

IF all checks PASS for all artifacts:
  RETURN "QUALITY GATE PASSED — ready for review"
ELSE:
  RETURN "QUALITY GATE FAILED" with failure report
  DO NOT proceed to review gate
END IF
```

---

## Failure Report Format

```markdown
## Quality Gate Report — [Pack Name]
> Date: [date]

| Artifact | Check | Status | Issue |
|----------|-------|--------|-------|
| brd.md | QG-1 | ❌ FAIL | Section "Constraints" is empty |
| brd.md | QG-2 | ❌ FAIL | Line 45: contains "TBD" |
| prd.md | QG-3 | ⚠️ WARN | 3 user stories missing IDs |

### Required Fixes
1. Complete "Constraints" section in brd.md
2. Replace TBD on line 45 with actual content
3. Add IDs to user stories USR-011, USR-012, USR-013
```
