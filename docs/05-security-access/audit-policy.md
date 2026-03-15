# Audit Policy
## FiberOps PH – FTTH Barangay Multi-JV CRM / OSS-BSS Platform

**Document ID**: AUD-FOPS-001
**Version**: 1.0
**Date**: 2026-03-07

---

## 1. Audit Principles

| Principle | Description |
|-----------|-------------|
| **Completeness** | Every mutation on business-critical data is logged |
| **Immutability** | Audit records can never be modified or deleted |
| **Traceability** | Every entry links to an actor, entity, and timestamp |
| **Non-repudiation** | Actors cannot deny their actions — IP and user agent captured |
| **Searchability** | Indexed by entity_type, entity_id, actor_id, barangay_id, date range |
| **Privacy** | Sensitive data (passwords, tokens) is never included in audit values |

---

## 2. Auditable Events Catalog

### 2.1 Always Audited (Automated)

| Category | Events | Captured Data |
|----------|--------|-------------|
| Authentication | Login success, login failure, logout, password change/reset | user_id, ip, user_agent, timestamp |
| User Management | Create, update, deactivate, role change, scope change | before/after user record |
| Subscriber | Create, update, delete (soft), all status changes | before/after subscriber record |
| Network Assets | Create, update, delete, status change, subscriber link/unlink | before/after asset record |
| Installation | All status transitions, technician assignment, activation | before/after job record |
| Tickets | Create, assign, resolve, close, escalate, SLA breach | before/after ticket record |
| Billing | Invoice generate, void, adjust | before/after invoice record |
| Payments | Post, reverse | payment record, affected invoices |
| Suspension | Auto-suspend, manual suspend, reactivate, override | subscriber_id, type, reason |
| Settlement | Calculate, submit, approve, disburse, lock, unlock | settlement record with financials |
| Write-offs | Request, approve | invoice_id, amount, reason |
| Agreements | Create, update, version change | before/after agreement record |
| System Settings | Any configuration change | setting key, old/new value |
| Data Export | Any data export action | export_type, record_count, format |

### 2.2 Selectively Audited

| Category | Events | Condition |
|----------|--------|-----------|
| Read access | View subscriber detail | Only for PII-heavy records (KYC data) |
| Search | Global subscriber search | Only if subscriber has KYC flag |
| Bulk operations | Bulk status changes | Always logged with all affected IDs |

---

## 3. Audit Log Schema

```typescript
interface AuditLogEntry {
  id: string;              // UUID (auto-generated)
  entity_type: string;     // e.g., "Subscriber", "Invoice", "Settlement"
  entity_id: string;       // UUID of affected entity
  action: AuditAction;     // CREATE, UPDATE, DELETE, STATUS_CHANGE, LOGIN, etc.
  actor_id: string | null; // UUID of user; null for system actions
  actor_role: string;      // Role name at time of action
  actor_ip: string;        // IP address
  previous_value: object;  // Before state (JSON)
  new_value: object;       // After state (JSON)
  source_module: string;   // NestJS module name
  reason_code: string;     // Business reason (required for overrides)
  barangay_id: string;     // For scope-filtered audit viewing
  correlation_id: string;  // Request correlation ID (trace across events)
  created_at: DateTime;    // Timestamp (immutable)
}
```

---

## 4. Audit Implementation

### 4.1 NestJS Audit Interceptor

```typescript
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    
    // Only audit mutations (POST, PATCH, DELETE)
    if (!['POST', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }
    
    return next.handle().pipe(
      tap(responseData => {
        // Queue audit log write (async, non-blocking)
        this.auditQueue.add('write', {
          entityType: this.extractEntityType(request),
          entityId: this.extractEntityId(request, responseData),
          action: this.mapMethodToAction(method),
          actorId: request.user?.sub,
          actorRole: request.user?.roles?.[0],
          actorIp: request.ip,
          previousValue: request.__previousEntityState,
          newValue: this.sanitize(responseData),
          sourceModule: this.extractModule(request),
          reasonCode: request.body?.reason,
          barangayId: request.__barangayId,
          correlationId: request.headers['x-correlation-id'],
        });
      })
    );
  }
}
```

