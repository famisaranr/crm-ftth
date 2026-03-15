# Screen Registry
## FiberOps PH – FTTH Barangay Multi-JV CRM / OSS-BSS Platform

**Document ID**: SCR-FOPS-001
**Version**: 1.0
**Date**: 2026-03-07

---

## 1. Screen Registry Overview

Total screens: **62** across 14 modules.
Design system: **shadcn/ui** components with Tailwind CSS on Next.js App Router.

---

## 2. Complete Screen Registry

### 2.1 Auth Module (4 screens)

| Screen ID | Screen Name | Route | Layout | Phase | Roles Allowed |
|-----------|------------|-------|--------|:-----:|---------------|
| SCR-AUTH-001 | Login | `/login` | Auth (no sidebar) | 0 | Public |
| SCR-AUTH-002 | Forgot Password | `/forgot-password` | Auth | 0 | Public |
| SCR-AUTH-003 | Reset Password | `/reset-password/:token` | Auth | 0 | Public |
| SCR-AUTH-004 | Change Password | `/settings/password` | Dashboard | 0 | All authenticated |

### 2.2 Dashboard Module (4 screens)

| Screen ID | Screen Name | Route | Layout | Phase | Roles Allowed |
|-----------|------------|-------|--------|:-----:|---------------|
| SCR-DASH-001 | Corporate Dashboard | `/dashboard` | Dashboard | 1 | Corp Admin, Ops Manager, Executive |
| SCR-DASH-002 | Barangay Dashboard | `/dashboard/barangay/:id` | Dashboard | 1 | Brgy Manager, Corp Admin |
| SCR-DASH-003 | Finance Dashboard | `/dashboard/finance` | Dashboard | 2 | Finance Officer, Corp Admin |
| SCR-DASH-004 | Network Dashboard | `/dashboard/network` | Dashboard | 1 | Network Engineer, Corp Admin |

### 2.3 User Management Module (3 screens)

| Screen ID | Screen Name | Route | Layout | Phase | Roles Allowed |
|-----------|------------|-------|--------|:-----:|---------------|
| SCR-USR-001 | User List | `/admin/users` | Dashboard | 0 | Super Admin |
| SCR-USR-002 | User Create/Edit | `/admin/users/new` `/admin/users/:id/edit` | Dashboard | 0 | Super Admin |
| SCR-USR-003 | Role & Permission Manager | `/admin/roles` | Dashboard | 0 | Super Admin |

### 2.4 Barangay / Tenant Module (4 screens)

| Screen ID | Screen Name | Route | Layout | Phase | Roles Allowed |
|-----------|------------|-------|--------|:-----:|---------------|
| SCR-BRG-001 | Barangay List | `/barangays` | Dashboard | 0 | Corp Admin, Super Admin |
| SCR-BRG-002 | Barangay Create/Edit | `/barangays/new` `/barangays/:id/edit` | Dashboard | 0 | Corp Admin |
| SCR-BRG-003 | Barangay Detail | `/barangays/:id` | Dashboard | 0 | Corp Admin, Brgy Manager |
| SCR-BRG-004 | Service Zone Manager | `/barangays/:id/zones` | Dashboard | 0 | Corp Admin |

### 2.5 Partner & Agreement Module (5 screens)

| Screen ID | Screen Name | Route | Layout | Phase | Roles Allowed |
|-----------|------------|-------|--------|:-----:|---------------|
| SCR-PTR-001 | Partner List | `/partners` | Dashboard | 0 | Corp Admin |
| SCR-PTR-002 | Partner Create/Edit | `/partners/new` `/partners/:id/edit` | Dashboard | 0 | Corp Admin |
| SCR-PTR-003 | Partner Detail | `/partners/:id` | Dashboard | 0 | Corp Admin, JV Partner Viewer |
| SCR-PTR-004 | Agreement List | `/agreements` | Dashboard | 0 | Corp Admin, Finance |
| SCR-PTR-005 | Agreement Create/Edit | `/agreements/new` `/agreements/:id/edit` | Dashboard | 0 | Corp Admin |

### 2.6 Plans Module (3 screens)

