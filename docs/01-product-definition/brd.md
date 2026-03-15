# Business Requirements Document (BRD)
## FiberOps PH – FTTH Barangay Multi-JV CRM / OSS-BSS Platform

**Document ID**: BRD-FOPS-001
**Version**: 1.0
**Date**: 2026-03-07
**Status**: Draft – For Review

---

## 1. Executive Summary

FiberOps PH is a web-based telecom operations platform that unifies subscriber management, FTTH network inventory, billing, ticketing, and joint venture revenue settlement for Philippine fiber ISP operators running multi-barangay networks.

The platform addresses a critical gap: existing OSS/BSS systems do not support **barangay-level operational segmentation** or **JV partner revenue sharing** — both essential for the decentralized fiber deployment model common in Philippine municipalities.

**Primary value proposition**: One platform that manages the complete lifecycle from subscriber lead through installation, activation, billing, collection, and partner settlement — all scoped per barangay and JV agreement.

---

## 2. Business Objectives

| ID | Objective | Measurable Target |
|----|-----------|-------------------|
| OBJ-001 | Centralize all subscriber operations | 100% of subscriber lifecycle managed in-platform |
| OBJ-002 | Automate billing and collection tracking | Invoice generation within 1 business day of cycle close |
| OBJ-003 | Enable accurate JV partner settlements | Settlement statements generated monthly, auditable to source transactions |
| OBJ-004 | Provide operational visibility per barangay | Real-time dashboards for subscriber count, revenue, arrears, utilization |
| OBJ-005 | Enforce strict data partitioning | Zero cross-barangay data leakage for scoped users |
| OBJ-006 | Maintain complete audit trail | 100% of financial mutations and status changes logged |
| OBJ-007 | Support scalable barangay rollout | Add new barangay+JV in <1 hour of configuration |

---

## 3. Stakeholder Analysis

| Stakeholder | Interest | Benefit from Platform |
|-------------|----------|----------------------|
| **Fiber Operator (Company)** | Profitability, operational efficiency | Unified operations, automated billing, real-time reporting |
| **JV Partners** | Revenue transparency, fair settlement | Self-service statement viewing, auditable calculations |
| **Barangay Managers** | Local operational control | Scoped dashboard, subscriber and ticket management |
| **Finance Team** | Accurate collections, settlement | Automated invoicing, payment tracking, aging reports |
| **Network Engineering** | Asset utilization, fault tracking | Network hierarchy, capacity views, ticket integration |
| **Field Technicians** | Clear job assignments | Installation job orders, ticket dispatch |
| **Subscribers** | Reliable service, fair billing | Accurate invoicing, timely issue resolution |

---

## 4. Business Process Overview

### 4.1 Current State (Typical Small FTTH Operator)
- Subscriber tracking in spreadsheets or fragmented apps
- Manual billing calculations
- No automated suspension enforcement
- JV settlements calculated manually in Excel
- No unified asset-to-subscriber traceability
- Audit trail nonexistent

### 4.2 Future State (With FiberOps PH)
- Single platform for all operational data
- Automated billing cycle with configurable rules
- Rule-based suspension and reactivation
- Automated JV settlement calculation with approval workflow
- Full subscriber → ONT → splitter → OLT traceability chain
- Immutable audit log for all critical operations

---

## 5. Functional Requirements by Domain

### 5.1 Identity & Access (REQ-IAM-*)

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-IAM-001 | User login with email/password | Must |
| REQ-IAM-002 | Role-based access control with 12 predefined roles | Must |
| REQ-IAM-003 | Barangay scope assignment per user | Must |
| REQ-IAM-004 | JV partner scope assignment where applicable | Must |
| REQ-IAM-005 | Password reset via email link | Must |
| REQ-IAM-006 | Session tracking and concurrent session control | Must |
| REQ-IAM-007 | Login attempted audit trail | Must |
| REQ-IAM-008 | Failed login lockout after N attempts | Should |

