# Database Schema Proposal
## FiberOps PH – Prisma-Compatible Schema Definitions

**Document ID**: SCH-FOPS-001
**Version**: 1.0
**Date**: 2026-03-07

---

## 1. Enum Definitions

```prisma
enum UserStatus {
  ACTIVE
  INACTIVE
  LOCKED
  PENDING
}

enum SubscriberStatus {
  PROSPECT
  SURVEYED
  INSTALLATION_READY
  ACTIVE
  SUSPENDED_SOFT
  SUSPENDED_HARD
  DISCONNECTED
  CHURNED
}

enum InstallationStatus {
  LEAD_CREATED
  SURVEY_SCHEDULED
  SURVEY_COMPLETED
  FEASIBLE
  NOT_FEASIBLE
  INSTALL_SCHEDULED
  INSTALLED
  ACTIVATED
  QA_VERIFIED
  BILLING_STARTED
  FAILED
  RESCHEDULED
  CANCELLED
}

enum TicketStatus {
  OPEN
  ASSIGNED
  IN_PROGRESS
  PENDING_CUSTOMER
  RESOLVED
  CLOSED
  ESCALATED
  REOPENED
}

enum TicketCategory {
  NO_CONNECTION
  INTERMITTENT
  SLOW_INTERNET
  LOS_RED_LIGHT
  FIBER_CUT
  BILLING_ISSUE
  RELOCATION
  UPGRADE_DOWNGRADE
  ONT_REPLACEMENT
  COMPLAINT
  ESCALATION
  OTHER
}

enum TicketPriority {
  P1_CRITICAL
  P2_HIGH
  P3_MEDIUM
  P4_LOW
}

enum InvoiceStatus {
  DRAFT
  GENERATED
  SENT
  PARTIALLY_PAID
  PAID
  OVERDUE
  WRITTEN_OFF
  VOIDED
}

enum PaymentMethod {
  CASH
  GCASH
  BANK_TRANSFER
  CHECK
  ONLINE
  OTHER
}

enum SettlementStatus {
  DRAFTED
  CALCULATED
  UNDER_REVIEW
  APPROVED
  DISBURSED
  LOCKED
  DISPUTED
}

enum AssetStatus {
  PLANNED
  DEPLOYED
  ACTIVE
  MAINTENANCE
  DECOMMISSIONED
  FAULTY
}

enum ShareType {
  GROSS
  NET
}

enum LedgerEntryType {
  CHARGE
  PAYMENT
  ADJUSTMENT_CREDIT
  ADJUSTMENT_DEBIT
  PENALTY
  WRITE_OFF
  REVERSAL
  REACTIVATION_FEE
}

enum InvoiceLineType {
  MONTHLY_CHARGE
  INSTALLATION_FEE
  PENALTY
  DISCOUNT
  PROMO_DISCOUNT
  ADJUSTMENT
  PRORATE_CHARGE
  PRORATE_CREDIT
  REACTIVATION_FEE
}

enum SuspensionType {
  SOFT
  HARD
}

enum SuspensionActionType {
  SUSPENDED
  REACTIVATED
  MANUAL_OVERRIDE
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE
  STATUS_CHANGE
  LOGIN
  LOGIN_FAILED
  EXPORT
  APPROVAL
}

enum AgreementStatus {
  DRAFT
  ACTIVE
  EXPIRED
  TERMINATED
}

enum BarangayStatus {
  ACTIVE
  INACTIVE
  ONBOARDING
}

enum PlanStatus {
  ACTIVE
  INACTIVE
  DEPRECATED
}

enum BillingCycleStatus {
  PENDING
  GENERATING
  COMPLETED
  FAILED
}
```

---

## 2. Core Schema Definitions

### 2.1 Identity & Access

