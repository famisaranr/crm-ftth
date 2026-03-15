---
name: "Financial Integrity Check"
description: "Validates billing, settlement, and ledger logic for precision, consistency, and auditability"
---

# Financial Integrity Check Skill

## Purpose
Financial calculations in FiberOps PH are critical paths. This skill validates that all monetary logic is precise, testable, auditable, and correct to the centavo.

---

## When to Invoke
- After Data Architect produces billing-rules.md and revenue-sharing-rules.md
- Before approving Pack 03 (Data & Rules)
- During implementation of billing and settlement modules
- Before any phase gate that involves financial features

---

## Check Categories

### FIN-1: Data Type Precision
- [ ] All monetary fields use `Decimal(18,2)` or equivalent — NEVER `Float`
- [ ] All percentage fields use `Decimal(5,4)` (supports 99.99%)
- [ ] No implicit type coercion between numeric types
- [ ] Currency is explicitly defined (PHP assumed, but field exists for future multi-currency)

### FIN-2: Billing Calculation Integrity
- [ ] Monthly charge = `plan.monthly_rate` (no hidden calculations)
- [ ] Prorated billing formula documented: `(monthly_rate / days_in_month) * active_days`
- [ ] Installation fee is one-time and correctly tagged
- [ ] Promo discount correctly applies for exact N months then stops
- [ ] Late payment penalty formula documented with trigger conditions
- [ ] Adjustment credits/debits tracked with reason codes
- [ ] All calculations are isolated functions (testable without database)

### FIN-3: Payment Posting Logic
- [ ] FIFO aging applied: oldest invoice satisfied first
- [ ] Partial payment correctly splits across invoices
- [ ] Overpayment creates credit balance on account
- [ ] Payment reversal creates offsetting ledger entry (not delete)
- [ ] OR/receipt reference linked to payment record
- [ ] Payment method recorded (cash, GCash, bank, etc.)

### FIN-4: Ledger Consistency
- [ ] Every charge creates a DEBIT ledger entry
- [ ] Every payment creates a CREDIT ledger entry
- [ ] Running balance = SUM(debits) - SUM(credits)
- [ ] Adjustments create properly signed ledger entries
- [ ] Write-offs create CREDIT entries with reason code
- [ ] Ledger entries are IMMUTABLE (append-only)
- [ ] Balance reconciliation formula documented

### FIN-5: Settlement Calculation Integrity
- [ ] Revenue share formula matches agreement terms exactly
- [ ] Gross revenue calculation: SUM of payments in period
- [ ] Net revenue calculation: gross - allowed deductions
- [ ] Deduction categories are configurable per agreement
- [ ] Partner share = (revenue_basis) * (partner_percentage / 100)
- [ ] Operator share = revenue_basis - partner_share
- [ ] Multi-partner split handled (percentages sum to ≤ 100%)
- [ ] Settlement period locking prevents recalculation
- [ ] Historical agreement versioning preserves past terms

### FIN-6: Edge Cases
- [ ] Zero-subscriber barangay produces zero settlement (not error)
- [ ] Mid-month subscriber activation prorated correctly
- [ ] Mid-month plan change prorated correctly
- [ ] Agreement change mid-period: old terms for old portion, new terms for new
- [ ] Disputed settlement amount tracked separately
- [ ] Write-off above threshold requires approval
- [ ] Negative balance (credit) handled correctly

### FIN-7: Audit Trail for Financial Operations
- [ ] Every payment posting logged with actor, timestamp, amount, method
- [ ] Every invoice adjustment logged with before/after values
- [ ] Every settlement approval logged with approver chain
- [ ] Every write-off logged with reason and approver
- [ ] Financial audit logs are immutable and never deletable

---

## Validation Test Cases

Produce these test scenarios (minimum):

| # | Scenario | Expected Result |
|---|----------|----------------|
| 1 | Generate invoice for subscriber active full month | Amount = monthly_rate |
| 2 | Generate invoice for subscriber activated mid-month (day 15 of 30) | Amount = monthly_rate * (16/30) |
| 3 | Post full payment on single invoice | Invoice status = PAID, ledger balanced |
| 4 | Post partial payment on single invoice | Invoice status = PARTIALLY_PAID, remaining shown |
| 5 | Post payment covering 2 invoices (FIFO) | Oldest paid first, remainder to next |
| 6 | Apply 3-month promo, generate month 4 invoice | Month 4 at full price |
| 7 | Calculate settlement: 70/30 split on 100K gross | Partner = 30K, Operator = 70K |
| 8 | Calculate settlement with deductions: 100K gross - 10K opex, 60/40 | Partner = (90K * 0.40) = 36K |
| 9 | Suspend account 15 days overdue, post payment → auto-reactivate | Status transitions correct, reactivation fee applied if configured |
| 10 | Reverse a posted payment | Offsetting ledger entry, invoice status reverted |

---

## Iteration Protocol

```
RUN checks FIN-1 through FIN-7
FOR each failed check:
  DOCUMENT the specific failure
  IDENTIFY the responsible document and section
  FIX the document (if design phase) or code (if implementation)
  RE-RUN the failed check
  MAX 3 fix attempts per check
END FOR

IF all checks PASS:
  RETURN "FINANCIAL INTEGRITY VERIFIED ✅"
ELSE:
  RETURN "FINANCIAL INTEGRITY FAILED ❌" + failure report
  BLOCK phase gate until resolved
END IF
```
