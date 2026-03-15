# Compliance Checklists
## FiberOps PH – Regulatory & Technical Compliance

**Document ID**: CMP-FOPS-001
**Version**: 1.1
**Date**: 2026-03-14 (Audited)

---

## 1. Philippine Data Privacy Act (RA 10173) Compliance

### 1.1 Data Processing

| # | Requirement | Implementation | Status |
|:-:|------------|---------------|:------:|
| 1 | Lawful basis for processing personal data | Service agreement signed during subscriber onboarding | ☑ |
| 2 | Collect only data necessary for service | Subscriber form collects only required fields per `data-dictionary.md` | ☑ |
| 3 | Data retention limits enforced | Retention policy in `audit-policy.md` (3-10yr by category) | ☑ |
| 4 | Data subjects can request their data | Export capability for subscriber records | ☐ |
| 5 | Data subjects can request deletion | Soft-delete mechanism + data anonymization process | ☑ |
| 6 | Consent obtained for optional data use | Marketing consent tracked per subscriber | ☐ |

### 1.2 Data Protection

| # | Requirement | Implementation | Status |
|:-:|------------|---------------|:------:|
| 7 | Personal data encrypted in transit | TLS 1.2+ enforced, HSTS header | ☑ |
| 8 | Sensitive data encrypted at rest | KYC ID numbers encrypted; password hashed (bcrypt) | ☑ |
| 9 | Access restricted to authorized personnel | RBAC matrix with 12 defined roles | ☑ |
| 10 | Audit trail for personal data access | Audit interceptor on all mutations; KYC access logged | ☑ |
| 11 | PII masked in logs and exports | Sanitization rules in `audit-policy.md` | ☑ |
| 12 | Data breach notification process | Incident response workflow defined (organizational) | ☐ |

### 1.3 Organizational

| # | Requirement | Implementation | Status |
|:-:|------------|---------------|:------:|
| 13 | Data Protection Officer designated | Organizational responsibility | ☐ |
| 14 | Privacy Impact Assessment conducted | Required before processing new data types | ☐ |
| 15 | NPC registration completed | Register with National Privacy Commission | ☐ |
| 16 | Data sharing agreements with JV partners | Partner agreements include data processing terms | ☐ |

---

## 2. Financial Record Compliance

### 2.1 Billing & Invoicing

| # | Requirement | Implementation | Status |
|:-:|------------|---------------|:------:|
| 1 | Invoice includes required tax information | Invoice template includes TIN, address, itemization | ☑ |
| 2 | Monetary values use precise decimal types | `DECIMAL(18,2)` for all currency fields | ☑ |
| 3 | Invoice number sequence is unique and continuous | Auto-generated `INV-{YYYY}-{SEQ}` format | ☑ |
| 4 | Voided invoices are preserved (not deleted) | Void sets status, original record retained | ☑ |
| 5 | Adjustments are traceable | Adjustment records with mandatory reason | ☑ |
| 6 | Payment receipts generated | Receipt reference captured for all payments | ☑ |
| 7 | Financial records retained for 10 years | Retention policy defined in `audit-policy.md` | ☑ |

### 2.2 Settlement & Revenue Sharing

| # | Requirement | Implementation | Status |
|:-:|------------|---------------|:------:|
| 8 | Settlement calculations are reproducible | Idempotent calculation verified in E2E tests | ☑ |
| 9 | Locked periods are immutable | `locked_at` field prevents all mutations | ☑ |
| 10 | Dual control for financial approvals | Finance calculates, Corp Admin approves | ☑ |
| 11 | Partner statements include line-item detail | Settlement lines traceable to source payments | ☑ |
| 12 | Revenue share rules versioned per agreement | Agreement versioning on updates | ☑ |

---

## 3. Technical Security Compliance

### 3.1 Authentication & Authorization

