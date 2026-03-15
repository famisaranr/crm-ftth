# Product Requirements Document (PRD)
## FiberOps PH – FTTH Barangay Multi-JV CRM / OSS-BSS Platform

**Document ID**: PRD-FOPS-001
**Version**: 1.0
**Date**: 2026-03-07
**Status**: Draft – For Review

---

## 1. Product Vision Statement

> FiberOps PH enables Philippine FTTH operators to manage subscriber lifecycles, network assets, billing, and joint venture settlements across multiple barangays through a single, auditable, role-secured platform — eliminating spreadsheet chaos and enabling scalable fiber rollouts.

---

## 2. Target Users

### Role 1: Super Admin
- **Persona**: Platform administrator / IT lead
- **Goals**: Full system configuration, user management, troubleshooting
- **Scope**: All data, all barangays, all modules
- **Key workflows**: Create users, assign roles, configure system settings, monitor audit logs

### Role 2: Corporate Admin / Head Office
- **Persona**: COO or operations director at operator HQ
- **Goals**: Cross-barangay visibility, strategic decision-making, partner management
- **Scope**: All barangays, all financial and operational data
- **Key workflows**: Review dashboards, manage partner agreements, approve settlements, access all reports

### Role 3: Operations Manager
- **Persona**: Day-to-day operations lead
- **Goals**: Oversee installations, tickets, subscriber health across barangays
- **Scope**: All barangays (operational data), limited financial
- **Key workflows**: Monitor installation pipeline, review ticket aging, track subscriber growth

### Role 4: Barangay Manager
- **Persona**: Local area supervisor for one or more barangays
- **Goals**: Manage local subscribers, installations, and tickets
- **Scope**: Assigned barangay(s) only
- **Key workflows**: Create subscribers, schedule installations, manage local tickets, view barangay dashboard

### Role 5: JV Partner Viewer
- **Persona**: Joint venture partner representative
- **Goals**: View revenue data and settlement statements for their partnership
- **Scope**: Partner-specific financial data only
- **Key workflows**: View settlement statements, review revenue by barangay, download reports

### Role 6: Finance / Billing Officer
- **Persona**: Finance team member at operator HQ
- **Goals**: Manage billing cycles, review collections, process settlements
- **Scope**: All barangays (financial data)
- **Key workflows**: Generate invoices, review aging, process settlements, generate financial reports

### Role 7: Collection Officer / Cashier
- **Persona**: Frontline payment collector
- **Goals**: Record payments, issue receipts, track collections
- **Scope**: Assigned barangay(s), billing data only
- **Key workflows**: Post payments, view subscriber balances, generate collection reports

### Role 8: Network Engineer
- **Persona**: Senior technical staff managing network infrastructure
- **Goals**: Monitor network health, manage FTTH asset hierarchy, capacity planning
- **Scope**: All barangays (network and asset data only)
- **Key workflows**: Register assets, view topology, monitor utilization, review network-related tickets

### Role 9: Field Technician
- **Persona**: On-ground installer/repair technician
- **Goals**: View assigned jobs, update job status, log field visit notes
- **Scope**: Assigned jobs and tickets only
- **Key workflows**: View assigned installations, update installation progress, log ticket field visits

### Role 10: Customer Service / Support
- **Persona**: Help desk agent
- **Goals**: Handle subscriber inquiries, create tickets, view subscriber info
- **Scope**: Assigned barangay(s), subscriber and ticket data
- **Key workflows**: Search subscribers, create/update tickets, view billing info (read-only)

### Role 11: Auditor / Compliance Viewer
- **Persona**: Internal or external auditor
- **Goals**: Review audit trails, verify financial accuracy, compliance checking
- **Scope**: All data (read-only)
- **Key workflows**: Search audit logs, review financial records, verify settlement calculations

### Role 12: Read-only Executive
- **Persona**: Executive leadership without operational responsibilities
- **Goals**: View high-level metrics and dashboards
- **Scope**: All dashboards and reports (read-only)
- **Key workflows**: View corporate dashboard, view revenue reports, view KPIs

---

## 3. User Stories by Role (Priority Tiers)

### Must-Have (Phase 0-1)