### 5.2 Tenant / Barangay / JV Structure (REQ-TEN-*)

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-TEN-001 | Register and manage barangays as service areas | Must |
| REQ-TEN-002 | Define service zones within barangays | Should |
| REQ-TEN-003 | Register JV partner entities | Must |
| REQ-TEN-004 | Create JV agreements with effective dates and versions | Must |
| REQ-TEN-005 | Define revenue share templates per agreement | Must |
| REQ-TEN-006 | Configure settlement frequency (default monthly) | Must |
| REQ-TEN-007 | Configure capex and opex attribution rules per agreement | Must |
| REQ-TEN-008 | Support one barangay : one partner model | Must |
| REQ-TEN-009 | Support one barangay : multiple partners model | Should |

### 5.3 Subscriber CRM (REQ-CRM-*)

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-CRM-001 | Track subscriber lifecycle: prospect → surveyed → installation-ready → active → suspended → disconnected → churned | Must |
| REQ-CRM-002 | Subscriber profile with account number, name, contact, address, geotag, barangay, purok/sitio | Must |
| REQ-CRM-003 | Link subscriber to service plan, ONT/CPE, network path | Must |
| REQ-CRM-004 | Track installation status and billing class | Must |
| REQ-CRM-005 | Store subscriber notes and KYC/ID information | Should |
| REQ-CRM-006 | Generate unique account numbers per barangay naming convention | Must |
| REQ-CRM-007 | Quick search by account number, name, or phone | Must |
| REQ-CRM-008 | Filter subscribers by barangay, status, plan, billing class | Must |
| REQ-CRM-009 | Export subscriber list to CSV/Excel | Should |

### 5.4 FTTH Network Asset Registry (REQ-NET-*)

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-NET-001 | Model network hierarchy: OLT → PON port → splitter → distribution box → drop line → ONT/CPE | Must |
| REQ-NET-002 | Track asset status: planned, deployed, active, maintenance, decommissioned, faulty | Must |
| REQ-NET-003 | Record serial numbers, capacity, and utilization per asset | Must |
| REQ-NET-004 | Link assets to barangay and service zone | Must |
| REQ-NET-005 | View linked subscribers per asset | Must |
| REQ-NET-006 | Track maintenance history per asset | Should |
| REQ-NET-007 | Capacity/utilization alerts when thresholds exceeded | Nice |
| REQ-NET-008 | Topology explorer with parent-child relationship navigation | Should |

### 5.5 Installation & Activation Workflow (REQ-INS-*)

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-INS-001 | Track stages: lead → survey-scheduled → survey-completed → feasibility → install-scheduled → installed → activated → QA-verified → billing-starts | Must |
| REQ-INS-002 | Create job orders linked to subscribers | Must |
| REQ-INS-003 | Assign technician to job orders | Must |
| REQ-INS-004 | Record materials used per installation | Should |
| REQ-INS-005 | Capture activation date and failed install reason | Must |
| REQ-INS-006 | Support reschedule logic with reason tracking | Must |
| REQ-INS-007 | Photo upload placeholders for installation verification | Nice |
| REQ-INS-008 | Calculate install turnaround time (lead to activation) | Should |

### 5.6 Service Ticketing / Trouble Calls (REQ-TKT-*)

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-TKT-001 | Support categories: no connection, intermittent, slow internet, LOS/red light, fiber cut, billing issue, relocation, upgrade/downgrade, ONT replacement, complaint, escalation | Must |
| REQ-TKT-002 | SLA priority assignment (P1-P4) | Must |
| REQ-TKT-003 | Technician assignment and field visit tracking | Must |
| REQ-TKT-004 | Resolution notes and closure code | Must |
| REQ-TKT-005 | Ticket aging calculation and display | Must |
| REQ-TKT-006 | Escalation workflow | Should |
| REQ-TKT-007 | Dispatch board view for technician scheduling | Should |
| REQ-TKT-008 | Link tickets to subscriber and network assets | Must |