### 4.2 Before-State Capture

For UPDATE and DELETE operations, capture the entity's current state *before* the mutation:

```typescript
// In service layer, before mutation
async updateSubscriber(id: string, dto: UpdateSubscriberDto, request: Request) {
  const previous = await this.prisma.subscriber.findUnique({ where: { id } });
  request.__previousEntityState = previous; // Attach for interceptor
  
  const updated = await this.prisma.subscriber.update({
    where: { id },
    data: dto,
  });
  
  return updated;
}
```

### 4.3 Sensitive Data Sanitization

Fields redacted before writing to audit log:

| Field | Treatment |
|-------|----------|
| `password_hash` | Replace with `"[REDACTED]"` |
| `token_hash` | Replace with `"[REDACTED]"` |
| `kyc_id_number` | Mask: show last 4 chars only `"****1234"` |
| `receipt_reference` | Keep (not sensitive) |
| Large text fields (> 1000 chars) | Truncate with `"[TRUNCATED]"` |

---

## 5. Audit Retention Policy

| Data Category | Retention Period | Rationale |
|-------------|:----------------:|-----------|
| Financial records (billing, payments, settlements) | 10 years | Philippine tax record requirements |
| Subscriber PII access logs | 5 years | RA 10173 (Data Privacy Act) |
| Authentication events | 3 years | Security compliance |
| Operational records (tickets, installations) | 5 years | Business operations |
| System settings changes | 7 years | Configuration audit trail |
| All other audit records | 3 years | General compliance |

### Archival Strategy
- Records beyond retention: archived to cold storage (S3/compressed file)
- Archived records: queryable but with higher latency
- Delete after 2× retention period

---

## 6. Audit Log Explorer (UI)

### 6.1 Filter Capabilities

| Filter | Type | Example |
|--------|------|---------|
| Entity Type | Multi-select dropdown | Subscriber, Invoice, Settlement |
| Entity ID | Text (UUID) | Search for specific entity |
| Actor | Combobox (user search) | Filter by specific user |
| Action | Multi-select | CREATE, UPDATE, STATUS_CHANGE |
| Date Range | Date picker (from/to) | Last 7 days, Last 30 days, Custom |
| Barangay | Select | Filter by barangay (scoped) |
| Module | Select | subscribers, billing, settlements |

### 6.2 Display Format

| Column | Content |
|--------|---------|
| Timestamp | `2026-03-07 14:30:15` |
| Actor | User name + role badge |
| Action | Action badge (color-coded) |
| Entity | Type + clickable ID link |
| Summary | Human-readable description |
| Details | Expandable diff view (before/after) |

### 6.3 Export

- Export filtered audit logs to CSV
- Include all fields, sanitized
- Log the export action itself as an audit event

---

## 7. Compliance Checklist

### Philippine Data Privacy Act (RA 10173)

| Requirement | FiberOps PH Implementation |
|-------------|---------------------------|
| Lawful basis for processing | Service agreement with subscriber |
| Data minimization | Collect only necessary subscriber data |
| Access control | RBAC + tenant scoping prevents unauthorized access |
| Breach notification | Audit logs enable forensic investigation; notification workflow TBD |
| Data subject rights | Subscriber data export capability; deletion via soft-delete |
| Data retention limits | Retention policy defined; archival after expiry |
| Security measures | Encryption in transit (TLS), password hashing, session management |
| DPO designation | Organizational responsibility; not a platform feature |

### Financial Record Compliance

| Requirement | Implementation |
|-------------|---------------|
| Invoice traceability | Every invoice line traceable to plan rate and subscriber |
| Payment auditability | Receipt reference + payment method + posted_by + audit log |
| Settlement verifiability | Line items traceable to source payments |
| Write-off approval chain | Dual control: Finance requests, Corp Admin approves |
| Immutable financial records | Audit log is append-only; corrections via reversal entries |
