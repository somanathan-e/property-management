# Property Management Solution – Enterprise Navigation & Screen Design Structure

# Global Navigation Structure

The full enterprise taxonomy is the product target. The current repository implements a pragmatic subset of this taxonomy in `frontend/src/constants/navigation.ts`.

## Current Implemented Navigation

```text
Dashboard
├── Executive Overview
├── Leasing Metrics
└── Reporting

Property Management
├── Properties
├── Towers
├── Units
└── Amenities

Lease Management
├── Reservations
├── Leases
└── Unit Availability

CRM
├── Leads
├── Opportunities
└── Prospects

Customers
├── Customers
└── Contacts

Assets
├── Asset Registry
└── Building Assets

Administration
├── Users
├── Roles
├── Permissions
├── Configurations
└── Tenants
```

## Target Enterprise Navigation

```text
Home Dashboard
│
├── Property Management
│   ├── Portfolio Dashboard
│   ├── Property Master
│   ├── Building & Floor Management
│   ├── Unit Master
│   ├── Ownership & Legal
│   └── Community & Amenities
│
├── Customer Management
│   ├── Customer Dashboard
│   ├── Tenant Management
│   ├── Broker & Agency
│   └── CRM & Leads
│
├── Commercial Management
│   ├── Reservation Management
│   ├── Lease Management
│   └── Sales Management
│
├── Financial Management
│   ├── Billing Dashboard
│   ├── Payments & Receivables
│   ├── Collections & Recovery
│   └── Accounting Integration
│
├── Operations Management
│   ├── Maintenance Dashboard
│   ├── Preventive Maintenance
│   ├── Facility Management
│   ├── Vendor Management
│   ├── Inspection & Handover
│   └── Utility Management
│
├── Governance Management
│   ├── Document Management
│   ├── Workflow & Approvals
│   ├── Security & Access
│   └── Compliance & Audit
│
└── Enterprise Services
    ├── Notifications
    ├── Analytics Dashboard
    └── Integration Console
```

# 1. Enterprise Home Dashboard Screen

## Layout Structure

```text
┌─────────────────────────────────────────────────────────────┐
│ Logo | Search | Notifications | User Profile              │
├──────────────┬──────────────────────────────────────────────┤
│ Left Menu    │ Executive KPI Dashboard                     │
│              │                                              │
│ Modules      │ [ Occupancy ] [ Revenue ] [ Outstanding ]   │
│              │ [ Maintenance ] [ Expiring Leases ]         │
│              │                                              │
│              │ Portfolio Analytics                          │
│              │ Revenue Trends                               │
│              │ Occupancy Heatmap                            │
│              │ Open Work Orders                             │
│              │ Alerts & Pending Approvals                   │
└──────────────┴──────────────────────────────────────────────┘
```

# 2. Property Management Screens

## 2.1 Property Portfolio Dashboard

### Sections
- Total Properties
- Occupied Units
- Vacant Units
- Revenue by Property
- Property Performance
- Upcoming Expirations

### Navigation Tabs

```text
Overview | Buildings | Units | Ownership | Documents | Analytics
```

## 2.2 Property Master Screen

```text
Header
----------------------------------------------------
Property Code | Property Name | Status | Actions

Tabs
----------------------------------------------------
General Information
Building Structure
Amenities
Financial Setup
Documents
Audit Trail
```

### Main Form Areas

| Section | Fields |
|---|---|
| General Info | Property Name, Type, Region, Address |
| Classification | Category, Usage Type, Community |
| Ownership | Owner, Legal Entity |
| Financial | Currency, Tax Group |
| Status | Active/Inactive |

## 2.3 Unit Master Screen

### Split Layout

```text
Left Panel
- Building Tree
- Floors
- Units

Right Panel
- Unit Details
- Lease Status
- Occupancy
- Charges
- Attachments
```

# 3. Customer Management Screens

## 3.1 Customer Dashboard

### KPI Widgets
- Active Tenants
- New Customers
- Pending KYC
- Expiring Contracts

### Main Areas