| Story ID | Role | User Story | Acceptance Criteria |
|----------|------|-----------|---------------------|
| US-001 | All | As a user, I want to log in securely so that I can access the platform | Login with email/password; JWT token issued; redirect to role-appropriate dashboard |
| US-002 | Super Admin | As a super admin, I want to create users and assign roles so that operations staff can access the system | User created with role; barangay scope assigned; can log in immediately |
| US-003 | Corp Admin | As a corporate admin, I want to register a new barangay and JV partner so that we can begin operations there | Barangay created; partner created; agreement with revenue share rules configured |
| US-004 | Brgy Manager | As a barangay manager, I want to register a new subscriber lead so that we can start the installation process | Subscriber created with status PROSPECT; associated with barangay; unique account number generated |
| US-005 | Brgy Manager | As a barangay manager, I want to schedule and track installations so that subscribers get connected | Job order created; technician assigned; status transitions tracked through activation |
| US-006 | CS Support | As a CS agent, I want to create trouble tickets so that subscriber issues are tracked | Ticket created with category, priority, assignment; linked to subscriber |
| US-007 | Finance | As a finance officer, I want billing cycles to generate invoices automatically so that collections are timely | Invoices generated for all active subscribers in cycle; amounts match plan rates |
| US-008 | Collection | As a collection officer, I want to post payments so that subscriber balances are updated | Payment recorded; invoice status updated; account ledger updated; receipt reference stored |
| US-009 | Finance | As a finance officer, I want to calculate JV partner settlements so that we can settle on time | Settlement calculated per agreement terms; line items traceable to source invoices/payments |
| US-010 | Corp Admin | As a corporate admin, I want a dashboard showing subscriber growth and revenue by barangay | Dashboard shows real-time metrics with filtering by barangay and date range |

### Should-Have (Phase 2)

| Story ID | Role | User Story |
|----------|------|-----------|
| US-011 | Finance | As a finance officer, I want automatic suspension of overdue accounts |
| US-012 | Finance | As a finance officer, I want auto-reactivation when full payment is posted |
| US-013 | Network Eng | As a network engineer, I want to view OLT port utilization to plan capacity |
| US-014 | Ops Manager | As an ops manager, I want the dispatch board to see technician assignments visually |
| US-015 | Finance | As a finance officer, I want invoice aging reports to track overdue accounts |
| US-016 | Auditor | As an auditor, I want to search audit logs by entity, actor, and date range |

### Nice-to-Have (Phase 3-4)

| Story ID | Role | User Story |
|----------|------|-----------|
| US-017 | Brgy Manager | As a barangay manager, I want a map view of subscriber locations |
| US-018 | JV Partner | As a JV partner viewer, I want to download PDF settlement statements |
| US-019 | Executive | As an executive, I want KPI trends with charts and drill-down |
| US-020 | Network Eng | As a network engineer, I want subscriber density heatmaps |

---

## 4. Feature Matrix by Module × Phase

| Module | Phase 0 | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|--------|:-------:|:-------:|:-------:|:-------:|:-------:|
| Auth / IAM | ✅ Login, RBAC, Scoping | — | — | — | — |
| Master Data | ✅ Barangay, Partners, Plans | — | — | — | — |
| Subscriber CRM | — | ✅ Full CRUD, Lifecycle | — | — | — |
| Network Assets | — | ✅ Hierarchy, Linking | — | — | ✅ Topology Map |
| Installation | — | ✅ Full Workflow | — | — | — |
| Ticketing | — | ✅ Full Workflow | — | — | — |
| Dashboards | — | ✅ Basic Counts | — | — | ✅ Analytics |
| Billing | — | — | ✅ Full Billing | — | — |
| Suspension | — | — | ✅ Rule Engine | — | — |
| JV Settlement | — | — | — | ✅ Full Settlement | — |
| Mapping/GIS | — | — | — | — | ✅ Map Views |
| Reports/Export | — | — | — | — | ✅ Advanced |
| Audit Logs | ✅ Framework | ✅ Per Module | ✅ Per Module | ✅ Per Module | ✅ Per Module |

---

## 5. Success Metrics

| KPI | Target | Measurement Method |
|-----|--------|--------------------|
| **Time to new barangay onboarding** | < 1 hour from config to operational | Time from barangay creation to first subscriber entry |
| **Invoice accuracy** | 100% match to plan rates and rules | Automated calculation tests |
| **Settlement accuracy** | 100% match to agreement terms | Cross-verification with manual calculation |
| **Mean time to resolve ticket** | Tracked and reported per category | Ticket open-to-close duration |
| **Installation turnaround** | Tracked and reported | Lead-to-activation duration |
| **Data leakage incidents** | Zero | Automated tenant scope tests |
| **Audit coverage** | 100% of financial mutations logged | Automated audit verification |
| **User adoption** | 80% of operations staff active within 30 days | Login frequency tracking |
