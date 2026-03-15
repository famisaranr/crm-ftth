# E2E Test Scenarios
## FiberOps PH – End-to-End Test Plan

**Document ID**: E2E-FOPS-001
**Version**: 1.0
**Date**: 2026-03-07

---

## 1. Test Environment

| Component | Configuration |
|-----------|-------------|
| Database | Dedicated test PostgreSQL (reset between suites) |
| Redis | Dedicated test Redis |
| Seed data | 4 barangays, 3 partners, 12 roles, 100 subscribers, sample network |
| Test users | One per role (12 accounts) |
| Tool | Jest + Supertest (API) |

---

## 2. Critical Path Test Scenarios

### E2E-001: Subscriber Onboarding (Full Lifecycle)

**Priority**: P1 — Must pass before every release

| Step | Action | Expected Result |
|:----:|--------|-----------------|
| 1 | Login as Barangay Manager | JWT token received |
| 2 | POST /subscribers (new prospect) | Status 201, status = PROSPECT, account_number generated |
| 3 | Login as Field Technician | JWT token received |
| 4 | PATCH /installations/:id/status → SURVEY_COMPLETED | Status 200 |
| 5 | Login as Ops Manager | JWT token received |
| 6 | PATCH /installations/:id/status → FEASIBLE | Status 200 |
| 7 | PATCH /installations/:id/status → INSTALL_SCHEDULED | Status 200, technician assigned |
| 8 | Login as Technician | JWT token received |
| 9 | PATCH /installations/:id/status → INSTALLED | Status 200 |
| 10 | Login as Network Engineer | JWT token received |
| 11 | PATCH /installations/:id/activate | Status 200, subscriber → ACTIVE |
| 12 | Verify subscriber status = ACTIVE | Confirmed |
| 13 | Verify ONT assigned to subscriber | ont_device.subscriber_id = subscriber.id |
| 14 | Verify audit trail has all transitions | 7+ audit entries for this subscriber |

---

### E2E-002: Billing Cycle → Payment → Balance

**Priority**: P1

| Step | Action | Expected Result |
|:----:|--------|-----------------|
| 1 | Create 3 active subscribers (₱1,500/mo plan) | 3 subscribers with ACTIVE status |
| 2 | Login as Finance, trigger billing cycle | 3 invoices generated |
| 3 | Verify each invoice total = ₱1,500.00 | Amounts match plan rate |
| 4 | Verify ledger CHARGE entries created | 3 CHARGE entries |
| 5 | Login as Collection Officer | JWT token received |
| 6 | Post ₱1,500 payment for sub #1 | Invoice → PAID |
| 7 | Verify ledger PAYMENT entry | Balance = ₱0.00 |
| 8 | Post ₱2,000 payment for sub #2 | Invoice → PAID + ₱500 credit |
| 9 | Post ₱500 payment for sub #3 | Invoice → PARTIALLY_PAID |
| 10 | Verify running balances | Sub1: ₱0, Sub2: -₱500, Sub3: ₱1,000 |

---

### E2E-003: Suspension & Reactivation

**Priority**: P1

| Step | Action | Expected Result |
|:----:|--------|-----------------|
| 1 | Create subscriber with unpaid invoice (due 20 days ago) | Status = ACTIVE |
| 2 | Run suspension check job | Status → SUSPENDED_SOFT |
| 3 | Verify suspension_action logged (type: SOFT) | Record exists |
| 4 | Advance time to 35 days overdue | — |
| 5 | Run suspension check job again | Status → SUSPENDED_HARD |
| 6 | Post full payment + reactivation fee | — |
| 7 | Verify status → ACTIVE | Confirmed |
| 8 | Verify reactivation audit entry | Exists with reason |

---

### E2E-004: Settlement Calculation & Approval

**Priority**: P1

