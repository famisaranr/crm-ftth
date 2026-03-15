---
name: "Role Definitions"
description: "Quick-reference for all 12 user roles with scope level, module access, and data visibility"
---

# Role Definitions Reference

## Role Summary

| # | Role | Scope Level | Data Visibility | Financial Access |
|---|------|------------|----------------|:--:|
| 1 | Super Admin | Global | All data, all barangays | ✅ Full |
| 2 | Corporate Admin | Global | All data, all barangays | ✅ Full |
| 3 | Operations Manager | Global | All operational data | ⚠️ Read-only financials |
| 4 | Barangay Manager | Barangay-scoped | Own barangay(s) only | ⚠️ Limited |
| 5 | JV Partner Viewer | Partner-scoped | Own partner settlement data only | ⚠️ Own settlements |
| 6 | Finance / Billing Officer | Global | All billing and financial data | ✅ Full |
| 7 | Collection Officer / Cashier | Barangay-scoped | Billing data for assigned barangays | ✅ Payment posting |
| 8 | Network Engineer | Global | All network asset data | ❌ None |
| 9 | Field Technician | Assignment-scoped | Own assigned jobs and tickets | ❌ None |
| 10 | Customer Service / Support | Barangay-scoped | Subscriber and ticket data | ❌ None |
| 11 | Auditor / Compliance Viewer | Global (read-only) | All data including audit logs | ✅ Read-only |
| 12 | Read-only Executive | Global (read-only) | Dashboards and reports only | ✅ Read-only |

## Role Details

### 1. Super Admin
- **Purpose**: System-wide administration and configuration
- **Can**: Manage users, roles, system settings, all CRUD operations
- **Cannot**: N/A (unrestricted)
- **Special**: Only role that can create other Super Admins

### 2. Corporate Admin / Head Office
- **Purpose**: Day-to-day platform management across all barangays
- **Can**: Manage barangays, partners, agreements, users, view all data
- **Cannot**: Modify system configuration, create Super Admins

### 3. Operations Manager
- **Purpose**: Oversee field operations, installations, and support
- **Can**: Manage subscribers, installations, tickets, assets across all barangays
- **Cannot**: Post payments, approve settlements, modify agreements

### 4. Barangay Manager
- **Purpose**: Manage operations within assigned barangay(s)
- **Can**: CRUD subscribers, manage tickets, view installations — in own barangay only
- **Cannot**: See other barangay data, manage financials, modify agreements

### 5. JV Partner Viewer
- **Purpose**: Allow JV partners to view their settlement and performance data
- **Can**: View settlement reports, subscriber counts, revenue for own partnership
- **Cannot**: Modify any data, see other partner data, access PII

### 6. Finance / Billing Officer
- **Purpose**: Manage billing, payments, and financial operations
- **Can**: Generate invoices, post payments, run settlements, manage write-offs
- **Cannot**: Modify subscriber details, manage network assets, handle tickets

### 7. Collection Officer / Cashier
- **Purpose**: Field-level payment collection
- **Can**: Post payments, view billing status — in assigned barangays
- **Cannot**: Generate invoices, run settlements, modify subscriber data

### 8. Network Engineer
- **Purpose**: Manage FTTH network infrastructure
- **Can**: CRUD network assets, manage OLT/splitter/ONT inventory, view topology
- **Cannot**: Access financial data, modify subscriber billing info

### 9. Field Technician
- **Purpose**: Execute installations and service calls
- **Can**: View and update assigned jobs and tickets, log field visit notes
- **Cannot**: Create subscribers, access billing, view other techs' assignments

### 10. Customer Service / Support
- **Purpose**: Handle subscriber inquiries and support tickets
- **Can**: CRUD subscribers, create/manage tickets — in assigned barangays
- **Cannot**: Access billing, settlements, network asset management

### 11. Auditor / Compliance Viewer
- **Purpose**: Regulatory compliance and audit trail review
- **Can**: Read all data including audit logs across all barangays
- **Cannot**: Modify ANY data (strictly read-only)

### 12. Read-only Executive
- **Purpose**: Executive oversight via dashboards and reports
- **Can**: View dashboards, KPIs, reports across all barangays
- **Cannot**: Modify ANY data, access detailed subscriber PII
