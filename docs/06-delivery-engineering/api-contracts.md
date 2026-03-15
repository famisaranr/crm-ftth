# API Contracts
## FiberOps PH – RESTful API Specification

**Document ID**: API-FOPS-001
**Version**: 1.0
**Date**: 2026-03-07

---

## 1. API Conventions

| Convention | Standard |
|-----------|---------|
| Base URL | `/api/v1` |
| Content-Type | `application/json` |
| Auth | `Authorization: Bearer <access_token>` |
| HTTP Methods | GET (list/view), POST (create), PATCH (update), DELETE (soft-delete) |
| Pagination | `?page=1&limit=20` (default: page=1, limit=20, max=100) |
| Sorting | `?sort=created_at&order=desc` |
| Filtering | `?status=ACTIVE&barangay_id=uuid` |
| Search | `?q=search_term` |
| Date format | ISO 8601 (`2026-03-07T14:30:00Z`) |
| ID format | UUID |
| Money | String representation of decimal (`"1500.00"`) |

---

## 2. Standard Response Formats

### Success (Single)
```json
{
  "success": true,
  "data": { "id": "uuid", "..." : "..." }
}
```

### Success (List)
```json
{
  "success": true,
  "data": [ { "id": "uuid", "..." : "..." } ],
  "meta": {
    "total": 1250,
    "page": 1,
    "limit": 20,
    "totalPages": 63
  }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input validation failed",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

### Error Codes
| Code | HTTP Status | Description |
|------|:-----------:|-------------|
| VALIDATION_ERROR | 400 | Request body validation failures |
| UNAUTHORIZED | 401 | Missing or invalid token |
| FORBIDDEN | 403 | Insufficient permissions or scope |
| NOT_FOUND | 404 | Entity does not exist |
| CONFLICT | 409 | Duplicate or state conflict |
| LOCKED | 423 | Account locked or settlement locked |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Unhandled server error |

---

## 3. Endpoint Catalog

### 3.1 Authentication

| Method | Endpoint | Description | Auth |
|:------:|----------|-------------|:----:|
| POST | `/api/v1/auth/login` | Login | No |
| POST | `/api/v1/auth/refresh` | Refresh token | Cookie |
| POST | `/api/v1/auth/logout` | Logout | Yes |
| POST | `/api/v1/auth/forgot-password` | Request password reset | No |
| POST | `/api/v1/auth/reset-password` | Reset with token | No |
| PATCH | `/api/v1/auth/change-password` | Change own password | Yes |

### 3.2 Users

| Method | Endpoint | Description | Permission |
|:------:|----------|-------------|-----------|
| GET | `/api/v1/users` | List users | users.user.list |
| GET | `/api/v1/users/:id` | Get user | users.user.view |
| POST | `/api/v1/users` | Create user | users.user.create |
| PATCH | `/api/v1/users/:id` | Update user | users.user.update |
| PATCH | `/api/v1/users/:id/deactivate` | Deactivate | users.user.deactivate |
| GET | `/api/v1/roles` | List roles | users.role.list |
| GET | `/api/v1/permissions` | List permissions | users.role.manage |

### 3.3 Barangays

| Method | Endpoint | Description | Permission |
|:------:|----------|-------------|-----------|
| GET | `/api/v1/barangays` | List barangays | barangays.barangay.list |
| GET | `/api/v1/barangays/:id` | Get barangay | barangays.barangay.view |
| POST | `/api/v1/barangays` | Create barangay | barangays.barangay.create |
| PATCH | `/api/v1/barangays/:id` | Update barangay | barangays.barangay.update |
| GET | `/api/v1/barangays/:id/zones` | List zones | barangays.zone.list |
| POST | `/api/v1/barangays/:id/zones` | Create zone | barangays.zone.manage |

### 3.4 Partners & Agreements

| Method | Endpoint | Description | Permission |
|:------:|----------|-------------|-----------|
| GET | `/api/v1/partners` | List partners | partners.partner.list |
| GET | `/api/v1/partners/:id` | Get partner | partners.partner.view |
| POST | `/api/v1/partners` | Create partner | partners.partner.create |
| PATCH | `/api/v1/partners/:id` | Update partner | partners.partner.update |
| GET | `/api/v1/agreements` | List agreements | agreements.agreement.list |
| GET | `/api/v1/agreements/:id` | Get agreement | agreements.agreement.view |
| POST | `/api/v1/agreements` | Create agreement | agreements.agreement.create |
| PATCH | `/api/v1/agreements/:id` | Update agreement | agreements.agreement.update |

### 3.5 Service Plans

| Method | Endpoint | Description | Permission |
|:------:|----------|-------------|-----------|
| GET | `/api/v1/plans` | List plans | plans.plan.list |
| GET | `/api/v1/plans/:id` | Get plan | plans.plan.view |
| POST | `/api/v1/plans` | Create plan | plans.plan.create |
| PATCH | `/api/v1/plans/:id` | Update plan | plans.plan.update |
| GET | `/api/v1/plans/:id/promos` | List promos | plans.promo.manage |
| POST | `/api/v1/plans/:id/promos` | Create promo | plans.promo.manage |

### 3.6 Subscribers

| Method | Endpoint | Description | Permission |
|:------:|----------|-------------|-----------|
| GET | `/api/v1/subscribers` | List subscribers (paginated) | subscribers.subscriber.list |
| GET | `/api/v1/subscribers/:id` | Get subscriber detail | subscribers.subscriber.view |
| POST | `/api/v1/subscribers` | Create subscriber | subscribers.subscriber.create |
| PATCH | `/api/v1/subscribers/:id` | Update subscriber | subscribers.subscriber.update |
| DELETE | `/api/v1/subscribers/:id` | Soft-delete | subscribers.subscriber.delete |
| PATCH | `/api/v1/subscribers/:id/status` | Change status | subscribers.subscriber.change_status |
| GET | `/api/v1/subscribers/search` | Global search | subscribers.subscriber.search |
| GET | `/api/v1/subscribers/:id/ledger` | Account ledger | billing.invoice.view |

### 3.7 Network Assets

| Method | Endpoint | Description | Permission |
|:------:|----------|-------------|-----------|
| GET | `/api/v1/network/assets` | List assets | network.asset.list |
| GET | `/api/v1/network/assets/:id` | Get asset + children | network.asset.view |
| POST | `/api/v1/network/assets` | Create asset | network.asset.create |
| PATCH | `/api/v1/network/assets/:id` | Update asset | network.asset.update |
| DELETE | `/api/v1/network/assets/:id` | Soft-delete | network.asset.delete |
| GET | `/api/v1/network/topology` | Full topology tree | network.topology.view |

### 3.8 Installations

| Method | Endpoint | Description | Permission |
|:------:|----------|-------------|-----------|
| GET | `/api/v1/installations` | List jobs | installations.job.list |
| GET | `/api/v1/installations/:id` | Get job detail | installations.job.view |
| PATCH | `/api/v1/installations/:id/assign` | Assign technician | installations.job.assign |
| PATCH | `/api/v1/installations/:id/status` | Update status | installations.job.update_status |
| PATCH | `/api/v1/installations/:id/activate` | Activate connection | installations.job.activate |
| POST | `/api/v1/installations/:id/photos` | Upload photos | installations.job.update_status |

### 3.9 Tickets

| Method | Endpoint | Description | Permission |
|:------:|----------|-------------|-----------|
| GET | `/api/v1/tickets` | List tickets | tickets.ticket.list |
| GET | `/api/v1/tickets/:id` | Get ticket detail | tickets.ticket.view |
| POST | `/api/v1/tickets` | Create ticket | tickets.ticket.create |
| PATCH | `/api/v1/tickets/:id/assign` | Assign technician | tickets.ticket.assign |
| PATCH | `/api/v1/tickets/:id/status` | Update status | tickets.ticket.update |
| POST | `/api/v1/tickets/:id/notes` | Add note | tickets.ticket.update |

### 3.10 Billing

| Method | Endpoint | Description | Permission |
|:------:|----------|-------------|-----------|
| GET | `/api/v1/billing/cycles` | List cycles | billing.cycle.list |
| POST | `/api/v1/billing/cycles/:id/generate` | Generate invoices | billing.cycle.manage |
| GET | `/api/v1/billing/invoices` | List invoices | billing.invoice.list |
| GET | `/api/v1/billing/invoices/:id` | Get invoice detail | billing.invoice.view |
| PATCH | `/api/v1/billing/invoices/:id/void` | Void invoice | billing.invoice.void |
| POST | `/api/v1/billing/invoices/:id/adjust` | Add adjustment | billing.invoice.adjust |
| GET | `/api/v1/billing/payments` | List payments | billing.payment.list |
| POST | `/api/v1/billing/payments` | Post payment | billing.payment.post |
| POST | `/api/v1/billing/payments/:id/reverse` | Reverse payment | billing.payment.reverse |
| GET | `/api/v1/billing/suspensions` | Suspension queue | billing.suspension.view |
| POST | `/api/v1/billing/suspensions/:id/override` | Manual override | billing.suspension.override |

### 3.11 Settlements

| Method | Endpoint | Description | Permission |
|:------:|----------|-------------|-----------|
| GET | `/api/v1/settlements` | List settlements | settlements.settlement.list |
| GET | `/api/v1/settlements/:id` | Get settlement detail | settlements.settlement.view |
| POST | `/api/v1/settlements` | Create & calculate | settlements.settlement.calculate |
| PATCH | `/api/v1/settlements/:id/submit` | Submit for review | settlements.settlement.submit |
| PATCH | `/api/v1/settlements/:id/approve` | Approve | settlements.settlement.approve |
| PATCH | `/api/v1/settlements/:id/disburse` | Mark disbursed | settlements.settlement.disburse |
| PATCH | `/api/v1/settlements/:id/lock` | Lock period | settlements.settlement.lock |
| GET | `/api/v1/settlements/:id/statement` | Partner statement | settlements.statement.view |

### 3.12 Dashboards & Reports

| Method | Endpoint | Description | Permission |
|:------:|----------|-------------|-----------|
| GET | `/api/v1/dashboards/corporate` | Corporate KPIs | dashboards.corporate.view |
| GET | `/api/v1/dashboards/barangay/:id` | Barangay KPIs | dashboards.barangay.view |
| GET | `/api/v1/dashboards/finance` | Finance KPIs | dashboards.finance.view |
| GET | `/api/v1/dashboards/network` | Network KPIs | dashboards.network.view |
| GET | `/api/v1/reports/revenue-barangay` | Revenue by barangay | reports.report.view |
| GET | `/api/v1/reports/revenue-partner` | Revenue by partner | reports.report.view |

### 3.13 System

| Method | Endpoint | Description | Permission |
|:------:|----------|-------------|-----------|
| GET | `/api/v1/audit-logs` | List audit logs | audit.log.list |
| GET | `/api/v1/settings` | Get system settings | settings.system.manage |
| PATCH | `/api/v1/settings` | Update settings | settings.system.manage |

---

## 4. Total Endpoint Count

| Module | Endpoints |
|--------|:---------:|
| Auth | 6 |
| Users | 7 |
| Barangays | 6 |
| Partners & Agreements | 8 |
| Plans | 6 |
| Subscribers | 8 |
| Network | 6 |
| Installations | 6 |
| Tickets | 6 |
| Billing | 11 |
| Settlements | 8 |
| Dashboards & Reports | 6 |
| System | 3 |
| **Total** | **87** |
