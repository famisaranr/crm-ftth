---
name: "Tenant Boundary Guardrail"
description: "Every query must be scoped to the user's tenant context. No cross-tenant data leakage. Backend enforcement only."
---

# Tenant Boundary Guardrail

## Rule
**Every data query MUST be scoped to the requesting user's assigned barangay(s) and/or partner. Scope enforcement MUST happen on the backend. Frontend checks are UI convenience only, NOT security.**

---

## Hard Constraints

### 1. Backend Enforcement Only
- [ ] Tenant scope is extracted from the authenticated JWT token
- [ ] Scope is applied via backend middleware/guard — NEVER from client-side headers
- [ ] Frontend cannot override, inject, or modify tenant scope
- [ ] Every Prisma query includes `WHERE barangay_id IN (user.assigned_barangay_ids)`

### 2. Entity Scoping Requirements
**Every operational entity MUST have a `barangay_id` column:**
- subscribers, subscriptions, subscriber_addresses
- network_assets, ont_devices, olt_ports, splitters, distribution_boxes
- installation_jobs, installation_materials
- service_tickets, ticket_assignments
- invoices, invoice_lines, payments, account_ledgers
- settlements, settlement_lines
- audit_logs (scoped for query, but logs ALL actions)

**Global entities (exempt from barangay scoping):**
- users, roles, permissions (system-level)
- service_plans, plan_features (may be global or per-barangay)
- network_asset_types (reference data)
- system_settings (global configuration)

### 3. Direct ID Access Protection
```
GET /api/subscribers/:id
```
Even when accessing by direct ID, the backend MUST verify:
```
subscriber.barangay_id IN user.assigned_barangay_ids
```
If not → return `403 Forbidden` (NOT `404 Not Found` — do not reveal existence)

### 4. Bulk Operations
- Bulk exports: filtered to user's barangays
- Bulk updates: validated per-record before applying
- Batch invoice generation: scoped to assigned barangays only

### 5. Cross-Tenant Exceptions (Controlled)
| Operation | Allowed Roles | Condition |
|-----------|--------------|-----------|
| Corporate dashboard (all barangays) | Super Admin, Corp Admin, Ops Manager, Executive, Auditor | Must have `view:all_barangays` permission |
| Settlement across partner's barangays | Finance Officer, Corp Admin | Must have `settlements.calculate` permission |
| User assignment to multiple barangays | Super Admin, Corp Admin | Must have `users.assign_scope` permission |
| Cross-barangay reporting | Auditor, Executive | Read-only, logged as cross-tenant access |

---

## Violation Consequences
- Any query without tenant scoping in a scoped module = **CRITICAL BUG**
- Any frontend-only scope check without backend enforcement = **SECURITY VULNERABILITY**
- Any 404 instead of 403 for cross-tenant ID access = **INFORMATION DISCLOSURE**

---

## Enforcement Points
- Tenant Isolation Audit skill: Full audit of schema + API + frontend
- RBAC tests: Verify scope restrictions per role
- Cross-pack validation: Check TI-1 through TI-5
- Production readiness checklist: Mandatory penetration test for tenant isolation