```text
Customer List
Customer Timeline
Communication History
Open Requests
Documents
```

## 3.2 Tenant Profile Screen

### Tabs

```text
Profile | Lease History | Payments | Complaints | Documents
```

### Sections

| Area | Description |
|---|---|
| Personal Details | Name, ID, Contact |
| KYC | Emirates ID, Passport |
| Contracts | Active/Expired Leases |
| Financial | Outstanding, Payments |
| Requests | Maintenance, Complaints |

# 4. Commercial Management Screens

## 4.1 Reservation Management

```text
Select Reservation Period
↓
Select Currency
↓
Select Property
↓
Open Unit Selection Modal
↓
Search and Add Available Unit(s)
↓
Review Selected Units Grid and Totals
↓
Payment Details
↓
Approval Workflow
↓
Reservation Confirmation
```

### Side Panels
- Unit Details
- Customer Summary
- Reservation Timeline

### New Reservation Unit Selection

New Reservation uses one unit-selection UI for both one-unit and multi-unit reservations.

Header-level rules:

- one Customer
- one Property
- one Currency
- period must be selected before unit selection
- one selected unit is treated as Single Unit
- more than one selected unit is treated as Multi-Unit
- multi-unit selection is allowed only within the selected Property
- selected units may belong to the same Tower or different Towers under the selected Property

Unit selection happens in a modal. The modal must:

- search available units manually instead of showing every unit by default
- show only units available for the selected Property, period, and availability status
- support optional filters for Tower, Floor, Unit Type, Area, and Rent Range
- allow users to add and remove units manually
- prevent duplicates while adding
- validate live availability while adding

Selected Units Grid columns:

- Tower
- Unit
- Area
- Rent Frequency
- Benchmark Rent
- Negotiated Rent
- Variance Amount
- Variance %
- Deposit
- Charges
- Action

Consolidated Summary:

- Total Units
- Total Area
- Total Benchmark Rent
- Total Negotiated Rent
- Total Variance Amount
- Average Variance %
- Total Deposit
- Total Charges

Variance calculation:

```text
Variance Amount = Negotiated Rent - Benchmark Rent
Variance % = (Variance Amount / Benchmark Rent) * 100
```

## 4.2 Lease Management Screen

### Header Actions

```text
Create Lease | Renew | Amend | Terminate | Print
```

### Tabs

```text
Lease Details
Payment Terms
Billing Schedule
Approvals
Documents
Audit Logs
```

### Workflow Sidebar
- Draft
- Pending Approval
- Approved
- Active
- Expired

### New Lease Unit Selection

New Lease must use the same unit-selection model and visual behavior as New Reservation.

Header-level rules:

- one Customer
- one Property
- one Currency
- lease period must be selected before unit selection
- one selected unit is treated as Single Unit
- more than one selected unit is treated as Multi-Unit
- selected units must stay within the selected Property
- selected units may belong to the same Tower or different Towers under the selected Property

The unit-selection modal must:

- filter Properties, Towers, and Units by lease period and availability
- search units manually using optional Tower, Floor, Unit Type, Area, and Rent Range filters
- show only available units
- allow users to add and remove units manually
- prevent duplicates
- validate live availability before adding a unit

The selected units grid and consolidated summary must match New Reservation, including per-unit Rent Frequency, Benchmark Rent, editable Negotiated Rent, Variance Amount, Variance %, Deposit, and Charges.

### Lease Workspace Layout

The Lease workspace uses property-level grouping only.

Required layout behavior:

- left sticky property summary/navigation panel on desktop
- single-column layout on mobile
- collapsible property sections
- no nested Building/Tower grouping cards or duplicated hierarchy
- responsive lease cards instead of dense rows
- compact status badges and More Actions menu
- lifecycle actions remain linked to the master lease

Property summaries must show:

- Total Units
- Occupied
- Vacant
- Active Leases
- Expiring Soon
- Pending Renewals
- Total Rent

Total Units and Vacant Units must come from master unit inventory, not from lease row counts.

### Unit Availability Workspace

Route:

```text
/property-management/unit-availability
```

Purpose:

- search and view unit availability across properties and towers
- show current and future occupancy and availability periods
- support responsive card-based scanning for leasing users

Search filters:

- Property
- Building/Tower
- Unit
- Occupancy Status
- Availability Period
- Lease Period
- Date Range

Display fields:

- Property
- Building/Tower
- Unit No
- Unit Type
- Area
- Current Occupancy Status
- Current Lease Period
- Future Reserved/Leased Periods
- Available From
- Available To
- Fit-Out Period
- Free Period
- Tenant Details when occupied

Timeline rule:

```text
Fit-Out -> Lease Start -> Free Period inclusion -> Lease End
```

Fit-out blocks availability before lease start. Free period is part of the lease duration, not an additional available period.

## 4.3 Sales Management

### Sections
- Unit Selection
- Pricing
- Payment Plan
- Installments
- SPA Documents
- Handover Status

# 5. Financial Management Screens

## 5.1 Billing Dashboard

### Widgets
- Total Invoices
- Due Amount
- Overdue Amount
- Collection %
- VAT Summary

### Main Grid

```text
Invoice No | Customer | Property | Amount | Due Date | Status
```

## 5.2 Collections & Recovery

### Kanban Layout

```text
Current Due
30 Days
60 Days
90+ Days
Legal Escalation
```

### Action Panel
- Send Reminder
- Call Log
- Escalate
- Legal Notice
- Settlement

# 6. Operations Management Screens

## 6.1 Maintenance Dashboard

### KPI Tiles
- Open Requests
- SLA Breaches
- In Progress
- Completed Today

### Layout

```text
Work Order Queue
Maintenance Calendar
Technician Assignment
Map View
```

## 6.2 Work Order Screen

### Sections

| Section | Details |
|---|---|
| Request Info | Request Number, Priority |
| Assignment | Technician/Vendor |
| SLA | Response Time |
| Execution | Notes, Attachments |
| Closure | Confirmation |

## 6.3 Inspection & Handover

### Process View

```text
Checklist
↓
Snagging
↓
Photos
↓
Approvals
↓
Customer Acceptance
↓
Closure
```

# 7. Governance Management Screens

## 7.1 Workflow & Approval Screen

### Layout

```text
Pending Tasks
Approval Queue
Escalations
Approval Timeline
Workflow Designer
```

### Workflow Status
- Submitted
- Under Review
- Approved
- Rejected
- Escalated

## 7.2 Security & Access Screen

### Modules
- User Management
- Role Management
- Permission Matrix
- Login Audit
- Access Requests

# 8. Enterprise Services Screens

## 8.1 Analytics Dashboard

### Dashboard Areas
- Portfolio Analytics
- Financial Analytics
- Occupancy Trends
- Lease Expiry Forecast
- Maintenance Analytics

### Filters

```text
Property | Region | Date | Building | Tenant Type
```

## 8.2 Integration Console

### Layout

| Interface | Status | Last Sync | Errors |
|---|---|---|---|
| ERP | Success | 10 mins ago | 0 |
| Payment Gateway | Running | 2 mins ago | 0 |
| Email Service | Warning | 30 mins ago | 2 |

# Common UI Components

| Component | Usage |
|---|---|
| Left Navigation | Module access |
| Top Header | Search, alerts, profile |
| KPI Tiles | Operational visibility |
| Smart Tables | Transactions |
| Tabs | Logical grouping |
| Workflow Sidebar | Approval visibility |
| Timeline Panels | Activity tracking |
| Attachment Panel | Document handling |
| Notification Center | Alerts and reminders |

# Recommended Enterprise UI Style

| Area | Recommendation |
|---|---|
| Style | Modern Enterprise SaaS |
| Layout | Left navigation + top header |
| Theme | Blue/White/Gray |
| Components | Card-based responsive UI |
| Tables | Filterable and exportable |
| Workflow | Visual approval indicators |
| Dashboards | Real-time widgets and charts |
| UX | Minimal clicks with contextual actions |