| Screen ID | Screen Name | Route | Layout | Phase | Roles Allowed |
|-----------|------------|-------|--------|:-----:|---------------|
| SCR-PLN-001 | Plan List | `/plans` | Dashboard | 0 | Corp Admin |
| SCR-PLN-002 | Plan Create/Edit | `/plans/new` `/plans/:id/edit` | Dashboard | 0 | Corp Admin |
| SCR-PLN-003 | Promo Manager | `/plans/:id/promos` | Dashboard | 0 | Corp Admin |

### 2.7 Subscriber Module (5 screens)

| Screen ID | Screen Name | Route | Layout | Phase | Roles Allowed |
|-----------|------------|-------|--------|:-----:|---------------|
| SCR-SUB-001 | Subscriber List | `/subscribers` | Dashboard | 1 | Brgy Mgr, CS, Ops Mgr, Corp Admin |
| SCR-SUB-002 | Subscriber Create | `/subscribers/new` | Dashboard | 1 | Brgy Mgr, CS |
| SCR-SUB-003 | Subscriber Detail | `/subscribers/:id` | Dashboard (tabs) | 1 | Brgy Mgr, CS, Ops Mgr, Finance, Corp Admin |
| SCR-SUB-004 | Subscriber Edit | `/subscribers/:id/edit` | Dashboard | 1 | Brgy Mgr, CS |
| SCR-SUB-005 | Subscriber Search (Global) | `/search` | Dashboard | 1 | All operational roles |

### 2.8 Network Asset Module (4 screens)

| Screen ID | Screen Name | Route | Layout | Phase | Roles Allowed |
|-----------|------------|-------|--------|:-----:|---------------|
| SCR-NET-001 | Asset List | `/network/assets` | Dashboard | 1 | Network Eng, Ops Mgr |
| SCR-NET-002 | Asset Create/Edit | `/network/assets/new` `/network/assets/:id/edit` | Dashboard | 1 | Network Eng |
| SCR-NET-003 | Asset Detail (Topology View) | `/network/assets/:id` | Dashboard | 1 | Network Eng |
| SCR-NET-004 | Topology Explorer | `/network/topology` | Dashboard (full-width) | 1 | Network Eng |

### 2.9 Installation Module (4 screens)

| Screen ID | Screen Name | Route | Layout | Phase | Roles Allowed |
|-----------|------------|-------|--------|:-----:|---------------|
| SCR-INS-001 | Installation Pipeline | `/installations` | Dashboard | 1 | Ops Mgr, Brgy Mgr |
| SCR-INS-002 | Job Detail | `/installations/:id` | Dashboard | 1 | Ops Mgr, Brgy Mgr, Technician |
| SCR-INS-003 | Survey Form | `/installations/:id/survey` | Dashboard | 1 | Technician, Brgy Mgr |
| SCR-INS-004 | Activation Checklist | `/installations/:id/activate` | Dashboard | 1 | Network Eng, Ops Mgr |

### 2.10 Ticket Module (4 screens)

| Screen ID | Screen Name | Route | Layout | Phase | Roles Allowed |
|-----------|------------|-------|--------|:-----:|---------------|
| SCR-TKT-001 | Ticket List | `/tickets` | Dashboard | 1 | CS, Ops Mgr, Brgy Mgr |
| SCR-TKT-002 | Ticket Create | `/tickets/new` | Dashboard | 1 | CS, Brgy Mgr |
| SCR-TKT-003 | Ticket Detail | `/tickets/:id` | Dashboard | 1 | CS, Ops Mgr, Technician |
| SCR-TKT-004 | Dispatch Board | `/tickets/dispatch` | Dashboard (full-width) | 1 | Ops Mgr |

### 2.11 Billing Module (6 screens)

| Screen ID | Screen Name | Route | Layout | Phase | Roles Allowed |
|-----------|------------|-------|--------|:-----:|---------------|
| SCR-BIL-001 | Billing Cycle Manager | `/billing/cycles` | Dashboard | 2 | Finance |
| SCR-BIL-002 | Invoice List | `/billing/invoices` | Dashboard | 2 | Finance, Brgy Mgr |
| SCR-BIL-003 | Invoice Detail | `/billing/invoices/:id` | Dashboard | 2 | Finance |
| SCR-BIL-004 | Payment Posting | `/billing/payments/new` | Dashboard | 2 | Collection Officer |
| SCR-BIL-005 | Payment History | `/billing/payments` | Dashboard | 2 | Finance, Collection |
| SCR-BIL-006 | Invoice Aging Report | `/billing/aging` | Dashboard | 2 | Finance, Corp Admin |