| Step | Action | Expected Result |
|:----:|--------|-----------------|
| 1 | Setup: Partner agreement (30% NET, 10% deductions) | Agreement created |
| 2 | Create 10 paid invoices totaling ₱50,000 for period | Payments posted |
| 3 | Login as Finance, create settlement | Status = CALCULATED |
| 4 | Verify gross_revenue = ₱50,000 | Correct |
| 5 | Verify deductions = ₱5,000 (10%) | Correct |
| 6 | Verify net_revenue = ₱45,000 | Correct |
| 7 | Verify partner_share = ₱13,500 (30%) | Correct |
| 8 | Verify operator_share = ₱31,500 (70%) | Correct |
| 9 | Verify partner_share + operator_share = net_revenue | ₱13,500 + ₱31,500 = ₱45,000 ✅ |
| 10 | Submit for review | Status → UNDER_REVIEW |
| 11 | Login as Corp Admin, approve | Status → APPROVED |
| 12 | Disburse and lock | Status → LOCKED |
| 13 | Attempt to modify locked settlement | 423 Locked error |
| 14 | Recalculate (idempotent check) | Same values produced |

---

### E2E-005: Tenant Isolation

**Priority**: P1

| Step | Action | Expected Result |
|:----:|--------|-----------------|
| 1 | Login as Brgy Manager for Barangay A | Token with barangayIds=[A] |
| 2 | GET /subscribers | Only Barangay A subscribers |
| 3 | GET /subscribers/:id (Barangay B subscriber) | 403 Forbidden |
| 4 | POST /subscribers {barangay_id: B} | 403 Forbidden |
| 5 | GET /billing/invoices | Only Barangay A invoices |
| 6 | Login as Corp Admin | Token with global scope |
| 7 | GET /subscribers | All barangay subscribers |
| 8 | Login as JV Partner viewer | Token with partnerId=[P1] |
| 9 | GET /settlements | Only Partner P1 settlements |
| 10 | GET /settlements/:id (Partner P2 settlement) | 403 Forbidden |

---

### E2E-006: RBAC Enforcement

**Priority**: P1

| Step | Action | Expected Result |
|:----:|--------|-----------------|
| 1 | Login as Customer Service | Token received |
| 2 | POST /subscribers (create) | 201 Created (has permission) |
| 3 | POST /billing/payments (post payment) | 403 Forbidden (no permission) |
| 4 | GET /admin/users | 403 Forbidden (no permission) |
| 5 | Login as Collection Officer | Token received |
| 6 | POST /billing/payments | 201 Created (has permission) |
| 7 | POST /billing/payments/:id/reverse | 403 Forbidden (no permission) |
| 8 | Login as Finance Officer | Token received |
| 9 | POST /billing/payments/:id/reverse | 200 OK (has permission) |

---

### E2E-007: Ticket Lifecycle with SLA

**Priority**: P2

| Step | Action | Expected Result |
|:----:|--------|-----------------|
| 1 | CS creates P1_CRITICAL ticket | Status = OPEN |
| 2 | Ops Manager assigns technician | Status = ASSIGNED |
| 3 | Wait simulated 5 hours (past SLA) | SLA breach flag set |
| 4 | Technician resolves ticket | Status = RESOLVED |
| 5 | CS closes ticket | Status = CLOSED |
| 6 | Verify all audit entries + notes | Complete trail |

---

### E2E-008: Network Topology Constraints

**Priority**: P2

| Step | Action | Expected Result |
|:----:|--------|-----------------|
| 1 | Create OLT → PON Port (capacity: 2) | Assets created |
| 2 | Create Splitter → 2 ONTs | Assets created |
| 3 | Assign ONT #1 to Subscriber A | Success |
| 4 | Assign ONT #2 to Subscriber B | Success |
| 5 | Attempt to add ONT #3 under same splitter | Capacity error |
| 6 | Attempt to assign ONT #1 to Subscriber C | Already assigned error |

---

### E2E-009: Barangay & JV Partner Setup

**Priority**: P1

