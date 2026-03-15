---
name: "Change Control Guardrail"
description: "Locked artifacts cannot be modified without a formal change request process. Version tracking is required."
---

# Change Control Guardrail

## Rule
**Once an artifact pack is marked as `Locked` in `docs/orchestrator-status.md`, it cannot be modified without a formal change request, impact analysis, and user approval.**

---

## Artifact Lifecycle

```
Not Started → In Progress → Under Review → Approved → Locked
```

| Status | Can Modify? | Condition |
|--------|:-:|-----------|
| Not Started | ✅ | Agent has not started producing |
| In Progress | ✅ | Agent is actively producing |
| Under Review | ✅ | User may request changes during review |
| Approved | ⚠️ | Only via change request + re-approval |
| Locked | ❌ | Only via formal change request process |

---

## Change Request Process

### Step 1: Identify the Change
```markdown
## Change Request: [CR-NNN]
- **Requested by**: [user/agent]
- **Date**: [YYYY-MM-DD]
- **Affected pack(s)**: [list]
- **Affected artifact(s)**: [specific files]
- **Reason**: [why the change is needed]
- **Change description**: [what specifically changes]
```

### Step 2: Impact Analysis
Before approving, assess downstream impacts:
- [ ] Which other packs reference the artifact being changed?
- [ ] Does this change invalidate any approved artifacts?
- [ ] Does this change affect the database schema?
- [ ] Does this change affect API contracts?
- [ ] Does this change require UI updates?
- [ ] Does this change affect test scenarios?
- [ ] What is the re-work effort?

### Step 3: Cascade Updates
If the change is approved:
1. Update the source artifact
2. Identify ALL downstream artifacts that reference changed content
3. Update each downstream artifact
4. Re-run quality gate on ALL affected packs
5. Re-run cross-pack validation
6. User re-approves affected packs

### Step 4: Version Tracking
Maintain a change log at the top of modified artifacts:
```markdown
## Change History
| Version | Date | CR | Change Description |
|---------|------|----|--------------------|
| 1.0 | 2026-03-07 | — | Initial version |
| 1.1 | 2026-03-08 | CR-001 | Added SLA fields to ticket schema |
```

---

## Pack Status After Change

| Scenario | Source Pack Status | Downstream Pack Status |
|----------|:-:|:-:|
| Source pack modified | → Under Review | → Under Review (all downstream) |
| Downstream inconsistency found | Source stays Locked | → Under Review (specific pack) |
| Cosmetic/typo fix only | Stays Locked | No change |

---

## Emergency Override

In rare cases where a critical defect is found in production:
1. Document the emergency with severity justification
2. Apply the minimum fix needed
3. Create a change request retroactively
4. Run regression checks within 24 hours
5. User acknowledges the override

---

## Enforcement Points
- Master Orchestrator: Checks `orchestrator-status.md` before any modifications
- All agents: Must verify pack status before modifying any artifact
- Cross-pack validation: Detects inconsistencies caused by undocumented changes
