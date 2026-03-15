---
description: "Master orchestration workflow – drives the sequential execution of all specialist agents with review gates, quality validation, guardrail enforcement, and iterative loops"
---

# /orchestrate – FiberOps PH Agent Orchestration Workflow

This workflow drives the complete design and specification phase of the FiberOps PH project by invoking specialist agents in sequence with quality gates, guardrail enforcement, and iterative review loops to ensure 100% spec compliance.

## Prerequisites
- The `MASTER ORCHESTRATOR PROMPT` file exists in the project root
- All agent prompts exist in `.agents/`
- All output directories exist in `docs/`
- Skills exist in `.agents/skills/`
- Guardrails exist in `.agents/guardrails/`
- References exist in `.agents/references/`

---

## Pre-Execution: Load Guardrails and References
// turbo
1. Read ALL guardrails from `.agents/guardrails/` — these are HARD CONSTRAINTS for every step:
   - `no-freestyle.md` — no invented modules
   - `financial-precision.md` — DECIMAL types, centavo accuracy
   - `tenant-boundary.md` — backend scoping enforced
   - `audit-completeness.md` — every mutation logged
   - `phase-boundary.md` — phase scope respected
   - `deterministic-output.md` — consistent naming
   - `change-control.md` — locked artifacts protected
2. Read references for consistent outputs:
   - `naming-conventions.md` — ID and naming patterns
   - `status-enums.md` — all status values
   - `role-definitions.md` — 12 roles summary
   - `module-registry.md` — module IDs and phases
   - `artifact-registry.md` — expected outputs

---

## Execution Steps

### Step 0: Initialize Status Tracker
// turbo
3. Open `docs/orchestrator-status.md` and verify all packs show current status
4. Determine which pack to start/resume based on status

---

### Step 1: Product Definition Pack
5. Read `.agents/product-architect.md` for full instructions
6. Read the `MASTER ORCHESTRATOR PROMPT` for source requirements
7. Produce the following files in `docs/01-product-definition/`:
   - `brd.md` – Business Requirements Document
   - `prd.md` – Product Requirements Document
   - `module-map.md` – Module inventory with dependencies
   - `domain-model.md` – Bounded contexts, entities, lifecycle states
   - `phase-strategy.md` – Phased delivery plan with acceptance gates

**QUALITY GATE** (invoke `/validate-pack` on Pack 01):
8. Run `.agents/skills/artifact-quality-gate.md` — all 7 checks
9. Run guardrail checks: `no-freestyle`, `deterministic-output`, `phase-boundary`
10. **FIX LOOP**: If any check fails → fix → re-check (max 3 iterations)
11. Update `docs/orchestrator-status.md`: Pack 01 → "Under Review"

**REVIEW GATE** (invoke `/review-loop`):
12. Present Pack 01 to user for approval
13. IF user requests changes → apply changes → re-run quality gate → re-submit
14. LOOP until user approves (max 10 iterations, convergence tracking)
15. Pack 01 → "Approved"

---

### Step 2: Solution Architecture Pack
16. Read `.agents/solution-architect.md` for full instructions
17. Read approved Pack 01 artifacts as input context
18. Produce the following files in `docs/02-solution-architecture/`:
   - `hld.md` – High-Level Architecture Document
   - `tsd.md` – Technical Solution Design
   - `bounded-contexts.md` – Domain breakdown
   - `integration-architecture.md` – Internal and external integration
   - `event-workflow-architecture.md` – Events and workflow definitions

**QUALITY GATE** (invoke `/validate-pack` on Pack 02):
19. Run quality gate + guardrail checks
20. **FIX LOOP**: max 3 iterations
21. Update `docs/orchestrator-status.md`: Pack 02 → "Under Review"

**REVIEW GATE** (invoke `/review-loop`):
22. User review loop until approved
23. Pack 02 → "Approved"

---

### Step 3: Data & Rules Pack
24. Read `.agents/data-architect.md` for full instructions
25. Read approved Pack 01 and Pack 02 artifacts as input context
26. Produce the following files in `docs/03-data-and-rules/`:
   - `erd.md` – Entity Relationship Diagram
   - `database-schema.md` – Prisma-compatible schema definitions
   - `data-dictionary.md` – Field-level data dictionary
   - Revenue sharing rules, billing rules, suspension rules, audit logging model

**QUALITY GATE** (invoke `/validate-pack` on Pack 03):
27. Run quality gate + guardrail checks
28. **EXTRA**: Run `.agents/skills/financial-integrity-check.md` — FIN-1 through FIN-7
29. **EXTRA**: Run `.agents/skills/tenant-isolation-audit.md` — TI-1 (schema check)
30. **FIX LOOP**: max 3 iterations
31. Update `docs/orchestrator-status.md`: Pack 03 → "Under Review"

