# RBAC Matrix
## FiberOps PH – Role-Based Access Control

**Document ID**: RBAC-FOPS-001
**Version**: 1.0
**Date**: 2026-03-07

---

## 1. Role Definitions

| Role ID | Role Name | Scope | Description |
|---------|-----------|-------|-------------|
| R01 | Super Admin | Global | Full platform access, user management, system configuration |
| R02 | Corporate Admin | Global | Cross-barangay ops and finance, partner management, approvals |
| R03 | Operations Manager | Global | Installation, ticket, and subscriber oversight across barangays |
| R04 | Barangay Manager | Barangay-scoped | Local subscriber, installation, and ticket management |
| R05 | Finance Officer | Global | Billing, collections oversight, settlement management |
| R06 | Collection Officer | Barangay-scoped | Payment posting, receipt tracking, collection reporting |
| R07 | Network Engineer | Global | Network asset management, topology, capacity planning |
| R08 | Field Technician | Assignment-scoped | View assigned jobs/tickets, update field status |
| R09 | Customer Service | Barangay-scoped | Subscriber lookup, ticket creation, inquiry handling |
| R10 | JV Partner Viewer | Partner-scoped | Read-only revenue and settlement data for own partnership |
| R11 | Auditor | Global (read-only) | Audit log access, financial verification, compliance |
| R12 | Read-only Executive | Global (read-only) | Dashboard and report viewing only |

---

## 2. Permission Matrix by Module

### 2.1 Identity & User Management

| Permission | R01 | R02 | R03 | R04 | R05 | R06 | R07 | R08 | R09 | R10 | R11 | R12 |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| users.list | ✅ | — | — | — | — | — | — | — | — | — | — | — |
| users.view | ✅ | — | — | — | — | — | — | — | — | — | — | — |
| users.create | ✅ | — | — | — | — | — | — | — | — | — | — | — |
| users.update | ✅ | — | — | — | — | — | — | — | — | — | — | — |
| users.deactivate | ✅ | — | — | — | — | — | — | — | — | — | — | — |
| roles.list | ✅ | — | — | — | — | — | — | — | — | — | — | — |
| roles.manage | ✅ | — | — | — | — | — | — | — | — | — | — | — |
| profile.view_own | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| profile.edit_own | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### 2.2 Barangay & Tenant Management

| Permission | R01 | R02 | R03 | R04 | R05 | R06 | R07 | R08 | R09 | R10 | R11 | R12 |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| barangays.list | ✅ | ✅ | ✅ | 🔒 | ✅ | 🔒 | ✅ | — | 🔒 | — | ✅ | ✅ |
| barangays.view | ✅ | ✅ | ✅ | 🔒 | ✅ | 🔒 | ✅ | — | 🔒 | — | ✅ | ✅ |
| barangays.create | ✅ | ✅ | — | — | — | — | — | — | — | — | — | — |
| barangays.update | ✅ | ✅ | — | — | — | — | — | — | — | — | — | — |
| partners.list | ✅ | ✅ | — | — | ✅ | — | — | — | — | 🔒 | ✅ | — |
| partners.view | ✅ | ✅ | — | — | ✅ | — | — | — | — | 🔒 | ✅ | — |
| partners.create | ✅ | ✅ | — | — | — | — | — | — | — | — | — | — |
| partners.update | ✅ | ✅ | — | — | — | — | — | — | — | — | — | — |
| agreements.list | ✅ | ✅ | — | — | ✅ | — | — | — | — | 🔒 | ✅ | — |
| agreements.view | ✅ | ✅ | — | — | ✅ | — | — | — | — | 🔒 | ✅ | — |
| agreements.create | ✅ | ✅ | — | — | — | — | — | — | — | — | — | — |
| agreements.update | ✅ | ✅ | — | — | — | — | — | — | — | — | — | — |

### 2.3 Product & Plans

| Permission | R01 | R02 | R03 | R04 | R05 | R06 | R07 | R08 | R09 | R10 | R11 | R12 |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| plans.plan.list | ✅ | ✅ | ✅ | 🔒 | ✅ | — | — | — | 🔒 | — | ✅ | — |
| plans.plan.view | ✅ | ✅ | ✅ | 🔒 | ✅ | — | — | — | 🔒 | — | ✅ | — |
| plans.plan.create | ✅ | ✅ | — | — | — | — | — | — | — | — | — | — |
| plans.plan.update | ✅ | ✅ | — | — | — | — | — | — | — | — | — | — |
| plans.promo.manage | ✅ | ✅ | — | — | — | — | — | — | — | — | — | — |
| plans.feature.manage | ✅ | ✅ | — | — | — | — | — | — | — | — | — | — |

