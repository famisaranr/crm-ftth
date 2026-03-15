# Tenant Scoping Rules
## FiberOps PH – Tenant Isolation and Data Scoping

**Document ID**: SCOPE-FOPS-001
**Version**: 1.0
**Date**: 2026-03-12

---

## 1. Scope Types

| Scope Type | Applies To | Mechanism | Entities Affected |
|-----------|-----------|-----------|-------------------|
| **Global** | Super Admin, Corp Admin, Ops Mgr, Finance, Net Eng, Auditor, Executive | No filtering applied — sees all data | All |
| **Barangay** | Brgy Manager, Collection Officer, CS Support | `WHERE barangay_id IN (user.barangayIds)` | Subscribers, Invoices, Payments, Tickets, Installations, Assets, Zones, Audits |
| **Partner** | JV Partner Viewer | `WHERE partner_id = user.partnerId` | Agreements, Settlements, Statements |
| **Assignment** | Field Technician | `WHERE assigned_technician_id = user.id` | Installation Jobs, Tickets |

---

## 2. Scoping Rules per Entity

| Entity | Scope Column | Global Roles | Scoped Roles | Scoping Rule |
|--------|-------------|-------------|-------------|-------------|
| subscribers | barangay_id | R01-R03, R05, R11 | R04, R06, R09 | `IN user.barangayIds` |
| invoices | barangay_id | R01, R02, R05, R11 | R04, R06 | `IN user.barangayIds` |
| payments | barangay_id | R01, R02, R05, R11 | R06 | `IN user.barangayIds` |
| service_tickets | barangay_id | R01-R03, R11 | R04, R09 | `IN user.barangayIds` |
| installation_jobs | (via subscriber) | R01-R03, R07, R11 | R04 | `IN user.barangayIds` |
| installation_jobs | assigned_tech_id | — | R08 | `= user.id` |
| network_assets | barangay_id | R01, R02, R03, R07, R11 | — | `IN user.barangayIds` (if scoped) |
| service_zones | barangay_id | R01, R02, R11 | R04 | `IN user.barangayIds` |
| audit_logs | barangay_id | R01, R02, R11 | R04 | `IN user.barangayIds` |
| partner_agreements | barangay_id / partner_id | R01, R02, R05, R11 | R10 | `= user.partnerId` |
| settlements | (via agreement) | R01, R02, R05, R11 | R10 | `agreement.partner_id = user.partnerId` |

---

## 3. Scoping Implementation (Prisma Middleware)

```typescript
// Prisma extension for automatic tenant scoping
const prismaWithScoping = prisma.$extends({
  query: {
    $allOperations({ model, operation, args, query }) {
      const scopedModels = [
        'Subscriber', 'Invoice', 'Payment', 'ServiceTicket',
        'InstallationJob', 'NetworkAsset', 'BillingCycle',
        'ServiceZone', 'AuditLog'
      ];
      
      if (!scopedModels.includes(model)) return query(args);
      
      const user = getCurrentUser(); // from AsyncLocalStorage
      if (user.scopeType === 'GLOBAL') return query(args);
      
      if (['findMany', 'findFirst', 'count', 'aggregate'].includes(operation)) {
        args.where = {
          ...args.where,
          barangay_id: { in: user.barangayIds }
        };
      }
      
      return query(args);
    }
  }
});
```
