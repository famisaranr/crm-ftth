# Module Map
## FiberOps PH – FTTH Barangay Multi-JV CRM / OSS-BSS Platform

**Document ID**: MOD-FOPS-001
**Version**: 1.0
**Date**: 2026-03-07

---

## 1. Module Inventory

| Module ID | Module Name | Domain | Description | Phase | Dependencies | Primary Owner |
|-----------|------------|--------|-------------|:-----:|-------------|---------------|
| MOD-001 | Auth | Identity & Access | Login, token lifecycle, password management | 0 | — | Super Admin |
| MOD-002 | Users | Identity & Access | User CRUD, role assignment, scope assignment | 0 | MOD-001 | Super Admin |
| MOD-003 | RBAC | Identity & Access | Roles, permissions, permission groups | 0 | MOD-002 | Super Admin |
| MOD-004 | Barangays | Tenant Management | Barangay registry, service zones | 0 | MOD-003 | Corp Admin |
| MOD-005 | Partners | Tenant Management | JV partner entities | 0 | MOD-004 | Corp Admin |
| MOD-006 | Agreements | Tenant Management | JV agreements, revenue share templates | 0 | MOD-005 | Corp Admin |
| MOD-007 | Plans | Product & Pricing | Service plans, speed tiers, fees, promos | 0 | MOD-004 | Corp Admin |
| MOD-008 | Subscribers | Subscriber CRM | Subscriber lifecycle, profile, search | 1 | MOD-004, MOD-007 | Brgy Manager |
| MOD-009 | Network Assets | Network Inventory | FTTH asset hierarchy, status, capacity | 1 | MOD-004 | Network Eng |
| MOD-010 | Installations | Service Delivery | Installation workflow, job orders, technician assignment | 1 | MOD-008, MOD-009 | Ops Manager |
| MOD-011 | Tickets | Service Desk | Trouble tickets, SLA, dispatch, resolution | 1 | MOD-008, MOD-009 | CS Support |
| MOD-012 | Dashboards | Reporting | Operational dashboards (basic) | 1 | MOD-008, MOD-009, MOD-010, MOD-011 | Corp Admin |
| MOD-013 | Billing | Billing & Collection | Billing cycles, invoice generation, prorating | 2 | MOD-008, MOD-007 | Finance |
| MOD-014 | Payments | Billing & Collection | Payment posting, receipt tracking, ledger | 2 | MOD-013 | Collection |
| MOD-015 | Suspension | Account Management | Grace periods, soft/hard suspension, reactivation | 2 | MOD-013, MOD-014 | Finance |
| MOD-016 | Settlements | JV Commercial | Revenue share calculation, approval, statements | 3 | MOD-006, MOD-014 | Finance |
| MOD-017 | Mapping | Geographic | Map views, coordinates, topology visualization | 4 | MOD-004, MOD-009 | Network Eng |
| MOD-018 | Reports | Reporting | Advanced reports, KPIs, export | 4 | All | Corp Admin |
| MOD-019 | Audit | Compliance | Audit log framework, explorer, retention | 0+ | All | Auditor |
| MOD-020 | Settings | Configuration | System settings, master data, rule engine config | 0 | — | Super Admin |
| MOD-021 | Notifications | Communication | In-app and future SMS/email notifications | 4 | All | Ops Manager |

---

## 2. Module Dependency Diagram