### 2.4 Subscriber CRM

| Permission | R01 | R02 | R03 | R04 | R05 | R06 | R07 | R08 | R09 | R10 | R11 | R12 |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| subscribers.list | ✅ | ✅ | ✅ | 🔒 | — | 🔒 | — | — | 🔒 | — | ✅ | — |
| subscribers.view | ✅ | ✅ | ✅ | 🔒 | — | 🔒 | — | — | 🔒 | — | ✅ | — |
| subscribers.create | ✅ | ✅ | — | 🔒 | — | — | — | — | 🔒 | — | — | — |
| subscribers.update | ✅ | ✅ | — | 🔒 | — | — | — | — | 🔒 | — | — | — |
| subscribers.delete | ✅ | ✅ | — | — | — | — | — | — | — | — | — | — |
| subscribers.change_status | ✅ | ✅ | ✅ | 🔒 | ✅ | — | ✅ | — | — | — | — | — |
| subscribers.search | ✅ | ✅ | ✅ | 🔒 | ✅ | 🔒 | — | — | 🔒 | — | ✅ | — |

### 2.4 Network Assets

| Permission | R01 | R02 | R03 | R04 | R05 | R06 | R07 | R08 | R09 | R10 | R11 | R12 |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| network.assets.list | ✅ | ✅ | ✅ | — | — | — | ✅ | — | — | — | ✅ | — |
| network.assets.view | ✅ | ✅ | ✅ | — | — | — | ✅ | — | — | — | ✅ | — |
| network.assets.create | ✅ | — | — | — | — | — | ✅ | — | — | — | — | — |
| network.assets.update | ✅ | — | — | — | — | — | ✅ | — | — | — | — | — |
| network.assets.delete | ✅ | — | — | — | — | — | ✅ | — | — | — | — | — |
| network.topology.view | ✅ | ✅ | ✅ | — | — | — | ✅ | — | — | — | ✅ | — |

### 2.5 Installations

| Permission | R01 | R02 | R03 | R04 | R05 | R06 | R07 | R08 | R09 | R10 | R11 | R12 |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| installations.list | ✅ | ✅ | ✅ | 🔒 | — | — | ✅ | 🔑 | — | — | ✅ | — |
| installations.view | ✅ | ✅ | ✅ | 🔒 | — | — | ✅ | 🔑 | — | — | ✅ | — |
| installations.assign | ✅ | ✅ | ✅ | 🔒 | — | — | — | — | — | — | — | — |
| installations.update_status | ✅ | ✅ | ✅ | 🔒 | — | — | ✅ | 🔑 | — | — | — | — |
| installations.activate | ✅ | ✅ | ✅ | — | — | — | ✅ | — | — | — | — | — |

### 2.6 Tickets

| Permission | R01 | R02 | R03 | R04 | R05 | R06 | R07 | R08 | R09 | R10 | R11 | R12 |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| tickets.list | ✅ | ✅ | ✅ | 🔒 | — | — | — | 🔑 | 🔒 | — | ✅ | — |
| tickets.view | ✅ | ✅ | ✅ | 🔒 | — | — | — | 🔑 | 🔒 | — | ✅ | — |
| tickets.create | ✅ | ✅ | — | 🔒 | — | — | — | — | 🔒 | — | — | — |
| tickets.assign | ✅ | ✅ | ✅ | — | — | — | — | — | — | — | — | — |
| tickets.update | ✅ | ✅ | ✅ | 🔒 | — | — | — | 🔑 | 🔒 | — | — | — |
| tickets.resolve | ✅ | ✅ | ✅ | — | — | — | — | 🔑 | 🔒 | — | — | — |
| tickets.escalate | ✅ | ✅ | ✅ | — | — | — | — | — | 🔒 | — | — | — |

### 2.7 Billing & Collections

