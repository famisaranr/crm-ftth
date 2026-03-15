---
name: "Artifact Registry"
description: "Complete list of all expected artifacts with paths, owning agent, pack, and current status"
---

# Artifact Registry Reference

## Pack 01 — Product Definition (Agent: Product Architect)

| Artifact | Path | Status |
|----------|------|:------:|
| Business Requirements Document | `docs/01-product-definition/brd.md` | ✅ Approved |
| Product Requirements Document | `docs/01-product-definition/prd.md` | ✅ Approved |
| Module Map | `docs/01-product-definition/module-map.md` | ✅ Approved |
| Domain Model Narrative | `docs/01-product-definition/domain-model.md` | ✅ Approved |
| Phase Delivery Strategy | `docs/01-product-definition/phase-strategy.md` | ✅ Approved |

## Pack 02 — Solution Architecture (Agent: Solution Architect)

| Artifact | Path | Status |
|----------|------|:------:|
| High-Level Architecture | `docs/02-solution-architecture/hld.md` | ✅ Approved |
| Technical Solution Design | `docs/02-solution-architecture/tsd.md` | ✅ Approved |
| Bounded Contexts | `docs/02-solution-architecture/bounded-contexts.md` | ✅ Approved |
| Integration Architecture | `docs/02-solution-architecture/integration-architecture.md` | ✅ Approved |
| Event/Workflow Architecture | `docs/02-solution-architecture/event-workflow-architecture.md` | ✅ Approved |

## Pack 03 — Data & Rules (Agent: Data Architect)

| Artifact | Path | Status |
|----------|------|:------:|
| Entity Relationship Diagram | `docs/03-data-and-rules/erd.md` | ✅ Approved |
| Database Schema | `docs/03-data-and-rules/database-schema.md` | ✅ Approved |
| Data Dictionary | `docs/03-data-and-rules/data-dictionary.md` | ✅ Approved |
| Rule Engines (Revenue/Billing/Suspension) | `docs/03-data-and-rules/rule-engines.md` | ✅ Approved |

## Pack 04 — UX/Frontend (Agent: UX/Frontend Architect)

| Artifact | Path | Status |
|----------|------|:------:|
| Screen Registry | `docs/04-ux-frontend/screen-registry.md` | ✅ Approved |
| Navigation Map | `docs/04-ux-frontend/navigation-map.md` | ✅ Approved |
| UI Specifications | `docs/04-ux-frontend/ui-specifications.md` | ✅ Approved |
| CRUD/Form/State Matrices | `docs/04-ux-frontend/crud-form-state-matrices.md` | ✅ Approved |

## Pack 05 — Security & Access (Agent: Security Architect)

| Artifact | Path | Status |
|----------|------|:------:|
| RBAC Matrix | `docs/05-security-access/rbac-matrix.md` | ✅ Approved |
| Permission Taxonomy & Scoping | `docs/05-security-access/permission-taxonomy-and-scoping.md` | ✅ Approved |
| Auth Design | `docs/05-security-access/auth-design.md` | ✅ Approved |
| Audit Policy | `docs/05-security-access/audit-policy.md` | ✅ Approved |

## Pack 06 — Delivery Engineering (Agent: Delivery Engineer)

| Artifact | Path | Status |
|----------|------|:------:|
| Monorepo Structure | `docs/06-delivery-engineering/monorepo-structure.md` | ✅ Approved |
| API Contracts | `docs/06-delivery-engineering/api-contracts.md` | ✅ Approved |
| CI/CD Pipeline | `docs/06-delivery-engineering/ci-cd-pipeline.md` | ✅ Approved |
| Deployment Blueprint | `docs/06-delivery-engineering/deployment-blueprint.md` | ✅ Approved |

## Pack 07 — Governance & QA (Agent: QA & Governance Lead)

| Artifact | Path | Status |
|----------|------|:------:|
| Definition of Done | `docs/07-governance-qa/definition-of-done.md` | 🔵 Under Review |
| Acceptance Criteria | `docs/07-governance-qa/acceptance-criteria.md` | 🔵 Under Review |
| E2E Test Scenarios | `docs/07-governance-qa/e2e-test-scenarios.md` | 🔵 Under Review |
| Compliance Checklists | `docs/07-governance-qa/compliance-checklists.md` | 🔵 Under Review |

## Cross-Pack

| Artifact | Path | Status |
|----------|------|:------:|
| Orchestrator Status | `docs/orchestrator-status.md` | 🟢 Active |
| Cross-Pack Validation Report | `docs/cross-pack-validation-report.md` | ⬜ Not Started |

## Agent Infrastructure

| Type | Count | Location |
|------|:-----:|----------|
| Agent Prompts | 8 | `.agents/*.md` |
| Skills | 7 | `.agents/skills/*.md` |
| Guardrails | 7 | `.agents/guardrails/*.md` |
| References | 5 | `.agents/references/*.md` |
| Workflows | 6 | `.agents/workflows/*.md` |
