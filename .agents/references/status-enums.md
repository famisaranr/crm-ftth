---
name: "Status Enums"
description: "Consolidated reference of all status enumerations used across FiberOps PH"
---

# Status Enums Reference

All status values defined once here and referenced by all agents. Any change to status values must update this reference first.

---

## SubscriberStatus
| Value | Description | Transition From |
|-------|-------------|-----------------|
| `PROSPECT` | Initial lead/prospect | — (initial) |
| `SURVEYED` | Survey completed | PROSPECT |
| `INSTALLATION_READY` | Feasible, ready for install | SURVEYED |
| `ACTIVE` | Service activated and billing | INSTALLATION_READY, SUSPENDED_SOFT, SUSPENDED_HARD |
| `SUSPENDED_SOFT` | Soft suspension (warning/throttle) | ACTIVE |
| `SUSPENDED_HARD` | Hard suspension (service disabled) | SUSPENDED_SOFT |
| `DISCONNECTED` | Permanently disconnected | SUSPENDED_HARD |
| `CHURNED` | Voluntary cancellation | ACTIVE, SUSPENDED_SOFT, SUSPENDED_HARD |

## InstallationStatus
| Value | Description |
|-------|-------------|
| `LEAD_CREATED` | Subscriber lead entered |
| `SURVEY_SCHEDULED` | Survey visit scheduled |
| `SURVEY_COMPLETED` | Survey visit done |
| `FEASIBLE` | Location is feasible for FTTH |
| `NOT_FEASIBLE` | Location not feasible |
| `INSTALL_SCHEDULED` | Installation date set |
| `INSTALLED` | Physical installation complete |
| `ACTIVATED` | Service activated on network |
| `QA_VERIFIED` | Quality check passed |
| `BILLING_STARTED` | First billing cycle initiated |
| `FAILED` | Installation attempt failed |
| `RESCHEDULED` | Rescheduled after failure or no-show |

## TicketStatus
| Value | Description |
|-------|-------------|
| `OPEN` | Ticket created |
| `ASSIGNED` | Technician assigned |
| `IN_PROGRESS` | Work in progress |
| `PENDING_CUSTOMER` | Waiting for customer action |
| `RESOLVED` | Issue resolved |
| `CLOSED` | Ticket closed (confirmed resolved) |
| `ESCALATED` | Escalated to higher tier |
| `REOPENED` | Previously closed, reopened |

## TicketCategory
| Value | Description |
|-------|-------------|
| `NO_CONNECTION` | Complete service outage |
| `INTERMITTENT` | Intermittent connectivity |
| `SLOW_INTERNET` | Speed below plan threshold |
| `LOS_RED_LIGHT` | Loss of signal / red ONT light |
| `FIBER_CUT` | Physical fiber damage |
| `BILLING_ISSUE` | Billing dispute or inquiry |
| `RELOCATION` | Service address change |
| `UPGRADE_DOWNGRADE` | Plan change request |
| `ONT_REPLACEMENT` | Device replacement needed |
| `COMPLAINT` | General complaint |
| `ESCALATION` | External escalation |

## InvoiceStatus
| Value | Description |
|-------|-------------|
| `DRAFT` | Generated but not finalized |
| `GENERATED` | Finalized, ready for distribution |
| `SENT` | Delivered to subscriber |
| `PARTIALLY_PAID` | Some payment received |
| `PAID` | Fully paid |
| `OVERDUE` | Past due date |
| `WRITTEN_OFF` | Bad debt write-off |
| `VOIDED` | Cancelled/voided |

## PaymentMethod
| Value | Description |
|-------|-------------|
| `CASH` | Cash payment |
| `GCASH` | GCash mobile payment |
| `BANK_TRANSFER` | Bank transfer |
| `CHECK` | Check payment |
| `ONLINE` | Online payment gateway |
| `OTHER` | Other method |

## SettlementStatus
| Value | Description |
|-------|-------------|
| `DRAFTED` | Initial draft created |
| `CALCULATED` | Revenue share computed |
| `UNDER_REVIEW` | Awaiting review |
| `APPROVED` | Approved for disbursement |
| `DISBURSED` | Payment sent to partner |
| `LOCKED` | Period locked, immutable |
| `DISPUTED` | Partner disputes amount |

## AssetStatus
| Value | Description |
|-------|-------------|
| `PLANNED` | Planned for deployment |
| `DEPLOYED` | Physically installed |
| `ACTIVE` | In service |
| `MAINTENANCE` | Under maintenance |
| `DECOMMISSIONED` | Removed from service |
| `FAULTY` | Identified as faulty |

## UserStatus
| Value | Description |
|-------|-------------|
| `ACTIVE` | Can login and operate |
| `INACTIVE` | Account disabled |
| `LOCKED` | Locked due to failed logins |

## AgreementStatus
| Value | Description |
|-------|-------------|
| `DRAFT` | Being negotiated |
| `ACTIVE` | Currently in effect |
| `AMENDED` | Modified (new version active) |
| `EXPIRED` | Past end date |
| `TERMINATED` | Cancelled before expiry |
