---
name: "Financial Precision Guardrail"
description: "Enforces strict rules for monetary calculations: DECIMAL types, centavo accuracy, no floating-point, isolated testable logic"
---

# Financial Precision Guardrail

## Rule
**All monetary values MUST use fixed-precision decimal types. All financial calculations MUST be isolated, testable, and correct to the centavo (₱0.01).**

---

## Hard Constraints

### Data Types
| What | Required Type | NEVER Use |
|------|--------------|-----------|
| Monetary amounts (invoice, payment, balance) | `Decimal(18,2)` | `Float`, `Double`, `Real` |
| Percentages (revenue share, tax rate) | `Decimal(5,4)` | `Float`, `Double` |
| Quantities (subscriber count, asset count) | `Integer` | `Float` |
| Rates (monthly rate, penalty rate) | `Decimal(18,2)` | `Float` |

### Calculation Rules
1. **No floating-point arithmetic** for money — use decimal/fixed-point libraries
2. **Rounding**: Always round to 2 decimal places using ROUND_HALF_UP
3. **Currency**: Philippine Peso (PHP) assumed for Phase 1; field exists for future multi-currency
4. **Prorating formula**: `(monthly_rate / days_in_period) * active_days` — computed with decimal arithmetic
5. **Percentage application**: `amount * (percentage / 100)` — both operands decimal

### Code Architecture
1. All billing calculations in `billing.calculator.ts` (or equivalent isolated module)
2. All settlement calculations in `settlement.calculator.ts`
3. Calculation functions must be **pure functions** — no database calls, no side effects
4. Every calculation must have corresponding unit tests with known input → expected output

### Audit Requirements
1. Every payment posting: log actor, timestamp, amount, method, invoice reference
2. Every adjustment: log before/after values, reason code, approver
3. Every settlement: log calculation inputs, formula used, result
4. Every write-off: log amount, reason, approver, threshold check result
5. Financial audit logs are **IMMUTABLE** — append-only, never deletable

---

## Violation Examples

```
❌ balance: Float        // NEVER — floating point for money
✅ balance: Decimal(18,2) // CORRECT

❌ share = revenue * 0.30        // NEVER — float literal
✅ share = revenue.mul(new Decimal("0.30"))  // CORRECT

❌ amount = Math.round(value * 100) / 100    // NEVER — float rounding
✅ amount = value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP) // CORRECT
```

---

## Enforcement Points
- Data Architect: Schema review (Check FIN-1 in financial-integrity-check skill)
- Delivery Engineer: Code review (no float types in monetary fields)
- QA Lead: Calculation test coverage (10+ mandatory test scenarios)
- Cross-pack validation: Financial traceability chain check
