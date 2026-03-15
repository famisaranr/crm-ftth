# Permission Taxonomy & Tenant Scoping Rules
## FiberOps PH – FTTH Barangay Multi-JV CRM / OSS-BSS Platform

**Document ID**: PRM-FOPS-001
**Version**: 1.0
**Date**: 2026-03-07

---

## 1. Permission Naming Convention

```
{module}.{entity}.{action}
```

| Segment | Values | Examples |
|---------|--------|---------|
| module | auth, users, barangays, partners, agreements, plans, subscribers, network, installations, tickets, billing, settlements, dashboards, reports, audit, settings | — |
| entity | user, role, barangay, partner, agreement, subscriber, asset, job, ticket, invoice, payment, settlement, log | — |
| action | list, view, create, update, delete, assign, approve, export, manage, override | — |

**Full examples**: `subscribers.subscriber.create`, `billing.payment.post`, `settlements.settlement.approve`

---

## 2. Permission Catalog (Exhaustive)

### Auth & Users (~12 permissions)
```
auth.session.view_own
auth.password.change_own
auth.password.reset_others
users.user.list
users.user.view
users.user.create
users.user.update
users.user.deactivate
users.role.list
users.role.view
users.role.manage
users.scope.assign
```

### Barangays & Tenant (~12 permissions)
```
barangays.barangay.list
barangays.barangay.view
barangays.barangay.create
barangays.barangay.update
barangays.zone.list
barangays.zone.manage
partners.partner.list
partners.partner.view
partners.partner.create
partners.partner.update
agreements.agreement.list
agreements.agreement.view
agreements.agreement.create
agreements.agreement.update
```

### Plans (~6 permissions)
```
plans.plan.list
plans.plan.view
plans.plan.create
plans.plan.update
plans.promo.manage
plans.feature.manage
```

### Subscribers (~8 permissions)
```
subscribers.subscriber.list
subscribers.subscriber.view
subscribers.subscriber.create
subscribers.subscriber.update
subscribers.subscriber.delete
subscribers.subscriber.change_status
subscribers.subscriber.search
subscribers.subscriber.export
```

### Network (~7 permissions)
```
network.asset.list
network.asset.view
network.asset.create
network.asset.update
network.asset.delete
network.topology.view
network.capacity.view
```

### Installations (~6 permissions)
```
installations.job.list
installations.job.view
installations.job.assign
installations.job.update_status
installations.job.activate
installations.material.manage
```

### Tickets (~8 permissions)
```
tickets.ticket.list
tickets.ticket.view
tickets.ticket.create
tickets.ticket.assign
tickets.ticket.update
tickets.ticket.resolve
tickets.ticket.close
tickets.ticket.escalate
```

### Billing (~14 permissions)
```
billing.cycle.list
billing.cycle.manage
billing.invoice.list
billing.invoice.view
billing.invoice.void
billing.invoice.adjust
billing.payment.list
billing.payment.view
billing.payment.post
billing.payment.reverse
billing.suspension.view
billing.suspension.override
billing.aging.view
billing.writeoff.approve
```

### Settlements (~9 permissions)
```
settlements.settlement.list
settlements.settlement.view
settlements.settlement.calculate
settlements.settlement.submit
settlements.settlement.approve
settlements.settlement.disburse
settlements.settlement.lock
settlements.settlement.unlock
settlements.statement.view
```

### Dashboards & Reports (~8 permissions)
```
dashboards.corporate.view
dashboards.barangay.view
dashboards.finance.view
dashboards.network.view
reports.report.list
reports.report.view
reports.report.generate
reports.report.export
```

### System (~6 permissions)
```
settings.system.manage
settings.master_data.manage
audit.log.list
audit.log.view
audit.log.export
notifications.notification.view_own
```

**Total: ~96 granular permissions**

---

## 3. Tenant Scoping Rules

### 3.1 Scope Types

| Scope Type | Applies To | Mechanism | Entities Affected |
|-----------|-----------|-----------|-------------------|
| **Global** | Super Admin, Corp Admin, Ops Mgr, Finance, Net Eng, Auditor, Executive | No filtering applied — sees all data | All |
| **Barangay** | Brgy Manager, Collection Officer, CS Support | `WHERE barangay_id IN (user.barangayIds)` | Subscribers, Invoices, Payments, Tickets, Installations, Assets |
| **Partner** | JV Partner Viewer | `WHERE partner_id = user.partnerId` | Agreements, Settlements, Statements |
| **Assignment** | Field Technician | `WHERE assigned_technician_id = user.id` | Installation Jobs, Tickets |

