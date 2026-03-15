---
name: "Tenant Isolation Audit"
description: "Verifies every entity has barangay_id scoping, every query is filtered, and every API endpoint enforces tenant boundaries"
---

# Tenant Isolation Audit Skill

## Purpose
Multi-tenancy is a non-negotiable principle in FiberOps PH. This skill audits the entire platform to ensure no data leakage across barangay or JV partner boundaries.

---

## When to Invoke
- After Data Architect produces schema with `barangay_id` fields
- After Security Architect produces tenant scoping rules
- During implementation of any module with tenant-scoped data
- Before every phase gate
- As part of production readiness checklist

---

## Audit Checks

### TI-1: Schema-Level Scoping
For every entity in `docs/03-data-and-rules/database-schema.md`:

| Entity | Has barangay_id? | Has partner_id? | Scope Type | Exempt? (reason) |
|--------|:-:|:-:|------------|----------|
| subscribers | ✅ | ❌ | barangay | — |
| invoices | ✅ | ❌ | barangay (via subscriber) | — |
| settlements | ✅ | ✅ | barangay + partner | — |
| roles | ❌ | ❌ | global | System-level entity |
| permissions | ❌ | ❌ | global | System-level entity |

**Rules:**
- Operational entities (subscribers, invoices, tickets, assets, installations) MUST have `barangay_id`
- System entities (roles, permissions, asset_types, plan templates) MAY be global
- Every exemption MUST have a documented reason

### TI-2: API Middleware Enforcement
For every API endpoint in `docs/06-delivery-engineering/api-contracts.md`:
- [ ] Tenant scope middleware is applied
- [ ] Request context includes `barangay_ids` from JWT
- [ ] Query filters include `WHERE barangay_id IN (user.barangay_ids)`
- [ ] Direct ID access (`GET /subscribers/:id`) still validates barangay scope
- [ ] Bulk operations respect scope boundaries

### TI-3: Frontend Scope Awareness
- [ ] Frontend sends no barangay_id overrides (scope is always server-determined)
- [ ] UI filters show only barangay-scoped options
- [ ] Dashboard aggregations respect user's assigned barangays
- [ ] No client-side-only scope filtering (all enforced on backend)

### TI-4: Cross-Tenant Operations (Controlled)
These operations intentionally cross tenant boundaries:
- [ ] Corporate dashboards aggregate across ALL barangays (for corp roles only)
- [ ] Settlement calculations span partner's barangays (for finance roles only)
- [ ] User management allows assigning users to multiple barangays (for admin roles only)
- [ ] Audit log queries can span barangays (for auditor role only)

Each cross-tenant operation MUST:
- Require explicit RBAC permission
- Be logged as a cross-tenant access event
- Not be available to barangay-scoped roles

### TI-5: Data Leakage Test Scenarios
Produce these test scenarios:

| # | Test | Expected |
|---|------|----------|
| 1 | Barangay Manager queries subscribers | Only sees own barangay subscribers |
| 2 | Barangay Manager requests subscriber from another barangay by ID | 403 Forbidden |
| 3 | JV Partner views settlement | Only sees their partner's settlements |
| 4 | Collection Officer posts payment | Only for subscribers in assigned barangay |
| 5 | Field Technician views tickets | Only sees assigned tickets |
| 6 | Corporate Admin queries subscribers | Sees all barangays |
| 7 | API request with manipulated barangay_id header | Rejected — scope from JWT only |
| 8 | Bulk export by barangay-scoped user | Export limited to assigned barangays |

---

## Iteration Protocol

```
SCAN database schema for all entities
FOR each entity:
  CHECK has barangay_id OR has documented exemption
  IF neither → FLAG as ISOLATION GAP
END FOR

SCAN API contracts for all endpoints
FOR each endpoint:
  CHECK scope middleware applied
  CHECK scope enforcement documented
  IF missing → FLAG as SCOPE GAP
END FOR

RUN data leakage test scenarios
FOR each scenario:
  VERIFY expected behavior
  IF unexpected access → FLAG as LEAKAGE

IF any flags:
  PRODUCE isolation gap report
  FIX gaps → RE-RUN audit
  MAX 3 iterations
  IF not resolved → BLOCK phase gate + escalate to user
END IF
```