```prisma
model User {
  id            String     @id @default(uuid()) @db.Uuid
  email         String     @unique @db.VarChar(255)
  password_hash String     @db.VarChar(255)
  full_name     String     @db.VarChar(255)
  phone         String?    @db.VarChar(20)
  status        UserStatus @default(ACTIVE)
  last_login_at DateTime?
  failed_login_count Int   @default(0)
  locked_until  DateTime?

  user_roles    UserRole[]
  user_scopes   UserScope[]
  sessions      Session[]
  audit_logs    AuditLog[]  @relation("actor")

  created_at    DateTime   @default(now())
  updated_at    DateTime   @updatedAt
  created_by    String?    @db.Uuid
  updated_by    String?    @db.Uuid

  @@map("users")
}

model Role {
  id             String     @id @default(uuid()) @db.Uuid
  name           String     @unique @db.VarChar(100)
  description    String?    @db.Text
  is_system_role Boolean    @default(false)

  user_roles       UserRole[]
  role_permissions RolePermission[]

  created_at     DateTime   @default(now())
  updated_at     DateTime   @updatedAt

  @@map("roles")
}

model Permission {
  id          String  @id @default(uuid()) @db.Uuid
  code        String  @unique @db.VarChar(100)  // e.g. subscribers.subscriber.create
  module      String  @db.VarChar(50)
  action      String  @db.VarChar(50)
  description String? @db.Text

  role_permissions RolePermission[]

  @@map("permissions")
}

model UserRole {
  id      String @id @default(uuid()) @db.Uuid
  user_id String @db.Uuid
  role_id String @db.Uuid

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)
  role Role @relation(fields: [role_id], references: [id], onDelete: Cascade)

  @@unique([user_id, role_id])
  @@map("user_roles")
}

model UserScope {
  id           String  @id @default(uuid()) @db.Uuid
  user_id      String  @db.Uuid
  barangay_id  String? @db.Uuid
  partner_id   String? @db.Uuid

  user     User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  barangay Barangay? @relation(fields: [barangay_id], references: [id])
  partner  Partner?  @relation(fields: [partner_id], references: [id])

  @@map("user_scopes")
}

model RolePermission {
  id            String @id @default(uuid()) @db.Uuid
  role_id       String @db.Uuid
  permission_id String @db.Uuid

  role       Role       @relation(fields: [role_id], references: [id], onDelete: Cascade)
  permission Permission @relation(fields: [permission_id], references: [id], onDelete: Cascade)

  @@unique([role_id, permission_id])
  @@map("role_permissions")
}

model Session {
  id         String   @id @default(uuid()) @db.Uuid
  user_id    String   @db.Uuid
  token_hash String   @db.VarChar(255)
  ip_address String?  @db.VarChar(45)
  user_agent String?  @db.Text
  expires_at DateTime
  revoked_at DateTime?

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  created_at DateTime @default(now())

  @@index([user_id])
  @@map("sessions")
}
```

### 2.2 Tenant Management

