# UI Specifications
## FiberOps PH – Component Library & Screen Specs

**Document ID**: UIS-FOPS-001
**Version**: 1.0
**Date**: 2026-03-07

---

## 1. Design System Foundation

### 1.1 Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#003366` | Primary actions, active nav, headers |
| `--primary-light` | `#004c99` | Hover states |
| `--primary-dark` | `#002244` | Active/pressed states |
| `--accent` | `#00E5FF` | Highlights, notification badges |
| `--bg-light` | `#f5f7f8` | Light mode background |
| `--bg-dark` | `#0f1923` | Dark mode background |
| `--surface-light` | `#ffffff` | Light mode card surfaces |
| `--surface-dark` | `rgba(255,255,255,0.03)` | Dark mode glass cards |
| `--success` | `#10B981` (emerald-500) | Active states, positive trends |
| `--warning` | `#F59E0B` (amber-500) | Pending, warning states |
| `--danger` | `#EF4444` (red-500) | Errors, suspended, critical |
| `--info` | `#3B82F6` (blue-500) | Informational badges |

### 1.2 Typography

| Element | Font | Weight | Size | Line Height |
|---------|------|:------:|:----:|:-----------:|
| Page Title | Inter | 700 | 24px (text-2xl) | 1.2 |
| Section Title | Inter | 700 | 18px (text-lg) | 1.4 |
| Card Title | Inter | 600 | 16px (text-base) | 1.5 |
| Body | Inter | 400 | 14px (text-sm) | 1.5 |
| Caption | Inter | 500 | 12px (text-xs) | 1.4 |
| Label | Inter | 600 | 12px (text-xs) | 1.4 |
| Monospace (IDs) | JetBrains Mono / system mono | 600 | 12px | 1.4 |

### 1.3 Spacing & Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight padding |
| `--space-2` | 8px | Input padding, small gaps |
| `--space-3` | 12px | Card padding (compact) |
| `--space-4` | 16px | Standard padding, gaps |
| `--space-6` | 24px | Section spacing |
| `--space-8` | 32px | Page margins |
| `--radius-sm` | 4px | Badges, small elements |
| `--radius-md` | 8px | Cards, inputs |
| `--radius-lg` | 12px | Large cards, dialogs |
| `--radius-xl` | 16px | Feature cards |

---

## 2. Component Specifications

### 2.1 DataTable (TanStack Table)

Used for all list views.

| Feature | Implementation |
|---------|---------------|
| Pagination | Server-side, 20 rows/page default, configurable |
| Sorting | Clickable column headers, single-column sort, URL-synced |
| Filtering | Filter bar above table with field-specific inputs |
| Search | Global search input with debounced API call (300ms) |
| Row click | Navigate to detail page |
| Actions | kebab menu (⋮) in last column |
| Empty state | Illustration + "No {entity} found" + CTA button |
| Loading | Skeleton rows during fetch |
| Selection | Checkbox column for bulk actions (where applicable) |
| Export | "Export CSV" button in toolbar |
| Responsive | Horizontal scroll on mobile, priority columns visible |

### 2.2 Form Components (React Hook Form + Zod)

| Component | shadcn Component | Validation |
|-----------|-----------------|-----------|
| Text Input | `<Input>` | Zod string rules |
| Select | `<Select>` | Zod enum |
| Combobox | `<Combobox>` (searchable select) | Zod enum/string |
| Date Picker | `<DatePicker>` (calendar popup) | Zod date |
| Textarea | `<Textarea>` | Zod string with maxLength |
| Number | `<Input type="number">` | Zod number with min/max |
| Currency | Custom `<CurrencyInput>` | Zod decimal, ≥ 0 |
| Phone | Custom `<PhoneInput>` | PH format regex |
| Toggle | `<Switch>` | Zod boolean |
| File Upload | Custom `<FileUpload>` | File type + size validation |

**Form patterns**:
- All forms show inline validation errors below each field
- Submit button disabled until form is valid
- Success: toast notification + redirect to list/detail
- Error: toast notification with error message, form remains

