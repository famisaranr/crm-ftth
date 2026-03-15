# Data Dictionary
## FiberOps PH – FTTH Barangay Multi-JV CRM / OSS-BSS Platform

**Document ID**: DIC-FOPS-001
**Version**: 1.0
**Date**: 2026-03-07

---

## 1. Data Type Conventions

| Convention | Type | Precision | Usage |
|-----------|------|-----------|-------|
| **Primary Key** | UUID (`@db.Uuid`) | — | All table IDs |
| **Monetary** | DECIMAL(18,2) | 2 decimal places | All currency amounts (PHP) |
| **Percentage** | DECIMAL(5,2) | 2 decimal places | Revenue share %, discount % |
| **Coordinates** | DECIMAL(10,7) | 7 decimal places | Lat/Lng geotags |
| **Short Text** | VARCHAR(255) | — | Names, emails, descriptions |
| **Long Text** | TEXT | — | Notes, detailed descriptions |
| **Date Only** | DATE | — | Effective dates, due dates, birth dates |
| **Date+Time** | TIMESTAMP WITH TIMEZONE | — | Event timestamps, created_at |
| **Boolean** | BOOLEAN | — | Flags |
| **JSON** | JSONB | — | Flexible structured data (deduction buckets, metadata) |

---

## 2. Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Table names | snake_case, plural | `subscribers`, `service_plans` |
| Column names | snake_case | `barangay_id`, `full_name` |
| Foreign keys | `{referenced_table_singular}_id` | `subscriber_id`, `plan_id` |
| Enum types | PascalCase | `SubscriberStatus`, `PaymentMethod` |
| Enum values | UPPER_SNAKE_CASE | `ACTIVE`, `SUSPENDED_SOFT` |
| Indexes | `idx_{table}_{columns}` | `idx_subscribers_barangay_status` |
| Unique constraints | `uq_{table}_{columns}` | `uq_subscribers_account_number` |

---

## 3. Standard Audit Columns

Every table includes these columns:

| Column | Type | Nullable | Purpose |
|--------|------|:--------:|---------|
| `created_at` | TIMESTAMP | No | Record creation timestamp (auto-set) |
| `updated_at` | TIMESTAMP | No | Last modification timestamp (auto-updated) |
| `created_by` | UUID | Yes | User who created the record |
| `updated_by` | UUID | Yes | User who last modified the record |

**Exception**: `audit_logs` table has only `created_at` (immutable records).

---

## 4. Key Entity Dictionaries

### 4.1 users

| Column | Type | Null | Default | Description | Validation |
|--------|------|:----:|---------|-------------|-----------|
| id | UUID | No | uuid() | Primary key | — |
| email | VARCHAR(255) | No | — | Login email address | Valid email format, unique |
| password_hash | VARCHAR(255) | No | — | Bcrypt/Argon2 hash | Min 8 chars raw, never stored raw |
| full_name | VARCHAR(255) | No | — | Display name | Non-empty |
| phone | VARCHAR(20) | Yes | — | Phone number | PH format: +639XXXXXXXX |
| status | UserStatus | No | ACTIVE | Account status | Enum |
| last_login_at | TIMESTAMP | Yes | — | Last successful login | System-set |
| failed_login_count | INT | No | 0 | Consecutive failed logins | Resets on success |
| locked_until | TIMESTAMP | Yes | — | Lock expiry | Set on 5th failure |

### 4.2 subscribers

| Column | Type | Null | Default | Description | Validation |
|--------|------|:----:|---------|-------------|-----------|
| id | UUID | No | uuid() | Primary key | — |
| account_number | VARCHAR(30) | No | — | Business identifier | Format: `{BRGY_CODE}-{SEQ}`, unique |
| full_name | VARCHAR(255) | No | — | Subscriber name | Non-empty |
| phone | VARCHAR(20) | Yes | — | Mobile number | PH format |
| email | VARCHAR(255) | Yes | — | Email address | Valid email if provided |
| barangay_id | UUID | No | — | Service area | FK → barangays.id |
| status | SubscriberStatus | No | PROSPECT | Lifecycle state | Enum, state machine enforced |
| billing_class | VARCHAR(50) | Yes | — | RESIDENTIAL / COMMERCIAL | Lookup value |
| kyc_id_type | VARCHAR(50) | Yes | — | ID type for KYC | e.g. PhilSys, Drivers License |
| kyc_id_number | VARCHAR(100) | Yes | — | ID number for KYC | Encrypted at rest (PII) |
| notes | TEXT | Yes | — | Free-form notes | — |
| deleted_at | TIMESTAMP | Yes | — | Soft delete marker | Non-null = deleted |

### 4.3 invoices

| Column | Type | Null | Default | Description | Validation |
|--------|------|:----:|---------|-------------|-----------|
| id | UUID | No | uuid() | Primary key | — |
| invoice_number | VARCHAR(30) | No | — | Business ID | Format: `INV-{YYYY}-{SEQ}`, unique |
| subscriber_id | UUID | No | — | Billed subscriber | FK → subscribers.id |
| billing_cycle_id | UUID | Yes | — | Source billing cycle | FK → billing_cycles.id |
| barangay_id | UUID | No | — | Scope field | FK → barangays.id |
| total_amount | DECIMAL(18,2) | No | — | Invoice total | Must equal sum of invoice_lines |
| amount_paid | DECIMAL(18,2) | No | 0.00 | Running paid total | ≤ total_amount |
| due_date | DATE | No | — | Payment due date | Must be after issued_at |
| status | InvoiceStatus | No | DRAFT | Lifecycle state | Enum |
| issued_at | TIMESTAMP | Yes | — | When sent to subscriber | System-set on SENT transition |

