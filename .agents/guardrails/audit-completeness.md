---
name: "Audit Completeness Guardrail"
description: "Every mutation must have an audit trail. Logs are append-only and immutable. No silent updates."
---

# Audit Completeness Guardrail

## Rule
**Every state-changing operation in the system MUST produce an audit log entry. Audit logs are append-only, immutable, and never deletable by any user role including Super Admin.**

---

## Mandatory Auditable Actions

### Subscriber Lifecycle
- [ ] Subscriber created
- [ ] Subscriber status changed (every transition)
- [ ] Subscriber profile updated (before/after values)
- [ ] Subscriber plan changed
- [ ] Subscriber network assignment changed
- [ ] Subscriber deleted/churned

### Financial Operations
- [ ] Invoice generated
- [ ] Invoice adjusted (before/after, reason code)
- [ ] Invoice voided (reason, approver)
- [ ] Payment posted (amount, method, invoice ref)
- [ ] Payment reversed (reason, offsetting entry)
- [ ] Write-off applied (amount, reason, approver)
- [ ] Settlement calculated (inputs, formula, result)
- [ ] Settlement approved (approver chain)
- [ ] Settlement disbursed

### Administrative Actions
- [ ] User created/updated/deactivated
- [ ] Role assigned/removed
- [ ] Scope (barangay) assigned/removed
- [ ] Permission changed
- [ ] Password reset initiated/completed
- [ ] Session force-terminated

### Operational Actions
- [ ] Installation job created/status changed
- [ ] Ticket created/assigned/resolved/closed
- [ ] Network asset deployed/decommissioned
- [ ] Service plan created/updated/deactivated
- [ ] Agreement created/modified/versioned

### System Actions
- [ ] Data export performed (who, what, when)
- [ ] Bulk operation executed (type, count, scope)
- [ ] System setting changed (before/after)
- [ ] Manual override of automated rule (which rule, reason)

---

## Audit Log Entry Requirements

Every audit entry MUST include:
```
log_id:         UUID (auto-generated)
entity_type:    string (e.g., "subscriber", "invoice")
entity_id:      UUID (the affected record)
action:         enum (CREATE, UPDATE, DELETE, STATUS_CHANGE, APPROVE, REJECT)
actor_id:       UUID (who performed the action)
actor_role:     string (role at time of action)
actor_ip:       string (IP address)
previous_value: JSON (null for CREATE)
new_value:      JSON (null for DELETE)
source_module:  string (e.g., "billing", "subscribers")
reason_code:    string (nullable — required for adjustments, overrides, write-offs)
barangay_id:    UUID (tenant context of the action)
timestamp:      ISO 8601 datetime (server-generated, not client)
```

---

## Immutability Rules
1. Audit log table has **NO UPDATE permission** for any role
2. Audit log table has **NO DELETE permission** for any role
3. No Prisma model should define `update` or `delete` on audit_logs
4. API layer has NO endpoints for modifying or deleting audit logs
5. Database-level trigger/constraint prevents UPDATE/DELETE if possible

---

## Enforcement Points
- Data Architect: Schema includes immutability constraints
- Security Architect: No audit mutation permissions in RBAC
- Delivery Engineer: Repository layer has no update/delete methods for audit
- QA Lead: Integration tests verify audit entries for every mutation
- Cross-pack validation: Check 10 (Audit Coverage)