### 2.3 Status Badges

| Status | Background | Text | Dot Color |
|--------|-----------|------|-----------|
| ACTIVE | `bg-emerald-100` | `text-emerald-700` | `bg-emerald-500` |
| PROSPECT | `bg-blue-100` | `text-blue-700` | `bg-blue-500` |
| SURVEYED | `bg-cyan-100` | `text-cyan-700` | `bg-cyan-500` |
| INSTALLATION_READY | `bg-violet-100` | `text-violet-700` | `bg-violet-500` |
| SUSPENDED_SOFT | `bg-amber-100` | `text-amber-700` | `bg-amber-500` |
| SUSPENDED_HARD | `bg-red-100` | `text-red-700` | `bg-red-500` |
| DISCONNECTED | `bg-slate-100` | `text-slate-700` | `bg-slate-500` |
| CHURNED | `bg-slate-100` | `text-slate-500` | `bg-slate-400` |
| PAID | `bg-emerald-100` | `text-emerald-700` | — |
| OVERDUE | `bg-red-100` | `text-red-700` | — |
| PENDING | `bg-amber-100` | `text-amber-700` | — |
| OPEN | `bg-blue-100` | `text-blue-700` | — |
| IN_PROGRESS | `bg-indigo-100` | `text-indigo-700` | — |
| RESOLVED | `bg-emerald-100` | `text-emerald-700` | — |
| CLOSED | `bg-slate-100` | `text-slate-700` | — |

### 2.4 Stat Cards (Dashboard)

```
┌────────────────────────────┐
│ Metric Label (xs, uppercase)│
│ Value (2xl, bold)           │
│ ▲ +5.2% (xs, colored)      │
└────────────────────────────┘
```

| Prop | Description |
|------|-------------|
| `label` | Metric name (uppercase caption) |
| `value` | Main display value |
| `trend` | Percentage change with arrow icon |
| `trendDirection` | UP (green) or DOWN (red/green depending on metric) |

### 2.5 Confirmation Dialog

Used for destructive or significant actions (delete, suspend, approve).

```
┌─────────────────────────────────┐
│ ⚠️ Confirm Suspension           │
│                                 │
│ Are you sure you want to        │
│ suspend subscriber Juan Dela    │
│ Cruz? This will disable their   │
│ internet service.               │
│                                 │
│ Reason: [________________]     │
│                                 │
│         [Cancel]  [Confirm]     │
└─────────────────────────────────┘
```

- Mandatory reason field for: suspend, disconnect, adjust, write-off, override
- Confirm button uses danger color for destructive actions
- Cancel returns to previous state

---

## 3. Key Screen Wireframe Specs

### 3.1 Subscriber List (SCR-SUB-001)

```
┌────────────────────────────────────────────────────────┐
│ [Sidebar] │ Subscribers                    [+ New Sub] │
│           │ ┌──────────────────────┐ [Barangay ▼] [St] │
│           │ │ 🔍 Search account... │                    │
│           │ └──────────────────────┘                    │
│           │ ┌──────────────────────────────────────────┐│
│           │ │ Account  │ Name      │ Brgy │ Plan │ St ││
│           │ │──────────│───────────│──────│──────│────││
│           │ │ POB-001  │ J. Cruz   │ Pob. │ 50M  │ 🟢 ││
│           │ │ POB-002  │ M. Santos │ Pob. │ 100M │ 🟡 ││
│           │ │ SJ-001   │ A. Luna   │ S.J. │ 50M  │ 🔴 ││
│           │ └──────────────────────────────────────────┘│
│           │ Showing 1-20 of 1,250          [◀ 1 2 3 ▶] │
└────────────────────────────────────────────────────────┘
```

### 3.2 Subscriber Detail (SCR-SUB-003)