| Permission | R01 | R02 | R03 | R04 | R05 | R06 | R07 | R08 | R09 | R10 | R11 | R12 |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| billing.cycles.manage | ✅ | ✅ | — | — | ✅ | — | — | — | — | — | — | — |
| billing.invoices.list | ✅ | ✅ | — | 🔒 | ✅ | 🔒 | — | — | — | — | ✅ | — |
| billing.invoices.view | ✅ | ✅ | — | 🔒 | ✅ | 🔒 | — | — | — | — | ✅ | — |
| billing.invoices.void | ✅ | ✅ | — | — | ✅ | — | — | — | — | — | — | — |
| billing.invoices.adjust | ✅ | ✅ | — | — | ✅ | — | — | — | — | — | — | — |
| billing.payments.post | ✅ | ✅ | — | — | ✅ | 🔒 | — | — | — | — | — | — |
| billing.payments.list | ✅ | ✅ | — | — | ✅ | 🔒 | — | — | — | — | ✅ | — |
| billing.payments.reverse | ✅ | ✅ | — | — | ✅ | — | — | — | — | — | — | — |
| billing.suspension.view | ✅ | ✅ | — | — | ✅ | — | — | — | — | — | ✅ | — |
| billing.suspension.override | ✅ | ✅ | — | — | ✅ | — | — | — | — | — | — | — |
| billing.writeoff.approve | ✅ | ✅ | — | — | ✅ | — | — | — | — | — | — | — |

### 2.8 Settlements

| Permission | R01 | R02 | R03 | R04 | R05 | R06 | R07 | R08 | R09 | R10 | R11 | R12 |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| settlements.list | ✅ | ✅ | — | — | ✅ | — | — | — | — | 🔒 | ✅ | — |
| settlements.view | ✅ | ✅ | — | — | ✅ | — | — | — | — | 🔒 | ✅ | — |
| settlements.calculate | ✅ | ✅ | — | — | ✅ | — | — | — | — | — | — | — |
| settlements.submit | ✅ | ✅ | — | — | ✅ | — | — | — | — | — | — | — |
| settlements.approve | ✅ | ✅ | — | — | — | — | — | — | — | — | — | — |
| settlements.disburse | ✅ | ✅ | — | — | ✅ | — | — | — | — | — | — | — |
| settlements.lock | ✅ | ✅ | — | — | ✅ | — | — | — | — | — | — | — |
| settlements.unlock | ✅ | — | — | — | — | — | — | — | — | — | — | — |

### 2.9 Dashboards & Reports

| Permission | R01 | R02 | R03 | R04 | R05 | R06 | R07 | R08 | R09 | R10 | R11 | R12 |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| dashboards.corporate | ✅ | ✅ | ✅ | — | — | — | — | — | — | — | — | ✅ |
| dashboards.barangay | ✅ | ✅ | ✅ | 🔒 | — | — | — | — | — | — | — | — |
| dashboards.finance | ✅ | ✅ | — | — | ✅ | — | — | — | — | — | — | ✅ |
| dashboards.network | ✅ | ✅ | ✅ | — | — | — | ✅ | — | — | — | — | — |
| reports.view | ✅ | ✅ | — | — | ✅ | — | — | — | — | — | — | ✅ |
| reports.export | ✅ | ✅ | — | — | ✅ | — | — | — | — | — | — | — |

### 2.10 System & Audit

| Permission | R01 | R02 | R03 | R04 | R05 | R06 | R07 | R08 | R09 | R10 | R11 | R12 |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| settings.manage | ✅ | — | — | — | — | — | — | — | — | — | — | — |
| master_data.manage | ✅ | — | — | — | — | — | — | — | — | — | — | — |
| audit.logs.view | ✅ | ✅ | — | — | — | — | — | — | — | — | ✅ | — |
| audit.logs.export | ✅ | ✅ | — | — | — | — | — | — | — | — | ✅ | — |

**Legend**: ✅ = Full access | 🔒 = Barangay-scoped | 🔑 = Assignment-scoped | — = No access

---

## 3. Total Permission Count by Role

| Role | Permissions | Scope Type |
|------|:----------:|:---------:|
| Super Admin (R01) | ~75 | Global |
| Corporate Admin (R02) | ~65 | Global |
| Operations Manager (R03) | ~30 | Global |
| Barangay Manager (R04) | ~25 | Barangay-scoped |
| Finance Officer (R05) | ~35 | Global |
| Collection Officer (R06) | ~12 | Barangay-scoped |
| Network Engineer (R07) | ~15 | Global |
| Field Technician (R08) | ~8 | Assignment-scoped |
| Customer Service (R09) | ~18 | Barangay-scoped |
| JV Partner Viewer (R10) | ~6 | Partner-scoped |
| Auditor (R11) | ~25 | Global (read-only) |
| Read-only Executive (R12) | ~6 | Global (read-only) |
