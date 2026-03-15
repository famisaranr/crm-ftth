# CRUD / Form / State Matrices
## FiberOps PH – FTTH Barangay Multi-JV CRM / OSS-BSS Platform

**Document ID**: MTX-FOPS-001
**Version**: 1.0
**Date**: 2026-03-07

---

## 1. CRUD Matrix (Entity × Operation × Role)

### 1.1 Core Entities

| Entity | Create | Read | Update | Delete | Roles with Create | Roles with Update | Roles with Delete |
|--------|:------:|:----:|:------:|:------:|-------------------|-------------------|-------------------|
| User | ✅ | ✅ | ✅ | ✅ (soft) | Super Admin | Super Admin | Super Admin |
| Role | ✅ | ✅ | ✅ | ❌ | Super Admin | Super Admin | — |
| Barangay | ✅ | ✅ | ✅ | ❌ | Corp Admin | Corp Admin | — |
| Service Zone | ✅ | ✅ | ✅ | ✅ | Corp Admin | Corp Admin | Corp Admin |
| Partner | ✅ | ✅ | ✅ | ❌ | Corp Admin | Corp Admin | — |
| Agreement | ✅ | ✅ | ✅ | ❌ | Corp Admin | Corp Admin (versioned) | — |
| Service Plan | ✅ | ✅ | ✅ | ❌ | Corp Admin | Corp Admin | — |
| Subscriber | ✅ | ✅ | ✅ | ✅ (soft) | Brgy Mgr, CS | Brgy Mgr, CS | Corp Admin |
| Network Asset | ✅ | ✅ | ✅ | ✅ (soft) | Net Eng | Net Eng | Net Eng |
| Installation Job | ✅ (auto) | ✅ | ✅ | ❌ | System | Ops Mgr, Brgy Mgr, Tech | — |
| Service Ticket | ✅ | ✅ | ✅ | ❌ | CS, Brgy Mgr | CS, Ops Mgr, Tech | — |
| Invoice | ✅ (auto) | ✅ | ✅ (limited) | ✅ (void) | System | Finance (adjust only) | Finance (void) |
| Payment | ✅ | ✅ | ❌ | ✅ (reverse) | Collection | Finance, Collection | Finance (reverse) |
| Settlement | ✅ (auto) | ✅ | ✅ | ❌ | Finance | Finance (pre-lock) | — |
| Audit Log | ❌ (auto) | ✅ | ❌ | ❌ | System | — | — |

### 1.2 Read Access by Role

| Entity | Super Admin | Corp Admin | Ops Mgr | Brgy Mgr | Finance | Collection | Net Eng | Tech | CS | JV Partner | Auditor | Executive |
|--------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Users | ✅ | — | — | — | — | — | — | — | — | — | — | — |
| Barangays | ✅ | ✅ | ✅ | Own | ✅ | Own | ✅ | — | Own | — | ✅ | ✅ |
| Partners | ✅ | ✅ | — | — | ✅ | — | — | — | — | Own | ✅ | — |
| Agreements | ✅ | ✅ | — | — | ✅ | — | — | — | — | Own | ✅ | — |
| Subscribers | ✅ | ✅ | ✅ | Own | — | Own | — | — | Own | — | ✅ | — |
| Network | ✅ | ✅ | ✅ | — | — | — | ✅ | — | — | — | ✅ | — |
| Installations | ✅ | ✅ | ✅ | Own | — | — | ✅ | Assigned | — | — | ✅ | — |
| Tickets | ✅ | ✅ | ✅ | Own | — | — | — | Assigned | Own | — | ✅ | — |
| Invoices | ✅ | ✅ | — | Own | ✅ | Own | — | — | — | — | ✅ | — |
| Payments | ✅ | ✅ | — | — | ✅ | Own | — | — | — | — | ✅ | — |
| Settlements | ✅ | ✅ | — | — | ✅ | — | — | — | — | Own | ✅ | — |
| Audit Logs | ✅ | ✅ | — | — | — | — | — | — | — | — | ✅ | — |
| Dashboards | ✅ | ✅ | ✅ | Own | ✅ | — | ✅ | — | — | — | — | ✅ |

**Legend**: Own = only records within assigned barangay/partner scope. Assigned = only their assigned jobs/tickets.

---

## 2. Form Field Matrix

### 2.1 Subscriber Create/Edit Form