### 4.4 payments

| Column | Type | Null | Default | Description | Validation |
|--------|------|:----:|---------|-------------|-----------|
| id | UUID | No | uuid() | Primary key | — |
| invoice_id | UUID | Yes | — | Applied to invoice | FK → invoices.id; null = unallocated |
| subscriber_id | UUID | No | — | Paying subscriber | FK → subscribers.id |
| barangay_id | UUID | No | — | Scope field | FK → barangays.id |
| amount | DECIMAL(18,2) | No | — | Payment amount | > 0 |
| method | PaymentMethod | No | — | How paid | Enum |
| receipt_reference | VARCHAR(100) | Yes | — | OR/receipt number | Non-empty if cash/GCash |
| posted_at | TIMESTAMP | No | now() | When payment recorded | — |
| posted_by | UUID | No | — | User who posted | FK → users.id |
| reversed_at | TIMESTAMP | Yes | — | If payment reversed | System-set |
| reversal_reason | TEXT | Yes | — | Why reversed | Required if reversed |

### 4.5 settlements

| Column | Type | Null | Default | Description | Validation |
|--------|------|:----:|---------|-------------|-----------|
| id | UUID | No | uuid() | Primary key | — |
| agreement_id | UUID | No | — | JV agreement | FK → partner_agreements.id |
| period_start | DATE | No | — | Settlement period start | Unique per agreement |
| period_end | DATE | No | — | Settlement period end | > period_start |
| status | SettlementStatus | No | DRAFTED | Lifecycle state | Enum |
| gross_revenue | DECIMAL(18,2) | No | — | Total collections | Sum of payments in period |
| total_deductions | DECIMAL(18,2) | No | 0.00 | Allowed deductions | Calculated from rules |
| net_revenue | DECIMAL(18,2) | No | — | Gross minus deductions | = gross_revenue - total_deductions |
| partner_share | DECIMAL(18,2) | No | — | Partner's share | = net_revenue × partner_percentage |
| operator_share | DECIMAL(18,2) | No | — | Operator's share | = net_revenue - partner_share |
| approved_by | UUID | Yes | — | Approver | FK → users.id |
| locked_at | TIMESTAMP | Yes | — | When period locked | Non-null = immutable |

### 4.6 audit_logs

| Column | Type | Null | Default | Description | Validation |
|--------|------|:----:|---------|-------------|-----------|
| id | UUID | No | uuid() | Primary key | — |
| entity_type | VARCHAR(100) | No | — | Entity class name | e.g. Subscriber, Invoice |
| entity_id | UUID | No | — | Modified entity ID | Not FK (may reference deleted entities) |
| action | AuditAction | No | — | What happened | Enum |
| actor_id | UUID | Yes | — | Who did it | FK → users.id; null = system |
| actor_role | VARCHAR(100) | Yes | — | Actor's role at time | Captured at audit time |
| actor_ip | VARCHAR(45) | Yes | — | IP address | IPv4 or IPv6 |
| previous_value | JSONB | Yes | — | Before state | Full or diff serialization |
| new_value | JSONB | Yes | — | After state | Full or diff serialization |
| source_module | VARCHAR(100) | Yes | — | NestJS module name | e.g. subscribers, billing |
| reason_code | VARCHAR(100) | Yes | — | Business reason | Required for adjustments, overrides |
| barangay_id | UUID | Yes | — | Scope for scoped entities | For filtering |
| created_at | TIMESTAMP | No | now() | When it happened | Immutable |

---

## 5. Business Identifiers

| Entity | Identifier | Format | Example | Generation |
|--------|-----------|--------|---------|-----------|
| Subscriber | account_number | `{BRGY_CODE}-{5-digit seq}` | `POB-00001` | Auto-generated per barangay |
| Invoice | invoice_number | `INV-{YYYY}-{6-digit seq}` | `INV-2026-000001` | Auto-generated globally |
| Ticket | ticket_number | `TKT-{YYYY}-{5-digit seq}` | `TKT-2026-00001` | Auto-generated globally |
| Agreement | agreement_number | `AGR-{BRGY_CODE}-{3-digit seq}` | `AGR-POB-001` | Auto-generated per barangay |
| Payment | receipt_reference | External reference | `OR-2026-4521` | Manual entry |

---

## 6. Sensitive Data Classification

| Field | Table | Classification | Protection |
|-------|-------|:--------------:|-----------|
| password_hash | users | CRITICAL | Bcrypt/Argon2; never exposed via API |
| token_hash | sessions | CRITICAL | SHA-256; never exposed |
| kyc_id_number | subscribers | PII | Encrypted at rest; masked in API responses |
| email | users, subscribers | PII | Not encrypted but access-controlled |
| phone | users, subscribers | PII | Not encrypted but access-controlled |
| geotag_lat/lng | subscriber_addresses | PII | Access-controlled |
| previous_value / new_value | audit_logs | VARIES | Sensitive fields redacted before logging |