```mermaid
graph TD
    MOD001["MOD-001<br/>Auth"]
    MOD002["MOD-002<br/>Users"]
    MOD003["MOD-003<br/>RBAC"]
    MOD004["MOD-004<br/>Barangays"]
    MOD005["MOD-005<br/>Partners"]
    MOD006["MOD-006<br/>Agreements"]
    MOD007["MOD-007<br/>Plans"]
    MOD008["MOD-008<br/>Subscribers"]
    MOD009["MOD-009<br/>Network Assets"]
    MOD010["MOD-010<br/>Installations"]
    MOD011["MOD-011<br/>Tickets"]
    MOD012["MOD-012<br/>Dashboards"]
    MOD013["MOD-013<br/>Billing"]
    MOD014["MOD-014<br/>Payments"]
    MOD015["MOD-015<br/>Suspension"]
    MOD016["MOD-016<br/>Settlements"]
    MOD017["MOD-017<br/>Mapping"]
    MOD018["MOD-018<br/>Reports"]
    MOD019["MOD-019<br/>Audit"]
    MOD020["MOD-020<br/>Settings"]

    MOD001 --> MOD002
    MOD002 --> MOD003
    MOD003 --> MOD004
    MOD004 --> MOD005
    MOD005 --> MOD006
    MOD004 --> MOD007
    MOD004 --> MOD008
    MOD007 --> MOD008
    MOD004 --> MOD009
    MOD008 --> MOD010
    MOD009 --> MOD010
    MOD008 --> MOD011
    MOD009 --> MOD011
    MOD008 --> MOD012
    MOD010 --> MOD012
    MOD011 --> MOD012
    MOD008 --> MOD013
    MOD007 --> MOD013
    MOD013 --> MOD014
    MOD013 --> MOD015
    MOD014 --> MOD015
    MOD006 --> MOD016
    MOD014 --> MOD016
    MOD004 --> MOD017
    MOD009 --> MOD017

    style MOD001 fill:#4CAF50,color:#fff
    style MOD002 fill:#4CAF50,color:#fff
    style MOD003 fill:#4CAF50,color:#fff
    style MOD004 fill:#4CAF50,color:#fff
    style MOD005 fill:#4CAF50,color:#fff
    style MOD006 fill:#4CAF50,color:#fff
    style MOD007 fill:#4CAF50,color:#fff
    style MOD020 fill:#4CAF50,color:#fff
    style MOD008 fill:#2196F3,color:#fff
    style MOD009 fill:#2196F3,color:#fff
    style MOD010 fill:#2196F3,color:#fff
    style MOD011 fill:#2196F3,color:#fff
    style MOD012 fill:#2196F3,color:#fff
    style MOD013 fill:#FF9800,color:#fff
    style MOD014 fill:#FF9800,color:#fff
    style MOD015 fill:#FF9800,color:#fff
    style MOD016 fill:#E91E63,color:#fff
    style MOD017 fill:#9C27B0,color:#fff
    style MOD018 fill:#9C27B0,color:#fff
    style MOD019 fill:#607D8B,color:#fff
    style MOD021 fill:#9C27B0,color:#fff
```

**Legend**: 🟢 Phase 0 | 🔵 Phase 1 | 🟠 Phase 2 | 🔴 Phase 3 | 🟣 Phase 4 | ⚫ Cross-cutting

---

## 3. Module Interaction Matrix

| Source ↓ / Target → | Auth | Users | RBAC | Brgy | Partners | Agreements | Plans | Subscribers | Net Assets | Install | Tickets | Billing | Payments | Suspend | Settle | Audit |
|---------------------|:----:|:-----:|:----:|:----:|:--------:|:----------:|:-----:|:-----------:|:----------:|:-------:|:-------:|:-------:|:--------:|:-------:|:------:|:-----:|
| **Auth** | — | R | R | — | — | — | — | — | — | — | — | — | — | — | — | W |
| **Users** | R | — | RW | R | R | — | — | — | — | — | — | — | — | — | — | W |
| **Subscribers** | — | — | R | R | — | — | R | — | R | W | W | — | — | — | — | W |
| **Installations** | — | R | R | R | — | — | — | RW | RW | — | — | — | — | — | — | W |
| **Tickets** | — | R | R | R | — | — | — | R | R | — | — | — | — | — | — | W |
| **Billing** | — | — | R | R | — | — | R | R | — | — | — | — | W | W | — | W |
| **Payments** | — | — | R | R | — | — | — | R | — | — | — | RW | — | W | — | W |
| **Suspension** | — | — | R | — | — | — | — | RW | — | — | — | R | R | — | — | W |
| **Settlements** | — | — | R | R | R | R | — | — | — | — | — | R | R | — | — | W |
| **Dashboards** | — | — | R | R | R | — | — | R | R | R | R | R | R | R | R | — |

**Legend**: R = reads from, W = writes to, RW = reads and writes
