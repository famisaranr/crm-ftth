---
name: "Module Registry"
description: "Module ID → name → directory → owning agent → phase → dependencies mapping"
---

# Module Registry Reference

| Module ID | Module Name | Domain | Backend Dir | Owning Agent | Phase | Dependencies |
|-----------|-------------|--------|-------------|-------------|:-----:|-------------|
| MOD-001 | Identity & Access | Auth | `modules/auth/` | Security Architect | 0 | — |
| MOD-002 | User Management | Auth | `modules/users/` | Security Architect | 0 | MOD-001 |
| MOD-003 | RBAC | Auth | `modules/rbac/` | Security Architect | 0 | MOD-001, MOD-002 |
| MOD-004 | Barangay Management | Tenant | `modules/barangays/` | Product Architect | 0 | MOD-003 |
| MOD-005 | Partner Management | Tenant | `modules/partners/` | Product Architect | 0 | MOD-004 |
| MOD-006 | Partner Agreements | Tenant | `modules/agreements/` | Data Architect | 0 | MOD-005 |
| MOD-007 | Service Plans | Product | `modules/plans/` | Product Architect | 0 | — |
| MOD-008 | Subscriber CRM | Subscriber | `modules/subscribers/` | Product Architect | 1 | MOD-004, MOD-007 |
| MOD-009 | Subscriptions | Subscriber | `modules/subscriptions/` | Product Architect | 1 | MOD-008, MOD-007 |
| MOD-010 | Network Assets | Network | `modules/network-assets/` | Solution Architect | 1 | MOD-004 |
| MOD-011 | Installation Workflow | Operations | `modules/installations/` | Solution Architect | 1 | MOD-008, MOD-010 |
| MOD-012 | Service Ticketing | Operations | `modules/tickets/` | Solution Architect | 1 | MOD-008 |
| MOD-013 | Dashboards (Basic) | Reporting | `modules/dashboards/` | UX Architect | 1 | MOD-008, MOD-010, MOD-012 |
| MOD-014 | Billing Engine | Billing | `modules/billing/` | Data Architect | 2 | MOD-008, MOD-009 |
| MOD-015 | Payment Management | Billing | `modules/payments/` | Data Architect | 2 | MOD-014 |
| MOD-016 | Suspension / Reactivation | Billing | `modules/suspension/` | Data Architect | 2 | MOD-014, MOD-015 |
| MOD-017 | Revenue Sharing Engine | Settlement | `modules/settlements/` | Data Architect | 3 | MOD-005, MOD-006, MOD-015 |
| MOD-018 | Partner Statements | Settlement | `modules/settlements/` | Data Architect | 3 | MOD-017 |
| MOD-019 | Reporting / Analytics | Reporting | `modules/reports/` | UX Architect | 4 | All modules |
| MOD-020 | Map / Topology View | Reporting | `modules/maps/` | Solution Architect | 4 | MOD-010 |
| MOD-021 | Audit Logging | System | `modules/audit/` | Security Architect | 0 | MOD-001 |
| MOD-022 | Notifications | System | `modules/notifications/` | Delivery Engineer | 4 | — |

## Dependency Rules
- A module in Phase N can only depend on modules in Phase ≤ N
- Circular dependencies are prohibited
- Cross-module communication uses service injection or events (never direct DB access)