### 2.12 Suspension Module (2 screens)

| Screen ID | Screen Name | Route | Layout | Phase | Roles Allowed |
|-----------|------------|-------|--------|:-----:|---------------|
| SCR-SUS-001 | Suspension Queue | `/billing/suspensions` | Dashboard | 2 | Finance, Ops Mgr |
| SCR-SUS-002 | Manual Override Form | `/billing/suspensions/:id/override` | Dialog | 2 | Finance, Corp Admin |

### 2.13 Settlement Module (5 screens)

| Screen ID | Screen Name | Route | Layout | Phase | Roles Allowed |
|-----------|------------|-------|--------|:-----:|---------------|
| SCR-SET-001 | Settlement List | `/settlements` | Dashboard | 3 | Finance, Corp Admin |
| SCR-SET-002 | Settlement Calculator | `/settlements/new` | Dashboard | 3 | Finance |
| SCR-SET-003 | Settlement Detail | `/settlements/:id` | Dashboard | 3 | Finance, Corp Admin, JV Partner |
| SCR-SET-004 | Settlement Approval | `/settlements/:id/approve` | Dialog | 3 | Corp Admin |
| SCR-SET-005 | Partner Statement View | `/settlements/:id/statement` | Dashboard | 3 | JV Partner, Finance |

### 2.14 System / Settings Module (5 screens)

| Screen ID | Screen Name | Route | Layout | Phase | Roles Allowed |
|-----------|------------|-------|--------|:-----:|---------------|
| SCR-SYS-001 | System Settings | `/admin/settings` | Dashboard | 0 | Super Admin |
| SCR-SYS-002 | Master Data Manager | `/admin/master-data` | Dashboard | 0 | Super Admin |
| SCR-SYS-003 | Audit Log Explorer | `/admin/audit-logs` | Dashboard | 0 | Auditor, Super Admin, Corp Admin |
| SCR-SYS-004 | My Profile | `/settings/profile` | Dashboard | 0 | All authenticated |
| SCR-SYS-005 | Notifications Center | `/notifications` | Dashboard | 4 | All authenticated |

### 2.15 Reports & Export Module (4 screens)

| Screen ID | Screen Name | Route | Layout | Phase | Roles Allowed |
|-----------|------------|-------|--------|:-----:|---------------|
| SCR-RPT-001 | Report Builder | `/reports` | Dashboard | 4 | Finance, Corp Admin |
| SCR-RPT-002 | Revenue by Barangay | `/reports/revenue-barangay` | Dashboard | 4 | Finance, Corp Admin |
| SCR-RPT-003 | Revenue by Partner | `/reports/revenue-partner` | Dashboard | 4 | Finance, Corp Admin |
| SCR-RPT-004 | KPI Explorer | `/reports/kpis` | Dashboard (full-width) | 4 | Corp Admin, Executive |

---

## 3. Screen Count by Phase

| Phase | Screens | Cumulative |
|:-----:|:-------:|:----------:|
| 0 | 22 | 22 |
| 1 | 21 | 43 |
| 2 | 8 | 51 |
| 3 | 5 | 56 |
| 4 | 6 | 62 |

---

## 4. Layout Templates

| Layout | Description | Used By |
|--------|-------------|---------|
| **Auth** | Centered card, no navigation | Login, Forgot/Reset Password |
| **Dashboard** | Sidebar + top bar + content area | All operational screens |
| **Dashboard (tabs)** | Dashboard with tab navigation within content | Subscriber Detail, Asset Detail |
| **Dashboard (full-width)** | Dashboard with no side padding (for boards/maps) | Topology, Dispatch Board, KPI Explorer |
| **Dialog** | Modal overlay on current page | Override, Approval, Quick Actions |