| Step | Action | Expected Result |
|:----:|--------|-----------------|
| 1 | Login as Corp Admin | JWT token received |
| 2 | POST /barangays (create Barangay San Isidro) | Status 201, barangay_id returned |
| 3 | POST /partners (create JV partner "Del Rosario Co") | Status 201, partner_id returned |
| 4 | POST /agreements (30% NET, monthly settlement, 10% deductions) | Status 201, agreement linked to barangay + partner |
| 5 | Verify partner agreement is queryable | GET /agreements/:id returns correct terms |
| 6 | Create user scoped to new barangay | Barangay Manager created with scope = [San Isidro] |
| 7 | Login as new Barangay Manager | Token with barangayIds = [San Isidro] |
| 8 | Verify scope: GET /subscribers returns empty list (new barangay) | 200, data = [] |
| 9 | Verify audit trail for all creation events | 4+ audit entries (barangay, partner, agreement, user) |

---

### E2E-010: Dashboard Totals Validation

**Priority**: P1

| Step | Action | Expected Result |
|:----:|--------|-----------------|
| 1 | Seed known test data: 5 subscribers (3 ACTIVE, 1 SUSPENDED_SOFT, 1 PROSPECT) | Data seeded |
| 2 | Seed 3 invoices (₱1,500 each, 2 PAID, 1 OVERDUE) | Data seeded |
| 3 | Seed 2 tickets (1 OPEN, 1 RESOLVED) | Data seeded |
| 4 | Login as Corp Admin | JWT token received |
| 5 | GET /dashboards/corporate | 200, KPI data returned |
| 6 | Verify total_subscribers = 5 | Correct |
| 7 | Verify active_subscribers = 3 | Correct |
| 8 | Verify suspended_subscribers = 1 | Correct |
| 9 | Verify total_revenue = ₱3,000.00 (2 paid × ₱1,500) | Correct |
| 10 | Verify total_outstanding = ₱1,500.00 (1 overdue) | Correct |
| 11 | Verify open_tickets = 1 | Correct |
| 12 | Login as Barangay Manager (scoped to Barangay A only) | JWT token received |
| 13 | GET /dashboards/barangay | Only Barangay A data in totals |
| 14 | Verify scoped totals match actual Barangay A data | Correct (no cross-barangay leakage) |

---

## 3. Smoke Test Suite (Post-Deployment)

Run after every staging/production deployment:

| # | Test | Endpoint | Expected |
|:-:|------|----------|----------|
| 1 | Health check | GET /api/v1/health | `status: "ok"` |
| 2 | Login | POST /api/v1/auth/login | 200 + token |
| 3 | List subscribers | GET /api/v1/subscribers | 200 + paginated data |
| 4 | View dashboard | GET /api/v1/dashboards/corporate | 200 + KPI data |
| 5 | List tickets | GET /api/v1/tickets | 200 + paginated data |
| 6 | List invoices | GET /api/v1/billing/invoices | 200 + paginated data |

---

## 4. Test Data Reset Strategy

| Environment | Strategy |
|-------------|---------|
| CI | Fresh database per run (migrate + seed) |
| Staging | Reset weekly; re-seed with demo data |
| Production | Never reset; use separate test tenant for smoke tests |

---

## 5. Additional Test Scenarios

### E2E-011: Service Plans Management

**Priority**: P2

| Step | Action | Expected Result |
|:----:|--------|-----------------|
| 1 | Login as Corp Admin | JWT token received |
| 2 | POST /api/v1/plans | Status 201, plan created |
| 3 | GET /api/v1/plans | Status 200, plan listed |
| 4 | PATCH /api/v1/plans/:id | Status 200, plan updated |

---

### E2E-012: Reports & Analytics

**Priority**: P2

| Step | Action | Expected Result |
|:----:|--------|-----------------|
| 1 | Login as Finance | JWT token received |
| 2 | GET /api/v1/reports/revenue-barangay | Status 200, summary payload |
| 3 | GET /api/v1/dashboards/corporate | Status 200, KPI payload |

---

### E2E-013: System Settings & Audit

**Priority**: P2

| Step | Action | Expected Result |
|:----:|--------|-----------------|
| 1 | Login as Super Admin | JWT token received |
| 2 | GET /api/v1/settings | Status 200 |
| 3 | PATCH /api/v1/settings | Status 200, settings updated |
| 4 | Login as Auditor | JWT token received |
| 5 | GET /api/v1/audit-logs | Status 200, audit trail listed |
