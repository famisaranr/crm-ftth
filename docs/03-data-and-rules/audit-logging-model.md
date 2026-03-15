# Audit Logging Data Model
## FiberOps PH

**Document ID**: AUD-MDL-FOPS-001
**Version**: 1.0
**Date**: 2026-03-12

---

## 1. Audit Log Schema

The Audit Log model captures all business-critical mutations across the platform, adhering to the requirements set in the Audit Policy (`docs/05-security-access/audit-policy.md`).

### `audit_logs` Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, Generated | Unique identifier for the audit record |
| `entity_type` | VARCHAR(100) | Not Null | E.g., "Subscriber", "Invoice", "Settlement" |
| `entity_id` | UUID | Not Null | UUID of the affected entity |
| `action` | Enum | Not Null | Source action (CREATE, UPDATE, DELETE, STATUS_CHANGE, LOGIN, etc.) |
| `actor_id` | UUID | FK | Reference to `users.id` (null for system actions) |
| `actor_role` | VARCHAR(100) | Nullable | Role of the actor at the time of the action |
| `actor_ip` | VARCHAR(45) | Nullable | IP address of the actor |
| `previous_value` | JSONB | Nullable | State of the entity before mutation |
| `new_value` | JSONB | Nullable | State of the entity after mutation |
| `source_module` | VARCHAR(100) | Nullable | NestJS module name originating the action |
| `reason_code` | VARCHAR(100) | Nullable | Business reason (required for overrides) |
| `barangay_id` | UUID | FK | For scope-filtered audit viewing |
| `created_at` | TIMESTAMP | Default NOW() | Immutable timestamp of the event |

---

## 2. AuditAction Enum

```prisma
enum AuditAction {
  CREATE
  UPDATE
  DELETE
  STATUS_CHANGE
  LOGIN
  LOGIN_FAILED
  EXPORT
  APPROVAL
}
```

## 3. Indexes and Performance

To support efficient querying by the Audit Log Explorer, the following indexes are applied:

- `@@index([entity_type, entity_id, created_at])`
- `@@index([actor_id, created_at])`
- `@@index([barangay_id, created_at])`
