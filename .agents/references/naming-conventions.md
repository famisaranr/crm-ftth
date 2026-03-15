---
name: "Naming Conventions"
description: "Canonical naming patterns for IDs, files, entities, APIs, and all identifiers across FiberOps PH"
---

# Naming Conventions Reference

## Business Identifiers

| Type | Format | Example | Generator |
|------|--------|---------|-----------|
| Account Number | `FOP-[BRGY_CODE]-[SEQ6]` | `FOP-BSI-000142` | Auto-increment per barangay |
| Invoice Number | `INV-[YYYYMM]-[SEQ6]` | `INV-202603-000001` | Auto-increment per billing cycle |
| Ticket ID | `TKT-[YYYYMMDD]-[SEQ4]` | `TKT-20260308-0023` | Auto-increment per day |
| Job Order | `JO-[YYYYMM]-[SEQ4]` | `JO-202603-0015` | Auto-increment per month |
| Settlement Ref | `STL-[BRGY_CODE]-[YYYYMM]` | `STL-BSI-202603` | One per barangay per month |
| Agreement Ref | `AGR-[PARTNER]-[SEQ3]` | `AGR-DELCO-001` | Auto-increment per partner |
| Asset Tag | `AST-[TYPE]-[SEQ6]` | `AST-ONT-000312` | Auto-increment per type |

## Document Identifiers

| Type | Pattern | Example |
|------|---------|---------|
| Module ID | `MOD-NNN` | `MOD-001` |
| Requirement (BRD) | `BRD-[DOMAIN]-NNN` | `BRD-CRM-001` |
| Requirement (PRD) | `PRD-[AREA]-NNN` | `PRD-USR-001` |
| Screen ID | `SCR-[MODULE]-NNN` | `SCR-SUB-001` |
| Workflow ID | `WF-NNN` | `WF-001` |
| Test Case | `TC-[TYPE]-NNN` | `TC-E2E-001` |
| Event ID | `EVT-[CONTEXT]-NNN` | `EVT-SUB-001` |

## Code Naming

| Context | Convention | Example |
|---------|-----------|---------|
| Database tables | `snake_case`, plural | `subscribers`, `invoice_lines` |
| Database columns | `snake_case` | `barangay_id`, `created_at` |
| Enums (DB) | `PascalCase` type, `UPPER_SNAKE` values | `SubscriberStatus.ACTIVE` |
| API endpoints | kebab-case paths | `/api/network-assets/:id` |
| API request/response | camelCase fields | `accountNumber`, `billingClass` |
| Frontend routes | kebab-case | `/subscribers/create` |
| Components | PascalCase | `SubscriberList.tsx` |
| Backend modules | kebab-case dirs | `modules/network-assets/` |
| Backend files | `entity.layer.ts` | `subscriber.service.ts` |
| Shared types | PascalCase interfaces | `ISubscriber`, `CreateSubscriberDto` |
| Event names | `context.action` | `subscriber.created` |
| Permissions | `module.entity.action` | `subscribers.subscriber.create` |
| Environment vars | `UPPER_SNAKE_CASE` | `DATABASE_URL`, `JWT_SECRET` |

## File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Agent prompts | kebab-case | `product-architect.md` |
| Doc artifacts | kebab-case | `database-schema.md` |
| Skills | kebab-case | `cross-pack-validation.md` |
| Guardrails | kebab-case | `financial-precision.md` |
| Workflows | kebab-case | `validate-pack.md` |