```prisma
model Barangay {
  id           String         @id @default(uuid()) @db.Uuid
  name         String         @unique @db.VarChar(255)
  municipality String         @db.VarChar(255)
  province     String         @db.VarChar(255)
  region       String?        @db.VarChar(100)
  status       BarangayStatus @default(ONBOARDING)
  latitude     Decimal?       @db.Decimal(10, 7)
  longitude    Decimal?       @db.Decimal(10, 7)

  service_zones      ServiceZone[]
  subscribers        Subscriber[]
  network_assets     NetworkAsset[]
  billing_cycles     BillingCycle[]
  partner_agreements PartnerAgreement[]
  user_scopes        UserScope[]

  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  created_by  String?  @db.Uuid
  updated_by  String?  @db.Uuid

  @@map("barangays")
}

model ServiceZone {
  id          String @id @default(uuid()) @db.Uuid
  barangay_id String @db.Uuid
  name        String @db.VarChar(255)
  description String? @db.Text

  barangay Barangay @relation(fields: [barangay_id], references: [id])

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  @@map("service_zones")
}

model Partner {
  id             String  @id @default(uuid()) @db.Uuid
  company_name   String  @db.VarChar(255)
  contact_person String? @db.VarChar(255)
  phone          String? @db.VarChar(20)
  email          String? @db.VarChar(255)
  address        String? @db.Text
  status         String  @default("ACTIVE") @db.VarChar(20)

  partner_agreements PartnerAgreement[]
  user_scopes        UserScope[]

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  created_by String?  @db.Uuid
  updated_by String?  @db.Uuid

  @@map("partners")
}

model PartnerAgreement {
  id              String          @id @default(uuid()) @db.Uuid
  partner_id      String          @db.Uuid
  barangay_id     String          @db.Uuid
  agreement_number String         @unique @db.VarChar(50)
  effective_date  DateTime        @db.Date
  end_date        DateTime?       @db.Date
  status          AgreementStatus @default(DRAFT)
  version         Int             @default(1)
  notes           String?         @db.Text

  partner            Partner            @relation(fields: [partner_id], references: [id])
  barangay           Barangay           @relation(fields: [barangay_id], references: [id])
  revenue_share_rules RevenueShareRule[]
  settlements        Settlement[]

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  created_by String?  @db.Uuid
  updated_by String?  @db.Uuid

  @@index([partner_id, barangay_id])
  @@map("partner_agreements")
}

model RevenueShareRule {
  id                  String    @id @default(uuid()) @db.Uuid
  agreement_id        String    @db.Uuid
  share_type          ShareType // GROSS or NET
  partner_percentage  Decimal   @db.Decimal(5, 2) // e.g. 30.00
  deduction_buckets   Json?     // [{name: "opex", percentage: 10}, ...]
  description         String?   @db.Text

  agreement PartnerAgreement @relation(fields: [agreement_id], references: [id], onDelete: Cascade)

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  @@map("revenue_share_rules")
}
```

### 2.3 Subscriber

```prisma
model Subscriber {
  id              String           @id @default(uuid()) @db.Uuid
  account_number  String           @unique @db.VarChar(30) // e.g. BRGY-001-00001
  full_name       String           @db.VarChar(255)
  phone           String?          @db.VarChar(20)
  email           String?          @db.VarChar(255)
  barangay_id     String           @db.Uuid
  status          SubscriberStatus @default(PROSPECT)
  billing_class   String?          @db.VarChar(50) // RESIDENTIAL, COMMERCIAL, etc.
  kyc_id_type     String?          @db.VarChar(50)
  kyc_id_number   String?          @db.VarChar(100)
  notes           String?          @db.Text
  deleted_at      DateTime?        // soft delete

  barangay           Barangay           @relation(fields: [barangay_id], references: [id])
  address            SubscriberAddress?
  subscriptions      Subscription[]
  installation_jobs  InstallationJob[]
  service_tickets    ServiceTicket[]
  invoices           Invoice[]
  payments           Payment[]
  ledger_entries     AccountLedgerEntry[]
  suspension_actions SuspensionAction[]
  ont_device         OntDevice?

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  created_by String?  @db.Uuid
  updated_by String?  @db.Uuid

  @@index([barangay_id, status])
  @@map("subscribers")
}

model SubscriberAddress {
  id            String   @id @default(uuid()) @db.Uuid
  subscriber_id String   @unique @db.Uuid
  address_line  String   @db.VarChar(500)
  purok_sitio   String?  @db.VarChar(255)
  barangay_name String?  @db.VarChar(255)
  municipality  String?  @db.VarChar(255)
  province      String?  @db.VarChar(255)
  geotag_lat    Decimal? @db.Decimal(10, 7)
  geotag_lng    Decimal? @db.Decimal(10, 7)

  subscriber Subscriber @relation(fields: [subscriber_id], references: [id], onDelete: Cascade)

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  @@map("subscriber_addresses")
}

model Subscription {
  id           String   @id @default(uuid()) @db.Uuid
  subscriber_id String  @db.Uuid
  plan_id      String   @db.Uuid
  start_date   DateTime @db.Date
  end_date     DateTime? @db.Date
  status       String   @default("ACTIVE") @db.VarChar(20)

  subscriber Subscriber  @relation(fields: [subscriber_id], references: [id])
  plan       ServicePlan @relation(fields: [plan_id], references: [id])

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  @@index([subscriber_id])
  @@map("subscriptions")
}
```

