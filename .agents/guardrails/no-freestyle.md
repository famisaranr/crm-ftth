---
name: "No Freestyle Guardrail"
description: "Prevents agents from inventing modules, entities, workflows, or features not specified in the Master Orchestrator Prompt"
---

# No Freestyle Guardrail

## Rule
**NEVER invent, add, or freestyle anything that is not explicitly defined in the Master Orchestrator Prompt or subsequently approved by the user.**

---

## What This Means

### ❌ PROHIBITED Actions
- Creating a module not listed in Sections 7.1–7.12 of the Master Orchestrator Prompt
- Adding database entities not in Section 10
- Designing screens not in Section 12
- Defining workflows not in Section 13
- Adding user roles beyond the 12 in Section 6
- Including Phase 2+ features in Phase 1 scope (Section 8)
- Inventing API endpoints without a requirement trace
- Adding UI components without a screen registry entry

### ✅ PERMITTED Actions
- Implementing exactly what the spec requires
- Adding implementation details WITHIN a specified module (e.g., helper functions, utility classes)
- Proposing additions through explicit change request with justification
- Adding technical infrastructure (middleware, logging, error handling) that supports spec'd features

---

## Validation Checklist

Before producing ANY artifact, verify:

1. **Module check**: Is this module in Sections 7.1–7.12? → If NO, stop.
2. **Entity check**: Is this entity in Section 10 or derived from a spec'd module? → If NO, stop.
3. **Screen check**: Is this screen in Section 12? → If NO, stop.
4. **Workflow check**: Is this workflow in Section 13? → If NO, stop.
5. **Role check**: Is this role in Section 6? → If NO, stop.
6. **Phase check**: Is this feature in the current phase scope (Section 8/17)? → If NO, stop.

---

## Exception Protocol

If you believe something is genuinely needed but not in the spec:
1. Document the need with specific rationale
2. Reference which spec requirement it supports
3. Mark as `[PROPOSED ADDITION — requires approval]`
4. Do NOT implement until user explicitly approves
5. If approved, update the Module Map and affected artifacts

---

## Enforcement

This guardrail is checked:
- By the Artifact Quality Gate skill (QG-5 cross-reference check)
- By the Master Orchestrator during cross-pack validation
- By the Spec Traceability skill (every output must trace to a requirement)