### 5.7 Plans / Products / Pricing (REQ-PLN-*)

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-PLN-001 | Define service plans with speed tiers and monthly fees | Must |
| REQ-PLN-002 | Configure installation fees (one-time) | Must |
| REQ-PLN-003 | Support promo periods with discounted rates | Should |
| REQ-PLN-004 | Configure late payment penalties | Must |
| REQ-PLN-005 | Support barangay-specific pricing overrides | Nice |
| REQ-PLN-006 | Support partner-specific commercial overrides | Nice |
| REQ-PLN-007 | Plan versioning with effective dates | Should |
| REQ-PLN-008 | Discount template configuration | Should |

### 5.8 Billing / Invoicing / Collection (REQ-BIL-*)

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-BIL-001 | Configurable billing cycle setup (monthly) | Must |
| REQ-BIL-002 | Automated invoice generation per cycle | Must |
| REQ-BIL-003 | Prorated billing for mid-cycle activations | Must |
| REQ-BIL-004 | Payment posting with method tracking (cash, GCash, bank, etc.) | Must |
| REQ-BIL-005 | Penalty calculation on overdue invoices | Must |
| REQ-BIL-006 | Credit/debit adjustments with reason codes | Must |
| REQ-BIL-007 | Write-off capability with approval | Should |
| REQ-BIL-008 | Invoice aging report (current, 30, 60, 90, 120+ days) | Must |
| REQ-BIL-009 | OR/receipt reference per payment | Must |
| REQ-BIL-010 | Account ledger with running balance | Must |
| REQ-BIL-011 | Payment channel tracking (cash, GCash, bank transfer, check, online) | Must |

### 5.9 Suspension / Reactivation Logic (REQ-SUS-*)

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-SUS-001 | Configurable grace period after due date | Must |
| REQ-SUS-002 | Soft suspension trigger (warning/throttle state) | Must |
| REQ-SUS-003 | Hard suspension trigger (service disabled) | Must |
| REQ-SUS-004 | Auto-reactivation upon full payment | Must |
| REQ-SUS-005 | Reactivation fee configuration and application | Should |
| REQ-SUS-006 | Manual override with audit log entry | Must |
| REQ-SUS-007 | Suspension queue view for operations team | Must |

### 5.10 JV Revenue Sharing / Settlement (REQ-JVS-*)

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-JVS-001 | Revenue share calculation per barangay per partner agreement | Must |
| REQ-JVS-002 | Support gross revenue basis formula | Must |
| REQ-JVS-003 | Support net revenue basis formula (gross minus allowed deductions) | Must |
| REQ-JVS-004 | Configurable deduction buckets (opex, maintenance, admin) | Must |
| REQ-JVS-005 | Monthly settlement period with auto-calculation trigger | Must |
| REQ-JVS-006 | Manual adjustment with approval workflow | Must |
| REQ-JVS-007 | Partner payable report generation | Must |
| REQ-JVS-008 | Settlement approval workflow (calculate → review → approve → disburse) | Must |
| REQ-JVS-009 | Partner statement export (PDF/CSV) | Should |
| REQ-JVS-010 | Historical agreement versioning | Must |
| REQ-JVS-011 | Locked settlement periods (prevent re-calculation) | Must |
| REQ-JVS-012 | Historical recalculation rules with explicit unlock | Should |

### 5.11 Geographic / Fiber Topology View (REQ-GEO-*)

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-GEO-001 | Display service address coordinates on map | Should |
| REQ-GEO-002 | Barangay boundary segmentation on map | Should |
| REQ-GEO-003 | Fiber topology association visualization | Nice |
| REQ-GEO-004 | Asset location points on map | Should |
| REQ-GEO-005 | Subscriber density heatmap view | Nice |

> **Note**: Phase 1 uses simplified map visualization. Phase 2 supports richer GIS/topology rendering.

### 5.12 Reports / Dashboards / KPIs (REQ-RPT-*)

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-RPT-001 | Corporate dashboard: subscriber growth, revenue, collections, arrears | Must |
| REQ-RPT-002 | Barangay dashboard: local subscriber, installation, and ticket metrics | Must |
| REQ-RPT-003 | Finance dashboard: collections, aging, settlement due | Must |
| REQ-RPT-004 | Network dashboard: utilization, ticket volume, fault trends | Should |
| REQ-RPT-005 | Revenue by barangay report | Must |
| REQ-RPT-006 | Revenue by partner report | Must |
| REQ-RPT-007 | ARPU calculation | Should |
| REQ-RPT-008 | Churn rate tracking | Should |
| REQ-RPT-009 | Install turnaround time report | Should |
| REQ-RPT-010 | CSV/Excel export for all reports | Must |