### 3.2 Scoping Implementation (Prisma Middleware)

```typescript
// Prisma extension for automatic tenant scoping
const prismaWithScoping = prisma.$extends({
  query: {
    $allOperations({ model, operation, args, query }) {
      const scopedModels = [
        'Subscriber', 'Invoice', 'Payment', 'ServiceTicket',
        'InstallationJob', 'NetworkAsset', 'BillingCycle'
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

### 3.3 Scoping Rules per Entity

| Entity | Scope Column | Global Roles | Scoped Roles | Scoping Rule |
|--------|-------------|-------------|-------------|-------------|
| subscribers | barangay_id | R01-R03, R05, R11 | R04, R06, R09 | `IN user.barangayIds` |
| invoices | barangay_id | R01, R02, R05, R11 | R04, R06 | `IN user.barangayIds` |
| payments | barangay_id | R01, R02, R05, R11 | R06 | `IN user.barangayIds` |
| service_tickets | barangay_id | R01-R03, R11 | R04, R09 | `IN user.barangayIds` |
| installation_jobs | (via subscriber) | R01-R03, R07, R11 | R04 | `IN user.barangayIds` |
| installation_jobs | assigned_tech_id | — | R08 | `= user.id` |
| service_tickets | (via assignment) | — | R08 | `assigned_tech_id = user.id` |
| network_assets | barangay_id | R01, R02, R03, R07, R11 | — | No scoping (global roles only) |
| partner_agreements | partner_id | R01, R02, R05, R11 | R10 | `= user.partnerId` |
| settlements | (via agreement) | R01, R02, R05, R11 | R10 | `agreement.partner_id = user.partnerId` |

### 3.4 IDOR Prevention

Even when accessing a single record by ID, the system verifies scope:

```typescript
// Before returning any entity by ID
async findById(id: string, user: AuthUser) {
  const entity = await this.prisma.subscriber.findUnique({ where: { id } });
  
  if (!entity) throw new NotFoundException();
  
  if (user.scopeType === 'BARANGAY') {
    if (!user.barangayIds.includes(entity.barangay_id)) {
      throw new ForbiddenException('Access denied: out of scope');
    }
  }
  
  return entity;
}
```

### 3.5 Scope Assignment Rules

| Rule | Description |
|------|-------------|
| A user must have at least one scope assignment | Cannot create user without barangay or partner scope (unless global role) |
| Global roles do not need scope assignments | They can see all data |
| Barangay-scoped users can have multiple barangay assignments | e.g., Brgy Manager for 2 adjacent barangays |
| Partner-scoped users have exactly one partner assignment | JV Partner Viewer sees only their partner data |
| Scope changes take effect on next token refresh | Not immediate — must re-login or wait for token expiry |

---

## 4. Sensitive Action Controls

### 4.1 Actions Requiring Confirmation + Reason

| Action | Reason Required | Approval Required | Roles |
|--------|:--------------:|:-----------------:|-------|
| Subscriber disconnect | ✅ | — | Corp Admin, Ops Mgr |
| Subscriber manual suspend | ✅ | — | Finance |
| Subscriber manual reactivate | ✅ | — | Finance, Corp Admin |
| Invoice void | ✅ | — | Finance |
| Invoice adjustment | ✅ | — | Finance |
| Payment reversal | ✅ | — | Finance |
| Write-off | ✅ | ✅ (Corp Admin) | Finance (request), Corp Admin (approve) |
| Settlement approval | — | ✅ (Corp Admin) | Corp Admin |
| Settlement unlock (re-open period) | ✅ | — | Super Admin only |
| User deactivation | ✅ | — | Super Admin |
| Agreement modification | — | — | Corp Admin |

### 4.2 Actions Logged but No Confirmation

| Action | Logged Fields |
|--------|-------------|
| Login success | user_id, ip, timestamp |
| Login failure | email, ip, attempt_count |
| Password change | user_id, timestamp |
| Data export | user_id, export_type, record_count, timestamp |
| Bulk operations | user_id, action, affected_ids, count |