```
┌────────────────────────────────────────────────────────┐
│ [Sidebar] │ ← Back  Subscriber Detail  [⋮ Actions ▼]  │
│           │ ┌──────────────────────────────────────────┐│
│           │ │ 👤 Juan Dela Cruz     🟢 ACTIVE          ││
│           │ │ ID: POB-00001  │  Brgy. Poblacion        ││
│           │ │ Plan: FIBER 50Mbps  │  ₱1,500/mo         ││
│           │ └──────────────────────────────────────────┘│
│           │ [Overview] [Network] [Billing] [Tickets]    │
│           │ ┌──────────────────────────────────────────┐│
│           │ │ Contact    │ Phone: 09XX...              ││
│           │ │            │ Email: juan@...             ││
│           │ │────────────│────────────────────────────│ │
│           │ │ Address    │ 123 Purok 4, Brgy Poblacion ││
│           │ │ Geotag     │ [📍 Pin on mini-map]        ││
│           │ └──────────────────────────────────────────┘│
└────────────────────────────────────────────────────────┘
```

### 3.3 Payment Posting (SCR-BIL-004)

```
┌────────────────────────────────────────────────────────┐
│ [Sidebar] │ Post Payment                               │
│           │ ┌──────────────────────────────────────────┐│
│           │ │ Subscriber: [🔍 Search by account/name] ││
│           │ │ Outstanding: ₱3,000.00 (2 invoices)     ││
│           │ │                                         ││
│           │ │ Amount:  [₱ ___________]                 ││
│           │ │ Method:  [Cash ▼]                        ││
│           │ │ Receipt: [_______________]               ││
│           │ │ Notes:   [_______________]               ││
│           │ │                                         ││
│           │ │ ┌── Applied to: ──────────────────────┐  ││
│           │ │ │ INV-2026-000001  ₱1,500  Mar 2026  │  ││
│           │ │ │ INV-2026-000002  ₱1,500  Apr 2026  │  ││
│           │ │ └─────────────────────────────────────┘  ││
│           │ │                                         ││
│           │ │         [Cancel]  [Post Payment]         ││
│           │ └──────────────────────────────────────────┘│
└────────────────────────────────────────────────────────┘
```

### 3.4 Settlement Calculator (SCR-SET-002)

```
┌────────────────────────────────────────────────────────┐
│ [Sidebar] │ New Settlement                             │
│           │ ┌──────────────────────────────────────────┐│
│           │ │ Agreement:  [Partner - Barangay ▼]       ││
│           │ │ Period:     [March 2026 ▼]               ││
│           │ │                         [Calculate]       ││
│           │ │──────────────────────────────────────────││
│           │ │ Gross Collections      ₱ 500,000.00     ││
│           │ │ (-) OpEx Maintenance   ₱  25,000.00     ││
│           │ │ (-) Admin Overhead     ₱  15,000.00     ││
│           │ │ (-) Marketing Fund     ₱  10,000.00     ││
│           │ │──────────────────────────────────────────││
│           │ │ Net Revenue            ₱ 450,000.00     ││
│           │ │ Partner Share (30%)    ₱ 135,000.00     ││
│           │ │ Operator Share (70%)   ₱ 315,000.00     ││
│           │ │──────────────────────────────────────────││
│           │ │     [Cancel]  [Submit for Approval]      ││
│           │ └──────────────────────────────────────────┘│
└────────────────────────────────────────────────────────┘
```

---

## 4. Toast Notification Pattern

| Type | Icon | Color | Duration | Example |
|------|------|-------|:--------:|---------|
| Success | ✅ | Emerald | 3s | "Payment posted successfully" |
| Error | ❌ | Red | 5s (sticky) | "Failed to generate invoice" |
| Warning | ⚠️ | Amber | 5s | "Subscriber has active dispute" |
| Info | ℹ️ | Blue | 3s | "Report export started" |

---

## 5. Loading & Empty States

| State | Treatment |
|-------|----------|
| **Page loading** | Full-page skeleton with layout placeholder |
| **Table loading** | Skeleton rows matching table column structure |
| **Detail loading** | Skeleton card with placeholder fields |
| **Empty list** | Centered illustration + title + description + CTA |
| **No search results** | "No results for '{query}'" + suggestion to broaden search |
| **Error state** | Error icon + message + "Retry" button |