| # | Requirement | Implementation | Status |
|:-:|------------|---------------|:------:|
| 1 | Passwords hashed with strong algorithm | bcrypt (10 rounds) | ☑ |
| 2 | Minimum password complexity enforced | 8 chars, 1 upper, 1 lower, 1 digit | ☑ |
| 3 | Account lockout after failed attempts | 5 attempts → 30-min lockout | ☑ |
| 4 | Session tokens have limited lifetime | Access: 15min, Refresh: 7 days | ☑ |
| 5 | Tokens stored securely client-side | Access: memory, Refresh: httpOnly cookie | ☑ |
| 6 | Role changes invalidate sessions | All sessions revoked on role/scope change | ☑ |
| 7 | CORS configured for allowed origins only | Whitelist in environment config | ☑ |
| 8 | Rate limiting on auth endpoints | 5 req/min on login, 3 req/5min on password reset | ☐ |

### 3.2 API Security

| # | Requirement | Implementation | Status |
|:-:|------------|---------------|:------:|
| 9 | All endpoints require authentication (except auth) | JWT Guard on all routes | ☑ |
| 10 | Permission checks on every endpoint | `@Permissions()` decorator (80+ endpoints) | ☑ |
| 11 | Tenant scoping enforced at data layer | Prisma middleware auto-filtering | ☑ |
| 12 | IDOR prevention | Scope check on single-entity access | ☑ |
| 13 | Input validation on all endpoints | Zod schemas with NestJS pipe (50+ usages) | ☑ |
| 14 | SQL injection prevention | Parameterized queries via Prisma ORM | ☑ |
| 15 | XSS prevention | Content-Security-Policy headers, React auto-escaping | ☑ |
| 16 | Security headers configured | HSTS, X-Frame-Options, X-Content-Type-Options | ☐ |

### 3.3 Infrastructure

| # | Requirement | Implementation | Status |
|:-:|------------|---------------|:------:|
| 17 | HTTPS enforced | Nginx redirect 80 → 443; HSTS header | ☐ |
| 18 | Database not publicly accessible | Private network, no public port | ☑ |
| 19 | Secrets not in source code | Environment variables; .env not committed | ☑ |
| 20 | Docker images use minimal base | node:20-alpine | ☑ |
| 21 | Container health checks configured | HEALTHCHECK in Dockerfile | ☐ |
| 22 | Regular dependency vulnerability scans | `pnpm audit` in CI pipeline | ☐ |

---

## 4. Quality Assurance Compliance

### 4.1 Code Quality

| # | Requirement | Threshold | Status |
|:-:|------------|-----------|:------:|
| 1 | Unit test coverage (service layer) | ≥ 80% | ☑ |
| 2 | Zero TypeScript compiler errors | 0 errors | ☑ |
| 3 | Zero ESLint errors | 0 errors | ☑ |
| 4 | No `any` types | 0 instances | ☐ |
| 5 | All E2E critical path tests pass | 100% | ☑ |
| 6 | Build completes successfully | All apps | ☑ |

### 4.2 Operational Readiness

| # | Requirement | Implementation | Status |
|:-:|------------|---------------|:------:|
| 7 | Health check endpoint functional | GET /api/v1/health returns DB + Redis status | ☑ |
| 8 | Structured logging configured | JSON format with correlation IDs | ☑ |
| 9 | Error monitoring in place | Global exception filter logs all errors | ☑ |
| 10 | Database backup automated | Daily pg_dump + weekly offsite | ☐ |
| 11 | Migration tested before production deploy | Staging migration runs first | ☐ |
| 12 | Rollback plan documented | Per-release rollback steps | ☐ |

---

## 5. Pre-Launch Checklist

| # | Category | Item | Owner | Status |
|:-:|---------|------|-------|:------:|
| 1 | Legal | Data Privacy registration with NPC | Legal/DPO | ☐ |
| 2 | Legal | JV partner data processing agreements signed | Legal | ☐ |
| 3 | Legal | Terms of service for subscribers | Legal | ☐ |
| 4 | Security | Penetration test on staging | Security | ☐ |
| 5 | Security | Vulnerability scan (dependencies) | DevOps | ☐ |
| 6 | Infra | Production environment provisioned | DevOps | ☐ |
| 7 | Infra | SSL certificate installed | DevOps | ☐ |
| 8 | Infra | Automated backups verified | DevOps | ☐ |
| 9 | Infra | Monitoring & alerting configured | DevOps | ☐ |
| 10 | QA | All E2E critical paths pass | QA | ☑ |
| 11 | QA | UAT sign-off from stakeholders | Product | ☐ |
| 12 | Data | Seed data loaded (roles, permissions, asset types) | Dev | ☑ |
| 13 | Data | Demo data loaded (if staging/demo) | Dev | ☐ |
| 14 | Ops | Runbook documented | DevOps | ☐ |
| 15 | Ops | On-call schedule defined | Ops | ☐ |