### 2.4 Product & Pricing

```prisma
model ServicePlan {
  id               String     @id @default(uuid()) @db.Uuid
  name             String     @db.VarChar(255)
  speed_mbps       Int
  monthly_fee      Decimal    @db.Decimal(18, 2)
  installation_fee Decimal    @default(0) @db.Decimal(18, 2)
  status           PlanStatus @default(ACTIVE)
  description      String?    @db.Text

  plan_features PlanFeature[]
  subscriptions Subscription[]
  promos        Promo[]

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  created_by String?  @db.Uuid
  updated_by String?  @db.Uuid

  @@map("service_plans")
}

model PlanFeature {
  id            String @id @default(uuid()) @db.Uuid
  plan_id       String @db.Uuid
  feature_name  String @db.VarChar(100)
  feature_value String @db.VarChar(255)

  plan ServicePlan @relation(fields: [plan_id], references: [id], onDelete: Cascade)

  @@map("plan_features")
}

model Promo {
  id                  String    @id @default(uuid()) @db.Uuid
  plan_id             String    @db.Uuid
  name                String    @db.VarChar(255)
  discount_amount     Decimal?  @db.Decimal(18, 2)
  discount_percentage Decimal?  @db.Decimal(5, 2)
  duration_months     Int?
  valid_from          DateTime  @db.Date
  valid_to            DateTime? @db.Date
  status              String    @default("ACTIVE") @db.VarChar(20)

  plan ServicePlan @relation(fields: [plan_id], references: [id])

  created_at DateTime @default(now())

  @@map("promos")
}
```

### 2.5 Network Inventory

```prisma
model NetworkAssetType {
  id              String @id @default(uuid()) @db.Uuid
  name            String @unique @db.VarChar(100) // OLT, PON_PORT, SPLITTER, DISTRIBUTION_BOX, ONT, FIBER_SEGMENT
  hierarchy_level Int // 1=OLT, 2=PON, 3=Splitter, 4=DistBox, 5=ONT
  description     String? @db.Text

  network_assets NetworkAsset[]

  @@map("network_asset_types")
}

model NetworkAsset {
  id              String      @id @default(uuid()) @db.Uuid
  asset_type_id   String      @db.Uuid
  barangay_id     String      @db.Uuid
  parent_asset_id String?     @db.Uuid
  serial_number   String?     @db.VarChar(100)
  name            String      @db.VarChar(255)
  status          AssetStatus @default(PLANNED)
  capacity        Int?
  latitude        Decimal?    @db.Decimal(10, 7)
  longitude       Decimal?    @db.Decimal(10, 7)
  notes           String?     @db.Text

  asset_type   NetworkAssetType @relation(fields: [asset_type_id], references: [id])
  barangay     Barangay         @relation(fields: [barangay_id], references: [id])
  parent_asset NetworkAsset?    @relation("AssetHierarchy", fields: [parent_asset_id], references: [id])
  child_assets NetworkAsset[]   @relation("AssetHierarchy")

  olt_port          OltPort?
  splitter          Splitter?
  distribution_box  DistributionBox?
  ont_device        OntDevice?
  segments_from     FiberSegment[] @relation("SegmentFrom")
  segments_to       FiberSegment[] @relation("SegmentTo")

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  created_by String?  @db.Uuid
  updated_by String?  @db.Uuid

  @@index([barangay_id, asset_type_id, status])
  @@index([parent_asset_id])
  @@map("network_assets")
}

model OltPort {
  id                    String @id @default(uuid()) @db.Uuid
  asset_id              String @unique @db.Uuid
  port_number           Int
  capacity              Int    @default(128) // max subscribers
  subscribers_connected Int    @default(0)

  asset NetworkAsset @relation(fields: [asset_id], references: [id], onDelete: Cascade)

  @@map("olt_ports")
}

model Splitter {
  id           String @id @default(uuid()) @db.Uuid
  asset_id     String @unique @db.Uuid
  ratio        String @db.VarChar(10) // e.g. "1:8", "1:16"
  output_count Int

  asset NetworkAsset @relation(fields: [asset_id], references: [id], onDelete: Cascade)

  @@map("splitters")
}

model DistributionBox {
  id       String  @id @default(uuid()) @db.Uuid
  asset_id String  @unique @db.Uuid
  capacity Int
  location String? @db.VarChar(255)

  asset NetworkAsset @relation(fields: [asset_id], references: [id], onDelete: Cascade)

  @@map("distribution_boxes")
}

model OntDevice {
  id            String  @id @default(uuid()) @db.Uuid
  asset_id      String  @unique @db.Uuid
  subscriber_id String? @unique @db.Uuid
  mac_address   String? @db.VarChar(17)
  model         String? @db.VarChar(100)

  asset      NetworkAsset @relation(fields: [asset_id], references: [id], onDelete: Cascade)
  subscriber Subscriber?  @relation(fields: [subscriber_id], references: [id])

  @@map("ont_devices")
}

model FiberSegment {
  id            String  @id @default(uuid()) @db.Uuid
  from_asset_id String  @db.Uuid
  to_asset_id   String  @db.Uuid
  length_meters Decimal? @db.Decimal(10, 2)
  fiber_type    String? @db.VarChar(50) // SINGLE_MODE, MULTI_MODE
  cable_count   Int?

  from_asset NetworkAsset @relation("SegmentFrom", fields: [from_asset_id], references: [id])
  to_asset   NetworkAsset @relation("SegmentTo", fields: [to_asset_id], references: [id])

  created_at DateTime @default(now())

  @@map("fiber_segments")
}
```

