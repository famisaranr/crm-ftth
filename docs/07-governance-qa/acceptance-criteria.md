# Acceptance Criteria
## FiberOps PH – Feature-Level Acceptance Criteria

**Document ID**: ACC-FOPS-001
**Version**: 1.0
**Date**: 2026-03-07

---

## 1. Auth & User Management

### AC-AUTH-001: User Login
```gherkin
GIVEN a user with valid credentials and ACTIVE status
WHEN they submit email and password via POST /api/v1/auth/login
THEN the system returns a JWT access token (15min TTL) and sets a refresh token cookie (7 day TTL)
AND the system logs an audit event (user.login)
AND last_login_at is updated

GIVEN a user with invalid password
WHEN they attempt login
THEN the system returns 401 Unauthorized
AND failed_login_count is incremented
AND audit event (user.login_failed) is logged

GIVEN a user with failed_login_count >= 5 within 15 minutes
WHEN they attempt login
THEN the system returns 423 Locked with message "Account locked. Try again in 30 minutes."
AND locked_until is set to now() + 30 minutes
```

### AC-AUTH-002: Token Refresh
```gherkin
GIVEN a valid, non-revoked refresh token cookie
WHEN the client calls POST /api/v1/auth/refresh
THEN a new access token is returned

GIVEN an expired or revoked refresh token
WHEN the client calls POST /api/v1/auth/refresh
THEN the system returns 401 and the client must redirect to login
```

---

## 2. Subscriber Management

### AC-SUB-001: Create Subscriber
```gherkin
GIVEN a user with subscribers.subscriber.create permission
AND the user has scope for the target barangay
WHEN they submit a valid subscriber form via POST /api/v1/subscribers
THEN a new subscriber is created with status PROSPECT
AND an account_number is auto-generated in format {BRGY_CODE}-{SEQ}
AND audit event (subscriber.created) is logged

GIVEN a user WITHOUT scope for the target barangay
WHEN they attempt to create a subscriber in that barangay
THEN the system returns 403 Forbidden
```

### AC-SUB-002: Subscriber Status Transitions
```gherkin
GIVEN a subscriber with status ACTIVE
WHEN the system detects unpaid invoice overdue > 15 days
THEN the subscriber status changes to SUSPENDED_SOFT
AND a suspension_action record is created with type SOFT
AND audit event (subscriber.suspended) is logged
AND subscriber.suspended domain event is emitted

GIVEN a subscriber with status SUSPENDED_SOFT
WHEN payment covering all outstanding invoices is posted
THEN the subscriber status automatically changes to ACTIVE
AND a suspension_action record is created with type REACTIVATED
AND audit event (subscriber.reactivated) is logged
```

### AC-SUB-003: Tenant Scoping
```gherkin
GIVEN a Barangay Manager scoped to Barangay A
WHEN they call GET /api/v1/subscribers
THEN ONLY subscribers in Barangay A are returned

GIVEN a Barangay Manager scoped to Barangay A
WHEN they attempt to view a subscriber in Barangay B by ID
THEN the system returns 403 Forbidden
```

---

## 3. Billing

### AC-BIL-001: Invoice Generation
```gherkin
GIVEN an active billing cycle for a barangay
WHEN a Finance user triggers invoice generation
THEN an invoice is created for each subscriber with status ACTIVE, SUSPENDED_SOFT, or SUSPENDED_HARD
AND each invoice has a MONTHLY_CHARGE line item equal to the subscriber's plan monthly_fee
AND if subscriber has an active promo, a PROMO_DISCOUNT line is included
AND invoice.total_amount = SUM(invoice_lines.amount)
AND a CHARGE ledger entry is created for each subscriber
```

### AC-BIL-002: Payment Posting (FIFO)
```gherkin
GIVEN a subscriber with 3 unpaid invoices (₱1,500 each, dated Jan, Feb, Mar)
WHEN a Collection Officer posts a payment of ₱2,000
THEN the January invoice is marked PAID (₱1,500 applied)
AND the February invoice is marked PARTIALLY_PAID (₱500 applied)
AND the March invoice remains SENT
AND a PAYMENT ledger entry of ₱2,000 is created
AND the subscriber's running balance is recalculated

GIVEN a subscriber with 1 unpaid invoice of ₱1,500
WHEN a payment of ₱2,000 is posted
THEN the invoice is marked PAID
AND a PAYMENT ledger entry of ₱2,000 is created
AND a CREDIT ledger entry of ₱500 (overpayment) is created
```

### AC-BIL-003: Proration
```gherkin
GIVEN a new subscriber activated on March 15 (31-day month)
AND their plan is ₱1,500/month
WHEN the March invoice is generated
THEN a PRORATE_CHARGE line of ₱822.58 (= ₱1,500 × 17/31) is created
AND no MONTHLY_CHARGE line is created for March
```