**REVIEW GATE** (invoke `/review-loop`):
32. User review loop until approved
33. Pack 03 → "Approved"

---

### Step 4: UX/Frontend Pack
34. Read `.agents/ux-frontend-architect.md` for full instructions
35. Read approved Pack 01, Pack 02, and Pack 03 artifacts as input context
36. Produce files in `docs/04-ux-frontend/`

**QUALITY GATE** (invoke `/validate-pack` on Pack 04):
37. Run quality gate + guardrail checks
38. **EXTRA**: Run `.agents/skills/schema-consistency.md` — SC-3 (schema→form check)
39. **FIX LOOP**: max 3 iterations
40. Update `docs/orchestrator-status.md`: Pack 04 → "Under Review"

**REVIEW GATE** (invoke `/review-loop`):
41. User review loop until approved
42. Pack 04 → "Approved"

---

### Step 5: Security & Access Pack
43. Read `.agents/security-architect.md` for full instructions
44. Read approved Pack 01 through Pack 04 artifacts as input context
45. Produce files in `docs/05-security-access/`

**QUALITY GATE** (invoke `/validate-pack` on Pack 05):
46. Run quality gate + guardrail checks
47. **EXTRA**: Run `.agents/skills/tenant-isolation-audit.md` — full TI-1 through TI-5
48. **FIX LOOP**: max 3 iterations
49. Update `docs/orchestrator-status.md`: Pack 05 → "Under Review"

**REVIEW GATE** (invoke `/review-loop`):
50. User review loop until approved
51. Pack 05 → "Approved"

---

### Step 6: Delivery Engineering Pack
52. Read `.agents/delivery-engineer.md` for full instructions
53. Read approved Pack 01 through Pack 05 artifacts as input context
54. Produce files in `docs/06-delivery-engineering/`

**QUALITY GATE** (invoke `/validate-pack` on Pack 06):
55. Run quality gate + guardrail checks
56. **EXTRA**: Run `.agents/skills/schema-consistency.md` — SC-1 and SC-2 (entity→API→screen)
57. **FIX LOOP**: max 3 iterations
58. Update `docs/orchestrator-status.md`: Pack 06 → "Under Review"

**REVIEW GATE** (invoke `/review-loop`):
59. User review loop until approved
60. Pack 06 → "Approved"

---

### Step 7: Governance & QA Pack
61. Read `.agents/qa-governance-lead.md` for full instructions
62. Read approved Pack 01 through Pack 06 artifacts as input context
63. Produce files in `docs/07-governance-qa/`

**QUALITY GATE** (invoke `/validate-pack` on Pack 07):
64. Run quality gate + guardrail checks
65. **EXTRA**: Run `.agents/skills/spec-traceability.md` — full requirement mapping
66. **FIX LOOP**: max 3 iterations
67. Update `docs/orchestrator-status.md`: Pack 07 → "Under Review"

**REVIEW GATE** (invoke `/review-loop`):
68. User review loop until approved
69. Pack 07 → "Approved"

---

### Step 8: Cross-Pack Validation (invoke `/cross-validate`)
70. Read `.agents/skills/cross-pack-validation.md` for all 10 checks
71. Read `.agents/skills/iterative-refinement.md` for loop protocol
72. Run ALL 10 cross-pack consistency checks
73. **FIX LOOP** (max 5 iterations):
    - For each failure: identify owning agent → fix → re-check
    - Convergence detection: stall after 2 same-failure iterations
74. Produce `docs/cross-pack-validation-report.md`
75. Update `docs/orchestrator-status.md`: Cross-Pack Validation → "Under Review"

**FINAL REVIEW GATE**:
76. Present validation report to user
77. IF approved: ALL packs → "Locked" status
78. IF changes needed: fix → re-validate → re-submit

---

### Step 9: Begin Backend Implementation (invoke `/implement-phase`)
79. All packs locked → proceed to Phase 0 implementation
80. Follow `.agents/workflows/implement-phase.md` for scaffold → code → test → gate cycle
81. Each phase uses iterative loops until all tests pass and gate criteria are met

---

### Step 10: E2E Testing & QA
82. Read `docs/07-governance-qa/e2e-test-scenarios.md` for all critical paths
83. Read `docs/07-governance-qa/definition-of-done.md` for quality thresholds
84. Write E2E/integration tests for all modules:
    - Auth endpoints (login, register, refresh, logout, change-password, forgot-password)
    - RBAC enforcement (permission guards deny unauthorized access)
    - Full subscriber lifecycle (PROSPECT → ACTIVE → SUSPENDED → DISCONNECTED)
    - Billing cycle: invoice generation → payment posting → ledger entries
    - Settlement calculation: revenue share accuracy to the centavo
    - Tenant scoping: verify no cross-barangay data leakage