### 2.6 Installation, Tickets, Billing, Suspension, Settlement, and System tables

> **Note**: These follow the same pattern above — full Prisma schema definitions with UUIDs, DECIMAL(18,2) for monetary fields, proper enums, audit columns (`created_at`, `updated_at`, `created_by`, `updated_by`), FK relations, and indexes. Due to document length, key table schemas are shown below.

```prisma
model InstallationJob {
  id                   String             @id @default(uuid()) @db.Uuid
  subscriber_id        String             @db.Uuid
  status               InstallationStatus @default(LEAD_CREATED)
  assigned_technician_id String?          @db.Uuid
  scheduled_date       DateTime?          @db.Date
  completed_date       DateTime?          @db.Date
  activation_date      DateTime?          @db.Date
  failure_reason       String?            @db.Text
  reschedule_reason    String?            @db.Text
  notes                String?            @db.Text

  subscriber Subscriber @relation(fields: [subscriber_id], references: [id])
  technician User?      @relation(fields: [assigned_technician_id], references: [id])
  materials  InstallationMaterial[]
  photos     InstallationPhoto[]

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  created_by String?  @db.Uuid

  @@index([subscriber_id])
  @@index([assigned_technician_id])
  @@map("installation_jobs")
}

model Invoice {
  id               String        @id @default(uuid()) @db.Uuid
  invoice_number   String        @unique @db.VarChar(30)
  subscriber_id    String        @db.Uuid
  billing_cycle_id String?       @db.Uuid
  barangay_id      String        @db.Uuid
  total_amount     Decimal       @db.Decimal(18, 2)
  amount_paid      Decimal       @default(0) @db.Decimal(18, 2)
  due_date         DateTime      @db.Date
  status           InvoiceStatus @default(DRAFT)
  issued_at        DateTime?

  subscriber    Subscriber    @relation(fields: [subscriber_id], references: [id])
  billing_cycle BillingCycle? @relation(fields: [billing_cycle_id], references: [id])
  lines         InvoiceLine[]
  payments      Payment[]
  adjustments   Adjustment[]
  write_offs    WriteOff[]

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  created_by String?  @db.Uuid

  @@index([subscriber_id, status])
  @@index([billing_cycle_id])
  @@index([barangay_id, status])
  @@map("invoices")
}

model Payment {
  id                String        @id @default(uuid()) @db.Uuid
  invoice_id        String?       @db.Uuid
  subscriber_id     String        @db.Uuid
  barangay_id       String        @db.Uuid
  amount            Decimal       @db.Decimal(18, 2)
  method            PaymentMethod
  receipt_reference String?       @db.VarChar(100)
  notes             String?       @db.Text
  posted_at         DateTime      @default(now())
  posted_by         String        @db.Uuid
  reversed_at       DateTime?
  reversal_reason   String?       @db.Text

  invoice    Invoice?   @relation(fields: [invoice_id], references: [id])
  subscriber Subscriber @relation(fields: [subscriber_id], references: [id])

  created_at DateTime @default(now())

  @@index([subscriber_id, posted_at])
  @@index([barangay_id, posted_at])
  @@map("payments")
}

model Settlement {
  id               String           @id @default(uuid()) @db.Uuid
  agreement_id     String           @db.Uuid
  period_start     DateTime         @db.Date
  period_end       DateTime         @db.Date
  status           SettlementStatus @default(DRAFTED)
  gross_revenue    Decimal          @db.Decimal(18, 2)
  total_deductions Decimal          @default(0) @db.Decimal(18, 2)
  net_revenue      Decimal          @db.Decimal(18, 2)
  partner_share    Decimal          @db.Decimal(18, 2)
  operator_share   Decimal          @db.Decimal(18, 2)
  calculated_at    DateTime?
  approved_by      String?          @db.Uuid
  approved_at      DateTime?
  disbursed_at     DateTime?
  locked_at        DateTime?
  notes            String?          @db.Text

  agreement   PartnerAgreement     @relation(fields: [agreement_id], references: [id])
  lines       SettlementLine[]
  adjustments SettlementAdjustment[]
  statement   PartnerStatement?

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  created_by String?  @db.Uuid

  @@unique([agreement_id, period_start])
  @@map("settlements")
}

model AuditLog {
  id             String      @id @default(uuid()) @db.Uuid
  entity_type    String      @db.VarChar(100)
  entity_id      String      @db.Uuid
  action         AuditAction
  actor_id       String?     @db.Uuid
  actor_role     String?     @db.VarChar(100)
  actor_ip       String?     @db.VarChar(45)
  previous_value Json?
  new_value      Json?
  source_module  String?     @db.VarChar(100)
  reason_code    String?     @db.VarChar(100)
  barangay_id    String?     @db.Uuid

  actor User? @relation("actor", fields: [actor_id], references: [id])

  created_at DateTime @default(now())

  @@index([entity_type, entity_id, created_at])
  @@index([actor_id, created_at])
  @@index([barangay_id, created_at])
  @@map("audit_logs")
}
```

---

## 3. Seed Data Requirements

| Category | Data | Priority |
|----------|------|:--------:|
| Roles | 12 predefined roles (Super Admin through Read-only Executive) | Phase 0 |
| Permissions | All module.entity.action permissions (~150+) | Phase 0 |
| Role-Permission mappings | Default RBAC matrix | Phase 0 |
| Network asset types | OLT, PON_PORT, SPLITTER, DISTRIBUTION_BOX, ONT, FIBER_SEGMENT | Phase 0 |
| Ticket categories | 12 predefined categories | Phase 0 |
| SLA definitions | P1: 4h, P2: 8h, P3: 24h, P4: 72h | Phase 0 |
| Payment methods | CASH, GCASH, BANK_TRANSFER, CHECK, ONLINE, OTHER | Phase 0 |
| System settings | Default billing rules, suspension thresholds | Phase 0 |
| Demo barangays | 4 sample barangays (Poblacion, San Jose, Santa Cruz, Bagumbayan) | Staging |
| Demo partners | 2-3 sample JV partners with agreements | Staging |
| Demo subscribers | 50-100 subscribers across lifecycle states | Staging |