### AC-BIL-004: Late Penalty
```gherkin
GIVEN a subscriber with an OVERDUE invoice past the grace period (15 days)
AND billing.penalty_type = FIXED and billing.penalty_fixed_amount = 50.00
WHEN the penalty job runs
THEN a PENALTY line of ₱50.00 is added to the invoice
AND the invoice total is recalculated
AND a PENALTY ledger entry is created

GIVEN an OVERDUE invoice that already has a PENALTY line
WHEN the penalty job runs again
THEN no additional penalty is applied (one penalty per invoice)
```

---

## 4. Settlement

### AC-SET-001: Settlement Calculation (Net Revenue)
```gherkin
GIVEN an agreement with partner_percentage = 30%, share_type = NET
AND deduction_buckets = [{opex: 5%}, {admin: 3%}, {marketing: 2%}]
AND gross collections for the period = ₱500,000
WHEN Finance triggers calculation
THEN total_deductions = ₱50,000 (5% + 3% + 2% = 10%)
AND net_revenue = ₱450,000
AND partner_share = ₱135,000 (30% of ₱450,000)
AND operator_share = ₱315,000 (70% of ₱450,000)
AND partner_share + operator_share = net_revenue (to the centavo)
AND settlement status = CALCULATED
```

### AC-SET-002: Settlement Approval & Lock
```gherkin
GIVEN a settlement with status UNDER_REVIEW
WHEN a Corp Admin approves it
THEN settlement status changes to APPROVED
AND approved_by and approved_at are set

GIVEN a settlement with status DISBURSED
WHEN Finance locks the period
THEN settlement status changes to LOCKED
AND locked_at is set
AND any subsequent mutation attempt returns 423 Locked
```

### AC-SET-003: Idempotent Recalculation
```gherkin
GIVEN a settlement that has been calculated
WHEN Finance triggers recalculation for the same period
THEN the exact same values are produced
AND no duplicate settlement records are created
```

---

## 5. Installation

### AC-INS-001: Full Installation Pipeline
```gherkin
GIVEN a new subscriber with status PROSPECT
WHEN the installation pipeline completes successfully:
  1. Survey scheduled → Survey completed → Feasible
  2. Install scheduled → Installed → Activated → QA Verified → Billing Started
THEN subscriber status is ACTIVE
AND an ONT device is assigned to the subscriber
AND the first billing invoice is generated
AND audit events are logged for each status transition
```

---

## 6. Tickets

### AC-TKT-001: Ticket Lifecycle
```gherkin
GIVEN a CS user creates a ticket for a subscriber
WHEN the ticket goes through: OPEN → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED
THEN each transition is audit-logged
AND ticket_assignments and ticket_notes are recorded
AND the subscriber's ticket history shows the complete timeline

GIVEN a ticket with priority P1_CRITICAL
AND the SLA response time is 4 hours
WHEN 4 hours pass without resolution
THEN the ticket is flagged as SLA_BREACHED
```

---

## 7. Network

### AC-NET-001: Topology Integrity
```gherkin
GIVEN an OLT with capacity 128 subscribers per PON port
WHEN a Network Engineer attempts to assign the 129th subscriber to that port
THEN the system returns an error "PON port capacity exceeded"

GIVEN an ONT device assigned to Subscriber A
WHEN a Network Engineer attempts to assign the same ONT to Subscriber B
THEN the system returns an error "ONT already assigned"
```

---

## 8. Audit

### AC-AUD-001: Audit Completeness
```gherkin
GIVEN any mutation (POST, PATCH, DELETE) on a business entity
WHEN the request completes successfully
THEN an audit_log entry is created with:
  - entity_type and entity_id
  - action type
  - actor_id, actor_role, actor_ip
  - previous_value (for updates/deletes)
  - new_value
  - barangay_id (for scoped entities)
  - correlation_id
AND sensitive fields (password_hash, kyc_id_number) are sanitized
```

## 9. Tenant Management

### AC-TEN-001: Barangay and Partner Setup (WF-001, WF-002)
```gherkin
GIVEN a Corporate Admin user
WHEN they create a new Barangay
THEN a new barangay record is created with ONBOARDING status
WHEN they create a new Partner
THEN a new JV partner entity is created
WHEN they create a PartnerAgreement linking the Barangay and Partner
AND configure revenue share rules
THEN the agreement is saved with version 1
AND audit events are logged
```

## 10. Product & Pricing

### AC-PLN-001: Service Plan Creation (WF-003)
```gherkin
GIVEN a Corporate Admin user
WHEN they submit a new service plan with valid speed and monthly_fee
THEN the plan is created with status ACTIVE
AND the plan becomes available for subscriber selection
AND an audit event (plan.created) is logged
```

## 11. Reports & Analytics

### AC-RPT-001: Revenue Report Generation (WF-015)
```gherkin
GIVEN a Finance Officer or Corporate Admin
WHEN they request a revenue report for a specific barangay and month
THEN the system aggregates all invoices, payments, and arrears for that barangay
AND calculates ARPU and collection rate
AND returns the report data which matches the underlying ledger entries
```