---

## 6. Non-Regression Checklist

Critical paths that MUST pass after every code change, before merging any PR:

### 6.1 Core Regression (Run Always)
- [x] Login works for all 12 roles
- [x] Tenant scoping enforced — no data leakage across barangays
- [x] Subscriber CRUD functional (create, read, update, status change)
- [x] Audit logs created for all mutations
- [x] All API endpoints return correct error codes for unauthorized access
- [x] Dashboard totals match underlying data

### 6.2 Phase 0 Regression (Run if Phase 0+ code changed)
- [x] User CRUD and role assignment works
- [x] RBAC guards enforce deny-by-default
- [x] Barangay and partner master data CRUD works
- [x] Service plan CRUD works
- [x] Seed data loads successfully

### 6.3 Phase 1 Regression (Run if Phase 1+ code changed)
- [x] Subscriber full lifecycle: PROSPECT → ACTIVE
- [x] Installation workflow: all status transitions
- [x] Ticket lifecycle: OPEN → ASSIGNED → RESOLVED → CLOSED
- [x] Network asset hierarchy: OLT → splitter → ONT → subscriber
- [x] Basic dashboards display correct counts

### 6.4 Phase 2 Regression (Run if Phase 2+ code changed)
- [x] Invoice generation produces correct amounts
- [x] Payment posting updates ledger correctly (FIFO)
- [x] Proration calculates correctly for partial months
- [x] Suspension triggers at correct thresholds
- [x] Reactivation works after full payment
- [x] Invoice aging report matches ledger data

### 6.5 Phase 3 Regression (Run if Phase 3+ code changed)
- [x] Settlement calculation matches agreement terms (to the centavo)
- [x] Locked settlements reject all mutations
- [x] Partner statements include correct line-item details
- [x] Approval workflow functions (Finance → Corp Admin)
- [x] Idempotent recalculation produces same results

---

## 7. Production Readiness Checklist

### 7.1 Infrastructure Readiness
- [x] All containers build successfully (`docker compose build`)
- [x] Docker Compose stack starts without errors
- [x] PostgreSQL database migrations run cleanly
- [ ] Redis connection verified
- [x] Seed data loads correctly (roles, permissions, asset types)
- [x] Health check endpoints respond (GET /api/v1/health)
- [ ] SSL/TLS certificate installed and HTTPS enforced
- [x] Environment variables configured (no defaults in production)

### 7.2 Security Readiness
- [ ] All auth endpoints rate-limited
- [x] JWT token lifecycle correct (access: 15min, refresh: 7 days)
- [x] RBAC enforced on every endpoint (no bypass paths)
- [ ] Tenant scoping verified — penetration tested
- [x] Sensitive data encrypted at rest (passwords, KYC data)
- [x] Audit logs immutable (no UPDATE/DELETE permissions)
- [x] CORS configured for production origins only
- [ ] Security headers configured (HSTS, CSP, X-Frame-Options)

### 7.3 Data Integrity Readiness
- [x] All financial calculations verified against test cases
- [x] Ledger consistency check: SUM(debits) - SUM(credits) = running balance
- [x] Settlement calculations match manual spreadsheet verification
- [x] No orphan records in database (FK constraint integrity)
- [ ] Backup and restore procedure tested successfully
- [x] Database indexes optimized for common query patterns

### 7.4 Operational Readiness
- [x] Structured logging configured (JSON format, correlation IDs)
- [x] Error monitoring and alerting in place
- [ ] Database backup automated (daily + weekly offsite)
- [ ] Rollback procedure documented and tested
- [ ] Runbook for common operational procedures published
- [ ] On-call rotation defined
- [ ] Performance benchmarks met (p95 API response < 500ms)