### 5.13 Audit Logs / Compliance (REQ-AUD-*)

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-AUD-001 | Log all financial mutations with before/after values | Must |
| REQ-AUD-002 | Log all status changes with actor and timestamp | Must |
| REQ-AUD-003 | Audit log explorer with filtering by entity, actor, date range | Must |
| REQ-AUD-004 | Immutable audit records (append-only) | Must |
| REQ-AUD-005 | Reason code capture for adjustments, overrides, and write-offs | Must |
| REQ-AUD-006 | Data export event logging | Should |

### 5.14 Settings / Master Data / Rule Engine (REQ-SET-*)

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-SET-001 | System settings management (billing defaults, suspension thresholds) | Must |
| REQ-SET-002 | Master data CRUD for ticket categories, SLA definitions | Must |
| REQ-SET-003 | Master data CRUD for network asset types | Must |
| REQ-SET-004 | Master data CRUD for payment methods | Must |
| REQ-SET-005 | Business rule versioning with effective dates | Should |

---

## 6. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-001 | Performance | Page load < 3 seconds for list views with up to 10,000 records |
| NFR-002 | Performance | Dashboard aggregate queries < 5 seconds |
| NFR-003 | Availability | 99.5% uptime target during business hours |
| NFR-004 | Scalability | Support up to 50 barangays and 100,000 subscribers |
| NFR-005 | Security | All data in transit encrypted (HTTPS/TLS) |
| NFR-006 | Security | Passwords hashed with bcrypt/argon2 |
| NFR-007 | Compliance | Philippine Data Privacy Act (RA 10173) compliant |
| NFR-008 | Usability | Responsive on desktop and tablet (field use) |
| NFR-009 | Backup | Daily automated database backup |
| NFR-010 | Recovery | RPO < 24 hours, RTO < 4 hours |

---

## 7. Constraints

| ID | Constraint | Impact |
|----|-----------|--------|
| CON-001 | Rural Philippine connectivity may be intermittent | UI must handle offline/slow states gracefully |
| CON-002 | Field technicians may use low-spec tablets | Interface must work on modest hardware |
| CON-003 | Local payment methods (GCash, cash, bank transfer) predominant | Must support Philippine payment channels |
| CON-004 | Barangay governance structures vary | Configuration must be flexible per barangay |
| CON-005 | Single operator initially, multi-operator future | Architecture must support future SaaS upgrade |

---

## 8. Assumptions

| ID | Assumption | Rationale |
|----|-----------|-----------|
| ASM-001 | Phase 1 is single-operator, multi-barangay, multi-JV | Per Master Orchestrator Prompt section 4.1 |
| ASM-002 | All users have web browser access | No native mobile app in Phase 1 |
| ASM-003 | Financial calculations use PHP (Philippine Peso) only | No multi-currency in Phase 1 |
| ASM-004 | Billing cycles are monthly | Most common for ISP billing |
| ASM-005 | Internet connectivity exists at operator HQ | Server-side operations require connectivity |
| ASM-006 | JV partner agreements are pre-negotiated offline | System records terms, doesn't negotiate them |

---

## 9. Out of Scope

| Item | Phase |
|------|-------|
| Customer self-service portal | Phase 2 |
| Technician native mobile app | Phase 2 |
| SMS/email notifications | Phase 2 |
| Online payment gateway integration | Phase 2 |
| GIS-heavy fiber route editor | Phase 2 |
| Mikrotik / RADIUS / OLT API integration | Phase 2 |
| Document storage / management | Phase 2 |
| Accounting system integration (QuickBooks, etc.) | Phase 2 |
| Multi-currency support | Phase 2+ |
| Multi-operator SaaS mode | Phase 2 readiness, not Phase 1 |