85. Run tests: `npx jest --coverage` — target ≥ 80% service layer coverage
86. **FIX LOOP**: Fix failures → re-run (max 5 iterations)
87. Update `docs/orchestrator-status.md`: Step 10 → "Complete"

---

### Step 11: Compliance Audit
88. Read `docs/07-governance-qa/compliance-checklists.md`
89. Walk through each checklist item and verify against the codebase:
    - §1: Data Privacy Act (RA 10173) — encryption, access control, audit trail
    - §2: Financial Record Compliance — Decimal precision, immutable voids, adjustments
    - §3: Technical Security — JWT lifecycle, CORS, rate limiting, security headers
    - §4: Quality Assurance — coverage, zero errors, no `any` types
90. Check each verified item ☐ → ☑ in the checklist
91. Produce compliance report noting any gaps requiring organizational (non-code) resolution
92. Update `docs/orchestrator-status.md`: Step 11 → "Complete"

---

### Step 12: Frontend Implementation
93. Read `docs/04-ux-frontend/ui-specifications.md` for screen specs
94. Read `docs/04-ux-frontend/navigation-map.md` for routing structure
95. Read `docs/06-delivery-engineering/frontend-scaffolding.md` for route/directory mapping
96. Scaffold frontend app: `npx create-next-app@latest apps/web --typescript --app --src-dir`
97. Implement in phases matching backend:
    - **Phase 0**: Auth pages (login, forgot-password), admin panels (users, roles, settings, audit)
    - **Phase 1**: Subscriber CRUD, network asset tree, installation workflow, ticket board, dashboards
    - **Phase 2**: Billing/invoicing, payment posting, suspension queue
    - **Phase 3**: Settlement management, partner statements
    - **Phase 4**: Revenue reports, network topology map, coverage heatmap

**QUALITY GATE** per frontend phase:
98. Screen matches wireframe spec
99. API integration working (CRUD, pagination, filters)
100. Responsive at all breakpoints
101. **FIX LOOP**: max 3 iterations per phase
102. Update `docs/orchestrator-status.md`: Step 12 → "Complete"

---

### Step 13: CI/CD & Deployment
103. Read `docs/06-delivery-engineering/ci-cd-pipeline.md` for pipeline design
104. Read `docs/06-delivery-engineering/deployment-blueprint.md` for infra setup
105. Create production Dockerfiles for API and web apps
106. Create `docker-compose.prod.yml` for production stack
107. Create CI pipeline config (GitHub Actions or equivalent):
    - Lint → Build → Test → Coverage → Deploy
108. Configure Nginx reverse proxy with SSL
109. Verify production build: `docker compose -f docker-compose.prod.yml up`
110. Update `docs/orchestrator-status.md`: Step 13 → "Complete"

---

### Step 14: Production Readiness (Final Gate)
111. Read `docs/07-governance-qa/compliance-checklists.md` §5 (Pre-Launch) and §7 (Production Readiness)
112. Walk through all checklists:
    - Infrastructure readiness (containers, DB, Redis, health checks)
    - Security readiness (rate limiting, CORS, RBAC, encryption)
    - Data integrity readiness (financial accuracy, backup/restore)
    - Operational readiness (logging, monitoring, runbook)
113. Produce final production readiness report
114. Present to user for final sign-off
115. ALL steps → "Locked" — project ready for launch 🚀

---

## Loop Summary

| Gate | Skill/Tool Invoked | Max Iterations | Convergence Check |
|------|-------------------|:-:|:-:|
| Quality Gate (per pack) | `artifact-quality-gate` | 3 | ✅ |
| Review Gate (per pack) | `iterative-refinement` | 10 | ✅ (stall after 3) |
| Financial Check (Pack 03) | `financial-integrity-check` | 3 | ✅ |
| Tenant Check (Pack 03, 05) | `tenant-isolation-audit` | 3 | ✅ |
| Schema Check (Pack 04, 06) | `schema-consistency` | 3 | ✅ |
| Spec Trace (Pack 07) | `spec-traceability` | 3 | ✅ |
| Cross-Pack Validation | `cross-pack-validation` | 5 | ✅ (stall after 2) |
| Backend Implementation (per phase) | Build + test suite | 5 | ✅ |
| E2E Testing (Step 10) | Jest + coverage | 5 | ✅ |
| Frontend (per phase, Step 12) | Build + visual check | 3 | ✅ |
| Production (Step 14) | Full checklist | 1 | — |