| Field | Type | Required | Create | Edit | Validation | Phase |
|-------|------|:--------:|:------:|:----:|-----------|:-----:|
| full_name | Text | ✅ | ✅ | ✅ | Min 2 chars | 1 |
| phone | Phone | ✅ | ✅ | ✅ | PH mobile format | 1 |
| email | Email | — | ✅ | ✅ | Valid email | 1 |
| barangay_id | Select | ✅ | ✅ | ❌ | Must exist, user has scope | 1 |
| billing_class | Select | — | ✅ | ✅ | RESIDENTIAL / COMMERCIAL | 1 |
| plan_id | Select | ✅ | ✅ | ✅ | Active plan | 1 |
| address_line | Text | ✅ | ✅ | ✅ | Non-empty | 1 |
| purok_sitio | Text | — | ✅ | ✅ | — | 1 |
| geotag_lat | Hidden (auto) | — | ✅ | ✅ | Via map picker | 1 |
| geotag_lng | Hidden (auto) | — | ✅ | ✅ | Via map picker | 1 |
| kyc_id_type | Select | — | ✅ | ✅ | Lookup | 1 |
| kyc_id_number | Text | — | ✅ | ✅ | — | 1 |
| notes | Textarea | — | ✅ | ✅ | Max 1000 chars | 1 |

### 2.2 Agreement Create/Edit Form

| Field | Type | Required | Create | Edit | Validation | Phase |
|-------|------|:--------:|:------:|:----:|-----------|:-----:|
| partner_id | Select | ✅ | ✅ | ❌ | Must exist | 0 |
| barangay_id | Select | ✅ | ✅ | ❌ | Must exist | 0 |
| effective_date | Date | ✅ | ✅ | ✅ | Future or today | 0 |
| end_date | Date | — | ✅ | ✅ | > effective_date | 0 |
| share_type | Radio | ✅ | ✅ | ✅ | GROSS / NET | 0 |
| partner_percentage | Number | ✅ | ✅ | ✅ | 0.01–100.00 | 0 |
| deduction_buckets | Repeater | Cond. | ✅ | ✅ | Required if NET; sum ≤ 100% | 0 |
| notes | Textarea | — | ✅ | ✅ | Max 2000 chars | 0 |

### 2.3 Payment Posting Form

| Field | Type | Required | Validation | Phase |
|-------|------|:--------:|-----------|:-----:|
| subscriber_id | Combobox (search) | ✅ | Must exist, has outstanding invoices | 2 |
| amount | Currency | ✅ | > 0, DECIMAL(18,2) | 2 |
| method | Select | ✅ | PaymentMethod enum | 2 |
| receipt_reference | Text | ✅* | Required for CASH, GCASH | 2 |
| notes | Textarea | — | Max 500 chars | 2 |

*On submit: display FIFO application preview before confirming.

### 2.4 Ticket Create Form

| Field | Type | Required | Validation | Phase |
|-------|------|:--------:|-----------|:-----:|
| subscriber_id | Combobox (search) | ✅ | Must exist | 1 |
| category | Select | ✅ | TicketCategory enum | 1 |
| description | Textarea | ✅ | Min 10 chars | 1 |
| priority | Auto + Override | — | System sets default from category; manual override allowed | 1 |
| related_asset_id | Select | — | Network asset in subscriber's barangay | 1 |

---

## 3. State Transition Matrix (What Actions Are Allowed)

### 3.1 Subscriber Status Actions

| Current Status | Allowed Actions | New Status | Required Role | Requires Reason |
|---------------|-----------------|-----------|---------------|:---------------:|
| PROSPECT | Complete Survey | SURVEYED | Brgy Mgr, Tech | — |
| SURVEYED | Pass Feasibility | INSTALLATION_READY | Ops Mgr, Brgy Mgr | — |
| SURVEYED | Fail Feasibility | PROSPECT | Ops Mgr | ✅ |
| INSTALLATION_READY | Activate | ACTIVE | Net Eng, Ops Mgr | — |
| ACTIVE | Soft Suspend | SUSPENDED_SOFT | System, Finance | ✅ |
| SUSPENDED_SOFT | Hard Suspend | SUSPENDED_HARD | System, Finance | ✅ |
| SUSPENDED_SOFT | Reactivate | ACTIVE | System (auto), Finance | — |
| SUSPENDED_HARD | Reactivate | ACTIVE | Finance, Corp Admin | — |
| ACTIVE | Disconnect | DISCONNECTED | Corp Admin, Ops Mgr | ✅ |
| SUSPENDED_HARD | Disconnect | DISCONNECTED | Corp Admin, Finance | ✅ |
| DISCONNECTED | Reconnect | ACTIVE | Corp Admin | ✅ |
| DISCONNECTED | Churn | CHURNED | System | — |

### 3.2 Installation Job Actions

