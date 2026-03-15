---
name: "Schema Consistency"
description: "Cross-checks database schema entities → API contracts → screen data sources → form validation fields for full-stack alignment"
---

# Schema Consistency Skill

## Purpose
Ensure the data model, API layer, and frontend are perfectly aligned. Every database entity should flow cleanly through API contracts to screen components with consistent naming, types, and validation.

---

## When to Invoke
- After Pack 03 (Data), Pack 04 (UX), and Pack 06 (Delivery) are all produced
- Before cross-pack validation
- When any schema change is proposed
- When adding new API endpoints or screens

---

## Consistency Checks

### SC-1: Entity → API Mapping
For every entity in `docs/03-data-and-rules/database-schema.md`:
- [ ] At least one API endpoint exists for CRUD operations
- [ ] API request/response field names match schema column names (or documented aliases)
- [ ] API response types match schema column types
- [ ] Required fields in schema marked as required in API request schemas
- [ ] Enum values in API match enum definitions in schema

### SC-2: API → Screen Mapping
For every API endpoint in `docs/06-delivery-engineering/api-contracts.md`:
- [ ] At least one screen in `docs/04-ux-frontend/screen-registry.md` references it as `dataSource`
- [ ] Response fields match `tableColumns` in screen registry
- [ ] Filter parameters match `filters` in screen registry
- [ ] Pagination parameters consistent with screen table design

### SC-3: Schema → Form Validation Mapping
For every form in `docs/04-ux-frontend/form-validation-matrix.md`:
- [ ] Form fields map to schema columns (same names or documented aliases)
- [ ] Field types match: text→VARCHAR, number→INTEGER/DECIMAL, select→ENUM, date→TIMESTAMP
- [ ] Required fields in form match NOT NULL constraints in schema
- [ ] Max length in form matches VARCHAR length in schema
- [ ] Enum options in form select match schema enum values exactly

### SC-4: Naming Consistency
Across all documents, verify:
- [ ] Entity names use consistent casing (snake_case in schema, camelCase in API)
- [ ] Status enum values identical in schema, API, screen registry, and tests
- [ ] Role names identical across RBAC matrix, permission taxonomy, and screen access
- [ ] Module names identical in module map, API groupings, and frontend routes

### SC-5: Relationship Integrity
- [ ] Every FK in schema has a corresponding nested/linked API response
- [ ] Join tables have corresponding API endpoints (or are embedded in parent)
- [ ] Cascading deletes/soft-deletes consistent between schema and API behavior
- [ ] Many-to-many relationships have proper join table CRUD

---

## Output Format

```markdown
# Schema Consistency Report
> Generated: [date]

## Summary
- Entities checked: [N]
- API endpoints checked: [N]
- Screens checked: [N]
- Forms checked: [N]
- Inconsistencies found: [N]

## Inconsistencies

| # | Type | Source | Target | Issue |
|---|------|--------|--------|-------|
| 1 | SC-1 | subscribers (schema) | GET /api/subscribers | Response missing `billing_class` field |
| 2 | SC-3 | subscriber create form | subscribers table | Form allows 100 chars for `full_name`, schema allows 255 |
| 3 | SC-4 | InvoiceStatus enum | screen-registry.md | Screen uses "OVERDUE", schema uses "PAST_DUE" |
```

---

## Iteration Protocol

```
FOR each entity in schema:
  CHECK API coverage (SC-1)
  CHECK screen coverage (SC-2)
  CHECK form alignment (SC-3)
  CHECK naming (SC-4)
  CHECK relationships (SC-5)
  IF inconsistency found:
    LOG with specific document + line references
    IDENTIFY responsible agent (Data/Delivery/UX)
    FIX inconsistency
    RE-CHECK
  END IF
END FOR

LOOP until zero inconsistencies (max 5 iterations)
IF not converged → escalate with full report
```
