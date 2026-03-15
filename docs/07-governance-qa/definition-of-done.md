# Definition of Done (DoD)
## FiberOps PH – Quality Standards

**Document ID**: DOD-FOPS-001
**Version**: 1.0
**Date**: 2026-03-07

---

## 1. Feature-Level Definition of Done

A feature is **DONE** when ALL of the following are true:

### Code Quality
- [ ] Code compiles with zero TypeScript errors
- [ ] ESLint passes with zero errors
- [ ] No `any` types used (explicit types required)
- [ ] Code follows project naming conventions and module structure
- [ ] No hardcoded values — uses environment variables or system_settings
- [ ] No `console.log` statements (use structured logger)

### Testing
- [ ] Unit tests written and passing (≥ 80% coverage for service layer)
- [ ] Integration tests for API endpoints (happy path + error paths)
- [ ] Tests cover tenant scoping (verifies data isolation)
- [ ] Tests cover permission checks (verifies RBAC enforcement)
- [ ] All monetary calculations tested with DECIMAL precision assertions
- [ ] Edge cases documented and tested

### API Contract
- [ ] Endpoints follow RESTful conventions from `api-contracts.md`
- [ ] Request validation uses Zod schemas
- [ ] Response format matches standard `ApiResponse<T>` wrapper
- [ ] Pagination, sorting, and filtering implemented per spec
- [ ] Error responses use standard error codes

### Security
- [ ] Permission guard applied to all endpoints (`@RequirePermission()`)
- [ ] Barangay scope enforced via Prisma middleware
- [ ] IDOR prevention verified (cannot access out-of-scope entities)
- [ ] Sensitive actions require reason field
- [ ] Audit interceptor captures all mutations

### Frontend
- [ ] Screen matches wireframe spec from `ui-specifications.md`
- [ ] Form validation matches Zod schema with inline error display
- [ ] Loading states implemented (skeleton loaders)
- [ ] Empty states implemented with CTA
- [ ] Error states handled with toast notifications
- [ ] Responsive at all breakpoints (mobile, tablet, desktop)
- [ ] Navigation and breadcrumbs match `navigation-map.md`

### Documentation
- [ ] API endpoint documented in Swagger/OpenAPI (auto-generated from decorators)
- [ ] Complex business logic has inline JSDoc comments
- [ ] Migration file has descriptive name

### Review
- [ ] PR reviewed and approved by at least 1 team member
- [ ] No unresolved review comments

---

## 2. Sprint-Level Definition of Done

A sprint is **DONE** when:

- [ ] All committed features meet Feature-Level DoD
- [ ] Integration tests pass in CI pipeline
- [ ] Staging deployment successful
- [ ] E2E smoke tests pass on staging
- [ ] No P1/P2 bugs remain open
- [ ] Sprint demo completed with stakeholders
- [ ] Sprint retrospective notes captured

---

## 3. Release-Level Definition of Done

A release is **DONE** when:

- [ ] All sprint-level DoD items met
- [ ] Full E2E test suite passes on staging
- [ ] Database migration tested on staging clone
- [ ] Performance benchmarks met (p95 < 500ms for API)
- [ ] Security checklist reviewed
- [ ] Release notes prepared
- [ ] Rollback plan documented
- [ ] Production deployment completed and health checks pass

---

## 4. Module-Specific DoD Additions

### Billing Module
- [ ] All monetary calculations use `Decimal` type, never `float`
- [ ] Invoice total = sum of line items (validated in test)
- [ ] FIFO payment application tested with multi-invoice scenarios
- [ ] Penalty calculation tested with grace period edge cases
- [ ] Proration tested across months of different lengths (28, 29, 30, 31 days)

### Settlement Module
- [ ] `partner_share + operator_share = net_revenue` assertion in every test
- [ ] Idempotent recalculation verified
- [ ] Locked settlement mutation rejection tested
- [ ] Deduction bucket percentages validated (sum ≤ 100%)

### Suspension Module
- [ ] Threshold-based auto-suspension tested
- [ ] Reactivation + fee tested
- [ ] Manual override with reason + role check tested
- [ ] Dispute exemption tested
- [ ] State transitions match state machine diagram

### Network Module
- [ ] Parent-child hierarchy integrity validated
- [ ] ONT-to-subscriber 1:1 assignment enforced
- [ ] Capacity limits respected (OLT port subscriber count)

### Other Modules
- [ ] **Auth, Users, RBAC**: Standard DoD applies.
- [ ] **Barangays, Partners, Agreements, Plans**: Standard CRUD DoD applies.
- [ ] **Subscribers, Installations, Tickets**: Workflow state transitions must be thoroughly tested.
- [ ] **Dashboards, Mapping, Reports**: View-only, standard DoD applies.
- [ ] **Audit, Settings, Notifications**: Standard DoD applies.
