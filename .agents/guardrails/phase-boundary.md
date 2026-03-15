---
name: "Phase Boundary Guardrail"
description: "Enforces that no Phase 2+ features are included in Phase 1 code and that each phase must pass its acceptance gate before proceeding"
---

# Phase Boundary Guardrail

## Rule
**Each delivery phase has a strict scope. No features from a later phase may be included in an earlier phase. Each phase must pass its acceptance gate before the next phase begins.**

---

## Phase Scopes

### Phase 0 — Foundation
**IN SCOPE:**
- Architecture setup (monorepo, Docker, CI/CD)
- Database schema + migrations
- Auth system (login, JWT, password reset)
- RBAC framework (roles, permissions, guards)
- Master data CRUD (barangays, service zones, partners, plans, users)
- Seed data loading
- Audit logging infrastructure

**NOT IN SCOPE:** Subscriber management, billing, ticketing, settlements

### Phase 1 — Core Operations
**IN SCOPE:**
- Subscriber CRM (full lifecycle: prospect → active → suspended)
- Service plans and subscriptions
- Installation workflow (survey → install → activate)
- Service ticketing (create → assign → resolve → close)
- Network asset registry (OLT, splitter, distribution box, ONT)
- Basic dashboards (subscriber count, install pipeline, ticket stats)

**NOT IN SCOPE:** Invoice generation, payment posting, suspension automation, settlements

### Phase 2 — Billing
**IN SCOPE:**
- Invoice generation engine
- Payment posting and ledger management
- Invoice aging and reporting
- Suspension/reactivation automation
- Collection management
- Financial dashboards

**NOT IN SCOPE:** JV settlement, partner statements, advanced analytics

### Phase 3 — JV Commercial Layer
**IN SCOPE:**
- Partner agreement management
- Revenue sharing rule engine
- Settlement calculation and runs
- Partner statements
- Approval workflows for settlements
- JV financial dashboards

**NOT IN SCOPE:** GIS/topology improvements, external integrations, notifications

### Phase 4 — Advanced Operations
**IN SCOPE:**
- Map/topology view improvements
- Data exports (CSV, Excel)
- Advanced analytics and KPI explorer
- Notification system
- External integrations (Mikrotik, RADIUS, payment gateway, SMS)

---

## Acceptance Gates

Each phase gate requires ALL of the following:
1. All features in scope are implemented
2. All unit tests pass (module-specific coverage targets met)
3. All integration tests pass
4. RBAC enforcement verified for all new endpoints
5. Tenant isolation verified for all new entities
6. Audit logging confirmed for all new mutations
7. User review and explicit approval

**Gate Protocol:**
```
RUN all phase-specific tests
RUN regression suite for previous phases
IF all pass AND user approves:
  LOCK phase artifacts
  PROCEED to next phase
ELSE:
  FIX failures → RE-RUN tests
  LOOP until passing (max 5 iterations)
  IF stalled → escalate to user
END IF
```

---

## Violations

| Violation | Severity | Action |
|-----------|----------|--------|
| Phase 2 feature in Phase 1 code | HIGH | Remove immediately, move to Phase 2 backlog |
| Phase gate skipped | CRITICAL | Stop. Complete gate requirements before proceeding. |
| Scope creep (undocumented feature added) | MEDIUM | Evaluate: remove or formally add via change request |
| Dependency on future phase | MEDIUM | Design extensibility hook, not implementation |

---

## Extensibility Hooks (Allowed)

You MAY add extension points for future phases without implementing them:
- Interface/type definitions for future integrations
- Configuration fields with sensible defaults
- Event bus topics that will have consumers in later phases
- Database columns for Phase 2+ data (nullable, not yet used in UI/API)

These hooks MUST NOT include actual business logic for future phases.
