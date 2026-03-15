---
name: "Spec Traceability"
description: "Maps every requirement from the Master Orchestrator Prompt to its artifact, implementation location, and test coverage"
---

# Spec Traceability Skill

## Purpose
Guarantee 100% requirement coverage by maintaining a bi-directional traceability matrix from spec → artifact → code → test. No requirement may exist without all four links.

---

## When to Invoke
- During cross-pack validation (Step 8)
- When verifying phase gate readiness
- When a change request modifies an existing requirement
- During production readiness assessment

---

## Traceability Chain

```
Master Orchestrator Prompt Section
  → Artifact Document (which pack, which file)
    → Implementation Location (module, file, function)
      → Test Coverage (unit, integration, E2E)
```

---

## Execution Steps

### Step 1: Extract Requirements
Parse the `MASTER ORCHESTRATOR PROMPT` and extract every numbered/bulleted requirement. Group by section:

| Section | Requirement Count |
|---------|------------------|
| 4.1 Multi-Tenancy | ~7 items |
| 4.2 Auditability | ~7 items |
| 4.3 Financial Traceability | ~7 items |
| 4.4 Telecom Traceability | ~12 items |
| 7.x Core Modules | ~100+ items |
| 12 UI/Screen Registry | ~50 screens |
| 13 Workflows | 17 workflows |
| 15 Testing | 10 E2E scenarios |

### Step 2: Map to Artifacts
For each requirement, identify:
- **Primary artifact**: The document that specifies the design
- **Supporting artifacts**: Other docs that reference this requirement
- **Owning agent**: Which specialist agent produced the artifact

### Step 3: Map to Implementation
For each requirement, identify (once code exists):
- **Module**: Backend module directory
- **Service file**: Business logic location
- **Route/Controller**: API endpoint
- **Frontend page**: Screen/component location

### Step 4: Map to Tests
For each requirement, identify:
- **Unit test**: Service/calculation test
- **Integration test**: API endpoint test
- **E2E test**: Workflow scenario test
- **RBAC test**: Permission enforcement test

---

## Output Format

Produce/update `docs/07-governance-qa/spec-compliance-checklist.md`:

```markdown
| Req ID | Spec Section | Requirement | Artifact | Implementation | Test | Status |
|--------|-------------|-------------|----------|---------------|------|--------|
| REQ-MT-001 | 4.1 | Multi-tenancy by barangay | tenant-scoping-rules.md | middleware/scope-guard.ts | tenant-isolation.test.ts | ⬜ |
| REQ-AUD-001 | 4.2 | Every mutation auditable | audit-logging-model.md | audit.service.ts | audit.integration.test.ts | ⬜ |
```

Status values: ⬜ Not Started → 🔵 Designed → 🟡 Implemented → ✅ Tested → 🔒 Verified

---

## Iteration Protocol

```
EXTRACT all requirements from Master Orchestrator Prompt
FOR each requirement:
  CHECK artifact link exists
  CHECK implementation link exists (if in current phase)
  CHECK test link exists (if in current phase)
  IF any link is MISSING:
    FLAG as gap
    IDENTIFY responsible agent/developer
  END IF
END FOR

IF gaps exist:
  PRODUCE gap report with specific missing links
  LOOP: responsible party fills gaps → re-run check
  MAX 3 iterations before escalation to user
END IF
```

---

## Gap Categories

1. **Design Gap**: Requirement has no artifact → invoke appropriate specialist agent
2. **Implementation Gap**: Requirement has artifact but no code → add to backlog
3. **Test Gap**: Requirement has code but no test → add test requirement
4. **Scope Gap**: Requirement references an unapproved module or feature → flag for product review
