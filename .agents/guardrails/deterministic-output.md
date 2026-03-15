---
name: "Deterministic Output Guardrail"
description: "Same inputs must produce same outputs. No randomness. Consistent ID formats. Reproducible artifacts."
---

# Deterministic Output Guardrail

## Rule
**Given the same inputs and requirements, every agent must produce the same outputs. All artifacts must be reproducible, consistent, and free of arbitrary variation.**

---

## Requirements

### 1. Consistent ID Formats
| ID Type | Format | Example |
|---------|--------|---------|
| Module ID | `MOD-XXX` | `MOD-001` |
| Requirement ID | `[DOC]-[DOMAIN]-NNN` | `BRD-CRM-001`, `PRD-USR-005` |
| Screen ID | `SCR-[MODULE]-NNN` | `SCR-SUB-001`, `SCR-BIL-003` |
| Workflow ID | `WF-NNN` | `WF-001` |
| Test ID | `TC-[TYPE]-NNN` | `TC-E2E-001`, `TC-UNIT-042` |
| Event ID | `EVT-[CONTEXT]-NNN` | `EVT-SUB-001` |
| Permission ID | `[module].[entity].[action]` | `subscribers.subscriber.create` |

### 2. Consistent Naming Conventions
| Context | Convention | Example |
|---------|-----------|---------|
| Database tables | snake_case, plural | `subscribers`, `invoice_lines` |
| Database columns | snake_case | `barangay_id`, `created_at` |
| API endpoints | kebab-case | `/api/network-assets` |
| API request/response | camelCase | `accountNumber`, `billingClass` |
| Frontend routes | kebab-case | `/subscribers/create` |
| Frontend components | PascalCase | `SubscriberList`, `PaymentPosting` |
| Backend modules | kebab-case directories | `modules/network-assets/` |
| Backend files | `entity.layer.ts` | `subscriber.service.ts` |
| Enum values | UPPER_SNAKE_CASE | `ACTIVE`, `SURVEY_SCHEDULED` |
| Event names | `context.action` | `subscriber.created`, `payment.received` |

### 3. Consistent Document Structure
- Every agent's artifacts follow the exact structure defined in their agent prompt
- Sections appear in the same order as specified
- Table column order is consistent across documents
- Mermaid diagram conventions are consistent (same direction, same node shapes)

### 4. No Arbitrary Variation
- Don't use different words for the same concept across documents
- Don't vary between British and American English (use American)
- Don't mix date formats (use ISO 8601: `YYYY-MM-DD`)
- Don't abbreviate inconsistently (`Barangay` not sometimes `Brgy` and sometimes `Barangay`)

---

## Enforcement Points
- Artifact Quality Gate: QG-3 (Traceability IDs) and QG-4 (Formatting Standards)
- Cross-pack validation: Check 9 (Enum Consistency) and Check 4 (Naming)
- Naming Conventions reference doc (`.agents/references/naming-conventions.md`)