| Current Status | Allowed Actions | New Status | Role |
|---------------|-----------------|-----------|------|
| LEAD_CREATED | Schedule Survey | SURVEY_SCHEDULED | Ops Mgr, Brgy Mgr |
| SURVEY_SCHEDULED | Complete Survey | SURVEY_COMPLETED | Tech, Brgy Mgr |
| SURVEY_COMPLETED | Mark Feasible | FEASIBLE | Ops Mgr, Brgy Mgr |
| SURVEY_COMPLETED | Mark Not Feasible | NOT_FEASIBLE | Ops Mgr |
| FEASIBLE | Schedule Install | INSTALL_SCHEDULED | Ops Mgr |
| INSTALL_SCHEDULED | Complete Install | INSTALLED | Tech |
| INSTALL_SCHEDULED | Mark Failed | FAILED | Tech, Ops Mgr |
| INSTALL_SCHEDULED | Reschedule | RESCHEDULED → INSTALL_SCHEDULED | Ops Mgr |
| INSTALLED | Activate | ACTIVATED | Net Eng |
| ACTIVATED | QA Verify | QA_VERIFIED | Ops Mgr |
| QA_VERIFIED | Start Billing | BILLING_STARTED | System |
| FAILED | Retry Schedule | INSTALL_SCHEDULED | Ops Mgr |

### 3.3 Ticket Actions

| Current Status | Allowed Actions | New Status | Role |
|---------------|-----------------|-----------|------|
| OPEN | Assign | ASSIGNED | Ops Mgr |
| ASSIGNED | Start Work | IN_PROGRESS | Tech |
| IN_PROGRESS | Await Customer | PENDING_CUSTOMER | Tech, CS |
| PENDING_CUSTOMER | Customer Responds | IN_PROGRESS | CS |
| IN_PROGRESS | Resolve | RESOLVED | Tech, CS |
| RESOLVED | Close | CLOSED | CS, Ops Mgr |
| RESOLVED | Reopen | REOPENED → ASSIGNED | CS |
| Any (except CLOSED) | Escalate | ESCALATED | CS, Ops Mgr |
| ESCALATED | Re-assign | ASSIGNED | Ops Mgr |

### 3.4 Invoice Actions

| Current Status | Allowed Actions | New Status | Role |
|---------------|-----------------|-----------|------|
| DRAFT | Finalize | GENERATED | System |
| GENERATED | Send | SENT | System |
| SENT | Post Payment (partial) | PARTIALLY_PAID | Collection |
| SENT | Post Payment (full) | PAID | Collection |
| PARTIALLY_PAID | Post Payment (remaining) | PAID | Collection |
| SENT/PARTIALLY_PAID | Mark Overdue | OVERDUE | System |
| OVERDUE | Post Payment | PAID | Collection |
| OVERDUE | Write Off | WRITTEN_OFF | Finance (approval) |
| GENERATED | Void | VOIDED | Finance |

### 3.5 Settlement Actions

| Current Status | Allowed Actions | New Status | Role |
|---------------|-----------------|-----------|------|
| DRAFTED | Calculate | CALCULATED | Finance |
| CALCULATED | Submit | UNDER_REVIEW | Finance |
| UNDER_REVIEW | Approve | APPROVED | Corp Admin |
| UNDER_REVIEW | Dispute | DISPUTED | Finance, JV Partner |
| DISPUTED | Recalculate | CALCULATED | Finance |
| APPROVED | Disburse | DISBURSED | Finance |
| DISBURSED | Lock | LOCKED | Finance, Corp Admin |

---

## 4. UI Action Button Matrix

### Per-Screen Action Buttons

| Screen | Primary Action | Secondary Actions | Bulk Actions |
|--------|---------------|-------------------|-------------|
| Subscriber List | + New Subscriber | Export CSV, Filter | — |
| Subscriber Detail | Edit | Create Ticket, Post Payment, Change Plan, Suspend | — |
| Ticket List | + New Ticket | Export CSV, Filter | Bulk Assign |
| Ticket Detail | — | Assign, Resolve, Escalate, Close | — |
| Invoice List | — | Export CSV, Filter | — |
| Invoice Detail | — | Void, Adjust | — |
| Payment Posting | Post Payment | — | — |
| Asset List | + New Asset | Export CSV, Filter | — |
| Installation Pipeline | — | Filter by status | Bulk Assign Tech |
| Settlement List | + New Settlement | Export CSV, Filter | — |
| Settlement Detail | — | Submit, Approve, Disburse, Lock | — |
| User List | + New User | — | Bulk Deactivate |

---

## 5. Filter Configuration per List Screen

| Screen | Filters Available |
|--------|------------------|
| Subscriber List | Barangay, Status, Plan, Billing Class, Date Created Range |
| Ticket List | Barangay, Status, Priority, Category, Assigned Technician, SLA Breached (Y/N) |
| Invoice List | Barangay, Status, Subscriber, Date Range, Amount Range |
| Payment History | Barangay, Subscriber, Method, Date Range |
| Asset List | Barangay, Asset Type, Status, Parent Asset |
| Installation Pipeline | Barangay, Status, Technician, Date Range |
| Settlement List | Partner, Barangay, Status, Period |
| Audit Log Explorer | Entity Type, Entity ID, Actor, Action, Barangay, Date Range |
